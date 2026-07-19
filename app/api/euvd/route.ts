import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import {
  storeCVEs,
  getCVEsByDateRange,
  getCVEById,
  searchCVEs,
  isCacheValid,
  updateCacheMetadata,
  getExploitedCVEs,
} from "@/lib/db";
import { mapEUVDToCVEItem, extractVulnerabilities } from "@/lib/euvdApi";
import { boundedInteger, boundedText, enforceRateLimit, mayForceRefresh } from "@/lib/security";

const EUVD_API_BASE = "https://euvdservices.enisa.europa.eu/api";
const DATABASE_URL = process.env.DATABASE_URL
  || process.env.POSTGRES_URL
  || process.env.POSTGRES_PRISMA_URL
  || process.env.POSTGRES_URL_NON_POOLING;

// Rate limiting for EUVD API
let lastRequestTime = 0;
let requestQueue = Promise.resolve();
const REQUEST_DELAY = 1000; // 1 second between requests
const ALLOWED_ENDPOINTS = new Set([
  "search",
  "enisaid",
  "exploitedvulnerabilities",
  "lastvulnerabilities",
  "criticalvulnerabilities",
]);

async function waitForRateLimit() {
  let release!: () => void;
  const previous = requestQueue;
  requestQueue = new Promise<void>(resolve => { release = resolve; });
  await previous;
  try {
    const waitTime = Math.max(0, REQUEST_DELAY - (Date.now() - lastRequestTime));
    if (waitTime > 0) await new Promise(resolve => setTimeout(resolve, waitTime));
    lastRequestTime = Date.now();
  } finally {
    release();
  }
}

// Fetch from EUVD API and store in cache
async function fetchFromEUVDAndCache(
  url: string,
  params: Record<string, string>,
  cacheKey: string,
  queryType: "date_range" | "search" | "cve_id"
): Promise<any> {
  await waitForRateLimit();

  console.log(`[EUVD API Route] Fetching from ${url} with params:`, params);

  const response = await axios.get(url, {
    params: Object.keys(params).length > 0 ? params : undefined,
    headers: {
      "Accept": "application/json",
      "User-Agent": "Defiant-CVE-Tracker/1.0",
    },
    timeout: 15000,
  });

  const data = response.data;
  const vulns = extractVulnerabilities(data);
  console.log(`[EUVD API Route] Response: ${vulns.length} vulnerabilities found`);

  // Store in database cache if available
  if (DATABASE_URL && vulns.length > 0) {
    try {
      const cveItems = vulns
        .map((vuln: any) => mapEUVDToCVEItem(vuln))
        .filter((item): item is NonNullable<typeof item> => item !== null);

      await storeCVEs(cveItems);
      await updateCacheMetadata(cacheKey, "EUVD", queryType, params, cveItems.length);
      console.log(`[EUVD API Route] Cached ${cveItems.length} CVEs in database`);
    } catch (cacheError) {
      console.error("[EUVD API Route] Error caching CVEs:", cacheError);
      // Continue without caching - don't fail the request
    }
  }

  return data;
}

export async function GET(request: NextRequest) {
  try {
    const limited = enforceRateLimit(request, "euvd", 60);
    if (limited) return limited;

    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get("endpoint") || "search";
    if (!ALLOWED_ENDPOINTS.has(endpoint)) {
      return NextResponse.json({ success: false, error: "Unsupported endpoint" }, { status: 400 });
    }
    const days = boundedInteger(searchParams.get("days"), 90, 1, 365);
    const rawSearchTerm = searchParams.get("search");
    const searchTerm = boundedText(rawSearchTerm, 200);
    const rawCveId = searchParams.get("cveId");
    const cveId = boundedText(rawCveId, 64);
    if ((rawSearchTerm !== null && !searchTerm) || (rawCveId !== null && !cveId)) {
      return NextResponse.json({ success: false, error: "Invalid query" }, { status: 400 });
    }
    if (endpoint === "enisaid" && (!cveId || !/^(?:CVE|EUVD)-\d{4}-\d+$/i.test(cveId))) {
      return NextResponse.json({ success: false, error: "Invalid vulnerability ID" }, { status: 400 });
    }
    const forceRefresh = searchParams.get("refresh") === "true" && mayForceRefresh(request);

    let url = `${EUVD_API_BASE}/${endpoint}`;
    const params: Record<string, string> = {};
    let cacheKey = "";
    let queryType: "date_range" | "search" | "cve_id" = "date_range";

    // Handle different endpoints based on EUVD API documentation
    if (endpoint === "search") {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      params.fromDate = startDate.toISOString().split("T")[0];
      params.toDate = endDate.toISOString().split("T")[0];
      params.fromScore = "0";
      params.toScore = "10";
      params.size = "100";

      if (searchTerm) {
        params.text = searchTerm;
        cacheKey = `euvd_search_${searchTerm.toLowerCase().replace(/\s+/g, "_")}`;
        queryType = "search";

        // Try database search first
        if (DATABASE_URL && !forceRefresh) {
          try {
            const isValid = await isCacheValid(cacheKey, "search");
            if (isValid) {
              const cachedResults = await searchCVEs(searchTerm, {
                source: "EUVD",
                limit: 100,
              });
              if (cachedResults.length > 0) {
                console.log(`[EUVD API Route] Cache hit for search "${searchTerm}": ${cachedResults.length} results`);
                return NextResponse.json({
                  success: true,
                  data: cachedResults,
                  fromCache: true,
                });
              }
            }
          } catch (cacheError) {
            console.error("[EUVD API Route] Cache search error:", cacheError);
          }
        }
      } else {
        cacheKey = `euvd_${days}d`;
        queryType = "date_range";

        // Try database cache for date range
        if (DATABASE_URL && !forceRefresh) {
          try {
            const isValid = await isCacheValid(cacheKey, "date_range");
            if (isValid) {
              const cachedResults = await getCVEsByDateRange(startDate, endDate, "EUVD", 100);
              if (cachedResults.length > 0) {
                console.log(`[EUVD API Route] Cache hit for ${days}d range: ${cachedResults.length} results`);
                return NextResponse.json({
                  success: true,
                  data: cachedResults,
                  fromCache: true,
                });
              }
            }
          } catch (cacheError) {
            console.error("[EUVD API Route] Cache range lookup error:", cacheError);
          }
        }
      }
    } else if (endpoint === "enisaid" && cveId) {
      // Direct EUVD ID lookup
      params.id = cveId;
      cacheKey = `euvd_cve_${cveId}`;
      queryType = "cve_id";

      // Try database cache first
      if (DATABASE_URL && !forceRefresh) {
        try {
          const cachedCVE = await getCVEById(cveId);
          if (cachedCVE && cachedCVE.source === "EUVD") {
            console.log(`[EUVD API Route] Cache hit for CVE ${cveId}`);
            return NextResponse.json({
              success: true,
              data: cachedCVE,
              fromCache: true,
            });
          }
        } catch (cacheError) {
          console.error("[EUVD API Route] Cache lookup error:", cacheError);
        }
      }
    } else if (endpoint === "exploitedvulnerabilities") {
      cacheKey = "euvd_exploited";
      queryType = "date_range";

      // Try database cache for exploited vulnerabilities
      if (DATABASE_URL && !forceRefresh) {
        try {
          const isValid = await isCacheValid(cacheKey, "date_range");
          if (isValid) {
            const cachedResults = await getExploitedCVEs(100);
            const euvdResults = cachedResults.filter(c => c.source === "EUVD");
            if (euvdResults.length > 0) {
              console.log(`[EUVD API Route] Cache hit for exploited: ${euvdResults.length} results`);
              return NextResponse.json({
                success: true,
                data: euvdResults,
                fromCache: true,
              });
            }
          }
        } catch (cacheError) {
          console.error("[EUVD API Route] Cache exploited lookup error:", cacheError);
        }
      }
    } else if (endpoint === "lastvulnerabilities" || endpoint === "criticalvulnerabilities") {
      cacheKey = `euvd_${endpoint}`;
      queryType = "date_range";
    }

    // Fetch from API
    const data = await fetchFromEUVDAndCache(url, params, cacheKey, queryType);

    // Log response structure for debugging
    console.log(`[EUVD API Route] Response type: ${typeof data}, isArray: ${Array.isArray(data)}`);
    if (data && typeof data === 'object') {
      console.log(`[EUVD API Route] Response keys: ${Object.keys(data).slice(0, 10).join(', ')}`);
    }

    return NextResponse.json({
      success: true,
      data: data,
      fromCache: false,
    });

  } catch (error: any) {
    console.error("[EUVD API Route] Error:", error.message || error);

    if (error.response) {
      console.error("[EUVD API Route] API error:", error.response.status, error.response.statusText);
      console.error("[EUVD API Route] Error data:", JSON.stringify(error.response.data).slice(0, 500));
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch from EUVD",
      },
      { status: error.response?.status || 500 }
    );
  }
}

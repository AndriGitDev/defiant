import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import {
  storeCVEs,
  getCVEsByDateRange,
  getCVEById,
  searchCVEs,
  isCacheValid,
  updateCacheMetadata,
} from "@/lib/db";
import { mapNVDToCVEItem } from "@/lib/nvdApi";

const NVD_API_BASE = "https://services.nvd.nist.gov/rest/json/cves/2.0";
const NVD_API_KEY = process.env.NVD_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL
  || process.env.POSTGRES_URL
  || process.env.POSTGRES_PRISMA_URL
  || process.env.POSTGRES_URL_NON_POOLING;

// Rate limiting
let lastRequestTime = 0;
const REQUEST_DELAY = NVD_API_KEY ? 600 : 6000;

async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_DELAY) {
    const waitTime = REQUEST_DELAY - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();
}

// Fetch from NVD API and store in cache
async function fetchFromNVDAndCache(params: Record<string, string>, cacheKey: string): Promise<any> {
  await waitForRateLimit();

  console.log(`[API Route] Fetching CVEs from NVD API with params:`, params);
  console.log(`[API Route] Using API key: ${NVD_API_KEY ? 'Yes ✓' : 'No (public rate limit)'}`);

  const headers: Record<string, string> = {
    "Accept": "application/json",
  };

  if (NVD_API_KEY) {
    headers["apiKey"] = NVD_API_KEY;
  }

  const response = await axios.get(NVD_API_BASE, {
    params,
    headers,
    timeout: 15000,
  });

  const vulnCount = response.data.vulnerabilities?.length || 0;
  console.log(`[API Route] NVD API response: ${vulnCount} CVEs found`);

  // Store in database cache if available
  if (DATABASE_URL && vulnCount > 0) {
    try {
      const cveItems = response.data.vulnerabilities
        .map((vuln: any) => mapNVDToCVEItem(vuln))
        .filter((item: any) => item !== null);

      await storeCVEs(cveItems);
      await updateCacheMetadata(
        cacheKey,
        "NVD",
        params.cveId ? "cve_id" : params.keywordSearch ? "search" : "date_range",
        params,
        cveItems.length
      );
      console.log(`[API Route] Cached ${cveItems.length} CVEs in database`);
    } catch (cacheError) {
      console.error("[API Route] Error caching CVEs:", cacheError);
      // Continue without caching - don't fail the request
    }
  }

  return response.data;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "90");
    const searchTerm = searchParams.get("search");
    const forceRefresh = searchParams.get("refresh") === "true";

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const params: Record<string, string> = {};
    let cacheKey = "";

    // Check if search term is a CVE ID pattern (e.g., CVE-2025-55182)
    const cveIdPattern = /^CVE-\d{4}-\d+$/i;

    if (searchTerm) {
      if (cveIdPattern.test(searchTerm.trim())) {
        // Direct CVE ID lookup
        params.cveId = searchTerm.trim().toUpperCase();
        cacheKey = `nvd_cve_${params.cveId}`;

        // Try database cache first
        if (DATABASE_URL && !forceRefresh) {
          try {
            const cachedCVE = await getCVEById(params.cveId);
            if (cachedCVE) {
              console.log(`[API Route] Cache hit for CVE ${params.cveId}`);
              return NextResponse.json({
                success: true,
                data: {
                  vulnerabilities: [{
                    cve: {
                      id: cachedCVE.cveId,
                      descriptions: [{ lang: "en", value: cachedCVE.description }],
                      published: cachedCVE.publishedDate,
                      lastModified: cachedCVE.lastModifiedDate,
                      references: cachedCVE.references.map(ref => ({ url: ref })),
                      configurations: cachedCVE.affectedProducts.map(p => ({ nodes: [{ cpeMatch: [{ criteria: p }] }] })),
                      weaknesses: cachedCVE.weaknesses?.map(w => ({ description: [{ value: w }] })) || [],
                      metrics: {
                        cvssMetricV31: cachedCVE.vector ? [{
                          cvssData: {
                            baseScore: cachedCVE.score,
                            baseSeverity: cachedCVE.severity,
                            vectorString: cachedCVE.vector,
                          }
                        }] : undefined,
                      },
                    }
                  }],
                },
                usingApiKey: !!NVD_API_KEY,
                fromCache: true,
              });
            }
          } catch (cacheError) {
            console.error("[API Route] Cache lookup error:", cacheError);
          }
        }
      } else {
        // Keyword search
        params.keywordSearch = searchTerm;
        params.resultsPerPage = "50";
        cacheKey = `nvd_search_${searchTerm.toLowerCase().replace(/\s+/g, "_")}`;

        // Try database search first for better results
        if (DATABASE_URL && !forceRefresh) {
          try {
            const isValid = await isCacheValid(cacheKey, "search");
            if (isValid) {
              const cachedResults = await searchCVEs(searchTerm, {
                source: "NVD",
                limit: 50,
              });
              if (cachedResults.length > 0) {
                console.log(`[API Route] Cache hit for search "${searchTerm}": ${cachedResults.length} results`);
                // Return in NVD format for compatibility
                return NextResponse.json({
                  success: true,
                  data: {
                    vulnerabilities: cachedResults.map(cve => ({
                      cve: {
                        id: cve.cveId,
                        descriptions: [{ lang: "en", value: cve.description }],
                        published: cve.publishedDate,
                        lastModified: cve.lastModifiedDate,
                        references: cve.references.map(ref => ({ url: ref })),
                        configurations: cve.affectedProducts.map(p => ({ nodes: [{ cpeMatch: [{ criteria: p }] }] })),
                        weaknesses: cve.weaknesses?.map(w => ({ description: [{ value: w }] })) || [],
                        metrics: {
                          cvssMetricV31: cve.vector ? [{
                            cvssData: {
                              baseScore: cve.score,
                              baseSeverity: cve.severity,
                              vectorString: cve.vector,
                            }
                          }] : undefined,
                        },
                      }
                    })),
                  },
                  usingApiKey: !!NVD_API_KEY,
                  fromCache: true,
                });
              }
            }
          } catch (cacheError) {
            console.error("[API Route] Cache search error:", cacheError);
          }
        }
      }
    } else {
      // Date range query
      params.pubStartDate = startDate.toISOString();
      params.pubEndDate = endDate.toISOString();
      params.resultsPerPage = "100";
      cacheKey = `nvd_${days}d`;

      // Try database cache first
      if (DATABASE_URL && !forceRefresh) {
        try {
          const isValid = await isCacheValid(cacheKey, "date_range");
          if (isValid) {
            const cachedResults = await getCVEsByDateRange(startDate, endDate, "NVD", 100);
            if (cachedResults.length > 0) {
              console.log(`[API Route] Cache hit for ${days}d range: ${cachedResults.length} results`);
              return NextResponse.json({
                success: true,
                data: {
                  vulnerabilities: cachedResults.map(cve => ({
                    cve: {
                      id: cve.cveId,
                      descriptions: [{ lang: "en", value: cve.description }],
                      published: cve.publishedDate,
                      lastModified: cve.lastModifiedDate,
                      references: cve.references.map(ref => ({ url: ref })),
                      configurations: cve.affectedProducts.map(p => ({ nodes: [{ cpeMatch: [{ criteria: p }] }] })),
                      weaknesses: cve.weaknesses?.map(w => ({ description: [{ value: w }] })) || [],
                      metrics: {
                        cvssMetricV31: cve.vector ? [{
                          cvssData: {
                            baseScore: cve.score,
                            baseSeverity: cve.severity,
                            vectorString: cve.vector,
                          }
                        }] : undefined,
                      },
                    }
                  })),
                },
                usingApiKey: !!NVD_API_KEY,
                fromCache: true,
              });
            }
          }
        } catch (cacheError) {
          console.error("[API Route] Cache range lookup error:", cacheError);
        }
      }
    }

    // Fetch from API
    const data = await fetchFromNVDAndCache(params, cacheKey);

    return NextResponse.json({
      success: true,
      data,
      usingApiKey: !!NVD_API_KEY,
      fromCache: false,
    });

  } catch (error: any) {
    console.error("[API Route] Error fetching CVEs from NVD:", error.message || error);

    if (error.response) {
      console.error("[API Route] NVD API error:", error.response.status, error.response.statusText);
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch CVEs",
        usingApiKey: !!NVD_API_KEY,
      },
      { status: error.response?.status || 500 }
    );
  }
}

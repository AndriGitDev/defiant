import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const EUVD_API_BASE = "https://euvdservices.enisa.europa.eu/api";

// Rate limiting for EUVD API
let lastRequestTime = 0;
const REQUEST_DELAY = 1000; // 1 second between requests

async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_DELAY) {
    const waitTime = REQUEST_DELAY - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();
}

export async function GET(request: NextRequest) {
  try {
    await waitForRateLimit();

    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get("endpoint") || "search";
    const days = parseInt(searchParams.get("days") || "90");
    const searchTerm = searchParams.get("search");
    const cveId = searchParams.get("cveId");

    let url = `${EUVD_API_BASE}/${endpoint}`;
    const params: Record<string, string> = {};

    if (endpoint === "search") {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      params.fromDate = startDate.toISOString().split("T")[0];
      params.toDate = endDate.toISOString().split("T")[0];
      params.size = "100";

      if (searchTerm) {
        // Check if it's a CVE ID
        if (/^CVE-\d{4}-\d+$/i.test(searchTerm.trim())) {
          params.text = searchTerm.trim().toUpperCase();
        } else {
          params.text = searchTerm;
        }
      }
    } else if (endpoint === "enisaid" && cveId) {
      // Direct EUVD ID lookup
      params.id = cveId;
    }

    console.log(`[EUVD API Route] Fetching from ${url} with params:`, params);

    const response = await axios.get(url, {
      params,
      headers: {
        "Accept": "application/json",
        "User-Agent": "Defiant-CVE-Tracker/1.0",
      },
      timeout: 15000,
    });

    const data = response.data;
    const vulnCount = Array.isArray(data) ? data.length : (data.items?.length || 0);
    console.log(`[EUVD API Route] Response: ${vulnCount} vulnerabilities found`);

    return NextResponse.json({
      success: true,
      data: data,
    });

  } catch (error: any) {
    console.error("[EUVD API Route] Error:", error.message || error);

    if (error.response) {
      console.error("[EUVD API Route] API error:", error.response.status, error.response.statusText);
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

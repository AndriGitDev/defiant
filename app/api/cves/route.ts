import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const NVD_API_BASE = "https://services.nvd.nist.gov/rest/json/cves/2.0";
const NVD_API_KEY = process.env.NVD_API_KEY || process.env.NEXT_PUBLIC_NVD_API_KEY;

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

export async function GET(request: NextRequest) {
  try {
    await waitForRateLimit();

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");
    const searchTerm = searchParams.get("search");

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const params: any = {};

    if (searchTerm) {
      // Search query
      params.keywordSearch = searchTerm;
      params.resultsPerPage = 100;
    } else {
      // Date range query - using lastModStartDate to catch recently updated CVEs
      // (including new CVEs and old CVEs with recent modifications)
      params.lastModStartDate = startDate.toISOString();
      params.lastModEndDate = endDate.toISOString();
      params.resultsPerPage = 2000; // Maximum allowed by NVD API
    }

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

    console.log(`[API Route] NVD API response: ${response.data.vulnerabilities?.length || 0} CVEs found`);

    return NextResponse.json({
      success: true,
      data: response.data,
      usingApiKey: !!NVD_API_KEY,
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

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

    // Handle different endpoints based on EUVD API documentation
    if (endpoint === "search") {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // EUVD search parameters per documentation
      params.fromDate = startDate.toISOString().split("T")[0];
      params.toDate = endDate.toISOString().split("T")[0];
      params.fromScore = "0";
      params.toScore = "10";
      params.size = "100";

      if (searchTerm) {
        params.text = searchTerm;
      }
    } else if (endpoint === "enisaid" && cveId) {
      // Direct EUVD ID lookup - parameter is 'id' per documentation
      params.id = cveId;
    }
    // For lastvulnerabilities, criticalvulnerabilities, exploitedvulnerabilities
    // No parameters needed - they return their fixed result sets

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

    // Log response structure for debugging
    console.log(`[EUVD API Route] Response type: ${typeof data}, isArray: ${Array.isArray(data)}`);
    if (data && typeof data === 'object') {
      console.log(`[EUVD API Route] Response keys: ${Object.keys(data).slice(0, 10).join(', ')}`);
    }

    const vulnCount = Array.isArray(data) ? data.length : (data.items?.length || data.content?.length || (data.id ? 1 : 0));
    console.log(`[EUVD API Route] Response: ${vulnCount} vulnerabilities found`);

    return NextResponse.json({
      success: true,
      data: data,
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

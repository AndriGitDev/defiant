import { NextRequest, NextResponse } from "next/server";
import {
  searchCVEs,
  getCVEById,
  getCVEStats,
  getTotalCachedCount,
  getCVEsByVendor,
  getExploitedCVEs,
  checkDatabaseConnection,
} from "@/lib/db";
import type { DataSource } from "@/lib/types";

const DATABASE_URL = process.env.DATABASE_URL;

export async function GET(request: NextRequest) {
  // Check if database is configured
  if (!DATABASE_URL) {
    return NextResponse.json(
      {
        success: false,
        error: "Database not configured",
        message: "Set DATABASE_URL environment variable to enable database search",
      },
      { status: 503 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || searchParams.get("query");
    const source = (searchParams.get("source") || "ALL") as DataSource;
    const severity = searchParams.get("severity");
    const days = parseInt(searchParams.get("days") || "90");
    const exploitOnly = searchParams.get("exploit") === "true";
    const vendor = searchParams.get("vendor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const action = searchParams.get("action");

    // Handle special actions
    if (action === "stats") {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await getCVEStats(startDate, endDate, source);
      const totalCached = await getTotalCachedCount();

      return NextResponse.json({
        success: true,
        data: {
          ...stats,
          totalCached,
          dateRange: { start: startDate.toISOString(), end: endDate.toISOString() },
          source,
        },
      });
    }

    if (action === "health") {
      const isConnected = await checkDatabaseConnection();
      const totalCached = isConnected ? await getTotalCachedCount() : 0;

      return NextResponse.json({
        success: true,
        data: {
          connected: isConnected,
          totalCached,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Handle exploited CVEs
    if (exploitOnly) {
      const results = await getExploitedCVEs(limit);
      const filtered = source !== "ALL"
        ? results.filter(cve => cve.source === source)
        : results;

      return NextResponse.json({
        success: true,
        data: {
          results: filtered,
          total: filtered.length,
          query: "exploited",
          source,
        },
      });
    }

    // Handle vendor search
    if (vendor) {
      const results = await getCVEsByVendor(vendor, limit);
      const filtered = source !== "ALL"
        ? results.filter(cve => cve.source === source)
        : results;

      return NextResponse.json({
        success: true,
        data: {
          results: filtered,
          total: filtered.length,
          query: vendor,
          source,
          type: "vendor",
        },
      });
    }

    // Handle general search
    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing search query",
          message: "Provide a 'q' or 'query' parameter, or use 'action=stats' or 'action=health'",
        },
        { status: 400 }
      );
    }

    // Check if it's a CVE ID pattern
    const cveIdPattern = /^(CVE|EUVD)-\d{4}-\d+$/i;
    if (cveIdPattern.test(query.trim())) {
      const cve = await getCVEById(query.trim());
      if (cve) {
        return NextResponse.json({
          success: true,
          data: {
            results: [cve],
            total: 1,
            query,
            type: "id",
          },
        });
      }
      // CVE not found in cache, return empty
      return NextResponse.json({
        success: true,
        data: {
          results: [],
          total: 0,
          query,
          type: "id",
          message: "CVE not found in cache. Try searching via NVD or EUVD endpoints.",
        },
      });
    }

    // Calculate date range for filtering
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Perform keyword search
    const results = await searchCVEs(query, {
      source: source !== "ALL" ? source : undefined,
      severity: severity || undefined,
      startDate,
      endDate,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        results,
        total: results.length,
        query,
        source,
        severity: severity || "all",
        dateRange: { start: startDate.toISOString(), end: endDate.toISOString() },
        type: "keyword",
      },
    });

  } catch (error: any) {
    console.error("[Search API] Error:", error.message || error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Search failed",
      },
      { status: 500 }
    );
  }
}

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, gte, lte, or, ilike, and, sql } from "drizzle-orm";
import { cves, cacheMetadata, type CVERecord, type NewCVERecord } from "./schema";
import type { CVEItem, DataSource } from "../types";

// Initialize Neon database connection
// Vercel/Neon may use different variable names
const DATABASE_URL = process.env.DATABASE_URL
  || process.env.POSTGRES_URL
  || process.env.POSTGRES_PRISMA_URL
  || process.env.POSTGRES_URL_NON_POOLING;

function getDb() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const client = neon(DATABASE_URL);
  return drizzle(client);
}

// Cache duration in minutes for different query types
const CACHE_DURATION = {
  date_range: 15, // 15 minutes for date range queries
  search: 30, // 30 minutes for search queries
  cve_id: 60, // 1 hour for specific CVE lookups
};

// Convert database record to CVEItem
function dbRecordToCVEItem(record: CVERecord): CVEItem {
  return {
    id: record.id,
    cveId: record.cveId,
    description: record.description,
    severity: record.severity as CVEItem["severity"],
    score: record.score,
    publishedDate: record.publishedDate.toISOString(),
    lastModifiedDate: record.lastModifiedDate.toISOString(),
    references: (record.references as string[]) || [],
    affectedProducts: (record.affectedProducts as string[]) || [],
    weaknesses: (record.weaknesses as string[]) || [],
    exploitAvailable: record.exploitAvailable || false,
    vector: record.vector || undefined,
    source: record.source as DataSource,
  };
}

// Convert CVEItem to database record
function cveItemToDbRecord(item: CVEItem): NewCVERecord {
  // Create searchable text from all relevant fields
  const searchText = [
    item.cveId,
    item.description,
    ...(item.affectedProducts || []),
    ...(item.weaknesses || []),
    item.vector || "",
  ]
    .join(" ")
    .toLowerCase();

  return {
    id: item.id,
    cveId: item.cveId,
    description: item.description,
    severity: item.severity,
    score: item.score,
    publishedDate: new Date(item.publishedDate),
    lastModifiedDate: new Date(item.lastModifiedDate),
    references: item.references || [],
    affectedProducts: item.affectedProducts || [],
    weaknesses: item.weaknesses || [],
    exploitAvailable: item.exploitAvailable || false,
    vector: item.vector || null,
    source: item.source,
    searchText,
  };
}

// Check if cache is still valid
export async function isCacheValid(
  cacheKey: string,
  queryType: "date_range" | "search" | "cve_id"
): Promise<boolean> {
  try {
    const db = getDb();
    const result = await db
      .select()
      .from(cacheMetadata)
      .where(eq(cacheMetadata.id, cacheKey))
      .limit(1);

    if (result.length === 0) {
      return false;
    }

    const cacheEntry = result[0];
    const cacheAge = Date.now() - cacheEntry.lastFetched.getTime();
    const maxAge = CACHE_DURATION[queryType] * 60 * 1000;

    return cacheAge < maxAge;
  } catch (error) {
    console.error("[DB] Error checking cache validity:", error);
    return false;
  }
}

// Update cache metadata
export async function updateCacheMetadata(
  cacheKey: string,
  source: string,
  queryType: string,
  queryParams: Record<string, string>,
  recordCount: number
): Promise<void> {
  try {
    const db = getDb();
    await db
      .insert(cacheMetadata)
      .values({
        id: cacheKey,
        source,
        queryType,
        queryParams,
        lastFetched: new Date(),
        recordCount,
      })
      .onConflictDoUpdate({
        target: cacheMetadata.id,
        set: {
          lastFetched: new Date(),
          recordCount,
          queryParams,
        },
      });
  } catch (error) {
    console.error("[DB] Error updating cache metadata:", error);
  }
}

// Store CVEs in database (upsert)
export async function storeCVEs(items: CVEItem[]): Promise<void> {
  if (items.length === 0) return;

  try {
    const db = getDb();
    const records = items.map(cveItemToDbRecord);

    // Batch upsert in chunks of 100
    const chunkSize = 100;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      await db
        .insert(cves)
        .values(chunk)
        .onConflictDoUpdate({
          target: cves.id,
          set: {
            description: sql`EXCLUDED.description`,
            severity: sql`EXCLUDED.severity`,
            score: sql`EXCLUDED.score`,
            lastModifiedDate: sql`EXCLUDED.last_modified_date`,
            references: sql`EXCLUDED.references`,
            affectedProducts: sql`EXCLUDED.affected_products`,
            weaknesses: sql`EXCLUDED.weaknesses`,
            exploitAvailable: sql`EXCLUDED.exploit_available`,
            vector: sql`EXCLUDED.vector`,
            searchText: sql`EXCLUDED.search_text`,
            updatedAt: new Date(),
          },
        });
    }

    console.log(`[DB] Stored ${items.length} CVEs in database`);
  } catch (error) {
    console.error("[DB] Error storing CVEs:", error);
    throw error;
  }
}

// Get CVEs from database by date range
export async function getCVEsByDateRange(
  startDate: Date,
  endDate: Date,
  source?: DataSource,
  limit: number = 100
): Promise<CVEItem[]> {
  try {
    const db = getDb();
    const conditions = [
      gte(cves.publishedDate, startDate),
      lte(cves.publishedDate, endDate),
    ];

    if (source && source !== "ALL") {
      conditions.push(eq(cves.source, source));
    }

    const results = await db
      .select()
      .from(cves)
      .where(and(...conditions))
      .orderBy(desc(cves.publishedDate))
      .limit(limit);

    return results.map(dbRecordToCVEItem);
  } catch (error) {
    console.error("[DB] Error fetching CVEs by date range:", error);
    return [];
  }
}

// Get CVE by ID
export async function getCVEById(cveId: string): Promise<CVEItem | null> {
  try {
    const db = getDb();
    const results = await db
      .select()
      .from(cves)
      .where(or(eq(cves.cveId, cveId.toUpperCase()), eq(cves.id, cveId)))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    return dbRecordToCVEItem(results[0]);
  } catch (error) {
    console.error("[DB] Error fetching CVE by ID:", error);
    return null;
  }
}

// Search CVEs in database (keyword search)
export async function searchCVEs(
  searchTerm: string,
  options: {
    source?: DataSource;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    exploitAvailable?: boolean;
    limit?: number;
  } = {}
): Promise<CVEItem[]> {
  try {
    const db = getDb();
    const conditions: ReturnType<typeof eq>[] = [];
    const searchLower = `%${searchTerm.toLowerCase()}%`;

    // Add source filter
    if (options.source && options.source !== "ALL") {
      conditions.push(eq(cves.source, options.source));
    }

    // Add severity filter
    if (options.severity && options.severity !== "all") {
      conditions.push(eq(cves.severity, options.severity.toUpperCase()));
    }

    // Add date range filter
    if (options.startDate) {
      conditions.push(gte(cves.publishedDate, options.startDate));
    }
    if (options.endDate) {
      conditions.push(lte(cves.publishedDate, options.endDate));
    }

    // Add exploit availability filter
    if (options.exploitAvailable !== undefined) {
      conditions.push(eq(cves.exploitAvailable, options.exploitAvailable));
    }

    // Build the search query with text search
    const searchCondition = or(
      ilike(cves.cveId, searchLower),
      ilike(cves.searchText, searchLower),
      ilike(cves.description, searchLower)
    );

    const whereClause =
      conditions.length > 0
        ? and(searchCondition, ...conditions)
        : searchCondition;

    const results = await db
      .select()
      .from(cves)
      .where(whereClause!)
      .orderBy(desc(cves.score), desc(cves.publishedDate))
      .limit(options.limit || 50);

    return results.map(dbRecordToCVEItem);
  } catch (error) {
    console.error("[DB] Error searching CVEs:", error);
    return [];
  }
}

// Get CVE statistics from database
export async function getCVEStats(
  startDate?: Date,
  endDate?: Date,
  source?: DataSource
): Promise<{
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  bySource: { nvd: number; euvd: number };
}> {
  try {
    const db = getDb();
    const conditions: ReturnType<typeof eq>[] = [];

    if (startDate) {
      conditions.push(gte(cves.publishedDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(cves.publishedDate, endDate));
    }
    if (source && source !== "ALL") {
      conditions.push(eq(cves.source, source));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get counts by severity
    const severityCounts = await db
      .select({
        severity: cves.severity,
        count: sql<number>`count(*)::int`,
      })
      .from(cves)
      .where(whereClause)
      .groupBy(cves.severity);

    // Get counts by source
    const sourceCounts = await db
      .select({
        source: cves.source,
        count: sql<number>`count(*)::int`,
      })
      .from(cves)
      .where(whereClause)
      .groupBy(cves.source);

    const stats = {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      bySource: { nvd: 0, euvd: 0 },
    };

    for (const row of severityCounts) {
      const count = row.count;
      stats.total += count;
      switch (row.severity) {
        case "CRITICAL":
          stats.critical = count;
          break;
        case "HIGH":
          stats.high = count;
          break;
        case "MEDIUM":
          stats.medium = count;
          break;
        case "LOW":
          stats.low = count;
          break;
      }
    }

    for (const row of sourceCounts) {
      if (row.source === "NVD") {
        stats.bySource.nvd = row.count;
      } else if (row.source === "EUVD") {
        stats.bySource.euvd = row.count;
      }
    }

    return stats;
  } catch (error) {
    console.error("[DB] Error getting CVE stats:", error);
    return {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      bySource: { nvd: 0, euvd: 0 },
    };
  }
}

// Get recent CVEs with exploit available
export async function getExploitedCVEs(limit: number = 50): Promise<CVEItem[]> {
  try {
    const db = getDb();
    const results = await db
      .select()
      .from(cves)
      .where(eq(cves.exploitAvailable, true))
      .orderBy(desc(cves.publishedDate))
      .limit(limit);

    return results.map(dbRecordToCVEItem);
  } catch (error) {
    console.error("[DB] Error fetching exploited CVEs:", error);
    return [];
  }
}

// Get CVEs by vendor/product
export async function getCVEsByVendor(
  vendor: string,
  limit: number = 50
): Promise<CVEItem[]> {
  try {
    const db = getDb();
    const vendorPattern = `%${vendor.toLowerCase()}%`;

    const results = await db
      .select()
      .from(cves)
      .where(ilike(cves.searchText, vendorPattern))
      .orderBy(desc(cves.score), desc(cves.publishedDate))
      .limit(limit);

    return results.map(dbRecordToCVEItem);
  } catch (error) {
    console.error("[DB] Error fetching CVEs by vendor:", error);
    return [];
  }
}

// Check if database is connected and tables exist
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const db = getDb();
    await db.select().from(cves).limit(1);
    return true;
  } catch (error) {
    console.error("[DB] Database connection check failed:", error);
    return false;
  }
}

// Get total count of cached CVEs
export async function getTotalCachedCount(): Promise<number> {
  try {
    const db = getDb();
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(cves);
    return result[0]?.count || 0;
  } catch (error) {
    console.error("[DB] Error getting total cached count:", error);
    return 0;
  }
}

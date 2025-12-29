import { pgTable, text, timestamp, real, boolean, index, jsonb } from "drizzle-orm/pg-core";

// CVE table - stores all cached CVE data from NVD and EUVD
export const cves = pgTable("cves", {
  id: text("id").primaryKey(), // Unique identifier (CVE ID for NVD, EUVD ID for EUVD)
  cveId: text("cve_id").notNull(), // CVE-YYYY-NNNNN format
  description: text("description").notNull(),
  severity: text("severity").notNull(), // CRITICAL, HIGH, MEDIUM, LOW, NONE
  score: real("score").notNull().default(0),
  publishedDate: timestamp("published_date", { withTimezone: true }).notNull(),
  lastModifiedDate: timestamp("last_modified_date", { withTimezone: true }).notNull(),
  references: jsonb("references").$type<string[]>().default([]),
  affectedProducts: jsonb("affected_products").$type<string[]>().default([]),
  weaknesses: jsonb("weaknesses").$type<string[]>().default([]),
  exploitAvailable: boolean("exploit_available").default(false),
  vector: text("vector"),
  source: text("source").notNull(), // NVD or EUVD
  // Cache metadata
  cachedAt: timestamp("cached_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  // Full-text search vector (we'll populate this with a trigger or on insert)
  searchText: text("search_text"), // Combined searchable text
}, (table) => [
  index("cves_cve_id_idx").on(table.cveId),
  index("cves_severity_idx").on(table.severity),
  index("cves_published_date_idx").on(table.publishedDate),
  index("cves_source_idx").on(table.source),
  index("cves_score_idx").on(table.score),
  index("cves_exploit_available_idx").on(table.exploitAvailable),
]);

// Cache metadata table - tracks when data sources were last fetched
export const cacheMetadata = pgTable("cache_metadata", {
  id: text("id").primaryKey(), // e.g., "nvd_90d", "euvd_30d"
  source: text("source").notNull(), // NVD or EUVD
  queryType: text("query_type").notNull(), // date_range, search, cve_id
  queryParams: jsonb("query_params").$type<Record<string, string>>().default({}),
  lastFetched: timestamp("last_fetched", { withTimezone: true }).notNull().defaultNow(),
  recordCount: real("record_count").default(0),
});

// Types for database operations
export type CVERecord = typeof cves.$inferSelect;
export type NewCVERecord = typeof cves.$inferInsert;
export type CacheMetadataRecord = typeof cacheMetadata.$inferSelect;
export type NewCacheMetadataRecord = typeof cacheMetadata.$inferInsert;

import axios from "axios";
import { CVEItem } from "./types";

// Use our Next.js API route instead of calling NVD directly
// This keeps the API key secure on the server side
const API_BASE = "/api/cves";

// Helper function to calculate CVSS severity from score
function getSeverity(score: number): CVEItem["severity"] {
  if (score >= 9.0) return "CRITICAL";
  if (score >= 7.0) return "HIGH";
  if (score >= 4.0) return "MEDIUM";
  if (score > 0) return "LOW";
  return "NONE";
}

// Map raw NVD vulnerability to CVEItem (exported for use in API routes)
export function mapNVDToCVEItem(vuln: any): CVEItem | null {
  try {
    const cve = vuln.cve;
    const metrics = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV30?.[0] || cve.metrics?.cvssMetricV2?.[0];
    const score = metrics?.cvssData?.baseScore || 0;

    return {
      id: cve.id,
      cveId: cve.id,
      description: cve.descriptions?.find((d: any) => d.lang === "en")?.value || "No description available",
      severity: getSeverity(score),
      score: score,
      publishedDate: cve.published,
      lastModifiedDate: cve.lastModified,
      references: cve.references?.map((ref: any) => ref.url) || [],
      affectedProducts: cve.configurations?.flatMap((config: any) =>
        config.nodes?.flatMap((node: any) =>
          node.cpeMatch?.map((match: any) => match.criteria) || []
        ) || []
      ) || [],
      weaknesses: cve.weaknesses?.flatMap((w: any) =>
        w.description?.map((d: any) => d.value) || []
      ) || [],
      exploitAvailable: false,
      vector: metrics?.cvssData?.vectorString,
      source: "NVD" as const,
    };
  } catch (error) {
    console.error("Error mapping NVD CVE:", error);
    return null;
  }
}

export async function fetchRecentCVEs(days: number = 30): Promise<CVEItem[]> {
  try {
    console.log(`Fetching CVEs via API route for last ${days} days`);

    const response = await axios.get(`${API_BASE}?days=${days}`, {
      timeout: 20000, // 20 second timeout (accounts for rate limiting)
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "API request failed");
    }

    console.log(`API route response: ${response.data.data.vulnerabilities?.length || 0} CVEs found`);
    console.log(`Using API key: ${response.data.usingApiKey ? 'Yes ✓' : 'No (public rate limit)'}`);

    const vulnerabilities = response.data.data.vulnerabilities || [];

    if (vulnerabilities.length === 0) {
      console.warn("NVD API returned no vulnerabilities for the specified date range");
      return [];
    }

    const mappedCVEs = vulnerabilities.map((vuln: any) => {
      const cve = vuln.cve;
      const metrics = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV30?.[0] || cve.metrics?.cvssMetricV2?.[0];
      const score = metrics?.cvssData?.baseScore || 0;

      return {
        id: cve.id,
        cveId: cve.id,
        description: cve.descriptions?.find((d: any) => d.lang === "en")?.value || "No description available",
        severity: getSeverity(score),
        score: score,
        publishedDate: cve.published,
        lastModifiedDate: cve.lastModified,
        references: cve.references?.map((ref: any) => ref.url) || [],
        affectedProducts: cve.configurations?.nodes?.flatMap((node: any) =>
          node.cpeMatch?.map((match: any) => match.criteria) || []
        ) || [],
        weaknesses: cve.weaknesses?.flatMap((w: any) =>
          w.description?.map((d: any) => d.value) || []
        ) || [],
        exploitAvailable: false,
        vector: metrics?.cvssData?.vectorString,
        source: "NVD" as const,
      };
    });

    // Sort by published date (newest first) to show recent CVEs at the top
    // This prevents old CVEs from 2015 that were recently modified from appearing first
    return mappedCVEs.sort((a: CVEItem, b: CVEItem) => {
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    });
  } catch (error: any) {
    console.error("Error fetching CVEs via API route:", error.message || error);

    if (error.response) {
      console.error("API route error:", error.response.status, error.response.data);
    }

    // Return empty array - no mock data fallback
    return [];
  }
}

export async function searchCVEs(searchTerm: string): Promise<CVEItem[]> {
  try {
    console.log(`Searching CVEs via API route for: ${searchTerm}`);

    const response = await axios.get(`${API_BASE}?search=${encodeURIComponent(searchTerm)}`, {
      timeout: 20000,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "API request failed");
    }

    const vulnerabilities = response.data.data.vulnerabilities || [];
    console.log(`Found ${vulnerabilities.length} CVEs matching search`);
    console.log(`Using API key: ${response.data.usingApiKey ? 'Yes ✓' : 'No (public rate limit)'}`);


    const mappedCVEs = vulnerabilities.map((vuln: any) => {
      const cve = vuln.cve;
      const metrics = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV30?.[0] || cve.metrics?.cvssMetricV2?.[0];
      const score = metrics?.cvssData?.baseScore || 0;

      return {
        id: cve.id,
        cveId: cve.id,
        description: cve.descriptions?.find((d: any) => d.lang === "en")?.value || "No description available",
        severity: getSeverity(score),
        score: score,
        publishedDate: cve.published,
        lastModifiedDate: cve.lastModified,
        references: cve.references?.map((ref: any) => ref.url) || [],
        affectedProducts: cve.configurations?.nodes?.flatMap((node: any) =>
          node.cpeMatch?.map((match: any) => match.criteria) || []
        ) || [],
        weaknesses: cve.weaknesses?.flatMap((w: any) =>
          w.description?.map((d: any) => d.value) || []
        ) || [],
        vector: metrics?.cvssData?.vectorString,
        source: "NVD" as const,
      };
    });

    // Sort by published date (newest first)
    return mappedCVEs.sort((a: CVEItem, b: CVEItem) => {
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    });
  } catch (error: any) {
    console.error("Error searching CVEs via API route:", error.message || error);
    return [];
  }
}


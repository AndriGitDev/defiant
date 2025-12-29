import axios from "axios";
import { CVEItem } from "./types";

// Use our Next.js API route for EUVD
const API_BASE = "/api/euvd";

// Helper function to calculate CVSS severity from score
function getSeverity(score: number): CVEItem["severity"] {
  if (score >= 9.0) return "CRITICAL";
  if (score >= 7.0) return "HIGH";
  if (score >= 4.0) return "MEDIUM";
  if (score > 0) return "LOW";
  return "NONE";
}

// Map EUVD response to our CVEItem format
function mapEUVDToCVEItem(vuln: any): CVEItem {
  // EUVD uses different field names
  const score = vuln.baseScore || vuln.cvssScore || 0;
  const cveId = vuln.aliases?.find((a: string) => a.startsWith("CVE-")) || vuln.id || "";

  return {
    id: `euvd-${vuln.id || cveId}`,
    cveId: cveId,
    description: vuln.description || vuln.summary || "No description available",
    severity: getSeverity(score),
    score: score,
    publishedDate: vuln.datePublished || vuln.published || new Date().toISOString(),
    lastModifiedDate: vuln.dateUpdated || vuln.lastModified || new Date().toISOString(),
    references: vuln.references?.map((ref: any) => typeof ref === "string" ? ref : ref.url) || [],
    affectedProducts: vuln.products?.map((p: any) =>
      typeof p === "string" ? p : `cpe:2.3:a:${p.vendor || "unknown"}:${p.product || "unknown"}:*:*:*:*:*:*:*:*`
    ) || [],
    weaknesses: vuln.cwe ? [vuln.cwe] : [],
    exploitAvailable: vuln.exploited === true || vuln.isExploited === true,
    vector: vuln.cvssVector || vuln.vectorString,
    source: "EUVD" as const,
  };
}

export async function fetchEUVDCVEs(days: number = 90): Promise<CVEItem[]> {
  try {
    console.log(`Fetching EUVD CVEs for last ${days} days`);

    // Fetch from multiple endpoints in parallel for comprehensive data
    const [latestRes, criticalRes, exploitedRes, searchRes] = await Promise.allSettled([
      axios.get(`${API_BASE}?endpoint=lastvulnerabilities`, { timeout: 15000 }),
      axios.get(`${API_BASE}?endpoint=criticalvulnerabilities`, { timeout: 15000 }),
      axios.get(`${API_BASE}?endpoint=exploitedvulnerabilities`, { timeout: 15000 }),
      axios.get(`${API_BASE}?endpoint=search&days=${days}`, { timeout: 15000 }),
    ]);

    const allVulns: any[] = [];

    // Process each response
    [latestRes, criticalRes, exploitedRes, searchRes].forEach((result, index) => {
      if (result.status === "fulfilled" && result.value.data.success) {
        const data = result.value.data.data;
        const vulns = Array.isArray(data) ? data : (data.items || data.content || []);
        allVulns.push(...vulns);
      }
    });

    if (allVulns.length === 0) {
      console.warn("EUVD API returned no vulnerabilities");
      return [];
    }

    // Map and deduplicate by CVE ID
    const seen = new Set<string>();
    const mappedCVEs: CVEItem[] = [];

    for (const vuln of allVulns) {
      const mapped = mapEUVDToCVEItem(vuln);
      if (mapped.cveId && !seen.has(mapped.cveId)) {
        seen.add(mapped.cveId);
        mappedCVEs.push(mapped);
      }
    }

    console.log(`EUVD: Mapped ${mappedCVEs.length} unique CVEs`);

    // Sort by published date (newest first)
    return mappedCVEs.sort((a, b) =>
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );

  } catch (error: any) {
    console.error("Error fetching EUVD CVEs:", error.message || error);
    return [];
  }
}

export async function searchEUVDCVEs(searchTerm: string): Promise<CVEItem[]> {
  try {
    console.log(`Searching EUVD CVEs for: ${searchTerm}`);

    const response = await axios.get(`${API_BASE}?endpoint=search&search=${encodeURIComponent(searchTerm)}`, {
      timeout: 15000,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "EUVD API request failed");
    }

    const data = response.data.data;
    const vulns = Array.isArray(data) ? data : (data.items || data.content || []);

    const mappedCVEs = vulns.map(mapEUVDToCVEItem);

    console.log(`EUVD search: Found ${mappedCVEs.length} CVEs`);

    return mappedCVEs.sort((a: CVEItem, b: CVEItem) =>
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );

  } catch (error: any) {
    console.error("Error searching EUVD CVEs:", error.message || error);
    return [];
  }
}

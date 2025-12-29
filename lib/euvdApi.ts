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
function mapEUVDToCVEItem(vuln: any): CVEItem | null {
  if (!vuln || typeof vuln !== 'object') {
    return null;
  }

  // EUVD uses different field names - handle various response formats
  const score = vuln.baseScore || vuln.cvssScore || vuln.cvss?.baseScore || vuln.score || 0;

  // Get the ID - could be EUVD ID or CVE ID
  // EUVD API returns: id (EUVD ID), aliases (array with CVE IDs)
  const euvdId = vuln.euvdId || vuln.id || "";
  const cveId = vuln.aliases?.find((a: string) => a?.startsWith?.("CVE-"))
    || vuln.cveId
    || (typeof euvdId === 'string' && euvdId.startsWith("CVE-") ? euvdId : "");

  // Use EUVD ID as display ID if no CVE ID available
  const displayId = cveId || euvdId;

  // Skip entries without any identifier
  if (!displayId) {
    return null;
  }

  return {
    id: `euvd-${euvdId || cveId || Math.random().toString(36)}`,
    cveId: displayId,
    description: vuln.description || vuln.summary || vuln.title || "No description available",
    severity: getSeverity(score),
    score: score,
    publishedDate: vuln.datePublished || vuln.published || vuln.publishedDate || vuln.created || new Date().toISOString(),
    lastModifiedDate: vuln.dateUpdated || vuln.lastModified || vuln.modifiedDate || vuln.updated || new Date().toISOString(),
    references: vuln.references?.map((ref: any) => typeof ref === "string" ? ref : ref.url).filter(Boolean) || [],
    affectedProducts: vuln.products?.map((p: any) =>
      typeof p === "string" ? p : `cpe:2.3:a:${p.vendor || "unknown"}:${p.product || "unknown"}:*:*:*:*:*:*:*:*`
    ) || vuln.affectedProducts || [],
    weaknesses: vuln.cwe ? (Array.isArray(vuln.cwe) ? vuln.cwe : [vuln.cwe]) : [],
    exploitAvailable: vuln.exploited === true || vuln.isExploited === true || vuln.knownExploited === true,
    vector: vuln.cvssVector || vuln.vectorString || vuln.cvss?.vectorString,
    source: "EUVD" as const,
  };
}

// Extract vulnerabilities from various response formats
function extractVulnerabilities(data: any): any[] {
  if (!data) return [];

  // Direct array
  if (Array.isArray(data)) {
    return data;
  }

  // Paginated response with items/content array
  if (data.items && Array.isArray(data.items)) {
    return data.items;
  }
  if (data.content && Array.isArray(data.content)) {
    return data.content;
  }
  if (data.vulnerabilities && Array.isArray(data.vulnerabilities)) {
    return data.vulnerabilities;
  }
  if (data.results && Array.isArray(data.results)) {
    return data.results;
  }

  // Single object result (wrap in array)
  if (data.id || data.euvdId) {
    return [data];
  }

  return [];
}

export async function fetchEUVDCVEs(days: number = 90): Promise<CVEItem[]> {
  try {
    console.log(`Fetching EUVD CVEs for last ${days} days`);

    // Fetch from multiple endpoints in parallel for comprehensive data
    const endpoints = [
      `${API_BASE}?endpoint=lastvulnerabilities`,
      `${API_BASE}?endpoint=criticalvulnerabilities`,
      `${API_BASE}?endpoint=exploitedvulnerabilities`,
      `${API_BASE}?endpoint=search&days=${days}`,
    ];

    const results = await Promise.allSettled(
      endpoints.map(url => axios.get(url, { timeout: 15000 }))
    );

    const allVulns: any[] = [];

    // Process each response
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const responseData = result.value.data;
        if (responseData.success) {
          const vulns = extractVulnerabilities(responseData.data);
          console.log(`EUVD endpoint ${index}: ${vulns.length} vulnerabilities`);
          allVulns.push(...vulns);
        } else {
          console.warn(`EUVD endpoint ${index} failed:`, responseData.error);
        }
      } else {
        console.warn(`EUVD endpoint ${index} rejected:`, result.reason?.message);
      }
    });

    console.log(`EUVD: Total raw vulnerabilities: ${allVulns.length}`);

    if (allVulns.length === 0) {
      console.warn("EUVD API returned no vulnerabilities");
      return [];
    }

    // Map and deduplicate by ID (CVE ID or EUVD ID)
    const seen = new Set<string>();
    const mappedCVEs: CVEItem[] = [];

    for (const vuln of allVulns) {
      const mapped = mapEUVDToCVEItem(vuln);
      if (mapped) {
        const uniqueKey = mapped.cveId || mapped.id;
        if (uniqueKey && !seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          mappedCVEs.push(mapped);
        }
      }
    }

    console.log(`EUVD: Mapped ${mappedCVEs.length} unique CVEs`);

    // Sort by severity first, then by date
    const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, NONE: 4 };
    return mappedCVEs.sort((a, b) => {
      const severityDiff = (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    });

  } catch (error: any) {
    console.error("Error fetching EUVD CVEs:", error.message || error);
    return [];
  }
}

export async function searchEUVDCVEs(searchTerm: string): Promise<CVEItem[]> {
  try {
    console.log(`Searching EUVD CVEs for: ${searchTerm}`);

    // Check if it's an EUVD ID (e.g., EUVD-2025-200983)
    const isEUVDId = /^EUVD-\d{4}-\d+$/i.test(searchTerm.trim());

    let url;
    if (isEUVDId) {
      // Direct EUVD ID lookup
      url = `${API_BASE}?endpoint=enisaid&cveId=${encodeURIComponent(searchTerm.trim().toUpperCase())}`;
    } else {
      // Text search
      url = `${API_BASE}?endpoint=search&search=${encodeURIComponent(searchTerm)}`;
    }

    const response = await axios.get(url, { timeout: 15000 });

    if (!response.data.success) {
      console.error("EUVD search failed:", response.data.error);
      return [];
    }

    const vulns = extractVulnerabilities(response.data.data);
    console.log(`EUVD search raw results: ${vulns.length}`);

    const mappedCVEs = vulns
      .map(mapEUVDToCVEItem)
      .filter((cve): cve is CVEItem => cve !== null);

    console.log(`EUVD search: Found ${mappedCVEs.length} CVEs`);

    // Sort by severity first, then by date
    const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, NONE: 4 };
    return mappedCVEs.sort((a, b) => {
      const severityDiff = (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    });

  } catch (error: any) {
    console.error("Error searching EUVD CVEs:", error.message || error);
    return [];
  }
}

import axios from "axios";
import { CVEItem } from "./types";

const NVD_API_BASE = "https://services.nvd.nist.gov/rest/json/cves/2.0";

// Helper function to calculate CVSS severity from score
function getSeverity(score: number): CVEItem["severity"] {
  if (score >= 9.0) return "CRITICAL";
  if (score >= 7.0) return "HIGH";
  if (score >= 4.0) return "MEDIUM";
  if (score > 0) return "LOW";
  return "NONE";
}

export async function fetchRecentCVEs(days: number = 30): Promise<CVEItem[]> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const params = {
      pubStartDate: startDate.toISOString(),
      pubEndDate: endDate.toISOString(),
      resultsPerPage: 100,
    };

    const response = await axios.get(NVD_API_BASE, {
      params,
      headers: {
        "Accept": "application/json",
      },
    });

    const vulnerabilities = response.data.vulnerabilities || [];

    return vulnerabilities.map((vuln: any) => {
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
        exploitAvailable: false, // This would need additional API calls to determine
        vector: metrics?.cvssData?.vectorString,
      };
    });
  } catch (error) {
    console.error("Error fetching CVEs from NVD:", error);

    // Return mock data for development/demo
    return generateMockCVEs(20);
  }
}

export async function searchCVEs(searchTerm: string): Promise<CVEItem[]> {
  try {
    const params = {
      keywordSearch: searchTerm,
      resultsPerPage: 50,
    };

    const response = await axios.get(NVD_API_BASE, {
      params,
      headers: {
        "Accept": "application/json",
      },
    });

    const vulnerabilities = response.data.vulnerabilities || [];

    return vulnerabilities.map((vuln: any) => {
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
      };
    });
  } catch (error) {
    console.error("Error searching CVEs:", error);
    return [];
  }
}

// Mock data generator for development
function generateMockCVEs(count: number): CVEItem[] {
  const severities: CVEItem["severity"][] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const vendors = ["Apache", "Microsoft", "Linux", "Cisco", "Oracle", "Adobe", "Google", "Apple"];
  const products = ["Server", "Windows", "Kernel", "Router", "Database", "Reader", "Chrome", "iOS"];

  return Array.from({ length: count }, (_, i) => {
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    const score = severity === "CRITICAL" ? 9 + Math.random()
      : severity === "HIGH" ? 7 + Math.random() * 2
      : severity === "MEDIUM" ? 4 + Math.random() * 3
      : Math.random() * 4;

    return {
      id: `CVE-2024-${String(50000 + i).padStart(5, '0')}`,
      cveId: `CVE-2024-${String(50000 + i).padStart(5, '0')}`,
      description: `${severity} severity vulnerability in ${vendor} ${product}. This vulnerability could allow remote code execution through specially crafted requests.`,
      severity,
      score: parseFloat(score.toFixed(1)),
      publishedDate: date.toISOString(),
      lastModifiedDate: date.toISOString(),
      references: [
        `https://nvd.nist.gov/vuln/detail/CVE-2024-${String(50000 + i).padStart(5, '0')}`,
        `https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-${String(50000 + i).padStart(5, '0')}`,
      ],
      affectedProducts: [`cpe:2.3:a:${vendor.toLowerCase()}:${product.toLowerCase()}:*:*:*:*:*:*:*:*`],
      weaknesses: ["CWE-79", "CWE-89"],
      exploitAvailable: Math.random() > 0.7,
      vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    };
  });
}

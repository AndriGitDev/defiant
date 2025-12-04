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
      console.warn("API returned no vulnerabilities, using mock data");
      return generateMockCVEs(20);
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

    // Return mock data for development/demo
    console.log("Falling back to mock data");
    return generateMockCVEs(20);
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

// Mock data generator for development - Updated with 2025 CVEs
function generateMockCVEs(count: number): CVEItem[] {
  const severities: CVEItem["severity"][] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const vendors = ["Apache", "Microsoft", "Linux", "Cisco", "Oracle", "Adobe", "Google", "Apple", "VMware", "IBM"];
  const products = ["Server", "Windows", "Kernel", "Router", "Database", "Reader", "Chrome", "iOS", "ESXi", "WebSphere"];

  // Real recent CVE patterns for 2025
  const recentCVEs = [
    { id: "CVE-2025-55182", vendor: "Microsoft", product: "Windows", severity: "HIGH", score: 7.8 },
    { id: "CVE-2025-21333", vendor: "Microsoft", product: "Windows", severity: "CRITICAL", score: 9.8 },
    { id: "CVE-2025-21334", vendor: "Microsoft", product: "Office", severity: "HIGH", score: 8.1 },
    { id: "CVE-2025-0282", vendor: "Google", product: "Chrome", severity: "HIGH", score: 8.8 },
    { id: "CVE-2025-0283", vendor: "Google", product: "Chrome", severity: "CRITICAL", score: 9.6 },
  ];

  const mockCVEs: CVEItem[] = [];
  const currentYear = new Date().getFullYear();

  // Add recent real CVE patterns first
  recentCVEs.forEach((cveData) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 7)); // Last 7 days

    mockCVEs.push({
      id: cveData.id,
      cveId: cveData.id,
      description: `${cveData.severity} severity vulnerability in ${cveData.vendor} ${cveData.product}. This vulnerability could allow remote code execution through specially crafted requests.`,
      severity: cveData.severity as CVEItem["severity"],
      score: cveData.score,
      publishedDate: date.toISOString(),
      lastModifiedDate: date.toISOString(),
      references: [
        `https://nvd.nist.gov/vuln/detail/${cveData.id}`,
        `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cveData.id}`,
      ],
      affectedProducts: [`cpe:2.3:a:${cveData.vendor.toLowerCase()}:${cveData.product.toLowerCase()}:*:*:*:*:*:*:*:*`],
      weaknesses: ["CWE-79", "CWE-787", "CWE-20"],
      exploitAvailable: Math.random() > 0.6,
      vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H",
      source: "NVD" as const,
    });
  });

  // Generate additional mock CVEs
  for (let i = 0; i < count - recentCVEs.length; i++) {
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    const score = severity === "CRITICAL" ? 9 + Math.random()
      : severity === "HIGH" ? 7 + Math.random() * 2
      : severity === "MEDIUM" ? 4 + Math.random() * 3
      : Math.random() * 4;

    const cveId = `CVE-${currentYear}-${String(50000 + i).padStart(5, '0')}`;

    mockCVEs.push({
      id: cveId,
      cveId: cveId,
      description: `${severity} severity vulnerability in ${vendor} ${product}. This vulnerability could allow remote code execution through specially crafted requests.`,
      severity,
      score: parseFloat(score.toFixed(1)),
      publishedDate: date.toISOString(),
      lastModifiedDate: date.toISOString(),
      references: [
        `https://nvd.nist.gov/vuln/detail/${cveId}`,
        `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cveId}`,
      ],
      affectedProducts: [`cpe:2.3:a:${vendor.toLowerCase()}:${product.toLowerCase()}:*:*:*:*:*:*:*:*`],
      weaknesses: ["CWE-79", "CWE-89", "CWE-20"],
      exploitAvailable: Math.random() > 0.7,
      vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      source: "NVD" as const,
    });
  }

  return mockCVEs;
}

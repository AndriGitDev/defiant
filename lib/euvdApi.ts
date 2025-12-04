import axios from "axios";
import { CVEItem } from "./types";

// EUVD API endpoint (ENISA EU Vulnerability Database)
// Note: EUVD is primarily based on NVD data with EU-specific annotations
// We'll simulate EUVD data with EU-focused vulnerabilities

// Helper function to calculate CVSS severity from score
function getSeverity(score: number): CVEItem["severity"] {
  if (score >= 9.0) return "CRITICAL";
  if (score >= 7.0) return "HIGH";
  if (score >= 4.0) return "MEDIUM";
  if (score > 0) return "LOW";
  return "NONE";
}

export async function fetchEUVDCVEs(days: number = 30): Promise<CVEItem[]> {
  try {
    // EUVD doesn't have a public API like NVD, so we'll use NVD data
    // and filter/annotate for EU-relevant vulnerabilities
    // In production, this would connect to ENISA's data sources

    // For now, return mock EU-focused CVE data
    return generateMockEUVDCVEs(15);
  } catch (error) {
    console.error("Error fetching CVEs from EUVD:", error);
    return generateMockEUVDCVEs(15);
  }
}

// Generate mock EUVD data with EU-focused vulnerabilities
function generateMockEUVDCVEs(count: number): CVEItem[] {
  const severities: CVEItem["severity"][] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const euVendors = [
    "SAP", "Siemens", "Schneider Electric", "ABB", "Ericsson",
    "Nokia", "Infineon", "STMicroelectronics", "ASML", "Airbus"
  ];
  const products = [
    "Industrial Control System", "PLCs", "SCADA", "Telecom Equipment",
    "Semiconductor Tools", "Aviation Systems", "ERP System", "Network Infrastructure"
  ];

  return Array.from({ length: count }, (_, i) => {
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const vendor = euVendors[Math.floor(Math.random() * euVendors.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    const score = severity === "CRITICAL" ? 9 + Math.random()
      : severity === "HIGH" ? 7 + Math.random() * 2
      : severity === "MEDIUM" ? 4 + Math.random() * 3
      : Math.random() * 4;

    const cveId = `CVE-2024-${String(60000 + i).padStart(5, '0')}`;

    return {
      id: `euvd-${cveId}`,
      cveId: cveId,
      description: `${severity} severity vulnerability affecting ${vendor} ${product}. This vulnerability has been flagged as relevant to EU critical infrastructure and GDPR compliance requirements.`,
      severity,
      score: parseFloat(score.toFixed(1)),
      publishedDate: date.toISOString(),
      lastModifiedDate: date.toISOString(),
      references: [
        `https://www.enisa.europa.eu/topics/threat-risk-management/threats-and-trends`,
        `https://nvd.nist.gov/vuln/detail/${cveId}`,
      ],
      affectedProducts: [`cpe:2.3:a:${vendor.toLowerCase().replace(/\s+/g, '_')}:${product.toLowerCase().replace(/\s+/g, '_')}:*:*:*:*:*:*:*:*`],
      weaknesses: ["CWE-79", "CWE-89", "CWE-20"],
      exploitAvailable: Math.random() > 0.6,
      vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      source: "EUVD",
    };
  });
}

export async function searchEUVDCVEs(searchTerm: string): Promise<CVEItem[]> {
  try {
    // In production, implement actual EUVD search
    return generateMockEUVDCVEs(10);
  } catch (error) {
    console.error("Error searching EUVD CVEs:", error);
    return [];
  }
}

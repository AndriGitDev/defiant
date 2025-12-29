import axios from "axios";
import { CVEItem } from "./types";

// EUVD API endpoint (ENISA EU Vulnerability Database)
// Note: EUVD API integration pending - returns empty until official API is available
// See: https://www.enisa.europa.eu/topics/vulnerability-disclosure

// Helper function to calculate CVSS severity from score
function getSeverity(score: number): CVEItem["severity"] {
  if (score >= 9.0) return "CRITICAL";
  if (score >= 7.0) return "HIGH";
  if (score >= 4.0) return "MEDIUM";
  if (score > 0) return "LOW";
  return "NONE";
}

export async function fetchEUVDCVEs(days: number = 30): Promise<CVEItem[]> {
  // EUVD API is not yet publicly available
  // When the official API becomes available, implement the fetch here
  // For now, return empty array to avoid displaying mock/fake data
  console.log("EUVD API: No public API available yet, returning empty results");
  return [];
}

export async function searchEUVDCVEs(searchTerm: string): Promise<CVEItem[]> {
  // EUVD API is not yet publicly available
  console.log("EUVD API: No public API available yet, returning empty results");
  return [];
}

export interface CVEItem {
  id: string;
  cveId: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
  score: number;
  publishedDate: string;
  lastModifiedDate: string;
  references: string[];
  affectedProducts: string[];
  weaknesses?: string[];
  exploitAvailable?: boolean;
  vector?: string;
}

export interface Breach {
  id: string;
  name: string;
  date: string;
  affectedOrganization: string;
  recordsCompromised: number;
  description: string;
  type: string[];
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  sources: string[];
}

export interface FilterState {
  severity: string;
  dateRange: string;
  searchTerm: string;
}

export interface Stats {
  totalCVEs: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  lastUpdated: string;
}

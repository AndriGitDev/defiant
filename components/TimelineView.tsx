"use client";

import { useEffect, useState, useRef } from "react";
import { CVEItem, FilterState } from "@/lib/types";
import { fetchCVEsFromAllSources, searchCVEs } from "@/lib/vulnerabilityApi";
import { Loader2, Database, Search, Zap } from "lucide-react";
import axios from "axios";

interface TimelineViewProps {
  filters: FilterState;
  onSelectCVE: (cve: CVEItem) => void;
  onCVEsLoad?: (cves: CVEItem[]) => void;
}

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function TimelineView({ filters, onSelectCVE, onCVEsLoad }: TimelineViewProps) {
  const [cves, setCves] = useState<CVEItem[]>([]);
  const [searchResults, setSearchResults] = useState<CVEItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 500);

  // Check if search term looks like a CVE ID or EUVD ID
  const isCVEIdSearch = /^CVE-\d{4}-\d+$/i.test(debouncedSearchTerm.trim());
  const isEUVDIdSearch = /^EUVD-\d{4}-\d+$/i.test(debouncedSearchTerm.trim());
  const isIdSearch = isCVEIdSearch || isEUVDIdSearch;

  // Load CVEs based on date range
  useEffect(() => {
    async function loadCVEs() {
      setLoading(true);
      setSearchResults(null);
      const data = await fetchCVEsFromAllSources(parseInt(filters.dateRange), filters.dataSource);
      setCves(data);
      onCVEsLoad?.(data);
      setLoading(false);
    }

    loadCVEs();
  }, [filters.dateRange, filters.dataSource, onCVEsLoad]);

  // Search API when CVE ID, EUVD ID, or keyword is entered
  useEffect(() => {
    async function searchForCVE() {
      const searchTerm = debouncedSearchTerm.trim();
      if (!searchTerm || searchTerm.length < 2) {
        setSearchResults(null);
        return;
      }

      setSearching(true);
      try {
        // For CVE/EUVD IDs, use the standard search APIs
        if (isIdSearch) {
          const source = isEUVDIdSearch ? "EUVD" : filters.dataSource;
          const results = await searchCVEs(searchTerm, source);
          setSearchResults(results);
        } else {
          // For keyword searches, try database search first for faster results
          try {
            const dbResponse = await axios.get("/api/search", {
              params: {
                q: searchTerm,
                source: filters.dataSource,
                severity: filters.severity !== "all" ? filters.severity : undefined,
                days: filters.dateRange,
                limit: 50,
              },
              timeout: 5000,
            });

            if (dbResponse.data.success && dbResponse.data.data.results.length > 0) {
              console.log(`Database search found ${dbResponse.data.data.results.length} results`);
              setSearchResults(dbResponse.data.data.results);
              setSearching(false);
              return;
            }
          } catch (dbError) {
            // Database search failed, fall through to standard search
            console.log("Database search unavailable, using standard search");
          }

          // Fallback to standard API search
          const results = await searchCVEs(searchTerm, filters.dataSource);
          setSearchResults(results);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      }
      setSearching(false);
    }

    searchForCVE();
  }, [debouncedSearchTerm, isIdSearch, isEUVDIdSearch, filters.dataSource, filters.severity, filters.dateRange]);

  // Use search results if we have them (CVE ID search), otherwise filter local CVEs
  const baseCVEs = searchResults !== null ? searchResults : cves;

  // Severity order for sorting (most severe first)
  const severityOrder: Record<string, number> = {
    "CRITICAL": 0,
    "HIGH": 1,
    "MEDIUM": 2,
    "LOW": 3,
    "NONE": 4,
  };

  // Filter CVEs based on search, severity, exploit availability, and vendor
  const filteredCVEs = baseCVEs.filter((cve) => {
    const matchesSeverity = filters.severity === "all" || cve.severity === filters.severity;
    // Skip local search filter if we already did an API search
    const matchesSearch =
      searchResults !== null ||
      !filters.searchTerm ||
      cve.cveId.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      cve.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      cve.affectedProducts.some((p) =>
        p.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    const matchesExploit = filters.exploitAvailable === undefined || filters.exploitAvailable === false || cve.exploitAvailable === true;
    const matchesVendor = !filters.vendor || cve.affectedProducts.some(product =>
      product.toLowerCase().includes(filters.vendor!.toLowerCase())
    );

    return matchesSeverity && matchesSearch && matchesExploit && matchesVendor;
  })
  .sort((a, b) => {
    // Sort by severity first (most critical first), then by date (newest first)
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
  })
  .slice(0, 50); // Limit to 50 results to prevent page from breaking

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "from-cyber-pink to-red-600";
      case "HIGH":
        return "from-red-500 to-orange-500";
      case "MEDIUM":
        return "from-cyber-yellow to-orange-400";
      case "LOW":
        return "from-cyber-green to-green-400";
      default:
        return "from-gray-500 to-gray-400";
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "text-cyber-pink";
      case "HIGH":
        return "text-red-500";
      case "MEDIUM":
        return "text-cyber-yellow";
      case "LOW":
        return "text-cyber-green";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyber-blue animate-spin mx-auto mb-4" />
          <p className="text-cyber-text-dim text-lg">Loading CVE data...</p>
        </div>
      </div>
    );
  }

  if (searching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Search className="w-12 h-12 text-cyber-purple animate-pulse mx-auto mb-4" />
          <p className="text-cyber-text-dim text-lg">Searching for {debouncedSearchTerm}...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        <h2 className="text-2xl md:text-3xl font-bold text-cyber-text">
          Vulnerability Timeline
        </h2>
        <span className="text-sm md:text-base text-cyber-text-dim font-medium">
          {filteredCVEs.length} vulnerabilities found
        </span>
      </div>

      {/* Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCVEs.map((cve, index) => (
          <div
            key={cve.id}
            className="cyber-border panel-bg p-5 rounded-lg hover:panel-bg-solid cursor-pointer transition-all hover:scale-[1.02] group"
            onClick={() => onSelectCVE(cve)}
            style={{
              animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`,
            }}
          >
            {/* CVE Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-cyber-text group-hover:text-cyber-blue transition-all">
                    {cve.cveId}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    cve.source === "NVD" ? "bg-cyber-blue/20 text-cyber-blue" : "bg-cyber-purple/20 text-cyber-purple"
                  }`}>
                    {cve.source}
                  </span>
                </div>
                <p className="text-xs text-cyber-text-dim">
                  {new Date(cve.publishedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded ${getSeverityTextColor(
                  cve.severity
                )} border border-current text-xs font-bold ml-2 flex-shrink-0`}
              >
                {cve.severity}
              </div>
            </div>

            {/* Score Bar */}
            <div className="mb-4">
              <div className="h-2 bg-cyber-black/50 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getSeverityColor(
                    cve.severity
                  )} transition-all duration-500`}
                  style={{ width: `${(cve.score / 10) * 100}%` }}
                />
              </div>
              <p className="text-sm text-cyber-text-dim mt-1.5">
                CVSS Score: <span className="font-bold text-cyber-text">{cve.score.toFixed(1)}</span>
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-cyber-text-dim line-clamp-3 mb-4 leading-relaxed">
              {cve.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {cve.exploitAvailable && (
                <span className="px-2 py-1 bg-cyber-pink/20 border border-cyber-pink/50 rounded text-xs text-cyber-pink font-semibold">
                  Exploit
                </span>
              )}
              {cve.affectedProducts.slice(0, 2).map((product, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-cyber-blue/10 border border-cyber-blue/30 rounded text-xs text-cyber-text-dim"
                >
                  {product.split(":")[3] || "Unknown"}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredCVEs.length === 0 && (
        <div className="text-center py-20 panel-bg rounded-lg">
          <Database className="w-16 h-16 text-cyber-text-dim mx-auto mb-4 opacity-50" />
          <p className="text-cyber-text-dim text-lg">
            {searchResults !== null && searchResults.length === 0
              ? `No CVE found matching "${debouncedSearchTerm}"`
              : cves.length === 0
              ? "Unable to load CVE data from NVD API"
              : "No vulnerabilities match your filters"
            }
          </p>
          <p className="text-cyber-text-dim/70 text-sm mt-2">
            {searchResults !== null && searchResults.length === 0
              ? "Check the CVE ID format (e.g., CVE-2025-55182) and try again"
              : cves.length === 0
              ? "Configure NVD_API_KEY environment variable for reliable access to CVE data"
              : "Try adjusting your search criteria"
            }
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

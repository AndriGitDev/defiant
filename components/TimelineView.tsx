"use client";

import { useEffect, useState, useRef } from "react";
import { CVEItem, FilterState } from "@/lib/types";
import { fetchCVEsFromAllSources } from "@/lib/vulnerabilityApi";
import { Loader2, Database } from "lucide-react";

interface TimelineViewProps {
  filters: FilterState;
  onSelectCVE: (cve: CVEItem) => void;
}

export default function TimelineView({ filters, onSelectCVE }: TimelineViewProps) {
  const [cves, setCves] = useState<CVEItem[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadCVEs() {
      setLoading(true);
      const data = await fetchCVEsFromAllSources(parseInt(filters.dateRange), filters.dataSource);
      setCves(data);
      setLoading(false);
    }

    loadCVEs();
  }, [filters.dateRange, filters.dataSource]);

  // Filter CVEs based on search and severity
  const filteredCVEs = cves.filter((cve) => {
    const matchesSeverity = filters.severity === "all" || cve.severity === filters.severity;
    const matchesSearch =
      !filters.searchTerm ||
      cve.cveId.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      cve.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      cve.affectedProducts.some((p) =>
        p.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );

    return matchesSeverity && matchesSearch;
  }).slice(0, 50); // Limit to 50 results to prevent page from breaking

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
          <p className="text-cyber-text-dim text-lg">No vulnerabilities match your filters</p>
          <p className="text-cyber-text-dim/70 text-sm mt-2">Try adjusting your search criteria</p>
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

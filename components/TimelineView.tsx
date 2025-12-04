"use client";

import { useEffect, useState, useRef } from "react";
import { CVEItem, FilterState } from "@/lib/types";
import { fetchRecentCVEs } from "@/lib/nvdApi";
import { Loader2 } from "lucide-react";

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
      const data = await fetchRecentCVEs(parseInt(filters.dateRange));
      setCves(data);
      setLoading(false);
    }

    loadCVEs();
  }, [filters.dateRange]);

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
  });

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
          <p className="text-cyber-blue/70">LOADING CVE DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-cyber-blue text-shadow-glow">
          TIMELINE VIEW
        </h2>
        <span className="text-sm text-cyber-blue/70">
          {filteredCVEs.length} VULNERABILITIES FOUND
        </span>
      </div>

      {/* Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCVEs.map((cve, index) => (
          <div
            key={cve.id}
            className="cyber-border bg-cyber-dark/50 backdrop-blur-sm p-4 rounded-lg hover:bg-cyber-dark/70 cursor-pointer transition-all hover:scale-105 group"
            onClick={() => onSelectCVE(cve)}
            style={{
              animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`,
            }}
          >
            {/* CVE Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-cyber-blue group-hover:text-shadow-glow transition-all">
                  {cve.cveId}
                </h3>
                <p className="text-xs text-cyber-blue/50">
                  {new Date(cve.publishedDate).toLocaleDateString()}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded ${getSeverityTextColor(
                  cve.severity
                )} border border-current text-xs font-bold`}
              >
                {cve.severity}
              </div>
            </div>

            {/* Score Bar */}
            <div className="mb-3">
              <div className="h-2 bg-cyber-black/50 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getSeverityColor(
                    cve.severity
                  )} transition-all duration-500`}
                  style={{ width: `${(cve.score / 10) * 100}%` }}
                />
              </div>
              <p className="text-xs text-cyber-blue/70 mt-1">
                CVSS Score: <span className="font-bold">{cve.score}</span>
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-cyber-blue/70 line-clamp-3 mb-3">
              {cve.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {cve.exploitAvailable && (
                <span className="px-2 py-1 bg-cyber-pink/20 border border-cyber-pink/50 rounded text-xs text-cyber-pink">
                  EXPLOIT
                </span>
              )}
              {cve.affectedProducts.slice(0, 2).map((product, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-cyber-blue/10 border border-cyber-blue/30 rounded text-xs text-cyber-blue/70"
                >
                  {product.split(":")[3] || "UNKNOWN"}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredCVEs.length === 0 && (
        <div className="text-center py-20">
          <p className="text-cyber-blue/50 text-lg">NO VULNERABILITIES MATCH YOUR FILTERS</p>
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

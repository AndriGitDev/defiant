"use client";

import { useEffect } from "react";
import { X, ExternalLink, AlertTriangle, Shield, Calendar, Code } from "lucide-react";
import { CVEItem } from "@/lib/types";

interface CVEDetailModalProps {
  cve: CVEItem;
  onClose: () => void;
}

export default function CVEDetailModal({ cve, onClose }: CVEDetailModalProps) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "text-cyber-pink border-cyber-pink";
      case "HIGH":
        return "text-red-500 border-red-500";
      case "MEDIUM":
        return "text-cyber-yellow border-cyber-yellow";
      case "LOW":
        return "text-cyber-green border-cyber-green";
      default:
        return "text-gray-400 border-gray-400";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-black/80 backdrop-blur-sm">
      <div
        className="cyber-border bg-cyber-dark/95 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{
          animation: "modalSlideIn 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-cyber-dark/95 backdrop-blur-sm border-b border-cyber-blue/30 p-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-cyber-blue text-shadow-glow">
                {cve.cveId}
              </h2>
              <span
                className={`px-3 py-1 rounded ${getSeverityColor(
                  cve.severity
                )} border text-sm font-bold`}
              >
                {cve.severity}
              </span>
            </div>
            <p className="text-sm text-cyber-blue/50">
              Published: {new Date(cve.publishedDate).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-cyber-blue hover:text-cyber-pink transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* CVSS Score */}
          <div className="cyber-border bg-cyber-black/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-cyber-blue" />
              <h3 className="text-lg font-bold text-cyber-blue">CVSS Score</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-5xl font-bold ${getSeverityColor(cve.severity).split(" ")[0]}`}>
                {cve.score}
              </div>
              <div className="flex-1">
                <div className="h-4 bg-cyber-black/50 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full ${
                      cve.severity === "CRITICAL"
                        ? "bg-gradient-to-r from-cyber-pink to-red-600"
                        : cve.severity === "HIGH"
                        ? "bg-gradient-to-r from-red-500 to-orange-500"
                        : cve.severity === "MEDIUM"
                        ? "bg-gradient-to-r from-cyber-yellow to-orange-400"
                        : "bg-gradient-to-r from-cyber-green to-green-400"
                    }`}
                    style={{ width: `${(cve.score / 10) * 100}%` }}
                  />
                </div>
                {cve.vector && (
                  <p className="text-xs text-cyber-blue/70 font-mono">{cve.vector}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="cyber-border bg-cyber-black/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-cyber-pink" />
              <h3 className="text-lg font-bold text-cyber-blue">Description</h3>
            </div>
            <p className="text-cyber-blue/70 leading-relaxed">{cve.description}</p>
          </div>

          {/* Affected Products */}
          {cve.affectedProducts.length > 0 && (
            <div className="cyber-border bg-cyber-black/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Code className="w-5 h-5 text-cyber-purple" />
                <h3 className="text-lg font-bold text-cyber-blue">Affected Products</h3>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {cve.affectedProducts.map((product, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 bg-cyber-dark/50 border border-cyber-blue/20 rounded text-sm text-cyber-blue/70 font-mono"
                  >
                    {product}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses */}
          {cve.weaknesses && cve.weaknesses.length > 0 && (
            <div className="cyber-border bg-cyber-black/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-cyber-yellow" />
                <h3 className="text-lg font-bold text-cyber-blue">Weaknesses (CWE)</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {cve.weaknesses.map((weakness, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-cyber-yellow/10 border border-cyber-yellow/30 rounded text-sm text-cyber-yellow"
                  >
                    {weakness}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="cyber-border bg-cyber-black/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-cyber-green" />
              <h3 className="text-lg font-bold text-cyber-blue">Timeline</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-cyber-blue/70">Published:</span>
                <span className="text-cyber-green font-mono">
                  {new Date(cve.publishedDate).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cyber-blue/70">Last Modified:</span>
                <span className="text-cyber-green font-mono">
                  {new Date(cve.lastModifiedDate).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* References */}
          {cve.references.length > 0 && (
            <div className="cyber-border bg-cyber-black/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <ExternalLink className="w-5 h-5 text-cyber-blue" />
                <h3 className="text-lg font-bold text-cyber-blue">References</h3>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {cve.references.map((ref, i) => (
                  <a
                    key={i}
                    href={ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-cyber-dark/50 border border-cyber-blue/20 rounded text-sm text-cyber-blue hover:border-cyber-blue hover:text-shadow-glow transition-all group"
                  >
                    <ExternalLink className="w-4 h-4 group-hover:animate-pulse" />
                    <span className="truncate">{ref}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Exploit Status */}
          {cve.exploitAvailable && (
            <div className="cyber-border border-cyber-pink bg-cyber-pink/10 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-cyber-pink animate-pulse" />
                <span className="text-cyber-pink font-bold">
                  EXPLOIT AVAILABLE - IMMEDIATE ACTION REQUIRED
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

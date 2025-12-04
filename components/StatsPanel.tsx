"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, TrendingUp, Database, Clock } from "lucide-react";
import { Stats } from "@/lib/types";
import { fetchRecentCVEs } from "@/lib/nvdApi";

export default function StatsPanel() {
  const [stats, setStats] = useState<Stats>({
    totalCVEs: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    lastUpdated: new Date().toISOString(),
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const cves = await fetchRecentCVEs(30);

      const newStats: Stats = {
        totalCVEs: cves.length,
        critical: cves.filter((c) => c.severity === "CRITICAL").length,
        high: cves.filter((c) => c.severity === "HIGH").length,
        medium: cves.filter((c) => c.severity === "MEDIUM").length,
        low: cves.filter((c) => c.severity === "LOW").length,
        lastUpdated: new Date().toISOString(),
      };

      setStats(newStats);
      setLoading(false);
    }

    loadStats();
  }, []);

  const statCards = [
    {
      icon: Database,
      label: "TOTAL CVEs (30d)",
      value: stats.totalCVEs,
      color: "cyber-blue",
    },
    {
      icon: AlertTriangle,
      label: "CRITICAL",
      value: stats.critical,
      color: "cyber-pink",
    },
    {
      icon: TrendingUp,
      label: "HIGH",
      value: stats.high,
      color: "red-500",
    },
    {
      icon: Clock,
      label: "MEDIUM",
      value: stats.medium,
      color: "cyber-yellow",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="cyber-border bg-cyber-dark/50 backdrop-blur-sm p-6 rounded-lg hover:bg-cyber-dark/70 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-6 h-6 text-${stat.color}`} />
              {loading ? (
                <div className="h-8 w-16 bg-cyber-blue/20 animate-pulse rounded" />
              ) : (
                <span className={`text-3xl font-bold text-${stat.color} text-shadow-glow`}>
                  {stat.value}
                </span>
              )}
            </div>
            <p className="text-xs text-cyber-blue/70 tracking-wider">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}

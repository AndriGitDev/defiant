"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, TrendingUp, Database, Clock } from "lucide-react";
import { Stats, FilterState } from "@/lib/types";
import { fetchCVEsFromAllSources, getCVEStats } from "@/lib/vulnerabilityApi";

interface StatsPanelProps {
  filters?: FilterState;
  onSeverityFilter?: (severity: string) => void;
  onStatsUpdate?: (stats: Stats) => void;
}

export default function StatsPanel({ filters, onSeverityFilter, onStatsUpdate }: StatsPanelProps) {
  const [stats, setStats] = useState<Stats>({
    totalCVEs: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    lastUpdated: new Date().toISOString(),
    bySource: { nvd: 0, euvd: 0 },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const cves = await fetchCVEsFromAllSources(90, "ALL");
      const newStats = getCVEStats(cves);
      setStats(newStats);
      onStatsUpdate?.(newStats);
      setLoading(false);
    }

    loadStats();
  }, [onStatsUpdate]);

  const statCards = [
    {
      icon: Database,
      label: "Total CVEs (90 days)",
      value: stats.totalCVEs,
      color: "text-cyber-blue",
      bgColor: "bg-cyber-blue/10",
      severity: "all",
    },
    {
      icon: AlertTriangle,
      label: "Critical",
      value: stats.critical,
      color: "text-cyber-pink",
      bgColor: "bg-cyber-pink/10",
      severity: "CRITICAL",
    },
    {
      icon: TrendingUp,
      label: "High",
      value: stats.high,
      color: "text-red-400",
      bgColor: "bg-red-400/10",
      severity: "HIGH",
    },
    {
      icon: Clock,
      label: "Medium",
      value: stats.medium,
      color: "text-cyber-yellow",
      bgColor: "bg-cyber-yellow/10",
      severity: "MEDIUM",
    },
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isActive = filters?.severity === stat.severity;
          return (
            <div
              key={index}
              onClick={() => onSeverityFilter?.(stat.severity)}
              className={`cyber-border panel-bg p-6 rounded-lg transition-all cursor-pointer ${
                isActive
                  ? 'panel-bg-solid ring-2 ring-cyber-blue shadow-lg scale-105'
                  : 'hover:panel-bg-solid hover:scale-102'
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSeverityFilter?.(stat.severity)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {loading ? (
                  <div className="h-10 w-20 bg-cyber-blue/20 animate-pulse rounded" />
                ) : (
                  <span className={`text-4xl font-bold ${stat.color}`}>
                    {stat.value}
                  </span>
                )}
              </div>
              <p className="text-sm text-cyber-text-dim font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

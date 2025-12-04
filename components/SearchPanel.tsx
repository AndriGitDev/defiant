"use client";

import { Search, Filter, Calendar, Database } from "lucide-react";
import { FilterState } from "@/lib/types";

interface SearchPanelProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

export default function SearchPanel({ filters, setFilters }: SearchPanelProps) {
  return (
    <div className="cyber-border panel-bg p-6 rounded-lg mb-8">
      <div className="flex flex-col gap-4">
        {/* Top Row: Search and Data Source */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-blue/50" />
            <input
              type="text"
              placeholder="Search CVEs, Products, Vendors..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="w-full bg-cyber-black/50 border border-cyber-blue/30 rounded pl-10 pr-4 py-3 text-cyber-text placeholder-cyber-text-dim/50 focus:outline-none focus:border-cyber-blue focus:border-glow transition-all text-base"
            />
          </div>

          {/* Data Source Filter */}
          <div className="relative">
            <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-green/50" />
            <select
              value={filters.dataSource}
              onChange={(e) => setFilters({ ...filters, dataSource: e.target.value as any })}
              className="bg-cyber-black/50 border border-cyber-green/30 rounded pl-10 pr-8 py-3 text-cyber-green focus:outline-none focus:border-cyber-green focus:border-glow transition-all appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="ALL">ALL SOURCES</option>
              <option value="NVD">NVD ONLY</option>
              <option value="EUVD">EUVD ONLY</option>
            </select>
          </div>
        </div>

        {/* Bottom Row: Severity and Date Range */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Severity Filter */}
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-pink/50" />
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="w-full bg-cyber-black/50 border border-cyber-pink/30 rounded pl-10 pr-8 py-3 text-cyber-pink focus:outline-none focus:border-cyber-pink focus:border-glow transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-purple/50" />
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full bg-cyber-black/50 border border-cyber-purple/30 rounded pl-10 pr-8 py-3 text-cyber-purple focus:outline-none focus:border-cyber-purple focus:border-glow transition-all appearance-none cursor-pointer"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.severity !== "all" || filters.searchTerm || filters.dataSource !== "ALL") && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.dataSource !== "ALL" && (
            <span className="px-3 py-1.5 bg-cyber-green/20 border border-cyber-green/50 rounded text-sm text-cyber-green font-medium">
              Source: {filters.dataSource}
            </span>
          )}
          {filters.severity !== "all" && (
            <span className="px-3 py-1.5 bg-cyber-pink/20 border border-cyber-pink/50 rounded text-sm text-cyber-pink font-medium">
              Severity: {filters.severity}
            </span>
          )}
          {filters.searchTerm && (
            <span className="px-3 py-1.5 bg-cyber-blue/20 border border-cyber-blue/50 rounded text-sm text-cyber-blue font-medium truncate max-w-xs">
              Search: {filters.searchTerm}
            </span>
          )}
          <button
            onClick={() => setFilters({ severity: "all", dateRange: "30", searchTerm: "", dataSource: "ALL" })}
            className="px-3 py-1.5 bg-cyber-dark border border-cyber-blue/30 rounded text-sm text-cyber-text hover:border-cyber-blue transition-all font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

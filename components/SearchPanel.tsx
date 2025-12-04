"use client";

import { Search, Filter, Calendar } from "lucide-react";
import { FilterState } from "@/lib/types";

interface SearchPanelProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

export default function SearchPanel({ filters, setFilters }: SearchPanelProps) {
  return (
    <div className="cyber-border bg-cyber-dark/50 backdrop-blur-sm p-6 rounded-lg mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-blue/50" />
          <input
            type="text"
            placeholder="SEARCH CVEs, PRODUCTS, VENDORS..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            className="w-full bg-cyber-black/50 border border-cyber-blue/30 rounded pl-10 pr-4 py-3 text-cyber-blue placeholder-cyber-blue/30 focus:outline-none focus:border-cyber-blue focus:border-glow transition-all"
          />
        </div>

        {/* Severity Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-pink/50" />
          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            className="bg-cyber-black/50 border border-cyber-pink/30 rounded pl-10 pr-8 py-3 text-cyber-pink focus:outline-none focus:border-cyber-pink focus:border-glow transition-all appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="all">ALL SEVERITIES</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-purple/50" />
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="bg-cyber-black/50 border border-cyber-purple/30 rounded pl-10 pr-8 py-3 text-cyber-purple focus:outline-none focus:border-cyber-purple focus:border-glow transition-all appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="7">LAST 7 DAYS</option>
            <option value="30">LAST 30 DAYS</option>
            <option value="90">LAST 90 DAYS</option>
            <option value="365">LAST YEAR</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.severity !== "all" || filters.searchTerm) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.severity !== "all" && (
            <span className="px-3 py-1 bg-cyber-pink/20 border border-cyber-pink/50 rounded text-xs text-cyber-pink">
              Severity: {filters.severity}
            </span>
          )}
          {filters.searchTerm && (
            <span className="px-3 py-1 bg-cyber-blue/20 border border-cyber-blue/50 rounded text-xs text-cyber-blue">
              Search: {filters.searchTerm}
            </span>
          )}
          <button
            onClick={() => setFilters({ severity: "all", dateRange: "30", searchTerm: "" })}
            className="px-3 py-1 bg-cyber-dark border border-cyber-blue/30 rounded text-xs text-cyber-blue hover:border-cyber-blue transition-all"
          >
            CLEAR FILTERS
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Search, Filter, Calendar, Database, Shield } from "lucide-react";
import { FilterState, CVEItem } from "@/lib/types";

interface SearchPanelProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  availableCVEs?: CVEItem[];
}

export default function SearchPanel({ filters, setFilters, availableCVEs = [] }: SearchPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract tags from available CVEs
  const exploitCount = availableCVEs.filter(cve => cve.exploitAvailable).length;
  const hasExploits = exploitCount > 0;

  // Extract vendors from affected products (CPE format)
  const vendorCounts = availableCVEs.reduce((acc, cve) => {
    cve.affectedProducts.forEach(product => {
      // CPE format: cpe:2.3:a:vendor:product:... or cpe:/a:vendor:product:...
      const parts = product.split(':');
      let vendor = '';

      if (parts[0] === 'cpe' && parts.length > 3) {
        // CPE 2.3 format: vendor is at index 3
        // CPE 2.2 format: vendor is at index 2 (after cpe:/a)
        vendor = parts[1] === '2.3' ? parts[3] : parts[2].split('/').pop() || '';
      }

      vendor = vendor.toLowerCase().trim();
      if (vendor && vendor.length > 1 && vendor !== '*' && vendor !== '-') {
        acc[vendor] = (acc[vendor] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  // Get top 8 vendors
  const topVendors = Object.entries(vendorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([vendor, count]) => ({ vendor, count }));

  return (
    <div className="border border-cyber-blue/30 panel-bg p-3 rounded-lg mb-4">
      <div className="flex flex-col gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-blue/50" />
          <input
            type="text"
            placeholder="Search CVEs, Products, Vendors... (Click to show filters)"
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            onFocus={() => setIsExpanded(true)}
            className="w-full bg-cyber-black/50 border border-cyber-blue/30 rounded pl-9 pr-3 py-2 text-cyber-text placeholder-cyber-text-dim/50 focus:outline-none focus:border-cyber-blue transition-all text-sm"
          />
        </div>

        {/* Collapsible Filters */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-3">
            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Data Source Filter */}
              <div className="relative flex-1">
                <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-green/50" />
                <select
                  value={filters.dataSource}
                  onChange={(e) => setFilters({ ...filters, dataSource: e.target.value as any })}
                  className="w-full bg-cyber-black/50 border border-cyber-green/30 rounded pl-9 pr-8 py-2 text-cyber-green text-sm focus:outline-none focus:border-cyber-green transition-all appearance-none cursor-pointer"
                >
                  <option value="ALL">ALL SOURCES</option>
                  <option value="NVD">NVD ONLY</option>
                  <option value="EUVD">EUVD ONLY</option>
                </select>
              </div>

              {/* Severity Filter */}
              <div className="relative flex-1">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-pink/50" />
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  className="w-full bg-cyber-black/50 border border-cyber-pink/30 rounded pl-9 pr-8 py-2 text-cyber-pink text-sm focus:outline-none focus:border-cyber-pink transition-all appearance-none cursor-pointer"
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
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-purple/50" />
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full bg-cyber-black/50 border border-cyber-purple/30 rounded pl-9 pr-8 py-2 text-cyber-purple text-sm focus:outline-none focus:border-cyber-purple transition-all appearance-none cursor-pointer"
                >
                  <option value="1">Last 24 Hours</option>
                  <option value="3">Last 3 Days</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="365">Last Year</option>
                </select>
              </div>
            </div>

            {/* Quick Filters Tags */}
            {availableCVEs.length > 0 && (hasExploits || topVendors.length > 0) && (
              <div className="flex flex-col gap-2">
                <span className="text-xs text-cyber-text-dim">Quick Filters:</span>
                <div className="flex flex-wrap gap-2">
                  {hasExploits && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setFilters({ ...filters, exploitAvailable: !filters.exploitAvailable });
                      }}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        filters.exploitAvailable
                          ? 'bg-red-500/30 border border-red-500/50 text-red-400'
                          : 'bg-red-500/10 border border-red-500/30 text-red-500/70 hover:bg-red-500/20 hover:border-red-500/40'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Exploits ({exploitCount})
                      </span>
                    </button>
                  )}
                  {topVendors.map(({ vendor, count }) => (
                    <button
                      key={vendor}
                      onClick={(e) => {
                        e.preventDefault();
                        setFilters({
                          ...filters,
                          vendor: filters.vendor === vendor ? undefined : vendor
                        });
                      }}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all capitalize ${
                        filters.vendor === vendor
                          ? 'bg-cyber-purple/30 border border-cyber-purple/50 text-cyber-purple'
                          : 'bg-cyber-purple/10 border border-cyber-purple/30 text-cyber-purple/70 hover:bg-cyber-purple/20 hover:border-cyber-purple/40'
                      }`}
                    >
                      {vendor} ({count})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hide Filters Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setIsExpanded(false)}
                className="px-3 py-2 bg-cyber-dark border border-cyber-blue/30 rounded text-xs text-cyber-text hover:border-cyber-blue transition-all font-medium whitespace-nowrap"
              >
                Hide Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.severity !== "all" || filters.searchTerm || filters.dataSource !== "ALL" || filters.exploitAvailable || filters.vendor) && (
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
          {filters.exploitAvailable && (
            <span className="px-3 py-1.5 bg-red-500/20 border border-red-500/50 rounded text-sm text-red-500 font-medium">
              Exploits Available
            </span>
          )}
          {filters.vendor && (
            <span className="px-3 py-1.5 bg-cyber-purple/20 border border-cyber-purple/50 rounded text-sm text-cyber-purple font-medium capitalize">
              Vendor: {filters.vendor}
            </span>
          )}
          <button
            onClick={() => setFilters({ severity: "all", dateRange: "90", searchTerm: "", dataSource: "ALL" })}
            className="px-3 py-1.5 bg-cyber-dark border border-cyber-blue/30 rounded text-sm text-cyber-text hover:border-cyber-blue transition-all font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

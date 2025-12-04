"use client";

import { useState } from "react";
import CyberBackground from "@/components/CyberBackground";
import Header from "@/components/Header";
import TimelineView from "@/components/TimelineView";
import SearchPanel from "@/components/SearchPanel";
import CVEDetailModal from "@/components/CVEDetailModal";
import StatsPanel from "@/components/StatsPanel";
import { CVEItem, FilterState } from "@/lib/types";

export default function Home() {
  const [selectedCVE, setSelectedCVE] = useState<CVEItem | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    severity: "all",
    dateRange: "30",
    searchTerm: "",
    dataSource: "ALL",
  });

  const handleResetFilters = () => {
    setFilters({
      severity: "all",
      dateRange: "30",
      searchTerm: "",
      dataSource: "ALL",
    });
    setSelectedCVE(null);
  };

  const handleSeverityFilter = (severity: string) => {
    setFilters((prev) => ({
      ...prev,
      severity: severity,
    }));
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* 3D Background */}
      <CyberBackground />

      {/* Main Content */}
      <div className="relative z-10">
        <Header onResetFilters={handleResetFilters} />

        <div className="container mx-auto px-4 py-8">
          {/* Stats Panel */}
          <StatsPanel filters={filters} onSeverityFilter={handleSeverityFilter} />

          {/* Search & Filter Panel */}
          <SearchPanel filters={filters} setFilters={setFilters} />

          {/* 3D Timeline Visualization */}
          <TimelineView
            filters={filters}
            onSelectCVE={setSelectedCVE}
          />
        </div>
      </div>

      {/* CVE Detail Modal */}
      {selectedCVE && (
        <CVEDetailModal
          cve={selectedCVE}
          onClose={() => setSelectedCVE(null)}
        />
      )}
    </main>
  );
}

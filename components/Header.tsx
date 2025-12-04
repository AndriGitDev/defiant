"use client";

import { Shield, Activity, Database } from "lucide-react";
import { FilterState } from "@/lib/types";

interface HeaderProps {
  onResetFilters?: () => void;
  filters?: FilterState;
  setFilters?: (filters: FilterState) => void;
}

export default function Header({ onResetFilters, filters, setFilters }: HeaderProps) {
  return (
    <header className="border-b border-cyber-blue/30 panel-bg-solid">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-6">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onResetFilters}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onResetFilters?.()}
          >
            <Shield className="w-8 h-8 text-cyber-pink animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold text-cyber-text text-shadow-glow glitch" data-text="DEFIANT">
                DEFIANT
              </h1>
              <p className="text-xs text-cyber-text-dim tracking-wide">
                Real-Time Global Vulnerability Tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-cyber-green/50 bg-cyber-green/10 rounded">
              <Activity className="w-3.5 h-3.5 text-cyber-green animate-pulse" />
              <span className="text-cyber-green text-xs font-mono font-semibold">ONLINE</span>
            </div>

            {filters && setFilters && (
              <div className="hidden md:flex items-center gap-2 px-2 py-1.5 border border-cyber-green/30 bg-cyber-green/5 rounded">
                <Database className="w-3.5 h-3.5 text-cyber-green/70" />
                <select
                  value={filters.dataSource}
                  onChange={(e) => setFilters({ ...filters, dataSource: e.target.value as any })}
                  className="bg-transparent border-none text-cyber-green text-xs font-mono focus:outline-none appearance-none cursor-pointer pr-1"
                >
                  <option value="ALL">ALL</option>
                  <option value="NVD">NVD</option>
                  <option value="EUVD">EUVD</option>
                </select>
              </div>
            )}

            <div className="text-xs text-cyber-text-dim hidden lg:block">
              Powered by{" "}
              <a
                href="https://andri.is"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyber-blue hover:text-cyber-pink transition-colors hover:text-shadow-glow"
              >
                Andri.is
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

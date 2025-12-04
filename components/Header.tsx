"use client";

import { Shield, Activity } from "lucide-react";

interface HeaderProps {
  onResetFilters?: () => void;
}

export default function Header({ onResetFilters }: HeaderProps) {
  return (
    <header className="border-b border-cyber-blue/30 panel-bg-solid">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div
            className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onResetFilters}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onResetFilters?.()}
          >
            <Shield className="w-12 h-12 text-cyber-pink animate-pulse" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-cyber-text text-shadow-glow glitch" data-text="DEFIANT">
                DEFIANT
              </h1>
              <p className="text-sm md:text-base text-cyber-text-dim tracking-wide mt-1">
                Real-Time Global Vulnerability Tracker
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-4 py-2 border border-cyber-green/50 bg-cyber-green/10 rounded">
              <Activity className="w-4 h-4 text-cyber-green animate-pulse" />
              <span className="text-cyber-green text-sm font-mono font-semibold">SYSTEM ONLINE</span>
            </div>
            <div className="text-xs text-cyber-text-dim text-right">
              NVD + EUVD Integration
            </div>
            <div className="text-xs text-cyber-text-dim text-right">
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

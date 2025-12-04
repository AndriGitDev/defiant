"use client";

import { Shield, Activity } from "lucide-react";

interface HeaderProps {
  onResetFilters?: () => void;
}

export default function Header({ onResetFilters }: HeaderProps) {
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

            <div className="hidden md:flex items-center gap-1 px-2 py-1 border border-cyber-blue/30 bg-cyber-blue/5 rounded">
              <span className="text-cyber-blue text-xs font-mono">NVD + EUVD</span>
            </div>

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

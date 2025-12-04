"use client";

import { Shield, Activity } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-cyber-blue/30 backdrop-blur-md">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="w-10 h-10 text-cyber-pink animate-pulse" />
            <div>
              <h1 className="text-4xl font-bold text-shadow-glow glitch" data-text="DEFIANT">
                DEFIANT
              </h1>
              <p className="text-sm text-cyber-blue/70 tracking-widest">
                BREACH_TIMELINE // REAL-TIME CVE TRACKER
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 border border-cyber-green/50 bg-cyber-green/10 rounded">
            <Activity className="w-4 h-4 text-cyber-green animate-pulse" />
            <span className="text-cyber-green text-sm font-mono">SYSTEM ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
}

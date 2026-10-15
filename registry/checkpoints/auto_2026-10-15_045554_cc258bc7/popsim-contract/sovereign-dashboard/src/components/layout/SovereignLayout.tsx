import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Cyber-Noir Utility: Tailwind class merger
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SovereignLayoutProps {
  children: React.ReactNode;
}

export default function SovereignLayout({ children }: SovereignLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-indigo-500/30 overflow-hidden font-sans relative">
      {/* 🔮 Cyber-Noir Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* 🛰️ Sovereign Header */}
        <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <span className="font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Sovereign Neural Arbitrage
              </h1>
              <p className="text-[10px] text-indigo-400/80 font-mono tracking-widest uppercase">
                Hept-Division Manifold // Armed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-400">Bridge: Connected</span>
             </div>
             <div className="text-xs font-mono text-gray-500">
                Resonance: <span className="text-white">Diamond-Stable</span>
             </div>
          </div>
        </header>

        {/* 🛠️ Dashboard Content */}
        <main className="flex-1 overflow-hidden flex">
          {/* 🌑 Division Sidebar */}
          <aside className="w-20 border-r border-white/5 bg-black/20 flex flex-col items-center py-6 gap-6">
            {['DeFi', 'ICS', 'GRID', 'MOB', 'GLOB', 'CORE', 'ECON'].map((div) => (
              <div key={div} className="group relative">
                <div className="w-12 h-12 rounded-xl bg-white/5 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer flex items-center justify-center group-active:scale-95">
                  <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">
                    {div}
                  </span>
                </div>
                <div className="absolute left-full ml-4 px-2 py-1 bg-indigo-600 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {div} Division
                </div>
              </div>
            ))}
          </aside>

          {/* 🖼️ Main Deck */}
          <section className="flex-1 overflow-y-auto scrollbar-hide p-8">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import JostleCanvas from '@/components/JostleCanvas';
import SpectralRadar3072 from '@/components/SpectralRadar3072';
import { Terminal, Shield, Zap, Info } from 'lucide-react';

export default function WarRoom() {
  const [activeCoalition, setActiveCoalition] = React.useState('MEDIA');

  return (
    <div className="w-screen h-screen bg-[#050505] text-zinc-400 font-mono overflow-hidden relative">
      {/* JostleCanvas fills the entire viewport */}
      <JostleCanvas />

      {/* TOP STATUS BAR — overlay */}
      <header className="absolute top-0 left-0 right-0 h-10 border-b border-zinc-800/60 bg-black/70 flex items-center justify-between px-6 z-50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-amber-400">WAR ROOM</span>
          </div>
          <span className="text-zinc-700">|</span>
          <span className="text-xs uppercase tracking-widest text-zinc-400">3072-D SOVEREIGN</span>
        </div>
        <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest">
          <span className="flex items-center gap-2 text-cyan-400/80"><Shield size={12} /> METROPOLIS</span>
          <span className="flex items-center gap-2 text-amber-400/80"><Zap size={12} /> FLASHPOINT</span>
        </div>
      </header>

      {/* SIDEBAR — overlay panel, right side */}
      <aside className="absolute top-10 right-0 bottom-8 w-72 bg-black/75 border-l border-zinc-800/60 flex flex-col z-40 backdrop-blur-sm">
        {/* Spectral */}
        <div className="h-56 border-b border-zinc-800/60 p-3 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-200">SPECTRAL 3072</h3>
            <span className="text-xs text-amber-400 font-bold">ARMED</span>
          </div>
          <div className="flex-1 bg-zinc-950/60 rounded border border-zinc-800/50 overflow-hidden relative">
            <SpectralRadar3072 axis="Z-DEPTH" />
          </div>
        </div>

        {/* Audit log */}
        <div className="flex-1 p-3 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-2">
            <Terminal size={12} className="text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-200">KOS AUDIT</h3>
          </div>
          <div className="flex-1 bg-black/60 rounded border border-zinc-800/50 p-3 font-mono text-xs space-y-3 overflow-y-auto">
            <div className="border-l-2 border-amber-500/60 pl-2">
              <div className="text-zinc-300">[14:32] MiroFish: structural drift in DARK</div>
              <div className="text-amber-400 mt-1">DECISION LOGGED: id_4f2a7</div>
            </div>
            <div className="border-l-2 border-cyan-500/60 pl-2">
              <div className="text-zinc-300">[14:35] Sentinel authorized SNIPER_LOCK</div>
              <div className="text-cyan-400 mt-1">WAITING ON DIRECTOR</div>
            </div>
            <div className="text-zinc-500 text-xs italic animate-pulse">Awaiting neural response...</div>
          </div>
        </div>
      </aside>

      {/* FOOTER — overlay */}
      <footer className="absolute bottom-0 left-0 right-0 h-8 bg-black/70 border-t border-zinc-800/60 px-6 flex items-center justify-between z-50 backdrop-blur-sm">
        <div className="flex gap-8 text-xs text-zinc-500 uppercase tracking-widest">
          <span>MEM: 3072D SYNCED</span>
          <span>BUS: AaaA HEARTBEAT OK</span>
        </div>
        <div className="text-xs text-zinc-500 uppercase tracking-widest">A-MEM v1.0.4 DIAMOND STABLE</div>
      </footer>
    </div>
  );
}

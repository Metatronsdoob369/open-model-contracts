'use client';

import React from 'react';
import { ShieldCheck, Activity, Zap, ExternalLink } from 'lucide-react';
import SovereignCube from '@/components/SovereignCube';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col font-mono selection:bg-gold selection:text-black">
      {/* Header Bar: The Sovereign Brief */}
      <header className="h-16 border-b border-zinc-900 bg-black/50 backdrop-blur-md sticky top-0 z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-gold to-[#9a7b0a] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <ShieldCheck className="text-black" size={20} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tighter text-glow-gold">MISSION_CONTROL_CENTRE</h1>
              <span className="text-[8px] text-zinc-500 uppercase tracking-[0.3em] font-bold">SOVEREIGN_NODE_v3072.0</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-4 items-center">
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-zinc-600 uppercase font-bold">Structural_Integrity</span>
              <span className="text-[12px] text-gold font-bold font-mono tracking-tighter">PENDING_AUDIT</span>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-zinc-800 animate-pulse" />
        </div>
      </header>

      {/* Main Command Grid */}
      <main className="flex-1 grid grid-cols-[380px_1fr] overflow-hidden p-6 gap-6 max-h-[calc(100vh-64px)]">

        {/* Left Rail: Structural Intent */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <section className="glass-card mb-2 flex flex-col items-center">
            <h2 className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] mb-4 font-bold">Cognitive_Core</h2>
            <SovereignCube />
          </section>
          
          <section className="space-y-6">
            <h2 className="text-[10px] text-gold uppercase tracking-[0.2em] font-bold flex items-center gap-2 border-b border-zinc-900 pb-2">
              <Activity size={14} /> SYSTEMIC_CAPABILITY_AUDIT
            </h2>
            
            <div className="space-y-4">
               {['Spatio-Temporal', 'Round_Governance', 'Interaction_DNA', 'Visual_Resonance'].map(label => (
                 <div key={label} className="space-y-2">
                   <div className="flex justify-between text-[8px] uppercase font-bold tracking-widest text-zinc-500">
                     <span>{label}</span>
                     <span>AWAITING_SCAN</span>
                   </div>
                   <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                     <div className="w-0 h-full bg-zinc-800" />
                   </div>
                 </div>
               ))}
            </div>
          </section>

          <section className="mt-auto p-6 bg-zinc-950/20 border border-zinc-900 rounded-lg">
            <h3 className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-2 font-bold">Systemic_Status</h3>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Diagnostic bridge pending handshake. Architectural blueprints manifest in secondary viewport.
            </p>
          </section>
        </div>

        {/* Center: The Sovereign Blueprint */}
        <div className="flex-1 glass-card relative overflow-hidden flex flex-col bg-zinc-950/20 border border-zinc-900/50">
          <div className="absolute top-8 left-8 z-10">
            <h2 className="text-[14px] text-zinc-100 font-bold tracking-[0.4em] uppercase mb-1">
              SYSTEMIC_CATHEDRAL_ARCHITECTURAL_BLUEPRINT
            </h2>
            <div className="text-[9px] text-gold font-mono uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap size={10} className="animate-pulse" /> STATUS: STRUCTURAL_AUDIT_REQUIRED
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center p-16 bg-black relative">
            <img 
              src="/Users/joewales/.gemini/antigravity/brain/b3f8fbdd-5a29-41c3-998b-e42f053e96b2/sovereign_architecture_blueprint_1776404324964.png" 
              alt="Sovereign Architecture Blueprint"
              className="max-w-full max-h-full object-contain opacity-60 mix-blend-screen"
            />
            {/* Geometric Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
          </div>

          <div className="p-8 border-t border-zinc-900 bg-black/60 backdrop-blur-xl">
            <div className="flex justify-between items-center text-[9px] text-zinc-600 font-bold uppercase tracking-widest gap-20">
              <div className="flex gap-12">
                <span>3072D_PIPELINE: <span className="text-zinc-800">AWAITING_INGESTION_PULSE</span></span>
                <span>DATA_TRUST: <span className="text-zinc-800">0.0%</span></span>
              </div>
              <div className="flex items-center gap-2 text-gold opacity-80 group cursor-pointer">
                VIEW_FULL_SPEC <ExternalLink size={10} />
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Terminal Footer */}
      <footer className="h-8 border-t border-zinc-900 px-8 flex items-center justify-between bg-black text-[8px] text-zinc-700 uppercase tracking-[0.4em]">
        <div className="flex gap-6">
          <span>Localhost:6340_ONLINE</span>
          <span>Integrity: DIAMOND_PENDING</span>
        </div>
        <div>
          <span>REFRAG_AUDIT_PIPELINE v1.0.1</span>
        </div>
      </footer>
    </div>
  );
}

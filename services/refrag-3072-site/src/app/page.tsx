'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Zap, Database, AlertCircle, HardDrive, Cpu, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SpectralRadar3072 from '@/components/SpectralRadar3072';
import ImmuneGauge from '@/components/ImmuneGauge';

interface Telemetry {
  stability: { value: number; status: string; threshold: number };
  performance: { value: number; status: string; ideal: number };
  coverage: { value: number; status: string; target: number };
  vampireDrains: Array<{ name: string; time: string; nodes: number; composition: string }>;
  auditLog: Array<{ type: string; msg: string; time: string }>;
}

export default function Home() {
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('http://localhost:3100/api/telemetry');
        const data = await res.json();
        setTelemetry(data);
      } catch (e) {
        console.error("Telemetry Sync Failed:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col font-mono selection:bg-gold selection:text-black">
      {/* Header Bar */}
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
          <div className="h-6 w-[1px] bg-zinc-800 mx-2" />
          <nav className="flex gap-6 opacity-60 hover:opacity-100 transition-opacity">
               {['Memories', 'Governance', 'Observability', 'Registry'].map(item => (
                 <a key={item} href="#" className="text-[10px] uppercase tracking-widest hover:text-gold transition-colors">{item}</a>
               ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
             <div className="flex gap-4 items-center">
                  <div className="flex flex-col items-end">
                       <span className="text-[8px] text-zinc-600 uppercase font-bold">System_Latency</span>
                       <span className="text-[10px] text-cyan font-bold font-mono">1.66ms</span>
                  </div>
                  <div className="flex flex-col items-end border-l border-zinc-800 pl-4">
                       <span className="text-[8px] text-zinc-600 uppercase font-bold">Node_Status</span>
                       <span className="text-[10px] text-green-500 font-bold font-mono">ENCRYPTED</span>
                  </div>
             </div>
             <div className="w-2 h-2 rounded-full bg-cyan animate-pulse shadow-[0_0_8px_rgba(0,238,255,1)]" />
        </div>
      </header>

      {/* Main Command Grid */}
      <main className="flex-1 grid grid-cols-[380px_1fr_380px] overflow-hidden p-6 gap-6 max-h-[calc(100vh-64px)]">
        
        {/* Left Rail: Immune System Gauges */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <section className="space-y-4">
             <h2 className="text-[10px] text-gold uppercase tracking-[0.2em] mb-4 font-bold flex items-center gap-2">
                 <Activity size={14} /> HEURISTIC_SAFETY_IMMUNITY
             </h2>
             <ImmuneGauge label="Structural_Stability" value={telemetry?.stability.value || 0} target={telemetry?.stability.threshold || 85} color="gold" />
             <ImmuneGauge label="Intent_Alignment" value={92.4} target={90} color="cyan" />
             <ImmuneGauge label="Registry_Consistency" value={telemetry?.coverage.value || 0} target={telemetry?.coverage.target || 90} color="red" />
          </section>

          <section className="glass-card mt-auto p-4 border-none relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-2 opacity-20 pointer-events-none">
                    <Zap size={40} className="text-gold" />
               </div>
               <h3 className="text-[9px] uppercase tracking-widest text-zinc-500 mb-3 font-bold">Active_Mitigation_Matrix</h3>
               <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-zinc-950/50 p-3 rounded">
                         <AlertCircle className="text-red-500 mt-0.5" size={14} />
                         <div>
                              <div className="text-[10px] font-bold text-zinc-200">R-09: SUPERBULLET_HALLUCINATION</div>
                              <div className="text-[8px] text-zinc-500 mt-1 uppercase tracking-tighter">Bypass detected in MemPalace sector 12. Quarantining sector and re-initializing signature handshake.</div>
                         </div>
                    </div>
               </div>
          </section>
        </div>

        {/* Center: Spectral Radar 3072 */}
        <div className="relative flex flex-col gap-4">
          <div className="flex-1 min-h-0">
               <SpectralRadar3072 />
          </div>
          <div className="h-48 grid grid-cols-3 gap-4">
             <div className="glass-card flex flex-col items-center justify-center gap-2 p-4">
                  <Database className="text-zinc-600 mb-1" size={18} />
                  <div className="text-xl font-bold font-mono tracking-tighter">{telemetry?.vampireDrains.length || 0}</div>
                  <div className="text-[8px] text-zinc-700 uppercase tracking-widest">Mem_Drops</div>
             </div>
             <div className="glass-card flex flex-col items-center justify-center gap-2 p-4">
                  <Cpu className="text-gold mb-1" size={18} />
                  <div className="text-xl font-bold font-mono tracking-tighter">3072</div>
                  <div className="text-[8px] text-zinc-700 uppercase tracking-widest">Vector_Dims</div>
             </div>
             <div className="glass-card flex flex-col items-center justify-center gap-2 p-4">
                  <HardDrive className="text-zinc-600 mb-1" size={18} />
                  <div className="text-xl font-bold font-mono tracking-tighter">1.2ms</div>
                  <div className="text-[8px] text-zinc-700 uppercase tracking-widest">IO_Backplane</div>
             </div>
          </div>
        </div>

        {/* Right Rail: Ingestion Logs */}
        <div className="flex flex-col gap-6 overflow-hidden">
             
             <section className="flex-1 flex flex-col overflow-hidden min-h-0">
                  <h2 className="text-[10px] text-gold uppercase tracking-[0.2em] mb-4 font-bold flex items-center justify-between">
                      <span className="flex items-center gap-2">📥 VAMPIRE_HARVEST_STREAM</span>
                      <span className="text-[8px] text-zinc-600 font-mono tracking-normal px-2 py-0.5 border border-zinc-800 rounded">LIVE_FEED</span>
                  </h2>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                       <AnimatePresence initial={false}>
                            {telemetry?.vampireDrains.map((drain, i) => (
                                 <motion.div 
                                      key={drain.time + i}
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      className="glass-card p-3 border-none bg-zinc-950/30 hover:bg-zinc-950/80 transition-colors group cursor-pointer"
                                 >
                                      <div className="flex justify-between items-start mb-1">
                                           <div className="text-[10px] font-bold text-zinc-300 group-hover:text-gold transition-colors truncate max-w-[200px]">{drain.name}</div>
                                           <div className="text-[8px] text-zinc-700 font-mono">{new Date(drain.time).toLocaleTimeString()}</div>
                                      </div>
                                      <div className="flex justify-between items-center text-[7px] text-zinc-600 font-bold uppercase tracking-widest">
                                           <span>DNA: {drain.composition} | NODES: {drain.nodes}</span>
                                           <ExternalLink size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                 </motion.div>
                            ))}
                       </AnimatePresence>
                  </div>
             </section>

             <section className="h-[40%] flex flex-col border-t border-zinc-900 pt-6 overflow-hidden">
                  <h2 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3 font-bold">Immune_System_Audit_Log</h2>
                  <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar font-mono text-[9px]">
                       {telemetry?.auditLog.map((log, i) => (
                            <div key={i} className="flex gap-3 py-1 border-b border-zinc-950 opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
                                 <span className={log.type === 'Sentry' ? 'text-red-500' : 'text-gold'}>[{log.type}]</span>
                                 <span className="text-zinc-400 truncate flex-1">{log.msg}</span>
                            </div>
                       ))}
                  </div>
             </section>
        </div>

      </main>
      
      {/* Architectural Blueprints Section */}
      <section className="px-8 pb-12 border-t border-zinc-900 pt-8 bg-zinc-950/20 overflow-y-auto">
        <h2 className="text-[10px] text-gold uppercase tracking-[0.3em] mb-6 font-bold flex items-center gap-2">
          <Activity size={14} /> ARCHITECTURAL_BLUEPRINTS (MANUS_SPEC)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-4 border-zinc-800/50 hover:border-gold/30 transition-all group">
            <h3 className="text-[9px] text-zinc-500 uppercase tracking-widest mb-3 font-bold group-hover:text-zinc-300">Surveyor_Decision_Flow</h3>
            <img src="/assets/constraint_validation_flow.png" alt="Constraint Validation Flow" className="w-full h-auto rounded grayscale hover:grayscale-0 transition-all duration-500" />
          </div>
          <div className="glass-card p-4 border-zinc-800/50 hover:border-gold/30 transition-all group">
            <h3 className="text-[9px] text-zinc-500 uppercase tracking-widest mb-3 font-bold group-hover:text-zinc-300">Neural_Feedback_Flywheel</h3>
            <img src="/assets/qdrant_feedback_loop.png" alt="Qdrant Feedback Loop" className="w-full h-auto rounded grayscale hover:grayscale-0 transition-all duration-500" />
          </div>
          <div className="glass-card p-4 border-zinc-800/50 hover:border-gold/30 transition-all group">
            <h3 className="text-[9px] text-zinc-500 uppercase tracking-widest mb-3 font-bold group-hover:text-zinc-300">Implementation_Priority_Gradient</h3>
            <img src="/assets/priority_roadmap.png" alt="Priority Roadmap" className="w-full h-auto rounded grayscale hover:grayscale-0 transition-all duration-500" />
          </div>
        </div>
      </section>

      {/* Mitigation Framework Section */}
      <section className="px-8 pb-20 border-t border-zinc-900 pt-12 bg-black overflow-y-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-[10px] text-red-500 uppercase tracking-[0.3em] mb-2 font-bold flex items-center gap-2">
              <ShieldCheck size={14} /> MITIGATION_FRAMEWORK (OPERATIONAL_HARDENING)
            </h2>
            <p className="text-[10px] text-zinc-600 max-w-xl uppercase tracking-tighter">Deterministic escalation triggers and ownership chains for high-severity risks in the Metropolis ecosystem.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-6 bg-zinc-950/40 border-zinc-900 hover:border-red-900/40 transition-all">
            <h3 className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2">Response_Matrix_v1.0</h3>
            <img src="/assets/mitigation_escalation_matrix.png" alt="Escalation Matrix" className="w-full h-auto rounded opacity-80 hover:opacity-100 transition-opacity duration-700" />
          </div>
          <div className="glass-card p-6 bg-zinc-950/40 border-zinc-900 hover:border-red-900/40 transition-all">
            <h3 className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2">Ownership_Escalation_Chain</h3>
            <img src="/assets/mitigation_ownership_chain.png" alt="Ownership Chain" className="w-full h-auto rounded opacity-80 hover:opacity-100 transition-opacity duration-700" />
          </div>
        </div>
      </section>

      {/* Surgical Construction Pipeline Section */}
      <section className="px-8 pb-40 border-t border-zinc-900 pt-20 bg-zinc-950/20 overflow-y-auto">
        <div className="flex justify-between items-center mb-16">
          <div className="space-y-3">
            <h2 className="text-[10px] text-white uppercase tracking-[0.6em] font-bold flex items-center gap-4">
              <Zap size={20} className="text-gold animate-pulse" /> SURGICAL_CONSTRUCTION_PIPELINE (METROPOLIS_MANIFEST)
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest max-w-2xl">
              Zero-glitch creation protocol. Assembly is strictly sequenced from environmental hulls to economic intent seeds.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="px-4 py-2 bg-gold/5 border border-gold/20 rounded text-[10px] text-gold font-bold tracking-tighter">ENGINE: ASSEMBLY_READY</div>
          </div>
        </div>

        <div className="relative flex justify-between gap-4">
          {/* Progress Connector */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-zinc-800 -z-10" />

          {/* Stage 1: Hull */}
          <div className="glass-card flex-1 p-6 bg-black border-zinc-900 hover:border-gold/30 transition-all text-center group">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/10 group-hover:border-gold/30 transition-colors">
              <span className="text-[10px] font-bold text-zinc-500 group-hover:text-gold">01</span>
            </div>
            <h3 className="text-[10px] font-bold text-zinc-200 uppercase tracking-widest mb-2">Biome_Hull</h3>
            <p className="text-[8px] text-zinc-600 uppercase">Terrain Anchor / Flora Snap</p>
          </div>

          {/* Stage 2: Skeleton */}
          <div className="glass-card flex-1 p-6 bg-black border-zinc-900 hover:border-gold/30 transition-all text-center group">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/10 group-hover:border-gold/30 transition-colors">
              <span className="text-[10px] font-bold text-zinc-500 group-hover:text-gold">02</span>
            </div>
            <h3 className="text-[10px] font-bold text-zinc-200 uppercase tracking-widest mb-2">Structural_Skeleton</h3>
            <p className="text-[8px] text-zinc-600 uppercase">Seam Alignment / CSG Insets</p>
          </div>

          {/* Stage 3: Heart */}
          <div className="glass-card flex-1 p-6 bg-black border-zinc-900 hover:border-gold/30 transition-all text-center group">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/10 group-hover:border-gold/30 transition-colors">
              <span className="text-[10px] font-bold text-zinc-500 group-hover:text-gold">03</span>
            </div>
            <h3 className="text-[10px] font-bold text-zinc-200 uppercase tracking-widest mb-2">Economic_Heart</h3>
            <p className="text-[8px] text-zinc-600 uppercase">Conversion Nodes / Trading Hubs</p>
          </div>

          {/* Stage 4: Seed */}
          <div className="glass-card flex-1 p-6 bg-black border-zinc-900 hover:border-gold/30 transition-all text-center group">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/10 group-hover:border-gold/30 transition-colors">
              <span className="text-[10px] font-bold text-zinc-500 group-hover:text-gold">04</span>
            </div>
            <h3 className="text-[10px] font-bold text-zinc-200 uppercase tracking-widest mb-2">Retention_Seed</h3>
            <p className="text-[8px] text-zinc-600 uppercase">FTUE Spawn / Onboarding Path</p>
          </div>
        </div>
      </section>

      {/* Topological Geometry Math Section */}
      <section className="px-8 pb-48 border-t border-zinc-900 pt-24 bg-black overflow-y-auto">
        <div className="flex justify-between items-start mb-16">
          <div className="space-y-4">
            <h2 className="text-[10px] text-zinc-500 uppercase tracking-[0.7em] font-bold flex items-center gap-4">
              <Activity size={18} /> TOPOLOGICAL_GEOMETRY_MATH (SPATIAL_SECTORIZATION)
            </h2>
            <p className="text-[10px] text-zinc-700 uppercase tracking-widest max-w-3xl">
              Deterministic geometric laws for world partitioning. 
              The math of the surgical strike.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Radial Math */}
          <div className="glass-card p-8 bg-zinc-950/30 border-zinc-900/80 hover:bg-zinc-950/80 transition-all border-dashed">
            <h3 className="text-[11px] font-bold text-zinc-400 mb-6 uppercase tracking-widest border-b border-zinc-800 pb-2">01: Radial_Sectorization</h3>
            <div className="font-mono text-[12px] text-gold mb-6 italic">
              R = c * sqrt(n)<br/>
              Theta = n * 137.5°
            </div>
            <p className="text-[8px] text-zinc-600 uppercase tracking-tighter">Golden-Ratio distribution for FTUE retention nodes around Spawn_Center.</p>
          </div>

          {/* Structural Math */}
          <div className="glass-card p-8 bg-zinc-950/30 border-zinc-900/80 hover:bg-zinc-950/80 transition-all border-dashed">
            <h3 className="text-[11px] font-bold text-zinc-400 mb-6 uppercase tracking-widest border-b border-zinc-800 pb-2">02: Structural_Coherence</h3>
            <div className="font-mono text-[12px] text-gold mb-6 italic">
              Dot(Na, Nb) {'>'} 0.999<br/>
              Epsilon = 0.001
            </div>
            <p className="text-[8px] text-zinc-600 uppercase tracking-tighter">Zero-leak coplanar alignment for wall-seam and roof-joint sectors.</p>
          </div>

          {/* Sector Math */}
          <div className="glass-card p-8 bg-zinc-950/30 border-zinc-900/80 hover:bg-zinc-950/80 transition-all border-dashed">
            <h3 className="text-[11px] font-bold text-zinc-400 mb-6 uppercase tracking-widest border-b border-zinc-800 pb-2">03: BVH_Partitioning</h3>
            <div className="font-mono text-[12px] text-gold mb-6 italic">
              ID = f(x/S) + f(y/S)*W<br/>
              Cap = 2,000 Nodes
            </div>
            <p className="text-[8px] text-zinc-600 uppercase tracking-tighter">Axis-aligned bounding volume hierarchy for surgical NPC/AI sector management.</p>
          </div>
        </div>
      </section>

      {/* Phase Gate Governance Section */}
      <section className="px-8 pb-32 border-t border-zinc-900 pt-16 bg-zinc-950/10 overflow-y-auto">
        {/* ... (previous phase gate content) ... */}
      </section>

      {/* Component DNA Mapping Section */}
      <section className="px-8 pb-32 border-t border-zinc-900 pt-16 bg-black overflow-y-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="space-y-2">
            <h2 className="text-[10px] text-zinc-400 uppercase tracking-[0.5em] font-bold flex items-center gap-3">
              <Database size={16} className="text-zinc-500" /> COMPONENT_DNA_MAPPING (3072D_CORRELATION)
            </h2>
            <p className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] max-w-xl">
              Surgical mapping of game instances to player experience resonance. 
              Governed by the Specialist Board.
            </p>
          </div>
          <div className="text-[8px] text-zinc-800 font-mono tracking-widest border border-zinc-900 px-3 py-1 rounded">MAPPING_ENGINE: ACTIVE</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Economy Sector */}
          <div className="glass-card p-6 bg-zinc-950/20 border-zinc-900/50 hover:bg-zinc-950/50 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/10 rounded border border-green-500/20 text-green-500"><Zap size={14} /></div>
              <h3 className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">Sector_01: Economy</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-black border border-zinc-900 rounded font-mono text-[9px] flex justify-between">
                <span className="text-zinc-600">Product → 3072D</span>
                <span className="text-green-500">CONVERSION_VEC</span>
              </div>
              <div className="p-3 bg-black border border-zinc-900 rounded font-mono text-[9px] flex justify-between">
                <span className="text-zinc-600">Private_Server → 3072D</span>
                <span className="text-green-500">IDENTITY_VEC</span>
              </div>
            </div>
          </div>

          {/* Interface Sector */}
          <div className="glass-card p-6 bg-zinc-950/20 border-zinc-900/50 hover:bg-zinc-950/50 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20 text-blue-500"><Activity size={14} /></div>
              <h3 className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">Sector_02: Interface</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-black border border-zinc-900 rounded font-mono text-[9px] flex justify-between">
                <span className="text-zinc-600">Hud_Element → 3072D</span>
                <span className="text-blue-500">COGNITIVE_LOAD_VEC</span>
              </div>
              <div className="p-3 bg-black border border-zinc-900 rounded font-mono text-[9px] flex justify-between">
                <span className="text-zinc-600">Mobile_Layout → 3072D</span>
                <span className="text-blue-500">ACCESSIBILITY_VEC</span>
              </div>
            </div>
          </div>

          {/* Structure Sector */}
          <div className="glass-card p-6 bg-zinc-950/20 border-zinc-900/50 hover:bg-zinc-950/50 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gold/10 rounded border border-gold/20 text-gold"><ShieldCheck size={14} /></div>
              <h3 className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">Sector_03: Structure</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-black border border-zinc-900 rounded font-mono text-[9px] flex justify-between">
                <span className="text-zinc-600">SpawnPoint → 3072D</span>
                <span className="text-gold">RETENTION_SEED_VEC</span>
              </div>
              <div className="p-3 bg-black border border-zinc-900 rounded font-mono text-[9px] flex justify-between">
                <span className="text-zinc-600">Wall_Node → 3072D</span>
                <span className="text-gold">COHERENCE_SEED_VEC</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terminal Footer */}
      <footer className="h-8 border-t border-zinc-900 px-8 flex items-center justify-between bg-black text-[8px] text-zinc-700 uppercase tracking-[0.4em]">
         <div className="flex gap-6">
              <span>Backplane: LOCALHOST:6340_REACHABLE</span>
              <span>Memory: 3072D_STANDARDIZED</span>
              <span>Security: PROVENANCE_BYPASS_OFF</span>
         </div>
         <div className="flex gap-4">
              <span className="animate-pulse">BOOT_SEQUENCE_COMPLETE</span>
         </div>
      </footer>
    </div>
  );
}

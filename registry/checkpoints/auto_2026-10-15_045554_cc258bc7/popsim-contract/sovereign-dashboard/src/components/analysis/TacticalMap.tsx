'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { motion } from 'framer-motion';

interface TacticalMapProps {
  chart: string; // Mermaid code
}

export default function TacticalMap({ chart }: TacticalMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#6366f1',
        primaryTextColor: '#fff',
        primaryBorderColor: '#6366f1',
        lineColor: '#4f46e5',
        secondaryColor: '#1e1e2e',
        tertiaryColor: '#1e1e2e',
      },
      flowchart: {
        curve: 'basis',
        htmlLabels: true,
      }
    });

    if (containerRef.current) {
        containerRef.current.innerHTML = `<pre class="mermaid">${chart}</pre>`;
        mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full h-[500px] bg-black/40 border border-white/5 rounded-3xl overflow-hidden p-8 flex items-center justify-center group"
    >
        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />

        <div className="flex items-center justify-between absolute top-6 left-8 right-8 z-20">
            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                Live Tactical Briefing // Bookify DNA
            </h2>
            <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] uppercase font-bold hover:bg-white/10 transition-colors">
                    Export JSON
                </button>
            </div>
        </div>
      
        <div 
          ref={containerRef}
          className="w-full h-full flex items-center justify-center scale-110 pointer-events-auto"
        />

        {/* Tactical Overlay Elements */}
        <div className="absolute bottom-6 left-8 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/5 rounded-xl">
             <p className="text-[10px] text-gray-500 font-mono tracking-tighter">
                STATUS: <span className="text-green-400">ANALYSING_SEQUENTIAL_DNA</span>
                <br />
                REPURPOSE_MODE: <span className="text-indigo-400">ATTACK_TREE_GENERATION</span>
             </p>
        </div>
    </motion.div>
  );
}

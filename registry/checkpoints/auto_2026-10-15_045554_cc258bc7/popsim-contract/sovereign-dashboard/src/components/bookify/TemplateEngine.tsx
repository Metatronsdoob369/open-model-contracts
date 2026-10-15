'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Zap, Layers, Share2, Star, AlertTriangle, FileText, ChevronRight } from 'lucide-react';

export default function BookifyEngine() {
  const [activeTab, setActiveTab] = useState<'input' | 'template' | 'apply'>('input');
  const [bookTitle, setBookTitle] = useState('');
  
  const reusabilityRating = 4; // 🔁🔁🔁🔁
  
  return (
    <div className="space-y-6">
      {/* 🚀 Phase Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Bookify: DNA Extraction Engine
          </h2>
          <p className="text-xs text-gray-500 font-mono italic">
            Master of Transformation // Template Generation Phase
          </p>
        </div>
        
        <div className="flex gap-2">
            {['input', 'template', 'apply'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all
                        ${activeTab === tab ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-white/5 text-gray-500 hover:bg-white/10'}
                    `}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'input' && (
          <motion.div 
            key="input"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* 📥 Input Module */}
            <div className="glass-dark rounded-3xl p-8 space-y-6 border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                        <Book className="text-indigo-400" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold">Book DNA Ingestion</h3>
                        <p className="text-xs text-gray-500 font-mono">Reverse-Engineering the Blueprint</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 block">Book Title & Author</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Meditations by Marcus Aurelius"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 block">Source Fragment / Chapters</label>
                        <textarea 
                            rows={8}
                            placeholder="Paste text or upload chapters for core dissection..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                            EXTRACT BRAIN DNA
                        </button>
                    </div>
                </div>
            </div>

            {/* 🧠 Extraction Preview */}
            <div className="space-y-6">
                <div className="glass rounded-3xl p-8 border border-indigo-500/20 bg-indigo-500/5">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
                        <Zap size={16} /> Extraction Status
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                             <span className="text-gray-400">Main Themes Map</span>
                             <span className="text-green-400">0.98 Stability</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                             <div className="w-[98%] h-full bg-green-500" />
                        </div>
                        <div className="flex justify-between items-center text-xs">
                             <span className="text-gray-400">Tone Resonance Matrix</span>
                             <span className="text-indigo-400">0.85 Confidence</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                             <div className="w-[85%] h-full bg-indigo-500" />
                        </div>
                    </div>
                </div>

                <div className="glass rounded-3xl p-6 border border-white/5">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Meta-Instruction Preview</h4>
                    <p className="text-xs text-gray-400 italic leading-relaxed">
                        "Use this as a metaphor logic bank for startup storytelling. This author's tone is stoic yet expansive, ideal for practical frameworks and allegorical parables."
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                        <div className="flex gap-1 text-yellow-500">
                             {Array.from({ length: 5 }).map((_, i) => (
                                 <Star key={i} size={12} fill={i < reusabilityRating ? 'currentColor' : 'none'} />
                             ))}
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">RESUSABILITY: {reusabilityRating}/5</span>
                    </div>
                </div>
        {/* 🧠 Phase 1: Template View (Book Brain Extractor) */}
        {activeTab === 'template' && (
          <motion.div 
            key="template"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
                <div className="glass-dark rounded-3xl p-8 border border-white/5 h-[500px] overflow-y-auto scrollbar-hide">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Layers size={20} className="text-purple-400" />
                        Repurposable Modular DNA
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all cursor-pointer">
                            <h4 className="font-mono text-[10px] text-indigo-400 uppercase tracking-widest mb-1">Logic Mechanism #1</h4>
                            <h5 className="font-bold mb-2">The Architectural Inversion</h5>
                            <p className="text-xs text-gray-400 leading-relaxed">Reverse-engineering large systems by targeting the smallest atomic unit of failure first.</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all cursor-pointer">
                            <h4 className="font-mono text-[10px] text-purple-400 uppercase tracking-widest mb-1">Tone Styling</h4>
                            <h5 className="font-bold mb-2">The Expansive Stoic</h5>
                            <p className="text-xs text-gray-400 leading-relaxed">Direct, low-adjective phrasing combined with high-concept metaphysical concepts.</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all cursor-pointer">
                            <h4 className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-1">Metaphor Bank</h4>
                            <h5 className="font-bold mb-2">The Sinking Shard</h5>
                            <p className="text-xs text-gray-400 leading-relaxed">A heavy crystalline object dropping through multi-layered oceans of signal.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="glass rounded-3xl p-8 border border-purple-500/20 bg-purple-500/5">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-4 flex items-center gap-2">
                        <AlertTriangle size={16} /> Constraint Notes
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Best used in structured formats. Not satire-compatible. Requires high-fidelity context for L2-Norm resonance.
                    </p>
                </div>
                <div className="glass rounded-3xl p-6 border border-white/5">
                    <button className="w-full py-4 bg-purple-600 rounded-2xl font-bold flex items-center justify-center gap-2">
                        <Share2 size={16} /> STORE IN PERSONAL LIBRARY
                    </button>
                </div>
            </div>
          </motion.div>
        )}

        {/* 🎬 Phase 2: Custom Application (Generator) */}
        {activeTab === 'apply' && (
          <motion.div 
            key="apply"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="glass-dark rounded-3xl p-8 space-y-6 border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                        <Zap className="text-cyan-400" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold">Application Generator</h3>
                        <p className="text-xs text-gray-500 font-mono">Versatile Content Conversion</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 block">Output Format</label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-cyan-500 transition-colors appearance-none">
                            <option>YouTube Script (Elite Briefing style)</option>
                            <option>Business Plan (Sovereign Startup)</option>
                            <option>Allegorical Parable</option>
                            <option>Branded Story Manifestation</option>
                            <option>Podcast Script (Deep Dive)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 block">Target Audience / Keywords</label>
                        <input 
                            type="text" 
                            placeholder="e.g. DeFi Founders, Metaphysical Researchers..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                    </div>

                    <div className="pt-4">
                        <button className="w-full py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-2xl font-bold">
                            GENERATE REPURPOSED DNA
                        </button>
                    </div>
                </div>
            </div>

            <div className="border-2 border-dashed border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                 <FileText className="text-gray-700 mb-4" size={48} />
                 <h4 className="text-gray-500 font-bold">REPURPOSED_OUTPUT_PREVIEW_NULL</h4>
                 <p className="text-xs text-gray-600 max-w-[250px] mt-2 italic">Waiting for extraction triggers to manifest derivative content...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

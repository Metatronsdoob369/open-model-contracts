import SovereignLayout from '@/components/layout/SovereignLayout';
import DivisionGauge from '@/components/ui/DivisionGauge';
import TacticalMap from '@/components/analysis/TacticalMap';
import BookifyEngine from '@/components/bookify/TemplateEngine';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [view, setView] = useState<'security' | 'bookify'>('security');
  const [activeBrief, setActiveBrief] = useState(`
    flowchart TD
      ROOT((Tactical Brief: Liquid Award Wash))
      BRANCH_CROSS_DOMAIN_WASH_V10[Exploit Path: CROSS_DOMAIN_WASH_V10]
      ROOT --> BRANCH_CROSS_DOMAIN_WASH_V10
      LEAF_A[🔥 [CROSS-DOMAIN] SIG_CROSS_LIQUIDITY_WASH]
      LEAF_B[💎 [ECON] SIG_ECON_PAYOUT_GAPPING]
      LEAF_C[🧠 [CORE] SIG_PRNG_ENTROPY]
      BRANCH_CROSS_DOMAIN_WASH_V10 --> LEAF_A
      BRANCH_CROSS_DOMAIN_WASH_V10 --> LEAF_B
      BRANCH_CROSS_DOMAIN_WASH_V10 --> LEAF_C
  `);

  const [logs, setLogs] = useState([
    { id: 1, type: 'SUCCESS', title: 'Manifold Stabilization Completed', time: '12:45:23' },
    { id: 2, type: 'ARMED', title: 'SIG_CROSS_LIQUIDITY_WASH Detected in Sector 7', time: '12:45:21' },
    { id: 3, type: 'SCAN', title: 'Topological Drift Audit: +0.42 variance', time: '12:45:18' },
    { id: 4, type: 'CORE', title: 'DNS Root Verification: Diamond-Stable', time: '12:45:15' },
  ]);

  const [divisions, setDivisions] = useState([
    { id: 'DEFI', name: 'DeFi', value: 0.12, color: '#6366f1' },
    { id: 'ICS', name: 'S7/ICS', value: 0.05, color: '#f59e0b' },
    { id: 'GRID', name: 'Grid/DNP3', value: 0.08, color: '#06b6d4' },
    { id: 'MOB', name: 'Mobile', value: 0.15, color: '#10b981' },
    { id: 'GLOB', name: 'Scanner', value: 0.22, color: '#8b5cf6' },
    { id: 'CORE', name: 'Foundational', value: 0.04, color: '#6366f1' },
    { id: 'ECON', name: 'Economic', value: 0.78, color: '#ef4444' },
  ]);

  return (
    <SovereignLayout>
      <div className="space-y-8 pb-12">
        
        {/* 📟 Sovereign View Toggle */}
        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <button 
                onClick={() => setView('security')}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
                    ${view === 'security' ? 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'bg-white/5 text-gray-500 hover:bg-white/10'}
                `}
            >
                Security Manifold
            </button>
            <button 
                onClick={() => setView('bookify')}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
                    ${view === 'bookify' ? 'bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.3)]' : 'bg-white/5 text-gray-500 hover:bg-white/10'}
                `}
            >
                Bookify Engine
            </button>
        </div>

        <AnimatePresence mode="wait">
          {view === 'security' ? (
            <motion.div 
               key="security"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="space-y-8"
            >
                {/* 📊 Hept-Division Radial Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {divisions.map((div) => (
                    <DivisionGauge 
                    key={div.id}
                    id={div.id}
                    name={div.name}
                    value={div.value}
                    color={div.color}
                    />
                ))}
                </div>

                {/* 🗺️ Main Tactical Arena */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Tactical Map (Take 2/3 space) */}
                    <div className="lg:col-span-2 space-y-4">
                        <TacticalMap chart={activeBrief} />
                        
                        {/* Repurpose Controls */}
                        <div className="flex gap-4">
                            <div className="flex-1 p-6 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between">
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Investigation</h4>
                                    <p className="text-sm font-semibold text-indigo-400">LIQUID_AWARD_WASH_PUMP_DETECTION</p>
                                </div>
                                <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs transition-colors">
                                    REGENERATE DNA
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Forensic Intelligence Sidebar */}
                    <div className="space-y-6">
                        <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700" />
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                Forensic Insight
                            </h3>
                            <p className="text-xs text-indigo-300 leading-relaxed relative z-10">
                                The Manifold has detected a <span className="text-white font-bold">Cross-Domain Fracture</span>. Probability math confirms a 0.76 confidence interval that DeFi liquidity is being washed through Gold conversion gates.
                            </p>
                        </div>

                        <div className="bg-black/40 border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[350px]">
                            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Activity Centrifuge</span>
                                <span className="text-[10px] font-mono text-gray-500">LIVE // SAT_04_22</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
                                {logs.map((log) => (
                                    <div 
                                        key={log.id}
                                        className="text-[10px] flex items-start gap-3 group"
                                    >
                                        <span className="text-gray-600 shrink-0">{log.time}</span>
                                        <span className={
                                            log.type === 'ARMED' ? 'text-red-500 font-bold' : 
                                            log.type === 'SUCCESS' ? 'text-green-500' : 'text-blue-400'
                                        }>[{log.type}]</span>
                                        <span className="text-gray-300 truncate group-hover:text-white transition-colors">{log.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
          ) : (
            <motion.div 
               key="bookify"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
            >
                <BookifyEngine />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </SovereignLayout>
  );
}

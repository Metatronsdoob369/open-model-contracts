'use client';

type Capability = {
  name: string;
  strength: number; // 0-100
  status: 'STABLE' | 'HARDENING' | 'DEFICIT';
  color: string;
};

const CAPABILITIES: Capability[] = [
  { name: 'Spatio-Temporal Movement', strength: 95, status: 'STABLE', color: '#00EEFF' }, // Xenon Cyan
  { name: 'Round State Governance', strength: 85, status: 'HARDENING', color: '#00EEFF' },
  { name: 'Interaction / Tag DNA', strength: 92, status: 'STABLE', color: '#50FF32' }, // Toxic Green
  { name: 'Visual / Resonance', strength: 75, status: 'HARDENING', color: '#D4AF37' }, // Gold
  { name: 'Economy / Monetization', strength: 20, status: 'DEFICIT', color: '#FF0040' }, // Warning Red
];

export default function CapabilityMatrix() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] uppercase mb-2 border-b border-zinc-900 pb-2">
        Sovereign_Capability_Matrix
      </div>
      
      {CAPABILITIES.map((cap) => (
        <div key={cap.name} className="group">
          <div className="flex justify-between items-end mb-1">
            <span className="text-[8px] text-zinc-400 font-mono tracking-widest uppercase group-hover:text-white transition-colors">
              {cap.name}
            </span>
            <span 
              className="text-[9px] font-bold font-mono"
              style={{ color: cap.color }}
            >
              {cap.strength}%
            </span>
          </div>
          
          <div className="h-[2px] w-full bg-zinc-900 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-1000 ease-out animate-pulse"
              style={{ 
                width: `${cap.strength}%`, 
                backgroundColor: cap.color,
                boxShadow: `0 0 8px ${cap.color}80`
              }}
            />
          </div>
          
          <div className="mt-1 flex justify-between">
             <span className="text-[6px] text-zinc-600 uppercase tracking-tighter">Status: {cap.status}</span>
             <span className="text-[6px] text-zinc-700 uppercase">Sector_Alpha_Compliant</span>
          </div>
        </div>
      ))}

      <div className="mt-4 pt-4 border-t border-zinc-900">
        <div className="text-[7px] text-zinc-600 leading-relaxed uppercase tracking-widest">
          Vault_Analysis: Phase-1 Integration Complete. Dimensional coverage is optimal for "Tag/Chase" and "Rave" genres. Economy DNA strike required.
        </div>
      </div>
    </div>
  );
}

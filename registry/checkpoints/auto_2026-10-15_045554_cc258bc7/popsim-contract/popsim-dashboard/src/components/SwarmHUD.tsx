'use client';
import React, { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import { Activity, ShieldCheck, Database, Zap, Terminal } from 'lucide-react';

export const SwarmHUD = ({ runId }: { runId: string }) => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!runId) return;

    const handleProgress = (data: any) => {
      if (data.runId === runId) {
        setLogs(prev => [...prev, data]);
      }
    };

    socket.emit('join-run', { runId });
    socket.on('generation-progress', handleProgress);

    return () => {
      socket.off('generation-progress', handleProgress);
    };
  }, [runId]);

  return (
    <div className="glass p-6 h-full flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Activity size={16} className="text-[#bf00ff] animate-pulse" />
        <h2 className="text-xs font-bold tracking-widest text-[#bf00ff] uppercase">Swarm Heartbeat</h2>
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-3 custom-scrollbar pr-2">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center gap-3">
             <Zap size={24} />
             <p>Awaiting Swarm Initialization...</p>
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="flex flex-col gap-1 border-l-2 border-[#00e5ff]/20 pl-3 py-1">
               <div className="flex items-center justify-between">
                  <span className="text-[#00e5ff] font-bold">[{log.step.toUpperCase()}]</span>
                  <span className="text-gray-500 font-mono text-[9px]">{log.percent}%</span>
               </div>
               <p className="text-gray-300 leading-relaxed font-sans">{log.message}</p>
            </div>
          ))
        )}
      </div>

      {logs.length > 0 && (
         <div className="pt-4 border-t border-white/5">
            <div className="w-full bg-black/40 rounded-full h-1 overflow-hidden">
               <div 
                  className="bg-gradient-to-r from-[#00e5ff] to-[#bf00ff] h-full transition-all duration-500" 
                  style={{ width: `${logs[logs.length-1].percent}%` }}
               />
            </div>
         </div>
      )}
    </div>
  );
};

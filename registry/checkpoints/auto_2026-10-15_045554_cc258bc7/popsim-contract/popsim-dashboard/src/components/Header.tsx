'use client';
import React, { useEffect, useState } from 'react';
import { Activity, Shield, Database, Zap, Cpu } from 'lucide-react';
import axios from 'axios';

export const Header = () => {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_HUB_URL || 'http://localhost:8080'}/health`);
        setStatus(data);
      } catch (err) {
        console.error('Failed to fetch hub status');
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const StatusItem = ({ icon: Icon, label, active, color }: any) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-semibold ${active ? '' : 'opacity-50'}`}>
      <Icon size={14} className={active ? color : 'text-gray-500'} />
      <span className="hidden sm:inline">{label}</span>
      <div className={`w-1.5 h-1.5 rounded-full ${active ? (color === 'neon-text-cyan' ? 'bg-[#00e5ff] animate-pulse' : 'bg-emerald-500') : 'bg-red-500'}`} />
    </div>
  );

  return (
    <header className="fixed top-0 left-0 w-full h-20 glass-header flex items-center justify-between px-8 z-[1000]">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-[#00e5ff] to-[#bf00ff] rounded-lg rotate-45 flex items-center justify-center animate-glow">
          <Zap className="text-white -rotate-45" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight neon-text-cyan">POPSIM DELIVERY HUB</h1>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest leading-none">AGENTIC OPS // V2.1</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <StatusItem icon={Cpu} label="AI SWARM" active={status?.services?.openai === 'configured'} color="neon-text-cyan" />
        <StatusItem icon={Database} label="REDIS" active={status?.services?.redis === 'connected'} color="neon-text-cyan" />
        <StatusItem icon={Shield} label="ARMED GATE" active={true} color="neon-text-purple" />
      </div>
    </header>
  );
};

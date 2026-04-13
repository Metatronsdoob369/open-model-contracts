'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ImmuneGaugeProps {
  label: string;
  value: number;
  target: number;
  color?: 'cyan' | 'gold' | 'red';
}

export default function ImmuneGauge({ label, value, target, color = 'gold' }: ImmuneGaugeProps) {
  const percentage = Math.min(100, Math.max(0, (value / target) * 100));
  const barColor = color === 'cyan' ? 'bg-cyan' : color === 'red' ? 'bg-red-500' : 'bg-gold';
  const textColor = color === 'cyan' ? 'text-cyan' : color === 'red' ? 'text-red-500' : 'text-gold';
  const shadowColor = color === 'cyan' ? 'shadow-[0_0_10px_rgba(0,238,255,0.4)]' : color === 'red' ? 'shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'shadow-[0_0_10px_rgba(212,175,55,0.4)]';

  return (
    <div className="flex flex-col gap-2 w-full p-4 glass-card border-none">
      <div className="flex justify-between items-end">
        <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono">{label}</span>
        <span className={`text-base font-bold font-mono ${textColor}`}>{value.toFixed(1)}%</span>
      </div>
      
      <div className="h-[2px] w-full bg-zinc-900 overflow-hidden rounded-full">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${barColor} ${shadowColor}`}
        />
      </div>

      <div className="flex justify-between items-center mt-1 opacity-40">
           <div className="text-[8px] uppercase tracking-tighter">Target: {target}%</div>
           <div className={`text-[8px] uppercase tracking-tighter font-mono ${value >= target ? 'text-green-500' : 'text-zinc-600'}`}>
                {value >= target ? 'GOAL_MET' : 'SYNC_PENDING'}
           </div>
      </div>
    </div>
  );
}

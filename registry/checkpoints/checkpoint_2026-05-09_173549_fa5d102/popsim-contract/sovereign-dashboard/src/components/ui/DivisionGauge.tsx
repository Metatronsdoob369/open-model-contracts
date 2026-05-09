import React from 'react';
import { motion } from 'framer-motion';

interface DivisionGaugeProps {
  name: string;
  value: number; // 0 to 1
  color?: string;
  id: string;
}

export default function DivisionGauge({ name, value, color = '#6366f1', id }: DivisionGaugeProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - value * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors group cursor-pointer"
    >
      <div className="relative w-24 h-24">
        {/* Gray Background Circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="6"
            className="text-white/[0.05]"
          />
          {/* Active Gradient Circle */}
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            className="filter drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
            style={{ stroke: value > 0.7 ? '#ef4444' : value > 0.4 ? '#f59e0b' : color }}
          />
        </svg>

        {/* Center Percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold tracking-tighter">
            {Math.round(value * 100)}%
          </span>
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
          {name}
        </h3>
        <p className="text-[9px] font-mono text-gray-600 mt-1 uppercase">
            Division ID: {id}
        </p>
      </div>

      {/* Pulsing Status Dot */}
      <div className="absolute top-4 right-4">
        <div className={
            `w-1.5 h-1.5 rounded-full animate-pulse
            ${value > 0.7 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 
              value > 0.4 ? 'bg-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 
              'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]'}
            `
        } />
      </div>
    </motion.div>
  );
}

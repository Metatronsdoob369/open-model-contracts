'use client';
import React, { useState } from 'react';
import { Package, Download, Cloud, Zap, FileJson, PlayCircle } from 'lucide-react';
import axios from 'axios';

export const AssetBridge = ({ contractId, status }: { contractId: string, status: string }) => {
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<any>(null);

  const handleDeploy = async () => {
    if (!contractId || deploying) return;

    setDeploying(true);
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_HUB_URL || 'http://localhost:8080'}/v1/delivery/deploy/${contractId}`, {
        placeId: 'YOUR_PLACE_ID' // This would be dynamic in production
      });
      setDeployResult(data);
    } catch (err) {
      console.error('Deployment failed:', err);
    } finally {
      setDeploying(false);
    }
  };

  const handleDownload = () => {
    window.open(`${process.env.NEXT_PUBLIC_HUB_URL || 'http://localhost:8080'}/v1/delivery/download/${contractId}`, '_blank');
  };

  return (
    <div className="glass p-8 h-full flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
            <Package size={18} className="text-[#00e5ff]" />
            <h2 className="text-sm font-bold tracking-widest text-[#00e5ff] uppercase">Delivery Bridge</h2>
        </div>
        <div className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${status === 'ready' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-orange-500/20 text-orange-500 animate-pulse'}`}>
          {status === 'ready' ? 'Asset Package Ready' : 'Swarm Executing...'}
        </div>
      </div>

      <div className="flex flex-col gap-4">
         <button 
           onClick={handleDownload}
           disabled={status !== 'ready'}
           className="w-full flex items-center justify-between glass p-4 hover:bg-white/5 transition-all group disabled:opacity-50"
         >
            <div className="flex items-center gap-4">
               <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-all">
                  <Download size={20} className="text-blue-500" />
               </div>
               <div className="text-left">
                  <h3 className="text-sm font-bold text-gray-200">Local Download</h3>
                  <p className="text-[10px] text-gray-500 uppercase">ZIP Package // Standard Delivery</p>
               </div>
            </div>
            <PlayCircle size={16} className="text-gray-700 group-hover:text-blue-500" />
         </button>

         <button 
           onClick={handleDeploy}
           disabled={status !== 'ready' || deploying}
           className="relative w-full flex items-center justify-between glass p-4 overflow-hidden group disabled:opacity-50"
         >
            <div className="absolute inset-0 bg-blue-500/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            <div className="flex items-center gap-4 relative z-10">
               <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Cloud size={20} className="text-emerald-500" />
               </div>
               <div className="text-left">
                  <h3 className="text-sm font-bold text-emerald-500">Live Push</h3>
                  <p className="text-[10px] text-gray-500 uppercase font-mono">Roblox Open Cloud Deployment</p>
               </div>
            </div>
            {deploying ? (
               <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase animate-pulse">
                  Deploying...
               </div>
            ) : (
               <PlayCircle size={16} className="text-gray-700 group-hover:text-emerald-500 relative z-10" />
            )}
         </button>
      </div>

      {deployResult && (
         <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 font-mono text-center text-xs animate-in fade-in slide-in-from-bottom-2">
            DEPLOY SUCCESSFUL TO PLACE: {deployResult.placeId}
         </div>
      )}

      <div className="flex-1 border border-white/5 bg-black/40 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[10px] uppercase font-mono text-gray-600">
             <FileJson size={12} /> Contract Manifest
          </div>
          <div className="flex-1 font-mono text-[10px] text-gray-600 overflow-hidden line-clamp-12">
             {JSON.stringify({ 
                contractId, 
                agents: 5, 
                physics: 'ROBLOX_LUAU', 
                status 
             }, null, 2)}
          </div>
      </div>
    </div>
  );
};

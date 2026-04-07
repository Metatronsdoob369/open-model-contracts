'use client';
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PromptTerminal } from '@/components/PromptTerminal';
import { SwarmHUD } from '@/components/SwarmHUD';
import { AssetBridge } from '@/components/AssetBridge';
import { connectSocket, disconnectSocket } from '@/lib/socket';

export default function Dashboard() {
  const [activeRun, setActiveRun] = useState<any>(null);
  const [hubStatus, setHubStatus] = useState<string>('idle');

  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, []);

  const [recentContracts, setRecentContracts] = useState<string[]>([]);

  useEffect(() => {
    // Generate mock IDs strictly on the client to avoid hydration mismatch
    const mocks = [1, 2, 3].map(() => `CONTRACT_${Math.random().toString(36).substring(7).toUpperCase()}`);
    setRecentContracts(mocks);
  }, []);

  const handleResult = (data: any) => {
    setActiveRun(data);
    setHubStatus('generating');
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_HUB_URL || 'http://localhost:8080'}/v1/delivery/status/${data.contractId}`);
        const statusData = await response.json();
        if (statusData.status === 'ready') {
          setHubStatus('ready');
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Status check failed');
      }
    }, 2000);
  };

  return (
    <main className="min-h-screen pt-24 pb-12 px-8 overflow-hidden relative">
      <div className="scanline" />
      <Header />

      <div className="dashboard-container">
        {/* Main Content (Terminal + Results) */}
        <div className="flex flex-col gap-6">
          <PromptTerminal onResult={handleResult} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
             {activeRun ? (
                <>
                  <SwarmHUD runId={activeRun.runId} />
                  <AssetBridge contractId={activeRun.contractId} status={hubStatus} />
                </>
             ) : (
                <div className="glass col-span-2 flex flex-col items-center justify-center p-12 text-center opacity-30 gap-6 border-dashed border-2">
                   <div className="w-16 h-16 rounded-full border-4 border-t-[#00e5ff] animate-spin border-[#00e5ff]/10" />
                   <p className="text-xl font-light tracking-widest uppercase">System Standby // Awaiting Command</p>
                </div>
             )}
          </div>
        </div>

        {/* Sidebar Space (Optional Meta info) */}
        <aside className="flex flex-col gap-6">
           <div className="glass p-6 flex flex-col gap-4">
              <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Recent Global Contracts</h3>
              <div className="space-y-4 opacity-50">
                 {recentContracts.length === 0 ? (
                    <div className="text-[10px] text-gray-600 animate-pulse">Syncing with ledger...</div>
                 ) : recentContracts.map((id, i) => (
                   <div key={i} className="flex flex-col gap-1 border-l border-white/10 pl-3">
                      <span className="text-[10px] font-mono text-[#00e5ff]">{id}</span>
                      <span className="text-[9px] text-gray-600 uppercase">Status: Signed // Delaware Domicile</span>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="glass p-6 bg-gradient-to-br from-[#bf00ff]/10 to-transparent flex flex-col gap-3">
              <h3 className="text-xs font-bold tracking-widest text-[#bf00ff] uppercase">Developer Insights</h3>
              <p className="text-[11px] leading-relaxed text-gray-400">
                The current Swarm density is at 84%. Large models are recommended for complex physics simulations. 
                Use ARMED gates for high-risk economy contracts.
              </p>
           </div>
        </aside>
      </div>
    </main>
  );
}

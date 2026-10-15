import { Terminal as TerminalIcon, Sparkles, Send, Zap, PlayCircle } from 'lucide-react';
import axios from 'axios';
import { useState } from 'react';

interface PromptTerminalProps {
  onResult: (data: any) => void;
}

export const PromptTerminal = ({ onResult }: PromptTerminalProps) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('gpt-4-turbo-preview');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_HUB_URL || 'http://localhost:8080'}/v1/delivery/nl-to-game`, {
        prompt,
        options: {
          gate: 'SAFE',
          provider: 'openai',
          model,
        }
      });
      onResult(data);
    } catch (err) {
      console.error('Request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-8 relative overflow-hidden flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <TerminalIcon size={18} className="text-[#00e5ff]" />
          <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase">Input Terminal</h2>
        </div>
        <div className="flex items-center gap-4">
           <select 
            className="bg-black/40 border border-white/10 rounded px-3 py-1 text-xs text-[#00e5ff] font-mono outline-none"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
            <option value="claude-3-opus-20240229">Claude 3 Opus</option>
            <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
            <option value="gpt-3.5-turbo">GPT-3.5 (Fast)</option>
          </select>
        </div>
      </div>

      <textarea
        className="w-full h-48 bg-black/30 border border-white/5 rounded-xl p-6 text-lg font-light tracking-wide text-white focus:outline-none focus:border-[#00e5ff]/30 transition-all resize-none placeholder:text-gray-700"
        placeholder="Enter game idea... (e.g. 'Build a high-energy tag game with exploding confetti on tag')"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-[10px] uppercase font-mono text-gray-500">
            <span className="flex items-center gap-1"><Sparkles size={12} className="text-[#bf00ff]" /> Agentic Swarms Ready</span>
            <span className="opacity-20">|</span>
            <span>Gate: SAFE</span>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading || !prompt.trim()}
          className="btn-primary flex items-center gap-3 disabled:opacity-50"
        >
          {loading ? 'Processing Swarm...' : 'BUILD MY GAME'}
          <Send size={16} />
        </button>
      </div>

      <div className="absolute top-0 right-0 p-1 bg-[#bf00ff]/20 text-[#bf00ff] text-[8px] font-bold uppercase rotate-45 translate-x-3 translate-y-3 px-4">
        Beta 2.1
      </div>
    </div>
  );
};

import React from 'react';
import { X, Rocket, Cpu, Radio, Sparkles, BookOpen, Check } from 'lucide-react';
import { sound } from '../../utils/soundEngine';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl flex flex-col justify-between max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">How To Play</h2>
              <div className="text-xs font-mono text-cyan-400">QUICK COMMANDER GUIDE</div>
            </div>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Steps - Visual & Punchy */}
        <div className="my-4 overflow-y-auto pr-1 space-y-3 text-xs font-mono">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
              <span className="text-2xl">🛠️</span>
              <strong className="text-cyan-300 text-sm">1. BUILD</strong>
              <p className="text-slate-400">Assemble Bus, Solar Panels, Batteries & Science Sensors.</p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
              <span className="text-2xl">🚀</span>
              <strong className="text-amber-300 text-sm">2. LAUNCH</strong>
              <p className="text-slate-400">Select a rocket booster strong enough to lift your craft mass.</p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
              <span className="text-2xl">🪐</span>
              <strong className="text-purple-300 text-sm">3. EXPLORE</strong>
              <p className="text-slate-400">Fly in 3D, scan planets, and handle random space events.</p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
              <span className="text-2xl">📊</span>
              <strong className="text-emerald-300 text-sm">4. SCORE</strong>
              <p className="text-slate-400">Downlink science telemetry to earn Legendary Commander rank!</p>
            </div>
          </div>

          {/* 3 Golden Rules */}
          <div className="p-3.5 bg-cyan-950/30 rounded-2xl border border-cyan-500/30 space-y-1.5">
            <span className="text-[10px] text-cyan-400 font-bold block uppercase">3 GOLDEN RULES:</span>
            <div className="text-slate-200 space-y-1">
              <div>⚡ <strong>Power:</strong> Keep generation higher than draw (+W).</div>
              <div>🔋 <strong>Battery:</strong> Keep enough capacity for shadow eclipses.</div>
              <div>⚖️ <strong>Mass:</strong> Don't exceed your rocket's payload capacity.</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl font-mono text-xs transition-all cursor-pointer"
          >
            LET'S PLAY! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

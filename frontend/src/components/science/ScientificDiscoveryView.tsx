import React, { useState } from 'react';
import { ScientificDiscovery } from '../../types';
import { Sparkles, BarChart3, Image as ImageIcon, Compass, Beaker, CheckCircle2, Award } from 'lucide-react';
import { sound } from '../../utils/soundEngine';

interface ScientificDiscoveryViewProps {
  discoveries: ScientificDiscovery[];
  onContinue: () => void;
}

export const ScientificDiscoveryView: React.FC<ScientificDiscoveryViewProps> = ({
  discoveries,
  onContinue
}) => {
  const [selectedDiscovery, setSelectedDiscovery] = useState<ScientificDiscovery>(
    discoveries[0] || null
  );

  const getIcon = (type: ScientificDiscovery['dataType']) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5 text-cyan-400" />;
      case 'spectrum': return <BarChart3 className="w-5 h-5 text-amber-400" />;
      case 'magnetic': return <Compass className="w-5 h-5 text-purple-400" />;
      case 'soil': return <Beaker className="w-5 h-5 text-emerald-400" />;
      default: return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 border border-purple-500/40 rounded-xl text-purple-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Scientific Discoveries</h2>
            <div className="text-xs font-mono text-purple-400 font-bold uppercase">
              DOWNLINKED SENSOR TELEMETRY
            </div>
          </div>
        </div>

        <div className="px-4 py-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
          <Award className="w-4 h-4" />
          {discoveries.length} DISCOVERIES LOGGED
        </div>
      </div>

      {/* Discoveries Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {discoveries.map((disc) => (
          <div
            key={disc.id}
            onClick={() => { setSelectedDiscovery(disc); sound.playClick(); }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
              selectedDiscovery?.id === disc.id
                ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  {getIcon(disc.dataType)}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-slate-700 font-bold">
                  {disc.dataType.toUpperCase()}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono text-purple-300 block">{disc.instrumentName}</span>
                <h4 className="font-bold text-base text-white mt-0.5">{disc.title}</h4>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                {disc.headline}
              </p>

              {/* Graphical mini spectrum if available */}
              {disc.chartData && (
                <div className="h-16 flex items-end gap-1.5 pt-2 border-b border-l border-slate-800 px-2 pb-1 bg-slate-900/40 rounded">
                  {disc.chartData.map((pt, i) => {
                    const maxY = Math.max(...disc.chartData!.map(p => p.y));
                    const heightPct = Math.round((pt.y / maxY) * 85) + 15;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                        <div 
                          className="w-full bg-gradient-to-t from-purple-500 to-cyan-400 rounded-t"
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 font-mono text-xs">
              <span className="text-emerald-400 font-bold">+{disc.pointsYield} Science Points</span>
              <span className="text-cyan-400 text-[11px]">VERIFIED ✓</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Continue Button */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onContinue}
          className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-mono font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all transform hover:scale-102 active:scale-98"
        >
          <CheckCircle2 className="w-5 h-5" />
          VIEW MISSION SCORE & REPORT
        </button>
      </div>
    </div>
  );
};

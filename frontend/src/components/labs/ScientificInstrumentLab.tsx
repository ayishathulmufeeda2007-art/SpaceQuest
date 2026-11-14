import React from 'react';
import { ScientificInstrument, MissionDefinition } from '../../types';
import { INSTRUMENTS, getInstrumentCompatibility } from '../../data/instruments';
import { sound } from '../../utils/soundEngine';
import { 
  Camera, 
  Flame, 
  Rainbow, 
  Radio, 
  Compass, 
  Wind, 
  ShieldAlert, 
  Beaker, 
  Check, 
  Plus, 
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface ScientificInstrumentLabProps {
  mission: MissionDefinition;
  selectedInstruments: ScientificInstrument[];
  onToggleInstrument: (instrument: ScientificInstrument) => void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
}

export const ScientificInstrumentLab: React.FC<ScientificInstrumentLabProps> = ({
  mission,
  selectedInstruments,
  onToggleInstrument,
  onNextStep,
  onPrevStep
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Camera': return <Camera className="w-5 h-5 text-cyan-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-amber-400" />;
      case 'Rainbow': return <Rainbow className="w-5 h-5 text-purple-400" />;
      case 'Radio': return <Radio className="w-5 h-5 text-emerald-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-blue-400" />;
      case 'Wind': return <Wind className="w-5 h-5 text-teal-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'Beaker': return <Beaker className="w-5 h-5 text-lime-400" />;
      default: return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  const isSelected = (id: string) => {
    return selectedInstruments.some(i => i.id === id);
  };

  return (
    <div className="space-y-6">
      {/* Top Punchy Header */}
      <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 border border-purple-500/40 rounded-xl text-purple-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Scientific Sensors</h3>
            <p className="text-xs text-purple-300 font-mono">
              Target: <strong className="text-cyan-300">{mission.destination}</strong> • Equip compatible instruments to collect science!
            </p>
          </div>
        </div>

        <div className="px-4 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
          INSTALLED: <strong className="text-cyan-400 text-sm">{selectedInstruments.length} SENSORS</strong>
        </div>
      </div>

      {/* Instruments Grid - Compact & Game-like */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {INSTRUMENTS.map((inst) => {
          const selected = isSelected(inst.id);
          const compatibility = getInstrumentCompatibility(inst, mission.targetPlanet, mission.requiredInstrumentIds);

          let compatBadge = (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              ✓ COMPATIBLE
            </span>
          );
          if (compatibility === 'PARTIALLY USEFUL') {
            compatBadge = (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                ~ PARTIAL
              </span>
            );
          } else if (compatibility === 'NOT SUITABLE') {
            compatBadge = (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
                ✕ UNSUITED
              </span>
            );
          }

          return (
            <div
              key={inst.id}
              onClick={() => { onToggleInstrument(inst); sound.playSwitch(); }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                selected
                  ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    {getIcon(inst.visualIcon)}
                  </div>
                  {compatBadge}
                </div>

                <h4 className="font-bold text-sm text-white line-clamp-1">{inst.name}</h4>
                <div className="text-[11px] font-mono text-purple-300">{inst.wavelength}</div>

                {/* Key Quick Stat Pills */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-300 pt-1">
                  <span className="bg-slate-950 p-1 rounded border border-slate-800">⚡ -{inst.powerDrawW}W</span>
                  <span className="bg-slate-950 p-1 rounded border border-slate-800">⚖️ {inst.massKg} kg</span>
                  <span className="bg-slate-950 p-1 rounded border border-slate-800 text-emerald-400">💰 ${inst.costM}M</span>
                  <span className="bg-slate-950 p-1 rounded border border-slate-800 text-cyan-400">📊 +{inst.scienceValue} pts</span>
                </div>
              </div>

              {/* Toggle Button */}
              <button
                className={`w-full py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                  selected
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {selected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {selected ? 'INSTALLED' : 'EQUIP SENSOR'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Step Navigation Bar */}
      <div className="flex items-center justify-between pt-2">
        {onPrevStep && (
          <button
            onClick={() => { sound.playClick(); onPrevStep(); }}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-mono text-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO SPACECRAFT</span>
          </button>
        )}

        {onNextStep && (
          <button
            onClick={() => { sound.playClick(); onNextStep(); }}
            className="ml-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer transition-all transform hover:scale-102"
          >
            <span>NEXT: CHOOSE ROCKET & ORBIT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

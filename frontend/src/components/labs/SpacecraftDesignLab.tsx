import React, { useState } from 'react';
import { SpacecraftComponent, ScientificInstrument, ResourceMetrics } from '../../types';
import { BUS_PLATFORMS, COMPONENTS } from '../../data/components';
import { SpacecraftViewer3D } from '../3d/SpacecraftViewer3D';
import { sound } from '../../utils/soundEngine';
import { 
  Box, 
  Sun, 
  Battery, 
  Flame, 
  Radio, 
  Compass, 
  Cpu, 
  Thermometer, 
  Check, 
  Plus,
  ArrowRight,
  Info
} from 'lucide-react';

interface SpacecraftDesignLabProps {
  selectedBus: SpacecraftComponent;
  selectedComponents: SpacecraftComponent[];
  selectedInstruments: ScientificInstrument[];
  metrics: ResourceMetrics;
  onSelectBus: (bus: SpacecraftComponent) => void;
  onToggleComponent: (component: SpacecraftComponent) => void;
  onNextStep?: () => void;
}

export const SpacecraftDesignLab: React.FC<SpacecraftDesignLabProps> = ({
  selectedBus,
  selectedComponents,
  selectedInstruments,
  metrics,
  onSelectBus,
  onToggleComponent,
  onNextStep
}) => {
  const [activeCategory, setActiveCategory] = useState<
    'bus' | 'power_generation' | 'battery' | 'propulsion' | 'communications' | 'adcs' | 'computer' | 'thermal'
  >('bus');

  const categories = [
    { key: 'bus', label: 'BUS', icon: Box },
    { key: 'power_generation', label: 'SOLAR', icon: Sun },
    { key: 'battery', label: 'BATTERY', icon: Battery },
    { key: 'propulsion', label: 'ENGINE', icon: Flame },
    { key: 'communications', label: 'COMMS', icon: Radio },
    { key: 'adcs', label: 'ADCS', icon: Compass },
    { key: 'computer', label: 'CPU', icon: Cpu },
    { key: 'thermal', label: 'SHIELD', icon: Thermometer }
  ];

  const isComponentSelected = (id: string) => {
    return selectedComponents.some(c => c.id === id);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 3D Spacecraft CAD Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <SpacecraftViewer3D
            bus={selectedBus}
            components={selectedComponents}
            instruments={selectedInstruments}
          />

          {/* Quick Subsystem Spec Summary */}
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">DRY MASS</span>
              <span className="text-cyan-400 font-bold text-sm">{metrics.totalMassKg} kg</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">NET POWER</span>
              <span className={`font-bold text-sm ${metrics.netPowerW >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metrics.netPowerW > 0 ? `+${metrics.netPowerW}W` : `${metrics.netPowerW}W`}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-slate-400 block text-[10px]">RELIABILITY</span>
              <span className="text-purple-400 font-bold text-sm">{metrics.systemReliabilityPct}%</span>
            </div>
          </div>
        </div>

        {/* Right Component Selector Drawer (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
          
          {/* Category Pill Switcher */}
          <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-800">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => { setActiveCategory(cat.key as unknown as typeof activeCategory); sound.playClick(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-sm' 
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Clean, Compact Cards List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {activeCategory === 'bus' ? (
              /* Bus Selection */
              BUS_PLATFORMS.map((bus) => {
                const isSelected = selectedBus && selectedBus.id === bus.id;
                return (
                  <div
                    key={bus.id}
                    onClick={() => { onSelectBus(bus); sound.playSwitch(); }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected 
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]' 
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{bus.name}</span>
                      {isSelected ? (
                        <span className="px-2 py-0.5 bg-cyan-400 text-slate-950 rounded-full text-[10px] font-bold font-mono">
                          SELECTED
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs font-mono">CHOOSE</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                      <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800">
                        ⚖️ {bus.massKg} kg
                      </span>
                      <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800 text-emerald-400">
                        💰 ${bus.costM}M
                      </span>
                      <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800 text-purple-400">
                        🛡️ {Math.round(bus.reliability * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Subsystem Components */
              COMPONENTS.filter(c => c.subsystem === activeCategory).map((comp) => {
                const isSelected = isComponentSelected(comp.id);
                return (
                  <div
                    key={comp.id}
                    onClick={() => { onToggleComponent(comp); sound.playSwitch(); }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]' 
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-white block">{comp.name}</span>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                        <span>⚖️ {comp.massKg} kg</span>
                        <span className={comp.powerDrawW >= 0 ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
                          ⚡ {comp.powerDrawW >= 0 ? `+${comp.powerDrawW}W` : `${comp.powerDrawW}W`}
                        </span>
                        <span className="text-emerald-400">💰 ${comp.costM}M</span>
                      </div>
                    </div>

                    <button
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isSelected 
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' 
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Tip */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Click tabs above (Solar, Battery, Engine) to attach parts to your 3D craft!</span>
          </div>
        </div>
      </div>

      {/* Bottom Step Flow Button */}
      {onNextStep && (
        <div className="flex justify-end pt-2">
          <button
            onClick={() => { sound.playClick(); onNextStep(); }}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 flex items-center gap-2 cursor-pointer transition-all transform hover:scale-102"
          >
            <span>NEXT: EQUIP SCIENTIFIC SENSORS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { LaunchVehicle, OrbitDefinition, MissionDefinition, ResourceMetrics } from '../../types';
import { ROCKETS, checkRocketCapacity } from '../../data/rockets';
import { ORBITS } from '../../data/orbits';
import { sound } from '../../utils/soundEngine';
import { Rocket, Orbit, AlertTriangle, Check, Compass, Clock, Wifi, ArrowRight, ArrowLeft } from 'lucide-react';

interface RocketOrbitLabProps {
  mission: MissionDefinition;
  metrics: ResourceMetrics;
  selectedRocket: LaunchVehicle | null;
  selectedOrbit: OrbitDefinition | null;
  onSelectRocket: (rocket: LaunchVehicle) => void;
  onSelectOrbit: (orbit: OrbitDefinition) => void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
}

export const RocketOrbitLab: React.FC<RocketOrbitLabProps> = ({
  mission,
  metrics,
  selectedRocket,
  selectedOrbit,
  onSelectRocket,
  onSelectOrbit,
  onNextStep,
  onPrevStep
}) => {
  return (
    <div className="space-y-6">
      {/* SECTION 1: ROCKET LAUNCH VEHICLE SELECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Rocket className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Select Rocket Launcher</h3>
          </div>
          <span className="text-xs font-mono text-cyan-300">
            {selectedRocket ? `SELECTED: ${selectedRocket.name}` : '⚠️ PLEASE SELECT A ROCKET'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROCKETS.map((rocket) => {
            const isSelected = selectedRocket && selectedRocket.id === rocket.id;
            const capacityCheck = checkRocketCapacity(rocket, metrics.totalMassKg);

            return (
              <div
                key={rocket.id}
                onClick={() => { onSelectRocket(rocket); sound.playSwitch(); }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 font-bold">
                      {rocket.category}
                    </span>
                    {isSelected && (
                      <span className="p-1 bg-cyan-400 text-slate-950 rounded-full">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-base text-white">{rocket.name}</h4>

                  {/* Clean Visual Specs */}
                  <div className="space-y-1.5 text-xs font-mono text-slate-300 pt-1">
                    <div className="flex justify-between bg-slate-950 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400">Capacity:</span>
                      <strong className="text-white">{rocket.payloadCapacityKg.toLocaleString()} kg</strong>
                    </div>
                    <div className="flex justify-between bg-slate-950 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400">Cost:</span>
                      <strong className="text-emerald-400">${rocket.costM}M</strong>
                    </div>
                    <div className="flex justify-between bg-slate-950 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400">Reliability:</span>
                      <strong className="text-purple-400">{Math.round(rocket.reliability * 100)}%</strong>
                    </div>
                  </div>
                </div>

                {/* Overweight or Safe Indicator */}
                {!capacityCheck.compatible ? (
                  <div className="p-2 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Overweight by {Math.abs(capacityCheck.marginKg)} kg!</span>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>+{capacityCheck.marginKg.toLocaleString()} kg margin</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: ORBIT & TRAJECTORY */}
      <div className="space-y-3 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Orbit className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Select Orbit Trajectory</h3>
          </div>
          <span className="text-xs font-mono text-purple-300">
            {selectedOrbit ? `SELECTED: ${selectedOrbit.code}` : '⚠️ PLEASE SELECT AN ORBIT'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ORBITS.map((orbit) => {
            const isSelected = selectedOrbit && selectedOrbit.id === orbit.id;
            const isCompatible = orbit.compatibleDestinations.includes(mission.targetPlanet);

            return (
              <div
                key={orbit.id}
                onClick={() => { onSelectOrbit(orbit); sound.playSwitch(); }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-slate-700 font-bold">
                      {orbit.code}
                    </span>
                    {isSelected && (
                      <span className="p-1 bg-purple-400 text-slate-950 rounded-full">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-base text-white">{orbit.name}</h4>

                  <div className="grid grid-cols-2 gap-1.5 text-xs font-mono text-slate-300 pt-1">
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{orbit.periodMinutes > 0 ? `${orbit.periodMinutes}m` : 'Escape'}</span>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800 flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-amber-400" />
                      <span>Lag: {orbit.commsLatencySec < 1 ? '<1s' : `${orbit.commsLatencySec}s`}</span>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800 col-span-2 flex items-center gap-1">
                      <Compass className="w-3 h-3 text-purple-400" />
                      <span>Delta-V: {orbit.deltaVRequiredKms} km/s</span>
                    </div>
                  </div>
                </div>

                {isCompatible ? (
                  <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Matched to {mission.targetPlanet}</span>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-amber-400">
                    Target: {orbit.compatibleDestinations.join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Navigation Bar */}
      <div className="flex items-center justify-between pt-2">
        {onPrevStep && (
          <button
            onClick={() => { sound.playClick(); onPrevStep(); }}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-mono text-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO SENSORS</span>
          </button>
        )}

        {onNextStep && (
          <button
            onClick={() => { sound.playClick(); onNextStep(); }}
            className="ml-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all transform hover:scale-102"
          >
            <span>NEXT: FLIGHT READINESS CHECKLIST</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

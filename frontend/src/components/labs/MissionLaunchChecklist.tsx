import React from 'react';
import { MissionDefinition, ResourceMetrics, LaunchVehicle, OrbitDefinition } from '../../types';
import { sound } from '../../utils/soundEngine';
import { CheckCircle2, XCircle, Rocket, ShieldCheck, ArrowLeft } from 'lucide-react';

interface MissionLaunchChecklistProps {
  mission: MissionDefinition;
  metrics: ResourceMetrics;
  rocket: LaunchVehicle | null;
  orbit: OrbitDefinition | null;
  onProceedToLaunch: () => void;
  onPrevStep?: () => void;
}

export const MissionLaunchChecklist: React.FC<MissionLaunchChecklistProps> = ({
  mission,
  metrics,
  rocket,
  orbit,
  onProceedToLaunch,
  onPrevStep
}) => {
  const isRocketSelected = rocket !== null;
  const isOrbitSelected = orbit !== null;

  const checks = [
    {
      title: 'Launch Vehicle Selected',
      status: isRocketSelected,
      detail: rocket ? `${rocket.name} (${rocket.payloadCapacityKg.toLocaleString()} kg capacity)` : 'NO ROCKET SELECTED — Select in Rocket Lab'
    },
    {
      title: 'Payload Mass vs Booster Capacity',
      status: isRocketSelected && metrics.isMassValid,
      detail: rocket ? `${metrics.totalMassKg} kg / ${rocket.payloadCapacityKg} kg (${metrics.massMarginPct}% margin)` : 'Awaiting rocket selection'
    },
    {
      title: 'Electrical Power Generation & Battery',
      status: metrics.isPowerValid,
      detail: metrics.powerGenerationW > 0 
        ? `+${metrics.powerGenerationW}W Gen / -${metrics.powerConsumptionW}W Draw (${metrics.eclipseReserveHours}h battery)`
        : 'POWER ZERO: Equip Solar Panels or RTG in Spacecraft Lab'
    },
    {
      title: 'Required Scientific Sensors Equipped',
      status: metrics.isPayloadCompatible,
      detail: metrics.isPayloadCompatible 
        ? 'Compatible science sensors installed' 
        : `Mission requires: ${mission.requiredInstrumentIds.join(', ')}`
    },
    {
      title: 'Mission Budget Appropriation',
      status: metrics.isBudgetValid,
      detail: `$${metrics.totalCostM}M / $${mission.budgetLimit}M (${metrics.budgetReservePct}% reserve)`
    },
    {
      title: 'Orbit Trajectory Selected',
      status: isOrbitSelected && metrics.isOrbitCompatible,
      detail: orbit 
        ? `${orbit.name} (${orbit.deltaVRequiredKms} km/s)` 
        : 'NO ORBIT SELECTED — Select in Rocket & Orbit Lab'
    }
  ];

  const allPassed = checks.every(c => c.status);

  return (
    <div className="max-w-2xl mx-auto bg-slate-900/90 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Pre-Flight Readiness</h2>
            <div className="text-xs font-mono text-cyan-400">NASA CML-4 LAUNCH CLEARANCE</div>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
          allPassed 
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
        }`}>
          {allPassed ? '✓ ALL SYSTEMS GO' : '✕ HOLD FOR REVIEW'}
        </div>
      </div>

      {/* Checklist items - Quick & Clean */}
      <div className="space-y-2">
        {checks.map((check, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
              check.status
                ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                : 'bg-rose-950/30 border-rose-500/40 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {check.status ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div>
                <span className="font-bold text-sm text-white block">{check.title}</span>
                <span className="text-xs font-mono text-slate-400">{check.detail}</span>
              </div>
            </div>

            <span className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold ${
              check.status ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
            }`}>
              {check.status ? 'GO' : 'NO-GO'}
            </span>
          </div>
        ))}
      </div>

      {/* Big Launch Trigger Button & Back */}
      <div className="pt-2 flex items-center justify-between gap-3">
        {onPrevStep && (
          <button
            onClick={() => { sound.playClick(); onPrevStep(); }}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-mono text-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO ROCKET & ORBIT</span>
          </button>
        )}

        <button
          onClick={() => {
            sound.playSwitch();
            onProceedToLaunch();
          }}
          disabled={!allPassed}
          className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:pointer-events-none text-white font-mono font-black text-base rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 cursor-pointer transition-all transform hover:scale-102 active:scale-98"
        >
          <Rocket className="w-6 h-6" />
          COMMENCE LIFTOFF COUNTDOWN
        </button>
      </div>
    </div>
  );
};

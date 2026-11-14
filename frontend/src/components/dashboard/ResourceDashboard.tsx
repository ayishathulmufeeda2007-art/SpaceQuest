import React, { useState } from 'react';
import { ResourceMetrics } from '../../types';
import { 
  Scale, 
  Zap, 
  DollarSign, 
  Radio, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Info
} from 'lucide-react';

interface ResourceDashboardProps {
  metrics: ResourceMetrics;
  onOpenDetails?: () => void;
}

export const ResourceDashboard: React.FC<ResourceDashboardProps> = ({ metrics }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Status helper (Green: normal, Yellow: warning, Red: critical)
  const getMassStatus = () => {
    if (metrics.massMarginPct < 0) return { color: 'text-rose-400', border: 'border-rose-500/50', bg: 'bg-rose-500/10', label: 'CRITICAL OVERWEIGHT' };
    if (!metrics.isRocketCompatible) return { color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-500/10', label: 'AWAITING ROCKET' };
    if (metrics.massMarginPct < 10) return { color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-500/10', label: 'TIGHT MARGIN' };
    return { color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-500/10', label: 'OPTIMAL MARGIN' };
  };

  const getPowerStatus = () => {
    if (metrics.powerGenerationW === 0) return { color: 'text-rose-400', border: 'border-rose-500/50', bg: 'bg-rose-500/10', label: 'NO POWER SOURCE' };
    if (metrics.netPowerW < 0 || metrics.eclipseReserveHours < 0.8) return { color: 'text-rose-400', border: 'border-rose-500/50', bg: 'bg-rose-500/10', label: 'DEFICIT / BROWNOUT' };
    if (metrics.powerMarginPct < 15) return { color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-500/10', label: 'MODERATE RESERVE' };
    return { color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-500/10', label: 'SURPLUS POWER' };
  };

  const getBudgetStatus = () => {
    if (metrics.budgetReservePct < 0) return { color: 'text-rose-400', border: 'border-rose-500/50', bg: 'bg-rose-500/10', label: 'OVER BUDGET' };
    if (metrics.budgetReservePct < 10) return { color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-500/10', label: 'NEAR CAP' };
    return { color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-500/10', label: 'WITHIN BUDGET' };
  };

  const massStatus = getMassStatus();
  const powerStatus = getPowerStatus();
  const budgetStatus = getBudgetStatus();

  return (
    <div className="sticky top-0 z-30 w-full bg-slate-900/95 backdrop-blur-xl border-b border-cyan-500/30 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* 1. Mass Resource Meter */}
          <div className={`flex-1 p-2 rounded-xl border ${massStatus.border} ${massStatus.bg} transition-all`}>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                MASS
              </span>
              <span className={`font-bold ${massStatus.color}`}>{metrics.totalMassKg} / {metrics.massLimitKg} kg</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${metrics.massMarginPct < 0 ? 'bg-rose-500' : 'bg-cyan-400'}`}
                style={{ width: `${Math.min(100, (metrics.totalMassKg / Math.max(1, metrics.massLimitKg)) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono mt-1">
              <span className="text-slate-400">{massStatus.label}</span>
              <span className={massStatus.color}>{metrics.massMarginPct}% MARGIN</span>
            </div>
          </div>

          {/* 2. Power Resource Meter */}
          <div className={`flex-1 p-2 rounded-xl border ${powerStatus.border} ${powerStatus.bg} transition-all`}>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                POWER (GEN / DRAW)
              </span>
              <span className={`font-bold ${powerStatus.color}`}>+{metrics.powerGenerationW}W / -{metrics.powerConsumptionW}W</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${metrics.netPowerW < 0 ? 'bg-rose-500' : 'bg-amber-400'}`}
                style={{ width: `${metrics.powerGenerationW > 0 ? Math.min(100, (metrics.powerConsumptionW / metrics.powerGenerationW) * 100) : 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono mt-1">
              <span className="text-slate-400">NET: {metrics.netPowerW > 0 ? `+${metrics.netPowerW}W` : `${metrics.netPowerW}W`}</span>
              <span className={powerStatus.color}>{metrics.eclipseReserveHours}h BATTERY</span>
            </div>
          </div>

          {/* 3. Budget Resource Meter */}
          <div className={`flex-1 p-2 rounded-xl border ${budgetStatus.border} ${budgetStatus.bg} transition-all`}>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="flex items-center gap-1.5 text-slate-300">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                BUDGET
              </span>
              <span className={`font-bold ${budgetStatus.color}`}>${metrics.totalCostM}M / ${metrics.budgetLimitM}M</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${metrics.budgetReservePct < 0 ? 'bg-rose-500' : 'bg-emerald-400'}`}
                style={{ width: `${Math.min(100, (metrics.totalCostM / metrics.budgetLimitM) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono mt-1">
              <span className="text-slate-400">{budgetStatus.label}</span>
              <span className={budgetStatus.color}>{metrics.budgetReservePct}% RESERVE</span>
            </div>
          </div>

          {/* Expand Details Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center transition-all cursor-pointer"
            title="Toggle Detailed Engineering Subsystem Margins"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>

        {/* Expanded Engineering Insights Drawer */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono animate-fadeIn">
            {/* Comms & Data */}
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-cyan-300 font-semibold mb-1">
                <Radio className="w-3.5 h-3.5" />
                GROUND LINK
              </div>
              <div className="text-slate-300">Bandwidth: <span className="text-white font-bold">{metrics.downlinkSpeedMbps} Mbps</span></div>
              <div className="text-slate-300">SSR Flash: <span className="text-white font-bold">{metrics.storageCapacityGB} GB</span></div>
              <div className="text-[11px] text-cyan-400/80 mt-1">“Better antenna = More data reaches Earth!”</div>
            </div>

            {/* Reliability */}
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                SYSTEM RELIABILITY
              </div>
              <div className="text-slate-300">Reliability Score: <span className="text-white font-bold">{metrics.systemReliabilityPct}%</span></div>
              <div className="text-slate-300">Delta-V Avail: <span className="text-white font-bold">{metrics.deltaVAvailableMs} m/s</span></div>
              <div className="text-[11px] text-purple-400/80 mt-1">“Redundant avionics prevent in-flight anomalies.”</div>
            </div>

            {/* Engineering Trade-off Tip */}
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 col-span-1 md:col-span-2 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-amber-300 font-bold">NASA Mission Design Lab (MDL) Principle:</span>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  Every decision impacts the entire spacecraft. Adding heavier science sensors increases dry mass, demands larger batteries and solar arrays, and might force an upgrade to a heavier rocket.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

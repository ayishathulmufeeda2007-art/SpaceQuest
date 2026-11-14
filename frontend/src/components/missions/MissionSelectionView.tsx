import React from 'react';
import { MissionDefinition, GameMode } from '../../types';
import { MISSIONS } from '../../data/missions';
import { sound } from '../../utils/soundEngine';
import { 
  Globe2, 
  Play, 
  ArrowLeft,
  Sparkles,
  Target
} from 'lucide-react';

interface MissionSelectionViewProps {
  gameMode: GameMode;
  onSelectMission: (mission: MissionDefinition) => void;
  onBackToHome: () => void;
}

export const MissionSelectionView: React.FC<MissionSelectionViewProps> = ({
  gameMode,
  onSelectMission,
  onBackToHome
}) => {
  const getDifficultyBadge = (diff: MissionDefinition['difficulty']) => {
    switch (diff) {
      case 'Easy':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">★ EASY</span>;
      case 'Medium':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">★★ MEDIUM</span>;
      case 'Hard':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold">★★★ HARD</span>;
    }
  };

  const getPlanetEmoji = (planet: string) => {
    switch (planet) {
      case 'Moon': return '🌕';
      case 'Mars': return '🔴';
      case 'Earth': return '🌍';
      case 'DeepSpace': return '🌌';
      case 'Exoplanet': return '🪐';
      default: return '🚀';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { sound.playClick(); onBackToHome(); }}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              CHOOSE YOUR DESTINATION
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">Select Mission</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-mono font-bold uppercase">
            {gameMode} MODE
          </span>
        </div>
      </div>

      {/* 5 Visual Mission Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MISSIONS.map((mission) => {
          return (
            <div
              key={mission.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-cyan-400 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between gap-5 group hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Header with Emoji & Difficulty */}
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{getPlanetEmoji(mission.targetPlanet)}</span>
                  {getDifficultyBadge(mission.difficulty)}
                </div>

                {/* Title & Destination */}
                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
                    {mission.name}
                  </h3>
                  <div className="text-xs text-cyan-400 font-mono mt-0.5 flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5" />
                    {mission.destination}
                  </div>
                </div>

                {/* Punchy Goal Pill */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                  <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">{mission.scientificObjective}</span>
                </div>

                {/* Key Stats Bar */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1 border-t border-slate-800">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">BUDGET</span>
                    <strong className="text-emerald-400 font-bold">${mission.budgetLimit}M</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">MASS CAP</span>
                    <strong className="text-white font-bold">{mission.massLimit} kg</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">CRUISE</span>
                    <strong className="text-purple-400 font-bold">{mission.nominalDurationDays}d</strong>
                  </div>
                </div>
              </div>

              {/* Instant Start Button */}
              <button
                onClick={() => {
                  sound.playSwitch();
                  onSelectMission(mission);
                }}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                START MISSION
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

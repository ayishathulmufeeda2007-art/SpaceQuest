import React, { useEffect, useState } from 'react';
import { 
  MissionDefinition, 
  ResourceMetrics, 
  MissionScoreResult, 
  SpacecraftComponent, 
  LaunchVehicle, 
  OrbitDefinition,
  GameMode
} from '../../types';
import { 
  Trophy, 
  RotateCcw, 
  Edit3, 
  PlusCircle, 
  Printer, 
  Award, 
  CheckCircle2,
  Sparkles,
  BarChart2,
  Send,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/soundEngine';

interface MissionReportViewProps {
  mission: MissionDefinition;
  metrics: ResourceMetrics;
  scoreResult: MissionScoreResult;
  selectedBus: SpacecraftComponent;
  selectedRocket: LaunchVehicle;
  selectedOrbit: OrbitDefinition;
  onRetry: () => void;
  onRedesign: () => void;
  onNewMission: () => void;
  onSaveToLeaderboard?: (playerName: string) => void;
  onOpenLeaderboard?: () => void;
  gameMode?: GameMode;
}

export const MissionReportView: React.FC<MissionReportViewProps> = ({
  mission,
  metrics,
  scoreResult,
  selectedBus,
  selectedRocket,
  selectedOrbit,
  onRetry,
  onRedesign,
  onNewMission,
  onSaveToLeaderboard,
  onOpenLeaderboard,
  gameMode = 'solo'
}) => {
  const [playerName, setPlayerName] = useState<string>(
    gameMode === 'team' ? 'Mission Team Alpha' : 'Commander Pilot'
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (scoreResult.totalScore >= 75) {
      sound.playVictoryFanfare();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } else if (scoreResult.totalScore >= 30) {
      sound.playVictoryFanfare();
    } else {
      sound.playFailureSound();
    }

    // Auto-record an initial entry if not saved yet
    if (onSaveToLeaderboard && !isSaved) {
      onSaveToLeaderboard(playerName);
      setIsSaved(true);
    }
  }, [scoreResult]);

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    if (onSaveToLeaderboard) {
      onSaveToLeaderboard(playerName.trim());
      setIsSaved(true);
      sound.playTelemetryPing();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 }
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:m-0 print:p-0 print:max-w-full">
      {/* Top Banner: Score & Rank */}
      <div 
        className="rounded-3xl p-8 border text-center shadow-2xl relative overflow-hidden"
        style={{
          backgroundColor: '#090d16',
          borderColor: scoreResult.ratingColor
        }}
      >
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-1"
            style={{ backgroundColor: `${scoreResult.ratingColor}25`, color: scoreResult.ratingColor }}
          >
            <Trophy className="w-9 h-9" />
          </div>

          <span className="text-xs font-mono tracking-widest uppercase text-slate-400">
            FINAL MISSION EVALUATION
          </span>

          <h1 
            className="text-4xl sm:text-5xl font-black font-mono tracking-tight"
            style={{ color: scoreResult.ratingColor }}
          >
            {scoreResult.ratingTitle}
          </h1>

          <div className="flex items-baseline gap-2 font-mono mt-1">
            <span className="text-6xl font-black text-white">{scoreResult.totalScore}</span>
            <span className="text-2xl text-slate-400 font-bold">/ 100 PTS</span>
          </div>

          <div className="text-sm font-mono text-cyan-300 mt-1">
            {mission.name} • {mission.destination}
          </div>
        </div>
      </div>

      {/* LEADERBOARD REGISTRATION & SCOREBOARD SUBMISSION CARD */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-cyan-500/15 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span>HALL OF FAME SCOREBOARD</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                LEADERBOARD ACTIVE ✓
              </span>
            </div>
            <h3 className="text-xl font-black text-white mt-0.5">
              {isSaved ? 'Your Score is Saved to the Leaderboard!' : 'Submit Score to Commander Leaderboard'}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Score: <strong className="text-amber-400">{scoreResult.totalScore} pts</strong> • Callsign: <strong className="text-cyan-300">{playerName}</strong>
            </p>
          </div>
        </div>

        {/* Update Name & Open Leaderboard Actions */}
        <form onSubmit={handleManualSave} className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2.5">
          <div className="w-full sm:w-auto relative">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter Callsign / Name"
              maxLength={24}
              className="w-full sm:w-56 px-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white font-mono text-sm placeholder:text-slate-600 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black font-mono text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all transform hover:scale-105 active:scale-95 shrink-0"
            title="Update player name on leaderboard"
          >
            <Send className="w-3.5 h-3.5" />
            UPDATE NAME
          </button>

          {onOpenLeaderboard && (
            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black font-mono text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all transform hover:scale-105 active:scale-95 shrink-0"
            >
              <BarChart2 className="w-4 h-4" />
              VIEW LEADERBOARD
            </button>
          )}
        </form>
      </div>

      {/* 5 Scoring Bars */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4" />
          PERFORMANCE BREAKDOWN
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Science */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">SCIENCE</span>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
              {scoreResult.breakdown.scienceAchievement} <span className="text-xs text-slate-500">/ 35</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-cyan-400"
                style={{ width: `${(scoreResult.breakdown.scienceAchievement / 35) * 100}%` }}
              />
            </div>
          </div>

          {/* Survival */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">SURVIVAL</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
              {scoreResult.breakdown.spacecraftSurvival} <span className="text-xs text-slate-500">/ 20</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-emerald-400"
                style={{ width: `${(scoreResult.breakdown.spacecraftSurvival / 20) * 100}%` }}
              />
            </div>
          </div>

          {/* Engineering */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">ENGINEERING</span>
            <div className="text-xl font-bold font-mono text-purple-400 mt-0.5">
              {scoreResult.breakdown.engineeringDesign} <span className="text-xs text-slate-500">/ 15</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-purple-400"
                style={{ width: `${(scoreResult.breakdown.engineeringDesign / 15) * 100}%` }}
              />
            </div>
          </div>

          {/* Comms */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block">COMMS</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
              {scoreResult.breakdown.communicationSuccess} <span className="text-xs text-slate-500">/ 15</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-amber-400"
                style={{ width: `${(scoreResult.breakdown.communicationSuccess / 15) * 100}%` }}
              />
            </div>
          </div>

          {/* Budget */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 col-span-2 md:col-span-1">
            <span className="text-[10px] font-mono text-slate-400 block">BUDGET</span>
            <div className="text-xl font-bold font-mono text-teal-400 mt-0.5">
              {scoreResult.breakdown.budgetManagement} <span className="text-xs text-slate-500">/ 15</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-teal-400"
                style={{ width: `${(scoreResult.breakdown.budgetManagement / 15) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Specs Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <h3 className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
          FINAL FLIGHT SPECIFICATIONS
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">BUS FORM</span>
            <strong className="text-white text-sm">{selectedBus.name}</strong>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">LAUNCHER</span>
            <strong className="text-white text-sm">{selectedRocket.name}</strong>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">TRAJECTORY</span>
            <strong className="text-white text-sm">{selectedOrbit.code}</strong>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">DRY MASS</span>
            <strong className="text-cyan-400 text-sm">{metrics.totalMassKg} kg</strong>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">POWER GEN</span>
            <strong className="text-amber-400 text-sm">+{metrics.powerGenerationW}W</strong>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">BATTERY</span>
            <strong className="text-amber-400 text-sm">{metrics.eclipseReserveHours}h reserve</strong>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">COST</span>
            <strong className="text-emerald-400 text-sm">${metrics.totalCostM}M</strong>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">RELIABILITY</span>
            <strong className="text-purple-400 text-sm">{metrics.systemReliabilityPct}%</strong>
          </div>
        </div>

        {/* Unlocked Achievements */}
        {scoreResult.achievements.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-2">
            {scoreResult.achievements.map((ach, idx) => (
              <span key={idx} className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-mono text-amber-300 flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {ach}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            PRINT REPORT
          </button>

          {onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-xs font-bold rounded-xl border border-amber-500/40 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              LEADERBOARD
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRedesign}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold rounded-xl border border-cyan-500/40 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Edit3 className="w-4 h-4" />
            TWEAK DESIGN
          </button>

          <button
            onClick={onRetry}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-xs font-bold rounded-xl border border-amber-500/40 flex items-center gap-2 cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            REPLAY
          </button>

          <button
            onClick={onNewMission}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            NEW MISSION
          </button>
        </div>
      </div>
    </div>
  );
};

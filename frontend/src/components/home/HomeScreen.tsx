import React, { useState } from 'react';
import { SpaceBackgroundCanvas } from '../3d/SpaceBackgroundCanvas';
import { GameMode } from '../../types';
import { sound } from '../../utils/soundEngine';
import { 
  Play, 
  BookOpen, 
  Globe2, 
  Trophy, 
  Settings, 
  Volume2, 
  VolumeX, 
  User, 
  Users, 
  Box, 
  Sparkles,
  Rocket,
  Zap
} from 'lucide-react';

interface HomeScreenProps {
  onStartGame: (mode: GameMode) => void;
  onOpenHowToPlay: () => void;
  onOpenMissions: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  onOpenHowToPlay,
  onOpenMissions,
  onOpenLeaderboard,
  onOpenSettings
}) => {
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const handleMuteToggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  const handlePlayClick = () => {
    sound.startAmbientSpaceMusic();
    sound.playSwitch();
    setShowModeSelect(true);
  };

  const handleSelectMode = (mode: GameMode) => {
    sound.playSwitch();
    onStartGame(mode);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between p-6 md:p-12 select-none">
      {/* 3D Realistic Interactive Solar Background */}
      <SpaceBackgroundCanvas interactive={true} />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/20 backdrop-blur-md border border-cyan-500/40 rounded-xl text-cyan-400">
            <Rocket className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-sm font-black font-mono tracking-wider text-white">SPACE QUEST</span>
            <span className="text-[10px] font-mono text-cyan-400 block">NASA MISSION SIMULATOR</span>
          </div>
        </div>

        {/* Audio & Settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMuteToggle}
            className="p-3 bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition-all cursor-pointer"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>

          <button
            onClick={() => { sound.playClick(); onOpenSettings(); }}
            className="p-3 bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition-all cursor-pointer"
            title="Game Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Hero Section - Clean, High Impact */}
      <div className="relative z-10 max-w-xl my-auto space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            3D INTERACTIVE SPACE MISSION GAME
          </div>

          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_40px_rgba(6,182,212,0.7)]">
            SPACE<span className="text-cyan-400">QUEST</span>
          </h1>

          <p className="text-xl sm:text-2xl font-light text-slate-200 tracking-wide font-mono">
            Build It. Launch It. <span className="text-cyan-300 font-bold">Explore It!</span>
          </p>

          {/* Quick Feature Pills (No long text!) */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5">
              🚀 3D Rocket Launch
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5">
              🛰️ Spacecraft CAD Lab
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5">
              🪐 Solar Exploration
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {!showModeSelect ? (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handlePlayClick}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-black text-lg rounded-2xl shadow-xl shadow-cyan-500/30 flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-white" />
              PLAY NOW
            </button>

            <button
              onClick={() => { sound.playClick(); onOpenHowToPlay(); }}
              className="px-5 py-4 bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 text-slate-200 hover:text-white font-mono text-sm font-semibold rounded-2xl border border-slate-700/80 flex items-center gap-2 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              HOW TO PLAY
            </button>

            <button
              onClick={() => { sound.playClick(); onOpenMissions(); }}
              className="px-5 py-4 bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 text-slate-200 hover:text-white font-mono text-sm font-semibold rounded-2xl border border-slate-700/80 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Globe2 className="w-4 h-4 text-purple-400" />
              MISSIONS
            </button>

            <button
              onClick={() => { sound.playClick(); onOpenLeaderboard(); }}
              className="px-5 py-4 bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 text-slate-200 hover:text-white font-mono text-sm font-semibold rounded-2xl border border-slate-700/80 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              SCORES
            </button>
          </div>
        ) : (
          /* Mode Selection Sub-panel */
          <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-5 space-y-4 max-w-xl animate-fadeIn">
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              SELECT GAME MODE
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Solo Mode */}
              <button
                onClick={() => handleSelectMode('solo')}
                className="p-4 bg-slate-800/80 hover:bg-cyan-950/60 hover:border-cyan-400 border border-slate-700 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="p-2.5 bg-slate-900 rounded-lg w-fit text-cyan-400 group-hover:bg-cyan-500/20 mb-2">
                    <User className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">SOLO</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Single player command.
                  </p>
                </div>
              </button>

              {/* Team Mode */}
              <button
                onClick={() => handleSelectMode('team')}
                className="p-4 bg-slate-800/80 hover:bg-purple-950/60 hover:border-purple-400 border border-slate-700 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="p-2.5 bg-slate-900 rounded-lg w-fit text-purple-400 group-hover:bg-purple-500/20 mb-2">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">TEAM CO-OP</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    4 players on 1 device.
                  </p>
                </div>
              </button>

              {/* Sandbox Mode */}
              <button
                onClick={() => handleSelectMode('sandbox')}
                className="p-4 bg-slate-800/80 hover:bg-amber-950/60 hover:border-amber-400 border border-slate-700 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="p-2.5 bg-slate-900 rounded-lg w-fit text-amber-400 group-hover:bg-amber-500/20 mb-2">
                    <Box className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">SANDBOX</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Unlimited budget & mass.
                  </p>
                </div>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowModeSelect(false)}
                className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
              >
                ← BACK
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clean Footer */}
      <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-500 border-t border-slate-800/60 pt-4">
        <div>SPACE QUEST 2026</div>
        <div>DRAG SCREEN TO ROTATE EARTH 🌍</div>
      </div>
    </div>
  );
};

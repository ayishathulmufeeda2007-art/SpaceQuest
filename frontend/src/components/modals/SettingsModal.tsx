import React, { useState } from 'react';
import { X, Volume2, VolumeX, Music, RotateCcw, ShieldCheck } from 'lucide-react';
import { sound } from '../../utils/soundEngine';

interface SettingsModalProps {
  onClose: () => void;
  onClearLeaderboard: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onClearLeaderboard }) => {
  const [sfxVol, setSfxVol] = useState(70);
  const [musicVol, setMusicVol] = useState(40);
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSfxVol(val);
    sound.setSfxVolume(val / 100);
    sound.playClick();
  };

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setMusicVol(val);
    sound.setMusicVolume(val / 100);
  };

  const handleMuteToggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            AUDIO & GAME SETTINGS
          </h2>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-5">
          {/* Mute Button */}
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-xs font-mono text-slate-300">MASTER AUDIO</span>
            <button
              onClick={handleMuteToggle}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                isMuted 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isMuted ? 'MUTED' : 'ENABLED'}
            </button>
          </div>

          {/* SFX Volume */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                SOUND EFFECTS VOLUME
              </span>
              <span className="text-cyan-400 font-bold">{sfxVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sfxVol}
              onChange={handleSfxChange}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Music Volume */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <Music className="w-4 h-4 text-purple-400" />
                COSMIC MUSIC VOLUME
              </span>
              <span className="text-purple-400 font-bold">{musicVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={musicVol}
              onChange={handleMusicChange}
              className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Clear Data */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={() => {
              if (window.confirm('Reset all saved mission records and leaderboards?')) {
                onClearLeaderboard();
                sound.playSwitch();
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-mono"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET LOCAL LEADERBOARD
          </button>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-bold cursor-pointer transition-all"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

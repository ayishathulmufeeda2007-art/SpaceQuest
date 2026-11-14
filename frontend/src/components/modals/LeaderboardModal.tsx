import React, { useState } from 'react';
import { LeaderboardEntry } from '../../types';
import { Trophy, X, Medal, Calendar, Award, Sparkles, Filter, RefreshCw } from 'lucide-react';
import { sound } from '../../utils/soundEngine';

interface LeaderboardModalProps {
  entries: LeaderboardEntry[];
  onClose: () => void;
  onRefresh?: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ entries, onClose, onRefresh }) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredEntries = entries.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'lunar') return e.missionName.toLowerCase().includes('lunar');
    if (filter === 'mars') return e.missionName.toLowerCase().includes('mars');
    if (filter === 'earth') return e.missionName.toLowerCase().includes('earth');
    if (filter === 'deep_space') return e.missionName.toLowerCase().includes('deep');
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 shadow-[0_0_60px_rgba(6,182,212,0.35)] flex flex-col justify-between max-h-[88vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <span>SPACE QUEST HALL OF FAME</span>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded text-[10px]">
                  {entries.length} FLIGHT RECORDS
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">Commander Leaderboard</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={() => { sound.playClick(); onRefresh(); }}
                className="p-2 text-slate-400 hover:text-cyan-300 rounded-xl hover:bg-slate-800 transition-all cursor-pointer border border-transparent hover:border-slate-700"
                title="Refresh from Mission Control server"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => { sound.playClick(); onClose(); }}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="pt-3 flex flex-wrap gap-1.5 border-b border-slate-800/80 pb-3">
          {[
            { id: 'all', label: 'ALL MISSIONS' },
            { id: 'lunar', label: 'LUNAR' },
            { id: 'mars', label: 'MARS' },
            { id: 'earth', label: 'EARTH' },
            { id: 'deep_space', label: 'DEEP SPACE' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => { sound.playClick(); setFilter(f.id); }}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                filter === f.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Entries List */}
        <div className="my-3 overflow-y-auto pr-1 space-y-2.5 flex-1 max-h-[50vh]">
          {filteredEntries.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-mono text-xs space-y-2">
              <Trophy className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <div>NO MISSIONS COMPLETED FOR THIS FILTER YET.</div>
              <div className="text-slate-500">Launch a flight and complete your mission to register here!</div>
            </div>
          ) : (
            filteredEntries.map((entry, idx) => {
              const isTop1 = idx === 0;
              const isTop2 = idx === 1;
              const isTop3 = idx === 2;
              const isRecent = entry.isNew;

              return (
                <div
                  key={entry.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 text-xs font-mono ${
                    isRecent
                      ? 'bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/50'
                      : (isTop1
                          ? 'bg-amber-950/20 border-amber-500/50'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700')
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                      isTop1 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950' :
                      isTop2 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950' :
                      isTop3 ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-200' : 
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {isTop1 ? '🥇' : (isTop2 ? '🥈' : (isTop3 ? '🥉' : idx + 1))}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-white tracking-wide">
                          {entry.playerName}
                        </span>
                        {isRecent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-slate-950 flex items-center gap-1 shadow animate-pulse">
                            <Sparkles className="w-3 h-3" />
                            JUST LOGGED!
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-cyan-300 font-semibold mt-0.5 flex items-center gap-2">
                        <span>{entry.missionName}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 uppercase text-[10px]">{entry.mode} MODE</span>
                        {entry.dateIso && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-500 text-[10px]">{entry.dateIso}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xl font-black text-amber-400 font-mono tracking-tight">
                      {entry.score} <span className="text-xs text-amber-500 font-bold">PTS</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                      {entry.ratingTitle}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400">
            Records automatically saved & ranked by Total Mission Points.
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

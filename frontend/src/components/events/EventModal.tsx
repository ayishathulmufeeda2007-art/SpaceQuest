import React, { useState } from 'react';
import { SpaceEvent, SpaceEventChoice } from '../../types';
import { Zap, Sparkles, Check, Gamepad2, ArrowRight, ShieldAlert, FastForward } from 'lucide-react';
import { sound } from '../../utils/soundEngine';

interface EventModalProps {
  event: SpaceEvent;
  onResolve: (choice: SpaceEventChoice) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onResolve }) => {
  const [selectedChoice, setSelectedChoice] = useState<SpaceEventChoice | null>(null);
  const [isResolved, setIsResolved] = useState(false);

  const handleSelectChoice = (choice: SpaceEventChoice) => {
    setSelectedChoice(choice);
    setIsResolved(true);
    sound.playSwitch();
  };

  const handleConfirm = () => {
    if (selectedChoice) {
      sound.playTelemetryPing();
      onResolve(selectedChoice);
    }
  };

  const handleQuickSkip = () => {
    sound.playClick();
    onResolve(event.choices[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 shadow-[0_0_60px_rgba(245,158,11,0.35)] flex flex-col gap-4">
        
        {/* Header: Clear Gameplay Event Banner */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-500/50 rounded-2xl text-amber-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1">
                  <Gamepad2 className="w-3 h-3 text-amber-400" />
                  MISSION MINI-GAME CHALLENGE
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">{event.title}</h2>
            </div>
          </div>

          {/* Quick Skip button */}
          <button
            onClick={handleQuickSkip}
            className="text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-all cursor-pointer"
            title="Auto-resolve and resume flight immediately"
          >
            <FastForward className="w-3.5 h-3.5 text-cyan-400" />
            SKIP
          </button>
        </div>

        {/* Helpful Explanation for the Player */}
        <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-3 text-xs text-cyan-200 font-mono">
          👨‍🚀 <strong className="text-cyan-300">Flight Controller Decision:</strong> An unexpected in-flight space event has occurred! Choose an engineering action below to command your spacecraft and continue flight:
        </div>

        {/* Humorous Quote */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 italic text-xs text-amber-300 font-mono">
          {event.humorousQuote}
        </div>

        {/* Action Choices - Big & Clickable */}
        {!isResolved ? (
          <div className="space-y-2.5">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
              CLICK AN ACTION TO COMMAND YOUR SPACECRAFT:
            </div>
            {event.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectChoice(choice)}
                className="w-full p-4 bg-slate-800/90 hover:bg-slate-750 hover:border-cyan-400 border border-slate-700 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer group shadow-sm hover:shadow-cyan-500/10 hover:scale-[1.01]"
              >
                <div className="pr-3">
                  <span className="text-sm font-bold text-white group-hover:text-cyan-300 block">
                    {choice.label}
                  </span>
                  <span className="text-xs text-slate-400 line-clamp-1 mt-0.5 block">
                    {choice.description}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                  {choice.consequences.powerDrainWh !== undefined && (
                    <span className="text-amber-400 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      {choice.consequences.powerDrainWh > 0 
                        ? `-${choice.consequences.powerDrainWh} Wh` 
                        : (choice.consequences.powerDrainWh < 0 
                            ? `+${Math.abs(choice.consequences.powerDrainWh)} Wh` 
                            : `Safe`)}
                    </span>
                  )}
                  {choice.consequences.scienceBonus && (
                    <span className="text-cyan-400 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      +{choice.consequences.scienceBonus} Science
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Immediate Outcome */
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-emerald-950/50 border border-emerald-500/50 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono uppercase mb-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                COMMAND EXECUTED SUCCESSFULLY
              </div>
              <p className="text-sm text-slate-200 font-mono">
                {selectedChoice?.consequences.humorousOutcome}
              </p>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer font-mono flex items-center justify-center gap-2 transform hover:scale-[1.01]"
            >
              <span>RESUME FLIGHT TO DESTINATION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

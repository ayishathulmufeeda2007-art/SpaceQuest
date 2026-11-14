import React from 'react';
import { TeamRole, TeamMemberState } from '../../types';
import { sound } from '../../utils/soundEngine';
import { Users, Crown, Wrench, Microscope, Compass, CheckCircle2, Clock } from 'lucide-react';

interface TeamModePanelProps {
  teamState: Record<TeamRole, TeamMemberState>;
  onToggleApproval: (role: TeamRole) => void;
  onUpdateRoleName: (role: TeamRole, newName: string) => void;
}

export const TeamModePanel: React.FC<TeamModePanelProps> = ({
  teamState,
  onToggleApproval,
  onUpdateRoleName
}) => {
  const roles: { key: TeamRole; title: string; defaultName: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
    {
      key: 'commander',
      title: 'Mission Commander',
      defaultName: 'Cmdr. Shepard',
      desc: 'Authorizes overall mission architecture, manages budget allocation, and provides final launch Go/No-Go clearance.',
      icon: Crown
    },
    {
      key: 'engineer',
      title: 'Spacecraft Systems Engineer',
      defaultName: 'Eng. Scott',
      desc: 'Designs the spacecraft bus, balances mass margins, ensures power generation and battery eclipse survivability.',
      icon: Wrench
    },
    {
      key: 'scientist',
      title: 'Chief Science Officer',
      defaultName: 'Dr. Sagan',
      desc: 'Selects the scientific instruments, ensures wavelength compatibility, and validates planetary research goals.',
      icon: Microscope
    },
    {
      key: 'controller',
      title: 'Flight Dynamics Controller',
      defaultName: 'Ctrl. Kranz',
      desc: 'Selects the rocket booster, calculates orbital delta-V, manages ground comms, and resolves flight anomalies.',
      icon: Compass
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-400">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            LOCAL MULTIPLAYER COLLABORATION (1-4 PLAYERS ON SAME DEVICE)
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Mission Control Team Operations</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((r) => {
          const state = teamState[r.key];
          const IconComp = r.icon;
          return (
            <div
              key={r.key}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                state.approved
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-700 text-cyan-400">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{r.title}</h4>
                      <input
                        type="text"
                        value={state.name || r.defaultName}
                        onChange={(e) => onUpdateRoleName(r.key, e.target.value)}
                        className="text-xs font-mono bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-slate-700 focus:outline-none focus:border-cyan-400 mt-0.5"
                      />
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    state.approved 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : 'bg-slate-800 text-amber-300 border-amber-500/40'
                  }`}>
                    {state.approved ? 'APPROVED' : 'REVIEWING'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {r.desc}
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playSwitch();
                  onToggleApproval(r.key);
                }}
                className={`w-full py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  state.approved
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {state.approved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    SUBSYSTEM APPROVED (CLICK TO REVOKE)
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    SIGN OFF & APPROVE ROLE
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

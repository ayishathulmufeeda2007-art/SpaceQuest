import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  MissionDefinition, 
  GameMode, 
  SpacecraftComponent, 
  ScientificInstrument, 
  LaunchVehicle, 
  OrbitDefinition, 
  TeamRole, 
  TeamMemberState, 
  MissionPhase, 
  TelemetryStream,
  SpaceEvent,
  SpaceEventChoice
} from '../../types';
import { BUS_PLATFORMS } from '../../data/components';
import { ROCKETS } from '../../data/rockets';
import { ORBITS } from '../../data/orbits';
import { RANDOM_SPACE_EVENTS } from '../../data/events';
import { calculateSpacecraftMetrics } from '../../simulation/physicsEngine';
import { evaluateScienceYield } from '../../simulation/scienceEngine';
import { calculateMissionScore } from '../../simulation/scoringEngine';
import { ResourceDashboard } from '../dashboard/ResourceDashboard';
import { SpacecraftDesignLab } from '../labs/SpacecraftDesignLab';
import { ScientificInstrumentLab } from '../labs/ScientificInstrumentLab';
import { RocketOrbitLab } from '../labs/RocketOrbitLab';
import { MissionLaunchChecklist } from '../labs/MissionLaunchChecklist';
import { TeamModePanel } from '../team/TeamModePanel';
import { RocketLaunchViewer3D } from '../3d/RocketLaunchViewer3D';
import { SpaceFlightSim3D } from '../3d/SpaceFlightSim3D';
import { EventModal } from '../events/EventModal';
import { GroundSegmentView } from '../ground/GroundSegmentView';
import { ScientificDiscoveryView } from '../science/ScientificDiscoveryView';
import { MissionReportView } from '../results/MissionReportView';
import { LiveSpacecraftTracker3D } from '../3d/LiveSpacecraftTracker3D';
import { sound } from '../../utils/soundEngine';
import { 
  Rocket, 
  Cpu, 
  Radio, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  ArrowLeft,
  ShieldCheck,
  Trophy
} from 'lucide-react';

interface MissionLifecycleHubProps {
  mission: MissionDefinition;
  gameMode: GameMode;
  onExitToMissions: () => void;
  onSaveToLeaderboard: (score: number, ratingTitle: string, customPlayerName?: string) => void;
  onOpenLeaderboard?: () => void;
}

export const MissionLifecycleHub: React.FC<MissionLifecycleHubProps> = ({
  mission,
  gameMode,
  onExitToMissions,
  onSaveToLeaderboard,
  onOpenLeaderboard
}) => {
  // Navigation tab in planning
  const [activeTab, setActiveTab] = useState<'spacecraft' | 'instruments' | 'launch_orbit' | 'team' | 'checklist'>('spacecraft');

  // Mission Flight Progression
  const [flightPhase, setFlightPhase] = useState<MissionPhase>('planning');
  const [flightProgressPct, setFlightProgressPct] = useState<number>(0);
  const [finalOperationsTab, setFinalOperationsTab] = useState<'tracker' | 'discoveries' | 'report'>('tracker');

  // Selected Architecture Components (starts unselected so player builds from scratch!)
  const [selectedBus, setSelectedBus] = useState<SpacecraftComponent>(
    mission.targetPlanet === 'Moon' ? BUS_PLATFORMS[1] : (mission.targetPlanet === 'DeepSpace' ? BUS_PLATFORMS[2] : BUS_PLATFORMS[0])
  );

  // START WITH ZERO PRE-SELECTED COMPONENTS & INSTRUMENTS (player builds from scratch!)
  const [selectedComponents, setSelectedComponents] = useState<SpacecraftComponent[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<ScientificInstrument[]>([]);

  // Selected Rocket & Orbit (starts unselected!)
  const [selectedRocket, setSelectedRocket] = useState<LaunchVehicle | null>(null);
  const [selectedOrbit, setSelectedOrbit] = useState<OrbitDefinition | null>(null);

  // Team State
  const [teamState, setTeamState] = useState<Record<TeamRole, TeamMemberState>>({
    commander: { role: 'commander', name: 'Cmdr. Shepard', title: 'Mission Commander', approved: false, notes: '' },
    engineer: { role: 'engineer', name: 'Eng. Scott', title: 'Spacecraft Systems Engineer', approved: false, notes: '' },
    scientist: { role: 'scientist', name: 'Dr. Sagan', title: 'Chief Science Officer', approved: false, notes: '' },
    controller: { role: 'controller', name: 'Ctrl. Kranz', title: 'Flight Dynamics Controller', approved: false, notes: '' }
  });

  // Random Event State
  const [currentEvent, setCurrentEvent] = useState<SpaceEvent | null>(null);
  const [eventsResolvedCount, setEventsResolvedCount] = useState(0);

  // Downlink telemetry data
  const [dataDownlinkedMB, setDataDownlinkedMB] = useState(0);

  // Calculate live engineering metrics
  const metrics = useMemo(() => {
    return calculateSpacecraftMetrics(
      mission,
      selectedBus,
      selectedComponents,
      selectedInstruments,
      selectedRocket,
      selectedOrbit
    );
  }, [mission, selectedBus, selectedComponents, selectedInstruments, selectedRocket, selectedOrbit]);

  // Calculate live science yield
  const scienceEvaluation = useMemo(() => {
    return evaluateScienceYield(mission, selectedInstruments);
  }, [mission, selectedInstruments]);

  // Telemetry stream for in-flight view
  const telemetry: TelemetryStream = useMemo(() => {
    const distScale = mission.targetPlanet === 'Moon' ? 384400 : (mission.targetPlanet === 'Mars' ? 225000000 : 1500000);
    const currentDist = Math.round((flightProgressPct / 100) * distScale);
    return {
      timestampSec: Math.round(flightProgressPct * 864),
      missionPhase: flightPhase,
      phaseProgressPct: flightProgressPct,
      distanceFromEarthKm: Math.max(400, currentDist),
      orbitalSpeedKms: parseFloat((7.8 - (flightProgressPct / 100) * 3.2).toFixed(2)),
      batteryLevelPct: Math.max(35, 100 - Math.round((flightProgressPct / 100) * 25)),
      solarExposurePct: 95,
      tempKelvin: 285,
      signalStrengthPct: Math.max(65, 100 - Math.round((flightProgressPct / 100) * 30)),
      dataBufferMB: metrics.totalDataGeneratedMB - dataDownlinkedMB,
      dataTransmittedMB: dataDownlinkedMB,
      activeAlarms: [],
      logMessages: [`Flight progress: ${flightProgressPct}% nominal.`]
    };
  }, [flightProgressPct, flightPhase, mission, metrics.totalDataGeneratedMB, dataDownlinkedMB]);

  // Handlers for Component & Instrument Toggles
  const handleToggleComponent = (comp: SpacecraftComponent) => {
    setSelectedComponents(prev => {
      const exists = prev.some(c => c.id === comp.id);
      if (exists) {
        return prev.filter(c => c.id !== comp.id);
      } else {
        // If it's a single-slot subsystem (like battery, power, propulsion), replace existing of same subsystem
        const filtered = prev.filter(c => c.subsystem !== comp.subsystem);
        return [...filtered, comp];
      }
    });
  };

  const handleToggleInstrument = (inst: ScientificInstrument) => {
    setSelectedInstruments(prev => {
      const exists = prev.some(i => i.id === inst.id);
      if (exists) {
        return prev.filter(i => i.id !== inst.id);
      } else {
        return [...prev, inst];
      }
    });
  };

  // Team Approval Toggle
  const handleToggleTeamApproval = (role: TeamRole) => {
    setTeamState(prev => ({
      ...prev,
      [role]: { ...prev[role], approved: !prev[role].approved }
    }));
  };

  const handleUpdateRoleName = (role: TeamRole, newName: string) => {
    setTeamState(prev => ({
      ...prev,
      [role]: { ...prev[role], name: newName }
    }));
  };

  // In-flight progression timer
  useEffect(() => {
    if (flightPhase !== 'cruise' && flightPhase !== 'science_ops') return;

    const interval = setInterval(() => {
      setFlightProgressPct(prev => {
        const next = prev + 2;

        // Trigger a random space event at 35% progress if not triggered yet
        if (next >= 35 && prev < 35 && eventsResolvedCount === 0) {
          const event = RANDOM_SPACE_EVENTS[Math.floor(Math.random() * RANDOM_SPACE_EVENTS.length)];
          setCurrentEvent(event);
          sound.playAlarm();
        }

        // Switch to science observations at 65%
        if (next >= 65 && flightPhase === 'cruise') {
          setFlightPhase('science_ops');
          sound.playTelemetryPing();
        }

        // Switch to Ground downlink at 100%
        if (next >= 100) {
          clearInterval(interval);
          setFlightPhase('data_downlink');
          sound.playSwitch();
          return 100;
        }

        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [flightPhase, eventsResolvedCount]);

  // Handle Event Resolution
  const handleResolveEvent = (choice: SpaceEventChoice) => {
    setEventsResolvedCount(prev => prev + 1);
    setCurrentEvent(null);
  };

  // Downlink handlers
  const handleDownlinkTick = useCallback((chunk: number) => {
    setDataDownlinkedMB(prev => Math.min(Math.max(10, metrics.totalDataGeneratedMB), prev + chunk));
  }, [metrics.totalDataGeneratedMB]);

  const handleDownlinkComplete = () => {
    setFlightPhase('mission_complete');
    sound.playVictoryFanfare();
  };

  // Calculate final mission score result
  const scoreResult = useMemo(() => {
    const downlinkedRatio = metrics.totalDataGeneratedMB > 0 
      ? dataDownlinkedMB / metrics.totalDataGeneratedMB 
      : 1.0;

    return calculateMissionScore(
      mission,
      metrics,
      scienceEvaluation.scienceScore,
      scienceEvaluation.discoveredItems,
      eventsResolvedCount,
      true, // Survived
      downlinkedRatio
    );
  }, [mission, metrics, scienceEvaluation, eventsResolvedCount, dataDownlinkedMB]);

  // Concept Maturity Level computation
  const getCmlLevel = () => {
    if (flightPhase === 'mission_complete') return 4;
    if (activeTab === 'checklist' || flightPhase !== 'planning') return 4;
    if (activeTab === 'launch_orbit') return 3;
    if (activeTab === 'spacecraft' || activeTab === 'instruments') return 2;
    return 1;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      
      {/* 1. Global Resource Management Dashboard (Always pinned) */}
      <ResourceDashboard metrics={metrics} />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Top Header & 4-Segment Breadcrumb Bar (NASA Design & Develop Science Missions) */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { sound.playClick(); onExitToMissions(); }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
              title="Return to Mission Selection"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                MISSION: {mission.name} • CML STAGE {getCmlLevel()}
              </div>
              <h2 className="text-xl font-black text-white">{mission.destination}</h2>
            </div>
          </div>

          {/* 4 NASA Mission Segments Indicators */}
          <div className="flex items-center gap-2 text-xs font-mono">
            {/* Launch */}
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              selectedRocket && metrics.isMassValid && metrics.isRocketCompatible 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              <Rocket className="w-3.5 h-3.5" />
              <span>LAUNCH</span>
              {selectedRocket && metrics.isMassValid && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </div>

            {/* Space */}
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              metrics.isPowerValid && metrics.isPayloadCompatible 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              <Cpu className="w-3.5 h-3.5" />
              <span>SPACE</span>
              {metrics.isPowerValid && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </div>

            {/* Ground */}
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              flightPhase === 'data_downlink' || flightPhase === 'mission_complete'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              <Radio className="w-3.5 h-3.5" />
              <span>GROUND</span>
            </div>

            {/* User */}
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              flightPhase === 'mission_complete'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>USER</span>
            </div>
          </div>
        </div>

        {/* --- VIEW SWITCHER BASED ON FLIGHT PHASE --- */}

        {/* 1. PLANNING PHASE */}
        {flightPhase === 'planning' && (
          <div className="space-y-6">
            {/* Planning Sub-Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => { setActiveTab('spacecraft'); sound.playClick(); }}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeTab === 'spacecraft' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-sm' 
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-4 h-4" />
                1. SPACECRAFT ({selectedComponents.length} PARTS)
              </button>

              <button
                onClick={() => { setActiveTab('instruments'); sound.playClick(); }}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeTab === 'instruments' 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400 shadow-sm' 
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                2. SCIENCE SENSORS ({selectedInstruments.length})
              </button>

              <button
                onClick={() => { setActiveTab('launch_orbit'); sound.playClick(); }}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeTab === 'launch_orbit' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400 shadow-sm' 
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <Rocket className="w-4 h-4" />
                3. ROCKET & ORBIT {selectedRocket && '✓'}
              </button>

              {gameMode === 'team' && (
                <button
                  onClick={() => { setActiveTab('team'); sound.playClick(); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    activeTab === 'team' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400 shadow-sm' 
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  TEAM
                </button>
              )}

              <button
                onClick={() => { setActiveTab('checklist'); sound.playClick(); }}
                className={`ml-auto px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
                  activeTab === 'checklist' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25' 
                    : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                4. LAUNCH CHECKLIST
              </button>
            </div>

            {/* Active Planning Tab Content */}
            {activeTab === 'spacecraft' && (
              <SpacecraftDesignLab
                selectedBus={selectedBus}
                selectedComponents={selectedComponents}
                selectedInstruments={selectedInstruments}
                metrics={metrics}
                onSelectBus={setSelectedBus}
                onToggleComponent={handleToggleComponent}
                onNextStep={() => setActiveTab('instruments')}
              />
            )}

            {activeTab === 'instruments' && (
              <ScientificInstrumentLab
                mission={mission}
                selectedInstruments={selectedInstruments}
                onToggleInstrument={handleToggleInstrument}
                onPrevStep={() => setActiveTab('spacecraft')}
                onNextStep={() => setActiveTab('launch_orbit')}
              />
            )}

            {activeTab === 'launch_orbit' && (
              <RocketOrbitLab
                mission={mission}
                metrics={metrics}
                selectedRocket={selectedRocket}
                selectedOrbit={selectedOrbit}
                onSelectRocket={setSelectedRocket}
                onSelectOrbit={setSelectedOrbit}
                onPrevStep={() => setActiveTab('instruments')}
                onNextStep={() => setActiveTab('checklist')}
              />
            )}

            {activeTab === 'team' && (
              <TeamModePanel
                teamState={teamState}
                onToggleApproval={handleToggleTeamApproval}
                onUpdateRoleName={handleUpdateRoleName}
              />
            )}

            {activeTab === 'checklist' && (
              <MissionLaunchChecklist
                mission={mission}
                metrics={metrics}
                rocket={selectedRocket}
                orbit={selectedOrbit}
                onPrevStep={() => setActiveTab('launch_orbit')}
                onProceedToLaunch={() => {
                  setFlightPhase('launching');
                }}
              />
            )}
          </div>
        )}

        {/* 2. LAUNCHPAD ASCENT SIMULATION */}
        {flightPhase === 'launching' && (
          <RocketLaunchViewer3D
            rocket={selectedRocket || ROCKETS[1]}
            missionName={mission.name}
            bus={selectedBus}
            components={selectedComponents}
            instruments={selectedInstruments}
            onLaunchComplete={() => {
              setFlightPhase('cruise');
              setFlightProgressPct(10);
            }}
          />
        )}

        {/* 3. 3D SOLAR SYSTEM FLIGHT SIMULATION (Cruise & Science phases) */}
        {(flightPhase === 'cruise' || flightPhase === 'science_ops') && (
          <div className="space-y-4">
            <SpaceFlightSim3D
              mission={mission}
              missionPhase={flightPhase}
              phaseProgress={flightProgressPct}
              telemetry={telemetry}
              bus={selectedBus}
              components={selectedComponents}
              instruments={selectedInstruments}
            />

            {/* Progress bar info */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">INTERPLANETARY CRUISE PROGRESS</span>
              <span className="text-cyan-400 font-bold">{flightProgressPct}% COMPLETE</span>
            </div>
          </div>
        )}

        {/* 4. GROUND STATION DATA DOWNLINK PASS */}
        {flightPhase === 'data_downlink' && (
          <GroundSegmentView
            telemetry={telemetry}
            totalDataGeneratedMB={Math.max(10, metrics.totalDataGeneratedMB)}
            dataDownlinkedMB={dataDownlinkedMB}
            downlinkSpeedMbps={metrics.downlinkSpeedMbps}
            onDownlinkTick={handleDownlinkTick}
            onDownlinkComplete={handleDownlinkComplete}
          />
        )}

        {/* 5. USER SEGMENT & IN-ORBIT OPERATIONS (LIVE ORBIT TRACKER, DISCOVERIES, REPORT) */}
        {flightPhase === 'mission_complete' && (
          <div className="space-y-6">
            {/* Operational Mission Hub Switcher */}
            <div className="bg-slate-900/95 p-3.5 rounded-2xl border border-cyan-500/40 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                    STAGE 4 • USER SEGMENT & ACTIVE OPERATIONS
                  </span>
                  <span className="text-sm font-black text-white font-mono flex items-center gap-2">
                    <span>{mission.name}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 font-bold">ORBIT INSERTION VERIFIED ✓</span>
                  </span>
                </div>
              </div>

              {/* Sub-view Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => { setFinalOperationsTab('tracker'); sound.playClick(); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    finalOperationsTab === 'tracker'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  1. LIVE 3D ORBIT TRACKER
                </button>

                <button
                  onClick={() => { setFinalOperationsTab('discoveries'); sound.playClick(); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    finalOperationsTab === 'discoveries'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  2. SCIENTIFIC DISCOVERIES ({scienceEvaluation.discoveredItems.length})
                </button>

                <button
                  onClick={() => { setFinalOperationsTab('report'); sound.playClick(); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    finalOperationsTab === 'report'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 font-black border border-amber-400'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  3. SCORE & LEADERBOARD
                </button>
              </div>
            </div>

            {/* TAB 1: LIVE 3D ORBIT TRACKER */}
            {finalOperationsTab === 'tracker' && (
              <LiveSpacecraftTracker3D
                mission={mission}
                bus={selectedBus}
                components={selectedComponents}
                instruments={selectedInstruments}
                orbit={selectedOrbit || ORBITS[0]}
                metrics={metrics}
                telemetry={telemetry}
                onViewDiscoveries={() => {
                  setFinalOperationsTab('discoveries');
                  sound.playClick();
                }}
                onViewReport={() => {
                  setFinalOperationsTab('report');
                  sound.playClick();
                }}
              />
            )}

            {/* TAB 2: SCIENTIFIC DISCOVERIES */}
            {finalOperationsTab === 'discoveries' && (
              <ScientificDiscoveryView
                discoveries={scienceEvaluation.discoveredItems.length > 0 ? scienceEvaluation.discoveredItems : [
                  {
                    id: 'disc-basic',
                    instrumentName: 'Spacecraft Housekeeping Telemetry',
                    title: `${mission.destination} Orbital Insertion Telemetry`,
                    headline: 'Spacecraft achieved stable orbit and returned nominal telemetry verification.',
                    measuredDataText: 'All onboard engineering subsystems operated within nominal thermal and power specifications.',
                    dataType: 'spectrum',
                    scientificSignificance: 'Establishes basic orbital flight qualification.',
                    pointsYield: 20
                  }
                ]}
                onContinue={() => {
                  setFinalOperationsTab('report');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* TAB 3: FINAL SCORING & LEADERBOARD REPORT */}
            {finalOperationsTab === 'report' && (
              <MissionReportView
                mission={mission}
                metrics={metrics}
                scoreResult={scoreResult}
                selectedBus={selectedBus}
                selectedRocket={selectedRocket || ROCKETS[1]}
                selectedOrbit={selectedOrbit || ORBITS[0]}
                gameMode={gameMode}
                onSaveToLeaderboard={(name) => onSaveToLeaderboard(scoreResult.totalScore, scoreResult.ratingTitle, name)}
                onOpenLeaderboard={onOpenLeaderboard}
                onRetry={() => {
                  setFlightPhase('launching');
                  setFlightProgressPct(0);
                  setDataDownlinkedMB(0);
                  setEventsResolvedCount(0);
                  setFinalOperationsTab('tracker');
                }}
                onRedesign={() => {
                  setFlightPhase('planning');
                  setActiveTab('spacecraft');
                }}
                onNewMission={onExitToMissions}
              />
            )}
          </div>
        )}
      </div>

      {/* Random Space Event Modal Popup */}
      {currentEvent && (
        <EventModal
          event={currentEvent}
          onResolve={handleResolveEvent}
        />
      )}

      {/* Footer Notice */}
      <footer className="text-center py-4 text-xs font-mono text-slate-600 border-t border-slate-900">
        SPACE QUEST • NASA SMD EDUCATIONAL MISSION SIMULATOR • BUILT FOR SPACE APPS
      </footer>
    </div>
  );
};

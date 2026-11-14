// Space Quest Core Types and Interfaces

export type GameMode = 'solo' | 'team' | 'sandbox';

export type TeamRole = 'commander' | 'engineer' | 'scientist' | 'controller';

export type MissionDifficulty = 'Easy' | 'Medium' | 'Hard';

export type MissionPhase = 
  | 'planning'
  | 'launch_prep'
  | 'launching'
  | 'orbit_insertion'
  | 'cruise'
  | 'planetary_approach'
  | 'science_ops'
  | 'data_downlink'
  | 'mission_complete'
  | 'mission_failed';

export type MissionSegmentId = 'launch' | 'space' | 'ground' | 'user';

export type SegmentStatus = 'incomplete' | 'ready' | 'verified';

export type ConceptMaturityLevel = 1 | 2 | 3 | 4;

export interface MissionDefinition {
  id: string;
  name: string;
  tagline: string;
  destination: string;
  targetPlanet: 'Earth' | 'Moon' | 'Mars' | 'DeepSpace' | 'Exoplanet';
  scientificObjective: string;
  difficulty: MissionDifficulty;
  budgetLimit: number; // In Million Credits ($M)
  massLimit: number; // In kg
  requiredInstrumentIds: string[];
  recommendedOrbitId: string;
  nominalDurationDays: number;
  specialChallenges: string[];
  narrativeBriefing: string;
}

export type ComponentSubsystem = 
  | 'structure'
  | 'power_generation'
  | 'battery'
  | 'propulsion'
  | 'communications'
  | 'adcs'
  | 'computer'
  | 'thermal';

export interface SpacecraftComponent {
  id: string;
  name: string;
  subsystem: ComponentSubsystem;
  description: string;
  massKg: number;
  powerDrawW: number; // Negative means consumption, positive means generation
  costM: number;
  reliability: number; // 0.0 to 1.0
  properties: {
    capacityWh?: number; // For batteries
    generationW?: number; // For solar/RTG
    deltaVMs?: number; // For propulsion
    dataRateMbps?: number; // For comms
    storageGB?: number; // For CDH computer
    pointingPrecisionArcsec?: number; // For ADCS
    thermalRangeK?: [number, number];
  };
  visualModelKey: string;
}

export interface ScientificInstrument {
  id: string;
  name: string;
  wavelength: string;
  description: string;
  massKg: number;
  powerDrawW: number;
  costM: number;
  dataRateMbps: number;
  scienceValue: number; // 0 - 100
  compatibleDestinations: string[];
  suitableObjectives: string[];
  visualIcon: string;
}

export interface LaunchVehicle {
  id: string;
  name: string;
  category: 'Small Launcher' | 'Medium Launcher' | 'Heavy Launcher' | 'Super Heavy Launcher';
  payloadCapacityKg: number;
  costM: number;
  reliability: number; // 0.0 to 1.0
  destinationCapability: string[];
  stages: number;
  description: string;
}

export interface OrbitDefinition {
  id: string;
  name: string;
  code: string;
  targetBody: string;
  altitudeKm: number;
  periodMinutes: number;
  eclipseMinutes: number;
  deltaVRequiredKms: number;
  commsLatencySec: number;
  observationResolution: string;
  description: string;
  compatibleDestinations: string[];
}

export interface SpaceEventChoice {
  label: string;
  description: string;
  consequences: {
    powerDrainWh?: number;
    propellantUsedKg?: number;
    instrumentDamagedId?: string;
    scienceBonus?: number;
    survivalRiskDelta?: number;
    humorousOutcome: string;
  };
}

export interface SpaceEvent {
  id: string;
  title: string;
  severity: 'warning' | 'critical' | 'opportunity';
  description: string;
  humorousQuote: string;
  choices: SpaceEventChoice[];
}

export interface TeamMemberState {
  role: TeamRole;
  name: string;
  title: string;
  approved: boolean;
  notes: string;
}

export interface MissionDesignState {
  missionId: string;
  gameMode: GameMode;
  selectedBusId: string;
  selectedComponentIds: string[];
  selectedInstrumentIds: string[];
  selectedRocketId: string;
  selectedOrbitId: string;
  teamState: Record<TeamRole, TeamMemberState>;
}

export interface ResourceMetrics {
  totalMassKg: number;
  massLimitKg: number;
  massMarginPct: number;
  
  powerGenerationW: number;
  powerConsumptionW: number;
  netPowerW: number;
  batteryCapacityWh: number;
  eclipseReserveHours: number;
  powerMarginPct: number;
  
  totalCostM: number;
  budgetLimitM: number;
  budgetReservePct: number;
  
  totalDataGeneratedMB: number;
  storageCapacityGB: number;
  downlinkSpeedMbps: number;
  
  systemReliabilityPct: number;
  deltaVAvailableMs: number;
  deltaVRequiredMs: number;
  
  isMassValid: boolean;
  isPowerValid: boolean;
  isBudgetValid: boolean;
  isRocketCompatible: boolean;
  isOrbitCompatible: boolean;
  isPayloadCompatible: boolean;
}

export interface TelemetryStream {
  timestampSec: number;
  missionPhase: MissionPhase;
  phaseProgressPct: number;
  distanceFromEarthKm: number;
  orbitalSpeedKms: number;
  batteryLevelPct: number;
  solarExposurePct: number;
  tempKelvin: number;
  signalStrengthPct: number;
  dataBufferMB: number;
  dataTransmittedMB: number;
  activeAlarms: string[];
  logMessages: string[];
}

export interface ScientificDiscovery {
  id: string;
  instrumentName: string;
  title: string;
  headline: string;
  measuredDataText: string;
  dataType: 'spectrum' | 'image' | 'magnetic' | 'atmospheric' | 'soil';
  chartData?: { x: number | string; y: number }[];
  scientificSignificance: string;
  pointsYield: number;
}

export interface MissionScoreResult {
  totalScore: number; // 0 - 100
  ratingTitle: 'LEGENDARY COMMANDER' | 'EXPERT EXPLORER' | 'SKILLED ENGINEER' | 'ROOKIE EXPLORER' | 'MISSION FAILURE';
  ratingColor: string;
  breakdown: {
    scienceAchievement: number; // / 35
    spacecraftSurvival: number; // / 20
    engineeringDesign: number; // / 15
    communicationSuccess: number; // / 15
    budgetManagement: number; // / 15
  };
  evaluationSummary: string[];
  achievements: string[];
  discoveredItems: ScientificDiscovery[];
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  missionName: string;
  score: number;
  ratingTitle: string;
  mode: GameMode;
  dateIso: string;
  isNew?: boolean;
}

// Space Quest Automated Simulation Unit Tests

import { MISSIONS } from '../data/missions';
import { BUS_PLATFORMS, COMPONENTS } from '../data/components';
import { INSTRUMENTS, getInstrumentCompatibility } from '../data/instruments';
import { ROCKETS, checkRocketCapacity } from '../data/rockets';
import { ORBITS } from '../data/orbits';
import { calculateSpacecraftMetrics } from '../simulation/physicsEngine';
import { evaluateScienceYield } from '../simulation/scienceEngine';
import { calculateMissionScore } from '../simulation/scoringEngine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

export function runAllTests() {
  console.log('🧪 Starting Space Quest Simulation Engine Tests...');

  // 1. Test Rocket Payload Margins
  const heavyRocket = ROCKETS.find(r => r.id === 'launcher-heavy')!;
  const smallRocket = ROCKETS.find(r => r.id === 'launcher-small')!;
  
  const smallCheck = checkRocketCapacity(smallRocket, 300);
  assert(smallCheck.compatible === true, '300kg payload should fit inside small launcher');
  assert(smallCheck.marginKg === 150, 'Margin should be exactly 150kg');

  const overweightCheck = checkRocketCapacity(smallRocket, 600);
  assert(overweightCheck.compatible === false, '600kg payload must fail small launcher capacity check');
  console.log('✅ Rocket payload capacity checks passed.');

  // 2. Test Physics & Resource Calculations
  const lunarMission = MISSIONS.find(m => m.id === 'lunar-explorer')!;
  const bus = BUS_PLATFORMS[1]; // SmallSat
  const comps = [
    COMPONENTS.find(c => c.id === 'solar-deploy-wings')!,
    COMPONENTS.find(c => c.id === 'battery-extended-liion')!,
    COMPONENTS.find(c => c.id === 'prop-cold-gas')!,
    COMPONENTS.find(c => c.id === 'comms-xband-horn')!
  ];
  const insts = [
    INSTRUMENTS.find(i => i.id === 'radar-sar')!,
    INSTRUMENTS.find(i => i.id === 'sensor-ir')!
  ];
  const rocket = ROCKETS[1]; // Medium
  const orbit = ORBITS.find(o => o.id === 'trajectory-lunar')!;

  const metrics = calculateSpacecraftMetrics(lunarMission, bus, comps, insts, rocket, orbit);
  
  assert(metrics.totalMassKg > 0, 'Total mass must be greater than zero');
  assert(metrics.isMassValid === true, 'SmallSat lunar probe must be within medium rocket capacity');
  assert(metrics.powerGenerationW > 0, 'Power generation must be positive at lunar orbit (1 AU)');
  assert(metrics.eclipseReserveHours > 0, 'Battery must supply power during eclipse');
  console.log('✅ Physics & Resource metrics calculation passed.');

  // 3. Test Mars Solar Distance Decay (1/r^2)
  const marsMission = MISSIONS.find(m => m.id === 'mars-discovery')!;
  const marsOrbit = ORBITS.find(o => o.id === 'trajectory-mars')!;
  const marsMetrics = calculateSpacecraftMetrics(marsMission, bus, comps, insts, rocket, marsOrbit);

  assert(marsMetrics.powerGenerationW < metrics.powerGenerationW, 'Solar power at Mars must be significantly lower than at Moon due to 1/r^2 solar flux decay');
  console.log('✅ Solar flux inverse-square law distance scaling passed.');

  // 4. Test Instrument Compatibility
  const radar = INSTRUMENTS.find(i => i.id === 'radar-sar')!;
  const lunarCompat = getInstrumentCompatibility(radar, 'Moon', lunarMission.requiredInstrumentIds);
  assert(lunarCompat === 'COMPATIBLE', 'SAR Radar must be COMPATIBLE with Lunar Explorer mission');

  const deepSpaceMission = MISSIONS.find(m => m.id === 'deep-space-explorer')!;
  const deepSpaceRadarCompat = getInstrumentCompatibility(radar, 'DeepSpace', deepSpaceMission.requiredInstrumentIds);
  assert(deepSpaceRadarCompat === 'NOT SUITABLE', 'SAR Radar must be NOT SUITABLE for Deep Space interstellar mission');
  console.log('✅ Instrument objective compatibility logic passed.');

  // 5. Test Science Yield & Scoring Formula
  const scienceResult = evaluateScienceYield(lunarMission, insts);
  assert(scienceResult.scienceScore >= 50, 'Matching two primary instruments must produce high science score');
  assert(scienceResult.discoveredItems.length === 2, 'Two compatible instruments must return two discovery datasets');

  const scoreResult = calculateMissionScore(
    lunarMission,
    metrics,
    scienceResult.scienceScore,
    scienceResult.discoveredItems,
    1, // 1 event resolved
    true, // craft survived
    1.0 // 100% data downlinked
  );

  assert(scoreResult.totalScore >= 0 && scoreResult.totalScore <= 100, 'Score must be bounded between 0 and 100');
  assert(['LEGENDARY COMMANDER', 'EXPERT EXPLORER', 'SKILLED ENGINEER'].includes(scoreResult.ratingTitle), 'Valid score must produce appropriate commander title');
  console.log('✅ Scoring & mission evaluation formula passed.');

  console.log('🎉 ALL SPACE QUEST SIMULATION UNIT TESTS PASSED SUCCESSFULLY!');
  return true;
}

// Execute tests immediately if run directly
if (typeof window === 'undefined') {
  runAllTests();
}

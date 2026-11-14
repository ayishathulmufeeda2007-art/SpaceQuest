import { 
  MissionDefinition, 
  SpacecraftComponent, 
  ScientificInstrument, 
  LaunchVehicle, 
  OrbitDefinition, 
  ResourceMetrics 
} from '../types';

export function calculateSpacecraftMetrics(
  mission: MissionDefinition,
  selectedBus: SpacecraftComponent,
  selectedComponents: SpacecraftComponent[],
  selectedInstruments: ScientificInstrument[],
  selectedRocket: LaunchVehicle | null,
  selectedOrbit: OrbitDefinition | null
): ResourceMetrics {
  // 1. Total Mass Calculation (kg)
  let totalMassKg = selectedBus ? selectedBus.massKg : 14;
  for (const comp of selectedComponents) {
    totalMassKg += comp.massKg;
  }
  for (const inst of selectedInstruments) {
    totalMassKg += inst.massKg;
  }

  // Mass Margin against Rocket Capacity
  const rocketCapacity = selectedRocket ? selectedRocket.payloadCapacityKg : mission.massLimit;
  const massLimitKg = Math.min(mission.massLimit, rocketCapacity);
  const massMarginPct = Math.round(((massLimitKg - totalMassKg) / massLimitKg) * 100);

  // 2. Power Generation & Consumption (Watts)
  let powerGenerationW = 0;
  let powerConsumptionW = selectedBus ? Math.abs(selectedBus.powerDrawW) : 10;

  // Distance from Sun scale factor (1 / r^2)
  let solarFluxFactor = 1.0;
  if (mission.targetPlanet === 'Moon' || mission.targetPlanet === 'Earth') {
    solarFluxFactor = 1.0;
  } else if (mission.targetPlanet === 'Mars') {
    solarFluxFactor = 0.43; // 1 / (1.524)^2
  } else if (mission.targetPlanet === 'DeepSpace') {
    solarFluxFactor = 0.05; // Outside Jupiter
  } else if (mission.targetPlanet === 'Exoplanet') {
    solarFluxFactor = 1.0; // Standard L2
  }

  for (const comp of selectedComponents) {
    if (comp.subsystem === 'power_generation') {
      if (comp.id === 'rtg-nuclear') {
        powerGenerationW += comp.properties.generationW || 0;
      } else {
        powerGenerationW += Math.round((comp.properties.generationW || 0) * solarFluxFactor);
      }
    } else {
      if (comp.powerDrawW < 0) {
        powerConsumptionW += Math.abs(comp.powerDrawW);
      }
    }
  }

  for (const inst of selectedInstruments) {
    powerConsumptionW += inst.powerDrawW;
  }

  const netPowerW = powerGenerationW - powerConsumptionW;
  const powerMarginPct = powerGenerationW > 0 
    ? Math.round((netPowerW / powerGenerationW) * 100) 
    : -100;

  // 3. Battery Capacity & Eclipse Duration (Wh)
  let batteryCapacityWh = 0;
  for (const comp of selectedComponents) {
    if (comp.subsystem === 'battery' && comp.properties.capacityWh) {
      batteryCapacityWh += comp.properties.capacityWh;
    }
  }

  // Eclipse reserve calculation
  const eclipseMinutes = selectedOrbit ? selectedOrbit.eclipseMinutes : 35;
  const eclipseHours = eclipseMinutes / 60;
  const eclipseEnergyNeededWh = powerConsumptionW * eclipseHours;
  const eclipseReserveHours = powerConsumptionW > 0 
    ? parseFloat((batteryCapacityWh / powerConsumptionW).toFixed(2)) 
    : 0;

  // 4. Financial Cost Calculation ($M)
  let totalCostM = (selectedBus ? selectedBus.costM : 5) + (selectedRocket ? selectedRocket.costM : 0);
  for (const comp of selectedComponents) {
    totalCostM += comp.costM;
  }
  for (const inst of selectedInstruments) {
    totalCostM += inst.costM;
  }
  const budgetReservePct = Math.round(((mission.budgetLimit - totalCostM) / mission.budgetLimit) * 100);

  // 5. Communications & Data
  let downlinkSpeedMbps = 0.064; // baseline UHF
  for (const comp of selectedComponents) {
    if (comp.subsystem === 'communications' && comp.properties.dataRateMbps) {
      if (comp.properties.dataRateMbps > downlinkSpeedMbps) {
        downlinkSpeedMbps = comp.properties.dataRateMbps;
      }
    }
  }

  let storageCapacityGB = 32;
  for (const comp of selectedComponents) {
    if (comp.subsystem === 'computer' && comp.properties.storageGB) {
      storageCapacityGB = comp.properties.storageGB;
    }
  }

  // Total data generated per observation cycle (MB)
  let totalDataGeneratedMB = 0;
  for (const inst of selectedInstruments) {
    totalDataGeneratedMB += Math.round(inst.dataRateMbps * 60); // 1 minute active scan
  }

  // 6. Propulsion & Delta-V
  let deltaVAvailableMs = 0;
  for (const comp of selectedComponents) {
    if (comp.subsystem === 'propulsion' && comp.properties.deltaVMs) {
      deltaVAvailableMs += comp.properties.deltaVMs;
    }
  }
  const deltaVRequiredMs = selectedOrbit ? selectedOrbit.deltaVRequiredKms * 1000 : 9500;

  // 7. System Reliability
  const busReliability = selectedBus ? selectedBus.reliability : 0.9;
  const rocketReliability = selectedRocket ? selectedRocket.reliability : 1.0;
  let systemReliability = busReliability * rocketReliability;
  for (const comp of selectedComponents) {
    systemReliability *= comp.reliability;
  }
  const systemReliabilityPct = Math.min(99, Math.round(systemReliability * 100));

  // 8. Validation Flags
  const isMassValid = selectedRocket 
    ? (totalMassKg <= selectedRocket.payloadCapacityKg && totalMassKg <= mission.massLimit)
    : false;
  const isPowerValid = (powerGenerationW >= powerConsumptionW * 0.85) && (batteryCapacityWh >= eclipseEnergyNeededWh * 0.9) && powerGenerationW > 0;
  const isBudgetValid = totalCostM <= mission.budgetLimit;
  const isRocketCompatible = selectedRocket 
    ? (selectedRocket.payloadCapacityKg >= totalMassKg && selectedRocket.destinationCapability.includes(mission.targetPlanet))
    : false;
  const isOrbitCompatible = selectedOrbit 
    ? selectedOrbit.compatibleDestinations.includes(mission.targetPlanet)
    : false;
  
  // Check if at least one required scientific instrument is installed
  const installedInstrumentIds = selectedInstruments.map(i => i.id);
  const isPayloadCompatible = mission.requiredInstrumentIds.some(reqId => installedInstrumentIds.includes(reqId));

  return {
    totalMassKg,
    massLimitKg,
    massMarginPct,
    
    powerGenerationW,
    powerConsumptionW,
    netPowerW,
    batteryCapacityWh,
    eclipseReserveHours,
    powerMarginPct,
    
    totalCostM,
    budgetLimitM: mission.budgetLimit,
    budgetReservePct,
    
    totalDataGeneratedMB,
    storageCapacityGB,
    downlinkSpeedMbps,
    
    systemReliabilityPct,
    deltaVAvailableMs,
    deltaVRequiredMs,
    
    isMassValid,
    isPowerValid,
    isBudgetValid,
    isRocketCompatible,
    isOrbitCompatible,
    isPayloadCompatible
  };
}

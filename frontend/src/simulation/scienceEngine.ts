import { MissionDefinition, ScientificInstrument, ScientificDiscovery } from '../types';
import { getInstrumentCompatibility } from '../data/instruments';

export function evaluateScienceYield(
  mission: MissionDefinition,
  selectedInstruments: ScientificInstrument[]
): {
  scienceScore: number; // 0 - 100
  discoveredItems: ScientificDiscovery[];
  diagnosticComments: string[];
} {
  const discoveries: ScientificDiscovery[] = [];
  const diagnosticComments: string[] = [];

  let achievedScore = 0;
  let maxPossibleScore = 0;

  for (const reqId of mission.requiredInstrumentIds) {
    maxPossibleScore += 30;
  }

  // Evaluate each installed instrument
  for (const inst of selectedInstruments) {
    const compatibility = getInstrumentCompatibility(inst, mission.targetPlanet, mission.requiredInstrumentIds);

    let weight = 0;
    if (compatibility === 'COMPATIBLE') {
      weight = 1.0;
      achievedScore += inst.scienceValue * 0.8;
      diagnosticComments.push(`[OPTIMAL] ${inst.name} is ideally matched to ${mission.name} primary goals.`);
    } else if (compatibility === 'PARTIALLY USEFUL') {
      weight = 0.5;
      achievedScore += inst.scienceValue * 0.4;
      diagnosticComments.push(`[SECONDARY] ${inst.name} returned opportunistic auxiliary measurements.`);
    } else {
      weight = 0.0;
      diagnosticComments.push(`[INEFFECTIVE] ${inst.name} is unsuited for ${mission.destination}; yield was negligible.`);
    }

    // Generate discoveries for compatible or partially useful instruments
    if (weight > 0) {
      discoveries.push(generateDiscovery(inst, mission));
    }
  }

  // Calculate normalized science score (0 - 100)
  const normalizedScienceScore = Math.min(100, Math.round((achievedScore / Math.max(80, maxPossibleScore)) * 100));

  return {
    scienceScore: normalizedScienceScore,
    discoveredItems: discoveries,
    diagnosticComments
  };
}

function generateDiscovery(
  instrument: ScientificInstrument,
  mission: MissionDefinition
): ScientificDiscovery {
  switch (instrument.id) {
    case 'cam-highres':
      return {
        id: `disc-${instrument.id}`,
        instrumentName: instrument.name,
        title: `${mission.targetPlanet} High-Resolution Surface Cartography`,
        headline: 'Sub-meter orbital imagery reveals stratified geological terraces and frost scarps.',
        measuredDataText: 'Optical focal plane captured 4K stereoscopic surface mosaics showing layered sedimentary shelves and localized boulder distribution.',
        dataType: 'image',
        scientificSignificance: 'Provides unprecedented geographic context for past fluvial erosion or volatile sequestration.',
        pointsYield: 25
      };

    case 'sensor-ir':
      return {
        id: `disc-${instrument.id}`,
        instrumentName: instrument.name,
        title: 'Thermal Inertia & Cryogenic Volatile Gradient',
        headline: 'Thermal IR soundings detected thermal anomalies consistent with buried volatile ice.',
        measuredDataText: 'Surface temperature drops from 220 K down to 88 K inside shadowed crater rims, maintaining perpetual sub-surface cold traps.',
        dataType: 'spectrum',
        chartData: [
          { x: '0 km', y: 220 },
          { x: '5 km', y: 195 },
          { x: '10 km', y: 150 },
          { x: '15 km', y: 110 },
          { x: '20 km', y: 88 }
        ],
        scientificSignificance: 'Confirms thermal conditions capable of preserving volatile compounds across billions of years.',
        pointsYield: 30
      };

    case 'spectrometer-multispectral':
      return {
        id: `disc-${instrument.id}`,
        instrumentName: instrument.name,
        title: 'Diagnostic Absorption Features at 1.9 µm & 2.2 µm',
        headline: 'Spectral absorption bands conclusively confirm hydrated phyllosilicates and carbonates.',
        measuredDataText: 'Reflectance continuum indicates crystalline H2O molecular overtone at 1.93 µm and metal-OH stretching doublet at 2.21 µm.',
        dataType: 'spectrum',
        chartData: [
          { x: '1.2 µm', y: 0.88 },
          { x: '1.5 µm', y: 0.72 },
          { x: '1.9 µm', y: 0.41 },
          { x: '2.1 µm', y: 0.65 },
          { x: '2.2 µm', y: 0.38 },
          { x: '2.5 µm', y: 0.79 }
        ],
        scientificSignificance: 'Indisputable evidence that liquid water chemically weathered parent rock in a benign aqueous environment.',
        pointsYield: 32
      };

    case 'radar-sar':
      return {
        id: `disc-${instrument.id}`,
        instrumentName: instrument.name,
        title: 'Subsurface Radar Sounding & Dielectric Profiles',
        headline: 'Microwave pulses penetrate 12 meters of dry regolith to reveal subsurface ice reflections.',
        measuredDataText: 'Low radar backscatter loss and circular polarization ratio (CPR > 1.2) match pure crystalline water-ice signatures.',
        dataType: 'soil',
        scientificSignificance: 'Enables 3D volumetric reserves estimation for resource utilization.',
        pointsYield: 35
      };

    case 'magnetometer-fluxgate':
      return {
        id: `disc-${instrument.id}`,
        instrumentName: instrument.name,
        title: 'Crustal Paleomagnetic Dynamo Remnants',
        headline: 'Vector magnetic field peaks at 42 nT over ancient southern highland crust.',
        measuredDataText: 'B-field vector records alternating magnetic striping, indicating an ancient planetary magnetic dynamo that once shielded the atmosphere.',
        dataType: 'magnetic',
        chartData: [
          { x: '0s', y: 8 },
          { x: '30s', y: 15 },
          { x: '60s', y: 42 },
          { x: '90s', y: 28 },
          { x: '120s', y: 11 }
        ],
        scientificSignificance: 'Reveals the timeline of core convection shutdown and subsequent atmospheric stripping.',
        pointsYield: 28
      };

    case 'sensor-atmospheric':
      return {
        id: `disc-${instrument.id}`,
        instrumentName: instrument.name,
        title: 'Atmospheric Trace Gas Column & Methane Spikes',
        headline: 'Limb sounding detected localized methane plumes peaking at 12 parts per billion (ppb).',
        measuredDataText: 'Diurnal modulation of CH4/CO2 ratios indicates either subsurface serpentine serpentinization or sub-surface methanogen activity.',
        dataType: 'atmospheric',
        scientificSignificance: 'Identifies prime candidate biological or active geochemical hotspots.',
        pointsYield: 30
      };

    case 'detector-radiation':
      return {
        id: `disc-${instrument.id}`,
        instrumentName: instrument.name,
        title: 'Cosmic Ray Dose Equivalent Rate: 1.4 mSv/day',
        headline: 'Particle dosimeter benchmarks galactic cosmic ray shielding requirements.',
        measuredDataText: 'High LET ion tracks categorized: Iron (Fe) ions contribute 38% of total biological equivalent dose outside planetary magnetospheres.',
        dataType: 'atmospheric',
        scientificSignificance: 'Critical baseline safety benchmarks for future human explorer habitats and shielding design.',
        pointsYield: 26
      };

    case 'soil-analyzer':
      return {
        id: `disc-${instrument.id}`,
        instrumentName: instrument.name,
        title: 'Volatile Pyrolysis & Mass Spectra Organic Fragments',
        headline: 'Sample oven heated to 850°C evolved chlorobenzene and simple carbon aromatic chains.',
        measuredDataText: 'Quadrupole mass spectrum peaks at m/z 78 (benzene ring) and m/z 112 (chlorobenzene). Regolith oxidant perchlorate confirmed at 0.6 wt%.',
        dataType: 'soil',
        scientificSignificance: 'Establishes the preservation potential of complex organic macromolecules in extraterrestrial soil.',
        pointsYield: 38
      };

    default:
      return {
        id: `disc-generic-${instrument.id}`,
        instrumentName: instrument.name,
        title: `${instrument.name} Scientific Observation`,
        headline: 'Telemetry verified nominal data acquisition across programmed observation channels.',
        measuredDataText: 'Continuous sensor samples were successfully digitized and queued for downlink.',
        dataType: 'spectrum',
        scientificSignificance: 'Augments the multi-spectral planetary observation database.',
        pointsYield: 20
      };
  }
}

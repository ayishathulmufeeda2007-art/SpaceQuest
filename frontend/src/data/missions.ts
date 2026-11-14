import { MissionDefinition } from '../types';

export const MISSIONS: MissionDefinition[] = [
  {
    id: 'lunar-explorer',
    name: 'Lunar Explorer',
    tagline: 'Search the Moon’s permanently shadowed polar craters for ancient water ice!',
    destination: 'Moon (Shackleton Crater)',
    targetPlanet: 'Moon',
    scientificObjective: 'Map subsurface volatile volatiles and evaluate regolith minerals for future Artemis lunar base architectures.',
    difficulty: 'Easy',
    budgetLimit: 380, // $380M
    massLimit: 1250, // kg
    requiredInstrumentIds: ['radar-sar', 'sensor-ir', 'spectrometer-multispectral'],
    recommendedOrbitId: 'trajectory-lunar',
    nominalDurationDays: 14,
    specialChallenges: [
      'Extreme thermal swings between lunar daylight (+120°C) and crater shadow (-230°C)',
      'Communication occlusion when orbiting the Lunar far side'
    ],
    narrativeBriefing: 'NASA Artemis planning requires accurate volumetric maps of lunar polar water deposits. Your mission will enter a frozen lunar polar orbit, beam radar through shadow, and relay the highest resolution lunar ice map in history.'
  },
  {
    id: 'mars-discovery',
    name: 'Mars Discovery',
    tagline: 'Journey across 225 million kilometers to investigate ancient Martian lakebeds and biosignatures.',
    destination: 'Mars (Jezero Crater & Syrtis Major)',
    targetPlanet: 'Mars',
    scientificObjective: 'Perform multi-spectral surface composition analysis and probe atmospheric methane plumes for signs of ancient microbial life.',
    difficulty: 'Hard',
    budgetLimit: 880, // $880M
    massLimit: 2600, // kg
    requiredInstrumentIds: ['soil-analyzer', 'sensor-atmospheric', 'spectrometer-multispectral', 'cam-highres'],
    recommendedOrbitId: 'trajectory-mars',
    nominalDurationDays: 240,
    specialChallenges: [
      'Solar irradiance drops to 43% of Earth levels at 1.52 AU',
      'Signal round-trip delay exceeds 22 minutes, preventing real-time ground control',
      'Atmospheric dust storms can choke solar power'
    ],
    narrativeBriefing: 'Mars was once warm, wet, and shielded by a global magnetic dynamo. Your orbiter will map paleo-riverdeltas, measure residual atmospheric loss into the solar wind, and guide prospective crewed landing corridors.'
  },
  {
    id: 'earth-observer',
    name: 'Earth Observer',
    tagline: 'Safeguard our home planet with precision climate, aerosol, and geomagnetic monitoring.',
    destination: 'Earth (Sun-Synchronous Polar Orbit)',
    targetPlanet: 'Earth',
    scientificObjective: 'Track global greenhouse gas concentrations, ocean heat flux, and polar ice shelf calving in high temporal resolution.',
    difficulty: 'Easy',
    budgetLimit: 240, // $240M
    massLimit: 850, // kg
    requiredInstrumentIds: ['cam-highres', 'sensor-atmospheric', 'spectrometer-multispectral'],
    recommendedOrbitId: 'orbit-sso',
    nominalDurationDays: 365,
    specialChallenges: [
      'Frequent South Atlantic Anomaly (SAA) radiation hits affecting flight computer memory',
      'Massive daily telemetry generation requiring rapid ground station contact passes'
    ],
    narrativeBriefing: 'Global climate modeling relies on continuous calibrated satellite observations. You will insert an agile Earth observation platform into a 700 km Sun-Synchronous orbit passing over the poles at consistent local solar times.'
  },
  {
    id: 'deep-space-explorer',
    name: 'Deep Space Explorer',
    tagline: 'Venture beyond planetary orbits into the uncharted outer heliosphere.',
    destination: 'Outer Solar System / Heliopause Boundary',
    targetPlanet: 'DeepSpace',
    scientificObjective: 'Detect the solar wind termination shock, measure interstellar cosmic ray flux, and map the outer heliosphere magnetic boundary.',
    difficulty: 'Hard',
    budgetLimit: 1150, // $1.15B
    massLimit: 3200, // kg
    requiredInstrumentIds: ['magnetometer-fluxgate', 'detector-radiation', 'sensor-ir'],
    recommendedOrbitId: 'trajectory-deepspace',
    nominalDurationDays: 1200,
    specialChallenges: [
      'Solar power is useless past Jupiter (<4% flux); requires RTG or high-density power',
      'Extreme deep space thermal cold near absolute zero',
      'Enormous link path loss requires high-gain parabolic antenna and Deep Space Network coordination'
    ],
    narrativeBriefing: 'Following in the legendary footsteps of Voyager and New Horizons, your deep space probe will journey beyond the gas giants, probing where the Sun’s magnetic bubble meets interstellar space.'
  },
  {
    id: 'planet-hunter',
    name: 'Planet Hunter',
    tagline: 'Search the habitable zones of nearby star systems for Earth-like exoplanets.',
    destination: 'Earth-Sun L2 Halo Orbit',
    targetPlanet: 'Exoplanet',
    scientificObjective: 'Detect exoplanetary transits with micro-magnitude photometric precision and probe exoplanet atmospheres for water, ozone, and carbon dioxide.',
    difficulty: 'Medium',
    budgetLimit: 750, // $750M
    massLimit: 1750, // kg
    requiredInstrumentIds: ['cam-highres', 'sensor-ir', 'spectrometer-multispectral'],
    recommendedOrbitId: 'orbit-geo',
    nominalDurationDays: 360,
    specialChallenges: [
      'Thermal stability is paramount: even a 0.05°C mirror gradient distorts transit lightcurves',
      'Reaction wheels must operate with ultra-low micro-vibration'
    ],
    narrativeBriefing: 'Are we alone in the universe? Positioned in the ultra-quiet thermal shadow of the Earth-Sun Lagrange point, your space observatory will monitor thousands of stars to catch the brief dimming caused by orbiting worlds.'
  }
];

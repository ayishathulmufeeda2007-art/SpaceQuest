import { OrbitDefinition } from '../types';

export const ORBITS: OrbitDefinition[] = [
  {
    id: 'orbit-leo',
    name: 'Low Earth Orbit (LEO)',
    code: 'LEO-400',
    targetBody: 'Earth',
    altitudeKm: 400,
    periodMinutes: 92,
    eclipseMinutes: 36,
    deltaVRequiredKms: 9.3,
    commsLatencySec: 0.005,
    observationResolution: 'Ultra-High (Sub-meter optical ground resolution)',
    description: 'Circular orbital path skimming Earth’s upper thermosphere. Rapid 90-minute revolutions with frequent day-to-night thermal cycling.',
    compatibleDestinations: ['Earth']
  },
  {
    id: 'orbit-sso',
    name: 'Sun-Synchronous Polar Orbit (SSO)',
    code: 'SSO-700',
    targetBody: 'Earth',
    altitudeKm: 700,
    periodMinutes: 98,
    eclipseMinutes: 12,
    deltaVRequiredKms: 9.8,
    commsLatencySec: 0.015,
    observationResolution: 'High (Consistent illumination for global climate benchmarking)',
    description: 'Retrograde 98.2° polar orbit where orbital plane precesses at exactly the Earth’s solar orbit rate. Constant sunlight and repeatable ground tracks.',
    compatibleDestinations: ['Earth']
  },
  {
    id: 'orbit-geo',
    name: 'Geostationary Equatorial Orbit (GEO)',
    code: 'GEO-35786',
    targetBody: 'Earth',
    altitudeKm: 35786,
    periodMinutes: 1436, // 24 hours
    eclipseMinutes: 70, // during equinoxes
    deltaVRequiredKms: 12.2,
    commsLatencySec: 0.24,
    observationResolution: 'Continental (Persistent hemispheric weather and exoplanet transit monitoring)',
    description: 'Orbital period precisely synchronizes with Earth’s axial rotation, keeping the spacecraft locked over a fixed ground meridian.',
    compatibleDestinations: ['Earth', 'Exoplanet']
  },
  {
    id: 'trajectory-lunar',
    name: 'Trans-Lunar Injection & Polar Capture',
    code: 'TLI-LUNAR',
    targetBody: 'Moon',
    altitudeKm: 384400, // Distance to Moon
    periodMinutes: 118, // Lunar orbit period
    eclipseMinutes: 45,
    deltaVRequiredKms: 12.8,
    commsLatencySec: 1.28,
    observationResolution: 'High Polar (Direct line-of-sight to permanently shadowed craters)',
    description: 'Translunar ballistic transfer arc followed by a retrograde insertion burn into a frozen 100-km low lunar polar orbit.',
    compatibleDestinations: ['Moon']
  },
  {
    id: 'trajectory-mars',
    name: 'Hohmann Interplanetary Transfer to Mars',
    code: 'HEO-MARS',
    targetBody: 'Mars',
    altitudeKm: 225000000,
    periodMinutes: 420, // Aerocapture orbit period
    eclipseMinutes: 60,
    deltaVRequiredKms: 14.5,
    commsLatencySec: 840, // ~14 minutes one-way delay
    observationResolution: 'Orbital Reconnaissance (Decameter global mineral and atmospheric maps)',
    description: 'Heliocentric elliptical transfer orbit intersecting Mars’ orbital path after a 7-month cruise, requiring precise mid-course correction maneuvers.',
    compatibleDestinations: ['Mars']
  },
  {
    id: 'trajectory-deepspace',
    name: 'Solar System Escape / Heliopause Trajectory',
    code: 'ESCAPE-DEEP',
    targetBody: 'DeepSpace',
    altitudeKm: 18000000000, // Beyond Kuiper belt (~120 AU)
    periodMinutes: 0, // Hyperbolic trajectory
    eclipseMinutes: 0,
    deltaVRequiredKms: 16.8,
    commsLatencySec: 3600, // Hours
    observationResolution: 'In-Situ Boundary (Direct sampling of interstellar medium and cosmic rays)',
    description: 'Hyperbolic escape trajectory exceeding Solar System escape velocity ($V_{esc}$), journeying past the heliospheric termination shock.',
    compatibleDestinations: ['DeepSpace', 'Exoplanet']
  }
];

export function getRecommendedOrbit(targetPlanet: string): OrbitDefinition {
  const match = ORBITS.find(o => o.compatibleDestinations.includes(targetPlanet));
  return match || ORBITS[0];
}

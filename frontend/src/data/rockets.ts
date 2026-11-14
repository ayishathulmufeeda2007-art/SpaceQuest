import { LaunchVehicle } from '../types';

export const ROCKETS: LaunchVehicle[] = [
  {
    id: 'launcher-small',
    name: 'Aero-Dart Light Launcher',
    category: 'Small Launcher',
    payloadCapacityKg: 450, // LEO capacity
    costM: 18,
    reliability: 0.92,
    destinationCapability: ['Earth'],
    stages: 2,
    description: 'Carbon-composite 2-stage rocket tailored for CubeSats and low-mass Low Earth Orbit constellations. Cost-effective and rapidly deployable.'
  },
  {
    id: 'launcher-medium',
    name: 'Zephyr-9 Medium Lifter',
    category: 'Medium Launcher',
    payloadCapacityKg: 3800, // LEO capacity (or ~1400kg to Moon)
    costM: 62,
    reliability: 0.97,
    destinationCapability: ['Earth', 'Moon'],
    stages: 2,
    description: 'Two-stage cryogenic rocket using densified LOX/RP-1 propellant with flight-proven re-ignitable upper stage. Ideal for Earth observation and lunar orbiters.'
  },
  {
    id: 'launcher-heavy',
    name: 'Titan-V Heavy Booster',
    category: 'Heavy Launcher',
    payloadCapacityKg: 16500, // LEO capacity (or ~4500kg to Mars)
    costM: 135,
    reliability: 0.98,
    destinationCapability: ['Earth', 'Moon', 'Mars', 'Exoplanet'],
    stages: 3,
    description: 'Triple-core heavy lift launcher powered by staged-combustion hydrolox rocket engines. Delivers high injection energy for Mars and Lagrange point observatories.'
  },
  {
    id: 'launcher-superheavy',
    name: 'Prometheus Super Heavy',
    category: 'Super Heavy Launcher',
    payloadCapacityKg: 65000, // LEO capacity
    costM: 220,
    reliability: 0.99,
    destinationCapability: ['Earth', 'Moon', 'Mars', 'DeepSpace', 'Exoplanet'],
    stages: 2,
    description: 'Fully reusable stainless steel mega-launcher with 33 high-thrust methane engines. Capable of dispatching massive robotic flagship probes directly into solar escape trajectories.'
  }
];

export function checkRocketCapacity(rocket: LaunchVehicle, totalMassKg: number): {
  compatible: boolean;
  marginKg: number;
  marginPct: number;
  reason?: string;
} {
  const marginKg = rocket.payloadCapacityKg - totalMassKg;
  const marginPct = Math.round((marginKg / rocket.payloadCapacityKg) * 100);

  if (marginKg < 0) {
    return {
      compatible: false,
      marginKg,
      marginPct,
      reason: `Spacecraft mass (${totalMassKg} kg) exceeds rocket payload capacity (${rocket.payloadCapacityKg} kg) by ${Math.abs(marginKg)} kg.`
    };
  }

  return {
    compatible: true,
    marginKg,
    marginPct
  };
}

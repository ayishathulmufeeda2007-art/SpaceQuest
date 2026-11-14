import { SpacecraftComponent } from '../types';

export const BUS_PLATFORMS: SpacecraftComponent[] = [
  {
    id: 'bus-cubesat-6u',
    name: '6U CubeSat Micro-Bus',
    subsystem: 'structure',
    description: 'Standardized 6-Unit CubeSat modular aluminum frame. Compact, lightweight, rapid assembly, but limited payload volume.',
    massKg: 14,
    powerDrawW: -12, // Baseline avionics draw
    costM: 6,
    reliability: 0.90,
    properties: {
      pointingPrecisionArcsec: 120,
      thermalRangeK: [240, 320]
    },
    visualModelKey: 'cubesat'
  },
  {
    id: 'bus-smallsat-standard',
    name: 'Standard SmallSat Bus',
    subsystem: 'structure',
    description: 'Hexagonal carbon-composite bus with honeycombed equipment decks. Versatile workhorse for Earth and lunar science missions.',
    massKg: 180,
    powerDrawW: -65,
    costM: 32,
    reliability: 0.95,
    properties: {
      pointingPrecisionArcsec: 15,
      thermalRangeK: [220, 340]
    },
    visualModelKey: 'smallsat'
  },
  {
    id: 'bus-flagship-deepspace',
    name: 'Flagship Deep Space Bus',
    subsystem: 'structure',
    description: 'Heavy radiation-hardened titanium-beryllium primary truss with dual redundant telemetry conduits and thermal louvers.',
    massKg: 720,
    powerDrawW: -180,
    costM: 145,
    reliability: 0.99,
    properties: {
      pointingPrecisionArcsec: 3,
      thermalRangeK: [180, 360]
    },
    visualModelKey: 'flagship'
  }
];

export const COMPONENTS: SpacecraftComponent[] = [
  // --- POWER GENERATION ---
  {
    id: 'solar-body-mount',
    name: 'Body-Mounted Solar Cells',
    subsystem: 'power_generation',
    description: 'Triple-junction GaAs solar cells bonded directly onto bus surfaces. Immune to deployment failure, modest power generation.',
    massKg: 5,
    powerDrawW: 45, // Generates 45W at 1 AU
    costM: 4,
    reliability: 0.99,
    properties: { generationW: 45 },
    visualModelKey: 'solar_body'
  },
  {
    id: 'solar-deploy-wings',
    name: 'Deployable Solar Wings',
    subsystem: 'power_generation',
    description: 'Dual accordion-fold solar array wings with spring-loaded hinge locks. High surface area for demanding payload sensors.',
    massKg: 28,
    powerDrawW: 240, // Generates 240W at 1 AU
    costM: 18,
    reliability: 0.94,
    properties: { generationW: 240 },
    visualModelKey: 'solar_wings'
  },
  {
    id: 'solar-tracking-highpower',
    name: 'Articulated Tracking Arrays',
    subsystem: 'power_generation',
    description: 'Motorized dual-axis solar gimbals that track the Sun continuously throughout the orbit. Maximum solar efficiency.',
    massKg: 65,
    powerDrawW: 550, // Generates 550W at 1 AU
    costM: 42,
    reliability: 0.93,
    properties: { generationW: 550 },
    visualModelKey: 'solar_tracking'
  },
  {
    id: 'rtg-nuclear',
    name: 'Radioisotope Thermoelectric Generator (RTG)',
    subsystem: 'power_generation',
    description: 'Pu-238 decay heat converted to steady electricity via thermocouples. Unaffected by distance from the Sun or eclipses.',
    massKg: 56,
    powerDrawW: 220, // Continuous 220W anywhere in the universe
    costM: 85,
    reliability: 0.99,
    properties: { generationW: 220 },
    visualModelKey: 'rtg'
  },

  // --- BATTERIES ---
  {
    id: 'battery-compact-liion',
    name: 'Compact Li-Ion Pack (250 Wh)',
    subsystem: 'battery',
    description: 'Lightweight space-grade lithium-ion cell stack for CubeSat and short-duration eclipse passes.',
    massKg: 6,
    powerDrawW: 0,
    costM: 5,
    reliability: 0.94,
    properties: { capacityWh: 250 },
    visualModelKey: 'battery_small'
  },
  {
    id: 'battery-extended-liion',
    name: 'Extended Capacity Battery (900 Wh)',
    subsystem: 'battery',
    description: 'Thermally balanced battery module with active heater blankets and charge balancing circuits.',
    massKg: 24,
    powerDrawW: 0,
    costM: 16,
    reliability: 0.97,
    properties: { capacityWh: 900 },
    visualModelKey: 'battery_medium'
  },
  {
    id: 'battery-advanced-cryo',
    name: 'Deep Space Super-Battery (2400 Wh)',
    subsystem: 'battery',
    description: 'High-density solid-state battery array engineered for long occultations and high surge pulse radar operations.',
    massKg: 58,
    powerDrawW: 0,
    costM: 38,
    reliability: 0.98,
    properties: { capacityWh: 2400 },
    visualModelKey: 'battery_large'
  },

  // --- PROPULSION ---
  {
    id: 'prop-cold-gas',
    name: 'Cold Gas Micro-Thrusters',
    subsystem: 'propulsion',
    description: 'Pressurized nitrogen gas thruster system for attitude dumping and minor orbit trimming. Simple and non-toxic.',
    massKg: 12,
    powerDrawW: -8,
    costM: 7,
    reliability: 0.98,
    properties: { deltaVMs: 180 },
    visualModelKey: 'prop_coldgas'
  },
  {
    id: 'prop-hydrazine',
    name: 'Hydrazine Monopropellant Engine',
    subsystem: 'propulsion',
    description: 'Catalytic decomposition of hydrazine with 4 pulsed reaction control thrusters and 1 central apogee kick engine.',
    massKg: 75,
    powerDrawW: -25,
    costM: 26,
    reliability: 0.96,
    properties: { deltaVMs: 1100 },
    visualModelKey: 'prop_hydrazine'
  },
  {
    id: 'prop-ion-xenon',
    name: 'Hall-Effect Xenon Ion Engine',
    subsystem: 'propulsion',
    description: 'High specific-impulse electrostatic ion engine. Ultra-efficient propellant usage for interplanetary transit, high power draw.',
    massKg: 48,
    powerDrawW: -160,
    costM: 58,
    reliability: 0.95,
    properties: { deltaVMs: 3200 },
    visualModelKey: 'prop_ion'
  },

  // --- COMMUNICATIONS ---
  {
    id: 'comms-uhf-patch',
    name: 'Omnidirectional UHF Patch Antenna',
    subsystem: 'communications',
    description: 'Hemispherical coverage antenna. Reliable beacon and telemetry uplink, but modest data transfer rate.',
    massKg: 4,
    powerDrawW: -15,
    costM: 4,
    reliability: 0.99,
    properties: { dataRateMbps: 0.064 }, // 64 kbps
    visualModelKey: 'comms_patch'
  },
  {
    id: 'comms-xband-horn',
    name: 'Medium-Gain X-Band Horn Antenna',
    subsystem: 'communications',
    description: 'Steerable medium horn antenna designed for science telemetry and real-time downlink passes.',
    massKg: 14,
    powerDrawW: -45,
    costM: 18,
    reliability: 0.96,
    properties: { dataRateMbps: 2.5 }, // 2.5 Mbps
    visualModelKey: 'comms_horn'
  },
  {
    id: 'comms-highgain-dish',
    name: 'High-Gain Ka-Band Parabolic Dish (1.5m)',
    subsystem: 'communications',
    description: 'Gimballed carbon-mesh reflector providing high-bandwidth interplanetary data downlinks to NASA’s Deep Space Network.',
    massKg: 36,
    powerDrawW: -95,
    costM: 44,
    reliability: 0.95,
    properties: { dataRateMbps: 18.0 }, // 18 Mbps
    visualModelKey: 'comms_dish'
  },

  // --- ATTITUDE DETERMINATION & CONTROL (ADCS) ---
  {
    id: 'adcs-reaction-wheels',
    name: '3-Axis Reaction Wheel Assembly',
    subsystem: 'adcs',
    description: 'Three orthogonal momentum wheels with magnetorquers for momentum dumping. Stable 3-axis pointing.',
    massKg: 11,
    powerDrawW: -22,
    costM: 14,
    reliability: 0.94,
    properties: { pointingPrecisionArcsec: 25 },
    visualModelKey: 'adcs_wheels'
  },
  {
    id: 'adcs-star-tracker',
    name: 'Dual Autonomous Star Trackers',
    subsystem: 'adcs',
    description: 'Twin high-accuracy CCD star cameras with built-in stellar catalogs and fiber-optic gyroscopes for arcsecond pointing.',
    massKg: 19,
    powerDrawW: -38,
    costM: 29,
    reliability: 0.98,
    properties: { pointingPrecisionArcsec: 2 },
    visualModelKey: 'adcs_startracker'
  },

  // --- COMMAND & DATA HANDLING (COMPUTER) ---
  {
    id: 'cdh-rad-micro',
    name: 'Rad-Tolerant Micro-Controller (64 GB SSR)',
    subsystem: 'computer',
    description: 'Single-board computer with radiation-shielded flash memory. Capable of baseline housekeeping and sensor sampling.',
    massKg: 4,
    powerDrawW: -12,
    costM: 9,
    reliability: 0.95,
    properties: { storageGB: 64 },
    visualModelKey: 'cdh_micro'
  },
  {
    id: 'cdh-dual-redundant',
    name: 'Dual-Redundant Space Processor (512 GB SSR)',
    subsystem: 'computer',
    description: 'Lock-step voting multi-core flight computer with ECC memory, autonomous fault-detection and isolation (FDIR).',
    massKg: 12,
    powerDrawW: -34,
    costM: 32,
    reliability: 0.99,
    properties: { storageGB: 512 },
    visualModelKey: 'cdh_redundant'
  },

  // --- THERMAL CONTROL ---
  {
    id: 'thermal-passive-mli',
    name: 'Passive MLI Blankets & Silver Teflon Radiators',
    subsystem: 'thermal',
    description: 'Multi-Layer Insulation blankets with passive surface coatings. Zero power consumption, reliable thermal insulation.',
    massKg: 8,
    powerDrawW: 0,
    costM: 5,
    reliability: 0.99,
    properties: { thermalRangeK: [230, 330] },
    visualModelKey: 'thermal_passive'
  },
  {
    id: 'thermal-active-loop',
    name: 'Active Fluid Loop & Thermal Heaters',
    subsystem: 'thermal',
    description: 'Mechanically pumped single-phase fluid loop with proportional pulse heaters for sensitive cryogenic sensors and deep space cold.',
    massKg: 22,
    powerDrawW: -45,
    costM: 22,
    reliability: 0.96,
    properties: { thermalRangeK: [170, 360] },
    visualModelKey: 'thermal_active'
  }
];

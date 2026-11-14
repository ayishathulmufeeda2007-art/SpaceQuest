import { ScientificInstrument } from '../types';

export const INSTRUMENTS: ScientificInstrument[] = [
  {
    id: 'cam-highres',
    name: 'High-Resolution Framing Camera',
    wavelength: 'Visible (0.4 – 0.7 µm)',
    description: 'Telescopic optical imager capable of resolving decimeter-scale surface features, craters, cloud motions, and transit lightcurves.',
    massKg: 22,
    powerDrawW: 35,
    costM: 28,
    dataRateMbps: 8.5,
    scienceValue: 30,
    compatibleDestinations: ['Earth', 'Moon', 'Mars', 'Exoplanet'],
    suitableObjectives: [
      'high-resolution planetary surface mapping',
      'polar ice cap monitoring',
      'exoplanet transit photometry',
      'geological fault tracing'
    ],
    visualIcon: 'Camera'
  },
  {
    id: 'sensor-ir',
    name: 'Thermal Infrared Radiometer & Spectrometer',
    wavelength: 'Thermal IR (5 – 50 µm)',
    description: 'Cooled detector mapping planetary surface temperatures, thermophysical inertia, volatile frost deposits, and atmospheric thermal emission.',
    massKg: 32,
    powerDrawW: 55,
    costM: 42,
    dataRateMbps: 4.8,
    scienceValue: 38,
    compatibleDestinations: ['Earth', 'Moon', 'Mars', 'DeepSpace', 'Exoplanet'],
    suitableObjectives: [
      'subsurface ice temperature mapping',
      'thermal inertia analysis',
      'greenhouse gas signatures',
      'stellar infrared excess'
    ],
    visualIcon: 'Flame'
  },
  {
    id: 'spectrometer-multispectral',
    name: 'UV / Visible / Near-IR Imaging Spectrometer',
    wavelength: 'UV – Near-IR (0.2 – 2.5 µm)',
    description: 'Disperses light into hundreds of contiguous spectral channels to fingerprint mineral absorption bands, hydration features, and organics.',
    massKg: 28,
    powerDrawW: 48,
    costM: 45,
    dataRateMbps: 7.2,
    scienceValue: 40,
    compatibleDestinations: ['Earth', 'Moon', 'Mars', 'Exoplanet'],
    suitableObjectives: [
      'mineral hydration detection',
      'clay and carbonate identification',
      'vegetation indices and aerosol optical depth',
      'exoplanet atmospheric absorption spectroscopy'
    ],
    visualIcon: 'Rainbow'
  },
  {
    id: 'radar-sar',
    name: 'Synthetic Aperture Surface Radar (SAR)',
    wavelength: 'Microwave L-Band (1.2 GHz)',
    description: 'Active microwave pulses penetrate dry dust and permanent shadows to image subsurface topography, buried ice sheets, and lava tubes.',
    massKg: 62,
    powerDrawW: 165,
    costM: 65,
    dataRateMbps: 16.0,
    scienceValue: 50,
    compatibleDestinations: ['Earth', 'Moon', 'Mars'],
    suitableObjectives: [
      'permanent shadow water ice sounding',
      'subsurface paleo-channel detection',
      'surface roughness and dielectric constant profiling',
      'glacier displacement interferometry'
    ],
    visualIcon: 'Radio'
  },
  {
    id: 'magnetometer-fluxgate',
    name: 'Triaxial Fluxgate Magnetometer Boom',
    wavelength: 'Magnetic Fields (DC – 60 Hz)',
    description: 'Mounted on an isolated deployable boom to eliminate spacecraft EMI. Measures planetary crustal magnetization and solar wind dynamics.',
    massKg: 7,
    powerDrawW: 12,
    costM: 14,
    dataRateMbps: 1.2,
    scienceValue: 26,
    compatibleDestinations: ['Earth', 'Moon', 'Mars', 'DeepSpace'],
    suitableObjectives: [
      'crustal remnant paleomagnetism',
      'solar wind heliopause boundary mapping',
      'magnetosphere storm dynamics',
      'induced ionospheric magnetic loops'
    ],
    visualIcon: 'Compass'
  },
  {
    id: 'sensor-atmospheric',
    name: 'Atmospheric Trace Gas Limb Sounder',
    wavelength: 'Submillimeter & NIR (1.4 – 3.3 µm)',
    description: 'Scans atmospheric horizons to measure vertical concentration profiles of methane, ozone, water vapor, and isotopic ratios.',
    massKg: 24,
    powerDrawW: 38,
    costM: 36,
    dataRateMbps: 3.5,
    scienceValue: 36,
    compatibleDestinations: ['Earth', 'Mars', 'Exoplanet'],
    suitableObjectives: [
      'atmospheric methane plume detection',
      'isotopic D/H fractionation',
      'stratospheric ozone depletion',
      'aerosol haze vertical distribution'
    ],
    visualIcon: 'Wind'
  },
  {
    id: 'detector-radiation',
    name: 'Energetic Particle & Cosmic Ray Dosimeter',
    wavelength: 'High-Energy Ionizing Radiation (10 keV – 1 GeV)',
    description: 'Silicon sensor telescope classifying galactic cosmic rays (GCRs), solar energetic protons, and secondary neutrons for space weather.',
    massKg: 9,
    powerDrawW: 14,
    costM: 16,
    dataRateMbps: 1.8,
    scienceValue: 28,
    compatibleDestinations: ['Earth', 'Moon', 'Mars', 'DeepSpace'],
    suitableObjectives: [
      'solar cosmic ray monitoring',
      'heliosphere termination shock particle flux',
      'astronaut biological radiation dose mapping',
      'van Allen belt particle trapping'
    ],
    visualIcon: 'ShieldAlert'
  },
  {
    id: 'soil-analyzer',
    name: 'In-Situ Sample Thermal Mass Spectrometer',
    wavelength: 'Chemical & Volatile Ion Mass (1 – 500 Da)',
    description: 'Oven pyrolysis coupled with quadrupole mass spectrometry to sniff volatile compounds, carbon chains, and amino acid precursors in regolith.',
    massKg: 38,
    powerDrawW: 75,
    costM: 58,
    dataRateMbps: 2.2,
    scienceValue: 48,
    compatibleDestinations: ['Moon', 'Mars'],
    suitableObjectives: [
      'regolith organic biosignature identification',
      'noble gas isotope geochronology',
      'volatile water release kinetics',
      'soil perchlorate and oxidant assays'
    ],
    visualIcon: 'Beaker'
  }
];

export function getInstrumentCompatibility(
  instrument: ScientificInstrument,
  missionTarget: string,
  requiredIds: string[]
): 'COMPATIBLE' | 'PARTIALLY USEFUL' | 'NOT SUITABLE' {
  const isRequired = requiredIds.includes(instrument.id);
  const isDestinationCompatible = instrument.compatibleDestinations.includes(missionTarget);

  if (isRequired) {
    return 'COMPATIBLE';
  }
  if (isDestinationCompatible) {
    return 'PARTIALLY USEFUL';
  }
  return 'NOT SUITABLE';
}

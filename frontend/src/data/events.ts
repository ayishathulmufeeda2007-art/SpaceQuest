import { SpaceEvent } from '../types';

export const RANDOM_SPACE_EVENTS: SpaceEvent[] = [
  {
    id: 'solar-storm',
    title: 'CORONAL MASS EJECTION WARNING!',
    severity: 'critical',
    description: 'A massive solar flare has erupted from Sunspot Region 3664! A high-density cloud of energetic solar protons and coronal plasma is directly on intercept trajectory with your spacecraft.',
    humorousQuote: '“Houston, the Sun is currently throwing a temper tantrum in our general direction!”',
    choices: [
      {
        label: 'Activate Emergency Safe Mode',
        description: 'Orient solar arrays edge-on, shut down delicate focal plane sensors, and spin-stabilize the bus until proton flux drops below 10 pfu.',
        consequences: {
          powerDrainWh: 40,
          survivalRiskDelta: -10,
          humorousOutcome: 'Spacecraft safely curled up in a digital blanket. All sensors protected, though you missed 4 hours of prime science!'
        }
      },
      {
        label: 'Ride the Storm & Record Solar Corona!',
        description: 'Keep all spectrometers and radiation sensors active to capture unprecedented real-time coronal shockwave physics.',
        consequences: {
          scienceBonus: 25,
          survivalRiskDelta: 15,
          humorousOutcome: 'Bold science! The science team is weeping tears of scientific joy, though two pixels on the camera got fried like bacon.'
        }
      },
      {
        label: 'Divert Battery Power to Magnetic Deflector Coil',
        description: 'Energize the onboard magnetic dipole shield coils to repel incoming charged ions away from the central avionics bay.',
        consequences: {
          powerDrainWh: 180,
          scienceBonus: 10,
          survivalRiskDelta: -5,
          humorousOutcome: 'Magnetic shield held firm! Battery took a hefty beating, but the avionics didn’t even reboot.'
        }
      }
    ]
  },
  {
    id: 'battery-critical',
    title: 'ECLIPSE BATTERY BROWNOUT DETECTED!',
    severity: 'warning',
    description: 'During a prolonged planetary shadow pass, heater power consumption exceeded telemetry forecasts. Bus voltage dropped below 23.4V, approaching low-voltage cut-off!',
    humorousQuote: '“Who plugged in the space toaster during an orbital eclipse?!”',
    choices: [
      {
        label: 'Jettison Payload Heaters & Sleep Non-Essentials',
        description: 'Command secondary scientific payload heaters offline to preserve core flight computer and reaction wheel power.',
        consequences: {
          powerDrainWh: 0,
          survivalRiskDelta: -8,
          humorousOutcome: 'Payload chilled down to -40°C, but computer stayed awake. As soon as sunlight hit the arrays, everything recovered nicely.'
        }
      },
      {
        label: 'Cycle Reaction Wheels to Low-RPM Glide',
        description: 'Switch from high-torque 3-axis pointing to slow inertial drift to cut motor power consumption by 80%.',
        consequences: {
          powerDrainWh: 0,
          survivalRiskDelta: 0,
          humorousOutcome: 'Graceful drift saved 60 Watts. Spacecraft gently spun like a cosmic ballerina until sunrise.'
        }
      },
      {
        label: 'Overdrive Array Charge Regulators on Re-Emergence',
        description: 'Bypass trickle-charge limits upon exiting shadow to fast-charge batteries at maximum solar flux.',
        consequences: {
          powerDrainWh: -50, // Net recharge bonus
          survivalRiskDelta: 8,
          humorousOutcome: 'Rapid burst charged the cells to 100% in 15 minutes! The battery technician aged three years watching the thermal gauges.'
        }
      }
    ]
  },
  {
    id: 'micrometeorite-alert',
    title: 'MICROMETEORITE IMPACT WARNING!',
    severity: 'warning',
    description: 'Orbital optical tracking picked up a cloud of millimeter-scale hypervelocity cometary dust on a crossing trajectory. Impact probability estimated at 18%!',
    humorousQuote: '“Space is mostly empty, but when it isn’t empty, it’s traveling at 22 kilometers per second.”',
    choices: [
      {
        label: 'Execute Avoidance Burn with RCS Thrusters',
        description: 'Fire cold-gas / chemical thrusters for a 4.2 m/s prograde orbital nudge to clear the debris plane.',
        consequences: {
          propellantUsedKg: 8,
          survivalRiskDelta: -12,
          humorousOutcome: 'Clean evasive maneuver! Debris cloud whipped past harmlessly 400 meters to the starboard side.'
        }
      },
      {
        label: 'Slew Spacecraft Behind Whipple Shield Plate',
        description: 'Turn the thickest structural bus bulkhead and antenna dish toward the incoming debris vector as an armored barrier.',
        consequences: {
          survivalRiskDelta: -4,
          humorousOutcome: 'CLANG! A microscopic dust grain left a neat crater on the outer aluminum bumper, but zero internal penetration!'
        }
      },
      {
        label: 'Trust Kepler’s Math & Hold Course',
        description: 'Space is 99.999% vacuum. Maintain scientific pointing and trust statistical odds.',
        consequences: {
          survivalRiskDelta: 10,
          humorousOutcome: 'A close call! A particle grazed a solar panel hinge. A loud beep in mission control, but you survived unscathed.'
        }
      }
    ]
  },
  {
    id: 'comms-glitch',
    title: 'DEEP SPACE NETWORK SIGNAL JITTER!',
    severity: 'warning',
    description: 'Ground telemetry carrier lock lost at the Goldstone 70m antenna! High phase noise and bit errors are corrupting incoming telemetry packets.',
    humorousQuote: '“Have you tried turning the deep space dish off and back on again?”',
    choices: [
      {
        label: 'Switch to Low-Frequency Omni Beacon',
        description: 'Fallback to robust low-rate UHF carrier beacon to send vital heartbeat telemetry and confirm bus health.',
        consequences: {
          survivalRiskDelta: -5,
          humorousOutcome: 'Heartbeat tone detected clear and strong! Ground stations cheered and began troubleshooting their downlink receiver.'
        }
      },
      {
        label: 'Recalibrate Star-Tracker & Re-Point High-Gain Dish',
        description: 'Execute an automated dual star-camera slew to recalculate Earth ephemeris vector down to 0.01 degrees.',
        consequences: {
          scienceBonus: 10,
          survivalRiskDelta: -2,
          humorousOutcome: 'Dead center lock acquired! Ka-band downlink jumped from 0 Mbps right up to maximum throughput.'
        }
      },
      {
        label: 'Buffer Science to Solid-State Flash & Retry Later',
        description: 'Store all pending high-resolution observations into onboard flash memory until the Madrid ground station rotates into view.',
        consequences: {
          survivalRiskDelta: 0,
          humorousOutcome: 'Data safely queued in flash memory. No lost packets, just a slight delay for the scientists waiting with coffee.'
        }
      }
    ]
  },
  {
    id: 'instrument-overheating',
    title: 'INFRARED DETECTOR THERMAL SPIKE!',
    severity: 'warning',
    description: 'Reflected planetary albedo and prolonged sun exposure have raised the optical cryocooler bench temperature above 85 Kelvin!',
    humorousQuote: '“Our cryogenic sensor thinks it is at a beach resort instead of deep space!”',
    choices: [
      {
        label: 'Deploy Radiator Sun-Shade & Spin-Pitch',
        description: 'Maneuver the spacecraft to cast the bus chassis shadow directly over the instrument radiator array.',
        consequences: {
          survivalRiskDelta: -6,
          humorousOutcome: 'Instant chill! Deep space black body radiation cooled the sensor back to crisp cryogenic operating specs.'
        }
      },
      {
        label: 'Pulse Active Fluid Heat Pipe Cooler',
        description: 'Command fluid heat pipes to maximum duty cycle to pump thermal energy away to the space-facing radiator.',
        consequences: {
          powerDrainWh: 50,
          survivalRiskDelta: -4,
          humorousOutcome: 'Coolant pumps whirred smoothly, dissipating the heat spike. Battery drained a bit, but sensor survived.'
        }
      },
      {
        label: 'Throttle Science Duty Cycle to 30%',
        description: 'Operate the sensor in short 5-minute bursts with cooling rest intervals.',
        consequences: {
          scienceBonus: -5,
          survivalRiskDelta: -8,
          humorousOutcome: 'Conservative and safe. Science cadence slowed down slightly, but no hardware was risked.'
        }
      }
    ]
  }
];

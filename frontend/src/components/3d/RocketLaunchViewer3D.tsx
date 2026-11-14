import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { LaunchVehicle, SpacecraftComponent, ScientificInstrument } from '../../types';
import { sound } from '../../utils/soundEngine';
import { Play, FastForward, Satellite, Rocket, Eye, ShieldCheck, Sparkles } from 'lucide-react';

interface RocketLaunchViewer3DProps {
  rocket: LaunchVehicle;
  missionName: string;
  bus?: SpacecraftComponent;
  components?: SpacecraftComponent[];
  instruments?: ScientificInstrument[];
  onLaunchComplete: () => void;
}

export const RocketLaunchViewer3D: React.FC<RocketLaunchViewer3DProps> = ({
  rocket,
  missionName,
  bus,
  components = [],
  instruments = [],
  onLaunchComplete
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState('SPACECRAFT SECURED IN PAYLOAD FAIRING • READY FOR LIFTOFF');
  const [isLaunching, setIsLaunching] = useState(false);
  const [stageProgress, setStageProgress] = useState(0);
  const [cameraFocus, setCameraFocus] = useState<'spacecraft' | 'rocket'>('spacecraft');
  const [fairingVisible, setFairingVisible] = useState(true);

  // Refs for smooth animation loop without re-instantiating WebGL
  const cameraFocusRef = useRef<'spacecraft' | 'rocket'>(cameraFocus);
  cameraFocusRef.current = cameraFocus;

  const isLaunchingRef = useRef(isLaunching);
  isLaunchingRef.current = isLaunching;

  const fairingVisibleRef = useRef(fairingVisible);
  fairingVisibleRef.current = fairingVisible;

  const rocketGroupRef = useRef<THREE.Group | null>(null);
  const boosterStageRef = useRef<THREE.Mesh | null>(null);
  const upperStageRef = useRef<THREE.Mesh | null>(null);
  const fairingLeftRef = useRef<THREE.Mesh | null>(null);
  const fairingRightRef = useRef<THREE.Mesh | null>(null);
  const spacecraftModelRef = useRef<THREE.Group | null>(null);
  const exhaustFlameRef = useRef<THREE.Mesh | null>(null);
  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const craftPlasmaRef = useRef<THREE.Mesh | null>(null);

  // Default bus fallback
  const activeBus = bus || {
    id: 'cubesat-3u',
    name: '3U CubeSat Bus',
    subsystem: 'structure' as const,
    massKg: 4,
    powerDrawW: 5,
    costMillions: 0.8,
    reliabilityPct: 92,
    description: 'CubeSat bus'
  };

  // Synchronous launch trigger
  const startLaunchSequence = useCallback(() => {
    if (isLaunching) return;
    setIsLaunching(true);
    setCountdown(10);
    sound.playSwitch();
  }, [isLaunching]);

  // Main 3D Scene setup
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.002);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Dynamic Starfield Background
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 600;
      starPos[i * 3 + 1] = Math.random() * 400 - 50;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 600;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x93c5fd, size: 1.2, transparent: true, opacity: 0.85 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Lights
    const ambientLight = new THREE.AmbientLight(0x475569, 2.2);
    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xfffbeb, 3.2);
    sun.position.set(30, 60, 30);
    scene.add(sun);

    const padFloodlight = new THREE.SpotLight(0x06b6d4, 4, 90, Math.PI / 4, 0.5);
    padFloodlight.position.set(-18, 20, 18);
    padFloodlight.target.position.set(0, 16, 0);
    scene.add(padFloodlight);
    scene.add(padFloodlight.target);

    // Launch Pad Ground Platform
    const padGeo = new THREE.CylinderGeometry(14, 16, 2, 32);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = -1;
    scene.add(pad);

    // Launch Gantry Tower
    const towerGeo = new THREE.BoxGeometry(2, 28, 2);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.5 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(-6, 13, 0);
    scene.add(tower);

    // Umbilical Service Arm to Spacecraft Fairing
    const armGeo = new THREE.BoxGeometry(5, 0.5, 0.5);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(-3, 19, 0);
    scene.add(arm);

    // ==========================================
    // ROCKET & SPACECRAFT STACK
    // ==========================================
    const rocketGroup = new THREE.Group();
    scene.add(rocketGroup);
    rocketGroupRef.current = rocketGroup;

    const boosterRadius = rocket.category.includes('Super') ? 1.8 : 1.2;
    const boosterHeight = 10;
    const stage2Height = 5;

    // Stage 1 Booster Core
    const boosterGeo = new THREE.CylinderGeometry(boosterRadius, boosterRadius, boosterHeight, 32);
    const boosterMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.6 });
    const booster = new THREE.Mesh(boosterGeo, boosterMat);
    booster.position.y = boosterHeight / 2;
    rocketGroup.add(booster);
    boosterStageRef.current = booster;

    // Stage 2 Upper Stage
    const stage2Geo = new THREE.CylinderGeometry(boosterRadius, boosterRadius, stage2Height, 32);
    const stage2Mat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.7 });
    const stage2 = new THREE.Mesh(stage2Geo, stage2Mat);
    stage2.position.y = boosterHeight + stage2Height / 2;
    rocketGroup.add(stage2);
    upperStageRef.current = stage2;

    // Rocket Base Nozzles
    const nozzleCount = rocket.category.includes('Heavy') ? 5 : 1;
    for (let i = 0; i < nozzleCount; i++) {
      const nozzleGeo = new THREE.ConeGeometry(0.38, 0.9, 16, 1, true);
      const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.95 });
      const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
      if (nozzleCount === 1) {
        nozzle.position.set(0, -0.4, 0);
      } else {
        const angle = (i / nozzleCount) * Math.PI * 2;
        nozzle.position.set(Math.cos(angle) * 0.7, -0.4, Math.sin(angle) * 0.7);
      }
      rocketGroup.add(nozzle);
    }

    // Rocket Fiery Thruster Exhaust Flame
    const flameGeo = new THREE.ConeGeometry(boosterRadius * 0.95, 7.5, 24);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffedd5, transparent: true, opacity: 0.0 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0, -4.0, 0);
    flame.rotation.x = Math.PI;
    rocketGroup.add(flame);
    exhaustFlameRef.current = flame;

    // Launch Smoke Particle System
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const particlePosArr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePosArr[i * 3] = (Math.random() - 0.5) * 12;
      particlePosArr[i * 3 + 1] = Math.random() * 2;
      particlePosArr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePosArr, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 2.8, transparent: true, opacity: 0.0 });
    const smoke = new THREE.Points(particleGeo, particleMat);
    scene.add(smoke);
    smokeParticlesRef.current = smoke;

    // ==========================================
    // THE PLAYER'S CUSTOM SPACECRAFT (MOUNTED ON TOP)
    // ==========================================
    const spacecraftGroup = new THREE.Group();
    const craftYPos = boosterHeight + stage2Height + 1.2;
    spacecraftGroup.position.set(0, craftYPos, 0);
    rocketGroup.add(spacecraftGroup);
    spacecraftModelRef.current = spacecraftGroup;

    // 1. Spacecraft Bus Structure
    const isCubeSat = activeBus.id.includes('cubesat');
    const isFlagship = activeBus.id.includes('flagship');

    let craftBusMesh: THREE.Mesh;
    if (isCubeSat) {
      const geo = new THREE.BoxGeometry(0.75, 1.5, 0.75);
      const mat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.3 });
      craftBusMesh = new THREE.Mesh(geo, mat);

      // Gold MLI panel
      const panelMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95 });
      const sideA = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 1.3), panelMat);
      sideA.position.set(0, 0, 0.39);
      craftBusMesh.add(sideA);
    } else if (isFlagship) {
      const geo = new THREE.CylinderGeometry(0.95, 1.05, 1.9, 8);
      const mat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 });
      craftBusMesh = new THREE.Mesh(geo, mat);

      const goldBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.97, 1.02, 0.7, 8),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95 })
      );
      craftBusMesh.add(goldBand);
    } else {
      const geo = new THREE.CylinderGeometry(0.8, 0.8, 1.4, 6);
      const mat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.75, roughness: 0.3 });
      craftBusMesh = new THREE.Mesh(geo, mat);

      const foil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.82, 0.82, 0.55, 6),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 })
      );
      craftBusMesh.add(foil);
    }
    spacecraftGroup.add(craftBusMesh);

    // 2. Solar Panels (Deployable)
    const hasSolar = components.some(c => c.subsystem === 'power_generation' && c.id !== 'rtg-nuclear');
    if (hasSolar || components.length === 0) {
      const wingGeo = new THREE.BoxGeometry(1.6, 0.04, 0.6);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.95,
        emissive: 0x075985,
        emissiveIntensity: 0.4
      });
      const wingLeft = new THREE.Mesh(wingGeo, wingMat);
      wingLeft.position.set(-1.25, 0, 0);
      const wingRight = new THREE.Mesh(wingGeo, wingMat);
      wingRight.position.set(1.25, 0, 0);

      spacecraftGroup.add(wingLeft);
      spacecraftGroup.add(wingRight);
    }

    // 3. Communications Dish
    const hasDish = components.some(c => c.id === 'comms-highgain-dish');
    if (hasDish || isFlagship) {
      const dishGeo = new THREE.SphereGeometry(0.55, 20, 12, 0, Math.PI * 2, 0, Math.PI / 3);
      const dishMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, side: THREE.DoubleSide });
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dish.position.set(0, 0.95, 0);
      dish.rotation.x = -Math.PI / 2;
      spacecraftGroup.add(dish);
    }

    // 4. Thruster Engine & Ion Plasma Glow
    const hasIon = components.some(c => c.id === 'prop-ion-xenon');
    const hasEngine = components.some(c => c.subsystem === 'propulsion') || true;
    if (hasEngine) {
      const thruster = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 0.55, 16, 1, true),
        new THREE.MeshStandardMaterial({ color: 0x18181b, side: THREE.DoubleSide, metalness: 0.9 })
      );
      thruster.position.set(0, -0.95, 0);
      spacecraftGroup.add(thruster);

      const plasma = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 16),
        new THREE.MeshBasicMaterial({ color: hasIon ? 0x38bdf8 : 0xf97316, transparent: true, opacity: 0.85 })
      );
      plasma.position.set(0, -1.05, 0);
      spacecraftGroup.add(plasma);
      craftPlasmaRef.current = plasma;
    }

    // 5. Scientific Instruments
    instruments.forEach((inst) => {
      if (inst.id === 'cam-highres' || inst.id.includes('cam')) {
        const cam = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.14, 0.4, 16),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
        );
        cam.position.set(0.35, 0.35, 0.45);
        cam.rotation.x = Math.PI / 2;
        spacecraftGroup.add(cam);
      } else if (inst.id === 'radar-sar' || inst.id.includes('radar')) {
        const radar = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.05, 0.35),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 })
        );
        radar.position.set(0, -0.45, 0.5);
        spacecraftGroup.add(radar);
      }
    });

    // 6. Spacecraft Blinking Beacon LEDs
    const beaconGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 0.85, 0.45);
    spacecraftGroup.add(beacon);

    // ==========================================
    // TRANSLUCENT PROTECTIVE PAYLOAD FAIRING HALVES
    // ==========================================
    const fairingHeight = 5.0;
    const fairingMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.35,
      roughness: 0.2,
      metalness: 0.8,
      side: THREE.DoubleSide
    });

    // Left Fairing Half
    const fairingLeftGeo = new THREE.ConeGeometry(boosterRadius * 1.05, fairingHeight, 24, 1, true, 0, Math.PI);
    const fairingLeft = new THREE.Mesh(fairingLeftGeo, fairingMat);
    fairingLeft.position.set(0, craftYPos + fairingHeight / 2 - 0.5, 0);
    rocketGroup.add(fairingLeft);
    fairingLeftRef.current = fairingLeft;

    // Right Fairing Half
    const fairingRightGeo = new THREE.ConeGeometry(boosterRadius * 1.05, fairingHeight, 24, 1, true, Math.PI, Math.PI);
    const fairingRight = new THREE.Mesh(fairingRightGeo, fairingMat);
    fairingRight.position.set(0, craftYPos + fairingHeight / 2 - 0.5, 0);
    rocketGroup.add(fairingRight);
    fairingRightRef.current = fairingRight;

    // Window resize handler
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Animation loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Dynamic Fairing Visibility Toggle
      if (fairingLeftRef.current && fairingRightRef.current) {
        fairingLeftRef.current.visible = fairingVisibleRef.current;
        fairingRightRef.current.visible = fairingVisibleRef.current;
      }

      // Flame flicker during ascent
      if (exhaustFlameRef.current && exhaustFlameRef.current.material instanceof THREE.MeshBasicMaterial) {
        if (exhaustFlameRef.current.material.opacity > 0) {
          exhaustFlameRef.current.scale.set(
            1 + Math.sin(time * 30) * 0.15,
            1 + Math.cos(time * 40) * 0.25,
            1 + Math.sin(time * 30) * 0.15
          );
        }
      }

      // Spacecraft Ion Plasma Pulse
      if (craftPlasmaRef.current) {
        const pulse = 1 + Math.sin(time * 15) * 0.3;
        craftPlasmaRef.current.scale.set(pulse, pulse, pulse);
      }

      // Beacon LED blink
      beacon.visible = Math.sin(time * 6) > 0;

      // CAMERA TRACKING
      if (!isLaunchingRef.current) {
        if (cameraFocusRef.current === 'spacecraft') {
          // Close orbit around the player's spacecraft at top of stack
          camera.position.set(Math.sin(time * 0.4) * 6, craftYPos + 0.3, Math.cos(time * 0.4) * 6);
          camera.lookAt(0, craftYPos, 0);
        } else {
          // Overview of the entire rocket stack on the launchpad
          camera.position.set(Math.sin(time * 0.15) * 22, 12, Math.cos(time * 0.15) * 22);
          camera.lookAt(0, 9, 0);
        }
      } else {
        // DURING LAUNCH: Camera climbs with the spacecraft to keep it in view!
        if (spacecraftModelRef.current) {
          const craftWorldPos = new THREE.Vector3();
          spacecraftModelRef.current.getWorldPosition(craftWorldPos);

          if (cameraFocusRef.current === 'spacecraft') {
            camera.position.set(
              craftWorldPos.x + Math.sin(time * 0.5) * 6.5,
              craftWorldPos.y + 0.8,
              craftWorldPos.z + Math.cos(time * 0.5) * 6.5
            );
            camera.lookAt(craftWorldPos);
          } else {
            camera.position.set(
              craftWorldPos.x + 8,
              craftWorldPos.y - 4,
              craftWorldPos.z + 20
            );
            camera.lookAt(craftWorldPos);
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [rocket, activeBus, components, instruments]);

  // Handle countdown timer & multi-stage launch sequence
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      sound.playCountdownBeep(false);
      setStatusMessage(`T-MINUS ${countdown} SECONDS • ENGINES CHILLED FOR FLIGHT`);

      const timer = setTimeout(() => {
        setCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      // LIFTOFF!
      sound.playCountdownBeep(true);
      sound.playRocketLaunch();
      setStatusMessage('LIFTOFF! BOOSTING YOUR SPACECRAFT TOWARDS ORBIT!');

      // Ignite Flame and Smoke
      if (exhaustFlameRef.current && exhaustFlameRef.current.material instanceof THREE.MeshBasicMaterial) {
        exhaustFlameRef.current.material.opacity = 0.95;
        exhaustFlameRef.current.material.color.setHex(0xf97316);
      }
      if (smokeParticlesRef.current && smokeParticlesRef.current.material instanceof THREE.PointsMaterial) {
        smokeParticlesRef.current.material.opacity = 0.9;
      }

      // Ascent animation
      let startTime = performance.now();
      const ascentInterval = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        const pct = Math.min(100, Math.round((elapsed / 7.0) * 100));
        setStageProgress(pct);

        if (rocketGroupRef.current) {
          // Accelerate rocket upward smoothly
          rocketGroupRef.current.position.y = 0.35 * (elapsed * elapsed);

          // Pitch over gravity turn
          if (rocketGroupRef.current.position.y > 6) {
            rocketGroupRef.current.rotation.z = -Math.min(0.35, (rocketGroupRef.current.position.y - 6) * 0.015);
          }
        }

        // T+3.2s: PAYLOAD FAIRING JETTISON (REVEALS YOUR CUSTOM SPACECRAFT!)
        if (elapsed >= 3.2 && elapsed < 4.8) {
          setStatusMessage('FAIRING JETTISON! YOUR SPACECRAFT IS EXPOSED TO SPACE!');
          sound.playSwitch();

          // Push the fairing halves horizontally away
          const fairingShift = (elapsed - 3.2) * 2.2;
          if (fairingLeftRef.current) {
            fairingLeftRef.current.position.x = -fairingShift;
            fairingLeftRef.current.rotation.z = fairingShift * 0.3;
          }
          if (fairingRightRef.current) {
            fairingRightRef.current.position.x = fairingShift;
            fairingRightRef.current.rotation.z = -fairingShift * 0.3;
          }
        }

        // T+4.8s: BOOSTER & UPPER STAGE SEPARATION (YOUR SPACECRAFT FLIES ALONE!)
        else if (elapsed >= 4.8 && elapsed < 6.2) {
          setStatusMessage('SPACECRAFT SEPARATION! UPPER STAGE DETACHED!');

          const dropOffset = (elapsed - 4.8) * 3.5;
          if (boosterStageRef.current) {
            boosterStageRef.current.position.y = (10 / 2) - dropOffset * 1.5;
          }
          if (upperStageRef.current) {
            upperStageRef.current.position.y = (10 + 5 / 2) - dropOffset;
          }
        }

        // T+6.2s: ORBIT INSERTION CONFIRMED
        else if (elapsed >= 6.2) {
          setStatusMessage('SPACECRAFT ORBIT INSERTION CONFIRMED • WELCOME TO SPACE!');
        }

        if (elapsed >= 7.0) {
          clearInterval(ascentInterval);
          onLaunchComplete();
        }
      }, 50);

      return () => clearInterval(ascentInterval);
    }
  }, [countdown, onLaunchComplete]);

  return (
    <div className="relative w-full h-[540px] bg-slate-950 rounded-3xl border border-cyan-500/40 overflow-hidden shadow-2xl flex flex-col justify-between">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Top Telemetry & View Controls */}
      <div className="relative z-10 m-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-cyan-500/40 flex items-center gap-3 shadow-xl">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              LAUNCH VEHICLE & PAYLOAD
            </div>
            <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span className="text-slate-300">{rocket.name}</span>
              <span className="text-slate-500">→</span>
              <span className="text-cyan-300 font-bold flex items-center gap-1.5 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/40">
                <Satellite className="w-4 h-4 text-cyan-400" />
                {activeBus.name}
              </span>
            </div>
          </div>
        </div>

        {/* View Controls (Interactive) */}
        {!isLaunching && (
          <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-xl">
            {/* Camera Focus: Spacecraft vs Rocket */}
            <button
              onClick={() => { setCameraFocus('spacecraft'); sound.playClick(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                cameraFocus === 'spacecraft'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              FOCUS: SPACECRAFT
            </button>
            <button
              onClick={() => { setCameraFocus('rocket'); sound.playClick(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                cameraFocus === 'rocket'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              FULL ROCKET
            </button>

            {/* Toggle Fairing Visibility */}
            <button
              onClick={() => { setFairingVisible(!fairingVisible); sound.playClick(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                fairingVisible
                  ? 'bg-slate-800 text-cyan-300 border-cyan-500/40 hover:bg-slate-700'
                  : 'bg-amber-500/20 text-amber-300 border-amber-400/60'
              }`}
              title="Show or hide payload fairing cover"
            >
              <Eye className="w-3.5 h-3.5" />
              {fairingVisible ? 'FAIRING: TRANSLUCENT' : 'FAIRING: REMOVED'}
            </button>
          </div>
        )}
      </div>

      {/* Center Countdown Display */}
      {countdown !== null && (
        <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-7xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_35px_rgba(6,182,212,0.95)] animate-pulse">
            {countdown > 0 ? `T-${countdown}` : 'LIFTOFF!'}
          </div>
          <div className="mt-3 text-sm font-mono font-bold text-cyan-300 bg-slate-900/90 px-6 py-2.5 rounded-full border border-cyan-400/50 shadow-2xl flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            {statusMessage}
          </div>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div className="relative z-10 m-4 p-4 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-cyan-500/40 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Satellite className="w-3.5 h-3.5 text-cyan-400" />
              <span>SPACECRAFT ASCENT & SEPARATION</span>
            </span>
            <span className="text-cyan-400 font-bold">{stageProgress}% TO ORBIT</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-150"
              style={{ width: `${stageProgress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isLaunching ? (
            <button
              onClick={startLaunchSequence}
              className="px-7 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-mono font-black text-sm rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              LAUNCH SPACECRAFT NOW
            </button>
          ) : (
            <button
              onClick={onLaunchComplete}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-600 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FastForward className="w-4 h-4 text-cyan-400" />
              SKIP TO ORBIT
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

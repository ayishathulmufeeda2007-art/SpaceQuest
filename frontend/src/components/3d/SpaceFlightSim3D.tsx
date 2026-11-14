import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MissionDefinition, MissionPhase, TelemetryStream, SpacecraftComponent, ScientificInstrument } from '../../types';
import { Eye, Compass, Satellite, FastForward, Play, Pause, Activity, Radio, Sparkles } from 'lucide-react';
import { sound } from '../../utils/soundEngine';

interface SpaceFlightSim3DProps {
  mission: MissionDefinition;
  missionPhase: MissionPhase;
  phaseProgress: number; // 0 to 100
  telemetry: TelemetryStream;
  bus?: SpacecraftComponent;
  components?: SpacecraftComponent[];
  instruments?: ScientificInstrument[];
  onSimTick?: (tickProgress: number) => void;
}

export const SpaceFlightSim3D: React.FC<SpaceFlightSim3DProps> = ({
  mission,
  missionPhase,
  phaseProgress,
  telemetry,
  bus,
  components = [],
  instruments = []
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraMode, setCameraMode] = useState<'free' | 'follow' | 'target'>('follow');
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Fallback bus if none selected
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

  // State refs to prevent recreating the Three.js scene on every state tick
  const phaseProgressRef = useRef(phaseProgress);
  phaseProgressRef.current = phaseProgress;

  const missionPhaseRef = useRef(missionPhase);
  missionPhaseRef.current = missionPhase;

  const cameraModeRef = useRef(cameraMode);
  cameraModeRef.current = cameraMode;

  const craftRef = useRef<THREE.Group | null>(null);
  const earthRef = useRef<THREE.Group | null>(null);
  const moonMeshRef = useRef<THREE.Mesh | null>(null);
  const marsGroupRef = useRef<THREE.Group | null>(null);
  const scanConeRef = useRef<THREE.Mesh | null>(null);
  const commsBeamRef = useRef<THREE.Line | null>(null);
  const plasmaGlowRef = useRef<THREE.Mesh | null>(null);
  const beaconRef = useRef<THREE.Mesh | null>(null);

  // Setup 3D Scene
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 540;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.0004);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 4000);
    camera.position.set(0, 35, 75);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Deep Starfield (3,000 points)
    const starCount = 3000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, transparent: true, opacity: 0.8 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Sun (Central Glowing Star)
    const sunGroup = new THREE.Group();
    sunGroup.position.set(-180, 20, -120);
    scene.add(sunGroup);

    const sunGeo = new THREE.SphereGeometry(18, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    // Sun Corona Glow
    const sunCoronaGeo = new THREE.SphereGeometry(24, 32, 32);
    const sunCoronaMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.35 });
    sunGroup.add(new THREE.Mesh(sunCoronaGeo, sunCoronaMat));

    // Sun Light Source
    const sunLight = new THREE.PointLight(0xffffff, 3.5, 3000, 0.2);
    sunLight.position.copy(sunGroup.position);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.6);
    scene.add(ambientLight);

    // --- CELESTIAL BODIES ---
    // 1. Earth
    const earthGroup = new THREE.Group();
    earthGroup.position.set(0, 0, 0);
    scene.add(earthGroup);
    earthRef.current = earthGroup;

    const earthGeo = new THREE.SphereGeometry(6, 48, 48);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x1d4ed8,
      emissive: 0x0f172a,
      specular: 0x38bdf8,
      shininess: 25
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Earth Atmosphere Haze
    const earthAtmoGeo = new THREE.SphereGeometry(6.4, 32, 32);
    const earthAtmoMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide
    });
    earthGroup.add(new THREE.Mesh(earthAtmoGeo, earthAtmoMat));

    // 2. Moon
    const moonGroup = new THREE.Group();
    earthGroup.add(moonGroup);

    const moonGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const moonMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(24, 0, 0);
    moonGroup.add(moonMesh);
    moonMeshRef.current = moonMesh;

    // Moon Orbit Ring
    const moonRingGeo = new THREE.RingGeometry(23.8, 24.2, 64);
    const moonRingMat = new THREE.MeshBasicMaterial({ color: 0x475569, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const moonRing = new THREE.Mesh(moonRingGeo, moonRingMat);
    moonRing.rotation.x = Math.PI / 2;
    earthGroup.add(moonRing);

    // 3. Mars
    const marsGroup = new THREE.Group();
    marsGroup.position.set(85, 0, -45);
    scene.add(marsGroup);
    marsGroupRef.current = marsGroup;

    const marsGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const marsMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    const marsMesh = new THREE.Mesh(marsGeo, marsMat);
    marsGroup.add(marsMesh);

    // Mars Atmospheric Tint
    const marsAtmoGeo = new THREE.SphereGeometry(3.7, 32, 32);
    const marsAtmoMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.2, side: THREE.BackSide });
    marsGroup.add(new THREE.Mesh(marsAtmoGeo, marsAtmoMat));

    // Interplanetary Transfer Trajectory Orbit Line
    const trajectoryPoints: THREE.Vector3[] = [];
    const steps = 80;
    const destPos = mission.targetPlanet === 'Moon' 
      ? new THREE.Vector3(24, 0, 0)
      : (mission.targetPlanet === 'Mars' ? new THREE.Vector3(85, 0, -45) : new THREE.Vector3(140, 10, -90));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = (1 - t) * 0 + t * destPos.x + Math.sin(t * Math.PI) * 15;
      const y = Math.sin(t * Math.PI) * 4;
      const z = (1 - t) * 0 + t * destPos.z + Math.cos(t * Math.PI) * 8;
      trajectoryPoints.push(new THREE.Vector3(x, y, z));
    }
    const trajectoryGeo = new THREE.BufferGeometry().setFromPoints(trajectoryPoints);
    const trajectoryMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.6 });
    const trajectoryLine = new THREE.Line(trajectoryGeo, trajectoryMat);
    scene.add(trajectoryLine);

    // ==========================================
    // THE PLAYER'S CUSTOM SPACECRAFT IN ORBIT
    // ==========================================
    const craftGroup = new THREE.Group();
    scene.add(craftGroup);
    craftRef.current = craftGroup;

    // 1. Bus Form Factor
    const isCubeSat = activeBus.id.includes('cubesat');
    const isFlagship = activeBus.id.includes('flagship');

    let craftBody: THREE.Mesh;
    if (isCubeSat) {
      const geo = new THREE.BoxGeometry(1.0, 1.8, 1.0);
      const mat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.85 });
      craftBody = new THREE.Mesh(geo, mat);

      // Gold MLI panel face
      const goldFace = new THREE.Mesh(
        new THREE.PlaneGeometry(0.85, 1.6),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.2 })
      );
      goldFace.position.set(0, 0, 0.52);
      craftBody.add(goldFace);
    } else if (isFlagship) {
      const geo = new THREE.CylinderGeometry(1.3, 1.4, 2.2, 8);
      const mat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 });
      craftBody = new THREE.Mesh(geo, mat);

      const goldBand = new THREE.Mesh(
        new THREE.CylinderGeometry(1.32, 1.38, 0.9, 8),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.15 })
      );
      craftBody.add(goldBand);
    } else {
      const geo = new THREE.CylinderGeometry(1.1, 1.1, 1.7, 6);
      const mat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.2, metalness: 0.75 });
      craftBody = new THREE.Mesh(geo, mat);

      const goldFoil = new THREE.Mesh(
        new THREE.CylinderGeometry(1.12, 1.12, 0.7, 6),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 })
      );
      craftBody.add(goldFoil);
    }
    craftGroup.add(craftBody);

    // 2. Power Systems (Deployable Solar Array or RTG)
    const hasRTG = components.some(c => c.id === 'rtg-nuclear');
    if (hasRTG) {
      const rtgCanister = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16),
        new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.7, metalness: 0.5 })
      );
      rtgCanister.position.set(1.5, 0, 0);
      rtgCanister.rotation.z = Math.PI / 2;
      craftGroup.add(rtgCanister);
    } else {
      // Dual Solar Wings
      const wingGeo = new THREE.BoxGeometry(3.6, 0.04, 1.1);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.95,
        roughness: 0.2,
        emissive: 0x0369a1,
        emissiveIntensity: 0.4
      });
      const wings = new THREE.Mesh(wingGeo, wingMat);
      craftGroup.add(wings);
    }

    // 3. Communications Dish
    const hasDish = components.some(c => c.id === 'comms-highgain-dish') || isFlagship;
    if (hasDish) {
      const dishGeo = new THREE.SphereGeometry(0.85, 20, 12, 0, Math.PI * 2, 0, Math.PI / 3);
      const dishMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, side: THREE.DoubleSide, metalness: 0.6 });
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dish.position.set(0, 1.2, 0);
      dish.rotation.x = -Math.PI / 2;
      craftGroup.add(dish);

      // Gold Sub-reflector feed
      const feed = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9 })
      );
      feed.position.set(0, 1.45, 0);
      craftGroup.add(feed);
    }

    // 4. Propulsion Thruster & Ion Plasma Glow
    const hasIon = components.some(c => c.id === 'prop-ion-xenon');
    const nozzle = new THREE.Mesh(
      new THREE.ConeGeometry(0.38, 0.7, 16, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x18181b, side: THREE.DoubleSide, metalness: 0.95 })
    );
    nozzle.position.set(0, -1.1, 0);
    craftGroup.add(nozzle);

    const plasma = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: hasIon ? 0x38bdf8 : 0xf97316, transparent: true, opacity: 0.85 })
    );
    plasma.position.set(0, -1.25, 0);
    craftGroup.add(plasma);
    plasmaGlowRef.current = plasma;

    // 5. Scientific Instruments
    instruments.forEach((inst) => {
      if (inst.id === 'cam-highres' || inst.id.includes('cam')) {
        const cam = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 0.5, 16),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
        );
        cam.position.set(0.45, 0.4, 0.65);
        cam.rotation.x = Math.PI / 2;
        craftGroup.add(cam);
      } else if (inst.id === 'radar-sar' || inst.id.includes('radar')) {
        const radar = new THREE.Mesh(
          new THREE.BoxGeometry(2.0, 0.06, 0.45),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85 })
        );
        radar.position.set(0, -0.6, 0.7);
        craftGroup.add(radar);
      }
    });

    // 6. Blinking Beacon LED
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    beacon.position.set(0, 1.1, 0.5);
    craftGroup.add(beacon);
    beaconRef.current = beacon;

    // Science Scan Cone (Active during science observations)
    const scanGeo = new THREE.ConeGeometry(4, 14, 16, 1, true);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide
    });
    const scanCone = new THREE.Mesh(scanGeo, scanMat);
    scanCone.position.set(0, -7, 0);
    craftGroup.add(scanCone);
    scanConeRef.current = scanCone;

    // Ground Comms Signal Line
    const commsPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];
    const commsGeo = new THREE.BufferGeometry().setFromPoints(commsPoints);
    const commsMat = new THREE.LineDashedMaterial({ color: 0x10b981, dashSize: 1, gapSize: 0.5 });
    const commsBeam = new THREE.Line(commsGeo, commsMat);
    commsBeam.computeLineDistances();
    scene.add(commsBeam);
    commsBeamRef.current = commsBeam;

    // Mouse drag controls for free view
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let camYaw = 0.2;
    let camPitch = 0.4;
    let camDist = 60;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      camYaw += dx * 0.006;
      camPitch += dy * 0.006;
      camPitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, camPitch));
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseUp = () => { isDragging = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camDist += e.deltaY * 0.05;
      camDist = Math.max(15, Math.min(250, camDist));
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    mount.addEventListener('wheel', onWheel, { passive: false });

    // Resize
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Earth & Celestial rotation
      earthGroup.rotation.y += delta * 0.08;
      moonGroup.rotation.y += delta * 0.2;
      marsGroup.rotation.y += delta * 0.06;

      // Pulse Ion plasma glow
      if (plasmaGlowRef.current) {
        const pulse = 1 + Math.sin(time * 12) * 0.25;
        plasmaGlowRef.current.scale.set(pulse, pulse, pulse);
      }

      // Blink beacon
      if (beaconRef.current) {
        beaconRef.current.visible = Math.sin(time * 5) > 0;
      }

      // Read current phase progress smoothly from ref
      const currentProgress = phaseProgressRef.current;
      const currentPhase = missionPhaseRef.current;
      const currentCamMode = cameraModeRef.current;

      // Position spacecraft along trajectory
      if (craftGroup) {
        const t = Math.max(0.01, Math.min(0.99, currentProgress / 100));
        const index = Math.floor(t * (trajectoryPoints.length - 1));
        const currentPt = trajectoryPoints[index];
        const nextPt = trajectoryPoints[Math.min(trajectoryPoints.length - 1, index + 1)];

        craftGroup.position.copy(currentPt);
        craftGroup.lookAt(nextPt);

        // Scan cone visibility
        if (scanConeRef.current && scanConeRef.current.material instanceof THREE.MeshBasicMaterial) {
          if (currentPhase === 'science_ops') {
            scanConeRef.current.material.opacity = 0.35 + Math.sin(time * 8) * 0.15;
          } else {
            scanConeRef.current.material.opacity = 0;
          }
        }

        // Comms beam to Earth
        if (commsBeamRef.current) {
          if (currentPhase === 'data_downlink') {
            commsBeamRef.current.visible = true;
            const pts = [craftGroup.position, earthGroup.position];
            commsBeamRef.current.geometry.setFromPoints(pts);
            commsBeamRef.current.computeLineDistances();
          } else {
            commsBeamRef.current.visible = false;
          }
        }
      }

      // Camera view modes
      if (currentCamMode === 'follow' && craftGroup) {
        camera.position.x = craftGroup.position.x + 8;
        camera.position.y = craftGroup.position.y + 6;
        camera.position.z = craftGroup.position.z + 14;
        camera.lookAt(craftGroup.position);
      } else if (currentCamMode === 'target') {
        const targetPos = mission.targetPlanet === 'Moon' 
          ? (moonMeshRef.current ? moonMeshRef.current.getWorldPosition(new THREE.Vector3()) : destPos)
          : (mission.targetPlanet === 'Mars' ? marsGroup.position : earthGroup.position);
        camera.position.set(targetPos.x + 12, targetPos.y + 8, targetPos.z + 15);
        camera.lookAt(targetPos);
      } else {
        // Free Orbit Camera
        camera.position.x = Math.sin(camYaw) * Math.cos(camPitch) * camDist;
        camera.position.y = Math.sin(camPitch) * camDist + 5;
        camera.position.z = Math.cos(camYaw) * Math.cos(camPitch) * camDist;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      mount.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [mission, activeBus, components, instruments]);

  return (
    <div className="relative w-full h-[540px] bg-slate-950 rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl flex flex-col justify-between">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD: Current Flight Phase & Spacecraft Designation */}
      <div className="relative z-10 m-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/40 flex items-center gap-3 shadow-xl">
          <Satellite className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <div>
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
              ACTIVE CRAFT: {activeBus.name}
            </div>
            <div className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
              <span>{missionPhase.replace('_', ' ')}</span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-300">{mission.destination}</span>
            </div>
          </div>
        </div>

        {/* Telemetry Quick Badges */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono">
            <span className="text-slate-400">DISTANCE:</span>{' '}
            <span className="text-cyan-300 font-bold">{telemetry.distanceFromEarthKm.toLocaleString()} KM</span>
          </div>
          <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono">
            <span className="text-slate-400">SPEED:</span>{' '}
            <span className="text-emerald-400 font-bold">{telemetry.orbitalSpeedKms} KM/S</span>
          </div>
          <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono">
            <span className="text-slate-400">BATTERY:</span>{' '}
            <span className="text-amber-400 font-bold">{telemetry.batteryLevelPct}%</span>
          </div>
        </div>
      </div>

      {/* Science Scan / Downlink Visual Indicator Banner */}
      {missionPhase === 'science_ops' && (
        <div className="relative z-10 self-center px-4 py-1.5 bg-cyan-950/80 backdrop-blur-md border border-cyan-400/50 rounded-full text-xs font-mono text-cyan-300 flex items-center gap-2 animate-pulse pointer-events-none">
          <Activity className="w-4 h-4 text-cyan-400 animate-bounce" />
          ACTIVE SCIENTIFIC SCAN CONE ENGAGED • ACQUIRING CALIBRATED SPECTRA
        </div>
      )}

      {missionPhase === 'data_downlink' && (
        <div className="relative z-10 self-center px-4 py-1.5 bg-emerald-950/80 backdrop-blur-md border border-emerald-400/50 rounded-full text-xs font-mono text-emerald-300 flex items-center gap-2 animate-pulse pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          DEEP SPACE NETWORK LOCK VERIFIED • TRANSMITTING SCIENCE DATA TO EARTH
        </div>
      )}

      {/* Bottom Controls Bar: Camera switchers & Simulation controls */}
      <div className="relative z-10 m-4 p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
        {/* Camera Angles */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase mr-1">CAMERA:</span>
          <button
            onClick={() => { setCameraMode('follow'); sound.playClick(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              cameraMode === 'follow' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            CHASE CRAFT
          </button>
          <button
            onClick={() => { setCameraMode('target'); sound.playClick(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              cameraMode === 'target' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            TARGET FOCUS
          </button>
          <button
            onClick={() => { setCameraMode('free'); sound.playClick(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              cameraMode === 'free' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            FREE ORBIT
          </button>
        </div>

        {/* Sim Speed Toggles */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase mr-1">TIME WARP:</span>
          <button
            onClick={() => { setIsPaused(!isPaused); sound.playClick(); }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>
          {[1, 5, 20].map((spd) => (
            <button
              key={spd}
              onClick={() => { setSimSpeed(spd); sound.playClick(); }}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                simSpeed === spd 
                  ? 'bg-cyan-500 text-slate-950 font-bold' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

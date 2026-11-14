import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  MissionDefinition, 
  SpacecraftComponent, 
  ScientificInstrument, 
  OrbitDefinition, 
  ResourceMetrics,
  TelemetryStream 
} from '../../types';
import { 
  Satellite, 
  Eye, 
  Compass, 
  Play, 
  Pause, 
  Radio, 
  Activity, 
  Zap, 
  Globe2, 
  Sparkles, 
  Trophy, 
  Layers, 
  Clock, 
  Maximize2 
} from 'lucide-react';
import { sound } from '../../utils/soundEngine';

interface LiveSpacecraftTracker3DProps {
  mission: MissionDefinition;
  bus: SpacecraftComponent;
  components: SpacecraftComponent[];
  instruments: ScientificInstrument[];
  orbit: OrbitDefinition;
  metrics: ResourceMetrics;
  telemetry: TelemetryStream;
  onViewReport: () => void;
  onViewDiscoveries: () => void;
}

export const LiveSpacecraftTracker3D: React.FC<LiveSpacecraftTracker3DProps> = ({
  mission,
  bus,
  components,
  instruments,
  orbit,
  metrics,
  telemetry,
  onViewReport,
  onViewDiscoveries
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraMode, setCameraMode] = useState<'chase' | 'overview' | 'nadir' | 'free'>('overview');
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showGroundTrack, setShowGroundTrack] = useState<boolean>(true);

  // Live real-time orbital dynamic telemetry
  const [orbitDynamics, setOrbitDynamics] = useState({
    trueAnomalyDeg: 0,
    currentAltitudeKm: orbit.altitudeKm > 50000 ? 350 : orbit.altitudeKm,
    currentVelocityKms: 7.6,
    subSatLatDeg: 0,
    subSatLonDeg: 0,
    isInEclipse: false,
    activeDSNStation: 'Goldstone (USA)',
    commsSignalStrengthPct: 94,
    batteryPowerW: metrics.powerGenerationW
  });

  // State refs for smooth 60 FPS animation without re-mounting Three.js
  const cameraModeRef = useRef(cameraMode);
  cameraModeRef.current = cameraMode;

  const simSpeedRef = useRef(simSpeed);
  simSpeedRef.current = simSpeed;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  // Scene references
  const spacecraftGroupRef = useRef<THREE.Group | null>(null);
  const planetMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const orbitTrailRef = useRef<THREE.Line | null>(null);
  const dsnBeamRef = useRef<THREE.Line | null>(null);
  const scanConeRef = useRef<THREE.Mesh | null>(null);
  const plasmaGlowRef = useRef<THREE.Mesh | null>(null);
  const beaconRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 560;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.0006);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 3000);
    camera.position.set(0, 18, 38);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Deep Starfield Background
    const starCount = 2500;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 1800;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 1800;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 1800;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 1.4, transparent: true, opacity: 0.85 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Sun Vector Light (Creates Day & Night Eclipse Terminator)
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 3.2);
    sunLight.position.set(120, 20, 80);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    scene.add(ambientLight);

    // ==========================================
    // 3D CELESTIAL TARGET BODY
    // ==========================================
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    const targetPlanet = mission.targetPlanet;
    let planetRadius = 8;
    let planetMesh: THREE.Mesh;

    if (targetPlanet === 'Moon') {
      planetRadius = 7.5;
      const moonGeo = new THREE.SphereGeometry(planetRadius, 48, 48);
      const moonMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.85,
        metalness: 0.1
      });
      planetMesh = new THREE.Mesh(moonGeo, moonMat);

      // Craters and Maria Surface details
      const craterCount = 18;
      for (let i = 0; i < craterCount; i++) {
        const phi = Math.random() * Math.PI;
        const theta = Math.random() * Math.PI * 2;
        const craterRadius = 0.5 + Math.random() * 1.4;
        const craterGeo = new THREE.CircleGeometry(craterRadius, 16);
        const craterMat = new THREE.MeshBasicMaterial({ color: 0x475569, side: THREE.DoubleSide });
        const crater = new THREE.Mesh(craterGeo, craterMat);

        const x = planetRadius * Math.sin(phi) * Math.cos(theta);
        const y = planetRadius * Math.sin(phi) * Math.sin(theta);
        const z = planetRadius * Math.cos(phi);
        crater.position.set(x * 1.002, y * 1.002, z * 1.002);
        crater.lookAt(0, 0, 0);
        planetMesh.add(crater);
      }

      // Distant Earth in the sky
      const distantEarthGeo = new THREE.SphereGeometry(2.0, 32, 32);
      const distantEarthMat = new THREE.MeshPhongMaterial({ color: 0x1d4ed8, emissive: 0x0f172a, specular: 0x38bdf8 });
      const distantEarth = new THREE.Mesh(distantEarthGeo, distantEarthMat);
      distantEarth.position.set(55, 20, -50);
      scene.add(distantEarth);

    } else if (targetPlanet === 'Mars') {
      planetRadius = 8.0;
      const marsGeo = new THREE.SphereGeometry(planetRadius, 48, 48);
      const marsMat = new THREE.MeshStandardMaterial({
        color: 0xc2410c,
        roughness: 0.75,
        metalness: 0.15
      });
      planetMesh = new THREE.Mesh(marsGeo, marsMat);

      // North & South Polar Ice Caps
      const iceCapMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
      const northCap = new THREE.Mesh(new THREE.ConeGeometry(2.4, 0.4, 24), iceCapMat);
      northCap.position.set(0, planetRadius * 0.98, 0);
      planetMesh.add(northCap);

      const southCap = new THREE.Mesh(new THREE.ConeGeometry(2.2, 0.4, 24), iceCapMat);
      southCap.position.set(0, -planetRadius * 0.98, 0);
      southCap.rotation.x = Math.PI;
      planetMesh.add(southCap);

      // Martian Atmospheric Glow
      const atmoGeo = new THREE.SphereGeometry(planetRadius * 1.06, 32, 32);
      const atmoMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.22, side: THREE.BackSide });
      planetGroup.add(new THREE.Mesh(atmoGeo, atmoMat));

    } else if (targetPlanet === 'DeepSpace') {
      planetRadius = 6.0;
      // Distant Asteroid / Exoplanet with Ring
      const astGeo = new THREE.DodecahedronGeometry(planetRadius, 2);
      const astMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
      planetMesh = new THREE.Mesh(astGeo, astMat);

      // Golden Dust Rings
      const ringGeo = new THREE.RingGeometry(planetRadius * 1.4, planetRadius * 2.2, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xd97706, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
      const rings = new THREE.Mesh(ringGeo, ringMat);
      rings.rotation.x = Math.PI / 2.5;
      planetGroup.add(rings);

    } else {
      // Default: Earth
      planetRadius = 8.5;
      const earthGeo = new THREE.SphereGeometry(planetRadius, 48, 48);
      const earthMat = new THREE.MeshPhongMaterial({
        color: 0x1e3a8a,
        emissive: 0x091024,
        specular: 0x38bdf8,
        shininess: 30
      });
      planetMesh = new THREE.Mesh(earthGeo, earthMat);

      // Swirling Cloud Atmosphere Layer
      const cloudsGeo = new THREE.SphereGeometry(planetRadius * 1.025, 32, 32);
      const cloudsMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        transparent: true,
        opacity: 0.35,
        roughness: 0.9
      });
      const clouds = new THREE.Mesh(cloudsGeo, cloudsMat);
      planetMesh.add(clouds);
      cloudsMeshRef.current = clouds;

      // Cyan Atmospheric Haze
      const atmoGeo = new THREE.SphereGeometry(planetRadius * 1.06, 32, 32);
      const atmoMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.25, side: THREE.BackSide });
      planetGroup.add(new THREE.Mesh(atmoGeo, atmoMat));
    }

    planetGroup.add(planetMesh);
    planetMeshRef.current = planetMesh;

    // ==========================================
    // 3D ORBIT TRAJECTORY ELLIPSE (GMAT PROPAGATION)
    // ==========================================
    const semiMajorA = planetRadius + 7.5;
    const eccentricity = orbit.id.includes('geo') || orbit.id.includes('sso') ? 0.05 : 0.22;
    const semiMinorB = semiMajorA * Math.sqrt(1 - eccentricity * eccentricity);
    const inclinationRad = THREE.MathUtils.degToRad(orbit.id.includes('sso') ? 98.2 : 28.5);

    const orbitPoints: THREE.Vector3[] = [];
    const orbitSegments = 120;
    for (let i = 0; i <= orbitSegments; i++) {
      const theta = (i / orbitSegments) * Math.PI * 2;
      // Ellipse coordinates with center offset by focus c = a * e
      const x = semiMajorA * Math.cos(theta) - (semiMajorA * eccentricity);
      const z = semiMinorB * Math.sin(theta);
      // Incline orbit
      const y = z * Math.sin(inclinationRad);
      const inclinedZ = z * Math.cos(inclinationRad);
      orbitPoints.push(new THREE.Vector3(x, y, inclinedZ));
    }

    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.75
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    scene.add(orbitLine);
    orbitTrailRef.current = orbitLine;

    // Day/Night Shadow Cylinder Indicator (Planetary Eclipse Region)
    const shadowGeo = new THREE.CylinderGeometry(planetRadius * 0.95, planetRadius * 1.1, 40, 24, 1, true);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const shadowCone = new THREE.Mesh(shadowGeo, shadowMat);
    shadowCone.position.set(-20, -3.5, -13);
    shadowCone.rotation.z = Math.PI / 2;
    shadowCone.lookAt(sunLight.position);
    scene.add(shadowCone);

    // ==========================================
    // THE PLAYER'S CUSTOM SPACECRAFT IN ORBIT
    // ==========================================
    const spacecraftGroup = new THREE.Group();
    scene.add(spacecraftGroup);
    spacecraftGroupRef.current = spacecraftGroup;

    // 1. Bus Form Factor
    const isCubeSat = bus.id.includes('cubesat');
    const isFlagship = bus.id.includes('flagship');

    let craftBody: THREE.Mesh;
    if (isCubeSat) {
      const geo = new THREE.BoxGeometry(0.85, 1.6, 0.85);
      const mat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.85 });
      craftBody = new THREE.Mesh(geo, mat);

      const goldFace = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 1.4),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.2 })
      );
      goldFace.position.set(0, 0, 0.44);
      craftBody.add(goldFace);
    } else if (isFlagship) {
      const geo = new THREE.CylinderGeometry(1.2, 1.3, 2.0, 8);
      const mat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 });
      craftBody = new THREE.Mesh(geo, mat);

      const goldBand = new THREE.Mesh(
        new THREE.CylinderGeometry(1.22, 1.28, 0.8, 8),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.15 })
      );
      craftBody.add(goldBand);
    } else {
      const geo = new THREE.CylinderGeometry(0.95, 0.95, 1.5, 6);
      const mat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.2, metalness: 0.75 });
      craftBody = new THREE.Mesh(geo, mat);

      const goldFoil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.97, 0.97, 0.6, 6),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 })
      );
      craftBody.add(goldFoil);
    }
    spacecraftGroup.add(craftBody);

    // 2. Power Systems (Solar Wings or RTG Canister)
    const hasRTG = components.some(c => c.id === 'rtg-nuclear');
    if (hasRTG) {
      const rtgCanister = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 1.1, 16),
        new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.7, metalness: 0.5 })
      );
      rtgCanister.position.set(1.4, 0, 0);
      rtgCanister.rotation.z = Math.PI / 2;
      craftBody.add(rtgCanister);
    } else {
      const wingGeo = new THREE.BoxGeometry(3.4, 0.04, 1.0);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.95,
        roughness: 0.2,
        emissive: 0x0369a1,
        emissiveIntensity: 0.4
      });
      const wings = new THREE.Mesh(wingGeo, wingMat);
      craftBody.add(wings);
    }

    // 3. Communications Dish
    const hasDish = components.some(c => c.id === 'comms-highgain-dish') || isFlagship;
    if (hasDish) {
      const dishGeo = new THREE.SphereGeometry(0.75, 20, 12, 0, Math.PI * 2, 0, Math.PI / 3);
      const dishMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, side: THREE.DoubleSide, metalness: 0.6 });
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dish.position.set(0, 1.1, 0);
      dish.rotation.x = -Math.PI / 2;
      craftBody.add(dish);

      const feed = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9 })
      );
      feed.position.set(0, 1.35, 0);
      craftBody.add(feed);
    }

    // 4. Propulsion Thruster & Ion Plasma Glow
    const hasIon = components.some(c => c.id === 'prop-ion-xenon');
    const nozzle = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 0.65, 16, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x18181b, side: THREE.DoubleSide, metalness: 0.95 })
    );
    nozzle.position.set(0, -1.0, 0);
    craftBody.add(nozzle);

    const plasma = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshBasicMaterial({ color: hasIon ? 0x38bdf8 : 0xf97316, transparent: true, opacity: 0.85 })
    );
    plasma.position.set(0, -1.15, 0);
    craftBody.add(plasma);
    plasmaGlowRef.current = plasma;

    // 5. Scientific Instruments
    instruments.forEach((inst) => {
      if (inst.id.includes('cam')) {
        const cam = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.16, 0.45, 16),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
        );
        cam.position.set(0.4, 0.35, 0.55);
        cam.rotation.x = Math.PI / 2;
        craftBody.add(cam);
      } else if (inst.id.includes('radar')) {
        const radar = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 0.05, 0.4),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85 })
        );
        radar.position.set(0, -0.5, 0.6);
        craftBody.add(radar);
      }
    });

    // 6. Beacon LED
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    beacon.position.set(0, 0.95, 0.45);
    craftBody.add(beacon);
    beaconRef.current = beacon;

    // Scientific Planetary Scanning Cone
    const scanGeo = new THREE.ConeGeometry(3.5, 12, 16, 1, true);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const scanCone = new THREE.Mesh(scanGeo, scanMat);
    scanCone.position.set(0, -6, 0);
    craftBody.add(scanCone);
    scanConeRef.current = scanCone;

    // Ground DSN Comms Signal Beam
    const dsnPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];
    const dsnGeo = new THREE.BufferGeometry().setFromPoints(dsnPoints);
    const dsnMat = new THREE.LineDashedMaterial({ color: 0x10b981, dashSize: 0.8, gapSize: 0.4 });
    const dsnBeam = new THREE.Line(dsnGeo, dsnMat);
    dsnBeam.computeLineDistances();
    scene.add(dsnBeam);
    dsnBeamRef.current = dsnBeam;

    // Mouse drag controls for Free Camera
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let camYaw = 0.3;
    let camPitch = 0.35;
    let camDist = 38;

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
      camPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, camPitch));
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseUp = () => { isDragging = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camDist += e.deltaY * 0.04;
      camDist = Math.max(12, Math.min(120, camDist));
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

    // ==========================================
    // 60 FPS ANIMATION & ORBIT PROPAGATION LOOP
    // ==========================================
    let animId: number;
    let orbitAngle = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Planet axial rotation
      if (planetMeshRef.current) {
        planetMeshRef.current.rotation.y += delta * 0.06;
      }
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += delta * 0.09;
      }

      // Propagate orbit angle based on speed
      if (!isPausedRef.current) {
        const speedMultiplier = simSpeedRef.current;
        // Keplerian angular velocity: faster near periapsis
        const rCurrent = semiMajorA * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(orbitAngle));
        const angularVelocity = (0.28 / (rCurrent / semiMajorA)) * speedMultiplier;
        orbitAngle = (orbitAngle + delta * angularVelocity) % (Math.PI * 2);
      }

      // Compute true position along elliptical orbit
      const curX = semiMajorA * Math.cos(orbitAngle) - (semiMajorA * eccentricity);
      const rawZ = semiMinorB * Math.sin(orbitAngle);
      const curY = rawZ * Math.sin(inclinationRad);
      const curZ = rawZ * Math.cos(inclinationRad);

      // Compute next forward position for attitude pointing (velocity vector)
      const nextAngle = orbitAngle + 0.02;
      const nX = semiMajorA * Math.cos(nextAngle) - (semiMajorA * eccentricity);
      const nRawZ = semiMinorB * Math.sin(nextAngle);
      const nY = nRawZ * Math.sin(inclinationRad);
      const nZ = nRawZ * Math.cos(inclinationRad);

      if (spacecraftGroupRef.current) {
        spacecraftGroupRef.current.position.set(curX, curY, curZ);
        spacecraftGroupRef.current.lookAt(nX, nY, nZ);

        // Nadir pointing: Point instrument scanning cone toward planet center
        if (scanConeRef.current) {
          scanConeRef.current.lookAt(0, 0, 0);
          scanConeRef.current.rotateX(Math.PI / 2);
          const coneOpacity = 0.25 + Math.sin(time * 6) * 0.12;
          if (scanConeRef.current.material instanceof THREE.MeshBasicMaterial) {
            scanConeRef.current.material.opacity = coneOpacity;
          }
        }

        // Pulse ion plasma glow
        if (plasmaGlowRef.current) {
          const pulse = 1 + Math.sin(time * 15) * 0.25;
          plasmaGlowRef.current.scale.set(pulse, pulse, pulse);
        }

        // Blink green beacon
        if (beaconRef.current) {
          beaconRef.current.visible = Math.sin(time * 6) > 0;
        }

        // Ground DSN Line to Earth / Planet Center
        if (dsnBeamRef.current) {
          const earthTarget = targetPlanet === 'Moon' ? new THREE.Vector3(55, 20, -50) : new THREE.Vector3(0, 0, 0);
          dsnBeamRef.current.geometry.setFromPoints([spacecraftGroupRef.current.position, earthTarget]);
          dsnBeamRef.current.computeLineDistances();
        }
      }

      // Physics telemetry calculations
      const distFromCenter = Math.sqrt(curX * curX + curY * curY + curZ * curZ);
      const altRatio = (distFromCenter - planetRadius) / 7.5;
      const baseAlt = orbit.altitudeKm > 50000 ? 350 : orbit.altitudeKm;
      const liveAltKm = Math.round(baseAlt * Math.max(0.7, altRatio));

      // Vis-viva orbital speed: v = sqrt(GM * (2/r - 1/a))
      const liveVelocity = parseFloat((7.4 * Math.sqrt(Math.max(0.5, (2 * semiMajorA / distFromCenter) - 1))).toFixed(2));
      const trueAnomaly = Math.round(THREE.MathUtils.radToDeg(orbitAngle));

      // Sub-satellite geographic coordinate mapping
      const subLat = Math.round(Math.sin(orbitAngle) * (orbit.id.includes('sso') ? 85 : 28));
      const subLon = Math.round(((orbitAngle * 180 / Math.PI * 1.5) % 360) - 180);

      // Check eclipse shadow: behind planet relative to sun vector
      const inShadow = curX < -2 && curZ < -2;

      // Active DSN Ground Station selection based on longitude
      let station = 'Goldstone (USA)';
      if (subLon > -30 && subLon < 90) station = 'Madrid (Spain)';
      else if (subLon >= 90 || subLon <= -150) station = 'Canberra (Australia)';

      // Periodically sync live telemetry stats into React state (every ~10 frames)
      if (Math.floor(time * 10) % 3 === 0) {
        setOrbitDynamics({
          trueAnomalyDeg: trueAnomaly,
          currentAltitudeKm: liveAltKm,
          currentVelocityKms: liveVelocity,
          subSatLatDeg: subLat,
          subSatLonDeg: subLon,
          isInEclipse: inShadow,
          activeDSNStation: station,
          commsSignalStrengthPct: inShadow ? 78 : 96,
          batteryPowerW: inShadow ? 0 : metrics.powerGenerationW
        });
      }

      // Camera view positioning
      const curCamMode = cameraModeRef.current;
      if (curCamMode === 'chase' && spacecraftGroupRef.current) {
        // Chase behind craft
        camera.position.set(curX - (nX - curX) * 4, curY + 2.5, curZ - (nZ - curZ) * 4);
        camera.lookAt(curX, curY, curZ);
      } else if (curCamMode === 'nadir' && spacecraftGroupRef.current) {
        // Look from spacecraft down to planet surface
        camera.position.set(curX * 1.3, curY * 1.3, curZ * 1.3);
        camera.lookAt(0, 0, 0);
      } else if (curCamMode === 'overview') {
        // Angled high-level orbit overview
        camera.position.set(22, 16, 32);
        camera.lookAt(0, 0, 0);
      } else {
        // Free Orbit Orbiting Camera
        camera.position.x = Math.sin(camYaw) * Math.cos(camPitch) * camDist;
        camera.position.y = Math.sin(camPitch) * camDist + 3;
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
  }, [mission, bus, components, instruments, orbit, metrics]);

  return (
    <div className="relative w-full bg-slate-950 rounded-3xl border-2 border-cyan-500/50 overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.3)] flex flex-col justify-between">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-[540px] cursor-grab active:cursor-grabbing relative" />

      {/* TOP HUD: Real-time Flight Operations Status */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Active Spacecraft Pill */}
        <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-cyan-500/50 flex items-center gap-3 shadow-xl pointer-events-auto">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>LIVE ORBIT TRACKER</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-300">ACTIVE FLIGHT OPS</span>
            </div>
            <div className="text-sm font-black text-white font-mono flex items-center gap-2">
              <Satellite className="w-4 h-4 text-cyan-400" />
              <span>{bus.name}</span>
              <span className="text-slate-500">→</span>
              <span className="text-cyan-300 font-bold">{mission.destination} ORBIT</span>
            </div>
          </div>
        </div>

        {/* Live Orbit Telemetry Stat Pills */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 font-mono text-xs shadow-lg">
            <span className="text-slate-400">ALTITUDE:</span>{' '}
            <strong className="text-cyan-300">{orbitDynamics.currentAltitudeKm.toLocaleString()} KM</strong>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 font-mono text-xs shadow-lg">
            <span className="text-slate-400">VELOCITY:</span>{' '}
            <strong className="text-emerald-400">{orbitDynamics.currentVelocityKms} KM/S</strong>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 font-mono text-xs shadow-lg flex items-center gap-1.5">
            <span className="text-slate-400">ILLUMINATION:</span>{' '}
            {orbitDynamics.isInEclipse ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                ECLIPSE (BATTERY)
              </span>
            ) : (
              <span className="text-cyan-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                SUNLIT (+{orbitDynamics.batteryPowerW}W)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* OVERLAY: 2D Sub-Satellite Ground Track & DSN Link Mini-Map */}
      {showGroundTrack && (
        <div className="absolute bottom-20 left-4 z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-2xl max-w-sm hidden sm:block pointer-events-auto font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5" />
              SUB-SATELLITE GROUND TRACK
            </span>
            <span className="text-[10px] text-slate-400">
              LAT {orbitDynamics.subSatLatDeg}° / LON {orbitDynamics.subSatLonDeg}°
            </span>
          </div>

          {/* Mini Planetary Map Coordinate Grid */}
          <div className="relative w-72 h-28 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 opacity-20 pointer-events-none">
              <div className="border-r border-b border-cyan-500" />
              <div className="border-r border-b border-cyan-500" />
              <div className="border-r border-b border-cyan-500" />
              <div className="border-r border-b border-cyan-500" />
              <div className="border-r border-b border-cyan-500" />
              <div className="border-b border-cyan-500" />
            </div>

            {/* Sine-wave Ground Track Curve */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 288 112">
              <path
                d="M 0 56 Q 72 10 144 56 T 288 56"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                opacity="0.6"
              />
            </svg>

            {/* Pulsing Spacecraft Ground Footprint */}
            <div 
              className="absolute w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#06b6d4] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 flex items-center justify-center"
              style={{
                left: `${((orbitDynamics.subSatLonDeg + 180) / 360) * 100}%`,
                top: `${((90 - orbitDynamics.subSatLatDeg) / 180) * 100}%`
              }}
            >
              <div className="w-6 h-6 rounded-full border border-cyan-400/60 animate-ping" />
            </div>

            {/* DSN Station Pins */}
            <div className="absolute left-[20%] top-[30%] text-[8px] text-emerald-400 font-bold">● GDS</div>
            <div className="absolute left-[48%] top-[25%] text-[8px] text-emerald-400 font-bold">● MAD</div>
            <div className="absolute left-[85%] top-[70%] text-[8px] text-emerald-400 font-bold">● CAN</div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            <span className="flex items-center gap-1 text-emerald-400">
              <Radio className="w-3 h-3" />
              DSN LOCK: {orbitDynamics.activeDSNStation}
            </span>
            <span className="text-cyan-300 font-bold">{orbitDynamics.commsSignalStrengthPct}% SIGNAL</span>
          </div>
        </div>
      )}

      {/* BOTTOM CONTROLS & CAMERA DOCK */}
      <div className="m-4 p-3 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-cyan-500/40 flex flex-wrap items-center justify-between gap-4 shadow-xl z-10">
        {/* Camera Views */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase mr-1">TRACKING CAMERA:</span>
          <button
            onClick={() => { setCameraMode('overview'); sound.playClick(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              cameraMode === 'overview'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            ORBIT OVERVIEW
          </button>
          <button
            onClick={() => { setCameraMode('chase'); sound.playClick(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              cameraMode === 'chase'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            CHASE CRAFT
          </button>
          <button
            onClick={() => { setCameraMode('nadir'); sound.playClick(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              cameraMode === 'nadir'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            PLANET NADIR
          </button>
          <button
            onClick={() => { setCameraMode('free'); sound.playClick(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              cameraMode === 'free'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            FREE 3D
          </button>
        </div>

        {/* Sim Speed Toggles */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase mr-1">TIME WARP:</span>
          <button
            onClick={() => { setIsPaused(!isPaused); sound.playClick(); }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-all cursor-pointer border border-slate-700"
            title="Pause / Resume Live Simulation"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>
          {[1, 5, 25].map((spd) => (
            <button
              key={spd}
              onClick={() => { setSimSpeed(spd); sound.playClick(); }}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                simSpeed === spd 
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Quick Jump Buttons to Discoveries & Report */}
        <div className="flex items-center gap-2">
          <button
            onClick={onViewDiscoveries}
            className="px-4 py-2 bg-purple-950/70 hover:bg-purple-900 border border-purple-500/50 text-purple-200 font-mono text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            DISCOVERIES
          </button>
          <button
            onClick={onViewReport}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/25"
          >
            <Trophy className="w-3.5 h-3.5 fill-slate-950" />
            SCORE & REPORT
          </button>
        </div>
      </div>
    </div>
  );
};

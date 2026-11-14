import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SpacecraftComponent, ScientificInstrument } from '../../types';
import { RotateCw, ZoomIn, ZoomOut, Compass, Sparkles, CheckCircle2 } from 'lucide-react';

interface SpacecraftViewer3DProps {
  bus: SpacecraftComponent;
  components: SpacecraftComponent[];
  instruments: ScientificInstrument[];
}

export const SpacecraftViewer3D: React.FC<SpacecraftViewer3DProps> = ({
  bus,
  components,
  instruments
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const spacecraftGroupRef = useRef<THREE.Group | null>(null);

  // References to animated elements
  const animRefs = useRef<{
    reactionWheels: THREE.Mesh[];
    ionPlasma: THREE.Mesh | null;
    thrusterParticles: THREE.Points | null;
    radarArray: THREE.Mesh | null;
    radarPulseRing: THREE.Mesh | null;
    solarGimbals: THREE.Group[];
    commsDishGroup: THREE.Group | null;
    commsWaves: THREE.Mesh[];
    ledLights: THREE.Mesh[];
    coolantPipes: THREE.Mesh[];
    cameraRing: THREE.Mesh | null;
    spectrometerPrism: THREE.Mesh | null;
    magnetometerBoom: THREE.Group | null;
    atmoMirror: THREE.Mesh | null;
  }>({
    reactionWheels: [],
    ionPlasma: null,
    thrusterParticles: null,
    radarArray: null,
    radarPulseRing: null,
    solarGimbals: [],
    commsDishGroup: null,
    commsWaves: [],
    ledLights: [],
    coolantPipes: [],
    cameraRing: null,
    spectrometerPrism: null,
    magnetometerBoom: null,
    atmoMirror: null
  });

  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(5.5);
  const [recentNotification, setRecentNotification] = useState<string | null>(null);

  // Track recent additions for lively notifications
  const prevCountRef = useRef(components.length + instruments.length);
  useEffect(() => {
    const total = components.length + instruments.length;
    if (total > prevCountRef.current) {
      // Find what was just added
      const lastComp = components[components.length - 1];
      const lastInst = instruments[instruments.length - 1];
      const itemName = lastInst ? lastInst.name : (lastComp ? lastComp.name : 'Component');
      setRecentNotification(`+ MOUNTED: ${itemName}`);
      const timer = setTimeout(() => setRecentNotification(null), 2500);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = total;
  }, [components, instruments]);

  // References for camera controls
  const controlsRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    camYaw: 0.6,
    camPitch: 0.3,
    camDist: 5.5,
    autoRotate: true
  });

  useEffect(() => {
    controlsRef.current.autoRotate = isAutoRotate;
  }, [isAutoRotate]);

  useEffect(() => {
    controlsRef.current.camDist = zoomLevel;
  }, [zoomLevel]);

  // Main 3D Canvas initialization
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 460;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4, 2.5, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x64748b, 2.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 3.2);
    mainLight.position.set(8, 12, 8);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const blueRim = new THREE.DirectionalLight(0x06b6d4, 2.0);
    blueRim.position.set(-8, -2, -6);
    scene.add(blueRim);

    const purpleGlow = new THREE.PointLight(0xa855f7, 3.0, 30);
    purpleGlow.position.set(0, -3, 3);
    scene.add(purpleGlow);

    // Holographic Pedestal Grid & Glowing Concentric Rings
    const gridHelper = new THREE.GridHelper(8, 20, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -2.1;
    scene.add(gridHelper);

    const ringGeo1 = new THREE.RingGeometry(2.6, 2.65, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = -2.09;
    scene.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(3.4, 3.44, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xa855f7, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = -2.09;
    scene.add(ring2);

    // Ambient floating dust particles in the assembly bay
    const dustCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 8;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.08, transparent: true, opacity: 0.6 });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // Master Spacecraft Group (floats & animates)
    const craftGroup = new THREE.Group();
    scene.add(craftGroup);
    spacecraftGroupRef.current = craftGroup;

    // Mouse drag rotation controls
    const onMouseDown = (e: MouseEvent) => {
      controlsRef.current.isDragging = true;
      controlsRef.current.prevX = e.clientX;
      controlsRef.current.prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!controlsRef.current.isDragging) return;
      const dx = e.clientX - controlsRef.current.prevX;
      const dy = e.clientY - controlsRef.current.prevY;
      controlsRef.current.camYaw += dx * 0.008;
      controlsRef.current.camPitch += dy * 0.008;
      controlsRef.current.camPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, controlsRef.current.camPitch));
      controlsRef.current.prevX = e.clientX;
      controlsRef.current.prevY = e.clientY;
    };

    const onMouseUp = () => {
      controlsRef.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      controlsRef.current.camDist += e.deltaY * 0.005;
      controlsRef.current.camDist = Math.max(2.8, Math.min(10.0, controlsRef.current.camDist));
      setZoomLevel(controlsRef.current.camDist);
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    mount.addEventListener('wheel', onWheel, { passive: false });

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(mount);

    // Continuous Lively Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // 1. Spacecraft Gentle Levitation Bobbing & Slow Yaw
      if (craftGroup) {
        craftGroup.position.y = Math.sin(time * 1.8) * 0.1;
        craftGroup.rotation.z = Math.sin(time * 0.9) * 0.03;

        if (controlsRef.current.autoRotate) {
          craftGroup.rotation.y += 0.007;
        }
      }

      // 2. High-RPM Spinning Reaction Wheels (ADCS)
      animRefs.current.reactionWheels.forEach((wheel, idx) => {
        wheel.rotation.z += 0.25 * (idx % 2 === 0 ? 1 : -1);
      });

      // 3. Ion Thruster Glowing Plasma Core & Jet Pulse
      if (animRefs.current.ionPlasma) {
        const pulse = 1 + Math.sin(time * 16) * 0.22;
        animRefs.current.ionPlasma.scale.set(pulse, pulse * 1.4, pulse);
      }

      // 4. Radar Antenna Sweep & Expanding Electromagnetic Wave Ring
      if (animRefs.current.radarArray) {
        animRefs.current.radarArray.rotation.y = Math.sin(time * 1.5) * 0.25;
      }
      if (animRefs.current.radarPulseRing) {
        const ringScale = (time * 2) % 3 + 0.2;
        animRefs.current.radarPulseRing.scale.set(ringScale, ringScale, ringScale);
        if (animRefs.current.radarPulseRing.material instanceof THREE.MeshBasicMaterial) {
          animRefs.current.radarPulseRing.material.opacity = Math.max(0, 0.8 - (ringScale / 3));
        }
      }

      // 5. Sun-Tracking Articulated Solar Gimbals
      animRefs.current.solarGimbals.forEach((gimbal, idx) => {
        gimbal.rotation.x = Math.sin(time * 0.8 + idx) * 0.2;
      });

      // 6. Communications High-Gain Dish Radiating Telemetry Waves
      if (animRefs.current.commsDishGroup) {
        animRefs.current.commsDishGroup.rotation.z = Math.sin(time * 0.6) * 0.08;
      }
      animRefs.current.commsWaves.forEach((wave, idx) => {
        const waveProgress = ((time * 1.5 + idx * 0.5) % 2) / 2;
        wave.scale.set(1 + waveProgress * 1.8, 1 + waveProgress * 1.8, 1 + waveProgress * 1.8);
        if (wave.material instanceof THREE.MeshBasicMaterial) {
          wave.material.opacity = Math.max(0, 0.7 - waveProgress * 0.7);
        }
      });

      // 7. Blinking Computer & Battery LEDs
      animRefs.current.ledLights.forEach((led, idx) => {
        if (led.material instanceof THREE.MeshBasicMaterial) {
          const blink = Math.sin(time * 8 + idx * 1.5) > 0 ? 1.0 : 0.2;
          led.material.opacity = blink;
        }
      });

      // 8. Active Thermal Coolant Fluid Pulse
      animRefs.current.coolantPipes.forEach((pipe) => {
        if (pipe.material instanceof THREE.MeshStandardMaterial) {
          pipe.material.emissiveIntensity = 0.5 + Math.sin(time * 4) * 0.4;
        }
      });

      // 9. Camera Focus Ring Continuous Rotation
      if (animRefs.current.cameraRing) {
        animRefs.current.cameraRing.rotation.y = time * 0.8;
      }

      // 10. Spectrometer Prismatic Color Cycle
      if (animRefs.current.spectrometerPrism && animRefs.current.spectrometerPrism.material instanceof THREE.MeshBasicMaterial) {
        const hue = (time * 0.2) % 1;
        animRefs.current.spectrometerPrism.material.color.setHSL(hue, 1, 0.6);
      }

      // 11. Magnetometer Sensor Head Sway
      if (animRefs.current.magnetometerBoom) {
        animRefs.current.magnetometerBoom.rotation.y = Math.sin(time * 1.2) * 0.06;
      }

      // 12. Atmospheric Sounder Rocking Mirror
      if (animRefs.current.atmoMirror) {
        animRefs.current.atmoMirror.rotation.x = Math.sin(time * 2.5) * 0.35;
      }

      // 13. Pedestal Rings Spin
      ring1.rotation.z = time * 0.15;
      ring2.rotation.z = -time * 0.1;

      // 14. Update Camera Position based on controls
      const { camYaw, camPitch, camDist } = controlsRef.current;
      camera.position.x = Math.sin(camYaw) * Math.cos(camPitch) * camDist;
      camera.position.y = Math.sin(camPitch) * camDist + 0.3;
      camera.position.z = Math.cos(camYaw) * Math.cos(camPitch) * camDist;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      mount.removeEventListener('wheel', onWheel);
      resizeObserver.disconnect();
      cancelAnimationFrame(animId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update 3D Spacecraft Components dynamically as player selects them
  useEffect(() => {
    const craftGroup = spacecraftGroupRef.current;
    if (!craftGroup) return;

    // Reset animated references
    animRefs.current = {
      reactionWheels: [],
      ionPlasma: null,
      thrusterParticles: null,
      radarArray: null,
      radarPulseRing: null,
      solarGimbals: [],
      commsDishGroup: null,
      commsWaves: [],
      ledLights: [],
      coolantPipes: [],
      cameraRing: null,
      spectrometerPrism: null,
      magnetometerBoom: null,
      atmoMirror: null
    };

    // Clear previous children
    while (craftGroup.children.length > 0) {
      const child = craftGroup.children[0];
      craftGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }

    // 1. Build Spacecraft Bus (Core Structure)
    let busMesh: THREE.Mesh;
    const isCubeSat = bus ? bus.id.includes('cubesat') : true;
    const isFlagship = bus ? bus.id.includes('flagship') : false;

    if (isCubeSat) {
      // 6U CubeSat Form Factor
      const geo = new THREE.BoxGeometry(0.8, 1.6, 0.8);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.25,
        metalness: 0.85
      });
      busMesh = new THREE.Mesh(geo, mat);

      // Gold MLI panels on front and back
      const panelGeo = new THREE.PlaneGeometry(0.7, 1.4);
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.2,
        metalness: 0.95,
        side: THREE.DoubleSide
      });
      const sideA = new THREE.Mesh(panelGeo, panelMat);
      sideA.position.set(0, 0, 0.41);
      const sideB = new THREE.Mesh(panelGeo, panelMat);
      sideB.position.set(0, 0, -0.41);
      sideB.rotation.y = Math.PI;
      busMesh.add(sideA);
      busMesh.add(sideB);
    } else if (isFlagship) {
      // Flagship Heavy Octagonal Bus
      const geo = new THREE.CylinderGeometry(1.2, 1.4, 2.2, 8);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
        metalness: 0.8
      });
      busMesh = new THREE.Mesh(geo, mat);

      // Gold thermal blanket band
      const bandGeo = new THREE.CylinderGeometry(1.22, 1.25, 0.8, 8);
      const bandMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.15,
        metalness: 0.95
      });
      const band = new THREE.Mesh(bandGeo, bandMat);
      busMesh.add(band);
    } else {
      // Standard SmallSat Hexagonal Bus
      const geo = new THREE.CylinderGeometry(0.9, 0.9, 1.5, 6);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.3,
        metalness: 0.75
      });
      busMesh = new THREE.Mesh(geo, mat);

      const foilGeo = new THREE.CylinderGeometry(0.92, 0.92, 0.6, 6);
      const foilMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.2,
        metalness: 0.9
      });
      busMesh.add(new THREE.Mesh(foilGeo, foilMat));
    }

    craftGroup.add(busMesh);

    // ==========================================
    // 2. POWER GENERATION SUBSYSTEM
    // ==========================================
    const hasBodySolar = components.some(c => c.id === 'solar-body-mount');
    const hasSolarWings = components.some(c => c.id === 'solar-deploy-wings');
    const hasTrackingArrays = components.some(c => c.id === 'solar-tracking-highpower');
    const hasRtg = components.some(c => c.id === 'rtg-nuclear');

    if (hasBodySolar) {
      // Glowing blue solar patches bonded to the side panels
      const cellGeo = new THREE.PlaneGeometry(0.65, 0.65);
      const cellMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x0369a1,
        emissiveIntensity: 0.3,
        metalness: 0.9,
        roughness: 0.1,
        side: THREE.DoubleSide
      });
      const cellLeft = new THREE.Mesh(cellGeo, cellMat);
      cellLeft.position.set(-0.41, 0, 0);
      cellLeft.rotation.y = Math.PI / 2;
      const cellRight = new THREE.Mesh(cellGeo, cellMat);
      cellRight.position.set(0.41, 0, 0);
      cellRight.rotation.y = -Math.PI / 2;
      busMesh.add(cellLeft);
      busMesh.add(cellRight);
    }

    if (hasSolarWings || hasTrackingArrays) {
      const isTracking = hasTrackingArrays;
      const wingLength = isTracking ? 2.6 : 1.9;
      const wingWidth = isTracking ? 0.95 : 0.7;

      const wingGeo = new THREE.BoxGeometry(wingLength, 0.04, wingWidth);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x075985,
        emissiveIntensity: 0.4,
        roughness: 0.1,
        metalness: 0.95
      });

      // Gold solar cell busbar lines
      const busbarGeo = new THREE.BoxGeometry(wingLength * 0.95, 0.05, 0.03);
      const busbarMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

      // Left Solar Wing Assembly with Gimbal
      const leftGimbal = new THREE.Group();
      leftGimbal.position.set(-(isCubeSat ? 0.4 : 0.8), 0, 0);
      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.set(-(wingLength / 2 + 0.2), 0, 0);
      const leftBar = new THREE.Mesh(busbarGeo, busbarMat);
      leftBar.position.set(-(wingLength / 2 + 0.2), 0.03, 0);
      leftGimbal.add(leftWing);
      leftGimbal.add(leftBar);

      // Right Solar Wing Assembly with Gimbal
      const rightGimbal = new THREE.Group();
      rightGimbal.position.set(isCubeSat ? 0.4 : 0.8, 0, 0);
      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.set(wingLength / 2 + 0.2, 0, 0);
      const rightBar = new THREE.Mesh(busbarGeo, busbarMat);
      rightBar.position.set(wingLength / 2 + 0.2, 0.03, 0);
      rightGimbal.add(rightWing);
      rightGimbal.add(rightBar);

      craftGroup.add(leftGimbal);
      craftGroup.add(rightGimbal);

      if (isTracking) {
        animRefs.current.solarGimbals.push(leftGimbal, rightGimbal);
      }
    }

    if (hasRtg) {
      // Nuclear RTG with black cooling fins & glowing core ring
      const rtgGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.9, 16);
      const rtgMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6, metalness: 0.5 });
      const rtg = new THREE.Mesh(rtgGeo, rtgMat);
      rtg.position.set(0, -0.6, -1.2);
      rtg.rotation.x = Math.PI / 4;

      const ringGeo = new THREE.TorusGeometry(0.38, 0.04, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      rtg.add(ring);

      craftGroup.add(rtg);
    }

    // ==========================================
    // 3. BATTERY SUBSYSTEM (WITH ANIMATED CHARGE LEDS)
    // ==========================================
    const hasBattery = components.some(c => c.subsystem === 'battery');
    if (hasBattery) {
      const batBayGeo = new THREE.BoxGeometry(0.35, 0.5, 0.2);
      const batBayMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
      const batBay = new THREE.Mesh(batBayGeo, batBayMat);
      batBay.position.set(0, -0.3, isCubeSat ? 0.42 : 0.85);

      // 3 Blinking Green/Cyan Charge Level LEDs
      for (let i = 0; i < 3; i++) {
        const ledGeo = new THREE.BoxGeometry(0.06, 0.04, 0.02);
        const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 1.0 });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(-0.08 + i * 0.08, 0.15, 0.11);
        batBay.add(led);
        animRefs.current.ledLights.push(led);
      }

      craftGroup.add(batBay);
    }

    // ==========================================
    // 4. PROPULSION & THRUSTER ENGINES
    // ==========================================
    const hasColdGas = components.some(c => c.id === 'prop-cold-gas');
    const hasHydrazine = components.some(c => c.id === 'prop-hydrazine');
    const hasIon = components.some(c => c.id === 'prop-ion-xenon');

    if (hasColdGas || hasHydrazine || hasIon) {
      const bellRadius = hasIon ? 0.42 : (hasHydrazine ? 0.38 : 0.28);
      const thrusterGeo = new THREE.ConeGeometry(bellRadius, 0.7, 24, 1, true);
      const thrusterMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        metalness: 0.95,
        roughness: 0.15,
        side: THREE.DoubleSide
      });
      const thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
      thruster.position.set(0, isCubeSat ? -1.1 : -1.4, 0);

      if (hasIon) {
        // Glowing Xenon Blue Plasma Core
        const plasmaGeo = new THREE.SphereGeometry(0.22, 16, 16);
        const plasmaMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const plasma = new THREE.Mesh(plasmaGeo, plasmaMat);
        plasma.position.set(0, isCubeSat ? -1.2 : -1.5, 0);
        craftGroup.add(plasma);
        animRefs.current.ionPlasma = plasma;

        // Plasma Jet Cone
        const jetGeo = new THREE.ConeGeometry(0.3, 1.2, 16);
        const jetMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.45 });
        const jet = new THREE.Mesh(jetGeo, jetMat);
        jet.position.set(0, isCubeSat ? -1.8 : -2.1, 0);
        craftGroup.add(jet);
      } else if (hasHydrazine) {
        // Hydrazine Orange Engine Core & 4 RCS Attitude Puffs
        const coreGeo = new THREE.SphereGeometry(0.18, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(0, isCubeSat ? -1.15 : -1.45, 0);
        craftGroup.add(core);

        // 4 Pulsing RCS Nozzles on corners
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          const rcsGeo = new THREE.ConeGeometry(0.08, 0.2, 8);
          const rcsMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
          const rcs = new THREE.Mesh(rcsGeo, rcsMat);
          rcs.position.set(Math.cos(angle) * (isCubeSat ? 0.45 : 0.8), isCubeSat ? -0.8 : -1.1, Math.sin(angle) * (isCubeSat ? 0.45 : 0.8));
          rcs.rotation.z = Math.PI / 2;
          craftGroup.add(rcs);
        }
      }

      craftGroup.add(thruster);
    }

    // ==========================================
    // 5. COMMUNICATIONS & ANTENNA (WITH ANIMATED SIGNAL WAVES)
    // ==========================================
    const hasDish = components.some(c => c.id === 'comms-highgain-dish');
    const hasHorn = components.some(c => c.id === 'comms-xband-horn');
    const hasPatch = components.some(c => c.id === 'comms-uhf-patch');

    if (hasDish) {
      const dishGroup = new THREE.Group();
      dishGroup.position.set(0, isCubeSat ? 1.15 : 1.45, 0);

      // Parabolic Reflector Dish
      const dishGeo = new THREE.SphereGeometry(isCubeSat ? 0.55 : 0.95, 24, 16, 0, Math.PI * 2, 0, Math.PI / 3);
      const dishMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.15,
        metalness: 0.35,
        side: THREE.DoubleSide
      });
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dish.rotation.x = -Math.PI / 2;

      // Feed horn strut & tip
      const hornGeo = new THREE.CylinderGeometry(0.03, 0.03, isCubeSat ? 0.45 : 0.75);
      const hornMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.85 });
      const horn = new THREE.Mesh(hornGeo, hornMat);
      horn.position.z = isCubeSat ? 0.35 : 0.55;
      horn.rotation.x = Math.PI / 2;

      // Animated Expanding Radio Signal Rings
      for (let i = 0; i < 2; i++) {
        const waveGeo = new THREE.RingGeometry(0.2, 0.25, 24);
        const waveMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
        const wave = new THREE.Mesh(waveGeo, waveMat);
        wave.position.z = (isCubeSat ? 0.4 : 0.6) + i * 0.2;
        dishGroup.add(wave);
        animRefs.current.commsWaves.push(wave);
      }

      dishGroup.add(dish);
      dishGroup.add(horn);
      craftGroup.add(dishGroup);
      animRefs.current.commsDishGroup = dishGroup;
    } else if (hasHorn) {
      const hornGeo = new THREE.ConeGeometry(0.24, 0.55, 16);
      const hornMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85 });
      const horn = new THREE.Mesh(hornGeo, hornMat);
      horn.position.set(0, isCubeSat ? 0.9 : 1.25, 0);
      horn.rotation.x = Math.PI;

      // Glowing tip
      const tipGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const tipMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(0, 0.28, 0);
      horn.add(tip);

      craftGroup.add(horn);
    } else if (hasPatch) {
      const patchGeo = new THREE.BoxGeometry(0.32, 0.32, 0.05);
      const patchMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95 });
      const patch = new THREE.Mesh(patchGeo, patchMat);
      patch.position.set(0, isCubeSat ? 0.82 : 1.05, 0);
      patch.rotation.x = Math.PI / 2;
      craftGroup.add(patch);
    }

    // ==========================================
    // 6. ADCS (REACTION WHEELS & STAR TRACKERS)
    // ==========================================
    const hasWheels = components.some(c => c.id === 'adcs-reaction-wheels');
    const hasStarTracker = components.some(c => c.id === 'adcs-star-tracker');

    if (hasWheels) {
      // Spinning Gyroscope Reaction Wheels in an open bay
      const wheelBayGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const wheelBayMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });
      const wheelBay = new THREE.Mesh(wheelBayGeo, wheelBayMat);
      wheelBay.position.set(isCubeSat ? 0.42 : 0.85, 0.3, 0);

      // Gold Brass Flywheel
      const flyGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16);
      const flyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
      const flywheel = new THREE.Mesh(flyGeo, flyMat);
      flywheel.rotation.x = Math.PI / 2;
      wheelBay.add(flywheel);
      animRefs.current.reactionWheels.push(flywheel);

      craftGroup.add(wheelBay);
    }

    if (hasStarTracker) {
      // Twin optical star tracker barrels angled toward deep space
      const trackerGroup = new THREE.Group();
      trackerGroup.position.set(isCubeSat ? -0.42 : -0.85, 0.4, 0);

      for (let i = 0; i < 2; i++) {
        const tubeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 12);
        const tubeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        tube.position.set(0, 0, (i - 0.5) * 0.18);
        tube.rotation.z = Math.PI / 3;

        // Glowing Blue CCD lens
        const lensGeo = new THREE.CircleGeometry(0.05, 12);
        const lensMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const lens = new THREE.Mesh(lensGeo, lensMat);
        lens.position.set(0, 0.13, 0);
        lens.rotation.x = -Math.PI / 2;
        tube.add(lens);

        trackerGroup.add(tube);
      }
      craftGroup.add(trackerGroup);
    }

    // ==========================================
    // 7. CDH COMPUTER (WITH BLINKING PROCESSOR LEDS)
    // ==========================================
    const hasComputer = components.some(c => c.subsystem === 'computer');
    if (hasComputer) {
      const compGeo = new THREE.BoxGeometry(0.28, 0.28, 0.2);
      const compMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.8 });
      const compBox = new THREE.Mesh(compGeo, compMat);
      compBox.position.set(0, 0.2, -(isCubeSat ? 0.42 : 0.85));

      // Sequential Data LED indicators
      for (let i = 0; i < 3; i++) {
        const ledGeo = new THREE.BoxGeometry(0.04, 0.04, 0.02);
        const ledMat = new THREE.MeshBasicMaterial({ color: i === 0 ? 0x06b6d4 : (i === 1 ? 0xa855f7 : 0x10b981), transparent: true });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(-0.06 + i * 0.06, 0.08, -0.11);
        compBox.add(led);
        animRefs.current.ledLights.push(led);
      }
      craftGroup.add(compBox);
    }

    // ==========================================
    // 8. THERMAL SUBSYSTEM (ACTIVE COOLANT PIPES)
    // ==========================================
    const hasActiveThermal = components.some(c => c.id === 'thermal-active-loop');
    if (hasActiveThermal) {
      // Glowing Cyan Coolant Pipe wrapping around the bus
      const pipeGeo = new THREE.TorusGeometry(isCubeSat ? 0.45 : 0.95, 0.03, 8, 32);
      const pipeMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.8,
        metalness: 0.7
      });
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.y = 0.1;
      craftGroup.add(pipe);
      animRefs.current.coolantPipes.push(pipe);
    }

    // ==========================================
    // 9. SCIENTIFIC INSTRUMENTS (LIVELY SENSORS)
    // ==========================================
    let instOffset = 0;
    instruments.forEach((inst) => {
      instOffset += 0.3;

      if (inst.id === 'cam-highres') {
        // High-Res Camera Barrel with rotating optical focus ring
        const cameraGroup = new THREE.Group();
        cameraGroup.position.set(0.4, 0.4, isCubeSat ? 0.45 : 0.9);

        const lensGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.45, 24);
        const lensMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.1 });
        const cameraObj = new THREE.Mesh(lensGeo, lensMat);
        cameraObj.rotation.x = Math.PI / 2;

        // Rotating focus ring
        const ringGeo = new THREE.TorusGeometry(0.19, 0.03, 8, 24);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.9 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = 0.1;
        cameraObj.add(ring);
        animRefs.current.cameraRing = ring;

        // Cyan glass optical aperture
        const glassGeo = new THREE.CircleGeometry(0.16, 24);
        const glassMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide });
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.position.set(0, 0.23, 0);
        glass.rotation.x = -Math.PI / 2;
        cameraObj.add(glass);

        cameraGroup.add(cameraObj);
        craftGroup.add(cameraGroup);
      } else if (inst.id === 'spectrometer-multispectral') {
        // Multi-spectral Spectrometer with cycling rainbow prism window
        const specBoxGeo = new THREE.BoxGeometry(0.3, 0.25, 0.3);
        const specBoxMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
        const specBox = new THREE.Mesh(specBoxGeo, specBoxMat);
        specBox.position.set(-0.4, 0.4, isCubeSat ? 0.45 : 0.9);

        // Rainbow Prismatic Sensor
        const prismGeo = new THREE.PlaneGeometry(0.2, 0.15);
        const prismMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, side: THREE.DoubleSide });
        const prism = new THREE.Mesh(prismGeo, prismMat);
        prism.position.set(0, 0, 0.16);
        specBox.add(prism);
        animRefs.current.spectrometerPrism = prism;

        craftGroup.add(specBox);
      } else if (inst.id === 'radar-sar') {
        // SAR Radar Array with scanning radar wave
        const radarGroup = new THREE.Group();
        radarGroup.position.set(0, -0.65, isCubeSat ? 0.5 : 0.95);

        const radarGeo = new THREE.BoxGeometry(1.8, 0.06, 0.5);
        const radarMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });
        const radar = new THREE.Mesh(radarGeo, radarMat);
        radarGroup.add(radar);
        animRefs.current.radarArray = radar;

        // Expanding electromagnetic scan pulse ring
        const pulseGeo = new THREE.RingGeometry(0.8, 0.88, 32);
        const pulseMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
        const pulse = new THREE.Mesh(pulseGeo, pulseMat);
        pulse.rotation.x = Math.PI / 2;
        radarGroup.add(pulse);
        animRefs.current.radarPulseRing = pulse;

        craftGroup.add(radarGroup);
      } else if (inst.id === 'magnetometer-fluxgate') {
        // Deployable Magnetometer Boom with articulated head
        const boomGroup = new THREE.Group();
        boomGroup.position.set(0, 1.2, -0.6);
        boomGroup.rotation.z = Math.PI / 4;

        const rodGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.6);
        const rodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8 });
        const rod = new THREE.Mesh(rodGeo, rodMat);
        rod.position.y = 1.3;
        boomGroup.add(rod);

        // Sensor head
        const headGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, metalness: 0.7 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 2.65;
        boomGroup.add(head);

        craftGroup.add(boomGroup);
        animRefs.current.magnetometerBoom = boomGroup;
      } else if (inst.id === 'sensor-atmospheric') {
        // Atmospheric Sounder with rocking mirror
        const sounderGroup = new THREE.Group();
        sounderGroup.position.set(-0.4, -0.2, isCubeSat ? 0.45 : 0.9);

        const bodyGeo = new THREE.BoxGeometry(0.25, 0.35, 0.25);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0d9488, metalness: 0.7 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        sounderGroup.add(body);

        // Mirror that rocks
        const mirrorGeo = new THREE.PlaneGeometry(0.15, 0.15);
        const mirrorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1.0, roughness: 0.0, side: THREE.DoubleSide });
        const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
        mirror.position.set(0, 0, 0.13);
        sounderGroup.add(mirror);
        animRefs.current.atmoMirror = mirror;

        craftGroup.add(sounderGroup);
      } else {
        // General Sensor Pod with blinking sensor LED
        const podGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
        const podMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: 0.7 });
        const pod = new THREE.Mesh(podGeo, podMat);
        pod.position.set(-0.35, 0.1 - (instOffset * 0.15), isCubeSat ? 0.45 : 0.9);

        const ledGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(0, 0, 0.12);
        pod.add(led);
        animRefs.current.ledLights.push(led);

        craftGroup.add(pod);
      }
    });
  }, [bus, components, instruments]);

  // Reset Camera
  const handleResetCamera = () => {
    controlsRef.current.camYaw = 0.6;
    controlsRef.current.camPitch = 0.3;
    controlsRef.current.camDist = 5.5;
    setZoomLevel(5.5);
  };

  const handleZoom = (delta: number) => {
    const next = Math.max(2.8, Math.min(9.0, zoomLevel + delta));
    setZoomLevel(next);
  };

  return (
    <div className="relative w-full h-[460px] bg-slate-950/80 rounded-3xl border border-cyan-500/40 overflow-hidden shadow-2xl flex flex-col justify-between">
      {/* 3D Canvas Mount - explicit absolute positioning filling container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Pill */}
      <div className="relative z-10 m-3 flex items-center justify-between pointer-events-none">
        <div className="px-3.5 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-xl border border-cyan-500/30 text-xs text-cyan-300 font-mono flex items-center gap-2 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold">LIVE 3D CAD MODEL</span>
          <span className="text-slate-400">• ACTIVE ASSEMBLY</span>
        </div>

        <div className="px-3 py-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 text-xs font-mono text-slate-300 shadow-lg">
          PARTS: <strong className="text-cyan-400">{components.length}</strong> • SENSORS: <strong className="text-purple-300">{instruments.length}</strong>
        </div>
      </div>

      {/* Lively Snap-in Notification Popup */}
      {recentNotification && (
        <div className="relative z-10 self-center px-4 py-1.5 bg-cyan-950/90 backdrop-blur-md border border-cyan-400 rounded-full text-xs font-mono text-cyan-300 flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-bounce pointer-events-none">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {recentNotification}
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="relative z-10 m-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              isAutoRotate 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-sm' 
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            {isAutoRotate ? 'AUTO-SPIN: ON' : 'AUTO-SPIN: OFF'}
          </button>

          <button
            onClick={handleResetCamera}
            className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            RESET VIEW
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => handleZoom(-0.8)}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

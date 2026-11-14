import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SpaceBackgroundProps {
  interactive?: boolean;
}

export const SpaceBackgroundCanvas: React.FC<SpaceBackgroundProps> = ({ interactive = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.0008);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 5, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Starfield particles (2500 twinkling stars)
    const starCount = 2500;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const starColorOptions = [
      new THREE.Color(0xffffff),
      new THREE.Color(0x93c5fd), // Pale blue
      new THREE.Color(0xfef08a), // Pale yellow
      new THREE.Color(0xd8b4fe)  // Pale purple
    ];

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 800;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 800;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 800;

      const col = starColorOptions[Math.floor(Math.random() * starColorOptions.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Rotating 3D Earth
    const earthGroup = new THREE.Group();
    earthGroup.position.set(12, -4, -10);
    scene.add(earthGroup);

    // Earth Sphere
    const earthRadius = 9;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 48, 48);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x1d4ed8,
      emissive: 0x0f172a,
      specular: 0x38bdf8,
      shininess: 15,
      wireframe: false
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);

    // Earth Atmosphere Glow Ring
    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius * 1.05, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earthGroup.add(atmosphereMesh);

    // Orbiting Mini Spacecraft around Earth
    const satelliteGroup = new THREE.Group();
    earthGroup.add(satelliteGroup);

    const satGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.7);
    const satMaterial = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.8 });
    const satMesh = new THREE.Mesh(satGeometry, satMaterial);
    satMesh.position.set(earthRadius + 2.5, 0, 0);

    // Solar Wings on Satellite
    const panelGeo = new THREE.BoxGeometry(1.6, 0.05, 0.5);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2 });
    const leftPanel = new THREE.Mesh(panelGeo, panelMat);
    leftPanel.position.set(earthRadius + 2.5, 0, 0.8);
    const rightPanel = new THREE.Mesh(panelGeo, panelMat);
    rightPanel.position.set(earthRadius + 2.5, 0, -0.8);

    satelliteGroup.add(satMesh);
    satelliteGroup.add(leftPanel);
    satelliteGroup.add(rightPanel);

    // Distant Glowing Sun
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    sunLight.position.set(-60, 30, 40);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    scene.add(ambientLight);

    // Mouse Interaction Parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mouseX = (e.clientX / window.innerWidth - 0.5) * 4;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 4;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Rotate Earth slowly
      earthGroup.rotation.y += delta * 0.12;

      // Orbit Satellite
      satelliteGroup.rotation.y += delta * 0.75;
      satelliteGroup.rotation.z = Math.sin(time * 0.4) * 0.3;

      // Slowly rotate starfield
      starField.rotation.y = time * 0.02;

      // Parallax camera easing
      camera.position.x += (mouseX - camera.position.x * 0.1) * 0.02;
      camera.position.y += (-mouseY + 5 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      starGeometry.dispose();
      starMaterial.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      renderer.dispose();
    };
  }, [interactive]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden" 
    />
  );
};

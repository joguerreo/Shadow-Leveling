import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface PactOrb3DProps {
  streakDays: number;
  totalInfractions?: number;
  size?: number;
}

export const PactOrb3D: React.FC<PactOrb3DProps> = ({
  streakDays,
  totalInfractions = 0,
  size = 72,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = size;
    const height = size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 2.9;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Soft lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.position.set(2, 3, 3);
    scene.add(dirLight);

    const isCompromised = totalInfractions > 0 && streakDays === 0;
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // 1. Dark Core of Forbidden Impulses - Ultra-Smooth Sphere
    const coreColor = isCompromised ? 0xdc2626 : 0x0f172a; // Deep crimson or sleek dark obsidian
    const coreGeom = new THREE.SphereGeometry(0.68, 40, 40);
    const coreMat = new THREE.MeshStandardMaterial({
      color: coreColor,
      roughness: 0.3,
      metalness: 0.6,
      transparent: true,
      opacity: 0.95,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    orbGroup.add(coreMesh);

    // 2. Willpower Containment Halo - Smooth Soft Sphere (no wireframe clutter)
    const cageColor = isCompromised
      ? 0xf87171
      : streakDays > 3
      ? 0xf59e0b // Golden discipline
      : 0xf43f5e; // Crimson rose
    const wireGeom = new THREE.SphereGeometry(0.82, 32, 32);
    const wireMat = new THREE.MeshBasicMaterial({
      color: cageColor,
      transparent: true,
      opacity: isCompromised ? 0.35 : 0.22,
      wireframe: false,
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    orbGroup.add(wireMesh);

    // 3. Containment Torus Ring
    const ringGeom = new THREE.TorusGeometry(0.96, 0.013, 12, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: streakDays > 0 ? 0x10b981 : 0xf43f5e,
      transparent: true,
      opacity: 0.75,
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    orbGroup.add(ringMesh);

    const clock = new THREE.Clock();
    let reqId = 0;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      coreMesh.rotation.y += 0.008;
      wireMesh.rotation.y += 0.008;
      wireMesh.rotation.x += 0.006;
      ringMesh.rotation.z += 0.014;

      // Pulse containment field
      const pulseSpeed = isCompromised ? 4.5 : 2.0;
      const pulseAmp = isCompromised ? 0.06 : 0.025;
      const pulse = 1.0 + Math.sin(elapsed * pulseSpeed) * pulseAmp;
      coreMesh.scale.set(pulse, pulse, pulse);
      wireMesh.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      renderer.dispose();
      coreGeom.dispose();
      coreMat.dispose();
      wireGeom.dispose();
      wireMat.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [streakDays, totalInfractions, size]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size }}
      className="shrink-0 flex items-center justify-center pointer-events-none select-none transition-transform group-hover:scale-105"
    />
  );
};

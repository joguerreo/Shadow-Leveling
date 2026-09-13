import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface QuestOrb3DProps {
  category: string;
  completed: boolean;
  size?: number;
}

const CATEGORY_COLOR_HEX: Record<string, { main: number; light: number; wire: number }> = {
  physical: { main: 0xe11d48, light: 0xfb7185, wire: 0xf43f5e }, // Rose / Red
  intellect: { main: 0x0284c7, light: 0x38bdf8, wire: 0x06b6d4 }, // Cyan / Sky
  focus: { main: 0x9333ea, light: 0xc084fc, wire: 0xa855f7 }, // Purple
  vitality: { main: 0x059669, light: 0x34d399, wire: 0x10b981 }, // Emerald
  daily: { main: 0xd97706, light: 0xfcd34d, wire: 0xf59e0b }, // Amber
};

export const QuestOrb3D: React.FC<QuestOrb3DProps> = ({
  category,
  completed,
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
    camera.position.z = 2.8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Subtle lighting for smooth gloss
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(2, 3, 3);
    scene.add(dirLight);

    const colors = CATEGORY_COLOR_HEX[category] || CATEGORY_COLOR_HEX.intellect;
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // 1. Inner Sphere (Core) - High segment smooth geometry
    const coreGeom = new THREE.SphereGeometry(0.72, 40, 40);
    const coreMat = new THREE.MeshStandardMaterial({
      color: completed ? 0x94a3b8 : colors.main,
      roughness: 0.25,
      metalness: 0.65,
      transparent: true,
      opacity: completed ? 0.45 : 0.95,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    orbGroup.add(coreMesh);

    // 2. Soft Luminous Minimal Halo Sphere (Smooth, no wireframe clutter)
    const shellGeom = new THREE.SphereGeometry(0.85, 32, 32);
    const shellMat = new THREE.MeshBasicMaterial({
      color: completed ? 0x64748b : colors.light,
      transparent: true,
      opacity: completed ? 0.12 : 0.25,
      wireframe: false,
    });
    const shellMesh = new THREE.Mesh(shellGeom, shellMat);
    orbGroup.add(shellMesh);

    // 3. Orbital Energy Ring (Active state only)
    let ringMesh: THREE.Mesh | null = null;
    let ringGeom: THREE.TorusGeometry | null = null;
    let ringMat: THREE.MeshBasicMaterial | null = null;
    if (!completed) {
      ringGeom = new THREE.TorusGeometry(1.0, 0.014, 12, 48);
      ringMat = new THREE.MeshBasicMaterial({
        color: colors.wire,
        transparent: true,
        opacity: 0.7,
      });
      ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.rotation.x = Math.PI / 2.6;
      orbGroup.add(ringMesh);
    }

    const clock = new THREE.Clock();
    let reqId = 0;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotation & subtle levitation
      const rotSpeed = completed ? 0.005 : 0.012;
      coreMesh.rotation.y += rotSpeed;
      shellMesh.rotation.y += rotSpeed * 1.2;
      shellMesh.rotation.x += rotSpeed * 0.7;

      if (ringMesh) {
        ringMesh.rotation.z += 0.015;
      }

      // Pulse rhythm for active quests
      if (!completed) {
        const pulse = 1.0 + Math.sin(elapsed * 2.8) * 0.04;
        coreMesh.scale.set(pulse, pulse, pulse);
        shellMesh.scale.set(pulse, pulse, pulse);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      renderer.dispose();
      coreGeom.dispose();
      coreMat.dispose();
      shellGeom.dispose();
      shellMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [category, completed, size]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size }}
      className="shrink-0 flex items-center justify-center pointer-events-none select-none transition-transform group-hover:scale-105"
    />
  );
};

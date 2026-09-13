import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface BiometricCoreOrb3DProps {
  level: number;
  hpPercent: number; // 0 to 100
  streakDays: number;
  combatPower?: number;
}

export const BiometricCoreOrb3D: React.FC<BiometricCoreOrb3DProps> = ({
  level,
  hpPercent,
  streakDays,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 150;
    const height = container.clientHeight || 150;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.z = 3.6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Color based on Energy (hpPercent)
    const isLowEnergy = hpPercent <= 30;
    const coreColor = isLowEnergy ? 0xef4444 : 0x06b6d4;
    const ringColor = isLowEnergy ? 0xf87171 : 0x38bdf8;
    const accentColor = streakDays >= 7 ? 0xf59e0b : 0x818cf8;

    // 1. Central faceted diamond core
    const coreGeom = new THREE.OctahedronGeometry(0.7, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: coreColor,
      wireframe: false,
      transparent: true,
      opacity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    scene.add(coreMesh);

    // 2. Outer Wireframe Edges
    const wireGeom = new THREE.WireframeGeometry(coreGeom);
    const wireMat = new THREE.LineBasicMaterial({
      color: ringColor,
      transparent: true,
      opacity: 0.85,
    });
    const wireMesh = new THREE.LineSegments(wireGeom, wireMat);
    scene.add(wireMesh);

    // 3. Gyroscopic Ring 1
    const ringGeom1 = new THREE.TorusGeometry(1.05, 0.015, 8, 48);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: ringColor,
      transparent: true,
      opacity: 0.6,
    });
    const ringMesh1 = new THREE.Mesh(ringGeom1, ringMat1);
    scene.add(ringMesh1);

    // 4. Gyroscopic Ring 2 (Tilted)
    const ringGeom2 = new THREE.TorusGeometry(1.22, 0.012, 8, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.5,
    });
    const ringMesh2 = new THREE.Mesh(ringGeom2, ringMat2);
    ringMesh2.rotation.x = Math.PI / 3;
    scene.add(ringMesh2);

    // Mouse drag interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      coreMesh.rotation.y += deltaX * 0.015;
      coreMesh.rotation.x += deltaY * 0.015;
      wireMesh.rotation.y += deltaX * 0.015;
      wireMesh.rotation.x += deltaY * 0.015;
      ringMesh1.rotation.y += deltaX * 0.01;
      ringMesh2.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    const clock = new THREE.Clock();
    let reqId = 0;
    const baseSpeed = 0.5 + Math.min(level, 50) * 0.01;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gyro rotation
      coreMesh.rotation.y += 0.012 * baseSpeed;
      coreMesh.rotation.x += 0.007 * baseSpeed;
      wireMesh.rotation.y += 0.012 * baseSpeed;
      wireMesh.rotation.x += 0.007 * baseSpeed;

      ringMesh1.rotation.z += 0.009 * baseSpeed;
      ringMesh1.rotation.x += 0.005 * baseSpeed;
      ringMesh2.rotation.y -= 0.011 * baseSpeed;
      ringMesh2.rotation.z += 0.006 * baseSpeed;

      // Subtle breath pulse
      const pulse = 1.0 + Math.sin(elapsed * 2.2) * 0.04;
      coreMesh.scale.set(pulse, pulse, pulse);
      wireMesh.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(reqId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      renderer.dispose();
      coreGeom.dispose();
      coreMat.dispose();
      wireGeom.dispose();
      wireMat.dispose();
      ringGeom1.dispose();
      ringMat1.dispose();
      ringGeom2.dispose();
      ringMat2.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [level, hpPercent, streakDays]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none flex items-center justify-center pointer-events-auto"
      title="Reactor Biométrico 3D (Toca y arrastra para examinar)"
    />
  );
};

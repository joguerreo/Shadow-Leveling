import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ForbiddenPact } from '../../types';

interface PactContainmentSeal3DProps {
  pacts: ForbiddenPact[];
  activeCleanCount: number;
  infractionCountToday: number;
}

export const PactContainmentSeal3D: React.FC<PactContainmentSeal3DProps> = ({
  pacts,
  activeCleanCount,
  infractionCountToday,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 160;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.6, 3.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const sealGroup = new THREE.Group();
    scene.add(sealGroup);

    // Color logic: if infractions > 0, red pulse alert. If clean, rose/gold impenetrable seal.
    const isCompromised = infractionCountToday > 0;
    const coreColor = isCompromised ? 0xef4444 : 0x18181b; // Obsidian core
    const ringColor = isCompromised ? 0xf87171 : 0xf43f5e; // Rose glowing field
    const containmentColor = activeCleanCount >= pacts.length && pacts.length > 0 ? 0xf59e0b : 0xa855f7;

    // 1. Central Obsidian Nucleus (The Impulses Contained)
    const coreGeom = new THREE.DodecahedronGeometry(0.7, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: coreColor,
      wireframe: false,
      transparent: true,
      opacity: isCompromised ? 0.65 : 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    sealGroup.add(coreMesh);

    // 2. Wireframe Cage of Willpower
    const wireGeom = new THREE.WireframeGeometry(coreGeom);
    const wireMat = new THREE.LineBasicMaterial({
      color: ringColor,
      transparent: true,
      opacity: 0.8,
    });
    const wireMesh = new THREE.LineSegments(wireGeom, wireMat);
    sealGroup.add(wireMesh);

    // 3. Dual Electromagnetic Containment Rings
    const ringGeom1 = new THREE.TorusGeometry(1.15, 0.015, 8, 48);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: containmentColor,
      transparent: true,
      opacity: 0.65,
    });
    const ringMesh1 = new THREE.Mesh(ringGeom1, ringMat1);
    sealGroup.add(ringMesh1);

    const ringGeom2 = new THREE.TorusGeometry(1.35, 0.012, 8, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: ringColor,
      transparent: true,
      opacity: 0.5,
    });
    const ringMesh2 = new THREE.Mesh(ringGeom2, ringMat2);
    ringMesh2.rotation.x = Math.PI / 3;
    ringMesh2.rotation.y = Math.PI / 6;
    sealGroup.add(ringMesh2);

    // 4. Orbiting nodes for each active pact
    const pactNodes: THREE.Mesh[] = [];
    const count = Math.max(pacts.length, 1);

    pacts.forEach((pact, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1.25;
      const nodeGeom = new THREE.OctahedronGeometry(0.09, 0);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: pact.cleanStreakDays > 0 ? 0x10b981 : 0xf43f5e,
      });
      const nodeMesh = new THREE.Mesh(nodeGeom, nodeMat);
      nodeMesh.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      sealGroup.add(nodeMesh);
      pactNodes.push(nodeMesh);
    });

    // Drag interaction
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

      sealGroup.rotation.y += deltaX * 0.01;
      sealGroup.rotation.x += deltaY * 0.008;

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

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotation speeds
      if (!isDragging) {
        sealGroup.rotation.y += 0.007;
      }

      ringMesh1.rotation.z += 0.012;
      ringMesh2.rotation.z -= 0.009;

      // Pulse containment field
      const pulse = 1.0 + Math.sin(elapsed * 2.5) * (isCompromised ? 0.08 : 0.03);
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
  }, [pacts, activeCleanCount, infractionCountToday]);

  return (
    <div className="relative w-full h-40 sm:h-44 rounded-2xl bg-[#090e1a]/90 border border-rose-950/60 overflow-hidden mb-4 shadow-inner flex items-center justify-center backdrop-blur-md">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none flex items-center justify-center"
        title="Sello de Contención 3D de Compromisos (Toca y arrastra para examinar)"
      />

      {/* Status Overlay */}
      <div className="absolute top-2.5 left-3 flex items-center gap-1.5 bg-[#0c1322]/80 px-2.5 py-1 rounded-full border border-rose-500/30 text-[10px] font-mono text-rose-300 font-bold backdrop-blur-sm pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        <span>Sello de Fuerza de Voluntad</span>
      </div>

      <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-500 pointer-events-none">
        Arrastra para rotar el sello
      </div>

      <div className="absolute bottom-2 right-3 text-[10px] font-mono text-amber-400 font-bold bg-[#0c1322]/80 px-2 py-0.5 rounded-full border border-amber-500/30 pointer-events-none">
        {activeCleanCount}/{pacts.length} Intactos
      </div>
    </div>
  );
};

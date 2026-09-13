import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Quest } from '../../types';

interface QuestConstellation3DProps {
  quests: Quest[];
  onSelectQuest: (quest: Quest) => void;
  onQuickComplete?: (quest: Quest) => void;
}

const CATEGORY_COLORS: Record<string, number> = {
  physical: 0xf43f5e, // Rose / Red
  intellect: 0x06b6d4, // Cyan / Blue
  focus: 0xa855f7, // Purple
  vitality: 0x10b981, // Emerald / Green
  daily: 0xf59e0b, // Amber / Gold
};

export const QuestConstellation3D: React.FC<QuestConstellation3DProps> = ({
  quests,
  onSelectQuest,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeTooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group for all rotating elements
    const constellationGroup = new THREE.Group();
    scene.add(constellationGroup);

    // Central Sun / Nucleus of the day
    const coreGeom = new THREE.SphereGeometry(0.35, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    constellationGroup.add(coreMesh);

    // Subtle orbital ring
    const ringGeom = new THREE.RingGeometry(2.2, 2.22, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 2.5;
    constellationGroup.add(ringMesh);

    // Orbs for each quest
    const orbMeshes: { mesh: THREE.Mesh; quest: Quest; initialPos: THREE.Vector3 }[] = [];
    const count = Math.max(quests.length, 1);

    quests.forEach((quest, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 2.0 + (i % 2 === 0 ? 0.35 : -0.25);
      const yOffset = Math.sin(angle * 2) * 0.5;

      const x = Math.cos(angle) * radius;
      const y = yOffset;
      const z = Math.sin(angle) * radius;

      const baseColor = quest.completed
        ? 0x94a3b8
        : CATEGORY_COLORS[quest.category] || 0x38bdf8;

      // Quest Orb Geometry (higher rank or target count = slightly larger)
      const orbRadius = quest.completed ? 0.16 : 0.24;
      const orbGeom = new THREE.SphereGeometry(orbRadius, 16, 16);
      const orbMat = new THREE.MeshBasicMaterial({
        color: baseColor,
        wireframe: quest.completed,
        transparent: true,
        opacity: quest.completed ? 0.45 : 0.85,
      });

      const orbMesh = new THREE.Mesh(orbGeom, orbMat);
      orbMesh.position.set(x, y, z);
      (orbMesh as any).userData = { quest };
      constellationGroup.add(orbMesh);

      // Wireframe aura around active orbs
      if (!quest.completed) {
        const auraGeom = new THREE.IcosahedronGeometry(orbRadius * 1.5, 0);
        const auraMat = new THREE.LineBasicMaterial({
          color: baseColor,
          transparent: true,
          opacity: 0.6,
        });
        const aura = new THREE.LineSegments(new THREE.WireframeGeometry(auraGeom), auraMat);
        orbMesh.add(aura);
      }

      // Connecting beam from center to orb
      const lineMat = new THREE.LineBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: quest.completed ? 0.15 : 0.4,
      });
      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z),
      ]);
      const line = new THREE.Line(lineGeom, lineMat);
      constellationGroup.add(line);

      orbMeshes.push({ mesh: orbMesh, quest, initialPos: new THREE.Vector3(x, y, z) });
    });

    // Raycaster for click/touch detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Mouse drag interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        constellationGroup.rotation.y += deltaX * 0.008;
        constellationGroup.rotation.x += deltaY * 0.005;

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }

      // Hover detection
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(orbMeshes.map((o) => o.mesh));

      if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer';
        const hit = intersects[0].object as any;
        if (hit.userData?.quest && activeTooltipRef.current) {
          activeTooltipRef.current.innerText = `${hit.userData.quest.title} (${hit.userData.quest.completed ? 'Completado' : 'Pendiente'})`;
          activeTooltipRef.current.style.display = 'block';
        }
      } else {
        renderer.domElement.style.cursor = isDragging ? 'grabbing' : 'grab';
        if (activeTooltipRef.current) {
          activeTooltipRef.current.style.display = 'none';
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      // If was a click (not drag), detect clicked orb
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist < 5) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(orbMeshes.map((o) => o.mesh));
        if (intersects.length > 0) {
          const hit = intersects[0].object as any;
          if (hit.userData?.quest) {
            onSelectQuest(hit.userData.quest);
          }
        }
      }
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

      // Slow idle orbit
      if (!isDragging) {
        constellationGroup.rotation.y += 0.003;
      }

      // Float effect on orbs
      orbMeshes.forEach((item, index) => {
        item.mesh.position.y = item.initialPos.y + Math.sin(elapsed * 1.5 + index) * 0.08;
      });

      coreMesh.rotation.y += 0.01;
      coreMesh.rotation.x += 0.005;

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
      ringGeom.dispose();
      ringMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [quests, onSelectQuest]);

  return (
    <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-[#090e1a]/90 border border-[#1c2a45] overflow-hidden my-3 shadow-inner select-none backdrop-blur-md">
      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
        title="Constelación 3D de Objetivos (Arrastra para rotar el mapa estelar, toca un orbe para ver detalles)"
      />

      {/* Floating Hover Tooltip */}
      <div
        ref={activeTooltipRef}
        className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#0c1322]/95 border border-cyan-500/50 text-[11px] font-mono text-cyan-300 font-bold shadow-lg pointer-events-none hidden max-w-[90%] truncate text-center"
      />

      {/* Help label */}
      <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-500 pointer-events-none flex items-center gap-1">
        <span className="material-symbols-outlined text-xs">touch_app</span>
        <span>Arrastra para rotar • Toca un orbe para inspeccionar</span>
      </div>

      <div className="absolute bottom-2 right-3 text-[10px] font-mono text-cyan-400/80 pointer-events-none">
        {quests.filter((q) => q.completed).length}/{quests.length} Alineados
      </div>
    </div>
  );
};

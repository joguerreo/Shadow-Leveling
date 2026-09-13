import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Quest } from '../../types';

interface QuestSpatialCarousel3DProps {
  quests: Quest[];
  onSelectQuest: (quest: Quest) => void;
  onQuickComplete?: (quest: Quest) => void;
}

const CATEGORY_HEX: Record<string, { core: number; wire: number; glow: string }> = {
  fitness: { core: 0xe11d48, wire: 0xfb7185, glow: '#f43f5e' },
  physical: { core: 0xe11d48, wire: 0xfb7185, glow: '#f43f5e' },
  intellect: { core: 0x0284c7, wire: 0x38bdf8, glow: '#06b6d4' },
  discipline: { core: 0x9333ea, wire: 0xc084fc, glow: '#a855f7' },
  focus: { core: 0x9333ea, wire: 0xc084fc, glow: '#a855f7' },
  habit: { core: 0x059669, wire: 0x34d399, glow: '#10b981' },
  mindfulness: { core: 0x0d9488, wire: 0x2dd4bf, glow: '#14b8a6' },
  special: { core: 0xd97706, wire: 0xfcd34d, glow: '#f59e0b' },
};

export const QuestSpatialCarousel3D: React.FC<QuestSpatialCarousel3DProps> = ({
  quests,
  onSelectQuest,
  onQuickComplete,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [isInspecting, setIsInspecting] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Keep ref synchronized
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Three.js scene setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container || quests.length === 0) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Subtle lighting for elegant glossy reflection on smooth orbs
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 1.5, 10);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // Group that holds all orbs
    const carouselGroup = new THREE.Group();
    scene.add(carouselGroup);

    // Build orbs mesh representations
    const orbMeshes: {
      group: THREE.Group;
      core: THREE.Mesh;
      shell: THREE.Mesh;
      ring: THREE.Mesh;
      index: number;
    }[] = [];

    const total = quests.length;
    const radius = Math.max(3.2, total * 0.55); // Dynamic radius based on quest count

    quests.forEach((q, idx) => {
      const orbGroup = new THREE.Group();
      const catColor = CATEGORY_HEX[q.category] || CATEGORY_HEX.intellect;

      // 1. Sleek Ultra-Smooth Core Sphere (High segment count: 48x48)
      const coreGeom = new THREE.SphereGeometry(0.58, 48, 48);
      const coreMat = new THREE.MeshStandardMaterial({
        color: q.completed ? 0x64748b : catColor.core,
        roughness: 0.25,
        metalness: 0.65,
        transparent: true,
        opacity: q.completed ? 0.45 : 0.95,
      });
      const coreMesh = new THREE.Mesh(coreGeom, coreMat);
      orbGroup.add(coreMesh);

      // 2. Soft Luminous Minimal Halo Outer Sphere (Clean, no intersecting polygonal wire lines)
      const shellGeom = new THREE.SphereGeometry(0.72, 32, 32);
      const shellMat = new THREE.MeshBasicMaterial({
        color: q.completed ? 0x475569 : catColor.wire,
        transparent: true,
        opacity: q.completed ? 0.12 : 0.28,
        wireframe: false,
      });
      const shellMesh = new THREE.Mesh(shellGeom, shellMat);
      orbGroup.add(shellMesh);

      // 3. Ultra-Fine Minimal Orbital Horizon Ring (Clean and thin)
      const ringGeom = new THREE.TorusGeometry(0.85, 0.012, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: q.completed ? 0x334155 : catColor.wire,
        transparent: true,
        opacity: q.completed ? 0.25 : 0.75,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.rotation.x = Math.PI / 2.8;
      orbGroup.add(ringMesh);

      orbGroup.userData = { questIndex: idx };
      carouselGroup.add(orbGroup);

      orbMeshes.push({
        group: orbGroup,
        core: coreMesh,
        shell: shellMesh,
        ring: ringMesh,
        index: idx,
      });
    });

    // Raycaster for mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Drag / Swipe handling
    let isDragging = false;
    let startX = 0;
    let currentAngle = 0;
    let targetAngle = 0;

    const anglePerItem = (Math.PI * 2) / Math.max(total, 1);

    const updateTargetAngleFromIndex = (idx: number) => {
      targetAngle = -idx * anglePerItem;
    };
    updateTargetAngleFromIndex(activeIndexRef.current);

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      startX = e.clientX;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        orbMeshes.map((m) => m.core),
        false
      );

      if (intersects.length > 0) {
        const found = orbMeshes.find((m) => m.core === intersects[0].object);
        if (found) {
          container.style.cursor = 'pointer';
          setHoveredIdx(found.index);
        }
      } else {
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
        setHoveredIdx(null);
      }

      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      startX = e.clientX;
      targetAngle += (deltaX / width) * 2.8;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;

      // Snap to closest index
      let closestIdx = Math.round(-targetAngle / anglePerItem);
      // Normalize index modulo total
      closestIdx = ((closestIdx % total) + total) % total;
      setActiveIndex(closestIdx);
      targetAngle = -closestIdx * anglePerItem;

      // Check click without drag
      const rect = container.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const clickY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const clickMouse = new THREE.Vector2(clickX, clickY);
      raycaster.setFromCamera(clickMouse, camera);
      const intersects = raycaster.intersectObjects(
        orbMeshes.map((m) => m.core),
        false
      );

      if (intersects.length > 0) {
        const found = orbMeshes.find((m) => m.core === intersects[0].object);
        if (found) {
          if (found.index === activeIndexRef.current) {
            // Clicked the center orb -> open detail / inspect
            onSelectQuest(quests[found.index]);
          } else {
            // Clicked another orb -> rotate to it
            setActiveIndex(found.index);
          }
        }
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 600;
      height = container.clientHeight || 320;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    let reqId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth dampening towards target angle
      currentAngle += (targetAngle - currentAngle) * 0.085;

      // Position each orb in a 3D cylindrical arc with depth
      orbMeshes.forEach((item) => {
        const itemAngle = currentAngle + item.index * anglePerItem;
        const x = Math.sin(itemAngle) * radius;
        const z = Math.cos(itemAngle) * radius - radius + 0.3; // Bring front orb forward
        const y = Math.sin(elapsed * 1.5 + item.index) * 0.08; // Subtle idle breathing

        item.group.position.set(x, y, z);

        // Internal rotations
        item.core.rotation.y += 0.012;
        item.shell.rotation.y += 0.016;
        item.shell.rotation.x += 0.008;
        item.ring.rotation.z += 0.02;

        // Frontmost orb receives focus scaling & bloom expansion
        const isCenter = Math.abs(itemAngle % (Math.PI * 2)) < anglePerItem * 0.45;
        const targetScale = isCenter ? 1.25 : 0.82;
        item.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

        // Opening animation when center orb is clicked/inspected
        if (isCenter) {
          const pulse = 1.0 + Math.sin(elapsed * 3) * 0.03;
          item.shell.scale.set(pulse, pulse, pulse);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      resizeObserver.disconnect();
      renderer.dispose();
      orbMeshes.forEach((m) => {
        m.core.geometry.dispose();
        m.shell.geometry.dispose();
        m.ring.geometry.dispose();
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [quests, onSelectQuest]);

  if (quests.length === 0) {
    return (
      <div className="py-12 text-center text-xs font-mono text-slate-500 bg-[#0c1322]/60 rounded-2xl border border-[#1c2a45]">
        No hay objetivos en esta categoría.
      </div>
    );
  }

  const currentQuest = quests[activeIndex] || quests[0];
  const catStyle = CATEGORY_HEX[currentQuest.category] || CATEGORY_HEX.intellect;

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* 3D Interactive Spatial Stage */}
      <div className="relative w-full h-72 sm:h-80 bg-[#080d19]/80 border border-[#1c2a45] rounded-3xl overflow-hidden shadow-2xl shadow-cyan-950/20 backdrop-blur-md">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, #00f0ff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Ambient Top Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 rounded-full blur-3xl opacity-30 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: catStyle.glow }}
        />

        {/* Navigation Arrow Left */}
        <button
          onClick={() => {
            const next = (activeIndex - 1 + quests.length) % quests.length;
            setActiveIndex(next);
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0c1322]/80 border border-[#1c2a45] hover:border-cyan-400 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
          title="Objetivo anterior"
        >
          <span className="material-symbols-outlined text-lg">chevron_left</span>
        </button>

        {/* Three.js Canvas Container */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Navigation Arrow Right */}
        <button
          onClick={() => {
            const next = (activeIndex + 1) % quests.length;
            setActiveIndex(next);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0c1322]/80 border border-[#1c2a45] hover:border-cyan-400 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
          title="Siguiente objetivo"
        >
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>

        {/* Centered Hologram Click Target Overlay */}
        <div className="absolute bottom-3 inset-x-0 flex flex-col items-center pointer-events-none">
          <span className="text-[11px] font-mono text-cyan-400/80 bg-[#070b14]/80 px-3 py-1 rounded-full border border-cyan-500/30 backdrop-blur-md flex items-center gap-1 shadow-md">
            <span className="material-symbols-outlined text-xs animate-bounce">touch_app</span>
            <span>Toca el orbe central para abrir su información</span>
          </span>
        </div>
      </div>

      {/* Interactive Telemetry Card of the Selected Orb */}
      <div className="w-full max-w-xl -mt-6 z-20 px-3">
        <div
          onClick={() => onSelectQuest(currentQuest)}
          className="p-4 rounded-2xl bg-[#0c1322]/95 border border-[#1c2a45] hover:border-cyan-400/80 shadow-2xl transition-all cursor-pointer backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
            {/* Direct Complete Circle Button */}
            {onQuickComplete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickComplete(currentQuest);
                }}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all shadow-md ${
                  currentQuest.completed
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                    : 'bg-[#121a2d] border-slate-600 hover:border-cyan-400 text-transparent hover:text-cyan-300'
                }`}
                title={currentQuest.completed ? 'Objetivo completado' : 'Marcar como completado'}
              >
                <span className="material-symbols-outlined text-lg font-bold">check</span>
              </button>
            )}

            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold"
                  style={{
                    color: catStyle.glow,
                    background: `${catStyle.glow}18`,
                    border: `1px solid ${catStyle.glow}40`,
                  }}
                >
                  {currentQuest.category}
                </span>
                <span className="text-[11px] font-mono font-bold text-amber-400">
                  +{currentQuest.rewards.xp} XP
                </span>
                {currentQuest.completed && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                    COMPLETADO
                  </span>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white font-sans truncate group-hover:text-cyan-200 transition-colors">
                {currentQuest.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectQuest(currentQuest);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <span>Abrir Orbe</span>
              <span className="material-symbols-outlined text-sm">open_in_full</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scannable Dots Indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {quests.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setActiveIndex(idx)}
            className={`h-1.5 rounded-full transition-all ${
              activeIndex === idx
                ? 'w-6 bg-cyan-400 shadow-sm shadow-cyan-400'
                : q.completed
                ? 'w-2 bg-emerald-500/50'
                : 'w-2 bg-slate-700 hover:bg-slate-500'
            }`}
            title={q.title}
          />
        ))}
      </div>
    </div>
  );
};

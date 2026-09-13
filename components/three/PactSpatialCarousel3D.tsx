import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ForbiddenPact } from '../../types';

interface PactSpatialCarousel3DProps {
  pacts: ForbiddenPact[];
  onSelectPact: (pact: ForbiddenPact) => void;
  onRegisterInfraction?: (pact: ForbiddenPact) => void;
}

export const PactSpatialCarousel3D: React.FC<PactSpatialCarousel3DProps> = ({
  pacts,
  onSelectPact,
  onRegisterInfraction,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || pacts.length === 0) return;

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

    // Ambient and directional lighting for smooth shading
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.position.set(3, 4, 4);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xf43f5e, 1.4, 10);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    const carouselGroup = new THREE.Group();
    scene.add(carouselGroup);

    const orbMeshes: {
      group: THREE.Group;
      core: THREE.Mesh;
      cage: THREE.Mesh;
      ring: THREE.Mesh;
      index: number;
    }[] = [];

    const total = pacts.length;
    const radius = Math.max(3.2, total * 0.55);

    pacts.forEach((p, idx) => {
      const orbGroup = new THREE.Group();
      const hasStreak = p.cleanStreakDays > 0;
      const isCompromised = p.totalInfractions > 0 && p.cleanStreakDays === 0;

      // 1. Sleek Ultra-Smooth Core Sphere (Glossy dark obsidian or deep crimson)
      const coreColor = isCompromised ? 0xdc2626 : hasStreak ? 0x0f172a : 0x1e1b4b;
      const coreGeom = new THREE.SphereGeometry(0.58, 48, 48);
      const coreMat = new THREE.MeshStandardMaterial({
        color: coreColor,
        roughness: 0.3,
        metalness: 0.6,
        transparent: true,
        opacity: 0.95,
      });
      const coreMesh = new THREE.Mesh(coreGeom, coreMat);
      orbGroup.add(coreMesh);

      // 2. Soft Luminous Minimalist Halo Sphere (Smooth, no distracting wireframe lines)
      const auraColor = isCompromised
        ? 0xf87171
        : p.cleanStreakDays > 5
        ? 0xf59e0b
        : 0xf43f5e;
      const cageGeom = new THREE.SphereGeometry(0.72, 32, 32);
      const cageMat = new THREE.MeshBasicMaterial({
        color: auraColor,
        transparent: true,
        opacity: isCompromised ? 0.35 : 0.22,
        wireframe: false,
      });
      const cageMesh = new THREE.Mesh(cageGeom, cageMat);
      orbGroup.add(cageMesh);

      // 3. Ultra-Fine Minimal Orbital Ring
      const ringGeom = new THREE.TorusGeometry(0.85, 0.012, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hasStreak ? 0x10b981 : 0xf43f5e,
        transparent: true,
        opacity: 0.75,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.rotation.x = Math.PI / 3;
      orbGroup.add(ringMesh);

      carouselGroup.add(orbGroup);
      orbMeshes.push({
        group: orbGroup,
        core: coreMesh,
        cage: cageMesh,
        ring: ringMesh,
        index: idx,
      });
    });

    const anglePerItem = (Math.PI * 2) / Math.max(total, 1);
    let isDragging = false;
    let startX = 0;
    let currentAngle = 0;
    let targetAngle = 0;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

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
        container.style.cursor = 'pointer';
      } else {
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
      }

      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      startX = e.clientX;
      targetAngle += (deltaX / width) * 2.8;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;

      let closestIdx = Math.round(-targetAngle / anglePerItem);
      closestIdx = ((closestIdx % total) + total) % total;
      setActiveIndex(closestIdx);
      targetAngle = -closestIdx * anglePerItem;

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
            onSelectPact(pacts[found.index]);
          } else {
            setActiveIndex(found.index);
          }
        }
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

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

    let reqId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      currentAngle += (targetAngle - currentAngle) * 0.085;

      orbMeshes.forEach((item) => {
        const itemAngle = currentAngle + item.index * anglePerItem;
        const x = Math.sin(itemAngle) * radius;
        const z = Math.cos(itemAngle) * radius - radius + 0.3;
        const y = Math.sin(elapsed * 1.4 + item.index) * 0.08;

        item.group.position.set(x, y, z);

        item.core.rotation.y += 0.009;
        item.cage.rotation.y += 0.01;
        item.cage.rotation.x += 0.006;
        item.ring.rotation.z += 0.015;

        const isCenter = Math.abs(itemAngle % (Math.PI * 2)) < anglePerItem * 0.45;
        const targetScale = isCenter ? 1.25 : 0.82;
        item.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

        if (isCenter) {
          const pulse = 1.0 + Math.sin(elapsed * 2.8) * 0.035;
          item.cage.scale.set(pulse, pulse, pulse);
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
        m.cage.geometry.dispose();
        m.ring.geometry.dispose();
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [pacts, onSelectPact]);

  if (pacts.length === 0) {
    return (
      <div className="py-12 text-center text-xs font-mono text-slate-500 bg-[#0c1322]/60 rounded-2xl border border-[#1c2a45]">
        No hay compromisos registrados en el Sistema.
      </div>
    );
  }

  const currentPact = pacts[activeIndex] || pacts[0];

  return (
    <div className="w-full flex flex-col items-center select-none">
      <div className="relative w-full h-72 sm:h-80 bg-[#0c0d18]/90 border border-rose-500/20 rounded-3xl overflow-hidden shadow-2xl shadow-rose-950/20 backdrop-blur-md">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, #f43f5e 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 rounded-full blur-3xl opacity-25 pointer-events-none bg-rose-600" />

        <button
          onClick={() => {
            const next = (activeIndex - 1 + pacts.length) % pacts.length;
            setActiveIndex(next);
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0c1322]/80 border border-[#1c2a45] hover:border-rose-400 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
          title="Compromiso anterior"
        >
          <span className="material-symbols-outlined text-lg">chevron_left</span>
        </button>

        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        <button
          onClick={() => {
            const next = (activeIndex + 1) % pacts.length;
            setActiveIndex(next);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0c1322]/80 border border-[#1c2a45] hover:border-rose-400 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
          title="Siguiente compromiso"
        >
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>

        <div className="absolute bottom-3 inset-x-0 flex flex-col items-center pointer-events-none">
          <span className="text-[11px] font-mono text-rose-300/80 bg-[#070a12]/80 px-3 py-1 rounded-full border border-rose-500/30 backdrop-blur-md flex items-center gap-1 shadow-md">
            <span className="material-symbols-outlined text-xs animate-bounce">touch_app</span>
            <span>Toca el orbe central para inspeccionar la contención</span>
          </span>
        </div>
      </div>

      <div className="w-full max-w-xl -mt-6 z-20 px-3">
        <div
          onClick={() => onSelectPact(currentPact)}
          className="p-4 rounded-2xl bg-[#0c1322]/95 border border-[#1c2a45] hover:border-rose-500/80 shadow-2xl transition-all cursor-pointer backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
            {onRegisterInfraction && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegisterInfraction(currentPact);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1 shrink-0 active:scale-95"
                title="Registrar desliz"
              >
                <span className="material-symbols-outlined text-xs">warning</span>
                <span>Desliz</span>
              </button>
            )}

            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold text-rose-300 bg-rose-950/40 border border-rose-500/30">
                  {currentPact.category}
                </span>
                <span className="text-[11px] font-mono text-amber-400 flex items-center gap-0.5 font-bold">
                  <span className="material-symbols-outlined text-xs">local_fire_department</span>
                  <span>{currentPact.cleanStreakDays}d limpios</span>
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white font-sans truncate group-hover:text-rose-200 transition-colors">
                {currentPact.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectPact(currentPact);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 border border-rose-500/40 text-white text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <span>Abrir Sello</span>
              <span className="material-symbols-outlined text-sm">open_in_full</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-3">
        {pacts.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => setActiveIndex(idx)}
            className={`h-1.5 rounded-full transition-all ${
              activeIndex === idx
                ? 'w-6 bg-rose-400 shadow-sm shadow-rose-400'
                : p.cleanStreakDays > 0
                ? 'w-2 bg-amber-500/50'
                : 'w-2 bg-slate-700 hover:bg-slate-500'
            }`}
            title={p.title}
          />
        ))}
      </div>
    </div>
  );
};

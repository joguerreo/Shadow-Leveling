import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface FocusCadenceOrb3DProps {
  isRunning: boolean;
  isPaused: boolean;
  breathePhase?: 'inhale' | 'hold-in' | 'exhale' | 'hold-out';
  progress?: number; // 0 to 1
}

export const FocusCadenceOrb3D: React.FC<FocusCadenceOrb3DProps> = ({
  isRunning,
  isPaused,
  breathePhase = 'inhale',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    mesh: THREE.Mesh;
    wireframe: THREE.LineSegments;
    particleSystem: THREE.Points;
    reqId: number;
    clock: THREE.Clock;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 240;
    const height = container.clientHeight || 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.userSelect = 'none';
    renderer.domElement.style.webkitUserSelect = 'none';
    container.style.touchAction = 'none';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 1. Inner glowing geometry
    const geometry = new THREE.IcosahedronGeometry(1.2, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      wireframe: false,
      transparent: true,
      opacity: 0.22,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 2. Outer Wireframe Cage
    const wireframeGeom = new THREE.WireframeGeometry(geometry);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      linewidth: 1.5,
    });
    const wireframe = new THREE.LineSegments(wireframeGeom, wireframeMat);
    scene.add(wireframe);

    // 3. Orbital Particles Ring
    const particleCount = 160;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = (i / particleCount) * Math.PI * 2;
      const radius = 1.7 + (Math.random() - 0.5) * 0.4;
      posArray[i * 3] = Math.cos(theta) * radius;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 0.6;
      posArray[i * 3 + 2] = Math.sin(theta) * radius;
    }
    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.85,
    });
    const particleSystem = new THREE.Points(particleGeom, particleMat);
    scene.add(particleSystem);

    const clock = new THREE.Clock();

    // Mouse drag interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handlePointerDown = (e: PointerEvent) => {
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
      try {
        renderer.domElement.setPointerCapture(e.pointerId);
      } catch (_) {}
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      mesh.rotation.y += deltaX * 0.01;
      mesh.rotation.x += deltaY * 0.01;
      wireframe.rotation.y += deltaX * 0.01;
      wireframe.rotation.x += deltaY * 0.01;
      particleSystem.rotation.y += deltaX * 0.008;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      try {
        renderer.domElement.releasePointerCapture(e.pointerId);
      } catch (_) {}
      if (e.cancelable) e.preventDefault();
      isDragging = false;
    };

    const handleTouchPrevent = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown, { passive: false });
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp, { passive: false });
    renderer.domElement.addEventListener('touchstart', handleTouchPrevent, { passive: false });
    renderer.domElement.addEventListener('touchmove', handleTouchPrevent, { passive: false });

    // Render loop
    let reqId = 0;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const speed = isRunning && !isPaused ? 1.0 : 0.35;

      mesh.rotation.y += 0.008 * speed;
      mesh.rotation.x += 0.004 * speed;
      wireframe.rotation.y += 0.008 * speed;
      wireframe.rotation.x += 0.004 * speed;
      particleSystem.rotation.y -= 0.005 * speed;

      // Pulse scaling according to breathing rhythm
      const breatheScale = isRunning && !isPaused
        ? 1.0 + Math.sin(elapsedTime * 0.8) * 0.15
        : 1.0 + Math.sin(elapsedTime * 0.4) * 0.05;

      mesh.scale.set(breatheScale, breatheScale, breatheScale);
      wireframe.scale.set(breatheScale, breatheScale, breatheScale);

      renderer.render(scene, camera);
    };

    animate();

    sceneRef.current = {
      renderer,
      scene,
      camera,
      mesh,
      wireframe,
      particleSystem,
      reqId,
      clock,
    };

    // Resize observer
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
      renderer.domElement.removeEventListener('touchstart', handleTouchPrevent);
      renderer.domElement.removeEventListener('touchmove', handleTouchPrevent);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      wireframeGeom.dispose();
      wireframeMat.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
    };
  }, [isRunning, isPaused, breathePhase]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-w-[190px] min-h-[190px] max-w-[260px] max-h-[260px] cursor-grab active:cursor-grabbing mx-auto touch-none select-none flex items-center justify-center"
      title="Esfera 3D de Cadencia y Respiración (Arrastra para rotar)"
    />
  );
};

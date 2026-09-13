import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AttributeMesh3DProps {
  str: number;
  intVal: number;
  vit: number;
  wis: number;
}

export const AttributeMesh3D: React.FC<AttributeMesh3DProps> = ({
  str,
  intVal,
  vit,
  wis,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 280;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Normalize stat values (scale from 0.5 to 1.5)
    const maxStat = Math.max(str, intVal, vit, wis, 25);
    const nStr = 0.5 + (str / maxStat) * 0.9;
    const nInt = 0.5 + (intVal / maxStat) * 0.9;
    const nVit = 0.5 + (vit / maxStat) * 0.9;
    const nWis = 0.5 + (wis / maxStat) * 0.9;

    // Tetrahedron / Diamond with 4 directional vertices
    // Top = Intellect (Cyan), Front = Strength (Red), Right = Vitality (Green), Left = Focus (Purple)
    const vertices = new Float32Array([
      // Top (INT)
      0, nInt * 1.3, 0,
      // Front-Right (STR)
      nStr * 1.1, -0.6, nStr * 0.7,
      // Front-Left (WIS)
      -nWis * 1.1, -0.6, nWis * 0.7,
      // Back (VIT)
      0, -0.6, -nVit * 1.2,
    ]);

    // Faces indices
    const indices = [
      0, 1, 2, // Face Top-Front
      0, 3, 1, // Face Top-Right
      0, 2, 3, // Face Top-Left
      1, 3, 2, // Face Bottom
    ];

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    // Translucent faceted mesh
    const mat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);

    // Glowing Wireframe lines
    const wireGeom = new THREE.WireframeGeometry(geom);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      linewidth: 2,
    });
    const wire = new THREE.LineSegments(wireGeom, wireMat);
    scene.add(wire);

    // Vertex points
    const pointGeom = new THREE.BufferGeometry();
    pointGeom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const pointMat = new THREE.PointsMaterial({
      size: 0.12,
      color: 0xa855f7,
      transparent: true,
      opacity: 0.95,
    });
    const points = new THREE.Points(pointGeom, pointMat);
    scene.add(points);

    // Base radar grid ring
    const gridRingGeom = new THREE.RingGeometry(1.2, 1.22, 32);
    const gridRingMat = new THREE.MeshBasicMaterial({
      color: 0x334155,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const gridRing = new THREE.Mesh(gridRingGeom, gridRingMat);
    gridRing.rotation.x = Math.PI / 2;
    gridRing.position.y = -0.6;
    scene.add(gridRing);

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

      mesh.rotation.y += deltaX * 0.015;
      mesh.rotation.x += deltaY * 0.015;
      wire.rotation.y += deltaX * 0.015;
      wire.rotation.x += deltaY * 0.015;
      points.rotation.y += deltaX * 0.015;
      points.rotation.x += deltaY * 0.015;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    let reqId = 0;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      mesh.rotation.y += 0.007;
      wire.rotation.y += 0.007;
      points.rotation.y += 0.007;

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
      geom.dispose();
      mat.dispose();
      wireGeom.dispose();
      wireMat.dispose();
      pointGeom.dispose();
      pointMat.dispose();
      gridRingGeom.dispose();
      gridRingMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [str, intVal, vit, wis]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[220px] max-h-[280px] cursor-grab active:cursor-grabbing touch-none select-none flex items-center justify-center mx-auto"
      title="Pirámide Holográfica 3D de Competencias (Arrastra para rotar)"
    />
  );
};

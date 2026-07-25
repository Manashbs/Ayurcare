'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HeroMandalaProps {
  className?: string;
}

export default function HeroMandala({ className = '' }: HeroMandalaProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Scene Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // --- Group to hold the parallax effect ---
    const parallaxGroup = new THREE.Group();
    scene.add(parallaxGroup);

    // --- Group to hold the entire mandala ---
    const mandalaGroup = new THREE.Group();
    parallaxGroup.add(mandalaGroup);

    // Color definitions
    const colorGold = new THREE.Color('#C9A24B');
    const colorTulsi = new THREE.Color('#3E5C4A');
    const colorCream = new THREE.Color('#F5F1E8');

    // --- 1. Concentric Rings ---
    const numRings = 7;
    const ringGroup = new THREE.Group();
    mandalaGroup.add(ringGroup);
    
    const ringMaterials: THREE.LineBasicMaterial[] = [];
    const rings: THREE.LineLoop[] = [];

    for (let i = 0; i < numRings; i++) {
      const radius = 1 + i * 0.4;
      // RingGeometry to get circle outline
      const geometry = new THREE.RingGeometry(radius, radius, 64);
      const edges = new THREE.EdgesGeometry(geometry);
      
      const t = i / (numRings - 1);
      const color = colorGold.clone().lerp(colorTulsi, t);
      
      const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
      ringMaterials.push(material);
      
      const ring = new THREE.LineLoop(edges, material);
      ring.userData = { rotationSpeed: (numRings - i) * 0.0005 };
      ringGroup.add(ring);
      rings.push(ring);
    }

    // --- 2. Sri-Yantra Triangles ---
    const triangleGroup = new THREE.Group();
    mandalaGroup.add(triangleGroup);

    // 4 Upward, 5 Downward
    const upTriangles = 4;
    const downTriangles = 5;
    const triangleMaterial = new THREE.LineBasicMaterial({ color: colorGold, transparent: true, opacity: 0.7 });

    const createTriangle = (scale: number, pointingUp: boolean) => {
      const points = [];
      const dir = pointingUp ? 1 : -1;
      const h = (Math.sqrt(3) / 2) * scale;
      points.push(new THREE.Vector3(0, dir * h * (2/3), 0));
      points.push(new THREE.Vector3(-scale / 2, -dir * h * (1/3), 0));
      points.push(new THREE.Vector3(scale / 2, -dir * h * (1/3), 0));
      points.push(new THREE.Vector3(0, dir * h * (2/3), 0)); // close loop
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geometry, triangleMaterial);
    };

    for (let i = 0; i < upTriangles; i++) {
      const scale = 1.2 + i * 0.3;
      const tri = createTriangle(scale, true);
      // Offset slightly to interlock
      tri.position.y = (i - upTriangles / 2) * 0.1;
      triangleGroup.add(tri);
    }

    for (let i = 0; i < downTriangles; i++) {
      const scale = 1.0 + i * 0.35;
      const tri = createTriangle(scale, false);
      tri.position.y = (i - downTriangles / 2) * 0.1;
      triangleGroup.add(tri);
    }

    // --- 3. Central Point of Light ---
    const sphereGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: colorGold });
    const centralSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    mandalaGroup.add(centralSphere);

    // --- 4. Floating Particles ---
    const particleCount = 250;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    
    const palette = [colorGold, colorCream, colorTulsi];

    for (let i = 0; i < particleCount; i++) {
      // random spherical distribution around mandala
      const r = 2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    parallaxGroup.add(particles);

    // --- Animation Loop ---
    let animationFrameId: number;
    let time = 0;

    const targetRotation = { x: 0, y: 0 };

    const animate = () => {
      time += 0.01;
      
      // Global slow Y rotation
      mandalaGroup.rotation.y -= 0.001;

      // Concentric rings independent rotation
      rings.forEach(ring => {
        ring.rotation.z += ring.userData.rotationSpeed;
      });

      // Triangles counter rotation
      triangleGroup.rotation.z -= 0.0005;

      // Particles orbit and sinusoidal movement
      particles.rotation.y += 0.0008;
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const x = positions[i * 3];
        positions[i * 3 + 1] += Math.sin(time * 2 + x) * 0.002;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Mouse parallax smoothing
      targetRotation.x = mouseRef.current.y * 0.15;
      targetRotation.y = mouseRef.current.x * 0.15;

      parallaxGroup.rotation.x += (targetRotation.x - parallaxGroup.rotation.x) * 0.05;
      parallaxGroup.rotation.y += (targetRotation.y - parallaxGroup.rotation.y) * 0.05;
      
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      
      renderer.setSize(newWidth, newHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose geometries and materials
      ringMaterials.forEach(m => m.dispose());
      rings.forEach(r => {
        r.geometry.dispose();
      });
      
      triangleMaterial.dispose();
      triangleGroup.children.forEach(c => {
        (c as THREE.Line).geometry.dispose();
      });
      
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      
      particleGeometry.dispose();
      particleMaterial.dispose();
      
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={`relative ${className}`} style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(201,162,75,0.06) 0%, transparent 70%)',
        }}
      />
      <div ref={mountRef} className="absolute inset-0" />
    </div>
  );
}

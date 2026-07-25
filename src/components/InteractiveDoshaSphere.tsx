'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Wind, Flame, Leaf, Sparkles } from 'lucide-react';

type DoshaType = 'vata' | 'pitta' | 'kapha';

export default function InteractiveDoshaSphere() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeDosha, setActiveDosha] = useState<DoshaType>('pitta');
  const activeDoshaRef = useRef<DoshaType>('pitta');

  // Keep ref in sync for render loop
  useEffect(() => {
    activeDoshaRef.current = activeDosha;
  }, [activeDosha]);

  useEffect(() => {
    if (!mountRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const width = rect.width || 400;
    const height = rect.height || 320;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 250;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Particles configuration
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const baseSpeeds = new Float32Array(particleCount);
    const baseAngles = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);

    // Distribute points on a sphere
    const radius = 60;
    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution (Fibonacci sphere)
      const phi = Math.acos(1 - 2 * i / particleCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = Math.cos(theta) * Math.sin(phi) * radius;
      const y = Math.sin(theta) * Math.sin(phi) * radius;
      const z = Math.cos(phi) * radius;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Base speeds and angles for dynamic motion
      baseSpeeds[i] = 0.5 + Math.random() * 1.5;
      baseAngles[i] = Math.random() * Math.PI * 2;
      radii[i] = radius;

      // Initial color (Pitta - orange/gold)
      colors[i * 3] = 0.9 + Math.random() * 0.1; // R
      colors[i * 3 + 1] = 0.5 + Math.random() * 0.3; // G
      colors[i * 3 + 2] = 0.1; // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle texture (soft circle)
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const texture = new THREE.CanvasTexture(canvas);

    // Material
    const material = new THREE.PointsMaterial({
      size: 2.2,
      map: texture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Points object
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Mouse interaction states
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onMouseMove = (event: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      // Normalised coordinates (-1 to 1)
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      targetRotationY = mouseX * 0.5;
      targetRotationX = -mouseY * 0.5;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Dynamic color transition variables
    const currentColors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      currentColors[i] = colors[i];
    }

    // Animation loop
    let clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      const mode = activeDoshaRef.current;

      // Rotate points toward mouse
      points.rotation.y += (targetRotationY - points.rotation.y) * 0.05;
      points.rotation.x += (targetRotationX - points.rotation.x) * 0.05;

      const posArr = geometry.attributes.position.array as Float32Array;
      const colorArr = geometry.attributes.color.array as Float32Array;

      // Target colors per mode
      let targetR = 0.9, targetG = 0.5, targetB = 0.1; // Pitta default
      if (mode === 'vata') {
        targetR = 0.2; targetG = 0.7; targetB = 0.9; // Vata: Cyan/Blue
      } else if (mode === 'kapha') {
        targetR = 0.1; targetG = 0.8; targetB = 0.4; // Kapha: Emerald
      }

      for (let i = 0; i < particleCount; i++) {
        // Retrieve original spherical positions
        const phi = Math.acos(1 - 2 * i / particleCount);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        
        let r = radius;
        let speedMultiplier = 1;

        if (mode === 'vata') {
          // Vata: Wind swirling and expansion/contraction, rapid chaos
          speedMultiplier = 2.5;
          const noise = Math.sin(time * 8 + i) * 6;
          r = radius + noise;
          
          // Rapid rotation around Y axis
          const curTheta = theta + time * baseSpeeds[i] * 0.3 * speedMultiplier;
          posArr[i * 3] = Math.cos(curTheta) * Math.sin(phi) * r;
          posArr[i * 3 + 1] = Math.sin(curTheta) * Math.sin(phi) * r + Math.cos(time * 2 + i) * 3;
          posArr[i * 3 + 2] = Math.cos(phi) * r;
          
          // Color Lerping
          colorArr[i * 3] += (targetR + Math.sin(time + i)*0.1 - colorArr[i * 3]) * 0.05;
          colorArr[i * 3 + 1] += (targetG + Math.cos(time + i)*0.1 - colorArr[i * 3 + 1]) * 0.05;
          colorArr[i * 3 + 2] += (targetB - colorArr[i * 3 + 2]) * 0.05;
          
        } else if (mode === 'pitta') {
          // Pitta: Heat pulse (outward solar flares)
          speedMultiplier = 1.5;
          const pulse = Math.sin(time * 5 + i * 0.1) * 8;
          r = radius + Math.max(0, pulse);
          
          const curTheta = theta + time * baseSpeeds[i] * 0.1 * speedMultiplier;
          posArr[i * 3] = Math.cos(curTheta) * Math.sin(phi) * r;
          posArr[i * 3 + 1] = Math.sin(curTheta) * Math.sin(phi) * r;
          posArr[i * 3 + 2] = Math.cos(phi) * r;

          // Color Lerping (pulsing warmth)
          const firePulse = Math.sin(time * 3 + i) * 0.1;
          colorArr[i * 3] += (targetR + firePulse - colorArr[i * 3]) * 0.05;
          colorArr[i * 3 + 1] += (targetG + firePulse - colorArr[i * 3 + 1]) * 0.05;
          colorArr[i * 3 + 2] += (targetB - colorArr[i * 3 + 2]) * 0.05;

        } else if (mode === 'kapha') {
          // Kapha: Steady, structured, heavy rotation
          speedMultiplier = 0.4;
          r = radius + Math.sin(time + i * 0.05) * 2; // minor ripple

          const curTheta = theta + time * baseSpeeds[i] * 0.05 * speedMultiplier;
          posArr[i * 3] = Math.cos(curTheta) * Math.sin(phi) * r;
          posArr[i * 3 + 1] = Math.sin(curTheta) * Math.sin(phi) * r;
          posArr[i * 3 + 2] = Math.cos(phi) * r;

          // Color Lerping
          colorArr[i * 3] += (targetR - colorArr[i * 3]) * 0.05;
          colorArr[i * 3 + 1] += (targetG + Math.sin(time + i)*0.05 - colorArr[i * 3 + 1]) * 0.05;
          colorArr[i * 3 + 2] += (targetB - colorArr[i * 3 + 2]) * 0.05;
        }

        // Add subtle mouse gravitational attraction
        if (mouseX !== 0 || mouseY !== 0) {
          const dx = posArr[i * 3] - (mouseX * radius);
          const dy = posArr[i * 3 + 1] - (mouseY * radius);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 40) {
            const force = (40 - dist) * 0.05;
            posArr[i * 3] += mouseX * force;
            posArr[i * 3 + 1] += mouseY * force;
          }
        }
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;

      // Slow orbital rotate the entire particle system
      points.rotation.y += 0.001;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 bg-white/40 backdrop-blur-md border border-slate-100 rounded-3xl shadow-xl relative glass-premium overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/10 rounded-full filter blur-xl"></div>
      
      {/* 3D Canvas Mount Point */}
      <div className="w-full h-[280px] md:h-[320px] flex items-center justify-center relative cursor-grab active:cursor-grabbing">
        <div ref={mountRef} className="w-full h-full absolute inset-0 flex items-center justify-center" />
        
        {/* Floating Indicator */}
        <div className="absolute bottom-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-[10px] text-slate-300 font-extrabold uppercase px-3 py-1.5 rounded-full shadow-lg tracking-wider flex items-center space-x-1.5 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
          <span>Interactive 3D energy matrix</span>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="w-full border-t border-slate-100/80 pt-5 mt-4 space-y-4">
        <div className="text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Interactive Dosha Engine</span>
          <h4 className="text-sm font-extrabold text-slate-800 tracking-tight mt-1 capitalize">{activeDosha} Bio-Energy State</h4>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => setActiveDosha('vata')}
            className={`py-2 px-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition duration-200 cursor-pointer ${
              activeDosha === 'vata'
                ? 'bg-cyan-50 border-cyan-200 text-cyan-700 shadow-md font-bold'
                : 'bg-white border-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Wind className={`w-4 h-4 ${activeDosha === 'vata' ? 'animate-bounce' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Vata</span>
          </button>

          <button
            onClick={() => setActiveDosha('pitta')}
            className={`py-2 px-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition duration-200 cursor-pointer ${
              activeDosha === 'pitta'
                ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-md font-bold'
                : 'bg-white border-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Flame className={`w-4 h-4 ${activeDosha === 'pitta' ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Pitta</span>
          </button>

          <button
            onClick={() => setActiveDosha('kapha')}
            className={`py-2 px-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition duration-200 cursor-pointer ${
              activeDosha === 'kapha'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-md font-bold'
                : 'bg-white border-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Leaf className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Kapha</span>
          </button>
        </div>
      </div>
    </div>
  );
}

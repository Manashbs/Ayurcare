'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Wind, Flame, Leaf, Sparkles } from 'lucide-react';

type DoshaType = 'vata' | 'pitta' | 'kapha';

interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  color: { r: number; g: number; b: number };
  speed: number;
  angle: number;
  r: number;
}

export default function InteractiveDoshaSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDosha, setActiveDosha] = useState<DoshaType>('pitta');
  const activeDoshaRef = useRef<DoshaType>('pitta');

  useEffect(() => {
    activeDoshaRef.current = activeDosha;
  }, [activeDosha]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions
    let width = container.clientWidth || 380;
    let height = 300;
    canvas.width = width;
    canvas.height = height;

    const particleCount = 1000;
    const particles: Particle[] = [];
    const sphereRadius = 65;

    // Distribute particles uniformly using Fibonacci sphere algorithm
    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(1 - (2 * i) / particleCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = Math.cos(theta) * Math.sin(phi) * sphereRadius;
      const y = Math.sin(theta) * Math.sin(phi) * sphereRadius;
      const z = Math.cos(phi) * sphereRadius;

      particles.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        color: { r: 245, g: 158, b: 11 }, // Default Pitta Orange
        speed: 0.2 + Math.random() * 0.8,
        angle: Math.random() * Math.PI * 2,
        r: sphereRadius,
      });
    }

    // Interaction states
    let mouseX = 0;
    let mouseY = 0;
    let isHovering = false;
    let rotationX = 0.5;
    let rotationY = 0.5;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left - width / 2;
      mouseY = e.clientY - rect.top - height / 2;
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
    };

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      rotationY += dx * 0.005;
      rotationX += dy * 0.005;
      startX = e.clientX;
      startY = e.clientY;
    };

    const handleWindowMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    let animationFrameId: number;
    let time = 0;

    // 3D Projection parameters
    const fov = 180;
    const centerX = width / 2;
    const centerY = height / 2;

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const mode = activeDoshaRef.current;

      // Slow idle rotation when not dragging
      if (!isDragging) {
        rotationY += 0.003;
        rotationX += 0.001;
      }

      // Target colors per mode
      let targetColor = { r: 245, g: 158, b: 11 }; // Pitta orange
      if (mode === 'vata') targetColor = { r: 6, g: 182, b: 212 }; // Vata cyan
      if (mode === 'kapha') targetColor = { r: 16, g: 185, b: 129 }; // Kapha emerald

      // Update and rotate particles
      const projected: any[] = [];

      particles.forEach((p, idx) => {
        let currentRadius = sphereRadius;

        // Apply Dosha animations to particles coordinates
        if (mode === 'vata') {
          // Swirling wind noise
          const noise = Math.sin(time * 5 + idx * 0.05) * 8;
          currentRadius = sphereRadius + noise;
          p.angle += p.speed * 0.08;
        } else if (mode === 'pitta') {
          // Heat pulse / expansion
          const pulse = Math.sin(time * 4 + idx * 0.1) * 7;
          currentRadius = sphereRadius + Math.max(-5, pulse);
          p.angle += p.speed * 0.03;
        } else if (mode === 'kapha') {
          // Steady rotate
          currentRadius = sphereRadius + Math.sin(time + idx * 0.02) * 2;
          p.angle += p.speed * 0.01;
        }

        // Apply rotation to base position
        const cosTheta = Math.cos(p.angle);
        const sinTheta = Math.sin(p.angle);
        
        let lx = p.baseX;
        let ly = p.baseY;
        let lz = p.baseZ;

        // Apply dynamic radius
        const length = Math.sqrt(lx*lx + ly*ly + lz*lz);
        lx = (lx / length) * currentRadius;
        ly = (ly / length) * currentRadius;
        lz = (lz / length) * currentRadius;

        // Apply mouse attraction/repulsion forces
        if (isHovering) {
          const dx = lx - mouseX;
          const dy = ly - mouseY;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 50) {
            const force = (50 - dist) * 0.06;
            lx += (mouseX / 2) * force * 0.02;
            ly += (mouseY / 2) * force * 0.02;
          }
        }

        // 3D Rotations
        // 1. Rotate Y (yaw)
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        let x1 = lx * cosY - lz * sinY;
        let z1 = lx * sinY + lz * cosY;

        // 2. Rotate X (pitch)
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        let y2 = ly * cosX - z1 * sinX;
        let z2 = ly * sinX + z1 * cosX;

        // Color transitions
        p.color.r += (targetColor.r - p.color.r) * 0.08;
        p.color.g += (targetColor.g - p.color.g) * 0.08;
        p.color.b += (targetColor.b - p.color.b) * 0.08;

        // Perspective projection
        const scale = fov / (fov + z2);
        const screenX = centerX + x1 * scale;
        const screenY = centerY + y2 * scale;

        projected.push({
          x: screenX,
          y: screenY,
          z: z2,
          scale,
          color: { ...p.color },
        });
      });

      // Depth sort particles so front particles cover back particles
      projected.sort((a, b) => b.z - a.z);

      // Render particles
      projected.forEach((p) => {
        const size = Math.max(0.5, p.scale * 1.8);
        const alpha = Math.max(0.1, Math.min(1, (p.z + sphereRadius) / (sphereRadius * 2)));

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        
        ctx.fillStyle = `rgba(${Math.round(p.color.r)}, ${Math.round(p.color.g)}, ${Math.round(p.color.b)}, ${alpha * 0.85})`;
        ctx.fill();

        // Dynamic bloom effect for bright particles in front
        if (p.z < -20) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${Math.round(p.color.r)}, ${Math.round(p.color.g)}, ${Math.round(p.color.b)}, ${alpha * 0.15})`;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = container.clientWidth || 380;
      canvas.width = width;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col items-center justify-center p-6 bg-white/40 backdrop-blur-md border border-slate-100 rounded-3xl shadow-xl relative glass-premium overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/10 rounded-full filter blur-xl"></div>

      {/* 3D Interactive Canvas */}
      <div className="w-full h-[280px] md:h-[320px] flex items-center justify-center relative cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="w-full h-full absolute inset-0 block" />

        {/* Floating Indicator */}
        <div className="absolute bottom-2 bg-slate-900/85 backdrop-blur-md border border-slate-800/80 text-[10px] text-slate-300 font-extrabold uppercase px-3.5 py-1.5 rounded-full shadow-lg tracking-wider flex items-center space-x-1.5 pointer-events-none">
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

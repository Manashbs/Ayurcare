'use client';

import React, { useEffect, useRef, useState } from 'react';

type SectionState = 'hero' | 'features' | 'method' | 'testimonials' | 'portals';

interface Particle {
  // Current rendering positions
  x: number;
  y: number;
  z: number;
  
  // Current lerping target positions
  tx: number;
  ty: number;
  tz: number;

  // Pre-computed positions for the 5 states
  s1: { x: number; y: number; z: number }; // Hero Sphere
  s2: { x: number; y: number; z: number }; // Wave Field
  s3: { x: number; y: number; z: number }; // Three Orbits
  s4: { x: number; y: number; z: number }; // Star Constellation
  s5: { x: number; y: number; z: number }; // Portal Ring

  // Colors
  color: { r: number; g: number; b: number };
  size: number;
  phase: number;
  speed: number;
}

export default function Fullscreen3DUniverse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeState, setActiveState] = useState<SectionState>('hero');
  const activeStateRef = useRef<SectionState>('hero');

  useEffect(() => {
    activeStateRef.current = activeState;
  }, [activeState]);

  useEffect(() => {
    // Detect active section on scroll
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = window.innerHeight;
      
      const heroEl = document.getElementById('vedasync-landing-page');
      const featuresEl = document.getElementById('features');
      const methodEl = document.getElementById('how-it-works');
      const testimonialsEl = document.getElementById('testimonials');
      const portalsEl = document.getElementById('doctors'); // Doctors & Access Portal section
      
      const scrollMid = scrollY + height * 0.45;

      if (portalsEl && scrollMid >= portalsEl.offsetTop) {
        setActiveState('portals');
      } else if (testimonialsEl && scrollMid >= testimonialsEl.offsetTop) {
        setActiveState('testimonials');
      } else if (methodEl && scrollMid >= methodEl.offsetTop) {
        setActiveState('method');
      } else if (featuresEl && scrollMid >= featuresEl.offsetTop) {
        setActiveState('features');
      } else {
        setActiveState('hero');
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    setTimeout(handleScroll, 100);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particleCount = 2000;
    const particles: Particle[] = [];

    // Helper: generate random on sphere
    const getSphereCoords = (radius: number, index: number, total: number) => {
      const phi = Math.acos(1 - (2 * index) / total);
      const theta = Math.PI * (1 + Math.sqrt(5)) * index;
      return {
        x: Math.cos(theta) * Math.sin(phi) * radius,
        y: Math.sin(theta) * Math.sin(phi) * radius,
        z: Math.cos(phi) * radius,
      };
    };

    // Precalculate all 5 states for the particle system
    for (let i = 0; i < particleCount; i++) {
      // 1. Hero Sphere (Gold/Amber)
      const s1 = getSphereCoords(150, i, particleCount);

      // 2. Wave Field (Cyan/Blue)
      // Arrange in a beautiful undulating grid
      const gridRows = 40;
      const gridCols = 50;
      const r = i % gridRows;
      const c = Math.floor(i / gridRows) % gridCols;
      const waveX = (c - gridCols / 2) * 14;
      const waveZ = (r - gridRows / 2) * 14;
      const waveY = Math.sin(waveX * 0.015) * Math.cos(waveZ * 0.015) * 45;
      const s2 = { x: waveX, y: waveY - 40, z: waveZ };

      // 3. Three Orbits (Vata, Pitta, Kapha)
      let s3 = { x: 0, y: 0, z: 0 };
      const orbitIdx = i % 3;
      const angle = (i / (particleCount / 3)) * Math.PI * 2;
      const orbitRadius = 160 + Math.sin(i * 10) * 8; // dynamic ring width
      if (orbitIdx === 0) {
        // Vata: tilted orbit
        s3 = {
          x: Math.cos(angle) * orbitRadius,
          y: Math.sin(angle) * orbitRadius * 0.5,
          z: Math.sin(angle) * orbitRadius * 0.86,
        };
      } else if (orbitIdx === 1) {
        // Pitta: vertical orbit
        s3 = {
          x: Math.sin(angle) * orbitRadius * 0.3,
          y: Math.cos(angle) * orbitRadius,
          z: Math.sin(angle) * orbitRadius * 0.95,
        };
      } else {
        // Kapha: horizontal orbit
        s3 = {
          x: Math.cos(angle) * orbitRadius,
          y: Math.sin(angle) * orbitRadius * 0.2,
          z: Math.sin(angle) * orbitRadius,
        };
      }

      // 4. Testimonials Stars (Rose/Amber)
      const s4 = {
        x: (Math.random() - 0.5) * width * 0.8,
        y: (Math.random() - 0.5) * height * 0.8,
        z: (Math.random() - 0.5) * 300,
      };

      // 5. Portal Ring (Purple/Emerald)
      // Torus equations
      const u = (i / particleCount) * Math.PI * 2 * 12; // spiral turns
      const v = (i / particleCount) * Math.PI * 2;
      const torusR = 90;
      const torusTube = 30;
      const s5 = {
        x: (torusR + torusTube * Math.cos(v)) * Math.cos(u),
        y: (torusR + torusTube * Math.cos(v)) * Math.sin(u),
        z: torusTube * Math.sin(v),
      };

      particles.push({
        x: s1.x,
        y: s1.y,
        z: s1.z,
        tx: s1.x,
        ty: s1.y,
        tz: s1.z,
        s1,
        s2,
        s3,
        s4,
        s5,
        color: { r: 245, g: 158, b: 11 },
        size: 0.8 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.1 + Math.random() * 0.4,
      });
    }

    // Interactive mouse positioning
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX - width / 2) * 0.15;
      targetY = (e.clientY - height / 2) * 0.15;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    let time = 0;
    let rotationY = 0;
    let rotationX = 0;

    const fov = 350;

    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse camera lerp
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Base rotation speeds per state
      const state = activeStateRef.current;
      let targetColor = { r: 245, g: 158, b: 11 }; // Gold

      if (state === 'hero') {
        rotationY += 0.003;
        rotationX += 0.001;
        targetColor = { r: 245, g: 158, b: 11 }; // Gold/Amber
      } else if (state === 'features') {
        rotationY += 0.001;
        rotationX = Math.sin(time * 0.2) * 0.1;
        targetColor = { r: 6, g: 182, b: 212 }; // Cyan/Blue
      } else if (state === 'method') {
        rotationY += 0.006;
        rotationX += 0.002;
        targetColor = { r: 16, g: 185, b: 129 }; // Emerald Green
      } else if (state === 'testimonials') {
        rotationY += 0.0005;
        rotationX += 0.0002;
        targetColor = { r: 244, g: 63, b: 94 }; // Rose
      } else if (state === 'portals') {
        rotationY += 0.015; // Fast spin
        rotationX += 0.005;
        targetColor = { r: 139, g: 92, b: 246 }; // Purple
      }

      const projected: any[] = [];

      particles.forEach((p) => {
        // Find active state target position
        let dest = p.s1;
        if (state === 'features') dest = p.s2;
        else if (state === 'method') dest = p.s3;
        else if (state === 'testimonials') dest = p.s4;
        else if (state === 'portals') dest = p.s5;

        // Smoothly lerp towards target position
        p.tx += (dest.x - p.tx) * 0.06;
        p.ty += (dest.y - p.ty) * 0.06;
        p.tz += (dest.z - p.tz) * 0.06;

        // Apply idle secondary wave animations to coordinates based on state
        let animX = p.tx;
        let animY = p.ty;
        let animZ = p.tz;

        if (state === 'hero') {
          // Subtle breathing pulse
          const pulse = 1 + Math.sin(time * 2 + p.phase) * 0.05;
          animX *= pulse;
          animY *= pulse;
          animZ *= pulse;
        } else if (state === 'features') {
          // Flowing wave grid motion
          animY += Math.sin(time * 3 + p.tx * 0.02) * 12;
        } else if (state === 'method') {
          // Ring expansion/compression wave
          const ringPulse = 1 + Math.sin(time * 4 + p.phase) * 0.03;
          animX *= ringPulse;
          animY *= ringPulse;
          animZ *= ringPulse;
        } else if (state === 'testimonials') {
          // Drift downwards
          p.ty += p.speed * 0.3;
          if (p.ty > height / 2) p.ty = -height / 2;
        }

        // Apply 3D rotation matrix
        // Y-axis rotation
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        let x1 = animX * cosY - animZ * sinY;
        let z1 = animX * sinY + animZ * cosY;

        // X-axis rotation
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        let y2 = animY * cosX - z1 * sinX;
        let z2 = animY * sinX + z1 * cosX;

        // Apply mouse camera offsets for parallax
        const finalX = x1 - mouseX;
        const finalY = y2 - mouseY;
        const finalZ = z2;

        // Projection
        const scale = fov / (fov + finalZ);
        const screenX = width / 2 + finalX * scale;
        const screenY = height / 2 + finalY * scale;

        // Color interpolation
        p.color.r += (targetColor.r - p.color.r) * 0.05;
        p.color.g += (targetColor.g - p.color.g) * 0.05;
        p.color.b += (targetColor.b - p.color.b) * 0.05;

        projected.push({
          x: screenX,
          y: screenY,
          z: finalZ,
          scale,
          color: { ...p.color },
          size: p.size,
        });
      });

      // Sort by depth
      projected.sort((a, b) => b.z - a.z);

      // Render
      projected.forEach((p) => {
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) return;

        const size = Math.max(0.2, p.scale * p.size);
        const alpha = Math.max(0.15, Math.min(0.9, (p.z + 200) / 400));

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.round(p.color.r)}, ${Math.round(p.color.g)}, ${Math.round(p.color.b)}, ${alpha * 0.55})`;
        ctx.fill();

        // Subtle glow for front particles
        if (p.z < -40) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${Math.round(p.color.r)}, ${Math.round(p.color.g)}, ${Math.round(p.color.b)}, ${alpha * 0.1})`;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-50 pointer-events-none overflow-hidden bg-slate-950">
      <canvas ref={canvasRef} className="w-full h-full block opacity-75" />
      
      {/* Background ambient radial gradients to complement the canvas */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none mix-blend-color-dodge opacity-20 transition-all duration-1000"
        style={{
          background: activeState === 'hero' 
            ? 'radial-gradient(circle at 30% 30%, rgba(245, 158, 11, 0.15) 0%, transparent 60%)' 
            : activeState === 'features'
            ? 'radial-gradient(circle at 70% 40%, rgba(6, 182, 212, 0.15) 0%, transparent 60%)'
            : activeState === 'method'
            ? 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)'
            : activeState === 'testimonials'
            ? 'radial-gradient(circle at 20% 60%, rgba(244, 63, 94, 0.15) 0%, transparent 60%)'
            : 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.18) 0%, transparent 60%)'
        }}
      />
    </div>
  );
}

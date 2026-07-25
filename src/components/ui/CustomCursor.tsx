'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const position = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('[data-cursor]');
      if (el) {
        setIsHovering(true);
        setCursorText(el.getAttribute('data-cursor') || '');
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('[data-cursor]');
      if (el) {
        setIsHovering(false);
        setCursorText('');
      }
    };

    function animate() {
      position.current.x += (target.current.x - position.current.x) * 0.15;
      position.current.y += (target.current.y - position.current.y) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${position.current.x}px, ${position.current.y}px) translate(-50%, -50%)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  // Don't render on touch devices (SSR-safe)
  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[10000] hidden md:block"
      style={{ willChange: 'transform' }}
    >
      <div
        className="flex items-center justify-center rounded-full border transition-all duration-300 ease-out"
        style={{
          width: isHovering ? 64 : 12,
          height: isHovering ? 64 : 12,
          borderColor: 'rgba(201, 162, 75, 0.6)',
          backgroundColor: isHovering ? 'rgba(201, 162, 75, 0.08)' : 'transparent',
          mixBlendMode: 'difference',
        }}
      >
        {isHovering && cursorText && (
          <span className="text-[10px] font-medium tracking-wider uppercase" style={{ color: '#C9A24B' }}>
            {cursorText}
          </span>
        )}
      </div>
    </div>
  );
}

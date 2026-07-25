'use client';

import { useRef, ReactNode, MouseEvent } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  dataCursor?: string;
}

export default function MagneticButton({ children, className = '', onClick, href, dataCursor = 'View' }: MagneticButtonProps) {
  const btnRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) * 0.3;
    const dy = (e.clientY - centerY) * 0.3;
    const maxOffset = 8;
    const clampedX = Math.max(-maxOffset, Math.min(maxOffset, dx));
    const clampedY = Math.max(-maxOffset, Math.min(maxOffset, dy));
    btnRef.current.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
  };

  const handleMouseLeave = () => {
    if (!btnRef.current) return;
    btnRef.current.style.transform = 'translate(0px, 0px)';
    btnRef.current.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
    setTimeout(() => {
      if (btnRef.current) btnRef.current.style.transition = 'transform 0.15s ease-out';
    }, 400);
  };

  const Tag = href ? 'a' : 'div';

  return (
    <div
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.15s ease-out', display: 'inline-block' }}
      data-cursor={dataCursor}
    >
      {href ? (
        <a href={href} className={className} onClick={onClick}>
          {children}
        </a>
      ) : (
        <button className={className} onClick={onClick}>
          {children}
        </button>
      )}
    </div>
  );
}

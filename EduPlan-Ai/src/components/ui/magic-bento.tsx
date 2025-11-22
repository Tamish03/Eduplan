"use client";

import React, { useRef, useState, useEffect, ReactNode } from 'react';

interface MagicBentoProps {
  children?: ReactNode;
  className?: string;
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  glowColor?: string;
}

export const MagicBento = ({
  children,
  className = '',
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  spotlightRadius = 300,
  particleCount = 12,
  glowColor = '132, 0, 255',
}: MagicBentoProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });

      if (enableTilt && isHovered) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      }
    };

    if (isHovered) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered, enableTilt]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current && enableTilt) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!clickEffect || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };
    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1000);
  };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-xl transition-all duration-300 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.1s ease-out',
      }}
    >
      {/* Border Glow Effect */}
      {enableBorderGlow && isHovered && (
        <div
          className="absolute inset-0 rounded-xl opacity-75 pointer-events-none"
          style={{
            background: `radial-gradient(${spotlightRadius}px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(${glowColor}, 0.4), transparent 40%)`,
            zIndex: 1,
          }}
        />
      )}

      {/* Spotlight Effect */}
      {enableSpotlight && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(${spotlightRadius}px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.1), transparent 40%)`,
            zIndex: 2,
          }}
        />
      )}

      {/* Stars/Particles */}
      {enableStars && isHovered && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          {Array.from({ length: particleCount }).map((_, i) => {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 100;
            const x = mousePosition.x + Math.cos(angle) * distance;
            const y = mousePosition.y + Math.sin(angle) * distance;
            return (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  opacity: 0.6,
                  animation: `pulse 1s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Click Ripples */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            transform: 'translate(-50%, -50%)',
            animation: 'ripple 1s ease-out forwards',
            zIndex: 4,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      <style jsx>{`
        @keyframes ripple {
          to {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default MagicBento;

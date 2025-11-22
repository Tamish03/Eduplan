"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface MagicBentoProps {
  children?: React.ReactNode;
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
  className = "",
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  spotlightRadius = 300,
  particleCount = 12,
  glowColor = "132, 0, 255",
}: MagicBentoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number }>>([]);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 300,
    damping: 30,
  });

  useEffect(() => {
    if (enableStars) {
      const newStars = Array.from({ length: particleCount }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
      }));
      setStars(newStars);
    }
  }, [enableStars, particleCount]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    if (enableTilt) {
      mouseX.set(x);
      mouseY.set(y);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (enableTilt) {
      mouseX.set(0);
      mouseY.set(0);
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 ${className}`}
      style={{
        rotateX: enableTilt ? rotateX : 0,
        rotateY: enableTilt ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileTap={clickEffect ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Border Glow */}
      {enableBorderGlow && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(circle at ${mouseX.get() * 100 + 50}% ${mouseY.get() * 100 + 50}%, rgba(${glowColor}, 0.3), transparent 50%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Spotlight Effect */}
      {enableSpotlight && isHovered && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300"
          style={{
            background: `radial-gradient(${spotlightRadius}px circle at var(--mouse-x) var(--mouse-y), rgba(${glowColor}, 0.15), transparent 40%)`,
          }}
          animate={{ opacity: 1 }}
        />
      )}

      {/* Stars/Particles */}
      {enableStars && stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: isHovered ? [0.2, 1, 0.2] : 0.2,
            scale: isHovered ? [1, 1.5, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
    </motion.div>
  );
};

export default MagicBento;

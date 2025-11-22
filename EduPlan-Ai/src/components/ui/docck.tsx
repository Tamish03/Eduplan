"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";

interface DockItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

interface DockProps {
  items: DockItem[];
  panelHeight?: number;
  baseItemSize?: number;
  magnification?: number;
  className?: string;
}

const DockIcon = ({
  icon,
  label,
  onClick,
  mouseX,
  baseSize,
  magnification,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  mouseX: any;
  baseSize: number;
  magnification: number;
}) => {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [baseSize, magnification, baseSize]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.button
      ref={ref}
      style={{ width, height: width }}
      onClick={onClick}
      className="relative flex items-center justify-center rounded-full bg-gray-800/80 backdrop-blur-sm border border-white/10 hover:bg-gray-700/80 transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-white">{icon}</div>
      <motion.div
        className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap pointer-events-none"
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
      >
        {label}
      </motion.div>
    </motion.button>
  );
};

export const Dock = ({
  items,
  panelHeight = 68,
  baseItemSize = 50,
  magnification = 70,
  className = "",
}: DockProps) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 ${className}`}
    >
      <motion.div
        style={{ height: panelHeight }}
        className="flex items-center gap-3 px-4 rounded-2xl bg-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        {items.map((item, i) => (
          <DockIcon
            key={i}
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            mouseX={mouseX}
            baseSize={baseItemSize}
            magnification={magnification}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Dock;

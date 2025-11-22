"use client";

import React, { useState, useRef, ReactNode } from 'react';

interface DockItem {
  icon: ReactNode;
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

export const Dock = ({
  items,
  panelHeight = 68,
  baseItemSize = 50,
  magnification = 70,
  className = '',
}: DockProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  };

  const handleMouseLeave = () => {
    setMouseX(null);
    setHoveredIndex(null);
  };

  const getItemSize = (index: number) => {
    if (mouseX === null || !dockRef.current) return baseItemSize;

    const itemElements = dockRef.current.querySelectorAll('.dock-item');
    const item = itemElements[index] as HTMLElement;
    if (!item) return baseItemSize;

    const itemRect = item.getBoundingClientRect();
    const dockRect = dockRef.current.getBoundingClientRect();
    const itemCenter = itemRect.left - dockRect.left + itemRect.width / 2;
    const distance = Math.abs(mouseX - itemCenter);
    const maxDistance = 150;

    if (distance > maxDistance) return baseItemSize;

    const scale = 1 + (1 - distance / maxDistance) * (magnification / baseItemSize - 1);
    return baseItemSize * scale;
  };

  return (
    <div
      ref={dockRef}
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="flex items-end gap-2 px-3 py-2 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl"
        style={{ height: `${panelHeight}px` }}
      >
        {items.map((item, index) => {
          const size = getItemSize(index);
          return (
            <div
              key={index}
              className="dock-item relative flex flex-col items-center transition-all duration-200 ease-out"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <button
                onClick={item.onClick}
                className="flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-magenta-600 hover:from-cyan-400 hover:to-magenta-500 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                }}
              >
                {item.icon}
              </button>
              {hoveredIndex === index && (
                <div className="absolute -top-8 px-2 py-1 bg-black/80 text-white text-xs rounded-md whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dock;

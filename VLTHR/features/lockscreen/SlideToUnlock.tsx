'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface SlideToUnlockProps {
  onUnlock: () => void;
}

export function SlideToUnlock({ onUnlock }: SlideToUnlockProps) {
  const x = useMotionValue(0);
  const width = 280; // Slider width
  const handleWidth = 60;
  const maxDrag = width - handleWidth - 8; // 4px padding on each side

  const opacity = useTransform(x, [0, maxDrag * 0.5], [1, 0]);
  const handleBg = useTransform(x, [0, maxDrag], ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.3)"]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > maxDrag * 0.8) {
      onUnlock();
    } else {
      // Snap back
    }
  };

  return (
    <div className="relative w-[280px] h-[64px] glass-liquid rounded-full p-1 flex items-center overflow-hidden">
      {/* Animated Text */}
      <motion.div 
        style={{ opacity }}
        className="absolute inset-0 flex items-center justify-center pl-8 pointer-events-none"
      >
        <span className="text-white/40 text-sm font-semibold tracking-[0.2em] uppercase animate-pulse">
          Slide to Unlock
        </span>
      </motion.div>

      {/* Draggable Handle */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x, backgroundColor: handleBg }}
        className="w-[56px] h-[56px] waterglass-sphere rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10 shadow-xl"
      >
        <ChevronRight className="text-white w-6 h-6" />
      </motion.div>
    </div>
  );
}

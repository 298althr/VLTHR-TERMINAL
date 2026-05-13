'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Clock } from './Clock';
import { useAppStore } from '@/store/useAppStore';
import { useState, useEffect } from 'react';
import { PinPad } from './PinPad';
import { initAudio } from '@/lib/audio';

export function LockScreen() {
  const { isLocked, unlock } = useAppStore();
  const [showPinPad, setShowPinPad] = useState(false);
  
  const y = useMotionValue(0);
  const opacity = useTransform(y, [-200, 0], [0, 1]);
  const scale = useTransform(y, [-200, 0], [0.95, 1]);

  const handleDragEnd = (_: any, info: any) => {
    initAudio(); // Initialize on first major interaction
    if (info.offset.y < -100) {
      setShowPinPad(true);
    }
  };

  return (
    <div className="relative h-full w-full bg-lockscreen overflow-hidden">
      {/* Main Content (Clock & Swipe) */}
      <motion.div 
        style={{ y, opacity, scale }}
        drag="y"
        dragConstraints={{ top: -300, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className={`absolute inset-0 z-10 flex flex-col items-center justify-between py-20 transition-opacity duration-300 ${showPinPad ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <Clock />
        
        <div className="flex flex-col items-center gap-2">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-12 h-1.5 bg-white/40 rounded-full"
          />
          <span className="text-white/60 text-sm font-medium tracking-wide">
            Swipe up to unlock
          </span>
        </div>
      </motion.div>

      {/* Pin Pad Overlay */}
      {showPinPad && (
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-0 z-20 glass-thick flex flex-col items-center justify-center"
        >
          <PinPad onCancel={() => setShowPinPad(false)} />
        </motion.div>
      )}
    </div>
  );
}

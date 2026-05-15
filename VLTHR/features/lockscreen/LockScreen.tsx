'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from './Clock';
import { useAppStore } from '@/store/useAppStore';
import { useState } from 'react';
import { PinPad } from './PinPad';
import { SlideToUnlock } from './SlideToUnlock';
import { initAudio } from '@/lib/audio';

export function LockScreen() {
  const [showPinPad, setShowPinPad] = useState(false);
  const { requestCode, isVerifying } = useAppStore();

  const handleUnlockTrigger = () => {
    initAudio();
    setShowPinPad(true);
  };

  return (
    <div className="relative h-full w-full bg-lockscreen-ventura overflow-hidden flex flex-col items-center justify-between py-24">
      {/* Background Visual Layer */}
      <div className={`absolute inset-0 z-0 transition-all duration-700 ${showPinPad ? 'bg-black/60 backdrop-blur-3xl' : 'bg-black/20 backdrop-blur-[2px]'}`} />

      <AnimatePresence>
        {!showPinPad && (
          <motion.div 
            key="clock-section"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50, filter: "blur(20px)" }}
            className="relative z-10 flex flex-col items-center gap-6"
          >
            <motion.img 
              src="/logo.svg" 
              alt="VLTHR Logo" 
              className="w-16 h-16 drop-shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
            <Clock />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showPinPad && (
          <motion.div 
            key="pinpad"
            initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-20 w-full h-full flex items-center justify-center"
          >
            <PinPad onCancel={() => setShowPinPad(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Section - Slider or Nothing */}
      <div className="relative z-30 h-24 flex items-center justify-center">
        {!showPinPad && (
          <motion.div 
            key="slider"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          >
            <SlideToUnlock onUnlock={handleUnlockTrigger} />
          </motion.div>
        )}
      </div>

    </div>
  );
}

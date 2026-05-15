'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from './Clock';
import { useAppStore } from '@/store/useAppStore';
import { useState, useEffect } from 'react';
import { PinPad } from './PinPad';
import { SlideToUnlock } from './SlideToUnlock';
import { initAudio, playSound } from '@/lib/audio';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, Monitor, X } from 'lucide-react';

export function LockScreen() {
  const [showPinPad, setShowPinPad] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const { requestCode, isVerifying } = useAppStore();
  const { canInstall, isIOS, promptInstall } = usePWAInstall();

  // Show PWA install prompt after a brief delay when lockscreen loads
  useEffect(() => {
    if (canInstall) {
      const timer = setTimeout(() => setShowInstall(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [canInstall]);

  const handleUnlockTrigger = () => {
    initAudio();
    setShowPinPad(true);
  };

  const handleInstall = async () => {
    await promptInstall();
    setShowInstall(false);
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

      {/* === PWA INSTALL MODAL === */}
      {showInstall && (
        <motion.div
          className="fixed inset-0 z-[500] flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative flex flex-col items-center gap-6 p-8 rounded-[28px] max-w-sm w-full"
            style={{
              background: 'rgba(30, 30, 42, 0.95)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: 'inset 0 1px 1px 0 rgba(255,255,255,0.12), 0 24px 64px -12px rgba(0,0,0,0.8)',
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <button
              onClick={() => setShowInstall(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={16} className="text-white/50" />
            </button>

            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,113,227,0.15)' }}>
              <Monitor size={32} className="text-accent" />
            </div>

            <div className="text-center">
              <h3 className="text-white font-bold text-lg mb-2">Install VLTHR Terminal</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Add VLTHR to your home screen for a native app experience with offline access and instant launch.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <motion.button
                onClick={handleInstall}
                className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #0071e3 0%, #0058b3 100%)',
                  fontSize: 14,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download size={16} />
                Install Now
              </motion.button>

              <button
                onClick={() => setShowInstall(false)}
                className="w-full py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white/80 transition-colors"
              >
                Continue in Browser
              </button>
            </div>

            {isIOS && (
              <p className="text-white/40 text-[10px] text-center">
                Tap the share icon in Safari, then "Add to Home Screen"
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

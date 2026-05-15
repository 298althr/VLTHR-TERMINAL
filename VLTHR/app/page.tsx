'use client';

import { useAppStore } from '@/store/useAppStore';
import { AnimatePresence, motion } from 'framer-motion';
import { LockScreen } from '@/features/lockscreen/LockScreen';
import { LandingPage } from '@/features/landing/LandingPage';
import { Desktop } from '@/features/desktop/Desktop';
import { useEffect } from 'react';
import { playSound } from '@/lib/audio';
import { usePriceAlerts } from '@/lib/hooks/usePriceAlerts';
import { MuiGlassProvider } from '@/components/MuiGlassProvider';

export default function Home() {
  const isLocked = useAppStore((s) => s.isLocked);
  const isOnLanding = useAppStore((s) => s.isOnLanding);

  usePriceAlerts();

  useEffect(() => {
    useAppStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!isLocked) {
      playSound('unlock');
    }
  }, [isLocked]);

  return (
    <MuiGlassProvider>
      <main className="relative h-screen w-screen overflow-hidden bg-black font-sans antialiased">
        <AnimatePresence mode="wait">
          {isOnLanding ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-[300]"
            >
              <LandingPage />
            </motion.div>
          ) : isLocked ? (
            <motion.div
              key="lockscreen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 z-[200]"
            >
              <LockScreen />
            </motion.div>
          ) : (
            <motion.div
              key="desktop"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 z-0"
            >
              <Desktop />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </MuiGlassProvider>
  );
}

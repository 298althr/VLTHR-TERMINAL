'use client';

import { useAppStore } from '@/store/useAppStore';
import { AnimatePresence, motion } from 'framer-motion';
import { LockScreen } from '@/features/lockscreen/LockScreen';
import { Desktop } from '@/features/desktop/Desktop';
import { useEffect } from 'react';
import { playSound } from '@/lib/audio';
import { usePriceAlerts } from '@/lib/hooks/usePriceAlerts';
import { MuiGlassProvider } from '@/components/MuiGlassProvider';

export default function Home() {
  const isLocked = useAppStore((s) => s.isLocked);

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
          {isLocked ? (
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

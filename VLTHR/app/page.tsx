'use client';

import { useAppStore } from '@/store/useAppStore';
import { AnimatePresence, motion } from 'framer-motion';
import { LockScreen } from '@/features/lockscreen/LockScreen';
import { HomeScreen } from '@/features/home/HomeScreen';
import { Island } from '@/features/dynamic-island/Island';
import { NotificationStack } from '@/features/notifications/NotificationStack';
import { CryptoPage } from '@/features/apps/CryptoPage';
import { ForexPage } from '@/features/apps/ForexPage';
import { NewsPage } from '@/features/apps/NewsPage';
import { MacroPage } from '@/features/apps/MacroPage';
import { EquitiesPage } from '@/features/apps/EquitiesPage';
import { SignalsPage } from '@/features/apps/SignalsPage';
import { PortfolioPage } from '@/features/apps/PortfolioPage';
import { SettingsPage } from '@/features/apps/SettingsPage';
import { useEffect } from 'react';
import { playSound } from '@/lib/audio';

export default function Home() {
  const activeScreen = useAppStore((s) => s.activeScreen);
  const isLocked = useAppStore((s) => s.isLocked);
  const activeApp = useAppStore((s) => s.activeApp);
  const hasSentWelcome = useAppStore((s) => s.hasSentWelcome);
  const setSentWelcome = useAppStore((s) => s.setSentWelcome);
  const setIslandExpanded = useAppStore((s) => s.setIslandExpanded);

  useEffect(() => {
    if (!isLocked) {
      playSound('unlock');
      
      if (!hasSentWelcome) {
        // Dynamic Island Notification Flow
        const timer = setTimeout(() => {
          setIslandExpanded(true);
          setSentWelcome(true);
          
          // Auto-collapse after 5 seconds
          setTimeout(() => {
            setIslandExpanded(false);
          }, 5000);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isLocked, hasSentWelcome, setSentWelcome, setIslandExpanded]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Universal UI Elements */}
      {!isLocked && <Island />}

      <AnimatePresence mode="wait">
        {activeScreen === 'lockscreen' && (
          <motion.div
            key="lockscreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0"
          >
            <LockScreen />
          </motion.div>
        )}
        
        {(activeScreen === 'home' || activeScreen === 'app') && (
          <motion.div
            key="home-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0"
          >
            <HomeScreen />
            
            <AnimatePresence>
              {activeApp === 'crypto' && <CryptoPage />}
              {activeApp === 'forex' && <ForexPage />}
              {activeApp === 'news' && <NewsPage />}
              {activeApp === 'macro' && <MacroPage />}
              {activeApp === 'equities' && <EquitiesPage />}
              {activeApp === 'signals' && <SignalsPage />}
              {activeApp === 'portfolio' && <PortfolioPage />}
              {activeApp === 'settings' && <SettingsPage />}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Interaction layer to initialize audio on first touch */}
      <div 
        className="absolute inset-0 z-[999] pointer-events-none"
        onTouchStart={() => {
          // This will be used in Phase 2 for audio init
        }}
      />
    </main>
  );
}

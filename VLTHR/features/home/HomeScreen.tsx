'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { AppIcon } from './AppIcon';
import { 
  Zap,
  Globe,
  Newspaper,
  Landmark,
  LineChart,
  Settings,
  BarChart3,
  Wallet,
  TrendingUp,
  Lock,
  Search,
  Activity
} from 'lucide-react';

export function HomeScreen() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      setIsStandalone(isPWA);
    }
  }, []);

  const apps = [
    { id: 'crypto', name: 'Crypto', icon: <BarChart3 size={28} strokeWidth={1.5} /> },
    { id: 'forex', name: 'Forex', icon: <Globe size={28} strokeWidth={1.5} /> },
    { id: 'equities', name: 'Equities', icon: <LineChart size={28} strokeWidth={1.5} /> },
    { id: 'news', name: 'News', icon: <Newspaper size={28} strokeWidth={1.5} /> },
    { id: 'macro', name: 'Macro', icon: <Landmark size={28} strokeWidth={1.5} /> },
    { id: 'signals', name: 'Signals', icon: <Zap size={28} strokeWidth={1.5} /> },
    { id: 'portfolio', name: 'Portfolio', icon: <Wallet size={28} strokeWidth={1.5} /> },
    { id: 'settings', name: 'Settings', icon: <Settings size={28} strokeWidth={1.5} /> },
  ] as const;

  return (
    <div className="relative h-full w-full flex flex-col items-center pt-32 px-6 bg-homescreen-wallpaper overflow-y-auto no-scrollbar pb-32">
      {/* 70% Clarity Glass Overlay */}
      <div className="absolute inset-0 glass-homescreen z-0" />
      
      {/* Metrics Card */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full glass-liquid p-5 rounded-[28px] mb-8 flex flex-col gap-4"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-accent-green" />
            <span className="text-white font-bold text-xs">Portfolio</span>
          </div>
          <span className="text-accent-green font-mono text-xs">+$12,402.80</span>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Health</span>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[85%] bg-accent rounded-full" />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Neural</span>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[92%] bg-accent-green rounded-full" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* App Grid */}
      <div className="relative z-10 grid grid-cols-4 gap-y-10 gap-x-4 w-full">
        {apps.map((app) => (
          <AppIcon 
            key={app.id} 
            name={app.name} 
            icon={app.icon} 
            onClick={() => useAppStore.getState().openApp(app.id)} 
          />
        ))}
      </div>

      {/* Install Prompt - Only shown in browser */}
      {!isStandalone && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mt-12 glass-liquid w-full p-5 rounded-[28px] flex flex-col items-center gap-3 border border-white/20 shadow-elevated"
        >
          <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
            <Activity size={24} />
          </div>
          <div className="text-center">
            <h3 className="text-white font-bold text-sm">Install ALTHR Terminal</h3>
            <p className="text-white/60 text-[10px] mt-1 leading-tight px-4">
              Tap <strong>Share</strong> then <strong>'Add to Home Screen'</strong> for the full immersive experience.
            </p>
          </div>
        </motion.div>
      )}

      {/* Dock */}
      <div className="fixed bottom-10 left-6 right-6 z-20">
        <div className="glass-liquid h-[90px] w-full rounded-[38px] flex items-center justify-around px-4">
           <AppIcon name="" icon={<Newspaper size={30} strokeWidth={1.5} />} onClick={() => useAppStore.getState().openApp('news')} />
           <AppIcon name="" icon={<LineChart size={30} strokeWidth={1.5} />} onClick={() => useAppStore.getState().openApp('equities')} />
           <AppIcon name="" icon={<BarChart3 size={30} strokeWidth={1.5} />} onClick={() => useAppStore.getState().openApp('crypto')} />
           <AppIcon name="" icon={<Lock size={30} strokeWidth={1.5} />} onClick={() => useAppStore.getState().lock()} />
        </div>
      </div>
    </div>
  );
}

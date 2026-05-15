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
  Activity,
  Calendar,
  Layers,
  Star,
  Filter,
  ShieldCheck,
  MessageSquare,
  FileText
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
    { id: 'crypto', name: 'Crypto', icon: '/icons/crypto.png' },
    { id: 'forex', name: 'Forex', icon: '/icons/forex.png' },
    { id: 'equities', name: 'Equities', icon: '/icons/equities.png' },
    { id: 'news', name: 'News', icon: '/icons/news.png' },
    { id: 'macro', name: 'Macro', icon: '/icons/macro.png' },
    { id: 'calendar', name: 'Calendar', icon: '/icons/calendar.png' },
    { id: 'options', name: 'Options', icon: '/icons/options.png' },
    { id: 'watchlist', name: 'Watchlist', icon: '/icons/watchlist.png' },
    { id: 'screener', name: 'Screener', icon: '/icons/screener.png' },
    { id: 'risklab', name: 'Risk Lab', icon: '/icons/risklab.png' },
    { id: 'signals', name: 'Signals', icon: '/icons/signals.png' },
    { id: 'portfolio', name: 'Portfolio', icon: '/icons/portfolio.png' },
    { id: 'concierge', name: 'Concierge', icon: '/icons/concierge.png' },
    { id: 'reports', name: 'Reports', icon: '/icons/reports.png' },
    { id: 'settings', name: 'Settings', icon: '/icons/settings.png' },
  ] as const;

  console.log('[HomeScreen] Apps count:', apps.length, 'Apps:', apps.map(a => a.id));

  return (
    <div className="relative h-full w-full flex flex-col items-center pt-24 px-6 bg-homescreen-wallpaper overflow-y-auto no-scrollbar pb-32">
      {/* 70% Clarity Glass Overlay */}
      <div className="absolute inset-0 glass-homescreen z-0" />
      
      {/* Top Branding */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center gap-2 mb-10"
      >
        <img src="/logo.svg" alt="VLTHR" className="w-12 h-12 drop-shadow-xl" />
        <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.6em] ml-2">
          VLTHR TERMINAL
        </span>
      </motion.div>

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
      <div className="relative z-10 flex flex-col gap-4 w-full">
        <div className="flex justify-between items-center px-2">
          <span className="text-white/30 text-[9px] uppercase tracking-widest font-bold">Applications</span>
          <span className="text-accent text-[10px] font-mono">{apps.length} apps</span>
        </div>
        <div className="grid grid-cols-4 gap-y-8 gap-x-4 w-full">
          {apps.map((app) => (
            <AppIcon 
              key={app.id} 
              name={app.name} 
              icon={app.icon} 
              onClick={() => useAppStore.getState().openApp(app.id)} 
            />
          ))}
        </div>
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
            <h3 className="text-white font-bold text-sm">Install VLTHR Terminal</h3>
            <p className="text-white/60 text-[10px] mt-1 leading-tight px-4">
              Tap <strong>Share</strong> then <strong>'Add to Home Screen'</strong> for the full immersive experience.
            </p>
          </div>
        </motion.div>
      )}

      {/* Dock */}
      <div className="fixed bottom-10 left-6 right-6 z-20">
        <div className="glass-liquid h-[90px] w-full rounded-[38px] flex items-center justify-around px-4">
           <AppIcon name="" icon="/icons/news.png" onClick={() => useAppStore.getState().openApp('news')} />
           <AppIcon name="" icon="/icons/equities.png" onClick={() => useAppStore.getState().openApp('equities')} />
           <AppIcon name="" icon="/icons/crypto.png" onClick={() => useAppStore.getState().openApp('crypto')} />
           <AppIcon name="" icon="/icons/lock.png" onClick={() => useAppStore.getState().lock()} />
        </div>
      </div>
    </div>
  );
}

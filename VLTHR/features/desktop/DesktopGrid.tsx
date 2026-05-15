'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { 
  BarChart3, Globe, LineChart, Newspaper, 
  Landmark, Zap, Wallet, Settings,
  Calendar, Layers, Star, Filter,
  ShieldCheck, MessageSquare, FileText
} from 'lucide-react';
import { playSound } from '@/lib/audio';

const DESKTOP_APPS = [
  { id: 'crypto',    title: 'Crypto Markets',   icon: '/icons/crypto.png' },
  { id: 'forex',     title: 'Forex Board',       icon: '/icons/forex.png' },
  { id: 'equities',  title: 'Equities Panel',    icon: '/icons/equities.png' },
  { id: 'news',      title: 'News Feed',         icon: '/icons/news.png' },
  { id: 'macro',     title: 'Macro Dashboard',   icon: '/icons/macro.png' },
  { id: 'calendar',  title: 'Calendar',          icon: '/icons/calendar.png' },
  { id: 'options',   title: 'Options Desk',      icon: '/icons/options.png' },
  { id: 'watchlist', title: 'Watchlist',         icon: '/icons/watchlist.png' },
  { id: 'screener',  title: 'Screener',          icon: '/icons/screener.png' },
  { id: 'risklab',   title: 'Risk Lab',          icon: '/icons/risklab.png' },
  { id: 'signals',   title: 'Signal Engine',     icon: '/icons/signals.png' },
  { id: 'portfolio', title: 'Portfolio',         icon: '/icons/portfolio.png' },
  { id: 'concierge', title: 'Concierge',         icon: '/icons/concierge.png' },
  { id: 'reports',   title: 'Reports',           icon: '/icons/reports.png' },
  { id: 'settings',  title: 'Settings',          icon: '/icons/settings.png' },
];

export function DesktopGrid() {
  const openWindow = useAppStore((s) => s.openWindow);

  const handleDoubleClick = (id: any, title: string) => {
    playSound('tap');
    openWindow(id, title);
  };

  return (
    <div className="absolute inset-0 p-10 pt-20 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] grid-rows-[repeat(auto-fill,minmax(100px,1fr))] gap-6 pointer-events-none">
      {DESKTOP_APPS.map((app) => (
        <motion.div
          key={app.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onDoubleClick={() => handleDoubleClick(app.id, app.title)}
          className="flex flex-col items-center gap-2 cursor-default pointer-events-auto group w-[100px]"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <img src={app.icon} alt={app.title} className="w-full h-full object-contain drop-shadow-xl" />
          </div>
          <span className="text-white text-[11px] font-medium text-shadow-sm text-center px-1 py-0.5 rounded group-hover:bg-blue-600/50 transition-colors select-none">
            {app.title}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

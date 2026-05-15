import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { 
  BarChart3, Globe, LineChart, Newspaper, 
  Landmark, Zap, Wallet, Settings,
  Calendar, Layers, Star, Filter,
  ShieldCheck, MessageSquare, FileText, Search
} from 'lucide-react';
import { playSound } from '@/lib/audio';
import { useState } from 'react';

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

export function Launchpad() {
  const { isLaunchpadOpen, setLaunchpadOpen, openWindow } = useAppStore();
  const [search, setSearch] = useState('');

  const handleAppClick = (id: any, title: string) => {
    playSound('tap');
    openWindow(id, title);
    setLaunchpadOpen(false);
  };

  const filteredApps = DESKTOP_APPS.filter(app => 
    app.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isLaunchpadOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-[250] flex flex-col items-center pt-24 px-20"
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          }}
          onClick={() => setLaunchpadOpen(false)}
        >
          {/* Search Bar */}
          <div 
            className="w-full max-w-md mb-16 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              autoFocus
              type="text"
              placeholder="Search Apps"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all text-sm"
            />
          </div>

          {/* Apps Grid */}
          <div 
            className="w-full max-w-6xl grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-12 gap-x-8"
            onClick={(e) => e.stopPropagation()}
          >
            {filteredApps.map((app) => (
              <motion.div
                key={app.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAppClick(app.id, app.title)}
                className="flex flex-col items-center gap-3 cursor-pointer group"
              >
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all group-active:scale-95">
                  <img src={app.icon} alt={app.title} className="w-full h-full object-contain drop-shadow-2xl" />
                </div>
                <span className="text-white text-[13px] font-medium text-center drop-shadow-md">
                  {app.title}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

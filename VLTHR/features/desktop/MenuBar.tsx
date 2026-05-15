'use client';

import { useState, useEffect } from 'react';
import {
  SlidersHorizontal, BarChart3, Eye, FileText, Activity,
  Bitcoin, DollarSign, TrendingUp, Globe, Layers,
  Zap, Search, CalendarDays, Bot, Settings2,
  Newspaper, ShieldCheck, Info, ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import Image from 'next/image';
import { ControlCentre } from './ControlCentre';

type AppId =
  | 'crypto' | 'forex' | 'equities' | 'news' | 'macro'
  | 'signals' | 'portfolio' | 'settings' | 'calendar' | 'options'
  | 'watchlist' | 'screener' | 'risklab' | 'concierge' | 'reports';

interface MenuItem {
  label: string;
  appId: AppId;
  icon: React.ElementType;
  description?: string;
}

type MenuSection = MenuItem | null;

const NAV_MENUS: Record<string, MenuSection[]> = {
  View: [
    { label: 'Portfolio', appId: 'portfolio', icon: BarChart3, description: 'Positions & P&L' },
    { label: 'Watchlist', appId: 'watchlist', icon: Eye, description: 'Tracked assets' },
    { label: 'Reports', appId: 'reports', icon: FileText, description: 'Research & outlooks' },
    null,
    { label: 'Risk Lab', appId: 'risklab', icon: Activity, description: 'Risk analytics' },
  ],
  Markets: [
    { label: 'Crypto', appId: 'crypto', icon: Bitcoin, description: 'Digital assets' },
    { label: 'Forex', appId: 'forex', icon: DollarSign, description: 'FX rates & pairs' },
    { label: 'Equities', appId: 'equities', icon: TrendingUp, description: 'Stocks & ETFs' },
    null,
    { label: 'Macro', appId: 'macro', icon: Globe, description: 'Global indicators' },
    { label: 'Options Desk', appId: 'options', icon: Layers, description: 'Derivatives' },
  ],
  Tools: [
    { label: 'Signals', appId: 'signals', icon: Zap, description: 'Trade alerts' },
    { label: 'Screener', appId: 'screener', icon: Search, description: 'Multi-factor scan' },
    { label: 'Economic Calendar', appId: 'calendar', icon: CalendarDays, description: 'Events & releases' },
    null,
    { label: 'Concierge AI', appId: 'concierge', icon: Bot, description: 'AI research assistant' },
    { label: 'Settings', appId: 'settings', icon: Settings2, description: 'System preferences' },
  ],
  Help: [
    { label: 'News Feed', appId: 'news', icon: Newspaper, description: 'Latest headlines' },
    { label: 'System Status', appId: 'settings', icon: ShieldCheck, description: 'Services & quota' },
    null,
    { label: 'About VLTHR', appId: 'settings', icon: Info, description: 'Version & info' },
  ],
};

const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -6, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.14, ease: [0, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.1 } },
};

export function MenuBar() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const { isControlCentreOpen, setControlCentreOpen, openWindow } = useAppStore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (label: string) => {
    setActiveMenu((prev) => (prev === label ? null : label));
    if (isControlCentreOpen) setControlCentreOpen(false);
  };

  const handleMenuItemClick = (item: MenuItem) => {
    openWindow(item.appId, item.label);
    setActiveMenu(null);
  };

  return (
    <>
      {/* Backdrop to close menus */}
      {activeMenu && (
        <div className="fixed inset-0 z-[99]" onClick={() => setActiveMenu(null)} />
      )}

      <div
        className="fixed top-0 left-0 right-0 h-7 z-[300] macos-menubar flex items-center px-3 select-none"
        style={{ overflow: 'visible' }}
      >
        {/* Left: Oversized logo */}
        <div className="relative flex items-center gap-2.5 shrink-0">
          <div className="relative w-8 h-7 flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="VLTHR"
              width={34}
              height={34}
              className="absolute top-1/2 -translate-y-1/2 opacity-95"
              style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.25))' }}
            />
          </div>
          <span className="text-white/85 text-[10px] font-black tracking-[0.35em] uppercase leading-none">
            VLTHR
          </span>
        </div>

        {/* Nav dropdowns — left-aligned after logo */}
        <div className="flex items-center gap-0.5 text-[11px] font-medium ml-3">
          {Object.keys(NAV_MENUS).map((label) => (
            <div key={label} className="relative">
              <button
                onClick={() => handleNavClick(label)}
                className={`flex items-center gap-0.5 px-2.5 py-0.5 rounded-md transition-colors duration-150 ${
                  activeMenu === label
                    ? 'bg-white/15 text-white'
                    : 'text-white/55 hover:text-white/90 hover:bg-white/10'
                }`}
              >
                {label}
                <ChevronDown
                  size={9}
                  className={`transition-transform duration-150 opacity-50 ${activeMenu === label ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {activeMenu === label && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute top-full mt-1 left-0 w-52 rounded-xl py-1.5 z-[101]"
                    style={{
                      background: 'rgba(10, 10, 20, 0.88)',
                      backdropFilter: 'blur(60px) saturate(200%)',
                      WebkitBackdropFilter: 'blur(60px) saturate(200%)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
                    }}
                  >
                    {NAV_MENUS[label].map((item, i) =>
                      item === null ? (
                        <div key={`div-${i}`} className="my-1.5 mx-3 h-px bg-white/8" />
                      ) : (
                        <button
                          key={item.appId + item.label}
                          onClick={() => handleMenuItemClick(item)}
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-white/10 transition-colors duration-100 group text-left"
                        >
                          <div className="w-6 h-6 rounded-md bg-white/8 flex items-center justify-center shrink-0 group-hover:bg-white/15 transition-colors">
                            <item.icon size={12} className="text-white/60 group-hover:text-white/90" />
                          </div>
                          <div>
                            <div className="text-white/85 text-[11px] font-semibold leading-tight group-hover:text-white">
                              {item.label}
                            </div>
                            {item.description && (
                              <div className="text-white/30 text-[9px] leading-tight mt-0.5 group-hover:text-white/50">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Right: Date · Time · Control Centre */}
        <div className="flex items-center gap-2 ml-auto shrink-0 text-[11px]">
          <span className="text-white/35 font-medium hidden md:block" suppressHydrationWarning>{date}</span>
          <div className="w-px h-3 bg-white/15" />
          <button
            onClick={() => { setControlCentreOpen(!isControlCentreOpen); setActiveMenu(null); }}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-all font-semibold ${
              isControlCentreOpen ? 'bg-white/15 text-white' : 'text-white/75 hover:text-white hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal size={11} />
            <span suppressHydrationWarning>{time}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isControlCentreOpen && (
          <ControlCentre onClose={() => setControlCentreOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

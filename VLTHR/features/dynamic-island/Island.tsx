'use client';

import { useAppStore } from '@/store/useAppStore';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { Newspaper, Zap, ShieldCheck, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const ICON_MAP: Record<string, string> = {
  news: '/icons/news.png',
  signals: '/icons/signals.png',
  risklab: '/icons/risklab.png',
  bell: '/icons/lock.png'
};

export function Island() {
  const { notifications, islandExpanded, setIslandExpanded, openWindow } = useAppStore();
  const controls = useAnimation();
  
  const [activeTab, setActiveTab] = useState<string>('news');
  const [notifIndex, setNotifIndex] = useState(0);

  // Group notifications by appId
  const grouped = useMemo(() => {
    const map: Record<string, typeof notifications> = {};
    notifications.forEach(n => {
      if (!map[n.appId]) map[n.appId] = [];
      map[n.appId].push(n);
    });
    return map;
  }, [notifications]);

  const tabs = Object.keys(grouped);
  const currentNotifs = grouped[activeTab] || [];
  const currentNotif = currentNotifs[notifIndex];

  // Reset index when tab changes
  useEffect(() => {
    setNotifIndex(0);
  }, [activeTab]);

  useEffect(() => {
    if (notifications.length > 0) {
      controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.3 }
      });
    }
  }, [notifications.length, controls]);

  const islandVariants = {
    small: {
      width: 140,
      height: 36,
      borderRadius: 999,
      transition: { type: "spring", stiffness: 400, damping: 30 }
    },
    large: {
      width: 400,
      height: 260,
      borderRadius: 32,
      transition: { type: "spring", stiffness: 400, damping: 30 }
    }
  } as const;

  const handleNotifClick = (n: typeof notifications[0]) => {
    openWindow(n.appId as any, n.appId.charAt(0).toUpperCase() + n.appId.slice(1));
    setIslandExpanded(false);
  };

  const nextNotif = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifIndex((prev) => (prev + 1) % currentNotifs.length);
  };

  const prevNotif = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifIndex((prev) => (prev - 1 + currentNotifs.length) % currentNotifs.length);
  };

  return (
    <>
      {/* Click-to-Dismiss Overlay for expanded Island */}
      {islandExpanded && (
        <div 
          className="fixed inset-0 z-[45] bg-transparent"
          onClick={() => setIslandExpanded(false)}
        />
      )}

      <motion.div 
        animate={controls}
        className="fixed top-10 left-0 right-0 z-[200] flex justify-center pointer-events-none"
      >
      <motion.div
        layout
        initial="small"
        animate={islandExpanded ? "large" : "small"}
        variants={islandVariants}
        onClick={() => setIslandExpanded(!islandExpanded)}
        className="relative shadow-2xl overflow-hidden pointer-events-auto cursor-pointer"
      >
        {/* Liquid Glass Background Image - Looping Abstract */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1.2, 1.4, 1.2],
            }}
            transition={{
              rotate: { duration: 40, repeat: Infinity, ease: "linear" },
              scale: { duration: 20, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute inset-[-50%]"
          >
            <Image 
              src="https://images.unsplash.com/photo-1518715058720-e56f02e77fe5?w=600&auto=format&fit=crop&q=50" 
              alt="background" 
              fill 
              className="object-cover opacity-60 brightness-50 contrast-125"
            />
          </motion.div>
          <div className="absolute inset-0 backdrop-blur-3xl bg-black/40" />
        </div>

        <div className="relative z-10 h-full w-full flex flex-col">
          <AnimatePresence mode="wait">
          {!islandExpanded ? (
            <motion.div 
              key="small-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between h-full w-full px-4"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border border-black/20">
                    <span className="text-[10px] text-white font-bold">{notifications.length}</span>
                  </div>
                </div>
                <span className="text-white text-[11px] font-bold tracking-tight">
                  {notifications.filter(n => n.appId === 'news').length} News Alerts
                </span>
              </div>
              <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
            </motion.div>
          ) : (
            <motion.div 
              key="large-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col h-full w-full"
            >
              {/* Tab Bar */}
              <div className="flex items-center gap-1 p-3 border-b border-white/5 bg-white/5">
                {tabs.map(tab => {
                  const iconPath = ICON_MAP[tab] || ICON_MAP.bell;
                  return (
                    <button
                      key={tab}
                      onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                        activeTab === tab ? 'bg-accent text-black font-bold' : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      <img src={iconPath} alt={tab} className="w-3 h-3 object-contain" />
                      <span className="text-[10px] uppercase tracking-wider">{tab}</span>
                      <span className="text-[9px] opacity-60">({grouped[tab].length})</span>
                    </button>
                  );
                })}
              </div>

              {/* Notification Content */}
              <div className="flex-1 relative overflow-hidden group flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {currentNotif && (
                    <motion.div
                      key={currentNotif.id}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => handleNotifClick(currentNotif)}
                    >
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-accent shadow-2xl overflow-hidden p-2">
                        {(() => {
                          const iconPath = ICON_MAP[currentNotif.appId] || ICON_MAP.bell;
                          return <img src={iconPath} alt={currentNotif.appId} className="w-full h-full object-contain" />;
                        })()}
                      </div>
                      <h3 className="text-white font-extrabold text-lg tracking-tight mb-1">{currentNotif.title}</h3>
                      <p className="text-white/80 text-[13px] leading-relaxed line-clamp-2 px-6 font-medium italic">
                        "{currentNotif.message}"
                      </p>
                      <span className="text-white/40 text-[10px] mt-4 font-mono font-bold tracking-widest">
                        {new Date(currentNotif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Arrows */}
                {currentNotifs.length > 1 && (
                  <>
                    <button 
                      onClick={prevNotif}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 text-white hover:text-accent hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all z-20"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={nextNotif}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 text-white hover:text-accent hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all z-20"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Footer Hint */}
              <div className="p-3 bg-white/10 flex justify-center border-t border-white/5">
                <span className="text-[10px] text-white font-black uppercase tracking-[0.3em] drop-shadow-md">
                  Select to Open Module
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </motion.div>
      </motion.div>
    </>
  );
}

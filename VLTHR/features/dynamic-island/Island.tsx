'use client';

import { useAppStore } from '@/store/useAppStore';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { Shield } from 'lucide-react';

export function Island() {
  const { islandMessage, notifications, islandExpanded, setIslandExpanded } = useAppStore();
  const controls = useAnimation();

  useEffect(() => {
    if (notifications.length > 0) {
      controls.start({
        scale: [1, 1.1, 1],
        x: [0, -5, 5, -5, 5, 0],
        transition: { duration: 0.5, ease: "easeInOut" }
      });
    }
  }, [notifications.length, controls]);

  const islandVariants = {
    small: {
      width: 120,
      height: 32,
      borderRadius: 999,
      transition: { type: "spring", stiffness: 400, damping: 30 }
    },
    large: {
      width: 350,
      height: 180,
      borderRadius: 36,
      transition: { type: "spring", stiffness: 400, damping: 30 }
    }
  } as const;

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
        className="fixed top-10 left-0 right-0 z-50 flex justify-center pointer-events-none"
      >
      <motion.div
        layout
        initial="small"
        animate={islandExpanded ? "large" : "small"}
        variants={islandVariants}
        onClick={() => setIslandExpanded(!islandExpanded)}
        className="relative bg-island-wallpaper border border-white/10 shadow-elevated overflow-hidden pointer-events-auto cursor-pointer"
      >
        {/* 50% Tinted Glass Overlay */}
        <div className="absolute inset-0 glass-island z-0" />

        <div className="relative z-10 h-full w-full">
          <AnimatePresence mode="wait">
          {!islandExpanded ? (
            <motion.div 
              key="small-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full w-full px-4 gap-2"
            >
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              <span className="text-white text-[11px] font-bold tracking-tight whitespace-nowrap">
                {islandMessage}
              </span>
            </motion.div>
          ) : (
            <motion.div 
              key="large-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center h-full w-full py-4 px-6 gap-3"
            >
              <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                <Shield size={28} />
              </div>
              <div className="text-center">
                <h3 className="text-white font-bold text-sm">System Active</h3>
                <p className="text-white/60 text-[10px] mt-1 leading-relaxed">
                  Welcome to Ortho'M8 OS. Your digital vault is secure and identity sharding is active.
                </p>
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

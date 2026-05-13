'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { playSound } from '@/lib/audio';

interface AppShellProps {
  title: string;
  children: React.ReactNode;
}

export function AppShell({ title, children }: AppShellProps) {
  const { closeApp } = useAppStore();

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute inset-0 z-40 bg-apps-wallpaper flex flex-col overflow-hidden"
    >
      {/* 75% Clarity Glass Overlay */}
      <div className="absolute inset-0 glass-apps z-0" />

      {/* Header - iOS 26 Floating Pod */}
      <div className="relative z-10 mx-6 mt-20">
        <div className="glass-liquid h-16 rounded-[28px] flex items-center justify-between px-6">
          <button 
            onClick={() => { playSound('tap'); closeApp(); }}
            className="text-accent font-medium flex items-center gap-1"
          >
            <span className="text-2xl">‹</span> Back
          </button>
          <h1 className="text-white font-semibold text-sm">{title}</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-24 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
        {children}
      </div>
    </motion.div>
  );
}

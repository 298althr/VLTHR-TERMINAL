'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { playSound } from '@/lib/audio';
import { Terminal, Search, X } from 'lucide-react';

interface AppShellProps {
  title: string;
  children: React.ReactNode;
}

export function AppShell({ title, children }: AppShellProps) {
  const { closeApp, setApp } = useAppStore();
  const [command, setCommand] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = command.toUpperCase().trim();
    
    // Simple Command Logic
    if (cmd === 'CRYPTO') setApp('CRYPTO');
    else if (cmd === 'FOREX') setApp('FOREX');
    else if (cmd === 'NEWS') setApp('NEWS');
    else if (cmd === 'MACRO') setApp('MACRO');
    else if (cmd === 'PORTFOLIO') setApp('PORTFOLIO');
    else if (cmd.startsWith('GET ')) {
      // Future: Navigate to specific equity detail
    }
    
    setCommand('');
    setShowTerminal(false);
    playSound('tap');
  };

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
      <div className="relative z-10 mx-6 mt-16 flex flex-col gap-3">
        <div className="glass-liquid h-14 rounded-[28px] flex items-center justify-between px-6">
          <button 
            onClick={() => { playSound('tap'); closeApp(); }}
            className="text-accent font-medium flex items-center gap-1"
          >
            <span className="text-2xl">‹</span>
          </button>
          <h1 className="text-white font-semibold text-xs tracking-widest uppercase opacity-60">{title}</h1>
          <button 
            onClick={() => { playSound('tap'); setShowTerminal(!showTerminal); }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showTerminal ? 'bg-accent text-white' : 'text-accent'}`}
          >
            <Terminal size={18} />
          </button>
        </div>

        {/* Command Input Bar */}
        <AnimatePresence>
          {showTerminal && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCommand}
              className="overflow-hidden"
            >
              <div className="glass-thick h-12 rounded-2xl flex items-center px-4 gap-3 border border-accent/30 shadow-lg shadow-accent/10">
                <Search size={16} className="text-accent" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Enter Command (e.g. CRYPTO, FOREX, GET TSLA)..."
                  className="bg-transparent border-none outline-none text-white text-xs w-full font-mono placeholder:text-white/20 uppercase"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                />
                {command && (
                  <button type="button" onClick={() => setCommand('')}>
                    <X size={14} className="text-white/40" />
                  </button>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-24 touch-pan-y relative z-10" style={{ WebkitOverflowScrolling: 'touch' }}>
        {children}
      </div>
    </motion.div>
  );
}

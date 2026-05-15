'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import {
  BarChart3, Globe, LineChart, Newspaper,
  Landmark, Zap, Wallet, Settings,
  Minimize2, Maximize2, Lock, X,
  Layout, ChevronRight,
} from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';

const APPS = [
  { id: 'crypto',    title: 'Crypto Markets',   icon: BarChart3 },
  { id: 'forex',     title: 'Forex Board',       icon: Globe },
  { id: 'equities',  title: 'Equities Panel',    icon: LineChart },
  { id: 'news',      title: 'News Feed',         icon: Newspaper },
  { id: 'macro',     title: 'Macro Dashboard',   icon: Landmark },
  { id: 'signals',   title: 'Signal Engine',     icon: Zap },
  { id: 'portfolio', title: 'Portfolio',         icon: Wallet },
  { id: 'settings',  title: 'Settings',          icon: Settings },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const {
    openWindow, closeWindow, minimizeWindow, focusWindow,
    openWindows, lock,
  } = useAppStore();

  // Open palette
  useHotkeys('ctrl+k, meta+k', (e: KeyboardEvent) => {
    e.preventDefault();
    setOpen((o) => !o);
  }, { enableOnFormTags: true });

  // Close on Escape
  useHotkeys('escape', () => setOpen(false), { enableOnFormTags: true });

  // Ctrl+L → lock
  useHotkeys('ctrl+l', (e: KeyboardEvent) => { e.preventDefault(); lock(); });

  // Ctrl+W → close focused window
  useHotkeys('ctrl+w', (e: KeyboardEvent) => {
    e.preventDefault();
    const sorted = [...openWindows].sort((a, b) => b.zIndex - a.zIndex);
    if (sorted[0]) closeWindow(sorted[0].id);
  });

  // Ctrl+M → minimize focused window
  useHotkeys('ctrl+m', (e: KeyboardEvent) => {
    e.preventDefault();
    const sorted = [...openWindows].sort((a, b) => b.zIndex - a.zIndex);
    if (sorted[0]) minimizeWindow(sorted[0].id);
  });

  // Ctrl+1..8 → open dock apps (explicit to satisfy React rules of hooks)
  useHotkeys('ctrl+1', (e: KeyboardEvent) => { e.preventDefault(); openWindow('crypto', 'Crypto Markets'); });
  useHotkeys('ctrl+2', (e: KeyboardEvent) => { e.preventDefault(); openWindow('forex', 'Forex Board'); });
  useHotkeys('ctrl+3', (e: KeyboardEvent) => { e.preventDefault(); openWindow('equities', 'Equities Panel'); });
  useHotkeys('ctrl+4', (e: KeyboardEvent) => { e.preventDefault(); openWindow('news', 'News Feed'); });
  useHotkeys('ctrl+5', (e: KeyboardEvent) => { e.preventDefault(); openWindow('macro', 'Macro Dashboard'); });
  useHotkeys('ctrl+6', (e: KeyboardEvent) => { e.preventDefault(); openWindow('signals', 'Signal Engine'); });
  useHotkeys('ctrl+7', (e: KeyboardEvent) => { e.preventDefault(); openWindow('portfolio', 'Portfolio'); });
  useHotkeys('ctrl+8', (e: KeyboardEvent) => { e.preventDefault(); openWindow('settings', 'Settings'); });

  // Alt+Tab → cycle windows
  useHotkeys('alt+tab', (e: KeyboardEvent) => {
    e.preventDefault();
    if (openWindows.length < 2) return;
    const sorted = [...openWindows].sort((a, b) => b.zIndex - a.zIndex);
    const next = sorted[1];
    if (next) focusWindow(next.id);
  });

  const runCommand = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            key="palette"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[501] w-[580px] max-w-[90vw] macos-window overflow-hidden"
          >
            <Command className="flex flex-col" label="Command Palette">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                <ChevronRight size={14} className="text-white/30 shrink-0" />
                <Command.Input
                  autoFocus
                  placeholder="Type a command or search apps..."
                  className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-white/30"
                />
                <kbd className="text-[10px] text-white/20 border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
              </div>

              <Command.List className="overflow-y-auto max-h-[400px] py-2">
                <Command.Empty className="px-4 py-8 text-center text-white/30 text-sm italic">
                  No commands found.
                </Command.Empty>

                {/* Open Apps */}
                <Command.Group heading="Open Application" className="px-2">
                  {APPS.map((app) => (
                    <Command.Item
                      key={app.id}
                      value={`open ${app.title}`}
                      onSelect={() => runCommand(() => openWindow(app.id as any, app.title))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 text-sm cursor-default hover:bg-white/10 data-[selected=true]:bg-white/10 transition-colors"
                    >
                      <app.icon size={15} className="text-accent shrink-0" />
                      <span>{app.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>

                {/* Window Actions (only if windows open) */}
                {openWindows.length > 0 && (
                  <Command.Group heading="Window" className="px-2 mt-1">
                    <Command.Item
                      value="close all windows"
                      onSelect={() => runCommand(() => openWindows.forEach(w => closeWindow(w.id)))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 text-sm cursor-default hover:bg-white/10 data-[selected=true]:bg-white/10 transition-colors"
                    >
                      <X size={15} className="text-accent-red shrink-0" />
                      <span>Close All Windows</span>
                    </Command.Item>
                    <Command.Item
                      value="minimize all windows"
                      onSelect={() => runCommand(() => openWindows.forEach(w => minimizeWindow(w.id)))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 text-sm cursor-default hover:bg-white/10 data-[selected=true]:bg-white/10 transition-colors"
                    >
                      <Minimize2 size={15} className="text-accent-orange shrink-0" />
                      <span>Minimize All Windows</span>
                    </Command.Item>
                  </Command.Group>
                )}

                {/* System */}
                <Command.Group heading="System" className="px-2 mt-1">
                  <Command.Item
                    value="lock terminal"
                    onSelect={() => runCommand(() => lock())}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 text-sm cursor-default hover:bg-white/10 data-[selected=true]:bg-white/10 transition-colors"
                  >
                    <Lock size={15} className="text-accent-orange shrink-0" />
                    <span>Lock Terminal</span>
                  </Command.Item>
                </Command.Group>

                {/* Keyboard shortcuts hint */}
                <div className="px-4 pt-3 pb-1 border-t border-white/5 mt-2 flex flex-wrap gap-3">
                  {[
                    ['Ctrl+1-8', 'Open App N'],
                    ['Ctrl+W', 'Close Window'],
                    ['Ctrl+M', 'Minimize'],
                    ['Alt+Tab', 'Cycle Windows'],
                    ['Ctrl+L', 'Lock'],
                  ].map(([key, label]) => (
                    <div key={key} className="flex items-center gap-1.5 text-[10px] text-white/25">
                      <kbd className="border border-white/10 rounded px-1.5 py-0.5 font-mono">{key}</kbd>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

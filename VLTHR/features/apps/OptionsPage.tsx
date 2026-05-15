'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { Layers, Activity, TrendingUp, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export function OptionsPage() {
  const [chains, setChains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder for backend route /api/options
    const timer = setTimeout(() => {
      setChains([]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppShell title="Options Desk">
      <div className="flex flex-col gap-6">
        <div className="glass-liquid p-6 rounded-[28px] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Derivatives</span>
              <h2 className="text-white font-bold text-lg">Option Chains</h2>
            </div>
            <Layers className="text-accent" size={20} />
          </div>

          <div className="min-h-[200px] flex flex-col gap-3">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Activity className="text-accent animate-spin" size={24} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-40 py-10">
                <ShieldAlert size={32} />
                <span className="text-xs italic text-center">Options data requires Twelve Data Premium.</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-accent">Upgrade API Key</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { ShieldCheck, Activity, AlertTriangle, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

export function RiskLabPage() {
  const [loading, setLoading] = useState(false);

  return (
    <AppShell title="Risk Lab">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-liquid p-5 rounded-[28px] border-b-2 border-accent-green/30">
            <ShieldCheck className="text-accent-green mb-2" size={20} />
            <span className="text-white/40 text-[9px] uppercase font-bold">Sharpe Ratio</span>
            <div className="text-white font-mono text-xl">2.41</div>
          </div>
          <div className="glass-liquid p-5 rounded-[28px] border-b-2 border-accent-red/30">
            <AlertTriangle className="text-accent-red mb-2" size={20} />
            <span className="text-white/40 text-[9px] uppercase font-bold">Max Drawdown</span>
            <div className="text-white font-mono text-xl">-12.4%</div>
          </div>
        </div>

        <div className="glass-liquid p-6 rounded-[28px] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Portfolio Analytics</span>
              <h2 className="text-white font-bold text-lg">Exposure & Volatility</h2>
            </div>
            <PieChart className="text-accent" size={20} />
          </div>

          <div className="h-[200px] flex items-center justify-center opacity-20 italic text-xs">
            Simulation data pending. Add holdings in Portfolio to analyze risk.
          </div>
        </div>
      </div>
    </AppShell>
  );
}

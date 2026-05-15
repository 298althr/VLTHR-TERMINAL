'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { Filter, Activity, BarChart3, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export function ScreenerPage() {
  const [loading, setLoading] = useState(false);

  return (
    <AppShell title="Market Screener">
      <div className="flex flex-col gap-6">
        <div className="glass-liquid p-4 rounded-[24px] flex items-center gap-3">
          <Search size={18} className="text-white/40" />
          <input 
            type="text" 
            placeholder="Search by criteria (e.g. PE < 15, Volume > 1M)..."
            className="bg-transparent border-none outline-none text-white text-sm w-full font-medium placeholder:text-white/20"
          />
        </div>

        <div className="glass-liquid p-6 rounded-[28px] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Multi-Factor Filtering</span>
              <h2 className="text-white font-bold text-lg">Results</h2>
            </div>
            <Filter className="text-accent" size={20} />
          </div>

          <div className="min-h-[200px] flex items-center justify-center opacity-40 flex-col gap-3">
             <BarChart3 size={32} />
             <span className="text-xs italic">Screener engine is analyzing local Parquet data lake...</span>
             <span className="text-[10px] uppercase tracking-widest font-bold text-accent">System Indexing</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

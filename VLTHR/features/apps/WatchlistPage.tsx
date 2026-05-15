'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { ListFilter, Activity, Star, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export function WatchlistPage() {
  const [loading, setLoading] = useState(false);

  return (
    <AppShell title="Global Watchlist">
      <div className="flex flex-col gap-6">
        <div className="glass-liquid p-6 rounded-[28px] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Custom Tracking</span>
              <h2 className="text-white font-bold text-lg">Watchlist</h2>
            </div>
            <Star className="text-accent" size={20} />
          </div>

          <div className="flex flex-col gap-3 min-h-[300px]">
            <button className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all text-white/40 hover:text-white">
              <Plus size={20} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Add New Asset</span>
            </button>
            
            <div className="flex-1 flex items-center justify-center opacity-20 italic text-xs py-10">
              Empty watchlist. Use search in Equities or Crypto to add.
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

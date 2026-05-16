'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { Wallet, TrendingUp, TrendingDown, PieChart, Bell, History, Plus, Trash2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFromBackend } from '@/lib/api';
import { playSound } from '@/lib/audio';

interface Holding {
  symbol: string;
  type: 'crypto' | 'equity';
  amount: number;
  buyPrice: number;
}

export function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPortfolio = async () => {
      const data = await fetchFromBackend('/api/portfolio');
      if (data && data.length > 0) {
        setHoldings(data);
      } else {
        // Initial sample if empty
        const sample: Holding[] = [
          { symbol: 'BTC', type: 'crypto', amount: 0.5, buyPrice: 45000 },
          { symbol: 'AAPL', type: 'equity', amount: 10, buyPrice: 150 }
        ];
        setHoldings(sample);
        // Post sample to backend
        try {
          const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
          const clean = base.endsWith('/') ? base.slice(0, -1) : base;
          await fetch(`${clean}/api/portfolio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sample)
          });
        } catch (e) {
          console.error('Failed to sync portfolio', e);
        }
      }
      setLoading(false);
    };
    loadPortfolio();
  }, []);

  const handleExport = () => {
    const headers = ['Symbol', 'Type', 'Amount', 'Buy Price', 'Total Value'];
    const rows = holdings.map(h => [
      h.symbol,
      h.type,
      h.amount,
      h.buyPrice,
      (h.amount * h.buyPrice).toFixed(2)
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "VLTHR_Terminal_Portfolio.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSound('tap');
  };

  const totalValue = holdings.reduce((acc, h) => acc + (h.amount * h.buyPrice), 0);

  return (
    <AppShell title="Wealth Management">
      <div className="flex flex-col gap-6">
        {/* Total Wealth Summary */}
        <div className="glass-thick p-8 rounded-[38px] flex flex-col items-center gap-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
             <button onClick={handleExport} className="text-white/20 hover:text-white transition-colors">
                <Download size={20} />
             </button>
          </div>
          <span className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] relative z-10">Total Asset Value</span>
          <h1 className="text-white text-4xl font-bold tracking-tight relative z-10">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h1>
          <div className="flex items-center gap-2 text-accent-green font-bold text-xs relative z-10">
            <TrendingUp size={14} />
            <span>+12.4% (All Time)</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="glass-liquid py-4 rounded-[24px] flex items-center justify-center gap-2 text-white font-bold text-xs">
            <Plus size={16} className="text-accent" /> Add Asset
          </button>
          <button className="glass-liquid py-4 rounded-[24px] flex items-center justify-center gap-2 text-white font-bold text-xs">
            <Bell size={16} className="text-accent-orange" /> Price Alerts
          </button>
        </div>

        {/* Holdings List */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-2">
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Active Holdings</span>
            <PieChart size={14} className="text-white/20" />
          </div>

          <div className="flex flex-col gap-3">
            {holdings.map((h, i) => (
              <motion.div
                key={h.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-liquid p-5 rounded-[28px] flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                    h.type === 'crypto' ? 'bg-accent-orange/10 text-accent-orange' : 'bg-accent/10 text-accent'
                  }`}>
                    {h.symbol[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">{h.symbol}</span>
                    <span className="text-white/40 text-[10px] font-mono">{h.amount} units</span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-white font-mono text-sm">${(h.amount * h.buyPrice).toLocaleString()}</span>
                  <span className="text-white/20 text-[9px]">Avg: ${h.buyPrice}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Performance Graph Placeholder */}
        <div className="glass-liquid p-6 rounded-[28px] flex flex-col gap-4">
           <div className="flex items-center gap-2">
            <History size={14} className="text-white/30" />
            <span className="text-white/40 text-[10px] uppercase font-bold">Historical Performance</span>
          </div>
          <div className="h-[120px] flex items-end gap-1 px-2">
            {[40, 70, 45, 90, 65, 80, 50, 75, 100, 85, 95, 110].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-accent/20 rounded-t-sm transition-all hover:bg-accent" 
                style={{ height: `${h}%` }} 
              />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

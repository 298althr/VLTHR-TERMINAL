'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { equitiesAdapter } from '@/lib/adapters/equities';
import { PRICE_TICK, TIME_SERIES, FUNDAMENTAL } from '@/lib/schemas';
import { LineChart, Activity, Search, TrendingUp, TrendingDown, Star, BarChart3, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FinancialChart } from '@/components/FinancialChart';

const WATCHLIST_DEFAULT = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN'];

export function EquitiesPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [quote, setQuote] = useState<PRICE_TICK | null>(null);
  const [history, setHistory] = useState<TIME_SERIES | null>(null);
  const [fundamentals, setFundamentals] = useState<FUNDAMENTAL | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [p, h, f] = await Promise.all([
        equitiesAdapter.getPrice(selectedSymbol),
        equitiesAdapter.getHistory(selectedSymbol),
        equitiesAdapter.getFundamentals(selectedSymbol)
      ]);
      setQuote(p);
      setHistory(h);
      setFundamentals(f);
      setLoading(false);
    };

    fetchData();
  }, [selectedSymbol]);

  return (
    <AppShell title="Equities Panel">
      <div className="flex flex-col gap-6">
        {/* Symbol Search */}
        <div className="glass-liquid p-4 rounded-[24px] flex items-center gap-3">
          <Search size={18} className="text-white/40" />
          <input 
            type="text" 
            placeholder="Enter Ticker (e.g. NVDA, TSLA)..."
            className="bg-transparent border-none outline-none text-white text-sm w-full font-medium placeholder:text-white/20 uppercase"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && search) setSelectedSymbol(search.toUpperCase());
            }}
          />
        </div>

        {/* Price Detail Card */}
        <div className="glass-liquid p-6 rounded-[28px] flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <Star size={18} className="text-white/20" />
          </div>

          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">
                {quote?.source || 'MARKET'} · {fundamentals?.sector || 'SECTOR'}
              </span>
              <h2 className="text-white font-bold text-2xl">{selectedSymbol}</h2>
              <span className="text-white/60 text-xs">{quote?.name || 'Loading Asset Name...'}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white font-mono text-2xl">
                {quote ? `$${quote.price.toFixed(2)}` : '—'}
              </span>
              {quote && (
                <div className={`flex items-center gap-1 text-[11px] font-bold ${quote.changePct >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                  {quote.changePct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(quote.changePct).toFixed(2)}%
                </div>
              )}
            </div>
          </div>

          {/* Chart Section */}
          <div className="h-[200px] w-full flex items-center justify-center">
            {loading ? (
              <Activity className="text-accent animate-spin" size={24} />
            ) : history ? (
              <FinancialChart data={history.points} type="line" />
            ) : (
              <div className="text-white/20 text-xs italic text-center px-10">
                Data unavailable. Ensure Twelve Data API key is set in .env.local
              </div>
            )}
          </div>
        </div>

        {/* Watchlist Quick-Grid */}
        <div className="flex flex-col gap-3">
          <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest px-2">Watchlist</span>
          <div className="grid grid-cols-3 gap-2">
            {WATCHLIST_DEFAULT.map(sym => (
              <button
                key={sym}
                onClick={() => setSelectedSymbol(sym)}
                className={`py-3 rounded-2xl text-[10px] font-bold transition-all border ${
                  selectedSymbol === sym ? 'bg-accent text-white border-accent' : 'glass-liquid text-white/40 border-white/5'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Fundamentals Sidebar (Simulated Layout) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-liquid p-4 rounded-[24px] flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-white/30" />
              <span className="text-white/40 text-[9px] uppercase font-bold">Market Cap</span>
            </div>
            <span className="text-white font-mono text-sm">
              {fundamentals?.marketCap ? `$${(fundamentals.marketCap / 1e9).toFixed(2)}B` : '—'}
            </span>
          </div>
          <div className="glass-liquid p-4 rounded-[24px] flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-white/30" />
              <span className="text-white/40 text-[9px] uppercase font-bold">Sector</span>
            </div>
            <span className="text-white text-[11px] font-bold truncate">
              {fundamentals?.sector || '—'}
            </span>
          </div>
        </div>

        {/* Advisory */}
        <div className="glass-liquid p-5 rounded-[28px] border-dashed border-white/10">
          <p className="text-white/20 text-[8px] leading-relaxed">
            SYSTEM NOTICE: Equity data is 15-minute delayed per exchange regulations. Real-time access requires Terminal Tier subscription. Primary source: Twelve Data. Fallback: Alpha Vantage.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

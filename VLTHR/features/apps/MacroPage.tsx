'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { macroAdapter } from '@/lib/adapters/macro';
import { MACRO_SERIES } from '@/lib/schemas';
import { Landmark, Activity, BarChart2, Globe2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { FinancialChart } from '@/components/FinancialChart';

const INDICATORS = [
  { id: 'NY.GDP.MKTP.CD', name: 'GDP (Current USD)' },
  { id: 'FP.CPI.TOTL.ZG', name: 'Inflation (CPI %)' },
  { id: 'SL.UEM.TOTL.ZS', name: 'Unemployment (%)' },
];

export function MacroPage() {
  const [indicatorData, setIndicatorData] = useState<MACRO_SERIES | null>(null);
  const [selectedId, setSelectedId] = useState(INDICATORS[0].id);
  const [yieldCurve, setYieldCurve] = useState<MACRO_SERIES | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [macro, yields] = await Promise.all([
        macroAdapter.getIndicator('USA', selectedId),
        macroAdapter.getYieldCurve()
      ]);
      setIndicatorData(macro);
      setYieldCurve(yields);
      setLoading(false);
    };

    fetchData();
  }, [selectedId]);

  return (
    <AppShell title="Macro Panel">
      <div className="flex flex-col gap-6">
        {/* Main Indicator Chart */}
        <div className="glass-liquid p-6 rounded-[28px] flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Global Indicator</span>
              <h2 className="text-white font-bold text-lg">{indicatorData?.indicator || 'Loading...'}</h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <Globe2 size={20} />
            </div>
          </div>

          <div className="h-[200px] w-full flex items-center justify-center">
            {loading ? (
              <Activity className="text-accent animate-spin" size={24} />
            ) : indicatorData?.points.length ? (
              <FinancialChart 
                data={indicatorData.points.map(p => ({ t: new Date(p.date).getTime(), o: p.value, h: p.value, l: p.value, c: p.value, v: 0 }))} 
                type="line" 
              />
            ) : (
              <span className="text-white/20 text-xs">No data available</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {INDICATORS.map(ind => (
              <button
                key={ind.id}
                onClick={() => setSelectedId(ind.id)}
                className={`py-2 px-1 rounded-xl text-[8px] font-bold transition-all border ${
                  selectedId === ind.id ? 'bg-accent text-white border-accent' : 'glass-liquid text-white/40 border-white/5'
                }`}
              >
                {ind.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Yield Curve Section */}
        <div className="glass-liquid p-6 rounded-[28px] flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-accent-orange" size={16} />
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">US Treasury Yields</span>
          </div>

          <div className="flex flex-col gap-3">
            {yieldCurve?.points.slice(0, 5).map((point, i) => (
              <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                <span className="text-white/60 text-[10px]">{point.date.split('Total ')[1] || point.date}</span>
                <span className="text-white font-mono text-xs">{point.value.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="glass-liquid p-5 rounded-[28px] flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Landmark className="text-white/40" size={14} />
            <span className="text-white/60 text-[10px] font-bold">Data Attribution</span>
          </div>
          <p className="text-white/30 text-[9px] leading-relaxed">
            Economic time-series data provided by the World Bank Group. Treasury yields sourced from the U.S. Department of the Treasury Fiscal Service.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

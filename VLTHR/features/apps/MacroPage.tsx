'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { macroAdapter } from '@/lib/adapters/macro';
import { catalogAdapter } from '@/lib/adapters/catalog';
import { MACRO_SERIES } from '@/lib/schemas';
import { Landmark, Activity, BarChart2, Globe2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { FinancialChart } from '@/components/FinancialChart';

const INDICATORS = [
  { id: 'NY.GDP.MKTP.CD',   name: 'GDP',          unit: 'USD' },
  { id: 'FP.CPI.TOTL.ZG',  name: 'Inflation',    unit: 'CPI %' },
  { id: 'SL.UEM.TOTL.ZS',  name: 'Unemployment', unit: '%' },
  { id: 'NE.TRD.GNFS.ZS',  name: 'Trade',        unit: '% GDP' },
  { id: 'GC.DOD.TOTL.GD.ZS', name: 'Debt',       unit: '% GDP' },
  { id: 'BX.KLT.DINV.WD.GD.ZS', name: 'FDI',    unit: '% GDP' },
];

const COUNTRIES = [
  { code: 'USA', label: '🇺🇸 USA' },
  { code: 'GBR', label: '🇬🇧 GBR' },
  { code: 'CHN', label: '🇨🇳 CHN' },
  { code: 'DEU', label: '🇩🇪 DEU' },
  { code: 'JPN', label: '🇯🇵 JPN' },
];

export function MacroPage() {
  const [catalog, setCatalog]             = useState<string[]>([]);
  const [indicatorData, setIndicatorData] = useState<MACRO_SERIES | null>(null);
  const [selectedId, setSelectedId]       = useState(INDICATORS[0].id);
  const [selectedCountry, setSelectedCountry] = useState('USA');
  const [yieldCurve, setYieldCurve]       = useState<MACRO_SERIES | null>(null);
  const [loading, setLoading]             = useState(true);
  const [yieldsLoading, setYieldsLoading] = useState(true);

  useEffect(() => {
    catalogAdapter.getCatalog().then(c => setCatalog(c.macro));
  }, []);

  useEffect(() => {
    const fetchIndicator = async () => {
      setLoading(true);
      try {
        const macro = await macroAdapter.getIndicator(selectedCountry, selectedId);
        setIndicatorData(macro);
      } catch (e) {
        console.error('Macro Indicator Fetch Error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchIndicator();
  }, [selectedId, selectedCountry]);

  useEffect(() => {
    const fetchYields = async () => {
      setYieldsLoading(true);
      try {
        const yields = await macroAdapter.getYieldCurve();
        setYieldCurve(yields);
      } catch (e) {
        console.error('Yield Curve Fetch Error:', e);
      } finally {
        setYieldsLoading(false);
      }
    };
    fetchYields();
  }, []);

  const selectedIndicator = INDICATORS.find(i => i.id === selectedId);

  return (
    <AppShell title="Macro Panel">
      <div className="flex flex-col gap-6">
        {catalog.length === 0 && (
          <div className="glass-liquid p-4 rounded-2xl text-center">
            <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold">No macro data in local store — run harvest or check World Bank API key</span>
          </div>
        )}
        {/* Country Selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {COUNTRIES.map(c => (
            <button
              key={c.code}
              onClick={() => setSelectedCountry(c.code)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all shrink-0 border ${
                selectedCountry === c.code
                  ? 'bg-accent border-accent text-white shadow-[0_0_14px_rgba(0,122,255,0.3)]'
                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Main Indicator Chart */}
        <div className="glass-liquid p-6 rounded-[28px] flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">
                {selectedCountry} · {selectedIndicator?.unit}
              </span>
              <h2 className="text-white font-bold text-lg">
                {indicatorData?.indicator || selectedIndicator?.name}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <Globe2 size={20} />
            </div>
          </div>

          <div className="h-[200px] w-full flex items-center justify-center relative">
            {loading && (
              <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-sm flex items-center justify-center rounded-xl">
                <Activity className="text-accent animate-spin" size={24} />
              </div>
            )}
            {indicatorData?.points?.length ? (
              <FinancialChart
                data={(indicatorData.points || []).map(p => ({
                  t: new Date(p.date).getTime(), o: p.value, h: p.value, l: p.value, c: p.value, v: 0
                }))}
                type="line"
              />
            ) : !loading ? (
              <span className="text-white/20 text-xs">No parquet data — World Bank data loads on first request</span>
            ) : null}
          </div>

          {/* Indicator Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {INDICATORS.map(ind => (
              <button
                key={ind.id}
                onClick={() => setSelectedId(ind.id)}
                className={`py-2 px-2 rounded-xl text-[9px] font-bold transition-all border ${
                  selectedId === ind.id
                    ? 'bg-accent text-white border-accent'
                    : 'glass-liquid text-white/40 border-white/5 hover:border-accent/30'
                }`}
              >
                {ind.name}
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
            {yieldsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Activity className="text-accent animate-spin" size={16} />
              </div>
            ) : yieldCurve?.points?.length ? (
              yieldCurve.points.slice(0, 8).map((point, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                  <span className="text-white/60 text-[10px]">{point.date.split('Total ')[1] || point.date}</span>
                  <span className={`font-mono text-xs font-bold ${point.value > 4.5 ? 'text-accent-red' : point.value > 3 ? 'text-accent-orange' : 'text-accent-green'}`}>
                    {point.value.toFixed(2)}%
                  </span>
                </div>
              ))
            ) : (
              <span className="text-white/20 text-xs text-center py-4">Yield data unavailable</span>
            )}
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

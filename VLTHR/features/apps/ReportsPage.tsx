'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { FileText, Activity, Download, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_REPORTS = [
  { title: 'Weekly Macro Outlook', date: '2026-05-12', type: 'Macro' },
  { title: 'Tech Sector Earnings Summary', date: '2026-05-10', type: 'Equities' },
  { title: 'Crypto Liquidity Report', date: '2026-05-08', type: 'Crypto' },
];

export function ReportsPage() {
  return (
    <AppShell title="System Reports">
      <div className="flex flex-col gap-6">
        <div className="glass-liquid p-6 rounded-[28px] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Intelligence Archive</span>
              <h2 className="text-white font-bold text-lg">Market Research</h2>
            </div>
            <FileText className="text-accent" size={20} />
          </div>

          <div className="flex flex-col gap-3 mt-2">
            {MOCK_REPORTS.map((r, i) => (
              <div key={i} className="glass-liquid p-4 rounded-2xl border border-white/5 flex items-center justify-between hover:border-accent/40 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-accent transition-colors">
                    <FileText size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-xs">{r.title}</span>
                    <span className="text-white/30 text-[10px] uppercase tracking-tighter">{r.type} · {r.date}</span>
                  </div>
                </div>
                <Download size={14} className="text-white/20 group-hover:text-white transition-colors" />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-liquid p-5 rounded-[28px] border-dashed border-white/10">
          <p className="text-white/20 text-[8px] leading-relaxed uppercase tracking-widest text-center">
            Automated reporting engine generates insights based on Parquet data lake snapshots every Sunday at 00:00 UTC.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

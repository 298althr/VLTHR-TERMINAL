'use client';

import { AppShell } from './AppShell';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

export function SystemApp() {
  const stats = [
    { label: 'Integrity', value: '100%', color: 'text-green-400' },
    { label: 'Anonymity', value: 'Ultra', color: 'text-accent' },
    { label: 'Uptime', value: '342d', color: 'text-white' },
    { label: 'Latency', value: '0.4ms', color: 'text-white' },
  ];

  return (
    <AppShell title="System Health">
      <div className="flex flex-col gap-6">
        {/* Hero Chart Mockup */}
        <div className="h-48 glass rounded-3xl flex items-end justify-around p-6 overflow-hidden">
          {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
            <motion.div 
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className="w-4 bg-accent/40 rounded-t-sm"
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass p-4 rounded-2xl border border-white/5">
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
              <div className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        <section className="mt-4">
          <h2 className="text-white font-bold mb-4">Core Services</h2>
          <div className="space-y-3">
            {['Neural Link', 'Bio-Verify', 'Cloud Sharding'].map((service, i) => (
              <div key={i} className="flex items-center justify-between p-4 glass rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white text-sm">{service}</span>
                </div>
                <span className="text-white/40 text-xs">Active</span>
              </div>
            ))}
          </div>
        </section>

        {/* Install Prompt Mockup */}
        <section className="mt-8 p-6 bg-accent/10 rounded-3xl border border-accent/20 flex flex-col items-center gap-4">
          <div className="text-accent text-sm font-bold uppercase tracking-widest text-center">Native Experience</div>
          <p className="text-white/60 text-[10px] text-center px-4">
            Install Ortho'M8 OS to your home screen for full-screen immersive access and offline identity verification.
          </p>
          <button 
            onClick={() => alert('Tap the Share icon in Safari and select "Add to Home Screen"')}
            className="w-full py-3 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Download OS
          </button>
        </section>
      </div>
    </AppShell>
  );
}

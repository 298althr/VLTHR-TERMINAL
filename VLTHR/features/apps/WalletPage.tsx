'use client';

import { AppShell } from './AppShell';
import { Wallet as WalletIcon, CreditCard, ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';

export function WalletPage() {
  const transactions = [
    { title: 'Neural node subscription', amount: '-$14.99', date: 'Just now', type: 'out' },
    { title: 'Portfolio dividend', amount: '+$1,204.00', date: '2h ago', type: 'in' },
    { title: 'Security deposit', amount: '-$500.00', date: 'Yesterday', type: 'out' },
  ];

  return (
    <AppShell title="Sovereign Wallet">
      <div className="flex flex-col gap-8">
        {/* Card View */}
        <div className="w-full aspect-[1.6/1] glass-liquid rounded-[32px] p-6 flex flex-col justify-between border border-white/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl -mr-16 -mt-16 rounded-full" />
          <div className="flex justify-between items-start relative z-10">
            <span className="text-white/60 text-xs font-medium tracking-tight">Total Balance</span>
            <ShieldCheck size={20} className="text-accent" />
          </div>
          <div className="relative z-10">
            <h2 className="text-white text-4xl font-bold tracking-tight">$42,904.22</h2>
            <span className="text-white/40 text-[10px] font-mono mt-1 block">ORTHO-M8 MAINNET V1.0</span>
          </div>
        </div>

        {/* Action Pods */}
        <div className="grid grid-cols-2 gap-4">
          <button className="glass-liquid p-4 rounded-2xl flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-transform">
            <ArrowUpRight size={18} className="text-accent" />
            <span className="text-white text-xs font-bold">Send</span>
          </button>
          <button className="glass-liquid p-4 rounded-2xl flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-transform">
            <ArrowDownLeft size={18} className="text-accent" />
            <span className="text-white text-xs font-bold">Receive</span>
          </button>
        </div>

        {/* Recent Transactions */}
        <section>
          <h2 className="text-white font-bold text-xs uppercase tracking-widest opacity-40 px-2 mb-4">Recent Activity</h2>
          <div className="flex flex-col gap-3">
            {transactions.map((t, i) => (
              <div key={i} className="glass-liquid p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'in' ? 'bg-accent-green/20 text-accent-green' : 'bg-white/5 text-white/40'}`}>
                    {t.type === 'in' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-medium">{t.title}</span>
                    <span className="text-white/40 text-[10px]">{t.date}</span>
                  </div>
                </div>
                <span className={`text-sm font-bold ${t.type === 'in' ? 'text-accent-green' : 'text-white'}`}>
                  {t.amount}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

'use client';

import { AppShell } from './AppShell';
import { Mail, MessageSquare, Phone, Globe, ChevronRight } from 'lucide-react';

export function SupportPage() {
  const channels = [
    { icon: <MessageSquare size={20} />, title: 'Direct Node Chat', desc: 'Average response: 2 mins', active: true },
    { icon: <Mail size={20} />, title: 'Encrypted Mail', desc: 'support@orthom8.io', active: false },
    { icon: <Globe size={20} />, title: 'Community Forum', desc: 'Connect with other nodes', active: false },
  ];

  return (
    <AppShell title="Support Hub">
      <div className="flex flex-col gap-8">
        <div className="text-center px-4">
          <div className="w-20 h-20 waterglass-sphere rounded-full mx-auto mb-6 flex items-center justify-center text-accent">
            <Phone size={32} />
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight mb-2">How can we help?</h2>
          <p className="text-white/40 text-xs leading-relaxed">
            Our support nodes are active 24/7. Connect via any sovereign channel below for assistance.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          {channels.map((channel, i) => (
            <div key={i} className="glass-liquid p-5 rounded-[28px] flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  {channel.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-bold">{channel.title}</span>
                  <span className="text-white/40 text-[10px]">{channel.desc}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-white/20 group-hover:text-white/40 transition-colors" />
            </div>
          ))}
        </section>

        <div className="glass-liquid p-6 rounded-[28px] bg-accent/5 border border-accent/10">
          <h3 className="text-accent font-bold text-xs mb-3">System Integrity Status</h3>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
            <span className="text-white text-xs font-medium">All systems operational</span>
          </div>
          <p className="text-white/40 text-[10px] leading-relaxed">
            Node uptime: 99.998%. No reported outages in the last 72 cycles.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

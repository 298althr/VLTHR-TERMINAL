'use client';

import { AppShell } from './AppShell';
import { Settings, User, Bell, Shield, Smartphone, HelpCircle, ChevronRight } from 'lucide-react';

export function SettingsPage() {
  const sections = [
    {
      title: 'Identity',
      items: [
        { icon: <User size={18} />, label: 'Neural Profile', value: 'Active' },
        { icon: <Shield size={18} />, label: 'Privacy & Keys', value: '' },
      ]
    },
    {
      title: 'System',
      items: [
        { icon: <Bell size={18} />, label: 'Notifications', value: 'Interactive' },
        { icon: <Smartphone size={18} />, label: 'OS Version', value: 'v26.1.4' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: <HelpCircle size={18} />, label: 'Documentation', value: '' },
      ]
    }
  ];

  return (
    <AppShell title="System Settings">
      <div className="flex flex-col gap-8">
        {/* User Profile Summary */}
        <div className="glass-liquid p-6 rounded-[28px] flex items-center gap-4">
          <div className="w-16 h-16 waterglass-sphere rounded-full bg-accent/20 flex items-center justify-center text-accent">
            <User size={32} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-white font-bold">Admin Node</h2>
            <span className="text-white/40 text-xs">admin@orthom8.io</span>
          </div>
        </div>

        {/* Settings Sections */}
        {sections.map((section, idx) => (
          <section key={idx}>
            <h2 className="text-white/40 text-[10px] font-bold uppercase tracking-widest px-4 mb-3">{section.title}</h2>
            <div className="glass-liquid rounded-[28px] overflow-hidden divide-y divide-white/5">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 active:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="text-accent/60 group-active:text-accent transition-colors">
                      {item.icon}
                    </div>
                    <span className="text-white text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.value && <span className="text-white/40 text-xs">{item.value}</span>}
                    <ChevronRight size={16} className="text-white/20" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="text-center">
          <span className="text-white/20 text-[9px] uppercase tracking-widest font-bold">Ortho-M8 OS v26.4 // Liquid Glass Engine</span>
        </div>
      </div>
    </AppShell>
  );
}

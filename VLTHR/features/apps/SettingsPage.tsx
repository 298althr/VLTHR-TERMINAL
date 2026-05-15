'use client';

import { useState, useEffect } from 'react';
import { AppShell } from './AppShell';
import { Settings, User, Bell, Shield, Terminal, HelpCircle, ChevronRight, Activity, Database, Sun, Moon } from 'lucide-react';
import { fetchFromBackend } from '@/lib/api';
import { Switch, Slider, Typography, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';

import { useAppStore } from '@/store/useAppStore';
import { AppleToggle } from '@/components/AppleToggle';

export function SettingsPage() {
  const [stats, setStats] = useState<Record<string, { count: number }>>({});
  const [loading, setLoading] = useState(true);
  const { terminalTheme, terminalBrightness, setTerminalTheme, setTerminalBrightness } = useAppStore();
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      const data = await fetchFromBackend('/api/stats');
      if (data) setStats(data);
      setLoading(false);
    };
    getStats();
  }, []);

  const sections = [
    {
      title: 'Infrastructure',
      items: [
        { icon: <Database size={18} />, label: 'API Keys', value: 'Backend/Vault' },
        { icon: <Terminal size={18} />, label: 'Data Adapters', value: 'Remote' },
      ]
    },
    {
      title: 'Terminal System',
      items: [
        { icon: <Bell size={18} />, label: 'Price Alerts', value: 'Disabled' },
        { icon: <Shield size={18} />, label: 'Neural Security', value: 'Active' },
      ]
    }
  ];

  return (
    <AppShell title="Terminal Settings">
      <div className="flex flex-col gap-8">
        {/* User Profile Summary */}
        <div className="glass-liquid p-6 rounded-[28px] flex items-center gap-4">
          <div className="w-16 h-16 waterglass-sphere rounded-full bg-accent/20 flex items-center justify-center text-accent">
            <User size={32} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-white font-bold">Terminal Operator</h2>
            <span className="text-white/40 text-xs">vlthr@298saviour.dev</span>
          </div>
        </div>

        {/* Rate Limit Stats Section */}
        <section>
          <div className="flex items-center gap-2 px-4 mb-3">
            <Activity size={14} className="text-accent" />
            <h2 className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Backend Budgets</h2>
          </div>
          <div className="glass-liquid rounded-[28px] p-5 flex flex-col gap-4">
            {Object.entries(stats).length > 0 ? Object.entries(stats).map(([provider, data]) => {
              // Standard limits for display
              const limits: any = {
                COINGECKO: 1440,
                TWELVE_DATA: 800,
                ALPHA_VANTAGE: 25,
                MARKET_AUX: 100,
                NEWS_API: 100,
              };
              const limit = limits[provider] || 100;
              const pct = Math.round((data.count / limit) * 100);
              
              return (
                <div key={provider} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[9px] uppercase font-bold">
                    <span className="text-white/60">{provider.replace(/_/g, ' ')}</span>
                    <span className="text-white/40">{data.count} / {limit}</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${pct > 80 ? 'bg-accent-red' : 'bg-accent'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            }) : (
              <div className="text-white/20 text-[10px] text-center italic py-2">
                Connecting to backend node...
              </div>
            )}
          </div>
        </section>

        {/* Settings Sections */}
        <section>
          <div className="flex items-center gap-2 px-4 mb-3">
            <Activity size={14} className="text-accent" />
            <h2 className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Display & Experience</h2>
          </div>
          
          <div className="glass-liquid rounded-[24px] p-5 flex flex-col gap-6">
            {/* Brightness Row */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Sun size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-medium">Terminal Brightness</span>
                    <span className="text-white/30 text-[10px]">Adjust background glass opacity</span>
                  </div>
                </div>
                <span className="text-white/40 text-xs font-mono">{terminalBrightness}%</span>
              </div>
              <div className="px-1">
                <Slider 
                  value={terminalBrightness} 
                  onChange={(_, v) => setTerminalBrightness(v as number)} 
                  aria-label="Brightness"
                />
              </div>
            </div>

            {/* Notifications Row */}
            <div className="flex items-center justify-between px-1 py-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Bell size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-medium">System Notifications</span>
                  <span className="text-white/30 text-[10px]">Receive market alerts and signals</span>
                </div>
              </div>
              <AppleToggle 
                checked={notifications} 
                onChange={(checked) => setNotifications(checked)} 
              />
            </div>

            {/* Theme Row */}
            <div className="flex flex-col gap-3 px-1">
              <div className="flex flex-col">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Interface Theme</span>
                <span className="text-white/30 text-[10px] mb-2">Switch between visual protocols</span>
              </div>
              <FormControl fullWidth size="small">
                <Select
                  value={terminalTheme}
                  onChange={(e) => setTerminalTheme(e.target.value as any)}
                  className="bg-white/5 rounded-xl text-white text-sm"
                  disableUnderline
                  variant="standard"
                  sx={{
                    '& .MuiSelect-select': {
                      padding: '10px 14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                    }
                  }}
                >
                  <MenuItem value="dark">Liquid Glass (Dark)</MenuItem>
                  <MenuItem value="light">Frosted Glass (Light)</MenuItem>
                  <MenuItem value="nebula">Nebula Protocol</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </section>

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

        <div className="text-center pb-10">
          <span className="text-white/20 text-[9px] uppercase tracking-widest font-bold">VLTHR TERMINAL v1.0 // LIQUID GLASS CORE</span>
        </div>
      </div>
    </AppShell>
  );
}

'use client';
import { AppShell } from './AppShell';
import { Globe, Activity } from 'lucide-react';

export function ForexPage() {
  return (
    <AppShell title="Forex Market">
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Globe className="text-accent/20" size={64} />
        <span className="text-white/40 text-xs font-mono text-center px-12">
          Forex module (Module 2) is scheduled for next phase.
        </span>
      </div>
    </AppShell>
  );
}

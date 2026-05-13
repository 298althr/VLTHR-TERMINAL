'use client';
import { AppShell } from './AppShell';
import { LineChart } from 'lucide-react';

export function EquitiesPage() {
  return (
    <AppShell title="Global Equities">
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <LineChart className="text-accent/20" size={64} />
        <span className="text-white/40 text-xs font-mono text-center px-12">
          Equities module (Module 5) is scheduled for next phase.
        </span>
      </div>
    </AppShell>
  );
}

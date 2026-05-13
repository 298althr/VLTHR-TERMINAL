'use client';
import { AppShell } from './AppShell';
import { Zap } from 'lucide-react';

export function SignalsPage() {
  return (
    <AppShell title="Live Signals">
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Zap className="text-accent/20" size={64} />
        <span className="text-white/40 text-xs font-mono text-center px-12">
          Signals module (Module 6) is scheduled for next phase.
        </span>
      </div>
    </AppShell>
  );
}

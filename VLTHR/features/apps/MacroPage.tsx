'use client';
import { AppShell } from './AppShell';
import { Landmark } from 'lucide-react';

export function MacroPage() {
  return (
    <AppShell title="Macro Data">
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Landmark className="text-accent/20" size={64} />
        <span className="text-white/40 text-xs font-mono text-center px-12">
          Macro module (Module 4) is scheduled for next phase.
        </span>
      </div>
    </AppShell>
  );
}

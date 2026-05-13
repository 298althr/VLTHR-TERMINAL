'use client';
import { AppShell } from './AppShell';
import { Wallet } from 'lucide-react';

export function PortfolioPage() {
  return (
    <AppShell title="Wealth Management">
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Wallet className="text-accent/20" size={64} />
        <span className="text-white/40 text-xs font-mono text-center px-12">
          Portfolio module (Module 7) is scheduled for next phase.
        </span>
      </div>
    </AppShell>
  );
}

'use client';
import { AppShell } from './AppShell';
import { Newspaper } from 'lucide-react';

export function NewsPage() {
  return (
    <AppShell title="Market News">
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Newspaper className="text-accent/20" size={64} />
        <span className="text-white/40 text-xs font-mono text-center px-12">
          News module (Module 3) is scheduled for next phase.
        </span>
      </div>
    </AppShell>
  );
}

'use client';

import { MenuBar } from './MenuBar';
import { Dock } from './Dock';
import { WindowManager } from './WindowManager';
import { CommandPalette } from './CommandPalette';
import { Launchpad } from './Launchpad';
import { Island } from '@/features/dynamic-island/Island';
import { DockCards } from './DockCards';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { SessionGuard } from '@/components/SessionGuard';
import { AccessibilityTour } from '@/components/AccessibilityTour';

import { useAppStore } from '@/store/useAppStore';

export function Desktop() {
  const terminalBrightness = useAppStore((s) => s.terminalBrightness);
  const setControlCentreOpen = useAppStore((s) => s.setControlCentreOpen);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-ventura-wallpaper">
      <MenuBar />
      <Island />
      <DockCards />
      <LoadingOverlay />
      <SessionGuard />
      <AccessibilityTour />
      <Launchpad />
      
      {/* Hot Corner: Right Edge Trigger for Control Centre */}
      <div 
        className="fixed top-7 right-0 bottom-0 w-2 z-[100] cursor-pointer hover:bg-white/5 transition-colors"
        onMouseEnter={() => setControlCentreOpen(true)}
      />

      {/* Desktop Content Area (Safety Zone) */}
      <main className="absolute inset-x-0 top-7 bottom-[110px] z-10">
        <WindowManager />
      </main>

      <Dock />

      {/* Command Palette — always mounted, opens on Ctrl+K */}
      <CommandPalette />

      {/* Brightness Overlay */}
      <div 
        className="absolute inset-0 z-[1000] pointer-events-none bg-black transition-opacity duration-300" 
        style={{ opacity: (100 - terminalBrightness) / 150 }} // Subtle dimming
      />
    </div>
  );
}

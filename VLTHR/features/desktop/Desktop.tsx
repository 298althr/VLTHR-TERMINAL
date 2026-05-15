'use client';

import { MenuBar } from './MenuBar';
import { Dock } from './Dock';
import { WindowManager } from './WindowManager';
import { CommandPalette } from './CommandPalette';
import { DesktopGrid } from './DesktopGrid';
import { Island } from '@/features/dynamic-island/Island';
import { DockCards } from './DockCards';
import { LoadingOverlay } from '@/components/LoadingOverlay';

import { useAppStore } from '@/store/useAppStore';

export function Desktop() {
  const terminalBrightness = useAppStore((s) => s.terminalBrightness);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-ventura-wallpaper">
      <MenuBar />
      <Island />
      <DockCards />
      <LoadingOverlay />
      
      {/* Desktop Content Area (Safety Zone) */}
      <main className="absolute inset-x-0 top-7 bottom-[110px] z-10">
        <DesktopGrid />
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

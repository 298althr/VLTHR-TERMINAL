'use client';

import { useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { AppWindow } from './AppWindow';

export function WindowManager() {
  const openWindows = useAppStore((s) => s.openWindows);
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={constraintsRef} 
      className="absolute inset-0 pointer-events-none z-[10]"
    >
      {openWindows.map((win) => (
        <AppWindow key={win.id} window={win} constraintsRef={constraintsRef as React.RefObject<HTMLDivElement>} />
      ))}
    </div>
  );
}

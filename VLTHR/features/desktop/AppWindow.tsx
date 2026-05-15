'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useDragControls } from 'framer-motion';
import { useAppStore, WindowState } from '@/store/useAppStore';
import { AppContentRouter } from './AppContentRouter';
import { Minus, Square, X } from 'lucide-react';
import { playSound } from '@/lib/audio';

export function AppWindow({ window: win, constraintsRef }: { window: WindowState, constraintsRef: React.RefObject<HTMLDivElement> }) {
  const { closeWindow, focusWindow, minimizeWindow, moveWindow, updateWindow } = useAppStore();
  const [snapPreview, setSnapPreview] = React.useState<string | null>(null);
  const dragControls = useDragControls();

  const x = useMotionValue(win.position.x);
  const y = useMotionValue(win.position.y);

  const handleClose = () => {
    playSound('tap');
    closeWindow(win.id);
  };

  const handleMinimize = () => {
    playSound('tap');
    minimizeWindow(win.id);
  };

  const handleMaximize = () => {
    playSound('tap');
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const menuBarH = 28;
    const safetyH = 110; // Match Desktop.tsx bottom-[110px]
    
    updateWindow(win.id, {
      position: { x: 0, y: menuBarH },
      size: { width: screenW, height: screenH - menuBarH - safetyH }
    });
    x.set(0);
    y.set(menuBarH);
  };

  const handleResize = (direction: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = win.size.width;
    const startH = win.size.height;
    const startPosX = win.position.x;
    const startPosY = win.position.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      let newW = startW;
      let newH = startH;
      let newX = startPosX;
      let newY = startPosY;

      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (direction.includes('right')) newW = Math.max(400, startW + deltaX);
      if (direction.includes('bottom')) newH = Math.max(300, startH + deltaY);
      
      if (direction.includes('left')) {
        const potentialW = startW - deltaX;
        if (potentialW > 400) {
          newW = potentialW;
          newX = startPosX + deltaX;
        }
      }
      
      if (direction.includes('top')) {
        const potentialH = startH - deltaY;
        if (potentialH > 300) {
          newH = potentialH;
          newY = startPosY + deltaY;
        }
      }

      x.set(newX);
      y.set(newY);
      updateWindow(win.id, { 
        size: { width: newW, height: newH },
        position: { x: newX, y: newY }
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleDrag = (_: any, info: { point: { x: number, y: number } }) => {
    const screenW = window.innerWidth;
    const threshold = 20;

    if (info.point.y < threshold + 30) {
      setSnapPreview('maximize');
    } else if (info.point.x < threshold) {
      setSnapPreview('left');
    } else if (info.point.x > screenW - threshold) {
      setSnapPreview('right');
    } else {
      setSnapPreview(null);
    }
  };

  const handleDragEnd = (_: any, info: { point: { x: number, y: number } }) => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const menuBarH = 28;
    const safetyH = 110;

    if (snapPreview === 'maximize') {
      handleMaximize();
    } else if (snapPreview === 'left') {
      updateWindow(win.id, {
        position: { x: 0, y: menuBarH },
        size: { width: screenW / 2, height: screenH - menuBarH - safetyH }
      });
      x.set(0);
      y.set(menuBarH);
    } else if (snapPreview === 'right') {
      updateWindow(win.id, {
        position: { x: screenW / 2, y: menuBarH },
        size: { width: screenW / 2, height: screenH - menuBarH - safetyH }
      });
      x.set(screenW / 2);
      y.set(menuBarH);
    } else {
      moveWindow(win.id, { x: x.get(), y: y.get() });
    }
    
    setSnapPreview(null);
  };

  return (
    <>
      {/* SNAP PREVIEW */}
      {snapPreview && (
        <div 
          className="fixed z-[-1] bg-blue-500/20 border-2 border-blue-500/40 rounded-xl transition-all duration-200 pointer-events-none"
          style={{
            left: snapPreview === 'right' ? '50%' : 0,
            top: 28,
            width: snapPreview === 'maximize' ? '100%' : '50%',
            height: window.innerHeight - 28 - 110,
          }}
        />
      )}

      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={constraintsRef}
        dragListener={false}
        dragControls={dragControls}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ 
          scale: win.isMinimized ? 0.1 : 1, 
          opacity: win.isMinimized ? 0 : 1 
        }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          x,
          y,
          width: win.size.width,
          height: win.size.height,
          zIndex: win.zIndex,
          pointerEvents: win.isMinimized ? 'none' : 'auto',
        }}
        onMouseDown={() => focusWindow(win.id)}
        className="macos-window flex flex-col pointer-events-auto overflow-hidden group/window"
      >
        {/* RESIZE HANDLES */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Edges */}
          <div className="absolute top-0 left-4 right-4 h-1 cursor-ns-resize pointer-events-auto" onMouseDown={(e) => handleResize('top', e)} />
          <div className="absolute bottom-0 left-4 right-4 h-1 cursor-ns-resize pointer-events-auto" onMouseDown={(e) => handleResize('bottom', e)} />
          <div className="absolute left-0 top-4 bottom-4 w-1 cursor-ew-resize pointer-events-auto" onMouseDown={(e) => handleResize('left', e)} />
          <div className="absolute right-0 top-4 bottom-4 w-1 cursor-ew-resize pointer-events-auto" onMouseDown={(e) => handleResize('right', e)} />
          
          {/* Corners */}
          <div className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize pointer-events-auto" onMouseDown={(e) => handleResize('topleft', e)} />
          <div className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize pointer-events-auto" onMouseDown={(e) => handleResize('topright', e)} />
          <div className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize pointer-events-auto" onMouseDown={(e) => handleResize('bottomleft', e)} />
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize pointer-events-auto" onMouseDown={(e) => handleResize('bottomright', e)} />
        </div>

        {/* TITLE BAR — drag handle */}
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="h-10 flex items-center px-4 gap-2 cursor-default border-b border-white/5 bg-white/5 group-active/window:bg-white/10 transition-colors"
        >
          {/* Traffic Lights */}
          <div className="flex gap-2">
            <button 
              onClick={handleClose} 
              className="traffic-light traffic-light-red group/btn"
              data-symbol="×"
            >
              <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity mt-[-1px]">×</span>
            </button>
            <button 
              onClick={handleMinimize} 
              className="traffic-light traffic-light-yellow group/btn"
              data-symbol="−"
            >
              <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity mt-[-1px]">−</span>
            </button>
            <button 
              onClick={handleMaximize}
              className="traffic-light traffic-light-green group/btn"
              data-symbol="+"
            >
              <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity mt-[-1px]">+</span>
            </button>
          </div>
          
          <span className="flex-1 text-center text-white/50 text-[11px] font-medium select-none truncate" onDoubleClick={handleMaximize}>
            {win.title}
          </span>
          
          {/* Placeholder for symmetry */}
          <div className="w-[52px]" />
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-auto bg-black/40 relative no-scrollbar">
          <AppContentRouter appId={win.appId} />
        </div>

        {/* Resize Indicator (Visual only, bottom-right) */}
        <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-white/10 pointer-events-none" />
      </motion.div>
    </>
  );
}

import React, { useRef, useState, useCallback, memo } from 'react';
import { WindowState, SnapPosition, ThemeConfig } from '../../types';
import { sound } from '../../utils/audio';

interface AeroWindowProps {
  window: WindowState;
  isActive: boolean;
  theme: ThemeConfig;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onUpdateBounds: (bounds: { x: number; y: number; width: number; height: number }) => void;
  onSnapPreview: (snap: SnapPosition) => void;
  children: React.ReactNode;
}

export const AeroWindow: React.FC<AeroWindowProps> = memo(({
  window: win,
  isActive,
  theme,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onUpdateBounds,
  onSnapPreview,
  children
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; winX: number; winY: number } | null>(null);
  const resizeStartRef = useRef<{ 
    direction: string; 
    mouseX: number; 
    mouseY: number; 
    winX: number; 
    winY: number; 
    width: number; 
    height: number 
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  // Dragging logic with Pointer Capture for zero-jank tracking
  const handleTitlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with primary mouse button, and ignore clicks on buttons
    if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
    if (win.isMaximized) return; // Maximized windows don't drag immediately until pulled down

    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: win.x,
      winY: win.y
    };
    setIsDragging(true);
    onFocus();
  }, [win.x, win.y, win.isMaximized, onFocus]);

  const handleTitlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    const newX = Math.max(-win.width + 100, Math.min(window.innerWidth - 80, dragStartRef.current.winX + dx));
    const newY = Math.max(0, Math.min(window.innerHeight - 70, dragStartRef.current.winY + dy));

    // Aero Snap detection
    if (e.clientY <= 6) {
      onSnapPreview('top');
    } else if (e.clientX <= 8) {
      onSnapPreview('left');
    } else if (e.clientX >= window.innerWidth - 8) {
      onSnapPreview('right');
    } else {
      onSnapPreview('none');
    }

    onUpdateBounds({
      x: newX,
      y: newY,
      width: win.width,
      height: win.height
    });
  }, [win.width, win.height, onSnapPreview, onUpdateBounds]);

  const handleTitlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    dragStartRef.current = null;
    setIsDragging(false);

    // Apply Aero Snap if at screen edges
    if (e.clientY <= 6) {
      onSnapPreview('none');
      onToggleMaximize();
    } else if (e.clientX <= 8) {
      onSnapPreview('none');
      onUpdateBounds({
        x: 0,
        y: 0,
        width: Math.floor(window.innerWidth / 2),
        height: window.innerHeight - 44
      });
    } else if (e.clientX >= window.innerWidth - 8) {
      onSnapPreview('none');
      onUpdateBounds({
        x: Math.floor(window.innerWidth / 2),
        y: 0,
        width: Math.floor(window.innerWidth / 2),
        height: window.innerHeight - 44
      });
    } else {
      onSnapPreview('none');
    }
  }, [onSnapPreview, onToggleMaximize, onUpdateBounds]);

  // Resizing logic for all 8 edges/corners
  const handleResizePointerDown = (direction: string, e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || win.isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    resizeStartRef.current = {
      direction,
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: win.x,
      winY: win.y,
      width: win.width,
      height: win.height
    };
    onFocus();
  };

  const handleResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resizeStartRef.current) return;
    const { direction, mouseX, mouseY, winX, winY, width, height } = resizeStartRef.current;
    const dx = e.clientX - mouseX;
    const dy = e.clientY - mouseY;

    let newX = winX;
    let newY = winY;
    let newWidth = width;
    let newHeight = height;

    const minW = win.minWidth || 280;
    const minH = win.minHeight || 180;

    if (direction.includes('e')) {
      newWidth = Math.max(minW, width + dx);
    }
    if (direction.includes('s')) {
      newHeight = Math.max(minH, height + dy);
    }
    if (direction.includes('w')) {
      const prospectiveWidth = width - dx;
      if (prospectiveWidth >= minW) {
        newWidth = prospectiveWidth;
        newX = winX + dx;
      }
    }
    if (direction.includes('n')) {
      const prospectiveHeight = height - dy;
      if (prospectiveHeight >= minH) {
        newHeight = prospectiveHeight;
        newY = winY + dy;
      }
    }

    onUpdateBounds({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight
    });
  };

  const handleResizePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resizeStartRef.current) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    resizeStartRef.current = null;
  };

  if (win.isMinimized) return null;

  // Aero Tint Styling
  const tintColorMap: Record<string, string> = {
    blue: 'rgba(18, 70, 115, 0.65)',
    teal: 'rgba(13, 85, 95, 0.65)',
    slate: 'rgba(40, 55, 70, 0.70)',
    ruby: 'rgba(95, 20, 45, 0.65)',
    frost: 'rgba(120, 140, 160, 0.50)',
  };

  const currentTint = tintColorMap[theme.aeroTint] || tintColorMap.blue;

  return (
    <div
      ref={windowRef}
      onPointerDown={onFocus}
      style={{
        transform: `translate3d(${win.x}px, ${win.y}px, 0)`,
        width: `${win.width}px`,
        height: `${win.height}px`,
        zIndex: win.zIndex,
        transition: isDragging ? 'none' : 'box-shadow 0.15s, border-color 0.15s, opacity 0.15s'
      }}
      className={`absolute top-0 left-0 flex flex-col rounded-t-lg rounded-b-sm border overflow-hidden select-none will-change-transform ${
        isActive 
          ? 'aero-glass aero-glass-active border-[rgba(235,250,255,0.95)]' 
          : 'aero-glass border-[rgba(205,225,240,0.65)] opacity-95'
      }`}
    >
      {/* Dynamic Aero Glass Tint Overlay */}
      <div 
        style={{ 
          backgroundColor: currentTint,
          opacity: (theme.aeroOpacity || 65) / 100 
        }} 
        className="absolute inset-0 pointer-events-none z-0" 
      />

      {/* Title Bar */}
      <div
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={handleTitlePointerUp}
        onDoubleClick={onToggleMaximize}
        className={`relative z-10 h-8 flex items-center px-2 cursor-default select-none border-b border-[rgba(70,120,160,0.4)] ${
          isActive ? 'aero-titlebar' : 'aero-titlebar-inactive'
        }`}
      >
        {/* Specular Highlight Sheen */}
        <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/60 to-white/10 pointer-events-none" />

        {/* Window Icon & Title */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 mr-2 z-10 pointer-events-none">
          <span className="text-base shrink-0 filter drop-shadow-xs">{win.icon}</span>
          <span className={`text-[12px] font-semibold truncate ${isActive ? 'text-[#0d2740] drop-shadow-[0_1px_1px_#ffffff]' : 'text-slate-600'}`}>
            {win.title}
          </span>
        </div>

        {/* Window Controls (Minimize, Maximize, Close) */}
        <div className="flex items-center gap-[1px] ml-auto z-10 self-start">
          <button
            onClick={(e) => { e.stopPropagation(); sound.playMinimize(); onMinimize(); }}
            className="win-ctrl-btn"
            title="Minimize"
          >
            <span className="text-[12px] leading-none mb-1 font-bold">−</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); sound.playClick(); onToggleMaximize(); }}
            className="win-ctrl-btn"
            title={win.isMaximized ? "Restore Down" : "Maximize"}
          >
            <span className="text-[10px] leading-none font-bold">
              {win.isMaximized ? '❐' : '□'}
            </span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); sound.playClick(); onClose(); }}
            className="win-ctrl-btn win-ctrl-close"
            title="Close"
          >
            <span className="text-[12px] leading-none font-bold">✕</span>
          </button>
        </div>
      </div>

      {/* Window Content Pane */}
      <div className="relative z-10 flex-1 overflow-hidden bg-white shadow-inner flex flex-col">
        {children}
      </div>

      {/* Resizing Edge Handles (Only active when not maximized) */}
      {!win.isMaximized && (
        <>
          <div
            onPointerDown={(e) => handleResizePointerDown('n', e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute top-0 left-2 right-2 h-1.5 cursor-n-resize z-20"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown('s', e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute bottom-0 left-2 right-2 h-2 cursor-s-resize z-20"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown('w', e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute top-2 bottom-2 left-0 w-2 cursor-w-resize z-20"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown('e', e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute top-2 bottom-2 right-0 w-2 cursor-e-resize z-20"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown('nw', e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-20"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown('ne', e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-20"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown('sw', e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-20"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown('se', e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-20"
          />
        </>
      )}
    </div>
  );
});

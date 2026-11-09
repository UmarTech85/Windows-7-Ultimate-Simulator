import React, { useState, useRef, useCallback } from 'react';
import { AppId, DesktopShortcut, ThemeConfig } from '../../types';
import { sound } from '../../utils/audio';
import { 
  RefreshCw, 
  Plus, 
  Palette, 
  Monitor, 
  Trash2, 
  FileText, 
  FolderPlus,
  Cpu,
  Clock as ClockIcon
} from 'lucide-react';

interface DesktopProps {
  shortcuts: DesktopShortcut[];
  theme: ThemeConfig;
  onOpenApp: (appId: AppId) => void;
  onRefresh: () => void;
  onOpenPersonalize: () => void;
  onCreateShortcut: (type: 'folder' | 'file') => void;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
}

export const Desktop: React.FC<DesktopProps> = ({
  shortcuts,
  theme,
  onOpenApp,
  onRefresh,
  onOpenPersonalize,
  onCreateShortcut
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0 });
  
  // Marquee selection box state
  const [marquee, setMarquee] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const isMarqueeRef = useRef<boolean>(false);
  const marqueeStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Clock gadget state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Wallpaper backgrounds mapping
  const wallpaperStyles: Record<string, string> = {
    harmony: 'radial-gradient(ellipse at 50% 80%, rgba(195, 238, 255, 0.92) 0%, rgba(85, 170, 220, 0.8) 25%, transparent 60%), linear-gradient(135deg, #051d3e 0%, #0c5694 48%, #031835 100%)',
    aurora: 'radial-gradient(ellipse at 60% 40%, rgba(85, 255, 225, 0.6) 0%, rgba(12, 110, 160, 0.7) 40%, transparent 70%), linear-gradient(135deg, #021226 0%, #06375a 50%, #010c1c 100%)',
    architecture: 'linear-gradient(135deg, #1b354d 0%, #3e6d94 50%, #87b8dc 100%)',
    nature: 'linear-gradient(180deg, #5398d9 0%, #a2d2f7 50%, #3d8a43 51%, #2b6830 100%)',
    dark: 'radial-gradient(circle at 50% 30%, rgba(35, 75, 120, 0.5) 0%, transparent 70%), linear-gradient(180deg, #08111c 0%, #0f1c2d 50%, #050b12 100%)',
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Left click on desktop background initiates marquee selection
    if (e.button === 0 && (e.target as HTMLElement).id === 'desktop-surface') {
      setSelectedIds([]);
      setContextMenu({ visible: false, x: 0, y: 0 });
      isMarqueeRef.current = true;
      marqueeStartRef.current = { x: e.clientX, y: e.clientY };
      setMarquee({ x1: e.clientX, y1: e.clientY, x2: e.clientX, y2: e.clientY });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMarqueeRef.current) return;
    setMarquee({
      x1: Math.min(marqueeStartRef.current.x, e.clientX),
      y1: Math.min(marqueeStartRef.current.y, e.clientY),
      x2: Math.max(marqueeStartRef.current.x, e.clientX),
      y2: Math.max(marqueeStartRef.current.y, e.clientY)
    });
  };

  const handlePointerUp = () => {
    isMarqueeRef.current = false;
    setMarquee(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    sound.playClick();
    setContextMenu({
      visible: true,
      x: Math.min(window.innerWidth - 180, e.clientX),
      y: Math.min(window.innerHeight - 220, e.clientY)
    });
  };

  const handleIconClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    sound.playClick();
    if (e.ctrlKey || e.metaKey) {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
      setSelectedIds([id]);
    }
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleIconDoubleClick = (e: React.MouseEvent, appId: AppId) => {
    e.stopPropagation();
    onOpenApp(appId);
  };

  return (
    <div
      id="desktop-surface"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
      style={{ background: wallpaperStyles[theme.wallpaper] || wallpaperStyles.harmony }}
      className="absolute inset-0 bottom-11 overflow-hidden select-none"
    >
      {/* Windows 7 Aero Ambient Glow & Sheen */}
      <div className="absolute w-[75vw] h-[90vh] left-[12%] top-[-8%] rounded-full bg-radial from-white/30 to-transparent pointer-events-none filter blur-sm" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

      {/* Desktop Shortcuts Grid */}
      <div className="absolute top-3 left-3 grid grid-flow-col grid-rows-6 gap-y-2 gap-x-2 z-10">
        {shortcuts.map((sc) => {
          const isSelected = selectedIds.includes(sc.id);
          return (
            <div
              key={sc.id}
              onClick={(e) => handleIconClick(e, sc.id)}
              onDoubleClick={(e) => handleIconDoubleClick(e, sc.appId)}
              className={`w-[76px] min-h-[72px] p-1 rounded flex flex-col items-center text-center cursor-default transition-all border ${
                isSelected
                  ? 'bg-blue-400/25 border-white/60 shadow-[inset_0_0_12px_rgba(255,255,255,0.2)]'
                  : 'border-transparent hover:bg-sky-400/20 hover:border-white/40'
              }`}
            >
              <span className="text-3xl mb-1 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                {sc.icon}
              </span>
              <span className="text-[11px] text-white font-normal leading-tight drop-shadow-[0_1px_3px_#000] break-words line-clamp-2 px-1">
                {sc.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Windows 7 Desktop Gadgets (Clock & CPU Meter) */}
      <div className="absolute top-6 right-6 flex flex-col gap-5 pointer-events-auto z-10 hidden md:flex">
        {/* Analog / Digital Clock Gadget */}
        <div className="w-36 bg-gradient-to-b from-white/30 via-slate-800/40 to-slate-900/60 p-3 rounded-full border border-white/40 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center text-white text-center">
          <div className="w-24 h-24 rounded-full border-2 border-white/80 bg-gradient-to-br from-white/20 to-black/40 shadow-inner flex flex-col items-center justify-center relative">
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-200">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-[9px] text-slate-300 uppercase tracking-widest mt-0.5">
              {currentTime.toLocaleDateString([], { weekday: 'short' })}
            </span>
          </div>
        </div>

        {/* CPU & Memory Meter Gadget */}
        <div className="w-36 bg-gradient-to-b from-white/25 to-slate-900/70 p-3 rounded-xl border border-white/35 shadow-2xl backdrop-blur-md text-white text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-[11px] text-cyan-200 mb-2 border-b border-white/20 pb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>Resource Monitor</span>
          </div>
          <div className="space-y-2 text-[10px]">
            <div>
              <div className="flex justify-between mb-0.5 text-slate-200">
                <span>CPU Usage</span>
                <span className="font-mono">18%</span>
              </div>
              <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/20">
                <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full w-[18%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-0.5 text-slate-200">
                <span>RAM (Aero 60 FPS)</span>
                <span className="font-mono">2.4 GB</span>
              </div>
              <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/20">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full w-[32%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Drag Selection Box */}
      {marquee && (
        <div
          className="desktop-selection-box"
          style={{
            left: `${marquee.x1}px`,
            top: `${marquee.y1}px`,
            width: `${marquee.x2 - marquee.x1}px`,
            height: `${marquee.y2 - marquee.y1}px`
          }}
        />
      )}

      {/* Desktop Context Menu */}
      {contextMenu.visible && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="absolute w-44 bg-[#f8fbfe]/98 border border-[#85aecf] rounded-xs shadow-2xl py-1 z-[99999] backdrop-blur-md text-[#17334e] text-xs select-none"
        >
          <div 
            onClick={() => { sound.playClick(); onRefresh(); setContextMenu({ visible: false, x: 0, y: 0 }); }}
            className="px-3 py-1.5 hover:bg-[#d8ebfa] cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Refresh</span>
          </div>

          <div className="border-t border-[#d8e6f2] my-1" />

          <div 
            onClick={() => { sound.playClick(); onCreateShortcut('folder'); setContextMenu({ visible: false, x: 0, y: 0 }); }}
            className="px-3 py-1.5 hover:bg-[#d8ebfa] cursor-pointer flex items-center gap-2"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-500" />
            <span>New Folder</span>
          </div>

          <div 
            onClick={() => { sound.playClick(); onCreateShortcut('file'); setContextMenu({ visible: false, x: 0, y: 0 }); }}
            className="px-3 py-1.5 hover:bg-[#d8ebfa] cursor-pointer flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>New Text Document</span>
          </div>

          <div className="border-t border-[#d8e6f2] my-1" />

          <div 
            onClick={() => { sound.playClick(); onOpenPersonalize(); setContextMenu({ visible: false, x: 0, y: 0 }); }}
            className="px-3 py-1.5 hover:bg-[#d8ebfa] cursor-pointer flex items-center gap-2"
          >
            <Palette className="w-3.5 h-3.5 text-purple-600" />
            <span>Personalize</span>
          </div>
        </div>
      )}
    </div>
  );
};

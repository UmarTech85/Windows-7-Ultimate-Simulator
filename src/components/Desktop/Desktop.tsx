import React, { useState, useRef, useCallback } from 'react';
import { AppId, DesktopShortcut, ThemeConfig } from '../../types';
import { sound } from '../../utils/audio';
import type { LucideIcon } from 'lucide-react';
import {
  Bomb,
  Calculator,
  Cpu,
  FilePlus2,
  FileText,
  Folder,
  FolderPlus,
  Globe,
  Monitor,
  Paintbrush,
  Palette,
  Play,
  RefreshCw,
  Settings,
  SquareTerminal,
  Trash2,
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

const SHORTCUT_VISUALS: Partial<Record<AppId, { icon: LucideIcon; background: string; foreground: string }>> = {
  computer: { icon: Monitor, background: 'from-sky-100 via-cyan-100 to-blue-400', foreground: 'text-sky-800' },
  recycle: { icon: Trash2, background: 'from-slate-50 via-cyan-100 to-slate-300', foreground: 'text-slate-600' },
  browser: { icon: Globe, background: 'from-sky-100 via-blue-100 to-blue-500', foreground: 'text-blue-700' },
  notepad: { icon: FileText, background: 'from-white via-sky-50 to-blue-300', foreground: 'text-blue-700' },
  paint: { icon: Paintbrush, background: 'from-rose-100 via-amber-100 to-violet-300', foreground: 'text-rose-700' },
  media: { icon: Play, background: 'from-slate-50 via-sky-100 to-blue-500', foreground: 'text-blue-700' },
  calc: { icon: Calculator, background: 'from-emerald-50 via-teal-100 to-teal-400', foreground: 'text-teal-800' },
  minesweeper: { icon: Bomb, background: 'from-amber-50 via-orange-100 to-orange-400', foreground: 'text-orange-800' },
  cmd: { icon: SquareTerminal, background: 'from-slate-100 via-slate-200 to-slate-500', foreground: 'text-slate-800' },
  control: { icon: Settings, background: 'from-slate-50 via-blue-100 to-slate-400', foreground: 'text-slate-700' },
};

const ShortcutGlyph: React.FC<{ shortcut: DesktopShortcut }> = ({ shortcut }) => {
  const visual = shortcut.icon === '📁'
    ? { icon: Folder, background: 'from-amber-50 via-amber-100 to-amber-400', foreground: 'text-amber-700' }
    : shortcut.icon === '📄'
      ? { icon: FilePlus2, background: 'from-white via-sky-50 to-blue-300', foreground: 'text-blue-700' }
      : SHORTCUT_VISUALS[shortcut.appId] ?? { icon: FileText, background: 'from-white via-sky-50 to-blue-300', foreground: 'text-blue-700' };
  const Icon = visual.icon;

  return (
    <span aria-hidden="true" className={`relative mb-1 flex size-10 items-center justify-center overflow-hidden rounded-[0.8rem] border border-white/80 bg-gradient-to-br shadow-[0_3px_8px_rgba(0,15,35,0.38),inset_0_1px_0_rgba(255,255,255,0.95)] ${visual.background}`}>
      <span className="absolute inset-x-0 top-0 h-1/2 rounded-t-[0.8rem] bg-gradient-to-b from-white/75 to-transparent" />
      <Icon className={`relative size-[1.35rem] drop-shadow-sm ${visual.foreground}`} strokeWidth={1.8} />
    </span>
  );
};

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
    harmony: 'linear-gradient(180deg, rgba(3, 19, 43, 0.12), rgba(3, 19, 43, 0.28)), url("/windows7-harmony-wallpaper.png")',
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
      style={{
        background: wallpaperStyles[theme.wallpaper] || wallpaperStyles.harmony,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
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
            <button
              type="button"
              key={sc.id}
              onClick={(e) => handleIconClick(e, sc.id)}
              onDoubleClick={(e) => handleIconDoubleClick(e, sc.appId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenApp(sc.appId);
                }
              }}
              aria-label={`${sc.name} desktop shortcut`}
              aria-pressed={isSelected}
              className={`group flex min-h-[86px] w-[90px] flex-col items-center justify-center rounded-xl border bg-transparent px-1 py-1.5 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 ${
                isSelected
                  ? 'border-white/75 bg-sky-300/25 shadow-[inset_0_0_14px_rgba(255,255,255,0.24),0_4px_12px_rgba(0,20,50,0.15)]'
                  : 'border-transparent hover:border-white/40 hover:bg-sky-300/15 hover:shadow-[0_4px_12px_rgba(0,20,50,0.18)]'
              }`}
            >
              <ShortcutGlyph shortcut={sc} />
              <span className="max-w-full break-words px-0.5 text-[11px] font-medium leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95)] line-clamp-2">
                {sc.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Windows 7 Desktop Gadgets (Clock & CPU Meter) */}
      <div className="pointer-events-auto absolute right-3 top-4 z-10 flex w-[132px] flex-col gap-3 text-white sm:right-6 sm:top-6 sm:w-36">
        <section aria-label="Desktop clock" className="aero-gadget rounded-2xl p-3 text-center">
          <div className="mx-auto flex size-[76px] flex-col items-center justify-center rounded-full border border-white/60 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.38),rgba(10,35,65,0.72))] shadow-[inset_0_1px_5px_rgba(255,255,255,0.3),0_3px_10px_rgba(0,0,0,0.2)] sm:size-[84px]">
            <time className="font-mono text-[15px] font-semibold tracking-tight text-white [text-shadow:0_1px_5px_rgba(0,0,0,0.45)] sm:text-base">
              {currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </time>
            <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-cyan-100/90">
              {currentTime.toLocaleDateString([], { weekday: 'short' })}
            </span>
          </div>
          <p className="mt-2 text-[10px] font-medium tracking-wide text-white/90">
            {currentTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </p>
        </section>

        <section aria-label="System resource monitor" className="aero-gadget rounded-xl p-2.5 sm:p-3">
          <div className="mb-2 flex items-center gap-1.5 border-b border-white/20 pb-1.5 text-[10px] font-semibold text-cyan-100 sm:text-[11px]">
            <Cpu aria-hidden="true" className="size-3.5" />
            <span>Resource Monitor</span>
          </div>
          <div className="space-y-2.5 text-[9px] sm:text-[10px]">
            <div>
              <div className="mb-1 flex justify-between gap-1 text-white/90">
                <span>CPU usage</span>
                <span className="font-mono">18%</span>
              </div>
              <div role="progressbar" aria-label="CPU usage" aria-valuemin={0} aria-valuemax={100} aria-valuenow={18} className="h-1.5 overflow-hidden rounded-full border border-white/20 bg-black/35">
                <div className="h-full w-[18%] rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between gap-1 text-white/90">
                <span>Memory</span>
                <span className="font-mono">2.4 GB</span>
              </div>
              <div role="progressbar" aria-label="Memory usage" aria-valuemin={0} aria-valuemax={100} aria-valuenow={32} className="h-1.5 overflow-hidden rounded-full border border-white/20 bg-black/35">
                <div className="h-full w-[32%] rounded-full bg-gradient-to-r from-cyan-300 to-blue-400" />
              </div>
            </div>
          </div>
        </section>
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

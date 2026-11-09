import React, { useState, useMemo } from 'react';
import { AppId } from '../../types';
import { sound } from '../../utils/audio';
import { 
  Search, 
  ChevronRight, 
  Power, 
  Folder, 
  Image as ImageIcon, 
  Music, 
  Gamepad2, 
  Computer, 
  Settings, 
  HelpCircle, 
  Terminal,
  Lock,
  LogOut,
  RotateCcw
} from 'lucide-react';

interface StartMenuProps {
  isOpen: boolean;
  onOpenApp: (appId: AppId) => void;
  onClose: () => void;
  onShutdown: () => void;
  onRestart: () => void;
  onLock: () => void;
}

interface AppEntry {
  id: AppId;
  name: string;
  icon: string;
  category?: string;
  subtitle?: string;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  onOpenApp,
  onClose,
  onShutdown,
  onRestart,
  onLock
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showShutdownFlyout, setShowShutdownFlyout] = useState<boolean>(false);
  const [showAllPrograms, setShowAllPrograms] = useState<boolean>(false);

  const apps: AppEntry[] = [
    { id: 'browser', name: 'Internet Explorer', icon: '🌐', subtitle: 'Browse web & project repo' },
    { id: 'computer', name: 'Computer', icon: '🖥️', subtitle: 'Files, Drives and Libraries' },
    { id: 'notepad', name: 'Notepad', icon: '📝', subtitle: 'Lightweight text editor' },
    { id: 'paint', name: 'Paint', icon: '🎨', subtitle: 'Draw and export graphics' },
    { id: 'media', name: 'Windows Media Player', icon: '▶️', subtitle: 'Play music and visualizer' },
    { id: 'calc', name: 'Calculator', icon: '🧮', subtitle: 'Basic and arithmetic calculator' },
    { id: 'minesweeper', name: 'Minesweeper', icon: '💣', subtitle: 'Classic puzzle game' },
    { id: 'cmd', name: 'Command Prompt', icon: '⌨️', subtitle: 'Windows command console' },
    { id: 'control', name: 'Control Panel', icon: '⚙️', subtitle: 'System configuration' },
    { id: 'personalize', name: 'Personalization', icon: '🎨', subtitle: 'Themes, Wallpaper, Glass Tint' },
    { id: 'run', name: 'Run...', icon: '⌨️', subtitle: 'Run program command' },
    { id: 'help', name: 'Help and Support', icon: '❔', subtitle: 'Windows 7 guide' },
  ];

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return apps.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return apps.filter(a => a.name.toLowerCase().includes(q) || (a.subtitle && a.subtitle.toLowerCase().includes(q)));
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleLaunch = (appId: AppId) => {
    sound.playClick();
    onOpenApp(appId);
    onClose();
  };

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-11 left-1.5 w-[420px] max-w-[94vw] h-[520px] max-h-[85vh] bg-gradient-to-br from-[#f2f8fc]/95 via-[#e2eef7]/95 to-[#c9def2]/95 border border-[#85b2d6] rounded-t-lg shadow-2xl backdrop-blur-xl flex flex-col z-[99995] overflow-hidden text-[#17324c] select-none"
    >
      {/* Top Header: User Profile Lockup */}
      <div className="h-16 bg-gradient-to-r from-[#4d97d0] via-[#246fae] to-[#0c4b82] border-b border-[#70aedb] p-3 flex items-center justify-between text-white shadow-sm">
        <div className="flex items-center gap-3">
          {/* User Avatar Tile */}
          <div className="w-11 h-11 rounded-md border-2 border-white/80 bg-gradient-to-b from-white to-[#8ec4eb] flex items-center justify-center text-2xl shadow-md">
            👤
          </div>
          <div>
            <div className="font-bold text-sm leading-tight drop-shadow-xs">Administrator</div>
            <div className="text-[11px] text-cyan-100">Windows 7 Ultimate</div>
          </div>
        </div>

        {/* Windows Emblem watermark */}
        <div className="grid grid-cols-2 gap-0.5 w-6 h-6 opacity-40">
          <div className="bg-[#e94b35] rounded-xs" />
          <div className="bg-[#59b83b] rounded-xs" />
          <div className="bg-[#1786d8] rounded-xs" />
          <div className="bg-[#f2bf26] rounded-xs" />
        </div>
      </div>

      {/* Main Body: 2 Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Pinned / Filtered Apps & Search */}
        <div className="w-[58%] bg-white/80 p-2 flex flex-col justify-between border-r border-[#bed7ec] overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                onClick={() => handleLaunch(app.id)}
                className="flex items-center gap-2.5 p-2 rounded cursor-pointer transition-all hover:bg-gradient-to-r hover:from-[#d5edfc] hover:to-[#bfe0f7] hover:border-[#86c0eb] border border-transparent group"
              >
                <span className="text-xl shrink-0 filter drop-shadow-xs group-hover:scale-110 transition-transform">{app.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#143c62] truncate">{app.name}</div>
                  {app.subtitle && (
                    <div className="text-[10px] text-slate-500 truncate">{app.subtitle}</div>
                  )}
                </div>
              </div>
            ))}

            {filteredApps.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 italic">
                No programs match "{searchQuery}"
              </div>
            )}
          </div>

          {/* All Programs Button */}
          <div 
            onClick={() => {
              sound.playClick();
              setShowAllPrograms(!showAllPrograms);
            }}
            className="border-t border-[#dce9f4] pt-2 pb-1 flex items-center justify-between text-xs text-[#134977] font-semibold hover:bg-[#ebf4fa] p-1.5 rounded cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-blue-600">▶</span>
              <span>All Programs</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Instant Search Bar */}
          <div className="mt-1 pt-1 border-t border-[#d8e6f2]">
            <div className="flex items-center h-7 border border-[#9bb7cf] bg-white rounded-xs px-2 shadow-inner">
              <input
                type="text"
                placeholder="Search programs and files"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs text-slate-800 outline-none bg-transparent placeholder:text-slate-400"
                autoFocus
              />
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
          </div>
        </div>

        {/* Right Column: System Links & Folders */}
        <div className="flex-1 bg-gradient-to-b from-[#d9ebf7]/70 to-[#bddcf4]/70 p-2 flex flex-col justify-between text-xs space-y-1">
          <div className="space-y-0.5">
            <div 
              onClick={() => handleLaunch('computer')}
              className="flex items-center gap-2 p-1.5 rounded hover:bg-[#c1e2f8] cursor-pointer text-[#123e66] font-medium"
            >
              <Folder className="w-4 h-4 text-[#ebb838]" /> Documents
            </div>
            <div 
              onClick={() => handleLaunch('computer')}
              className="flex items-center gap-2 p-1.5 rounded hover:bg-[#c1e2f8] cursor-pointer text-[#123e66] font-medium"
            >
              <ImageIcon className="w-4 h-4 text-[#2a87cd]" /> Pictures
            </div>
            <div 
              onClick={() => handleLaunch('computer')}
              className="flex items-center gap-2 p-1.5 rounded hover:bg-[#c1e2f8] cursor-pointer text-[#123e66] font-medium"
            >
              <Music className="w-4 h-4 text-[#b0487f]" /> Music
            </div>
            <div 
              onClick={() => handleLaunch('minesweeper')}
              className="flex items-center gap-2 p-1.5 rounded hover:bg-[#c1e2f8] cursor-pointer text-[#123e66] font-medium"
            >
              <Gamepad2 className="w-4 h-4 text-[#3ba35f]" /> Games
            </div>

            <div className="border-t border-[#b8d6ec] my-1" />

            <div 
              onClick={() => handleLaunch('computer')}
              className="flex items-center gap-2 p-1.5 rounded hover:bg-[#c1e2f8] cursor-pointer text-[#123e66] font-medium"
            >
              <Computer className="w-4 h-4 text-[#1a5b94]" /> Computer
            </div>
            <div 
              onClick={() => handleLaunch('control')}
              className="flex items-center gap-2 p-1.5 rounded hover:bg-[#c1e2f8] cursor-pointer text-[#123e66] font-medium"
            >
              <Settings className="w-4 h-4 text-[#516b83]" /> Control Panel
            </div>
            <div 
              onClick={() => handleLaunch('cmd')}
              className="flex items-center gap-2 p-1.5 rounded hover:bg-[#c1e2f8] cursor-pointer text-[#123e66] font-medium"
            >
              <Terminal className="w-4 h-4 text-[#1b4369]" /> Command Prompt
            </div>
            <div 
              onClick={() => handleLaunch('help')}
              className="flex items-center gap-2 p-1.5 rounded hover:bg-[#c1e2f8] cursor-pointer text-[#123e66]"
            >
              <HelpCircle className="w-4 h-4 text-[#0284c7]" /> Help and Support
            </div>
            <div 
              onClick={() => handleLaunch('run')}
              className="flex items-center gap-2 p-1.5 rounded hover:bg-[#c1e2f8] cursor-pointer text-[#123e66]"
            >
              <span>⌨️</span> Run...
            </div>
          </div>

          {/* Bottom Right: Power & Shut down Split Button */}
          <div className="relative pt-2 border-t border-[#b6d3eb] flex justify-end">
            <div className="inline-flex rounded-sm shadow-xs border border-[#164e83] overflow-hidden">
              <button
                onClick={() => {
                  sound.playClick();
                  onShutdown();
                }}
                className="bg-gradient-to-b from-[#4d97d0] to-[#125591] hover:brightness-110 text-white px-3 py-1 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Power className="w-3.5 h-3.5 text-cyan-200" /> Shut down
              </button>
              <button
                onClick={() => setShowShutdownFlyout(!showShutdownFlyout)}
                className="bg-gradient-to-b from-[#458dc6] to-[#0d4a82] hover:brightness-110 text-white px-1.5 py-1 text-xs border-l border-[#246fae] cursor-pointer"
              >
                ▾
              </button>
            </div>

            {/* Shutdown Submenu Flyout */}
            {showShutdownFlyout && (
              <div className="absolute bottom-9 right-0 w-36 bg-white border border-[#8faec7] rounded shadow-xl py-1 z-50 text-xs">
                <div 
                  onClick={() => { sound.playClick(); onLock(); setShowShutdownFlyout(false); }}
                  className="px-3 py-1.5 hover:bg-[#d8ebfa] cursor-pointer flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" /> Switch user / Lock
                </div>
                <div 
                  onClick={() => { sound.playClick(); onLock(); setShowShutdownFlyout(false); }}
                  className="px-3 py-1.5 hover:bg-[#d8ebfa] cursor-pointer flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" /> Log off
                </div>
                <div 
                  onClick={() => { sound.playClick(); onRestart(); setShowShutdownFlyout(false); }}
                  className="px-3 py-1.5 hover:bg-[#d8ebfa] cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Restart
                </div>
                <div className="border-t border-slate-200 my-1" />
                <div 
                  onClick={() => { sound.playClick(); onShutdown(); setShowShutdownFlyout(false); }}
                  className="px-3 py-1.5 hover:bg-red-50 text-red-700 cursor-pointer flex items-center gap-2 font-medium"
                >
                  <Power className="w-3.5 h-3.5 text-red-600" /> Shut down
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

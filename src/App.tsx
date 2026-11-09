/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  AppId, 
  WindowState, 
  SnapPosition, 
  ThemeConfig, 
  DesktopShortcut 
} from './types';
import { sound } from './utils/audio';

// Components
import { AeroWindow } from './components/AeroGlass/AeroWindow';
import { Taskbar } from './components/Taskbar/Taskbar';
import { StartMenu } from './components/StartMenu/StartMenu';
import { Desktop } from './components/Desktop/Desktop';
import { LoginScreen } from './components/LoginScreen';

// Core Applications
import { ComputerApp } from './components/apps/ComputerApp';
import { NotepadApp } from './components/apps/NotepadApp';
import { PaintApp } from './components/apps/PaintApp';
import { CalculatorApp } from './components/apps/CalculatorApp';
import { InternetExplorerApp } from './components/apps/InternetExplorerApp';
import { MediaPlayerApp } from './components/apps/MediaPlayerApp';
import { MinesweeperApp } from './components/apps/MinesweeperApp';
import { CommandPromptApp } from './components/apps/CommandPromptApp';
import { ControlPanelApp } from './components/apps/ControlPanelApp';
import { PersonalizationApp } from './components/apps/PersonalizationApp';
import { RunDialog } from './components/apps/RunDialog';

const INITIAL_SHORTCUTS: DesktopShortcut[] = [
  { id: 'sc-computer', appId: 'computer', name: 'Computer', icon: '🖥️' },
  { id: 'sc-recycle', appId: 'recycle', name: 'Recycle Bin', icon: '🗑️' },
  { id: 'sc-browser', appId: 'browser', name: 'Internet Explorer', icon: '🌐' },
  { id: 'sc-notepad', appId: 'notepad', name: 'Notepad', icon: '📝' },
  { id: 'sc-paint', appId: 'paint', name: 'Paint', icon: '🎨' },
  { id: 'sc-media', appId: 'media', name: 'Windows Media Player', icon: '▶️' },
  { id: 'sc-calc', appId: 'calc', name: 'Calculator', icon: '🧮' },
  { id: 'sc-minesweeper', appId: 'minesweeper', name: 'Minesweeper', icon: '💣' },
  { id: 'sc-cmd', appId: 'cmd', name: 'Command Prompt', icon: '⌨️' },
  { id: 'sc-control', appId: 'control', name: 'Control Panel', icon: '⚙️' },
];

const APP_METADATA: Record<AppId, { title: string; icon: string; defaultWidth: number; defaultHeight: number }> = {
  computer: { title: 'Computer', icon: '🖥️', defaultWidth: 720, defaultHeight: 480 },
  recycle: { title: 'Recycle Bin', icon: '🗑️', defaultWidth: 620, defaultHeight: 420 },
  browser: { title: 'Internet Explorer', icon: '🌐', defaultWidth: 840, defaultHeight: 560 },
  notepad: { title: 'Untitled - Notepad', icon: '📝', defaultWidth: 640, defaultHeight: 440 },
  paint: { title: 'Paint', icon: '🎨', defaultWidth: 820, defaultHeight: 540 },
  media: { title: 'Windows Media Player', icon: '▶️', defaultWidth: 680, defaultHeight: 460 },
  calc: { title: 'Calculator', icon: '🧮', defaultWidth: 320, defaultHeight: 420 },
  minesweeper: { title: 'Minesweeper', icon: '💣', defaultWidth: 340, defaultHeight: 460 },
  cmd: { title: 'Command Prompt', icon: '⌨️', defaultWidth: 680, defaultHeight: 420 },
  control: { title: 'Control Panel', icon: '⚙️', defaultWidth: 760, defaultHeight: 500 },
  personalize: { title: 'Personalization', icon: '🎨', defaultWidth: 700, defaultHeight: 490 },
  run: { title: 'Run', icon: '⌨️', defaultWidth: 420, defaultHeight: 220 },
  help: { title: 'Help and Support', icon: '❔', defaultWidth: 620, defaultHeight: 440 },
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState<boolean>(false);
  const [snapPreview, setSnapPreview] = useState<SnapPosition>('none');
  const [isPeekingDesktop, setIsPeekingDesktop] = useState<boolean>(false);
  const [highestZ, setHighestZ] = useState<number>(100);

  const [theme, setTheme] = useState<ThemeConfig>({
    wallpaper: 'harmony',
    aeroTint: 'blue',
    aeroOpacity: 65,
    soundEnabled: true,
  });

  const [shortcuts, setShortcuts] = useState<DesktopShortcut[]>(INITIAL_SHORTCUTS);

  // Focus Window
  const focusWindow = useCallback((id: string) => {
    setHighestZ(prev => {
      const nextZ = prev + 1;
      setWindows(curr => curr.map(w => w.id === id ? { ...w, zIndex: nextZ, isMinimized: false } : w));
      return nextZ;
    });
    setActiveWindowId(id);
    setIsStartMenuOpen(false);
  }, []);

  // Open App Window
  const openApp = useCallback((appId: AppId) => {
    sound.playClick();
    setIsStartMenuOpen(false);

    // If already open and single instance app like calc or personalize, focus it
    const existing = windows.find(w => w.appId === appId);
    if (existing && (appId === 'calc' || appId === 'personalize' || appId === 'run' || appId === 'control')) {
      focusWindow(existing.id);
      return;
    }

    const meta = APP_METADATA[appId] || { title: appId, icon: '🪟', defaultWidth: 600, defaultHeight: 400 };
    const id = `win-${appId}-${Date.now()}`;

    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    const width = Math.min(meta.defaultWidth, screenWidth * 0.92);
    const height = Math.min(meta.defaultHeight, screenHeight * 0.85);

    // Stagger window positions
    const offsetIndex = windows.length % 6;
    const defaultX = Math.max(20, 80 + offsetIndex * 32);
    const defaultY = Math.max(20, 45 + offsetIndex * 28);

    setHighestZ(prev => {
      const nextZ = prev + 1;
      const newWin: WindowState = {
        id,
        appId,
        title: meta.title,
        icon: meta.icon,
        x: defaultX,
        y: defaultY,
        width,
        height,
        isMinimized: false,
        isMaximized: false,
        zIndex: nextZ,
      };

      setWindows(curr => [...curr, newWin]);
      return nextZ;
    });

    setActiveWindowId(id);
  }, [windows, focusWindow]);

  // Close Window
  const closeWindow = useCallback((id: string) => {
    setWindows(curr => curr.filter(w => w.id !== id));
    setActiveWindowId(curr => (curr === id ? null : curr));
  }, []);

  // Minimize Window
  const minimizeWindow = useCallback((id: string) => {
    setWindows(curr => curr.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    setActiveWindowId(curr => (curr === id ? null : curr));
  }, []);

  // Toggle Maximize Window
  const toggleMaximize = useCallback((id: string) => {
    setWindows(curr => curr.map(w => {
      if (w.id !== id) return w;
      if (w.isMaximized) {
        // Restore
        const prev = w.prevBounds || { x: 80, y: 50, width: 680, height: 460 };
        return {
          ...w,
          isMaximized: false,
          x: prev.x,
          y: prev.y,
          width: prev.width,
          height: prev.height,
        };
      } else {
        // Maximize to full desktop area (leaving 44px for taskbar)
        const screenW = window.innerWidth;
        const screenH = window.innerHeight - 44;
        return {
          ...w,
          isMaximized: true,
          prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
          x: 0,
          y: 0,
          width: screenW,
          height: screenH,
        };
      }
    }));
    focusWindow(id);
  }, [focusWindow]);

  // Update Window Bounds (Drag / Resize)
  const updateWindowBounds = useCallback((id: string, bounds: { x: number; y: number; width: number; height: number }) => {
    setWindows(curr => curr.map(w => w.id === id ? { ...w, ...bounds, isMaximized: false } : w));
  }, []);

  // Show Desktop (Minimize all or restore previous)
  const handleShowDesktop = useCallback(() => {
    const hasUnminimized = windows.some(w => !w.isMinimized);
    if (hasUnminimized) {
      sound.playMinimize();
      setWindows(curr => curr.map(w => ({ ...w, isMinimized: true })));
      setActiveWindowId(null);
    } else {
      sound.playClick();
      setWindows(curr => curr.map(w => ({ ...w, isMinimized: false })));
      if (windows.length > 0) {
        focusWindow(windows[windows.length - 1].id);
      }
    }
  }, [windows, focusWindow]);

  // Handle Run Command
  const handleRunCommand = (cmd: string) => {
    const q = cmd.toLowerCase().trim();
    if (q === 'notepad' || q === 'notepad.exe') openApp('notepad');
    else if (q === 'calc' || q === 'calc.exe') openApp('calc');
    else if (q === 'paint' || q === 'mspaint' || q === 'pbrush') openApp('paint');
    else if (q === 'cmd' || q === 'cmd.exe') openApp('cmd');
    else if (q === 'explorer' || q === 'computer') openApp('computer');
    else if (q === 'control') openApp('control');
    else if (q === 'wmplayer' || q === 'media') openApp('media');
    else if (q === 'winmine' || q === 'minesweeper') openApp('minesweeper');
    else if (q === 'personalize') openApp('personalize');
    else if (q.startsWith('http://') || q.startsWith('https://')) openApp('browser');
    else {
      sound.playError();
      alert(`Windows cannot find '${cmd}'. Make sure you typed the name correctly, and then try again.`);
    }
  };

  // Create new folder or file shortcut on desktop
  const handleCreateShortcut = (type: 'folder' | 'file') => {
    const newId = `sc-custom-${Date.now()}`;
    const newSc: DesktopShortcut = {
      id: newId,
      appId: type === 'folder' ? 'computer' : 'notepad',
      name: type === 'folder' ? `New Folder (${shortcuts.length})` : `New Document (${shortcuts.length}).txt`,
      icon: type === 'folder' ? '📁' : '📄',
      custom: true
    };
    setShortcuts(prev => [...prev, newSc]);
  };

  // Keyboard shortcut: Win key opens start menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || (e.ctrlKey && e.key === 'Escape')) {
        setIsStartMenuOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Render App Content inside window
  const renderAppContent = (win: WindowState) => {
    switch (win.appId) {
      case 'computer':
        return <ComputerApp />;
      case 'notepad':
        return <NotepadApp onClose={() => closeWindow(win.id)} />;
      case 'paint':
        return <PaintApp />;
      case 'calc':
        return <CalculatorApp />;
      case 'browser':
        return <InternetExplorerApp />;
      case 'media':
        return <MediaPlayerApp />;
      case 'minesweeper':
        return <MinesweeperApp />;
      case 'cmd':
        return <CommandPromptApp onLaunchApp={openApp} onClose={() => closeWindow(win.id)} />;
      case 'control':
        return <ControlPanelApp onOpenApp={openApp} />;
      case 'personalize':
        return <PersonalizationApp theme={theme} setTheme={setTheme} />;
      case 'run':
        return <RunDialog onRun={handleRunCommand} onClose={() => closeWindow(win.id)} />;
      case 'recycle':
        return (
          <div className="flex flex-col h-full bg-white p-8 items-center justify-center text-center select-none text-slate-600">
            <span className="text-6xl mb-3 filter drop-shadow-md">🗑️</span>
            <h2 className="text-base font-semibold text-slate-800">The Recycle Bin is empty</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Items deleted from the simulated computer will appear here. No real system files are ever touched.
            </p>
          </div>
        );
      case 'help':
        return (
          <div className="flex flex-col h-full bg-white select-none text-[#1b324b] p-6 overflow-y-auto">
            <div className="border-b border-slate-200 pb-3 mb-4 flex items-center gap-3">
              <span className="text-3xl">❔</span>
              <div>
                <h1 className="text-xl font-bold text-[#144977]">Windows 7 Ultimate Help & Support</h1>
                <p className="text-xs text-slate-500">System Architecture & Refactored Performance Features</p>
              </div>
            </div>
            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <div className="p-3 bg-[#f2f8fd] border border-[#bedbf2] rounded">
                <h3 className="font-bold text-[#11406a] mb-1">⚡ 60 FPS Refactored GUI Architecture</h3>
                <p>All core windows and controls have been refactored with pointer-capture hardware accelerated math. No DOM thrashing or stutter during multi-window dragging.</p>
              </div>
              <div className="p-3 bg-[#f2f8fd] border border-[#bedbf2] rounded">
                <h3 className="font-bold text-[#11406a] mb-1">🪟 Aero Snap & Aero Peek</h3>
                <p>Drag any window to the top edge to snap full-screen, or to the left/right screen edges to dock it into a clean 50% split. Hover over taskbar tabs for live glass previews, and hover over the Show Desktop bar on the far right to peek through.</p>
              </div>
              <div className="p-3 bg-[#f2f8fd] border border-[#bedbf2] rounded">
                <h3 className="font-bold text-[#11406a] mb-1">🔊 Built-in Web Audio Chimes</h3>
                <p>No audio files to wait for—the iconic startup chime, navigation clicks, error sounds, and notify notes are synthesized instantaneously using the Web Audio API.</p>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="p-4 text-xs">Application ready</div>;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0c2b4c] font-sans">
      {/* Windows 7 Welcome / Logon Screen */}
      {!isLoggedIn && (
        <LoginScreen 
          onLogin={() => setIsLoggedIn(true)} 
          onShutdown={() => alert('Windows 7 Simulator Shut Down. Click Start Windows to begin.')} 
        />
      )}

      {/* Main Desktop Surface */}
      <Desktop
        shortcuts={shortcuts}
        theme={theme}
        onOpenApp={openApp}
        onRefresh={() => {
          sound.playNotify();
          setShortcuts([...shortcuts]);
        }}
        onOpenPersonalize={() => openApp('personalize')}
        onCreateShortcut={handleCreateShortcut}
      />

      {/* Aero Snap Dock Preview Guide Rectangle */}
      {snapPreview !== 'none' && (
        <div
          className="aero-snap-preview"
          style={{
            top: snapPreview === 'top' ? 0 : 0,
            left: snapPreview === 'right' ? '50%' : 0,
            width: snapPreview === 'top' ? '100%' : '50%',
            height: 'calc(100vh - 44px)'
          }}
        />
      )}

      {/* Windows Layer */}
      <div 
        style={{ opacity: isPeekingDesktop ? 0.15 : 1, transition: 'opacity 0.12s' }}
        className="pointer-events-auto"
      >
        {windows.map((win) => (
          <AeroWindow
            key={win.id}
            window={win}
            isActive={activeWindowId === win.id}
            theme={theme}
            onFocus={() => focusWindow(win.id)}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
            onToggleMaximize={() => toggleMaximize(win.id)}
            onUpdateBounds={(bounds) => updateWindowBounds(win.id, bounds)}
            onSnapPreview={setSnapPreview}
          >
            {renderAppContent(win)}
          </AeroWindow>
        ))}
      </div>

      {/* Start Menu */}
      <StartMenu
        isOpen={isStartMenuOpen}
        onOpenApp={openApp}
        onClose={() => setIsStartMenuOpen(false)}
        onShutdown={() => {
          setIsStartMenuOpen(false);
          setIsLoggedIn(false);
        }}
        onRestart={() => {
          setIsStartMenuOpen(false);
          setIsLoggedIn(false);
          setTimeout(() => setIsLoggedIn(true), 1200);
        }}
        onLock={() => {
          setIsStartMenuOpen(false);
          setIsLoggedIn(false);
        }}
      />

      {/* Taskbar & System Tray */}
      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        isStartMenuOpen={isStartMenuOpen}
        soundEnabled={theme.soundEnabled}
        onToggleStartMenu={() => setIsStartMenuOpen(prev => !prev)}
        onWindowClick={(id) => {
          const win = windows.find(w => w.id === id);
          if (!win) return;
          if (win.isMinimized) {
            focusWindow(id);
          } else if (activeWindowId === id) {
            minimizeWindow(id);
          } else {
            focusWindow(id);
          }
        }}
        onCloseWindow={closeWindow}
        onToggleSound={() => {
          const next = !theme.soundEnabled;
          sound.setEnabled(next);
          setTheme(prev => ({ ...prev, soundEnabled: next }));
        }}
        onShowDesktop={handleShowDesktop}
        onPeekDesktop={setIsPeekingDesktop}
      />
    </div>
  );
}

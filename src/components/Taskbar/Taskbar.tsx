import React, { useState, useEffect } from 'react';
import { WindowState } from '../../types';
import { sound } from '../../utils/audio';
import { 
  Wifi, 
  Volume2, 
  VolumeX, 
  Flag, 
  Calendar as CalendarIcon, 
  ChevronUp,
  X
} from 'lucide-react';

interface TaskbarProps {
  windows: WindowState[];
  activeWindowId: string | null;
  isStartMenuOpen: boolean;
  soundEnabled: boolean;
  onToggleStartMenu: () => void;
  onWindowClick: (id: string) => void;
  onCloseWindow: (id: string) => void;
  onToggleSound: () => void;
  onShowDesktop: () => void;
  onPeekDesktop: (peek: boolean) => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  isStartMenuOpen,
  soundEnabled,
  onToggleStartMenu,
  onWindowClick,
  onCloseWindow,
  onToggleSound,
  onShowDesktop,
  onPeekDesktop
}) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [showVolumeFlyout, setShowVolumeFlyout] = useState<boolean>(false);
  const [showCalendarFlyout, setShowCalendarFlyout] = useState<boolean>(false);
  const [hoveredWindowId, setHoveredWindowId] = useState<string | null>(null);

  // System Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
      setDate(now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-11 aero-taskbar flex items-center justify-between px-1.5 z-[99990] select-none text-white">
      {/* Left: Start Orb + Open Application Tabs */}
      <div className="flex items-center gap-1.5 h-full flex-1 overflow-hidden pr-2">
        {/* Windows 7 Start Orb */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleStartMenu();
          }}
          className={`relative w-11 h-11 -mt-1 rounded-full start-orb flex items-center justify-center shrink-0 cursor-pointer ${
            isStartMenuOpen ? 'ring-2 ring-cyan-300 scale-105 brightness-125' : ''
          }`}
          title="Start"
          aria-label="Start menu"
          aria-expanded={isStartMenuOpen}
        >
          {/* Windows 7 Quad-Color Flag Logo */}
          <div className="grid grid-cols-2 gap-0.5 w-4 h-4 transform rotate-12 drop-shadow-md">
            <div className="bg-[#e94b35] rounded-xs shadow-xs" />
            <div className="bg-[#59b83b] rounded-xs shadow-xs" />
            <div className="bg-[#1786d8] rounded-xs shadow-xs" />
            <div className="bg-[#f2bf26] rounded-xs shadow-xs" />
          </div>
        </button>

        {/* Taskbar Application Items */}
        <div className="flex items-center gap-1 h-full flex-1 overflow-x-auto py-1">
          {windows.map((win) => {
            const isActive = activeWindowId === win.id && !win.isMinimized;
            const isHovered = hoveredWindowId === win.id;

            return (
              <div
                key={win.id}
                onMouseEnter={() => setHoveredWindowId(win.id)}
                onMouseLeave={() => setHoveredWindowId(null)}
                className="relative h-full flex items-center"
              >
                <button
                  onClick={() => {
                    sound.playClick();
                    onWindowClick(win.id);
                  }}
                  aria-label={`${win.title}${win.isMinimized ? ', minimized' : ''}`}
                  aria-pressed={isActive}
                  className={`h-9 min-w-12 max-w-44 px-2.5 rounded-sm flex items-center gap-2 border text-xs cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 ${
                    isActive
                      ? 'bg-gradient-to-b from-white/40 via-cyan-400/25 to-blue-600/35 border-cyan-200/90 shadow-[0_0_10px_rgba(120,215,255,0.6),inset_0_1px_0_rgba(255,255,255,0.8)] text-white'
                      : win.isMinimized
                        ? 'bg-white/10 hover:bg-white/20 border-white/20 text-slate-300'
                        : 'bg-white/15 hover:bg-white/30 border-white/30 text-white'
                  }`}
                >
                  <span className="text-base shrink-0 filter drop-shadow-xs">{win.icon}</span>
                  <span className="truncate text-[11px] font-normal drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {win.title}
                  </span>
                </button>

                {/* Aero Peek Window Thumbnail Preview Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-11 left-0 w-48 bg-gradient-to-b from-[#eaf6ff]/95 to-[#bcdbf2]/95 border border-[#8cbde2] rounded-md shadow-2xl p-2 z-[99999] backdrop-blur-md text-[#163654]">
                    <div className="flex items-center justify-between border-b border-[#a4c9e4] pb-1 mb-1.5 text-xs font-semibold">
                      <div className="flex items-center gap-1 truncate">
                        <span>{win.icon}</span>
                        <span className="truncate">{win.title}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                          onCloseWindow(win.id);
                        }}
                        className="hover:bg-red-500 hover:text-white rounded p-0.5 text-slate-600 transition-colors cursor-pointer"
                        title="Close window"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="w-full h-24 bg-white/80 rounded border border-[#a2c8e3] flex flex-col items-center justify-center p-2 text-center text-[10px] text-slate-500 shadow-inner">
                      <span className="text-2xl mb-1 filter drop-shadow-xs">{win.icon}</span>
                      <span className="truncate font-medium text-slate-700">{win.title}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">Click to bring to front</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Notification System Tray */}
      <div className="flex items-center gap-2 h-full text-xs">
        {/* Chevron tray toggle */}
        <button className="text-white/60 hover:text-white p-1 cursor-pointer" title="Show hidden icons">
          <ChevronUp className="w-3.5 h-3.5" />
        </button>

        {/* Action Center */}
        <button 
          onClick={() => sound.playClick()}
          className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded cursor-pointer" 
          title="No issues detected in Action Center"
        >
          <Flag className="w-3.5 h-3.5" />
        </button>

        {/* Network Icon */}
        <button 
          onClick={() => sound.playClick()}
          className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded cursor-pointer" 
          title="Internet Access: Connected"
        >
          <Wifi className="w-3.5 h-3.5" />
        </button>

        {/* Volume Icon */}
        <div className="relative">
          <button
            onClick={() => {
              sound.playClick();
              setShowVolumeFlyout(!showVolumeFlyout);
            }}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded cursor-pointer"
            title="Speakers: 80%"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-red-400" />}
          </button>

          {/* Volume Flyout */}
          {showVolumeFlyout && (
            <div className="absolute bottom-11 right-0 w-36 bg-[#eef7fd]/95 border border-[#8cbde2] rounded p-3 shadow-2xl backdrop-blur-md text-slate-800 flex flex-col items-center gap-2 z-[99999]">
              <span className="text-[11px] font-semibold text-[#144773]">Speakers Volume</span>
              <div className="flex items-center gap-2 w-full">
                <button onClick={onToggleSound} className="cursor-pointer">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-700" /> : <VolumeX className="w-4 h-4 text-red-600" />}
                </button>
                <input type="range" min="0" max="100" defaultValue="80" className="w-full h-1.5 bg-[#b2d3eb] rounded" />
              </div>
              <button 
                onClick={onToggleSound} 
                className="win7-btn text-[10px] px-2 py-0.5 w-full cursor-pointer"
              >
                {soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
              </button>
            </div>
          )}
        </div>

        {/* Date / Time Tray Display */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setShowCalendarFlyout(!showCalendarFlyout);
            }}
            className="flex flex-col items-center justify-center px-2 py-0.5 hover:bg-white/15 rounded cursor-pointer leading-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
            title="Change date and time settings"
            aria-label={`Date and time: ${time}, ${date}`}
            aria-expanded={showCalendarFlyout}
          >
            <span className="text-[11px] font-medium tracking-tight drop-shadow-xs">{time}</span>
            <span className="text-[10px] text-cyan-100 drop-shadow-xs">{date}</span>
          </button>

          {/* Calendar Flyout */}
          {showCalendarFlyout && (
            <div className="absolute bottom-11 right-0 w-64 bg-[#f2f8fd]/95 border border-[#8cbde2] rounded-md p-3 shadow-2xl backdrop-blur-md text-slate-800 z-[99999]">
              <div className="flex items-center justify-between border-b border-[#bad2e4] pb-2 mb-2 font-bold text-xs text-[#134674]">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
                <span>{time}</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-[10px] text-center font-medium">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <span key={d} className="text-slate-500 font-bold">{d}</span>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                  const isToday = day === new Date().getDate();
                  return (
                    <span 
                      key={day} 
                      className={`p-1 rounded ${isToday ? 'bg-blue-600 text-white font-bold' : 'hover:bg-[#d8ebfa]'}`}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>
              <div className="border-t border-[#bad2e4] pt-2 mt-2 text-[10px] text-blue-700 hover:underline cursor-pointer text-center">
                Change date and time settings...
              </div>
            </div>
          )}
        </div>

        {/* Far Right: Windows 7 "Show Desktop" Aero Peek Glass Bar */}
        <button
          onClick={() => {
            sound.playClick();
            onShowDesktop();
          }}
          onMouseEnter={() => onPeekDesktop(true)}
          onMouseLeave={() => onPeekDesktop(false)}
          className="w-3.5 h-9 ml-1 rounded-xs border-l border-white/40 bg-white/10 hover:bg-white/30 active:bg-white/50 transition-colors cursor-pointer"
          title="Show Desktop"
        />
      </div>
    </div>
  );
};

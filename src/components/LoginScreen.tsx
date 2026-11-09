import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { ArrowRight, Power, Eye } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
  onShutdown: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onShutdown }) => {
  const [password, setPassword] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    sound.playStartup();
    setTimeout(() => {
      onLogin();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex flex-col items-center justify-between p-8 bg-radial from-[#155383]/80 via-[#0a3154] to-[#031526] text-white select-none overflow-hidden">
      {/* Background Subtle Aero Curves & Light Waves */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(95,195,255,0.25)_0%,transparent_65%)] pointer-events-none" />
      <div className="absolute w-[120vw] h-[100vh] -top-[30%] -left-[10%] rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none filter blur-2xl" />

      {/* Top Brand Marker */}
      <div className="pt-6 text-center z-10">
        <h1 className="text-3xl font-light tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          Windows 7 <span className="font-semibold text-cyan-200">Ultimate</span>
        </h1>
        <p className="text-xs text-cyan-100/80 tracking-wider mt-1 uppercase">
          Service Pack 1 · High Performance Aero Simulator
        </p>
      </div>

      {/* Center Logon Tile */}
      <form onSubmit={handleLoginSubmit} className="flex flex-col items-center z-10 max-w-sm w-full">
        {/* User Avatar with Glass Highlight */}
        <div className="relative mb-4 group cursor-pointer" onClick={handleLoginSubmit}>
          <div className="w-28 h-28 rounded-xl border-2 border-white/90 bg-gradient-to-br from-white via-[#86c0e8] to-[#256c9e] shadow-[0_12px_30px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center text-5xl">
            👤
          </div>
          <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>

        <div className="text-xl font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-3">
          Administrator
        </div>

        {isLoggingIn ? (
          <div className="flex items-center gap-2.5 text-sm text-cyan-200 py-2">
            <div className="w-4 h-4 rounded-full border-2 border-cyan-300 border-t-transparent animate-spin" />
            <span>Welcome...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-64 bg-white/20 backdrop-blur-md border border-white/40 rounded-sm p-1 shadow-inner focus-within:ring-2 focus-within:ring-cyan-300">
            <input
              type="password"
              placeholder="Enter password (or click arrow)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder:text-white/60 px-2"
              autoFocus
            />
            <button
              type="submit"
              className="w-7 h-7 rounded-full bg-gradient-to-b from-[#60b6f5] to-[#15609c] border border-white/80 flex items-center justify-center hover:brightness-125 active:scale-95 transition-all shadow-md cursor-pointer"
              title="Log on"
            >
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleLoginSubmit}
          className="mt-4 win7-btn px-6 py-1.5 text-xs font-semibold cursor-pointer shadow-md"
        >
          Start Windows
        </button>
      </form>

      {/* Bottom Controls */}
      <div className="w-full flex items-center justify-between z-10 text-xs text-white/80">
        <button className="flex items-center gap-1.5 hover:text-white p-2 rounded hover:bg-white/10 cursor-pointer">
          <Eye className="w-4 h-4" />
          <span>Ease of Access</span>
        </button>

        <div className="text-[11px] text-cyan-200/70">
          Refactored GUI Architecture for 60 FPS Peak Performance
        </div>

        <button 
          onClick={onShutdown}
          className="flex items-center gap-1.5 hover:text-red-300 p-2 rounded hover:bg-white/10 cursor-pointer"
          title="Shut down"
        >
          <Power className="w-4 h-4 text-red-400" />
          <span>Shut down</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { ThemeConfig, WallpaperPreset, AeroTintColor } from '../../types';
import { sound } from '../../utils/audio';
import { Check, Volume2, VolumeX, Sparkles, Sliders } from 'lucide-react';

interface PersonalizationAppProps {
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
}

export const PersonalizationApp: React.FC<PersonalizationAppProps> = ({ theme, setTheme }) => {
  const wallpapers: { id: WallpaperPreset; name: string; preview: string; desc: string }[] = [
    { 
      id: 'harmony', 
      name: 'Windows 7 Harmony', 
      preview: 'radial-gradient(ellipse at 50% 80%, rgba(190, 235, 255, 0.9) 0%, rgba(85, 170, 220, 0.8) 25%, transparent 60%), linear-gradient(135deg, #062045 0%, #0d5c9e 48%, #031c3c 100%)',
      desc: 'The iconic default Aero Blue desktop wallpaper'
    },
    { 
      id: 'aurora', 
      name: 'Northern Aurora', 
      preview: 'radial-gradient(ellipse at 60% 40%, rgba(80, 250, 220, 0.6) 0%, rgba(12, 100, 150, 0.7) 40%, transparent 70%), linear-gradient(135deg, #021226 0%, #06375a 50%, #010c1c 100%)',
      desc: 'Vibrant cyan and deep turquoise northern lights'
    },
    { 
      id: 'architecture', 
      name: 'Aero Glass Architecture', 
      preview: 'linear-gradient(135deg, #1b354d 0%, #3e6d94 50%, #87b8dc 100%)',
      desc: 'Sleek metallic curves and frosted reflections'
    },
    { 
      id: 'nature', 
      name: 'Nature Landscapes', 
      preview: 'linear-gradient(180deg, #5398d9 0%, #a2d2f7 50%, #3d8a43 51%, #2b6830 100%)',
      desc: 'Rolling sunny hills with soft horizon gradients'
    },
    { 
      id: 'dark', 
      name: 'Midnight Dark Aero', 
      preview: 'radial-gradient(circle at 50% 30%, rgba(35, 75, 120, 0.5) 0%, transparent 70%), linear-gradient(180deg, #08111c 0%, #0f1c2d 50%, #050b12 100%)',
      desc: 'Low-light nocturnal theme for night computing'
    },
  ];

  const aeroTints: { id: AeroTintColor; name: string; color: string }[] = [
    { id: 'blue', name: 'Sky Blue', color: '#1774ba' },
    { id: 'teal', name: 'Sea Teal', color: '#0d9488' },
    { id: 'slate', name: 'Twilight Slate', color: '#475569' },
    { id: 'ruby', name: 'Ruby Rose', color: '#be123c' },
    { id: 'frost', name: 'Frost Clear', color: '#94a3b8' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fbfe] select-none text-[#192f46] p-5 overflow-y-auto">
      <div className="border-b border-[#cbd7e2] pb-3 mb-5">
        <h1 className="text-xl font-normal text-[#134977]">Personalization</h1>
        <p className="text-xs text-slate-500 mt-1">
          Change the visuals, Aero glass window colors, and sounds on your computer
        </p>
      </div>

      {/* Aero Glass Wallpapers Selection */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[#16416b] mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#1d73b5]" /> Desktop Background Themes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {wallpapers.map((wp) => {
            const isSelected = theme.wallpaper === wp.id;
            return (
              <div
                key={wp.id}
                onClick={() => {
                  sound.playClick();
                  setTheme(prev => ({ ...prev, wallpaper: wp.id }));
                }}
                className={`p-2.5 rounded-md border cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-[#308ad1] bg-[#e3f2fd] shadow-md ring-2 ring-[#4ca5ee]/40' 
                    : 'border-[#cbdde9] bg-white hover:border-[#86b5d9] hover:bg-[#f3f9fd]'
                }`}
              >
                <div 
                  style={{ background: wp.preview }}
                  className="w-full h-24 rounded border border-white/50 shadow-inner mb-2 relative overflow-hidden flex items-center justify-center"
                >
                  {isSelected && (
                    <div className="bg-white/90 text-blue-700 p-1 rounded-full shadow-md">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div className="font-semibold text-xs text-[#133c62]">{wp.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{wp.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Window Glass Color Tint */}
      <div className="mb-6 border-t border-[#d8e4ee] pt-5">
        <h2 className="text-sm font-semibold text-[#16416b] mb-3 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-[#1d73b5]" /> Window Color & Aero Glass Tint
        </h2>
        <div className="flex flex-wrap gap-3">
          {aeroTints.map((t) => {
            const isSelected = theme.aeroTint === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  sound.playClick();
                  setTheme(prev => ({ ...prev, aeroTint: t.id }));
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-[#2d83c9] bg-[#dbeffc] font-semibold text-[#0c3c69] shadow-xs' 
                    : 'border-[#c7d9e7] bg-white text-slate-700 hover:bg-[#eef5fa]'
                }`}
              >
                <div 
                  style={{ backgroundColor: t.color }}
                  className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                />
                <span className="text-xs">{t.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Color Intensity Slider */}
        <div className="mt-4 flex items-center gap-4 bg-white p-3 rounded border border-[#d2e0eb] max-w-md">
          <span className="text-xs font-medium text-slate-700">Aero Glass Transparency:</span>
          <input
            type="range"
            min="30"
            max="95"
            value={theme.aeroOpacity}
            onChange={(e) => setTheme(prev => ({ ...prev, aeroOpacity: Number(e.target.value) }))}
            className="flex-1 h-1.5 bg-[#bad4e8] rounded cursor-pointer"
          />
          <span className="font-mono text-xs w-8 text-right">{theme.aeroOpacity}%</span>
        </div>
      </div>

      {/* Sound Settings */}
      <div className="border-t border-[#d8e4ee] pt-5">
        <h2 className="text-sm font-semibold text-[#16416b] mb-3">Sound Scheme</h2>
        <div className="flex items-center justify-between bg-white p-3.5 rounded border border-[#d2e0eb] max-w-md">
          <div className="flex items-center gap-3">
            {theme.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <div className="font-semibold text-xs text-slate-800">Windows Default Sound Scheme</div>
              <div className="text-[11px] text-slate-500">Play iconic startup chord and interactive button chimes</div>
            </div>
          </div>
          <button
            onClick={() => {
              const next = !theme.soundEnabled;
              sound.setEnabled(next);
              if (next) sound.playStartup();
              setTheme(prev => ({ ...prev, soundEnabled: next }));
            }}
            className="win7-btn px-3 py-1 text-xs cursor-pointer"
          >
            {theme.soundEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>
    </div>
  );
};

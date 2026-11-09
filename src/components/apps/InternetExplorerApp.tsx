import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home, 
  Search, 
  Lock, 
  Globe, 
  Star, 
  ExternalLink,
  BookOpen,
  Code
} from 'lucide-react';
import { sound } from '../../utils/audio';

export const InternetExplorerApp: React.FC = () => {
  const [url, setUrl] = useState<string>('https://github.com/UmarTech85/Windows-7-Ultimate-Edition-Simulator');
  const [activeTab, setActiveTab] = useState<'home' | 'github' | 'wiki' | 'bing'>('github');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const navigateTo = (newUrl: string, tab: 'home' | 'github' | 'wiki' | 'bing') => {
    sound.playClick();
    setUrl(newUrl);
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col h-full bg-[#f6f9fc] select-none text-[#1b2e44]">
      {/* Tab Bar */}
      <div className="bg-[#d2e4f2] border-b border-[#a9c3d9] pt-1 px-1.5 flex items-center gap-1 text-[11px]">
        <div 
          onClick={() => navigateTo('https://github.com/UmarTech85/Windows-7-Ultimate-Edition-Simulator', 'github')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-t border-t border-x cursor-pointer ${
            activeTab === 'github' 
              ? 'bg-white border-[#9bb8cf] font-medium text-[#11395f] shadow-xs' 
              : 'bg-[#e5eff8] border-transparent hover:bg-[#ebf4fb] text-slate-600'
          }`}
        >
          <Code className="w-3.5 h-3.5 text-blue-600" />
          <span>GitHub: Windows-7-Simulator</span>
        </div>

        <div 
          onClick={() => navigateTo('https://en.wikipedia.org/wiki/Windows_7', 'wiki')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-t border-t border-x cursor-pointer ${
            activeTab === 'wiki' 
              ? 'bg-white border-[#9bb8cf] font-medium text-[#11395f] shadow-xs' 
              : 'bg-[#e5eff8] border-transparent hover:bg-[#ebf4fb] text-slate-600'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-700" />
          <span>Wikipedia: Windows 7</span>
        </div>

        <div 
          onClick={() => navigateTo('https://www.bing.com', 'bing')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-t border-t border-x cursor-pointer ${
            activeTab === 'bing' 
              ? 'bg-white border-[#9bb8cf] font-medium text-[#11395f] shadow-xs' 
              : 'bg-[#e5eff8] border-transparent hover:bg-[#ebf4fb] text-slate-600'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-cyan-600" />
          <span>Bing Search</span>
        </div>
      </div>

      {/* Navigation Controls & Address Bar */}
      <div className="bg-gradient-to-b from-white to-[#e4eef6] border-b border-[#b7cde0] p-1.5 flex items-center gap-1.5 shadow-xs">
        <button 
          onClick={() => sound.playClick()}
          className="w-7 h-7 rounded-full border border-[#8eaec7] bg-gradient-to-b from-white to-[#d7e7f4] flex items-center justify-center hover:bg-[#c9e1f5] shadow-xs cursor-pointer"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4 text-[#1d4368]" />
        </button>
        <button 
          onClick={() => sound.playClick()}
          className="w-7 h-7 rounded-full border border-[#8eaec7] bg-gradient-to-b from-white to-[#d7e7f4] flex items-center justify-center hover:bg-[#c9e1f5] shadow-xs cursor-pointer"
          title="Forward"
        >
          <ArrowRight className="w-4 h-4 text-[#1d4368]" />
        </button>

        {/* Address Input */}
        <div className="flex-1 flex items-center h-7 border border-[#8daec7] bg-white rounded-xs px-2 shadow-inner text-[12px]">
          <Lock className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sound.playClick();
                if (url.includes('wiki')) setActiveTab('wiki');
                else if (url.includes('bing') || url.includes('google')) setActiveTab('bing');
                else setActiveTab('github');
              }
            }}
            className="w-full text-[12px] text-slate-800 outline-none bg-transparent"
          />
          <button 
            onClick={() => sound.playClick()} 
            className="ml-1 text-slate-400 hover:text-blue-700 cursor-pointer"
            title="Refresh"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <button 
          onClick={() => navigateTo('https://github.com/UmarTech85/Windows-7-Ultimate-Edition-Simulator', 'github')}
          className="win7-btn p-1.5 cursor-pointer"
          title="Home"
        >
          <Home className="w-4 h-4 text-[#1c4b76]" />
        </button>
        <button className="win7-btn p-1.5 cursor-pointer text-amber-500" title="Favorites">
          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
        </button>
      </div>

      {/* Browser Viewport Area */}
      <div className="flex-1 overflow-auto bg-white p-6">
        {activeTab === 'github' && (
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-600 hover:underline cursor-pointer">UmarTech85</span>
                <span className="text-slate-400 mx-1">/</span>
                <span className="font-bold text-slate-900 text-base">Windows-7-Ultimate-Edition-Simulator</span>
                <div className="text-xs text-slate-500 mt-1">Refactored GUI Architecture for 60 FPS Peak Performance</div>
              </div>
              <a 
                href="https://github.com/UmarTech85/Windows-7-Ultimate-Edition-Simulator" 
                target="_blank" 
                rel="noreferrer"
                className="win7-btn px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View on GitHub
              </a>
            </div>

            <div className="border border-slate-200 rounded-lg p-5 bg-[#fbfdff] shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Windows 7 Ultimate Desktop Simulator</h2>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">
                This project replicates the timeless Windows 7 Ultimate experience directly inside your browser. 
                Featuring faithful Aero Glass reflections, pointer-captured dragging, Aero Snap docking, live Explorer, 
                HTML5 Canvas Paint, Media Player, sound engine, and classic games.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded">
                  <div className="font-bold text-[#144775] mb-1">⚡ Core Performance Refactoring</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Zero-jank pointer capture drag engine</li>
                    <li>Aero Snap screen edge snapping</li>
                    <li>Hardware-accelerated glass backdrop filters</li>
                    <li>Modular React 19 architecture</li>
                  </ul>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded">
                  <div className="font-bold text-[#144775] mb-1">🪟 Authentic Windows 7 Suite</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Windows Explorer & Drive gauges</li>
                    <li>Windows Media Player 12 + Visualizer</li>
                    <li>Canvas Paint & PNG export</li>
                    <li>Minesweeper & Calculator</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wiki' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-2xl font-serif text-slate-900 border-b pb-2">Windows 7</h1>
            <p className="text-sm text-slate-800 leading-relaxed">
              <strong>Windows 7</strong> is a major release of the Windows NT operating system developed by Microsoft. 
              It was released to manufacturing on July 22, 2009, and became generally available on October 22, 2009. 
              It is the successor to Windows Vista, released nearly three years earlier.
            </p>
            <div className="bg-[#f8fafd] border border-[#d2e2f0] p-4 rounded text-xs text-slate-700">
              <h3 className="font-bold text-slate-900 mb-1">Key Innovations</h3>
              <p>Windows 7 introduced the revamped Windows Aero user interface with a redesigned taskbar (often called the "Superbar"), support for pinned shortcuts, Jump Lists, Aero Snap, Aero Shake, and Aero Peek.</p>
            </div>
          </div>
        )}

        {activeTab === 'bing' && (
          <div className="max-w-xl mx-auto py-8 text-center space-y-4">
            <div className="text-4xl font-bold tracking-tight text-[#008272]">Bing</div>
            <div className="flex items-center border-2 border-[#008272] rounded-full px-4 py-2 shadow-sm bg-white">
              <input
                type="text"
                placeholder="Search the web with Bing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full outline-none text-sm text-slate-800"
              />
              <Search className="w-5 h-5 text-[#008272] cursor-pointer" />
            </div>
            <div className="flex justify-center gap-2 text-xs">
              <button onClick={() => navigateTo('https://github.com/UmarTech85/Windows-7-Ultimate-Edition-Simulator', 'github')} className="win7-btn px-4 py-1.5">Windows 7 GitHub</button>
              <button onClick={() => navigateTo('https://en.wikipedia.org/wiki/Windows_7', 'wiki')} className="win7-btn px-4 py-1.5">Windows 7 Wikipedia</button>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-[#f0f4f8] border-t border-[#cbd7e2] px-3 py-1 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span>Internet | Protected Mode: On</span>
        </div>
        <div>100%</div>
      </div>
    </div>
  );
};

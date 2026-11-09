import React, { useState } from 'react';
import { 
  HardDrive, 
  Disc, 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  Music, 
  Video, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  RefreshCw, 
  Search, 
  Plus, 
  Trash2,
  ChevronRight,
  Computer,
  Laptop,
  Check
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  category?: 'document' | 'image' | 'audio' | 'video' | 'system';
  size?: string;
  date: string;
}

export const ComputerApp: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('Computer');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [folderItems, setFolderItems] = useState<Record<string, FileItem[]>>({
    'Computer': [
      { id: 'c-drive', name: 'Local Disk (C:)', type: 'folder', category: 'system', size: '64.2 GB free of 120 GB', date: 'System' },
      { id: 'd-drive', name: 'DVD RW Drive (D:)', type: 'folder', category: 'system', size: '0 bytes free of 4.37 GB', date: 'Optical Media' },
    ],
    'Local Disk (C:)': [
      { id: 'perflogs', name: 'PerfLogs', type: 'folder', date: '2026-03-01' },
      { id: 'progfiles', name: 'Program Files', type: 'folder', date: '2026-03-01' },
      { id: 'progfiles86', name: 'Program Files (x86)', type: 'folder', date: '2026-03-01' },
      { id: 'users', name: 'Users', type: 'folder', date: '2026-03-01' },
      { id: 'windows', name: 'Windows', type: 'folder', category: 'system', date: '2026-03-01' },
    ],
    'Documents': [
      { id: 'doc-readme', name: 'Windows7_Release_Notes.txt', type: 'file', category: 'document', size: '14 KB', date: '2026-03-05' },
      { id: 'doc-budget', name: 'Project_Specification.docx', type: 'file', category: 'document', size: '42 KB', date: '2026-03-04' },
      { id: 'doc-notes', name: 'Personal_Notes.txt', type: 'file', category: 'document', size: '8 KB', date: '2026-03-02' },
    ],
    'Pictures': [
      { id: 'pic-harmony', name: 'Harmony_Aero_Wallpaper.jpg', type: 'file', category: 'image', size: '2.4 MB', date: '2026-03-01' },
      { id: 'pic-aurora', name: 'Aurora_Borealis.jpg', type: 'file', category: 'image', size: '3.1 MB', date: '2026-03-01' },
      { id: 'pic-koala', name: 'Koala.jpg', type: 'file', category: 'image', size: '1.8 MB', date: '2026-03-01' },
      { id: 'pic-jelly', name: 'Jellyfish.jpg', type: 'file', category: 'image', size: '2.1 MB', date: '2026-03-01' },
    ],
    'Music': [
      { id: 'mus-ninja', name: 'Kalimba - Mr. Scruff.mp3', type: 'file', category: 'audio', size: '5.8 MB', date: '2026-03-01' },
      { id: 'mus-maiden', name: 'Sleep Away - Bob Acri.mp3', type: 'file', category: 'audio', size: '4.2 MB', date: '2026-03-01' },
    ],
    'Videos': [
      { id: 'vid-wild', name: 'Wildlife in HD.wmv', type: 'file', category: 'video', size: '26.4 MB', date: '2026-03-01' },
    ]
  });

  const [history, setHistory] = useState<string[]>(['Computer']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const navigateTo = (path: string) => {
    sound.playClick();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(path);
    setSelectedItem(null);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      sound.playClick();
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(prev);
      setSelectedItem(null);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      sound.playClick();
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(next);
      setSelectedItem(null);
    }
  };

  const handleUp = () => {
    if (currentPath !== 'Computer') {
      navigateTo('Computer');
    }
  };

  const handleCreateFolder = () => {
    sound.playClick();
    const folderName = `New Folder (${Date.now().toString().slice(-4)})`;
    const newItem: FileItem = {
      id: 'f-' + Date.now(),
      name: folderName,
      type: 'folder',
      date: new Date().toLocaleDateString()
    };
    setFolderItems(prev => ({
      ...prev,
      [currentPath]: [...(prev[currentPath] || []), newItem],
      [folderName]: []
    }));
  };

  const handleDeleteItem = () => {
    if (!selectedItem) return;
    sound.playClick();
    setFolderItems(prev => ({
      ...prev,
      [currentPath]: (prev[currentPath] || []).filter(item => item.id !== selectedItem)
    }));
    setSelectedItem(null);
  };

  const rawItems = folderItems[currentPath] || [];
  const items = rawItems.filter(item => 
    !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white select-none text-[#1b2d42] text-[12px]">
      {/* Top Navigation & Address Bar */}
      <div className="bg-gradient-to-b from-[#f9fbfd] to-[#e4eef6] border-b border-[#b7cbdd] px-2 py-1.5 flex items-center gap-1.5 shadow-sm">
        <div className="flex items-center gap-0.5">
          <button 
            onClick={handleBack} 
            disabled={historyIndex === 0}
            className="w-7 h-7 rounded-full border border-[#8eaec7] bg-gradient-to-b from-white to-[#d7e7f4] flex items-center justify-center hover:bg-[#c9e1f5] disabled:opacity-40 disabled:hover:bg-transparent shadow-xs transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 text-[#1d4368]" />
          </button>
          <button 
            onClick={handleForward} 
            disabled={historyIndex >= history.length - 1}
            className="w-7 h-7 rounded-full border border-[#8eaec7] bg-gradient-to-b from-white to-[#d7e7f4] flex items-center justify-center hover:bg-[#c9e1f5] disabled:opacity-40 disabled:hover:bg-transparent shadow-xs transition-colors cursor-pointer"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4 text-[#1d4368]" />
          </button>
          <button 
            onClick={handleUp} 
            disabled={currentPath === 'Computer'}
            className="w-6 h-6 rounded border border-[#a2bfd6] bg-gradient-to-b from-white to-[#e0edf7] flex items-center justify-center hover:bg-[#d0e5f7] disabled:opacity-40 transition-colors cursor-pointer ml-0.5"
            title="Up to Computer"
          >
            <ArrowUp className="w-3.5 h-3.5 text-[#1e4871]" />
          </button>
        </div>

        {/* Address Breadcrumb */}
        <div className="flex-1 flex items-center h-6 border border-[#9bb7cf] bg-white rounded-xs px-2 shadow-inner text-[12px]">
          <Computer className="w-3.5 h-3.5 text-[#2167a6] mr-1.5 shrink-0" />
          <div className="flex items-center gap-1 overflow-hidden truncate">
            <span 
              onClick={() => navigateTo('Computer')}
              className="text-[#1a4269] hover:underline cursor-pointer"
            >
              Computer
            </span>
            {currentPath !== 'Computer' && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-800 truncate">{currentPath}</span>
              </>
            )}
          </div>
          <button 
            onClick={() => sound.playClick()} 
            className="ml-auto text-slate-400 hover:text-slate-700 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* Search Box */}
        <div className="w-44 flex items-center h-6 border border-[#9bb7cf] bg-white rounded-xs px-2 shadow-inner">
          <input 
            type="text"
            placeholder={`Search ${currentPath}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-[11px] outline-none bg-transparent placeholder:text-slate-400 text-slate-800"
          />
          <Search className="w-3 h-3 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Explorer Command Bar */}
      <div className="bg-gradient-to-b from-[#ffffff] to-[#e7eff6] border-b border-[#c4d6e4] px-2.5 py-1 flex items-center gap-2 text-[12px]">
        <button 
          onClick={handleCreateFolder}
          className="win7-btn px-2.5 py-0.5 flex items-center gap-1 cursor-pointer font-normal"
        >
          <Plus className="w-3.5 h-3.5 text-[#19619d]" /> New folder
        </button>
        {selectedItem && (
          <button 
            onClick={handleDeleteItem}
            className="win7-btn px-2.5 py-0.5 flex items-center gap-1 cursor-pointer text-red-700 font-normal hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        )}
        <div className="h-4 w-px bg-[#c2d3e2] mx-1" />
        <button className="win7-btn px-2.5 py-0.5 cursor-pointer">Organize ▾</button>
        <button className="win7-btn px-2.5 py-0.5 cursor-pointer">System properties</button>
      </div>

      {/* Explorer Body: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Pane */}
        <div className="w-44 bg-[#f5f8fa] border-r border-[#d4e1ec] p-2 flex flex-col gap-3 text-[11px] overflow-y-auto shrink-0">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 mb-1">Favorites</div>
            <div 
              onClick={() => navigateTo('Pictures')}
              className={`flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer ${currentPath === 'Pictures' ? 'bg-[#d2e7f8] text-[#0d4072] font-semibold' : 'hover:bg-[#e4eff8]'}`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#2e7ebc]" /> Pictures
            </div>
            <div 
              onClick={() => navigateTo('Documents')}
              className={`flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer ${currentPath === 'Documents' ? 'bg-[#d2e7f8] text-[#0d4072] font-semibold' : 'hover:bg-[#e4eff8]'}`}
            >
              <Folder className="w-3.5 h-3.5 text-[#ebb838]" /> Documents
            </div>
            <div 
              onClick={() => navigateTo('Music')}
              className={`flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer ${currentPath === 'Music' ? 'bg-[#d2e7f8] text-[#0d4072] font-semibold' : 'hover:bg-[#e4eff8]'}`}
            >
              <Music className="w-3.5 h-3.5 text-[#b0487f]" /> Music
            </div>
            <div 
              onClick={() => navigateTo('Videos')}
              className={`flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer ${currentPath === 'Videos' ? 'bg-[#d2e7f8] text-[#0d4072] font-semibold' : 'hover:bg-[#e4eff8]'}`}
            >
              <Video className="w-3.5 h-3.5 text-[#3ea45b]" /> Videos
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 mb-1">Libraries</div>
            <div 
              onClick={() => navigateTo('Computer')}
              className={`flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer ${currentPath === 'Computer' ? 'bg-[#d2e7f8] text-[#0d4072] font-semibold' : 'hover:bg-[#e4eff8]'}`}
            >
              <Computer className="w-3.5 h-3.5 text-[#1b5e98]" /> Computer
            </div>
            <div 
              onClick={() => navigateTo('Local Disk (C:)')}
              className={`flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer ${currentPath === 'Local Disk (C:)' ? 'bg-[#d2e7f8] text-[#0d4072] font-semibold' : 'hover:bg-[#e4eff8]'}`}
            >
              <HardDrive className="w-3.5 h-3.5 text-[#4a6b88]" /> Local Disk (C:)
            </div>
          </div>
        </div>

        {/* Main Folder Grid */}
        <div 
          onClick={() => setSelectedItem(null)}
          className="flex-1 bg-white p-4 overflow-y-auto"
        >
          {currentPath === 'Computer' ? (
            <div className="space-y-4">
              <div>
                <div className="text-[12px] font-semibold text-[#18395b] border-b border-[#d8e5ef] pb-1 mb-2.5 flex items-center justify-between">
                  <span>Hard Disk Drives (1)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div 
                    onClick={(e) => { e.stopPropagation(); setSelectedItem('c-drive'); }}
                    onDoubleClick={() => navigateTo('Local Disk (C:)')}
                    className={`flex items-center gap-3 p-2.5 rounded border cursor-pointer transition-all ${
                      selectedItem === 'c-drive' 
                        ? 'border-[#7bb1db] bg-[#d9ecfa] shadow-xs' 
                        : 'border-[#d0dee9] hover:border-[#a9c9e2] hover:bg-[#f3f9fd]'
                    }`}
                  >
                    <div className="w-11 h-11 rounded bg-gradient-to-b from-[#e3edf6] to-[#b3cee4] border border-[#86a8c4] flex items-center justify-center shrink-0 shadow-xs">
                      <HardDrive className="w-6 h-6 text-[#1f4a74]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#163a5f] truncate">Local Disk (C:)</div>
                      <div className="w-full bg-[#d8e3eb] h-3.5 rounded-xs border border-[#acc0d0] overflow-hidden my-1">
                        <div className="bg-gradient-to-r from-[#5bb1ea] to-[#1c7ec2] h-full w-[46%]" />
                      </div>
                      <div className="text-[10px] text-slate-500">64.2 GB free of 120 GB</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[12px] font-semibold text-[#18395b] border-b border-[#d8e5ef] pb-1 mb-2.5">
                  Devices with Removable Storage (1)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div 
                    onClick={(e) => { e.stopPropagation(); setSelectedItem('d-drive'); }}
                    className={`flex items-center gap-3 p-2.5 rounded border cursor-pointer transition-all ${
                      selectedItem === 'd-drive' 
                        ? 'border-[#7bb1db] bg-[#d9ecfa] shadow-xs' 
                        : 'border-[#d0dee9] hover:border-[#a9c9e2] hover:bg-[#f3f9fd]'
                    }`}
                  >
                    <div className="w-11 h-11 rounded bg-gradient-to-b from-[#f2f7fb] to-[#c7dbe9] border border-[#9cb8cd] flex items-center justify-center shrink-0 shadow-xs">
                      <Disc className="w-6 h-6 text-[#4a6b88]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#163a5f]">DVD RW Drive (D:)</div>
                      <div className="text-[10px] text-slate-500">Ready for CD/DVD insertion</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {items.map((item) => {
                const isSelected = selectedItem === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedItem(item.id); }}
                    onDoubleClick={() => {
                      if (item.type === 'folder') {
                        navigateTo(item.name);
                      } else {
                        sound.playClick();
                      }
                    }}
                    className={`flex flex-col items-center p-2 rounded text-center cursor-pointer transition-colors border ${
                      isSelected 
                        ? 'border-[#7cb3de] bg-[#d7ecfa] shadow-xs' 
                        : 'border-transparent hover:border-[#bbd9ef] hover:bg-[#edf5fb]'
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center mb-1 drop-shadow-xs">
                      {item.type === 'folder' ? (
                        <Folder className="w-10 h-10 text-[#f5c342] fill-[#f8d775]" />
                      ) : item.category === 'image' ? (
                        <ImageIcon className="w-9 h-9 text-[#2a87cd]" />
                      ) : item.category === 'audio' ? (
                        <Music className="w-9 h-9 text-[#bd4386]" />
                      ) : item.category === 'video' ? (
                        <Video className="w-9 h-9 text-[#349c58]" />
                      ) : (
                        <FileText className="w-9 h-9 text-[#5b7a95]" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-800 font-normal max-w-full truncate px-1">
                      {item.name}
                    </span>
                    {item.size && (
                      <span className="text-[10px] text-slate-400 mt-0.5">{item.size}</span>
                    )}
                  </div>
                );
              })}
              {items.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 italic">
                  This folder is empty.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Explorer Details & Status Bar */}
      <div className="bg-[#f0f5fa] border-t border-[#c6d7e6] px-3 py-1 flex items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center gap-3">
          <span>{items.length} items</span>
          {selectedItem && (
            <span className="text-[#104d80] font-medium flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" /> 1 item selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span>Computer</span>
          <span>|</span>
          <span>NTFS File System</span>
        </div>
      </div>
    </div>
  );
};

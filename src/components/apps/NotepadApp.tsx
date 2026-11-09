import React, { useState, useRef, useEffect } from 'react';
import { sound } from '../../utils/audio';

interface NotepadAppProps {
  onClose?: () => void;
}

export const NotepadApp: React.FC<NotepadAppProps> = ({ onClose }) => {
  const [content, setContent] = useState<string>(() => {
    return localStorage.getItem('win7_notepad_draft') || 
`Windows 7 Ultimate Edition Simulator
Refactored GUI Architecture & Performance Update

Features implemented:
- 60 FPS hardware-accelerated Aero Glass windows
- Pointer capture zero-jank dragging & multi-edge resizing
- Aero Snap (half-screen and full-screen window docking)
- Windows Explorer with drive bars & folder navigation
- Interactive HTML5 Canvas Paint with export
- Authentic Windows Media Player 12 with sound engine
- Standard Calculator with memory & tape
- High-contrast Minesweeper with difficulty levels
- Interactive Command Prompt (cmd.exe)
- Start Menu with instantaneous search debounce
- System Tray with real-time clock & sound controls

Feel free to write notes, edit text, or download your file as .txt!`;
  });

  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(14);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync to local session
  useEffect(() => {
    localStorage.setItem('win7_notepad_draft', content);
  }, [content]);

  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = textareaRef.current.value.substring(0, pos);
    const lines = textBefore.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    });
  };

  const handleSaveDownload = () => {
    sound.playClick();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Document.txt';
    a.click();
    URL.revokeObjectURL(url);
    setActiveMenu(null);
  };

  const handleOpenLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setContent(evt.target?.result as string || '');
        sound.playNotify();
      };
      reader.readAsText(file);
    }
    setActiveMenu(null);
  };

  return (
    <div className="flex flex-col h-full bg-white select-none text-[#1b2f44]">
      {/* Menu Bar */}
      <div className="bg-[#f0f4f8] border-b border-[#cbd7e2] px-1 py-0.5 flex items-center text-[11px] relative">
        <div className="relative">
          <button 
            onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
            className={`px-2 py-0.5 rounded cursor-pointer ${activeMenu === 'file' ? 'bg-[#cbe2f6] text-[#0f3c66]' : 'hover:bg-[#dce9f5]'}`}
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div className="absolute left-0 top-full mt-0.5 w-44 bg-white border border-[#8faec7] shadow-md rounded-xs py-1 z-50 text-[11px]">
              <div 
                onClick={() => { setContent(''); setActiveMenu(null); sound.playClick(); }}
                className="px-3 py-1 hover:bg-[#d2e8f8] cursor-pointer flex justify-between"
              >
                <span>New</span>
                <span className="text-slate-400">Ctrl+N</span>
              </div>
              <label className="px-3 py-1 hover:bg-[#d2e8f8] cursor-pointer flex justify-between">
                <span>Open...</span>
                <span className="text-slate-400">Ctrl+O</span>
                <input type="file" accept=".txt,.md,.json,.js,.ts,.html,.css" className="hidden" onChange={handleOpenLocalFile} />
              </label>
              <div 
                onClick={handleSaveDownload}
                className="px-3 py-1 hover:bg-[#d2e8f8] cursor-pointer flex justify-between"
              >
                <span>Save</span>
                <span className="text-slate-400">Ctrl+S</span>
              </div>
              <div 
                onClick={handleSaveDownload}
                className="px-3 py-1 hover:bg-[#d2e8f8] cursor-pointer"
              >
                Save As (.txt)...
              </div>
              <div className="border-t border-slate-200 my-1" />
              <div 
                onClick={() => { if (onClose) onClose(); setActiveMenu(null); }}
                className="px-3 py-1 hover:bg-[#d2e8f8] cursor-pointer"
              >
                Exit
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
            className={`px-2 py-0.5 rounded cursor-pointer ${activeMenu === 'edit' ? 'bg-[#cbe2f6] text-[#0f3c66]' : 'hover:bg-[#dce9f5]'}`}
          >
            Edit
          </button>
          {activeMenu === 'edit' && (
            <div className="absolute left-0 top-full mt-0.5 w-40 bg-white border border-[#8faec7] shadow-md rounded-xs py-1 z-50 text-[11px]">
              <div 
                onClick={() => { textareaRef.current?.select(); setActiveMenu(null); }}
                className="px-3 py-1 hover:bg-[#d2e8f8] cursor-pointer flex justify-between"
              >
                <span>Select All</span>
                <span className="text-slate-400">Ctrl+A</span>
              </div>
              <div 
                onClick={() => { setContent(''); setActiveMenu(null); }}
                className="px-3 py-1 hover:bg-[#d2e8f8] cursor-pointer"
              >
                Clear All
              </div>
              <div 
                onClick={() => { 
                  const nowStr = new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString();
                  setContent(prev => prev + '\n' + nowStr);
                  setActiveMenu(null);
                }}
                className="px-3 py-1 hover:bg-[#d2e8f8] cursor-pointer flex justify-between"
              >
                <span>Time/Date</span>
                <span className="text-slate-400">F5</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => setActiveMenu(activeMenu === 'format' ? null : 'format')}
            className={`px-2 py-0.5 rounded cursor-pointer ${activeMenu === 'format' ? 'bg-[#cbe2f6] text-[#0f3c66]' : 'hover:bg-[#dce9f5]'}`}
          >
            Format
          </button>
          {activeMenu === 'format' && (
            <div className="absolute left-0 top-full mt-0.5 w-40 bg-white border border-[#8faec7] shadow-md rounded-xs py-1 z-50 text-[11px]">
              <div 
                onClick={() => { setWordWrap(!wordWrap); setActiveMenu(null); }}
                className="px-3 py-1 hover:bg-[#d2e8f8] cursor-pointer flex items-center gap-2"
              >
                <input type="checkbox" checked={wordWrap} readOnly />
                <span>Word Wrap</span>
              </div>
              <div className="border-t border-slate-200 my-1" />
              <div 
                onClick={() => { setFontSize(prev => Math.min(24, prev + 2)); setActiveMenu(null); }}
                className="px-3 py-1 hover:bg-[#d2e8f8] cursor-pointer"
              >
                Font Size +
              </div>
              <div 
                onClick={() => { setFontSize(prev => Math.max(10, prev - 2)); setActiveMenu(null); }}
                className="px-3 py-1 hover:bg-[#d2e8f8] cursor-pointer"
              >
                Font Size -
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => { sound.playClick(); alert('Notepad - Windows 7 Ultimate Edition\nVersion 6.1 (Build 7601: Service Pack 1)'); }}
          className="px-2 py-0.5 rounded cursor-pointer hover:bg-[#dce9f5]"
        >
          Help
        </button>
      </div>

      {/* Editor Body */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyUp={updateCursorPosition}
        onClick={updateCursorPosition}
        spellCheck={false}
        wrap={wordWrap ? 'soft' : 'off'}
        style={{ fontSize: `${fontSize}px` }}
        className="flex-1 w-full p-3 font-mono text-[#1a2d40] outline-none resize-none overflow-auto border-none leading-relaxed selection:bg-[#3399ff] selection:text-white"
        placeholder="Type notes here..."
      />

      {/* Status Bar */}
      <div className="bg-[#f0f4f8] border-t border-[#ccdbe6] px-3 py-1 flex items-center justify-between text-[11px] text-slate-600">
        <div>
          Characters: {content.length} | Lines: {content.split('\n').length}
        </div>
        <div className="flex items-center gap-4">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span>100%</span>
          <span>Windows (CRLF)</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};

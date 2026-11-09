import React, { useState, useRef, useEffect } from 'react';
import { sound } from '../../utils/audio';
import { AppId } from '../../types';

interface CommandPromptAppProps {
  onLaunchApp?: (appId: AppId) => void;
  onClose?: () => void;
}

export const CommandPromptApp: React.FC<CommandPromptAppProps> = ({ onLaunchApp, onClose }) => {
  const [history, setHistory] = useState<string[]>([
    'Microsoft Windows [Version 6.1.7601]',
    'Copyright (c) 2009 Microsoft Corporation. All rights reserved.',
    '',
    'Type "help" for a list of available commands.',
    ''
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#cccccc');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    const parts = trimmed.split(' ');
    const command = parts[0]?.toLowerCase();
    const arg = parts.slice(1).join(' ');

    const newHistory = [...history, `C:\\Users\\Administrator> ${cmdStr}`];

    switch (command) {
      case 'help':
        newHistory.push(
          'For more information on a specific tool, visit the Control Panel.',
          '  CLS         Clears the command prompt screen.',
          '  COLOR       Sets console text color (e.g. "color 0a" for green).',
          '  DATE        Displays the current system date.',
          '  DIR         Displays a list of files and subdirectories.',
          '  ECHO        Displays messages on screen.',
          '  EXIT        Quits the CMD.EXE program.',
          '  HELP        Provides help information for Windows commands.',
          '  MATRIX      Starts the digital green rain matrix mode.',
          '  SYSTEMINFO  Displays machine-specific properties and configuration.',
          '  TIME        Displays the current system time.',
          '  VER         Displays the Windows version.',
          '  CALC        Launches Windows 7 Calculator.',
          '  NOTEPAD     Launches Windows Notepad.'
        );
        break;

      case 'cls':
        setHistory([]);
        return;

      case 'ver':
        newHistory.push('Microsoft Windows [Version 6.1.7601] (Service Pack 1)');
        break;

      case 'date':
        newHistory.push(`The current date is: ${new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' })}`);
        break;

      case 'time':
        newHistory.push(`The current time is: ${new Date().toLocaleTimeString()}`);
        break;

      case 'dir':
        newHistory.push(
          ' Volume in drive C is Windows 7 OS',
          ' Volume Serial Number is 4C82-990A',
          '',
          ' Directory of C:\\Users\\Administrator',
          '',
          '03/01/2026  09:00 AM    <DIR>          .',
          '03/01/2026  09:00 AM    <DIR>          ..',
          '03/05/2026  11:20 AM    <DIR>          Documents',
          '03/05/2026  11:20 AM    <DIR>          Downloads',
          '03/05/2026  11:20 AM    <DIR>          Music',
          '03/05/2026  11:20 AM    <DIR>          Pictures',
          '03/05/2026  11:20 AM    <DIR>          Videos',
          '03/05/2026  11:20 AM            14,284 Release_Notes.txt',
          '               1 File(s)         14,284 bytes',
          '               7 Dir(s)  64,283,115,520 bytes free'
        );
        break;

      case 'echo':
        newHistory.push(arg);
        break;

      case 'color':
        if (arg.includes('a') || arg.includes('2')) {
          setTextColor('#22c55e');
          newHistory.push('Color set to Matrix Green.');
        } else if (arg.includes('b') || arg.includes('3')) {
          setTextColor('#38bdf8');
          newHistory.push('Color set to Aqua Cyan.');
        } else if (arg.includes('c') || arg.includes('4')) {
          setTextColor('#ef4444');
          newHistory.push('Color set to Red Alert.');
        } else if (arg.includes('e') || arg.includes('6')) {
          setTextColor('#facc15');
          newHistory.push('Color set to Yellow.');
        } else {
          setTextColor('#cccccc');
          newHistory.push('Color restored to standard light gray.');
        }
        break;

      case 'matrix':
        setTextColor('#22c55e');
        newHistory.push(
          'Wake up, Neo...',
          'The Matrix has you.',
          'Follow the white rabbit.',
          'Knock, knock, Neo.'
        );
        break;

      case 'systeminfo':
        newHistory.push(
          'Host Name:                 WIN7-ULTIMATE',
          'OS Name:                   Microsoft Windows 7 Ultimate',
          'OS Version:                6.1.7601 Service Pack 1 Build 7601',
          'OS Manufacturer:           Microsoft Corporation',
          'System Type:               x64-based PC',
          'Processor(s):              Intel(R) Core(TM) i7 CPU @ 3.40GHz',
          'Total Physical Memory:     16,384 MB',
          'Available Physical Memory: 12,410 MB',
          'GUI Architecture:          Refactored 60 FPS Aero Glass Components'
        );
        break;

      case 'calc':
        if (onLaunchApp) onLaunchApp('calc');
        newHistory.push('Opening Calculator...');
        break;

      case 'notepad':
        if (onLaunchApp) onLaunchApp('notepad');
        newHistory.push('Opening Notepad...');
        break;

      case 'exit':
        if (onClose) onClose();
        return;

      case '':
        break;

      default:
        newHistory.push(`'${parts[0]}' is not recognized as an internal or external command, operable program or batch file.`);
    }

    setHistory(newHistory);
  };

  return (
    <div 
      onClick={() => inputRef.current?.focus()}
      className="flex flex-col h-full bg-black p-3 font-mono text-[13px] select-text overflow-y-auto leading-tight cursor-text"
      style={{ color: textColor }}
    >
      <div className="space-y-1">
        {history.map((line, idx) => (
          <div key={idx} className="whitespace-pre-wrap">{line}</div>
        ))}
      </div>

      <div className="flex items-center mt-1">
        <span className="shrink-0 mr-2">C:\Users\Administrator&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sound.playClick();
              handleCommand(inputVal);
              setInputVal('');
            }
          }}
          className="flex-1 bg-transparent outline-none border-none text-[13px] font-mono p-0"
          style={{ color: textColor }}
          autoFocus
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

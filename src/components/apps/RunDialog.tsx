import React, { useState } from 'react';
import { sound } from '../../utils/audio';

interface RunDialogProps {
  onRun: (cmd: string) => void;
  onClose: () => void;
}

export const RunDialog: React.FC<RunDialogProps> = ({ onRun, onClose }) => {
  const [val, setVal] = useState<string>('notepad');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    onRun(val);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-[#f0f4f8] p-4 select-none text-[#1b2f45] justify-between text-xs">
      <div className="flex gap-3 items-start">
        <div className="w-10 h-10 rounded bg-[#e1eef8] border border-[#96bad8] flex items-center justify-center shrink-0 shadow-xs text-xl">
          ⌨️
        </div>
        <div className="space-y-2 flex-1">
          <p className="leading-relaxed">
            Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.
          </p>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Open:</span>
            <input
              type="text"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="notepad, calc, paint, cmd, explorer..."
              className="flex-1 bg-white border border-[#7f9db9] rounded-xs px-2 py-1 outline-none text-slate-800 shadow-inner"
              autoFocus
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-[#cbd7e2] pt-3 mt-4">
        <button type="submit" className="win7-btn px-5 py-1 text-xs font-semibold cursor-pointer">
          OK
        </button>
        <button type="button" onClick={onClose} className="win7-btn px-4 py-1 text-xs cursor-pointer">
          Cancel
        </button>
      </div>
    </form>
  );
};

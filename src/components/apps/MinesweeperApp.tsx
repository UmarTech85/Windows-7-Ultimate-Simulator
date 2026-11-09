import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../../utils/audio';

interface Cell {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export const MinesweeperApp: React.FC = () => {
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate'>('beginner');
  const [rows, setRows] = useState<number>(9);
  const [cols, setCols] = useState<number>(9);
  const [minesCount, setMinesCount] = useState<number>(10);
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [flagsRemaining, setFlagsRemaining] = useState<number>(10);

  // Initialize board
  const initGame = useCallback((r: number, c: number, m: number) => {
    setGameOver(false);
    setGameWon(false);
    setTimer(0);
    setIsTimerRunning(false);
    setFlagsRemaining(m);

    // Create empty cells
    const newBoard: Cell[][] = [];
    for (let i = 0; i < r; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < c; j++) {
        row.push({
          x: i,
          y: j,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newBoard.push(row);
    }

    // Place mines randomly
    let placedMines = 0;
    while (placedMines < m) {
      const rx = Math.floor(Math.random() * r);
      const ry = Math.floor(Math.random() * c);
      if (!newBoard[rx][ry].isMine) {
        newBoard[rx][ry].isMine = true;
        placedMines++;
      }
    }

    // Calculate neighbors
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        if (!newBoard[i][j].isMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (ni >= 0 && ni < r && nj >= 0 && nj < c && newBoard[ni][nj].isMine) {
                count++;
              }
            }
          }
          newBoard[i][j].neighborMines = count;
        }
      }
    }

    setBoard(newBoard);
  }, []);

  useEffect(() => {
    if (difficulty === 'beginner') {
      setRows(9);
      setCols(9);
      setMinesCount(10);
      initGame(9, 9, 10);
    } else {
      setRows(16);
      setCols(16);
      setMinesCount(40);
      initGame(16, 16, 40);
    }
  }, [difficulty, initGame]);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && !gameOver && !gameWon) {
      interval = setInterval(() => {
        setTimer(t => Math.min(999, t + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, gameOver, gameWon]);

  // Reveal cell with flood fill
  const revealCell = (x: number, y: number) => {
    if (gameOver || gameWon || board[x][y].isRevealed || board[x][y].isFlagged) return;

    if (!isTimerRunning) setIsTimerRunning(true);
    sound.playClick();

    const newBoard = board.map(r => r.map(c => ({ ...c })));

    // Mine hit
    if (newBoard[x][y].isMine) {
      sound.playError();
      setGameOver(true);
      setIsTimerRunning(false);
      // Reveal all mines
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (newBoard[i][j].isMine) newBoard[i][j].isRevealed = true;
        }
      }
      setBoard(newBoard);
      return;
    }

    // Flood fill zeros
    const flood = (r: number, c: number) => {
      if (r < 0 || r >= rows || c < 0 || c >= cols) return;
      if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged || newBoard[r][c].isMine) return;

      newBoard[r][c].isRevealed = true;

      if (newBoard[r][c].neighborMines === 0) {
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            if (di !== 0 || dj !== 0) {
              flood(r + di, c + dj);
            }
          }
        }
      }
    };

    flood(x, y);
    setBoard(newBoard);

    // Check win condition
    let unrevealedSafeCells = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!newBoard[i][j].isMine && !newBoard[i][j].isRevealed) {
          unrevealedSafeCells++;
        }
      }
    }

    if (unrevealedSafeCells === 0) {
      sound.playNotify();
      setGameWon(true);
      setIsTimerRunning(false);
    }
  };

  // Flag cell
  const handleContextMenu = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (gameOver || gameWon || board[x][y].isRevealed) return;
    sound.playClick();

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    const current = newBoard[x][y].isFlagged;
    newBoard[x][y].isFlagged = !current;
    setFlagsRemaining(prev => current ? prev + 1 : prev - 1);
    setBoard(newBoard);
  };

  const NUMBER_COLORS: Record<number, string> = {
    1: 'text-blue-600',
    2: 'text-emerald-600',
    3: 'text-red-600',
    4: 'text-indigo-800',
    5: 'text-amber-800',
    6: 'text-teal-600',
    7: 'text-purple-800',
    8: 'text-gray-800',
  };

  return (
    <div className="flex flex-col h-full bg-[#cadbe8] p-3 select-none text-[#1b2d42]">
      {/* Top Menu Bar */}
      <div className="flex items-center justify-between text-[11px] mb-2 border-b border-[#a9c3d9] pb-1">
        <div className="flex gap-2">
          <button 
            onClick={() => setDifficulty('beginner')}
            className={`px-2 py-0.5 rounded cursor-pointer ${difficulty === 'beginner' ? 'bg-[#98c4e8] font-bold text-[#0c3963]' : 'hover:bg-[#b8d6ee]'}`}
          >
            Beginner (9×9)
          </button>
          <button 
            onClick={() => setDifficulty('intermediate')}
            className={`px-2 py-0.5 rounded cursor-pointer ${difficulty === 'intermediate' ? 'bg-[#98c4e8] font-bold text-[#0c3963]' : 'hover:bg-[#b8d6ee]'}`}
          >
            Intermediate (16×16)
          </button>
        </div>
      </div>

      {/* Main Board Container with Windows 7 3D border */}
      <div className="flex flex-col items-center bg-[#b8cde0] p-3 rounded border-2 border-t-white border-l-white border-b-[#7d9cb6] border-r-[#7d9cb6] shadow-sm">
        {/* Score Header */}
        <div className="w-full flex items-center justify-between bg-[#040e1a] border-2 border-[#547a9c] p-2 rounded-xs mb-3 font-mono font-bold text-red-500 text-xl tracking-widest shadow-inner">
          <div className="bg-[#120000] px-2 py-0.5 rounded border border-red-900/60">
            {String(Math.max(0, flagsRemaining)).padStart(3, '0')}
          </div>

          {/* Smiley Reset Button */}
          <button
            onClick={() => initGame(rows, cols, minesCount)}
            className="w-9 h-9 rounded-full bg-gradient-to-b from-[#ffef9e] to-[#ffc83b] border-2 border-[#b88c00] flex items-center justify-center text-xl shadow-xs hover:brightness-110 active:scale-95 transition-transform cursor-pointer"
            title="Reset Game"
          >
            {gameOver ? '😵' : gameWon ? '😎' : '🙂'}
          </button>

          <div className="bg-[#120000] px-2 py-0.5 rounded border border-red-900/60">
            {String(timer).padStart(3, '0')}
          </div>
        </div>

        {/* Board Cells Grid */}
        <div 
          className="grid gap-[1px] bg-[#7d9cb6] p-[2px] border-2 border-t-[#6b89a2] border-l-[#6b89a2] border-b-white border-r-white shadow-inner max-h-[460px] overflow-auto"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {board.map((row, rIdx) =>
            row.map((cell, cIdx) => (
              <button
                key={`${rIdx}-${cIdx}`}
                onClick={() => revealCell(rIdx, cIdx)}
                onContextMenu={(e) => handleContextMenu(e, rIdx, cIdx)}
                className={`w-6 h-6 sm:w-7 sm:h-7 text-xs font-bold flex items-center justify-center cursor-pointer transition-all ${
                  cell.isRevealed
                    ? cell.isMine
                      ? 'bg-red-500 text-white border border-red-700'
                      : 'bg-[#d6e3ee] border border-[#b2c8db]'
                    : 'bg-gradient-to-b from-[#ffffff] via-[#d4e4f3] to-[#b7d2ea] border border-t-white border-l-white border-b-[#6a8ea8] border-r-[#6a8ea8] hover:brightness-105 active:border-slate-400'
                }`}
              >
                {cell.isRevealed ? (
                  cell.isMine ? '💣' : cell.neighborMines > 0 ? (
                    <span className={NUMBER_COLORS[cell.neighborMines]}>
                      {cell.neighborMines}
                    </span>
                  ) : null
                ) : cell.isFlagged ? (
                  '🚩'
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

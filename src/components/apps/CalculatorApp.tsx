import React, { useState, useEffect } from 'react';
import { sound } from '../../utils/audio';

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState<string>('0');
  const [equation, setEquation] = useState<string>('');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);

  const inputDigit = (digit: string) => {
    sound.playClick();
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    sound.playClick();
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    sound.playClick();
    setDisplay('0');
    setEquation('');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    sound.playClick();
    setDisplay('0');
  };

  const backspace = () => {
    sound.playClick();
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const toggleSign = () => {
    sound.playClick();
    const val = parseFloat(display);
    setDisplay(String(-val));
  };

  const squareRoot = () => {
    sound.playClick();
    const val = parseFloat(display);
    if (val < 0) {
      setDisplay('Invalid input');
    } else {
      const res = Math.sqrt(val);
      setDisplay(String(res));
      setEquation(`sqrt(${val})`);
    }
  };

  const percent = () => {
    sound.playClick();
    const val = parseFloat(display);
    if (prevValue !== null) {
      const res = (prevValue * val) / 100;
      setDisplay(String(res));
    } else {
      setDisplay('0');
    }
  };

  const reciprocal = () => {
    sound.playClick();
    const val = parseFloat(display);
    if (val === 0) {
      setDisplay('Cannot divide by zero');
    } else {
      const res = 1 / val;
      setDisplay(String(res));
      setEquation(`1/(${val})`);
    }
  };

  const performOperation = (nextOp: string) => {
    sound.playClick();
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
      setEquation(`${inputValue} ${nextOp}`);
    } else if (operation) {
      const currentValue = prevValue || 0;
      let newValue = currentValue;

      if (operation === '+') newValue = currentValue + inputValue;
      else if (operation === '-') newValue = currentValue - inputValue;
      else if (operation === '×' || operation === '*') newValue = currentValue * inputValue;
      else if (operation === '÷' || operation === '/') {
        if (inputValue === 0) {
          setDisplay('Cannot divide by zero');
          setPrevValue(null);
          setOperation(null);
          return;
        }
        newValue = currentValue / inputValue;
      }

      setPrevValue(newValue);
      setDisplay(String(newValue));
      setEquation(`${newValue} ${nextOp}`);
    }

    setWaitingForOperand(true);
    setOperation(nextOp);
  };

  const handleEquals = () => {
    sound.playClick();
    if (operation === null || prevValue === null) return;
    const inputValue = parseFloat(display);
    let newValue = prevValue;

    if (operation === '+') newValue = prevValue + inputValue;
    else if (operation === '-') newValue = prevValue - inputValue;
    else if (operation === '×' || operation === '*') newValue = prevValue * inputValue;
    else if (operation === '÷' || operation === '/') {
      if (inputValue === 0) {
        setDisplay('Cannot divide by zero');
        setPrevValue(null);
        setOperation(null);
        return;
      }
      newValue = prevValue / inputValue;
    }

    setDisplay(String(newValue));
    setEquation('');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
      else if (e.key === '.') inputDecimal();
      else if (e.key === '+') performOperation('+');
      else if (e.key === '-') performOperation('-');
      else if (e.key === '*') performOperation('×');
      else if (e.key === '/') performOperation('÷');
      else if (e.key === 'Enter' || e.key === '=') handleEquals();
      else if (e.key === 'Backspace') backspace();
      else if (e.key === 'Escape') clearAll();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="flex flex-col h-full bg-[#eef3f7] p-3 select-none text-[#1b344e] font-sans">
      {/* Top Menu */}
      <div className="flex gap-3 text-[11px] mb-2 text-slate-600 border-b border-[#cbd7e2] pb-1">
        <span className="hover:text-blue-800 cursor-pointer">View</span>
        <span className="hover:text-blue-800 cursor-pointer">Edit</span>
        <span className="hover:text-blue-800 cursor-pointer">Help</span>
      </div>

      {/* Screen Display */}
      <div className="bg-[#fafffe] border border-[#7f9db9] rounded-xs p-2 mb-3 shadow-inner">
        <div className="text-[10px] text-slate-400 h-4 text-right truncate font-mono">
          {equation}
        </div>
        <div className="text-2xl font-mono text-right text-slate-900 font-semibold truncate">
          {display}
        </div>
      </div>

      {/* Memory Bar */}
      <div className="grid grid-cols-5 gap-1 mb-1.5 text-[11px]">
        <button onClick={() => { sound.playClick(); setMemory(0); }} className="win7-btn py-1">MC</button>
        <button onClick={() => { sound.playClick(); setDisplay(String(memory)); setWaitingForOperand(true); }} className="win7-btn py-1">MR</button>
        <button onClick={() => { sound.playClick(); setMemory(parseFloat(display)); }} className="win7-btn py-1">MS</button>
        <button onClick={() => { sound.playClick(); setMemory(prev => prev + parseFloat(display)); }} className="win7-btn py-1">M+</button>
        <button onClick={() => { sound.playClick(); setMemory(prev => prev - parseFloat(display)); }} className="win7-btn py-1">M-</button>
      </div>

      {/* Calculator Buttons Grid */}
      <div className="grid grid-cols-5 gap-1.5 flex-1 text-[13px] font-medium">
        <button onClick={backspace} className="win7-btn py-2">⌫</button>
        <button onClick={clearEntry} className="win7-btn py-2">CE</button>
        <button onClick={clearAll} className="win7-btn py-2">C</button>
        <button onClick={toggleSign} className="win7-btn py-2">±</button>
        <button onClick={squareRoot} className="win7-btn py-2">√</button>

        <button onClick={() => inputDigit('7')} className="win7-btn py-2 font-bold text-slate-800">7</button>
        <button onClick={() => inputDigit('8')} className="win7-btn py-2 font-bold text-slate-800">8</button>
        <button onClick={() => inputDigit('9')} className="win7-btn py-2 font-bold text-slate-800">9</button>
        <button onClick={() => performOperation('÷')} className="win7-btn py-2 text-blue-900 font-bold">÷</button>
        <button onClick={percent} className="win7-btn py-2">%</button>

        <button onClick={() => inputDigit('4')} className="win7-btn py-2 font-bold text-slate-800">4</button>
        <button onClick={() => inputDigit('5')} className="win7-btn py-2 font-bold text-slate-800">5</button>
        <button onClick={() => inputDigit('6')} className="win7-btn py-2 font-bold text-slate-800">6</button>
        <button onClick={() => performOperation('×')} className="win7-btn py-2 text-blue-900 font-bold">×</button>
        <button onClick={reciprocal} className="win7-btn py-2">1/x</button>

        <button onClick={() => inputDigit('1')} className="win7-btn py-2 font-bold text-slate-800">1</button>
        <button onClick={() => inputDigit('2')} className="win7-btn py-2 font-bold text-slate-800">2</button>
        <button onClick={() => inputDigit('3')} className="win7-btn py-2 font-bold text-slate-800">3</button>
        <button onClick={() => performOperation('-')} className="win7-btn py-2 text-blue-900 font-bold">−</button>
        <button onClick={handleEquals} className="win7-btn py-2 row-span-2 bg-gradient-to-b from-[#daf0ff] to-[#a4d2f5] border-[#5b95c2] font-bold text-[#0c406c] hover:brightness-105">=</button>

        <button onClick={() => inputDigit('0')} className="win7-btn py-2 col-span-2 font-bold text-slate-800">0</button>
        <button onClick={inputDecimal} className="win7-btn py-2 font-bold">.</button>
        <button onClick={() => performOperation('+')} className="win7-btn py-2 text-blue-900 font-bold">+</button>
      </div>
    </div>
  );
};

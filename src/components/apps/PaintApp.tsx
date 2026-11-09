import React, { useRef, useState, useEffect } from 'react';
import { 
  Pencil, 
  Paintbrush, 
  Eraser, 
  Square, 
  Circle, 
  Minus, 
  RotateCcw, 
  Trash2, 
  Download,
  Palette
} from 'lucide-react';
import { sound } from '../../utils/audio';

type ToolType = 'pencil' | 'brush' | 'eraser' | 'line' | 'rect' | 'circle';

const PALETTE_COLORS = [
  '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4',
  '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7'
];

export const PaintApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<ToolType>('brush');
  const [color, setColor] = useState<string>('#00a2e8');
  const [size, setSize] = useState<number>(4);
  const [history, setHistory] = useState<ImageData[]>([]);
  const isDrawing = useRef<boolean>(false);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const snapshot = useRef<ImageData | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  }, []);

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    const pos = getCanvasCoords(e);
    startPos.current = pos;
    snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.fillStyle = color;
    ctx.lineWidth = tool === 'eraser' ? size * 3 : (tool === 'pencil' ? 1 : size);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(pos.x, pos.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getCanvasCoords(e);

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (snapshot.current) {
      // For shapes, restore snapshot to preview
      ctx.putImageData(snapshot.current, 0, 0);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (tool === 'line') {
        ctx.moveTo(startPos.current.x, startPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === 'rect') {
        const w = pos.x - startPos.current.x;
        const h = pos.y - startPos.current.y;
        ctx.strokeRect(startPos.current.x, startPos.current.y, w, h);
      } else if (tool === 'circle') {
        const radius = Math.hypot(pos.x - startPos.current.x, pos.y - startPos.current.y);
        ctx.arc(startPos.current.x, startPos.current.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {}

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev.slice(-15), current]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    sound.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextHistory = history.slice(0, -1);
    const last = nextHistory[nextHistory.length - 1];
    ctx.putImageData(last, 0, 0);
    setHistory(nextHistory);
  };

  const handleClear = () => {
    sound.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const blank = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev, blank]);
  };

  const handleExport = () => {
    sound.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Paint_Drawing_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f4f8] select-none text-[#1a2d42]">
      {/* Ribbon Bar */}
      <div className="bg-gradient-to-b from-[#f9fbfd] to-[#e4eef6] border-b border-[#b9cee0] p-1.5 flex flex-wrap items-center gap-3 text-[11px]">
        {/* Tools Group */}
        <div className="flex items-center gap-1 border-r border-[#cbdbe7] pr-3">
          <button
            onClick={() => { setTool('brush'); sound.playClick(); }}
            className={`p-1.5 rounded cursor-pointer ${tool === 'brush' ? 'bg-[#c5e1f7] border border-[#7db0d8]' : 'hover:bg-[#dbe9f5] border border-transparent'}`}
            title="Brush"
          >
            <Paintbrush className="w-4 h-4 text-[#1b507f]" />
          </button>
          <button
            onClick={() => { setTool('pencil'); sound.playClick(); }}
            className={`p-1.5 rounded cursor-pointer ${tool === 'pencil' ? 'bg-[#c5e1f7] border border-[#7db0d8]' : 'hover:bg-[#dbe9f5] border border-transparent'}`}
            title="Pencil"
          >
            <Pencil className="w-4 h-4 text-[#1b507f]" />
          </button>
          <button
            onClick={() => { setTool('eraser'); sound.playClick(); }}
            className={`p-1.5 rounded cursor-pointer ${tool === 'eraser' ? 'bg-[#c5e1f7] border border-[#7db0d8]' : 'hover:bg-[#dbe9f5] border border-transparent'}`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4 text-[#bf3838]" />
          </button>
        </div>

        {/* Shapes Group */}
        <div className="flex items-center gap-1 border-r border-[#cbdbe7] pr-3">
          <button
            onClick={() => { setTool('line'); sound.playClick(); }}
            className={`p-1.5 rounded cursor-pointer ${tool === 'line' ? 'bg-[#c5e1f7] border border-[#7db0d8]' : 'hover:bg-[#dbe9f5] border border-transparent'}`}
            title="Line"
          >
            <Minus className="w-4 h-4 text-[#1b507f]" />
          </button>
          <button
            onClick={() => { setTool('rect'); sound.playClick(); }}
            className={`p-1.5 rounded cursor-pointer ${tool === 'rect' ? 'bg-[#c5e1f7] border border-[#7db0d8]' : 'hover:bg-[#dbe9f5] border border-transparent'}`}
            title="Rectangle"
          >
            <Square className="w-4 h-4 text-[#1b507f]" />
          </button>
          <button
            onClick={() => { setTool('circle'); sound.playClick(); }}
            className={`p-1.5 rounded cursor-pointer ${tool === 'circle' ? 'bg-[#c5e1f7] border border-[#7db0d8]' : 'hover:bg-[#dbe9f5] border border-transparent'}`}
            title="Circle"
          >
            <Circle className="w-4 h-4 text-[#1b507f]" />
          </button>
        </div>

        {/* Size Slider */}
        <div className="flex items-center gap-2 border-r border-[#cbdbe7] pr-3">
          <span className="text-slate-600">Size:</span>
          <input
            type="range"
            min="1"
            max="24"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-16 h-1 bg-[#b9d2e6] rounded cursor-pointer"
          />
          <span className="w-5 font-mono text-[10px]">{size}px</span>
        </div>

        {/* Color Palette Grid */}
        <div className="flex items-center gap-1.5 border-r border-[#cbdbe7] pr-3">
          <div className="grid grid-cols-10 gap-0.5">
            {PALETTE_COLORS.map((c) => (
              <div
                key={c}
                onClick={() => { setColor(c); sound.playClick(); }}
                style={{ backgroundColor: c }}
                className={`w-3.5 h-3.5 border cursor-pointer ${color === c ? 'border-black scale-110 shadow-xs' : 'border-slate-300'}`}
              />
            ))}
          </div>
          <label className="flex items-center gap-1 cursor-pointer pl-1" title="Color Picker">
            <Palette className="w-4 h-4 text-[#195a8f]" />
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)} 
              className="w-5 h-5 cursor-pointer rounded-xs border-0 p-0"
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button 
            onClick={handleUndo} 
            disabled={history.length <= 1}
            className="win7-btn px-2 py-1 flex items-center gap-1 cursor-pointer disabled:opacity-40"
            title="Undo"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Undo
          </button>
          <button 
            onClick={handleClear} 
            className="win7-btn px-2 py-1 flex items-center gap-1 cursor-pointer"
            title="Clear"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
          <button 
            onClick={handleExport} 
            className="win7-btn px-2 py-1 flex items-center gap-1 cursor-pointer text-[#0e4879] font-medium"
            title="Save Image"
          >
            <Download className="w-3.5 h-3.5" /> Save PNG
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="flex-1 overflow-auto bg-[#c8d6e3] p-3 flex items-center justify-center">
        <div className="shadow-lg border border-[#8faec5] bg-white">
          <canvas
            ref={canvasRef}
            width={800}
            height={550}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="touch-none cursor-crosshair block"
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-[#f0f4f8] border-t border-[#cbd7e2] px-3 py-1 flex items-center justify-between text-[11px] text-slate-500">
        <div>Canvas: 800 × 550px | Tool: {tool.toUpperCase()}</div>
        <div>Ready</div>
      </div>
    </div>
  );
};

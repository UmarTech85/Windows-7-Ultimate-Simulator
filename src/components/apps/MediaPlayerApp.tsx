import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  FolderOpen, 
  Music2, 
  Disc3,
  Repeat
} from 'lucide-react';
import { sound } from '../../utils/audio';

export const MediaPlayerApp: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trackName, setTrackName] = useState<string>('Kalimba - Mr. Scruff (Sample Music)');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(184); // 3:04
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Synthesizer simulation interval for ambient audio
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(t => (t >= duration ? 0 : t + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Audio Visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Background ambient gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#04172e');
      bgGrad.addColorStop(0.5, '#072445');
      bgGrad.addColorStop(1, '#020e1e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Windows 7 WMP classic spectrum bars
      const bars = 48;
      const barWidth = (width / bars) - 2;

      for (let i = 0; i < bars; i++) {
        let h = 8;
        if (isPlaying) {
          const wave1 = Math.sin((i * 0.28) + phase);
          const wave2 = Math.cos((i * 0.15) - phase * 1.5);
          h = Math.max(8, Math.abs(wave1 * wave2) * (height * 0.65));
        }

        const x = i * (barWidth + 2) + 4;
        const y = height - h - 14;

        const grad = ctx.createLinearGradient(0, y, 0, height);
        grad.addColorStop(0, '#75e6ff');
        grad.addColorStop(0.3, '#2ea4e8');
        grad.addColorStop(1, '#0b4a7d');

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, h);

        // Cap highlight
        ctx.fillStyle = isPlaying ? '#c9f5ff' : '#457b9d';
        ctx.fillRect(x, y - 2, barWidth, 2);
      }

      if (isPlaying) {
        phase += 0.08;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    sound.playClick();
    if (!isPlaying && !customAudioUrl) {
      sound.playNotify();
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    sound.playClick();
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sound.playNotify();
      const url = URL.createObjectURL(file);
      setCustomAudioUrl(url);
      setTrackName(file.name);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#0a1f36] select-none text-white">
      {/* Top Menu Bar */}
      <div className="bg-gradient-to-b from-[#183a5e] to-[#0c233c] border-b border-[#284f79] px-3 py-1 flex items-center justify-between text-[11px] text-[#b3d4f0]">
        <div className="flex items-center gap-3">
          <span className="hover:text-white cursor-pointer font-medium">Organize</span>
          <span className="hover:text-white cursor-pointer">Stream</span>
          <span className="hover:text-white cursor-pointer">Create playlist</span>
        </div>
        <label className="flex items-center gap-1.5 win7-btn px-2 py-0.5 text-xs text-slate-800 cursor-pointer">
          <FolderOpen className="w-3.5 h-3.5 text-[#145a94]" />
          <span>Open Media File...</span>
          <input type="file" accept="audio/*,video/*" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      {/* Media Visualizer Canvas */}
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={580}
          height={260}
          className="w-full h-full object-cover block"
        />

        {/* Track Title Overlay */}
        <div className="absolute top-4 left-4 flex items-center gap-2.5 bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-xs">
          <Disc3 className={`w-4 h-4 text-cyan-400 ${isPlaying ? 'animate-spin' : ''}`} />
          <span className="font-medium text-white truncate max-w-sm">{trackName}</span>
        </div>

        {customAudioUrl && (
          <audio
            ref={audioRef}
            src={customAudioUrl}
            autoPlay={isPlaying}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onEnded={() => setIsPlaying(false)}
          />
        )}
      </div>

      {/* Transport Controls Bar */}
      <div className="bg-gradient-to-b from-[#193a5e] to-[#07192d] border-t border-[#3b6691] p-3 flex flex-col gap-2 shadow-2xl">
        {/* Progress Bar & Time */}
        <div className="flex items-center gap-3 text-[11px] text-slate-300 font-mono">
          <span>{formatTime(currentTime)}</span>
          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              setCurrentTime(pos * duration);
            }}
            className="flex-1 h-2 bg-[#051322] border border-[#234b73] rounded-full overflow-hidden cursor-pointer relative"
          >
            <div 
              style={{ width: `${(currentTime / duration) * 100}%` }}
              className="h-full bg-gradient-to-r from-[#20a4f5] to-[#7ae0ff]"
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button className="win7-btn p-1.5 text-slate-800" title="Repeat">
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Core Playback Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { sound.playClick(); setCurrentTime(0); }}
              className="w-8 h-8 rounded-full border border-[#5889b5] bg-gradient-to-b from-[#2e5e8c] to-[#123354] flex items-center justify-center hover:brightness-125 shadow-xs cursor-pointer"
            >
              <SkipBack className="w-4 h-4 text-white" />
            </button>

            <button 
              onClick={togglePlay}
              className="w-11 h-11 rounded-full border-2 border-[#aae0ff] bg-gradient-to-b from-[#4fa9eb] to-[#0a528e] flex items-center justify-center hover:brightness-115 shadow-md shadow-cyan-500/30 cursor-pointer active:scale-95 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white fill-white" />
              ) : (
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              )}
            </button>

            <button 
              onClick={handleStop}
              className="w-8 h-8 rounded-full border border-[#5889b5] bg-gradient-to-b from-[#2e5e8c] to-[#123354] flex items-center justify-center hover:brightness-125 shadow-xs cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 text-white fill-white" />
            </button>

            <button 
              onClick={() => { sound.playClick(); setCurrentTime(0); }}
              className="w-8 h-8 rounded-full border border-[#5889b5] bg-gradient-to-b from-[#2e5e8c] to-[#123354] flex items-center justify-center hover:brightness-125 shadow-xs cursor-pointer"
            >
              <SkipForward className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-300 hover:text-white cursor-pointer"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setIsMuted(false);
              }}
              className="w-20 h-1 bg-[#102e4d] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

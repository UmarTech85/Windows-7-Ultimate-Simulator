import React, { useEffect, useRef, useState } from 'react';
import {
  Disc3,
  FolderOpen,
  ListMusic,
  Music2,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

interface MediaTrack {
  id: string;
  file: File;
  url: string;
}

export const MediaPlayerApp: React.FC = () => {
  const [tracks, setTracks] = useState<MediaTrack[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(true);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackError, setPlaybackError] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRootRef = useRef<HTMLDivElement>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const activeTrack = tracks[activeIndex] ?? null;

  useEffect(() => {
    return () => objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    const root = playerRootRef.current;
    if (!root) return;

    const observer = new ResizeObserver(([entry]) => {
      const nextIsCompact = (entry?.contentRect.width ?? root.clientWidth) < 540;
      setIsCompact((current) => current === nextIsCompact ? current : nextIsCompact);
    });

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume / 100;
  }, [isMuted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && activeTrack) {
      audio.play().catch(() => {
        setIsPlaying(false);
        setPlaybackError('This audio file could not be played in your browser.');
      });
    } else {
      audio.pause();
    }
  }, [activeTrack?.url, isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    let phase = 0;
    let animationFrame = 0;

    const draw = () => {
      const { width, height } = canvas;
      context.clearRect(0, 0, width, height);
      const count = 42;
      const gap = 3;
      const barWidth = (width - gap * (count + 1)) / count;

      for (let index = 0; index < count; index += 1) {
        const wave = Math.abs(Math.sin(index * 0.31 + phase) * Math.cos(index * 0.17 - phase * 1.4));
        const barHeight = isPlaying ? 7 + wave * (height - 16) : 4 + (index % 3) * 2;
        const x = gap + index * (barWidth + gap);
        const y = height - barHeight;
        const gradient = context.createLinearGradient(0, y, 0, height);
        gradient.addColorStop(0, '#b6f2ff');
        gradient.addColorStop(0.48, '#35b5f2');
        gradient.addColorStop(1, '#1462a1');
        context.fillStyle = gradient;
        context.fillRect(x, y, barWidth, barHeight);
      }

      if (isPlaying) {
        phase += 0.055;
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    draw();
    return () => window.cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    if (files.length === 0) return;

    const newTracks = files.map((file, index) => {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.push(url);
      return { id: `${file.name}-${file.lastModified}-${tracks.length + index}`, file, url };
    });

    setTracks((currentTracks) => [...currentTracks, ...newTracks]);
    setPlaybackError('');
    if (tracks.length === 0) {
      setActiveIndex(0);
      setIsPlaying(true);
    }
    event.currentTarget.value = '';
  };

  const handlePlayPause = () => {
    if (!activeTrack) {
      fileInputRef.current?.click();
      return;
    }
    setPlaybackError('');
    setIsPlaying((playing) => !playing);
  };

  const handlePrevious = () => {
    if (currentTime > 3 || activeIndex === 0) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    setActiveIndex((index) => Math.max(0, index - 1));
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (activeIndex < tracks.length - 1) {
      setActiveIndex((index) => Math.min(tracks.length - 1, index + 1));
      setIsPlaying(true);
      return;
    }
    if (audioRef.current) audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const handleEnded = () => {
    if (activeIndex < tracks.length - 1) {
      setActiveIndex((index) => index + 1);
      return;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60);
    return `${minutes}:${remainder.toString().padStart(2, '0')}`;
  };

  const renderTrackList = (compact = false) => (
    tracks.length > 0 ? (
      <ol aria-label="Playlist" className="flex flex-col gap-1">
        {tracks.map((track, index) => (
          <li key={track.id}>
            <button
              type="button"
              aria-current={index === activeIndex ? 'true' : 'false'}
              onClick={() => {
                setActiveIndex(index);
                setIsPlaying(true);
                setPlaybackError('');
                setIsQueueOpen(false);
              }}
              className="flex w-full min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-left text-[11px] text-slate-600 transition-colors hover:bg-white/80 hover:text-[#123b61] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 aria-[current=true]:bg-[#d8ecf9] aria-[current=true]:text-[#123b61]"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#2484c2] shadow-sm">
                {index === activeIndex && isPlaying ? <Music2 className="size-3.5" aria-hidden="true" /> : <Disc3 className="size-3.5" aria-hidden="true" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{track.file.name}</span>
                {!compact && <span className="mt-0.5 block text-[10px] text-slate-400">Local audio</span>}
              </span>
            </button>
          </li>
        ))}
      </ol>
    ) : (
      <p className="rounded-xl border border-dashed border-sky-900/15 bg-white/55 px-3 py-4 text-center text-[11px] leading-relaxed text-slate-500">
        Open audio files to add them to your playlist.
      </p>
    )
  );

  return (
    <div ref={playerRootRef} className="flex h-full min-h-0 flex-col overflow-hidden bg-[#eaf1f6] text-[#173653]">
      <header className="relative flex min-h-12 items-center justify-between gap-2 border-b border-white/80 bg-gradient-to-b from-[#f9fdff] via-[#e8f3fb] to-[#c9dfef] px-3 shadow-[inset_0_1px_0_white,0_2px_6px_rgba(24,65,100,0.14)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/90" />
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/90 bg-gradient-to-br from-[#87d8ff] via-[#258dcc] to-[#1260a0] text-white shadow-[0_2px_5px_rgba(14,68,112,0.28),inset_0_1px_0_rgba(255,255,255,0.8)]">
            <Disc3 className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold tracking-tight text-[#173c60]">Now Playing</p>
            <p className="text-[9px] uppercase tracking-[0.16em] text-[#52718c]">Windows Media Player</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span style={{ display: isCompact ? 'none' : 'inline' }} className="text-[10px] font-medium text-[#55748f]">{tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-8 items-center gap-1.5 rounded-lg border border-white/90 bg-gradient-to-b from-white to-[#dcecf7] px-3 text-[11px] font-semibold text-[#17517d] shadow-[0_1px_3px_rgba(22,59,88,0.18),inset_0_1px_0_white] transition hover:brightness-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <FolderOpen className="size-3.5" aria-hidden="true" />
            <span>Open media</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            aria-label="Choose local audio files"
            onChange={handleFileUpload}
          />
        </div>
      </header>

      <div
        className="relative grid min-h-0 flex-1 grid-cols-1 overflow-hidden"
        style={{ gridTemplateColumns: isCompact ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) 176px' }}
      >
        <section
          aria-label="Now playing"
          className="relative flex min-h-0 flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_28%,#ffffff_0%,#f4f9fc_42%,#e2eef6_100%)] px-3 py-3"
        >
          <canvas
            ref={canvasRef}
            width={520}
            height={76}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[58px] w-full opacity-35"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/55 to-transparent" />

          <div className="relative z-[1] flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-3 text-center">
            <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#64829b]">{activeTrack ? 'Now playing' : 'Your personal music library'}</span>
            <div className="relative flex size-[112px] shrink-0 items-center justify-center rounded-[26px] border border-white bg-gradient-to-br from-[#9de7ff] via-[#348dc4] to-[#174c83] p-2 shadow-[0_12px_26px_rgba(26,86,131,0.24),inset_0_1px_0_rgba(255,255,255,0.9)] sm:size-[132px]">
              <div className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full border border-white/90 bg-gradient-to-br from-[#f9feff] to-[#c6e7f8] text-[#287eb2] shadow-md">
                <Music2 className="size-4" aria-hidden="true" />
              </div>
              <div className="flex size-full items-center justify-center rounded-[20px] border border-white/35 bg-[radial-gradient(circle_at_34%_28%,#2b78a9,#0c315b_72%)] shadow-inner">
                <Disc3 className="size-[68px] text-[#c5f3ff] drop-shadow-[0_4px_8px_rgba(0,0,0,0.28)] sm:size-[82px]" strokeWidth={1.1} aria-hidden="true" />
              </div>
              <span className="absolute inset-1 rounded-[22px] border border-white/20" aria-hidden="true" />
            </div>

            <div className="z-[1] min-w-0 max-w-full px-3">
              <p className="truncate text-[15px] font-semibold tracking-tight text-[#183b5a] sm:text-base">
                {activeTrack ? activeTrack.file.name.replace(/\.[^/.]+$/, '') : 'A soundtrack for every moment'}
              </p>
              <p className="mt-1 truncate text-[10px] text-[#66819a] sm:text-[11px]">
                {activeTrack ? 'Playing from this device' : 'Open your favorite audio to get started'}
              </p>
              {playbackError && <p role="status" className="mt-1 text-[10px] text-rose-700">{playbackError}</p>}
            </div>
            {!activeTrack && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="z-[1] mt-0.5 rounded-full border border-[#8bb9d7] bg-gradient-to-b from-white to-[#e4f2fa] px-4 py-2 text-[10px] font-semibold text-[#225b83] shadow-sm transition hover:brightness-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                Choose an audio file
              </button>
            )}
          </div>

          <button
            type="button"
            aria-expanded={isQueueOpen}
            aria-controls="mobile-playlist"
            onClick={() => setIsQueueOpen((open) => !open)}
            style={{ display: isCompact ? 'flex' : 'none' }}
            className="absolute right-3 top-3 z-[2] items-center gap-1.5 rounded-lg border border-white/90 bg-white/80 px-2.5 py-1.5 text-[10px] font-medium text-[#285d83] shadow-sm backdrop-blur"
          >
            <ListMusic className="size-3.5" aria-hidden="true" />
            Playlist <span className="text-cyan-200">{tracks.length}</span>
          </button>

          <div
              id="mobile-playlist"
              hidden={!isCompact || !isQueueOpen}
              role="region"
              aria-label="Playlist"
              className="absolute inset-x-3 bottom-3 z-[3] max-h-[72%] overflow-auto rounded-xl border border-white/90 bg-[#f4f9fc]/95 p-2 shadow-xl backdrop-blur-md"
            >
              <div className="mb-1 flex items-center justify-between px-1">
                <h2 className="text-[10px] font-semibold uppercase tracking-wider text-blue-100/70">Playlist</h2>
                <button type="button" aria-label="Close playlist" onClick={() => setIsQueueOpen(false)} className="rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white">
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </div>
              {renderTrackList(true)}
            </div>
        </section>

        <aside
          aria-label="Playlist"
          style={{ display: isCompact ? 'none' : 'flex' }}
          className="min-h-0 flex-col border-l border-white/90 bg-gradient-to-b from-[#f7fbfe] to-[#e5eff6] shadow-[-3px_0_10px_rgba(36,76,110,0.05)]"
        >
          <div className="flex min-h-11 items-center justify-between border-b border-[#d4e2ec] px-3">
            <div>
              <h2 className="text-[11px] font-semibold text-[#234868]">Playlist</h2>
              <p className="text-[9px] font-medium tracking-[0.14em] text-[#718ca2]">UP NEXT</p>
            </div>
            <span className="rounded-full border border-white bg-white/80 px-2 py-0.5 text-[9px] font-semibold text-[#49718e] shadow-sm">{tracks.length}</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {renderTrackList()}
          </div>
          <div className="border-t border-[#d4e2ec] px-3 py-2 text-[9px] leading-relaxed text-slate-500">
            Your media stays on this device.
          </div>
        </aside>
      </div>

      <footer className="shrink-0 border-t border-white/90 bg-gradient-to-b from-[#e8f3fa] to-[#cbdfee] px-3 pb-2 pt-2 shadow-[0_-3px_10px_rgba(31,72,106,0.11),inset_0_1px_0_white]">
        <div className="flex items-center gap-2 text-[10px] font-mono text-[#5c7891]">
          <span className="w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            aria-label="Seek through track"
            disabled={!activeTrack}
            onChange={(event) => {
              const nextTime = Number(event.currentTarget.value);
              setCurrentTime(nextTime);
              if (audioRef.current) audioRef.current.currentTime = nextTime;
            }}
            className="h-1.5 min-w-0 flex-1 cursor-pointer accent-[#2489c4] disabled:cursor-not-allowed disabled:opacity-40"
          />
          <span className="w-8 tabular-nums">{formatTime(duration)}</span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-1">
          <button
            type="button"
            aria-label="Repeat track"
            aria-pressed={isRepeating}
            onClick={() => setIsRepeating((repeat) => !repeat)}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#b6cad9] bg-white/55 text-[#587a96] transition hover:bg-white aria-pressed:border-[#4b9bc8] aria-pressed:bg-[#d8effb] aria-pressed:text-[#146c9e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <Repeat className="size-4" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-1.5">
            <button type="button" aria-label="Previous track" onClick={handlePrevious} disabled={!activeTrack} className="flex size-8 items-center justify-center rounded-full border border-white/90 bg-gradient-to-b from-white to-[#d6e6f1] text-[#315d7e] shadow-[0_1px_3px_rgba(25,61,91,0.2),inset_0_1px_0_white] transition hover:brightness-[1.03] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
              <SkipBack className="size-4" aria-hidden="true" />
            </button>
            <button type="button" aria-label={isPlaying ? 'Pause' : activeTrack ? 'Play' : 'Open media to play'} onClick={handlePlayPause} className="flex size-11 items-center justify-center rounded-full border-2 border-white bg-gradient-to-b from-[#54b8e8] to-[#1476b2] text-white shadow-[0_3px_8px_rgba(20,90,140,0.34),inset_0_1px_0_rgba(255,255,255,0.7)] transition hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
              {isPlaying ? <Pause className="size-4 fill-current" aria-hidden="true" /> : <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />}
            </button>
            <button type="button" aria-label="Stop" onClick={() => { setIsPlaying(false); setCurrentTime(0); if (audioRef.current) audioRef.current.currentTime = 0; }} disabled={!activeTrack} className="flex size-8 items-center justify-center rounded-full border border-white/90 bg-gradient-to-b from-white to-[#d6e6f1] text-[#315d7e] shadow-[0_1px_3px_rgba(25,61,91,0.2),inset_0_1px_0_white] transition hover:brightness-[1.03] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
              <Square className="size-3.5 fill-current" aria-hidden="true" />
            </button>
            <button type="button" aria-label="Next track" onClick={handleNext} disabled={!activeTrack} className="flex size-8 items-center justify-center rounded-full border border-white/90 bg-gradient-to-b from-white to-[#d6e6f1] text-[#315d7e] shadow-[0_1px_3px_rgba(25,61,91,0.2),inset_0_1px_0_white] transition hover:brightness-[1.03] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
              <SkipForward className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
              aria-pressed={isMuted}
              onClick={() => setIsMuted((muted) => !muted)}
              className="flex size-7 items-center justify-center rounded-md text-[#567791] transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              {isMuted || volume === 0 ? <VolumeX className="size-4" aria-hidden="true" /> : <Volume2 className="size-4" aria-hidden="true" />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              aria-label="Volume"
              onChange={(event) => {
                setVolume(Number(event.currentTarget.value));
                setIsMuted(false);
              }}
              className="h-1 w-12 cursor-pointer accent-[#2489c4] min-[540px]:w-16"
            />
          </div>
        </div>
      </footer>

      <audio
        ref={audioRef}
        src={activeTrack?.url}
        loop={isRepeating}
        preload="metadata"
        className="sr-only"
        aria-label="Media playback"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          const mediaDuration = event.currentTarget.duration;
          setDuration(Number.isFinite(mediaDuration) ? mediaDuration : 0);
        }}
        onEnded={handleEnded}
        onError={() => {
          if (activeTrack) setPlaybackError('This audio file could not be played in your browser.');
          setIsPlaying(false);
        }}
      />
    </div>
  );
};

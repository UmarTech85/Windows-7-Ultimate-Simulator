/**
 * Lightweight Web Audio API synthesizer for iconic Windows 7 sound effects.
 * No external MP3 downloads required; instantaneous latency and zero network lag.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Iconic Windows 7 Startup Chime: 4-note lush chord (Eb3, Bb3, Eb4, G4)
   * with soft warm attack and decaying reverb shimmer.
   */
  public playStartup() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Frequencies for iconic chord
      const notes = [
        { freq: 155.56, time: 0.0, dur: 3.2, gain: 0.22, type: 'sine' as OscillatorType }, // Eb3
        { freq: 233.08, time: 0.18, dur: 3.0, gain: 0.20, type: 'sine' as OscillatorType }, // Bb3
        { freq: 311.13, time: 0.42, dur: 2.8, gain: 0.24, type: 'sine' as OscillatorType }, // Eb4
        { freq: 392.00, time: 0.72, dur: 3.2, gain: 0.22, type: 'triangle' as OscillatorType }, // G4
        { freq: 622.25, time: 0.95, dur: 2.5, gain: 0.12, type: 'sine' as OscillatorType }, // Eb5 sparkle
      ];

      notes.forEach(({ freq, time, dur, gain, type }) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + time);

        // Soft envelope
        g.gain.setValueAtTime(0.0001, now + time);
        g.gain.exponentialRampToValueAtTime(gain, now + time + 0.12);
        g.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

        osc.connect(g);
        g.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.1);
      });
    } catch {
      // Audio playback fails gracefully if audio context not unlocked yet
    }
  }

  /**
   * Classic Windows Navigation Click
   */
  public playClick() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      g.gain.setValueAtTime(0.08, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  /**
   * Windows 7 Minimize / Balloon chime
   */
  public playMinimize() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.14);

      g.gain.setValueAtTime(0.12, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  /**
   * Windows 7 Hardware insert / notify chime
   */
  public playNotify() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [
        { freq: 440, time: 0, dur: 0.1 },
        { freq: 659.25, time: 0.09, dur: 0.16 },
      ].forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);
        g.gain.setValueAtTime(0.12, now + time);
        g.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + dur + 0.05);
      });
    } catch {}
  }

  /**
   * Windows 7 Exclamation / Asterisk Chord
   */
  public playError() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [
        { freq: 415.3, gain: 0.16 },
        { freq: 523.25, gain: 0.14 },
        { freq: 622.25, gain: 0.14 },
      ].forEach(({ freq, gain }) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(gain, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      });
    } catch {}
  }
}

export const sound = new SoundEngine();

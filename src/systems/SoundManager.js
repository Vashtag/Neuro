// SoundManager: synthesizes cozy SFX at runtime via the WebAudio API, so the
// game needs zero audio files. Every call is wrapped so a missing/blocked audio
// context can never crash the game (audio simply stays silent).
//
// Real .wav files can replace this later by pointing play() at Phaser's audio
// cache; the call sites (scene.sfx('plant'), etc.) stay unchanged.

export default class SoundManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
    this.muted = false;
  }

  ensureContext() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return this.ctx;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) {
        this.enabled = false;
        return null;
      }
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    } catch (e) {
      this.enabled = false;
    }
    return this.ctx;
  }

  // One short oscillator note with a gain envelope.
  note({ freq = 440, type = 'sine', start = 0, dur = 0.15, gain = 0.08, freqEnd = null }) {
    const ctx = this.ctx;
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  play(key) {
    if (!this.enabled || this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      switch (key) {
        case 'till':
          this.note({ freq: 180, type: 'square', dur: 0.08, gain: 0.05 });
          break;
        case 'plant':
          this.note({ freq: 440, type: 'sine', dur: 0.12, gain: 0.07, freqEnd: 680 });
          break;
        case 'water':
          this.note({ freq: 900, type: 'triangle', dur: 0.05, gain: 0.04 });
          this.note({ freq: 1100, type: 'triangle', start: 0.06, dur: 0.05, gain: 0.04 });
          this.note({ freq: 800, type: 'triangle', start: 0.12, dur: 0.05, gain: 0.035 });
          break;
        case 'harvest':
          this.note({ freq: 660, type: 'sine', dur: 0.1, gain: 0.07 });
          this.note({ freq: 880, type: 'sine', start: 0.09, dur: 0.14, gain: 0.07 });
          break;
        case 'archive':
          this.note({ freq: 330, type: 'sine', dur: 0.5, gain: 0.06 });
          this.note({ freq: 495, type: 'sine', start: 0.05, dur: 0.5, gain: 0.05 });
          this.note({ freq: 660, type: 'sine', start: 0.1, dur: 0.5, gain: 0.05 });
          break;
        case 'fogClear':
          this.note({ freq: 400, type: 'sine', dur: 0.9, gain: 0.06, freqEnd: 1200 });
          this.note({ freq: 600, type: 'triangle', start: 0.15, dur: 0.7, gain: 0.04, freqEnd: 1400 });
          break;
        case 'sleep':
          this.note({ freq: 520, type: 'sine', dur: 0.7, gain: 0.06, freqEnd: 180 });
          break;
        case 'dialogue':
          this.note({ freq: 320, type: 'triangle', dur: 0.04, gain: 0.03 });
          break;
        case 'unavailable':
          this.note({ freq: 200, type: 'sine', dur: 0.07, gain: 0.03 });
          break;
        default:
          break;
      }
    } catch (e) {
      /* never let audio crash gameplay */
    }
  }

  setMuted(m) {
    this.muted = m;
  }
}

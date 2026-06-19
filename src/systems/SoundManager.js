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
    this.musicGain = null;
    this.sfxGain = null;
    this.enabled = true;
    this.muted = false;
    // Volumes (0..1); overridden by Settings on scene start.
    this.musicVolume = 0.6;
    this.sfxVolume = 0.8;
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
      this.master.gain.value = this.muted ? 0 : 0.6;
      this.master.connect(this.ctx.destination);
      // Separate buses so Music and SFX volumes are independent.
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.master);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.master);
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
    g.connect(this.sfxGain || this.master);
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
        case 'confirm':
          this.note({ freq: 523, type: 'sine', dur: 0.1, gain: 0.05 });
          this.note({ freq: 784, type: 'sine', start: 0.07, dur: 0.14, gain: 0.05 });
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

  // A soft, low ambient pad that loops for the whole session. Two detuned
  // oscillators through a gentle gain; safe to call repeatedly.
  startAmbient() {
    if (!this.enabled || this.ambient) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const bus = ctx.createGain();
      bus.gain.value = 0.05;
      bus.connect(this.musicGain || this.master);

      const voices = [98, 146.83, 196].map((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 2 ? 'triangle' : 'sine';
        osc.frequency.value = freq;
        osc.detune.value = i * 4;
        osc.connect(bus);
        osc.start();
        return osc;
      });

      // Slow "breathing" of the pad volume.
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.06;
      lfoGain.gain.value = 0.02;
      lfo.connect(lfoGain);
      lfoGain.connect(bus.gain);
      lfo.start();

      this.ambient = { bus, voices, lfo };
    } catch (e) {
      /* ambient is optional; never crash */
    }
  }

  stopAmbient() {
    if (!this.ambient) return;
    try {
      this.ambient.voices.forEach((o) => o.stop());
      this.ambient.lfo.stop();
    } catch (e) {
      /* ignore */
    }
    this.ambient = null;
  }

  setMuted(m) {
    this.muted = m;
    // Master gate silences both buses (sfx + ambient pad) at once.
    if (this.master) {
      try {
        this.master.gain.value = m ? 0 : 0.6;
      } catch (e) {
        /* ignore */
      }
    }
  }

  setMusicVolume(v) {
    this.musicVolume = clamp01(v);
    if (this.musicGain) {
      try {
        this.musicGain.gain.value = this.musicVolume;
      } catch (e) {
        /* ignore */
      }
    }
  }

  setSfxVolume(v) {
    this.sfxVolume = clamp01(v);
    if (this.sfxGain) {
      try {
        this.sfxGain.gain.value = this.sfxVolume;
      } catch (e) {
        /* ignore */
      }
    }
  }
}

function clamp01(v) {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

/**
 * Lumen: Ultra-Fast Instant Audio Engine
 * 0ms latency sound synthesis: pops, bubble bursts, singing bowls, and ambient soundscapes
 * start playing immediately on click with zero delay or network stall.
 */

class LumenAudioEngine {
  constructor() {
    this.ctx = null;
    this.ambientGain = null;
    this.ambientNodes = [];
    this.currentAmbientType = 'off';
    this.rainBuffer = null;
    this.customSounds = {};
    this.availableCustomSounds = new Set();
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.pregenerateRainBuffer();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {}
  }

  isSoundEnabled() {
    return window.LumenState ? window.LumenState.getSettings().soundEnabled : true;
  }

  /**
   * Pre-generate noise buffer once so rain starts in 0ms with zero CPU stall
   */
  pregenerateRainBuffer() {
    if (!this.ctx || this.rainBuffer) return;
    try {
      const length = this.ctx.sampleRate * 1.5;
      this.rainBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = this.rainBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.12;
      }
    } catch (e) {}
  }

  /**
   * Instant tactile button pop (0ms delay)
   */
  playPop() {
    if (!this.isSoundEnabled()) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.045);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  /**
   * Instant bubble pop (0ms delay)
   */
  playBubblePop() {
    if (!this.isSoundEnabled()) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(230, now + 0.055);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  /**
   * Instant watering / seed plant sparkle
   */
  playSeedPlant() {
    if (!this.isSoundEnabled()) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.06, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.18);
      });
    } catch (e) {}
  }

  /**
   * Instant success chime
   */
  playSuccessChime() {
    if (!this.isSoundEnabled()) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880];
      const now = this.ctx.currentTime;
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.07, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.55);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.6);
      });
    } catch (e) {}
  }

  /**
   * Instant Singing Bowl / Focus Completion Chime
   */
  playZenChime() {
    if (!this.isSoundEnabled()) return;
    this.init();
    if (!this.ctx) return;

    try {
      const fundamental = 396;
      const harmonics = [1, 2.01, 3.02, 4.04];
      const now = this.ctx.currentTime;

      harmonics.forEach((h, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(fundamental * h, now);

        const initialVol = 0.08 / (index + 1);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(initialVol, now + 0.05); // strike immediately
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 4.3);
      });
    } catch (e) {}
  }

  /**
   * Instant Ambient Soundscapes (Zero 600ms delay, instant audio playback)
   */
  setAmbient(type, volume = 0.25) {
    this.init();
    this.currentAmbientType = type;

    // Immediately stop running ambient sounds
    if (this.ambientNodes.length > 0) {
      this.ambientNodes.forEach(node => {
        try {
          if (node.stop) node.stop();
          node.disconnect();
        } catch (e) {}
      });
      this.ambientNodes = [];
    }

    if (this.ambientGain) {
      try { this.ambientGain.disconnect(); } catch (e) {}
      this.ambientGain = null;
    }

    if (type === 'off' || !this.isSoundEnabled() || !this.ctx) return;

    // Start new ambient soundscape IMMEDIATELY
    this.startAmbientSynthesis(type, volume);
  }

  startAmbientSynthesis(type, volume) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    this.ambientGain = this.ctx.createGain();
    // Fast 100ms fade-in so sound starts playing instantly without audible click
    this.ambientGain.gain.setValueAtTime(0.01, now);
    this.ambientGain.gain.linearRampToValueAtTime(volume * 0.35, now + 0.15);
    this.ambientGain.connect(this.ctx.destination);

    if (type === 'rain') {
      if (!this.rainBuffer) {
        this.pregenerateRainBuffer();
      }
      if (this.rainBuffer) {
        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = this.rainBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, now);

        whiteNoise.connect(filter);
        filter.connect(this.ambientGain);

        whiteNoise.start(now);
        this.ambientNodes.push(whiteNoise);
      }
    } else if (type === 'garden') {
      // Wind rustle + soft garden drone
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(144, now);
      osc2.frequency.setValueAtTime(216, now);

      osc1.connect(this.ambientGain);
      osc2.connect(this.ambientGain);

      osc1.start(now);
      osc2.start(now);
      this.ambientNodes.push(osc1, osc2);
    } else if (type === 'bowl' || type === 'hum') {
      // Warm meditative singing bowl / sanctuary hum
      [216, 432, 528].forEach(freq => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.connect(this.ambientGain);
        osc.start(now);
        this.ambientNodes.push(osc);
      });
    }
  }
}

window.LumenAudio = new LumenAudioEngine();

// Quick click listener with immediate pop sound
document.addEventListener('click', (e) => {
  try {
    window.LumenAudio?.init();
    const target = e.target?.closest?.('button, .nav-link, .nav-btn, .step, .cal-day, .todo-check, .pomo-ring, .garden-card');
    if (target) {
      window.LumenAudio?.playPop();
    }
  } catch (err) {}
}, { passive: true });

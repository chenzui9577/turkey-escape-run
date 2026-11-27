// audio.js — hand-synthesised WebAudio sounds: no audio files, everything is
// oscillators and noise shaped on the spot. Muted state persists per session only.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  tone(freqFrom, freqTo, seconds, type = 'square', volume = 0.12, delay = 0) {
    if (this.muted || !this.ensure()) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqFrom, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqTo), t0 + seconds);
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + seconds);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0); osc.stop(t0 + seconds + 0.02);
  }

  jump()  { this.tone(320, 660, 0.16, 'square', 0.08); }
  slide() { this.tone(220, 110, 0.14, 'sawtooth', 0.05); }
  corn()  { this.tone(880, 1320, 0.1, 'sine', 0.11); this.tone(1320, 1760, 0.12, 'sine', 0.08, 0.06); }
  chili() { this.tone(300, 1400, 0.3, 'sawtooth', 0.1); }
  smash() { this.tone(160, 50, 0.22, 'square', 0.16); this.tone(90, 40, 0.3, 'triangle', 0.14, 0.02); }
  hurt()  { this.tone(420, 90, 0.32, 'sawtooth', 0.14); }
  alarm() { this.tone(740, 740, 0.1, 'square', 0.07); this.tone(740, 740, 0.1, 'square', 0.07, 0.14); }
  win()   { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, f, 0.22, 'triangle', 0.12, i * 0.13)); }
  caught(){ [392, 330, 262, 196].forEach((f, i) => this.tone(f, f * 0.94, 0.24, 'triangle', 0.12, i * 0.15)); }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

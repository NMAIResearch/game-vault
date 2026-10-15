// Sound effects made with WebAudio, plus the looping soundtrack. Nothing plays before a tap or click.
export class Audio {
  constructor() {
    this.ctx = null; this.sfxOn = true; this.musicOn = true;
    this.music = null; this.last = {};
  }

  // Call from a user gesture.
  unlock() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
          this.ctx = new AC();
          this.master = this.ctx.createGain(); this.master.gain.value = 0.55;
          this.comp = this.ctx.createDynamicsCompressor();
          this.master.connect(this.comp); this.comp.connect(this.ctx.destination);
        }
      } catch { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    if (!this.music) {
      this.music = new window.Audio('soundtrack.mp3');
      this.music.loop = true; this.music.volume = 0.42; this.music.preload = 'auto';
    }
    this.syncMusic();
  }

  setMusic(on) { this.musicOn = on; this.syncMusic(); }
  setSfx(on) { this.sfxOn = on; }
  duck(paused) { this.paused = paused; this.syncMusic(); }
  syncMusic() {
    if (!this.music) return;
    if (this.musicOn && !this.paused) { const p = this.music.play(); if (p && p.catch) p.catch(() => {}); }
    else this.music.pause();
  }

  ok(name, gap) {
    if (!this.ctx || !this.sfxOn) return false;
    const now = this.ctx.currentTime;
    if (gap && this.last[name] !== undefined && now - this.last[name] < gap) return false;
    this.last[name] = now;
    return true;
  }

  tone({ type = 'sine', f0, f1, dur, vol = 0.2, delay = 0, attack = 0.008 }) {
    const c = this.ctx, t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  // Soft bloop; bigger things sound lower and longer. Many swallows in one frame make one sound.
  swallow(rel, size) {
    if (!this.ok('swallow', 0.045)) return;
    const base = 520 / Math.pow(1 + size, 0.45);
    const f = base * (0.92 + Math.random() * 0.16);
    this.tone({ f0: f * 1.6, f1: f * 0.55, dur: 0.12 + 0.18 * Math.min(1, rel), vol: 0.12 + 0.1 * Math.min(1, rel) });
    if (size > 4 && this.ok('rumble', 0.25)) this.tone({ type: 'triangle', f0: 70, f1: 38, dur: 0.6, vol: 0.18 });
  }

  tierUp(tier) {
    if (!this.ok('tier')) return;
    const root = 262 * Math.pow(2, (tier % 5) / 12 * 2);
    [0, 4, 7, 12].forEach((s, i) => this.tone({ type: 'triangle', f0: root * Math.pow(2, s / 12), dur: 0.5, vol: 0.12, delay: i * 0.07, attack: 0.02 }));
  }

  bump() { if (this.ok('bump', 0.35)) this.tone({ type: 'sine', f0: 140, f1: 230, dur: 0.18, vol: 0.12 }); }
  yelp() { if (this.ok('yelp', 0.5)) { const f = 700 + Math.random() * 300; this.tone({ type: 'square', f0: f, f1: f * 1.5, dur: 0.12, vol: 0.035 }); } }
  bark() { if (this.ok('bark', 0.6)) { this.tone({ type: 'sawtooth', f0: 320, f1: 180, dur: 0.08, vol: 0.04 }); this.tone({ type: 'sawtooth', f0: 330, f1: 190, dur: 0.08, vol: 0.04, delay: 0.13 }); } }
  honk() { if (this.ok('honk', 0.7)) { this.tone({ type: 'square', f0: 392, dur: 0.16, vol: 0.035 }); this.tone({ type: 'square', f0: 494, dur: 0.16, vol: 0.03 }); } }
  coo() { if (this.ok('coo', 0.8)) this.tone({ type: 'sine', f0: 420, f1: 300, dur: 0.15, vol: 0.05 }); }
  burp() { if (this.ok('burp', 1)) { this.tone({ type: 'sawtooth', f0: 95, f1: 60, dur: 0.45, vol: 0.09 }); this.tone({ type: 'sine', f0: 140, f1: 80, dur: 0.4, vol: 0.12 }); } }
  click() { if (this.ok('click', 0.05)) this.tone({ f0: 880, f1: 660, dur: 0.06, vol: 0.06 }); }
  fanfare() {
    if (!this.ok('fanfare')) return;
    [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => this.tone({ type: 'triangle', f0: 330 * Math.pow(2, s / 12), dur: 0.45, vol: 0.1, delay: i * 0.09, attack: 0.02 }));
  }
}

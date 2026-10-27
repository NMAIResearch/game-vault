(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ThinkAgainMusic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  class Player {
    constructor(audio, tracks, notify = () => {}) {
      this.audio = audio; this.tracks = tracks; this.notify = notify;
      this.index = 0; this.wanted = false; this.playing = false; this.missing = false;
      this.failed = new Set(); this.attempt = 0;
      audio.addEventListener('ended', () => { if (this.wanted) this.next(); });
      audio.addEventListener('playing', () => {
        if (!this.wanted) { audio.pause(); return; }
        this.playing = true; this.missing = false; this.notify();
      });
      audio.addEventListener('pause', () => { this.playing = false; this.notify(); });
      audio.addEventListener('error', () => { if (audio.error) this.fail(this.attempt); });
    }
    pause() {
      this.attempt++; this.wanted = false; this.playing = false;
      this.audio.pause(); this.notify();
    }
    start() {
      if (this.failed.size === this.tracks.length) { this.failed.clear(); this.index = 0; }
      this.wanted = true; this.missing = false; this.play();
    }
    next() {
      for (let step = 1; step <= this.tracks.length; step++) {
        const n = (this.index + step) % this.tracks.length;
        if (!this.failed.has(n)) { this.index = n; this.play(); return; }
      }
      this.pause(); this.missing = true; this.notify();
    }
    fail(attempt) {
      if (!this.wanted || attempt !== this.attempt || this.failed.has(this.index)) return;
      this.failed.add(this.index); this.next();
    }
    play() {
      const attempt = ++this.attempt;
      const reject = error => {
        if (!this.wanted || attempt !== this.attempt) return;
        if (['NotAllowedError','AbortError'].includes(error?.name)) {
          this.pause(); this.missing = true; this.notify();
        } else this.fail(attempt);
      };
      const track = this.tracks[this.index];
      if (!track) { this.pause(); this.missing = true; this.notify(); return; }
      this.playing = false;
      if (this.audio.getAttribute('src') !== track.src) this.audio.src = track.src;
      this.notify();
      try { const pending = this.audio.play(); if (pending?.catch) pending.catch(reject); }
      catch (error) { reject(error); }
    }
  }
  return { Player };
});

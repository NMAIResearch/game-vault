/* Word search rules and state, shared by the browser and offline checks. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WordSearch = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  // Segmentation follows the companion crossword's core.js convention.
  const MULTI = ['DZS', 'CS', 'DZ', 'GY', 'LY', 'NY', 'SZ', 'TY', 'ZS'];
  const SINGLE = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÖŐÚÜŰ');
  const PREFIX = 'szokereso:';
  const PREFS = PREFIX + 'preferences:v1';
  const VERSION = 1;
  const DIRECTIONS = [[1, 0], [0, 1], [1, 1], [1, -1], [-1, 0], [0, -1], [-1, -1], [-1, 1]];
  const normalise = value => String(value).normalize('NFC').toUpperCase();
  const validToken = (value, lang) => typeof value === 'string' &&
    (SINGLE.includes(value) || (lang === 'hu' && MULTI.includes(value)));
  function tokenise(word, lang = 'hu') {
    let rest = normalise(word);
    const result = [];
    while (rest) {
      const token = lang === 'hu' && MULTI.find(t => rest.startsWith(t)) || rest[0];
      if (!validToken(token, lang)) throw new Error('Invalid letter in word: ' + word);
      result.push(token);
      rest = rest.slice(token.length);
    }
    return result;
  }
  const phraseTokens = (phrase, lang) => phrase.trim().split(/\s+/u).flatMap(word => tokenise(word, lang));
  const allowedDirections = difficulty => DIRECTIONS.slice(0, difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 8);
  const keyFor = puzzle => PREFIX + 'v1:' + puzzle.id;
  function readStorage(storage, key) {
    try {
      const text = storage.getItem(key);
      return { ok: true, value: text === null ? null : JSON.parse(text) };
    } catch (error) {
      return { ok: false, value: null, reason: error instanceof SyntaxError ? 'corrupt' : 'unavailable' };
    }
  }
  function writeStorage(storage, key, value) {
    try { storage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }
  function preferences(value) {
    return { version: 1, language: value?.version === 1 && value.language === 'en' ? 'en' : 'hu',
      theme: value?.version === 1 && ['light', 'dark'].includes(value.theme) ? value.theme : 'system',
      last: { hu: value?.version === 1 && typeof value?.last?.hu === 'string' ? value.last.hu : 'hu-01',
        en: value?.version === 1 && typeof value?.last?.en === 'string' ? value.last.en : 'en-01' } };
  }
  function line(puzzle, first, last) {
    const size = puzzle.width * puzzle.height;
    if (![first, last].every(i => Number.isInteger(i) && i >= 0 && i < size)) return [];
    const x = first % puzzle.width, y = Math.floor(first / puzzle.width);
    const dx = last % puzzle.width - x, dy = Math.floor(last / puzzle.width) - y;
    if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return [];
    const length = Math.max(Math.abs(dx), Math.abs(dy)) + 1;
    return Array.from({ length }, (_, i) => (y + Math.sign(dy) * i) * puzzle.width + x + Math.sign(dx) * i);
  }
  const samePath = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  class Game {
    constructor(puzzle, saved = null) {
      this.puzzle = puzzle;
      this.found = new Set();
      this.restoreStatus = saved === null ? 'new' : this.restore(saved) ? 'restored' : 'invalid';
    }
    get complete() { return this.found.size === this.puzzle.words.length; }
    select(first, last) {
      const path = line(this.puzzle, first, last);
      if (path.length < 2) return { kind: 'miss' };
      const word = this.puzzle.words.find(w => samePath(w.path, path) || samePath(w.path, path.slice().reverse()));
      if (!word) return { kind: 'miss' };
      if (this.found.has(word.id)) return { kind: 'repeat', word };
      this.found.add(word.id);
      return { kind: 'found', word, complete: this.complete };
    }
    clear() { this.found.clear(); }
    serialise() {
      return { version: VERSION, puzzleId: this.puzzle.id, signature: this.puzzle.signature, found: [...this.found] };
    }
    restore(saved) {
      if (!saved || saved.version !== VERSION || saved.puzzleId !== this.puzzle.id ||
          saved.signature !== this.puzzle.signature || !Array.isArray(saved.found) ||
          saved.found.length > this.puzzle.words.length || new Set(saved.found).size !== saved.found.length ||
          !saved.found.every(id => this.puzzle.words.some(w => w.id === id))) return false;
      this.found = new Set(saved.found);
      return true;
    }
  }
  class Selection {
    constructor(game) { this.game = game; this.cursor = 0; this.anchor = null; this.press = null; this.end = null; }
    valid(i) { return Number.isInteger(i) && i >= 0 && i < this.game.puzzle.cells.length; }
    get preview() { return this.anchor === null ? [] : line(this.game.puzzle, this.anchor, this.cursor); }
    cancel() { this.anchor = null; this.press = null; this.end = null; }
    tap(i) {
      if (!this.valid(i)) { this.cancel(); return { kind: 'cancel' }; }
      this.cursor = i;
      if (this.anchor === null) { this.anchor = i; return { kind: 'anchor' }; }
      const first = this.anchor;
      this.cancel();
      return this.game.select(first, i);
    }
    down(i) { if (this.valid(i)) { this.press = i; this.end = i; this.cursor = i; } }
    move(i) {
      if (this.press === null) return;
      this.end = this.valid(i) ? i : null;
      if (this.end !== null) { this.cursor = i; if (i !== this.press) this.anchor = this.press; }
    }
    up(i) {
      if (this.press === null) return { kind: 'cancel' };
      const first = this.press;
      this.press = null;
      this.end = null;
      if (!this.valid(i)) { this.cancel(); return { kind: 'cancel' }; }
      if (i === first) return this.tap(i);
      this.cursor = i;
      this.cancel();
      return this.game.select(first, i);
    }
    key(key) {
      if (key === 'Escape') { this.cancel(); return { kind: 'cancel' }; }
      if (key === 'Enter' || key === ' ') return this.tap(this.cursor);
      const steps = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (!steps[key]) return null;
      const p = this.game.puzzle, [dx, dy] = steps[key];
      const x = Math.max(0, Math.min(p.width - 1, this.cursor % p.width + dx));
      const y = Math.max(0, Math.min(p.height - 1, Math.floor(this.cursor / p.width) + dy));
      this.cursor = y * p.width + x;
      return { kind: 'move' };
    }
  }
  return { MULTI, SINGLE, PREFIX, PREFS, VERSION, DIRECTIONS, normalise, validToken, tokenise, phraseTokens,
    allowedDirections, keyFor, readStorage, writeStorage, preferences, line, samePath, Game, Selection };
});

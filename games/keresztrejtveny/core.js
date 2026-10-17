/* Crossword rules and state, shared by the browser and offline checks. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Crossword = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const MULTI = ['DZS', 'CS', 'DZ', 'GY', 'LY', 'NY', 'SZ', 'TY', 'ZS'];
  const SINGLE = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÖŐÚÜŰ');
  const PREFIX = 'keresztrejtveny:';
  const normalise = value => String(value).normalize('NFC').toUpperCase();
  const fold = value => normalise(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const matches = (a, b) => !!a && fold(a) === fold(b);
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
  class Game {
    constructor(puzzle, saved = null) {
      this.puzzle = puzzle;
      this.words = new Map(puzzle.entries.map(e => [e.id, e]));
      this.members = puzzle.cells.map(() => []);
      puzzle.entries.forEach(e => e.path.forEach(i => this.members[i].push(e.id)));
      this.values = puzzle.cells.map(() => '');
      this.errors = new Set();
      this.revealed = new Set();
      this.entryId = puzzle.entries[0].id;
      this.cell = puzzle.entries[0].path[0];
      this.pending = null;
      this.restoreStatus = saved === null ? 'new' : this.restore(saved) ? 'restored' : 'invalid';
    }
    get entry() { return this.words.get(this.entryId); }
    get complete() {
      return this.puzzle.cells.every((c, i) => c.type !== 'letter' || matches(this.values[i], c.solution));
    }
    get filled() { return this.values.filter(Boolean).length; }
    select(entryId, cell) {
      const word = this.words.get(entryId);
      if (!word) return false;
      this.pending = null;
      this.entryId = entryId;
      this.cell = word.path.includes(cell) ? cell : word.path[0];
      return true;
    }
    selectCell(cell, direction, cycle = false) {
      const ids = this.members[cell];
      if (!ids || !ids.length) return false;
      let id = ids.find(i => this.words.get(i).dir === direction) ||
        (ids.includes(this.entryId) ? this.entryId : ids[0]);
      if (cycle && cell === this.cell && ids.length > 1) id = ids[(ids.indexOf(this.entryId) + 1) % ids.length];
      return this.select(id, cell);
    }
    move(step) {
      this.pending = null;
      const at = this.entry.path.indexOf(this.cell);
      const next = at + step;
      if (next < 0 || next >= this.entry.path.length) return false;
      this.cell = this.entry.path[next];
      return true;
    }
    nextWord(step = 1) {
      const entries = this.puzzle.entries;
      const at = entries.findIndex(e => e.id === this.entryId);
      const e = entries[(at + step + entries.length) % entries.length];
      this.select(e.id, e.path.find(i => !this.values[i]) ?? e.path[0]);
    }
    put(value, revealed = false) {
      this.values[this.cell] = value;
      this.errors.delete(this.cell);
      this.revealed.delete(this.cell);
      if (revealed) this.revealed.add(this.cell);
    }
    type(text, atomic = false) {
      const input = normalise(text);
      if (!input || !Array.from(input).every(c => SINGLE.includes(c))) return false;
      if (atomic) {
        if (!validToken(input, this.puzzle.lang)) return false;
        // A key may finish a pending unit, but cannot erase an unrelated prefix.
        if (this.pending && !input.startsWith(this.pending)) {
          const at = this.entry.path.indexOf(this.cell);
          if (at === this.entry.path.length - 1) return false;
          this.move(1);
        }
        this.pending = null;
        this.put(input);
        this.move(1);
        return true;
      }
      let changed = false;
      for (const c of input) {
        if (this.pending) {
          const joined = this.pending + c;
          if (MULTI.some(t => t.startsWith(joined))) {
            this.put(joined);
            changed = true;
            this.pending = joined;
            if (!MULTI.some(t => t !== joined && t.startsWith(joined))) this.move(1);
            continue;
          }
          if (!this.move(1)) break;
        }
        this.put(c);
        changed = true;
        if (this.puzzle.lang === 'hu' && MULTI.some(t => t.startsWith(c))) this.pending = c;
        else this.move(1);
      }
      return changed;
    }
    backspace() {
      if (this.pending) this.pending = null;
      else if (!this.values[this.cell]) this.move(-1);
      this.put('');
    }
    erase() { this.pending = null; this.put(''); }
    check() {
      this.errors.clear();
      let empty = 0;
      this.puzzle.cells.forEach((c, i) => {
        if (c.type !== 'letter') return;
        if (!this.values[i]) empty++;
        else if (!matches(this.values[i], c.solution)) this.errors.add(i);
      });
      return { wrong: this.errors.size, empty, complete: this.complete };
    }
    reveal(scope = 'letter') {
      this.pending = null;
      const cells = scope === 'word' ? this.entry.path : [this.cell];
      for (const i of cells) {
        this.values[i] = this.puzzle.cells[i].solution;
        this.revealed.add(i);
        this.errors.delete(i);
      }
      return cells.length;
    }
    clear() {
      this.values.fill('');
      this.errors.clear();
      this.revealed.clear();
      this.pending = null;
    }
    serialise() {
      return { version: 1, puzzleId: this.puzzle.id, signature: this.puzzle.signature,
        values: this.values.slice(), revealed: [...this.revealed], entryId: this.entryId, cell: this.cell, pending: this.pending };
    }
    restore(saved) {
      if (!saved || saved.version !== 1 || saved.puzzleId !== this.puzzle.id ||
          saved.signature !== this.puzzle.signature || !Array.isArray(saved.values) ||
          saved.values.length !== this.values.length || !Array.isArray(saved.revealed)) return false;
      if (!saved.values.every((v, i) => this.puzzle.cells[i].type === 'letter'
        ? v === '' || validToken(v, this.puzzle.lang) : v === '')) return false;
      if (!saved.revealed.every(i => Number.isInteger(i) && this.puzzle.cells[i]?.type === 'letter')) return false;
      this.values = saved.values.slice();
      this.revealed = new Set(saved.revealed.filter(i => this.values[i] === this.puzzle.cells[i].solution));
      this.select(saved.entryId, saved.cell);
      if (this.puzzle.lang === 'hu' && typeof saved.pending === 'string' && saved.pending === this.values[this.cell] &&
          saved.pending && MULTI.some(t => t !== saved.pending && t.startsWith(saved.pending))) this.pending = saved.pending;
      return true;
    }
  }
  return { MULTI, SINGLE, PREFIX, normalise, fold, matches, tokenise, validToken, keyFor, readStorage, writeStorage, Game };
});

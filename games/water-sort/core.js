(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WaterSort = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const CAPACITY = 4;
  const copy = board => board.map(tube => tube.slice());
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const uniform = tube => tube.length > 0 && tube.every(c => c === tube[0]);
  const complete = tube => tube.length === CAPACITY && uniform(tube);
  const won = board => board.length > 0 && board.every(tube => tube.length === 0 || complete(tube));
  const key = board => board.map(tube => tube.join(',')).sort().join('|');

  function amount(board, from, to) {
    if (!Number.isInteger(from) || !Number.isInteger(to) || from === to ||
        !board[from] || !board[to]) return 0;
    const a = board[from], b = board[to];
    if (!a.length || b.length === CAPACITY || (b.length && b.at(-1) !== a.at(-1))) return 0;
    let run = 1;
    while (run < a.length && a[a.length - run - 1] === a.at(-1)) run++;
    return Math.min(run, CAPACITY - b.length);
  }

  function pour(board, from, to) {
    const count = amount(board, from, to);
    if (!count) return null;
    const next = copy(board);
    next[to].push(...next[from].splice(-count));
    return next;
  }

  function validBoard(board, colours, extra = 0) {
    if (!Number.isInteger(colours) || colours < 2 || colours > 8 ||
        (extra !== 0 && extra !== 1) || !Array.isArray(board) || board.length !== colours + 2 + extra) return false;
    const counts = Array(colours).fill(0);
    for (const tube of board) {
      if (!Array.isArray(tube) || tube.length > CAPACITY) return false;
      for (const c of tube) {
        if (!Number.isInteger(c) || c < 0 || c >= colours) return false;
        counts[c]++;
      }
    }
    return counts.every(n => n === CAPACITY);
  }

  function moves(board) {
    const choices = [];
    const sourceShapes = new Set();
    for (let from = 0; from < board.length; from++) {
      const a = board[from];
      const shape = a.join(',');
      if (!a.length || complete(a) || sourceShapes.has(shape)) continue;
      sourceShapes.add(shape);
      const targets = new Set();
      for (let to = 0; to < board.length; to++) {
        const b = board[to];
        const target = b.join(',');
        if (targets.has(target) || (!b.length && uniform(a))) continue;
        const n = amount(board, from, to);
        if (!n) continue;
        targets.add(target);
        const score = (b.length ? 8 : 0) + (b.length + n === CAPACITY ? 12 : 0) +
          (a.length === n ? 5 : 0) + n;
        choices.push({from, to, score});
      }
    }
    return choices.sort((a, b) => b.score - a.score);
  }

  // Yields regularly so browser hints can be cancelled without blocking input.
  function* search(board, limit = 40000) {
    if (won(board)) return {status: 'solved', path: [], visited: 0};
    const seen = new Set([key(board)]);
    const stack = [{board: copy(board), choices: moves(board), cursor: 0}];
    const path = [];
    let visited = 0;
    while (stack.length && visited < limit) {
      const frame = stack.at(-1);
      if (frame.cursor === frame.choices.length) {
        stack.pop();
        if (path.length) path.pop();
        continue;
      }
      const {from, to} = frame.choices[frame.cursor++];
      const next = pour(frame.board, from, to);
      const signature = key(next);
      if (seen.has(signature)) continue;
      seen.add(signature);
      visited++;
      if (won(next)) return {status: 'solved', path: [...path, [from, to]], visited};
      path.push([from, to]);
      stack.push({board: next, choices: moves(next), cursor: 0});
      if (visited % 128 === 0) yield {visited};
    }
    return {status: stack.length ? 'limit' : 'unsolvable', path: null, visited};
  }

  function solve(board, limit) {
    const iterator = search(board, limit);
    let result;
    do { result = iterator.next(); } while (!result.done);
    return result.value;
  }

  function newSession(level, index) {
    return {level: index, board: copy(level.board), moves: 0, extra: 0, history: []};
  }

  function step(session, from, to) {
    const next = pour(session.board, from, to);
    if (!next || won(session.board)) return null;
    return {...session, board: next, moves: session.moves + 1,
      history: [...session.history, {kind: 'pour', from, to, count: amount(session.board, from, to)}]};
  }

  function addTube(session) {
    if (session.extra || won(session.board)) return null;
    return {...session, board: [...copy(session.board), []], extra: 1,
      history: [...session.history, {kind: 'extra'}]};
  }

  function undo(session) {
    if (!session.history.length) return null;
    const last = session.history.at(-1), board = copy(session.board);
    if (last.kind === 'extra') {
      board.pop();
      return {...session, board, extra: 0, history: session.history.slice(0, -1)};
    }
    board[last.from].push(...board[last.to].splice(-last.count));
    return {...session, board, moves: session.moves - 1, history: session.history.slice(0, -1)};
  }

  function restoreProgress(raw, levels) {
    if (!raw || raw.version !== 1 || !Array.isArray(levels)) return null;
    const finished = Array.isArray(raw.finished)
      ? [...new Set(raw.finished.filter(n => Number.isInteger(n) && n >= 0 && n < levels.length))] : [];
    return {finished, symbols: raw.symbols === true, sound: raw.sound === true};
  }

  // Vibration stays on unless it was switched off; the theme is a saved day or night choice, otherwise the system's.
  function restoreSettings(raw) {
    const valid = Boolean(raw) && raw.version === 1;
    return {vibration: !(valid && raw.vibration === false),
      theme: valid && (raw.theme === 'day' || raw.theme === 'night') ? raw.theme : 'system'};
  }

  // Replays the history from the shipped puzzle, never trusts a stored board alone.
  function restore(raw, levels) {
    if (!raw || raw.version !== 1 || !raw.session || !Array.isArray(levels)) return null;
    const saved = raw.session;
    if (!Number.isInteger(saved.level) || !levels[saved.level] || !Array.isArray(saved.history) ||
        saved.history.length > 5000) return null;
    let current = newSession(levels[saved.level], saved.level);
    for (const entry of saved.history) {
      if (!entry || typeof entry !== 'object') return null;
      if (entry.kind === 'extra') current = addTube(current);
      else if (entry.kind === 'pour') {
        if (amount(current.board, entry.from, entry.to) !== entry.count) return null;
        current = step(current, entry.from, entry.to);
      } else return null;
      if (!current) return null;
    }
    if (saved.moves !== current.moves || saved.extra !== current.extra || !same(saved.board, current.board)) return null;
    return {session: current, ...restoreProgress(raw, levels)};
  }

  return {CAPACITY, copy, same, uniform, complete, won, amount, pour, validBoard, moves,
    search, solve, newSession, step, addTube, undo, restoreProgress, restoreSettings, restore};
});

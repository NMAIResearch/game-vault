// Fact Checkmate: the bot's move search and the claims it makes about the board.
// Rules come from chess.js 1.4.0 (BSD-2-Clause, LICENSE-chess.js.txt). The search calls its internal move generator
// (_moves, _makeMove, _undoMove) directly because the public move objects build SAN and FEN strings for every move;
// that is safe only because chess.js is pinned to the copy in this folder.
import { Chess } from "./chess.js";

export { Chess };

export const POINTS = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
export const NAMES = { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" };
const VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
export const MATE = 100000;
const CAPTURE = 2, EP_CAPTURE = 8, PROMOTION = 16;

// depth in moves by both sides; qdepth limits the capture-only extension; margin (centipawns) lets weaker levels
// pick at random among moves this close to the best one
export const LEVELS = {
  gentle: { depth: 1, qdepth: 2, margin: 90 },
  fair: { depth: 2, qdepth: 4, margin: 15 },
  sharp: { depth: 3, qdepth: 6, margin: 0 }
};

export const other = (color) => (color === "w" ? "b" : "w");
// chess.js keeps the board in 0x88 order: index 0 is a8, 0x77 is h1
export const squareName = (i) => "abcdefgh"[i & 15] + String(8 - (i >> 4));
export const squareIndex = (name) => (8 - Number(name[1])) * 16 + "abcdefgh".indexOf(name[0]);

export function pieceList(chess) {
  const out = [], board = chess._board;
  for (let i = 0; i < 128; i++) {
    if (i & 0x88) { i += 7; continue; }
    if (board[i]) out.push([i, board[i]]);
  }
  return out;
}

/* ---------- evaluation ---------- */

// Positional bonuses in centipawns from White's side: row 0 is rank 8, column 0 is file a. Black reads them mirrored.
const EDGE = [0, 1, 2, 3, 3, 2, 1, 0];
const table = (fn) => { const t = []; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) t.push(fn(r, c)); return t; };
const PST = {
  p: table((r, c) => {
    const rank = 8 - r;
    let v = [0, 0, 0, 5, 10, 20, 35, 60, 0][rank];
    if ((c === 3 || c === 4) && (rank === 4 || rank === 5)) v += 15;
    if ((c === 3 || c === 4) && rank === 2) v -= 10;
    return v;
  }),
  n: table((r, c) => (EDGE[r] + EDGE[c]) * 8 - 30),
  b: table((r, c) => (EDGE[r] + EDGE[c]) * 4 - 10),
  r: table((r, c) => (r === 1 ? 15 : 0) + (c === 3 || c === 4 ? 5 : 0)),
  q: table((r, c) => (EDGE[r] + EDGE[c]) * 2 - 5),
  kMiddle: table((r, c) => {
    const rank = 8 - r;
    if (rank === 1) return [20, 30, 10, 0, 0, 10, 30, 20][c];
    if (rank === 2) return [10, 10, 0, -10, -10, 0, 10, 10][c];
    return -20 - 5 * Math.min(rank - 2, 4);
  }),
  kEnd: table((r, c) => (EDGE[r] + EDGE[c]) * 8 - 24)
};

// Score in centipawns from the point of view of the side to move.
export function evaluate(chess) {
  const board = chess._board;
  let nonPawn = 0;
  for (let i = 0; i < 128; i++) {
    if (i & 0x88) { i += 7; continue; }
    const p = board[i];
    if (p && p.type !== "p" && p.type !== "k") nonPawn += VALUE[p.type];
  }
  const kingTable = nonPawn <= 2600 ? PST.kEnd : PST.kMiddle;
  let score = 0, bishopsW = 0, bishopsB = 0;
  for (let i = 0; i < 128; i++) {
    if (i & 0x88) { i += 7; continue; }
    const p = board[i];
    if (!p) continue;
    const row = i >> 4, col = i & 15, idx = (p.color === "w" ? row : 7 - row) * 8 + col;
    const v = VALUE[p.type] + (p.type === "k" ? kingTable : PST[p.type])[idx];
    if (p.color === "w") { score += v; if (p.type === "b") bishopsW++; }
    else { score -= v; if (p.type === "b") bishopsB++; }
  }
  if (bishopsW >= 2) score += 30;
  if (bishopsB >= 2) score -= 30;
  return chess._turn === "w" ? score : -score;
}

/* ---------- search ---------- */

const orderKey = (m) => (m.captured ? 10 * VALUE[m.captured] - VALUE[m.piece] : 0) + (m.promotion ? VALUE[m.promotion] : 0);
const byOrder = (a, b) => orderKey(b) - orderKey(a);

function quiesce(chess, alpha, beta, qdepth, ply, ctx) {
  ctx.nodes++;
  const moves = chess._moves({ legal: true });
  const inCheck = chess._isKingAttacked(chess._turn);
  if (moves.length === 0) return inCheck ? -MATE + ply : 0;
  const stand = evaluate(chess);
  if (!inCheck) {
    if (stand >= beta || qdepth <= 0) return stand;
    if (stand > alpha) alpha = stand;
  } else if (qdepth <= 0) {
    return stand;
  }
  const list = inCheck ? moves : moves.filter((m) => m.flags & (CAPTURE | EP_CAPTURE | PROMOTION));
  list.sort(byOrder);
  let best = inCheck ? -Infinity : stand;
  for (const m of list) {
    chess._makeMove(m);
    const s = -quiesce(chess, -beta, -alpha, qdepth - 1, ply + 1, ctx);
    chess._undoMove();
    if (s > best) best = s;
    if (s > alpha) alpha = s;
    if (alpha >= beta) break;
  }
  return best;
}

function negamax(chess, depth, alpha, beta, ply, ctx) {
  if (depth <= 0) return quiesce(chess, alpha, beta, ctx.qdepth, ply, ctx);
  ctx.nodes++;
  const moves = chess._moves({ legal: true });
  if (moves.length === 0) return chess._isKingAttacked(chess._turn) ? -MATE + ply : 0;
  moves.sort(byOrder);
  let best = -Infinity;
  for (const m of moves) {
    chess._makeMove(m);
    const s = -negamax(chess, depth - 1, -beta, -alpha, ply + 1, ctx);
    chess._undoMove();
    if (s > best) best = s;
    if (s > alpha) alpha = s;
    if (alpha >= beta) break;
  }
  return best;
}

// The bot's move for the side to move: { from, to, promotion, score, nodes }, or null when there is no legal move.
export function chooseMove(chess, level = "fair", rng = Math.random) {
  const cfg = LEVELS[level] || LEVELS.fair;
  const ctx = { nodes: 0, qdepth: cfg.qdepth };
  const moves = chess._moves({ legal: true }).sort(byOrder);
  if (!moves.length) return null;
  const scored = [];
  let alpha = -Infinity;
  for (const m of moves) {
    chess._makeMove(m);
    // a window `margin` below the best so far keeps scores exact for every move that could still be picked
    const floor = alpha === -Infinity ? -Infinity : alpha - cfg.margin;
    const s = -negamax(chess, cfg.depth - 1, -Infinity, -floor, 1, ctx);
    chess._undoMove();
    scored.push({ m, s });
    if (s > alpha) alpha = s;
  }
  const best = Math.max(...scored.map((x) => x.s));
  const margin = Math.abs(best) > MATE - 1000 ? 0 : cfg.margin;
  const near = scored.filter((x) => x.s >= best - margin);
  const pick = near[Math.min(near.length - 1, Math.floor(rng() * near.length))];
  return { from: squareName(pick.m.from), to: squareName(pick.m.to), promotion: pick.m.promotion, score: pick.s, nodes: ctx.nodes };
}

/* ---------- facts the claims are checked against ---------- */

export function material(chess) {
  const pts = { w: 0, b: 0 };
  for (const [, p] of pieceList(chess)) pts[p.color] += POINTS[p.type];
  return pts;
}

// Run fn as if `bot` were to move (a pass by the other side). Returns null when that side is in check and cannot pass.
function asIfToMove(chess, bot, fn) {
  if (chess.turn() === bot) return fn();
  if (chess.inCheck()) return null;
  chess.move(null);
  try { return fn(); } finally { chess.undo(); }
}

// Points the side to move can win by capturing on square index `to`, if both sides capture there with their least
// valuable piece first and either side may stop. 0 when capturing would not come out ahead.
export function captureGain(chess, to) {
  const target = chess._board[to];
  if (!target) return 0;
  let best = null;
  for (const m of chess._moves({ legal: true })) {
    if (m.to !== to || !(m.flags & CAPTURE)) continue;
    if (m.promotion && m.promotion !== "q") continue;
    if (!best || POINTS[m.piece] < POINTS[best.piece]) best = m;
  }
  if (!best) return 0;
  const won = POINTS[target.type] + (best.promotion ? POINTS[best.promotion] - 1 : 0);
  chess._makeMove(best);
  const lost = captureGain(chess, to);
  chess._undoMove();
  return Math.max(0, won - lost);
}

// The side to move's checkmating move as { san, from, to }, or false when it has none.
function mateInOne(chess) {
  const moves = chess._moves({ legal: true });
  for (const m of moves) {
    const san = chess._moveToSan(m, moves);
    chess._makeMove(m);
    const mate = chess._isKingAttacked(chess._turn) && chess._moves({ legal: true }).length === 0;
    chess._undoMove();
    if (mate) return { san, from: squareName(m.from), to: squareName(m.to) };
  }
  return false;
}

// Knights and bishops that are off their own starting squares.
const HOME = { w: ["b1", "g1", "c1", "f1"], b: ["b8", "g8", "c8", "f8"] };
export function developed(chess, color) {
  let n = 0;
  for (const [i, p] of pieceList(chess)) {
    if (p.color === color && (p.type === "n" || p.type === "b") && !HOME[color].includes(squareName(i))) n++;
  }
  return n;
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
function lead(diff) {
  if (diff > 0) return `I'm ${plural(diff, "point")} ahead`;
  if (diff < 0) return `you're ${plural(-diff, "point")} ahead`;
  return "material is level";
}
const capital = (s) => s[0].toUpperCase() + s.slice(1);

/* ---------- claims ---------- */

// A claim is { kind, ... }. verifyClaim decides from the board alone whether it is true, and says why.
// It must be called in the position the claim was made in, with the player to move.
export function verifyClaim(chess, bot, claim) {
  const player = other(bot);
  if (claim.kind === "material") {
    const pts = material(chess), diff = pts[bot] - pts[player];
    return {
      truth: diff === claim.diff, squares: [],
      why: `Material: you ${pts[player]}, me ${pts[bot]} (pawn 1, knight 3, bishop 3, rook 5, queen 9), so ${lead(diff)}.`
    };
  }
  if (claim.kind === "hanging") {
    const piece = chess.get(claim.square);
    const attackers = chess.attackers(claim.square, bot);
    if (!piece || piece.color !== player) return { truth: false, squares: [claim.square], why: `You have no piece on ${claim.square}.` };
    const gain = asIfToMove(chess, bot, () => captureGain(chess, squareIndex(claim.square)));
    if (gain === null) return { truth: false, squares: [claim.square], why: "You are in check, so this cannot be tested." };
    const name = `your ${NAMES[piece.type]} on ${claim.square}`;
    if (gain >= 1) return { truth: true, squares: [claim.square, ...attackers], why: `If it were my move, I could take ${name} and come out ${plural(gain, "point")} ahead after the recaptures.` };
    if (!attackers.length) return { truth: false, squares: [claim.square], why: `None of my pieces attack ${name}.` };
    return { truth: false, squares: [claim.square, ...attackers], why: `I attack ${name}, but after the recaptures I would not come out ahead.` };
  }
  if (claim.kind === "attacks") {
    const mover = chess.get(claim.from);
    const parts = [], squares = [claim.from];
    let truth = Boolean(mover) && mover.color === bot;
    for (const t of claim.targets) {
      const piece = chess.get(t.square);
      const real = Boolean(piece) && piece.color === player && piece.type === t.type;
      const hit = real && chess.attackers(t.square, bot).includes(claim.from);
      squares.push(t.square);
      truth = truth && hit;
      parts.push(`${hit ? "attacks" : "does not attack"} your ${NAMES[t.type]} on ${t.square}`);
    }
    const subject = mover ? `My ${NAMES[mover.type]} on ${claim.from}` : `There is no piece on ${claim.from}; it`;
    return { truth, squares, why: `${subject} ${parts.join(" and ")}.` };
  }
  if (claim.kind === "mate") {
    const found = asIfToMove(chess, bot, () => mateInOne(chess));
    if (found === null) return { truth: false, squares: [], why: "You are in check, so this cannot be tested." };
    if (found) return { truth: true, squares: [found.from, found.to], why: `If you ignore it, ${found.san} is checkmate.` };
    return { truth: false, squares: [], why: "No move of mine would be checkmate right now." };
  }
  if (claim.kind === "developed") {
    const mine = developed(chess, bot), yours = developed(chess, player);
    return { truth: mine > yours, squares: [], why: `Knights and bishops off their starting squares: you ${yours}, me ${mine}.` };
  }
  if (claim.kind === "kingstuck") {
    if (chess.turn() !== player) return { truth: false, squares: [], why: "It is not your move." };
    const moves = chess.moves({ piece: "k", verbose: true });
    const king = chess.findPiece({ type: "k", color: player })[0];
    if (!moves.length) return { truth: true, squares: [king], why: "Your king has no legal move right now." };
    return { truth: false, squares: [king, ...moves.map((m) => m.to)], why: `Your king can play ${moves.map((m) => m.san).join(", ")}.` };
  }
  if (claim.kind === "castling") {
    const r = chess.getCastlingRights(player);
    const sides = [r.k && "kingside", r.q && "queenside"].filter(Boolean);
    return {
      truth: !r.k && !r.q, squares: [],
      why: sides.length ? `You still have the right to castle ${sides.join(" and ")}.` : "You have lost the right to castle on both sides."
    };
  }
  return { truth: false, squares: [], why: "Unknown claim." };
}

export function claimText(claim) {
  if (claim.kind === "material") return `${capital(lead(claim.diff))}.`;
  if (claim.kind === "hanging") return `Your ${NAMES[claim.piece]} on ${claim.square} is hanging.`;
  if (claim.kind === "attacks") {
    const list = claim.targets.map((t) => `your ${NAMES[t.type]} on ${t.square}`).join(" and ");
    return `My ${NAMES[claim.piece]} on ${claim.from} attacks ${list}.`;
  }
  if (claim.kind === "mate") return "I'm threatening mate in one.";
  if (claim.kind === "castling") return "You've lost the right to castle.";
  if (claim.kind === "developed") return "I've developed more pieces than you.";
  if (claim.kind === "kingstuck") return "Your king has nowhere to go.";
  return "";
}

const FLOURISH = ["Trust me.", "Obviously.", "I double-checked.", "That's just facts.", "Look closer.", "Classic.", "", ""];
const distance = (a, b) => Math.max(Math.abs(a.charCodeAt(0) - b.charCodeAt(0)), Math.abs(Number(a[1]) - Number(b[1])));

function pickWeighted(list, rng) {
  const total = list.reduce((s, x) => s + x.weight, 0);
  let r = rng() * total;
  for (const x of list) { r -= x.weight; if (r < 0) return x; }
  return list[list.length - 1];
}

// The claim the bot makes after its move `lastMove` ({ from, to }), with the player to move. About `lieRate` of
// claims are false. Each claim carries its truth, the explanation (why) and the squares to highlight, all decided by
// verifyClaim in this position. Returns null when the game is over.
export function makeClaim(chess, bot, lastMove, rng = Math.random, lieRate = 0.4) {
  if (chess.isGameOver()) return null;
  const player = other(bot);
  const options = [];
  const add = (claim, weightIfTrue, weightIfFalse) => {
    const v = verifyClaim(chess, bot, claim);
    const weight = v.truth ? weightIfTrue : weightIfFalse;
    if (weight > 0) options.push({ claim, truth: v.truth, why: v.why, squares: v.squares, weight });
  };
  const pts = material(chess), diff = pts[bot] - pts[player];
  add({ kind: "material", diff }, 1, 0);
  for (const d of new Set([diff + 1, diff - 1, diff + 2, -diff])) if (d !== diff) add({ kind: "material", diff: d }, 0, 0.35);
  const playerPieces = pieceList(chess).filter(([, p]) => p.color === player);
  if (!chess.inCheck()) {
    for (const [i, p] of playerPieces) {
      if (p.type === "k") continue;
      const square = squareName(i);
      if (chess.attackers(square, bot).length) add({ kind: "hanging", square, piece: p.type }, 4, 2.5);
    }
    const checks = asIfToMove(chess, bot, () => chess.moves().some((san) => san.endsWith("+")));
    add({ kind: "mate" }, 8, checks ? 1.5 : 0.2);
  }
  if (lastMove) {
    const mover = chess.get(lastMove.to);
    if (mover && mover.color === bot) {
      const from = lastMove.to;
      const valuable = playerPieces
        .filter(([, p]) => POINTS[p.type] >= 3 || p.type === "k")
        .map(([i, p]) => ({ square: squareName(i), type: p.type }))
        .sort((a, b) => (b.type === "k") - (a.type === "k") || POINTS[b.type] - POINTS[a.type]);
      const hit = valuable.filter((t) => chess.attackers(t.square, bot).includes(from));
      const near = valuable.filter((t) => !hit.includes(t) && distance(t.square, from) <= 3);
      if (hit.length >= 2) add({ kind: "attacks", from, piece: mover.type, targets: hit.slice(0, 2) }, 6, 0);
      if (hit.length === 1) add({ kind: "attacks", from, piece: mover.type, targets: hit }, 1.5, 0);
      if (hit.length && near.length) add({ kind: "attacks", from, piece: mover.type, targets: [hit[0], near[0]] }, 0, 3);
      if (!hit.length && near.length) add({ kind: "attacks", from, piece: mover.type, targets: [near[0]] }, 0, 2);
    }
  }
  if (chess.moveNumber() <= 25) add({ kind: "castling" }, 0.6, 0.6);
  if (chess.moveNumber() <= 15) add({ kind: "developed" }, 1.2, 1);
  const king = chess.findPiece({ type: "k", color: player })[0];
  if (chess.moveNumber() >= 12 || king !== (player === "w" ? "e1" : "e8")) {
    const kingMoves = chess.moves({ piece: "k" }).length;
    add({ kind: "kingstuck" }, 1.2, kingMoves <= 2 ? 1 : 0.2);
  }
  const wantLie = rng() < lieRate;
  let pool = options.filter((o) => o.truth !== wantLie);
  if (!pool.length) pool = options;
  const pick = pickWeighted(pool, rng);
  const flourish = FLOURISH[Math.floor(rng() * FLOURISH.length)];
  return { ...pick.claim, truth: pick.truth, why: pick.why, squares: pick.squares,
    text: claimText(pick.claim) + (flourish ? " " + flourish : "") };
}

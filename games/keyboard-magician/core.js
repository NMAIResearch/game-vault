/* Purpose: deterministic chart, judgement and audible-clock rules shared by the game and offline tests. */
(function (root) {
  'use strict';
  const WINDOWS = { excellent: 0.050, good: 0.100, okay: 0.160 };
  function judgement(delta) {
    const d = Math.abs(delta);
    return d <= WINDOWS.excellent + 1e-9 ? 'Excellent' : d <= WINDOWS.good + 1e-9 ? 'Good' : d <= WINDOWS.okay + 1e-9 ? 'Okay' : null;
  }
  function nearest(chart, next, lane, time) {
    let best = null, distance = Infinity;
    for (let i = next; i < chart.length; i++) {
      const n = chart[i], d = Math.abs(n.t - time);
      if (n.t > time + WINDOWS.okay) break;
      if (n.state === 0 && d <= WINDOWS.okay + 1e-9 && d < distance && (lane === null || n.lanes.includes(lane))) { best = n; distance = d; }
    }
    return best;
  }
  function audibleTime(ctx, now) {
    if (ctx.getOutputTimestamp) {
      const stamp = ctx.getOutputTimestamp();
      const age = (now - stamp.performanceTime) / 1000;
      if (stamp.contextTime > 0 && stamp.performanceTime > 0 && age >= -0.1 && age < 0.25) return stamp.contextTime + age;
    }
    // The graph's buffering and the device's output latency are distinct delays.
    const latency = Math.max(0, ctx.baseLatency || 0) + Math.max(0, ctx.outputLatency || 0);
    return ctx.currentTime - latency;
  }
  function eventNow(stamp, now) {
    return Number.isFinite(stamp) && stamp > 0 && stamp <= now && now - stamp < 1000 ? stamp : now;
  }
  function chart(song, built, mode, diff, measured) {
    const spb = 60 / (measured?.beatMeasurement?.tempo_bpm || song.bpm), L = mode === 'jam' ? 4 : 6;
    let src = measured ? measured.notes : built.lead.map(n => ({t: n.beat * spb, dur: n.dur * spb, pitch: n.pitch, grid: n.grid ?? n.beat}));
    if (measured?.gridVersion === 2 && diff !== 'hard') src = src.filter(n => Number.isInteger(n.grid));
    src = src.slice().sort((a, b) => a.t - b.t);
    const pitches = [...new Set(src.map(n => n.pitch))].sort((a, b) => a - b);
    const lanes = diff === 'easy' ? (mode === 'jam' ? [0, 1, 2] : [1, 2, 3, 4]) : Array.from({length: L}, (_, i) => i);
    const laneOf = p => lanes[Math.min(lanes.length - 1, Math.floor(pitches.indexOf(p) * lanes.length / Math.max(1, pitches.length)))];
    const gap = measured?.gridVersion === 2 ? (diff === 'easy' ? spb * 1.8 : diff === 'normal' ? spb * .8 : spb * .4) : diff === 'easy' ? Math.max(0.5, (song.easyEvery || 1) * spb) : diff === 'normal' ? 0.3 : 0.125;
    const out = []; let last = -Infinity;
    for (const n of src) {
      // A gentle opening has the same timing anchors with fewer required inputs.
      const openingGap = diff === 'hard' ? gap : n.t < 8 ? Math.max(gap, 0.55) : gap;
      if (n.t - last < openingGap - 1e-6) continue;
      last = n.t;
      const lane = laneOf(n.pitch), hold = n.dur >= 1.1 && diff !== 'easy', set = [lane];
      if (diff === 'hard' && !hold && Math.abs(n.grid % song.bar) < 1e-6 && n.dur >= spb - 1e-6) set.push(lane + 2 < L ? lane + 2 : lane - 2);
      set.sort((a, b) => a - b);
      const base = {t: n.t, end: hold ? n.t + n.dur * 0.85 : n.t, hold, pitch: n.pitch, state: 0};
      if (mode === 'jam' || set.length === 1) out.push(Object.assign({lanes: set}, base));
      else for (const l of set) out.push(Object.assign({lanes: [l]}, base));
    }
    // Leave release room before the next required press on a held lane.
    for (let i = 0; i < out.length; i++) {
      const n = out[i];
      if (!n.hold) continue;
      const next = out.slice(i + 1).find(m => mode === 'jam' || m.lanes.some(l => n.lanes.includes(l)));
      if (next) n.end = Math.min(n.end, next.t - 0.18);
      n.hold = n.end - n.t >= 0.6;
      if (!n.hold) n.end = n.t;
    }
    return out;
  }
  function calibrationResult(samples) {
    const values = samples.filter(Number.isFinite).slice().sort((a, b) => a - b);
    if (values.length < 8) return {ok: false, reason: 'At least eight steady taps are needed. Try again.'};
    const median = a => a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
    const centre = median(values), mad = median(values.map(v => Math.abs(v - centre)).sort((a,b) => a-b));
    const kept = values.filter(v => Math.abs(v - centre) <= Math.max(.045, mad * 3));
    if (kept.length < 8 || mad > .045) return {ok: false, reason: 'The taps varied too much. Listen for the pulse and try again.'};
    const offset = Math.round(median(kept) * 1000 / 5) * 5;
    if (Math.abs(offset) > 300) return {ok: false, reason: 'Offset is outside the manual range. Try again.'};
    return {ok: true, offset, spread: Math.round(mad * 1000), used: kept.length};
  }
  function beatIndex(beats, time) {
    let lo = 0, hi = beats.length;
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (beats[mid] <= time) lo = mid + 1; else hi = mid; }
    return lo - 1;
  }
  const api = {calibrationResult, beatIndex, WINDOWS, judgement, nearest, audibleTime, eventNow, chart};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.KM_CORE = api;
})(typeof window !== 'undefined' ? window : globalThis);

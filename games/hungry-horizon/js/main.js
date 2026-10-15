import {
  MAPS, TIERS, TYPES, LOOKS, generateMap, World, Stopwatch, Store, BestTimes, newUnlocks, formatTime,
  tierLabels, tierProgress,
} from './logic.js';

import { landAt } from './places.js';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);

if (params.has('selftest')) {
  const { runChecks } = await import('./checks.js');
  const results = runChecks();
  const el = $('selftest');
  el.hidden = false;
  const failed = results.filter(r => !r.pass).length;
  el.innerHTML = `<h2>Self-test: ${results.length - failed}/${results.length} passed</h2>` + results.map(r =>
    `<div class="${r.pass ? 'pass' : 'fail'}">${r.pass ? 'PASS' : 'FAIL'} &nbsp; ${r.name}${r.pass ? '' : ` (${r.error})`}</div>`).join('');
  window.__selftest = results;
  $('menu').hidden = true;
} else {
  await boot();
}

async function boot() {
  const { Renderer } = await import('./render.js');
  const { Audio } = await import('./audio.js');
  const { ENDGAME_LEFT, RADAR_LEFT } = await import('./view.js');

  let def = Object.hasOwn(MAPS, params.get('map')) ? MAPS[params.get('map')] : MAPS.downtown;
  const seedParam = params.get('seed');
  let seed = seedParam !== null && seedParam !== '' && isFinite(+seedParam) ? (Math.floor(+seedParam) >>> 0) : def.defaultSeed;
  const store = new Store();
  const bests = new BestTimes(store);
  const legacyDowntownClear = +store.get('clears', 0) > 0 && Object.keys(MAPS).every(id => !store.get(`cleared.${id}`, false));
  if (legacyDowntownClear) store.set('cleared.downtown', true);
  const settings = Object.assign({ music: true, sfx: true, calm: false }, store.get('settings', {}));
  let owned = store.get('looks', ['classic']);
  if (!Array.isArray(owned)) owned = ['classic'];
  if (!owned.includes('classic')) owned.unshift('classic');
  let look = store.get('look', 'classic');
  if (!owned.includes(look)) look = 'classic';

  const audio = new Audio();
  audio.setMusic(settings.music); audio.setSfx(settings.sfx);

  const canvas = $('view');
  const renderer = new Renderer(canvas);
  const forcedPR = params.has('pr') ? +params.get('pr') : null;
  if (forcedPR) renderer.setPixelRatio(forcedPR);
  let map = generateMap(seed, def);
  let mapSig = 0;
  for (const o of map.objects) mapSig = (Math.imul(mapSig, 31) + Math.round(o.x * 100) * 7 + Math.round(o.z * 100) + o.type) | 0;
  let world = new World(map);
  renderer.setWorld(world);
  renderer.setLook(look);
  renderer.setCalm(settings.calm);
  document.body.classList.toggle('calm', settings.calm);

  let phase = 'menu';
  const watch = new Stopwatch();
  let run = null;
  let t = 0, last = performance.now();
  let fps = 60, fCount = 0, fTime = 0, perfWindow = [], prHold = 0;

  function resize() { renderer.resize(window.innerWidth, window.innerHeight); }
  window.addEventListener('resize', resize); resize();

  // ---------------------------------------------------------------- input
  const keys = new Set();
  const ptr = { x: 0, y: 0, active: false, type: 'mouse' };
  const KEYMAP = { ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1], ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0] };
  window.addEventListener('keydown', e => {
    if (KEYMAP[e.code] && phase === 'playing') { keys.add(e.code); e.preventDefault(); }
    if (e.code === 'KeyP' || e.code === 'Escape') { if (phase === 'playing') pause(); else if (phase === 'paused') resume(); }
    if ((e.code === 'Enter' || e.code === 'Space') && phase === 'menu' && document.activeElement === document.body) { e.preventDefault(); startRun(); }
  });
  window.addEventListener('keyup', e => keys.delete(e.code));
  window.addEventListener('blur', () => { keys.clear(); ptr.active = ptr.type === 'mouse' ? ptr.active : false; });
  canvas.addEventListener('pointerdown', e => { audio.unlock(); ptr.type = e.pointerType; ptr.x = e.clientX; ptr.y = e.clientY; ptr.active = true; });
  canvas.addEventListener('pointermove', e => { ptr.type = e.pointerType; ptr.x = e.clientX; ptr.y = e.clientY; if (e.pointerType === 'mouse') ptr.active = true; });
  const release = e => { if (e.pointerType !== 'mouse') ptr.active = false; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  document.addEventListener('pointerleave', () => { if (ptr.type === 'mouse') ptr.active = false; });
  document.documentElement.addEventListener('mouseleave', () => { ptr.active = false; });

  function steer() {
    let x = 0, z = 0;
    for (const k of keys) { x += KEYMAP[k][0]; z += KEYMAP[k][1]; }
    if (x || z) return [x, z];
    if (!ptr.active) return [0, 0];
    const h = renderer.project(world.hole.x, world.hole.z);
    const dx = ptr.x - h.x, dy = ptr.y - h.y, d = Math.hypot(dx, dy);
    const dead = 6;
    if (d < dead) return [0, 0];
    const full = Math.min(window.innerWidth, window.innerHeight) * 0.11;
    const mag = Math.min(1, (d - dead) / full);
    return [dx / d * mag, dy / d * mag];
  }

  // ---------------------------------------------------------------- settings and menu
  function saveSettings() { store.set('settings', settings); }
  const TOG_TEXT = { music: 'Music', sfx: 'Sounds', calm: 'Calm motion' };
  function syncToggles() {
    for (const b of document.querySelectorAll('.tog')) {
      const k = b.dataset.set;
      b.textContent = `${TOG_TEXT[k]}: ${settings[k] ? 'On' : 'Off'}`;
      b.setAttribute('aria-pressed', String(!!settings[k]));
    }
  }
  for (const b of document.querySelectorAll('.tog')) b.addEventListener('click', () => {
    const k = b.dataset.set; settings[k] = !settings[k]; saveSettings(); syncToggles();
    audio.unlock();
    if (k === 'music') audio.setMusic(settings.music);
    if (k === 'sfx') { audio.setSfx(settings.sfx); audio.click(); }
    if (k === 'calm') { renderer.setCalm(settings.calm); document.body.classList.toggle('calm', settings.calm); }
  });
  syncToggles();

  const LOOK_ICON = { classic: '', googly: 'oo', chomp: 'VV', duck: 'Q', burp: 'b', donut: 'O', hat: '^', stache: '~', captain: '⚓', scarecrow: '✿', jester: '✦' };
  function renderLooks() {
    const row = $('looks-row'); row.innerHTML = '';
    for (const l of LOOKS) {
      const have = owned.includes(l.id);
      const b = document.createElement('button');
      b.className = 'look' + (have ? '' : ' locked') + (l.id === look ? ' on' : '');
      b.innerHTML = have ? `<span class="ic">${LOOK_ICON[l.id]}</span>` : '?';
      b.title = have ? l.name : `Locked: ${l.how}`;
      b.setAttribute('aria-label', b.title);
      const tell = () => { $('look-how').textContent = have ? `${l.name}${l.id === look ? ' (wearing)' : ''}` : `Locked: ${l.how}`; };
      b.addEventListener('mouseenter', tell);
      b.addEventListener('click', () => {
        audio.unlock();
        if (have) { look = l.id; store.set('look', look); renderer.setLook(look); renderLooks(); audio.click(); }
        tell();
      });
      row.appendChild(b);
    }
    const cur = LOOKS.find(l => l.id === look);
    $('look-how').textContent = `${cur.name} (wearing). ${owned.length}/${LOOKS.length} found`;
  }
  function renderBest() {
    const b = bests.get(map.id, seed);
    $('best-line').textContent = b ? `Best time on ${map.name}: ${formatTime(b)}` : `${map.name}: no best time yet`;
    $('best-small').textContent = b ? `Best ${formatTime(b)}` : '';
  }
  function renderMaps() {
    const row = $('map-picker'); row.innerHTML = '';
    for (const d of Object.values(MAPS)) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'map-choice'; b.dataset.map = d.id;
      b.style.setProperty('--map-colour', d.colour); b.setAttribute('aria-pressed', String(d.id === map.id));
      const time = bests.get(d.id, seed);
      const cleared = store.get(`cleared.${d.id}`, false) || !!time || (d.id === 'downtown' && legacyDowntownClear);
      b.innerHTML = `<span class="map-picture ${d.id}" aria-hidden="true"><span>${d.icon}</span></span><span class="map-info"><strong>${d.name}</strong><small>${time ? `Best ${formatTime(time)}` : 'No best time yet'}</small><small>${cleared ? '✓ Cleared' : '○ Not cleared'}</small></span>`;
      b.addEventListener('click', () => {
        if (phase !== 'menu') return;
        def = d; seed = seedParam !== null && seedParam !== '' && isFinite(+seedParam) ? (Math.floor(+seedParam) >>> 0) : def.defaultSeed;
        map = generateMap(seed, def); mapSig = 0;
        for (const o of map.objects) mapSig = (Math.imul(mapSig, 31) + Math.round(o.x * 100) * 7 + Math.round(o.z * 100) + o.type) | 0;
        world = new World(map); renderer.setWorld(world); leftoversAt = -1;
        renderMaps(); renderBest(); row.querySelector(`[data-map="${d.id}"]`).focus();
      });
      b.addEventListener('keydown', e => {
        const buttons = [...row.children], i = buttons.indexOf(b);
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.code];
        if (step) { e.preventDefault(); buttons[(i + step + buttons.length) % buttons.length].focus(); }
      });
      row.appendChild(b);
    }
    $('map-description').textContent = def.description;
    $('play').textContent = `Play ${map.name}`;
  }
  renderLooks(); renderBest(); renderMaps();

  $('play').addEventListener('click', () => { audio.unlock(); startRun(); });
  $('resume').addEventListener('click', () => resume());
  $('restart').addEventListener('click', () => startRun());
  $('to-menu').addEventListener('click', () => toMenu());
  $('again').addEventListener('click', () => startRun());
  $('done-menu').addEventListener('click', () => toMenu());
  $('pause-btn').addEventListener('click', () => { if (phase === 'playing') pause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && phase === 'playing') pause(); });

  function show(screen) {
    for (const id of ['menu', 'pause', 'done']) $(id).hidden = id !== screen;
    $('hud').hidden = !(phase === 'playing' || phase === 'paused');
  }

  function startRun() {
    audio.unlock();
    world = new World(map);
    renderer.setWorld(world);
    renderer.dist = renderer.viewDistance(world.hole.r) * 1.6;
    run = { map: map.id, maxTier: 0, people: 0, cleared: false, beatPrevious: false, time: 0, eats: 0, unlocked: [], clears: 0, abyssAt: 0 };
    phase = 'playing';
    watch.start();
    audio.duck(false);
    show(null);
    leftoversAt = -1; keys.clear(); ptr.active = false; lastTier = -1; hintTarget = null; hintTimer = 0; endgameAnnounced = false;
    updateHud(true);
  }
  function pause() {
    if (phase !== 'playing') return;
    phase = 'paused'; watch.pause(); keys.clear(); audio.duck(true); show('pause');
  }
  function resume() {
    if (phase !== 'paused') return;
    phase = 'playing'; watch.resume(); audio.duck(false); show(null); last = performance.now();
  }
  function toMenu() {
    phase = 'menu'; watch.reset(); audio.duck(false);
    world = new World(map); renderer.setWorld(world);
    renderLooks(); renderBest(); renderMaps(); show('menu');
  }

  function grant(ids) {
    for (const id of ids) {
      if (owned.includes(id)) continue;
      owned.push(id); run.unlocked.push(id);
      toast(`New look unlocked: ${LOOKS.find(l => l.id === id).name}! Try it from the menu.`);
    }
    store.set('looks', owned);
  }

  function finish() {
    watch.stop();
    updateHud(true);
    const time = watch.elapsed;
    const res = bests.submit(map.id, seed, time);
    store.set(`cleared.${map.id}`, true);
    $('done-title').textContent = `${map.name} swallowed!`;
    const clears = (+store.get('clears', 0) || 0) + 1; store.set('clears', clears);
    Object.assign(run, { cleared: true, time, beatPrevious: res.beatPrevious, clears });
    grant(newUnlocks(owned, run));
    phase = 'cleared';
    audio.fanfare();
    $('done-time').textContent = formatTime(time);
    $('done-best').innerHTML = res.isNew
      ? `<span class="new">${res.prev ? `New best! (was ${formatTime(res.prev)})` : 'First clear! That is your time to beat.'}</span>`
      : `Best: ${formatTime(res.best)} (${formatTime(time - res.best)} slower)`;
    $('done-unlocks').innerHTML = run.unlocked.map(id => `<div>Unlocked look: ${LOOKS.find(l => l.id === id).name}</div>`).join('');
    renderBest();
    setTimeout(() => { if (phase === 'cleared') show('done'); }, 1400);
  }

  // ---------------------------------------------------------------- feedback
  let toastTimer = 0;
  function toast(msg) {
    const el = $('toast'); el.hidden = true; void el.offsetWidth; el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 3300);
  }
  let bannerTimer = 0;
  function banner(big, small) {
    const el = $('banner'); el.hidden = true; void el.offsetWidth;
    el.querySelector('.b1').textContent = big; el.querySelector('.b2').textContent = small;
    el.hidden = false; clearTimeout(bannerTimer); bannerTimer = setTimeout(() => { el.hidden = true; }, 2450);
  }
  function floater(text) {
    const p = renderer.project(world.hole.x, world.hole.z);
    const el = document.createElement('div'); el.className = 'floater'; el.textContent = text;
    el.style.left = `${p.x}px`; el.style.top = `${p.y - 30}px`;
    $('floaters').appendChild(el); setTimeout(() => el.remove(), 1300);
  }
  function burp() { renderer.burpT = t; audio.burp(); floater('BURP!'); }

  function handle(events) {
    renderer.onEvents(events, t);
    for (const e of events) {
      switch (e.type) {
        case 'eat':
          audio.swallow(e.o.s / e.to, e.o.s);
          run.eats++;
          if (TYPES[e.o.type].id === 'person') run.people = world.stats.people;
          if (look === 'burp' && e.o.s > e.to * 0.6 && run.eats % 6 === 0) burp();
          if (look === 'hat' && e.o.s > e.to * 0.5) renderer.burst(world.hole.x, world.hole.z, world.hole.r, 4);
          break;
        case 'tier': {
          run.maxTier = Math.max(run.maxTier, e.tier);
          if (e.tier === TIERS.length - 1) run.abyssAt = watch.elapsed;
          audio.tierUp(e.tier);
          const top = e.tier === TIERS.length - 1;
          banner(`${TIERS[e.tier].name}!`, top ? `Now everything fits. Clear ${map.name}!` : `Now you can swallow ${tierLabels(e.tier, map).join(', ')}`);
          if (look === 'burp') setTimeout(burp, 500);
          break;
        }
        case 'bump': audio.bump(); break;
        case 'yelp': audio.yelp(); break;
        case 'yip': audio.yelp(); break;
        case 'bark': audio.bark(); break;
        case 'honk': audio.honk(); break;
        case 'flutter': audio.coo(); break;
        case 'cleared': finish(); break;
      }
    }
    if (phase === 'playing' || phase === 'cleared') grant(newUnlocks(owned, { ...run, cleared: false, beatPrevious: false, people: world.stats.people }));
  }

  // ---------------------------------------------------------------- HUD and hints
  let lastTier = -1, hudTimer = 0, hintTarget = null, hintTimer = 0;
  function updateHud(force = false) {
    const h = world.hole;
    $('clock').textContent = formatTime(watch.elapsed);
    hudTimer -= 1;
    if (!force && hudTimer > 0) return;
    hudTimer = 6;
    if (h.tier !== lastTier) {
      lastTier = h.tier;
      const top = h.tier >= TIERS.length - 1;
      $('tier-name').textContent = TIERS[h.tier].name;
      $('tier-next').textContent = top ? 'MAX' : TIERS[h.tier + 1].name;
      $('eats-now').textContent = tierLabels(h.tier, map).join(', ') + (h.tier > 0 ? ' and smaller' : '');
      $('eats-next').textContent = top ? 'nothing bigger: clear the map!' : tierLabels(h.tier + 1, map).join(', ');
    }
    const p = tierProgress(h.r);
    $('tier-bar').querySelector('i').style.width = `${(p * 100).toFixed(1)}%`;
    $('tier-bar').querySelector('span').textContent = h.tier >= TIERS.length - 1 ? 'MAX' : `${Math.floor(p * 100)}%`;
    const eaten = world.total - world.left;
    $('left').textContent = `${world.left.toLocaleString('en-GB')} left`;
    $('left-bar').querySelector('i').style.width = `${(eaten / world.total * 100).toFixed(1)}%`;
  }

  function updateYou() {
    const el = $('you');
    const on = phase === 'playing' && watch.elapsed < 5;
    el.hidden = !on;
    if (!on) return;
    const p = renderer.project(world.hole.x, world.hole.z);
    el.style.transform = `translate(${p.x}px, ${p.y - 34 - Math.abs(Math.sin(t * 5)) * (settings.calm ? 3 : 10)}px)`;
  }

  function updateHint(dt) {
    const el = $('hint-arrow');
    if (phase !== 'playing') { el.hidden = true; return; }
    // In the endgame the pins, edge arrows and radar take over from this arrow.
    const lost = world.t - world.lastEat > 6;
    if (!lost || world.left <= ENDGAME_LEFT) { el.hidden = true; hintTarget = null; return; }
    hintTimer -= dt;
    if (hintTimer <= 0 || !hintTarget || !hintTarget.alive) { hintTimer = 0.3; hintTarget = world.nearestAlive(true); }
    const o = hintTarget; const h = world.hole;
    if (!o || Math.hypot(o.x - h.x, o.z - h.z) < h.r * 1.4 + 2) { el.hidden = true; return; }
    const hs = renderer.project(h.x, h.z), ts = renderer.project(o.x, o.z), rim = renderer.project(h.x + renderer.rv, h.z);
    const a = Math.atan2(ts.y - hs.y, ts.x - hs.x);
    const rad = Math.abs(rim.x - hs.x) + 44;
    el.hidden = false;
    el.style.transform = `translate(${hs.x + Math.cos(a) * rad}px, ${hs.y + Math.sin(a) * rad}px) rotate(${a}rad)`;
  }

  // ---------------------------------------------------------------- endgame guidance
  // From RADAR_LEFT objects left: a radar of the whole island with a dot per leftover. From ENDGAME_LEFT: also a pin
  // over every leftover on screen and arrows at the screen edge to the nearest ones off screen, with their distance.
  // A pin or dot is filled when the leftover fits now, hollow when it does not yet.
  const pinsEl = $('pins'), arrowsEl = $('edge-arrows'), radarBox = $('radar-box'), radar = $('radar');
  const pinPool = [], arrowPool = [];
  let leftovers = [], leftoversAt = -1, safe = null, safeTimer = 0, endgameAnnounced = false;
  const guide = { pins: 0, arrows: 0, radar: false, endgame: false };
  function pool(arr, parent, html, cls) {
    return i => {
      while (arr.length <= i) { const el = document.createElement('div'); el.className = cls; el.innerHTML = html; el.hidden = true; parent.appendChild(el); arr.push(el); }
      return arr[i];
    };
  }
  const pinAt = pool(pinPool, pinsEl, '<i></i>', 'pin');
  const arrowAt = pool(arrowPool, arrowsEl, '<div class="tri"></div><span></span>', 'edge');
  function safeRect() {
    // The part of the screen not covered by the HUD; arrows sit just inside it.
    const W = window.innerWidth, H = window.innerHeight;
    let top = 12, bottom = H - 12;
    for (const el of document.querySelectorAll('#hud .pill')) {
      if (el.hidden || el.closest('[hidden]')) continue;
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      if (r.top < H / 2) top = Math.max(top, Math.min(r.bottom, H * 0.3) + 8); else bottom = Math.min(bottom, r.top - 8);
    }
    const rb = radarBox.hidden ? null : radarBox.getBoundingClientRect();
    return { l: 26, r: W - 26, t: top + 22, b: bottom - 36, radar: rb && rb.width ? rb : null };
  }
  function updateGuide(dt) {
    const radarOn = (phase === 'playing' || phase === 'paused') && world.left > 0 && world.left <= RADAR_LEFT;
    const on = radarOn && world.left <= ENDGAME_LEFT;
    if (radarOn !== guide.radar) { guide.radar = radarOn; radarBox.hidden = !radarOn; document.body.classList.toggle('endgame', radarOn); safe = null; }
    guide.endgame = on;
    if (!on) {
      for (const el of pinPool) el.hidden = true;
      for (const el of arrowPool) el.hidden = true;
      guide.pins = guide.arrows = 0;
    }
    if (!radarOn) return;
    if (leftoversAt !== world.left) { leftoversAt = world.left; leftovers = world.remaining(); }
    const h0 = world.hole;
    if (!on) { drawRadar(leftovers.filter(o => o.alive).map(o => [Math.hypot(o.x - h0.x, o.z - h0.z), o]).sort((a, b) => a[0] - b[0])); return; }
    if (!endgameAnnounced && phase === 'playing') { endgameAnnounced = true; banner('Final sweep!', 'Every leftover is marked. Follow the arrows.'); }
    safeTimer -= dt;
    if (!safe || safeTimer <= 0) { safe = safeRect(); safeTimer = 0.5; }
    const h = world.hole, hs = renderer.project(h.x, h.z);
    const cx = Math.max(safe.l, Math.min(safe.r, hs.x)), cy = Math.max(safe.t, Math.min(safe.b, hs.y));
    const byDist = leftovers.filter(o => o.alive).map(o => [Math.hypot(o.x - h.x, o.z - h.z), o]).sort((a, b) => a[0] - b[0]);
    let np = 0, na = 0;
    const placed = [];
    for (const [d, o] of byDist) {
      // The pin marks the spot on the ground where the hole has to go, not the top of a tall thing.
      const p = renderer.project(o.x, o.z);
      const onScreen = !p.behind && p.x >= 0 && p.x <= window.innerWidth && p.y >= 0 && p.y <= window.innerHeight;
      if (onScreen) {
        const el = pinAt(np++);
        el.hidden = false;
        el.classList.toggle('big', o.s > h.r);
        el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
      }
      if (na < 3 && (!onScreen || p.x < safe.l || p.x > safe.r || p.y < safe.t || p.y > safe.b) && d > h.r) {
        // From the hole towards the target, stopped at the edge of the safe area.
        let dx = p.x - cx, dy = p.y - cy;
        if (p.behind) { dx = o.x - h.x; dy = o.z - h.z; }
        const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
        const k = Math.min(dx > 0 ? (safe.r - cx) / dx : dx < 0 ? (safe.l - cx) / dx : Infinity, dy > 0 ? (safe.b - cy) / dy : dy < 0 ? (safe.t - cy) / dy : Infinity);
        let ax = cx + dx * k, ay = cy + dy * k;
        // Keep arrows out from under the radar in the corner.
        if (safe.radar && ax > safe.radar.left - 34 && ax < safe.radar.right + 34 && ay < safe.radar.bottom + 34 && ay > safe.radar.top - 34) {
          if (ay < safe.radar.top) ax = Math.min(ax, safe.radar.left - 34); else ay = safe.radar.bottom + 34;
        }
        if (placed.some(([x, y]) => Math.hypot(x - ax, y - ay) < 56)) continue;  // one arrow per direction: the nearest
        placed.push([ax, ay]);
        const el = arrowAt(na++);
        el.hidden = false;
        el.style.transform = `translate(${ax.toFixed(1)}px, ${ay.toFixed(1)}px)`;
        el.firstChild.style.transform = `rotate(${Math.atan2(dy, dx).toFixed(3)}rad)`;
        el.lastChild.textContent = `${Math.max(1, Math.round(d - h.r))} m`;
      }
    }
    for (let i = np; i < pinPool.length; i++) pinPool[i].hidden = true;
    for (let i = na; i < arrowPool.length; i++) arrowPool[i].hidden = true;
    guide.pins = np; guide.arrows = na;
    drawRadar(byDist);
  }
  let radarLand = null, radarMap = null;
  function drawRadar(byDist) {
    const css = radar.clientWidth || 120, dpr = Math.min(2, window.devicePixelRatio || 1), px = Math.round(css * dpr);
    if (radar.width !== px) { radar.width = px; radar.height = px; }
    const g = radar.getContext('2d'), e = world.map.edge, pad = 8 * dpr, k = (px - 2 * pad) / (2 * e);
    const X = x => pad + (x + e) * k;
    g.clearRect(0, 0, px, px);
    if (map.shaped) {
      if (radarMap !== map.id) {
        radarMap = map.id; radarLand = document.createElement('canvas'); radarLand.width = radarLand.height = 64;
        const bg = radarLand.getContext('2d');bg.fillStyle = '#35a4bd';bg.fillRect(0,0,64,64);bg.fillStyle = map.id === 'harbour' ? '#e6c581' : '#8fc65b';
        for(let x=0;x<64;x++) for(let z=0;z<64;z++) if(landAt(map.id,(x/64*2-1)*e,(z/64*2-1)*e)) bg.fillRect(x,z,1,1);
      }
      g.drawImage(radarLand,pad,pad,2*e*k,2*e*k);
    } else { g.fillStyle = 'rgba(95, 154, 72, 0.55)'; g.fillRect(pad, pad, 2 * e * k, 2 * e * k); }
    g.strokeStyle = 'rgba(255, 255, 255, 0.35)'; g.lineWidth = dpr; g.strokeRect(pad, pad, 2 * e * k, 2 * e * k);
    const h = world.hole;
    g.fillStyle = '#120a24'; g.strokeStyle = '#c9a6ff'; g.lineWidth = 2 * dpr;
    g.beginPath(); g.arc(X(h.x), X(h.z), Math.max(4 * dpr, h.r * k), 0, Math.PI * 2); g.fill(); g.stroke();
    byDist.forEach(([, o], i) => {
      const r = (i === 0 ? 4 : 3) * dpr;
      g.beginPath(); g.arc(X(o.x), X(o.z), r, 0, Math.PI * 2);
      g.lineWidth = 1.5 * dpr; g.strokeStyle = '#1b1430';
      if (o.s <= h.r) { g.fillStyle = '#ffe08a'; g.fill(); g.stroke(); } else { g.strokeStyle = '#ffe08a'; g.stroke(); }
      if (i === 0) { g.beginPath(); g.arc(X(o.x), X(o.z), r + 3 * dpr, 0, Math.PI * 2); g.strokeStyle = '#ffffff'; g.lineWidth = dpr; g.stroke(); }
    });
    $('radar-cap').textContent = `${world.left} left`;
  }
  window.addEventListener('resize', () => { safe = null; });

  // ---------------------------------------------------------------- loop
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
    t += dt;
    fCount++; fTime += dt;
    if (fTime >= 0.5) {
      fps = fCount / fTime; fCount = 0; fTime = 0;
      if (!forcedPR) {
        // Adaptive resolution with a cool-down, so the picture does not keep stepping between sharp and soft.
        perfWindow.push(fps); if (perfWindow.length > 4) perfWindow.shift();
        const avg = perfWindow.reduce((a, b) => a + b, 0) / perfWindow.length;
        prHold = Math.max(0, prHold - 0.5);
        if (perfWindow.length >= 3 && avg < (map.shaped ? 54 : 46) && renderer.pr > 0.5) { renderer.setPixelRatio(renderer.pr - 0.15); perfWindow = []; prHold = 6; }
        else if (perfWindow.length >= 4 && avg > 58.5 && prHold <= 0 && renderer.pr < renderer.maxPR) { renderer.setPixelRatio(renderer.pr + 0.1); perfWindow = []; prHold = 3; }
      }
    }
    if (phase === 'playing') {
      const [ix, iz] = steer();
      const n = dt > 1 / 40 ? 2 : 1;
      for (let i = 0; i < n && phase === 'playing'; i++) handle(world.step(dt / n, ix, iz));
    } else if (phase === 'menu') {
      for (const m of world.movers) if (m.alive) world.moveMover(m, dt);
    }
    renderer.frame(dt, t, phase === 'menu' ? 'menu' : 'play');
    if (phase === 'playing' || phase === 'paused') updateHud();
    updateHint(dt);
    updateGuide(dt);
    updateYou();
    requestAnimationFrame(frame);
  }
  show('menu');
  requestAnimationFrame(frame);

  // ---------------------------------------------------------------- read-only test hooks
  const screenOf = o => { if (!o) return null; const p = renderer.project(o.x, o.z); return { x: p.x, y: p.y, dist: Math.hypot(o.x - world.hole.x, o.z - world.hole.z) }; };
  window.__game = Object.freeze({
    get phase() { return phase; },
    get elapsed() { return watch.elapsed; },
    get size() { return world.hole.r; },
    get tier() { return world.hole.tier; },
    get tierName() { return TIERS[world.hole.tier].name; },
    get left() { return world.left; },
    get total() { return world.total; },
    get fps() { return fps; },
    get seed() { return seed; },
    get map() { return map.id; },
    get pixelRatio() { return renderer.pr; },
    get looks() { return owned.slice(); },
    get hole() { return { x: world.hole.x, z: world.hole.z }; },
    get mapSignature() { return mapSig; },
    holeScreen() { return screenOf(world.hole); },
    diagnostics() { return { ...renderer.diagnostics(), pins: guide.pins, arrows: guide.arrows, radar: guide.radar, endgame: guide.endgame, pr: renderer.pr }; },
    nearestEdibleScreen() { return screenOf(world.nearestAlive(true)); },
  });
}

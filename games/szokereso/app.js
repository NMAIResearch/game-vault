(function () {
  'use strict';
  const C = window.WordSearch, puzzles = window.WORDSEARCH_PUZZLES;
  const $ = id => document.getElementById(id);
  const strings = {
    hu: {
      title: 'Szókereső', eyebrow: 'A JÁTÉKOS MELLÉKLET', subtitle: 'Szavak között egy rejtett mondat.',
      how: 'Útmutató', skip: 'Ugrás a rejtvényhez', puzzle: 'Rejtvény', puzzleNav: 'Rejtvényválasztó',
      previous: 'Előző rejtvény', next: 'Következő rejtvény', easy: 'Könnyű', medium: 'Közepes', hard: 'Nehéz',
      day: 'NAPPALI KIADÁS', night: 'ÉJSZAKAI KIADÁS', light: 'Nappali kiadás', dark: 'Éjszakai kiadás',
      words: 'Keresd meg!', foundCount: 'megtalálva', gesture: 'Húzd végig, vagy koppints a szó két végére.',
      easyDirections: 'Irányok: → ↓', mediumDirections: 'Irányok: → ↓ ↘ ↗', hardDirections: 'Mind a nyolc irányban, visszafelé is.',
      reset: 'Újrakezdés', cancelSelection: 'Kijelölés elvetése', solution: 'Megfejtés',
      solutionHelp: 'A megmaradó betűk soronként, balról jobbra adják a megfejtést.',
      solved: 'Minden szó megvan!', another: 'Következő rejtvény →',
      privacy: 'A haladásod ezen az eszközön marad.', note: 'Egy ceruzányi figyelem, egy mondatnyi meglepetés.',
      close: 'Bezárás', cancel: 'Mégse', resetTitle: 'Újrakezded ezt a rejtvényt?',
      resetBody: 'Csak ennek a rejtvénynek a jelölései törlődnek. A többi rejtvény megmarad.', resetConfirm: 'Igen, újrakezdem',
      help1: 'Keresd meg a felsorolt szavakat a rácsban. Húzd végig az ujjad vagy az egeret egy szón, vagy koppints az első és az utolsó betűjére. A két végét bármelyik sorrendben kijelölheted. A szavak mindig egyenes vonalban futnak; a hibás kijelölés nem hagy nyomot.',
      help2: 'A magyar betűket a Game Vault keresztrejtvényével azonos módon bontjuk: a CS, DZ, DZS, GY, LY, NY, SZ, TY és ZS egy-egy mező. Az ékezeteket megtartjuk. Az angol rejtvényekben egy mező egy betű.',
      help3: 'Könnyű: jobbra és lefelé. Közepes: ezek mellett a jobbra lefelé és jobbra felfelé futó átlók is. Nehéz: mind a nyolc irány, visszafelé is. A megtalált szót ceruzavonal veszi körül, és áthúzzuk a listában.',
      help4: 'Az utolsó szó után a fel nem használt mezők sorban felvillannak. Balról jobbra, fentről lefelé olvasva adják a témához illő megfejtést. Az Újrakezdés csak ennek a rejtvénynek a jelöléseit törli, megerősítés után.',
      keyboardHelp: 'Billentyűzettel: a nyilakkal lépkedhetsz. Enter vagy szóköz: kezdőbetű, majd végbetű kijelölése. Escape: kijelölés elvetése. A Tab kilép a rácsból.',
      storageHelp: 'Automatikus mentés csak ebben a böngészőben. Másik eszközre nem kerül át. A böngésző adatainak törlése vagy a privát ablak bezárása elveszítheti a mentést. Ha nem tudunk menteni, jelezzük; továbbra is játszhatsz.',
      saved: '✓ Mentve ebben a böngészőben', cannotSave: 'A mentés nem érhető el. Az új haladás csak a lap bezárásáig marad meg.',
      stale: 'A korábbi mentés nem illik ehhez a rejtvényhez. Új lapot nyitottunk.',
      intro: 'Melyik szót találod meg először?', anchor: 'Most jelöld ki a szó másik végét.', miss: 'Ez nem egy felsorolt szó. Próbáld újra!',
      repeat: 'Ezt a szót már megtaláltad.', found: 'Megtaláltad:', cleared: 'Új lap, új kezdet.', cancelled: 'A kijelölést elvetettük.',
      grid: 'Betűrács', row: 'sor', column: 'oszlop', marked: 'megtalált szó része', remaining: 'a megfejtés betűje',
      reveal: 'A megmaradó betűk adják a megfejtést.'
    },
    en: {
      title: 'Word Search', eyebrow: 'THE PUZZLE SUPPLEMENT', subtitle: 'A little message between the words.',
      how: 'How to play', skip: 'Skip to the puzzle', puzzle: 'Puzzle', puzzleNav: 'Choose a puzzle',
      previous: 'Previous puzzle', next: 'Next puzzle', easy: 'Easy', medium: 'Medium', hard: 'Hard',
      day: 'DAY EDITION', night: 'NIGHT EDITION', light: 'Day edition', dark: 'Night edition',
      words: 'Find these words', foundCount: 'found', gesture: 'Drag along a word, or tap its two ends.',
      easyDirections: 'Directions: → ↓', mediumDirections: 'Directions: → ↓ ↘ ↗', hardDirections: 'All eight directions, backwards too.',
      reset: 'Start again', cancelSelection: 'Cancel selection', solution: 'Solution',
      solutionHelp: 'Read the unused letters from left to right, row by row, to find the message.',
      solved: 'Every word found!', another: 'Next puzzle →',
      privacy: 'Your progress stays on this device.', note: 'A pencil, a little patience, a message waiting to be found.',
      close: 'Close', cancel: 'Cancel', resetTitle: 'Start this puzzle again?',
      resetBody: 'Only the marks in this puzzle will be cleared. Your other puzzles will stay as they are.', resetConfirm: 'Yes, start again',
      help1: 'Find the listed words in the grid. Drag your finger or mouse along a word, or tap its first and last letters. You can select the two ends in either order. Words always run in a straight line. An incorrect selection leaves no mark.',
      help2: 'English puzzles use one letter per cell. Hungarian puzzles follow the companion crossword convention: CS, DZ, DZS, GY, LY, NY, SZ, TY and ZS each occupy one cell. Accents are preserved.',
      help3: 'Easy: right and down. Medium: also diagonally right, upwards and downwards. Hard: all eight directions, including backwards. A found word gets a pencil loop and is crossed off the list.',
      help4: 'After the last word, the unused cells light up in order. Read them from left to right, top to bottom, for a message on the theme. Start again clears only this puzzle, after confirmation.',
      keyboardHelp: 'Keyboard: use the arrow keys to move. Enter or Space selects the first letter, then the last letter. Escape cancels a selection. Tab leaves the grid.',
      storageHelp: 'Progress saves automatically in this browser only. It does not move between devices. Clearing browser data or closing a private window may remove saves. If saving is unavailable, we show a warning; you can still play.',
      saved: '✓ Saved in this browser', cannotSave: 'Saving is unavailable. New progress will only last until you close this page.',
      stale: 'The previous save does not fit this puzzle. We opened a fresh page.',
      intro: 'Which word will you spot first?', anchor: 'Now choose the other end of the word.', miss: 'That is not a listed word. Try again!',
      repeat: 'You have already found that word.', found: 'You found:', cleared: 'A fresh page, a fresh start.', cancelled: 'Selection cancelled.',
      grid: 'Letter grid', row: 'row', column: 'column', marked: 'part of a found word', remaining: 'solution letter',
      reveal: 'The remaining letters spell the solution.'
    }
  };
  let storage;
  try { storage = window.localStorage; } catch { storage = null; }
  const prefRead = C.readStorage(storage, C.PREFS), prefs = C.preferences(prefRead.value);
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let language = prefs.language, game, selection, cells = [], listItems = [], activePointer = null;
  let timer = null, saveOK = prefRead.ok;
  const t = key => strings[language][key];
  const text = (node, value) => { if (node.textContent !== value) node.textContent = value; };
  const notice = value => text($('feedback'), value);
  function saveStatus() {
    text($('save-status'), t(saveOK ? 'saved' : 'cannotSave'));
    $('save-status').classList.toggle('error', !saveOK);
  }
  function save() {
    const progressOK = C.writeStorage(storage, C.keyFor(game.puzzle), game.serialise());
    const prefsOK = C.writeStorage(storage, C.PREFS, prefs);
    saveOK = progressOK && prefsOK;
    saveStatus();
  }
  function applyTheme() {
    const dark = prefs.theme === 'dark' || prefs.theme === 'system' && systemTheme.matches;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    $('theme').setAttribute('aria-label', t(dark ? 'light' : 'dark'));
    $('theme').title = t(dark ? 'light' : 'dark');
    text($('edition-label'), t(dark ? 'night' : 'day'));
  }
  function labels() {
    document.documentElement.lang = language === 'hu' ? 'hu' : 'en-GB';
    document.title = t('title') + ' | Game Vault';
    document.querySelector('meta[name="description"]').content = t('subtitle');
    document.querySelectorAll('[data-text]').forEach(node => text(node, t(node.dataset.text)));
    for (const lang of ['hu', 'en']) $('lang-' + lang).setAttribute('aria-pressed', String(lang === language));
    for (const [id, key] of [['puzzle-nav', 'puzzleNav'], ['previous-puzzle', 'previous'], ['next-puzzle', 'next'], ['board-panel', 'title'], ['grid', 'grid']]) $(id).setAttribute('aria-label', t(key));
    applyTheme();
  }
  function stopReveal() { if (timer !== null) clearTimeout(timer); timer = null; }
  function showSolution() {
    $('solution-result').hidden = false;
    text($('solution-phrase'), game.puzzle.solution);
  }
  function reveal(animate) {
    stopReveal();
    const order = game.puzzle.leftover;
    const light = i => {
      if (!cells[i].classList.contains('phrase-letter')) {
        cells[i].classList.add('phrase-letter');
        cells[i].setAttribute('aria-label', cells[i].getAttribute('aria-label') + ', ' + t('remaining'));
      }
    };
    if (!animate || reducedMotion.matches) { order.forEach(light); showSolution(); return; }
    let next = 0;
    function step() {
      const i = order[next++];
      light(i); cells[i].classList.add('revealing');
      if (next < order.length) timer = setTimeout(step, 65);
      else { timer = null; showSolution(); }
    }
    step();
  }
  function drawMarks() {
    const svg = $('marks'), p = game.puzzle;
    svg.replaceChildren();
    svg.setAttribute('viewBox', '0 0 ' + p.width + ' ' + p.height);
    const ns = svg.namespaceURI;
    p.words.filter(w => game.found.has(w.id)).forEach(word => {
      const first = word.path[0], last = word.path.at(-1);
      const x1 = first % p.width + .5, y1 = Math.floor(first / p.width) + .5;
      const x2 = last % p.width + .5, y2 = Math.floor(last / p.width) + .5;
      const length = Math.hypot(x2 - x1, y2 - y1) + .83;
      const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      for (const offset of [0, .04]) {
        const rect = document.createElementNS(ns, 'rect');
        for (const [key, value] of Object.entries({ x: -.415 + offset, y: -.365 + offset, width: length - offset,
          height: .73 - offset, rx: .37, transform: 'translate(' + x1 + ' ' + y1 + ') rotate(' + angle + ')',
          class: 'loop' + (offset ? ' second' : '') })) rect.setAttribute(key, value);
        svg.append(rect);
      }
    });
  }
  function renderSelection(focus = false) {
    const preview = new Set(selection.preview);
    cells.forEach((cell, i) => {
      cell.classList.toggle('preview', preview.has(i));
      cell.classList.toggle('anchor', selection.anchor === i);
      cell.setAttribute('aria-selected', String(preview.has(i)));
      cell.tabIndex = selection.cursor === i ? 0 : -1;
    });
    $('cancel-selection').hidden = selection.anchor === null;
    if (focus) cells[selection.cursor].focus({ preventScroll: true });
  }
  function renderProgress() {
    const p = game.puzzle;
    text($('progress'), game.found.size + ' / ' + p.words.length + ' ' + t('foundCount'));
    const marked = new Set(p.words.filter(w => game.found.has(w.id)).flatMap(w => w.path));
    cells.forEach((cell, i) => {
      cell.classList.toggle('found', marked.has(i));
      cell.setAttribute('aria-label', p.cells[i] + ', ' + t('row') + ' ' + (Math.floor(i / p.width) + 1) + ', ' +
        t('column') + ' ' + (i % p.width + 1) + (marked.has(i) ? ', ' + t('marked') : ''));
    });
    listItems.forEach((li, i) => {
      const found = game.found.has(p.words[i].id);
      li.classList.toggle('found', found);
      text(li.firstElementChild, found ? '✓' : '·');
      text(li.lastElementChild, found ? ' (' + t('foundCount') + ')' : '');
    });
    drawMarks();
    renderSelection();
  }
  function result(outcome, focus = false) {
    if (!outcome) return;
    if (outcome.kind === 'found') {
      save(); renderProgress();
      notice(t('found') + ' ' + outcome.word.text + (game.complete ? ' ' + t('reveal') : ''));
      if (game.complete) reveal(true);
    } else if (outcome.kind === 'repeat') notice(t('repeat'));
    else if (outcome.kind !== 'move') notice(t(outcome.kind === 'anchor' ? 'anchor' : outcome.kind === 'miss' ? 'miss' : 'cancelled'));
    renderSelection(focus);
  }
  function loadPuzzle(id, lang = language) {
    if (game) save();
    stopReveal(); activePointer = null;
    language = lang; prefs.language = lang;
    const group = puzzles.filter(p => p.lang === lang), p = group.find(p => p.id === id) || group[0];
    prefs.last[lang] = p.id;
    const saved = C.readStorage(storage, C.keyFor(p));
    game = new C.Game(p, saved.value); selection = new C.Selection(game);
    labels();
    $('puzzle').replaceChildren(...group.map((puzzle, i) => {
      const option = document.createElement('option'); option.value = puzzle.id;
      option.textContent = String(i + 1).padStart(2, '0') + ' · ' + puzzle.title + ' · ' + t(puzzle.difficulty);
      option.selected = puzzle.id === p.id; return option;
    }));
    text($('edition-number'), p.id.slice(-2));
    text($('difficulty'), t(p.difficulty)); text($('directions'), t(p.difficulty + 'Directions'));
    $('grid').style.setProperty('--columns', p.width);
    $('grid').setAttribute('aria-rowcount', p.height); $('grid').setAttribute('aria-colcount', p.width);
    cells = [];
    const rows = Array.from({ length: p.height }, (_, y) => {
      const row = document.createElement('div'); row.className = 'grid-row'; row.setAttribute('role', 'row');
      row.setAttribute('aria-rowindex', y + 1);
      for (let x = 0; x < p.width; x++) {
        const i = y * p.width + x, cell = document.createElement('button');
        cell.type = 'button'; cell.className = 'cell' + (p.cells[i].length > 1 ? ' multi' : '');
        cell.dataset.cell = i; cell.textContent = p.cells[i]; cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-colindex', x + 1); row.append(cell); cells.push(cell);
      }
      return row;
    });
    $('grid').replaceChildren(...rows);
    listItems = p.words.map(word => {
      const li = document.createElement('li'); li.classList.toggle('long', word.text.length > 10);
      const tick = document.createElement('span'); tick.className = 'tick'; tick.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span'); label.className = 'word-text'; label.textContent = word.text;
      const status = document.createElement('span'); status.className = 'sr-only';
      li.append(tick, label, status); return li;
    });
    $('word-list').replaceChildren(...listItems);
    $('solution-result').hidden = true; text($('solution-phrase'), '');
    renderProgress();
    if (game.complete) reveal(false);
    notice(game.restoreStatus === 'invalid' || saved.reason === 'corrupt' ? t('stale') : t('intro'));
    // Write status checks both save surfaces, including storage denied after a prior visit.
    save();
  }
  function nextPuzzle(step) {
    const group = puzzles.filter(p => p.lang === language), at = group.indexOf(game.puzzle);
    loadPuzzle(group[(at + step + group.length) % group.length].id);
  }
  function eventCell(event) {
    const rect = $('grid').getBoundingClientRect(), p = game.puzzle;
    if (event.clientX < rect.left || event.clientX >= rect.right || event.clientY < rect.top || event.clientY >= rect.bottom) return null;
    return Math.floor((event.clientY - rect.top) / rect.height * p.height) * p.width +
      Math.floor((event.clientX - rect.left) / rect.width * p.width);
  }
  $('grid').addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || activePointer !== null) return;
    const i = eventCell(event); if (i === null) return;
    event.preventDefault(); activePointer = event.pointerId;
    selection.down(i); $('grid').setPointerCapture(event.pointerId); renderSelection(true);
  });
  $('grid').addEventListener('pointermove', event => {
    if (event.pointerId !== activePointer) return;
    selection.move(eventCell(event)); renderSelection();
  });
  $('grid').addEventListener('pointerup', event => {
    if (event.pointerId !== activePointer) return;
    activePointer = null; result(selection.up(eventCell(event)));
    if ($('grid').hasPointerCapture(event.pointerId)) $('grid').releasePointerCapture(event.pointerId);
  });
  const cancelPointer = event => {
    if (event.pointerId !== activePointer) return;
    activePointer = null; selection.cancel(); renderSelection();
  };
  $('grid').addEventListener('pointercancel', cancelPointer);
  $('grid').addEventListener('lostpointercapture', cancelPointer);
  $('grid').addEventListener('click', event => {
    const cell = event.target.closest('[data-cell]');
    if (event.detail === 0 && cell) result(selection.tap(Number(cell.dataset.cell)));
  });
  $('grid').addEventListener('focusin', event => {
    if (event.target.dataset.cell !== undefined) { selection.cursor = Number(event.target.dataset.cell); renderSelection(); }
  });
  $('grid').addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const outcome = selection.key(event.key);
    if (outcome) { event.preventDefault(); result(outcome, true); }
  });
  $('cancel-selection').addEventListener('click', () => { selection.cancel(); notice(t('cancelled')); renderSelection(true); });
  $('puzzle').addEventListener('change', event => loadPuzzle(event.target.value));
  $('previous-puzzle').addEventListener('click', () => nextPuzzle(-1));
  $('next-puzzle').addEventListener('click', () => nextPuzzle(1));
  $('another').addEventListener('click', () => { nextPuzzle(1); $('puzzle').focus(); });
  for (const lang of ['hu', 'en']) $('lang-' + lang).addEventListener('click', () => loadPuzzle(prefs.last[lang], lang));
  $('theme').addEventListener('click', () => {
    prefs.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; applyTheme(); save();
  });
  systemTheme.addEventListener('change', () => { if (prefs.theme === 'system') applyTheme(); });
  $('help-open').addEventListener('click', () => { selection.cancel(); renderSelection(); $('help').showModal(); });
  $('help-close').addEventListener('click', () => $('help').close());
  $('reset-open').addEventListener('click', () => { selection.cancel(); renderSelection(); $('reset-dialog').showModal(); });
  $('reset-cancel').addEventListener('click', () => $('reset-dialog').close());
  $('reset-confirm').addEventListener('click', () => {
    stopReveal(); game.clear(); selection.cancel();
    cells.forEach(cell => cell.classList.remove('phrase-letter', 'revealing'));
    $('solution-result').hidden = true; text($('solution-phrase'), '');
    renderProgress(); save(); notice(t('cleared')); $('reset-dialog').close();
  });
  window.addEventListener('pagehide', stopReveal);
  window.addEventListener('pageshow', event => { if (event.persisted && game.complete) reveal(false); });
  loadPuzzle(prefs.last[language]);
})();

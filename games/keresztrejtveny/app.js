(function () {
  'use strict';
  const C = window.Crossword;
  const puzzles = window.CROSSWORD_PUZZLES;
  const $ = id => document.getElementById(id);
  const PREFS = C.PREFIX + 'preferences:v1';
  const strings = {
    hu: {
      title: 'Keresztrejtvény', eyebrow: 'A JÁTÉKOS MELLÉKLET', edition: 'KIS SZÜNET',
      subtitle: 'Egy kis csend. Egy jó rejtvény.', how: 'Hogyan játsszak?', skip: 'Ugrás a rejtvényhez',
      puzzle: 'Rejtvény', puzzleNav: 'Rejtvényválasztó', previousPuzzle: 'Előző rejtvény', nextPuzzle: 'Következő rejtvény',
      easy: 'Könnyű', medium: 'Közepes', zoom: 'Olvasóméret', zoomOff: 'Áttekintés',
      dayEdition: 'NAPPALI KIADÁS', nightEdition: 'ÉJSZAKAI KIADÁS',
      guide: 'Koppints a szürke meghatározásra. A nyíl után írd a választ.',
      guideClue: 'Meghatározás', guideWrite: 'Ide írsz', guidePhrase: 'Megfejtés, számsorrendben',
      panHint: 'Húzd a rácsot a többi mezőhöz. A sávban a teljes meghatározás látszik.',
      across: 'Vízszintes', down: 'Függőleges', cells: 'mező', switchDirection: 'Másik szó a kereszteződésben',
      solution: 'A rejtett megfejtés', phraseHelp: 'A számozott, árnyalt mezők betűit olvasd számsorrendben.',
      solved: 'Megfejtetted!', another: 'Jöhet a következő →', yourPencil: 'A ceruzád mellé',
      check: 'Ellenőrzés', revealLetter: 'Egy betű', revealWord: 'A teljes szó', clear: 'Újrakezdés',
      allClues: 'Minden meghatározás', note: 'Nincs időmérő. Csak te, a betűk és egy kis kíváncsiság.',
      keyboard: 'Betűk', keyboardLabel: 'Képernyő-billentyűzet', hideKeys: 'Elrejtés', showKeys: 'Billentyűzet',
      multiKeys: 'CS, GY, SZ… egy mezőbe', prevWord: '‹ Előző szó', nextWord: 'Következő ›', advance: 'Tovább →',
      privacy: 'A haladásod ezen az eszközön marad.', close: 'Bezárás',
      clearTitle: 'Újrakezded ezt a rejtvényt?', clearBody: 'Csak ennek a rejtvénynek a betűi és segítségjelölései törlődnek. A többi rejtvény megmarad.',
      cancel: 'Mégse', clearConfirm: 'Igen, újrakezdem',
      help1: 'Koppints egy üres mezőre, és gépeld be a betűt. A nyilas mezőkben rövid meghatározás van; a teljes szöveg a rács feletti sávban jelenik meg. A válasz a nyíl utáni mezőben kezdődik, jobbra vagy lefelé halad.',
      help2: 'A CS, DZ, DZS, GY, LY, NY, SZ, TY és ZS egy-egy mezőt foglal. Gépeld sorban a betűiket, időkorlát nélkül, vagy használd a külön gombjaikat. Ha egy összetett betű betűit külön mezőbe szánod, nyomj köztük szóközt. Például: S, Z → SZ egy mezőben; S, szóköz, Z → két mező.',
      help3: 'Az ékezetes és ékezet nélküli bevitel is jó: például O helyett Ó, Ö vagy Ő is elfogadható. A megfejtés végén az eredeti írásmódot mutatjuk.',
      help4: 'Az Ellenőrzés felkiáltójellel jelöli a hibás betűket, a helyes választ nem írja be. Az Egy betű és A teljes szó segítséget ad; a megadott mezőket kis sarokjel mutatja. Az Újrakezdés megerősítést kér.',
      help5: 'A számozott, szürke mezők adják a rejtett kifejezést. Olvasd őket számsorrendben; alul össze is gyűjtjük őket. A játék akkor gratulál, ha a teljes rács helyes. Telefonon nagy mezőkkel indulunk: húzd a rácsot a többi mezőhöz. Az Áttekintés a teljes rácsot mutatja; az Olvasóméret visszanagyítja.',
      helpKeyboard: 'Billentyűzettel: nyilak = mozgás a rácsban; Enter = másik szó a kereszteződésben; szóköz = következő mező; Home / End = a szó eleje / vége; Backspace = törlés; Delete = a kijelölt mező törlése. A Tab szabadon kilép a rácsból. A Minden meghatározás listából is választhatsz szót.',
      helpStorage: 'Automatikus mentés ebben a böngészőben. Másik eszközre nem kerül át. A böngésző adatainak törlése vagy a privát ablak bezárása elveszítheti a mentést. Ha menteni nem tudunk, külön jelezzük; a játék akkor is folytatható.',
      gridInstructions: 'A nyilakkal lépkedhetsz. Enter: másik szó a kereszteződésben. Szóköz: következő mező. Tab: kilépés a rácsból.',
      grid: 'Rejtvényrács', row: 'sor', column: 'oszlop', empty: 'üres', wrong: 'hibás', revealed: 'segítséggel megadva',
      shadeNumber: 'megfejtésbetű', backspace: 'Betű törlése', keyLabel: 'Betű', dark: 'Éjszakai kiadás', light: 'Nappali kiadás',
      saved: '✓ Mentve ebben a böngészőben', cannotSave: 'A mentés nem érhető el. Az új betűk csak a lap bezárásáig maradnak meg.',
      corrupt: 'A régi mentés nem olvasható ehhez a rejtvényhez. Üres rácsot nyitottunk.',
      intro: 'Koppints egy meghatározásra vagy egy fehér mezőre.', composeHint: 'Szóköz: következő mező · Enter: irányváltás',
      composing: 'Folytatható', separate: 'Külön betűhöz: szóköz.',
      letterGiven: 'Egy betűt megadtunk. A kis sarokjel mutatja a segítséget.', wordGiven: 'A kijelölt szót megadtuk.',
      cleared: 'Üres rács, új kezdet.', noErrors: 'A beírt betűk jók.', allCorrect: 'Minden betű helyes!',
      wrongCount: 'Hibás mezők', emptyCount: 'Üres mezők', filled: 'kitöltve', hintsUsed: 'Segítséggel jelölt mezők',
      noHints: 'Minden mezőt segítségjel nélkül töltöttél ki.', confirmed: 'A teljes rács helyes.'
    },
    en: {
      title: 'Arrowwords', eyebrow: 'THE PUZZLE SUPPLEMENT', edition: 'A LITTLE PAUSE',
      subtitle: 'A quiet moment. A good puzzle.', how: 'How to play', skip: 'Skip to the puzzle',
      puzzle: 'Puzzle', puzzleNav: 'Choose a puzzle', previousPuzzle: 'Previous puzzle', nextPuzzle: 'Next puzzle',
      easy: 'Easy', medium: 'Medium', zoom: 'Reading size', zoomOff: 'Overview',
      dayEdition: 'DAY EDITION', nightEdition: 'NIGHT EDITION',
      guide: 'Choose a grey clue. Write its answer after the arrow.',
      guideClue: 'Clue', guideWrite: 'Write here', guidePhrase: 'Shaded numbers spell the phrase',
      panHint: 'Pan the grid to see more cells. Read the full clue in the bar above.',
      across: 'Across', down: 'Down', cells: 'cells', switchDirection: 'Switch word at this crossing',
      solution: 'The hidden phrase', phraseHelp: 'Read the numbered shaded cells in numerical order.',
      solved: 'You solved it!', another: 'Try the next puzzle →', yourPencil: 'Beside your pencil',
      check: 'Check', revealLetter: 'Reveal letter', revealWord: 'Reveal word', clear: 'Start again',
      allClues: 'All the clues', note: 'No ticking clock. Just you, the letters and a little curiosity.',
      keyboard: 'Letters', keyboardLabel: 'On-screen keyboard', hideKeys: 'Hide', showKeys: 'Show keyboard',
      multiKeys: 'CS, GY, SZ… in one cell', prevWord: '‹ Previous', nextWord: 'Next word ›', advance: 'Next cell →',
      privacy: 'Your progress stays on this device.', close: 'Close',
      clearTitle: 'Start this puzzle again?', clearBody: 'Only the letters and hint marks in this puzzle will be cleared. Your other puzzles will stay as they are.',
      cancel: 'Cancel', clearConfirm: 'Yes, start again',
      help1: 'Select an empty cell and type a letter. The arrow cells contain short clues; the full clue appears in the bar above the grid. Each answer starts immediately after its arrow and runs right or down.',
      help2: 'English puzzles use one letter per cell. Hungarian puzzles also use CS, DZ, DZS, GY, LY, NY, SZ, TY and ZS as single cells. In Hungarian, type those letters in sequence without a time limit, or use their dedicated keys. Use Space between letters that would otherwise combine but belong in separate cells.',
      help3: 'Letters with or without accents count as matches. For example, O, Ó, Ö and Ő are treated alike. The final phrase is shown with its original spelling.',
      help4: 'Check marks incorrect letters with an exclamation mark without entering the answer. Reveal letter and Reveal word add help; small corner marks identify revealed cells. Start again asks for confirmation.',
      help5: 'The numbered grey cells spell a hidden phrase. Read them in numerical order; we also collect them below the grid. The whole grid must be correct before the puzzle is confirmed. On a phone, cells start large: pan the grid to see more. Overview fits the whole grid; Reading size enlarges it again.',
      helpKeyboard: 'Keyboard: arrows = move around the grid; Enter = switch word at a crossing; Space = next cell; Home / End = start / end of the word; Backspace = erase; Delete = erase the selected cell. Tab leaves the grid freely. You can also select a word from All the clues.',
      helpStorage: 'Progress saves automatically in this browser. It does not move between devices. Clearing browser data or closing a private window may remove saves. If saving is unavailable, we show a warning; you can still play.',
      gridInstructions: 'Use arrow keys to move. Enter switches word at a crossing. Space moves to the next cell. Tab leaves the grid.',
      grid: 'Crossword grid', row: 'row', column: 'column', empty: 'empty', wrong: 'incorrect', revealed: 'revealed',
      shadeNumber: 'phrase letter', backspace: 'Erase letter', keyLabel: 'Letter', dark: 'Night edition', light: 'Day edition',
      saved: '✓ Saved in this browser', cannotSave: 'Saving is unavailable. New letters will only last until you close this page.',
      corrupt: 'The old save could not be read for this puzzle. We opened a blank grid.',
      intro: 'Choose a clue or a white cell to begin.', composeHint: 'Space: next cell · Enter: switch direction',
      composing: 'Continue with', separate: 'For a separate letter, press Space.',
      letterGiven: 'One letter revealed. A small corner mark shows the help.', wordGiven: 'The selected word has been revealed.',
      cleared: 'A clean grid, a fresh start.', noErrors: 'The letters entered are correct.', allCorrect: 'Every letter is correct!',
      wrongCount: 'Incorrect cells', emptyCount: 'Empty cells', filled: 'filled', hintsUsed: 'Cells marked as revealed',
      noHints: 'Every cell is filled without a reveal mark.', confirmed: 'The whole grid is correct.'
    }
  };
  let storage;
  try { storage = window.localStorage; } catch { storage = null; }
  const prefRead = C.readStorage(storage, PREFS);
  const raw = prefRead.value;
  const prefs = { language: raw?.language === 'en' ? 'en' : 'hu',
    theme: ['light', 'dark'].includes(raw?.theme) ? raw.theme : 'system',
    last: { hu: typeof raw?.last?.hu === 'string' ? raw.last.hu : 'hu-01', en: typeof raw?.last?.en === 'string' ? raw.last.en : 'en-01' } };
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let game, currentLanguage = prefs.language, nodes = [], phraseNodes = [], clueNodes = [], listNodes = [];
  let keysVisible = true, saveOK = prefRead.ok, completedBefore = false;
  const smallScreen = window.matchMedia('(max-width: 1100px)');
  if (smallScreen.matches) $('grid-scroll').classList.add('zoomed');
  const t = key => strings[currentLanguage][key];
  const text = (node, value) => { if (node.textContent !== value) node.textContent = value; };
  function notice(message, error = false) { text($('feedback'), message); $('feedback').classList.toggle('error', error); }
  function saveStatus() {
    text($('save-status'), t(saveOK ? 'saved' : 'cannotSave'));
    $('save-status').classList.toggle('error', !saveOK);
  }
  function save() { saveOK = C.writeStorage(storage, C.keyFor(game.puzzle), game.serialise()); saveStatus(); }
  function savePrefs() { if (!C.writeStorage(storage, PREFS, prefs)) saveOK = false; saveStatus(); }
  function applyTheme() {
    const dark = prefs.theme === 'dark' || prefs.theme === 'system' && systemTheme.matches;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    $('theme').setAttribute('aria-label', t(dark ? 'light' : 'dark'));
    $('theme').title = t(dark ? 'light' : 'dark');
    text($('edition-label'), t(dark ? 'nightEdition' : 'dayEdition'));
  }
  function labels() {
    document.documentElement.lang = currentLanguage === 'hu' ? 'hu' : 'en-GB';
    document.title = t('title') + ' | Game Vault';
    document.querySelector('meta[name="description"]').content = t('subtitle');
    document.querySelectorAll('[data-text]').forEach(node => text(node, t(node.dataset.text)));
    $('lang-hu').setAttribute('aria-pressed', String(currentLanguage === 'hu'));
    $('lang-en').setAttribute('aria-pressed', String(currentLanguage === 'en'));
    for (const [id, key] of [['puzzle-nav', 'puzzleNav'], ['previous-puzzle', 'previousPuzzle'], ['next-puzzle', 'nextPuzzle'],
      ['board-panel', 'puzzle'], ['grid', 'grid'], ['keyboard-panel', 'keyboardLabel'], ['switch-direction', 'switchDirection']]) $(id).setAttribute('aria-label', t(key));
    $('switch-direction').title = t('switchDirection');
    $('multigraphs').hidden = currentLanguage !== 'hu';
    text($('keyboard-toggle'), t(keysVisible ? 'hideKeys' : 'showKeys'));
    text($('zoom'), t($('grid-scroll').classList.contains('zoomed') ? 'zoomOff' : 'zoom'));
    $('zoom').setAttribute('aria-pressed', String($('grid-scroll').classList.contains('zoomed')));
    applyTheme();
  }
  function loadPuzzle(id, language = currentLanguage) {
    if (game) save();
    currentLanguage = language;
    prefs.language = language;
    const group = puzzles.filter(p => p.lang === language);
    const puzzle = group.find(p => p.id === id) || group[0];
    prefs.last[language] = puzzle.id;
    const saved = C.readStorage(storage, C.keyFor(puzzle));
    game = new C.Game(puzzle, saved.value);
    completedBefore = game.complete;
    labels();
    $('puzzle').replaceChildren(...group.map((p, i) => {
      const option = document.createElement('option'); option.value = p.id;
      option.textContent = String(i + 1).padStart(2, '0') + ' · ' + p.title;
      option.selected = p.id === puzzle.id; return option;
    }));
    text($('edition-number'), puzzle.id.slice(-2));
    text($('difficulty'), t(puzzle.difficulty));
    text($('phrase-hint'), puzzle.hint);
    buildGrid(); buildPhrase(); buildKeyboard(); buildClueList();
    render(); keepCellInView();
    notice(!saved.ok && saved.reason === 'corrupt' || game.restoreStatus === 'invalid' ? t('corrupt') : t('intro'));
    save(); savePrefs();
  }
  function cellLabel(i) {
    const p = game.puzzle, c = p.cells[i];
    const parts = [t('row') + ' ' + (Math.floor(i / p.width) + 1), t('column') + ' ' + (i % p.width + 1), game.values[i] || t('empty')];
    if (c.number) parts.push(t('shadeNumber') + ' ' + c.number);
    if (game.errors.has(i)) parts.push(t('wrong'));
    if (game.revealed.has(i)) parts.push(t('revealed'));
    game.members[i].forEach(id => { const e = game.words.get(id); parts.push(t(e.dir) + ': ' + e.clue); });
    return parts.join('. ');
  }
  function buildGrid() {
    const p = game.puzzle;
    nodes = []; clueNodes = [];
    $('grid').replaceChildren();
    $('grid').style.setProperty('--columns', p.width);
    $('grid').setAttribute('aria-rowcount', p.height);
    $('grid').setAttribute('aria-colcount', p.width);
    for (let r = 0; r < p.height; r++) {
      const row = document.createElement('div'); row.className = 'grid-row'; row.setAttribute('role', 'row'); row.setAttribute('aria-rowindex', r + 1);
      for (let col = 0; col < p.width; col++) {
        const i = r * p.width + col, cell = p.cells[i];
        const wrapper = document.createElement('div'); wrapper.className = 'grid-cell ' + cell.type;
        wrapper.setAttribute('role', 'gridcell'); wrapper.setAttribute('aria-colindex', col + 1);
        if (cell.type === 'letter') {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'letter'; b.dataset.cell = i; b.tabIndex = -1;
          const value = document.createElement('span'); value.className = 'cell-value'; value.setAttribute('aria-hidden', 'true'); b.append(value);
          value.style.setProperty('--tilt', ((i * 17 % 5) - 2) * 0.35 + 'deg');
          value.style.setProperty('--nudge', ((i * 11 % 3) - 1) * 0.35 + 'px');
          if (cell.number) { const number = document.createElement('span'); number.className = 'cell-number'; number.textContent = cell.number; number.setAttribute('aria-hidden', 'true'); b.append(number); }
          const mark = document.createElement('span'); mark.className = 'cell-mark'; mark.setAttribute('aria-hidden', 'true'); b.append(mark);
          nodes[i] = { button: b, value, wrapper, mark }; wrapper.append(b);
        } else if (cell.type === 'clue') {
          const box = document.createElement('div'); box.className = 'clue-cell' + (cell.entries.length > 1 ? ' split' : '');
          const ordered = cell.entries.slice().sort((a, b) => Number(game.words.get(a).dir === 'down') - Number(game.words.get(b).dir === 'down'));
          for (const id of ordered) {
            const e = game.words.get(id), b = document.createElement('button');
            b.type = 'button'; b.className = 'clue'; b.dataset.entry = id; b.dataset.direction = e.dir; b.tabIndex = -1;
            const label = t(e.dir) + ': ' + e.clue + ' (' + e.path.length + ' ' + t('cells') + ')';
            b.setAttribute('aria-label', label); b.title = label;
            const short = document.createElement('span'); short.className = 'clue-text'; short.textContent = e.short; short.setAttribute('aria-hidden', 'true');
            const arrow = document.createElement('span'); arrow.className = 'clue-arrow'; arrow.textContent = e.dir === 'across' ? '→' : '↓'; arrow.setAttribute('aria-hidden', 'true');
            b.append(short, arrow); box.append(b); clueNodes.push(b);
          }
          wrapper.append(box);
        } else wrapper.setAttribute('aria-label', currentLanguage === 'hu' ? 'Zárt mező' : 'Blocked cell');
        row.append(wrapper);
      }
      $('grid').append(row);
    }
  }
  function buildPhrase() {
    const p = game.puzzle; let at = 0;
    phraseNodes = []; $('phrase').replaceChildren();
    for (const length of p.phraseLengths) {
      const word = document.createElement('div'); word.className = 'phrase-word';
      for (let j = 0; j < length; j++, at++) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'phrase-cell'; b.dataset.phrase = p.extraction[at];
        const number = document.createElement('span'); number.className = 'cell-number'; number.textContent = at + 1; number.setAttribute('aria-hidden', 'true');
        const value = document.createElement('span'); value.className = 'cell-value'; value.setAttribute('aria-hidden', 'true');
        b.append(number, value); word.append(b); phraseNodes.push({ button: b, value, cell: p.extraction[at], number: at + 1 });
      }
      $('phrase').append(word);
    }
  }
  function key(value) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'key'; b.dataset.key = value;
    b.textContent = value; b.setAttribute('aria-label', t('keyLabel') + ' ' + value); return b;
  }
  function buildKeyboard() {
    $('keyboard').replaceChildren(); $('multigraph-keys').replaceChildren();
    const rows = currentLanguage === 'hu' ? ['QWERTZUIOP', 'ASDFGHJKL', 'YXCVBNM', 'ÁÉÍÓÖŐÚÜŰ'] : ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
    rows.forEach((letters, i) => {
      const row = document.createElement('div'); row.className = 'key-row';
      for (const letter of letters) row.append(key(letter));
      if (i === 2) {
        const b = key('⌫'); b.dataset.action = 'backspace'; delete b.dataset.key; b.classList.add('backspace'); b.setAttribute('aria-label', t('backspace')); row.append(b);
      }
      $('keyboard').append(row);
    });
    C.MULTI.slice().sort((a, b) => a.localeCompare(b, 'hu')).forEach(token => $('multigraph-keys').append(key(token)));
  }
  function buildClueList() {
    listNodes = []; $('clue-list').replaceChildren();
    for (const e of game.puzzle.entries) {
      const li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button'; b.dataset.entry = e.id;
      b.textContent = (e.dir === 'across' ? '→ ' : '↓ ') + e.clue + ' (' + e.path.length + ')';
      b.setAttribute('aria-label', t(e.dir) + ': ' + e.clue + '. ' + e.path.length + ' ' + t('cells'));
      listNodes.push(b); li.append(b); $('clue-list').append(li);
    }
  }
  function render() {
    const p = game.puzzle, e = game.entry, inWord = new Set(e.path);
    p.cells.forEach((c, i) => {
      if (c.type !== 'letter') return;
      const n = nodes[i], value = game.values[i];
      text(n.value, value); text(n.mark, game.errors.has(i) ? '!' : '');
      n.button.className = ['letter', c.number ? 'shaded' : '', inWord.has(i) ? 'in-word' : '',
        i === game.cell ? 'selected' : '', value.length > 1 ? 'multi' : '', game.errors.has(i) ? 'wrong' : '',
        game.revealed.has(i) ? 'revealed' : ''].filter(Boolean).join(' ');
      n.button.tabIndex = i === game.cell ? 0 : -1;
      n.button.setAttribute('aria-label', cellLabel(i));
      n.wrapper.setAttribute('aria-selected', String(i === game.cell));
    });
    clueNodes.forEach(b => { const active = b.dataset.entry === game.entryId; b.classList.toggle('chosen', active); b.setAttribute('aria-pressed', String(active)); });
    listNodes.forEach(b => b.setAttribute('aria-current', String(b.dataset.entry === game.entryId)));
    text($('clue-direction'), e.dir === 'across' ? '→' : '↓');
    text($('clue-meta'), t(e.dir) + ' · ' + e.path.length + ' ' + t('cells'));
    text($('clue-text'), e.clue);
    $('switch-direction').disabled = game.members[game.cell].length < 2;
    const letters = p.cells.filter(c => c.type === 'letter').length;
    text($('progress'), game.filled + ' / ' + letters + ' ' + t('filled'));
    const possible = game.pending ? C.MULTI.filter(token => token.startsWith(game.pending) && token !== game.pending) : [];
    text($('compose'), possible.length ? game.pending + ' · ' + t('composing') + ': ' + possible.join(', ') + '. ' + t('separate') : t('composeHint'));
    phraseNodes.forEach(n => {
      const value = game.values[n.cell]; text(n.value, value);
      n.button.classList.toggle('multi', value.length > 1);
      n.button.classList.toggle('revealed', game.revealed.has(n.cell));
      n.button.setAttribute('aria-label', t('shadeNumber') + ' ' + n.number + ': ' + (value || t('empty')));
    });
    const complete = game.complete;
    $('solved').hidden = !complete;
    if (complete) {
      text($('solved-phrase'), p.phrase);
      text($('solved-detail'), t('confirmed') + ' ' + (game.revealed.size ? t('hintsUsed') + ': ' + game.revealed.size + '.' : t('noHints')));
      if (!completedBefore) notice(t('allCorrect'));
    }
    completedBefore = complete;
  }
  function keepCellInView() {
    const box = nodes[game.cell].button.getBoundingClientRect(), scroll = $('grid-scroll'), bounds = scroll.getBoundingClientRect();
    if (box.left < bounds.left) scroll.scrollLeft -= bounds.left - box.left + 4;
    else if (box.right > bounds.right) scroll.scrollLeft += box.right - bounds.right + 4;
    if (box.top < bounds.top) scroll.scrollTop -= bounds.top - box.top + 4;
    else if (box.bottom > bounds.bottom) scroll.scrollTop += box.bottom - bounds.bottom + 4;
  }
  function focusCell() {
    nodes[game.cell].button.focus({ preventScroll: true });
    keepCellInView();
  }
  function act(fn, message = '') { fn(); notice(message); render(); save(); focusCell(); }
  function chooseEntry(id) { act(() => game.select(id)); }
  function changePuzzle(step) {
    const group = puzzles.filter(p => p.lang === currentLanguage), index = group.findIndex(p => p.id === game.puzzle.id);
    loadPuzzle(group[(index + step + group.length) % group.length].id);
  }
  $('grid').addEventListener('click', event => {
    const b = event.target.closest('button'); if (!b) return;
    if (b.dataset.entry) chooseEntry(b.dataset.entry);
    else if (b.dataset.cell !== undefined) act(() => game.selectCell(Number(b.dataset.cell), undefined, true));
  });
  $('clue-list').addEventListener('click', event => { const b = event.target.closest('[data-entry]'); if (b) chooseEntry(b.dataset.entry); });
  $('phrase').addEventListener('click', event => { const b = event.target.closest('[data-phrase]'); if (b) act(() => game.selectCell(Number(b.dataset.phrase))); });
  $('keyboard-panel').addEventListener('click', event => {
    const b = event.target.closest('button'); if (!b) return;
    if (b.dataset.key) act(() => game.type(b.dataset.key, b.dataset.key.length > 1));
    else if (b.dataset.action === 'backspace') act(() => game.backspace());
  });
  function spatialMove(dr, dc) {
    const p = game.puzzle, r = Math.floor(game.cell / p.width), c = game.cell % p.width;
    game.pending = null;
    for (let nr = r + dr, nc = c + dc; nr >= 0 && nr < p.height && nc >= 0 && nc < p.width; nr += dr, nc += dc) {
      const i = nr * p.width + nc;
      if (p.cells[i].type === 'letter') { game.selectCell(i, dr ? 'down' : 'across'); break; }
    }
  }
  $('grid').addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    let action;
    if (event.key === 'ArrowRight') action = () => spatialMove(0, 1);
    else if (event.key === 'ArrowLeft') action = () => spatialMove(0, -1);
    else if (event.key === 'ArrowDown') action = () => spatialMove(1, 0);
    else if (event.key === 'ArrowUp') action = () => spatialMove(-1, 0);
    else if (event.key === 'Enter') action = () => game.selectCell(game.cell, undefined, true);
    else if (event.key === ' ') action = () => game.move(1);
    else if (event.key === 'Backspace') action = () => game.backspace();
    else if (event.key === 'Delete') action = () => game.erase();
    else if (event.key === 'Home') action = () => game.select(game.entryId, game.entry.path[0]);
    else if (event.key === 'End') action = () => game.select(game.entryId, game.entry.path.at(-1));
    else if (Array.from(event.key).length === 1 && C.SINGLE.includes(C.normalise(event.key))) action = () => game.type(event.key);
    if (action) { event.preventDefault(); act(action); }
  });
  $('check').addEventListener('click', () => {
    const result = game.check();
    notice(result.complete ? t('allCorrect') : result.wrong
      ? t('wrongCount') + ': ' + result.wrong + '. ' + t('emptyCount') + ': ' + result.empty + '.'
      : t('noErrors') + ' ' + t('emptyCount') + ': ' + result.empty + '.', result.wrong > 0);
    render(); save(); focusCell();
  });
  $('reveal-letter').addEventListener('click', () => act(() => game.reveal(), t('letterGiven')));
  $('reveal-word').addEventListener('click', () => act(() => game.reveal('word'), t('wordGiven')));
  $('switch-direction').addEventListener('click', () => act(() => game.selectCell(game.cell, undefined, true)));
  $('advance').addEventListener('click', () => act(() => game.move(1)));
  $('previous-word').addEventListener('click', () => act(() => game.nextWord(-1)));
  $('next-word').addEventListener('click', () => act(() => game.nextWord(1)));
  $('puzzle').addEventListener('change', event => loadPuzzle(event.target.value));
  $('previous-puzzle').addEventListener('click', () => changePuzzle(-1));
  $('next-puzzle').addEventListener('click', () => changePuzzle(1));
  $('another').addEventListener('click', () => { changePuzzle(1); $('puzzle').focus(); });
  $('lang-hu').addEventListener('click', () => loadPuzzle(prefs.last.hu, 'hu'));
  $('lang-en').addEventListener('click', () => loadPuzzle(prefs.last.en, 'en'));
  $('theme').addEventListener('click', () => { prefs.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; applyTheme(); savePrefs(); });
  systemTheme.addEventListener('change', () => { if (prefs.theme === 'system') applyTheme(); });
  $('help-open').addEventListener('click', () => $('help').showModal());
  $('help-close').addEventListener('click', () => $('help').close());
  $('clear-open').addEventListener('click', () => $('clear-dialog').showModal());
  $('clear-cancel').addEventListener('click', () => $('clear-dialog').close());
  $('clear-confirm').addEventListener('click', () => { $('clear-dialog').close(); act(() => game.clear(), t('cleared')); });
  $('zoom').addEventListener('click', () => {
    const zoomed = $('grid-scroll').classList.toggle('zoomed'); $('zoom').setAttribute('aria-pressed', String(zoomed)); text($('zoom'), t(zoomed ? 'zoomOff' : 'zoom'));
    keepCellInView();
  });
  $('keyboard-toggle').addEventListener('click', () => {
    keysVisible = !keysVisible; $('keyboard-keys').hidden = !keysVisible;
    $('keyboard-toggle').setAttribute('aria-expanded', String(keysVisible)); text($('keyboard-toggle'), t(keysVisible ? 'hideKeys' : 'showKeys'));
  });
  document.querySelector('.skip').addEventListener('click', event => { event.preventDefault(); focusCell(); $('grid-scroll').scrollIntoView({ block: 'center' }); });
  loadPuzzle(prefs.last[currentLanguage]);
})();

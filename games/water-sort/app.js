(function () {
  'use strict';
  const C = window.WaterSort, levels = window.WaterSortLevels;
  const $ = id => document.getElementById(id);
  const STORAGE = 'game-vault-water-sort-v1';
  const theme = window.WaterSortTheme;
  const canVibrate = typeof navigator.vibrate === 'function';
  const PULSE = {pour: 15, refused: 30, win: 45};
  const PULSE_GAP = 400;
  const MUSIC = {src: 'music/egy-falka-leszunk.mp3', title: 'Egy falka leszünk'};
  const colours = [
    {name:'sea blue', hex:'#7ebbd4', symbol:'●'},
    {name:'coral', hex:'#e79788', symbol:'▲'},
    {name:'gold', hex:'#e7c878', symbol:'◆'},
    {name:'lavender', hex:'#b2a2d5', symbol:'■'},
    {name:'mint', hex:'#8cc3a2', symbol:'✚'},
    {name:'rose', hex:'#dba2be', symbol:'✦'},
    {name:'apricot', hex:'#e7ad71', symbol:'≋'},
    {name:'turquoise', hex:'#79c9c5', symbol:'○'}
  ];
  let session = C.newSession(levels[0], 0), finished = new Set();
  let symbols = false, sound = false, selected = null, hinted = null;
  let busy = false, hintPending = false, revision = 0, audio = null;
  let saveAvailable = true, bootMessage = '';
  let vibration = true, themeFallback = 'system', pulseTimer = 0, lastPulse = -Infinity, celebrationTimer = 0;
  let storedText = null;
  const player = $('music-player');
  let musicWanted = false, musicPlaying = false, musicAttempt = 0, musicUnavailable = false;
  try { storedText = localStorage.getItem(STORAGE); }
  catch (error) {
    saveAvailable = false;
    bootMessage = 'A fresh puzzle is ready. Saving is unavailable in this browser.';
  }
  if (storedText) {
    let raw = null;
    try { if (storedText.length < 600000) raw = JSON.parse(storedText); }
    catch (error) { /* An unreadable save does not make storage unavailable. */ }
    const progress = C.restoreProgress(raw, levels);
    const saved = C.restore(raw, levels);
    const settings = C.restoreSettings(raw);
    vibration = settings.vibration; themeFallback = settings.theme;
    if (progress) {
      finished = new Set(progress.finished); symbols = progress.symbols; sound = progress.sound;
    }
    if (saved) {
      session = saved.session;
      bootMessage = 'Welcome back. Your colours are right where you left them.';
    } else if (progress && raw.session === null) {
      bootMessage = 'Your completed levels and preferences were restored. The previous puzzle reached the resume limit, so a fresh puzzle is ready.';
    } else bootMessage = 'The saved puzzle could not be read. A fresh puzzle is ready.';
  }

  function save() {
    const resumeLimited = session.history.length >= 5000;
    try {
      localStorage.setItem(STORAGE, JSON.stringify({version:1, session:resumeLimited ? null : session, finished:[...finished], symbols, sound,
        vibration, theme: theme ? theme.choice() : themeFallback}));
      saveAvailable = true;
    } catch (error) { saveAvailable = false; }
    $('save-status').textContent = !saveAvailable ? 'Saving unavailable. You can still play.'
      : resumeLimited ? 'Completed levels and preferences saved. This long puzzle cannot resume after reload.'
      : 'Progress saved in this browser.';
  }

  function say(message) { $('status').textContent = message; }

  function cancelHint() {
    revision++; hinted = null; hintPending = false;
  }

  // One short pulse per game event, sent after the move has been handled. Pour and refused pulses closer than
  // PULSE_GAP to the previous pulse are dropped; the win pulse waits for the gap instead, rounded up a millisecond.
  function pulse(kind) {
    if (!canVibrate || !vibration) return;
    if (pulseTimer) { if (kind !== 'win') return; clearTimeout(pulseTimer); }
    const wait = kind === 'win' ? Math.max(0, Math.ceil(lastPulse + PULSE_GAP - performance.now()) + 1) : 0;
    pulseTimer = window.setTimeout(() => {
      pulseTimer = 0;
      const now = performance.now();
      if (!vibration || document.hidden || (kind !== 'win' && now - lastPulse < PULSE_GAP)) return;
      lastPulse = now;
      try { navigator.vibrate(PULSE[kind]); } catch (error) { /* Vibration is optional. */ }
    }, wait);
  }

  function stopPulses() {
    clearTimeout(pulseTimer); pulseTimer = 0;
    if (canVibrate && performance.now() - lastPulse < 100) {
      try { navigator.vibrate(0); } catch (error) { /* Vibration is optional. */ }
    }
  }

  // Droplets in the solved colours rise from the finished tubes once, then are removed; none with reduced motion.
  function celebrate() {
    stopCelebration();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layer = $('celebration'), frame = layer.getBoundingClientRect();
    const tubes = [...$('board').children].filter(button => C.complete(session.board[Number(button.dataset.tube)]));
    const each = Math.max(2, Math.min(4, Math.floor(18 / Math.max(1, tubes.length))));
    const drops = [];
    tubes.forEach((button, t) => {
      const glass = button.querySelector('.glass').getBoundingClientRect();
      const colour = colours[session.board[Number(button.dataset.tube)][0]].hex;
      for (let k = 0; k < each; k++) {
        const drop = document.createElement('span'), n = t * each + k;
        drop.className = 'droplet';
        drop.style.left = (glass.left - frame.left + glass.width * (k + 1) / (each + 1)) + 'px';
        drop.style.top = (glass.top - frame.top + 6) + 'px';
        drop.style.setProperty('--colour', colour);
        drop.style.setProperty('--drift', ((n * 37) % 41 - 20) + 'px');
        drop.style.animationDelay = ((n * 53) % 350) + 'ms';
        drops.push(drop);
      }
    });
    layer.append(...drops);
    $('win').classList.add('celebrate');
    celebrationTimer = window.setTimeout(stopCelebration, 1900);
  }

  function stopCelebration() {
    clearTimeout(celebrationTimer); celebrationTimer = 0;
    $('celebration').replaceChildren();
    $('win').classList.remove('celebrate');
  }

  function tone(victory = false) {
    if (!sound) return;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) throw new Error('Audio unavailable');
      if (!audio) audio = new Context();
      if (audio.state === 'suspended') audio.resume().catch(() => {});
      const notes = victory ? [523.25,659.25,783.99] : [420,610];
      notes.forEach((frequency, i) => {
        const osc = audio.createOscillator(), gain = audio.createGain();
        const start = audio.currentTime + i * (victory ? .12 : .065);
        osc.type = 'sine'; osc.frequency.setValueAtTime(frequency, start);
        osc.frequency.exponentialRampToValueAtTime(frequency * .72, start + .19);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(.04, start + .015);
        gain.gain.exponentialRampToValueAtTime(.001, start + .23);
        osc.connect(gain); gain.connect(audio.destination);
        osc.onended = () => { osc.disconnect(); gain.disconnect(); };
        osc.start(start); osc.stop(start + .25);
      });
    } catch (error) {
      sound = false; save(); renderPreferences(); say('Sound is unavailable. The puzzle is ready to play.');
    }
  }

  // The song plays on repeat from the Music button, separate from the Sound tones. Its source is set on the first
  // press, so nothing is downloaded before it; the choice lasts for this visit only, as in the crossword's music.
  function renderMusic() {
    $('music').setAttribute('aria-pressed', String(musicWanted));
    $('music').innerHTML = '<span aria-hidden="true">♪</span> Music ' + (musicWanted ? 'on' : 'off');
    $('music').title = musicWanted ? 'Stop the music' : 'Play ' + MUSIC.title + ' on repeat';
    const line = $('music-title');
    const html = musicUnavailable ? 'Music is unavailable. Press the music button to try again.'
      : musicPlaying ? '<span aria-hidden="true">♪</span> <span lang="hu">' + MUSIC.title + '</span>' : '';
    if (line.innerHTML !== html) line.innerHTML = html;
    line.hidden = !html;
  }

  function stopMusic(unavailable = false) {
    musicAttempt++; musicWanted = false; musicPlaying = false; musicUnavailable = unavailable;
    player.pause(); renderMusic();
  }

  function playMusic() {
    const attempt = ++musicAttempt;
    musicPlaying = false; renderMusic();
    if (player.error || player.getAttribute('src') !== MUSIC.src) player.src = MUSIC.src;
    const failed = () => { if (musicWanted && attempt === musicAttempt) stopMusic(true); };
    try { const pending = player.play(); if (pending) pending.catch(failed); } catch (error) { failed(); }
  }

  function toggleMusic() {
    if (musicWanted) { stopMusic(); return; }
    musicWanted = true; musicUnavailable = false; playMusic();
  }

  function renderPreferences() {
    document.body.classList.toggle('show-symbols', symbols);
    $('symbols').setAttribute('aria-pressed', String(symbols));
    $('sound').setAttribute('aria-pressed', String(sound));
    $('sound').innerHTML = '<span aria-hidden="true">♫</span> Sound ' + (sound ? 'on' : 'off');
    $('vibration').hidden = !canVibrate;
    $('vibration').setAttribute('aria-pressed', String(vibration));
    $('vibration').innerHTML = '<span aria-hidden="true">∿</span> Vibration ' + (vibration ? 'on' : 'off');
    $('theme').hidden = !theme;
    if (theme) {
      const target = theme.current() === 'day' ? 'night' : 'day';
      $('theme').innerHTML = target === 'day' ? '<span aria-hidden="true">☀</span> Day' : '<span aria-hidden="true">☾</span> Night';
      $('theme').setAttribute('aria-label', 'Switch to ' + target + ' theme');
      $('theme').title = 'Switch to ' + target + ' theme';
    }
  }

  function fillWater(water, tube) {
    water.replaceChildren();
    for (const colour of tube) {
      const layer = document.createElement('span');
      layer.className = 'liquid'; layer.style.setProperty('--colour', colours[colour].hex);
      const symbol = document.createElement('span');
      symbol.className = 'symbol'; symbol.textContent = colours[colour].symbol;
      layer.append(symbol); water.append(layer);
    }
  }

  function render() {
    const won = C.won(session.board);
    $('level-title').textContent = 'Level ' + String(session.level + 1).padStart(2, '0');
    $('chapter').textContent = session.level < 8 ? 'FIRST DROPS' : session.level < 22 ? 'FIND YOUR FLOW' : session.level < 36 ? 'DEEPER WATERS' : 'A SEA OF COLOUR';
    $('moves').textContent = session.moves;
    $('sorted').textContent = session.board.filter(C.complete).length;
    $('total').textContent = ' / ' + levels[session.level].colours;
    const board = $('board');
    board.classList.toggle('many', session.board.length > 5);
    while (board.children.length > session.board.length) board.lastElementChild.remove();
    session.board.forEach((tube, i) => {
      let button = board.children[i];
      if (!button) {
        button = document.createElement('button'); button.type = 'button';
        button.className = 'tube'; button.dataset.tube = i;
        button.innerHTML = '<span class="glass" aria-hidden="true"><span class="water"></span></span><span class="tube-number" aria-hidden="true"></span>';
        button.addEventListener('click', () => selectTube(i));
        board.append(button);
      }
      button.disabled = busy;
      button.classList.toggle('selected', selected === i);
      button.classList.toggle('complete', C.complete(tube));
      button.classList.toggle('empty', tube.length === 0);
      button.classList.toggle('hint-from', hinted?.[0] === i);
      button.classList.toggle('hint-to', hinted?.[1] === i);
      button.setAttribute('aria-pressed', String(selected === i));
      button.setAttribute('aria-label', 'Tube ' + (i + 1) + ': ' + (tube.length
        ? tube.slice().reverse().map(c => colours[c].name).join(', ') + ', top to bottom. ' + (C.complete(tube) ? 'Sorted.' : (4 - tube.length) + ' spaces.')
        : 'empty. 4 spaces.'));
      fillWater(button.querySelector('.water'), tube);
      button.querySelector('.tube-number').textContent = String(i + 1).padStart(2, '0');
    });
    $('undo').disabled = busy || !session.history.length;
    $('hint').disabled = busy || won || hintPending;
    $('hint').querySelector('span:not(.action-icon)').textContent = hintPending ? 'Thinking…' : 'Hint';
    $('extra').disabled = busy || won || Boolean(session.extra);
    $('extra').querySelector('span:not(.action-icon)').textContent = session.extra ? 'Tube added' : 'Spare tube';
    $('restart-open').disabled = busy;
    $('levels-open').disabled = busy;
    $('next').disabled = busy;
    $('win').hidden = !won || busy;
    if (won) {
      $('win-title').textContent = session.level === levels.length - 1 ? 'A lovely place to finish.' : 'Beautifully sorted.';
      $('win-detail').textContent = session.moves + ' pours, and everything in its place.';
      $('next').innerHTML = session.level === levels.length - 1 ? 'Explore the levels <span aria-hidden="true">▦</span>' : 'Next level <span aria-hidden="true">→</span>';
    }
    renderPreferences();
  }

  async function animatePour(from, to, colour, oldBoard) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !Element.prototype.animate) return;
    const source = $('board').children[from].querySelector('.glass');
    const target = $('board').children[to].querySelector('.glass');
    const a = source.getBoundingClientRect(), b = target.getBoundingClientRect();
    const ghost = source.cloneNode(true); ghost.classList.add('pour-ghost');
    Object.assign(ghost.style, {left:a.left+'px',top:a.top+'px',width:a.width+'px',height:a.height+'px',opacity:'1'});
    const waterHeight = source.querySelector('.water').getBoundingClientRect().height;
    ghost.querySelector('.water').style.height = waterHeight + 'px';
    const angle = b.left >= a.left ? 68 : -68;
    const radians = angle * Math.PI / 180;
    const x = b.left + b.width / 2 - a.width / 2 - Math.sin(radians) * a.height * .3;
    const y = b.top - 22 - a.height * .3 * (1 - Math.cos(radians));
    const translate = 'translate(' + (x-a.left) + 'px,' + (y-a.top) + 'px) rotate(' + angle + 'deg)';
    const stream = document.createElement('span'); stream.className = 'pour-stream';
    Object.assign(stream.style, {left:(b.left+b.width/2-2)+'px',top:(b.top-22)+'px',height:(b.height+14-oldBoard[to].length*waterHeight/4)+'px',background:colours[colour].hex});
    $('pour-layer').append(ghost,stream); source.style.opacity = '.16';
    const movement = ghost.animate([{transform:'none',offset:0},{transform:translate,offset:.28},{transform:translate,offset:.7},{transform:'none',offset:1}],{duration:700,easing:'ease-in-out'});
    const flow = stream.animate([{opacity:0,offset:0},{opacity:0,offset:.28},{opacity:.85,offset:.34},{opacity:.85,offset:.64},{opacity:0,offset:.72},{opacity:0,offset:1}],{duration:700});
    const mid = window.setTimeout(() => {
      fillWater(ghost.querySelector('.water'), session.board[from]);
      render();
    },390);
    try { await Promise.all([movement.finished,flow.finished]); }
    catch (error) { /* Cancellation leaves the committed board intact. */ }
    finally { clearTimeout(mid); ghost.remove();stream.remove();source.style.opacity=''; }
  }

  async function selectTube(index) {
    if (busy) return;
    if (C.won(session.board)) { say('All sorted. Choose the next level when you’re ready.'); return; }
    const tube = session.board[index];
    if (selected === null) {
      if (!tube.length) { say('Choose a tube with some colour in it first.'); return; }
      cancelHint(); selected = index; render();
      say('Tube ' + (index+1) + ' selected. Choose matching ' + colours[tube.at(-1)].name + ' or an empty tube.'); return;
    }
    if (selected === index) { selected = null; cancelHint(); render();say('Selection cleared.');return; }
    const from = selected, oldBoard = session.board, count = C.amount(oldBoard, from, index);
    const next = C.step(session, from, index);
    if (!next) {
      const button = $('board').children[index];button.classList.remove('invalid');void button.offsetWidth;button.classList.add('invalid');
      say(tube.length === 4 ? 'That tube is full. Choose a tube with some space.' : 'The top colours need to match. An empty tube works too.');
      pulse('refused');return;
    }
    const colour = oldBoard[from].at(-1);
    const returnFocus = document.activeElement === $('board').children[index];
    cancelHint(); selected = null; session = next; busy = true;
    if (C.won(session.board)) finished.add(session.level);
    save(); tone(C.won(session.board));
    $('board').querySelectorAll('button').forEach(b => { b.disabled = true; });
    ['undo','hint','extra','restart-open','levels-open'].forEach(id => { $(id).disabled=true; });
    if (!C.won(session.board)) pulse('pour');
    try { await animatePour(from,index,colour,oldBoard); }
    finally {
      busy = false; render();
      if (returnFocus && (document.activeElement === document.body || document.activeElement === $('board').children[index])) {
        (C.won(session.board) ? $('next') : $('board').children[index]).focus({preventScroll:true});
      }
      say(C.won(session.board) ? 'Level complete. Beautifully sorted!' : 'Poured ' + count + ' ' + (count===1?'layer':'layers') + ' of ' + colours[colour].name + '.');
      if (C.won(session.board)) { celebrate(); pulse('win'); }
    }
  }

  function startLevel(index) {
    stopCelebration(); cancelHint(); selected = null; session = C.newSession(levels[index],index);
    render();save();say('A fresh puzzle. Start with whichever colour catches your eye.');
    $('board').children[0].focus({preventScroll:true});
  }

  function openDialog(id) {
    if (busy) return;
    stopCelebration();cancelHint();render();
    if (id === 'levels-dialog') {
      const grid = $('level-grid');grid.replaceChildren();
      levels.forEach((level, i) => {
        const button = document.createElement('button');button.type='button';button.textContent=String(i+1).padStart(2,'0');
        button.className = (i===session.level?'current ':'') + (finished.has(i)?'finished':'');
        button.setAttribute('aria-label','Level '+(i+1)+', '+level.colours+' colours'+(finished.has(i)?', completed':''));
        if (i===session.level) button.setAttribute('aria-current','true');
        button.addEventListener('click',()=>{$('levels-dialog').close();startLevel(i);});grid.append(button);
      });
    }
    $(id).showModal();
  }

  async function hint() {
    if (busy || hintPending || C.won(session.board)) return;
    const returnFocus = document.activeElement === $('hint');
    cancelHint();selected=null;hintPending=true;
    const token=revision;render();say('Finding a way through the colours…');
    const focusTarget = returnFocus ? $('board').children[0] : null;
    if (focusTarget) focusTarget.focus({preventScroll:true});
    let path=null;
    let checkpoint=C.copy(levels[session.level].board);
    const known=levels[session.level].solution;
    for(let i=0;i<known.length;i++) {
      if(C.same(checkpoint,session.board)){path=known.slice(i);break;}
      checkpoint=C.pour(checkpoint,...known[i]);
    }
    let result;
    if (!path) {
      const iterator=C.search(session.board,40000);
      let step;
      do {
        await new Promise(resolve=>setTimeout(resolve,0));
        if (token!==revision) return;
        step=iterator.next();
      } while(!step.done);
      result=step.value;path=result.path;
    }
    if (token!==revision) return;
    hintPending=false;
    if(path?.length){
      hinted=path[0];selected=path[0][0];render();
      if (focusTarget && document.activeElement === focusTarget) $('board').children[path[0][0]].focus({preventScroll:true});
      say('Try tube '+(path[0][0]+1)+' → tube '+(path[0][1]+1)+'. Tap the highlighted destination to pour.');
    }else{
      render();
      say(result?.status==='unsolvable'
        ? (session.extra ? 'This arrangement has no solution. Undo a pour or restart.' : 'This arrangement has no solution. Undo a pour, restart, or use the free spare tube.')
        : (session.extra ? 'No hint found within this search. Try Undo or restart.' : 'No hint found within this search. Try Undo or the free spare tube.'));
    }
  }

  $('undo').addEventListener('click',()=>{
    if(busy)return;
    const previous=C.undo(session);if(!previous)return;
    const returnFocus = document.activeElement === $('undo');
    const panelHadFocus = Boolean(document.activeElement?.closest('.game-panel'));
    stopCelebration();cancelHint();selected=null;session=previous;render();save();say('One step back. Take another look.');
    const focusNow = document.activeElement;
    if (panelHadFocus && ((returnFocus && $('undo').disabled) || !focusNow || focusNow === document.body ||
        !focusNow.isConnected || !focusNow.getClientRects().length)) $('board').children[0].focus({preventScroll:true});
  });
  $('extra').addEventListener('click',()=>{
    if(busy)return;const next=C.addTube(session);if(!next)return;
    const returnFocus = document.activeElement === $('extra');
    cancelHint();selected=null;session=next;render();save();say('A little more breathing room. Your spare tube is ready.');
    if (returnFocus) $('board').lastElementChild.focus({preventScroll:true});
  });
  $('hint').addEventListener('click',hint);
  $('next').addEventListener('click',()=>{if(!busy){if(session.level===levels.length-1)openDialog('levels-dialog');else startLevel(session.level+1);}});
  $('help-open').addEventListener('click',()=>openDialog('help'));
  $('levels-open').addEventListener('click',()=>openDialog('levels-dialog'));
  $('restart-open').addEventListener('click',()=>openDialog('restart-dialog'));
  $('restart-confirm').addEventListener('click',()=>{$('restart-dialog').close();startLevel(session.level);});
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>$(button.dataset.close).close()));
  $('symbols').addEventListener('click',()=>{symbols=!symbols;renderPreferences();save();});
  $('sound').addEventListener('click',()=>{sound=!sound;renderPreferences();save();if(sound)tone();});
  $('music').addEventListener('click',toggleMusic);
  player.addEventListener('playing',()=>{if(!musicWanted){player.pause();return;}musicPlaying=true;renderMusic();});
  player.addEventListener('pause',()=>{musicPlaying=false;renderMusic();});
  player.addEventListener('ended',()=>{if(musicWanted)playMusic();});
  player.addEventListener('error',()=>{if(player.error&&musicWanted)stopMusic(true);});
  $('vibration').addEventListener('click',()=>{vibration=!vibration;if(!vibration)stopPulses();renderPreferences();save();});
  $('theme').addEventListener('click',()=>{if(!theme)return;theme.toggle();renderPreferences();save();});
  if(theme)theme.follow(renderPreferences);
  document.addEventListener('keydown',event=>{
    if(document.querySelector('dialog[open]')||event.altKey||event.ctrlKey||event.metaKey||event.repeat)return;
    if(event.target.isContentEditable || event.target.closest('input,textarea,select,[role="textbox"]'))return;
    const key=event.key.toLowerCase();
    if(key==='escape'){cancelHint();selected=null;render();say('Selection cleared.');}
    else if(['u','h','r'].includes(key) && event.target.closest('.game-panel')){
      event.preventDefault();$(key==='u'?'undo':key==='h'?'hint':'restart-open').click();
    } else if(event.target.dataset.tube!==undefined&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
      event.preventDefault();const delta=event.key==='ArrowLeft'||event.key==='ArrowUp'?-1:1;
      $('board').children[(Number(event.target.dataset.tube)+delta+session.board.length)%session.board.length].focus();
    }
  });
  window.addEventListener('pagehide',()=>{save();stopPulses();if(audio)audio.suspend().catch(()=>{});});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){save();stopPulses();if(audio)audio.suspend().catch(()=>{});}});
  if(C.won(session.board))finished.add(session.level);
  render();renderMusic();
  $('save-status').textContent=saveAvailable?'Progress stays in this browser.':'Saving unavailable. You can still play.';
  if(bootMessage)say(bootMessage);
})();

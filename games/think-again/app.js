(function () {
  'use strict';
  const D = window.ThinkAgainData, C = window.ThinkAgain, R = window.ThinkAgainRender;
  const $ = id => document.getElementById(id);
  let storage = null;
  try { storage = window.localStorage; } catch { /* Preferences are optional. */ }
  const prefs = C.readPrefs(storage);
  let lang = prefs.language, saveOK = prefs.ok, progressOK = true, index = 0, screen = 'title';
  const games = D.levels.map(C.initial), hintCounts = D.levels.map(() => 0), demos = D.levels.map(() => 0);
  try {
    const saved=JSON.parse(storage?.getItem('think-again:progress:v2')||'null');
    if(saved?.version===2 && saved.levels && typeof saved.levels==='object') {
      D.levels.forEach((l,i)=>{if(saved.levels[l.id]) games[i]=C.restore(l,saved.levels[l.id]);});
      const at=D.levels.findIndex(l=>l.id===saved.last);
      if(at>=0)index=at;
    }
  } catch { progressOK=false; }
  const t = key => D.ui[key][lang];
  const level = () => D.levels[index];
  const state = () => games[index];
  const music = new window.ThinkAgainMusic.Player($('music-player'), D.tracks, refreshMusic);
  $('music-player').volume = prefs.volume;
  $('volume').value = String(prefs.volume);
  let drag = null, suppressClick = false;
  let zoom=1;
  function persist() {
    try {
      storage.setItem('think-again:progress:v2',JSON.stringify({version:2,last:level().id,levels:Object.fromEntries(D.levels.map((l,i)=>[l.id,games[i]]))}));
      progressOK=true;
    } catch { progressOK=false; }
    $('storage-status').textContent=t(saveOK && progressOK?'saved':'storageMissing');
  }
  function save() {
    saveOK = C.writePrefs(storage, { language:lang, music:prefs.music, volume:Number($('volume').value) });
    $('storage-status').textContent = t(saveOK && progressOK ? 'saved' : 'storageMissing');
  }
  function refreshMusic() {
    $('music-label').textContent = t(music.wanted ? 'musicPause' : 'musicPlay');
    $('music-toggle').setAttribute('aria-pressed',String(music.wanted));
    $('music-title').textContent = music.wanted ? D.tracks[music.index].title : '';
    $('music-status').textContent = music.missing ? t('musicMissing') : !music.wanted && prefs.music ? t('remembered') : '';
  }
  function labels() {
    document.documentElement.lang = lang === 'en' ? 'en-GB' : 'hu';
    document.title = t('title') + ' | Game Vault';
    document.querySelector('meta[name="description"]').content = t('subtitle');
    document.querySelectorAll('[data-text]').forEach(n => { n.textContent = t(n.dataset.text); });
    for (const code of ['en','hu']) $('lang-'+code).setAttribute('aria-pressed',String(code === lang));
    $('fiction').textContent = D.fiction[lang];
    $('help-fiction').textContent = D.fiction[lang];
    $('level-nav').setAttribute('aria-label',t('levels'));
    $('object-controls').setAttribute('aria-label',t('controls'));
    for (const key of ['up','down','left','right']) $(key).setAttribute('aria-label',t(key));
    $('storage-status').textContent = t(saveOK && progressOK ? 'saved' : 'storageMissing');
    $('context-controls').setAttribute('aria-label',t('sceneActions'));
    refreshMusic();
  }
  function renderNav() {
    $('level-list').replaceChildren(...D.levels.map((l,i) => {
      const li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button'; b.dataset.level = String(i);
      b.setAttribute('aria-label',String(i+1)+'. '+l.title[lang]);
      if (i === index) b.setAttribute('aria-current','page');
      const number = document.createElement('span'); number.textContent = String(i+1).padStart(2,'0');
      const title = document.createElement('span'); title.className = 'nav-title'; title.textContent = l.title[lang];
      b.append(number,title); li.append(b); return li;
    }));
  }
  function render() {
    labels();
    document.body.dataset.screen=screen;
    $('title-screen').hidden = screen !== 'title';
    $('play-screen').hidden = screen !== 'play';
    $('end-screen').hidden = screen !== 'end';
    const l = level(), s = state(), complete = C.success(l,s);
    renderNav();
    $('page-number').textContent = t('chapter')+' '+l.chapter+' · '+String(index+1).padStart(2,'0')+' / '+String(D.levels.length).padStart(2,'0');
    $('level-number').textContent = String(index+1).padStart(2,'0');
    $('level-title').textContent = l.title[lang];
    $('objective').textContent = l.objective[lang];
    const focused = document.activeElement?.closest?.('[data-object]')?.dataset.object;
    const width=$('scene').getBoundingClientRect().width||800;
    $('scene').innerHTML = R.scene(l,s,lang,D.ui,{targetSize:Math.max(56,44*800/width)});
    if (focused) $('scene').querySelector('[data-object="'+focused+'"]')?.focus({preventScroll:true});
    $('selection').textContent = s.selected ? t('selected')+': '+s.objects[s.selected].label[lang] : t('nothing');
    $('feedback').textContent = complete ? l.payoff[lang] : typeof s.feedback==='object' ? s.feedback[lang] : t(s.feedback);
    const focusControl=document.activeElement?.dataset?.control;
    $('context-controls').replaceChildren(...(l.controls||[]).map(control=>{
      const b=document.createElement('button');b.type='button';b.dataset.control=control.id;b.textContent=control.label[lang];return b;
    }));
    if(focusControl)$('context-controls').querySelector('[data-control="'+focusControl+'"]')?.focus({preventScroll:true});
    $('context-controls').hidden=!(l.controls||[]).length;
    $('zoom-out').hidden=zoom===1;
    $('zoom-in').hidden=zoom!==1;
    const hints = hintCounts[index];
    $('hint-list').replaceChildren(...l.hints.slice(0,hints).map(h => {
      const li = document.createElement('li'); li.textContent = h[lang]; return li;
    }));
    $('hint').disabled = hints === l.hints.length;
    $('hint-status').textContent = hints === l.hints.length ? t('allHints') : '';
    $('solution').hidden = demos[index] === 0;
    $('solution-steps').replaceChildren(...l.solution.slice(0,demos[index]).map(step => {
      const li = document.createElement('li'); li.textContent = step.text[lang]; return li;
    }));
    $('solution-next').hidden = demos[index] >= l.solution.length;
    $('success').hidden = !complete;
    $('payoff').textContent = l.payoff[lang];
    $('next').textContent = t(index === D.levels.length-1 ? 'finish' : 'next');
  }
  function focusMain() { $('main').focus({preventScroll:true}); }
  function open(i) {
    if (drag) { games[index] = drag.state; drag = null; }
    index = i; screen = 'play'; zoom=1; $('paper-scroll').classList.remove('zoomed');
    $('level-picker').open=false;
    render(); focusMain(); persist();
  }
  function next() {
    if (index < D.levels.length-1) open(index+1);
    else { screen = 'end'; render(); focusMain(); }
  }
  function act(action, final = true) { games[index] = C.apply(level(),state(),action,final); if(action.type==='nudge')games[index].holding=false; render(); if(final)persist(); }
  function point(event) {
    const r = $('scene').getBoundingClientRect();
    return { x:(event.clientX-r.left)*800/r.width, y:(event.clientY-r.top)*480/r.height };
  }
  function place(id, p, target) {
    const o = state().objects[id];
    if (!o) return;
    games[index]=C.apply(level(),state(),{type:o.kind==='resize'?'resize':'move', id, x:p.x, y:p.y,target});
    games[index].holding=false;games[index].selected=null;render();persist();
  }
  function activate(id, p) {
    const s = state(), o = s.objects[id], selected = s.objects[s.selected];
    if (s.holding && selected && ['move','resize','arc'].includes(selected.kind) && id !== s.selected && o?.kind !== 'resize') {
      place(s.selected,p,id); return;
    }
    if (!o) { if (s.holding && selected && ['move','resize','arc'].includes(selected.kind)) place(s.selected,p,id); return; }
    if (['ink','use','fold'].includes(o.kind)) {
      games[index] = { ...s, selected:id };
      act({type:'use',id});
    } else act({type:'select',id});
  }
  function hitObject(e) {
    const id=e.target.closest('[data-object]')?.dataset.object, o=state().objects[id];
    if(o?.kind!=='ink')return id;
    const p=point(e),box=C.bounds(level(),state(),id);
    const contains=b=>p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h;
    if(contains(box))return id;
    const visible=[...level().objects].reverse().find(item=>item.kind!=='ink'&&contains(C.bounds(level(),state(),item.id)));
    return visible?.id||id;
  }
  $('scene').addEventListener('click',e => {
    if (suppressClick) return;
    const id = hitObject(e);
    activate(id,point(e));
  });
  $('scene').addEventListener('pointerdown',e => {
    if (e.button !== 0 || drag) return;
    const id = hitObject(e);
    if (!id) return;
    drag = { id, pointerId:e.pointerId, start:point(e), state:state(), moved:false };
  });
  function dragAction(e) {
    const p = point(e), o = drag.state.objects[drag.id], b = C.bounds(level(),drag.state,drag.id);
    const dx = p.x-drag.start.x, dy = p.y-drag.start.y;
    if (o.kind === 'fold') return {type:'fold',id:o.id,direction:dx > 0 ? 1 : -1};
    if (o.kind === 'resize') return {type:'resize',id:o.id,x:b.x+b.w/2+dx,y:b.y+b.h/2+dy};
    if (o.kind === 'arc') return {type:'move',id:o.id,x:p.x,y:p.y};
    return {type:'move',id:o.id,x:b.x+b.w/2+dx,y:b.y+b.h/2+dy};
  }
  $('scene').addEventListener('pointermove',e => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const p = point(e);
    if (Math.hypot(p.x-drag.start.x,p.y-drag.start.y) > 6) drag.moved = true;
    if (drag.moved && !drag.captured) { $('scene').setPointerCapture(e.pointerId); drag.captured = true; }
    if (!drag.moved || ['ink','fold','use'].includes(drag.state.objects[drag.id].kind)) return;
    games[index] = C.apply(level(),drag.state,dragAction(e),false);
    games[index].selected = drag.id; render();
  });
  $('scene').addEventListener('pointerup',e => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    if (drag.moved) {
      games[index] = C.apply(level(),drag.state,dragAction(e));
      games[index].selected = null;games[index].holding=false;
      suppressClick = true; setTimeout(() => { suppressClick = false; },0);
      render();
      persist();
    }
    drag = null;
  });
  function cancelDrag(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    games[index] = drag.state; drag = null; render();
  }
  $('scene').addEventListener('pointercancel',cancelDrag);
  $('scene').addEventListener('lostpointercapture',cancelDrag);
  $('scene').addEventListener('pointerleave',e => { if (drag && !drag.captured) cancelDrag(e); });
  const arrows = { ArrowUp:[0,-24], ArrowDown:[0,24], ArrowLeft:[-24,0], ArrowRight:[24,0] };
  $('scene').addEventListener('keydown',e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const id = e.target.closest('[data-object]')?.dataset.object;
    if (!id) return;
    if (arrows[e.key]) {
      e.preventDefault();
      const [dx,dy] = arrows[e.key];
      games[index] = { ...state(), selected:id };
      act({type:'nudge',id,dx,dy});
    } else if (['Enter',' '].includes(e.key)) {
      e.preventDefault(); activate(id,C.centre(C.bounds(level(),state(),id)));
    } else if (e.key === 'Escape') { e.preventDefault(); act({type:'release'}); }
  });
  for (const [key,dx,dy] of [['up',0,-24],['down',0,24],['left',-24,0],['right',24,0]]) {
    $(key).addEventListener('click',() => { if (state().selected) act({type:'nudge',id:state().selected,dx,dy}); });
  }
  $('use').addEventListener('click',() => { if (state().selected) act({type:'use',id:state().selected}); });
  $('release').addEventListener('click',() => act({type:'release'}));
  $('context-controls').addEventListener('click',e=>{
    const control=level().controls?.find(c=>c.id===e.target.closest('[data-control]')?.dataset.control);
    if(control)act(control.action);
  });
  $('zoom-in').addEventListener('click',()=>{zoom=2;$('paper-scroll').classList.add('zoomed');render();});
  $('zoom-out').addEventListener('click',()=>{zoom=1;$('paper-scroll').classList.remove('zoomed');render();});
  $('start').addEventListener('click',() => open(index));
  $('level-list').addEventListener('click',e => {
    const b = e.target.closest('[data-level]'); if (b) open(Number(b.dataset.level));
  });
  $('home').addEventListener('click',() => { screen='title'; render(); focusMain(); });
  $('next').addEventListener('click',next);
  $('skip').addEventListener('click',next);
  $('hint').addEventListener('click',() => { hintCounts[index] = Math.min(3,hintCounts[index]+1); render(); });
  function showStep() {
    const at = demos[index], step = level().solution[at];
    if (!step) return;
    games[index] = C.apply(level(),state(),step.action);
    games[index].selected = step.action.id;
    demos[index]++; render(); persist();
  }
  $('reveal').addEventListener('click',() => { games[index]=C.initial(level()); demos[index]=0; showStep(); });
  $('solution-next').addEventListener('click',showStep);
  $('restart').addEventListener('click',() => { games[index]=C.initial(level()); hintCounts[index]=0; demos[index]=0; render(); persist(); });
  $('replay').addEventListener('click',() => {
    D.levels.forEach((l,i) => { games[i]=C.initial(l); hintCounts[i]=0; demos[i]=0; }); open(0);
  });
  $('browse').addEventListener('click',() => open(0));
  for (const code of ['en','hu']) $('lang-'+code).addEventListener('click',() => {
    if (drag) { games[index]=drag.state; drag=null; }
    lang=code; render(); save();
  });
  $('help-open').addEventListener('click',() => $('help').showModal());
  $('help-close').addEventListener('click',() => { $('help').close(); $('help-open').focus(); });
  $('music-toggle').addEventListener('click',() => {
    if (music.wanted) { prefs.music=false; music.pause(); }
    else { prefs.music=true; music.start(); }
    save();
  });
  $('volume').addEventListener('input',() => { $('music-player').volume=Number($('volume').value); save(); });
  window.addEventListener('resize',()=>{if(!drag)render();});
  render();
})();

/* Purpose: pointer-lock controls, fixed-step scheduling and accessible game UI. */
(function(){
  'use strict';
  const {TUNE,STAGES,Session}=Surf;
  const $=id=>document.getElementById(id);
  const canvas=$('view'),renderer=new SurfRenderer(canvas);
  let store=null;try{store=window.localStorage;}catch{/* Storage is optional. */}
  const session=new Session(store);
  const keys=new Set();let previous=0,accumulator=0,sensitivity=1,noticeUntil=0;
  const supported=typeof canvas.requestPointerLock==='function' && !!renderer.ctx;
  const touchOnly=matchMedia('(pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches;
  const time=value=>{
    if(value===null)return '--';
    const ms=Math.round(value*1000);
    return `${String(Math.floor(ms/60000)).padStart(2,'0')}:${(ms%60000/1000).toFixed(3).padStart(6,'0')}`;
  };
  function notify(text){$('notice').textContent=text;noticeUntil=performance.now()+3200;$('notice').classList.add('visible');}
  function showError(text){$('error').textContent=text;$('error').hidden=false;}
  function input(){return {forward:keys.has('KeyW'),back:keys.has('KeyS'),left:keys.has('KeyA'),right:keys.has('KeyD'),jump:keys.has('Space')};}
  function clearInput(){keys.clear();accumulator=0;}
  function showMenu(){
    session.paused=true;clearInput();$('menu').hidden=false;document.body.classList.add('menu-open');$('hud').setAttribute('aria-hidden','true');
    $('restart').hidden=!session.active && !session.finished;
    $('play').textContent=session.finished?'Surf again ↗':session.active?'Resume the tide ↗':'Enter the tide ↗';
    $('intro').textContent=session.finished?'A line worth coming back for.':session.active?'Take a breath. Your clock is paused.':'Find your line. Keep your momentum.';
    $('results').hidden=!session.finished;$('lesson').hidden=session.finished;
    if(session.finished){
      const target=$('results');target.replaceChildren();
      const row=(label,value,className='result-row')=>{const div=document.createElement('div');div.className=className;const span=document.createElement('span');span.textContent=label;const strong=document.createElement('strong');strong.textContent=value;div.append(span,strong);target.append(div);};
      row('Run complete',time(session.elapsed),'result-row result-total');
      session.splits.forEach((value,i)=>row(STAGES[i].name,time(value)));
      row('Recoveries',String(session.falls));row('Best run',time(session.records.run));
    }
    $('play').focus();
  }
  function pause(){
    if(document.pointerLockElement===canvas)document.exitPointerLock();
    showMenu();
  }
  function play(){
    if(!supported||touchOnly)return;
    if(session.finished)session.restart();
    $('error').hidden=true;
    try{
      canvas.focus();const request=canvas.requestPointerLock();
      if(request && typeof request.catch==='function')request.catch(()=>{showMenu();showError('Mouse capture was declined. Click Enter or Resume to try again.');});
    }catch{showMenu();showError('Mouse capture is unavailable here. Open the page in a desktop browser outside an embedded preview.');}
  }
  document.addEventListener('pointerlockchange',()=>{
    if(document.pointerLockElement===canvas){
      clearInput();previous=performance.now();session.paused=false;$('menu').hidden=true;
      document.body.classList.remove('menu-open');$('hud').setAttribute('aria-hidden','false');
    }else showMenu();
  });
  document.addEventListener('pointerlockerror',()=>{showMenu();showError('The browser could not capture the mouse. Click Enter or Resume to retry.');});
  document.addEventListener('mousemove',event=>{
    if(session.paused||document.pointerLockElement!==canvas)return;
    session.player.yaw+=event.movementX*TUNE.mouse*sensitivity;
    session.player.yaw=((session.player.yaw+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;
    session.player.pitch=Math.max(-1.35,Math.min(1.35,session.player.pitch-event.movementY*TUNE.mouse*sensitivity));
  });
  document.addEventListener('keydown',event=>{
    if(session.paused)return;
    if(['KeyW','KeyA','KeyS','KeyD','Space','KeyR','Escape'].includes(event.code))event.preventDefault();
    if(event.code==='Escape'){pause();return;}
    if(event.code==='KeyR'&&!event.repeat){session.respawn();clearInput();notify('Back at the checkpoint · +2s while the clock is running');return;}
    keys.add(event.code);
  });
  document.addEventListener('keyup',event=>keys.delete(event.code));
  window.addEventListener('blur',()=>{if(!session.paused)pause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&!session.paused)pause();});
  $('play').addEventListener('click',play);$('pause').addEventListener('click',pause);
  $('restart').addEventListener('click',()=>{session.restart();clearInput();showMenu();play();});
  $('sensitivity').addEventListener('input',event=>{sensitivity=Number(event.target.value);$('sensitivityValue').textContent=sensitivity.toFixed(1)+'×';});
  function hud(){
    const stage=STAGES[session.stageIndex],p=session.player,speed=Math.hypot(p.vel.x,p.vel.z);
    $('timer').textContent=time(session.elapsed);$('split').textContent=time(session.stageElapsed);
    $('bestRun').textContent='BEST / '+time(session.records.run);$('bestStage').textContent='BEST / '+time(session.records.stages[session.stageIndex]);
    $('speed').textContent=Math.round(speed*32);$('speedBar').style.width=Math.min(100,speed/65*100)+'%';
    $('stageNumber').textContent=String(session.stageIndex+1).padStart(2,'0')+' / 04';
    $('stageName').textContent=stage.name;$('stageHint').textContent=stage.subtitle;
    document.documentElement.style.setProperty('--mint',stage.colour);
    [...$('progress').children].forEach((item,i)=>{item.className=i<session.stageIndex?'done':i===session.stageIndex?'current':'';});
    const ramp=p.surface?.startsWith('ramp'),side=stage.side>0?'D':'A';
    $('contact').textContent=ramp?'RAMP / HOLD '+side:p.grounded?'ON THE PAD':'AIR / TURN + STRAFE';
    $('guidance').textContent=p.surface==='start'?'W to approach the edge':ramp?(stage.gap>=10&&p.pos.z>35&&p.pos.z<52?'Space at the gold lip':`Release W · Hold ${side} · Look along the slope`):p.surface==='finish'?'Through the gold gate':'Smooth turns keep your speed';
    for(const key of ['A','W','S','D','Space'])$('key'+key).classList.toggle('active',keys.has(key==='Space'?'Space':'Key'+key));
  }
  function frame(now){
    const raw=previous?Math.max(0,(now-previous)/1000):0;previous=now;
    if(!session.paused&&!session.finished){
      const dt=Math.min(raw,TUNE.maxFrame);
      // Keep elapsed active time when rendering stalls beyond the simulation budget.
      if(session.active && raw>dt){session.elapsed+=raw-dt;session.stageElapsed+=raw-dt;}
      accumulator+=dt;
      while(accumulator>=TUNE.step&&!session.finished){session.tick(input());accumulator-=TUNE.step;}
      if(session.event==='checkpoint'){clearInput();notify('Checkpoint · '+STAGES[session.stageIndex].name);}
      if(session.event==='respawn'){clearInput();notify('Back at the checkpoint · +2s');}
      if(session.event==='finished'){pause();if(!session.storageOK)showError('This browser could not save records. Your result is visible for this visit.');}
      else if(!session.storageOK && session.event==='checkpoint')notify('Checkpoint reached. Browser storage is unavailable.');
      session.event=null;
    }
    hud();renderer.render(session.player,STAGES[session.stageIndex],now/1000);
    if(now>noticeUntil)$('notice').classList.remove('visible');
    requestAnimationFrame(frame);
  }
  if(touchOnly){$('mobileNote').hidden=false;$('play').disabled=true;}
  else if(!supported){$('play').disabled=true;showError('This game needs a desktop browser with Canvas 2D and pointer-lock mouse controls.');}
  showMenu();requestAnimationFrame(frame);
})();

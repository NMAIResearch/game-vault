/* Purpose: deterministic surf movement, course geometry and local timing records.
   Runs unchanged in a browser and in the offline Node test runner. */
(function (root) {
  'use strict';
  const TUNE = Object.freeze({
    step: 1 / 120, gravity: 22, groundSpeed: 19, groundAccel: 9,
    friction: 6, airAccel: 9, airWishSpeed: 24, airCap: 3.2,
    jump: 8.5, eye: 1.65, mouse: 0.0022, maxFrame: 0.1,
    fallY: -24, respawnPenalty: 2, collisionSkin: 0.015
  });
  const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
  const length = a => Math.hypot(a.x, a.y, a.z);
  const normalise = a => { const n = length(a) || 1; return {x:a.x/n,y:a.y/n,z:a.z/n}; };
  function clip(v, n) {
    const into = dot(v, n);
    return into < 0 ? {x:v.x-n.x*into,y:v.y-n.y*into,z:v.z-n.z*into} : {...v};
  }
  function accelerate(v, wish, speed, accel, dt, cap = speed) {
    const add = cap - dot(v, wish);
    if (add <= 0) return {...v};
    const amount = Math.min(add, accel * speed * dt);
    return {x:v.x + wish.x*amount,y:v.y + wish.y*amount,z:v.z + wish.z*amount};
  }
  function wishDirection(input, yaw) {
    const side = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const forward = (input.forward ? 1 : 0) - (input.back ? 1 : 0);
    return normalise({x:Math.sin(yaw)*forward + Math.cos(yaw)*side,y:0,
      z:Math.cos(yaw)*forward - Math.sin(yaw)*side});
  }
  function plane(id, x0, x1, z0, z1, base, sx, sz, kind='ramp') {
    return {id,x0,x1,z0,z1,base,sx,sz,kind,normal:normalise({x:-sx,y:1,z:-sz})};
  }
  const heightAt = (s, x, z) => s.base + s.sx*x + s.sz*z;
  const within = (s, p, pad=0) => p.x >= s.x0-pad && p.x <= s.x1+pad && p.z >= s.z0-pad && p.z <= s.z1+pad;
  // Each stage has an independent start pad. Gate arrival transfers to the next pad.
  function makeStage(name, subtitle, colour, side, gap, bend) {
    const sx = side * 1.35;
    const x0 = side > 0 ? -16 : 0, x1 = side > 0 ? 0 : 16;
    const startX = -side * 6;
    const startY = 32 + sx*startX;
    const surfaces = [plane('start', -19,19,-16,0,startY,0,0,'pad'),
      plane('ramp-a', x0,x1,0,52,32,sx,-0.17),
      plane('ramp-b', x0+bend,x1+bend,52+gap,112,30-sx*bend,sx,-0.17),
      plane('finish',-23,23,112,139,-1,0,0,'finish')];
    return {name,subtitle,colour,side,gap,bend,surfaces,
      spawn:{x:startX,y:startY+TUNE.collisionSkin,z:-10},
      goal:{x0:-23,x1:23,z0:118,z1:139,y0:-1.2,y1:8},
      startLine:0};
  }
  const STAGES = [
    makeStage('First light','Find the edge', '#64efd2',1,0,0),
    makeStage('Mirror tide','Change your footing', '#8cbdff',-1,5,0),
    makeStage('Open water','Carry the gap', '#ffcf88',1,10,-2),
    makeStage('Afterglow','Bring it home', '#d9a7ff',-1,14,2)
  ];
  function newPlayer(stage) {
    return {pos:{...stage.spawn},vel:{x:0,y:0,z:0},yaw:0,pitch:0,
      surface:'start',grounded:true,jumpHeld:false};
  }
  function move(player, input, stage, dt = TUNE.step) {
    const old = {...player.pos};
    const support = stage.surfaces.find(s => s.id === player.surface && within(s,old,0.025)
      && Math.abs(old.y-heightAt(s,old.x,old.z)) < 0.08);
    const ground = support && support.normal.y > 0.7;
    const jump = !!input.jump && !player.jumpHeld;
    player.jumpHeld = !!input.jump;
    let v = {...player.vel};
    if (ground) {
      const speed = Math.hypot(v.x,v.z), drop = Math.max(speed,5)*TUNE.friction*dt;
      const scale = speed ? Math.max(0,speed-drop)/speed : 0;
      v.x *= scale; v.z *= scale;
    }
    const wish = wishDirection(input,player.yaw);
    if (length(wish)) v = accelerate(v,wish,ground?TUNE.groundSpeed:TUNE.airWishSpeed,
      ground?TUNE.groundAccel:TUNE.airAccel,dt,ground?TUNE.groundSpeed:TUNE.airCap);
    if (jump && support) { v.y += TUNE.jump; player.surface=null; }
    v.y -= TUNE.gravity*dt;
    if (support && !(jump && support)) v = clip(v,support.normal);
    let next = {x:old.x+v.x*dt,y:old.y+v.y*dt,z:old.z+v.z*dt};
    player.surface = null; player.grounded = false;
    // Swept crossing prevents a fast descent from passing through a ramp.
    let first = null;
    for (const s of stage.surfaces) {
      const before = old.y-heightAt(s,old.x,old.z)-TUNE.collisionSkin;
      const after = next.y-heightAt(s,next.x,next.z)-TUNE.collisionSkin;
      if (before >= -0.06 && after <= 0.002 && dot(v,s.normal) <= 0.002) {
        const t = Math.max(0,Math.min(1,before/(before-after || 1)));
        const hit = {x:old.x+(next.x-old.x)*t,y:old.y+(next.y-old.y)*t,z:old.z+(next.z-old.z)*t};
        if (within(s,hit) && (!first || t<first.t)) first={s,t,hit};
      }
    }
    if (first) {
      const {s,t,hit}=first;
      v=clip(v,s.normal);
      next={x:hit.x+v.x*dt*(1-t),y:hit.y+v.y*dt*(1-t),z:hit.z+v.z*dt*(1-t)};
      if (within(s,next)) {
        next.y=heightAt(s,next.x,next.z)+TUNE.collisionSkin;
        player.surface=s.id; player.grounded=s.normal.y>0.7;
      }
    }
    player.pos=next; player.vel=v;
    return player;
  }
  const STORAGE_KEY='tideline-surf-records-v1';
  function validTime(v) { return typeof v==='number' && Number.isFinite(v) && v>0 && v<86400; }
  function readRecords(store) {
    const blank={stages:Array(STAGES.length).fill(null),run:null};
    try {
      const data=JSON.parse(store.getItem(STORAGE_KEY));
      if (!data || data.version!==1) return blank;
      return {stages:blank.stages.map((_,i)=>validTime(data.stages?.[i])?data.stages[i]:null),run:validTime(data.run)?data.run:null};
    } catch { return blank; }
  }
  class Session {
    constructor(store=null) { this.store=store; this.records=readRecords(store); this.storageOK=true; this.restart(); }
    restart() {
      this.stageIndex=0; this.player=newPlayer(STAGES[0]); this.active=false;
      this.finished=false; this.paused=true; this.elapsed=0; this.stageElapsed=0;
      this.falls=0; this.splits=[]; this.event='ready';
    }
    respawn() {
      if (this.finished) return;
      this.player=newPlayer(STAGES[this.stageIndex]);
      if (this.active) { this.elapsed+=TUNE.respawnPenalty; this.stageElapsed+=TUNE.respawnPenalty; this.falls++; }
      this.event='respawn';
    }
    save() {
      try { this.store.setItem(STORAGE_KEY,JSON.stringify({version:1,...this.records})); this.storageOK=true; }
      catch { this.storageOK=false; }
    }
    tick(input={},dt=TUNE.step) {
      if (this.paused || this.finished) return;
      const stage=STAGES[this.stageIndex];
      move(this.player,input,stage,dt);
      if (!this.active && this.player.pos.z >= stage.startLine) { this.active=true; this.event='started'; }
      if (this.active) { this.elapsed+=dt; this.stageElapsed+=dt; }
      const p=this.player.pos,g=stage.goal;
      if (p.y<TUNE.fallY || Math.abs(p.x)>110 || p.z>165 || p.z<-70) { this.respawn(); return; }
      if (this.active && p.x>=g.x0 && p.x<=g.x1 && p.z>=g.z0 && p.z<=g.z1 && p.y>=g.y0 && p.y<=g.y1) {
        const i=this.stageIndex, time=this.stageElapsed;
        this.splits.push(time);
        if (this.records.stages[i]===null || time<this.records.stages[i]) this.records.stages[i]=time;
        if (i===STAGES.length-1) {
          this.finished=true; this.event='finished';
          if (this.records.run===null || this.elapsed<this.records.run) this.records.run=this.elapsed;
        } else {
          this.stageIndex++; this.stageElapsed=0;
          this.player=newPlayer(STAGES[this.stageIndex]); this.event='checkpoint';
        }
        this.save();
      }
    }
  }
  const api={TUNE,STAGES,STORAGE_KEY,dot,length,normalise,clip,accelerate,wishDirection,heightAt,within,newPlayer,move,Session,readRecords};
  if (typeof module==='object' && module.exports) module.exports=api;
  else root.Surf=api;
})(typeof globalThis!=='undefined'?globalThis:this);

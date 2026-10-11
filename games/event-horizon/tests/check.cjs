// Purpose: verify the shipped path model, level geometry and recorded solutions.
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const code=html.match(/<script id="game-code">([\s\S]*?)<\/script>/)[1];
new vm.Script(code,{filename:'event-horizon/index.html:game-code'});
const env={};vm.createContext(env);vm.runInContext(code,env);const C=env.HorizonCore;
const shots=JSON.parse(fs.readFileSync(path.join(__dirname,'solutions.json'))).solutions;
const clone=v=>JSON.parse(JSON.stringify(v));
test('eight valid chambers with increasing geometric constraints',()=>{
 assert.equal(C.levels.length,8);assert.equal(shots.length,8);
 const names=new Set();
 for(const [i,l] of C.levels.entries()){
  assert.ok(!names.has(l.name));names.add(l.name);assert.ok(l.hint.length>10);
  assert.ok(l.holes.length>=1&&l.holes.length<=3);
  for(const p of [l.source,l.target,...l.holes]){assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.ok(p.x>0&&p.x<C.W&&p.y>0&&p.y<C.H);}
  for(const h of l.holes){assert.ok(h.r>0&&h.strength>0);assert.ok(Math.hypot(h.x-l.source.x,h.y-l.source.y)>h.r);assert.ok(Math.hypot(h.x-l.target.x,h.y-l.target.y)>h.r+l.target.r);}
  for(const r of l.walls){assert.ok(r.x>=0&&r.y>=0&&r.w>0&&r.h>0&&r.x+r.w<=C.W&&r.y+r.h<=C.H);}
  assert.ok(l.initial>=-65&&l.initial<=65);if(i)assert.ok(l.target.r<=C.levels[i-1].target.r);
 }
 assert.ok(C.levels[7].holes.length>C.levels[0].holes.length);assert.ok(C.levels[7].walls.length>C.levels[0].walls.length);
});
for(const recorded of shots)test(`chamber ${recorded.level}: recorded launch succeeds, default and zero gravity fail`,()=>{
 const l=C.levels[recorded.level-1],a=recorded.angle;
 assert.ok(a>=-65&&a<=65&&Number.isInteger(a*10));
 const result=C.trace(l,a);assert.equal(result.outcome,'success');assert.ok(result.points.length<=C.MAX_STEPS+1);
 assert.deepEqual(C.trace(l,a),result);assert.notEqual(C.trace(l,l.initial).outcome,'success');
 const zero=clone(l);zero.holes.forEach(h=>h.strength=0);assert.notEqual(C.trace(zero,a).outcome,'success');
 const last=result.points.at(-1);assert.ok(Math.hypot(last.x-l.target.x,last.y-l.target.y)<=l.target.r+2);
});
test('swept collisions include tangent contact and thin barriers',()=>{
 assert.equal(C.segmentDistance({x:0,y:0},{x:10,y:0},{x:5,y:3}),3);
 assert.equal(C.segmentDistance({x:0,y:0},{x:0,y:0},{x:3,y:4}),5);
 assert.equal(C.rectHit({x:0,y:1},{x:10,y:1},{x:5,y:0,w:.1,h:2}),true);
 assert.equal(C.rectHit({x:0,y:3},{x:10,y:3},{x:5,y:0,w:1,h:2}),false);
 assert.equal(C.rectHit({x:5,y:0},{x:5,y:10},{x:5,y:4,w:2,h:2}),true);
});
test('direct core, barrier, detector and boundary outcomes',()=>{
 const l={source:{x:50,y:250},holes:[],walls:[],target:{x:200,y:250,r:15}};
 assert.equal(C.trace(l,0).outcome,'success');
 assert.equal(C.trace({...l,holes:[{x:100,y:250,r:15,strength:40}]},0).outcome,'core');
 assert.equal(C.trace({...l,walls:[{x:120,y:220,w:1,h:60}]},0).outcome,'barrier');
 assert.equal(C.trace(l,-65).outcome,'escaped');assert.throws(()=>C.trace(l,NaN));
});
test('all allowed angles terminate with finite fixed-step paths',()=>{
 for(const l of C.levels)for(let a=-65;a<=65;a++){
  const r=C.trace(l,a);assert.ok(['success','core','barrier','escaped','orbit'].includes(r.outcome));assert.ok(r.points.length<=C.MAX_STEPS+1);
  for(let i=1;i<r.points.length;i++){const p=r.points[i],q=r.points[i-1];assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.ok(Math.abs(Math.hypot(p.x-q.x,p.y-q.y)-2)<1e-10);}
 }
});
test('page has no external resources or network calls',()=>{
 assert.doesNotMatch(code,/\bfetch\s*\(|XMLHttpRequest/);assert.doesNotMatch(html,/<(?:script|link)[^>]+(?:src|href)=["']https?:/);
 assert.match(html,/not a simulation of real physics/);assert.match(code,/prefers-reduced-motion/);
});

function harness(){
 const elements=new Map();let raf;
 const drawing=new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 class Element{constructor(id,tag='DIV'){this.id=id;this.tagName=tag;this.value='0';this.hidden=false;this.textContent='';this.options=[];this.events={};this.width=720;this.height=540;}addEventListener(n,f){(this.events[n]??=[]).push(f);}append(o){this.options.push(o);}focus(){document.activeElement=this;}getContext(){return drawing;}setPointerCapture(){}getBoundingClientRect(){return {left:0,top:0,width:360,height:270};}emit(n,e={}){e.target??=this;e.preventDefault??=()=>{};for(const f of this.events[n]||[])f(e);this['on'+n]?.(e);}}
 for(const m of html.matchAll(/<(\w+)[^>]*\bid="([^"]+)"/g))elements.set(m[2],new Element(m[2],m[1].toUpperCase()));
 const document=new Element('document');document.getElementById=id=>elements.get(id);document.createElement=tag=>new Element('',tag.toUpperCase());const window=new Element('window');
 const env={document,window,matchMedia:()=>({matches:true}),devicePixelRatio:1,requestAnimationFrame:f=>raf=f};vm.createContext(env);vm.runInContext(code,env);
 return {elements,document,frame:t=>raf(t),click:id=>elements.get(id).emit('click'),key:(key,code,target=elements.get('board'))=>document.emit('keydown',{key,code,target})};
}
test('level selection, keyboard, touch aiming, successful launch and reset',()=>{
 const h=harness(),e=h.elements;assert.equal(e.get('level').options.length,8);
 for(const s of shots){e.get('level').value=String(s.level-1);e.get('level').emit('change');e.get('angle').value=s.angle;e.get('angle').emit('input');h.click('launch');assert.match(e.get('status').textContent,/Detector reached|All chambers complete/);assert.equal(e.get('next').hidden,false);}
 assert.equal(e.get('progress').textContent,'8 / 8 solved');h.click('next');assert.equal(e.get('level').value,0);
 h.key('ArrowRight','ArrowRight');assert.equal(e.get('angle-value').value,'1.0°');h.key('r','KeyR',e.get('launch'));assert.equal(e.get('angle-value').value,'0.0°');
 e.get('board').emit('pointerdown',{pointerId:1,clientX:100,clientY:135});e.get('board').emit('pointerup');assert.equal(e.get('angle-value').value,'0.0°');
 h.key(' ','Space');assert.match(e.get('status').textContent,/left the field/);h.click('reset');assert.equal(e.get('status').textContent,'Find a path to the detector.');
});
test('recorded solutions reject a zero-pull model mutation',()=>{
 const mutant={};vm.createContext(mutant);vm.runInContext(code.replace('bend+=h.strength*','bend+=0*'),mutant);
 for(const s of shots)assert.notEqual(mutant.HorizonCore.trace(mutant.HorizonCore.levels[s.level-1],s.angle).outcome,'success');
});

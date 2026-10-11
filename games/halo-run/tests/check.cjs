// Purpose: verify the shipped inline rhythm engine, embedded assets and playback lifecycle.
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const code=html.match(/<script id="game-code">([\s\S]*?)<\/script>/)[1];
const scripts=new Map([...html.matchAll(/<script id="([^"]+)"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>[m[1],m[2]]));
new vm.Script(code,{filename:'halo-run/index.html:game-code'});
const pure={};vm.createContext(pure);vm.runInContext(code,pure);const C=pure.HaloCore;
const maps=JSON.parse(scripts.get('maps'));
const map=beats=>({beats,low_onset_strength:beats.map(()=>1)});

test('embedded audio and beat maps equal the standalone copies',()=>{
 for(const [i,slug] of ['light-that-travels','neon-csardas'].entries()){
  const disk=JSON.parse(fs.readFileSync(path.join(root,slug+'-clip.beats.json')));
  assert.deepEqual(maps[i].map,disk);C.validateMap(disk);
  assert.ok(disk.beats.length>100);assert.ok(disk.beats.at(-1)<=60);
  const bytes=fs.readFileSync(path.join(root,slug+'-clip.mp3'));
  assert.deepEqual(Buffer.from(scripts.get('audio-'+i),'base64'),bytes);
  assert.ok(bytes.length>100000);
 }
 assert.doesNotMatch(code,/\bfetch\s*\(|XMLHttpRequest|setInterval|setTimeout/);
 assert.doesNotMatch(html,/<(?:script|link)[^>]+(?:src|href)=["']https?:/);
});
test('inclusive scoring boundaries and invalid values',()=>{
 for(const sign of [-1,1]){assert.equal(C.grade(sign*.060),'perfect');assert.equal(C.grade(sign*.06001),'good');assert.equal(C.grade(sign*.120),'good');assert.equal(C.grade(sign*.12001),null);}
 assert.equal(C.grade(0),'perfect');assert.equal(C.grade(Infinity),null);assert.equal(C.grade(NaN),null);
});
test('expiry, missed notes, combo reset and duplicate taps',()=>{
 const s=C.session(map([1,2,3,4]));assert.equal(C.tap(s,1).grade,'perfect');assert.equal(C.tap(s,2.1).grade,'good');assert.equal(s.score,1600);assert.equal(s.best,2);
 assert.equal(C.tap(s,2.1).grade,'extra');assert.equal(s.combo,0);assert.equal(s.extra,1);
 C.expire(s,3.12);assert.equal(s.miss,0);C.expire(s,3.12001);assert.equal(s.miss,1);
 C.tap(s,3.94);assert.equal(s.perfect,2);assert.equal(s.best,2);C.expire(s,Infinity);assert.equal(s.perfect+s.good+s.miss,4);
});
test('closest unjudged note wins and a note cannot score twice',()=>{
 const s=C.session(map([1,1.15]));assert.equal(C.tap(s,1.1).index,1);assert.equal(C.tap(s,1.1).index,0);assert.equal(C.tap(s,1.1).grade,'extra');assert.equal(s.good,1);assert.equal(s.perfect,1);
});
test('map rejection covers duplicates, unsorted data and invalid strengths',()=>{
 for(const m of [map([]),map([2,1]),map([1,1]),map([-1]),map([NaN]),{beats:[1],low_onset_strength:[]},{beats:[1],low_onset_strength:[-1]}])assert.throws(()=>C.validateMap(m));
});
test('ring contact, motion reduction and audio-clock offset',()=>{
 assert.equal(C.noteRadius(0),204);assert.ok(C.noteRadius(1)>204);assert.equal(C.noteRadius(1,true),204);
 assert.equal(C.songTime(11.5,10,.0),1.5);assert.ok(Math.abs(C.songTime(11.5,10,100)-1.4)<1e-10);
});
test('both complete charts award the exact maximum; idle runs miss every note',()=>{
 for(const {map:m} of maps){const s=C.session(m);for(const t of m.beats)C.tap(s,t);C.expire(s,Infinity);assert.equal(s.score,m.beats.length*1000);assert.equal(s.best,m.beats.length);assert.equal(s.miss,0);const idle=C.session(m);C.expire(idle,Infinity);assert.equal(idle.miss,m.beats.length);assert.equal(idle.score,0);}
});

function harness(){
 const elements=new Map();
 class Element{constructor(id,tag='DIV'){this.id=id;this.tagName=tag;this.hidden=false;this.disabled=false;this.style={};this.dataset={};this.attributes={};this.listeners={};this.textContent=scripts.get(id)||'';this.value='0';this.width=600;this.height=600;this.parentElement={setAttribute(){}};}addEventListener(n,f){(this.listeners[n]??=[]).push(f);}setAttribute(k,v){this.attributes[k]=v;}focus(){document.activeElement=this;}emit(n,e={}){e.target??=this;e.preventDefault??=()=>{};for(const f of this.listeners[n]||[])f(e);if(this['on'+n])return this['on'+n](e);}getContext(){return new Proxy({},{get:()=>()=>{}});}}
 for(const m of html.matchAll(/<(\w+)[^>]*\bid="([^"]+)"/g))elements.set(m[2],new Element(m[2],m[1].toUpperCase()));
 const buttons=[0,1].map(i=>{const e=new Element('song'+i,'BUTTON');e.dataset.song=String(i);return e;});
 const document=new Element('document');document.getElementById=id=>elements.get(id);document.querySelectorAll=()=>buttons;document.hidden=false;
 let audio,raf;const sources=[];
 class Audio{constructor(){audio=this;this.currentTime=100;this.state='suspended';this.destination={};this.decodeFailure=false;}async resume(){this.state='running';this.onstatechange?.();}async suspend(){this.state='suspended';this.onstatechange?.();}async decodeAudioData(){if(this.decodeFailure)throw Error('Test decoder failure');return {duration:60};}createGain(){return {gain:{value:0},connect(){},disconnect(){}};}createBufferSource(){const s={stopped:false,connect(){},disconnect(){this.disconnected=true;},start(t){this.started=t;},stop(){this.stopped=true;}};sources.push(s);return s;}}
 const window=new Element('window');window.AudioContext=Audio;
 const env={document,window,matchMedia:()=>({matches:false}),devicePixelRatio:1,atob:v=>Buffer.from(v,'base64').toString('binary'),requestAnimationFrame:f=>raf=f};vm.createContext(env);vm.runInContext(code,env);
 return {get audio(){return audio;},elements,document,window,buttons,sources,frame:()=>raf(),click:id=>elements.get(id).emit('click'),key:(key,code,target=elements.get('tap'),repeat=false)=>document.emit('keydown',{key,code,target,repeat})};
}
test('UI schedules from audio time, scores, pauses, resumes, completes and replays',async()=>{
 const h=harness(),e=h.elements;
 await h.click('start');assert.equal(h.audio.state,'running');assert.equal(h.sources[0].started,101.5);assert.equal(e.get('play').hidden,false);
 const start=h.sources[0].started;h.audio.currentTime=start+.867;h.key(' ','Space');assert.equal(e.get('score').textContent,'1,000');h.key(' ','Space',e.get('tap'),true);assert.equal(e.get('score').textContent,'1,000');
 await h.click('pause');assert.equal(h.audio.state,'suspended');h.key(' ','Space');assert.equal(e.get('combo').textContent,'1');await h.click('resume');assert.equal(h.audio.state,'running');assert.equal(h.sources.length,1);
 h.audio.currentTime=start+61;h.frame();assert.equal(e.get('results').hidden,false);assert.equal(e.get('result-score').textContent,'1,000');assert.equal(e.get('result-misses').textContent,'124 / 0');assert.ok(h.sources[0].stopped);
 await h.click('again');assert.equal(e.get('score').textContent,'0');assert.equal(h.sources.length,2);h.key('Escape','Escape');assert.equal(e.get('menu').hidden,false);assert.ok(h.sources[1].stopped);
 h.buttons[1].emit('click');await h.click('start');assert.equal(e.get('playing-title').textContent,'Neon Csárdás');h.audio.currentTime=h.sources[2].started+.75;e.get('tap').emit('pointerdown');assert.equal(e.get('score').textContent,'1,000');
 h.document.hidden=true;h.document.emit('visibilitychange');await new Promise(setImmediate);assert.equal(h.audio.state,'suspended');assert.equal(e.get('pause-panel').hidden,false);
});
test('decoder errors are visible and cancelled loading cannot start stale audio',async()=>{
 const h=harness();await h.click('start');h.key('Escape','Escape');h.buttons[1].emit('click');h.audio.decodeFailure=true;await h.click('start');assert.match(h.elements.get('error').textContent,/Test decoder failure/);assert.equal(h.elements.get('start').disabled,false);
 h.audio.decodeFailure=false;let finish;h.audio.decodeAudioData=()=>new Promise(r=>finish=r);const loading=h.click('start');await new Promise(setImmediate);h.key('Escape','Escape',h.elements.get('start'));finish({duration:60});await loading;assert.equal(h.elements.get('menu').hidden,false);assert.equal(h.sources.length,1);
});
test('returning from page cache restores song choice instead of an inactive play screen',async()=>{
 const h=harness();await h.click('start');h.window.emit('pagehide');h.window.emit('pageshow');
 assert.equal(h.elements.get('menu').hidden,false);assert.equal(h.elements.get('play').hidden,true);assert.ok(h.sources[0].stopped);
});

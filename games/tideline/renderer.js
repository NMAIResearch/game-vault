/* Purpose: dependency-free canvas projection of the suspended surf course. */
(function(root){
  'use strict';
  const {heightAt,TUNE}=root.Surf;
  const hex=(colour)=>colour.match(/[a-f\d]{2}/gi).map(n=>parseInt(n,16));
  class Renderer {
    constructor(canvas) { this.canvas=canvas;this.ctx=canvas.getContext('2d');this.stage=null;this.faces=[]; }
    resize() {
      const scale=Math.min(root.devicePixelRatio||1,1.5);
      const w=Math.round(this.canvas.clientWidth*scale),h=Math.round(this.canvas.clientHeight*scale);
      if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
      this.w=w;this.h=h;this.focal=w/(2*Math.tan(94*Math.PI/360));
    }
    build(stage) {
      this.stage=stage;this.faces=[];
      const face=(points,colour,edge=null)=>this.faces.push({points,colour,edge});
      const line=(a,b,colour)=>this.faces.push({points:[a,b],colour,line:true});
      const p=(x,y,z)=>({x,y,z});
      for(const s of stage.surfaces) {
        const at=(x,z,offset=0)=>p(x,heightAt(s,x,z)+offset,z);
        const top=[at(s.x0,s.z0),at(s.x1,s.z0),at(s.x1,s.z1),at(s.x0,s.z1)];
        for(let z=s.z0;z<s.z1;z+=4) {
          const end=Math.min(s.z1,z+4);
          for(let x=s.x0;x<s.x1;x+=4) {
            const right=Math.min(s.x1,x+4);
            face([at(x,z),at(right,z),at(right,end),at(x,end)],
              s.kind==='ramp'?'#173e50':s.kind==='finish'?'#485256':'#183543');
          }
        }
        for(let i=0;i<4;i++) {
          const a=top[i],b=top[(i+1)%4];
          const pieces=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z)/4);
          for(let part=0;part<pieces;part++) {
            const along=t=>p(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,a.z+(b.z-a.z)*t);
            const c=along(part/pieces),d=along((part+1)/pieces);
            face([c,d,p(d.x,d.y-1.2,d.z),p(c.x,c.y-1.2,c.z)],'#0f2536');
            line({...c,y:c.y+0.03},{...d,y:d.y+0.03},s.kind==='finish'?'#ffcf88':stage.colour);
          }
        }
        for(let z=s.z0+4;z<s.z1;z+=5) line(at(s.x0,z,.025),at(s.x1,z,.025),'#315e70');
        if(s.kind==='ramp') {
          for(let x=s.x0+4;x<s.x1;x+=4)line(at(x,s.z0,.026),at(x,s.z1,.026),'#204858');
          const mid=(s.x0+s.x1)/2;
          for(let z=s.z0+10;z<s.z1-3;z+=17) {
            line(at(mid-1,z-1,.04),at(mid,z+1,.04),stage.colour);
            line(at(mid,z+1,.04),at(mid+1,z-1,.04),stage.colour);
          }
        }
      }
      // The gap lip is visible from either ramp side.
      if(stage.gap) {
        const s=stage.surfaces[1];
        for(let z=49;z<=51;z++)line(p(s.x0,heightAt(s,s.x0,z)+.05,z),p(s.x1,heightAt(s,s.x1,z)+.05,z),'#ffcf88');
      }
      // Wide finish portal and a quiet field of distant architectural columns.
      const gateY=stage.surfaces[3].base;
      for(const z of [118,120]) {
        line(p(-21,gateY,z),p(-21,gateY+12,z),'#ffcf88');
        line(p(21,gateY,z),p(21,gateY+12,z),'#ffcf88');
        line(p(-21,gateY+12,z),p(21,gateY+12,z),'#ffcf88');
      }
      for(let i=0;i<18;i++) {
        const x=(i%2?1:-1)*(32+(i*13)%37),z=-15+i*13,y=-11+(i*7)%31;
        face([p(x,-22,z),p(x+2,-22,z),p(x+2,y,z),p(x,y,z)],'#183042');
        line(p(x,y,z),p(x+2,y,z),'#496273');
      }
      for(let x=-180;x<=180;x+=18)line(p(x,-23,-60),p(x,-23,300),'#183e51');
      for(let z=-60;z<=300;z+=18)line(p(-180,-23,z),p(180,-23,z),'#183e51');
    }
    camera(point,player) {
      const dx=point.x-player.pos.x,dy=point.y-player.pos.y-TUNE.eye,dz=point.z-player.pos.z;
      const sy=Math.sin(player.yaw),cy=Math.cos(player.yaw),sp=Math.sin(player.pitch),cp=Math.cos(player.pitch);
      const x=dx*cy-dz*sy,z=dx*sy+dz*cy;
      return {x,y:dy*cp-z*sp,z:dy*sp+z*cp};
    }
    project(p) {return {x:this.w/2+p.x*this.focal/p.z,y:this.h/2-p.y*this.focal/p.z};}
    nearClip(points,isLine) {
      const near=.12,result=[];
      if(isLine) {
        let [a,b]=points;
        if(a.z<near&&b.z<near)return [];
        const cut=(a,b)=>{const t=(near-a.z)/(b.z-a.z);return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:near};};
        if(a.z<near)a=cut(a,b);else if(b.z<near)b=cut(b,a);
        return [a,b];
      }
      for(let i=0;i<points.length;i++) {
        const a=points[i],b=points[(i+1)%points.length],inside=a.z>=near;
        if(inside)result.push(a);
        if(inside!==(b.z>=near)) {
          const t=(near-a.z)/(b.z-a.z);result.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:near});
        }
      }
      return result;
    }
    render(player,stage,time=0) {
      if(!this.ctx)return;
      if(stage!==this.stage)this.build(stage);
      this.resize();const ctx=this.ctx,w=this.w,h=this.h;
      const sky=ctx.createLinearGradient(0,0,0,h);
      sky.addColorStop(0,'#081021');sky.addColorStop(.52,'#193d50');sky.addColorStop(1,'#071a2c');
      ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
      const sunCamera=this.camera({x:90,y:36,z:400},player),sun=this.project(sunCamera);
      if(sunCamera.z>1 && Number.isFinite(sun.x)&&Number.isFinite(sun.y)) {
        const glow=ctx.createRadialGradient(sun.x,sun.y,3,sun.x,sun.y,w*.3);
        glow.addColorStop(0,'#78919155');glow.addColorStop(1,'#78919100');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
        ctx.strokeStyle='#a1b7ad66';ctx.lineWidth=1;
        ctx.beginPath();ctx.arc(sun.x,sun.y,w*.07,0,Math.PI*2);ctx.stroke();
        ctx.beginPath();ctx.arc(sun.x,sun.y,w*.079,0,Math.PI*2);ctx.stroke();
      }
      ctx.fillStyle='#a2c3d080';
      for(let i=0;i<65;i++){
        const x=((i*137.51-player.yaw*110)%(w+20)+w+20)%(w+20);
        const y=(i*i*17.13)%(h*.44)+player.pitch*h*.3;
        ctx.fillRect(x,y,i%5===0?2:1,1);
      }
      const draw=[];
      for(const f of this.faces) {
        const camera=f.points.map(p=>this.camera(p,player));
        const points=this.nearClip(camera,f.line);
        if(points.length<(f.line?2:3))continue;
        const depth=points.reduce((a,p)=>a+p.z,0)/points.length;
        draw.push({...f,points:points.map(p=>this.project(p)),depth});
      }
      draw.sort((a,b)=>b.depth-a.depth);
      for(const f of draw) {
        const rgb=hex(f.colour),fog=Math.min(.83,Math.max(0,(f.depth-25)/280));
        const c=rgb.map((v,i)=>Math.round(v*(1-fog)+[15,34,49][i]*fog));
        ctx.beginPath();f.points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
        if(f.line){ctx.strokeStyle=`rgb(${c})`;ctx.lineWidth=Math.min(2,w/800);ctx.stroke();}
        else {ctx.closePath();ctx.fillStyle=`rgb(${c})`;ctx.fill();}
      }
      const label=(text,point,colour)=>{
        const c=this.camera(point,player);if(c.z<2)return;
        const p=this.project(c);ctx.font=`600 ${Math.max(11,Math.min(21,400/c.z))*Math.min(1.5,w/1100)}px system-ui`;
        ctx.textAlign='center';ctx.fillStyle=colour;ctx.fillText(text,p.x,p.y);
      };
      label('FINISH GATE',{x:0,y:13,z:119},'#ffdda7');
      label(stage.side>0?'D  →  INTO THE RAMP':'INTO THE RAMP  ←  A',
        {x:-stage.side*7,y:32-stage.side*7*stage.side*1.35-.17*20+4,z:20},stage.colour);
      if(stage.gap>=10)label('SPACE  /  CLEAR THE GAP',{x:-stage.side*6,y:22,z:48},'#ffdda7');
      // Restrained vignette keeps the course centre readable.
      const shade=ctx.createRadialGradient(w/2,h/2,h*.22,w/2,h/2,w*.7);
      shade.addColorStop(0,'#00000000');shade.addColorStop(1,'#02071499');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
    }
  }
  root.SurfRenderer=Renderer;
})(globalThis);

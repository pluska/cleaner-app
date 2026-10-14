"use client";
import { useEffect, useRef, useState } from "react";
import { Application, Assets, Container, Graphics, Sprite, Text } from "pixi.js";
import { BUILDINGS } from "@/libs/kingdom-rules";
import type { KingdomBuilding } from "@/services/kingdomService";

type Props = { buildings: KingdomBuilding[]; selected: string | null; editing: boolean; zoom: number; onSelect: (id: string) => void; onMove: (x: number,y: number) => void };
export default function KingdomCanvas(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef(props);
  live.current = props;
  const worldRef = useRef<Container | null>(null);
  const redraw = useRef<(() => void) | null>(null);
  const [error,setError] = useState(false);
  useEffect(() => {
    if (!host.current) return;
    const element=host.current;
    const app=new Application();
    let disposed=false;
    let ready=false;
    let observer: ResizeObserver | undefined;
    const init=async()=> {
      await app.init({resizeTo:element,background:0xc4dfd2,antialias:true,resolution:Math.min(devicePixelRatio,2),autoDensity:true});
      ready=true;
      if(disposed){app.destroy(true,{children:true});return;}
      element.appendChild(app.canvas);
      const world=new Container();
      const terrain=new Container();
      const structures=new Container();
      world.addChild(terrain,structures);
      app.stage.addChild(world);
      worldRef.current=world;
      const iso=(x:number,y:number)=>({x:(x-y)*42,y:(x+y)*21});
      for(let y=0;y<12;y++)for(let x=0;x<12;x++) {
        const p=iso(x,y);
        const road=x===6||y===6;
        const tile=new Graphics().poly([0,0,42,21,0,42,-42,21]).fill(road?0xd4caa5:(x+y)%2?0x79ae75:0x83b87d).stroke({color:0x5f9669,width:.5});
        tile.position.set(p.x,p.y);
        tile.eventMode="static";
        tile.on("pointertap",()=>{if(live.current.editing)live.current.onMove(x,y);});
        terrain.addChild(tile);
      }
      const border=new Graphics().poly([-42,21,0,0,504,252,0,504,-504,252,-42,21]).stroke({color:0x49775b,width:5});
      terrain.addChildAt(border,0);
      const textures=await Promise.all(BUILDINGS.map(b=>Assets.load(b.asset)));
      if(disposed)return;
      redraw.current=()=> {
        structures.removeChildren().forEach(c=>c.destroy());
        [...live.current.buildings].sort((a,b)=>(a.x+a.y)-(b.x+b.y)).forEach(b=> {
          const index=BUILDINGS.findIndex(d=>d.kind===b.kind);
          const p=iso(b.x,b.y);
          const group=new Container();
          group.position.set(p.x,p.y+30);
          group.eventMode="static";
          group.cursor="pointer";
          group.on("pointertap",(e)=>{e.stopPropagation();live.current.onSelect(b.id);});
          const ring=new Graphics().ellipse(0,0,58,26).fill({color:b.id===live.current.selected?0xffed8b:0x2f6046,alpha:b.id===live.current.selected?.85:.2});
          group.addChild(ring);
          const sprite=new Sprite(textures[Math.max(0,index)]);
          sprite.anchor.set(.5,.92);
          const height=b.kind==="WELL"?130:205;
          sprite.height=height+(b.level-1)*12;
          sprite.width=sprite.height;
          if(b.corruption>0)sprite.tint=b.corruption>50?0xa0a48f:0xd2d4bd;
          group.addChild(sprite);
          if(b.level>1) group.addChild(new Graphics().star(44,-90,5,10,5).fill(b.level===3?0xffd45d:0xe6f1ef));
          const title=new Text({text:`${BUILDINGS[Math.max(0,index)].name} · ${b.level}`,style:{fontFamily:"sans-serif",fontSize:12,fill:0xffffff,stroke:{color:0x244636,width:4}}});
          title.anchor.set(.5,0);title.position.set(0,18);group.addChild(title);
          if(b.corruption>0){const dust=new Text({text:`${b.corruption}%`,style:{fontSize:12,fill:0xffffff,stroke:{color:0x244636,width:4},fontWeight:"bold"}});dust.position.set(25,-45);group.addChild(dust);}
          structures.addChild(group);
        });
      };
      redraw.current();
      const fit=()=>{
        const scale=Math.min(element.clientWidth/1050,element.clientHeight/760)*live.current.zoom;
        world.scale.set(scale);
        world.position.set(element.clientWidth/2,(element.clientHeight-504*scale)/2);
      };
      fit();observer=new ResizeObserver(fit);observer.observe(element);
      let drag:{x:number;y:number;wx:number;wy:number}|null=null;
      const down=(e:PointerEvent)=>{if(!live.current.editing)drag={x:e.clientX,y:e.clientY,wx:world.x,wy:world.y};};
      const move=(e:PointerEvent)=>{if(drag && Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8)world.position.set(drag.wx+e.clientX-drag.x,drag.wy+e.clientY-drag.y);};
      const up=()=>{drag=null;};
      app.canvas.addEventListener("pointerdown",down);app.canvas.addEventListener("pointermove",move);app.canvas.addEventListener("pointerup",up);app.canvas.addEventListener("pointercancel",up);app.canvas.addEventListener("pointerleave",up);
      const wheel=(e:WheelEvent)=>{e.preventDefault();world.scale.set(Math.max(.3,Math.min(1.6,world.scale.x*(e.deltaY>0?.9:1.1))));};
      app.canvas.addEventListener("wheel",wheel,{passive:false});
      app.ticker.maxFPS=30;
    };
    init().catch(()=>{if(!disposed)setError(true);});
    return ()=>{disposed=true;observer?.disconnect();redraw.current=null;worldRef.current=null;if(ready)app.destroy(true,{children:true});};
  },[]);
  useEffect(()=>{redraw.current?.();},[props.buildings,props.selected]);
  useEffect(()=>{const w=worldRef.current;if(w&&host.current)w.scale.set(Math.min(host.current.clientWidth/1050,host.current.clientHeight/760)*props.zoom);},[props.zoom]);
  return <div ref={host} className="kingdom-canvas" aria-label="Aldea medieval interactiva">{error&&<p role="alert">No se pudo cargar la aldea. Tus edificios siguen disponibles en la lista.</p>}</div>;
}

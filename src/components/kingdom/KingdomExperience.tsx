"use client";
import { useDialog } from "@/hooks/useDialog";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/layout/BrandLogo";
import { Check, Coins, Crown, CalendarDays, Moon, Move, Plus, Minus, Save, RotateCcw, ShoppingBag, Sparkles, ArrowUp, Clock, RefreshCw } from "lucide-react";
import { BUILDINGS, validPositions } from "@/libs/kingdom-rules";
import type { KingdomBuilding } from "@/services/kingdomService";
const Canvas=dynamic(()=>import("./KingdomCanvas"),{ssr:false});
type Kingdom={version:number;today:string;buildings:KingdomBuilding[];profile:{coins:number;xp:number;level:number;resting:number;timezone:string};campaign:{completed:number;total:number};weekly:{completed:number;target:number;unlocked:boolean};links:{roomId:string;buildingId:string}[]};
type Mission={id:string;title:string;description?:string;roomId:string;room:string;duration:number;completed:boolean;subtasks?:{id:string;title:string}[]};
const chapters=["Una chispa en la torre","Agua clara","La mesa del viajero","Un lugar para descansar","Abre las puertas","El reino despierta","Guardián del hogar"];
export default function KingdomExperience(){
  const [data,setData]=useState<Kingdom|null>(null);
  const [tasks,setTasks]=useState<Mission[]>([]);
  const [selected,setSelected]=useState<string|null>(null);
  const [editing,setEditing]=useState(false);
  const [positions,setPositions]=useState<KingdomBuilding[]>([]);
  const [zoom,setZoom]=useState(1);
  const [minutes,setMinutes]=useState(20);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [active,setActive]=useState<Mission|null>(null);
  const dialog = useDialog(!!active, () => {if (!busy) setActive(null);});
  const load=useCallback(async()=>{
    const res=await fetch("/api/kingdom");
    if(!res.ok)throw new Error("No pudimos cargar tu reino. Intenta de nuevo.");
    const next:Kingdom=await res.json();
    setData(next);setPositions(next.buildings);
    const tasksRes=await fetch(`/api/tasks?date=${next.today}`);
    if(!tasksRes.ok)throw new Error("No pudimos cargar las misiones.");
    setTasks((await tasksRes.json()).tasks);
  },[]);
  useEffect(()=>{load().catch(e=>setError(e.message));},[load]);
  const action=async(fn:()=>Promise<void>)=>{if(busy)return;setBusy(true);setError("");try{await fn();}catch(e){setError(e instanceof Error?e.message:"Algo salió mal. Puedes reintentar.");}finally{setBusy(false);}};
  const patch=async(body:unknown)=>{const res=await fetch("/api/kingdom",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});if(!res.ok)throw new Error("No se pudo guardar el cambio.");await load();};
  const finish=(task:Mission)=>action(async()=>{
    const res=await fetch(`/api/tasks/${task.id}/complete`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({dueDate:data?.today})});
    const result=await res.json();if(!res.ok)throw new Error(result.error);
    setMessage(`Misión completada · +${result.rewards.expEarned} XP · +${result.rewards.coinsEarned} monedas`);setActive(null);await load();
  });
  const save=()=>action(async()=>{
    const res=await fetch("/api/kingdom",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({version:data?.version,positions:positions.map(({id,x,y})=>({id,x,y}))})});
    if(!res.ok)throw new Error(res.status===409?"Tu aldea cambió en otra sesión. Recarga antes de guardar.":"No se pudo guardar la aldea.");
    setEditing(false);setMessage("Aldea guardada");await load();
  });
  const move=useCallback((x:number,y:number)=>{if(!selected)return;setPositions(prev=>{const next=prev.map(b=>b.id===selected?{...b,x,y}:b);return validPositions(next)?next:prev;});},[selected]);
  const nudge = (dx:number,dy:number) => {
    const building=positions.find(b=>b.id===selected);
    if(building) move(building.x+dx,building.y+dy);
  };
  const current=(editing?positions:data?.buildings)?.find(b=>b.id===selected);
  const missions=tasks.filter(t=>!t.completed&&t.duration<=minutes&&(!selected||data?.links.some(l=>l.roomId===t.roomId&&l.buildingId===selected))).slice(0,3);
  return <main className="kingdom-shell">
    <header className="kingdom-header"><div className="kingdom-brand"><BrandLogo href="/kingdom" priority/><small>Tu reino, un reto a la vez</small></div><div className="kingdom-wallet"><span><Sparkles size={17}/>{data?.profile.xp??0} XP</span><span><Coins size={17}/>{data?.profile.coins??0}</span><strong>Nv. {data?.profile.level??1}</strong></div></header>
    <section className="kingdom-world">
      <Canvas buildings={editing?positions:data?.buildings??[]} selected={selected} editing={editing} zoom={zoom} onSelect={setSelected} onMove={move}/>
      <div className="kingdom-caption"><span>VALLE DE LA AURORA</span><h1>Un hogar que florece.</h1><p>{data?.profile.resting?"El reino descansa contigo.":"Hoy, una pequeña misión puede cambiarlo todo."}</p></div>
      <div className="kingdom-tools"><button title="Acercar" aria-label="Acercar" onClick={()=>setZoom(z=>Math.min(2,z+.2))}><Plus/></button><button title="Alejar" aria-label="Alejar" onClick={()=>setZoom(z=>Math.max(.5,z-.2))}><Minus/></button><button title="Mover edificios" aria-label="Mover edificios" aria-pressed={editing} disabled={busy||!data} onClick={()=>{setEditing(!editing);setPositions(data?.buildings??[]);}}><Move/></button>{editing&&<><button title="Guardar aldea" aria-label="Guardar aldea" disabled={busy} onClick={save}><Save/></button><button title="Cancelar" aria-label="Cancelar" onClick={()=>{setEditing(false);setPositions(data?.buildings??[]);}}><RotateCcw/></button></>}</div>
      <nav className="kingdom-nav" aria-label="Navegación principal"><Link href="/kingdom" aria-current="page"><Crown/>Reino</Link><Link href="/dashboard"><CalendarDays/>Agenda</Link><Link href="/store"><ShoppingBag/>Tienda</Link><button disabled={busy||!data||editing} aria-pressed={!!data?.profile.resting} onClick={()=>action(()=>patch({resting:!data?.profile.resting}))}><Moon/>Descanso</button></nav>
    </section>
    <aside className="kingdom-panel">
      <div className="kingdom-guide"><Image unoptimized src="/sparklin/sparklin-avatar.webp" alt="Sparklin" width="64" height="64"/><div><small>SPARKLIN TE ACOMPAÑA</small><h2>{chapters[Math.min(6,data?.campaign.completed??0)]}</h2><p>Capítulo {Math.min(7,(data?.campaign.completed??0)+1)} de 7</p></div></div>
      <progress aria-label="Campaña" value={data?.campaign.completed??0} max="7"/>
      {error&&<div className="kingdom-error" role="alert">{error}<button onClick={()=>action(load)}><RefreshCw size={16}/>Reintentar</button></div>}
      {message&&<p className="kingdom-success" role="status">{message}</p>}
      <div className="kingdom-section-title"><h2>{current?BUILDINGS.find(b=>b.kind===current.kind)?.name:"Misiones de hoy"}</h2>{selected&&<button onClick={()=>setSelected(null)}>Ver todas</button>}</div>
      <div className="kingdom-segments" aria-label="Tiempo disponible">{[5,10,20].map(n=><button key={n} aria-pressed={minutes===n} onClick={()=>setMinutes(n)}>{n} min</button>)}</div>
      {!data&&!error&&<p role="status">Tu aldea está despertando...</p>}
      {data&&missions.length===0&&<div className="kingdom-empty"><Check/><p>{tasks.length?"Sin misiones pendientes para esta selección.":"Prepara tus primeras misiones."}</p>{tasks.length===0&&<Link href="/onboarding">Preparar mi hogar</Link>}<button onClick={()=>{setSelected(null);setMinutes(20);}}>Ver otras misiones</button></div>}
      {editing && <p className="kingdom-edit-help">Selecciona un edificio y toca una casilla libre, o usa los controles de posición. Guarda la aldea al terminar.</p>}
      <div className="kingdom-missions">{missions.map(t=><article key={t.id}><span className="mission-time"><Clock size={13}/>{t.duration} min · {t.room}</span><h3>{t.title}</h3><p>{t.description}</p><button disabled={busy||editing} onClick={()=>setActive(t)}>Comenzar misión <Sparkles size={15}/></button></article>)}</div>
      {editing&&current&&<div className="kingdom-position" role="group" aria-label="Posición del edificio"><span>X: {current.x} · Y: {current.y}</span><button aria-label="Retroceder X" onClick={()=>nudge(-1,0)}>X −</button><button aria-label="Avanzar X" onClick={()=>nudge(1,0)}>X +</button><button aria-label="Retroceder Y" onClick={()=>nudge(0,-1)}>Y −</button><button aria-label="Avanzar Y" onClick={()=>nudge(0,1)}>Y +</button></div>}
      {current&&<section className="kingdom-upgrade"><h3>Nivel {current.level} · {current.corruption?`${current.corruption}% por restaurar`:"Restaurado"}</h3><button disabled={busy||editing||current.level>=3} onClick={()=>action(async()=>{const res=await fetch("/api/kingdom/upgrade",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({buildingId:current.id,level:current.level})});const result=await res.json();if(!res.ok)throw new Error(result.error);await load();})}><ArrowUp size={17}/>{current.level>=3?"Nivel máximo":`Mejorar · ${current.level*4} monedas`}</button></section>}
      <section className="kingdom-week"><div><Crown/><strong>El guardián de la semana</strong><span>{Math.min(5,data?.weekly.completed??0)}/5</span></div><progress value={Math.min(5,data?.weekly.completed??0)} max="5" aria-label="Reto semanal"/><p>{data?.weekly.unlocked?"Estandarte semanal desbloqueado":"Completa 5 misiones y gana tu estandarte."}</p></section>
      <details className="kingdom-buildings"><summary>Edificios y habitaciones</summary>{data?.buildings.map(b=><button key={b.id} onClick={()=>setSelected(b.id)}>{BUILDINGS.find(d=>d.kind===b.kind)?.name}<span>Nv. {b.level}</span></button>)}</details>
    </aside>
    {active&&<div className="mission-backdrop"><div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="mission-title" className="mission-dialog"><span className="mission-time"><Clock size={16}/>{active.duration} minutos</span><h2 id="mission-title">{active.title}</h2><p>{active.description}</p>{active.subtasks?.length?<ul>{active.subtasks.map(s=><li key={s.id}>{s.title}</li>)}</ul>:<p>Elige una superficie, despeja lo necesario y limpia siguiendo las indicaciones del producto.</p>}<button disabled={busy} onClick={()=>finish(active)}><Check size={18}/>{busy?"Guardando...":"Ya terminé"}</button><button disabled={busy} onClick={()=>setActive(null)}>Volver al reino</button></div></div>}
  </main>;
}

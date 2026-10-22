"use client";

import { useEffect,useRef,useState,type FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useHouseholds } from '@/contexts/HouseholdContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { householdApi,householdError } from '@/libs/household-client';
import type { SharedOccurrence,WorkBoard,WorkMember,WorkProposal } from '@/types/shared-work';
import { Button } from '@/components/ui/forms/Button';
import { Input } from '@/components/ui/forms/Input';
import { Select } from '@/components/ui/forms/Select';
import { Card } from '@/components/ui/layout/Card';

type Say=(es:string,en:string)=>string;
type Change=(body:Record<string,unknown>)=>Promise<boolean>;
const days=[['Dom','Sun'],['Lun','Mon'],['Mar','Tue'],['Mié','Wed'],['Jue','Thu'],['Vie','Fri'],['Sáb','Sat']];
function Availability({me,change,say,busy}:{me:WorkMember;change:Change;say:Say;busy:boolean}){
  const [mask,setMask]=useState(me.days),[minutes,setMinutes]=useState(me.dailyMinutes),[resting,setResting]=useState(!!me.resting);
  return <Card className="household-panel"><h2>{say('Tu disponibilidad','Your availability')}</h2><p>{say('Organizamos el esfuerzo, sin competir.','We organize the effort without competing.')}</p>
    <form className="households-stack" onSubmit={e=>{e.preventDefault();void change({action:'availability',days:mask,dailyMinutes:minutes,resting});}}>
      <fieldset className="shared-days"><legend>{say('Días disponibles','Available days')}</legend>{[1,2,3,4,5,6,0].map(d=><label key={d}><input type="checkbox" checked={!!(mask&(1<<d))} onChange={e=>setMask(v=>e.target.checked?v|(1<<d):v&~(1<<d))}/>{say(days[d][0],days[d][1])}</label>)}</fieldset>
      <Input type="number" label={say('Tiempo por día (minutos)','Time per day (minutes)')} min={0} max={240} required value={minutes} onChange={e=>setMinutes(Number(e.target.value))}/>
      <label className="shared-checkbox"><input type="checkbox" checked={resting} onChange={e=>setResting(e.target.checked)}/>{say('Activar descanso','Activate rest')}</label>
      <p className="household-help">{say('Este presupuesto corresponde a este hogar. Cero minutos o descanso te excluye del reparto automático.','This budget is for this household. Zero minutes or rest excludes you from automatic allocation.')}</p>
      <Button type="submit" disabled={busy}>{say('Guardar disponibilidad','Save availability')}</Button>
    </form>
  </Card>;
}
function SharedTaskCard({task,board,userId,change,say,busy}:{task:SharedOccurrence;board:WorkBoard;userId:string;change:Change;say:Say;busy:boolean}){
  const [target,setTarget]=useState(''),[confirmArchive,setConfirmArchive]=useState(false);
  const owner=board.role==='owner',mine=task.assigneeId===userId,pending=board.requests.some(r=>r.taskId===task.taskId&&r.dueDate===task.dueDate);
  return <Card className="household-panel shared-task">
    <article data-shared-task={task.taskId} data-due-date={task.dueDate}>
      <h3>{task.title}</h3><p>{task.room} · {task.minutes} min · {task.dueDate}</p>
      {task.description&&<p>{task.description}</p>}
      <p className="shared-task-owner">{task.completedAt?`${say('Completada por','Completed by')} ${task.completedName??say('Camarada','Member')}`:board.members.find(m=>m.userId===task.assigneeId)?.name??say('Sin asignar','Unassigned')}</p>
      {task.completedAt?<span className="shared-badge">{say('Misión completada','Task completed')} ✓</span>:<div className="households-stack">
        {owner&&<Select label={say('Responsable','Assignee')} value={task.assigneeId??''} disabled={busy} onChange={e=>void change({action:'assign',taskId:task.taskId,dueDate:task.dueDate,assigneeId:e.target.value||null})}><option value="">{say('Sin asignar','Unassigned')}</option>{board.members.map(m=><option key={m.userId} value={m.userId}>{m.name}</option>)}</Select>}
        {!task.assigneeId&&<Button variant="secondary" disabled={busy} onClick={()=>void change({action:'assign',taskId:task.taskId,dueDate:task.dueDate,claim:true})}>{say('Puedo ayudar','I can help')}</Button>}
        {(mine||!task.assigneeId)&&task.dueDate<=board.today&&<Button disabled={busy} onClick={()=>void change({action:'complete',taskId:task.taskId,dueDate:task.dueDate})}>{say('Ya terminé','I have finished')}</Button>}
        {mine&&board.members.length>1&&!pending&&<form className="households-stack" onSubmit={e=>{e.preventDefault();void change({action:'handoff',taskId:task.taskId,dueDate:task.dueDate,toUserId:target});}}>
          <Select label={say('Pedir ayuda a','Ask for help from')} value={target} onChange={e=>setTarget(e.target.value)} required disabled={busy}><option value="">{say('Elegir camarada','Choose member')}</option>{board.members.filter(m=>m.userId!==userId).map(m=><option key={m.userId} value={m.userId}>{m.name}</option>)}</Select>
          <Button type="submit" variant="secondary" disabled={busy||!target}>{say('Proponer cambio','Propose handoff')}</Button>
        </form>}
        {pending&&<p className="household-help">{say('Solicitud pendiente de respuesta.','Request awaiting a response.')}</p>}
      </div>}
        {owner&&(confirmArchive?<div className="household-note"><p>{say('Se cancelan las próximas ocurrencias. El historial completado se conserva.','Future occurrences will be cancelled. Completed history is kept.')}</p><Button disabled={busy} onClick={()=>void change({action:'archive',taskId:task.taskId})}>{say('Confirmar archivo','Confirm archive')}</Button><Button variant="ghost" onClick={()=>setConfirmArchive(false)}>{say('Cancelar','Cancel')}</Button></div>:<Button variant="ghost" disabled={busy} onClick={()=>setConfirmArchive(true)}>{say('Archivar tarea','Archive task')}</Button>)}
    </article>
  </Card>;
}
function WorkCreation({board,change,say,busy}:{board:WorkBoard;change:Change;say:Say;busy:boolean}){
  const [roomName,setRoomName]=useState(''),[kind,setKind]=useState('general'),[title,setTitle]=useState(''),[description,setDescription]=useState(''),[roomId,setRoomId]=useState(board.rooms[0]?.id??''),[minutes,setMinutes]=useState(10),[frequency,setFrequency]=useState('once'),[startDate,setStartDate]=useState(board.today),[assigneeId,setAssignee]=useState('');
  return <>
    <Card className="household-panel"><h2>{say('Habitaciones del hogar','Household rooms')}</h2>
      {board.rooms.map(r=><p key={r.id}>{r.name}</p>)}
      <form className="households-stack" onSubmit={async e=>{e.preventDefault();if(await change({action:'room',name:roomName,kind}))setRoomName('');}}>
        <Input label={say('Nombre de habitación','Room name')} maxLength={80} required value={roomName} onChange={e=>setRoomName(e.target.value)}/>
        <Select label={say('Tipo de habitación','Room type')} value={kind} onChange={e=>setKind(e.target.value)}>{[['general','General','General'],['kitchen','Cocina','Kitchen'],['bathroom','Baño','Bathroom'],['bedroom','Habitación','Bedroom'],['living_room','Sala','Living room'],['laundry','Lavandería','Laundry']].map(([v,es,en])=><option key={v} value={v}>{say(es,en)}</option>)}</Select>
        <Button type="submit" variant="secondary" disabled={busy}>{say('Agregar habitación','Add room')}</Button>
      </form>
    </Card>
    {!!board.rooms.length&&<Card className="household-panel"><h2>{say('Agregar Tarea','Add Task')}</h2><form className="households-stack" onSubmit={async(e:FormEvent)=>{e.preventDefault();if(await change({action:'task',title,description,roomId:roomId||board.rooms[0]?.id,minutes,frequency,startDate,assigneeId:assigneeId||null})){setTitle('');setDescription('');}}}>
      <Input label={say('Título de la tarea','Task title')} required maxLength={200} value={title} onChange={e=>setTitle(e.target.value)}/>
      <Input label={say('Descripción','Description')} maxLength={2000} value={description} onChange={e=>setDescription(e.target.value)}/>
      <Select label={say('Habitación','Room')} value={roomId||board.rooms[0]?.id} onChange={e=>setRoomId(e.target.value)}>{board.rooms.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</Select>
      <Input type="number" label={say('Duración (minutos)','Duration (minutes)')} min={1} max={120} required value={minutes} onChange={e=>setMinutes(Number(e.target.value))}/>
      <Input type="date" label={say('Fecha de inicio','Start date')} required value={startDate} onChange={e=>setStartDate(e.target.value)}/>
      <Select label={say('Frecuencia','Frequency')} value={frequency} onChange={e=>setFrequency(e.target.value)}>{[['once','Una vez','Once'],['daily','Diaria','Daily'],['weekly','Semanal','Weekly'],['monthly','Mensual','Monthly'],['yearly','Anual','Yearly']].map(([v,es,en])=><option key={v} value={v}>{say(es,en)}</option>)}</Select>
      <Select label={say('Responsable inicial','Initial assignee')} value={assigneeId} onChange={e=>setAssignee(e.target.value)}><option value="">{say('Sin asignar','Unassigned')}</option>{board.members.map(m=><option key={m.userId} value={m.userId}>{m.name}</option>)}</Select>
      <Button type="submit" disabled={busy}>{say('Agregar Tarea','Add Task')}</Button>
    </form></Card>}
  </>;
}
export function SharedWorkPage(){
  const {activeHouseholdId,loading:householdsLoading}=useHouseholds(),{data:session}=useSession(),{language}=useLanguage(),es=language==='es',say:Say=(a,b)=>es?a:b;
  const [board,setBoard]=useState<WorkBoard|null>(null),[start,setStart]=useState(''),[version,setVersion]=useState(0),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState<unknown>(null),[notice,setNotice]=useState(''),[filter,setFilter]=useState('all'),[proposal,setProposal]=useState<WorkProposal|null>(null),[timezone,setTimezone]=useState('');
  const viewKey=`${activeHouseholdId}:${start}`;
  const lock=useRef(false),scope=useRef(viewKey);scope.current=viewKey;
  useEffect(()=>{
    const controller=new AbortController();setBoard(null);setProposal(null);setError(null);setNotice('');
    if(!activeHouseholdId){setLoading(false);return;}
    setLoading(true);
    householdApi<WorkBoard>(`/${activeHouseholdId}/work${start?`?start=${encodeURIComponent(start)}`:''}`,{signal:controller.signal})
      .then(result=>{if(!controller.signal.aborted){setBoard(result);setTimezone(result.timezone);}})
      .catch(e=>{if(!controller.signal.aborted)setError(e);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[activeHouseholdId,start,version]);
  async function change(body:Record<string,unknown>){
    if(!activeHouseholdId||lock.current)return false;const id=activeHouseholdId,key=viewKey;lock.current=true;setBusy(true);setError(null);setNotice('');
    try{
      const result=await householdApi<WorkProposal&{xp?:number;coins?:number}>(`/${id}/work`,{method:'POST',body:JSON.stringify(body)});
      if(scope.current!==key)return true;
      if(body.action==='preview')setProposal(result);
      else{
        setProposal(null);
        const next=await householdApi<WorkBoard>(`/${id}/work${start?`?start=${encodeURIComponent(start)}`:''}`);
        if(scope.current===key){setBoard(next);if(body.action==='complete')setNotice(`${say('Misión completada','Task completed')} · +${result.xp} XP · +${result.coins} ${say('monedas','coins')}`);else setNotice(say('Cambios guardados.','Changes saved.'));}
      }
      return true;
    }catch(e){if(scope.current===key)setError(e);return false;}finally{lock.current=false;setBusy(false);}
  }
  const me=board?.members.find(m=>m.userId===session?.user?.id),userId=session?.user?.id??'';
  const visible=board?.tasks.filter(t=>filter==='all'||t.assigneeId===userId)??[];
  return <div className="households-page shared-work-page"><header className="households-heading"><h1>{say('Agenda del hogar','Household schedule')}</h1><p>{board?`${board.name} · ${board.timezone}`:say('Planifiquen y avancen juntos.','Plan and make progress together.')}</p><Link href="/households" className="household-context-link">{say('Tus camaradas','Your camaradas')} →</Link></header>
    {error?<p role="alert" className="household-error">{householdError(error,es)}</p>:null}
    {notice&&<p role="status" className="household-notice">{notice}</p>}
    {(loading||householdsLoading)&&<p role="status">{say('Cargando…','Loading…')}</p>}
    {!activeHouseholdId&&!householdsLoading&&<Card className="household-panel"><p>{say('Crea un hogar o acepta una invitación para comenzar.','Create a household or accept an invitation to start.')}</p><Link className="household-context-link" href="/households">{say('Tus hogares','Your households')}</Link></Card>}
    {!!error&&<Button variant="secondary" onClick={()=>setVersion(v=>v+1)}>{say('Intentar de Nuevo','Try Again')}</Button>}
    {board&&<>
      <Card className="household-panel shared-work-summary"><strong>{board.resources} {board.resources===1?say('recurso común','shared resource'):say('recursos comunes','shared resources')}</strong><p>{board.tasks.filter(t=>t.completedAt).length} / {board.tasks.length} {say('misiones de esta semana completadas','tasks completed this week')}</p><p className="household-help">{say('Cada misión aporta 1 recurso al hogar. El XP y las monedas pertenecen a quien la completa.','Each task adds 1 household resource. XP and coins belong to the person who completes it.')}</p></Card>
      <div className="shared-work-controls"><Input type="date" label={say('Semana desde','Week starting')} value={board.start} disabled={busy} onChange={e=>{if(e.target.value)setStart(e.target.value);}}/><Select label={say('Vista','View')} value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">{say('Todo el hogar','Whole household')}</option><option value="mine">{say('Mis tareas','My tasks')}</option></Select></div>
      <div className="shared-work-columns">
        <section className="households-stack" aria-label={say('Misiones compartidas','Shared tasks')}>
          {board.requests.filter(r=>r.fromUserId===userId||r.toUserId===userId).map(r=><Card key={r.id} className="household-panel"><h2>{say('Solicitud de cambio','Handoff request')}</h2><p>{board.tasks.find(t=>t.taskId===r.taskId&&t.dueDate===r.dueDate)?.title} · {r.dueDate}</p><p>{board.members.find(m=>m.userId===r.fromUserId)?.name} → {board.members.find(m=>m.userId===r.toUserId)?.name}</p><div className="household-actions">{r.toUserId===userId?<><Button disabled={busy} onClick={()=>void change({action:'respond',requestId:r.id,response:'accepted'})}>{say('Aceptar cambio','Accept handoff')}</Button><Button variant="secondary" disabled={busy} onClick={()=>void change({action:'respond',requestId:r.id,response:'declined'})}>{say('Rechazar','Decline')}</Button></>:<Button variant="secondary" disabled={busy} onClick={()=>void change({action:'respond',requestId:r.id,response:'cancelled'})}>{say('Cancelar solicitud','Cancel request')}</Button>}</div></Card>)}
          {!visible.length&&<Card className="household-panel"><p>{say('Sin misiones pendientes para esta selección.','No tasks for this selection.')}</p></Card>}
          {visible.map(task=><SharedTaskCard key={`${task.taskId}:${task.dueDate}`} task={task} board={board} userId={userId} change={change} say={say} busy={busy}/>)}
        </section>
        <aside className="households-stack">
          {me&&<Availability key={`${board.householdId}:${me.days}:${me.dailyMinutes}:${me.resting}`} me={me} change={change} say={say} busy={busy}/>}
          {board.role==='owner'&&<>
            <Card className="household-panel"><h2>{say('Una semana equilibrada','A balanced week')}</h2><p>{say('Propuesta basada en tiempo y disponibilidad.','Proposal based on time and availability.')}</p><p className="household-help">{say('Solo se reparten tareas sin asignar. Se respetan el descanso, los días y el presupuesto declarado.','Only unassigned tasks are allocated. Rest, available days and declared budgets are respected.')}</p><ul className="shared-capacity" aria-label={say('Disponibilidad del hogar','Household availability')}>{board.members.map(m=><li key={m.userId}><strong>{m.name}</strong><span>{m.resting?say('En descanso','Resting'):`${m.dailyMinutes} ${say('min/día','min/day')} · ${m.days.toString(2).replaceAll('0','').length} ${say('días','days')}`}</span></li>)}</ul><Button variant="secondary" disabled={busy} onClick={()=>void change({action:'preview',start:board.start})}>{say('Repartir la semana','Allocate the week')}</Button>
              {proposal&&<div className="households-stack"><div className="household-note"><strong>{say('Reparto flexible','Flexible allocation')}</strong><p>{say('El reparto no se publica hasta revisarlo. Cada camarada puede proponer ajustes.','Allocation is not published until reviewed. Each member can propose adjustments.')}</p></div>
                {proposal.assignments.map(a=><p key={`${a.taskId}:${a.dueDate}`}>{a.dueDate} · {board.tasks.find(t=>t.taskId===a.taskId)?.title} → {board.members.find(m=>m.userId===a.assigneeId)?.name}</p>)}
                <p>{proposal.unassigned} {say('tareas quedan sin asignar.','tasks remain unassigned.')}</p><Button disabled={busy||!proposal.assignments.length} onClick={()=>void change({...proposal,action:'publish'})}>{say('Publicar propuesta de reparto','Publish allocation proposal')}</Button>
              </div>}
            </Card>
            {!board.hasTasks&&<Card className="household-panel"><h2>{say('Zona horaria del hogar','Household timezone')}</h2><form className="households-stack" onSubmit={e=>{e.preventDefault();void change({action:'timezone',timezone});}}><Input label={say('Zona horaria','Timezone')} value={timezone} onChange={e=>setTimezone(e.target.value)} required/><Button disabled={busy} type="submit" variant="secondary">{say('Guardar zona horaria','Save timezone')}</Button></form><p className="household-help">{say('Defínela antes de crear tareas; después se conserva para mantener sus fechas.','Set this before creating tasks; it is then kept to preserve their dates.')}</p></Card>}
            <WorkCreation key={board.householdId} board={board} change={change} say={say} busy={busy}/>
          </>}
        </aside>
      </div>
    </>}
  </div>;
}

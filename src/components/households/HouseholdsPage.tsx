"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHouseholds } from '@/contexts/HouseholdContext';
import { householdApi, householdError } from '@/libs/household-client';
import type { HouseholdDetail } from '@/types/household';
import { Button } from '@/components/ui/forms/Button';
import { Input } from '@/components/ui/forms/Input';
import { Card } from '@/components/ui/layout/Card';

export function HouseholdsPage() {
  const {language}=useLanguage(),es=language==='es',say=(spanish:string,english:string)=>es?spanish:english;
  const {data:session}=useSession();
  const {households,activeHouseholdId,loading,error:contextError,refresh,select}=useHouseholds();
  const [detail,setDetail]=useState<HouseholdDetail|null>(null),[detailLoading,setDetailLoading]=useState(false);
  const [name,setName]=useState(''),[email,setEmail]=useState(''),[joinToken,setJoinToken]=useState('');
  const [inviteLink,setInviteLink]=useState(''),[copied,setCopied]=useState(false),[busy,setBusy]=useState(false);
  const [error,setError]=useState<unknown>(null),[notice,setNotice]=useState(''),[detailVersion,setDetailVersion]=useState(0);
  const [confirmation,setConfirmation]=useState<{kind:'remove'|'transfer'|'leave';id:string;name:string}|null>(null);
  const locked=useRef(false),detailRevision=useRef(0);
  const activeId=useRef(activeHouseholdId);activeId.current=activeHouseholdId;
  useEffect(()=>{
    const controller=new AbortController(),revision=++detailRevision.current;
    setDetail(null);setError(null);setInviteLink('');setCopied(false);setConfirmation(null);
    if(!activeHouseholdId){setDetailLoading(false);return ()=>controller.abort();}
    setDetailLoading(true);
    householdApi<HouseholdDetail>(`/${encodeURIComponent(activeHouseholdId)}`,{signal:controller.signal})
      .then(result=>{if(revision===detailRevision.current)setDetail(result);})
      .catch(e=>{if(!controller.signal.aborted&&revision===detailRevision.current)setError(e);})
      .finally(()=>{if(!controller.signal.aborted&&revision===detailRevision.current)setDetailLoading(false);});
    return ()=>controller.abort();
  },[activeHouseholdId,detailVersion]);
  const act=useCallback(async(action:()=>Promise<void>)=>{
    if(locked.current)return;
    locked.current=true;setBusy(true);setError(null);setNotice('');
    try{await action();}catch(e){setError(e);}finally{locked.current=false;setBusy(false);}
  },[]);
  async function create(event:FormEvent){event.preventDefault();await act(async()=>{
    await householdApi('',{method:'POST',body:JSON.stringify({name})});setName('');await refresh();
  });}
  async function invite(event:FormEvent){event.preventDefault();if(!detail)return;const id=detail.id;await act(async()=>{
    const result=await householdApi<{token:string}>(`/${id}/invitations`,{method:'POST',body:JSON.stringify({email})});
    const next=await householdApi<HouseholdDetail>(`/${id}`);
    if(activeId.current===id){setDetail(next);setInviteLink(`${window.location.origin}/households/join?token=${result.token}`);setCopied(false);setEmail('');}
  });}
  async function confirm(){if(!confirmation||!detail)return;const selected=confirmation,id=detail.id;await act(async()=>{
    if(selected.kind==='transfer')await householdApi(`/${id}`,{method:'PATCH',body:JSON.stringify({action:'transfer',memberId:selected.id})});
    else await householdApi(`/${id}/members/${encodeURIComponent(selected.id)}`,{method:'DELETE'});
    setConfirmation(null);setDetailVersion(v=>v+1);await refresh();
  });}
  const owner=detail?.role==='owner';
  return <div className="households-page">
    <header className="households-heading">
      <h1>{activeHouseholdId?say('Tus camaradas','Your camaradas'):say('Tus hogares','Your households')}</h1>
      <p>{activeHouseholdId?say('Un hogar, muchas formas de aportar.','One household, many ways to contribute.'):say('Tu avatar e inventario personal viajan contigo.','Your avatar and personal inventory travel with you.')}</p>
    </header>
    {(error||contextError)?<p role="alert" className="household-error">{householdError(error||contextError,es)}</p>:null}
    {notice&&<p role="status" className="household-notice">{notice}</p>}
    {(loading||detailLoading)&&<p role="status">{say('Cargando…','Loading…')}</p>}
    {!!contextError&&<Button variant="secondary" onClick={()=>void act(refresh)}>{say('Intentar de Nuevo','Try Again')}</Button>}
    <div className="households-columns">
      <section className="households-stack household-list-column" aria-label={say('Tus hogares','Your households')}>
        {households.map(home=><button key={home.id} type="button" className="household-choice" disabled={busy||loading} aria-pressed={activeHouseholdId===home.id} onClick={()=>void act(async()=>{await select(home.id);})}>
          <strong>{home.name}</strong>
          <span>{home.role==='owner'?say('Administrador','Owner'):say('Camarada','Member')} · {home.memberCount} {home.memberCount===1?say('camarada','member'):say('camaradas','members')}</span>
          <small>{activeHouseholdId===home.id?say('Hogar actual ✓','Current household ✓'):say('Cambiar hogar →','Switch household →')}</small>
        </button>)}
        {!loading&&!contextError&&!households.length&&<Card className="household-panel"><h2>{say('Puedes empezar solo','You can start on your own')}</h2><p>{say('Más adelante podrás invitar a otras personas o participar en otros hogares.','Later you can invite others or join other households.')}</p></Card>}
        <Card className="household-panel">
          <h2>{say('Crear otro hogar','Create another household')}</h2>
          <form onSubmit={create} className="households-stack">
            <Input label={say('Nombre del hogar','Household name')} value={name} onChange={e=>setName(e.target.value)} maxLength={80} required disabled={busy}/>
            <Button type="submit" disabled={busy||!name.trim()}>{say('Crear hogar','Create household')}</Button>
          </form>
        </Card>
        <Card className="household-panel">
          <h2>{say('Unirme con código','Join with a code')}</h2>
          <form className="households-stack" onSubmit={e=>{e.preventDefault();const token=joinToken.trim();if(!/^[a-f0-9]{64}$/.test(token)){setError(new Error('invitation_unavailable'));return;}window.location.assign(`/households/join?token=${encodeURIComponent(token)}`);}}>
            <Input label={say('Código de invitación','Invitation code')} value={joinToken} onChange={e=>setJoinToken(e.target.value)} maxLength={64} required/>
            <Button type="submit" variant="secondary">{say('Revisar invitación','Review invitation')}</Button>
          </form>
        </Card>
      </section>
      <section className="households-stack household-members-column" aria-label={say('Tus camaradas','Your camaradas')}>
        {detail&&<>
          <header className="households-heading household-detail-heading"><h2 className="households-title">{detail.name}</h2></header><Link href="/households/work" className="sc-button sc-button-primary household-link-button">{say('Agenda del hogar','Household schedule')} →</Link>
          {detail.members.map(member=><Card key={member.userId} className="household-member">
            <h3>{member.name} · {member.role==='owner'?say('Administrador','Owner'):say('Camarada','Member')}</h3>
            {session?.user?.id===member.userId&&<p>{say('Tu perfil','Your profile')}</p>}
            {owner&&member.role!=='owner'&&<div className="household-actions">
              <Button variant="secondary" disabled={busy} onClick={()=>setConfirmation({kind:'remove',id:member.userId,name:member.name})}>{say('Retirar camarada','Remove member')}</Button>
              <Button variant="ghost" disabled={busy} onClick={()=>setConfirmation({kind:'transfer',id:member.userId,name:member.name})}>{say('Transferir administración','Transfer ownership')}</Button>
            </div>}
          </Card>)}
          {!owner&&session?.user?.id&&<Button variant="secondary" disabled={busy} onClick={()=>setConfirmation({kind:'leave',id:session.user!.id!,name:detail.name})}>{say('Salir del hogar','Leave household')}</Button>}
          {confirmation&&<Card className="household-panel household-confirmation">
            <h3>{confirmation.kind==='transfer'?say('Transferir administración','Transfer ownership'):confirmation.kind==='leave'?say('Salir del hogar','Leave household'):say('Retirar camarada','Remove member')}</h3>
            <p>{confirmation.name}</p>
            <p>{confirmation.kind==='transfer'?say('Esta persona administrará el hogar y sus invitaciones. Tú continuarás como camarada.','This person will manage the household and invitations. You will remain a member.'):say('Se retirará el acceso a este hogar. El progreso personal se conserva.','Household access will be removed. Personal progress is kept.')}</p>
            <div className="household-actions"><Button disabled={busy} onClick={()=>void confirm()}>{say('Confirmar','Confirm')}</Button><Button variant="secondary" disabled={busy} onClick={()=>setConfirmation(null)}>{say('Cancelar','Cancel')}</Button></div>
          </Card>}
          {owner&&<Card className="household-panel">
            <h2>{say('Una aventura compartida','A shared adventure')}</h2>
            <p>{say('Invita a alguien con un enlace o código.','Invite someone with a link or code.')}</p>
            <form onSubmit={invite} className="households-stack">
              <Input type="email" label={say('Correo del camarada','Member email')} value={email} onChange={e=>setEmail(e.target.value)} maxLength={254} required disabled={busy}/>
              <Button type="submit" disabled={busy}>{say('Invitar camarada','Invite member')}</Button>
            </form>
            <div className="household-note"><strong>{say('Invitación válida durante 7 días','Invitation valid for 7 days')}</strong><p>{say('Compártela con la persona invitada. Solo su cuenta de correo puede aceptarla.','Share it with the invited person. Only their email account can accept it.')}</p></div>
            {inviteLink&&<div className="households-stack">
              <Input label={say('Enlace','Link')} value={inviteLink} readOnly onFocus={e=>e.target.select()}/>
              <Input label={say('Código de invitación','Invitation code')} value={new URL(inviteLink).searchParams.get('token')??''} readOnly onFocus={e=>e.target.select()}/>
              <Button variant="secondary" onClick={async()=>{try{await navigator.clipboard.writeText(inviteLink);setCopied(true);}catch{setNotice(say('Selecciona el enlace y cópialo manualmente.','Select the link and copy it manually.'));}}}>{copied?say('Invitación copiada','Invitation copied'):say('Copiar invitación','Copy invitation')}</Button>
              <p className="household-help">{say('El enlace se muestra una sola vez. Puedes cancelarlo y crear otro.','This link is shown once. You can cancel it and create another.')}</p>
            </div>}
          </Card>}
          {owner&&detail.invitations.length>0&&<Card className="household-panel"><h2>{say('Invitaciones','Invitations')}</h2>
            {detail.invitations.map(invitation=>{const pending=!invitation.revokedAt&&!invitation.acceptedAt&&invitation.expiresAt>Date.now();return <div key={invitation.id} className="household-invitation">
              <strong>{invitation.email}</strong><span>{invitation.revokedAt?say('Cancelada','Cancelled'):invitation.acceptedAt?say('Aceptada','Accepted'):pending?say('Pendiente','Pending'):say('Vencida','Expired')}</span>
              {pending&&<Button variant="secondary" disabled={busy} onClick={()=>void act(async()=>{await householdApi(`/${detail.id}/invitations/${invitation.id}`,{method:'DELETE'});setInviteLink('');setDetailVersion(v=>v+1);})}>{say('Cancelar invitación','Cancel invitation')}</Button>}
            </div>;})}
          </Card>}
          <p className="household-help">{say('La agenda del hogar reúne sus habitaciones y tareas compartidas. Cada misión da XP y monedas a quien la completa, y un recurso común al hogar.','The household schedule brings together shared rooms and tasks. Each task gives XP and coins to its contributor, and one shared household resource.')}</p>
        </>}
      </section>
    </div>
  </div>;
}

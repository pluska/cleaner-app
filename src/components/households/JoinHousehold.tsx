"use client";

import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHouseholds } from '@/contexts/HouseholdContext';
import { householdApi, householdError } from '@/libs/household-client';
import { Button } from '@/components/ui/forms/Button';
import { Card } from '@/components/ui/layout/Card';

interface InvitationPreview {householdId:string;name:string;expiresAt:number;accepted:boolean}
export function JoinHousehold(){
  const token=useSearchParams().get('token')??'',router=useRouter();
  const {status,data:session}=useSession(),{refresh}=useHouseholds();
  const {language}=useLanguage(),es=language==='es',say=(spanish:string,english:string)=>es?spanish:english;
  const [preview,setPreview]=useState<InvitationPreview|null>(null),[error,setError]=useState<unknown>(null),[busy,setBusy]=useState(false);
  const valid=/^[a-f0-9]{64}$/.test(token);
  const returnPath=`/households/join?token=${encodeURIComponent(token)}`;
  const loginPath=`/auth/login?callbackUrl=${encodeURIComponent(returnPath)}`;
  useEffect(()=>{
    setPreview(null);setError(null);
    if(!valid){setError(new Error('invitation_unavailable'));return;}
    if(status!=='authenticated')return;
    const controller=new AbortController();setBusy(true);
    householdApi<InvitationPreview>('/join',{method:'POST',body:JSON.stringify({token,preview:true}),signal:controller.signal})
      .then(setPreview).catch(e=>{if(!controller.signal.aborted)setError(e);}).finally(()=>{if(!controller.signal.aborted)setBusy(false);});
    return ()=>controller.abort();
  },[token,status,session?.user?.id,valid]);
  return <div className="households-page household-join">
    <header className="households-heading"><h1>{say('Una aventura compartida','A shared adventure')}</h1><p>{say('Revisa el hogar antes de unirte.','Review the household before joining.')}</p></header>
    {status==='loading'&&<p role="status">{say('Cargando…','Loading…')}</p>}
    {error?<p role="alert" className="household-error">{householdError(error,es)}</p>:null}
    {valid&&status==='unauthenticated'&&<Card className="household-panel"><p>{say('Inicia sesión o crea una cuenta con el correo que recibió la invitación.','Sign in or create an account with the email that received the invitation.')}</p><Link className="sc-button sc-button-primary household-link-button" href={loginPath}>{say('Iniciar Sesión','Sign In')}</Link></Card>}
    {status==='authenticated'&&<>
      <p className="household-help">{session?.user?.email}</p>
      {busy&&!preview&&<p role="status">{say('Cargando…','Loading…')}</p>}
      {preview&&<Card className="household-panel"><h2>{preview.name}</h2><p>{say('Entrarás como camarada adulto.','You will join as an adult member.')}</p><p>{say('Tu cuenta y progreso personal se conservan.','Your account and personal progress are kept.')}</p>
        <Button disabled={busy} onClick={async()=>{
          setBusy(true);setError(null);
          try{await householdApi('/join',{method:'POST',body:JSON.stringify({token})});await refresh();router.replace('/households');}
          catch(e){setError(e);setBusy(false);}
        }}>{preview.accepted?say('Abrir hogar','Open household'):say('Unirme al hogar','Join household')}</Button>
      </Card>}
      {error?<Button variant="secondary" disabled={busy} onClick={()=>void signOut({callbackUrl:loginPath})}>{say('Usar otra cuenta','Use another account')}</Button>:null}
    </>}
    <Link className="household-context-link" href="/households">{say('Tus hogares','Your households')}</Link>
  </div>;
}

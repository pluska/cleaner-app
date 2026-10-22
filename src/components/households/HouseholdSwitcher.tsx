"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useHouseholds } from '@/contexts/HouseholdContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { householdError } from '@/libs/household-client';

export function HouseholdSwitcher() {
  const {households,activeHouseholdId,select,loading,error:loadError}=useHouseholds();
  const {language}=useLanguage(),es=language==='es',router=useRouter();
  const [busy,setBusy]=useState(false),[error,setError]=useState<unknown>(null);
  if (!households.length) return <Link className="household-context-link" href="/households">{es?'Tus hogares':'Your households'}</Link>;
  return <div className="household-switcher">
    <select aria-label={es?'Hogar actual':'Current household'} value={activeHouseholdId??''} disabled={busy||loading} onChange={async e=>{
      setBusy(true);setError(null);
      try{await select(e.target.value);router.push('/households');}catch(e){setError(e);}finally{setBusy(false);}
    }}>{households.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}</select>
    {(error||loadError)?<p role="alert">{householdError(error||loadError,es)}</p>:null}
  </div>;
}

"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { emptyHouseholds, householdApi } from '@/libs/household-client';
import type { HouseholdList } from '@/types/household';

interface HouseholdContextValue extends HouseholdList {
  loading: boolean;
  error: unknown;
  refresh: () => Promise<void>;
  select: (id:string) => Promise<void>;
}
const Context=createContext<HouseholdContextValue | null>(null);
export function HouseholdProvider({children}:{children:ReactNode}) {
  const {status,data:session}=useSession();
  const [data,setData]=useState(emptyHouseholds),[loading,setLoading]=useState(true),[error,setError]=useState<unknown>(null);
  const revision=useRef(0);
  const refresh=useCallback(async()=>{
    const current=++revision.current;
    setLoading(true);setError(null);
    try {const next=await householdApi<HouseholdList>('');if(current===revision.current)setData(next);}
    catch(e){if(current===revision.current){setError(e);setData(emptyHouseholds);}throw e;}
    finally{if(current===revision.current)setLoading(false);}
  },[]);
  useEffect(()=>{
    if(status==='authenticated') void refresh().catch(()=>{});
    else if(status==='unauthenticated'){++revision.current;setData(emptyHouseholds);setLoading(false);setError(null);}
    // Invalidate in-flight refreshes on unmount or account changes.
    const invalidate=()=>{++revision.current;};
    return invalidate;
  },[status,session?.user?.id,refresh]);
  const select=useCallback(async(id:string)=>{
    await householdApi(`/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({action:'select'})});
    await refresh();
  },[refresh]);
  return <Context.Provider value={{...data,loading,error,refresh,select}}>{children}</Context.Provider>;
}
export function useHouseholds(){const context=useContext(Context);if(!context)throw new Error('HouseholdProvider required');return context;}

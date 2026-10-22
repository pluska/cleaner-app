"use client";

import Link from 'next/link';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { useHouseholds } from '@/contexts/HouseholdContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function HouseholdWorkLink() {
  const {activeHouseholdId}=useHouseholds();
  const {language}=useLanguage();
  if(!activeHouseholdId)return null;
  return <Link href="/households/work" className="shared-work-link"><CalendarDays size={20} aria-hidden="true"/><span>{language==='es'?'Agenda del hogar':'Household schedule'}</span><ArrowRight size={18} aria-hidden="true"/></Link>;
}

"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/libs/translations';
import { getTodayDate } from '@/libs/date-utils';

type Area = {id: string; name: string};
export default function AddTaskPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const es = language === 'es';
  const [title, setTitle] = useState('');
  const [areas, setAreas] = useState<Area[]>([]);
  const [roomId, setRoomId] = useState('');
  const [date, setDate] = useState(getTodayDate);
  const [frequency, setFrequency] = useState('once');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/user/areas', {signal: controller.signal}).then(async res => {
      if (!res.ok) throw new Error(es ? 'No pudimos cargar las habitaciones.' : 'Could not load rooms.');
      const data = await res.json();
      setAreas(data.areas); setRoomId(data.areas[0]?.id ?? '');
    }).catch(e => {if (!controller.signal.aborted) setError(e.message);})
      .finally(() => {if (!controller.signal.aborted) setLoading(false);});
    return () => controller.abort();
  }, [es]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (savingRef.current || !title.trim() || !roomId) return;
    savingRef.current = true; setSaving(true); setError('');
    try {
      const response = await fetch('/api/tasks', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({title, roomId, frequency, startDate: date})});
      if (!response.ok) throw new Error(es ? 'No se pudo guardar la tarea. Intenta de nuevo.' : 'Could not save the task. Please retry.');
      router.push(`/dashboard?date=${date}`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { savingRef.current = false; setSaving(false); }
  };
  return <main className="w-full max-w-2xl mx-auto min-h-screen bg-white px-6 pt-12 pb-32">
    <div className="flex items-center gap-4 mb-8"><button aria-label={es ? 'Volver' : 'Back'} onClick={() => router.back()} className="p-3"><ChevronLeft/></button><h1 className="text-xl font-bold">{t('Add Task', language)}</h1></div>
    {error && <p role="alert" className="text-red-700 mb-4">{error}</p>}
    {loading ? <p role="status">{es ? 'Cargando habitaciones…' : 'Loading rooms…'}</p> : areas.length === 0 ? <Link href="/onboarding">{es ? 'Configura las habitaciones de tu hogar' : 'Set up your home rooms'}</Link> :
      <form onSubmit={save} className="space-y-6">
        <label className="block">{t('Task title', language)}<input required maxLength={200} value={title} onChange={e => setTitle(e.target.value)} className="block w-full border rounded-xl p-4 mt-2"/></label>
        <label className="block">{es ? 'Habitación' : 'Room'}<select aria-label={es ? "Habitación" : "Room"} value={roomId} onChange={e => setRoomId(e.target.value)} className="block w-full border rounded-xl p-4 mt-2">{areas.map(area => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label>
        <label className="block">{t('Due Date', language)}<input required type="date" value={date} onChange={e => setDate(e.target.value)} className="block w-full border rounded-xl p-4 mt-2"/></label>
        <label className="block">{es ? 'Frecuencia' : 'Frequency'}<select aria-label={es ? "Frecuencia" : "Frequency"} value={frequency} onChange={e => setFrequency(e.target.value)} className="block w-full border rounded-xl p-4 mt-2">{['once','daily','weekly','monthly','yearly'].map((value,i) => <option key={value} value={value}>{(es ? ['Una vez','Diaria','Semanal','Mensual','Anual'] : ['Once','Daily','Weekly','Monthly','Yearly'])[i]}</option>)}</select></label>
        <button disabled={saving || !title.trim()} type="submit" className="w-full bg-primary text-white rounded-full p-4 font-bold flex justify-center gap-2 disabled:opacity-50"><Plus/>{saving ? (es ? 'Guardando…' : 'Saving…') : t('Add Task', language)}</button>
      </form>}
  </main>;
}

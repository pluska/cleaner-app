"use client";

import { HouseholdWorkLink } from '@/components/households/HouseholdWorkLink';
import { useState, useEffect, useRef } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { CalendarStrip } from "@/components/dashboard/CalendarStrip";
import { TaskList } from "@/components/dashboard/TaskList";
import { TaskType } from "@/components/dashboard/TaskItem";
import { validDay } from "@/libs/kingdom-rules";
import { formatDateToYYYYMMDD } from "@/libs/date-utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/hooks/useUser";

export default function DashboardPage() {
  const { user } = useUser();
  const { language } = useLanguage();
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<{coins:number;level:number} | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const completing = useRef(new Set<string>());
  useEffect(() => {
    const date = new URLSearchParams(window.location.search).get('date');
    if (validDay(date)) setSelectedDate(new Date(`${date}T12:00:00`));
  }, []);
  useEffect(() => {
    let active = true;
    fetch('/api/user/profile').then(async response => {
      if (!response.ok) throw new Error('profile');
      const data = await response.json();
      if (active) setProfile(data.profile);
    }).catch(() => { if (active) setError(language === 'es' ? 'No pudimos cargar tu progreso.' : 'Could not load your progress.'); });
    return () => { active = false; };
  }, [language]);
  const dateRef = useRef(selectedDate);
  dateRef.current = selectedDate;
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch tasks when selectedDate changes
  useEffect(() => {
    let active = true;

    async function fetchTasks() {
      setIsLoading(true);
      setError("");
      setTasks([]);
      try {
        const dateString = formatDateToYYYYMMDD(selectedDate);
        const res = await fetch(`/api/tasks?date=${dateString}`);
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();

        if (active) {
          setTasks(data.tasks);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
        if (active) setError(language === "es" ? "No pudimos cargar las tareas." : "Could not load tasks.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchTasks();

    return () => {
      active = false;
    };
  }, [selectedDate, language]);

  const handleToggleTask = async (task: TaskType) => {
    if (task.completed || completing.current.has(task.id)) return;
    completing.current.add(task.id);
    const dateString = formatDateToYYYYMMDD(selectedDate);
    setError("");
    try {
      const res = await fetch(`/api/tasks/${task.id}/complete`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: dateString })
      });
      if (!res.ok) throw new Error('completion');
      if (formatDateToYYYYMMDD(dateRef.current) === dateString) setTasks(prev => prev.map(t => t.id === task.id ? {...t, completed:true, subtasks:t.subtasks?.map(s=>({...s,completed:true}))} : t));
      const response = await fetch('/api/user/profile');
      if (response.ok) setProfile((await response.json()).profile);
    } catch {
      setError(language === 'es' ? 'No se pudo completar la tarea. Intenta de nuevo.' : 'Could not complete the task. Please retry.');
    } finally { completing.current.delete(task.id); }
  };

  return (
    <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto min-h-screen bg-[#F8F9FA] px-6 md:px-8 pt-12 md:pt-16 pb-32">
      <DashboardHeader userName={user?.name || ""} />
      <HouseholdWorkLink />
      <StatsOverview coins={profile?.coins} level={profile?.level} />
      {error && <p role="alert" className="text-red-700 mb-4">{error}</p>}
      <CalendarStrip
        selectedDate={selectedDate}
        onSelectDate={(date) => setSelectedDate(date)}
      />
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <TaskList tasks={tasks} onToggleTask={handleToggleTask} />
      )}
    </div>
  );
}

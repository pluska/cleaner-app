"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SettingsMenu } from "@/components/ui/layout/SettingsMenu";

export default function SchedulePage() {
  const { language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const router = useRouter();
  const [activity, setActivity] = useState<{date:string;total:number;completed:number}[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Calendar dates use the browser calendar, matching dashboard selections.
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(false); setActivity([]);
    fetch(`/api/tasks/calendar?month=${monthKey}`, {signal: controller.signal}).then(async response => {
      if (!response.ok) throw new Error('calendar');
      setActivity((await response.json()).days);
    }).catch(() => {if (!controller.signal.aborted) setError(true);})
      .finally(() => {if (!controller.signal.aborted) setLoading(false);});
    return () => controller.abort();
  }, [monthKey]);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (dayNum: number) => {
    router.push(`/dashboard?date=${monthKey}-${String(dayNum).padStart(2, '0')}`);
  };

  const monthName = currentDate.toLocaleString(
    language === "es" ? "es-ES" : "en-US",
    { month: "long" }
  ).toUpperCase();

  return (
    <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto min-h-screen bg-[#F8F9FA] px-6 md:px-8 pt-12 md:pt-16 pb-32 relative">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark mb-1">
            {t("Schedule", language)}
          </h1>
          <p className="text-gray-500 text-sm">
            {language === "es"
              ? "Planifica y revisa tu limpieza mensual"
              : "Plan and review your monthly cleaning"}
          </p>
        </div>
        <SettingsMenu />
      </div>

      {error && <p role="alert" className="text-red-700 mb-4">{language === 'es' ? 'No pudimos cargar el calendario.' : 'Could not load the calendar.'}</p>}
      {loading && <p role="status">{language === 'es' ? 'Cargando…' : 'Loading…'}</p>}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <button aria-label={language === "es" ? "Mes anterior" : "Previous month"} onClick={prevMonth} className="p-2 text-gray-400 hover:text-dark">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-[14px] font-bold tracking-widest text-dark">
            {monthName} {year}
          </h2>
          <button aria-label={language === "es" ? "Mes siguiente" : "Next month"} onClick={nextMonth} className="p-2 text-gray-400 hover:text-dark">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-6 gap-x-2 text-center mb-4">
          {(language === "es" ? ["D", "L", "M", "X", "J", "V", "S"] : ["S", "M", "T", "W", "T", "F", "S"]).map((day, idx) => (
            <div key={idx} className="text-[10px] font-bold text-gray-400">
              {day}
            </div>
          ))}

          {blanks.map((blank) => (
            <div key={`blank-${blank}`} className="h-10"></div>
          ))}

          {days.map((day) => {
            const date = `${monthKey}-${String(day).padStart(2, '0')}`;
            const data = activity.find(a => a.date === date);
            const isPerfectDay = !!data?.total && data.completed === data.total;
            const isTaskDay = !!data?.total && !isPerfectDay;

            return (
              <button
                key={day}
                aria-label={`${date}${data?.total ? ` · ${data.completed}/${data.total}` : ""}`}
                onClick={() => handleDayClick(day)}
                className="h-10 flex flex-col items-center justify-start relative cursor-pointer hover:bg-gray-50 rounded-[12px] transition-colors"
              >
                <span className="text-sm font-bold text-dark mb-1 pt-0.5">{day}</span>
                {isTaskDay && (
                  <Star className="w-3 h-3 text-primary absolute bottom-1" fill="currentColor" />
                )}
                {isPerfectDay && (
                  <Star className="w-3 h-3 text-yellow-500 absolute bottom-0" fill="currentColor" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { Award, Target, Zap, Clock, Calendar as CalendarIcon, Trophy, CheckCircle2 } from "lucide-react";
import { SettingsMenu } from "@/components/ui/layout/SettingsMenu";

export default function StatsPage() {
  const { language } = useLanguage();

  const mockWeeklyData = [
    { day: "Mon", score: 60, isToday: false },
    { day: "Tue", score: 85, isToday: false },
    { day: "Wed", score: 40, isToday: false },
    { day: "Thu", score: 90, isToday: false },
    { day: "Fri", score: 100, isToday: false },
    { day: "Sat", score: 0, isToday: false },
    { day: "Sun", score: 75, isToday: true },
  ];

  return (
    <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto min-h-screen bg-[#F8F9FA] px-6 md:px-8 pt-12 md:pt-16 pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark mb-1">
            {language === "es" ? "Tus Estadísticas" : "Your Stats"}
          </h1>
          <p className="text-gray-500 text-sm">
            {language === "es" ? "Mira tu progreso de limpieza" : "Track your cleaning progress"}
          </p>
        </div>
        <SettingsMenu />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-[110px]">
          <div className="flex items-center space-x-1.5 mb-1">
            <Trophy className="w-[14px] h-[14px] text-yellow-500" />
            <span className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">
              {language === "es" ? "Rango" : "Rank"}
            </span>
          </div>
          <div className="text-2xl font-bold text-dark mt-auto">
            {language === "es" ? "Limpiador Pro" : "Pro Cleaner"}
          </div>
        </div>
        
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-[110px]">
          <div className="flex items-center space-x-1.5 mb-1">
            <Zap className="w-[14px] h-[14px] text-orange-500" />
            <span className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">
              {language === "es" ? "Racha actual" : "Current Streak"}
            </span>
          </div>
          <div className="text-4xl font-extrabold text-dark tracking-tight mt-auto">
            12 <span className="text-lg font-medium text-gray-400">{language === "es" ? "días" : "days"}</span>
          </div>
        </div>
      </div>

      {/* Mock Chart Area */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-bold text-dark">
            {language === "es" ? "Actividad Semanal" : "Weekly Activity"}
          </h2>
          <select className="text-xs text-gray-400 font-bold bg-gray-50 px-3 py-1.5 rounded-full border-none outline-none cursor-pointer">
            <option>{language === "es" ? "Esta semana" : "This Week"}</option>
            <option>{language === "es" ? "Semana pasada" : "Last Week"}</option>
          </select>
        </div>

        <div className="flex items-end justify-between h-40 mt-6 relative z-10">
          {mockWeeklyData.map((data, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div className="w-full relative px-1 flex justify-center group h-32 flex-col justify-end">
                {data.score > 0 ? (
                  <div 
                    className={`w-full max-w-[32px] rounded-t-lg transition-all duration-700 ease-out-expo ${data.isToday ? 'bg-primary' : 'bg-primary/20 hover:bg-primary/40'}`}
                    style={{ height: `${data.score}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-dark text-white text-[10px] font-bold py-1 px-2 rounded whitespace-nowrap transition-opacity">
                      {data.score} pts
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-[32px] h-2 bg-gray-100 rounded-t-lg"></div>
                )}
              </div>
              <span className={`text-[10px] font-bold mt-3 uppercase ${data.isToday ? 'text-primary' : 'text-gray-400'}`}>
                {data.day}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mini Stats List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-dark mb-4 ml-2">
          {language === "es" ? "Resumen de Todos los Tiempos" : "All-Time Summary"}
        </h2>
        
        <div className="bg-white px-5 py-4 rounded-2xl flex items-center shadow-sm border border-gray-50">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-dark">{language === "es" ? "Tareas Completadas" : "Completed Tasks"}</div>
          </div>
          <div className="text-lg font-bold">1,248</div>
        </div>

        <div className="bg-white px-5 py-4 rounded-2xl flex items-center shadow-sm border border-gray-50">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-4">
            <Clock className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-dark">{language === "es" ? "Horas Limpiando" : "Hours Cleaning"}</div>
          </div>
          <div className="text-lg font-bold">342</div>
        </div>

        <div className="bg-white px-5 py-4 rounded-2xl flex items-center shadow-sm border border-gray-50">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mr-4">
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-dark">{language === "es" ? "Días Perfectos" : "Perfect Days"}</div>
          </div>
          <div className="text-lg font-bold">89</div>
        </div>
      </div>
    </div>
  );
}

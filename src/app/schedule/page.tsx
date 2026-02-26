"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { ChevronLeft, ChevronRight, Star, Calendar } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsMenu } from "@/components/ui/layout/SettingsMenu";

export default function SchedulePage() {
  const { language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Generate a mock full month calendar
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Mock data for stars: day 5 has a blue star (tasks planned), day 8 has gold star (perfect day)
  const taskDays = [5, 12, 19, 26]; 
  const perfectDays = [2, 8, 15];

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (dayNum: number) => {
    setToastMessage(language === "es" ? `Día ${dayNum} seleccionado` : `Day ${dayNum} selected`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const monthName = currentDate.toLocaleString(
    language === "es" ? "es-ES" : "en-US", 
    { month: "long" }
  ).toUpperCase();

  return (
    <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto min-h-screen bg-[#F8F9FA] px-6 md:px-8 pt-12 md:pt-16 pb-32 relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-white border border-primary/20 rounded-full shadow-lg px-6 py-3 flex items-center space-x-3 pointer-events-none"
          >
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-bold text-dark text-sm">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

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

      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-dark">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-[14px] font-bold tracking-widest text-dark">
            {monthName} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-dark">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-6 gap-x-2 text-center mb-4">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
            <div key={idx} className="text-[10px] font-bold text-gray-400">
              {day}
            </div>
          ))}

          {blanks.map((blank) => (
            <div key={`blank-${blank}`} className="h-10"></div>
          ))}

          {days.map((day) => {
            const isTaskDay = taskDays.includes(day);
            const isPerfectDay = perfectDays.includes(day);

            return (
              <div 
                key={day} 
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

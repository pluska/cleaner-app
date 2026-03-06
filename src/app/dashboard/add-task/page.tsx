"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";

export default function AddTaskPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [taskName, setTaskName] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<string>("LIVING ROOM");

  const rooms = ["LIVING ROOM", "BATHROOM", "KITCHEN", "BEDROOM"];

  const handleSave = () => {
    // In a real app we'd save to the database here
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto min-h-screen bg-white px-6 md:px-8 pt-12 md:pt-16 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-dark hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-dark">
          {t("Add Task", language)}
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="space-y-6">
        {/* Task Name Input */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            {t("Task title", language)}
          </label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder={language === "es" ? "Ej. Limpiar ventanas" : "e.g. Clean windows"}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Room Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            {t("Category", language)} / Room
          </label>
          <div className="flex flex-wrap gap-2">
            {rooms.map((room) => (
              <button
                key={room}
                onClick={() => setSelectedRoom(room)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-colors border ${
                  selectedRoom === room
                    ? "bg-dark text-white border-dark"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {room}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule & Duration placeholder rows */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <CalendarIcon className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-widest uppercase">
                {t("Due Date", language)}
              </span>
            </div>
            <div className="font-semibold text-dark">
              {t("Today", language)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-widest uppercase">
                Duration
              </span>
            </div>
            <div className="font-semibold text-dark">15 min</div>
          </div>
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-auto md:w-[calc(100%-4rem)] md:max-w-xl lg:max-w-2xl flex justify-center z-50">
        <button
          onClick={handleSave}
          disabled={!taskName.trim()}
          className="w-full bg-primary text-white font-bold text-lg py-4 rounded-full shadow-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" strokeWidth={3} />
          <span>{t("Add Task", language)}</span>
        </button>
      </div>
    </div>
  );
}

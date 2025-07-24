"use client";

import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (taskId: string, newDate: string) => void;
  taskId: string;
  taskTitle: string;
  currentDueDate: string;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  onReschedule,
  taskId,
  taskTitle,
  currentDueDate,
}) => {
  const { language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const getQuickDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    return [
      {
        label: language === "es" ? "Mañana" : "Tomorrow",
        date: tomorrow.toISOString().split("T")[0],
      },
      {
        label: language === "es" ? "Próxima semana" : "Next week",
        date: nextWeek.toISOString().split("T")[0],
      },
      {
        label: language === "es" ? "Próximo mes" : "Next month",
        date: nextMonth.toISOString().split("T")[0],
      },
    ];
  };

  const handleQuickDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleReschedule = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      await onReschedule(taskId, selectedDate);
      onClose();
    } catch (error) {
      console.error("Error rescheduling task:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickDates = getQuickDates();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-text">
            {language === "es" ? "Reprogramar tarea" : "Reschedule Task"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-text transition-colors p-1 rounded-full hover:bg-base"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-base rounded-lg">
          <p className="text-sm font-medium text-text mb-2">
            {language === "es" ? "Tarea:" : "Task:"}
          </p>
          <p className="font-semibold text-text text-lg">{taskTitle}</p>
        </div>

        <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm font-medium text-primary mb-2">
            {language === "es" ? "Fecha actual:" : "Current date:"}
          </p>
          <p className="text-sm text-primary font-medium">{currentDueDate}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold text-text mb-4">
            {language === "es" ? "Opciones rápidas:" : "Quick options:"}
          </p>
          <div className="grid grid-cols-1 gap-3">
            {quickDates.map((option) => (
              <button
                key={option.date}
                onClick={() => handleQuickDateSelect(option.date)}
                className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedDate === option.date
                    ? "border-primary bg-primary/10 text-primary shadow-md"
                    : "border-base hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center mb-1">
                  <Calendar
                    className={`h-4 w-4 mr-3 ${
                      selectedDate === option.date
                        ? "text-primary"
                        : "text-text"
                    }`}
                  />
                  <span
                    className={`${
                      selectedDate === option.date
                        ? "font-normal text-primary"
                        : "font-normal text-text"
                    }`}
                  >
                    {option.label}
                  </span>
                </div>
                <span
                  className={`text-sm ml-7 font-medium ${
                    selectedDate === option.date ? "text-primary" : "text-text"
                  }`}
                >
                  {option.date}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold text-text mb-3">
            {language === "es" ? "O fecha personalizada:" : "Or custom date:"}
          </p>
          <div className="relative">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full p-3 border-2 border-base rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text" />
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={handleReschedule}
            disabled={!selectedDate || loading}
            className="flex-1 py-3 px-4 font-semibold bg-primary hover:bg-primary/90 text-white"
          >
            {loading
              ? language === "es"
                ? "Reprogramando..."
                : "Rescheduling..."
              : language === "es"
              ? "Reprogramar"
              : "Reschedule"}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 py-3 px-4 font-semibold border-2 border-base text-text hover:bg-base"
          >
            {t("Cancel", language)}
          </Button>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import { Button } from "../../ui/forms/Button";
import { Input } from "../../ui/forms/Input";
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {language === "es" ? "Reprogramar tarea" : "Reschedule Task"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-2">
            {language === "es" ? "Tarea:" : "Task:"}
          </p>
          <p className="font-semibold text-gray-900 text-lg">{taskTitle}</p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-700 mb-2">
            {language === "es" ? "Fecha actual:" : "Current date:"}
          </p>
          <p className="text-sm text-blue-700 font-medium">{currentDueDate}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-900 mb-4">
            {language === "es" ? "Opciones rápidas:" : "Quick options:"}
          </p>
          <div className="grid grid-cols-1 gap-3">
            {quickDates.map((option) => (
              <button
                key={option.date}
                onClick={() => handleQuickDateSelect(option.date)}
                className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedDate === option.date
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm bg-white"
                }`}
              >
                <div className="flex items-center mb-1">
                  <Calendar
                    className={`h-4 w-4 mr-3 ${
                      selectedDate === option.date
                        ? "text-blue-500"
                        : "text-gray-600"
                    }`}
                  />
                  <span
                    className={`${
                      selectedDate === option.date
                        ? "font-normal text-blue-700"
                        : "font-normal text-gray-700"
                    }`}
                  >
                    {option.label}
                  </span>
                </div>
                <span
                  className={`text-sm ml-7 font-medium ${
                    selectedDate === option.date
                      ? "text-blue-700"
                      : "text-gray-600"
                  }`}
                >
                  {option.date}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-900 mb-3">
            {language === "es" ? "O fecha personalizada:" : "Or custom date:"}
          </p>
          <div className="relative">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors bg-white"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={handleReschedule}
            disabled={!selectedDate || loading}
            className="flex-1 py-3 px-4 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
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
            className="flex-1 py-3 px-4 font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
          >
            {t("Cancel", language)}
          </Button>
        </div>
      </div>
    </div>
  );
};

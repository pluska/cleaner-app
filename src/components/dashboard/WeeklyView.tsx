"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { formatDateToYYYYMMDD, getWeekStart } from "@/libs/date-utils";

interface WeeklyViewProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const { language } = useLanguage();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [isToday, setIsToday] = useState(true);

  // Use the utility function for week start calculation

  // Initialize current week start
  useEffect(() => {
    setCurrentWeekStart(getWeekStart(new Date()));
  }, []);

  // Check if selected date is today
  useEffect(() => {
    const today = formatDateToYYYYMMDD(new Date());
    setIsToday(selectedDate === today);
  }, [selectedDate]);

  // Generate week days (Monday to Sunday)
  const getWeekDays = (): string[] => {
    const days = [];
    const weekStart = new Date(currentWeekStart);

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(formatDateToYYYYMMDD(day));
    }

    return days;
  };

  // Use the utility function for date formatting

  // Format date for display
  const formatDate = (dateString: string): string => {
    // Parse date string properly to avoid timezone issues
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    const today = formatDateToYYYYMMDD(new Date());
    const isToday = dateString === today;

    if (isToday) {
      return language === "es" ? "Hoy" : "Today";
    }

    return date.toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
      weekday: "short",
      day: "numeric",
    });
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  // Go to today
  const goToToday = () => {
    const today = formatDateToYYYYMMDD(new Date());
    onDateChange(today);
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  const weekDays = getWeekDays();

  return (
    <div className="mb-8">
      {/* Go to Today button */}
      <div className="mb-4" style={{ minHeight: "40px" }}>
        {!isToday && (
          <Button
            onClick={goToToday}
            variant="outline"
            size="sm"
            className="text-sm"
          >
            {t("Go to Today", language)}
          </Button>
        )}
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousWeek}
          className="p-2 hover:bg-base rounded-md transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-text" />
        </button>

        <div className="text-base sm:text-lg font-semibold text-text text-center">
          {currentWeekStart.toLocaleDateString(
            language === "es" ? "es-ES" : "en-US",
            { month: "long", year: "numeric" }
          )}
        </div>

        <button
          onClick={goToNextWeek}
          className="p-2 hover:bg-base rounded-md transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-text" />
        </button>
      </div>

      {/* Week days bar */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekDays.map((date) => {
          const isSelected = date === selectedDate;
          const isTodayDate = date === formatDateToYYYYMMDD(new Date());

          return (
            <Button
              key={date}
              onClick={() => onDateChange(date)}
              variant={isSelected ? "primary" : "outline"}
              className="w-full min-h-[40px] sm:min-h-[auto]"
            >
              <div className="text-xs sm:text-sm font-medium">
                {formatDate(date)}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

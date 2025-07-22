"use client";

import { useState } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, Filter } from "lucide-react";
import { Task, TimeView } from "@/types";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";

interface ScheduleViewProps {
  tasks: Task[];
  userId: string;
}

export function ScheduleView({ tasks, userId }: ScheduleViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<TimeView>("weekly");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { language } = useLanguage();

  const categories = [
    "all",
    "kitchen",
    "bathroom",
    "bedroom",
    "living_room",
    "laundry",
    "exterior",
    "general",
  ];

  const getDateRange = () => {
    switch (view) {
      case "weekly":
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 }),
        };
      case "monthly":
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        };
      default:
        return {
          start: currentDate,
          end: currentDate,
        };
    }
  };

  const { start, end } = getDateRange();

  const filteredTasks = tasks.filter((task) => {
    const taskDate = new Date(task.due_date || task.created_at);
    const categoryMatch =
      selectedCategory === "all" || task.category === selectedCategory;
    const dateMatch = taskDate >= start && taskDate <= end;
    return categoryMatch && dateMatch;
  });

  const getTasksForDate = (date: Date) => {
    return filteredTasks.filter((task) => {
      const taskDate = new Date(task.due_date || task.created_at);
      return isSameDay(taskDate, date);
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "kitchen":
        return "bg-orange-100 text-orange-800";
      case "bathroom":
        return "bg-blue-100 text-blue-800";
      case "bedroom":
        return "bg-purple-100 text-purple-800";
      case "living_room":
        return "bg-green-100 text-green-800";
      case "laundry":
        return "bg-indigo-100 text-indigo-800";
      case "exterior":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    switch (view) {
      case "weekly":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "monthly":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
      default:
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const renderCalendarView = () => {
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-xl font-bold text-gray-900">
                {format(start, "MMM d")} - {format(end, "MMM d, yyyy")}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 capitalize">
                {view === "daily" && t("Daily View", language)}
                {view === "weekly" && t("Weekly View", language)}
                {view === "monthly" && t("Monthly View", language)}
                {view === "yearly" && t("Yearly View", language)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {(language === "es"
            ? ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"]
            : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          ).map((day) => (
            <div
              key={day}
              className="bg-gray-50 p-3 text-center text-base font-bold text-gray-800"
            >
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            const dayTasks = getTasksForDate(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={index}
                className={`bg-white min-h-[120px] p-2 ${
                  isToday ? "bg-blue-50 border-2 border-blue-200" : ""
                }`}
              >
                <div
                  className={`text-lg font-bold mb-2 ${
                    isToday ? "text-blue-700" : "text-gray-800"
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`text-xs p-1 rounded truncate ${
                        task.completed ? "opacity-50" : ""
                      }`}
                      title={task.title}
                    >
                      <div className="font-medium truncate">{task.title}</div>
                      <div className="flex space-x-1 mt-1">
                        <span
                          className={`px-1 py-0.5 rounded text-xs ${getCategoryColor(
                            task.category
                          )}`}
                        >
                          {task.category.replace("_", " ")}
                        </span>
                        <span
                          className={`px-1 py-0.5 rounded text-xs ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const groupedTasks = filteredTasks.reduce((acc, task) => {
      const date = format(
        new Date(task.due_date || task.created_at),
        "yyyy-MM-dd"
      );
      if (!acc[date]) acc[date] = [];
      acc[date].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    const sortedDates = Object.keys(groupedTasks).sort();

    return (
      <div className="space-y-6">
        {sortedDates.map((date) => {
          const tasks = groupedTasks[date];
          const dateObj = new Date(date);
          const isToday = isSameDay(dateObj, new Date());

          return (
            <div key={date} className="bg-white rounded-lg shadow">
              <div
                className={`p-4 border-b ${
                  isToday ? "bg-blue-50 border-blue-200" : "bg-gray-50"
                }`}
              >
                <h3
                  className={`font-semibold ${
                    isToday ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {format(dateObj, "EEEE, MMMM d, yyyy")}
                  {isToday && (
                    <span className="ml-2 text-sm">
                      ({t("Today", language)})
                    </span>
                  )}
                </h3>
              </div>
              <div className="divide-y">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            task.completed ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                        <div>
                          <h4
                            className={`font-medium ${
                              task.completed
                                ? "line-through text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {task.title}
                          </h4>
                          {task.description && (
                            <p
                              className={`text-sm ${
                                task.completed
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                            task.category
                          )}`}
                        >
                          {task.category.replace("_", " ")}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {sortedDates.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {t("No tasks found for the selected period and filters.", language)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-800">
                {t("View", language)}:
              </span>
              <select
                value={view}
                onChange={(e) => setView(e.target.value as TimeView)}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-900 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              >
                <option value="daily">{t("Daily", language)}</option>
                <option value="weekly">{t("Weekly", language)}</option>
                <option value="monthly">{t("Monthly", language)}</option>
                <option value="yearly">{t("Yearly", language)}</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-800">
                {t("Category", language)}:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-900 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all"
                      ? t("All Categories", language)
                      : t(category.replace("_", " "), language)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-sm font-semibold text-gray-800 bg-gray-100 px-3 py-2 rounded-lg">
            {filteredTasks.length}{" "}
            {filteredTasks.length === 1
              ? t("task found", language)
              : t("tasks found", language)}
          </div>
        </div>
      </div>

      {/* Calendar/List View */}
      {view === "yearly" ? renderListView() : renderCalendarView()}
    </div>
  );
}

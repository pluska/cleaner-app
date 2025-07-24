"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Task, TaskFormData } from "@/types";
import { createTask } from "@/libs/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TaskSkeletons } from "@/components/ui/LoadingSpinner";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { formatDateToYYYYMMDD } from "@/libs/date-utils";
import { DroppableArea } from "./DroppableArea";
import { DraggableTask } from "./DraggableTask";
import { TaskItem } from "./TaskItem";
import {
  getDaysOfWeek,
  getTaskCategories,
  getTaskPriorities,
  getTaskFrequencies,
} from "@/libs/task-utils";

interface DailyTasksProps {
  tasks: Task[];
  userId: string;
  selectedDate: string;
  isLoading?: boolean;
  onTaskMoved?: () => void;
}

export function DailyTasks({
  tasks: initialTasks,
  selectedDate,
  isLoading = false,
}: DailyTasksProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Update tasks when props change
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    frequency: "daily",
    category: "general",
    priority: "medium",
    is_recurring: false,
  });
  const { language } = useLanguage();

  // Format the selected date for display
  const formatSelectedDate = (dateString: string): string => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const today = formatDateToYYYYMMDD(new Date());
    const isToday = dateString === today;

    if (isToday) {
      return language === "es" ? "Hoy" : "Today";
    }

    if (language === "es") {
      // Spanish format: "Sábado, 24/7/2024"
      const weekday = date.toLocaleDateString("es-ES", { weekday: "long" });
      const capitalizedWeekday =
        weekday.charAt(0).toUpperCase() + weekday.slice(1);
      const formattedDate = `${day}/${month}/${year}`;
      return `${capitalizedWeekday}, ${formattedDate}`;
    } else {
      // English format: "Saturday, 24/07/2025"
      const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
      const formattedDate = `${day.toString().padStart(2, "0")}/${month
        .toString()
        .padStart(2, "0")}/${year}`;
      return `${weekday}, ${formattedDate}`;
    }
  };

  // Check if the selected date is in the past
  const isPastDate = (dateString: string): boolean => {
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return selectedDate < today;
  };

  const handleReschedule = async (taskId: string, newDate: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ due_date: newDate }),
      });
      if (res.ok) {
        // Remove the task from today's list since it's been rescheduled
        setTasks(tasks.filter((task) => task.id !== taskId));
      }
    } catch (error) {
      console.error("Error rescheduling task:", error);
    }
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const daysOfWeek = getDaysOfWeek(language);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const { task } = await createTask({
        ...formData,
        due_date: new Date().toISOString().split("T")[0],
      });

      setTasks([...tasks, task]);
      setFormData({
        title: "",
        description: "",
        frequency: "daily",
        category: "general",
        priority: "medium",
        is_recurring: false,
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error creating task:", error);
      // You might want to show an error message to the user here
    }
  };

  const renderTaskForm = () => (
    <form onSubmit={handleAddTask} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <Input
          placeholder={t("Task title", language)}
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, title: e.target.value })
          }
          required
        />
        <Input
          placeholder={t("Description (optional)", language)}
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <select
          value={formData.category}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFormData({
              ...formData,
              category: e.target.value as Task["category"],
            })
          }
          className="h-10 rounded-lg border-2 border-base px-3 py-2 text-sm font-medium text-text bg-bg shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        >
          {getTaskCategories(language).map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        <select
          value={formData.priority}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFormData({
              ...formData,
              priority: e.target.value as Task["priority"],
            })
          }
          className="h-10 rounded-lg border-2 border-base px-3 py-2 text-sm font-medium text-text bg-bg shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        >
          {getTaskPriorities(language).map((priority) => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </select>
        <select
          value={formData.frequency}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFormData({
              ...formData,
              frequency: e.target.value as Task["frequency"],
            })
          }
          className="h-10 rounded-lg border-2 border-base px-3 py-2 text-sm font-medium text-text bg-bg shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        >
          {getTaskFrequencies(language).map((frequency) => (
            <option key={frequency.value} value={frequency.value}>
              {frequency.label}
            </option>
          ))}
        </select>
      </div>

      {/* Day of week selection for weekly tasks */}
      {formData.frequency === "weekly" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={formData.day_of_week || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFormData({
                ...formData,
                day_of_week: e.target.value
                  ? parseInt(e.target.value)
                  : undefined,
              })
            }
            className="h-10 rounded-lg border-2 border-base px-3 py-2 text-sm font-medium text-text bg-bg shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          >
            <option value="">{t("Select day of week", language)}</option>
            {daysOfWeek.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
          <Input
            type="time"
            placeholder={t("Preferred time (optional)", language)}
            value={formData.preferred_time || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, preferred_time: e.target.value })
            }
          />
        </div>
      )}

      {/* Recurring task options */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_recurring"
          checked={formData.is_recurring}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, is_recurring: e.target.checked })
          }
          className="h-4 w-4 text-primary focus:ring-primary border-base rounded"
        />
        <label htmlFor="is_recurring" className="text-sm font-medium text-text">
          {t("Make this a recurring task", language)}
        </label>
      </div>

      <div className="flex space-x-2">
        <Button type="submit" className="w-full">
          {t("Add Task", language)}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setShowAddForm(false);
            setFormData({
              title: "",
              description: "",
              frequency: "daily",
              category: "general",
              priority: "medium",
              is_recurring: false,
            });
          }}
        >
          {t("Cancel", language)}
        </Button>
      </div>
    </form>
  );

  return (
    <div
      className={`bg-bg rounded-xl shadow-lg border border-base mb-12 ${
        isPastDate(selectedDate) ? "opacity-90" : ""
      }`}
    >
      <div className="p-4 sm:p-8 border-b border-base">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          {selectedDate === formatDateToYYYYMMDD(new Date()) ? (
            <h2 className="text-xl sm:text-2xl font-semibold text-text">
              {t("Today's Tasks", language)}
            </h2>
          ) : (
            <h2 className="text-xl sm:text-2xl font-semibold text-text">
              {language === "es"
                ? `Tareas del ${formatSelectedDate(selectedDate)}`
                : `${formatSelectedDate(selectedDate)} ${t("tasks", language)}`}
            </h2>
          )}
          {!isPastDate(selectedDate) && (
            <Button
              onClick={() => {
                setShowAddForm(!showAddForm);
              }}
              className="w-full sm:w-auto"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">{t("Add Task", language)}</span>
            </Button>
          )}
        </div>
      </div>

      {showAddForm && !isPastDate(selectedDate) && (
        <div className="p-4 sm:p-8 border-b bg-base">{renderTaskForm()}</div>
      )}

      <DroppableArea id="today-tasks" className="min-h-[200px]">
        {isLoading ? (
          <TaskSkeletons count={3} />
        ) : (
          <div className="divide-y divide-base">
            {tasks.length === 0 ? (
              <div className="p-8 sm:p-12 text-center text-text/70">
                <p className="text-base sm:text-lg mb-2">
                  {selectedDate === formatDateToYYYYMMDD(new Date())
                    ? t(
                        "No tasks for today. Add your first task to get started!",
                        language
                      )
                    : isPastDate(selectedDate)
                    ? t("Today was a lazy day", language)
                    : t(
                        "No tasks for this date. Add a task to get started!",
                        language
                      )}
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <DraggableTask key={task.id} task={task}>
                  <TaskItem
                    task={task}
                    onTaskUpdated={handleTaskUpdated}
                    onTaskDeleted={handleTaskDeleted}
                    onReschedule={handleReschedule}
                    isPastDate={isPastDate(selectedDate)}
                  />
                </DraggableTask>
              ))
            )}
          </div>
        )}
      </DroppableArea>
    </div>
  );
}

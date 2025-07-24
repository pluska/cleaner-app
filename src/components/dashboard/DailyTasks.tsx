"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle,
  Circle,
  Trash2,
  Edit,
  Calendar,
} from "lucide-react";
import { Task, TaskFormData } from "@/types";
import { createTask, updateTask, deleteTask, toggleTask } from "@/libs/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner, TaskSkeletons } from "@/components/ui/LoadingSpinner";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { formatDateToYYYYMMDD } from "@/libs/date-utils";
import { DroppableArea } from "./DroppableArea";
import { DraggableTask } from "./DraggableTask";
import { RescheduleModal } from "./RescheduleModal";

interface DailyTasksProps {
  tasks: Task[];
  userId: string;
  selectedDate: string;
  isLoading?: boolean;
  onTaskMoved?: () => void;
}

export function DailyTasks({
  tasks: initialTasks,
  userId,
  selectedDate,
  isLoading = false,
  onTaskMoved,
}: DailyTasksProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Update tasks when props change
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    taskId: string;
    taskTitle: string;
    currentDueDate: string;
  }>({
    isOpen: false,
    taskId: "",
    taskTitle: "",
    currentDueDate: "",
  });
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    frequency: "daily",
    category: "general",
    priority: "medium",
    is_recurring: false,
  });
  const [togglingTasks, setTogglingTasks] = useState<Set<string>>(new Set());
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

  const handleTaskMoved = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/move`, {
        method: "PATCH",
      });
      if (res.ok) {
        const { task } = await res.json();
        setTasks([...tasks, task]);
        onTaskMoved?.();
      }
    } catch (error) {
      console.error("Error moving task:", error);
    }
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
        onTaskMoved?.();
      }
    } catch (error) {
      console.error("Error rescheduling task:", error);
    }
  };

  const openRescheduleModal = (task: Task) => {
    setRescheduleModal({
      isOpen: true,
      taskId: task.id,
      taskTitle: task.title,
      currentDueDate: task.due_date || "",
    });
  };

  const closeRescheduleModal = () => {
    setRescheduleModal({
      isOpen: false,
      taskId: "",
      taskTitle: "",
      currentDueDate: "",
    });
  };

  const daysOfWeek = [
    { value: 0, label: language === "es" ? "Domingo" : "Sunday" },
    { value: 1, label: language === "es" ? "Lunes" : "Monday" },
    { value: 2, label: language === "es" ? "Martes" : "Tuesday" },
    { value: 3, label: language === "es" ? "Miércoles" : "Wednesday" },
    { value: 4, label: language === "es" ? "Jueves" : "Thursday" },
    { value: 5, label: language === "es" ? "Viernes" : "Friday" },
    { value: 6, label: language === "es" ? "Sábado" : "Saturday" },
  ];

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

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    setTogglingTasks((prev) => new Set(prev).add(taskId));
    try {
      const { task } = await toggleTask(taskId);
      setTasks(tasks.map((t) => (t.id === taskId ? task : t)));
    } catch (error) {
      console.error("Error toggling task:", error);
    } finally {
      setTogglingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !formData.title.trim()) return;

    try {
      const { task } = await updateTask(editingTask.id, formData);
      setTasks(tasks.map((t) => (t.id === editingTask.id ? task : t)));
      setEditingTask(null);
      setFormData({
        title: "",
        description: "",
        frequency: "daily",
        category: "general",
        priority: "medium",
        is_recurring: false,
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      frequency: task.frequency,
      category: task.category,
      priority: task.priority,
      is_recurring: task.is_recurring,
      day_of_week: task.day_of_week,
      preferred_time: task.preferred_time,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-primary bg-primary/10";
      case "low":
        return "text-accent bg-accent/20";
      default:
        return "text-text bg-base";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      general: "bg-base text-text",
      kitchen: "bg-orange-100 text-orange-800",
      bathroom: "bg-primary/20 text-primary",
      bedroom: "bg-purple-100 text-purple-800",
      living_room: "bg-green-100 text-green-800",
      laundry: "bg-accent/20 text-accent",
      exterior: "bg-indigo-100 text-indigo-800",
    };
    return colors[category] || colors.general;
  };

  const isTaskOverdue = (task: Task) => {
    const today = new Date().toISOString().split("T")[0];
    return task.due_date && task.due_date < today && !task.completed;
  };

  const getOverdueStyle = (task: Task) => {
    if (isTaskOverdue(task)) {
      return "text-red-600 font-semibold";
    }
    return task.completed ? "line-through text-gray-500" : "text-gray-900";
  };

  const renderTaskForm = (isEditing = false) => (
    <form
      onSubmit={isEditing ? handleEditTask : handleAddTask}
      className="space-y-4"
    >
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
            setFormData({ ...formData, category: e.target.value as any })
          }
          className="h-10 rounded-lg border-2 border-base px-3 py-2 text-sm font-medium text-text bg-bg shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        >
          <option value="general">{t("General", language)}</option>
          <option value="kitchen">{t("Kitchen", language)}</option>
          <option value="bathroom">{t("Bathroom", language)}</option>
          <option value="bedroom">{t("Bedroom", language)}</option>
          <option value="living_room">{t("Living Room", language)}</option>
          <option value="laundry">{t("Laundry", language)}</option>
          <option value="exterior">{t("Exterior", language)}</option>
        </select>
        <select
          value={formData.priority}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFormData({ ...formData, priority: e.target.value as any })
          }
          className="h-10 rounded-lg border-2 border-base px-3 py-2 text-sm font-medium text-text bg-bg shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        >
          <option value="low">{t("Low Priority", language)}</option>
          <option value="medium">{t("Medium Priority", language)}</option>
          <option value="high">{t("High Priority", language)}</option>
        </select>
        <select
          value={formData.frequency}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFormData({ ...formData, frequency: e.target.value as any })
          }
          className="h-10 rounded-lg border-2 border-base px-3 py-2 text-sm font-medium text-text bg-bg shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        >
          <option value="daily">{t("Daily", language)}</option>
          <option value="weekly">{t("Weekly", language)}</option>
          <option value="monthly">{t("Monthly", language)}</option>
          <option value="yearly">{t("Yearly", language)}</option>
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
          {isEditing ? t("Save Changes", language) : t("Add Task", language)}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setShowAddForm(false);
            setEditingTask(null);
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
                  <div className="p-4 sm:p-8 hover:bg-base transition-colors">
                    {editingTask?.id === task.id ? (
                      <div className="bg-base p-4 sm:p-6 rounded-lg">
                        {renderTaskForm(true)}
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() =>
                              handleToggleTask(task.id, task.completed)
                            }
                            disabled={togglingTasks.has(task.id)}
                            className="text-text/40 hover:text-text/60 transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {togglingTasks.has(task.id) ? (
                              <LoadingSpinner size="sm" />
                            ) : task.completed ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                              <Circle className="h-6 w-6" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h3
                              className={`text-base sm:text-lg font-medium ${getOverdueStyle(
                                task
                              )} mb-2`}
                            >
                              {task.title}
                            </h3>
                            {task.description && (
                              <p
                                className={`text-sm mb-3 ${
                                  task.completed
                                    ? "text-text/40"
                                    : "text-text/70"
                                }`}
                              >
                                {task.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 sm:space-x-3">
                              {isTaskOverdue(task) && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                  {t("Overdue", language)}
                                </span>
                              )}
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                                  task.category
                                )}`}
                              >
                                {task.category.replace("_", " ")}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>
                              {task.is_recurring && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                  {t("Recurring", language)}
                                </span>
                              )}
                              {task.day_of_week !== undefined &&
                                task.frequency === "weekly" && (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                                    {daysOfWeek[task.day_of_week]?.label}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end space-x-2 sm:space-x-3">
                          <button
                            onClick={() => openRescheduleModal(task)}
                            className="text-text/40 hover:text-primary transition-colors p-2"
                            title={
                              language === "es" ? "Reprogramar" : "Reschedule"
                            }
                          >
                            <Calendar className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => startEditing(task)}
                            className="text-text/40 hover:text-text/60 transition-colors p-2"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-text/40 hover:text-red-600 transition-colors p-2"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </DraggableTask>
              ))
            )}
          </div>
        )}
      </DroppableArea>
      <RescheduleModal
        isOpen={rescheduleModal.isOpen}
        onClose={closeRescheduleModal}
        taskId={rescheduleModal.taskId}
        taskTitle={rescheduleModal.taskTitle}
        currentDueDate={rescheduleModal.currentDueDate}
        onReschedule={handleReschedule}
      />
    </div>
  );
}

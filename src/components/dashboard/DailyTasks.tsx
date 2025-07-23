"use client";

import { useState } from "react";
import { Plus, CheckCircle, Circle, Trash2, Edit } from "lucide-react";
import { Task, TaskFormData } from "@/types";
import { createTask, updateTask, deleteTask, toggleTask } from "@/libs/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";

interface DailyTasksProps {
  tasks: Task[];
  userId: string;
}

export function DailyTasks({ tasks: initialTasks, userId }: DailyTasksProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    frequency: "daily",
    category: "general",
    priority: "medium",
    is_recurring: false,
  });
  const { language } = useLanguage();

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
    try {
      const { task } = await toggleTask(taskId);
      setTasks(tasks.map((t) => (t.id === taskId ? task : t)));
    } catch (error) {
      console.error("Error toggling task:", error);
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
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "kitchen":
        return "text-orange-600 bg-orange-100";
      case "bathroom":
        return "text-blue-600 bg-blue-100";
      case "bedroom":
        return "text-purple-600 bg-purple-100";
      case "living_room":
        return "text-green-600 bg-green-100";
      case "laundry":
        return "text-indigo-600 bg-indigo-100";
      case "exterior":
        return "text-teal-600 bg-teal-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const renderTaskForm = (isEditing = false) => (
    <form
      onSubmit={isEditing ? handleEditTask : handleAddTask}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={formData.category}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFormData({ ...formData, category: e.target.value as any })
          }
          className="h-10 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
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
          className="h-10 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
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
          className="h-10 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        >
          <option value="daily">{t("Daily", language)}</option>
          <option value="weekly">{t("Weekly", language)}</option>
          <option value="monthly">{t("Monthly", language)}</option>
          <option value="yearly">{t("Yearly", language)}</option>
        </select>
      </div>

      {/* Day of week selection for weekly tasks */}
      {formData.frequency === "weekly" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            className="h-10 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
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
            className="h-10 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
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
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor="is_recurring"
          className="text-sm font-medium text-gray-700"
        >
          {t("Make this a recurring task", language)}
        </label>
      </div>

      <div className="flex space-x-2">
        <Button type="submit">
          {isEditing ? t("Save Changes", language) : t("Add Task", language)}
        </Button>
        <Button
          type="button"
          variant="outline"
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
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("Today's Tasks", language)}
          </h2>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{t("Add Task", language)}</span>
          </Button>
        </div>
      </div>

      {showAddForm && (
        <div className="p-6 border-b bg-gray-50">{renderTaskForm()}</div>
      )}

      <div className="divide-y">
        {tasks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {t(
              "No tasks for today. Add your first task to get started!",
              language
            )}
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="p-6 hover:bg-gray-50">
              {editingTask?.id === task.id ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {renderTaskForm(true)}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleTask(task.id, task.completed)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {task.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <div>
                      <h3
                        className={`font-medium ${
                          task.completed
                            ? "line-through text-gray-500"
                            : "text-gray-900"
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p
                          className={`text-sm ${
                            task.completed ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {task.description}
                        </p>
                      )}
                      <div className="flex space-x-2 mt-2">
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
                        {task.is_recurring && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                            {t("Recurring", language)}
                          </span>
                        )}
                        {task.day_of_week !== undefined &&
                          task.frequency === "weekly" && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                              {daysOfWeek[task.day_of_week]?.label}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEditing(task)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

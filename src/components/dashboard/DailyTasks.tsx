"use client";

import { useState } from "react";
import { Plus, CheckCircle, Circle, Trash2, Edit } from "lucide-react";
import { createClient } from "@/libs/supabase";
import { Task, TaskFormData } from "@/types";
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
  });
  const supabase = createClient();
  const { language } = useLanguage();

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newTask = {
      ...formData,
      user_id: userId,
      completed: false,
      due_date: new Date().toISOString().split("T")[0],
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert([newTask])
      .select()
      .single();

    if (data && !error) {
      setTasks([...tasks, data]);
      setFormData({
        title: "",
        description: "",
        frequency: "daily",
        category: "general",
        priority: "medium",
      });
      setShowAddForm(false);
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: !completed })
      .eq("id", taskId);

    if (!error) {
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !completed } : task
        )
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (!error) {
      setTasks(tasks.filter((task) => task.id !== taskId));
    }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !formData.title.trim()) return;

    const { error } = await supabase
      .from("tasks")
      .update(formData)
      .eq("id", editingTask.id);

    if (!error) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id ? { ...task, ...formData } : task
        )
      );
      setEditingTask(null);
      setFormData({
        title: "",
        description: "",
        frequency: "daily",
        category: "general",
        priority: "medium",
      });
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
        <div className="p-6 border-b bg-gray-50">
          <form onSubmit={handleAddTask} className="space-y-4">
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
                <option value="living_room">
                  {t("Living Room", language)}
                </option>
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
            <div className="flex space-x-2">
              <Button type="submit">{t("Add Task", language)}</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                {t("Cancel", language)}
              </Button>
            </div>
          </form>
        </div>
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
                <form onSubmit={handleEditTask} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Task title"
                      value={formData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      value={formData.category}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as any,
                        })
                      }
                      className="h-10 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    >
                      <option value="general">General</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="bathroom">Bathroom</option>
                      <option value="bedroom">Bedroom</option>
                      <option value="living_room">Living Room</option>
                      <option value="laundry">Laundry</option>
                      <option value="exterior">Exterior</option>
                    </select>
                    <select
                      value={formData.priority}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData({
                          ...formData,
                          priority: e.target.value as any,
                        })
                      }
                      className="h-10 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <select
                      value={formData.frequency}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData({
                          ...formData,
                          frequency: e.target.value as any,
                        })
                      }
                      className="h-10 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit">Save Changes</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingTask(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
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

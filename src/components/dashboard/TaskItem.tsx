"use client";

import { useState } from "react";
import { CheckCircle, Circle, Trash2, Edit, Calendar } from "lucide-react";
import { Task, TaskFormData } from "@/types";
import { updateTask, deleteTask, toggleTask } from "@/libs/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { RescheduleModal } from "./RescheduleModal";
import {
  getOverdueStyle,
  getDaysOfWeek,
  getTaskCategories,
  getTaskPriorities,
  getTaskFrequencies,
  formatTaskCategory,
  getTaskStatusBadge,
} from "@/libs/task-utils";

interface TaskItemProps {
  task: Task;
  onTaskUpdated: (updatedTask: Task) => void;
  onTaskDeleted: (taskId: string) => void;
  onReschedule: (taskId: string, newDate: string) => void;
  isPastDate?: boolean;
}

export function TaskItem({
  task,
  onTaskUpdated,
  onTaskDeleted,
  onReschedule,
  isPastDate = false,
}: TaskItemProps) {
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

  const daysOfWeek = getDaysOfWeek(language);

  const handleToggleTask = async (taskId: string) => {
    setTogglingTasks((prev) => new Set(prev).add(taskId));
    try {
      const { task: updatedTask } = await toggleTask(taskId);
      onTaskUpdated(updatedTask);
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
      onTaskDeleted(taskId);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !formData.title.trim()) return;

    try {
      const { task: updatedTask } = await updateTask(editingTask.id, formData);
      onTaskUpdated(updatedTask);
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

  const renderTaskForm = () => (
    <form onSubmit={handleEditTask} className="space-y-4">
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
          {t("Save Changes", language)}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
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
    <>
      <div className="p-4 sm:p-8 hover:bg-base transition-colors">
        {editingTask?.id === task.id ? (
          <div className="bg-base p-4 sm:p-6 rounded-lg">
            {renderTaskForm()}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleToggleTask(task.id)}
                disabled={togglingTasks.has(task.id) || isPastDate}
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
                      task.completed ? "text-text/40" : "text-text/70"
                    }`}
                  >
                    {task.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 sm:space-x-3">
                  {(() => {
                    const statusBadge = getTaskStatusBadge(task, language);
                    return statusBadge ? (
                      <Badge variant="warning" size="sm">
                        {statusBadge.text}
                      </Badge>
                    ) : null;
                  })()}
                  <Badge variant="secondary" size="sm">
                    {formatTaskCategory(task.category)}
                  </Badge>
                  <Badge
                    variant={
                      task.priority === "high"
                        ? "error"
                        : task.priority === "medium"
                        ? "warning"
                        : "success"
                    }
                    size="sm"
                  >
                    {task.priority}
                  </Badge>
                  {task.is_recurring && (
                    <Badge variant="primary" size="sm">
                      {t("Recurring", language)}
                    </Badge>
                  )}
                  {task.day_of_week !== undefined &&
                    task.frequency === "weekly" && (
                      <Badge variant="default" size="sm">
                        {daysOfWeek[task.day_of_week]?.label}
                      </Badge>
                    )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 sm:space-x-3">
              <button
                onClick={() => openRescheduleModal(task)}
                className="text-text/40 hover:text-primary transition-colors p-2"
                title={language === "es" ? "Reprogramar" : "Reschedule"}
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
      <RescheduleModal
        isOpen={rescheduleModal.isOpen}
        onClose={closeRescheduleModal}
        taskId={rescheduleModal.taskId}
        taskTitle={rescheduleModal.taskTitle}
        currentDueDate={rescheduleModal.currentDueDate}
        onReschedule={onReschedule}
      />
    </>
  );
}

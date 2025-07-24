import { useState } from "react";
import { Task, TaskFormData } from "@/types";
import { updateTask } from "@/libs/api";

interface UseTaskFormProps {
  onTaskUpdated: (updatedTask: Task) => void;
}

export function useTaskForm({ onTaskUpdated }: UseTaskFormProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    frequency: "daily",
    category: "general",
    priority: "medium",
    is_recurring: false,
  });

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

  const cancelEditing = () => {
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      frequency: "daily",
      category: "general",
      priority: "medium",
      is_recurring: false,
    });
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !formData.title.trim()) return;

    try {
      const { task: updatedTask } = await updateTask(editingTask.id, formData);
      onTaskUpdated(updatedTask);
      cancelEditing();
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  };

  const updateFormField = <K extends keyof TaskFormData>(
    field: K,
    value: TaskFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    editingTask,
    formData,
    startEditing,
    cancelEditing,
    handleEditTask,
    updateFormField,
  };
}

import { Task, TaskFormData, LegacyTaskFormData } from "@/types";

// API utility functions for secure server-side operations

export async function fetchTasks(filters?: {
  category?: string;
  frequency?: string;
  completed?: boolean;
  dueDate?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.category) params.append("category", filters.category);
  if (filters?.frequency) params.append("frequency", filters.frequency);
  if (filters?.completed !== undefined)
    params.append("completed", filters.completed.toString());
  if (filters?.dueDate) params.append("dueDate", filters.dueDate);

  const response = await fetch(`/api/tasks?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch tasks");
  }

  return response.json();
}

export async function createTask(
  taskData: TaskFormData | LegacyTaskFormData
): Promise<{ task: Task }> {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create task");
  }

  return response.json();
}

export async function updateTask(
  taskId: string,
  taskData: Partial<TaskFormData | LegacyTaskFormData>
): Promise<{ task: Task }> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update task");
  }

  return response.json();
}

export async function deleteTask(
  taskId: string
): Promise<{ success: boolean }> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete task");
  }

  return response.json();
}

export async function toggleTask(taskId: string): Promise<{ task: Task }> {
  const response = await fetch(`/api/tasks/${taskId}/toggle`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to toggle task");
  }

  return response.json();
}

export async function getTask(taskId: string): Promise<{ task: Task }> {
  const response = await fetch(`/api/tasks/${taskId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch task");
  }

  return response.json();
}

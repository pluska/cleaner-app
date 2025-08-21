import { Task, TaskFormData, LegacyTaskFormData } from "@/types";

// Helper function to handle 401 responses
function handleUnauthorizedResponse(response: Response) {
  if (response.status === 401) {
    // Dispatch a custom event that the session context can listen to
    window.dispatchEvent(new CustomEvent("session-expired"));

    // Return a special response object that indicates unauthorized
    // instead of throwing an error immediately
    return { unauthorized: true, response };
  }
  return { unauthorized: false, response };
}

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

  const response = await fetch(`/api/tasks?${params.toString()}`, {
    credentials: "include",
  });

  const { unauthorized } = handleUnauthorizedResponse(response);
  if (unauthorized) {
    // Return empty data instead of throwing error
    return { tasks: [], instances: [] };
  }

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
    credentials: "include",
    body: JSON.stringify(taskData),
  });

  const { unauthorized } = handleUnauthorizedResponse(response);
  if (unauthorized) {
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create task");
  }

  return response.json();
}

export async function updateTask(
  taskId: string,
  updates: Partial<TaskFormData>
): Promise<{ task: Task }> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(updates),
  });

  const { unauthorized } = handleUnauthorizedResponse(response);
  if (unauthorized) {
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update task");
  }

  return response.json();
}

export async function deleteTask(taskId: string): Promise<void> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "DELETE",
    credentials: "include",
  });

  const { unauthorized } = handleUnauthorizedResponse(response);
  if (unauthorized) {
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete task");
  }
}

export async function toggleTaskCompletion(
  taskId: string
): Promise<{ task: Task }> {
  const response = await fetch(`/api/tasks/${taskId}/toggle`, {
    method: "PATCH",
    credentials: "include",
  });

  const { unauthorized } = handleUnauthorizedResponse(response);
  if (unauthorized) {
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to toggle task completion");
  }

  return response.json();
}

export async function getTask(taskId: string): Promise<{ task: Task }> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    credentials: "include",
  });

  const { unauthorized } = handleUnauthorizedResponse(response);
  if (unauthorized) {
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch task");
  }

  return response.json();
}

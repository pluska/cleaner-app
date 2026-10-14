import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTaskForm } from "./useTaskForm";
import { Task } from "@/types";

const { mockUpdateTask } = vi.hoisted(() => ({
  mockUpdateTask: vi.fn(),
}));

vi.mock("@/libs/api", () => ({
  updateTask: mockUpdateTask,
}));

describe("useTaskForm hook", () => {
  const onTaskUpdated = vi.fn();

  const sampleTask: Task = {
    id: "task-100",
    title: "Clean Kitchen",
    description: "Deep clean sink",
    category: "kitchen",
    priority: "high",
    frequency: "weekly",
    is_recurring: true,
    day_of_week: 1,
    preferred_time: "morning",
    completed: false,
    user_id: "user-1",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default empty form state", () => {
    const { result } = renderHook(() => useTaskForm({ onTaskUpdated }));

    expect(result.current.editingTask).toBeNull();
    expect(result.current.formData).toEqual({
      title: "",
      description: "",
      frequency: "daily",
      category: "general",
      priority: "medium",
      is_recurring: false,
    });
  });

  it("populates form when startEditing is called", () => {
    const { result } = renderHook(() => useTaskForm({ onTaskUpdated }));

    act(() => {
      result.current.startEditing(sampleTask);
    });

    expect(result.current.editingTask).toEqual(sampleTask);
    expect(result.current.formData.title).toBe("Clean Kitchen");
    expect(result.current.formData.category).toBe("kitchen");
    expect(result.current.formData.priority).toBe("high");
  });

  it("resets form when cancelEditing is called", () => {
    const { result } = renderHook(() => useTaskForm({ onTaskUpdated }));

    act(() => {
      result.current.startEditing(sampleTask);
      result.current.cancelEditing();
    });

    expect(result.current.editingTask).toBeNull();
    expect(result.current.formData.title).toBe("");
  });

  it("updates individual form fields", () => {
    const { result } = renderHook(() => useTaskForm({ onTaskUpdated }));

    act(() => {
      result.current.updateFormField("title", "New Title");
      result.current.updateFormField("priority", "low");
    });

    expect(result.current.formData.title).toBe("New Title");
    expect(result.current.formData.priority).toBe("low");
  });

  it("submits updated task and triggers callback", async () => {
    const updatedTask = { ...sampleTask, title: "Clean Kitchen Updated" };
    mockUpdateTask.mockResolvedValueOnce({ task: updatedTask });

    const { result } = renderHook(() => useTaskForm({ onTaskUpdated }));

    act(() => {
      result.current.startEditing(sampleTask);
      result.current.updateFormField("title", "Clean Kitchen Updated");
    });

    const fakeEvent = { preventDefault: vi.fn() } as unknown as import("react").FormEvent;

    await act(async () => {
      await result.current.handleEditTask(fakeEvent);
    });

    expect(fakeEvent.preventDefault).toHaveBeenCalled();
    expect(mockUpdateTask).toHaveBeenCalledWith(
      "task-100",
      expect.objectContaining({ title: "Clean Kitchen Updated" })
    );
    expect(onTaskUpdated).toHaveBeenCalledWith(updatedTask);
    expect(result.current.editingTask).toBeNull();
  });

  it("ignores submission if title is empty or no task is being edited", async () => {
    const { result } = renderHook(() => useTaskForm({ onTaskUpdated }));

    const fakeEvent = { preventDefault: vi.fn() } as unknown as import("react").FormEvent;
    await act(async () => {
      await result.current.handleEditTask(fakeEvent);
    });

    expect(mockUpdateTask).not.toHaveBeenCalled();
  });
});

import { describe, expect, it } from "vitest";
import {
  formatTaskCategory,
  getCategoryColor,
  getDaysOfWeek,
  getOverdueStyle,
  getPriorityColor,
  getTaskCategories,
  getTaskFrequencies,
  getTaskPriorities,
  getTaskStatusBadge,
  isTaskOverdue,
} from "./task-utils";
import { Task } from "@/types";

describe("task-utils", () => {
  const baseTask: Task = {
    id: "task-1",
    title: "Test Task",
    category: "general",
    priority: "medium",
    frequency: "daily",
    is_recurring: false,
    completed: false,
    user_id: "user-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it("returns appropriate color classes based on priority", () => {
    expect(getPriorityColor("high")).toBe("text-red-600 bg-red-100");
    expect(getPriorityColor("medium")).toBe("text-primary bg-primary/10");
    expect(getPriorityColor("low")).toBe("text-accent bg-accent/20");
    expect(getPriorityColor("unknown")).toBe("text-text bg-base");
  });

  it("returns appropriate color classes based on category", () => {
    expect(getCategoryColor("kitchen")).toBe("bg-orange-100 text-orange-800");
    expect(getCategoryColor("bathroom")).toBe("bg-primary/20 text-primary");
    expect(getCategoryColor("bedroom")).toBe("bg-purple-100 text-purple-800");
    expect(getCategoryColor("living_room")).toBe("bg-green-100 text-green-800");
    expect(getCategoryColor("laundry")).toBe("bg-accent/20 text-accent");
    expect(getCategoryColor("exterior")).toBe("bg-indigo-100 text-indigo-800");
    expect(getCategoryColor("general")).toBe("bg-base text-text");
    expect(getCategoryColor("custom_area")).toBe("bg-base text-text"); // fallback
  });

  it("correctly evaluates overdue tasks", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const overdueTask: Task = { ...baseTask, due_date: yesterday, completed: false };
    const completedOverdueTask: Task = { ...baseTask, due_date: yesterday, completed: true };
    const futureTask: Task = { ...baseTask, due_date: tomorrow, completed: false };
    const taskWithoutDueDate: Task = { ...baseTask, due_date: undefined };

    expect(isTaskOverdue(overdueTask)).toBe(true);
    expect(isTaskOverdue(completedOverdueTask)).toBe(false);
    expect(isTaskOverdue(futureTask)).toBe(false);
    expect(isTaskOverdue(taskWithoutDueDate)).toBeFalsy();
  });

  it("returns overdue and completion styles", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    const overdueTask: Task = { ...baseTask, due_date: yesterday, completed: false };
    const completedTask: Task = { ...baseTask, completed: true };
    const normalTask: Task = { ...baseTask, completed: false };

    expect(getOverdueStyle(overdueTask)).toBe("text-red-600 font-semibold");
    expect(getOverdueStyle(completedTask)).toBe("line-through text-gray-500");
    expect(getOverdueStyle(normalTask)).toBe("text-gray-900");
  });

  it("provides localized days of the week", () => {
    const enDays = getDaysOfWeek("en");
    const esDays = getDaysOfWeek("es");

    expect(enDays).toHaveLength(7);
    expect(esDays).toHaveLength(7);
    expect(enDays[0]).toEqual({ value: 0, label: "Sunday" });
    expect(esDays[0]).toEqual({ value: 0, label: "Domingo" });
    expect(enDays[1]).toEqual({ value: 1, label: "Monday" });
    expect(esDays[1]).toEqual({ value: 1, label: "Lunes" });
  });

  it("provides localized categories, priorities, and frequencies", () => {
    // Categories
    const enCategories = getTaskCategories("en");
    const esCategories = getTaskCategories("es");
    expect(enCategories.find((c) => c.value === "kitchen")?.label).toBe("Kitchen");
    expect(esCategories.find((c) => c.value === "kitchen")?.label).toBe("Cocina");

    // Priorities
    const enPriorities = getTaskPriorities("en");
    const esPriorities = getTaskPriorities("es");
    expect(enPriorities.find((p) => p.value === "high")?.label).toBe("High Priority");
    expect(esPriorities.find((p) => p.value === "high")?.label).toBe("Alta prioridad");

    // Frequencies
    const enFreq = getTaskFrequencies("en");
    const esFreq = getTaskFrequencies("es");
    expect(enFreq.find((f) => f.value === "daily")?.label).toBe("Daily");
    expect(esFreq.find((f) => f.value === "daily")?.label).toBe("Diario");
  });

  it("formats task category replacing underscores", () => {
    expect(formatTaskCategory("living_room")).toBe("living room");
    expect(formatTaskCategory("kitchen")).toBe("kitchen");
  });

  it("generates correct badges for overdue, completed, and pending tasks", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    const overdueTask: Task = { ...baseTask, due_date: yesterday, completed: false };
    const completedTask: Task = { ...baseTask, completed: true };
    const pendingTask: Task = { ...baseTask, completed: false, due_date: undefined };

    // Overdue badge
    const overdueEn = getTaskStatusBadge(overdueTask, "en");
    const overdueEs = getTaskStatusBadge(overdueTask, "es");
    expect(overdueEn?.text).toBe("Overdue");
    expect(overdueEs?.text).toBe("Atrasado");
    expect(overdueEn?.className).toContain("bg-red-100");

    // Completed badge
    const completedEn = getTaskStatusBadge(completedTask, "en");
    const completedEs = getTaskStatusBadge(completedTask, "es");
    expect(completedEn?.text).toBe("Completed");
    expect(completedEs?.text).toBe("Completado");
    expect(completedEn?.className).toContain("bg-green-100");

    // Pending normal task -> null
    expect(getTaskStatusBadge(pendingTask, "en")).toBeNull();
  });
});

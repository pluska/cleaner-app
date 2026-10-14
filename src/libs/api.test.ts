import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  createTask,
  deleteTask,
  fetchTasks,
  getTask,
  toggleTaskCompletion,
  updateTask,
} from "./api";

describe("libs/api client methods", () => {
  const originalFetch = global.fetch;
  const originalWindow = global.window;

  beforeEach(() => {
    // Mock window and dispatchEvent
    global.window = {
      dispatchEvent: vi.fn(),
    } as unknown as Window & typeof globalThis;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.window = originalWindow;
  });

  describe("fetchTasks", () => {
    it("fetches tasks with filters appended as query params", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ tasks: [{ id: "t1" }], instances: [] }),
      } as Response);

      const res = await fetchTasks({
        category: "kitchen",
        frequency: "daily",
        completed: false,
        dueDate: "2026-06-15",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/tasks?category=kitchen&frequency=daily&completed=false&date=2026-06-15"),
        expect.objectContaining({ credentials: "include" })
      );
      expect(res.tasks).toHaveLength(1);
    });

    it("handles 401 unauthorized response by dispatching session-expired event", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      const res = await fetchTasks();

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: "session-expired" })
      );
      expect(res).toEqual({ tasks: [], instances: [] });
    });

    it("throws error when fetch response is not ok", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Server exploded" }),
      } as Response);

      await expect(fetchTasks()).rejects.toThrow("Server exploded");
    });
  });

  describe("createTask", () => {
    it("posts task payload and returns created task", async () => {
      const mockTask = { id: "new-t" };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ task: mockTask }),
      } as Response);

      const res = await createTask({ title: "Clean Rug" } as Parameters<typeof createTask>[0]);
      expect(res.task).toEqual(mockTask);
    });

    it("throws session expired error on 401", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await expect(createTask({ title: "Clean" } as Parameters<typeof createTask>[0])).rejects.toThrow(
        "Your session has expired"
      );
    });

    it("throws error with server message on 400 failure", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Title is required" }),
      } as Response);

      await expect(createTask({} as Parameters<typeof createTask>[0])).rejects.toThrow("Title is required");
    });
  });

  describe("updateTask", () => {
    it("sends PATCH request with updates", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ task: { id: "t1", title: "Updated" } }),
      } as Response);

      const res = await updateTask("t1", { title: "Updated" });
      expect(res.task.title).toBe("Updated");
      expect(global.fetch).toHaveBeenCalledWith("/api/tasks/t1", expect.objectContaining({method:"PATCH"}));
    });

    it("throws session expired error on 401", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await expect(updateTask("t1", {})).rejects.toThrow("Your session has expired");
    });

    it("throws error on failure", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response);

      await expect(updateTask("t1", {})).rejects.toThrow("Failed to update task");
    });
  });

  describe("deleteTask", () => {
    it("sends DELETE request", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);

      await expect(deleteTask("t1")).resolves.toBeUndefined();
    });

    it("throws session expired error on 401", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await expect(deleteTask("t1")).rejects.toThrow("Your session has expired");
    });

    it("throws error on failure", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Not found" }),
      } as Response);

      await expect(deleteTask("t1")).rejects.toThrow("Not found");
    });
  });

  describe("toggleTaskCompletion", () => {
    it("sends PATCH to toggle endpoint", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ task: { id: "t1", status: "completed" } }),
      } as Response);

      const res = await toggleTaskCompletion("t1");
      expect((res.task as unknown as {status:string}).status).toBe("completed");
    });

    it("throws on 401", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await expect(toggleTaskCompletion("t1")).rejects.toThrow(
        "Your session has expired"
      );
    });

    it("throws on error", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response);

      await expect(toggleTaskCompletion("t1")).rejects.toThrow(
        "Failed to toggle task completion"
      );
    });
  });

  describe("getTask", () => {
    it("fetches single task by ID", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ task: { id: "t1" } }),
      } as Response);

      const res = await getTask("t1");
      expect(res.task.id).toBe("t1");
    });

    it("throws on 401", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await expect(getTask("t1")).rejects.toThrow("Your session has expired");
    });

    it("throws on error", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Task not found" }),
      } as Response);

      await expect(getTask("t1")).rejects.toThrow("Task not found");
    });
  });
});

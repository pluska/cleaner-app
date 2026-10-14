import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockSelect, mockFrom, mockWhere } = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
}));

vi.mock("../db", () => ({
  db: {
    select: mockSelect,
  },
}));

vi.mock("../db/schema", () => ({
  taskTemplates: {
    id: "id",
    userId: "userId",
    isArchived: "isArchived",
    startDate: "startDate",
    roomId: "roomId",
    rrule: "rrule",
    title: "title",
    importanceLevel: "importanceLevel",
  },
  taskInstances: {
    dueDate: "dueDate",
    templateId: "templateId",
  },
  taskSubtemplates: {
    templateId: "templateId",
  },
  rooms: {
    id: "id",
    userId: "userId",
    name: "name",
  },
}));

import { TaskService } from "./taskService";

describe("TaskService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere, innerJoin: () => ({ where: mockWhere }) });
  });

  it("calculates tasks for a date using mathematical RRULE and merges materialized instances", async () => {
    const targetDate = new Date("2026-06-15T12:00:00Z");

    const templateDaily = {
      id: "tmpl-1",
      userId: "user-1",
      title: "Clean Kitchen",
      description: "Wipe surfaces",
      roomId: "room-1",
      rrule: "RRULE:FREQ=DAILY;INTERVAL=1",
      startDate: new Date("2026-06-01T00:00:00Z"),
      importanceLevel: 5,
      isArchived: false,
      healthImpact: "Sanitization",
      scientificSource: "CDC",
    };

    const templateWeeklyNonMatching = {
      id: "tmpl-2",
      userId: "user-1",
      title: "Deep Wash Sunday",
      roomId: "room-1",
      // Sunday only, while 2026-06-15 is Monday
      rrule: "RRULE:FREQ=WEEKLY;BYDAY=SU",
      startDate: new Date("2026-06-01T00:00:00Z"),
      importanceLevel: 3,
      isArchived: false,
    };

    // Call 1: allTemplates
    mockWhere.mockResolvedValueOnce([templateDaily, templateWeeklyNonMatching]);

    // Call 2: userRooms
    mockWhere.mockResolvedValueOnce([{ id: "room-1", name: "kitchen_area" }]);

    // Call 3: materializedInstances for this target date
    mockWhere.mockResolvedValueOnce([
      {
        id: "inst-1",
        templateId: "tmpl-1",
        status: "completed",
        dueDate: "2026-06-15",
      },
    ]);

    // Call 4: subtasks for tmpl-1
    mockWhere.mockResolvedValueOnce([
      { id: "sub-1", templateId: "tmpl-1", orderIndex: 0, estimatedMinutes: 10 },
      { id: "sub-2", templateId: "tmpl-1", orderIndex: 1, estimatedMinutes: 15 },
    ]);

    const tasks = await TaskService.getTasksForDate("user-1", targetDate);

    // Only templateDaily matches the target date
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe("tmpl-1");
    expect(tasks[0].title).toBe("Clean Kitchen");
    expect(tasks[0].room).toBe("KITCHEN AREA");
    expect(tasks[0].duration).toBe(25); // 10 + 15
    expect(tasks[0].difficulty).toBe("HIGH"); // importanceLevel 5
    expect(tasks[0].instanceId).toBe("inst-1");
    expect(tasks[0].completed).toBe(true);
  });

  it("handles virtual instances (not yet materialized) and invalid RRULE gracefully", async () => {
    const targetDate = new Date("2026-06-15T12:00:00Z");

    const templateVirtual = {
      id: "tmpl-virtual",
      userId: "user-1",
      title: "Sweep Living Room",
      roomId: "room-2",
      rrule: "RRULE:FREQ=DAILY",
      startDate: new Date("2026-06-01T00:00:00Z"),
      importanceLevel: 3,
      isArchived: false,
    };

    const templateBrokenRRule = {
      id: "tmpl-broken",
      userId: "user-1",
      title: "Broken Rule",
      roomId: "room-2",
      rrule: "INVALID_SYNTAX_123",
      startDate: new Date("2026-06-01T00:00:00Z"),
      importanceLevel: 1,
      isArchived: false,
    };

    mockWhere.mockResolvedValueOnce([templateVirtual, templateBrokenRRule]);
    mockWhere.mockResolvedValueOnce([{ id: "room-2", name: "living_room" }]);
    mockWhere.mockResolvedValueOnce([]); // No materialized instances
    mockWhere.mockResolvedValueOnce([]); // No subtasks -> default duration 15m

    const tasks = await TaskService.getTasksForDate("user-1", targetDate);

    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe("tmpl-virtual");
    expect(tasks[0].instanceId).toBeNull();
    expect(tasks[0].completed).toBe(false);
    expect(tasks[0].duration).toBe(15);
    expect(tasks[0].difficulty).toBe("MEDIUM");
  });
});

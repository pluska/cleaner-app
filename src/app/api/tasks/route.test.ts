import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  mockAuth,
  mockGetTasksForDate,
  mockSelect,
  mockFrom,
  mockWhere,
  mockInsert,
  mockValues,
} = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockGetTasksForDate: vi.fn(),
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockInsert: vi.fn(),
  mockValues: vi.fn(),
}));

vi.mock("@/services/rescheduleService",()=>({userTimezone:async()=>"UTC"}));

vi.mock("@/auth", () => ({
  auth: mockAuth,
}));

vi.mock("@/services/taskService", () => ({
  TaskService: {
    getTasksForDate: mockGetTasksForDate,
  },
}));

vi.mock("@/db", () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
  },
}));

vi.mock("@/db/schema", () => ({
  rooms: {id:"id",userId:"userId"},
  taskTemplates: {
    id: "id",
    userId: "userId",
    roomId: "roomId",
    title: "title",
    description: "description",
    importanceLevel: "importanceLevel",
    expReward: "expReward",
    healthImpact: "healthImpact",
    scientificSource: "scientificSource",
    aiExplanation: "aiExplanation",
    rrule: "rrule",
    startDate: "startDate",
    endDate: "endDate",
    nextOccurrence: "nextOccurrence",
  },
}));

import { GET, POST } from "./route";

describe("/api/tasks routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockInsert.mockReturnValue({ values: mockValues });
  });

  describe("GET /api/tasks", () => {
    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost:3000/api/tasks?date=2026-06-15");
      const res = await GET(req);

      expect(res.status).toBe(401);
    });

    it("returns 400 for invalid date query param", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });

      const req = new NextRequest("http://localhost:3000/api/tasks?date=not-a-date");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("Invalid date format");
    });

    it("returns tasks list for valid date", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });
      mockGetTasksForDate.mockResolvedValueOnce([{ id: "t-1", title: "Wash Dishes" }]);

      const req = new NextRequest("http://localhost:3000/api/tasks?date=2026-06-15");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.date).toBe("2026-06-15");
      expect(data.tasks).toHaveLength(1);
    });

    it("returns 500 when TaskService throws an error", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });
      mockGetTasksForDate.mockRejectedValueOnce(new Error("Database disconnected"));

      const req = new NextRequest("http://localhost:3000/api/tasks?date=2026-06-15");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("POST /api/tasks", () => {
    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title: "Vacuum" }),
      });
      const res = await POST(req);

      expect(res.status).toBe(401);
    });

    it("validates required title and roomId", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });

      // Missing title
      const reqNoTitle = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({ roomId: "room-1" }),
      });
      const resNoTitle = await POST(reqNoTitle);
      expect(resNoTitle.status).toBe(400);

      // Missing roomId
      mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });
      const reqNoRoom = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title: "Mop floors" }),
      });
      const resNoRoom = await POST(reqNoRoom);
      expect(resNoRoom.status).toBe(400);
    });

    it("validates frequency values", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });

      const req = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: "Clean",
          roomId: "room-1",
          frequency: "every_second_day", // Invalid
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("rejects a room not owned by the current user", async () => {
      mockAuth.mockResolvedValueOnce({user:{id:"u-1"}});
      mockWhere.mockResolvedValueOnce([]);
      const res = await POST(new NextRequest("http://localhost/api/tasks",{method:"POST",body:JSON.stringify({title:"Clean",roomId:"another-users-room"})}));
      expect(res.status).toBe(400);
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("creates task template with daily RRULE string", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });
      mockValues.mockResolvedValueOnce(undefined);
      mockWhere.mockResolvedValueOnce([{id:"room-kitchen"}]);
      mockWhere.mockResolvedValueOnce([
        {
          id: "new-tmpl-1",
          userId: "u-1",
          title: "Daily Counter Scrub",
          roomId: "room-kitchen",
          rrule: "RRULE:FREQ=DAILY",
        },
      ]);

      const req = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: "Daily Counter Scrub",
          roomId: "room-kitchen",
          frequency: "daily",
          importanceLevel: 4,
          expReward: 15,
        }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.task.title).toBe("Daily Counter Scrub");
    });

    it("creates task template with weekly, monthly, yearly and once frequencies", async () => {
      // Weekly
      mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });
      mockValues.mockResolvedValueOnce(undefined);
      mockWhere.mockResolvedValueOnce([{id:"owned-room"}]);
      mockWhere.mockResolvedValueOnce([{ id: "tmpl-weekly", title: "Weekly Wash" }]);

      const reqWeekly = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: "Weekly Wash",
          roomId: "room-bath",
          frequency: "weekly",
          dayOfWeek: 2,
        }),
      });
      const resWeekly = await POST(reqWeekly);
      expect(resWeekly.status).toBe(201);

      // Monthly
      mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });
      mockValues.mockResolvedValueOnce(undefined);
      mockWhere.mockResolvedValueOnce([{id:"owned-room"}]);
      mockWhere.mockResolvedValueOnce([{ id: "tmpl-monthly", title: "Monthly Filter" }]);

      const reqMonthly = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: "Monthly Filter",
          roomId: "room-kitchen",
          frequency: "monthly",
        }),
      });
      const resMonthly = await POST(reqMonthly);
      expect(resMonthly.status).toBe(201);

      // Yearly
      mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });
      mockValues.mockResolvedValueOnce(undefined);
      mockWhere.mockResolvedValueOnce([{id:"owned-room"}]);
      mockWhere.mockResolvedValueOnce([{ id: "tmpl-yearly", title: "Yearly Deep" }]);

      const reqYearly = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: "Yearly Deep",
          roomId: "room-general",
          frequency: "yearly",
        }),
      });
      const resYearly = await POST(reqYearly);
      expect(resYearly.status).toBe(201);

      // Once
      mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });
      mockValues.mockResolvedValueOnce(undefined);
      mockWhere.mockResolvedValueOnce([{id:"owned-room"}]);
      mockWhere.mockResolvedValueOnce([{ id: "tmpl-once", title: "One Time Fix" }]);

      const reqOnce = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: "One Time Fix",
          roomId: "room-attic",
          frequency: "once",
        }),
      });
      const resOnce = await POST(reqOnce);
      expect(resOnce.status).toBe(201);
    });

    it("returns 500 when database insertion fails in POST", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });
      mockValues.mockRejectedValueOnce(new Error("Constraint violation"));
      mockWhere.mockResolvedValueOnce([{id:"room-1"}]);

      const req = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: "Fail Task",
          roomId: "room-1",
        }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });
  });
});

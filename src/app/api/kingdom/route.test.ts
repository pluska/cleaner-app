import { describe, expect, it, vi, beforeEach } from "vitest";

const {
  mockAuth,
  mockGetKingdom,
  mockSaveLayout,
  mockPrepare,
  mockBatch,
  mockBind,
  mockRun,
  mockAll,
} = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockGetKingdom: vi.fn(),
  mockSaveLayout: vi.fn(),
  mockPrepare: vi.fn(),
  mockBatch: vi.fn(),
  mockBind: vi.fn(),
  mockRun: vi.fn(),
  mockAll: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mockAuth,
}));

vi.mock("@/services/kingdomService", () => ({
  ensureKingdom: vi.fn(),
  getKingdom: mockGetKingdom,
  saveLayout: mockSaveLayout,
}));

vi.mock("@/db", () => ({
  database: () => ({
    prepare: mockPrepare,
    batch: mockBatch,
  }),
}));

import { GET, PUT, PATCH } from "./route";

describe("/api/kingdom endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrepare.mockReturnValue({ bind: mockBind });
    mockBind.mockReturnValue({
      run: mockRun,
      all: mockAll,
    });
  });

  describe("GET /api/kingdom", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("returns kingdom state for authenticated user", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "user-123" } });
      mockGetKingdom.mockResolvedValueOnce({
        version: 1,
        buildings: [],
        campaign: { completed: 3, total: 7 },
      });

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.version).toBe(1);
    });

    it("returns 503 if getKingdom fails", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "user-123" } });
      mockGetKingdom.mockRejectedValueOnce(new Error("Service unavailable"));

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(503);
      expect(data.error).toBe("Kingdom unavailable");
    });
  });

  describe("PUT /api/kingdom", () => {
    it("returns 401 when unauthenticated", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const req = new Request("http://localhost:3000/api/kingdom", {
        method: "PUT",
        body: JSON.stringify({ version: 1, positions: [] }),
      });

      const res = await PUT(req);
      expect(res.status).toBe(401);
    });

    it("delegates to saveLayout and returns result status", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "user-123" } });
      mockSaveLayout.mockResolvedValueOnce({
        success: true,
        version: 2,
        status: 200,
      });

      const req = new Request("http://localhost:3000/api/kingdom", {
        method: "PUT",
        body: JSON.stringify({ version: 1, positions: [] }),
      });

      const res = await PUT(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("PATCH /api/kingdom", () => {
    it("updates timezone and resting state and returns fresh kingdom", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "user-123" } });
      mockBatch.mockResolvedValueOnce([]);
      mockGetKingdom.mockResolvedValueOnce({ version: 1, updated: true });

      const req = new Request("http://localhost:3000/api/kingdom", {
        method: "PATCH",
        body: JSON.stringify({
          timezone: "UTC",
          resting: true,
        }),
      });

      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.updated).toBe(true);
    });
  });
});

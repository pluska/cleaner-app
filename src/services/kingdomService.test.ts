import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock D1 database
const mockPrepare = vi.fn();
const mockBatch = vi.fn();
const mockBind = vi.fn();
const mockAll = vi.fn();
const mockFirst = vi.fn();

vi.mock("@/db", () => ({
  database: () => ({
    prepare: mockPrepare,
    batch: mockBatch,
  }),
}));

import { ensureKingdom, getKingdom, saveLayout } from "./kingdomService";

describe("kingdomService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrepare.mockReturnValue({ bind: mockBind });
    mockBind.mockReturnValue({
      all: mockAll,
      first: mockFirst,
    });
  });

  describe("saveLayout", () => {
    const userId = "u123";
    const validPositions = [
      { id: `${userId}:TOWER`, x: 2, y: 2 },
      { id: `${userId}:TAVERN`, x: 5, y: 2 },
      { id: `${userId}:WELL`, x: 8, y: 2 },
      { id: `${userId}:ENTRANCE`, x: 5, y: 8 },
    ];

    it("rejects non-integer version with 400 status", async () => {
      const res = await saveLayout(userId, 1.5, validPositions);
      expect(res.status).toBe(400);
      expect(res.success).toBe(false);
      expect(res.error).toBe("Invalid layout");
    });

    it("rejects invalid positions array with 400 status", async () => {
      const res = await saveLayout(userId, 1, []);
      expect(res.status).toBe(400);
      expect(res.success).toBe(false);
    });

    it("rejects positions belonging to a different user or unknown building kind", async () => {
      const wrongUserPositions = [
        { id: `otherUser:TOWER`, x: 2, y: 2 },
        { id: `${userId}:TAVERN`, x: 5, y: 2 },
        { id: `${userId}:WELL`, x: 8, y: 2 },
        { id: `${userId}:ENTRANCE`, x: 5, y: 8 },
      ];
      const res = await saveLayout(userId, 1, wrongUserPositions);
      expect(res.status).toBe(400);
      expect(res.success).toBe(false);
    });

    it("saves layout successfully when version matches (status 200)", async () => {
      // Mock batch returning updated version
      mockBatch.mockResolvedValueOnce([
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { results: [{ version: 2 }] },
      ]);

      const res = await saveLayout(userId, 1, validPositions);
      expect(res.status).toBe(200);
      expect(res.success).toBe(true);
      expect(res.version).toBe(2);
    });

    it("returns 409 conflict when another session modified the version", async () => {
      // Mock batch returning empty results for version bump (condition failed)
      mockBatch.mockResolvedValueOnce([
        { success: true },
        { success: true },
        { success: true },
        { success: true },
        { results: [] }, // Version check failed
      ]);

      const res = await saveLayout(userId, 1, validPositions);
      expect(res.status).toBe(409);
      expect(res.success).toBe(false);
      expect(res.error).toContain("Reload before saving");
    });
  });

  describe("getKingdom", () => {
    const userId = "u123";

    it("throws an error when profile is unavailable", async () => {
      // ensureKingdom runs batch, then rooms.all
      mockBatch.mockResolvedValueOnce([]);
      mockAll.mockResolvedValueOnce({ results: [] }); // rooms
      // profile returns null
      mockFirst.mockResolvedValueOnce(null);

      await expect(getKingdom(userId)).rejects.toThrow("Profile unavailable");
    });

    it("returns full kingdom data when profile exists", async () => {
      mockBatch.mockResolvedValueOnce([]);
      mockAll.mockResolvedValueOnce({ results: [] }); // rooms in ensureKingdom

      // profile
      mockFirst.mockResolvedValueOnce({
        xp: 150,
        coins: 50,
        level: 2,
        timezone: "UTC",
        resting: 0,
        restStartedAt: null,
        currentStreak: 3,
      });

      // kingdomState
      mockFirst.mockResolvedValueOnce({ version: 4 });

      // buildings
      mockAll.mockResolvedValueOnce({
        results: [
          {
            id: `${userId}:TOWER`,
            kind: "TOWER",
            level: 1,
            x: 5,
            y: 3,
            restoredAt: Date.now() - 86400000,
            corruption: 0,
          },
        ],
      });

      // total rewards count
      mockFirst.mockResolvedValueOnce({ total: 4 });
      // weekly count
      mockFirst.mockResolvedValueOnce({ total: 6 });

      // links
      mockAll.mockResolvedValueOnce({ results: [] });

      const kingdom = await getKingdom(userId);

      expect(kingdom.version).toBe(4);
      expect(kingdom.profile.level).toBe(2);
      expect(kingdom.campaign.completed).toBe(4);
      expect(kingdom.weekly.completed).toBe(6);
      expect(kingdom.weekly.unlocked).toBe(true); // >= 5
    });
  });

  describe("ensureKingdom", () => {
    it("runs batch inserts and links rooms if rooms exist", async () => {
      mockBatch.mockResolvedValueOnce([]);
      mockAll.mockResolvedValueOnce({
        results: [{ id: "room-1", name: "Kitchen" }],
      });
      mockBatch.mockResolvedValueOnce([]); // batch for room links

      await ensureKingdom("u123");

      expect(mockBatch).toHaveBeenCalledTimes(2);
    });
  });
});

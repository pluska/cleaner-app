import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  mockAuth,
  mockSelect,
  mockFrom,
  mockWhere,
  mockInsert,
  mockValues,
  mockReturning,
  mockUpdate,
  mockSet,
} = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockInsert: vi.fn(),
  mockValues: vi.fn(),
  mockReturning: vi.fn(),
  mockUpdate: vi.fn(),
  mockSet: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mockAuth,
}));

vi.mock("@/db", () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
  },
}));

vi.mock("@/db/schema", () => ({
  userProfiles: {
    userId: "userId",
    level: "level",
    xp: "xp",
    coins: "coins",
    currentStreak: "currentStreak",
    maxStreak: "maxStreak",
  },
  users: {
    id: "id",
    name: "name",
    image: "image",
  },
}));

import { GET, PUT } from "./route";

describe("/api/user/profile routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockReturnValue({ onConflictDoNothing: () => ({returning:mockReturning}) });
    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });
  });

  describe("GET /api/user/profile", () => {
    it("returns 401 when unauthenticated", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const res = await GET();
      expect(res.status).toBe(401);
    });

    it("auto-creates default profile if one does not exist", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "u-new" } });
      // Existing profile query returns empty
      mockWhere.mockResolvedValueOnce([]);
      // Insert returns new profile
      mockReturning.mockResolvedValueOnce([
        { userId: "u-new", level: 1, xp: 0, coins: 0 },
      ]);

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.profile.coins).toBe(0);
      expect(data.profile.level).toBe(1);
    });

    it("returns existing profile when found", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "u-veteran" } });
      mockWhere.mockResolvedValueOnce([
        { userId: "u-veteran", level: 5, xp: 450, coins: 250 },
      ]);

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.profile.level).toBe(5);
    });
  });

  describe("PUT /api/user/profile", () => {
    it("returns 400 if updated name has fewer than 2 characters", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });

      const req = new NextRequest("http://localhost:3000/api/user/profile", {
        method: "PUT",
        body: JSON.stringify({ name: "A" }),
      });
      const res = await PUT(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("Name must be at least 2 characters");
    });

    it("updates user profile name and image successfully", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });
      mockWhere.mockResolvedValueOnce(undefined); // update
      mockWhere.mockResolvedValueOnce([
        { userId: "u-1", level: 2, xp: 120 },
      ]); // select profile

      const req = new NextRequest("http://localhost:3000/api/user/profile", {
        method: "PUT",
        body: JSON.stringify({
          display_name: "Paladin of Clean",
          avatar_url: "/avatars/paladin.png",
        }),
      });
      const res = await PUT(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.user.name).toBe("Paladin of Clean");
      expect(data.user.image).toBe("/avatars/paladin.png");
    });
  });
});

import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockAuth, mockSaveLayout } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockSaveLayout: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mockAuth,
}));

vi.mock("@/services/kingdomService", () => ({
  saveLayout: mockSaveLayout,
}));

import { saveKingdomPlacements } from "./kingdom";

describe("saveKingdomPlacements Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized error if session is missing", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const result = await saveKingdomPlacements([], 1);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockSaveLayout).not.toHaveBeenCalled();
  });

  it("calls saveLayout with session user id when authenticated", async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: "user-hero-1" },
    });
    mockSaveLayout.mockResolvedValueOnce({
      success: true,
      version: 2,
      status: 200,
    });

    const positions = [
      { id: "user-hero-1:TOWER", x: 2, y: 2 },
      { id: "user-hero-1:TAVERN", x: 5, y: 2 },
      { id: "user-hero-1:WELL", x: 8, y: 2 },
      { id: "user-hero-1:ENTRANCE", x: 5, y: 8 },
    ];

    const result = await saveKingdomPlacements(positions, 1);

    expect(mockSaveLayout).toHaveBeenCalledWith("user-hero-1", 1, positions);
    expect(result).toEqual({ success: true, version: 2, status: 200 });
  });
});

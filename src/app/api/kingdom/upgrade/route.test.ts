import { describe, expect, it, vi, beforeEach } from "vitest";

const {
  mockAuth,
  mockPrepare,
  mockBind,
  mockAll,
} = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockPrepare: vi.fn(),
  mockBind: vi.fn(),
  mockAll: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mockAuth,
}));

vi.mock("@/db", () => ({
  database: () => ({
    prepare: mockPrepare,
  }),
}));

import { POST } from "./route";

describe("POST /api/kingdom/upgrade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrepare.mockReturnValue({ bind: mockBind });
    mockBind.mockReturnValue({ all: mockAll });
  });

  it("returns 401 when user is not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/kingdom/upgrade", {
      method: "POST",
      body: JSON.stringify({ buildingId: "b-1", level: 1 }),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("returns 400 when level is not 1 or 2 or buildingId is invalid", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });

    const req = new Request("http://localhost:3000/api/kingdom/upgrade", {
      method: "POST",
      body: JSON.stringify({ buildingId: "b-1", level: 5 }), // Invalid level
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid upgrade");
  });

  it("returns 409 when coins are insufficient or building is already upgraded", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });
    mockAll.mockResolvedValueOnce({ results: [] }); // Update condition failed

    const req = new Request("http://localhost:3000/api/kingdom/upgrade", {
      method: "POST",
      body: JSON.stringify({ buildingId: "u-1:TOWER", level: 1 }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toContain("Saldo insuficiente");
  });

  it("returns 200 on successful upgrade", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });
    mockAll.mockResolvedValueOnce({ results: [{ level: 2 }] });

    const req = new Request("http://localhost:3000/api/kingdom/upgrade", {
      method: "POST",
      body: JSON.stringify({ buildingId: "u-1:TOWER", level: 1 }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

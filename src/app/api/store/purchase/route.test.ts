import { describe, expect, it, vi, beforeEach } from "vitest";

const {
  mockAuth,
  mockPrepare,
  mockBind,
  mockFirst,
  mockRun,
} = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockPrepare: vi.fn(),
  mockBind: vi.fn(),
  mockFirst: vi.fn(),
  mockRun: vi.fn(),
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

describe("POST /api/store/purchase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrepare.mockReturnValue({ bind: mockBind });
    mockBind.mockReturnValue({
      first: mockFirst,
      run: mockRun,
    });
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/store/purchase", {
      method: "POST",
      body: JSON.stringify({ rewardId: "potion-1", requestId: "req-12345678" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("returns 400 when rewardId or requestId is invalid", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });

    // Too short requestId (< 8 chars)
    const req = new Request("http://localhost:3000/api/store/purchase", {
      method: "POST",
      body: JSON.stringify({ rewardId: "potion-1", requestId: "short" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("rewardId and requestId required");
  });

  it("returns 409 conflict when requestId was already used for a different reward", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });
    // Prior purchase exists with different rewardId
    mockFirst.mockResolvedValueOnce({ rewardId: "other-potion" });

    const req = new Request("http://localhost:3000/api/store/purchase", {
      method: "POST",
      body: JSON.stringify({ rewardId: "potion-1", requestId: "req-12345678" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toBe("Request already used");
  });

  it("returns 400 when user has insufficient balance", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });
    mockFirst.mockResolvedValueOnce(null); // No prior purchase with different reward
    mockRun.mockResolvedValueOnce({ success: true });
    // Record was not inserted due to insufficient balance
    mockFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/store/purchase", {
      method: "POST",
      body: JSON.stringify({ rewardId: "potion-expensive", requestId: "req-12345678" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Reward unavailable or insufficient balance");
  });

  it("processes purchase successfully and returns updated coin balance", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "u-1" } });
    mockFirst.mockResolvedValueOnce(null); // No prior
    mockRun.mockResolvedValueOnce({ success: true });
    // Bought successfully
    mockFirst.mockResolvedValueOnce({ rewardId: "potion-speed" });
    // New profile balance
    mockFirst.mockResolvedValueOnce({ coins: 75 });

    const req = new Request("http://localhost:3000/api/store/purchase", {
      method: "POST",
      body: JSON.stringify({ rewardId: "potion-speed", requestId: "req-12345678" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.newBalance).toBe(75);
  });
});

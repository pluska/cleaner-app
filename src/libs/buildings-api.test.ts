import { describe, expect, it, vi, beforeEach } from "vitest";

const {
  mockSelect,
  mockFrom,
  mockWhere,
  mockUpdate,
  mockSet,
  mockInsert,
  mockValues,
  mockReturning,
} = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockUpdate: vi.fn(),
  mockSet: vi.fn(),
  mockInsert: vi.fn(),
  mockValues: vi.fn(),
  mockReturning: vi.fn(),
}));

vi.mock("@/auth", () => ({auth:async()=>({user:{id:"u-1"}})}));

vi.mock("@/db", () => ({
  db: {
    select: mockSelect,
    update: mockUpdate,
    insert: mockInsert,
  },
}));

vi.mock("@/db/schema", () => ({
  buildings: {
    id: "id",
    userId: "userId",
    type: "type",
    name: "name",
    level: "level",
    slotIndex: "slotIndex",
    corruptionLevel: "corruptionLevel",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
}));

import { fetchUserBuildings, updateBuildingSlot, createBuilding } from "./buildings-api";

describe("buildings-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches user buildings and formats dates as ISO strings", async () => {
    const fakeDate = new Date("2026-01-01T00:00:00.000Z");
    const mockDbRow = {
      id: "b-1",
      userId: "u-1",
      type: "TOWER",
      name: "Torre",
      level: 1,
      slotIndex: 0,
      corruptionLevel: 10,
      createdAt: fakeDate,
      updatedAt: fakeDate,
    };

    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockResolvedValueOnce([mockDbRow]);

    const result = await fetchUserBuildings("u-1");

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "b-1",
      user_id: "u-1",
      type: "TOWER",
      name: "Torre",
      level: 1,
      slot_index: 0,
      corruption_level: 10,
      created_at: fakeDate.toISOString(),
      updated_at: fakeDate.toISOString(),
    });
  });

  it("updates building slot index and timestamp", async () => {
    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });
    mockWhere.mockResolvedValueOnce(undefined);

    await updateBuildingSlot("b-1", 4);

    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ slotIndex: 4 })
    );
  });

  it("creates building and returns transformed Building model", async () => {
    const fakeDate = new Date("2026-01-01T00:00:00.000Z");
    const newDbRecord = {
      id: "b-new",
      userId: "u-1",
      type: "TAVERN",
      name: "Taberna",
      level: 1,
      slotIndex: 2,
      corruptionLevel: 0,
      createdAt: fakeDate,
      updatedAt: fakeDate,
    };

    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockReturnValue({ returning: mockReturning });
    mockReturning.mockResolvedValueOnce([newDbRecord]);

    const created = await createBuilding({
      user_id: "u-1",
      type: "TAVERN",
      name: "Taberna",
      level: 1,
      slot_index: 2,
      corruption_level: 0,
    });

    expect(created.id).toBe("b-new");
    expect(created.user_id).toBe("u-1");
    expect(created.created_at).toBe(fakeDate.toISOString());
  });
});

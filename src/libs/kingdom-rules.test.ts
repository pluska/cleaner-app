import { describe, expect, it } from "vitest";
import {
  BUILDINGS,
  corruption,
  localDay,
  roomKind,
  validDay,
  validPositions,
} from "./kingdom-rules";

describe("kingdom rules", () => {
  it("defines standard medieval buildings", () => {
    expect(BUILDINGS).toHaveLength(4);
    expect(BUILDINGS.map((b) => b.kind)).toEqual([
      "TOWER",
      "TAVERN",
      "WELL",
      "ENTRANCE",
    ]);
    expect(BUILDINGS[0]).toMatchObject({
      kind: "TOWER",
      name: "Torre de Sparklin",
      x: 5,
      y: 3,
    });
  });

  it("calculates local day according to timezone", () => {
    const fixedDate = new Date("2026-06-15T02:00:00Z");
    const dayUTC = localDay(fixedDate, "UTC");
    const dayNY = localDay(fixedDate, "America/New_York");
    expect(dayUTC).toBe("2026-06-15");
    expect(dayNY).toBe("2026-06-14");
  });

  it("maps home rooms to medieval buildings in English and Spanish", () => {
    // TAVERN
    expect(roomKind("Kitchen")).toBe("TAVERN");
    expect(roomKind("Cocina principal")).toBe("TAVERN");
    expect(roomKind("Comedor")).toBe("TAVERN");
    expect(roomKind("Dining room")).toBe("TAVERN");

    // WELL
    expect(roomKind("Bathroom")).toBe("WELL");
    expect(roomKind("Baño de visitas")).toBe("WELL");
    expect(roomKind("Lavandería")).toBe("WELL");
    expect(roomKind("Laundry room")).toBe("WELL");

    // ENTRANCE
    expect(roomKind("Living room")).toBe("ENTRANCE");
    expect(roomKind("Sala de estar")).toBe("ENTRANCE");
    expect(roomKind("Entrada")).toBe("ENTRANCE");
    expect(roomKind("Hallway")).toBe("ENTRANCE");

    // Fallback -> TOWER
    expect(roomKind("Bedroom")).toBe("TOWER");
    expect(roomKind("Dormitorio")).toBe("TOWER");
    expect(roomKind("Unknown chamber")).toBe("TOWER");
  });

  it("validates ISO dates strictly", () => {
    expect(validDay("2026-09-26")).toBe(true);
    expect(validDay("2024-02-29")).toBe(true); // leap year valid
    expect(validDay("2023-02-29")).toBe(false); // invalid date
    expect(validDay("2026-09-31")).toBe(false); // 31 days in Sept is invalid
    expect(validDay("tomorrow")).toBe(false);
    expect(validDay("2026-9-1")).toBe(false);
    expect(validDay(null)).toBe(false);
    expect(validDay(undefined)).toBe(false);
    expect(validDay(12345)).toBe(false);
  });

  it("calculates corruption progression with grace period and cap", () => {
    const now = 1000000000000;
    const dayMs = 86400000;

    // Grace period (0-2 days): 0 corruption
    expect(corruption(now, now)).toBe(0);
    expect(corruption(now - 1 * dayMs, now)).toBe(0);
    expect(corruption(now - 2 * dayMs, now)).toBe(0);

    // Days past grace period
    expect(corruption(now - 3 * dayMs, now)).toBe(10);
    expect(corruption(now - 5 * dayMs, now)).toBe(30);
    expect(corruption(now - 7 * dayMs, now)).toBe(50);

    // Cap at 100
    expect(corruption(now - 15 * dayMs, now)).toBe(100);
    expect(corruption(now - 30 * dayMs, now)).toBe(100);

    // Future dates do not generate negative corruption
    expect(corruption(now + 2 * dayMs, now)).toBe(0);
  });

  it("validates kingdom grid placements strictly", () => {
    const validSet = [
      { id: "u:TOWER", x: 2, y: 2 },
      { id: "u:TAVERN", x: 5, y: 2 },
      { id: "u:WELL", x: 8, y: 2 },
      { id: "u:ENTRANCE", x: 5, y: 8 },
    ];
    expect(validPositions(validSet)).toBe(true);

    // Fewer or more than 4 buildings
    expect(validPositions(validSet.slice(0, 3))).toBe(false);
    expect(
      validPositions([...validSet, { id: "u:EXTRA", x: 1, y: 1 }])
    ).toBe(false);

    // Duplicate IDs
    expect(
      validPositions([
        { id: "u:TOWER", x: 2, y: 2 },
        { id: "u:TOWER", x: 5, y: 2 },
        { id: "u:WELL", x: 8, y: 2 },
        { id: "u:ENTRANCE", x: 5, y: 8 },
      ])
    ).toBe(false);

    // Out of bounds coordinates (<1 or >10 or non-integer)
    expect(
      validPositions([
        { id: "u:1", x: 0, y: 2 },
        { id: "u:2", x: 4, y: 2 },
        { id: "u:3", x: 6, y: 2 },
        { id: "u:4", x: 8, y: 2 },
      ])
    ).toBe(false);
    expect(
      validPositions([
        { id: "u:1", x: 11, y: 2 },
        { id: "u:2", x: 4, y: 2 },
        { id: "u:3", x: 6, y: 2 },
        { id: "u:4", x: 8, y: 2 },
      ])
    ).toBe(false);
    expect(
      validPositions([
        { id: "u:1", x: 2.5, y: 2 },
        { id: "u:2", x: 5, y: 2 },
        { id: "u:3", x: 7, y: 2 },
        { id: "u:4", x: 9, y: 2 },
      ])
    ).toBe(false);

    // Distance violation (< 2 apart in both x and y)
    expect(
      validPositions([
        { id: "u:1", x: 2, y: 2 },
        { id: "u:2", x: 3, y: 3 }, // distance is 1 in x and 1 in y (< 2)
        { id: "u:3", x: 6, y: 6 },
        { id: "u:4", x: 9, y: 9 },
      ])
    ).toBe(false);
  });
});

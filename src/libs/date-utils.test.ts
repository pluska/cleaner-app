import { describe, expect, it } from "vitest";
import { formatDateToYYYYMMDD, getTodayDate, getWeekStart } from "./date-utils";

describe("date-utils", () => {
  it("returns today date in YYYY-MM-DD format", () => {
    const today = getTodayDate();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const [year, month, day] = today.split("-").map(Number);
    expect(year).toBeGreaterThanOrEqual(2025);
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(31);
  });

  it("formats arbitrary Date objects to YYYY-MM-DD correctly with zero-padding", () => {
    const d1 = new Date(2026, 0, 5); // Jan 5, 2026
    expect(formatDateToYYYYMMDD(d1)).toBe("2026-01-05");

    const d2 = new Date(2026, 11, 25); // Dec 25, 2026
    expect(formatDateToYYYYMMDD(d2)).toBe("2026-12-25");
  });

  it("calculates Monday as the week start for any given date", () => {
    // 2026-06-15 is a Monday
    const monday = new Date(2026, 5, 15);
    const startFromMonday = getWeekStart(monday);
    expect(startFromMonday.getDay()).toBe(1); // Monday
    expect(formatDateToYYYYMMDD(startFromMonday)).toBe("2026-06-15");

    // 2026-06-17 is a Wednesday -> Monday should be 2026-06-15
    const wednesday = new Date(2026, 5, 17);
    const startFromWednesday = getWeekStart(wednesday);
    expect(startFromWednesday.getDay()).toBe(1);
    expect(formatDateToYYYYMMDD(startFromWednesday)).toBe("2026-06-15");

    // 2026-06-21 is a Sunday -> Monday should still be 2026-06-15
    const sunday = new Date(2026, 5, 21);
    const startFromSunday = getWeekStart(sunday);
    expect(startFromSunday.getDay()).toBe(1);
    expect(formatDateToYYYYMMDD(startFromSunday)).toBe("2026-06-15");
  });
});

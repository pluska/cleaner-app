import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("merges multiple class strings together", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
  });

  it("handles conditional classes and falsy values", () => {
    const isTrue = true;
    const isFalse = false;
    expect(cn("base-class", isTrue && "active", isFalse && "hidden", null, undefined)).toBe(
      "base-class active"
    );
  });

  it("resolves Tailwind CSS conflicts through twMerge", () => {
    // px-4 should override px-2
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    // text-red-600 should override text-blue-500
    expect(cn("text-blue-500", "text-red-600")).toBe("text-red-600");
  });

  it("handles arrays and object formats", () => {
    expect(
      cn(["btn", "btn-primary"], { "opacity-50": false, "cursor-pointer": true })
    ).toBe("btn btn-primary cursor-pointer");
  });
});

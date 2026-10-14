import { describe, expect, it, afterEach, vi } from "vitest";
import { detectLanguage, t, translations } from "./translations";

describe("translations", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("contains both english and spanish language dictionaries", () => {
    expect(translations.en).toBeDefined();
    expect(translations.es).toBeDefined();
    expect(Object.keys(translations.en).length).toBeGreaterThan(100);
    expect(Object.keys(translations.es).length).toBeGreaterThan(100);
  });

  it("contains critical application and navigation keys in both languages", () => {
    const criticalKeys = [
      "SparkClean",
      "Today",
      "Routine",
      "Schedule",
      "Sign In",
      "Sign Up",
      "Email",
      "Password",
    ];

    criticalKeys.forEach((key) => {
      expect(translations.en[key as keyof typeof translations.en]).toBeDefined();
      expect(translations.es[key as keyof typeof translations.es]).toBeDefined();
      expect(
        typeof translations.en[key as keyof typeof translations.en]
      ).toBe("string");
      expect(
        typeof translations.es[key as keyof typeof translations.es]
      ).toBe("string");
    });
  });

  it("has high parity of keys between english and spanish dictionaries", () => {
    const enKeys = Object.keys(translations.en);
    const esKeys = new Set(Object.keys(translations.es));

    let matchingCount = 0;
    enKeys.forEach((k) => {
      if (esKeys.has(k)) {
        matchingCount++;
      }
    });

    const parityPercentage = (matchingCount / enKeys.length) * 100;
    expect(parityPercentage).toBeGreaterThanOrEqual(95);
  });

  it("translates keys with fallback to key name if missing", () => {
    expect(t("Today", "en")).toBe("Today");
    expect(t("Today", "es")).toBe("Hoy");
    // @ts-expect-error Testing fallback for unknown key
    expect(t("UNKNOWN_KEY", "es")).toBe("UNKNOWN_KEY");
  });

  it("detects language from browser or defaults to english", () => {
    // When window is defined and language starts with es
    vi.stubGlobal("window", {});
    vi.stubGlobal("navigator", { language: "es-MX" });
    expect(detectLanguage()).toBe("es");

    // When window is defined and language is en
    vi.stubGlobal("navigator", { language: "en-US" });
    expect(detectLanguage()).toBe("en");
  });
});

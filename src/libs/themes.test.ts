import { describe, expect, it } from "vitest";
import { getTheme, themes, ThemeType } from "./themes";

describe("themes", () => {
  const expectedThemes: ThemeType[] = ["brand", "ranger", "noble", "high_elf"];

  it("defines all expected theme variants", () => {
    expectedThemes.forEach((t) => {
      expect(themes[t]).toBeDefined();
      expect(themes[t].id).toBe(t);
      expect(typeof themes[t].name).toBe("string");
    });
  });

  it("contains all required color tokens for every theme", () => {
    const requiredColors = [
      "primary",
      "secondary",
      "background",
      "surface",
      "text",
      "border",
      "accent",
    ];

    expectedThemes.forEach((t) => {
      const theme = themes[t];
      requiredColors.forEach((colorKey) => {
        expect(theme.colors[colorKey as keyof typeof theme.colors]).toBeDefined();
        expect(typeof theme.colors[colorKey as keyof typeof theme.colors]).toBe("string");
        expect(theme.colors[colorKey as keyof typeof theme.colors]).toMatch(
          /^(#|rgba?|hsl)/
        );
      });
    });
  });

  it("contains asset textures and typography definitions for every theme", () => {
    expectedThemes.forEach((t) => {
      const theme = themes[t];
      expect(theme.assets).toBeDefined();
      expect(typeof theme.assets.bgPattern).toBe("string");
      expect(typeof theme.assets.buttonTexture).toBe("string");

      expect(theme.typography).toBeDefined();
      expect(typeof theme.typography.heading).toBe("string");
    });
  });

  it("retrieves theme by id or falls back to brand theme", () => {
    expect(getTheme("ranger").id).toBe("ranger");
    expect(getTheme("noble").id).toBe("noble");
    expect(getTheme("non_existing_theme").id).toBe("brand");
  });
});

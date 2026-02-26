"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Theme, themes, ThemeType, getTheme } from "@/libs/themes";

interface ThemeContextType {
  theme: Theme;
  setThemeId: (id: ThemeType) => void;
  currentThemeId: ThemeType;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState<ThemeType>("brand");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Force the brand theme for now as there is no UI to switch Gamification themes
    setCurrentThemeId("brand");
    localStorage.setItem("gamification_theme", "brand");
  }, []);

  const handleSetTheme = (id: ThemeType) => {
    setCurrentThemeId(id);
    localStorage.setItem("gamification_theme", id);
  };

  const value = {
    theme: getTheme(currentThemeId),
    setThemeId: handleSetTheme,
    currentThemeId,
  };

  // Prevent hydration mismatch by rendering default theme until mounted
  // or simple return children if you don't mind a flicker
  
  return (
    <ThemeContext.Provider value={value}>
       <div 
         style={{
           // CSS Variables for easier usage in Tailwind
           '--theme-primary': value.theme.colors.primary,
           '--theme-secondary': value.theme.colors.secondary,
           '--theme-bg': value.theme.colors.background,
           '--theme-surface': value.theme.colors.surface,
           '--theme-text': value.theme.colors.text,
           '--theme-border': value.theme.colors.border,
           backgroundImage: value.theme.assets.bgPattern,
           backgroundSize: 'cover',
           backgroundAttachment: 'fixed',
           backgroundBlendMode: 'overlay',
         } as React.CSSProperties}
         className="min-h-screen transition-all duration-500 bg-[var(--theme-bg)] text-[var(--theme-text)]"
       >
        {children}
       </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

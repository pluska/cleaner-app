"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, detectLanguage } from "@/libs/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Detect browser language on mount
    const detectedLang = detectLanguage();
    setLanguage(detectedLang);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    // Optionally save to localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("cleaner-planner-language", lang);
    }
  };

  useEffect(() => {
    // Load saved language preference
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem(
        "cleaner-planner-language"
      ) as Language;
      if (savedLang && (savedLang === "en" || savedLang === "es")) {
        setLanguage(savedLang);
      }
    }
  }, []);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

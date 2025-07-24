"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-gray-500" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as "en" | "es")}
        className="text-sm font-medium text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
}

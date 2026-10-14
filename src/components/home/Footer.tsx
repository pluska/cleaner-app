"use client";

import { Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="mt-20 bg-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Sparkles className="h-6 w-6 text-secondary" />
          <span className="text-xl font-bold">SparkClean</span>
        </div>
        <p className="text-white/70">
          © {new Date().getFullYear()} SparkClean. {language === "es" ? "Todos los derechos reservados." : "All rights reserved."}
        </p>
      </div>
    </footer>
  );
}

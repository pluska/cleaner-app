"use client";

import { BrandLogo } from "@/components/ui/layout/BrandLogo";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="landing-footer">
      <BrandLogo />
        <p >
          © {new Date().getFullYear()} SparkClean. {language === "es" ? "Todos los derechos reservados." : "All rights reserved."}
        </p>
    </footer>
  );
}

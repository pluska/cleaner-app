"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";

export function DashboardHeader() {
  const { language } = useLanguage();

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return date.toLocaleDateString(
      language === "es" ? "es-ES" : "en-US",
      options
    );
  };

  return (
    <div className="mb-12 pb-6 border-b border-gray-200">
      <h1 className="text-4xl font-bold text-text mb-4">
        {t("Today", language)}
      </h1>
      <p className="text-lg text-text/70">{formatDate(new Date())}</p>
    </div>
  );
}

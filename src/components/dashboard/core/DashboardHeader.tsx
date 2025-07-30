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
    <div className="mb-12 pb-8 border-b border-base">
      <h1 className="text-3xl sm:text-4xl font-bold text-text mb-4">
        {t("Today", language)}
      </h1>
      <p className="text-lg sm:text-xl text-text/70 font-medium">
        {formatDate(new Date())}
      </p>
    </div>
  );
}

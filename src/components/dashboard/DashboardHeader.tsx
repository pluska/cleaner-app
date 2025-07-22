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
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {t("Today", language)}
      </h1>
      <p className="text-gray-600">{formatDate(new Date())}</p>
    </div>
  );
}

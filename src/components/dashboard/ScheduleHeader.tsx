"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";

export function ScheduleHeader() {
  const { language } = useLanguage();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {t("Task Schedule", language)}
      </h1>
      <p className="text-gray-600">
        {t(
          "View and manage your cleaning tasks by different time periods",
          language
        )}
      </p>
    </div>
  );
}

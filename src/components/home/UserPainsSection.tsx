"use client";

import { DesignIcon, type DesignIconName } from "./DesignIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { Card } from "@/components/ui/layout/Card";

export function UserPainsSection() {
  const { language } = useLanguage();

  const pains = [
    {
      icon: "heart" as DesignIconName,
      title: t("Lack of Motivation", language),
      pain: t(
        "I know I need to clean, but I just can't get started. It feels like a chore, not something I want to do.",
        language
      ),
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      icon: "sparkles" as DesignIconName,
      title: t("Overwhelmed by Mess", language),
      pain: t(
        "The mess is too big. I don't know where to begin, so I end up doing nothing at all.",
        language
      ),
      color: "from-blue-500 to-purple-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      icon: "users" as DesignIconName,
      title: t("Can't Stay Consistent", language),
      pain: t(
        "I clean once in a while, but then I stop. I wish I could build a habit that actually sticks.",
        language
      ),
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  ];

  return (
    <section className="landing-section">
      <h2>{t("Why is cleaning so hard?", language)}</h2>
      <p>{t("It's not you. It's the boring, endless nature of chores. We fixed that.", language)}</p>
      <div className="landing-card-grid">
        {pains.map((pain) => (
          <Card key={pain.title} className="landing-feature-card" shadow="sm">
            <DesignIcon name={pain.icon} />
            <h3>{pain.title}</h3>
            <p>&quot;{pain.pain}&quot;</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

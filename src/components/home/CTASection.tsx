"use client";

import { DesignIcon } from "./DesignIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { Card } from "@/components/ui/layout/Card";
import { Button } from "@/components/ui/forms/Button";

interface CTASectionProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  const { language } = useLanguage();

  return (
    <Card className="landing-cta" shadow="sm">
      <DesignIcon name="crown" />
      <h2 >
        {t("Beat the Mess for Good", language)}
      </h2>
      <p >
        {t(
          "Join thousands of users who have turned their chores into a game. Stop cleaning, start playing.",
          language
        )}
      </p>
      <Button
        onClick={onGetStarted}
        variant="primary"
        size="lg"
        className="group"
      >
        {t("Gamify My Cleaning", language)}
      </Button>
    </Card>
  );
}

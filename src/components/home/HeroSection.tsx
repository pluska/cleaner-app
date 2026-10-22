"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { Button } from "@/components/ui/forms/Button";

interface HeroSectionProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function HeroSection({ onGetStarted, onSignIn }: HeroSectionProps) {
  const { language } = useLanguage();

  return (
    <div className="landing-hero-copy">
      <h1 >
        {t("Turn Cleaning Into a Game", language)}
      </h1>
      <p >
        {t(
          "Stop procrastinating. Turn boring chores into rewarding quests, track your XP, and build a home you're proud of.",
          language
        )}
      </p>

      <div className="landing-hero-actions">
        <Button
          onClick={onGetStarted}
          variant="primary"
          size="lg"
          className="group"
        >
          {t("Start Playing", language)}
        </Button>
        <Button onClick={onSignIn} variant="secondary" size="lg">
          {t("Sign In", language)}
        </Button>
      </div>
    </div>
  );
}

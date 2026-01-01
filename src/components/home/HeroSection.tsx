"use client";

import { Trophy } from "lucide-react";
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
    <div className="text-left">
      <h1 className="text-primary text-5xl md:text-6xl font-bold mb-6 leading-tight">
        {t("Turn Cleaning Into a Game", language)}
      </h1>
      <p className="text-xl text-dark/70 mb-8 max-w-lg leading-relaxed">
        {t(
          "Stop procrastinating. Turn boring chores into rewarding quests, track your XP, and build a home you're proud of.",
          language
        )}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onGetStarted}
          variant="primary"
          size="lg"
          className="group"
        >
          <Trophy className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          {t("Start Playing", language)}
        </Button>
        <Button onClick={onSignIn} variant="ghost" size="lg">
          {t("Sign In", language)}
        </Button>
      </div>
    </div>
  );
}

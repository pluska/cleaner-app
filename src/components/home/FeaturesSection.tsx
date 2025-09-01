"use client";

import { CheckCircle, Calendar, Target, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { Card } from "@/components/ui/layout/Card";

export function FeaturesSection() {
  const { language } = useLanguage();

  return (
    <div className="mt-20 grid md:grid-cols-3 gap-8">
      <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 group">
        <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-dark mb-2">
          {t("Smart Task Management", language)}
        </h3>
        <p className="text-dark/70 mb-4">
          {t(
            "Create and organize cleaning tasks by room, priority, and frequency. Mark them complete and track your progress.",
            language
          )}
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-primary">
          <Star className="w-4 h-4" />
          <span>{t("+15 XP per task", language)}</span>
        </div>
      </Card>

      <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 group">
        <div className="bg-secondary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Calendar className="h-8 w-8 text-secondary" />
        </div>
        <h3 className="text-xl font-semibold text-dark mb-2">
          {t("Smart Scheduling", language)}
        </h3>
        <p className="text-dark/70 mb-4">
          {t(
            "AI-powered scheduling that adapts to your routine and suggests optimal cleaning times based on your habits.",
            language
          )}
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-secondary">
          <Target className="w-4 h-4" />
          <span>Smart AI scheduling</span>
        </div>
      </Card>

      <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 group">
        <div className="bg-gradient-to-br from-primary to-secondary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Target className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-dark mb-2">
          {t("Progress Tracking", language)}
        </h3>
        <p className="text-dark/70 mb-4">
          {t(
            "Visual progress tracking with streaks, achievements, and detailed analytics to keep you motivated.",
            language
          )}
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-primary">
          <Star className="w-4 h-4" />
          <span>Detailed analytics</span>
        </div>
      </Card>
    </div>
  );
}

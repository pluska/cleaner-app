"use client";

import {
  Trophy,
  Coins,
  Heart,
  Gem,
  Star,
  Zap,
  Award,
  Target,
  CheckCircle,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { Card } from "@/components/ui/layout/Card";

export function GamificationFeatures() {
  const { language } = useLanguage();

  return (
    <div className="mt-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-dark mb-4">
          {t("Cleaning made simple, motivating, and stress-free", language)}
        </h2>
        <p className="text-dark/70 max-w-2xl mx-auto">
          {t(
            "Tidy up faster, stay consistent, and enjoy a spotless home effortlessly!",
            language
          )}
        </p>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-20">
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
            <span>{t("Smart AI scheduling", language)}</span>
          </div>
        </Card>

        <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 group">
          <div className="bg-gradient-to-br from-primary to-secondary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-8 w-8 text-black" />
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
            <span>{t("Detailed analytics", language)}</span>
          </div>
        </Card>
      </div>

      {/* Gamification Features */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-8 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-2xl">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-dark mb-2">
                {t("Level System", language)}
              </h3>
              <p className="text-dark/70 mb-4">
                {t(
                  "Level up by completing tasks and unlock new features and special rewards.",
                  language
                )}
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-primary">
                <Star className="w-4 h-4" />
                <span>{t("25 levels available", language)}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-secondary to-primary p-3 rounded-2xl">
              <Coins className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-dark mb-2">
                {t("Experience Points", language)}
              </h3>
              <p className="text-dark/70 mb-4">
                {t(
                  "Earn XP for each completed task and build your professional cleaning profile.",
                  language
                )}
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-secondary">
                <Zap className="w-4 h-4" />
                <span>{t("5-50 XP per task", language)}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-2xl">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-dark mb-2">
                {t("Streaks & Achievements", language)}
              </h3>
              <p className="text-dark/70 mb-4">
                {t(
                  "Maintain daily cleaning streaks and unlock special achievements for your consistency.",
                  language
                )}
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-primary">
                <Award className="w-4 h-4" />
                <span>{t("100+ achievements", language)}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-secondary to-primary p-3 rounded-2xl">
              <Gem className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-dark mb-2">
                {t("Tool Inventory", language)}
              </h3>
              <p className="text-dark/70 mb-4">
                {t(
                  "Unlock and customize your cleaning tool inventory as you progress.",
                  language
                )}
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-secondary">
                <Target className="w-4 h-4" />
                <span>{t("50+ tools available", language)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

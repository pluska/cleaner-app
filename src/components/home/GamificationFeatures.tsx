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
          {t("Cleaning made fun, easy, and rewarding", language)}
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
            {t("Daily Quests", language)}
          </h3>
          <p className="text-dark/70 mb-4">
            {t(
              "Turn your to-do list into a series of bite-sized quests. Complete them to earn rewards and clear your mind.",
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
            {t("Smart Schedule", language)}
          </h3>
          <p className="text-dark/70 mb-4">
            {t(
              "Never worry about what to clean next. Our AI builds a perfect schedule that adapts to your life, not the other way around.",
              language
            )}
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-secondary">
            <Target className="w-4 h-4" />
            <span>{t("Auto-pilot mode", language)}</span>
          </div>
        </Card>

        <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 group">
          <div className="bg-gradient-to-br from-primary to-secondary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-8 w-8 text-black" />
          </div>
          <h3 className="text-xl font-semibold text-dark mb-2">
            {t("Level Up Your Life", language)}
          </h3>
          <p className="text-dark/70 mb-4">
            {t(
              "Watch your character grow as your home becomes cleaner. Build real-world habits that stick forever.",
              language
            )}
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-primary">
            <Star className="w-4 h-4" />
            <span>{t("Become a Pro", language)}</span>
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
                {t("Real Progression", language)}
              </h3>
              <p className="text-dark/70 mb-4">
                {t(
                  "Earn XP for every minute you clean. Unlock new titles, badges, and customization options.",
                  language
                )}
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-primary">
                <Star className="w-4 h-4" />
                <span>{t("Infinite levels", language)}</span>
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
                {t("Instant Gratification", language)}
              </h3>
              <p className="text-dark/70 mb-4">
                {t(
                  "Get immediate feedback for your hard work. Every completed task gives you a dopamine hit.",
                  language
                )}
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-secondary">
                <Zap className="w-4 h-4" />
                <span>{t("Feel good instantly", language)}</span>
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

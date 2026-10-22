"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { Card } from "@/components/ui/layout/Card";
import { DesignIcon, type DesignIconName } from "./DesignIcon";

const features = [
  {
    "icon": "check",
    "title": "Daily Quests",
    "body": "Turn your to-do list into a series of bite-sized quests. Complete them to earn rewards and clear your mind.",
    "meta": "+15 XP per task"
  },
  {
    "icon": "calendar",
    "title": "Smart Schedule",
    "body": "Never worry about what to clean next. Our AI builds a perfect schedule that adapts to your life, not the other way around.",
    "meta": "Auto-pilot mode"
  },
  {
    "icon": "star",
    "title": "Level Up Your Life",
    "body": "Watch your character grow as your home becomes cleaner. Build real-world habits that stick forever.",
    "meta": "Become a Pro"
  },
  {
    "icon": "crown",
    "title": "Real Progression",
    "body": "Earn XP for every minute you clean. Unlock new titles, badges, and customization options.",
    "meta": "Infinite levels"
  },
  {
    "icon": "coins",
    "title": "Instant Gratification",
    "body": "Get immediate feedback for your hard work. Every completed task gives you a dopamine hit.",
    "meta": "Feel good instantly"
  },
  {
    "icon": "heart",
    "title": "Streaks & Achievements",
    "body": "Maintain daily cleaning streaks and unlock special achievements for your consistency.",
    "meta": "100+ achievements"
  },
  {
    "icon": "hammer",
    "title": "Tool Inventory",
    "body": "Unlock and customize your cleaning tool inventory as you progress.",
    "meta": "50+ tools available"
  }
] as const;

export function GamificationFeatures() {
  const { language } = useLanguage();
  const renderFeature = (feature: (typeof features)[number]) => (
    <Card key={feature.title} className="landing-feature-card" shadow="sm">
      <DesignIcon name={feature.icon as DesignIconName} />
      <h3>{t(feature.title, language)}</h3>
      <p>{t(feature.body, language)}</p>
      <p className="feature-meta">{t(feature.meta, language)}</p>
    </Card>
  );
  return (
    <section className="landing-section">
      <h2>{t("Cleaning made fun, easy, and rewarding", language)}</h2>
      <p>{t("Tidy up faster, stay consistent, and enjoy a spotless home effortlessly!", language)}</p>
      <div className="landing-card-grid">{features.slice(0, 3).map(renderFeature)}</div>
      <div className="landing-card-grid landing-card-grid-wide">{features.slice(3, 5).map(renderFeature)}</div>
      <div className="landing-card-grid landing-card-grid-wide">{features.slice(5).map(renderFeature)}</div>
    </section>
  );
}

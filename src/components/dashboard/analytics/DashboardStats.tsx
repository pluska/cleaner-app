"use client";

import {
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Star,
  Coins,
  Gem,
  Trophy,
} from "lucide-react";
import { DashboardStats as StatsType } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";

interface DashboardStatsProps {
  stats: StatsType;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const { language } = useLanguage();
  const statItems = [
    {
      label: t("Total Tasks", language),
      value: stats.total_tasks || stats.totalTasks,
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: language === "es" ? "Completadas Hoy" : "Completed Today",
      value: stats.completed_today || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: language === "es" ? "Nivel" : "Level",
      value: stats.current_level || 1,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: language === "es" ? "Experiencia" : "Experience",
      value: stats.total_exp_earned || 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const gamificationStats = [
    {
      label: language === "es" ? "Monedas" : "Coins",
      value: stats.coins_earned || 0,
      icon: Coins,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: language === "es" ? "Gemas" : "Gems",
      value: stats.gems_earned || 0,
      icon: Gem,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: language === "es" ? "Racha" : "Streak",
      value: `${stats.streak_days || 0} days`,
      icon: Trophy,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      label: t("Completion Rate", language),
      value: `${stats.completion_rate || stats.completionRate || 0}%`,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  const renderStatItem = (item: any) => {
    const Icon = item.icon;
    return (
      <div
        key={item.label}
        className="bg-base rounded-xl shadow-lg border border-base p-8"
      >
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${item.bgColor}`}>
            <Icon className={`h-8 w-8 ${item.color}`} />
          </div>
          <div className="ml-6">
            <p className="text-sm font-medium text-dark/70 mb-1">
              {item.label}
            </p>
            <p className="text-3xl font-bold text-dark">{item.value}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statItems.map(renderStatItem)}
      </div>

      {/* Gamification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {gamificationStats.map(renderStatItem)}
      </div>
    </div>
  );
}

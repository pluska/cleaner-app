"use client";

import { CheckCircle, Clock, Target, TrendingUp } from "lucide-react";
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
      value: stats.totalTasks,
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: t("Completed", language),
      value: stats.completedTasks,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: t("Pending", language),
      value: stats.pendingTasks,
      icon: Clock,
      color: "text-accent",
      bgColor: "bg-accent/20",
    },
    {
      label: t("Completion Rate", language),
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="bg-bg rounded-xl shadow-lg border border-base p-8"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${item.bgColor}`}>
                <Icon className={`h-8 w-8 ${item.color}`} />
              </div>
              <div className="ml-6">
                <p className="text-sm font-medium text-text/70 mb-1">
                  {item.label}
                </p>
                <p className="text-3xl font-bold text-text">{item.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

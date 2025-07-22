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
      color: "text-blue-600",
      bgColor: "bg-blue-100",
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
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: t("Completion Rate", language),
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <Icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

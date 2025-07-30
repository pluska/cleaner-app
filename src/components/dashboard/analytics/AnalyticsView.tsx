"use client";

import { useMemo } from "react";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { BarChart3, TrendingUp, Calendar, Target } from "lucide-react";
import { Task } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";

interface AnalyticsViewProps {
  tasks: Task[];
}

export function AnalyticsView({ tasks }: AnalyticsViewProps) {
  const { language } = useLanguage();
  const analytics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Category breakdown
    const categoryStats = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Priority breakdown
    const priorityStats = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Weekly completion trend (last 4 weeks)
    const weeklyTrend = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7), {
        weekStartsOn: 1,
      });
      const weekEnd = endOfWeek(subDays(new Date(), i * 7), {
        weekStartsOn: 1,
      });

      const weekTasks = tasks.filter((task) => {
        const taskDate = new Date(task.due_date || task.created_at);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });

      const weekCompleted = weekTasks.filter((task) => task.completed).length;
      const weekTotal = weekTasks.length;

      weeklyTrend.push({
        week: format(weekStart, "MMM d"),
        completed: weekCompleted,
        total: weekTotal,
        rate: weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0,
      });
    }

    // Daily completion for current week
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const currentWeekDays = eachDayOfInterval({
      start: currentWeekStart,
      end: currentWeekEnd,
    });

    const dailyStats = currentWeekDays.map((day) => {
      const dayTasks = tasks.filter((task) => {
        const taskDate = new Date(task.due_date || task.created_at);
        return format(taskDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
      });

      return {
        day:
          language === "es"
            ? ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"][day.getDay()]
            : format(day, "EEE", { locale: enUS }),
        completed: dayTasks.filter((task) => task.completed).length,
        total: dayTasks.length,
      };
    });

    return {
      totalTasks,
      completedTasks,
      completionRate,
      categoryStats,
      priorityStats,
      weeklyTrend,
      dailyStats,
    };
  }, [tasks, language]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "kitchen":
        return "bg-orange-500";
      case "bathroom":
        return "bg-blue-500";
      case "bedroom":
        return "bg-purple-500";
      case "living_room":
        return "bg-green-500";
      case "laundry":
        return "bg-indigo-500";
      case "exterior":
        return "bg-teal-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {t("Total Tasks", language)}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalTasks}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {t("Completed", language)}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.completedTasks}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {t("Completion Rate", language)}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.completionRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {t("This Week", language)}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.dailyStats.reduce(
                  (sum, day) => sum + day.completed,
                  0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("Tasks by Category", language)}
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.categoryStats).map(
              ([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${getCategoryColor(
                        category
                      )}`}
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {category.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getCategoryColor(
                          category
                        )}`}
                        style={{
                          width: `${(count / analytics.totalTasks) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("Tasks by Priority", language)}
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.priorityStats).map(
              ([priority, count]) => (
                <div
                  key={priority}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${getPriorityColor(
                        priority
                      )}`}
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {priority === "high" && t("High Priority", language)}
                      {priority === "medium" && t("Medium Priority", language)}
                      {priority === "low" && t("Low Priority", language)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getPriorityColor(
                          priority
                        )}`}
                        style={{
                          width: `${(count / analytics.totalTasks) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("Weekly Completion Trend", language)}
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {analytics.weeklyTrend.map((week, index) => (
            <div key={index} className="text-center">
              <div className="text-sm text-gray-600 mb-2">{week.week}</div>
              <div className="text-2xl font-bold text-gray-900">
                {week.rate}%
              </div>
              <div className="text-xs text-gray-500">
                {week.completed}/{week.total} {t("tasks", language)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("This Week's Progress", language)}
        </h3>
        <div className="grid grid-cols-7 gap-4">
          {analytics.dailyStats.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-sm text-gray-600 mb-2">{day.day}</div>
              <div className="text-lg font-bold text-gray-900">
                {day.completed}
              </div>
              <div className="text-xs text-gray-500">
                {t("of", language)} {day.total}
              </div>
              {day.total > 0 && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-blue-500 h-1 rounded-full"
                    style={{ width: `${(day.completed / day.total) * 100}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

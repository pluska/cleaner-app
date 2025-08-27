"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardDragDropProvider } from "./DashboardDragDropProvider";
import { WeeklyView } from "../schedule/WeeklyView";
import { Loading } from "@/components/ui/feedback/Loading";
import { Task } from "@/types";
import { formatDateToYYYYMMDD } from "@/libs/date-utils";
import { GamificationTester } from "../gamification/GamificationTester";
import { AuthDebugger } from "../AuthDebugger";
import { AITaskCreation } from "../ai/AITaskCreation";

interface DashboardContentProps {
  initialTodayTasks: Task[];
  initialComingSoonTasks: Task[];
  userId: string;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  initialTodayTasks,
  initialComingSoonTasks,
  userId,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    formatDateToYYYYMMDD(new Date())
  );
  const [todayTasks, setTodayTasks] = useState(initialTodayTasks);
  const [comingSoonTasks] = useState(initialComingSoonTasks);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [showAITaskCreation, setShowAITaskCreation] = useState(false);

  const handleDateChange = useCallback(
    async (date: string) => {
      setSelectedDate(date);

      // Don't fetch if it's today and we already have the initial tasks
      const today = formatDateToYYYYMMDD(new Date());
      if (date === today) {
        setTodayTasks(initialTodayTasks);
        return;
      }

      setIsLoadingTasks(true);

      // Fetch tasks for the selected date
      try {
        const res = await fetch(`/api/tasks/by-date?date=${date}`, {
          credentials: "include",
        });
        if (res.ok) {
          const { taskInstances, userTasks } = await res.json();

          // Combine tasks and instances for the selected date
          const combinedTasks: Task[] = [];

          // Add recurring task instances
          if (taskInstances) {
            taskInstances.forEach((instance: any) => {
              if (instance.user_tasks?.task_templates) {
                combinedTasks.push({
                  id: instance.id,
                  title: instance.user_tasks.task_templates.name,
                  description: instance.user_tasks.task_templates.description,
                  frequency: "daily",
                  category: instance.user_tasks.task_templates.category as any,
                  priority: "medium",
                  completed: instance.completed,
                  due_date: instance.due_date,
                  user_id: userId,
                  is_recurring:
                    instance.user_tasks.task_templates.base_frequency_days > 1,
                  recurrence_start_date: instance.due_date,
                  recurrence_end_date: undefined,
                  last_generated_date: undefined,
                  original_task_id: instance.user_task_id,
                  day_of_week: undefined,
                  preferred_time: undefined,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
              }
            });
          }

          // Add user tasks that don't have instances yet (for display purposes)
          if (userTasks) {
            userTasks.forEach((userTask: any) => {
              if (userTask.task_templates) {
                combinedTasks.push({
                  id: userTask.id,
                  title: userTask.task_templates.name,
                  description: userTask.task_templates.description,
                  frequency: "daily",
                  category: userTask.task_templates.category as any,
                  priority: "medium",
                  completed: false,
                  due_date: date,
                  user_id: userId,
                  is_recurring: userTask.task_templates.base_frequency_days > 1,
                  recurrence_start_date: date,
                  recurrence_end_date: undefined,
                  last_generated_date: undefined,
                  original_task_id: userTask.id,
                  day_of_week: undefined,
                  preferred_time: undefined,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
              }
            });
          }

          setTodayTasks(combinedTasks);
        } else {
          console.error("API request failed:", res.status, res.statusText);
        }
      } catch (error) {
        console.error("Error fetching tasks for date:", error);
      } finally {
        setIsLoadingTasks(false);
      }
    },
    [initialTodayTasks, userId]
  );

  // Update today's tasks when initialTodayTasks changes
  useEffect(() => {
    const today = formatDateToYYYYMMDD(new Date());
    if (selectedDate === today) {
      setTodayTasks(initialTodayTasks);
    }
  }, [initialTodayTasks, selectedDate]);

  if (isLoadingTasks) {
    return (
      <div className="max-w-7xl mx-auto bg-bg min-h-screen p-4 sm:p-8">
        <DashboardHeader />
        <Loading size="lg" text="Loading tasks..." className="mt-12" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-bg min-h-screen p-4 sm:p-8">
      <DashboardHeader />

      {showAITaskCreation ? (
        <AITaskCreation
          onComplete={() => {
            setShowAITaskCreation(false);
            // Refresh tasks after AI creation
            handleDateChange(selectedDate);
          }}
          onCancel={() => setShowAITaskCreation(false)}
        />
      ) : (
        <>
          <WeeklyView
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />

          <DashboardDragDropProvider
            todayTasks={todayTasks}
            comingSoonTasks={comingSoonTasks}
            userId={userId}
            selectedDate={selectedDate}
            isLoadingTasks={isLoadingTasks}
            onShowAITaskCreation={() => setShowAITaskCreation(true)}
          />

          {/* Development Tools - Only in development */}
          {process.env.NODE_ENV === "development" && (
            <>
              <GamificationTester />
              <AuthDebugger />
            </>
          )}
        </>
      )}
    </div>
  );
};

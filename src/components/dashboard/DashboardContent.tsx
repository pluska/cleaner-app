"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardDragDropProvider } from "./DashboardDragDropProvider";
import { WeeklyView } from "./WeeklyView";
import { Task } from "@/types";
import { formatDateToYYYYMMDD } from "@/libs/date-utils";

interface DashboardContentProps {
  initialTodayTasks: Task[];
  initialComingSoonTasks: any[];
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
  const [comingSoonTasks, setComingSoonTasks] = useState(
    initialComingSoonTasks
  );
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setIsLoadingTasks(true);

    // Fetch tasks for the selected date
    try {
      const res = await fetch(`/api/tasks/by-date?date=${date}`);
      if (res.ok) {
        const { tasks, taskInstances } = await res.json();

        // Combine tasks and instances for the selected date
        const combinedTasks = [];

        // Add regular tasks for the selected date
        if (tasks) {
          const filteredTasks = tasks.filter(
            (task: Task) => task.due_date === date
          );
          combinedTasks.push(...filteredTasks);
        }

        // Add recurring task instances
        if (taskInstances) {
          taskInstances.forEach((instance: any) => {
            if (instance.tasks) {
              combinedTasks.push({
                ...instance.tasks,
                id: instance.id,
                completed: instance.completed,
                due_date: instance.due_date,
                is_instance: true,
                original_task_id: instance.task_id,
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
  };

  // Initialize tasks for the current date on component mount
  useEffect(() => {
    const today = formatDateToYYYYMMDD(new Date());
    if (selectedDate === today) {
      setTodayTasks(initialTodayTasks);
    } else {
      handleDateChange(selectedDate);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto bg-bg min-h-screen p-4 sm:p-8">
      <DashboardHeader />

      <WeeklyView selectedDate={selectedDate} onDateChange={handleDateChange} />

      <DashboardDragDropProvider
        todayTasks={todayTasks}
        comingSoonTasks={comingSoonTasks}
        userId={userId}
        selectedDate={selectedDate}
        isLoadingTasks={isLoadingTasks}
      />
    </div>
  );
};

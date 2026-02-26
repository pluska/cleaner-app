"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { CalendarStrip } from "@/components/dashboard/CalendarStrip";
import { TaskList } from "@/components/dashboard/TaskList";
import { TaskType } from "@/components/dashboard/TaskItem";

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch tasks when selectedDate changes
  useEffect(() => {
    let active = true;

    async function fetchTasks() {
      setIsLoading(true);
      try {
        const dateString = selectedDate.toISOString().split("T")[0];
        const res = await fetch(`/api/mock-tasks?date=${dateString}`);
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();
        
        if (active) {
          setTasks(data.tasks);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchTasks();

    return () => {
      active = false;
    };
  }, [selectedDate]);

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto min-h-screen bg-[#F8F9FA] px-6 md:px-8 pt-12 md:pt-16 pb-32">
      <DashboardHeader userName="Sarah" />
      <StatsOverview statusPercentage={17} streakCount={12} />
      <CalendarStrip 
        selectedDate={selectedDate} 
        onSelectDate={(date) => setSelectedDate(date)} 
      />
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <TaskList tasks={tasks} onToggleTask={handleToggleTask} />
      )}
    </div>
  );
}

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
import { FirstLoginReception } from "../gamification/FirstLoginReception";
import { MapLoader } from "../../kingdom/MapLoader";
import { useCorruptionEngine } from "@/hooks/useCorruptionEngine";
import { useGameStore } from "@/store/gameStore";
import { Building } from "@/types";

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
  
  // Kingdom State (Managed by Store + Hook now)
  const selectBuilding = useGameStore(state => state.selectBuilding);
  const selectedBuildingId = useGameStore(state => state.selectedBuildingId);
  // Derived state (no need for store selector)
  const viewMode = selectedBuildingId ? 'list' : 'map';
  
  // Initialize Corruption Engine
  useCorruptionEngine(todayTasks);

  // Manual View Toggle State (if distinct from drawer)
  const [manualViewMode, setManualViewMode] = useState<'map' | 'list'>('map');
  
  // If drawer is open (selectedBuildingId), force list view or overlay?
  // Let's keep manual toggle for now, but entering a building switches to list.
  useEffect(() => {
    if (selectedBuildingId) {
       setManualViewMode('list');
    }
  }, [selectedBuildingId]);

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
      <div className="max-w-7xl mx-auto bg-base min-h-screen p-4 sm:p-8">
        <DashboardHeader />
        <Loading size="lg" text="Loading tasks..." className="mt-12" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-base min-h-screen p-4 sm:p-8">
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
          <FirstLoginReception
            userName="Hero"
            onComplete={() => console.log("Welcome modal closed")}
          />
          
          {/* View Toggle */}
          <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2">
             <button 
               onClick={() => {
                 setManualViewMode(v => v === 'map' ? 'list' : 'map');
                 selectBuilding(null); // Clear selection when toggling manually
               }}
               className="bg-primary text-white p-3 rounded-full shadow-lg hover:scale-105 transition-transform border-2 border-white"
             >
               {manualViewMode === 'map' ? '📜 Task List' : '🏰 Kingdom Map'}
             </button>
          </div>


          {/* Map View */}
          <div className={`fixed inset-0 z-0 transition-opacity duration-500 ${manualViewMode === 'map' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
             <MapLoader 
               // MapEngine is now self-contained via Zustand!
               buildings={[]} 
               onBuildingClick={() => {}}
             />
          </div>

          {/* List View Container - Overlay on top of map if needed, or separate */}
          <div className={`relative z-10 transition-opacity duration-300 ${manualViewMode === 'list' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
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
          </div>

          {/* Development Tools - Only in development */}
          {process.env.NODE_ENV === "development" && (
            <div className="relative z-50">
              <GamificationTester />
              <AuthDebugger />
            </div>
          )}
        </>
      )}
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Task } from "@/types";
import { ComingSoonTasks } from "./ComingSoonTasks";
import { DailyTasks } from "./DailyTasks";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";

interface DashboardDragDropProviderProps {
  todayTasks: Task[];
  comingSoonTasks: any[]; // Using any for coming soon tasks since they have a different structure
  userId: string;
}

export const DashboardDragDropProvider: React.FC<
  DashboardDragDropProviderProps
> = ({
  todayTasks: initialTodayTasks,
  comingSoonTasks: initialComingSoonTasks,
  userId,
}) => {
  const [todayTasks, setTodayTasks] = useState(initialTodayTasks);
  const [comingSoonTasks, setComingSoonTasks] = useState(
    initialComingSoonTasks
  );
  const [activeTask, setActiveTask] = useState<any>(null);
  const [isMovingTask, setIsMovingTask] = useState(false);
  const { language } = useLanguage();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Update state when props change
  useEffect(() => {
    setTodayTasks(initialTodayTasks);
    setComingSoonTasks(initialComingSoonTasks);
  }, [initialTodayTasks, initialComingSoonTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = [...todayTasks, ...comingSoonTasks].find(
      (t) => t.id === taskId
    );
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const dropZoneId = over.id as string;

    // Find the task being moved
    const taskToMove = [...todayTasks, ...comingSoonTasks].find(
      (t) => t.id === taskId
    );

    if (!taskToMove) return;

    // Show loading state
    setIsMovingTask(true);

    // If dropping on today's tasks area, move the task to today
    if (dropZoneId === "today-tasks") {
      try {
        const res = await fetch(`/api/tasks/${taskId}/move`, {
          method: "PATCH",
        });
        if (res.ok) {
          const { task } = await res.json();

          // Update local state - remove from both arrays first, then add to today
          setTodayTasks((prev) => {
            const filtered = prev.filter((t) => t.id !== taskId);
            return [...filtered, task];
          });
          setComingSoonTasks((prev) => prev.filter((t) => t.id !== taskId));

          // Refresh the page to update stats and ensure consistency
          setTimeout(() => {
            handleTodayTasksUpdate();
          }, 100);
        }
      } catch (error) {
        console.error("Error moving task:", error);
      } finally {
        setIsMovingTask(false);
      }
    }

    // If dropping on coming soon area, move the task to tomorrow
    if (dropZoneId === "coming-soon-tasks") {
      try {
        const res = await fetch(`/api/tasks/${taskId}/move-to-tomorrow`, {
          method: "PATCH",
        });
        if (res.ok) {
          const { task } = await res.json();

          // Update local state - remove from both arrays first, then add to coming soon
          setComingSoonTasks((prev) => {
            const filtered = prev.filter((t) => t.id !== taskId);
            return [...filtered, task];
          });
          setTodayTasks((prev) => prev.filter((t) => t.id !== taskId));

          // Since today's tasks has complex data structure, we need to refresh
          // to ensure stats and data consistency
          setTimeout(() => {
            handleTodayTasksUpdate();
          }, 100);
        }
      } catch (error) {
        console.error("Error moving task to tomorrow:", error);
      } finally {
        setIsMovingTask(false);
      }
    }
  };

  const handleTodayTasksUpdate = () => {
    // For now, we'll keep the reload for today's tasks due to complex data structure
    // TODO: Implement proper local state management for stats
    window.location.reload();
  };

  const handleComingSoonTasksUpdate = () => {
    // Coming soon works fine with local state, no reload needed
    // This function is called but doesn't need to do anything
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8 relative">
        <DailyTasks
          tasks={todayTasks}
          userId={userId}
          onTaskMoved={handleTodayTasksUpdate}
        />

        <ComingSoonTasks
          tasks={comingSoonTasks}
          userId={userId}
          onTaskAdded={handleComingSoonTasksUpdate}
        />

        {/* Loading overlay during task movement */}
        {isMovingTask && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 flex items-center space-x-3">
              <LoadingSpinner size="md" />
              <span className="text-text font-medium">
                {t("Moving task...", language)}
              </span>
            </div>
          </div>
        )}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="p-3 bg-white border border-gray-200 rounded shadow-lg">
            <span className="font-medium text-gray-800">
              {activeTask.title}
            </span>
            <span className="text-sm text-gray-600 ml-2">
              ({activeTask.due_date})
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

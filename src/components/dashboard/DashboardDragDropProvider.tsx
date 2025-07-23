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

    // If dropping on today's tasks area, move the task to today
    if (dropZoneId === "today-tasks") {
      try {
        const res = await fetch(`/api/tasks/${taskId}/move`, {
          method: "PATCH",
        });
        if (res.ok) {
          const { task } = await res.json();

          // Update local state
          setTodayTasks((prev) => [...prev, task]);
          setComingSoonTasks((prev) => prev.filter((t) => t.id !== taskId));
        }
      } catch (error) {
        console.error("Error moving task:", error);
      }
    }
  };

  const handleTodayTasksUpdate = () => {
    // Refresh today's tasks
    window.location.reload();
  };

  const handleComingSoonTasksUpdate = () => {
    // Refresh coming soon tasks
    window.location.reload();
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8">
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

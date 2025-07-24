"use client";

import React from "react";
import { t } from "@/libs/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { DraggableTask } from "./DraggableTask";
import { DroppableArea } from "./DroppableArea";

interface ComingSoonTask {
  id: string;
  title: string;
  due_date: string;
  completed: boolean;
}

interface ComingSoonTasksProps {
  tasks: ComingSoonTask[];
  userId: string;
  onTaskAdded: () => void;
}

export const ComingSoonTasks: React.FC<ComingSoonTasksProps> = ({
  tasks,
  userId,
  onTaskAdded,
}) => {
  const { language } = useLanguage();

  return (
    <div className="mt-12">
      <h2 className="text-2xl text-text font-semibold mb-6">
        {t("Coming Soon", language)}
      </h2>
      <DroppableArea id="coming-soon-tasks" className="min-h-[200px]">
        {tasks.length === 0 ? (
          <div className="text-text/70 text-center p-12 bg-base rounded-lg">
            <p className="text-lg">
              {t("No coming soon tasks. Add one!", language)}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <DraggableTask key={task.id} task={task}>
                <li className="p-6 bg-bg border border-base rounded-lg hover:shadow-lg transition-shadow">
                  <span className="font-medium text-text text-lg">
                    {task.title}
                  </span>
                  <span className="text-sm text-text/70 ml-3">
                    ({task.due_date})
                  </span>
                </li>
              </DraggableTask>
            ))}
          </ul>
        )}
      </DroppableArea>
    </div>
  );
};

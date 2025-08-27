"use client";

import { CheckCircle } from "lucide-react";

interface Subtask {
  id: string;
  title: string;
  xpReward: number;
}

interface InteractiveTaskCardProps {
  taskId: string;
  title: string;
  description: string;
  totalXpReward: number;
  subtasks: Subtask[];
  isCompleted: boolean;
  completedSubtasks: Set<string>;
  onToggleCompletion: (taskId: string, xpReward: number) => void;
  onToggleSubtask: (
    taskId: string,
    subtaskId: string,
    xpReward: number
  ) => void;
}

export function InteractiveTaskCard({
  taskId,
  title,
  description,
  totalXpReward,
  subtasks,
  isCompleted,
  completedSubtasks,
  onToggleCompletion,
  onToggleSubtask,
}: InteractiveTaskCardProps) {
  return (
    <div className="relative">
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onToggleCompletion(taskId, totalXpReward)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isCompleted
                  ? "bg-green-100 text-green-600"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <div className="w-4 h-4 border-2 border-current rounded-full" />
              )}
            </button>
            <div>
              <h4 className="font-semibold text-text">{title}</h4>
              <p className="text-sm text-text/60">{description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-accent/10 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-accent">
                +{totalXpReward} XP
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          {subtasks.map((subtask) => {
            const isSubtaskCompleted = completedSubtasks.has(subtask.id);
            return (
              <div
                key={subtask.id}
                className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() =>
                  onToggleSubtask(taskId, subtask.id, subtask.xpReward)
                }
              >
                <span
                  className={`${
                    isSubtaskCompleted ? "text-green-600" : "text-text/70"
                  }`}
                >
                  {subtask.title}
                </span>
                <div className="flex items-center space-x-2">
                  {isSubtaskCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="w-3 h-3 border border-gray-300 rounded-full" />
                  )}
                  <span className="text-green-600 font-medium">
                    +{subtask.xpReward} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-text/70">Progress</span>
            <span className="text-text font-medium">
              {completedSubtasks.size}/{subtasks.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(completedSubtasks.size / subtasks.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

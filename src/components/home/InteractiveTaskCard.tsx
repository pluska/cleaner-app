"use client";

import { DesignIcon } from "./DesignIcon";

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
    <div className="preview-task">
      <button type="button" className="preview-task-title" aria-pressed={isCompleted} onClick={() => onToggleCompletion(taskId, totalXpReward)}>{title}</button>
      <p className="preview-task-description">{description}</p>
      <p className="preview-task-xp">+{totalXpReward} XP</p>
      {subtasks.map((subtask) => (
        <button key={subtask.id} type="button" className="preview-subtask" aria-pressed={completedSubtasks.has(subtask.id)} onClick={() => onToggleSubtask(taskId, subtask.id, subtask.xpReward)}>
          <DesignIcon name="check-small" />
          <span>{subtask.title}</span>
          <span>+{subtask.xpReward} XP</span>
        </button>
      ))}
      <div className="sr-only" role="status">Progress {completedSubtasks.size}/{subtasks.length} completed</div>
    </div>
  );
}

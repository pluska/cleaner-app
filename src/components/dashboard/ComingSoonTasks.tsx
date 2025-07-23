"use client";

import React, { useState } from "react";
import { t } from "@/libs/translations";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { DraggableTask } from "./DraggableTask";

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
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          due_date: dueDate,
          user_id: userId,
        }),
      });
      if (!res.ok) throw new Error("Failed to add task");
      setTitle("");
      setDueDate("");
      onTaskAdded();
    } catch (err) {
      setError("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl text-text font-semibold mb-6">
        {t("Coming Soon", language)}
      </h2>
      <form onSubmit={handleAddTask} className="flex gap-4 mb-6">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("Task title", language)}
          required
          className="border-base focus:border-primary focus:ring-primary/20 flex-1"
        />
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          required
          className="border-base focus:border-primary focus:ring-primary/20"
        />
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
        >
          {t("Add Task", language)}
        </Button>
      </form>
      {error && (
        <div className="text-red-500 mb-4 p-3 bg-red-50 rounded-lg">
          {t("Error", language)}
        </div>
      )}
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
    </div>
  );
};

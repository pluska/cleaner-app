"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ComingSoonTasks } from "./ComingSoonTasks";
import { Task } from "@/types";

interface ComingSoonTasksWrapperProps {
  userId: string;
}

export const ComingSoonTasksWrapper: React.FC<ComingSoonTasksWrapperProps> = ({
  userId,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const res = await fetch(
      `/api/tasks?user_id=${userId}&coming_soon=1&today=${today}`
    );
    if (res.ok) {
      const data = await res.json();
      // Sort tasks by due_date in ascending order as backup
      const sortedTasks = (data.tasks || []).sort(
        (a: Task, b: Task) =>
          new Date(a.due_date || "").getTime() -
          new Date(b.due_date || "").getTime()
      );
      setTasks(sortedTasks);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div>
      <ComingSoonTasks tasks={tasks} userId={userId} onTaskAdded={fetchTasks} />
      {loading && <div className="text-gray-400 mt-2">Loading...</div>}
    </div>
  );
};

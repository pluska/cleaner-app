"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import Link from "next/link";
import { TaskItem, TaskType } from "./TaskItem";
import { useInView } from "react-intersection-observer";

interface TaskListProps {
  tasks: TaskType[];
  onToggleTask: (id: string) => void;
}

export function TaskList({ tasks: initialTasks, onToggleTask }: TaskListProps) {
  const { language } = useLanguage();
  
  // Setup infinite scrolling state
  const [displayedTasks, setDisplayedTasks] = useState<TaskType[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;
  
  const { ref, inView } = useInView({
    threshold: 0,
  });

  // Reset or initialize displayed tasks
  useEffect(() => {
    setDisplayedTasks(initialTasks.slice(0, itemsPerPage));
    setPage(1);
  }, [initialTasks]);

  // Load more tasks when scrolling to bottom
  useEffect(() => {
    if (inView && displayedTasks.length < initialTasks.length) {
      const nextTasks = initialTasks.slice(
        page * itemsPerPage,
        (page + 1) * itemsPerPage
      );
      if (nextTasks.length > 0) {
        setDisplayedTasks((prev) => [...prev, ...nextTasks]);
        setPage((p) => p + 1);
      }
    }
  }, [inView, initialTasks, page, displayedTasks.length]);

  const priorityTasks = displayedTasks.filter((t) => t.id.startsWith("p"));
  const scheduledTasks = displayedTasks.filter((t) => !t.id.startsWith("p"));

  const renderGroup = (title: string, groupTasks: TaskType[]) => (
    <div className="relative mb-8">
      {/* Timeline connector line */}
      <div className="absolute top-[22px] left-[5px] bottom-[-24px] w-[2px] bg-gray-200 z-0" />

      <div className="flex items-center space-x-4 mb-5 relative z-10">
        <div className="w-3 h-3 rounded-full bg-[#A1A1AA] border-[3px] border-[#F8F9FA] box-content relative -left-[1px]" />
        <h2 className="text-[10px] font-bold text-gray-500 tracking-widest uppercase relative top-[1px]">
          {title}
        </h2>
      </div>

      <div className="pl-[30px] space-y-3 relative z-10">
        {groupTasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={onToggleTask} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-dark">
          {t("Today's Strategy", language) || "Today's Strategy"}
        </h2>
        <Link 
          href="/dashboard/add-task"
          className="flex items-center space-x-1.5 bg-primary border text-white px-4 py-2 rounded-full shadow-sm hover:brightness-110 transition-colors"
        >
          <div className="w-[18px] h-[18px] bg-white rounded-full flex items-center justify-center text-primary">
            <Plus className="w-3 h-3" strokeWidth={3} />
          </div>
          <span className="text-xs font-bold">{t("Add Task", language)}</span>
        </Link>
      </div>

      <div className="relative">
        {priorityTasks.length > 0 && renderGroup((t("Priority", language) || "PRIORITY").toUpperCase(), priorityTasks)}
        {scheduledTasks.length > 0 && renderGroup((t("Schedule", language) || "SCHEDULED").toUpperCase(), scheduledTasks)}
        
        {/* Infinite Scroll trigger element */}
        {displayedTasks.length < initialTasks.length && (
          <div ref={ref} className="h-20 flex items-center justify-center w-full">
             <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}

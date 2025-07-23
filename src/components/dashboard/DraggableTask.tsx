"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DraggableTaskProps {
  task: { id: string; [key: string]: any };
  children: React.ReactNode;
  className?: string;
}

export const DraggableTask: React.FC<DraggableTaskProps> = ({
  task,
  children,
  className = "",
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing ${className}`}
    >
      {children}
    </div>
  );
};

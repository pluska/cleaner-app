"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface DroppableAreaProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  onDrop?: (taskId: string) => void;
}

export const DroppableArea: React.FC<DroppableAreaProps> = ({
  id,
  children,
  className = "",
  onDrop,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors duration-200 ${
        isOver ? "bg-primary/5 border-2 border-primary/30 border-dashed" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

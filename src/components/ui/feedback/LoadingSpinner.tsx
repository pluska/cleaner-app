import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-base border-t-primary`}
    />
  );
}

// Task Skeleton Component
export function TaskSkeleton() {
  return (
    <div className="p-8 hover:bg-base transition-colors animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-6 h-6 bg-base rounded-full"></div>
          <div className="space-y-2">
            <div className="h-6 bg-base rounded w-48"></div>
            <div className="h-4 bg-base rounded w-32"></div>
            <div className="flex space-x-3">
              <div className="h-6 bg-base rounded-full w-16"></div>
              <div className="h-6 bg-base rounded-full w-20"></div>
              <div className="h-6 bg-base rounded-full w-16"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 bg-base rounded"></div>
          <div className="w-5 h-5 bg-base rounded"></div>
          <div className="w-5 h-5 bg-base rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Multiple Task Skeletons
export function TaskSkeletons({ count = 3 }: { count?: number }) {
  return (
    <div className="divide-y divide-base">
      {Array.from({ length: count }).map((_, index) => (
        <TaskSkeleton key={index} />
      ))}
    </div>
  );
}

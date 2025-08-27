import React from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function Loading({ size = "md", text, className = "" }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-base border-t-primary`}
      />
      {text && <p className="text-base text-dark/70 font-medium">{text}</p>}
    </div>
  );
}

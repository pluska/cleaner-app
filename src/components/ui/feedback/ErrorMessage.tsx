import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className = "" }: ErrorMessageProps) {
  return (
    <div
      className={`text-red-600 text-sm font-medium bg-red-50 p-3 rounded-md border border-red-200 flex items-center space-x-2 ${className}`}
    >
      <AlertCircle className="h-4 w-4 text-red-500" />
      <span>{message}</span>
    </div>
  );
}

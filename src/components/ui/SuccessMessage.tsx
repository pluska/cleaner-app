import React from "react";
import { CheckCircle } from "lucide-react";

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export function SuccessMessage({
  message,
  className = "",
}: SuccessMessageProps) {
  return (
    <div
      className={`text-green-600 text-sm font-medium bg-green-50 p-3 rounded-md border border-green-200 flex items-center space-x-2 ${className}`}
    >
      <CheckCircle className="h-4 w-4 text-green-500" />
      <span>{message}</span>
    </div>
  );
}

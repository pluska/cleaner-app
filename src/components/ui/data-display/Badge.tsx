import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-full transition-colors";

  const variants = {
    default: "bg-base text-dark border border-base",
    primary: "bg-primary/10 text-primary border border-primary/20",
    secondary: "bg-secondary/10 text-dark border border-secondary/20",
    success: "bg-green-100 text-green-700 border border-green-200",
    warning: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    error: "bg-red-100 text-red-700 border border-red-200",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return <span className={classes}>{children}</span>;
}

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-2xl shadow-md hover:shadow-lg";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary/20 shadow-lg",
    secondary:
      "bg-accent text-text hover:bg-accent/90 border border-accent focus-visible:ring-accent/20 shadow-lg",
    outline:
      "border-2 border-text bg-transparent text-text hover:bg-text hover:text-white focus-visible:ring-text/20 shadow-lg",
    ghost: "bg-transparent text-text hover:bg-base focus-visible:ring-text/20",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-6 py-2 text-base",
    lg: "h-12 px-8 text-lg",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

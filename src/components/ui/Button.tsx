import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
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
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "!bg-[#4CAF91] !text-white hover:!bg-[#4CAF91]/90 focus-visible:!ring-[#4CAF91]/20",
    secondary:
      "!bg-[#FFD265] !text-[#111827] hover:!bg-[#FFD265]/90 !border !border-[#FFD265] focus-visible:!ring-[#FFD265]/20",
    outline:
      "!border !border-[#111827] !bg-transparent !text-[#111827] hover:!bg-[#111827] hover:!text-white",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-6 text-lg",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

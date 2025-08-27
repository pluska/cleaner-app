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
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-2xl cursor-pointer";

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: "var(--color-primary)",
          color: "white",
          "--tw-ring-color": "var(--color-primary)",
        };
      case "secondary":
        return {
          backgroundColor: "var(--color-secondary)",
          color: "white",
          "--tw-ring-color": "var(--color-secondary)",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: "var(--color-dark)",
          borderColor: "var(--color-dark)",
          "--tw-ring-color": "var(--color-dark)",
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          color: "var(--color-dark)",
          "--tw-ring-color": "var(--color-dark)",
        };
      default:
        return {};
    }
  };

  const variants = {
    primary:
      "text-white hover:bg-opacity-90 focus-visible:ring-opacity-20 shadow-md hover:shadow-lg",
    secondary:
      "hover:bg-opacity-90 focus-visible:ring-opacity-20 shadow-md hover:shadow-lg",
    outline:
      "border-2 bg-transparent hover:bg-dark hover:text-white focus-visible:ring-opacity-20 shadow-md hover:shadow-lg",
    ghost: "bg-transparent hover:bg-opacity-10 focus-visible:ring-opacity-20",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-6 py-2 text-base",
    lg: "h-12 px-8 text-lg",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={classes} style={getVariantStyles()} {...props}>
      {children}
    </button>
  );
}

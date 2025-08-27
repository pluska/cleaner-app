import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  const baseClasses =
    "flex h-10 w-full rounded-2xl border-2 border-base bg-base px-6 py-2 text-base text-dark shadow-md ring-offset-bg file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-dark/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200";

  const classes = `${baseClasses} ${
    error
      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20"
      : ""
  } ${className}`;

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-base font-medium text-dark leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <input className={classes} {...props} />
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}

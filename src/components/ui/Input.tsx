import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  const baseClasses =
    "flex h-10 w-full rounded-md border border-base bg-bg px-3 py-2 text-sm text-text shadow-sm ring-offset-bg file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const classes = `${baseClasses} ${
    error ? "border-red-500" : ""
  } ${className}`;

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-text leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <input className={classes} {...props} />
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}

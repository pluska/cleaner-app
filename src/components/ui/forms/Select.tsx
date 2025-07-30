import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({
  label,
  error,
  className = "",
  children,
  ...props
}: SelectProps) {
  const baseClasses =
    "h-10 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

  const classes = `${baseClasses} ${
    error ? "border-red-500" : ""
  } ${className}`;

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-semibold text-gray-800 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <select className={classes} {...props}>
        {children}
      </select>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}

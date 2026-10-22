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
  const generatedId = React.useId();
  const id = props.id ?? generatedId;
  const baseClasses =
    "disabled:cursor-not-allowed disabled:opacity-50";

  const classes = `${baseClasses} ${
    error ? "border-red-500" : ""
  } ${className}`;

  return (
    <div className="sc-field" data-invalid={!!error}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-gray-800 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <select className={classes} {...props} id={id} aria-invalid={!!error}>
        {children}
      </select>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}

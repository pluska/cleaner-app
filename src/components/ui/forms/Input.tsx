import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id: suppliedId, ...props }: InputProps) {
  const generatedId = React.useId();
  const id = suppliedId ?? generatedId;
  const errorId = `${id}-error`;
  return (
    <div className="sc-field" data-invalid={!!error}>
      {label && <label htmlFor={id}>{label}</label>}
      <input {...props} id={id} className={className} aria-invalid={!!error} aria-describedby={[props['aria-describedby'], error ? errorId : undefined].filter(Boolean).join(' ') || undefined} />
      {error && <p id={errorId} className="sc-field-error">{error}</p>}
    </div>
  );
}

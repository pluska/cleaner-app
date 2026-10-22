import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const sizes = { sm: 'px-3', md: 'px-6', lg: 'px-8' };
  return (
    <button className={twMerge(`sc-button sc-button-${variant} inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${sizes[size]}`, className)} {...props}>
      {children}
    </button>
  );
}

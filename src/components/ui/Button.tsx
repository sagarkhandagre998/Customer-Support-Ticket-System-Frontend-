'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  asChild?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, asChild = false, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 hover:scale-105 active:scale-95',
      outline: 'border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900 hover:scale-105 active:scale-95',
      ghost: 'hover:bg-gray-100 hover:text-gray-900 hover:scale-105 active:scale-95',
      destructive: 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 active:scale-95',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-8 text-lg',
    };

    if (asChild) {
      return (
        <span
          ref={ref}
          className={cn(
            baseClasses,
            variants[variant],
            sizes[size],
            className
          )}
          suppressHydrationWarning
          {...props}
        >
          {children}
        </span>
      );
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

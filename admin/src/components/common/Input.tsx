import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const hasError = Boolean(error);

    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-stone-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={twMerge(
              clsx(
                'w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900 transition-colors placeholder:text-stone-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400 dark:bg-stone-900 dark:text-stone-100 dark:disabled:bg-stone-800/50',
                leftIcon ? 'pl-9' : 'pl-3',
                rightIcon ? 'pr-9' : 'pr-3',
                hasError
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500'
                  : 'border-stone-300 focus:border-brand-500 focus:ring-brand-500/20 dark:border-stone-700 dark:focus:border-brand-400',
                className,
              ),
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-stone-400">
              {rightIcon}
            </div>
          )}
        </div>
        {typeof error === 'string' && error ? (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | boolean;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, helperText, rows = 3, id, ...props }, ref) => {
    const hasError = Boolean(error);

    return (
      <div className="w-full">
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          className={twMerge(
            clsx(
              'w-full rounded-lg border bg-white p-3 text-sm text-stone-900 transition-colors placeholder:text-stone-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400 dark:bg-stone-900 dark:text-stone-100 dark:disabled:bg-stone-800/50',
              hasError
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-500'
                : 'border-stone-300 focus:border-brand-500 focus:ring-brand-500/20 dark:border-stone-700 dark:focus:border-brand-400',
              className,
            ),
          )}
          {...props}
        />
        {typeof error === 'string' && error ? (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

import React from 'react';
import { Inbox } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30',
          className,
        ),
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500 mb-4">
        {icon || <Inbox className="h-6 w-6 stroke-[1.5]" />}
      </div>
      <h4 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-1">
        {title}
      </h4>
      {description && (
        <p className="max-w-sm text-sm text-stone-500 dark:text-stone-400 mb-5">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

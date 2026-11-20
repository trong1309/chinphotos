import React from 'react';
import { Card } from '../common/Card';
import { Skeleton } from '../common/Skeleton';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { clsx } from 'clsx';

export interface StatCardProps {
  title: string;
  value: string | number;
  changePercent?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  changePercent,
  changeLabel = 'so với kỳ trước',
  icon,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <Card className={clsx('p-5', className)}>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton variant="circular" className="h-10 w-10" />
        </div>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </Card>
    );
  }

  const isPositive = changePercent !== undefined && changePercent > 0;
  const isNegative = changePercent !== undefined && changePercent < 0;
  const isNeutral = changePercent === 0;

  return (
    <Card className={clsx('p-5 transition-all hover:shadow-md', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          {title}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1.5">
        <h3 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {value}
        </h3>
      </div>

      {changePercent !== undefined && (
        <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
          <span
            className={clsx(
              'inline-flex items-center font-semibold rounded px-1 py-0.5 text-[11px]',
              isPositive && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
              isNegative && 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
              isNeutral && 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
            )}
          >
            {isPositive && <ArrowUpRight className="h-3 w-3 mr-0.5" />}
            {isNegative && <ArrowDownRight className="h-3 w-3 mr-0.5" />}
            {isNeutral && <Minus className="h-3 w-3 mr-0.5" />}
            {isPositive && '+'}
            {changePercent}%
          </span>
          <span>{changeLabel}</span>
        </div>
      )}
    </Card>
  );
};

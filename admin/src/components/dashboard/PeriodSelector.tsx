import React from 'react';
import { AnalyticsPeriod } from '../../types';
import { clsx } from 'clsx';

export interface PeriodSelectorProps {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
  className?: string;
}

const periods: { value: AnalyticsPeriod; label: string }[] = [
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: '3m', label: '3 tháng' },
  { value: '12m', label: '12 tháng' },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <div
      className={clsx(
        'inline-flex items-center rounded-xl bg-stone-100 p-1 dark:bg-stone-800 select-none',
        className,
      )}
    >
      {periods.map((p) => {
        const isActive = value === p.value;
        return (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            className={clsx(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20',
              isActive
                ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-stone-100 font-semibold'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200',
            )}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
};

import React from 'react';
import { SearchInput } from './SearchInput';
import { Button } from './Button';
import { RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  activeFilterCount?: number;
  onReset?: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  filters,
  actions,
  activeFilterCount = 0,
  onReset,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-stone-800 dark:bg-stone-900',
          className,
        ),
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {onSearchChange && (
          <SearchInput
            value={searchValue || ''}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="w-full sm:w-64"
          />
        )}
        {filters}
        {activeFilterCount > 0 && onReset && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            className="text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
          >
            Đặt lại ({activeFilterCount})
          </Button>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0 pt-2 border-t border-stone-100 sm:pt-0 sm:border-0 dark:border-stone-800">
          {actions}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Select } from './Select';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const startItem = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, total);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push('ellipsis');

      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (safePage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col gap-3 py-3 px-2 sm:flex-row sm:items-center sm:justify-between text-xs text-stone-600 dark:text-stone-400 select-none',
          className,
        ),
      )}
    >
      <div className="flex items-center gap-3">
        <span>
          Hiển thị <strong className="text-stone-900 dark:text-stone-100">{startItem}</strong> -{' '}
          <strong className="text-stone-900 dark:text-stone-100">{endItem}</strong> trong tổng số{' '}
          <strong className="text-stone-900 dark:text-stone-100">{total}</strong>
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span>Mỗi trang:</span>
            <div className="w-20">
              <Select
                value={String(pageSize)}
                onValueChange={(val) => onPageSizeChange(Number(val))}
                options={pageSizeOptions.map((opt) => ({
                  label: String(opt),
                  value: String(opt),
                }))}
                className="py-1 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={safePage === 1}
          aria-label="Trang đầu tiên"
          className="rounded p-1.5 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-stone-800 transition-colors"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage === 1}
          aria-label="Trang trước"
          className="rounded p-1.5 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-stone-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="px-1.5 text-stone-400">
                ...
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={clsx(
                  'min-w-[28px] h-7 rounded px-1.5 font-medium transition-colors',
                  safePage === p
                    ? 'bg-brand-500 text-white font-semibold'
                    : 'hover:bg-stone-100 text-stone-700 dark:text-stone-300 dark:hover:bg-stone-800',
                )}
              >
                {p}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage === totalPages}
          aria-label="Trang sau"
          className="rounded p-1.5 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-stone-800 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={safePage === totalPages}
          aria-label="Trang cuối"
          className="rounded p-1.5 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-stone-800 transition-colors"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

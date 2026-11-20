import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Checkbox } from './Checkbox';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  cell?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  mobileHidden?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectChange?: (ids: string[]) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
  mobileCardRender?: (
    item: T,
    isSelected: boolean,
    onToggleSelect: () => void,
  ) => React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  sortBy,
  sortOrder,
  onSort,
  selectable = false,
  selectedIds = [],
  onSelectChange,
  isLoading = false,
  emptyState,
  onRowClick,
  className,
  mobileCardRender,
}: DataTableProps<T>) {
  const allIds = data.map(keyExtractor);
  const isAllSelected =
    data.length > 0 && allIds.every((id) => selectedIds.includes(id));
  const isSomeSelected =
    data.length > 0 &&
    !isAllSelected &&
    allIds.some((id) => selectedIds.includes(id));

  const handleSelectAll = () => {
    if (!onSelectChange) return;
    if (isAllSelected) {
      onSelectChange(selectedIds.filter((id) => !allIds.includes(id)));
    } else {
      const unique = Array.from(new Set([...selectedIds, ...allIds]));
      onSelectChange(unique);
    }
  };

  const handleSelectRow = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onSelectChange) return;
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter((item) => item !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-3 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return emptyState ? (
      <>{emptyState}</>
    ) : (
      <EmptyState
        title="Không có dữ liệu"
        description="Không tìm thấy mục nào phù hợp với bộ lọc hiện tại."
      />
    );
  }

  return (
    <div className={twMerge('w-full', className)}>
      {/* Desktop Table View (>= lg) */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <table className="w-full text-left text-sm text-stone-600 dark:text-stone-300">
          <thead className="border-b border-stone-200 bg-stone-50/75 text-xs font-semibold uppercase tracking-wider text-stone-700 dark:border-stone-800 dark:bg-stone-850 dark:text-stone-300">
            <tr>
              {selectable && (
                <th scope="col" className="w-10 px-4 py-3.5">
                  <Checkbox
                    aria-label="Chọn tất cả"
                    checked={
                      isAllSelected
                        ? true
                        : isSomeSelected
                          ? 'indeterminate'
                          : false
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sortBy === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={twMerge('px-4 py-3.5', col.headerClassName)}
                  >
                    {col.sortable && onSort ? (
                      <button
                        type="button"
                        onClick={() => onSort(col.key)}
                        className="inline-flex items-center gap-1.5 font-semibold text-stone-700 hover:text-stone-900 focus:outline-none dark:text-stone-300 dark:hover:text-stone-100 transition-colors"
                      >
                        <span>{col.header}</span>
                        {isSorted ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5 text-brand-500" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-brand-500" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-stone-400 opacity-60" />
                        )}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {data.map((item, index) => {
              const id = keyExtractor(item);
              const isSelected = selectedIds.includes(id);

              return (
                <tr
                  key={id}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={clsx(
                    'transition-colors',
                    onRowClick && 'cursor-pointer',
                    isSelected
                      ? 'bg-brand-50/60 dark:bg-brand-950/20'
                      : 'hover:bg-stone-50/75 dark:hover:bg-stone-800/40',
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        aria-label={`Chọn dòng ${index + 1}`}
                        checked={isSelected}
                        onCheckedChange={() => handleSelectRow(id)}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={`${id}-${col.key}`}
                      className={twMerge('px-4 py-3.5', col.className)}
                    >
                      {col.cell
                        ? col.cell(item, index)
                        : (item as Record<string, unknown>)[col.key] != null
                          ? String((item as Record<string, unknown>)[col.key])
                          : null}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (< lg) */}
      <div className="lg:hidden space-y-3">
        {selectable && (
          <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900">
            <span className="text-xs text-stone-500">
              Đã chọn: <strong className="text-stone-900 dark:text-stone-100">{selectedIds.length}</strong>
            </span>
            <Checkbox
              label="Chọn tất cả"
              checked={
                isAllSelected ? true : isSomeSelected ? 'indeterminate' : false
              }
              onCheckedChange={handleSelectAll}
            />
          </div>
        )}

        {data.map((item, index) => {
          const id = keyExtractor(item);
          const isSelected = selectedIds.includes(id);

          if (mobileCardRender) {
            return (
              <div key={id}>
                {mobileCardRender(item, isSelected, () => handleSelectRow(id))}
              </div>
            );
          }

          return (
            <div
              key={id}
              onClick={() => onRowClick && onRowClick(item)}
              className={clsx(
                'rounded-xl border p-4 transition-all shadow-sm',
                isSelected
                  ? 'border-brand-300 bg-brand-50/40 dark:border-brand-800 dark:bg-brand-950/20'
                  : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900',
                onRowClick && 'cursor-pointer',
              )}
            >
              {selectable && (
                <div
                  className="mb-3 flex items-center justify-between border-b border-stone-100 pb-2.5 dark:border-stone-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    label={`Mục #${index + 1}`}
                    checked={isSelected}
                    onCheckedChange={() => handleSelectRow(id)}
                  />
                </div>
              )}

              <div className="space-y-2.5">
                {columns
                  .filter((col) => !col.mobileHidden)
                  .map((col) => (
                    <div
                      key={`${id}-${col.key}`}
                      className="flex items-start justify-between gap-2 text-xs"
                    >
                      <span className="font-medium text-stone-500 dark:text-stone-400 shrink-0">
                        {col.header}:
                      </span>
                      <div className="text-right text-stone-800 dark:text-stone-200 font-medium">
                        {col.cell
                          ? col.cell(item, index)
                          : (item as Record<string, unknown>)[col.key] != null
                            ? String((item as Record<string, unknown>)[col.key])
                            : '-'}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

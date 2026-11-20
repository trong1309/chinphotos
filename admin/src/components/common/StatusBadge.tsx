import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeStatus =
  | 'published'
  | 'draft'
  | 'featured'
  | 'archived'
  | 'new'
  | 'contacted'
  | 'booked'
  | 'completed'
  | 'cancelled'
  | 'active'
  | 'inactive'
  | string;

export interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  published: {
    label: 'Đã xuất bản',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  active: {
    label: 'Đang hoạt động',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  draft: {
    label: 'Bản nháp',
    bg: 'bg-stone-100 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700',
    text: 'text-stone-700 dark:text-stone-300',
    dot: 'bg-stone-400',
  },
  inactive: {
    label: 'Đã ẩn',
    bg: 'bg-stone-100 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700',
    text: 'text-stone-700 dark:text-stone-300',
    dot: 'bg-stone-400',
  },
  featured: {
    label: 'Nổi bật',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  archived: {
    label: 'Lưu trữ',
    bg: 'bg-stone-100 dark:bg-stone-850 border-stone-300 dark:border-stone-700',
    text: 'text-stone-600 dark:text-stone-400',
    dot: 'bg-stone-500',
  },
  new: {
    label: 'Mới',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60',
    text: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500 animate-pulse',
  },
  read: {
    label: 'Đã đọc',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  replied: {
    label: 'Đã trả lời',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  contacted: {
    label: 'Đã liên hệ',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60',
    text: 'text-indigo-700 dark:text-indigo-300',
    dot: 'bg-indigo-500',
  },
  booked: {
    label: 'Đã đặt lịch',
    bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60',
    text: 'text-purple-700 dark:text-purple-300',
    dot: 'bg-purple-500',
  },
  completed: {
    label: 'Hoàn thành',
    bg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/60',
    text: 'text-teal-700 dark:text-teal-300',
    dot: 'bg-teal-500',
  },
  cancelled: {
    label: 'Đã huỷ',
    bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className,
}) => {
  const config = statusConfig[status.toLowerCase()] || {
    label: status,
    bg: 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700',
    text: 'text-stone-700 dark:text-stone-300',
    dot: 'bg-stone-400',
  };

  const displayText = label || config.label;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-medium rounded-full border select-none',
          config.bg,
          config.text,
          sizeClasses[size],
          className,
        ),
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full shrink-0', config.dot)} />
      {displayText}
    </span>
  );
};

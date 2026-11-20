import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value: externalValue,
  onChange,
  placeholder = 'Tìm kiếm...',
  debounceMs = 300,
  className,
}) => {
  const [internalValue, setInternalValue] = useState(externalValue);
  const debouncedValue = useDebounce(internalValue, debounceMs);

  // Sync external changes (e.g. reset or URL change)
  useEffect(() => {
    setInternalValue(externalValue);
  }, [externalValue]);

  // Trigger onChange when debounced internal value differs from external
  useEffect(() => {
    if (debouncedValue !== externalValue) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, externalValue, onChange]);

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  return (
    <div className={twMerge('relative flex items-center min-w-[200px]', className)}>
      <Search className="absolute left-3 h-4 w-4 text-stone-400 pointer-events-none" />
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className={clsx(
          'w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-8 text-sm text-stone-900 transition-colors placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-brand-400',
        )}
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Xoá tìm kiếm"
          className="absolute right-2.5 rounded p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string | boolean;
  className?: string;
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Chọn một mục...',
  disabled = false,
  error,
  className,
  id,
}) => {
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          id={id}
          className={twMerge(
            clsx(
              'flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-stone-900 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400 dark:bg-stone-900 dark:text-stone-100 dark:disabled:bg-stone-800/50',
              hasError
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-stone-300 focus:border-brand-500 focus:ring-brand-500/20 dark:border-stone-700 dark:focus:border-brand-400',
              className,
            ),
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 text-stone-400 shrink-0 ml-2" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className="z-50 min-w-[8rem] max-h-72 overflow-y-auto rounded-lg border border-stone-200 bg-white p-1 shadow-lg animate-in fade-in-80 dark:border-stone-800 dark:bg-stone-900"
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={clsx(
                    'relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm text-stone-800 outline-none hover:bg-stone-100 focus:bg-stone-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:text-stone-200 dark:hover:bg-stone-800 dark:focus:bg-stone-800',
                  )}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {typeof error === 'string' && error ? (
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
      ) : null}
    </div>
  );
};

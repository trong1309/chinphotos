import React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CheckboxProps {
  checked?: boolean | 'indeterminate';
  defaultChecked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: string;
  id?: string;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  label,
  description,
  id,
  className,
}) => {
  const checkboxId =
    id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={twMerge('flex items-start gap-2.5', className)}>
      <CheckboxPrimitive.Root
        id={checkboxId}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={clsx(
          'peer h-4 w-4 shrink-0 rounded border border-stone-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500 data-[state=checked]:text-white data-[state=indeterminate]:bg-brand-500 data-[state=indeterminate]:border-brand-500 data-[state=indeterminate]:text-white dark:border-stone-600 dark:data-[state=checked]:bg-brand-500',
        )}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          {checked === 'indeterminate' ? (
            <Minus className="h-3 w-3 stroke-[3]" />
          ) : (
            <Check className="h-3 w-3 stroke-[3]" />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {(label || description) && (
        <div className="flex flex-col select-none">
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm font-medium text-stone-900 cursor-pointer dark:text-stone-100"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-stone-500 dark:text-stone-400">{description}</p>
          )}
        </div>
      )}
    </div>
  );
};

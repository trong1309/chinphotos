import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showCloseButton?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  children,
  footer,
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-5xl',
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Content */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <DialogPrimitive.Content
            className={twMerge(
              clsx(
                'relative w-full rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-none my-8',
                sizeClasses[size],
              ),
            )}
          >
            {(title || description || showCloseButton) && (
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1 pr-6">
                  {title && (
                    <DialogPrimitive.Title className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                      {title}
                    </DialogPrimitive.Title>
                  )}
                  {description && (
                    <DialogPrimitive.Description className="text-sm text-stone-500 dark:text-stone-400">
                      {description}
                    </DialogPrimitive.Description>
                  )}
                </div>
                {showCloseButton && (
                  <DialogPrimitive.Close asChild>
                    <button
                      type="button"
                      aria-label="Đóng hộp thoại"
                      className="rounded-lg p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </DialogPrimitive.Close>
                )}
              </div>
            )}

            <div className="mt-2">{children}</div>

            {footer && (
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                {footer}
              </div>
            )}
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

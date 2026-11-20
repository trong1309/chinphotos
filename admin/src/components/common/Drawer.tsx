import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  side = 'right',
  size = 'md',
  title,
  description,
  children,
  footer,
  showCloseButton = true,
}) => {
  const sizeClasses = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  const sideClasses = {
    right:
      'inset-y-0 right-0 border-l data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300',
    left:
      'inset-y-0 left-0 border-r data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300',
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
        <DialogPrimitive.Content
          className={twMerge(
            clsx(
              'fixed z-50 flex h-full w-full flex-col bg-white p-6 shadow-2xl dark:bg-stone-900 border-stone-200 dark:border-stone-800 focus:outline-none overflow-y-auto',
              sideClasses[side],
              sizeClasses[size],
            ),
          )}
        >
          {(title || description || showCloseButton) && (
            <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
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
                    aria-label="Đóng ngăn kéo"
                    className="rounded-lg p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </DialogPrimitive.Close>
              )}
            </div>
          )}

          <div className="flex-1 py-4">{children}</div>

          {footer && (
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

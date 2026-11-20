import { createContext } from 'react';

export interface ConfirmOptions {
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export type ConfirmFunction = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmFunction | null>(null);

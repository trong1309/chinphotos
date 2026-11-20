import React, { useState, useRef, useCallback } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { ConfirmContext, ConfirmFunction, ConfirmOptions } from './confirmContext';

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFunction>((opts) => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts);
      resolveRef.current = resolve;
    });
  }, []);

  const handleClose = () => {
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
    setOptions(null);
  };

  const handleConfirm = () => {
    if (resolveRef.current) {
      resolveRef.current(true);
      resolveRef.current = null;
    }
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <ConfirmDialog
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title={options.title}
          message={options.message}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          variant={options.variant}
        />
      )}
    </ConfirmContext.Provider>
  );
};

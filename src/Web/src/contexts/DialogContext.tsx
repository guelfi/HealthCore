import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useResponsive } from '../hooks/useResponsive';

export type DialogType = 'alert' | 'confirm' | 'modal' | 'bottomSheet';

export interface DialogConfig {
  id: string;
  type: DialogType;
  title?: string;
  message?: string;
  content?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  persistent?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export interface DialogContextValue {
  dialogs: DialogConfig[];
  showAlert: (config: Omit<DialogConfig, 'id' | 'type'>) => Promise<void>;
  showConfirm: (config: Omit<DialogConfig, 'id' | 'type'>) => Promise<boolean>;
  showModal: (config: Omit<DialogConfig, 'id' | 'type'>) => string;
  showBottomSheet: (config: Omit<DialogConfig, 'id' | 'type'>) => string;
  closeDialog: (id: string) => void;
  closeAllDialogs: () => void;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export const useDialog = (): DialogContextValue => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export interface DialogProviderProps {
  children: ReactNode;
}

export const DialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
  const [dialogs, setDialogs] = useState<DialogConfig[]>([]);
  const { isMobile } = useResponsive();

  const generateId = useCallback(() => {
    return `dialog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addDialog = useCallback((config: DialogConfig) => {
    setDialogs(prev => [...prev, config]);
    return config.id;
  }, []);

  const removeDialog = useCallback((id: string) => {
    setDialogs(prev => prev.filter(dialog => dialog.id !== id));
  }, []);

  const showAlert = useCallback((config: Omit<DialogConfig, 'id' | 'type'>): Promise<void> => {
    return new Promise((resolve) => {
      const id = generateId();
      const dialogConfig: DialogConfig = {
        ...config,
        id,
        type: 'alert',
        confirmText: config.confirmText || 'OK',
        onConfirm: () => {
          removeDialog(id);
          config.onConfirm?.();
          resolve();
        },
        onClose: () => {
          removeDialog(id);
          config.onClose?.();
          resolve();
        }
      };
      addDialog(dialogConfig);
    });
  }, [generateId, addDialog, removeDialog]);

  const showConfirm = useCallback((config: Omit<DialogConfig, 'id' | 'type'>): Promise<boolean> => {
    return new Promise((resolve) => {
      const id = generateId();
      const dialogConfig: DialogConfig = {
        ...config,
        id,
        type: 'confirm',
        confirmText: config.confirmText || 'Confirmar',
        cancelText: config.cancelText || 'Cancelar',
        onConfirm: async () => {
          try {
            await config.onConfirm?.();
            removeDialog(id);
            resolve(true);
          } catch (error) {
            console.error('Error in dialog confirm:', error);
            removeDialog(id);
            resolve(false);
          }
        },
        onCancel: () => {
          removeDialog(id);
          config.onCancel?.();
          resolve(false);
        },
        onClose: () => {
          removeDialog(id);
          config.onClose?.();
          resolve(false);
        }
      };
      addDialog(dialogConfig);
    });
  }, [generateId, addDialog, removeDialog]);

  const showModal = useCallback((config: Omit<DialogConfig, 'id' | 'type'>): string => {
    const id = generateId();
    const dialogConfig: DialogConfig = {
      ...config,
      id,
      type: 'modal',
      fullScreen: config.fullScreen ?? isMobile,
      onClose: () => {
        removeDialog(id);
        config.onClose?.();
      }
    };
    addDialog(dialogConfig);
    return id;
  }, [generateId, addDialog, removeDialog, isMobile]);

  const showBottomSheet = useCallback((config: Omit<DialogConfig, 'id' | 'type'>): string => {
    const id = generateId();
    const dialogConfig: DialogConfig = {
      ...config,
      id,
      type: 'bottomSheet',
      onClose: () => {
        removeDialog(id);
        config.onClose?.();
      }
    };
    addDialog(dialogConfig);
    return id;
  }, [generateId, addDialog, removeDialog]);

  const closeDialog = useCallback((id: string) => {
    const dialog = dialogs.find(d => d.id === id);
    if (dialog) {
      dialog.onClose?.();
      removeDialog(id);
    }
  }, [dialogs, removeDialog]);

  const closeAllDialogs = useCallback(() => {
    dialogs.forEach(dialog => {
      dialog.onClose?.();
    });
    setDialogs([]);
  }, [dialogs]);

  const contextValue: DialogContextValue = {
    dialogs,
    showAlert,
    showConfirm,
    showModal,
    showBottomSheet,
    closeDialog,
    closeAllDialogs
  };

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
};

export default DialogProvider;
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    timestamp: Date;
    duration?: number;
    position?: { vertical: 'top' | 'bottom'; horizontal: 'left' | 'right' | 'center' };
    ariaLive?: 'polite' | 'assertive';
    action?: { label: string; onClick: () => void };
  }>;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  addNotification: (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
    options?: {
      duration?: number;
      position?: { vertical: 'top' | 'bottom'; horizontal: 'left' | 'right' | 'center' };
      ariaLive?: 'polite' | 'assertive';
      action?: { label: string; onClick: () => void };
    }
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // State
      sidebarOpen: true,
      theme: 'light',
      notifications: [],

      // Actions
      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

      toggleTheme: () =>
        set(state => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      addNotification: (message, type, options) => {
        const id = Date.now().toString();
        const notification = {
          id,
          message,
          type,
          timestamp: new Date(),
          duration: options?.duration,
          position: options?.position,
          ariaLive: options?.ariaLive,
          action: options?.action,
        };
        set(state => ({
          notifications: [...state.notifications, notification],
        }));

        // Auto-remove notification after 5 seconds
        const timeout = options?.duration ?? 5000;
        setTimeout(() => {
          get().removeNotification(id);
        }, timeout);
      },

      removeNotification: id =>
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-store',
      partialize: state => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
      }),
    }
  )
);

export default useUIStore;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      sidebarOpen: window.innerWidth >= 1024, // Open by default on desktop, closed on mobile
      sidebarCollapsed: false, // New: collapsed state for desktop (icons only vs full)
      activeView: 'dashboard',
      notifications: [],
      showNotifications: false,

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      toggleSidebarCollapse: () => set((state) => ({
        sidebarCollapsed: !state.sidebarCollapsed
      })),

      setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),

      setSidebarCollapsed: (isCollapsed) => set({ sidebarCollapsed: isCollapsed }),

      setActiveView: (view) => set({ activeView: view }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: Date.now(), timestamp: new Date() },
          ],
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      toggleNotifications: () =>
        set((state) => ({ showNotifications: !state.showNotifications })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed, // Persist collapsed state
      }),
    }
  )
);

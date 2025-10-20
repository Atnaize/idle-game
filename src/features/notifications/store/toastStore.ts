import { create } from 'zustand';
import type { Toast, AchievementToast } from '@features/notifications/types/toast';

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
  showAchievement: (achievementId: string, title: string, icon?: string) => void;
}

let toastIdCounter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${toastIdCounter++}`;
    const newToast: Toast = {
      ...toast,
      id,
      timestamp: Date.now(),
      duration: toast.duration || 3000,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },

  showAchievement: (achievementId, title, icon = '🏆') => {
    const achievementToast: Omit<AchievementToast, 'id' | 'timestamp'> = {
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: title,
      icon,
      duration: 4000, // Achievements stay a bit longer
      achievementId,
    };

    set((state) => ({
      toasts: [...state.toasts, {
        ...achievementToast,
        id: `toast-${Date.now()}-${toastIdCounter++}`,
        timestamp: Date.now(),
      }],
    }));
  },
}));

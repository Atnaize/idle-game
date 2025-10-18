/**
 * Toast notification types
 */

export type ToastType = 'achievement' | 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  icon?: string;
  duration?: number; // milliseconds, default 3000
  timestamp: number;
}

export interface AchievementToast extends Toast {
  type: 'achievement';
  achievementId: string;
}

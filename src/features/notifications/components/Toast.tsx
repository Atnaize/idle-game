import React, { useEffect, useState } from 'react';
import type { Toast as ToastType } from '@features/notifications/types/toast';
import '../styles/notifications.css';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 3000;
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id]);

  const handleDismiss = () => {
    setIsExiting(true);
    // Wait for exit animation to complete before removing
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  };

  const getTypeClass = () => {
    switch (toast.type) {
      case 'achievement':
        return 'toast--achievement';
      case 'success':
        return 'toast--success';
      case 'info':
        return 'toast--info';
      case 'warning':
        return 'toast--warning';
      case 'error':
        return 'toast--error';
      default:
        return '';
    }
  };

  return (
    <div
      className={`toast ${getTypeClass()} ${isExiting ? 'toast--exiting' : ''}`}
      onClick={handleDismiss}
      role="alert"
      aria-live="polite"
    >
      <div className="toast__content">
        {toast.icon && <div className="toast__icon">{toast.icon}</div>}
        <div className="toast__text">
          <div className="toast__title">{toast.title}</div>
          {toast.message && <div className="toast__message">{toast.message}</div>}
        </div>
      </div>
    </div>
  );
};

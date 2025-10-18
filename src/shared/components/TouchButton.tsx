import { ButtonHTMLAttributes, ReactNode, useCallback, useRef } from 'react';
import { LAYOUT } from '@shared/constants/layout';

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'tech';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  touchFeedback?: boolean; // Visual feedback on touch
}

/**
 * Touch-optimized button component for mobile
 *
 * Features:
 * - Minimum 44x44px touch target
 * - Active state with scale feedback
 * - Prevents double-tap zoom
 * - Touch event optimization
 * - Haptic feedback (where supported)
 */
export function TouchButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  touchFeedback = true,
  className = '',
  disabled = false,
  onClick,
  ...props
}: TouchButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle touch with haptic feedback
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      // Trigger haptic feedback on supported devices
      if ('vibrate' in navigator && touchFeedback) {
        navigator.vibrate(10); // 10ms subtle vibration
      }

      onClick?.(e);
    },
    [disabled, onClick, touchFeedback]
  );

  // Prevent touch delay and double-tap zoom
  const handleTouchStart = useCallback(() => {
    // Prevent 300ms delay on mobile
    if (buttonRef.current) {
      buttonRef.current.style.transform = 'scale(0.95)';
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (buttonRef.current) {
      buttonRef.current.style.transform = '';
    }
  }, []);

  // Size classes - using static values for Tailwind JIT compilation
  // Note: Template literals don't work with Tailwind, must use static strings
  const sizeClasses = {
    sm: 'min-h-[44px] px-3 py-2 text-sm', // LAYOUT.TOUCH.minSize
    md: 'min-h-[52px] px-4 py-3 text-base', // LAYOUT.TOUCH.comfortable
    lg: 'min-h-[52px] px-6 py-4 text-lg', // LAYOUT.TOUCH.comfortable
  };

  // Variant classes
  const variantClasses = {
    primary: 'tech-button',
    secondary: 'tech-card border-2 border-helix-blue text-white',
    danger: 'tech-card border-2 border-red-500 text-red-400 hover:bg-red-900 hover:bg-opacity-20',
    tech: 'tech-button',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        transition-all duration-150
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        touch-none select-none
        ${className}
      `}
      style={{
        touchAction: 'manipulation', // Prevents double-tap zoom
        WebkitTapHighlightColor: 'transparent', // Remove iOS tap highlight
      }}
      {...props}
    >
      {children}
    </button>
  );
}

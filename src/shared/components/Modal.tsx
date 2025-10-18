import { useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

/**
 * Reusable Modal Component
 *
 * Features:
 * - Renders outside DOM hierarchy using Portal
 * - Blurs background content when open
 * - Mobile-friendly with proper z-index management
 * - Accessible with backdrop click to close
 */
export function Modal({ isOpen, onClose, children, size = 'md' }: ModalProps) {
  // Apply blur effect to app content when modal is open
  useEffect(() => {
    const appWrapper = document.getElementById('app-wrapper');

    if (isOpen) {
      appWrapper?.classList.add('blur-sm');
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      appWrapper?.classList.remove('blur-sm');
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      appWrapper?.classList.remove('blur-sm');
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  // Size configurations
  const sizeClasses = {
    sm: 'w-[80%] h-auto max-h-[60vh]',
    md: 'w-[90%] h-auto max-h-[80vh]',
    lg: 'w-[95%] h-auto max-h-[90vh]',
    full: 'w-full h-full',
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-80 z-[200] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className={`fixed top-[10vh] left-1/2 -translate-x-1/2 ${sizeClasses[size]} max-w-lg z-[201]`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </>
  );

  // Render modal as portal at document body level (outside blurred content)
  return createPortal(modalContent, document.body);
}

/**
 * Modal Content Wrapper
 * Provides consistent styling for modal content
 */
interface ModalContentProps {
  children: ReactNode;
  className?: string;
}

export function ModalContent({ children, className = '' }: ModalContentProps) {
  return (
    <div className={`tech-card flex flex-col ${className}`}>
      <div className="tech-card__content flex-1 overflow-y-auto p-4 md:p-6">
        {children}
      </div>
    </div>
  );
}

/**
 * Modal Footer
 * For action buttons at the bottom
 */
interface ModalFooterProps {
  children: ReactNode;
}

export function ModalFooter({ children }: ModalFooterProps) {
  return (
    <div className="p-4 border-t-2 border-helix-blue">
      {children}
    </div>
  );
}

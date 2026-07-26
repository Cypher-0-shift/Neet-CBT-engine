/**
 * Modal component
 * Exam-style dialog — no frills, clear and functional
 */

import { type ReactNode, useEffect, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Prevent closing via Escape or backdrop click */
  preventClose?: boolean;
  width?: 'sm' | 'md' | 'lg';
}

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  preventClose = false,
  width = 'md',
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) {
        onClose();
      }
    },
    [onClose, preventClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={preventClose ? undefined : onClose}
      />

      {/* Dialog */}
      <div
        className={`
          relative z-[var(--z-modal)] bg-white rounded-lg shadow-xl
          w-full ${widthClasses[width]} mx-4
          flex flex-col max-h-[80vh]
        `}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-exam-border">
          <h2 className="text-base font-semibold text-app-text-primary">{title}</h2>
          {!preventClose && (
            <button
              onClick={onClose}
              className="text-app-text-muted hover:text-app-text-primary text-xl leading-none cursor-pointer"
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-exam-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

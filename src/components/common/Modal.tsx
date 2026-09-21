import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md'
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className={`relative bg-white dark:bg-[#18181B] border border-zinc-300 dark:border-zinc-700 shadow-2xl w-full ${maxWidth} z-10 overflow-hidden transform transition-all`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121214]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

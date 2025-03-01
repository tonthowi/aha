import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface PopoverConfirmProps {
  isOpen: boolean;
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const PopoverConfirm: React.FC<PopoverConfirmProps> = ({
  isOpen,
  message,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false,
  position = 'bottom',
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the confirm button when the popover opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  // Determine position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2';
      case 'bottom':
        return 'top-full mt-2';
      case 'left':
        return 'right-full mr-2';
      case 'right':
        return 'left-full ml-2';
      default:
        return 'top-full mt-2';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={`absolute z-50 ${getPositionClasses()} min-w-[200px]`}
          onKeyDown={handleKeyDown}
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-3">
              <p className="text-sm text-gray-700">{message}</p>
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {cancelText}
              </button>
              <button
                ref={confirmButtonRef}
                onClick={onConfirm}
                className={`flex-1 px-4 py-2 text-sm ${
                  isDestructive 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-black hover:bg-gray-800 text-white'
                } transition-colors`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 
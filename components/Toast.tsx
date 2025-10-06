import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 1500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="bg-white text-black dark:bg-gray-800 dark:text-white font-semibold py-2 px-4 rounded-md shadow-lg animate-toast-in border dark:border-transparent border-gray-200">
      {message}
    </div>
  );
};

export const ToastContainer: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <div 
      className="fixed left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 transition-all duration-300"
      style={{ top: 'var(--toast-top)' }}
    >
      {children}
    </div>
  );
};
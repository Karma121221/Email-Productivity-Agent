import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', options = {}) => {
    const id = ++toastId;
    const duration = options.duration || 4000;

    const toast = {
      id,
      message,
      type,
      description: options.description || null,
    };

    setToasts((prev) => [...prev, toast]);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const toast = {
    success: (message, options) => addToast(message, 'success', options),
    error: (message, options) => addToast(message, 'error', options),
    info: (message, options) => addToast(message, 'info', options),
    warning: (message, options) => addToast(message, 'warning', options),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, removeToast }) {
  return createPortal(
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>,
    document.body
  );
}

function Toast({ toast, onClose }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-300',
    error: 'bg-red-50 border-red-300',
    warning: 'bg-yellow-50 border-yellow-300',
    info: 'bg-blue-50 border-blue-300',
  };

  return (
    <div
      className={`
        ${bgColors[toast.type]}
        pointer-events-auto
        min-w-[320px] max-w-[420px]
        rounded-lg border-2 shadow-xl
        p-4 pr-10
        animate-in slide-in-from-right-full duration-300
        flex items-start gap-3
        relative
        backdrop-blur-sm
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {icons[toast.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800">
          {toast.message}
        </div>
        {toast.description && (
          <div className="text-xs text-gray-600 mt-1">
            {toast.description}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded-md hover:bg-white/50 transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
}

import toast from 'react-hot-toast';

// Helper functions for common toast patterns
export const showSuccess = (message) => toast.success(message);
export const showError = (message) => toast.error(message);
export const showLoading = (message) => toast.loading(message);

// Promise-based toast for async operations
export const toastPromise = (promise, messages) => {
  return toast.promise(promise, {
    loading: messages.loading || 'Loading...',
    success: messages.success || 'Success!',
    error: (err) => messages.error || err?.message || 'Something went wrong',
  });
};

// Custom styled toasts
export const showInfo = (message) => {
  toast(message, {
    icon: 'ℹ️',
  });
};

export const showWarning = (message) => {
  toast(message, {
    icon: '⚠️',
    style: {
      background: '#fef3c7',
      color: '#92400e',
    },
  });
};

export default toast;


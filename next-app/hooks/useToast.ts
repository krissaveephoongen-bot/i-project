import toast from 'react-hot-toast';

export const useToast = () => {
  const showSuccess = (message: string, duration = 3000) => {
    toast.success(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
        borderRadius: '8px',
        padding: '16px 24px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: '✓',
    });
  };

  const showError = (message: string, duration = 4000) => {
    toast.error(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#fff',
        borderRadius: '8px',
        padding: '16px 24px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: '✕',
    });
  };

  const showInfo = (message: string, duration = 3000) => {
    toast(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#3b82f6',
        color: '#fff',
        borderRadius: '8px',
        padding: '16px 24px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: 'ℹ',
    });
  };

  const showWarning = (message: string, duration = 3000) => {
    toast((t) => (
      <div style={{ fontSize: '14px', fontWeight: '500' }}>⚠ {message}</div>
    ), {
      duration,
      position: 'top-right',
      style: {
        background: '#f59e0b',
        color: '#fff',
        borderRadius: '8px',
        padding: '16px 24px',
      },
    });
  };

  return { showSuccess, showError, showInfo, showWarning };
};

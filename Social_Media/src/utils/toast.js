import toast from 'react-hot-toast'

export const showToast = {
  success: (message) =>
    toast.success(message, {
      style: {
        borderRadius: '14px',
        background: '#0f172a',
        color: '#f8fafc',
        fontSize: '13px',
        fontWeight: '500',
        padding: '12px 18px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
      iconTheme: {
        primary: '#10b981',
        secondary: '#0f172a',
      },
      duration: 2500,
    }),

  error: (message) =>
    toast.error(message, {
      style: {
        borderRadius: '14px',
        background: '#0f172a',
        color: '#f8fafc',
        fontSize: '13px',
        fontWeight: '500',
        padding: '12px 18px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: '#0f172a',
      },
      duration: 3000,
    }),

  info: (message) =>
    toast(message, {
      icon: '✨',
      style: {
        borderRadius: '14px',
        background: '#0f172a',
        color: '#f8fafc',
        fontSize: '13px',
        fontWeight: '500',
        padding: '12px 18px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
      },
      duration: 2500,
    }),
}

export default showToast


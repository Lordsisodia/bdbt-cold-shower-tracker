import toast, { Toaster } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

// Toast component with custom styling
export const CustomToaster = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#374151',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

// Enhanced toast functions
export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    });
  },
  
  warning: (message: string) => {
    toast(message, {
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      style: {
        borderColor: '#fbbf24',
      },
    });
  },
  
  info: (message: string) => {
    toast(message, {
      icon: <Info className="w-5 h-5 text-blue-500" />,
      style: {
        borderColor: '#3b82f6',
      },
    });
  },
};
import { toast, type ExternalToast } from 'sonner';

export const successToast = (message: string, options?: ExternalToast) => {
  toast.success(message, {
    ...options,
    style: {
      background: 'green',
      color: '#fff',
      border: 'none',
      ...options?.style,
    },
  });
};

export const errorToast = (message: string, options?: ExternalToast) => {
  toast.error(message, {
    ...options,
    style: {
      background: 'red',
      color: '#fff',
      border: 'none',
      ...options?.style,
    },
  });
};

import { toast as sonnerToast } from 'sonner';
import { TOAST_DURATION_MS } from '@/constants';

/**
 * Toast utility wrapper for consistent notifications across the app.
 * Uses sonner under the hood.
 */
export const toast = {
  success: (message: string, options?: { description?: string }) => {
    sonnerToast.success(message, {
      duration: TOAST_DURATION_MS,
      ...options,
    });
  },

  error: (message: string, options?: { description?: string }) => {
    sonnerToast.error(message, {
      duration: TOAST_DURATION_MS,
      ...options,
    });
  },

  info: (message: string, options?: { description?: string }) => {
    sonnerToast.info(message, {
      duration: TOAST_DURATION_MS,
      ...options,
    });
  },

  warning: (message: string, options?: { description?: string }) => {
    sonnerToast.warning(message, {
      duration: TOAST_DURATION_MS,
      ...options,
    });
  },

  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  dismiss: (id?: string | number) => {
    sonnerToast.dismiss(id);
  },
};

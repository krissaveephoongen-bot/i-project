import toast from 'react-hot-toast';
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Show a success notification
 */
export function notifySuccess(
  title: string,
  message?: string,
  duration: number = 5000
) {
  toast.success((t) => (
    <div className="flex gap-3">
      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  ), { duration });
}

/**
 * Show an error notification
 */
export function notifyError(
  title: string,
  message?: string,
  duration: number = 5000
) {
  toast.error((t) => (
    <div className="flex gap-3">
      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  ), { duration });
}

/**
 * Show an info notification
 */
export function notifyInfo(
  title: string,
  message?: string,
  duration: number = 5000
) {
  toast((t) => (
    <div className="flex gap-3">
      <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  ), { duration });
}

/**
 * Show a warning notification
 */
export function notifyWarning(
  title: string,
  message?: string,
  duration: number = 5000
) {
  toast((t) => (
    <div className="flex gap-3">
      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  ), { duration });
}

/**
 * Show a notification with loading state
 */
export function notifyLoading(title: string) {
  return toast.loading((t) => (
    <div className="flex gap-3">
      <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
      <p className="font-semibold text-gray-900">{title}</p>
    </div>
  ));
}

/**
 * Update a notification
 */
export function updateNotification(
  toastId: string,
  type: NotificationType,
  title: string,
  message?: string
) {
  toast.remove(toastId);
  
  switch (type) {
    case 'success':
      notifySuccess(title, message);
      break;
    case 'error':
      notifyError(title, message);
      break;
    case 'warning':
      notifyWarning(title, message);
      break;
    case 'info':
      notifyInfo(title, message);
      break;
  }
}

/**
 * Dismiss a notification
 */
export function dismissNotification(toastId: string) {
  toast.remove(toastId);
}

/**
 * Dismiss all notifications
 */
export function dismissAllNotifications() {
  toast.remove();
}

import { notifications } from '@mantine/notifications';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationOptions {
  title?: string;
  message: string;
  type?: NotificationType;
  autoClose?: number | boolean;
}

export function useNotifications() {
  const showNotification = ({
    title,
    message,
    type = 'info',
    autoClose = 5000
  }: NotificationOptions) => {
    const colorMap: Record<NotificationType, string> = {
      success: 'green',
      error: 'red',
      warning: 'yellow',
      info: 'blue'
    };

    notifications.show({
      title,
      message,
      color: colorMap[type],
      autoClose
    });
  };

  return {
    showNotification,
    showSuccess: (message: string, title = 'Success') =>
      showNotification({ title, message, type: 'success' }),
    showError: (message: string, title = 'Error') =>
      showNotification({ title, message, type: 'error' }),
    showWarning: (message: string, title = 'Warning') =>
      showNotification({ title, message, type: 'warning' }),
    showInfo: (message: string, title = 'Information') =>
      showNotification({ title, message, type: 'info' })
  };
}
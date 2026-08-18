import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const NotificationContext =
  createContext(null);

export function NotificationProvider({
  children,
}) {
  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const openNotifications = () => {
    setNotificationOpen(true);
  };

  const closeNotifications = () => {
    setNotificationOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationOpen(
      (current) => !current
    );
  };

  const addNotification = (notification) => {
    if (!notification) {
      return;
    }

    const newNotification = {
      id:
        notification.id ||
        `${Date.now()}-${Math.random()}`,

      title:
        notification.title ||
        "Notification",

      message:
        notification.message ||
        "",

      type:
        notification.type ||
        "info",

      time:
        notification.time ||
        new Date(),

      read:
        notification.read === true,
    };

    setNotifications(
      (current) => [
        newNotification,
        ...current,
      ]
    );
  };

  const removeNotification = (id) => {
    setNotifications(
      (current) =>
        current.filter(
          (notification) =>
            notification.id !== id
        )
    );
  };

  const markAsRead = (id) => {
    setNotifications(
      (current) =>
        current.map(
          (notification) =>
            notification.id === id
              ? {
                  ...notification,
                  read: true,
                }
              : notification
        )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      (current) =>
        current.map(
          (notification) => ({
            ...notification,
            read: true,
          })
        )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount =
    notifications.reduce(
      (count, notification) =>
        count +
        (notification.read ? 0 : 1),
      0
    );

  const value = useMemo(
    () => ({
      notificationOpen,
      notifications,
      unreadCount,

      openNotifications,
      closeNotifications,
      toggleNotifications,

      addNotification,
      removeNotification,

      markAsRead,
      markAllAsRead,

      clearAllNotifications,
    }),
    [
      notificationOpen,
      notifications,
      unreadCount,
    ]
  );

  return (
    <NotificationContext.Provider
      value={value}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context =
    useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}
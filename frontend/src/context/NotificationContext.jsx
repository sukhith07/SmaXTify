import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import API from "../services/api";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const openNotifications = () => {
    setNotificationOpen(true);
    fetchNotifications();
  };

  const closeNotifications = () => {
    setNotificationOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationOpen((current) => {
      const nextState = !current;

      if (nextState) {
        fetchNotifications();
      }

      return nextState;
    });
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);

      const response = await API.get("/notifications");

      const serverNotifications =
        response.data?.notifications || [];

      const formattedNotifications =
        serverNotifications.map((notification) => ({
          id: notification._id,
          title: notification.title || "Notification",
          message: notification.message || "",
          type: notification.type || "info",
          source: notification.source || "system",
          sourceId: notification.sourceId || null,
          reminderKey: notification.reminderKey || null,
          time: notification.time || notification.createdAt,
          read: notification.read === true,
        }));

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error(
        "Fetch Notifications Error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const addNotification = async (notification) => {
    if (!notification) {
      return;
    }

    try {
      const response = await API.post(
        "/notifications",
        notification
      );

      const createdNotification =
        response.data?.notification;

      if (!createdNotification) {
        await fetchNotifications();
        return;
      }

      const formattedNotification = {
        id: createdNotification._id,
        title:
          createdNotification.title ||
          "Notification",
        message:
          createdNotification.message || "",
        type:
          createdNotification.type || "info",
        source:
          createdNotification.source ||
          "system",
        sourceId:
          createdNotification.sourceId ||
          null,
        reminderKey:
          createdNotification.reminderKey ||
          null,
        time:
          createdNotification.time ||
          createdNotification.createdAt,
        read:
          createdNotification.read === true,
      };

      setNotifications((current) => [
        formattedNotification,
        ...current.filter(
          (item) =>
            item.id !== formattedNotification.id
        ),
      ]);
    } catch (error) {
      console.error(
        "Add Notification Error:",
        error.response?.data || error.message
      );
    }
  };

  const removeNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);

      setNotifications((current) =>
        current.filter(
          (notification) =>
            notification.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete Notification Error:",
        error.response?.data || error.message
      );
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(
        `/notifications/${id}/read`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Mark Notification Read Error:",
        error.response?.data || error.message
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put("/notifications/read-all");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error(
        "Mark All Notifications Error:",
        error.response?.data || error.message
      );
    }
  };

  const clearAllNotifications = async () => {
    try {
      await API.delete("/notifications");

      setNotifications([]);
    } catch (error) {
      console.error(
        "Clear Notifications Error:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetchNotifications();
    }
  }, []);

  const unreadCount = notifications.reduce(
    (count, notification) =>
      count + (notification.read ? 0 : 1),
    0
  );

  const value = useMemo(
    () => ({
      notificationOpen,
      notifications,
      unreadCount,
      loading,

      openNotifications,
      closeNotifications,
      toggleNotifications,

      fetchNotifications,

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
      loading,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}
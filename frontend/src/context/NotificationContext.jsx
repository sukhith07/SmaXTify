import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import API from "../services/api";

const NotificationContext =
  createContext(null);

const PROCESSED_PROMOTIONS_KEY =
  "smaxtify-processed-promotion-notifications";

const getProcessedPromotionStatuses = () => {
  try {
    const stored =
      localStorage.getItem(
        PROCESSED_PROMOTIONS_KEY
      );

    if (!stored) {
      return {};
    }

    const parsed =
      JSON.parse(stored);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed;
  } catch (error) {
    console.error(
      "Read Processed Promotion Status Error:",
      error
    );

    return {};
  }
};

const saveProcessedPromotionStatuses = (
  statuses
) => {
  try {
    localStorage.setItem(
      PROCESSED_PROMOTIONS_KEY,
      JSON.stringify(statuses)
    );
  } catch (error) {
    console.error(
      "Save Processed Promotion Status Error:",
      error
    );
  }
};

const getNotificationKey = (
  notification
) => {
  if (!notification) {
    return null;
  }

  if (notification._id) {
    return String(notification._id);
  }

  if (notification.id) {
    return String(notification.id);
  }

  if (notification.reminderKey) {
    return `reminder:${String(
      notification.reminderKey
    )}`;
  }

  if (notification.actionId) {
    return `action:${String(
      notification.actionId
    )}`;
  }

  return [
    notification.title || "",
    notification.message || "",
    notification.time ||
      notification.createdAt ||
      "",
  ].join("|");
};

const formatNotification = (
  notification
) => {
  const processedStatuses =
    getProcessedPromotionStatuses();

  const notificationId =
    notification?._id ||
    notification?.id ||
    null;

  const notificationKey =
    notificationId
      ? String(notificationId)
      : getNotificationKey(
          notification
        );

  const savedStatus =
    notificationKey
      ? processedStatuses[
          notificationKey
        ]
      : null;

  const actionType =
    notification?.actionType ||
    "none";

  const isPromotion =
    actionType ===
      "admin-promotion" ||
    notification?.title ===
      "Admin Promotion Request";

  return {
    id:
      notificationId
        ? String(notificationId)
        : notificationKey,

    title:
      notification?.title ||
      "Notification",

    message:
      notification?.message ||
      "",

    type:
      notification?.type ||
      "info",

    source:
      notification?.source ||
      "system",

    sourceId:
      notification?.sourceId ||
      null,

    reminderKey:
      notification?.reminderKey ||
      null,

    actionType,

    actionId:
      notification?.actionId ||
      notification?.sourceId ||
      null,

    actionStatus:
      isPromotion
        ? savedStatus ||
          notification?.actionStatus ||
          "pending"
        : notification?.actionStatus ||
          "none",

    time:
      notification?.time ||
      notification?.createdAt ||
      new Date().toISOString(),

    read:
      notification?.read === true ||
      Boolean(savedStatus),
  };
};

const sortNotifications = (
  notificationList
) => {
  return [...notificationList].sort(
    (a, b) => {
      const first =
        new Date(
          a?.time || 0
        ).getTime();

      const second =
        new Date(
          b?.time || 0
        ).getTime();

      return second - first;
    }
  );
};

const normalizeNotifications = (
  serverNotifications
) => {
  if (
    !Array.isArray(
      serverNotifications
    )
  ) {
    return [];
  }

  const uniqueNotifications =
    new Map();

  serverNotifications.forEach(
    (notification) => {
      if (!notification) {
        return;
      }

      const formatted =
        formatNotification(
          notification
        );

      const key =
        getNotificationKey(
          notification
        ) ||
        formatted.id;

      if (!key) {
        return;
      }

      if (
        !uniqueNotifications.has(
          key
        )
      ) {
        uniqueNotifications.set(
          key,
          formatted
        );
      }
    }
  );

  return sortNotifications(
    Array.from(
      uniqueNotifications.values()
    )
  );
};

export function NotificationProvider({
  children,
}) {
  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  // =========================================================
  // FETCH
  // =========================================================

  const fetchNotifications =
    useCallback(
      async () => {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          setNotifications([]);
          return;
        }

        try {
          setLoading(true);

          const response =
            await API.get(
              "/notifications"
            );

          const serverNotifications =
            response.data
              ?.notifications || [];

          const formatted =
            normalizeNotifications(
              serverNotifications
            );

          setNotifications(
            formatted
          );
        } catch (error) {
          console.error(
            "Fetch Notifications Error:",
            error.response
              ?.data ||
              error.message
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  // =========================================================
  // OPEN
  // =========================================================

  const openNotifications =
    useCallback(() => {
      setNotificationOpen(true);
      fetchNotifications();
    }, [fetchNotifications]);

  // =========================================================
  // CLOSE
  // =========================================================

  const closeNotifications =
    useCallback(() => {
      setNotificationOpen(false);
    }, []);

  // =========================================================
  // TOGGLE
  // =========================================================

  const toggleNotifications =
    useCallback(() => {
      setNotificationOpen(
        (current) => {
          const nextState =
            !current;

          if (nextState) {
            fetchNotifications();
          }

          return nextState;
        }
      );
    }, [fetchNotifications]);

  // =========================================================
  // AUTO REFRESH WHILE OPEN
  // =========================================================

  useEffect(() => {
    if (!notificationOpen) {
      return undefined;
    }

    const interval =
      setInterval(() => {
        fetchNotifications();
      }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [
    notificationOpen,
    fetchNotifications,
  ]);

  // =========================================================
  // ADD
  // =========================================================

  const addNotification =
    useCallback(
      async (
        notification
      ) => {
        if (!notification) {
          return;
        }

        try {
          const response =
            await API.post(
              "/notifications",
              notification
            );

          const created =
            response.data
              ?.notification;

          if (!created) {
            await fetchNotifications();
            return;
          }

          const formatted =
            formatNotification(
              created
            );

          setNotifications(
            (current) => {
              const withoutDuplicate =
                current.filter(
                  (item) =>
                    item.id !==
                    formatted.id
                );

              return sortNotifications(
                [
                  formatted,
                  ...withoutDuplicate,
                ]
              );
            }
          );
        } catch (error) {
          console.error(
            "Add Notification Error:",
            error.response
              ?.data ||
              error.message
          );
        }
      },
      [fetchNotifications]
    );

  // =========================================================
  // UPDATE NOTIFICATION
  // =========================================================

  const updateNotification =
    useCallback(
      (
        id,
        updates
      ) => {
        if (!id) {
          return;
        }

        if (
          updates?.actionStatus ===
            "approved" ||
          updates?.actionStatus ===
            "rejected"
        ) {
          const currentStatuses =
            getProcessedPromotionStatuses();

          const updatedStatuses =
            {
              ...currentStatuses,
              [String(id)]:
                updates.actionStatus,
            };

          saveProcessedPromotionStatuses(
            updatedStatuses
          );
        }

        setNotifications(
          (current) =>
            current.map(
              (notification) =>
                String(
                  notification.id
                ) === String(id)
                  ? {
                      ...notification,
                      ...updates,
                    }
                  : notification
            )
        );
      },
      []
    );

  // =========================================================
  // REMOVE
  // =========================================================

  const removeNotification =
    useCallback(
      async (
        id
      ) => {
        if (!id) {
          return;
        }

        try {
          await API.delete(
            `/notifications/${id}`
          );

          setNotifications(
            (current) =>
              current.filter(
                (notification) =>
                  String(
                    notification.id
                  ) !== String(id)
              )
          );

          const processedStatuses =
            getProcessedPromotionStatuses();

          if (
            processedStatuses[
              String(id)
            ]
          ) {
            delete processedStatuses[
              String(id)
            ];

            saveProcessedPromotionStatuses(
              processedStatuses
            );
          }
        } catch (error) {
          console.error(
            "Delete Notification Error:",
            error.response
              ?.data ||
              error.message
          );
        }
      },
      []
    );

  // =========================================================
  // REMOVE LOCALLY
  // =========================================================

  const removeNotificationLocal =
    useCallback(
      (id) => {
        if (!id) {
          return;
        }

        setNotifications(
          (current) =>
            current.filter(
              (notification) =>
                String(
                  notification.id
                ) !== String(id)
            )
        );
      },
      []
    );

  // =========================================================
  // MARK AS READ
  // =========================================================

  const markAsRead =
    useCallback(
      async (
        id
      ) => {
        if (!id) {
          return;
        }

        try {
          await API.put(
            `/notifications/${id}/read`
          );

          setNotifications(
            (current) =>
              current.map(
                (notification) =>
                  String(
                    notification.id
                  ) === String(id)
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
            error.response
              ?.data ||
              error.message
          );
        }
      },
      []
    );

  // =========================================================
  // MARK ALL AS READ
  // =========================================================

  const markAllAsRead =
    useCallback(
      async () => {
        try {
          await API.put(
            "/notifications/read-all"
          );

          setNotifications(
            (current) =>
              current.map(
                (notification) => ({
                  ...notification,
                  read: true,
                })
              )
          );
        } catch (error) {
          console.error(
            "Mark All Notifications Error:",
            error.response
              ?.data ||
              error.message
          );
        }
      },
      []
    );

  // =========================================================
  // CLEAR ALL
  // =========================================================

  const clearAllNotifications =
    useCallback(
      async () => {
        try {
          await API.delete(
            "/notifications"
          );

          setNotifications([]);

          localStorage.removeItem(
            PROCESSED_PROMOTIONS_KEY
          );
        } catch (error) {
          console.error(
            "Clear Notifications Error:",
            error.response
              ?.data ||
              error.message
          );
        }
      },
      []
    );

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (token) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [fetchNotifications]);

  // =========================================================
  // UNREAD COUNT
  // =========================================================

  const unreadCount =
    notifications.reduce(
      (
        count,
        notification
      ) =>
        count +
        (notification.read
          ? 0
          : 1),
      0
    );

  // =========================================================
  // CONTEXT VALUE
  // =========================================================

  const value =
    useMemo(
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
        updateNotification,

        removeNotification,
        removeNotificationLocal,

        markAsRead,
        markAllAsRead,

        clearAllNotifications,
      }),
      [
        notificationOpen,
        notifications,
        unreadCount,
        loading,

        openNotifications,
        closeNotifications,
        toggleNotifications,

        fetchNotifications,

        addNotification,
        updateNotification,

        removeNotification,
        removeNotificationLocal,

        markAsRead,
        markAllAsRead,

        clearAllNotifications,
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
    useContext(
      NotificationContext
    );

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}
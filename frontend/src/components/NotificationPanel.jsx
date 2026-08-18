import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaTrash,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaChartLine,
  FaBullseye,
  FaCreditCard,
  FaArrowRight,
  FaTimes,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

import "./styles/notification-panel.css";

function NotificationPanel() {
  const navigate = useNavigate();

  const {
    notificationOpen,
    notifications,
    unreadCount,
    closeNotifications,
    removeNotification,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  if (!notificationOpen) {
    return null;
  }

  const getIcon = (type) => {
    switch (type) {
      case "bill":
        return <FaMoneyBillWave />;

      case "budget":
        return <FaChartLine />;

      case "goal":
        return <FaBullseye />;

      case "subscription":
        return <FaCreditCard />;

      case "calendar":
        return <FaCalendarAlt />;

      case "warning":
        return <FaExclamationTriangle />;

      case "success":
        return <FaCheck />;

      default:
        return <FaInfoCircle />;
    }
  };

  const getType = (type) => {
    switch (type) {
      case "bill":
        return "bill";

      case "budget":
        return "budget";

      case "goal":
        return "goal";

      case "subscription":
        return "subscription";

      case "calendar":
        return "calendar";

      case "warning":
        return "warning";

      case "success":
        return "success";

      default:
        return "info";
    }
  };

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const date =
      time instanceof Date
        ? time
        : new Date(time);

    if (isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();

    const difference =
      now.getTime() - date.getTime();

    const seconds =
      Math.floor(difference / 1000);

    const minutes =
      Math.floor(seconds / 60);

    const hours =
      Math.floor(minutes / 60);

    const days =
      Math.floor(hours / 24);

    if (seconds < 60) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    if (hours < 24) {
      return `${hours}h ago`;
    }

    if (days < 7) {
      return `${days}d ago`;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
      }
    );
  };

  const recentNotifications =
    notifications.slice(0, 5);

  const openAllNotifications = () => {
    closeNotifications();

    navigate("/notifications");
  };

  return (
    <div
      className="notification-panel-wrapper"
      onClick={(event) =>
        event.stopPropagation()
      }
    >
      <div className="notification-panel">

        <div className="notification-panel-header">

          <div className="notification-panel-title">

            <div className="notification-panel-icon">
              <FaBell />
            </div>

            <div>
              <h2>
                Notifications
              </h2>

              <p>
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>

          </div>

          <div className="notification-panel-header-actions">

            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-panel-mark-all"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <FaCheckDouble />
              </button>
            )}

            <button
              type="button"
              className="notification-panel-close"
              onClick={closeNotifications}
              title="Close notifications"
              aria-label="Close notifications"
            >
              <FaTimes />
            </button>

          </div>

        </div>

        {recentNotifications.length === 0 ? (

          <div className="notification-panel-empty">

            <div className="notification-panel-empty-icon">
              <FaBell />
            </div>

            <h3>
              You're all caught up 🎉
            </h3>

            <p>
              No new notifications right now.
            </p>

          </div>

        ) : (

          <div className="notification-panel-list">

            {recentNotifications.map(
              (notification) => {

                const type =
                  getType(
                    notification.type
                  );

                return (
                  <div
                    key={notification.id}
                    className={`notification-panel-item ${
                      notification.read
                        ? ""
                        : "unread"
                    }`}
                    onClick={() => {
                      if (
                        !notification.read
                      ) {
                        markAsRead(
                          notification.id
                        );
                      }
                    }}
                  >

                    <div
                      className={`notification-panel-item-icon ${type}`}
                    >
                      {getIcon(
                        notification.type
                      )}
                    </div>

                    <div className="notification-panel-item-content">

                      <div className="notification-panel-item-title-row">

                        <h4>
                          {notification.title}
                        </h4>

                        {!notification.read && (
                          <span className="notification-panel-unread-dot" />
                        )}

                      </div>

                      <p>
                        {notification.message}
                      </p>

                      <span className="notification-panel-time">
                        {formatTime(
                          notification.time
                        )}
                      </span>

                    </div>

                    <button
                      type="button"
                      className="notification-panel-delete"
                      title="Delete"
                      aria-label="Delete notification"
                      onClick={(event) => {
                        event.stopPropagation();

                        removeNotification(
                          notification.id
                        );
                      }}
                    >
                      <FaTrash />
                    </button>

                  </div>
                );
              }
            )}

          </div>

        )}

        <div className="notification-panel-footer">

          <button
            type="button"
            className="notification-panel-view-all"
            onClick={openAllNotifications}
          >
            <span>
              View all notifications
            </span>

            <FaArrowRight />

          </button>

        </div>

      </div>
    </div>
  );
}

export default NotificationPanel;
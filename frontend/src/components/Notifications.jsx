import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaTrash,
  FaTimes,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaChartLine,
  FaBullseye,
  FaCreditCard,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

import "./styles/notifications.css";

function Notifications() {
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    closeNotifications,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
  } = useNotifications();

  const handleClose = () => {
    closeNotifications();
    navigate("/dashboard");
  };

  const getNotificationIcon = (type) => {
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

  const getNotificationType = (type) => {
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
      now.getTime() -
      date.getTime();

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
      return `${minutes} ${
        minutes === 1
          ? "minute"
          : "minutes"
      } ago`;
    }

    if (hours < 24) {
      return `${hours} ${
        hours === 1
          ? "hour"
          : "hours"
      } ago`;
    }

    if (days < 7) {
      return `${days} ${
        days === 1
          ? "day"
          : "days"
      } ago`;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="notifications-screen">

      <header className="notifications-header">

        <div className="notifications-header-left">

          <div className="notifications-main-icon">
            <FaBell />
          </div>

          <div>
            <h1>
              Notifications
            </h1>

            <p>
              Stay updated with your SmaXTify financial activity
            </p>
          </div>

        </div>

        <button
          type="button"
          className="notifications-close-btn"
          onClick={handleClose}
          aria-label="Close Notifications"
          title="Close"
        >
          <FaTimes />
        </button>

      </header>

      <main className="notifications-content">

        <section className="notifications-summary">

          <div className="notification-summary-card">

            <div className="notification-summary-icon">
              <FaBell />
            </div>

            <div>
              <span>
                TOTAL
              </span>

              <strong>
                {notifications.length}
              </strong>
            </div>

          </div>

          <div className="notification-summary-card">

            <div className="notification-summary-icon unread">
              <FaInfoCircle />
            </div>

            <div>
              <span>
                UNREAD
              </span>

              <strong>
                {unreadCount}
              </strong>
            </div>

          </div>

          <div className="notifications-summary-actions">

            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-action-btn"
                onClick={markAllAsRead}
              >
                <FaCheckDouble />
                Mark all as read
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                className="notification-action-btn danger"
                onClick={clearAllNotifications}
              >
                <FaTrash />
                Clear all
              </button>
            )}

          </div>

        </section>

        <section className="notifications-panel">

          <div className="notifications-panel-header">

            <div>
              <h2>
                Recent Notifications
              </h2>

              <p>
                Your latest SmaXTify updates
              </p>
            </div>

            {unreadCount > 0 && (
              <span className="unread-badge">
                {unreadCount} unread
              </span>
            )}

          </div>

          {notifications.length === 0 ? (

            <div className="notifications-empty">

              <div className="notifications-empty-icon">
                <FaBell />
              </div>

              <h3>
                You're all caught up 🎉
              </h3>

              <p>
                New bills, budget alerts,
                subscriptions, goals and
                other financial updates
                will appear here.
              </p>

            </div>

          ) : (

            <div className="notifications-list">

              {notifications.map(
                (notification) => {

                  const type =
                    getNotificationType(
                      notification.type
                    );

                  return (
                    <article
                      key={notification.id}
                      className={`notification-item ${
                        notification.read
                          ? "notification-read"
                          : "notification-unread"
                      }`}
                    >

                      <div
                        className={`notification-item-icon ${type}`}
                      >
                        {getNotificationIcon(
                          notification.type
                        )}
                      </div>

                      <div className="notification-item-content">

                        <div className="notification-item-top">

                          <h3>
                            {notification.title}
                          </h3>

                          {!notification.read && (
                            <span className="notification-unread-dot" />
                          )}

                        </div>

                        <p>
                          {notification.message}
                        </p>

                        <span className="notification-time">
                          {formatTime(
                            notification.time
                          )}
                        </span>

                      </div>

                      <div className="notification-item-actions">

                        {!notification.read && (
                          <button
                            type="button"
                            title="Mark as read"
                            aria-label="Mark as read"
                            onClick={() =>
                              markAsRead(
                                notification.id
                              )
                            }
                          >
                            <FaCheck />
                          </button>
                        )}

                        <button
                          type="button"
                          className="notification-delete"
                          title="Delete notification"
                          aria-label="Delete notification"
                          onClick={() =>
                            removeNotification(
                              notification.id
                            )
                          }
                        >
                          <FaTrash />
                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Notifications;
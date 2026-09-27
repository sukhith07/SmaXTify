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
  FaUserShield,
  FaShieldAlt,
} from "react-icons/fa";

import { useState } from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useNotifications,
} from "../context/NotificationContext";

import "./styles/notifications.css";

const API_URL =
  "http://localhost:5000/api";

function Notifications() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    notifications,
    unreadCount,
    closeNotifications,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    updateNotification,
  } = useNotifications();

  const [
    processingRequestId,
    setProcessingRequestId,
  ] = useState(null);

  const [
    confirmation,
    setConfirmation,
  ] = useState(null);

  const [
    processedStatuses,
    setProcessedStatuses,
  ] = useState({});

  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose = () => {
    closeNotifications();

    if (
      location.state?.from &&
      location.state.from !==
        location.pathname
    ) {
      navigate(
        location.state.from
      );

      return;
    }

    navigate("/dashboard");
  };

  // =========================================================
  // ICON
  // =========================================================

  const getNotificationIcon = (
    type
  ) => {
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
        return (
          <FaExclamationTriangle />
        );

      case "success":
        return <FaCheck />;

      default:
        return <FaInfoCircle />;
    }
  };

  // =========================================================
  // TYPE
  // =========================================================

  const getNotificationType = (
    type
  ) => {
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

  // =========================================================
  // TIME
  // =========================================================

  const formatTime = (
    time
  ) => {
    if (!time) {
      return "";
    }

    const date =
      time instanceof Date
        ? time
        : new Date(time);

    if (
      isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    const now =
      new Date();

    const difference =
      now.getTime() -
      date.getTime();

    const seconds =
      Math.floor(
        difference / 1000
      );

    const minutes =
      Math.floor(
        seconds / 60
      );

    const hours =
      Math.floor(
        minutes / 60
      );

    const days =
      Math.floor(
        hours / 24
      );

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

  // =========================================================
  // PROMOTION REQUEST
  // =========================================================

  const isPromotionRequest = (
    notification
  ) => {
    return (
      notification?.actionType ===
        "admin-promotion" ||
      (
        notification?.title ===
          "Admin Promotion Request" &&
        Boolean(
          notification?.sourceId
        )
      )
    );
  };

  // =========================================================
  // PROMOTION REQUEST ID
  // =========================================================

  const getPromotionRequestId = (
    notification
  ) => {
    return (
      notification?.actionId ||
      notification?.sourceId ||
      null
    );
  };

  // =========================================================
  // PROMOTION STATUS
  // =========================================================

  const getPromotionStatus = (
    notification
  ) => {
    const localStatus =
      processedStatuses[
        notification.id
      ];

    if (localStatus) {
      return localStatus;
    }

    return (
      notification?.actionStatus ||
      "pending"
    );
  };

  // =========================================================
  // OPEN CONFIRMATION
  // =========================================================

  const openConfirmation = (
    action,
    notification
  ) => {
    const requestId =
      getPromotionRequestId(
        notification
      );

    if (!requestId) {
      return;
    }

    const status =
      getPromotionStatus(
        notification
      );

    if (
      status !==
      "pending"
    ) {
      return;
    }

    setConfirmation({
      action,
      notification,
      requestId,
    });
  };

  // =========================================================
  // CLOSE CONFIRMATION
  // =========================================================

  const closeConfirmation = () => {
    if (
      processingRequestId
    ) {
      return;
    }

    setConfirmation(null);
  };

  // =========================================================
  // PROCESS PROMOTION
  // =========================================================

  const processPromotion =
    async () => {
      if (!confirmation) {
        return;
      }

      const {
        action,
        notification,
        requestId,
      } = confirmation;

      const newStatus =
        action === "approve"
          ? "approved"
          : "rejected";

      try {
        setProcessingRequestId(
          requestId
        );

        // ===================================================
        // UPDATE UI IMMEDIATELY
        // ===================================================

        setProcessedStatuses(
          (previous) => ({
            ...previous,
            [notification.id]:
              newStatus,
          })
        );

        if (
          typeof updateNotification ===
          "function"
        ) {
          updateNotification(
            notification.id,
            {
              actionType:
                "admin-promotion",

              actionId:
                requestId,

              actionStatus:
                newStatus,

              read: true,
            }
          );
        }

        // ===================================================
        // CLOSE CONFIRMATION IMMEDIATELY
        // ===================================================

        setConfirmation(null);

        // ===================================================
        // SEND REQUEST TO BACKEND
        // ===================================================

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          console.error(
            "Authentication token not found."
          );

          return;
        }

        const endpoint =
          action === "approve"
            ? "approve"
            : "reject";

        const response =
          await fetch(
            `${API_URL}/admin/promotion-requests/${requestId}/${endpoint}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              ...(action ===
              "reject"
                ? {
                    body:
                      JSON.stringify({
                        reason:
                          "Rejected by Super Admin",
                      }),
                  }
                : {}),
            }
          );

        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        // ===================================================
        // BACKEND RESULT
        // ===================================================

        if (!response.ok) {
          console.error(
            "Promotion Request Error:",
            data?.message ||
              `Failed to ${
                action === "approve"
                  ? "approve"
                  : "reject"
              } promotion request.`
          );

          /*
           * Do not rollback the notification.
           * The UI already shows the selected decision.
           */
          return;
        }

        // ===================================================
        // CONFIRM FINAL STATE
        // ===================================================

        setProcessedStatuses(
          (previous) => ({
            ...previous,
            [notification.id]:
              newStatus,
          })
        );

        if (
          typeof updateNotification ===
          "function"
        ) {
          updateNotification(
            notification.id,
            {
              actionType:
                "admin-promotion",

              actionId:
                requestId,

              actionStatus:
                newStatus,

              read: true,
            }
          );
        }
      } catch (error) {
        console.error(
          "Promotion Request Error:",
          error
        );

        /*
         * Keep the selected status visible.
         * Do not reset it back to Pending.
         */
      } finally {
        setProcessingRequestId(
          null
        );
      }
    };

  // =========================================================
  // CONFIRM ACTION
  // =========================================================

  const handleConfirmAction =
    () => {
      if (!confirmation) {
        return;
      }

      processPromotion();
    };

  return (
    <div className="notifications-screen">

      {/* =====================================================
          HEADER
      ===================================================== */}

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
          onClick={
            handleClose
          }
          aria-label="Close Notifications"
          title="Close"
        >
          <FaTimes />
        </button>

      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

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
                {
                  notifications.length
                }
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
                onClick={
                  markAllAsRead
                }
              >
                <FaCheckDouble />
                Mark all as read
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                className="notification-action-btn danger"
                onClick={
                  clearAllNotifications
                }
              >
                <FaTrash />
                Clear all
              </button>
            )}

          </div>

        </section>

        {/* ===================================================
            NOTIFICATIONS
        =================================================== */}

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

          {notifications.length ===
          0 ? (
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
                (
                  notification
                ) => {

                  const type =
                    getNotificationType(
                      notification.type
                    );

                  const promotionRequest =
                    isPromotionRequest(
                      notification
                    );

                  const promotionStatus =
                    promotionRequest
                      ? getPromotionStatus(
                          notification
                        )
                      : null;

                  const requestId =
                    getPromotionRequestId(
                      notification
                    );

                  const isProcessing =
                    processingRequestId ===
                    requestId;

                  const isPending =
                    promotionRequest &&
                    promotionStatus ===
                      "pending";

                  const isApproved =
                    promotionRequest &&
                    promotionStatus ===
                      "approved";

                  const isRejected =
                    promotionRequest &&
                    promotionStatus ===
                      "rejected";

                  return (
                    <article
                      key={
                        notification.id
                      }
                      className={`notification-item ${
                        notification.read
                          ? "notification-read"
                          : "notification-unread"
                      } ${
                        promotionRequest
                          ? "notification-promotion-request"
                          : ""
                      }`}
                    >

                      {/* =================================
                          ICON
                      ================================= */}

                      <div
                        className={`notification-item-icon ${
                          promotionRequest
                            ? "info"
                            : type
                        }`}
                      >
                        {promotionRequest ? (
                          <FaUserShield />
                        ) : (
                          getNotificationIcon(
                            notification.type
                          )
                        )}
                      </div>

                      {/* =================================
                          CONTENT
                      ================================= */}

                      <div className="notification-item-content">

                        <div className="notification-item-top">

                          <h3>
                            {
                              notification.title
                            }
                          </h3>

                          {!notification.read && (
                            <span className="notification-unread-dot" />
                          )}

                        </div>

                        <p>
                          {
                            notification.message
                          }
                        </p>

                        <span className="notification-time">
                          {formatTime(
                            notification.time
                          )}
                        </span>

                        {/* =================================
                            PENDING ACTIONS
                        ================================= */}

                        {isPending && (
                          <div className="notification-promotion-actions">

                            <button
                              type="button"
                              className="notification-promotion-approve"
                              disabled={
                                isProcessing
                              }
                              onClick={() =>
                                openConfirmation(
                                  "approve",
                                  notification
                                )
                              }
                            >
                              <FaCheck />
                              Approve
                            </button>

                            <button
                              type="button"
                              className="notification-promotion-reject"
                              disabled={
                                isProcessing
                              }
                              onClick={() =>
                                openConfirmation(
                                  "reject",
                                  notification
                                )
                              }
                            >
                              <FaTimes />
                              Reject
                            </button>

                          </div>
                        )}

                        {/* =================================
                            APPROVED
                        ================================= */}

                        {isApproved && (
                          <div className="notification-promotion-status approved">

                            <FaCheck />

                            <span>
                              Approved
                            </span>

                          </div>
                        )}

                        {/* =================================
                            REJECTED
                        ================================= */}

                        {isRejected && (
                          <div className="notification-promotion-status rejected">

                            <FaTimes />

                            <span>
                              Rejected
                            </span>

                          </div>
                        )}

                      </div>

                      {/* =================================
                          ACTIONS
                      ================================= */}

                      <div className="notification-item-actions">

                        {!notification.read &&
                          !promotionRequest && (
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

      {/* =====================================================
          PROFESSIONAL CONFIRMATION MODAL
      ===================================================== */}

      {confirmation && (
        <div
          className="promotion-modal-overlay"
          onClick={
            closeConfirmation
          }
        >
          <div
            className="promotion-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div
              className={`promotion-modal-icon ${
                confirmation.action ===
                "approve"
                  ? "approve"
                  : "reject"
              }`}
            >
              {confirmation.action ===
              "approve" ? (
                <FaShieldAlt />
              ) : (
                <FaTimes />
              )}
            </div>

            <button
              type="button"
              className="promotion-modal-close"
              onClick={
                closeConfirmation
              }
              disabled={
                Boolean(
                  processingRequestId
                )
              }
              aria-label="Close"
            >
              <FaTimes />
            </button>

            <h2>
              {confirmation.action ===
              "approve"
                ? "Approve Admin Promotion?"
                : "Reject Admin Promotion?"}
            </h2>

            <p>
              {confirmation.action ===
              "approve"
                ? "Are you sure you want to approve this promotion request? This user will receive Admin access to SmaXTify after this request is approved."
                : "Are you sure you want to reject this promotion request? This promotion request will be rejected and the selected user will remain a regular user."}
            </p>

            <div className="promotion-modal-actions">

              <button
                type="button"
                className="promotion-modal-cancel"
                onClick={
                  closeConfirmation
                }
                disabled={
                  Boolean(
                    processingRequestId
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  confirmation.action ===
                  "approve"
                    ? "promotion-modal-confirm approve"
                    : "promotion-modal-confirm reject"
                }
                onClick={
                  handleConfirmAction
                }
                disabled={
                  Boolean(
                    processingRequestId
                  )
                }
              >
                {processingRequestId ? (
                  <>
                    <span className="promotion-modal-spinner" />
                    Processing...
                  </>
                ) : confirmation.action ===
                  "approve" ? (
                  <>
                    <FaCheck />
                    Approve Request
                  </>
                ) : (
                  <>
                    <FaTimes />
                    Reject Request
                  </>
                )}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Notifications;
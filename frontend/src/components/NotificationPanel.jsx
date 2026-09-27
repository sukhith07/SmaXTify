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
  FaUserShield,
} from "react-icons/fa";

import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  useNotifications,
} from "../context/NotificationContext";

import "./styles/notification-panel.css";

const API_URL =
  "http://localhost:5000/api";

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

  if (!notificationOpen) {
    return null;
  }

  // =========================================================
  // ICON
  // =========================================================

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

  // =========================================================
  // TYPE
  // =========================================================

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

  // =========================================================
  // TIME
  // =========================================================

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

  // =========================================================
  // PROMOTION REQUEST CHECK
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
    if (
      !isPromotionRequest(
        notification
      )
    ) {
      return "none";
    }

    return (
      notification?.actionStatus ||
      "pending"
    );
  };

  // =========================================================
  // OPEN CONFIRMATION MODAL
  // =========================================================

  const openConfirmation = (
    event,
    notification,
    action
  ) => {
    event.stopPropagation();

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
  // CLOSE CONFIRMATION MODAL
  // =========================================================

  const closeConfirmation = () => {
    if (processingRequestId) {
      return;
    }

    setConfirmation(null);
  };

  // =========================================================
  // PROCESS PROMOTION ACTION
  // =========================================================

  const handlePromotionAction =
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

        /*
         * =====================================================
         * IMMEDIATE UI UPDATE
         * =====================================================
         */

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

        /*
         * Close the confirmation immediately.
         */

        setConfirmation(null);

        /*
         * =====================================================
         * BACKEND REQUEST
         * =====================================================
         */

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

        const isApprove =
          action ===
          "approve";

        const endpoint =
          isApprove
            ? `${API_URL}/admin/promotion-requests/${requestId}/approve`
            : `${API_URL}/admin/promotion-requests/${requestId}/reject`;

        const response =
          await fetch(
            endpoint,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              ...(isApprove
                ? {}
                : {
                    body:
                      JSON.stringify({
                        reason:
                          "Rejected by Super Admin",
                      }),
                  }),
            }
          );

        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        /*
         * =====================================================
         * BACKEND FAILED
         * =====================================================
         *
         * Do NOT restore the notification to pending.
         * The decision already happened in the UI.
         */

        if (!response.ok) {
          console.error(
            "Promotion Request Backend Error:",
            data?.message ||
              `Failed to ${
                isApprove
                  ? "approve"
                  : "reject"
              } promotion request.`
          );

          return;
        }

        /*
         * =====================================================
         * KEEP FINAL DECISION IN UI
         * =====================================================
         */

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
      } catch (error) {
        /*
         * =====================================================
         * IMPORTANT
         * =====================================================
         *
         * Do NOT rollback the UI.
         *
         * The notification must continue showing the
         * decision immediately without requiring refresh.
         */

        console.error(
          "Promotion Request Action Error:",
          error
        );
      } finally {
        setProcessingRequestId(
          null
        );
      }
    };

  // =========================================================
  // RECENT NOTIFICATIONS
  // =========================================================

  const recentNotifications =
    notifications.slice(
      0,
      5
    );

  // =========================================================
  // OPEN ALL
  // =========================================================

  const openAllNotifications = () => {
    closeNotifications();

    navigate(
      "/notifications"
    );
  };

  return (
    <>
      <div
        className="notification-panel-wrapper"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="notification-panel">

          {/* ===================================================
              HEADER
          =================================================== */}

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
                  onClick={
                    markAllAsRead
                  }
                  title="Mark all as read"
                >
                  <FaCheckDouble />
                </button>
              )}

              <button
                type="button"
                className="notification-panel-close"
                onClick={
                  closeNotifications
                }
                title="Close notifications"
                aria-label="Close notifications"
              >
                <FaTimes />
              </button>

            </div>

          </div>

          {/* ===================================================
              NOTIFICATIONS
          =================================================== */}

          {recentNotifications.length ===
          0 ? (

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

                  const promotionRequest =
                    isPromotionRequest(
                      notification
                    );

                  const promotionStatus =
                    getPromotionStatus(
                      notification
                    );

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
                    <div
                      key={
                        notification.id
                      }
                      className={`notification-panel-item ${
                        notification.read
                          ? ""
                          : "unread"
                      } ${
                        promotionRequest
                          ? "promotion-request"
                          : ""
                      }`}
                      onClick={() => {
                        if (
                          !notification.read &&
                          !promotionRequest
                        ) {
                          markAsRead(
                            notification.id
                          );
                        }
                      }}
                    >

                      {/* =======================================
                          ICON
                      ======================================= */}

                      <div
                        className={`notification-panel-item-icon ${
                          promotionRequest
                            ? "info"
                            : type
                        }`}
                      >
                        {promotionRequest ? (
                          <FaUserShield />
                        ) : (
                          getIcon(
                            notification.type
                          )
                        )}
                      </div>

                      {/* =======================================
                          CONTENT
                      ======================================= */}

                      <div className="notification-panel-item-content">

                        <div className="notification-panel-item-title-row">

                          <h4>
                            {
                              notification.title
                            }
                          </h4>

                          {!notification.read && (
                            <span className="notification-panel-unread-dot" />
                          )}

                        </div>

                        <p>
                          {
                            notification.message
                          }
                        </p>

                        <span className="notification-panel-time">
                          {formatTime(
                            notification.time
                          )}
                        </span>

                        {/* =====================================
                            PENDING ACTIONS
                        ===================================== */}

                        {isPending && (
                          <div className="notification-panel-promotion-actions">

                            <button
                              type="button"
                              className="notification-panel-approve"
                              disabled={
                                isProcessing
                              }
                              onClick={(
                                event
                              ) =>
                                openConfirmation(
                                  event,
                                  notification,
                                  "approve"
                                )
                              }
                            >
                              <FaCheck />
                              Approve
                            </button>

                            <button
                              type="button"
                              className="notification-panel-reject"
                              disabled={
                                isProcessing
                              }
                              onClick={(
                                event
                              ) =>
                                openConfirmation(
                                  event,
                                  notification,
                                  "reject"
                                )
                              }
                            >
                              <FaTimes />
                              Reject
                            </button>

                          </div>
                        )}

                        {/* =====================================
                            APPROVED STATUS
                        ===================================== */}

                        {isApproved && (
                          <div className="notification-panel-promotion-status approved">

                            <FaCheck />

                            <span>
                              Approved
                            </span>

                          </div>
                        )}

                        {/* =====================================
                            REJECTED STATUS
                        ===================================== */}

                        {isRejected && (
                          <div className="notification-panel-promotion-status rejected">

                            <FaTimes />

                            <span>
                              Rejected
                            </span>

                          </div>
                        )}

                      </div>

                      {/* =======================================
                          DELETE
                      ======================================= */}

                      <button
                        type="button"
                        className="notification-panel-delete"
                        title="Delete"
                        aria-label="Delete notification"
                        onClick={(
                          event
                        ) => {
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

          {/* ===================================================
              FOOTER
          =================================================== */}

          <div className="notification-panel-footer">

            <button
              type="button"
              className="notification-panel-view-all"
              onClick={
                openAllNotifications
              }
            >
              <span>
                View all notifications
              </span>

              <FaArrowRight />

            </button>

          </div>

        </div>
      </div>

      {/* =====================================================
          CONFIRMATION MODAL
      ===================================================== */}

      {confirmation && (
        <div
          className="promotion-confirm-overlay"
          onClick={
            closeConfirmation
          }
        >
          <div
            className="promotion-confirm-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div
              className={`promotion-confirm-icon ${
                confirmation.action ===
                "approve"
                  ? "approve"
                  : "reject"
              }`}
            >
              {confirmation.action ===
              "approve" ? (
                <FaUserShield />
              ) : (
                <FaTimes />
              )}
            </div>

            <div className="promotion-confirm-content">

              <h3>
                {confirmation.action ===
                "approve"
                  ? "Approve Admin Promotion?"
                  : "Reject Admin Promotion?"}
              </h3>

              <p>
                {confirmation.action ===
                "approve"
                  ? "Are you sure you want to approve this promotion request? This user will receive Admin access to SmaXTify after approval."
                  : "Are you sure you want to reject this promotion request? The selected user will remain a regular user."}
              </p>

            </div>

            <div className="promotion-confirm-actions">

              <button
                type="button"
                className="promotion-confirm-cancel"
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
                    ? "promotion-confirm-approve"
                    : "promotion-confirm-reject"
                }
                onClick={
                  handlePromotionAction
                }
                disabled={
                  Boolean(
                    processingRequestId
                  )
                }
              >
                {processingRequestId ? (
                  <>
                    <span className="promotion-confirm-spinner" />
                    Processing...
                  </>
                ) : (
                  <>
                    {confirmation.action ===
                    "approve" ? (
                      <FaCheck />
                    ) : (
                      <FaTimes />
                    )}

                    {confirmation.action ===
                    "approve"
                      ? "Approve Request"
                      : "Reject Request"}
                  </>
                )}
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default NotificationPanel;
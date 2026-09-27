import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaClipboardList,
  FaMagnifyingGlass,
  FaRotate,
  FaUserShield,
  FaUsers,
  FaCrown,
  FaUser,
  FaClock,
  FaBullseye,
  FaCircleInfo,
  FaFilter,
  FaTrash,
} from "react-icons/fa6";

const API_URL =
  "http://localhost:5000/api";

function AdminAuditLogs() {
  const [logs, setLogs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [actionFilter, setActionFilter] =
    useState("All");

  const [currentUser, setCurrentUser] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  // =========================================================
  // LOAD CURRENT USER
  // =========================================================

  const loadCurrentUser =
    useCallback(
      async () => {
        try {
          const storedUser =
            localStorage.getItem(
              "user"
            );

          let localUser = null;

          try {
            localUser =
              storedUser
                ? JSON.parse(
                    storedUser
                  )
                : null;
          } catch {
            localUser = null;
          }

          const token =
            localStorage.getItem(
              "token"
            );

          if (!token) {
            setCurrentUser(
              localUser
            );

            return;
          }

          const response =
            await fetch(
              `${API_URL}/auth/me`,
              {
                method: "GET",

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const result =
            await response.json();

          if (
            response.ok &&
            result?.user
          ) {
            const apiUser =
              result.user;

            const mergedUser = {
              ...localUser,
              ...apiUser,
            };

            setCurrentUser(
              mergedUser
            );

            localStorage.setItem(
              "user",
              JSON.stringify(
                mergedUser
              )
            );

            return;
          }

          setCurrentUser(
            localUser
          );
        } catch (error) {
          console.error(
            "Current User Error:",
            error
          );

          const storedUser =
            localStorage.getItem(
              "user"
            );

          try {
            setCurrentUser(
              storedUser
                ? JSON.parse(
                    storedUser
                  )
                : null
            );
          } catch {
            setCurrentUser(
              null
            );
          }
        }
      },
      []
    );

  // =========================================================
  // LOAD AUDIT LOGS
  // =========================================================

  const loadLogs =
    useCallback(
      async (
        isRefresh = false
      ) => {
        try {
          if (isRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const token =
            localStorage.getItem(
              "token"
            );

          if (!token) {
            throw new Error(
              "Authentication token not found"
            );
          }

          const response =
            await fetch(
              `${API_URL}/admin/audit-logs?limit=200`,
              {
                method: "GET",

                headers: {
                  Authorization:
                    `Bearer ${token}`,

                  "Content-Type":
                    "application/json",
                },
              }
            );

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result?.message ||
                "Failed to load audit logs"
            );
          }

          const list =
            result?.logs ||
            result?.auditLogs ||
            result?.data?.logs ||
            result?.data?.auditLogs ||
            [];

          setLogs(
            Array.isArray(list)
              ? list
              : []
          );
        } catch (error) {
          console.error(
            "Admin Audit Logs Error:",
            error
          );

          setError(
            error?.message ||
              "Failed to load audit logs"
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadCurrentUser();
    loadLogs();
  }, [
    loadCurrentUser,
    loadLogs,
  ]);

  // =========================================================
  // RESOLVE SUPER ADMIN ACCESS
  //
  // Primary source: /auth/me
  // Fallback: localStorage user
  // Additional fallback: the logged-in actor's own audit
  // record, when the database already identifies that actor
  // as Super Admin.
  // =========================================================

  const currentUserId =
    currentUser?._id ||
    currentUser?.id ||
    "";

  const currentUserEmail =
    String(
      currentUser?.email ||
        ""
    )
      .trim()
      .toLowerCase();

  const currentUserName =
    String(
      currentUser?.name ||
        ""
    )
      .trim()
      .toLowerCase();

  const canDelete =
    currentUser?.role ===
      "superadmin" ||
    logs.some((log) => {
      const actorId =
        log?.actor?._id ||
        log?.actor?.id ||
        "";

      const actorEmail =
        String(
          log?.actor?.email ||
            ""
        )
          .trim()
          .toLowerCase();

      const actorName =
        String(
          log?.actor?.name ||
            ""
        )
          .trim()
          .toLowerCase();

      const actorIsSuperAdmin =
        log?.actor?.role ===
          "superadmin" ||
        log?.actorRole ===
          "superadmin";

      if (
        !actorIsSuperAdmin
      ) {
        return false;
      }

      if (
        currentUserId &&
        actorId
      ) {
        return (
          String(
            currentUserId
          ) ===
          String(actorId)
        );
      }

      if (
        currentUserEmail &&
        actorEmail
      ) {
        return (
          currentUserEmail ===
          actorEmail
        );
      }

      if (
        currentUserName &&
        actorName
      ) {
        return (
          currentUserName ===
          actorName
        );
      }

      return false;
    });

  // =========================================================
  // ACTION OPTIONS
  // =========================================================

  const actionOptions =
    useMemo(() => {
      const actions =
        logs
          .map(
            (log) =>
              log?.action
          )
          .filter(Boolean);

      return [
        ...new Set(actions),
      ].sort();
    }, [logs]);

  // =========================================================
  // FILTERED LOGS
  // =========================================================

  const filteredLogs =
    useMemo(() => {
      const query =
        search
          .toLowerCase()
          .trim();

      return logs.filter(
        (log) => {
          const matchesAction =
            actionFilter ===
              "All" ||
            String(
              log?.action ||
                ""
            ) ===
              actionFilter;

          if (!matchesAction) {
            return false;
          }

          if (!query) {
            return true;
          }

          return [
            log?.action,
            log?.resource,
            log?.description,
            log?.actor?.name,
            log?.actor?.email,
            log?.actor?.role,
            log?.actorRole,
            log?.metadata
              ?.targetUserName,
            log?.metadata
              ?.targetUserEmail,
            log?.ipAddress,
          ]
            .map(
              (value) =>
                String(
                  value || ""
                ).toLowerCase()
            )
            .some(
              (value) =>
                value.includes(
                  query
                )
            );
        }
      );
    }, [
      logs,
      search,
      actionFilter,
    ]);

  // =========================================================
  // DELETE LOG
  // =========================================================

  const handleDeleteLog =
    async (logId) => {
      if (!logId) {
        return;
      }

      if (!canDelete) {
        window.alert(
          "Only Super Admin can delete audit logs."
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to permanently delete this audit log?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          logId
        );

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          throw new Error(
            "Authentication token not found"
          );
        }

        const response =
          await fetch(
            `${API_URL}/admin/audit-logs/${logId}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Failed to delete audit log"
          );
        }

        setLogs(
          (current) =>
            current.filter(
              (log) =>
                String(
                  log?._id
                ) !==
                String(
                  logId
                )
            )
        );
      } catch (error) {
        console.error(
          "Delete Audit Log Error:",
          error
        );

        window.alert(
          error?.message ||
            "Failed to delete audit log"
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(date);
  };

  // =========================================================
  // ROLE
  // =========================================================

  const getRoleLabel = (
    role
  ) => {
    if (
      role ===
      "superadmin"
    ) {
      return "Super Admin";
    }

    if (
      role === "admin"
    ) {
      return "Admin";
    }

    if (
      role === "system"
    ) {
      return "System";
    }

    if (
      role === "ai"
    ) {
      return "AI";
    }

    return "User";
  };

  const getRoleClass = (
    role
  ) => {
    if (
      role ===
      "superadmin"
    ) {
      return "superadmin";
    }

    if (
      role === "admin"
    ) {
      return "admin";
    }

    return "user";
  };

  const getRoleIcon = (
    role
  ) => {
    if (
      role ===
      "superadmin"
    ) {
      return <FaCrown />;
    }

    if (
      role === "admin"
    ) {
      return <FaUserShield />;
    }

    if (
      role === "user"
    ) {
      return <FaUsers />;
    }

    return <FaUser />;
  };

  // =========================================================
  // ACTION
  // =========================================================

  const getActionLabel = (
    action
  ) => {
    if (!action) {
      return "Unknown Action";
    }

    return String(
      action
    )
      .replaceAll(
        "_",
        " "
      )
      .toLowerCase()
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase()
      );
  };

  const getActionClass = (
    action
  ) => {
    const value =
      String(
        action || ""
      ).toLowerCase();

    if (
      value.includes(
        "delete"
      ) ||
      value.includes(
        "remove"
      )
    ) {
      return "danger";
    }

    if (
      value.includes(
        "update"
      ) ||
      value.includes(
        "change"
      ) ||
      value.includes(
        "edit"
      )
    ) {
      return "warning";
    }

    if (
      value.includes(
        "create"
      ) ||
      value.includes(
        "add"
      )
    ) {
      return "success";
    }

    return "default";
  };

  // =========================================================
  // SUMMARY
  // =========================================================

  const uniqueActors =
    useMemo(() => {
      return new Set(
        logs
          .map(
            (log) =>
              log?.actor?._id ||
              log?.actor?.email
          )
          .filter(Boolean)
      ).size;
    }, [logs]);

  const uniqueActions =
    useMemo(() => {
      return new Set(
        logs
          .map(
            (log) =>
              log?.action
          )
          .filter(Boolean)
      ).size;
    }, [logs]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-loading">
          <div className="admin-loading-spinner" />

          <p>
            Loading audit logs...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error-card">
          <FaClipboardList />

          <h2>
            Unable to load audit logs
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              loadLogs()
            }
          >
            <FaRotate />

            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="admin-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="admin-page-header">

        <div>
          <span className="admin-page-eyebrow">
            SECURITY
          </span>

          <h1>
            Audit Logs
          </h1>

          <p>
            Track administrative and
            system activity across
            SmaXTify.
          </p>
        </div>

        <button
          type="button"
          className="admin-header-icon"
          onClick={() =>
            loadLogs(true)
          }
          title="Refresh audit logs"
          aria-label="Refresh audit logs"
          disabled={
            refreshing
          }
        >
          <FaRotate />
        </button>

      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="admin-stat-grid">

        <div className="admin-stat-card">

          <div className="admin-stat-icon users">
            <FaClipboardList />
          </div>

          <div className="admin-stat-content">
            <span>
              Total Logs
            </span>

            <strong>
              {filteredLogs.length}
            </strong>
          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon transactions">
            <FaUserShield />
          </div>

          <div className="admin-stat-content">
            <span>
              Unique Actors
            </span>

            <strong>
              {uniqueActors}
            </strong>
          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon subscriptions">
            <FaBullseye />
          </div>

          <div className="admin-stat-content">
            <span>
              Action Types
            </span>

            <strong>
              {uniqueActions}
            </strong>
          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon activity">
            <FaClock />
          </div>

          <div className="admin-stat-content">
            <span>
              Total Recorded
            </span>

            <strong>
              {logs.length}
            </strong>
          </div>

        </div>

      </div>

      {/* =====================================================
          AUDIT LOG CARD
      ===================================================== */}

      <div className="admin-overview-card admin-audit-card">

        <div className="admin-card-heading">

          <div>

            <span>
              ACTIVITY HISTORY
            </span>

            <h2>
              Administrative Activity
            </h2>

          </div>

          <FaClipboardList />

        </div>

        {/* ===================================================
            FILTERS
        =================================================== */}

        <div className="admin-audit-toolbar">

          <div className="admin-audit-search">

            <FaMagnifyingGlass />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search actor, action, resource, target or description..."
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                ×
              </button>
            )}

          </div>

          <div className="admin-audit-filter">

            <FaFilter />

            <select
              value={
                actionFilter
              }
              onChange={(event) =>
                setActionFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Actions
              </option>

              {actionOptions.map(
                (action) => (
                  <option
                    key={
                      action
                    }
                    value={
                      action
                    }
                  >
                    {getActionLabel(
                      action
                    )}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="admin-table-wrapper">

          <table className="admin-table admin-audit-table">

            <thead>

              <tr>

                <th>
                  Date & Time
                </th>

                <th>
                  Actor
                </th>

                <th>
                  Action
                </th>

                <th>
                  Resource
                </th>

                <th>
                  Target
                </th>

                <th>
                  Description
                </th>

                <th>
                  Delete
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredLogs.length ===
              0 ? (
                <tr>

                  <td
                    colSpan="7"
                    className="admin-empty-state"
                  >

                    <FaClipboardList />

                    <strong>
                      No audit logs found
                    </strong>

                    <span>
                      No activity matches
                      your current filters.
                    </span>

                  </td>

                </tr>
              ) : (
                filteredLogs.map(
                  (
                    log,
                    index
                  ) => {

                    const actorRole =
                      log?.actor?.role ||
                      log?.actorRole ||
                      "system";

                    const targetName =
                      log?.metadata
                        ?.targetUserName ||
                      log?.metadata
                        ?.targetUserEmail ||
                      "";

                    const logId =
                      log?._id ||
                      log?.id;

                    return (
                      <tr
                        key={
                          logId ||
                          index
                        }
                      >

                        {/* DATE */}

                        <td>

                          <div className="admin-audit-date">

                            <FaClock />

                            <span>
                              {formatDate(
                                log?.createdAt
                              )}
                            </span>

                          </div>

                        </td>

                        {/* ACTOR */}

                        <td>

                          <div className="admin-audit-actor">

                            <div className="admin-audit-actor-avatar">
                              {getRoleIcon(
                                actorRole
                              )}
                            </div>

                            <div>

                              <strong>
                                {log?.actor?.name ||
                                  log?.actor?.email ||
                                  "System"}
                              </strong>

                              <span
                                className={`admin-role-badge ${getRoleClass(
                                  actorRole
                                )}`}
                              >

                                {getRoleIcon(
                                  actorRole
                                )}

                                {getRoleLabel(
                                  actorRole
                                )}

                              </span>

                            </div>

                          </div>

                        </td>

                        {/* ACTION */}

                        <td>

                          <span
                            className={`admin-action-badge ${getActionClass(
                              log?.action
                            )}`}
                          >
                            {getActionLabel(
                              log?.action
                            )}
                          </span>

                        </td>

                        {/* RESOURCE */}

                        <td>

                          <span className="admin-audit-resource">

                            <FaCircleInfo />

                            {log?.resource ||
                              "—"}

                          </span>

                        </td>

                        {/* TARGET */}

                        <td>

                          {targetName ? (
                            <div className="admin-audit-target">

                              <FaBullseye />

                              <span>
                                {targetName}
                              </span>

                            </div>
                          ) : (
                            <span className="admin-audit-muted">
                              —
                            </span>
                          )}

                        </td>

                        {/* DESCRIPTION */}

                        <td>

                          <div className="admin-audit-description">

                            <strong>
                              {log?.description ||
                                "No description"}
                            </strong>

                            {log?.ipAddress && (
                              <span>
                                IP:{" "}
                                {
                                  log.ipAddress
                                }
                              </span>
                            )}

                          </div>

                        </td>

                        {/* DELETE */}

                        <td>

                          <button
                            type="button"
                            className="admin-audit-delete-button"
                            onClick={() =>
                              handleDeleteLog(
                                logId
                              )
                            }
                            disabled={
                              !canDelete ||
                              !logId ||
                              deletingId ===
                                logId
                            }
                            title={
                              canDelete
                                ? "Delete audit log"
                                : "Only Super Admin can delete audit logs"
                            }
                            aria-label="Delete audit log"
                          >

                            {deletingId ===
                            logId ? (
                              <FaRotate />
                            ) : (
                              <FaTrash />
                            )}

                          </button>

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default AdminAuditLogs;
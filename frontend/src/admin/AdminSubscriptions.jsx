import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaUsers,
  FaUserShield,
  FaCrown,
  FaCreditCard,
  FaCalendarDays,
  FaRotate,
  FaMagnifyingGlass,
  FaFilter,
  FaCheck,
  FaPause,
  FaXmark,
  FaWallet,
} from "react-icons/fa6";

const API_URL =
  "http://localhost:5000/api";

function AdminSubscriptions() {
  const [data, setData] =
    useState({
      summary: {
        totalUsers: 0,
        totalSubscriptions: 0,
        totalActive: 0,
        totalPaused: 0,
        totalCancelled: 0,
        totalMonthlyCost: 0,
      },

      users: [],
    });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  // =========================================================
  // LOAD SUBSCRIPTIONS
  // =========================================================

  const loadSubscriptions =
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
              `${API_URL}/admin/subscriptions/by-user`,
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
                "Failed to load subscriptions"
            );
          }

          setData({
            summary: {
              totalUsers:
                Number(
                  result?.summary
                    ?.totalUsers
                ) || 0,

              totalSubscriptions:
                Number(
                  result?.summary
                    ?.totalSubscriptions
                ) || 0,

              totalActive:
                Number(
                  result?.summary
                    ?.totalActive
                ) || 0,

              totalPaused:
                Number(
                  result?.summary
                    ?.totalPaused
                ) || 0,

              totalCancelled:
                Number(
                  result?.summary
                    ?.totalCancelled
                ) || 0,

              totalMonthlyCost:
                Number(
                  result?.summary
                    ?.totalMonthlyCost
                ) || 0,
            },

            users:
              Array.isArray(
                result?.users
              )
                ? result.users
                : [],
          });
        } catch (error) {
          console.error(
            "Admin Subscriptions Error:",
            error
          );

          setError(
            error?.message ||
              "Failed to load subscriptions"
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
    loadSubscriptions();
  }, [loadSubscriptions]);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredUsers =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return data.users
        .map((user) => {
          const userMatchesSearch =
            !searchValue ||
            user.name
              ?.toLowerCase()
              .includes(
                searchValue
              ) ||
            user.email
              ?.toLowerCase()
              .includes(
                searchValue
              );

          const subscriptions =
            Array.isArray(
              user.subscriptions
            )
              ? user.subscriptions
              : [];

          const filteredSubscriptions =
            subscriptions.filter(
              (subscription) => {
                const status =
                  String(
                    subscription.status ||
                      ""
                  )
                    .trim()
                    .toLowerCase();

                const selectedStatus =
                  statusFilter
                    .toLowerCase();

                const matchesStatus =
                  statusFilter ===
                    "All" ||
                  status ===
                    selectedStatus;

                const subscriptionSearch =
                  !searchValue ||
                  subscription.name
                    ?.toLowerCase()
                    .includes(
                      searchValue
                    ) ||
                  subscription.category
                    ?.toLowerCase()
                    .includes(
                      searchValue
                    ) ||
                  subscription.paymentMethod
                    ?.toLowerCase()
                    .includes(
                      searchValue
                    );

                return (
                  matchesStatus &&
                  subscriptionSearch
                );
              }
            );

          return {
            ...user,

            subscriptions:
              filteredSubscriptions,
          };
        })
        .filter((user) => {
          if (
            !searchValue &&
            statusFilter === "All"
          ) {
            return true;
          }

          const userMatchesSearch =
            !searchValue ||
            user.name
              ?.toLowerCase()
              .includes(
                searchValue
              ) ||
            user.email
              ?.toLowerCase()
              .includes(
                searchValue
              );

          return (
            (userMatchesSearch ||
              user.subscriptions
                .length > 0) &&
            user.subscriptions
              .length > 0
          );
        });
    }, [
      data.users,
      search,
      statusFilter,
    ]);

  // =========================================================
  // FORMATTERS
  // =========================================================

  const formatNumber = (
    value
  ) => {
    return new Intl.NumberFormat(
      "en-IN"
    ).format(
      Number(value) || 0
    );
  };

  const formatCurrency = (
    value
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(value) || 0
    );
  };

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "Not set";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Not set";
    }

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
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
      role === "superadmin"
    ) {
      return "Super Admin";
    }

    if (
      role === "admin"
    ) {
      return "Admin";
    }

    return "User";
  };

  const getRoleClass = (
    role
  ) => {
    if (
      role === "superadmin"
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
      role === "superadmin"
    ) {
      return <FaCrown />;
    }

    if (
      role === "admin"
    ) {
      return <FaUserShield />;
    }

    return <FaUsers />;
  };

  // =========================================================
  // SUBSCRIPTION STATUS
  // =========================================================

  const getStatusClass = (
    status
  ) => {
    const normalized =
      String(
        status || ""
      )
        .trim()
        .toLowerCase();

    if (
      normalized ===
      "active"
    ) {
      return "active";
    }

    if (
      normalized ===
      "paused"
    ) {
      return "paused";
    }

    if (
      normalized ===
      "cancelled"
    ) {
      return "cancelled";
    }

    return "unknown";
  };

  const getStatusIcon = (
    status
  ) => {
    const normalized =
      String(
        status || ""
      )
        .trim()
        .toLowerCase();

    if (
      normalized ===
      "active"
    ) {
      return <FaCheck />;
    }

    if (
      normalized ===
      "paused"
    ) {
      return <FaPause />;
    }

    return <FaXmark />;
  };

  const getMonthlyCost = (
    subscription
  ) => {
    const amount =
      Number(
        subscription.amount
      ) || 0;

    const cycle =
      String(
        subscription.cycle ||
          "Monthly"
      )
        .trim()
        .toLowerCase();

    if (
      cycle ===
      "yearly"
    ) {
      return amount / 12;
    }

    if (
      cycle ===
      "weekly"
    ) {
      return amount * 4.345;
    }

    return amount;
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="admin-page">

        <div className="admin-page-loading">

          <div className="admin-loading-spinner" />

          <p>
            Loading subscriptions...
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

          <FaCreditCard />

          <h2>
            Unable to load subscriptions
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              loadSubscriptions()
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
            MANAGEMENT
          </span>

          <h1>
            Subscriptions
          </h1>

          <p>
            View subscriptions grouped
            by each visible user and
            administrator.
          </p>

        </div>

        <button
          type="button"
          className="admin-header-icon"
          onClick={() =>
            loadSubscriptions(
              true
            )
          }
          title="Refresh subscriptions"
          aria-label="Refresh subscriptions"
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
            <FaUsers />
          </div>

          <div className="admin-stat-content">

            <span>
              Visible Users
            </span>

            <strong>
              {formatNumber(
                data.summary
                  .totalUsers
              )}
            </strong>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon subscriptions">
            <FaCreditCard />
          </div>

          <div className="admin-stat-content">

            <span>
              Total Subscriptions
            </span>

            <strong>
              {formatNumber(
                data.summary
                  .totalSubscriptions
              )}
            </strong>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon activity">
            <FaCheck />
          </div>

          <div className="admin-stat-content">

            <span>
              Active
            </span>

            <strong>
              {formatNumber(
                data.summary
                  .totalActive
              )}
            </strong>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon transactions">
            <FaWallet />
          </div>

          <div className="admin-stat-content">

            <span>
              Monthly Cost
            </span>

            <strong>
              {formatCurrency(
                data.summary
                  .totalMonthlyCost
              )}
            </strong>

          </div>

        </div>

      </div>

      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <div className="admin-subscriptions-toolbar">

        <div className="admin-subscriptions-search">

          <FaMagnifyingGlass />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search user, subscription, category or payment method..."
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

        <div className="admin-subscriptions-filter">

          <FaFilter />

          <select
            value={
              statusFilter
            }
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Paused">
              Paused
            </option>

            <option value="Cancelled">
              Cancelled
            </option>

          </select>

        </div>

      </div>

      {/* =====================================================
          USER SUBSCRIPTION GROUPS
      ===================================================== */}

      <div className="admin-subscription-groups">

        {filteredUsers.length ===
        0 ? (
          <div className="admin-overview-card">

            <div className="admin-subscription-empty">

              <FaCreditCard />

              <strong>
                No subscriptions found
              </strong>

              <span>
                No visible subscriptions
                match your filters.
              </span>

            </div>

          </div>
        ) : (
          filteredUsers.map(
            (user) => {

              const subscriptions =
                Array.isArray(
                  user.subscriptions
                )
                  ? user.subscriptions
                  : [];

              const activeCount =
                subscriptions.filter(
                  (item) =>
                    String(
                      item.status ||
                        ""
                    )
                      .trim()
                      .toLowerCase() ===
                    "active"
                ).length;

              return (
                <div
                  className="admin-overview-card admin-subscription-user-card"
                  key={
                    user._id
                  }
                >

                  {/* =================================================
                      USER HEADER
                  ================================================= */}

                  <div className="admin-subscription-user-header">

                    <div className="admin-subscription-user-info">

                      <div className="admin-table-avatar">
                        {(
                          user.name ||
                          "U"
                        )
                          .trim()
                          .charAt(
                            0
                          )
                          .toUpperCase()}
                      </div>

                      <div>

                        <div className="admin-subscription-user-name-row">

                          <h2>
                            {user.name ||
                              "Unnamed User"}
                          </h2>

                          <span
                            className={`admin-role-badge ${getRoleClass(
                              user.role
                            )}`}
                          >
                            {getRoleIcon(
                              user.role
                            )}

                            {getRoleLabel(
                              user.role
                            )}
                          </span>

                        </div>

                        <span className="admin-subscription-user-email">
                          {user.email ||
                            "No email available"}
                        </span>

                      </div>

                    </div>

                    <div className="admin-subscription-user-summary">

                      <span>
                        <FaCreditCard />

                        {formatNumber(
                          subscriptions.length
                        )}{" "}

                        {subscriptions.length ===
                        1
                          ? "Subscription"
                          : "Subscriptions"}
                      </span>

                      <strong>
                        {formatCurrency(
                          subscriptions
                            .filter(
                              (
                                item
                              ) =>
                                String(
                                  item.status ||
                                    ""
                                )
                                  .trim()
                                  .toLowerCase() ===
                                "active"
                            )
                            .reduce(
                              (
                                total,
                                item
                              ) =>
                                total +
                                getMonthlyCost(
                                  item
                                ),
                              0
                            )
                        )}
                        {" / month"}
                      </strong>

                    </div>

                  </div>

                  {/* =================================================
                      USER SUBSCRIPTION SUMMARY
                  ================================================= */}

                  <div className="admin-subscription-user-totals">

                    <div className="admin-subscription-total active">

                      <span>
                        Active
                      </span>

                      <strong>
                        {formatNumber(
                          activeCount
                        )}
                      </strong>

                    </div>

                    <div className="admin-subscription-total paused">

                      <span>
                        Paused
                      </span>

                      <strong>
                        {formatNumber(
                          subscriptions.filter(
                            (
                              item
                            ) =>
                              String(
                                item.status ||
                                  ""
                              )
                                .trim()
                                .toLowerCase() ===
                              "paused"
                          ).length
                        )}
                      </strong>

                    </div>

                    <div className="admin-subscription-total cancelled">

                      <span>
                        Cancelled
                      </span>

                      <strong>
                        {formatNumber(
                          subscriptions.filter(
                            (
                              item
                            ) =>
                              String(
                                item.status ||
                                  ""
                              )
                                .trim()
                                .toLowerCase() ===
                              "cancelled"
                          ).length
                        )}
                      </strong>

                    </div>

                  </div>

                  {/* =================================================
                      SUBSCRIPTIONS
                  ================================================= */}

                  {subscriptions.length ===
                  0 ? (
                    <div className="admin-user-no-subscriptions">

                      <FaCreditCard />

                      <span>
                        No subscriptions recorded
                        for this user.
                      </span>

                    </div>
                  ) : (
                    <div className="admin-subscription-list">

                      {subscriptions.map(
                        (
                          subscription
                        ) => {

                          const statusClass =
                            getStatusClass(
                              subscription.status
                            );

                          return (
                            <div
                              className="admin-subscription-item"
                              key={
                                subscription._id
                              }
                            >

                              <div className="admin-subscription-item-icon">
                                <FaCreditCard />
                              </div>

                              <div className="admin-subscription-item-main">

                                <div className="admin-subscription-item-title-row">

                                  <strong>
                                    {subscription.name ||
                                      "Unnamed Subscription"}
                                  </strong>

                                  <span
                                    className={`admin-subscription-status ${statusClass}`}
                                  >
                                    {getStatusIcon(
                                      subscription.status
                                    )}

                                    {subscription.status ||
                                      "Unknown"}
                                  </span>

                                </div>

                                <div className="admin-subscription-item-meta">

                                  <span>
                                    {subscription.category ||
                                      "Other"}
                                  </span>

                                  <span>
                                    {subscription.cycle ||
                                      "Monthly"}
                                  </span>

                                  <span>
                                    {subscription.paymentMethod ||
                                      "Payment method not set"}
                                  </span>

                                </div>

                                <div className="admin-subscription-item-date">

                                  <FaCalendarDays />

                                  <span>
                                    Next payment:{" "}
                                    {formatDate(
                                      subscription.nextPayment
                                    )}
                                  </span>

                                </div>

                              </div>

                              <div className="admin-subscription-item-right">

                                <strong>
                                  {formatCurrency(
                                    subscription.amount
                                  )}
                                </strong>

                                <span>
                                  {subscription.cycle ||
                                    "Monthly"}
                                </span>

                                {subscription.autoRenew && (
                                  <small>
                                    Auto-renew
                                  </small>
                                )}

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>
                  )}

                </div>
              );
            }
          )
        )}

      </div>

    </div>
  );
}

export default AdminSubscriptions;
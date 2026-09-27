import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FaBuildingColumns,
  FaWallet,
  FaUsers,
  FaUserShield,
  FaCrown,
  FaRotate,
} from "react-icons/fa6";

const API_URL =
  "http://localhost:5000/api";

function AdminAccounts() {
  const [data, setData] =
    useState({
      summary: {
        totalAccounts: 0,
        totalBalance: 0,
        totalUsers: 0,
      },

      users: [],
    });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadAccounts =
    useCallback(
      async (isRefresh = false) => {
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
              `${API_URL}/admin/accounts`,
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
                "Failed to load accounts"
            );
          }

          setData({
            summary: {
              totalAccounts:
                Number(
                  result?.summary
                    ?.totalAccounts
                ) || 0,

              totalBalance:
                Number(
                  result?.summary
                    ?.totalBalance
                ) || 0,

              totalUsers:
                Number(
                  result?.summary
                    ?.totalUsers
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
            "Admin Accounts Error:",
            error
          );

          setError(
            error?.message ||
              "Failed to load accounts"
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

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

  if (loading) {
    return (
      <div className="admin-page">

        <div className="admin-page-loading">

          <div className="admin-loading-spinner" />

          <p>
            Loading accounts...
          </p>

        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">

        <div className="admin-error-card">

          <FaBuildingColumns />

          <h2>
            Unable to load accounts
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              loadAccounts()
            }
          >
            <FaRotate />

            Try Again
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="admin-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="admin-page-header">

        <div>

          <span className="admin-page-eyebrow">
            MANAGEMENT
          </span>

          <h1>
            Accounts
          </h1>

          <p>
            View account balances across
            visible SmaXTify users.
          </p>

        </div>

        <button
          type="button"
          className="admin-header-icon"
          onClick={() =>
            loadAccounts(true)
          }
          title="Refresh accounts"
          aria-label="Refresh accounts"
          disabled={refreshing}
        >
          <FaRotate />
        </button>

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="admin-stat-grid">

        <div className="admin-stat-card">

          <div className="admin-stat-icon users">
            <FaUsers />
          </div>

          <div className="admin-stat-content">

            <span>
              Account Holders
            </span>

            <strong>
              {formatNumber(
                data.summary.totalUsers
              )}
            </strong>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon transactions">
            <FaBuildingColumns />
          </div>

          <div className="admin-stat-content">

            <span>
              Total Accounts
            </span>

            <strong>
              {formatNumber(
                data.summary.totalAccounts
              )}
            </strong>

          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon activity">
            <FaWallet />
          </div>

          <div className="admin-stat-content">

            <span>
              Total Balance
            </span>

            <strong>
              {formatCurrency(
                data.summary.totalBalance
              )}
            </strong>

          </div>

        </div>

      </div>

      {/* =================================================
          ACCOUNT HOLDERS
      ================================================= */}

      <div className="admin-overview-card admin-account-page-card">

        <div className="admin-card-heading">

          <div>

            <span>
              ACCOUNT MANAGEMENT
            </span>

            <h2>
              {data.users.length}{" "}
              Account Holders
            </h2>

          </div>

          <FaBuildingColumns />

        </div>

        <div className="admin-account-users">

          {data.users.length ===
          0 ? (
            <div className="admin-account-empty">

              <FaBuildingColumns />

              <strong>
                No account data available
              </strong>

              <span>
                No visible users have
                accounts yet.
              </span>

            </div>
          ) : (
            data.users.map(
              (user) => (
                <div
                  className="admin-account-user-card"
                  key={
                    user._id
                  }
                >

                  {/* USER HEADER */}

                  <div className="admin-account-user-header">

                    <div className="admin-account-user-info">

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

                        <strong>
                          {user.name ||
                            "Unnamed User"}
                        </strong>

                        <span>
                          {user.email ||
                            "—"}
                        </span>

                      </div>

                    </div>

                    <div className="admin-account-user-meta">

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

                      <div className="admin-account-count">

                        <FaBuildingColumns />

                        <span>
                          {formatNumber(
                            user.accountCount
                          )}{" "}
                          {user.accountCount ===
                          1
                            ? "Account"
                            : "Accounts"}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* TOTAL BALANCE */}

                  <div className="admin-account-total">

                    <span>
                      Total Balance
                    </span>

                    <strong>
                      {formatCurrency(
                        user.totalBalance
                      )}
                    </strong>

                  </div>

                  {/* INDIVIDUAL ACCOUNTS */}

                  {Array.isArray(
                    user.accounts
                  ) &&
                  user.accounts.length >
                    0 ? (
                    <div className="admin-account-list">

                      {user.accounts.map(
                        (account) => (
                          <div
                            className="admin-account-item"
                            key={
                              account._id
                            }
                          >

                            <div className="admin-account-item-icon">
                              <FaBuildingColumns />
                            </div>

                            <div className="admin-account-item-info">

                              <strong>
                                {account.name ||
                                  "Unnamed Account"}
                              </strong>

                              <span>
                                {account.type ||
                                  "Account"}
                              </span>

                            </div>

                            <strong className="admin-account-item-balance">
                              {formatCurrency(
                                account.balance
                              )}
                            </strong>

                          </div>
                        )
                      )}

                    </div>
                  ) : (
                    <div className="admin-no-accounts">

                      <FaWallet />

                      <span>
                        No accounts added
                      </span>

                    </div>
                  )}

                </div>
              )
            )
          )}

        </div>

      </div>

    </div>
  );
}

export default AdminAccounts;
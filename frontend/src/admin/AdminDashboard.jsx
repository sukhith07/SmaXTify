import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FaUsers,
  FaMoneyBillTransfer,
  FaCreditCard,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaUserShield,
  FaCrown,
  FaRotate,
} from "react-icons/fa6";

const API_URL = "http://localhost:5000/api";

function AdminDashboard() {
  const [dashboardData, setDashboardData] =
    useState({
      statistics: {
        totalUsers: 0,
        totalTransactions: 0,
        totalSubscriptions: 0,
        totalAdmins: 0,
        totalRegularUsers: 0,
        totalSuperAdmins: 0,
        totalVisibleAccounts: 0,
        totalVisibleBalance: 0,
      },

      financial: {
        totalIncome: 0,
        totalExpenses: 0,
        totalTransfers: 0,
        netFlow: 0,
      },

      userFinancials: [],

      access: {
        role: "admin",
        financialScope: "all-users",
        accountScope: "all-users",
        userScope: "all-users",
        superAdminFinancialProtected: false,
        superAdminAccountsProtected: false,
        superAdminUserProtected: false,
      },

      recentUsers: [],
      recentTransactions: [],
    });

  const [currentRole, setCurrentRole] =
    useState("admin");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadDashboard =
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
            localStorage.getItem("token");

          if (!token) {
            throw new Error(
              "Authentication token not found"
            );
          }

          const [
            dashboardResponse,
            userResponse,
          ] = await Promise.all([
            fetch(
              `${API_URL}/admin/dashboard`,
              {
                method: "GET",
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                  "Content-Type":
                    "application/json",
                },
              }
            ),

            fetch(
              `${API_URL}/auth/me`,
              {
                method: "GET",
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            ),
          ]);

          const dashboardResult =
            await dashboardResponse.json();

          const userResult =
            await userResponse.json();

          if (!dashboardResponse.ok) {
            throw new Error(
              dashboardResult?.message ||
                "Failed to load admin dashboard"
            );
          }

          const role =
            userResult?.user?.role;

          const resolvedRole =
            role === "superadmin" ||
            role === "admin"
              ? role
              : dashboardResult?.access?.role ||
                "admin";

          setCurrentRole(
            resolvedRole
          );

          setDashboardData({
            access: {
              role:
                dashboardResult?.access?.role ||
                resolvedRole,

              financialScope:
                dashboardResult?.access
                  ?.financialScope ||
                "all-users",

              accountScope:
                dashboardResult?.access
                  ?.accountScope ||
                "all-users",

              userScope:
                dashboardResult?.access
                  ?.userScope ||
                "all-users",

              superAdminFinancialProtected:
                false,

              superAdminAccountsProtected:
                false,

              superAdminUserProtected:
                false,
            },

            statistics: {
              totalUsers:
                Number(
                  dashboardResult?.statistics
                    ?.totalUsers
                ) || 0,

              totalTransactions:
                Number(
                  dashboardResult?.statistics
                    ?.totalTransactions
                ) || 0,

              totalSubscriptions:
                Number(
                  dashboardResult?.statistics
                    ?.totalSubscriptions
                ) || 0,

              totalAdmins:
                Number(
                  dashboardResult?.statistics
                    ?.totalAdmins
                ) || 0,

              totalRegularUsers:
                Number(
                  dashboardResult?.statistics
                    ?.totalRegularUsers
                ) || 0,

              totalSuperAdmins:
                Number(
                  dashboardResult?.statistics
                    ?.totalSuperAdmins
                ) || 0,

              totalVisibleAccounts:
                Number(
                  dashboardResult?.statistics
                    ?.totalVisibleAccounts
                ) || 0,

              totalVisibleBalance:
                Number(
                  dashboardResult?.statistics
                    ?.totalVisibleBalance
                ) || 0,
            },

            financial: {
              totalIncome:
                Number(
                  dashboardResult?.financial
                    ?.totalIncome
                ) || 0,

              totalExpenses:
                Number(
                  dashboardResult?.financial
                    ?.totalExpenses
                ) || 0,

              totalTransfers:
                Number(
                  dashboardResult?.financial
                    ?.totalTransfers
                ) || 0,

              netFlow:
                Number(
                  dashboardResult?.financial
                    ?.netFlow
                ) || 0,
            },

            userFinancials:
              Array.isArray(
                dashboardResult?.userFinancials
              )
                ? dashboardResult.userFinancials
                : [],

            recentUsers:
              Array.isArray(
                dashboardResult?.recentUsers
              )
                ? dashboardResult.recentUsers
                : [],

            recentTransactions:
              Array.isArray(
                dashboardResult?.recentTransactions
              )
                ? dashboardResult.recentTransactions
                : [],
          });
        } catch (error) {
          console.error(
            "Admin Dashboard Error:",
            error
          );

          setError(
            error?.message ||
              "Failed to load dashboard"
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const statistics =
    dashboardData.statistics;

  const financial =
    dashboardData.financial;

  const userFinancials =
    dashboardData.userFinancials;

  const isSuperAdmin =
    currentRole === "superadmin";

  const formatNumber = (value) => {
    return new Intl.NumberFormat(
      "en-IN"
    ).format(
      Number(value) || 0
    );
  };

  const formatCurrency = (value) => {
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

  const getRoleClass = (role) => {
    if (role === "superadmin") {
      return "superadmin";
    }

    if (role === "admin") {
      return "admin";
    }

    return "user";
  };

  const getRoleLabel = (role) => {
    if (role === "superadmin") {
      return "Super Admin";
    }

    if (role === "admin") {
      return "Admin";
    }

    return "User";
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-loading">
          <div className="admin-loading-spinner" />

          <p>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error-card">
          <FaUserShield />

          <h2>
            Unable to load dashboard
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              loadDashboard()
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

      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">
            ADMINISTRATION
          </span>

          <h1>
            Dashboard
          </h1>

          <p>
            Monitor and manage your
            SmaXTify application.
          </p>
        </div>

        <button
          type="button"
          className="admin-header-icon"
          onClick={() =>
            loadDashboard(true)
          }
          title="Refresh dashboard"
          aria-label="Refresh dashboard"
          disabled={refreshing}
        >
          <FaChartLine />
        </button>
      </div>

      <div className="admin-stat-grid">

        <div className="admin-stat-card">
          <div className="admin-stat-icon users">
            <FaUsers />
          </div>

          <div className="admin-stat-content">
            <span>
              Total Users
            </span>

            <strong>
              {formatNumber(
                statistics.totalUsers
              )}
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon transactions">
            <FaMoneyBillTransfer />
          </div>

          <div className="admin-stat-content">
            <span>
              Transactions
            </span>

            <strong>
              {formatNumber(
                statistics.totalTransactions
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
              Subscriptions
            </span>

            <strong>
              {formatNumber(
                statistics.totalSubscriptions
              )}
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon activity">
            <FaChartLine />
          </div>

          <div className="admin-stat-content">
            <span>
              Net Flow
            </span>

            <strong>
              {formatCurrency(
                financial.netFlow
              )}
            </strong>
          </div>
        </div>

      </div>

      <div className="admin-overview-grid">

        <div className="admin-overview-card">

          <div className="admin-card-heading">

            <div>
              <span>
                FINANCIAL OVERVIEW
              </span>

              <h2>
                Income & Expenses
              </h2>
            </div>

            <FaChartLine />

          </div>

          <div className="admin-financial-summary">

            <div className="admin-financial-item income">

              <div className="admin-financial-icon">
                <FaArrowUp />
              </div>

              <div>
                <span>
                  Total Income
                </span>

                <strong>
                  {formatCurrency(
                    financial.totalIncome
                  )}
                </strong>
              </div>

            </div>

            <div className="admin-financial-item expense">

              <div className="admin-financial-icon">
                <FaArrowDown />
              </div>

              <div>
                <span>
                  Total Expenses
                </span>

                <strong>
                  {formatCurrency(
                    financial.totalExpenses
                  )}
                </strong>
              </div>

            </div>

          </div>

        </div>

        <div className="admin-overview-card admin-system-card">

          <div className="admin-card-heading">

            <div>

              <span>
                SYSTEM
              </span>

              <h2>
                {isSuperAdmin
                  ? "Super Admin"
                  : "Administration"}
              </h2>

            </div>

            {isSuperAdmin ? (
              <FaCrown />
            ) : (
              <FaUserShield />
            )}

          </div>

          <div className="admin-system-status">

            <div className="admin-status-dot" />

            <div>

              <strong>
                {isSuperAdmin
                  ? "Super Admin access active"
                  : "Admin access active"}
              </strong>

              <span>
                {isSuperAdmin
                  ? "You can view financial activity for every user, administrator and Super Admin account."
                  : "You can view financial activity, accounts, transactions and subscriptions for every user, administrator and the Super Admin account."}
              </span>

            </div>

          </div>

        </div>

      </div>

      <div className="admin-overview-card admin-user-financial-card">

        <div className="admin-card-heading">

          <div>

            <span>
              USER FINANCIAL OVERVIEW
            </span>

            <h2>
              All User Financial Activity
            </h2>

            <p className="admin-financial-scope-note">
              Income, expenses, transfers and net flow for every user, administrator and Super Admin account.
            </p>

          </div>

          {isSuperAdmin ? (
            <FaCrown />
          ) : (
            <FaUserShield />
          )}

        </div>

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>
              <tr>
                <th>
                  User
                </th>

                <th>
                  Role
                </th>

                <th>
                  Income
                </th>

                <th>
                  Expenses
                </th>

                <th>
                  Transfers
                </th>

                <th>
                  Net Flow
                </th>
              </tr>
            </thead>

            <tbody>

              {userFinancials.length === 0 ? (
                <tr>

                  <td
                    colSpan="6"
                    className="admin-empty-state"
                  >
                    <FaUsers />

                    <strong>
                      No financial data available
                    </strong>

                    <span>
                      There are no visible user accounts yet.
                    </span>

                  </td>

                </tr>
              ) : (
                userFinancials.map(
                  (user) => (
                    <tr
                      key={user._id}
                    >

                      <td>

                        <div className="admin-table-user">

                          <div className="admin-table-avatar">
                            {(
                              user.name ||
                              "U"
                            )
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {user.name ||
                                "Unnamed User"}
                            </strong>

                            <div className="admin-email">
                              {user.email ||
                                "—"}
                            </div>

                          </div>

                        </div>

                      </td>

                      <td>

                        <span
                          className={`admin-role-badge ${getRoleClass(
                            user.role
                          )}`}
                        >

                          {user.role ===
                          "superadmin" ? (
                            <FaCrown />
                          ) : user.role ===
                            "admin" ? (
                            <FaUserShield />
                          ) : (
                            <FaUsers />
                          )}

                          {getRoleLabel(
                            user.role
                          )}

                        </span>

                      </td>

                      <td>
                        {formatCurrency(
                          user.totalIncome
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          user.totalExpenses
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          user.totalTransfers
                        )}
                      </td>

                      <td>

                        <strong>
                          {formatCurrency(
                            user.netFlow
                          )}
                        </strong>

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;
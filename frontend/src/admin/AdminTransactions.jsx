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
  FaMoneyBillTransfer,
  FaArrowUp,
  FaArrowDown,
  FaRightLeft,
  FaReceipt,
  FaWallet,
  FaCalendarDays,
  FaRotate,
  FaMagnifyingGlass,
  FaFilter,
} from "react-icons/fa6";

const API_URL =
  "http://localhost:5000/api";

function AdminTransactions() {
  const [data, setData] =
    useState({
      summary: {
        totalUsers: 0,
        totalTransactions: 0,
        totalIncome: 0,
        totalExpenses: 0,
        totalTransfers: 0,
        netFlow: 0,
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

  const [typeFilter, setTypeFilter] =
    useState("All");

  // =========================================================
  // LOAD TRANSACTIONS
  // =========================================================

  const loadTransactions =
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
              `${API_URL}/admin/transactions/by-user`,
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
                "Failed to load transactions"
            );
          }

          setData({
            summary: {
              totalUsers:
                Number(
                  result?.summary
                    ?.totalUsers
                ) || 0,

              totalTransactions:
                Number(
                  result?.summary
                    ?.totalTransactions
                ) || 0,

              totalIncome:
                Number(
                  result?.summary
                    ?.totalIncome
                ) || 0,

              totalExpenses:
                Number(
                  result?.summary
                    ?.totalExpenses
                ) || 0,

              totalTransfers:
                Number(
                  result?.summary
                    ?.totalTransfers
                ) || 0,

              netFlow:
                Number(
                  result?.summary
                    ?.netFlow
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
            "Admin Transactions Error:",
            error
          );

          setError(
            error?.message ||
              "Failed to load transactions"
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
    loadTransactions();
  }, [loadTransactions]);

  // =========================================================
  // FILTER USERS + TRANSACTIONS
  // =========================================================

  const filteredUsers =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return data.users
        .map((user) => {
          const userMatchesSearch =
            !normalizedSearch ||
            user.name
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            user.email
              ?.toLowerCase()
              .includes(
                normalizedSearch
              );

          const matchingTransactions =
            (
              Array.isArray(
                user.transactions
              )
                ? user.transactions
                : []
            ).filter(
              (transaction) => {
                const transactionType =
                  String(
                    transaction.type ||
                      ""
                  )
                    .trim()
                    .toLowerCase();

                const requestedType =
                  typeFilter.toLowerCase();

                const matchesType =
                  typeFilter ===
                    "All" ||
                  transactionType ===
                    requestedType;

                const transactionSearch =
                  !normalizedSearch ||
                  transaction.title
                    ?.toLowerCase()
                    .includes(
                      normalizedSearch
                    ) ||
                  transaction.category
                    ?.toLowerCase()
                    .includes(
                      normalizedSearch
                    ) ||
                  transaction.notes
                    ?.toLowerCase()
                    .includes(
                      normalizedSearch
                    ) ||
                  transaction.account
                    ?.name
                    ?.toLowerCase()
                    .includes(
                      normalizedSearch
                    );

                return (
                  matchesType &&
                  transactionSearch
                );
              }
            );

          if (
            userMatchesSearch &&
            typeFilter === "All"
          ) {
            return {
              ...user,

              transactions:
                Array.isArray(
                  user.transactions
                )
                  ? user.transactions
                  : [],
            };
          }

          return {
            ...user,

            transactions:
              matchingTransactions,
          };
        })
        .filter((user) => {
          if (
            !normalizedSearch &&
            typeFilter === "All"
          ) {
            return true;
          }

          const userMatchesSearch =
            !normalizedSearch ||
            user.name
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            user.email
              ?.toLowerCase()
              .includes(
                normalizedSearch
              );

          return (
            (userMatchesSearch ||
              user.transactions
                .length > 0) &&
            user.transactions
              .length > 0
          );
        });
    }, [
      data.users,
      search,
      typeFilter,
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
      }
    ).format(date);
  };

  // =========================================================
  // ROLE HELPERS
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
  // TRANSACTION HELPERS
  // =========================================================

  const getTransactionType =
    (type) => {
      return String(
        type || "Expense"
      )
        .trim()
        .toLowerCase();
    };

  const getTransactionClass =
    (type) => {
      const normalized =
        getTransactionType(
          type
        );

      if (
        normalized ===
        "income"
      ) {
        return "income";
      }

      if (
        normalized ===
        "transfer"
      ) {
        return "transfer";
      }

      return "expense";
    };

  const getTransactionIcon =
    (type) => {
      const normalized =
        getTransactionType(
          type
        );

      if (
        normalized ===
        "income"
      ) {
        return <FaArrowUp />;
      }

      if (
        normalized ===
        "transfer"
      ) {
        return <FaRightLeft />;
      }

      return <FaArrowDown />;
    };

  const getAmountPrefix =
    (type) => {
      const normalized =
        getTransactionType(
          type
        );

      if (
        normalized ===
        "income"
      ) {
        return "+";
      }

      if (
        normalized ===
        "expense"
      ) {
        return "-";
      }

      return "";
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
            Loading transactions...
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
          <FaMoneyBillTransfer />

          <h2>
            Unable to load transactions
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              loadTransactions()
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
            Transactions
          </h1>

          <p>
            View transactions grouped
            by each visible user and
            administrator.
          </p>
        </div>

        <button
          type="button"
          className="admin-header-icon"
          onClick={() =>
            loadTransactions(
              true
            )
          }
          title="Refresh transactions"
          aria-label="Refresh transactions"
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

          <div className="admin-stat-icon transactions">
            <FaMoneyBillTransfer />
          </div>

          <div className="admin-stat-content">
            <span>
              Total Transactions
            </span>

            <strong>
              {formatNumber(
                data.summary
                  .totalTransactions
              )}
            </strong>
          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon activity">
            <FaArrowUp />
          </div>

          <div className="admin-stat-content">
            <span>
              Total Income
            </span>

            <strong>
              {formatCurrency(
                data.summary
                  .totalIncome
              )}
            </strong>
          </div>

        </div>

        <div className="admin-stat-card">

          <div className="admin-stat-icon subscriptions">
            <FaArrowDown />
          </div>

          <div className="admin-stat-content">
            <span>
              Total Expenses
            </span>

            <strong>
              {formatCurrency(
                data.summary
                  .totalExpenses
              )}
            </strong>
          </div>

        </div>

      </div>

      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <div className="admin-transactions-toolbar">

        <div className="admin-transactions-search">

          <FaMagnifyingGlass />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search user, transaction, category or account..."
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

        <div className="admin-transactions-filter">

          <FaFilter />

          <select
            value={
              typeFilter
            }
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All Types
            </option>

            <option value="Income">
              Income
            </option>

            <option value="Expense">
              Expense
            </option>

            <option value="Transfer">
              Transfer
            </option>
          </select>

        </div>

      </div>

      {/* =====================================================
          USER TRANSACTION GROUPS
      ===================================================== */}

      <div className="admin-transaction-groups">

        {filteredUsers.length ===
        0 ? (
          <div className="admin-overview-card">

            <div className="admin-transaction-empty">

              <FaReceipt />

              <strong>
                No transactions found
              </strong>

              <span>
                No visible user or administrator
                transactions match your filters.
              </span>

            </div>

          </div>
        ) : (
          filteredUsers.map(
            (user) => {

              const userTransactions =
                Array.isArray(
                  user.transactions
                )
                  ? user.transactions
                  : [];

              return (
                <div
                  className="admin-overview-card admin-transaction-user-card"
                  key={
                    user._id
                  }
                >

                  {/* =================================================
                      USER HEADER
                  ================================================= */}

                  <div className="admin-transaction-user-header">

                    <div className="admin-transaction-user-info">

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

                        <div className="admin-transaction-user-name-row">

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

                        <span className="admin-transaction-user-email">
                          {user.email ||
                            "No email available"}
                        </span>

                      </div>

                    </div>

                    <div className="admin-transaction-user-summary">

                      <span>
                        <FaReceipt />
                        {formatNumber(
                          userTransactions.length
                        )}{" "}
                        {userTransactions.length ===
                        1
                          ? "Transaction"
                          : "Transactions"}
                      </span>

                      <strong>
                        Net Flow{" "}
                        {formatCurrency(
                          user.netFlow
                        )}
                      </strong>

                    </div>

                  </div>

                  {/* =================================================
                      USER TOTALS
                  ================================================= */}

                  <div className="admin-transaction-user-totals">

                    <div className="admin-transaction-total income">
                      <span>
                        Income
                      </span>

                      <strong>
                        {formatCurrency(
                          user.totalIncome
                        )}
                      </strong>
                    </div>

                    <div className="admin-transaction-total expense">
                      <span>
                        Expenses
                      </span>

                      <strong>
                        {formatCurrency(
                          user.totalExpenses
                        )}
                      </strong>
                    </div>

                    <div className="admin-transaction-total transfer">
                      <span>
                        Transfers
                      </span>

                      <strong>
                        {formatCurrency(
                          user.totalTransfers
                        )}
                      </strong>
                    </div>

                  </div>

                  {/* =================================================
                      TRANSACTIONS
                  ================================================= */}

                  {userTransactions.length ===
                  0 ? (
                    <div className="admin-user-no-transactions">

                      <FaReceipt />

                      <span>
                        No transactions recorded
                        for this user.
                      </span>

                    </div>
                  ) : (
                    <div className="admin-table-wrapper">

                      <table className="admin-table admin-transaction-table">

                        <thead>
                          <tr>

                            <th>
                              Date
                            </th>

                            <th>
                              Transaction
                            </th>

                            <th>
                              Category
                            </th>

                            <th>
                              Account
                            </th>

                            <th>
                              Type
                            </th>

                            <th>
                              Amount
                            </th>

                          </tr>
                        </thead>

                        <tbody>

                          {userTransactions.map(
                            (
                              transaction
                            ) => {

                              const transactionClass =
                                getTransactionClass(
                                  transaction.type
                                );

                              const amount =
                                Number(
                                  transaction.amount
                                ) || 0;

                              return (
                                <tr
                                  key={
                                    transaction._id
                                  }
                                >

                                  <td>
                                    <div className="admin-transaction-date">

                                      <FaCalendarDays />

                                      <span>
                                        {formatDate(
                                          transaction.date ||
                                            transaction.createdAt
                                        )}
                                      </span>

                                    </div>
                                  </td>

                                  <td>

                                    <div className="admin-transaction-main">

                                      <div
                                        className={`admin-transaction-icon ${transactionClass}`}
                                      >
                                        {getTransactionIcon(
                                          transaction.type
                                        )}
                                      </div>

                                      <div>

                                        <strong>
                                          {transaction.title ||
                                            "Untitled Transaction"}
                                        </strong>

                                        {transaction.notes && (
                                          <span>
                                            {
                                              transaction.notes
                                            }
                                          </span>
                                        )}

                                      </div>

                                    </div>

                                  </td>

                                  <td>
                                    <span className="admin-transaction-category">
                                      {transaction.category ||
                                        "Uncategorized"}
                                    </span>
                                  </td>

                                  <td>

                                    <div className="admin-transaction-account">

                                      <FaWallet />

                                      <span>
                                        {transaction
                                          .account
                                          ?.name ||
                                          "No Account"}
                                      </span>

                                    </div>

                                  </td>

                                  <td>

                                    <span
                                      className={`admin-transaction-type ${transactionClass}`}
                                    >
                                      {transaction.type ||
                                        "Expense"}
                                    </span>

                                  </td>

                                  <td>

                                    <strong
                                      className={`admin-transaction-amount ${transactionClass}`}
                                    >
                                      {getAmountPrefix(
                                        transaction.type
                                      )}

                                      {formatCurrency(
                                        amount
                                      )}

                                    </strong>

                                  </td>

                                </tr>
                              );
                            }
                          )}

                        </tbody>

                      </table>

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

export default AdminTransactions;
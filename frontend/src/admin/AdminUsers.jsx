import {
  FaUsers,
  FaMagnifyingGlass,
  FaRotate,
  FaUserShield,
  FaUser,
  FaCircleExclamation,
  FaChevronLeft,
  FaChevronRight,
  FaUserGear,
  FaCrown,
} from "react-icons/fa6";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

const API_URL =
  "http://localhost:5000/api";

function AdminUsers() {
  const [users, setUsers] =
    useState([]);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 20,
      totalUsers: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  const [search, setSearch] =
    useState("");

  const [searchInput, setSearchInput] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [updatingUserId, setUpdatingUserId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [currentUser, setCurrentUser] =
    useState(null);

  // =========================================================
  // LOAD CURRENT USER
  // =========================================================

  const loadCurrentUser =
    useCallback(
      async () => {
        try {
          const token =
            localStorage.getItem(
              "token"
            );

          if (!token) {
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

          const data =
            await response.json();

          if (
            response.ok &&
            data?.user
          ) {
            setCurrentUser(
              data.user
            );

            localStorage.setItem(
              "user",
              JSON.stringify(
                data.user
              )
            );

            return;
          }

          const storedUser =
            localStorage.getItem(
              "user"
            );

          if (storedUser) {
            try {
              setCurrentUser(
                JSON.parse(
                  storedUser
                )
              );
            } catch {
              setCurrentUser(
                null
              );
            }
          }
        } catch (error) {
          console.error(
            "Current User Error:",
            error
          );

          const storedUser =
            localStorage.getItem(
              "user"
            );

          if (storedUser) {
            try {
              setCurrentUser(
                JSON.parse(
                  storedUser
                )
              );
            } catch {
              setCurrentUser(
                null
              );
            }
          }
        }
      },
      []
    );

  // =========================================================
  // FETCH USERS
  // =========================================================

  const fetchUsers =
    useCallback(
      async (
        page = 1,
        currentSearch = search,
        isRefresh = false
      ) => {
        try {
          if (isRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");
          setSuccessMessage("");

          const token =
            localStorage.getItem(
              "token"
            );

          if (!token) {
            throw new Error(
              "Authentication token not found."
            );
          }

          const params =
            new URLSearchParams();

          params.set(
            "page",
            String(page)
          );

          params.set(
            "limit",
            "20"
          );

          if (
            currentSearch.trim()
          ) {
            params.set(
              "search",
              currentSearch.trim()
            );
          }

          const response =
            await fetch(
              `${API_URL}/admin/users?${params.toString()}`,
              {
                method: "GET",

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Failed to load users."
            );
          }

          setUsers(
            Array.isArray(
              data?.users
            )
              ? data.users
              : []
          );

          setPagination(
            data?.pagination || {
              page,
              limit: 20,
              totalUsers: 0,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            }
          );
        } catch (err) {
          console.error(
            "Admin Users Error:",
            err
          );

          setError(
            err?.message ||
              "Failed to load users."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [search]
    );

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadCurrentUser();
    fetchUsers(1, "");
  }, [
    loadCurrentUser,
    fetchUsers,
  ]);

  // =========================================================
  // REQUEST ADMIN PROMOTION
  // =========================================================

  const createPromotionRequest =
    async (user) => {
      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const response =
        await fetch(
          `${API_URL}/admin/promotion-requests`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              targetUserId:
                user._id,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to create promotion request."
        );
      }

      return data;
    };

  // =========================================================
  // ROLE CHANGE / PROMOTION REQUEST
  // =========================================================

  const handleRoleChange = async (
    user
  ) => {
    if (!user?._id) {
      return;
    }

    const targetRole =
      user.role || "user";

    // =======================================================
    // SUPER ADMIN PROTECTION
    // =======================================================

    if (
      targetRole ===
      "superadmin"
    ) {
      setError(
        "The Super Admin account cannot be modified."
      );

      setSuccessMessage("");

      return;
    }

    // =======================================================
    // SELF PROTECTION
    // =======================================================

    const currentUserId =
      currentUser?._id ||
      currentUser?.id;

    const currentUserEmail =
      currentUser?.email
        ?.trim()
        .toLowerCase();

    const targetUserEmail =
      user?.email
        ?.trim()
        .toLowerCase();

    const isSelf =
      Boolean(
        currentUserId &&
        String(
          currentUserId
        ) ===
          String(
            user._id
          )
      ) ||
      Boolean(
        currentUserEmail &&
        targetUserEmail &&
        currentUserEmail ===
          targetUserEmail
      );

    if (isSelf) {
      setError(
        "You cannot change your own role."
      );

      setSuccessMessage("");

      return;
    }

    // =======================================================
    // ADMIN REQUEST FLOW
    // =======================================================

    const currentUserRole =
      currentUser?.role ||
      "user";

    if (
      currentUserRole ===
        "admin" &&
      targetRole ===
        "user"
    ) {
      const confirmed =
        window.confirm(
          `Are you sure you want to request Admin approval to promote this user?\n\nUser: ${
            user.name ||
            "Unnamed User"
          }\nEmail: ${
            user.email ||
            "—"
          }\n\nThe user will remain a regular User until the Super Admin approves the request.`
        );

      if (!confirmed) {
        return;
      }

      try {
        setUpdatingUserId(
          user._id
        );

        setError("");
        setSuccessMessage("");

        await createPromotionRequest(
          user
        );

        setSuccessMessage(
          `Promotion request for ${
            user.name ||
            "this user"
          } has been sent to the Super Admin.`
        );
      } catch (err) {
        console.error(
          "Promotion Request Error:",
          err
        );

        setError(
          err?.message ||
            "Failed to create promotion request."
        );
      } finally {
        setUpdatingUserId(
          null
        );
      }

      return;
    }

    // =======================================================
    // SUPER ADMIN DIRECT PROMOTION
    // OR ADMIN DEMOTION
    // =======================================================

    const newRole =
      targetRole === "admin"
        ? "user"
        : "admin";

    const actionText =
      newRole === "admin"
        ? "make this user an administrator"
        : "remove administrator access from this user";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${actionText}?\n\nUser: ${
          user.name ||
          "Unnamed User"
        }\nEmail: ${
          user.email ||
          "—"
        }`
      );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingUserId(
        user._id
      );

      setError("");
      setSuccessMessage("");

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const response =
        await fetch(
          `${API_URL}/admin/users/${user._id}/role`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              role: newRole,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to update user role."
        );
      }

      setUsers(
        (previousUsers) =>
          previousUsers.map(
            (currentUser) =>
              currentUser._id ===
              user._id
                ? {
                    ...currentUser,

                    role:
                      newRole,
                  }
                : currentUser
          )
      );

      setSuccessMessage(
        `${user.name || "User"} is now ${
          newRole === "admin"
            ? "an administrator"
            : "a regular user"
        }.`
      );

      await loadCurrentUser();
    } catch (err) {
      console.error(
        "Admin Role Update Error:",
        err
      );

      setError(
        err?.message ||
          "Failed to update user role."
      );
    } finally {
      setUpdatingUserId(
        null
      );
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (
    event
  ) => {
    event.preventDefault();

    const value =
      searchInput.trim();

    setSearch(value);

    fetchUsers(
      1,
      value
    );
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");

    fetchUsers(
      1,
      ""
    );
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    loadCurrentUser();

    fetchUsers(
      pagination.page,
      search,
      true
    );
  };

  // =========================================================
  // PAGINATION
  // =========================================================

  const handlePreviousPage =
    () => {
      if (
        !pagination.hasPreviousPage
      ) {
        return;
      }

      fetchUsers(
        pagination.page - 1,
        search
      );
    };

  const handleNextPage =
    () => {
      if (
        !pagination.hasNextPage
      ) {
        return;
      }

      fetchUsers(
        pagination.page + 1,
        search
      );
    };

  // =========================================================
  // HELPERS
  // =========================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getInitial = (
    name
  ) => {
    if (
      !name ||
      typeof name !==
        "string"
    ) {
      return "U";
    }

    return name
      .trim()
      .charAt(0)
      .toUpperCase();
  };

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

    return "User";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-loading">
          <div className="admin-loading-spinner" />

          <span>
            Loading users...
          </span>
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
            USER MANAGEMENT
          </span>

          <h1>
            Users
          </h1>

          <p>
            View and manage SmaXTify users.
          </p>
        </div>

        <button
          type="button"
          className="admin-header-icon"
          onClick={
            handleRefresh
          }
          title="Refresh users"
          aria-label="Refresh users"
          disabled={
            refreshing
          }
        >
          <FaRotate />
        </button>
      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {successMessage && (
        <div className="admin-users-success">
          <span>
            {successMessage}
          </span>
        </div>
      )}

      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error ? (
        <div className="admin-error-card">

          <FaCircleExclamation />

          <h2>
            {error.includes(
              "role"
            ) ||
            error.includes(
              "Super Admin"
            ) ||
            error.includes(
              "own role"
            ) ||
            error.includes(
              "administrator"
            )
              ? "Role Update Failed"
              : "Unable to load users"}
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              setError("");

              fetchUsers(
                pagination.page,
                search
              );
            }}
          >
            <FaRotate />

            Try Again
          </button>
        </div>
      ) : (
        <div className="admin-users-card">

          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="admin-users-toolbar">

            <div className="admin-users-count">
              <strong>
                {
                  pagination.totalUsers
                }
              </strong>

              <span>
                {pagination.totalUsers ===
                1
                  ? "User"
                  : "Users"}
              </span>
            </div>

            <div className="admin-users-actions">

              <form
                className="admin-search-box"
                onSubmit={
                  handleSearch
                }
              >
                <FaMagnifyingGlass />

                <input
                  type="text"
                  value={
                    searchInput
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchInput(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search users..."
                  aria-label="Search users"
                />

                {searchInput && (
                  <button
                    type="button"
                    className="admin-search-clear"
                    onClick={
                      handleClearSearch
                    }
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </form>

              <button
                type="button"
                className={`admin-refresh-button ${
                  refreshing
                    ? "is-refreshing"
                    : ""
                }`}
                onClick={
                  handleRefresh
                }
                disabled={
                  refreshing
                }
                title="Refresh users"
                aria-label="Refresh users"
              >
                <FaRotate />
              </button>

            </div>
          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>
                    User
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Provider
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Joined
                  </th>
                </tr>
              </thead>

              <tbody>

                {users.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="admin-empty-state"
                    >
                      <FaUsers />

                      <strong>
                        No users found
                      </strong>

                      <span>
                        {search
                          ? "Try a different search."
                          : "There are no registered users yet."}
                      </span>
                    </td>
                  </tr>
                ) : (
                  users.map(
                    (user) => {

                      const isUpdating =
                        updatingUserId ===
                        user._id;

                      const isSuperAdmin =
                        user.role ===
                        "superadmin";

                      const isAdmin =
                        user.role ===
                        "admin";

                      const currentUserId =
                        currentUser?._id ||
                        currentUser?.id;

                      const currentUserEmail =
                        currentUser?.email
                          ?.trim()
                          .toLowerCase();

                      const targetUserEmail =
                        user?.email
                          ?.trim()
                          .toLowerCase();

                      const isSelf =
                        Boolean(
                          currentUserId &&
                          String(
                            currentUserId
                          ) ===
                            String(
                              user._id
                            )
                        ) ||
                        Boolean(
                          currentUserEmail &&
                          targetUserEmail &&
                          currentUserEmail ===
                            targetUserEmail
                        );

                      const isCurrentAdmin =
                        currentUser?.role ===
                        "admin";

                      return (
                        <tr
                          key={
                            user._id
                          }
                        >

                          {/* USER */}

                          <td>
                            <div className="admin-table-user">

                              <div className="admin-table-avatar">

                                {user.photo ? (
                                  <img
                                    src={
                                      user.photo
                                    }
                                    alt=""
                                    className="admin-user-photo"
                                  />
                                ) : (
                                  getInitial(
                                    user.name
                                  )
                                )}

                              </div>

                              <strong>
                                {user.name ||
                                  "Unnamed User"}
                              </strong>

                            </div>
                          </td>

                          {/* EMAIL */}

                          <td>
                            {user.email ||
                              "—"}
                          </td>

                          {/* PROVIDER */}

                          <td>
                            <span className="admin-provider-badge">
                              {user.provider ===
                              "google"
                                ? "Google"
                                : "Local"}
                            </span>
                          </td>

                          {/* ROLE */}

                          <td>
                            <div className="admin-role-control">

                              <span
                                className={`admin-role-badge ${
                                  isSuperAdmin
                                    ? "superadmin"
                                    : isAdmin
                                    ? "admin"
                                    : "user"
                                }`}
                              >

                                {isSuperAdmin ? (
                                  <FaCrown />
                                ) : isAdmin ? (
                                  <FaUserShield />
                                ) : (
                                  <FaUser />
                                )}

                                {getRoleLabel(
                                  user.role
                                )}

                              </span>

                              {/* SUPER ADMIN */}

                              {isSuperAdmin ? (
                                <span
                                  className="admin-role-protected"
                                  title="Protected Super Admin"
                                >
                                  Protected
                                </span>
                              ) : isSelf ? (
                                <span
                                  className="admin-role-protected"
                                  title="You cannot change your own role"
                                >
                                  Your Account
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  className="admin-role-edit-button"
                                  onClick={() =>
                                    handleRoleChange(
                                      user
                                    )
                                  }
                                  disabled={
                                    isUpdating
                                  }
                                  title={
                                    isCurrentAdmin &&
                                    !isAdmin
                                      ? "Request Admin approval"
                                      : isAdmin
                                      ? "Remove admin access"
                                      : "Make administrator"
                                  }
                                  aria-label={
                                    isCurrentAdmin &&
                                    !isAdmin
                                      ? "Request Admin approval"
                                      : isAdmin
                                      ? "Remove admin access"
                                      : "Make administrator"
                                  }
                                >

                                  {isUpdating ? (
                                    <span className="admin-role-spinner" />
                                  ) : (
                                    <FaUserGear />
                                  )}

                                </button>
                              )}

                            </div>
                          </td>

                          {/* JOINED */}

                          <td>
                            {formatDate(
                              user.createdAt
                            )}
                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>
            </table>
          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          <div className="admin-pagination">

            <span>
              Page{" "}

              <strong>
                {pagination.page}
              </strong>

              {" "}of{" "}

              <strong>
                {pagination.totalPages ||
                  1}
              </strong>
            </span>

            <div className="admin-pagination-buttons">

              <button
                type="button"
                onClick={
                  handlePreviousPage
                }
                disabled={
                  !pagination.hasPreviousPage
                }
                title="Previous page"
                aria-label="Previous page"
              >
                <FaChevronLeft />
              </button>

              <button
                type="button"
                onClick={
                  handleNextPage
                }
                disabled={
                  !pagination.hasNextPage
                }
                title="Next page"
                aria-label="Next page"
              >
                <FaChevronRight />
              </button>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default AdminUsers;
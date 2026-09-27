import {
  FaHome,
  FaWallet,
  FaBullseye,
  FaChartBar,
  FaExchangeAlt,
  FaCreditCard,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaUniversity,
  FaUserShield,
} from "react-icons/fa";

import {
  useState,
  useEffect,
} from "react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import LogoutConfirmModal from "../LogoutConfirmModal";

import "./../styles/sidebar.css";

const API_URL =
  "http://localhost:5000/api";

function Sidebar() {
  const [collapsed, setCollapsed] =
    useState(() => {
      const savedState =
        sessionStorage.getItem(
          "smaxtify-sidebar-collapsed"
        );

      return savedState === null
        ? false
        : savedState === "true";
    });

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const [isAdmin, setIsAdmin] =
    useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // =======================================================
  // CHECK CURRENT USER ROLE
  // =======================================================

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        if (isMounted) {
          setIsAdmin(false);
        }

        return;
      }

      try {
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

        if (!response.ok) {
          if (isMounted) {
            setIsAdmin(false);
          }

          return;
        }

        const currentUser =
          data?.user;

        const currentRole =
          currentUser?.role;

        if (isMounted) {
          setIsAdmin(
            currentRole === "admin" ||
            currentRole === "superadmin"
          );
        }

        if (currentUser) {
          const storedUser =
            localStorage.getItem("user");

          let existingUser = {};

          try {
            existingUser =
              storedUser
                ? JSON.parse(storedUser)
                : {};
          } catch {
            existingUser = {};
          }

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...existingUser,
              ...currentUser,
            })
          );
        }
      } catch (error) {
        console.error(
          "Current User Role Error:",
          error
        );

        if (isMounted) {
          setIsAdmin(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  // =======================================================
  // MENU ITEMS
  // =======================================================

  const menuItems = [
    {
      title: "Dashboard",
      icon: <FaHome />,
      path: "/dashboard",
    },
    {
      title: "Accounts",
      icon: <FaUniversity />,
      path: "/accounts",
    },
    {
      title: "Budget Planner",
      icon: <FaWallet />,
      path: "/budget",
    },
    {
      title: "Savings Goals",
      icon: <FaBullseye />,
      path: "/goals",
    },
    {
      title: "Reports",
      icon: <FaChartBar />,
      path: "/reports",
    },
    {
      title: "Currency Converter",
      icon: <FaExchangeAlt />,
      path: "/currency",
    },
    {
      title: "Subscription Tracker",
      icon: <FaCreditCard />,
      path: "/subscriptions",
    },
    {
      title: "Settings",
      icon: <FaCog />,
      path: "/settings",
    },
  ];

  // =======================================================
  // SIDEBAR WIDTH
  // =======================================================

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--smaxtify-sidebar-width",
      collapsed
        ? "88px"
        : "276px"
    );

    document.body.classList.toggle(
      "smaxtify-sidebar-collapsed",
      collapsed
    );

    document.body.classList.toggle(
      "smaxtify-sidebar-expanded",
      !collapsed
    );

    return () => {
      document.documentElement.style.removeProperty(
        "--smaxtify-sidebar-width"
      );

      document.body.classList.remove(
        "smaxtify-sidebar-collapsed",
        "smaxtify-sidebar-expanded"
      );
    };
  }, [collapsed]);

  // =======================================================
  // MOBILE SIDEBAR
  // =======================================================

  useEffect(() => {
    document.body.classList.toggle(
      "mobile-sidebar-open",
      mobileOpen
    );

    return () => {
      document.body.classList.remove(
        "mobile-sidebar-open"
      );
    };
  }, [mobileOpen]);

  // =======================================================
  // TOGGLE SIDEBAR
  // =======================================================

  const toggleSidebar = () => {
    setCollapsed((previous) => {
      const nextState =
        !previous;

      sessionStorage.setItem(
        "smaxtify-sidebar-collapsed",
        String(nextState)
      );

      return nextState;
    });
  };

  // =======================================================
  // NAVIGATION
  // =======================================================

  const handleNavigation = (
    path
  ) => {
    navigate(path);
    setMobileOpen(false);
  };

  // =======================================================
  // MOBILE
  // =======================================================

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  // =======================================================
  // ADMIN PANEL
  // =======================================================

  const isAdminPage =
    location.pathname.startsWith(
      "/admin"
    );

  const handleAdminPanel = () => {
    if (!isAdmin) {
      return;
    }

    navigate("/admin");
    setMobileOpen(false);
  };

  // =======================================================
  // LOGOUT
  // =======================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    sessionStorage.removeItem(
      "smaxtify-sidebar-collapsed"
    );

    setShowLogoutModal(false);
    setMobileOpen(false);

    navigate("/", {
      replace: true,
    });
  };

  return (
    <>
      {/* ===================================================
          MOBILE MENU BUTTON
      =================================================== */}

      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() =>
          setMobileOpen(true)
        }
        aria-label="Open navigation menu"
      >
        <FaBars />
      </button>

      {/* ===================================================
          MOBILE OVERLAY
      =================================================== */}

      {mobileOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={
            closeMobileSidebar
          }
          aria-hidden="true"
        />
      )}

      {/* ===================================================
          MAIN SIDEBAR
      =================================================== */}

      <aside
        className={`
          sidebar
          ${collapsed ? "collapsed" : ""}
          ${mobileOpen ? "mobile-open" : ""}
        `}
      >
        {/* =================================================
            SIDEBAR TOP
        ================================================= */}

        <div className="sidebar-top">
          {/* -----------------------------------------------
              LOGO
          ----------------------------------------------- */}

          {!collapsed && (
            <div
              className="sidebar-logo"
              onClick={() =>
                handleNavigation(
                  "/dashboard"
                )
              }
            >
              <div className="logo-circle">
                <FaWallet />
              </div>

              <div className="sidebar-logo-text">
                <h2>
                  SmaXTify
                </h2>

                <p>
                  Personal Finance
                </p>
              </div>
            </div>
          )}

          {/* -----------------------------------------------
              HAMBURGER TOGGLE
          ----------------------------------------------- */}

          <button
            type="button"
            className="sidebar-menu-toggle"
            onClick={
              toggleSidebar
            }
            aria-label={
              collapsed
                ? "Open sidebar"
                : "Close sidebar"
            }
            title={
              collapsed
                ? "Open sidebar"
                : "Close sidebar"
            }
          >
            <FaBars />
          </button>
        </div>

        {/* =================================================
            MOBILE CLOSE
        ================================================= */}

        <button
          type="button"
          className="mobile-sidebar-close"
          onClick={
            closeMobileSidebar
          }
          aria-label="Close navigation menu"
        >
          <FaTimes />
        </button>

        {/* =================================================
            USER
        ================================================= */}

        <div className="sidebar-user">
          <FaUserCircle
            className="user-avatar"
          />

          {!collapsed && (
            <div className="sidebar-user-text">
              <h3>
                User
              </h3>

              <span>
                Premium
              </span>
            </div>
          )}
        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="sidebar-navigation">
          <ul className="sidebar-menu">
            {menuItems.map(
              (item) => (
                <li
                  key={
                    item.path
                  }
                  className={
                    location.pathname ===
                    item.path
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    handleNavigation(
                      item.path
                    )
                  }
                  title={
                    collapsed
                      ? item.title
                      : undefined
                  }
                >
                  <span className="sidebar-menu-icon">
                    {item.icon}
                  </span>

                  {!collapsed && (
                    <span className="sidebar-menu-title">
                      {item.title}
                    </span>
                  )}
                </li>
              )
            )}
          </ul>
        </nav>

        {/* =================================================
            BOTTOM
        ================================================= */}

        <div className="sidebar-bottom">
          {/* -----------------------------------------------
              ADMIN PANEL
          ----------------------------------------------- */}

          {isAdmin && (
            <button
              type="button"
              className={`
                admin-panel-btn
                ${isAdminPage ? "active" : ""}
              `}
              onClick={
                handleAdminPanel
              }
              title={
                collapsed
                  ? "Admin Panel"
                  : undefined
              }
            >
              <span className="admin-panel-icon">
                <FaUserShield />
              </span>

              {!collapsed && (
                <span className="admin-panel-text">
                  Admin Panel
                </span>
              )}
            </button>
          )}

          {/* -----------------------------------------------
              LOGOUT
          ----------------------------------------------- */}

          <button
            type="button"
            className="logout-btn"
            onClick={() =>
              setShowLogoutModal(
                true
              )
            }
            title={
              collapsed
                ? "Logout"
                : undefined
            }
          >
            <FaSignOutAlt />

            {!collapsed && (
              <span>
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ===================================================
          LOGOUT MODAL
      =================================================== */}

      <LogoutConfirmModal
        isOpen={
          showLogoutModal
        }
        onClose={() =>
          setShowLogoutModal(
            false
          )
        }
        onLogout={
          handleLogout
        }
      />
    </>
  );
}

export default Sidebar;
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
  FaReceipt,
} from "react-icons/fa";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";

import { useNavigate, useLocation } from "react-router-dom";

import LogoutConfirmModal from "../LogoutConfirmModal";
import "./../styles/sidebar.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://smaxtify.onrender.com/api"
).replace(/\/+$/, "");

const BACKEND_URL = API_URL.replace(/\/api$/, "");

const SIDEBAR_SCROLL_KEY = "smaxtify-sidebar-scroll-position";
const SIDEBAR_COLLAPSED_KEY = "smaxtify-sidebar-collapsed";

const SIDEBAR_EXPANDED_WIDTH = "276px";
const SIDEBAR_COLLAPSED_WIDTH = "88px";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function getUserRole(user) {
  return String(user?.role || user?.user?.role || "")
    .trim()
    .toLowerCase();
}

function isAdminUser(user) {
  const role = getUserRole(user);
  return role === "admin" || role === "superadmin";
}

function getUserName(user) {
  return (
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email ||
    "User"
  );
}

function getUserPhoto(user) {
  const photo =
    user?.photo ||
    user?.profilePhoto ||
    user?.profileImage ||
    user?.avatar ||
    user?.picture;

  if (typeof photo !== "string" || !photo.trim()) {
    return "";
  }

  if (photo.startsWith("/")) {
    return `${BACKEND_URL}${photo}`;
  }

  return photo;
}

function getSavedScrollPosition() {
  const savedPosition = Number(
    sessionStorage.getItem(SIDEBAR_SCROLL_KEY) || 0
  );

  return Number.isFinite(savedPosition) && savedPosition >= 0
    ? savedPosition
    : 0;
}

function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = sessionStorage.getItem(
      SIDEBAR_COLLAPSED_KEY
    );

    return savedState === null ? false : savedState === "true";
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [photoFailed, setPhotoFailed] = useState(false);

  const sidebarMenuRef = useRef(null);
  const scrollFrameRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const userName = getUserName(currentUser);
  const userPhoto = getUserPhoto(currentUser);
  const isAdmin = isAdminUser(currentUser);

  const saveScrollPosition = useCallback((position) => {
    const safePosition = Math.max(0, Number(position) || 0);

    sessionStorage.setItem(
      SIDEBAR_SCROLL_KEY,
      String(safePosition)
    );
  }, []);

  const cancelPendingRestore = useCallback(() => {
    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }
  }, []);

  const restoreScrollPosition = useCallback(
    (element) => {
      if (!element) return;

      cancelPendingRestore();

      element.scrollTop = getSavedScrollPosition();

      scrollFrameRef.current = requestAnimationFrame(() => {
        if (element.isConnected) {
          element.scrollTop = getSavedScrollPosition();
        }

        scrollFrameRef.current = null;
      });
    },
    [cancelPendingRestore]
  );

  const setSidebarMenuRef = useCallback(
    (element) => {
      sidebarMenuRef.current = element;

      if (element) {
        restoreScrollPosition(element);
      }
    },
    [restoreScrollPosition]
  );

  useEffect(() => {
    setPhotoFailed(false);
  }, [userPhoto]);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      const token = localStorage.getItem("token");
      const storedUser = getStoredUser();

      if (!token) {
        if (isMounted) {
          setCurrentUser({});
        }
        return;
      }

      if (isMounted) {
        setCurrentUser(storedUser);
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(
            "Failed to load current user:",
            data?.message || response.status
          );
          return;
        }

        const fetchedUser = data?.user || data?.data?.user;

        if (fetchedUser && isMounted) {
          const updatedUser = {
            ...storedUser,
            ...fetchedUser,
          };

          localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
          );

          setCurrentUser(updatedUser);
        }
      } catch (error) {
        console.error("Current User Error:", error);
      }
    };

    loadCurrentUser();

    const handleUserUpdated = () => {
      if (isMounted) {
        setCurrentUser(getStoredUser());
      }
    };

    window.addEventListener(
      "smaxtify-user-updated",
      handleUserUpdated
    );

    window.addEventListener("storage", handleUserUpdated);

    return () => {
      isMounted = false;

      window.removeEventListener(
        "smaxtify-user-updated",
        handleUserUpdated
      );

      window.removeEventListener("storage", handleUserUpdated);
    };
  }, []);

  const menuItems = [
    {
      title: "Dashboard",
      icon: <FaHome />,
      path: "/dashboard",
    },
    {
      title: "AI Scan",
      icon: <FaReceipt />,
      path: "/ai-scan",
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

  useEffect(() => {
    const sidebarWidth = collapsed
      ? SIDEBAR_COLLAPSED_WIDTH
      : SIDEBAR_EXPANDED_WIDTH;

    document.documentElement.style.setProperty(
      "--smaxtify-sidebar-width",
      sidebarWidth
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

  useEffect(() => {
    document.body.classList.toggle(
      "mobile-sidebar-open",
      mobileOpen
    );

    return () => {
      document.body.classList.remove("mobile-sidebar-open");
    };
  }, [mobileOpen]);

  useEffect(() => {
    const menu = sidebarMenuRef.current;

    if (!menu) return;

    const handleScroll = () => {
      saveScrollPosition(menu.scrollTop);
    };

    menu.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      menu.removeEventListener("scroll", handleScroll);
    };
  }, [saveScrollPosition]);

  useLayoutEffect(() => {
    restoreScrollPosition(sidebarMenuRef.current);
  }, [location.pathname, restoreScrollPosition]);

  useEffect(() => {
    return () => {
      cancelPendingRestore();

      if (sidebarMenuRef.current) {
        saveScrollPosition(sidebarMenuRef.current.scrollTop);
      }
    };
  }, [cancelPendingRestore, saveScrollPosition]);

  const toggleSidebar = () => {
    setCollapsed((previous) => {
      const nextState = !previous;

      sessionStorage.setItem(
        SIDEBAR_COLLAPSED_KEY,
        String(nextState)
      );

      return nextState;
    });
  };

  const handleNavigation = (path) => {
    if (sidebarMenuRef.current) {
      saveScrollPosition(sidebarMenuRef.current.scrollTop);
    }

    setMobileOpen(false);

    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  const isAdminPage = location.pathname.startsWith("/admin");

  const handleAdminPanel = () => {
    if (isAdmin) {
      handleNavigation("/admin");
    }
  };

  const handleProfile = () => {
    handleNavigation("/settings");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem(SIDEBAR_COLLAPSED_KEY);
    sessionStorage.removeItem(SIDEBAR_SCROLL_KEY);

    cancelPendingRestore();

    if (sidebarMenuRef.current) {
      sidebarMenuRef.current.scrollTop = 0;
    }

    setShowLogoutModal(false);
    setMobileOpen(false);
    setCurrentUser({});

    navigate("/", { replace: true });
  };

  return (
    <>
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <FaBars />
      </button>

      {mobileOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "sidebar",
          collapsed ? "collapsed" : "",
          mobileOpen ? "mobile-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="sidebar-top">
          {!collapsed && (
            <div
              className="sidebar-logo"
              onClick={() => handleNavigation("/dashboard")}
            >
              <div className="logo-circle">
                <FaWallet />
              </div>

              <div className="sidebar-logo-text">
                <h2>SmaXTify</h2>
                <p>Personal Finance</p>
              </div>
            </div>
          )}

          <button
            type="button"
            className="sidebar-menu-toggle"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
            title={collapsed ? "Open sidebar" : "Close sidebar"}
          >
            <FaBars />
          </button>
        </div>

        <button
          type="button"
          className="mobile-sidebar-close"
          onClick={closeMobileSidebar}
          aria-label="Close navigation menu"
        >
          <FaTimes />
        </button>

        <div className="sidebar-user">
          <button
            type="button"
            className="sidebar-profile-avatar-button"
            onClick={handleProfile}
            aria-label="Open profile settings"
            title="Open profile settings"
          >
            {userPhoto && !photoFailed ? (
              <img
                src={userPhoto}
                alt={`${userName}'s profile`}
                className="user-avatar user-avatar-image"
                onError={() => setPhotoFailed(true)}
              />
            ) : (
              <FaUserCircle className="user-avatar" />
            )}
          </button>

          {!collapsed && (
            <div className="sidebar-user-text">
              <h3 title={userName}>{userName}</h3>
            </div>
          )}
        </div>

        <nav
          className="sidebar-navigation"
          aria-label="Main navigation"
        >
          <ul
            className="sidebar-menu"
            ref={setSidebarMenuRef}
          >
            {menuItems.map((item) => (
              <li
                key={item.path}
                className={
                  location.pathname === item.path ? "active" : ""
                }
                onClick={() => handleNavigation(item.path)}
                title={collapsed ? item.title : undefined}
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
            ))}
          </ul>
        </nav>

        <div className="sidebar-bottom">
          {isAdmin && (
            <button
              type="button"
              className={`admin-panel-btn ${
                isAdminPage ? "active" : ""
              }`}
              onClick={handleAdminPanel}
              title={collapsed ? "Admin Panel" : undefined}
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

          <button
            type="button"
            className="logout-btn"
            onClick={() => setShowLogoutModal(true)}
            title={collapsed ? "Logout" : undefined}
          >
            <FaSignOutAlt />

            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
      />
    </>
  );
}

export default Sidebar;
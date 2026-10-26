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
const MOBILE_BREAKPOINT = 1100;

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

  return photo.startsWith("/")
    ? `${BACKEND_URL}${photo}`
    : photo;
}

function isMobileViewport() {
  return window.matchMedia(
    `(max-width: ${MOBILE_BREAKPOINT}px)`
  ).matches;
}

function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = sessionStorage.getItem(
      SIDEBAR_COLLAPSED_KEY
    );

    return saved === null ? false : saved === "true";
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
  const isAdminPage = location.pathname.startsWith("/admin");

  const mobileViewport = isMobileViewport();

  const menuItems = [
    { title: "Dashboard", icon: <FaHome />, path: "/dashboard" },
    { title: "AI Scan", icon: <FaReceipt />, path: "/ai-scan" },
    { title: "Accounts", icon: <FaUniversity />, path: "/accounts" },
    { title: "Budget Planner", icon: <FaWallet />, path: "/budget" },
    { title: "Savings Goals", icon: <FaBullseye />, path: "/goals" },
    { title: "Reports", icon: <FaChartBar />, path: "/reports" },
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
    { title: "Settings", icon: <FaCog />, path: "/settings" },
  ];

  const saveScrollPosition = useCallback((position) => {
    sessionStorage.setItem(
      SIDEBAR_SCROLL_KEY,
      String(Math.max(0, Number(position) || 0))
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

      const restore = () => {
        if (element.isConnected) {
          const saved = Number(
            sessionStorage.getItem(SIDEBAR_SCROLL_KEY) || 0
          );

          element.scrollTop = Math.max(0, saved);
        }

        scrollFrameRef.current = null;
      };

      restore();

      scrollFrameRef.current =
        requestAnimationFrame(restore);
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

  const closeMobileSidebar = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const openMobileSidebar = useCallback(() => {
    if (isMobileViewport()) {
      setMobileOpen(true);
    }
  }, []);

  useEffect(() => {
    setPhotoFailed(false);
  }, [userPhoto]);

  useEffect(() => {
    let mounted = true;

    const loadCurrentUser = async () => {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("smaxtify-token");

      const storedUser = getStoredUser();

      if (!token) {
        if (mounted) setCurrentUser({});
        return;
      }

      if (mounted) setCurrentUser(storedUser);

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
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

        if (fetchedUser && mounted) {
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

    const handleUserUpdated = () => {
      if (mounted) setCurrentUser(getStoredUser());
    };

    loadCurrentUser();

    window.addEventListener(
      "smaxtify-user-updated",
      handleUserUpdated
    );
    window.addEventListener("storage", handleUserUpdated);

    return () => {
      mounted = false;

      window.removeEventListener(
        "smaxtify-user-updated",
        handleUserUpdated
      );
      window.removeEventListener(
        "storage",
        handleUserUpdated
      );
    };
  }, []);

  useEffect(() => {
    const updateSidebarWidth = () => {
      const width = isMobileViewport()
        ? "0px"
        : collapsed
          ? "88px"
          : "276px";

      document.documentElement.style.setProperty(
        "--smaxtify-sidebar-width",
        width
      );
    };

    updateSidebarWidth();

    document.body.classList.toggle(
      "smaxtify-sidebar-collapsed",
      collapsed
    );
    document.body.classList.toggle(
      "smaxtify-sidebar-expanded",
      !collapsed
    );

    window.addEventListener("resize", updateSidebarWidth);

    return () => {
      window.removeEventListener(
        "resize",
        updateSidebarWidth
      );
      document.body.classList.remove(
        "smaxtify-sidebar-collapsed",
        "smaxtify-sidebar-expanded"
      );
    };
  }, [collapsed]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (mobileOpen) {
      document.body.classList.add("mobile-sidebar-open");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("mobile-sidebar-open");
      document.body.style.overflow = previousOverflow;
    }

    return () => {
      document.body.classList.remove("mobile-sidebar-open");
      document.body.style.overflow = previousOverflow;
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
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMobileSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [closeMobileSidebar]);

  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar]);

  useEffect(() => {
    return () => {
      cancelPendingRestore();

      if (sidebarMenuRef.current) {
        saveScrollPosition(
          sidebarMenuRef.current.scrollTop
        );
      }
    };
  }, [cancelPendingRestore, saveScrollPosition]);

  const toggleSidebar = () => {
    if (isMobileViewport()) {
      setMobileOpen((open) => !open);
      return;
    }

    setCollapsed((previous) => {
      const next = !previous;

      sessionStorage.setItem(
        SIDEBAR_COLLAPSED_KEY,
        String(next)
      );

      return next;
    });
  };

  const handleNavigation = (path) => {
    if (sidebarMenuRef.current) {
      saveScrollPosition(
        sidebarMenuRef.current.scrollTop
      );
    }

    closeMobileSidebar();

    if (location.pathname !== path) {
      navigate(path);
    }
  };

  const handleLogout = () => {
    closeMobileSidebar();

    localStorage.removeItem("token");
    localStorage.removeItem("smaxtify-token");
    localStorage.removeItem("user");

    sessionStorage.removeItem(SIDEBAR_COLLAPSED_KEY);
    sessionStorage.removeItem(SIDEBAR_SCROLL_KEY);

    cancelPendingRestore();

    setShowLogoutModal(false);
    setCurrentUser({});

    window.dispatchEvent(new Event("smaxtify-auth-change"));
    window.dispatchEvent(new Event("smaxtify-user-updated"));

    navigate("/", { replace: true });
  };

  return (
    <>
      {!mobileOpen && (
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={openMobileSidebar}
          aria-label="Open navigation menu"
          aria-expanded={false}
          aria-controls="smaxtify-sidebar"
          aria-hidden={!mobileViewport}
          tabIndex={mobileViewport ? 0 : -1}
        >
          <FaBars aria-hidden="true" />
        </button>
      )}

      {mobileOpen && (
        <button
          type="button"
          className="mobile-sidebar-overlay"
          onClick={closeMobileSidebar}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        id="smaxtify-sidebar"
        className={[
          "sidebar",
          collapsed && !mobileOpen ? "collapsed" : "",
          mobileOpen ? "mobile-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="SmaXTify sidebar"
        aria-hidden={mobileViewport && !mobileOpen}
        inert={mobileViewport && !mobileOpen ? true : undefined}
      >
        <div className="sidebar-top">
          <div
            className="sidebar-logo"
            onClick={() => handleNavigation("/dashboard")}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();
                handleNavigation("/dashboard");
              }
            }}
          >
            <div className="logo-circle">
              <FaWallet aria-hidden="true" />
            </div>

            <div className="sidebar-logo-text">
              <h2>SmaXTify</h2>
              <p>Personal Finance</p>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-menu-toggle"
            onClick={toggleSidebar}
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            title={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            <FaBars aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          className="mobile-sidebar-close"
          onClick={closeMobileSidebar}
          aria-label="Close navigation menu"
          tabIndex={mobileOpen ? 0 : -1}
        >
          <FaTimes aria-hidden="true" />
        </button>

        <div className="sidebar-user">
          <button
            type="button"
            className="sidebar-profile-avatar-button"
            onClick={() => handleNavigation("/settings")}
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

          <div className="sidebar-user-text">
            <h3 title={userName}>{userName}</h3>
          </div>
        </div>

        <nav
          className="sidebar-navigation"
          aria-label="Main navigation"
        >
          <ul
            className="sidebar-menu"
            ref={setSidebarMenuRef}
          >
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/dashboard" &&
                  location.pathname.startsWith(
                    `${item.path}/`
                  ));

              return (
                <li
                  key={item.path}
                  className={isActive ? "active" : ""}
                  title={
                    collapsed && !mobileOpen
                      ? item.title
                      : undefined
                  }
                >
                  <button
                    type="button"
                    className="sidebar-menu-item"
                    onClick={() =>
                      handleNavigation(item.path)
                    }
                    aria-current={
                      isActive ? "page" : undefined
                    }
                  >
                    <span className="sidebar-menu-icon">
                      {item.icon}
                    </span>

                    <span className="sidebar-menu-title">
                      {item.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-bottom">
          {isAdmin && (
            <button
              type="button"
              className={`admin-panel-btn ${
                isAdminPage ? "active" : ""
              }`}
              onClick={() => handleNavigation("/admin")}
            >
              <span className="admin-panel-icon">
                <FaUserShield aria-hidden="true" />
              </span>

              <span className="admin-panel-text">
                Admin Panel
              </span>
            </button>
          )}

          <button
            type="button"
            className="logout-btn"
            onClick={() => {
              closeMobileSidebar();
              setShowLogoutModal(true);
            }}
          >
            <FaSignOutAlt aria-hidden="true" />
            <span>Logout</span>
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
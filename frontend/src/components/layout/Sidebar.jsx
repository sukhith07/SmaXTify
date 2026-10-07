
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

import { useState, useEffect } from "react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import LogoutConfirmModal from "../LogoutConfirmModal";
import "./../styles/sidebar.css";

const API_URL = "http://localhost:5000/api";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
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
    return `http://localhost:5000${photo}`;
  }

  return photo;
}

function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = sessionStorage.getItem(
      "smaxtify-sidebar-collapsed"
    );

    return savedState === null ? false : savedState === "true";
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [photoFailed, setPhotoFailed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const userName = getUserName(currentUser);
  const userPhoto = getUserPhoto(currentUser);

  useEffect(() => {
    setPhotoFailed(false);
  }, [userPhoto]);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (isMounted) {
          setIsAdmin(false);
          setCurrentUser({});
        }

        return;
      }

      const storedUser = getStoredUser();

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
          if (isMounted) {
            setIsAdmin(false);
          }

          return;
        }

        const fetchedUser = data?.user || data?.data?.user;

        if (fetchedUser) {
          const updatedUser = {
            ...storedUser,
            ...fetchedUser,
          };

          localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
          );

          if (isMounted) {
            setCurrentUser(updatedUser);
            setIsAdmin(
              fetchedUser.role === "admin" ||
                fetchedUser.role === "superadmin"
            );
          }
        } else if (isMounted) {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Current User Error:", error);

        if (isMounted) {
          setIsAdmin(false);
        }
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

    return () => {
      isMounted = false;

      window.removeEventListener(
        "smaxtify-user-updated",
        handleUserUpdated
      );
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
    document.documentElement.style.setProperty(
      "--smaxtify-sidebar-width",
      collapsed ? "88px" : "276px"
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

  const toggleSidebar = () => {
    setCollapsed((previous) => {
      const nextState = !previous;

      sessionStorage.setItem(
        "smaxtify-sidebar-collapsed",
        String(nextState)
      );

      return nextState;
    });
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  const isAdminPage = location.pathname.startsWith("/admin");

  const handleAdminPanel = () => {
    if (!isAdmin) {
      return;
    }

    handleNavigation("/admin");
  };

  const handleProfile = () => {
    handleNavigation("/settings");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("smaxtify-sidebar-collapsed");

    setShowLogoutModal(false);
    setMobileOpen(false);

    navigate("/", {
      replace: true,
    });
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
        className={`
          sidebar
          ${collapsed ? "collapsed" : ""}
          ${mobileOpen ? "mobile-open" : ""}
        `}
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

        <nav className="sidebar-navigation">
          <ul className="sidebar-menu">
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
              className={`
                admin-panel-btn
                ${isAdminPage ? "active" : ""}
              `}
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
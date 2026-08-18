import {
  FaHome,
  FaWallet,
  FaBullseye,
  FaChartBar,
  FaExchangeAlt,
  FaCreditCard,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import LogoutConfirmModal from "../LogoutConfirmModal";

import "./../styles/sidebar.css";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = sessionStorage.getItem(
      "smaxtify-sidebar-collapsed"
    );

    return savedState === null
      ? true
      : savedState === "true";
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      icon: <FaHome />,
      path: "/dashboard",
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
      title: "Bill Reminders",
      icon: <FaBell />,
      path: "/reminders",
    },
    {
      title: "Settings",
      icon: <FaCog />,
      path: "/settings",
    },
  ];

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

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

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
        <button
          type="button"
          className="mobile-sidebar-close"
          onClick={closeMobileSidebar}
          aria-label="Close navigation menu"
        >
          <FaTimes />
        </button>

        <button
          type="button"
          className="collapse-btn"
          onClick={toggleSidebar}
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {collapsed ? (
            <FaChevronRight />
          ) : (
            <FaChevronLeft />
          )}
        </button>

        <div className="sidebar-logo">
          <div className="logo-circle">
            <FaWallet />
          </div>

          {!collapsed && (
            <div>
              <h2>SmaXTify</h2>
              <p>Personal Finance</p>
            </div>
          )}
        </div>

        <div className="sidebar-user">
          <FaUserCircle className="user-avatar" />

          {!collapsed && (
            <div>
              <h3>User</h3>
              <span>Premium</span>
            </div>
          )}
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={
                location.pathname === item.path
                  ? "active"
                  : ""
              }
              onClick={() =>
                handleNavigation(item.path)
              }
            >
              {item.icon}

              {!collapsed && (
                <span>{item.title}</span>
              )}
            </li>
          ))}
        </ul>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="logout-btn"
            onClick={() =>
              setShowLogoutModal(true)
            }
          >
            <FaSignOutAlt />

            {!collapsed && (
              <span>Logout</span>
            )}
          </button>
        </div>
      </aside>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() =>
          setShowLogoutModal(false)
        }
        onLogout={handleLogout}
      />
    </>
  );
}

export default Sidebar;
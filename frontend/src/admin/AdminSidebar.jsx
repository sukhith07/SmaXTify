import {
  FaChartPie,
  FaUsers,
  FaMoneyBillTransfer,
  FaCreditCard,
  FaClipboardList,
  FaBars,
  FaWallet,
  FaArrowUpRightFromSquare,
  FaBuildingColumns,
} from "react-icons/fa6";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

function AdminSidebar({
  collapsed,
  onToggle,
}) {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: <FaChartPie />,
      end: true,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: <FaUsers />,
    },
    {
      label: "Accounts",
      path: "/admin/accounts",
      icon: <FaBuildingColumns />,
    },
    {
      label: "Transactions",
      path: "/admin/transactions",
      icon: <FaMoneyBillTransfer />,
    },
    {
      label: "Subscriptions",
      path: "/admin/subscriptions",
      icon: <FaCreditCard />,
    },
    {
      label: "Audit Logs",
      path: "/admin/audit-logs",
      icon: <FaClipboardList />,
    },
  ];

  return (
    <aside className="admin-sidebar">

      {/* =====================================================
          SIDEBAR HEADER
      ===================================================== */}

      <div className="admin-sidebar-header">

        <button
          type="button"
          className="admin-sidebar-logo"
          onClick={() =>
            navigate("/admin")
          }
          title="SmaXTify Admin"
        >
          <span className="admin-logo-icon">
            <FaWallet />
          </span>

          <span className="admin-logo-content">
            <strong>
              SmaXTify
            </strong>

            <small>
              ADMIN PANEL
            </small>
          </span>
        </button>

        <button
          type="button"
          className="admin-collapse-button"
          onClick={onToggle}
          title={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          <FaBars />
        </button>

      </div>

      {/* =====================================================
          DIVIDER
      ===================================================== */}

      <div className="admin-sidebar-divider" />

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="admin-sidebar-nav">

        {!collapsed && (
          <span className="admin-nav-label">
            MANAGEMENT
          </span>
        )}

        {menuItems.map(
          (item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `admin-nav-item ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
              title={
                collapsed
                  ? item.label
                  : undefined
              }
            >
              <span className="admin-nav-icon">
                {item.icon}
              </span>

              {!collapsed && (
                <span className="admin-nav-text">
                  {item.label}
                </span>
              )}
            </NavLink>
          )
        )}

      </nav>

      {/* =====================================================
          SIDEBAR BOTTOM
      ===================================================== */}

      <div className="admin-sidebar-bottom">

        <button
          type="button"
          className="admin-user-app-button"
          onClick={() =>
            navigate("/dashboard")
          }
          title={
            collapsed
              ? "Back to SmaXTify"
              : undefined
          }
        >
          <FaArrowUpRightFromSquare />

          {!collapsed && (
            <span>
              Back to SmaXTify
            </span>
          )}
        </button>

      </div>

    </aside>
  );
}

export default AdminSidebar;
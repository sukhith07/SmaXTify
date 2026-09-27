import {
  FaShieldHalved,
  FaArrowRightFromBracket,
} from "react-icons/fa6";

import { useNavigate } from "react-router-dom";

function AdminNavbar() {
  const navigate = useNavigate();

  const user = (() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      return storedUser
        ? JSON.parse(storedUser)
        : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });

    window.location.reload();
  };

  return (
    <header className="admin-navbar">

      <div className="admin-navbar-left">

        <div className="admin-navbar-title">
          <span>
            Administration
          </span>

          <strong>
            SmaXTify Control Center
          </strong>
        </div>

      </div>

      <div className="admin-navbar-right">

        <div className="admin-security-badge">
          <FaShieldHalved />

          <span>
            Administrator
          </span>
        </div>

        <div className="admin-navbar-user">

          <div className="admin-navbar-avatar">
            {user?.name
              ? user.name
                  .charAt(0)
                  .toUpperCase()
              : "A"}
          </div>

          <div className="admin-navbar-user-info">

            <strong>
              {user?.name || "Admin"}
            </strong>

            <span>
              {user?.email || ""}
            </span>

          </div>

        </div>

        <button
          type="button"
          className="admin-logout-button"
          onClick={handleLogout}
          title="Logout"
        >
          <FaArrowRightFromBracket />
        </button>

      </div>

    </header>
  );
}

export default AdminNavbar;
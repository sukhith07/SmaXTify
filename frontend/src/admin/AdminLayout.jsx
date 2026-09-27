import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

import "../components/styles/admin.css";

const API_URL =
  "http://localhost:5000/api";

function AdminLayout() {
  const location =
    useLocation();

  const [authorized, setAuthorized] =
    useState(null);

  const [userRole, setUserRole] =
    useState("");

  const [token, setToken] =
    useState(
      localStorage.getItem(
        "token"
      )
    );

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(() => {
      return (
        localStorage.getItem(
          "smaxtify-admin-sidebar-collapsed"
        ) === "true"
      );
    });

  // =========================================================
  // KEEP TOKEN IN SYNC
  // =========================================================

  useEffect(() => {
    setToken(
      localStorage.getItem(
        "token"
      )
    );
  }, [location.pathname]);

  // =========================================================
  // VERIFY ADMIN ROLE
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const verifyAdminAccess =
      async () => {
        const currentToken =
          localStorage.getItem(
            "token"
          );

        if (!currentToken) {
          if (!cancelled) {
            setAuthorized(false);
            setUserRole("");
          }

          return;
        }

        try {
          setAuthorized(null);

          const response =
            await fetch(
              `${API_URL}/auth/me`,
              {
                method: "GET",

                headers: {
                  Authorization:
                    `Bearer ${currentToken}`,
                },
              }
            );

          if (!response.ok) {
            if (!cancelled) {
              setAuthorized(false);
              setUserRole("");
            }

            return;
          }

          const data =
            await response.json();

          if (
            !data?.user
          ) {
            if (!cancelled) {
              setAuthorized(false);
              setUserRole("");
            }

            return;
          }

          const role =
            data.user.role ||
            "user";

          const hasAdminAccess =
            role === "admin" ||
            role === "superadmin";

          if (!cancelled) {
            setUserRole(role);
            setAuthorized(
              hasAdminAccess
            );
          }
        } catch (error) {
          console.error(
            "Admin Authorization Error:",
            error
          );

          if (!cancelled) {
            setAuthorized(false);
            setUserRole("");
          }
        }
      };

    verifyAdminAccess();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================
  // SIDEBAR STATE
  // =========================================================

  useEffect(() => {
    localStorage.setItem(
      "smaxtify-admin-sidebar-collapsed",
      String(
        sidebarCollapsed
      )
    );
  }, [
    sidebarCollapsed,
  ]);

  // =========================================================
  // LOADING
  // =========================================================

  if (
    authorized === null
  ) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-spinner" />

        <p>
          Verifying admin access...
        </p>
      </div>
    );
  }

  // =========================================================
  // NOT AUTHORIZED
  // =========================================================

  if (
    !token ||
    !authorized
  ) {
    return (
      <Navigate
        to={
          !token
            ? "/login"
            : "/dashboard"
        }
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }

  // =========================================================
  // ADMIN PANEL
  // =========================================================

  return (
    <div
      className={`admin-app ${
        sidebarCollapsed
          ? "admin-sidebar-collapsed"
          : ""
      }`}
      data-admin-role={
        userRole
      }
    >
      <AdminSidebar
        collapsed={
          sidebarCollapsed
        }
        onToggle={() =>
          setSidebarCollapsed(
            (previous) =>
              !previous
          )
        }
      />

      <div className="admin-main">
        <AdminNavbar />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
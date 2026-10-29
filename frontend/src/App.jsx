import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import { CalendarProvider } from "./context/CalendarContext";
import { CalculatorProvider } from "./context/CalculatorContext";
import { NotificationProvider } from "./context/NotificationContext";

import Calendar from "./pages/Calendar";
import Calculator from "./components/Calculator";
import NotificationPanel from "./components/NotificationPanel";
import Notifications from "./components/Notifications";
import GlobalFooter from "./components/GlobalFooter";
import SmaXTifyAI from "./components/ai/SmaXTifyAI";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/forgotpassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import BudgetPlannerPage from "./pages/BudgetPlannerPage";
import SavingsGoals from "./pages/SavingsGoals";
import Reports from "./pages/Reports";
import CurrencyConverter from "./pages/CurrencyConverter";
import SubscriptionTracker from "./pages/SubscriptionTracker";
import BillReminders from "./pages/BillReminders";
import Settings from "./pages/Settings";
import AIScan from "./pages/AIScan";

import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminUsers from "./admin/AdminUsers";
import AdminAccounts from "./admin/AdminAccounts";
import AdminTransactions from "./admin/AdminTransactions";
import AdminSubscriptions from "./admin/AdminSubscriptions";
import AdminAuditLogs from "./admin/AdminAuditLogs";

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
];

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const scrollableContainers = document.querySelectorAll(
      ".app-route-content, .dashboard-content, .dashboard-main, .aiscan-content, .aiscan-main"
    );

    scrollableContainers.forEach((container) => {
      container.scrollTop = 0;
      container.scrollLeft = 0;
    });
  }, [pathname]);

  return null;
}

function App() {
  const location = useLocation();

  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, [location]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const applyTheme = (selectedTheme) => {
      const theme =
        selectedTheme ||
        localStorage.getItem("smaxtify-theme") ||
        "light";

      const resolvedTheme =
        theme === "dark"
          ? "dark"
          : theme === "system"
            ? mediaQuery.matches
              ? "dark"
              : "light"
            : "light";

      document.documentElement.setAttribute(
        "data-theme",
        resolvedTheme
      );

      document.body.setAttribute(
        "data-theme",
        resolvedTheme
      );

      document.documentElement.style.colorScheme =
        resolvedTheme;

      document.body.style.colorScheme = resolvedTheme;
    };

    const handleThemeChange = () => {
      applyTheme();
    };

    const handleSystemThemeChange = () => {
      const selectedTheme =
        localStorage.getItem("smaxtify-theme") || "light";

      if (selectedTheme === "system") {
        applyTheme(selectedTheme);
      }
    };

    applyTheme();

    window.addEventListener(
      "smaxtify-theme-change",
      handleThemeChange
    );

    window.addEventListener(
      "storage",
      handleThemeChange
    );

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange
    );

    return () => {
      window.removeEventListener(
        "smaxtify-theme-change",
        handleThemeChange
      );

      window.removeEventListener(
        "storage",
        handleThemeChange
      );

      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange
      );
    };
  }, []);

  const isAdminRoute =
    location.pathname.startsWith("/admin");

  const isAuthRoute = AUTH_ROUTES.includes(
    location.pathname
  );

  const shouldShowFooter =
    !isAuthRoute && !isAdminRoute;

  const isAuthenticated = Boolean(token);

  return (
    <NotificationProvider>
      <CalendarProvider>
        <CalculatorProvider>
          <ScrollToTop />

          <div
            className={`app-page-shell ${
              isAdminRoute ? "app-page-shell--admin" : ""
            }`}
          >
            <main className="app-route-content">
              <Routes>
                <Route
                  path="/"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/dashboard" replace />
                    ) : (
                      <Landing />
                    )
                  }
                />

                <Route
                  path="/login"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/dashboard" replace />
                    ) : (
                      <Login />
                    )
                  }
                />

                <Route
                  path="/register"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/dashboard" replace />
                    ) : (
                      <Register />
                    )
                  }
                />

                <Route
                  path="/forgot-password"
                  element={<ForgotPassword />}
                />

                <Route
                  path="/verify-otp"
                  element={<VerifyOTP />}
                />

                <Route
                  path="/reset-password"
                  element={<ResetPassword />}
                />

                <Route
                  path="/privacy-policy"
                  element={<PrivacyPolicy />}
                />

                <Route
                  path="/terms-of-service"
                  element={<TermsOfService />}
                />

                <Route
                  path="/dashboard"
                  element={
                    isAuthenticated ? (
                      <Dashboard />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/accounts"
                  element={
                    isAuthenticated ? (
                      <Accounts />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/budget"
                  element={
                    isAuthenticated ? (
                      <BudgetPlannerPage />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/goals"
                  element={
                    isAuthenticated ? (
                      <SavingsGoals />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/reports"
                  element={
                    isAuthenticated ? (
                      <Reports />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/currency"
                  element={
                    isAuthenticated ? (
                      <CurrencyConverter />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/subscriptions"
                  element={
                    isAuthenticated ? (
                      <SubscriptionTracker />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/reminders"
                  element={
                    isAuthenticated ? (
                      <BillReminders />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/settings"
                  element={
                    isAuthenticated ? (
                      <Settings />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/ai-scan"
                  element={
                    isAuthenticated ? (
                      <AIScan />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/calendar"
                  element={
                    isAuthenticated ? (
                      <Calendar />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/notifications"
                  element={
                    isAuthenticated ? (
                      <Notifications />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />

                <Route
                  path="/admin"
                  element={
                    isAuthenticated ? (
                      <AdminLayout />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                >
                  <Route
                    index
                    element={<AdminDashboard />}
                  />

                  <Route
                    path="users"
                    element={<AdminUsers />}
                  />

                  <Route
                    path="accounts"
                    element={<AdminAccounts />}
                  />

                  <Route
                    path="transactions"
                    element={<AdminTransactions />}
                  />

                  <Route
                    path="subscriptions"
                    element={<AdminSubscriptions />}
                  />

                  <Route
                    path="audit-logs"
                    element={<AdminAuditLogs />}
                  />
                </Route>

                <Route
                  path="*"
                  element={<Navigate to="/" replace />}
                />
              </Routes>
            </main>

            {shouldShowFooter && <GlobalFooter />}
          </div>

          {isAuthenticated && !isAdminRoute && (
            <>
              <Calendar />
              <Calculator />
              <NotificationPanel />
              <SmaXTifyAI />
            </>
          )}

          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            pauseOnHover
          />
        </CalculatorProvider>
      </CalendarProvider>
    </NotificationProvider>
  );
}

export default App;
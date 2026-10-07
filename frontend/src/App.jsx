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

// =========================================================
// GLOBAL COMPONENTS
// =========================================================

import Calendar from "./pages/Calendar";
import Calculator from "./components/Calculator";
import NotificationPanel from "./components/NotificationPanel";
import Notifications from "./components/Notifications";

// SmaXTify.AI
import SmaXTifyAI from "./components/ai/SmaXTifyAI";

// =========================================================
// PUBLIC PAGES
// =========================================================

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/forgotpassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";

// =========================================================
// AUTHENTICATED PAGES
// =========================================================

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

// =========================================================
// ADMIN PANEL
// =========================================================

import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminUsers from "./admin/AdminUsers";
import AdminAccounts from "./admin/AdminAccounts";
import AdminTransactions from "./admin/AdminTransactions";
import AdminSubscriptions from "./admin/AdminSubscriptions";
import AdminAuditLogs from "./admin/AdminAuditLogs";

// =========================================================
// APP
// =========================================================

function App() {
  const location = useLocation();

  // =======================================================
  // AUTH TOKEN
  // =======================================================

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  // =======================================================
  // UPDATE TOKEN WHEN ROUTE CHANGES
  // =======================================================

  useEffect(() => {
    setToken(
      localStorage.getItem("token")
    );
  }, [location]);

  // =======================================================
  // THEME SYSTEM
  // =======================================================

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

      document.body.style.colorScheme =
        resolvedTheme;
    };

    const handleThemeChange = () => {
      applyTheme();
    };

    const handleSystemThemeChange = () => {
      const selectedTheme =
        localStorage.getItem(
          "smaxtify-theme"
        ) || "light";

      if (
        selectedTheme === "system"
      ) {
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

  // =======================================================
  // ADMIN ROUTE DETECTION
  // =======================================================

  const isAdminRoute =
    location.pathname.startsWith(
      "/admin"
    );

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <NotificationProvider>
      <CalendarProvider>
        <CalculatorProvider>
          <Routes>

            {/* =================================================
                LANDING
            ================================================= */}

            <Route
              path="/"
              element={
                token ? (
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                ) : (
                  <Landing />
                )
              }
            />

            {/* =================================================
                LOGIN
            ================================================= */}

            <Route
              path="/login"
              element={
                token ? (
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                ) : (
                  <Login />
                )
              }
            />

            {/* =================================================
                REGISTER
            ================================================= */}

            <Route
              path="/register"
              element={
                token ? (
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                ) : (
                  <Register />
                )
              }
            />

            {/* =================================================
                FORGOT PASSWORD
            ================================================= */}

            <Route
              path="/forgot-password"
              element={
                <ForgotPassword />
              }
            />

            {/* =================================================
                VERIFY OTP
            ================================================= */}

            <Route
              path="/verify-otp"
              element={
                <VerifyOTP />
              }
            />

            {/* =================================================
                RESET PASSWORD
            ================================================= */}

            <Route
              path="/reset-password"
              element={
                <ResetPassword />
              }
            />

            {/* =================================================
                DASHBOARD
            ================================================= */}

            <Route
              path="/dashboard"
              element={
                token ? (
                  <Dashboard />
                ) : (
                  <Navigate
                    to="/login"
                    replace
                  />
                )
              }
            />

            {/* =================================================
                ACCOUNTS
            ================================================= */}

            <Route
              path="/accounts"
              element={
                token ? (
                  <Accounts />
                ) : (
                  <Navigate
                    to="/login"
                    replace
                  />
                )
              }
            />

            {/* =================================================
                BUDGET
            ================================================= */}

            <Route
              path="/budget"
              element={
                token ? (
                  <BudgetPlannerPage />
                ) : (
                  <Navigate
                    to="/login"
                    replace
                  />
                )
              }
            />

            {/* =================================================
                SAVINGS GOALS
            ================================================= */}

            <Route
              path="/goals"
              element={
                token ? (
                  <SavingsGoals />
                ) : (
                  <Navigate
                    to="/login"
                    replace
                  />
                )
              }
            />

            {/* =================================================
                REPORTS
            ================================================= */}

            <Route
              path="/reports"
              element={
                token ? (
                  <Reports />
                ) : (
                  <Navigate
                    to="/login"
                    replace
                  />
                )
              }
            />

            {/* =================================================
                CURRENCY
            ================================================= */}

            <Route
              path="/currency"
              element={
                token ? (
                  <CurrencyConverter />
                ) : (
                  <Navigate
                    to="/login"
                    replace
                  />
                )
              }
            />

            {/* =================================================
                SUBSCRIPTIONS
            ================================================= */}

            <Route
              path="/subscriptions"
              element={
                token ? (
                  <SubscriptionTracker />
                ) : (
                  <Navigate
                    to="/login"
                    replace
                  />
                )
              }
            />

            {/* =================================================
                REMINDERS
            ================================================= */}

            <Route
              path="/reminders"
              element={
                token ? (
                  <BillReminders />
                ) : (
                  <Navigate
                    to="/login"
                    replace
                  />
                )
              }
            />

            {/* =================================================
                SETTINGS
            ================================================= */}

            <Route
              path="/settings"
              element={
                token ? (
                  <Settings />
                ) : (
                  <Navigate
                    to="/login"
                    replace
                  />
                )
              }
            />

            {/* =================================================
                AI RECEIPT SCAN
            ================================================= */}

            <Route
              path="/ai-scan"
              element={
                token ? (
                  <AIScan />
                ) : (
                  <Navigate
                    to="/login"
                    replace
                  />
                )
              }
            />

            {/* =================================================
                CALENDAR
            ================================================= */}

            <Route
              path="/calendar"
              element={
                token ? (
                  <Calendar />
                ) : (
                  <Navigate
                    to="/login"
                    replace
                  />
                )
              }
            />

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <Route
              path="/notifications"
              element={
                token ? (
                  <Notifications />
                ) : (
                  <Navigate
                    to="/login"
                    replace
                  />
                )
              }
            />

            {/* =================================================
                ADMIN PANEL
            ================================================= */}

            <Route
              path="/admin"
              element={
                token ? (
                  <AdminLayout />
                ) : (
                  <Navigate
                    to="/login"
                    replace
                  />
                )
              }
            >

              {/* =================================================
                  ADMIN DASHBOARD
              ================================================= */}

              <Route
                index
                element={
                  <AdminDashboard />
                }
              />

              {/* =================================================
                  ADMIN USERS
              ================================================= */}

              <Route
                path="users"
                element={
                  <AdminUsers />
                }
              />

              {/* =================================================
                  ADMIN ACCOUNTS
              ================================================= */}

              <Route
                path="accounts"
                element={
                  <AdminAccounts />
                }
              />

              {/* =================================================
                  ADMIN TRANSACTIONS
              ================================================= */}

              <Route
                path="transactions"
                element={
                  <AdminTransactions />
                }
              />

              {/* =================================================
                  ADMIN SUBSCRIPTIONS
              ================================================= */}

              <Route
                path="subscriptions"
                element={
                  <AdminSubscriptions />
                }
              />

              {/* =================================================
                  ADMIN AUDIT LOGS
              ================================================= */}

              <Route
                path="audit-logs"
                element={
                  <AdminAuditLogs />
                }
              />

            </Route>

            {/* =================================================
                FALLBACK
            ================================================= */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>

          {/* =================================================
              GLOBAL AUTHENTICATED COMPONENTS
          ================================================= */}

          {token &&
            !isAdminRoute && (
              <>
                <Calendar />

                <Calculator />

                <NotificationPanel />

                <SmaXTifyAI />
              </>
            )}

          {/* =================================================
              TOAST NOTIFICATIONS
          ================================================= */}

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
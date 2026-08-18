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

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import BudgetPlannerPage from "./pages/BudgetPlannerPage";
import SavingsGoals from "./pages/SavingsGoals";
import Reports from "./pages/Reports";
import CurrencyConverter from "./pages/CurrencyConverter";
import SubscriptionTracker from "./pages/SubscriptionTracker";
import BillReminders from "./pages/BillReminders";
import Settings from "./pages/Settings";

function App() {
  const location = useLocation();

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  useEffect(() => {
    setToken(
      localStorage.getItem("token")
    );
  }, [location]);

  return (
    <CalendarProvider>
      <CalculatorProvider>
        <NotificationProvider>

          <Routes>

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

            <Route
              path="/forgot-password"
              element={
                <ForgotPassword />
              }
            />

            <Route
              path="/verify-otp"
              element={
                <VerifyOTP />
              }
            />

            <Route
              path="/reset-password"
              element={
                <ResetPassword />
              }
            />

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

          <Calendar />

          <Calculator />

          <NotificationPanel />

          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            pauseOnHover
          />

        </NotificationProvider>
      </CalculatorProvider>
    </CalendarProvider>
  );
}

export default App;
import {
  FaBell,
  FaCalendarAlt,
  FaCalculator,
} from "react-icons/fa";

import { useCalendar } from "../../context/CalendarContext";
import { useCalculator } from "../../context/CalculatorContext";
import { useNotifications } from "../../context/NotificationContext";

import "./../styles/navbar.css";

function Navbar({ openAI }) {
  const {
    openCalendar,
    closeCalendar,
  } = useCalendar();

  const {
    openCalculator,
    closeCalculator,
  } = useCalculator();

  const {
    openNotifications,
    closeNotifications,
    unreadCount,
  } = useNotifications();

  const handleCalendar = () => {
    closeCalculator();
    closeNotifications();
    openCalendar();
  };

  const handleCalculator = () => {
    closeCalendar();
    closeNotifications();
    openCalculator();
  };

  const handleNotifications = () => {
    closeCalendar();
    closeCalculator();
    openNotifications();
  };

  const hour = new Date().getHours();

  let greeting = "Good Evening 🌙";

  if (hour < 12) {
    greeting = "Good Morning ☀";
  } else if (hour < 18) {
    greeting = "Good Afternoon 🌤";
  }

  const today = new Date().toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1>
          Hey!👋 {greeting}
        </h1>

        <p>{today}</p>
      </div>

      <div className="navbar-actions">
        <button
          type="button"
          className="navbar-glass-btn calendar-btn"
          onClick={handleCalendar}
          aria-label="Calendar"
          title="Calendar"
        >
          <FaCalendarAlt />
        </button>

        <button
          type="button"
          className="navbar-glass-btn calculator-btn"
          onClick={handleCalculator}
          aria-label="Calculator"
          title="Calculator"
        >
          <FaCalculator />
        </button>

        <button
          type="button"
          className="navbar-glass-btn notification-btn"
          onClick={handleNotifications}
          aria-label="Notifications"
          title="Notifications"
        >
          <FaBell />

          {unreadCount > 0 && (
            <span className="notification-dot">
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
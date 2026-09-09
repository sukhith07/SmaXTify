import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import {
  FaUser,
  FaPalette,
  FaBell,
  FaShieldAlt,
  FaGlobe,
  FaExclamationTriangle,
  FaTrash,
  FaUndo,
  FaUserTimes,
  FaInfoCircle,
  FaLock,
  FaFileContract,
  FaChevronRight,
  FaCheck,
  FaSun,
  FaMoon,
  FaDesktop,
  FaSearch,
  FaCoins,
  FaClock,
  FaChevronDown,
  FaTimes,
} from "react-icons/fa";
import "../components/styles/settings.css";

const currencies = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", country: "India" },
  { code: "USD", symbol: "$", name: "US Dollar", country: "United States" },
  { code: "EUR", symbol: "€", name: "Euro", country: "European Union" },
  { code: "GBP", symbol: "£", name: "British Pound", country: "United Kingdom" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", country: "Japan" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", country: "Australia" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", country: "Canada" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", country: "Singapore" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", country: "United Arab Emirates" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", country: "Saudi Arabia" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", country: "China" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", country: "South Korea" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", country: "Switzerland" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", country: "New Zealand" },
  { code: "ZAR", symbol: "R", name: "South African Rand", country: "South Africa" },
];

const timezones = [
  { value: "Asia/Kolkata", label: "India Standard Time", short: "IST", region: "UTC +05:30" },
  { value: "UTC", label: "Coordinated Universal Time", short: "UTC", region: "UTC +00:00" },
  { value: "America/New_York", label: "Eastern Time", short: "ET", region: "UTC -05:00" },
  { value: "America/Chicago", label: "Central Time", short: "CT", region: "UTC -06:00" },
  { value: "America/Denver", label: "Mountain Time", short: "MT", region: "UTC -07:00" },
  { value: "America/Los_Angeles", label: "Pacific Time", short: "PT", region: "UTC -08:00" },
  { value: "Europe/London", label: "British Time", short: "GMT", region: "UTC +00:00" },
  { value: "Europe/Paris", label: "Central European Time", short: "CET", region: "UTC +01:00" },
  { value: "Asia/Dubai", label: "Gulf Standard Time", short: "GST", region: "UTC +04:00" },
  { value: "Asia/Singapore", label: "Singapore Time", short: "SGT", region: "UTC +08:00" },
  { value: "Asia/Tokyo", label: "Japan Standard Time", short: "JST", region: "UTC +09:00" },
  { value: "Australia/Sydney", label: "Australian Eastern Time", short: "AET", region: "UTC +10:00" },
];

function CurrencyDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const selected =
    currencies.find((currency) => currency.code === value) || currencies[0];

  const filtered = currencies.filter((currency) =>
    `${currency.code} ${currency.name} ${currency.country}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="settings-custom-dropdown" ref={ref}>
      <button
        type="button"
        className={`settings-dropdown-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="settings-dropdown-leading currency-leading">
          {selected.symbol}
        </span>

        <span className="settings-dropdown-selected">
          <strong>{selected.code}</strong>
          <small>{selected.name}</small>
        </span>

        <FaChevronDown
          className={`settings-dropdown-arrow ${open ? "rotate" : ""}`}
        />
      </button>

      {open && (
        <div className="settings-dropdown-menu currency-menu">
          <div className="settings-dropdown-search">
            <FaSearch />
            <input
              type="text"
              placeholder="Search currency..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoFocus
            />
            {search && (
              <button
                type="button"
                className="settings-search-clear"
                onClick={() => setSearch("")}
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="settings-dropdown-list">
            {filtered.length > 0 ? (
              filtered.map((currency) => (
                <button
                  type="button"
                  key={currency.code}
                  className={`settings-currency-option ${
                    value === currency.code ? "selected" : ""
                  }`}
                  onClick={() => {
                    onChange(currency.code);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span className="currency-option-symbol">
                    {currency.symbol}
                  </span>

                  <span className="currency-option-info">
                    <strong>{currency.code}</strong>
                    <span>{currency.name}</span>
                    <small>{currency.country}</small>
                  </span>

                  {value === currency.code && (
                    <span className="currency-option-check">
                      <FaCheck />
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="settings-no-results">
                No currency found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TimezoneDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected =
    timezones.find((timezone) => timezone.value === value) || timezones[0];

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="settings-custom-dropdown" ref={ref}>
      <button
        type="button"
        className={`settings-dropdown-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="settings-dropdown-leading timezone-leading">
          <FaClock />
        </span>

        <span className="settings-dropdown-selected">
          <strong>{selected.label}</strong>
          <small>
            {selected.short} · {selected.region}
          </small>
        </span>

        <FaChevronDown
          className={`settings-dropdown-arrow ${open ? "rotate" : ""}`}
        />
      </button>

      {open && (
        <div className="settings-dropdown-menu timezone-menu">
          <div className="timezone-menu-heading">
            <div className="timezone-menu-icon">
              <FaClock />
            </div>
            <div>
              <strong>Select Timezone</strong>
              <span>Choose the timezone used for dates and times</span>
            </div>
          </div>

          <div className="settings-dropdown-list">
            {timezones.map((timezone) => (
              <button
                type="button"
                key={timezone.value}
                className={`settings-timezone-option ${
                  value === timezone.value ? "selected" : ""
                }`}
                onClick={() => {
                  onChange(timezone.value);
                  setOpen(false);
                }}
              >
                <span className="timezone-option-icon">
                  <FaGlobe />
                </span>

                <span className="timezone-option-info">
                  <strong>{timezone.label}</strong>
                  <span>
                    {timezone.short} · {timezone.region}
                  </span>
                </span>

                {value === timezone.value && (
                  <span className="timezone-option-check">
                    <FaCheck />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Settings() {
  const [theme, setTheme] = useState(
    localStorage.getItem("smaxtify-theme") || "light"
  );

  const [currency, setCurrency] = useState(
    localStorage.getItem("smaxtify-currency") || "INR"
  );

  const [timezone, setTimezone] = useState(
    localStorage.getItem("smaxtify-timezone") || "Asia/Kolkata"
  );

  const [pushNotifications, setPushNotifications] = useState(
    localStorage.getItem("smaxtify-push-notifications") !== "false"
  );

  const [emailNotifications, setEmailNotifications] = useState(
    localStorage.getItem("smaxtify-email-notifications") !== "false"
  );

  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    localStorage.setItem("smaxtify-theme", theme);

    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else if (theme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      document.documentElement.setAttribute(
        "data-theme",
        prefersDark ? "dark" : "light"
      );
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("smaxtify-currency", currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem("smaxtify-timezone", timezone);
  }, [timezone]);

  useEffect(() => {
    localStorage.setItem(
      "smaxtify-push-notifications",
      String(pushNotifications)
    );
  }, [pushNotifications]);

  useEffect(() => {
    localStorage.setItem(
      "smaxtify-email-notifications",
      String(emailNotifications)
    );
  }, [emailNotifications]);

  const handleResetSettings = () => {
    localStorage.removeItem("smaxtify-theme");
    localStorage.removeItem("smaxtify-currency");
    localStorage.removeItem("smaxtify-timezone");
    localStorage.removeItem("smaxtify-push-notifications");
    localStorage.removeItem("smaxtify-email-notifications");

    setTheme("light");
    setCurrency("INR");
    setTimezone("Asia/Kolkata");
    setPushNotifications(true);
    setEmailNotifications(true);
    setActiveModal(null);
  };

  const handleDeleteTransactions = () => {
    setActiveModal(null);
    alert("Delete All Transactions will be connected to the backend.");
  };

  const handleDeleteAccount = () => {
    setActiveModal(null);
    alert("Delete Account will be connected to the backend.");
  };

  return (
    <div className="settings-page">
      <Sidebar />

      <div className="settings-content">
        <Navbar />

        <main className="settings-main">
          <section className="settings-page-header">
            <div className="settings-page-header-icon">
              <FaCogIcon />
            </div>

            <div className="settings-page-header-content">
              <h1>Settings</h1>
              <p>Manage your preferences, notifications and account settings</p>
            </div>
          </section>

          <section className="settings-section settings-profile">
            <div className="settings-section-title">
              <div className="settings-section-icon profile-icon">
                <FaUser />
              </div>

              <div>
                <h2>Profile</h2>
                <p>Manage your personal information</p>
              </div>
            </div>

            <div className="settings-card profile-card">
              <div className="settings-card-icon blue-icon">
                <FaUser />
              </div>

              <div className="settings-card-content">
                <span className="settings-card-label">Profile Information</span>
                <strong>Personal Details</strong>
                <p>Update your name and personal details</p>
              </div>

              <button
                type="button"
                className="settings-outline-button"
                onClick={() => alert("Profile settings will be added soon.")}
              >
                Manage
                <FaChevronRight />
              </button>
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-section-title">
              <div className="settings-section-icon purple-icon">
                <FaPalette />
              </div>

              <div>
                <h2>Appearance</h2>
                <p>Customize how SmaXTify looks</p>
              </div>
            </div>

            <div className="settings-card appearance-card">
              <div className="settings-card-heading">
                <div className="settings-card-icon purple-soft-icon">
                  <FaPalette />
                </div>

                <div>
                  <strong>Theme</strong>
                  <p>Choose your preferred application theme</p>
                </div>
              </div>

              <div className="theme-selector">
                <button
                  type="button"
                  className={`theme-option ${
                    theme === "light" ? "active" : ""
                  }`}
                  onClick={() => setTheme("light")}
                >
                  <span className="theme-option-icon light-theme-icon">
                    <FaSun />
                  </span>
                  <span className="theme-option-text">
                    <strong>Light</strong>
                    <small>Bright and clean</small>
                  </span>
                  {theme === "light" && (
                    <span className="theme-check">
                      <FaCheck />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`theme-option ${
                    theme === "dark" ? "active" : ""
                  }`}
                  onClick={() => setTheme("dark")}
                >
                  <span className="theme-option-icon dark-theme-icon">
                    <FaMoon />
                  </span>
                  <span className="theme-option-text">
                    <strong>Dark</strong>
                    <small>Easy on the eyes</small>
                  </span>
                  {theme === "dark" && (
                    <span className="theme-check">
                      <FaCheck />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`theme-option ${
                    theme === "system" ? "active" : ""
                  }`}
                  onClick={() => setTheme("system")}
                >
                  <span className="theme-option-icon system-theme-icon">
                    <FaDesktop />
                  </span>
                  <span className="theme-option-text">
                    <strong>System</strong>
                    <small>Follow device theme</small>
                  </span>
                  {theme === "system" && (
                    <span className="theme-check">
                      <FaCheck />
                    </span>
                  )}
                </button>
              </div>
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-section-title">
              <div className="settings-section-icon notification-icon">
                <FaBell />
              </div>

              <div>
                <h2>Notifications</h2>
                <p>Control your notification preferences</p>
              </div>
            </div>

            <div className="settings-card">
              <div className="notification-row">
                <div className="settings-card-icon blue-soft-icon">
                  <FaBell />
                </div>

                <div className="settings-card-content">
                  <strong>Push Notifications</strong>
                  <p>Receive important updates and reminders</p>
                </div>

                <label className="settings-switch">
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(event) =>
                      setPushNotifications(event.target.checked)
                    }
                  />
                  <span />
                </label>
              </div>

              <div className="settings-divider" />

              <div className="notification-row">
                <div className="settings-card-icon green-soft-icon">
                  <FaInfoCircle />
                </div>

                <div className="settings-card-content">
                  <strong>Email Notifications</strong>
                  <p>Receive account updates through email</p>
                </div>

                <label className="settings-switch">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(event) =>
                      setEmailNotifications(event.target.checked)
                    }
                  />
                  <span />
                </label>
              </div>
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-section-title">
              <div className="settings-section-icon security-icon">
                <FaShieldAlt />
              </div>

              <div>
                <h2>Security</h2>
                <p>Protect your account and personal information</p>
              </div>
            </div>

            <div className="settings-card security-card">
              <div className="settings-card-icon green-soft-icon">
                <FaLock />
              </div>

              <div className="settings-card-content">
                <strong>Password & Security</strong>
                <p>Manage your password and account security</p>
              </div>

              <button
                type="button"
                className="settings-outline-button"
                onClick={() => alert("Security settings will be added soon.")}
              >
                Manage
                <FaChevronRight />
              </button>
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-section-title">
              <div className="settings-section-icon region-icon">
                <FaGlobe />
              </div>

              <div>
                <h2>Currency & Region</h2>
                <p>Set your preferred currency and timezone</p>
              </div>
            </div>

            <div className="settings-card region-card">
              <div className="region-field">
                <div className="region-field-heading">
                  <div className="region-field-icon currency-field-icon">
                    <FaCoins />
                  </div>

                  <div>
                    <strong>Currency</strong>
                    <span>Used throughout your financial dashboard</span>
                  </div>
                </div>

                <CurrencyDropdown
                  value={currency}
                  onChange={setCurrency}
                />
              </div>

              <div className="settings-divider" />

              <div className="region-field">
                <div className="region-field-heading">
                  <div className="region-field-icon timezone-field-icon">
                    <FaClock />
                  </div>

                  <div>
                    <strong>Timezone</strong>
                    <span>Used for dates and times</span>
                  </div>
                </div>

                <TimezoneDropdown
                  value={timezone}
                  onChange={setTimezone}
                />
              </div>
            </div>
          </section>

          <section className="settings-section danger-section">
            <div className="settings-section-title">
              <div className="settings-section-icon danger-title-icon">
                <FaExclamationTriangle />
              </div>

              <div>
                <h2>Danger Zone</h2>
                <p>These actions are potentially destructive and should be used carefully.</p>
              </div>
            </div>

            <div className="danger-card">
              <div className="danger-item">
                <div className="danger-item-icon">
                  <FaTrash />
                </div>

                <div className="danger-item-content">
                  <strong>Delete All Transactions</strong>
                  <p>
                    Permanently delete all your transaction records. This action
                    cannot be undone.
                  </p>
                </div>

                <button
                  type="button"
                  className="danger-button"
                  onClick={() => setActiveModal("transactions")}
                >
                  Delete Transactions
                </button>
              </div>

              <div className="danger-divider" />

              <div className="danger-item">
                <div className="danger-item-icon reset-danger-icon">
                  <FaUndo />
                </div>

                <div className="danger-item-content">
                  <strong>Reset Settings</strong>
                  <p>Restore all application settings to their default values.</p>
                </div>

                <button
                  type="button"
                  className="warning-button"
                  onClick={() => setActiveModal("reset")}
                >
                  Reset Settings
                </button>
              </div>

              <div className="danger-divider" />

              <div className="danger-item">
                <div className="danger-item-icon account-danger-icon">
                  <FaUserTimes />
                </div>

                <div className="danger-item-content">
                  <strong>Delete Account</strong>
                  <p>
                    Permanently delete your account and all associated data.
                  </p>
                </div>

                <button
                  type="button"
                  className="danger-button"
                  onClick={() => setActiveModal("account")}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </section>

          <section className="settings-section about-section">
            <div className="settings-section-title">
              <div className="settings-section-icon about-icon">
                <FaInfoCircle />
              </div>

              <div>
                <h2>About</h2>
                <p>Information about SmaXTify</p>
              </div>
            </div>

            <div className="settings-card about-card">
              <div className="about-brand">
                <div className="about-logo">
                  <FaCoins />
                </div>

                <div>
                  <h3>SmaXTify</h3>
                  <p>Personal Finance Management</p>
                </div>

                <span className="version-badge">Version 1.0.0</span>
              </div>

              <div className="about-links">
                <button
                  type="button"
                  onClick={() => alert("Privacy Policy will be added soon.")}
                >
                  <span>
                    <FaLock />
                    Privacy Policy
                  </span>
                  <FaChevronRight />
                </button>

                <button
                  type="button"
                  onClick={() => alert("Terms & Services will be added soon.")}
                >
                  <span>
                    <FaFileContract />
                    Terms & Services
                  </span>
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {activeModal && (
        <div
          className="settings-modal-overlay"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="settings-confirm-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="settings-confirm-icon">
              {activeModal === "reset" ? <FaUndo /> : <FaTrash />}
            </div>

            <h3>
              {activeModal === "transactions"
                ? "Delete All Transactions?"
                : activeModal === "reset"
                ? "Reset Settings?"
                : "Delete Account?"}
            </h3>

            <p>
              {activeModal === "transactions"
                ? "All your transaction records will be permanently deleted. This action cannot be undone."
                : activeModal === "reset"
                ? "All application preferences will be restored to their default values."
                : "Your account and all associated data will be permanently deleted."}
            </p>

            <div className="settings-modal-actions">
              <button
                type="button"
                className="settings-modal-cancel"
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  activeModal === "reset"
                    ? "settings-modal-confirm reset-confirm"
                    : "settings-modal-confirm"
                }
                onClick={
                  activeModal === "transactions"
                    ? handleDeleteTransactions
                    : activeModal === "reset"
                    ? handleResetSettings
                    : handleDeleteAccount
                }
              >
                {activeModal === "reset" ? "Reset Settings" : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FaCogIcon() {
  return <span className="settings-cog">⚙</span>;
}

export default Settings;
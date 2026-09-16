import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const API_URL = "http://localhost:5000/api";

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
  {
    value: "Asia/Kolkata",
    label: "India Standard Time",
    short: "IST",
    region: "UTC +05:30",
  },
  {
    value: "UTC",
    label: "Coordinated Universal Time",
    short: "UTC",
    region: "UTC +00:00",
  },
  {
    value: "America/New_York",
    label: "Eastern Time",
    short: "ET",
    region: "UTC -05:00",
  },
  {
    value: "America/Chicago",
    label: "Central Time",
    short: "CT",
    region: "UTC -06:00",
  },
  {
    value: "America/Denver",
    label: "Mountain Time",
    short: "MT",
    region: "UTC -07:00",
  },
  {
    value: "America/Los_Angeles",
    label: "Pacific Time",
    short: "PT",
    region: "UTC -08:00",
  },
  {
    value: "Europe/London",
    label: "British Time",
    short: "GMT",
    region: "UTC +00:00",
  },
  {
    value: "Europe/Paris",
    label: "Central European Time",
    short: "CET",
    region: "UTC +01:00",
  },
  {
    value: "Asia/Dubai",
    label: "Gulf Standard Time",
    short: "GST",
    region: "UTC +04:00",
  },
  {
    value: "Asia/Singapore",
    label: "Singapore Time",
    short: "SGT",
    region: "UTC +08:00",
  },
  {
    value: "Asia/Tokyo",
    label: "Japan Standard Time",
    short: "JST",
    region: "UTC +09:00",
  },
  {
    value: "Australia/Sydney",
    label: "Australian Eastern Time",
    short: "AET",
    region: "UTC +10:00",
  },
];

function CurrencyDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const selected =
    currencies.find((currency) => currency.code === value) ||
    currencies[0];

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

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
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
          className={`settings-dropdown-arrow ${
            open ? "rotate" : ""
          }`}
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
    timezones.find((timezone) => timezone.value === value) ||
    timezones[0];

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
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
          className={`settings-dropdown-arrow ${
            open ? "rotate" : ""
          }`}
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
              <span>
                Choose the timezone used for dates and times
              </span>
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
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [theme, setTheme] = useState("light");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const [pushNotifications, setPushNotifications] =
    useState(true);

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [billReminders, setBillReminders] =
    useState(true);

  const [financialAlerts, setFinancialAlerts] =
    useState(true);

  const [activeModal, setActiveModal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileName, setProfileName] = useState("");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("smaxtify-token")
    );
  };

  const showMessage = (message) => {
    window.alert(message);
  };

  const applyTheme = (selectedTheme) => {
    let resolvedTheme = "light";

    if (selectedTheme === "dark") {
      resolvedTheme = "dark";
    } else if (selectedTheme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      resolvedTheme = prefersDark ? "dark" : "light";
    }

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

    window.dispatchEvent(
      new Event("smaxtify-theme-change")
    );
  };

  const savePreferences = async (updates) => {
    const token = getToken();

    if (!token) {
      showMessage("Please login again.");
      return false;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/settings/preferences`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update settings"
        );
      }

      return true;
    } catch (error) {
      console.error("Settings update error:", error);
      showMessage(
        error.message || "Failed to update settings."
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (value) => {
    const previousTheme = theme;

    setTheme(value);
    applyTheme(value);

    const success = await savePreferences({
      theme: value,
    });

    if (!success) {
      setTheme(previousTheme);
      applyTheme(previousTheme);
    }
  };

  const handleCurrencyChange = async (value) => {
    const previousCurrency = currency;

    setCurrency(value);
    localStorage.setItem(
      "smaxtify-currency",
      value
    );

    const success = await savePreferences({
      currency: value,
    });

    if (!success) {
      setCurrency(previousCurrency);
      localStorage.setItem(
        "smaxtify-currency",
        previousCurrency
      );
    }
  };

  const handleTimezoneChange = async (value) => {
    const previousTimezone = timezone;

    setTimezone(value);
    localStorage.setItem(
      "smaxtify-timezone",
      value
    );

    const success = await savePreferences({
      timezone: value,
    });

    if (!success) {
      setTimezone(previousTimezone);
      localStorage.setItem(
        "smaxtify-timezone",
        previousTimezone
      );
    }
  };

  const handleNotificationChange = async (
    key,
    value,
    setter
  ) => {
    const previousValue =
      key === "push"
        ? pushNotifications
        : key === "email"
        ? emailNotifications
        : key === "billReminders"
        ? billReminders
        : financialAlerts;

    setter(value);

    const success = await savePreferences({
      notifications: {
        [key]: value,
      },
    });

    if (!success) {
      setter(previousValue);
    }
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const loadSettings = async () => {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/settings`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load settings"
          );
        }

        const user = data.user || {};
        const settings = data.settings || {};

        setName(user.name || "");
        setEmail(user.email || "");
        setProfileName(user.name || "");

        const loadedTheme =
          settings.theme || "light";

        const loadedCurrency =
          settings.currency || "INR";

        const loadedTimezone =
          settings.timezone || "Asia/Kolkata";

        const notifications =
          settings.notifications || {};

        setTheme(loadedTheme);
        setCurrency(loadedCurrency);
        setTimezone(loadedTimezone);

        setPushNotifications(
          notifications.push !== undefined
            ? notifications.push
            : true
        );

        setEmailNotifications(
          notifications.email !== undefined
            ? notifications.email
            : true
        );

        setBillReminders(
          notifications.billReminders !== undefined
            ? notifications.billReminders
            : true
        );

        setFinancialAlerts(
          notifications.financialAlerts !== undefined
            ? notifications.financialAlerts
            : true
        );

        localStorage.setItem(
          "smaxtify-theme",
          loadedTheme
        );

        localStorage.setItem(
          "smaxtify-currency",
          loadedCurrency
        );

        localStorage.setItem(
          "smaxtify-timezone",
          loadedTimezone
        );

        localStorage.setItem(
          "smaxtify-push-notifications",
          String(
            notifications.push !== undefined
              ? notifications.push
              : true
          )
        );

        localStorage.setItem(
          "smaxtify-email-notifications",
          String(
            notifications.email !== undefined
              ? notifications.email
              : true
          )
        );

        applyTheme(loadedTheme);
      } catch (error) {
        console.error(
          "Load Settings Error:",
          error
        );

        const storedUser =
          localStorage.getItem("user");

        if (storedUser) {
          try {
            const parsedUser =
              JSON.parse(storedUser);

            setName(parsedUser.name || "");
            setEmail(parsedUser.email || "");
            setProfileName(
              parsedUser.name || ""
            );
          } catch {
            setName("");
            setEmail("");
          }
        }

        const storedTheme =
          localStorage.getItem(
            "smaxtify-theme"
          ) || "light";

        const storedCurrency =
          localStorage.getItem(
            "smaxtify-currency"
          ) || "INR";

        const storedTimezone =
          localStorage.getItem(
            "smaxtify-timezone"
          ) || "Asia/Kolkata";

        setTheme(storedTheme);
        setCurrency(storedCurrency);
        setTimezone(storedTimezone);

        setPushNotifications(
          localStorage.getItem(
            "smaxtify-push-notifications"
          ) !== "false"
        );

        setEmailNotifications(
          localStorage.getItem(
            "smaxtify-email-notifications"
          ) !== "false"
        );

        applyTheme(storedTheme);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleProfileUpdate = async () => {
    const trimmedName = profileName.trim();

    if (!trimmedName) {
      showMessage("Name is required.");
      return;
    }

    const token = getToken();

    if (!token) {
      showMessage("Please login again.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/settings/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: trimmedName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update profile"
        );
      }

      setName(data.user?.name || trimmedName);
      setProfileName(
        data.user?.name || trimmedName
      );

      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser =
            JSON.parse(storedUser);

          parsedUser.name =
            data.user?.name || trimmedName;

          localStorage.setItem(
            "user",
            JSON.stringify(parsedUser)
          );
        } catch {
          localStorage.setItem(
            "user",
            JSON.stringify({
              name: trimmedName,
              email,
            })
          );
        }
      }

      setActiveModal(null);
      showMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Profile Update Error:",
        error
      );

      showMessage(
        error.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      showMessage(
        "Please enter your current and new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      showMessage(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage(
        "New password and confirm password do not match."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      showMessage("Please login again.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/settings/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to change password"
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setActiveModal(null);

      showMessage(
        "Password changed successfully."
      );
    } catch (error) {
      console.error(
        "Password Change Error:",
        error
      );

      showMessage(
        error.message ||
          "Failed to change password."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    const token = getToken();

    if (!token) {
      showMessage("Please login again.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/settings/reset`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to reset settings"
        );
      }

      const settings = data.settings;

      const resetTheme =
        settings?.theme || "light";

      const resetCurrency =
        settings?.currency || "INR";

      const resetTimezone =
        settings?.timezone ||
        "Asia/Kolkata";

      const notifications =
        settings?.notifications || {};

      setTheme(resetTheme);
      setCurrency(resetCurrency);
      setTimezone(resetTimezone);

      setPushNotifications(
        notifications.push !== undefined
          ? notifications.push
          : true
      );

      setEmailNotifications(
        notifications.email !== undefined
          ? notifications.email
          : true
      );

      setBillReminders(
        notifications.billReminders !== undefined
          ? notifications.billReminders
          : true
      );

      setFinancialAlerts(
        notifications.financialAlerts !== undefined
          ? notifications.financialAlerts
          : true
      );

      localStorage.setItem(
        "smaxtify-theme",
        resetTheme
      );

      localStorage.setItem(
        "smaxtify-currency",
        resetCurrency
      );

      localStorage.setItem(
        "smaxtify-timezone",
        resetTimezone
      );

      localStorage.setItem(
        "smaxtify-push-notifications",
        String(
          notifications.push !== undefined
            ? notifications.push
            : true
        )
      );

      localStorage.setItem(
        "smaxtify-email-notifications",
        String(
          notifications.email !== undefined
            ? notifications.email
            : true
        )
      );

      applyTheme(resetTheme);

      setActiveModal(null);

      showMessage(
        "Settings reset successfully."
      );
    } catch (error) {
      console.error(
        "Reset Settings Error:",
        error
      );

      showMessage(
        error.message ||
          "Failed to reset settings."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTransactions = async () => {
    const token = getToken();

    if (!token) {
      showMessage("Please login again.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/settings/transactions`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete transactions"
        );
      }

      setActiveModal(null);

      showMessage(
        `${data.deletedCount || 0} transactions deleted successfully.`
      );
    } catch (error) {
      console.error(
        "Delete Transactions Error:",
        error
      );

      showMessage(
        error.message ||
          "Failed to delete transactions."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const token = getToken();

    if (!token) {
      showMessage("Please login again.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/settings/account`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete account"
        );
      }

      localStorage.clear();

      setActiveModal(null);

      showMessage(
        "Account deleted successfully."
      );

      navigate("/");
    } catch (error) {
      console.error(
        "Delete Account Error:",
        error
      );

      showMessage(
        error.message ||
          "Failed to delete account."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
                <p>
                  Manage your preferences, notifications
                  and account settings
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

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
              <p>
                Manage your preferences, notifications
                and account settings
              </p>
            </div>
          </section>

          <section className="settings-section settings-profile">
            <div className="settings-section-title">
              <div className="settings-section-icon profile-icon">
                <FaUser />
              </div>

              <div>
                <h2>Profile</h2>
                <p>
                  Manage your personal information
                </p>
              </div>
            </div>

            <div className="settings-card profile-card">
              <div className="settings-card-icon blue-icon">
                <FaUser />
              </div>

              <div className="settings-card-content">
                <span className="settings-card-label">
                  Profile Information
                </span>

                <strong>
                  {name || "Personal Details"}
                </strong>

                <p>
                  {email
                    ? email
                    : "Update your name and personal details"}
                </p>
              </div>

              <button
                type="button"
                className="settings-outline-button"
                onClick={() => {
                  setProfileName(name);
                  setActiveModal("profile");
                }}
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
                <p>
                  Customize how SmaXTify looks
                </p>
              </div>
            </div>

            <div className="settings-card appearance-card">
              <div className="settings-card-heading">
                <div className="settings-card-icon purple-soft-icon">
                  <FaPalette />
                </div>

                <div>
                  <strong>Theme</strong>
                  <p>
                    Choose your preferred application
                    theme
                  </p>
                </div>
              </div>

              <div className="theme-selector">
                <button
                  type="button"
                  className={`theme-option ${
                    theme === "light" ? "active" : ""
                  }`}
                  onClick={() =>
                    handleThemeChange("light")
                  }
                  disabled={saving}
                >
                  <span className="theme-option-icon light-theme-icon">
                    <FaSun />
                  </span>

                  <span className="theme-option-text">
                    <strong>Light</strong>
                    <small>
                      Bright and clean
                    </small>
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
                  onClick={() =>
                    handleThemeChange("dark")
                  }
                  disabled={saving}
                >
                  <span className="theme-option-icon dark-theme-icon">
                    <FaMoon />
                  </span>

                  <span className="theme-option-text">
                    <strong>Dark</strong>
                    <small>
                      Easy on the eyes
                    </small>
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
                  onClick={() =>
                    handleThemeChange("system")
                  }
                  disabled={saving}
                >
                  <span className="theme-option-icon system-theme-icon">
                    <FaDesktop />
                  </span>

                  <span className="theme-option-text">
                    <strong>System</strong>
                    <small>
                      Follow device theme
                    </small>
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
                <p>
                  Control your notification preferences
                </p>
              </div>
            </div>

            <div className="settings-card">
              <div className="notification-row">
                <div className="settings-card-icon blue-soft-icon">
                  <FaBell />
                </div>

                <div className="settings-card-content">
                  <strong>
                    Push Notifications
                  </strong>

                  <p>
                    Receive important updates and
                    reminders
                  </p>
                </div>

                <label className="settings-switch">
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(event) =>
                      handleNotificationChange(
                        "push",
                        event.target.checked,
                        setPushNotifications
                      )
                    }
                    disabled={saving}
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
                  <strong>
                    Email Notifications
                  </strong>

                  <p>
                    Receive account updates through
                    email
                  </p>
                </div>

                <label className="settings-switch">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(event) =>
                      handleNotificationChange(
                        "email",
                        event.target.checked,
                        setEmailNotifications
                      )
                    }
                    disabled={saving}
                  />
                  <span />
                </label>
              </div>

              <div className="settings-divider" />

              <div className="notification-row">
                <div className="settings-card-icon blue-soft-icon">
                  <FaClock />
                </div>

                <div className="settings-card-content">
                  <strong>
                    Bill Reminders
                  </strong>

                  <p>
                    Receive reminders about upcoming
                    bills and payments
                  </p>
                </div>

                <label className="settings-switch">
                  <input
                    type="checkbox"
                    checked={billReminders}
                    onChange={(event) =>
                      handleNotificationChange(
                        "billReminders",
                        event.target.checked,
                        setBillReminders
                      )
                    }
                    disabled={saving}
                  />
                  <span />
                </label>
              </div>

              <div className="settings-divider" />

              <div className="notification-row">
                <div className="settings-card-icon purple-soft-icon">
                  <FaCoins />
                </div>

                <div className="settings-card-content">
                  <strong>
                    Financial Alerts
                  </strong>

                  <p>
                    Receive important financial
                    activity alerts
                  </p>
                </div>

                <label className="settings-switch">
                  <input
                    type="checkbox"
                    checked={financialAlerts}
                    onChange={(event) =>
                      handleNotificationChange(
                        "financialAlerts",
                        event.target.checked,
                        setFinancialAlerts
                      )
                    }
                    disabled={saving}
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
                <p>
                  Protect your account and personal
                  information
                </p>
              </div>
            </div>

            <div className="settings-card security-card">
              <div className="settings-card-icon green-soft-icon">
                <FaLock />
              </div>

              <div className="settings-card-content">
                <strong>
                  Password & Security
                </strong>

                <p>
                  Manage your password and account
                  security
                </p>
              </div>

              <button
                type="button"
                className="settings-outline-button"
                onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setActiveModal("security");
                }}
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
                <p>
                  Set your preferred currency and
                  timezone
                </p>
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
                    <span>
                      Used throughout your financial
                      dashboard
                    </span>
                  </div>
                </div>

                <CurrencyDropdown
                  value={currency}
                  onChange={handleCurrencyChange}
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
                    <span>
                      Used for dates and times
                    </span>
                  </div>
                </div>

                <TimezoneDropdown
                  value={timezone}
                  onChange={handleTimezoneChange}
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
                <p>
                  These actions are potentially
                  destructive and should be used
                  carefully.
                </p>
              </div>
            </div>

            <div className="danger-card">
              <div className="danger-item">
                <div className="danger-item-icon">
                  <FaTrash />
                </div>

                <div className="danger-item-content">
                  <strong>
                    Delete All Transactions
                  </strong>

                  <p>
                    Permanently delete all your
                    transaction records. This action
                    cannot be undone.
                  </p>
                </div>

                <button
                  type="button"
                  className="danger-button"
                  onClick={() =>
                    setActiveModal("transactions")
                  }
                  disabled={saving}
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
                  <strong>
                    Reset Settings
                  </strong>

                  <p>
                    Restore all application settings
                    to their default values.
                  </p>
                </div>

                <button
                  type="button"
                  className="warning-button"
                  onClick={() =>
                    setActiveModal("reset")
                  }
                  disabled={saving}
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
                  <strong>
                    Delete Account
                  </strong>

                  <p>
                    Permanently delete your account
                    and all associated data.
                  </p>
                </div>

                <button
                  type="button"
                  className="danger-button"
                  onClick={() =>
                    setActiveModal("account")
                  }
                  disabled={saving}
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
                <p>
                  Information about SmaXTify
                </p>
              </div>
            </div>

            <div className="settings-card about-card">
              <div className="about-brand">
                <div className="about-logo">
                  <FaCoins />
                </div>

                <div>
                  <h3>SmaXTify</h3>
                  <p>
                    Personal Finance Management
                  </p>
                </div>

                <span className="version-badge">
                  Version 1.0.0
                </span>
              </div>

              <div className="about-links">
                <button
                  type="button"
                  onClick={() =>
                    showMessage(
                      "Privacy Policy will be added soon."
                    )
                  }
                >
                  <span>
                    <FaLock />
                    Privacy Policy
                  </span>

                  <FaChevronRight />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    showMessage(
                      "Terms & Services will be added soon."
                    )
                  }
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
          onClick={() => {
            if (!saving) {
              setActiveModal(null);
            }
          }}
        >
          <div
            className="settings-confirm-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {activeModal === "profile" && (
              <>
                <div className="settings-confirm-icon">
                  <FaUser />
                </div>

                <h3>
                  Personal Details
                </h3>

                <p>
                  Update your name associated with
                  your SmaXTify account.
                </p>

                <div
                  style={{
                    width: "100%",
                    marginTop: "16px",
                  }}
                >
                  <input
                    type="text"
                    value={profileName}
                    onChange={(event) =>
                      setProfileName(
                        event.target.value
                      )
                    }
                    placeholder="Enter your name"
                    disabled={saving}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px 14px",
                      border: "1px solid #dbe3f0",
                      borderRadius: "12px",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div className="settings-modal-actions">
                  <button
                    type="button"
                    className="settings-modal-cancel"
                    onClick={() =>
                      setActiveModal(null)
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="settings-modal-confirm reset-confirm"
                    onClick={handleProfileUpdate}
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </>
            )}

            {activeModal === "security" && (
              <>
                <div className="settings-confirm-icon">
                  <FaLock />
                </div>

                <h3>
                  Password & Security
                </h3>

                <p>
                  Change your SmaXTify account
                  password.
                </p>

                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginTop: "16px",
                  }}
                >
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    placeholder="Current password"
                    disabled={saving}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px 14px",
                      border: "1px solid #dbe3f0",
                      borderRadius: "12px",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    placeholder="New password"
                    disabled={saving}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px 14px",
                      border: "1px solid #dbe3f0",
                      borderRadius: "12px",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Confirm new password"
                    disabled={saving}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px 14px",
                      border: "1px solid #dbe3f0",
                      borderRadius: "12px",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div className="settings-modal-actions">
                  <button
                    type="button"
                    className="settings-modal-cancel"
                    onClick={() =>
                      setActiveModal(null)
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="settings-modal-confirm reset-confirm"
                    onClick={
                      handlePasswordChange
                    }
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Change Password"}
                  </button>
                </div>
              </>
            )}

            {activeModal === "transactions" && (
              <>
                <div className="settings-confirm-icon">
                  <FaTrash />
                </div>

                <h3>
                  Delete All Transactions?
                </h3>

                <p>
                  All your transaction records will
                  be permanently deleted. Your account
                  will remain active, but this action
                  cannot be undone.
                </p>

                <div className="settings-modal-actions">
                  <button
                    type="button"
                    className="settings-modal-cancel"
                    onClick={() =>
                      setActiveModal(null)
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="settings-modal-confirm"
                    onClick={
                      handleDeleteTransactions
                    }
                    disabled={saving}
                  >
                    {saving
                      ? "Deleting..."
                      : "Delete Transactions"}
                  </button>
                </div>
              </>
            )}

            {activeModal === "reset" && (
              <>
                <div className="settings-confirm-icon">
                  <FaUndo />
                </div>

                <h3>
                  Reset Settings?
                </h3>

                <p>
                  All application preferences will
                  be restored to their default values.
                  Your transactions and account will
                  not be deleted.
                </p>

                <div className="settings-modal-actions">
                  <button
                    type="button"
                    className="settings-modal-cancel"
                    onClick={() =>
                      setActiveModal(null)
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="settings-modal-confirm reset-confirm"
                    onClick={
                      handleResetSettings
                    }
                    disabled={saving}
                  >
                    {saving
                      ? "Resetting..."
                      : "Reset Settings"}
                  </button>
                </div>
              </>
            )}

            {activeModal === "account" && (
              <>
                <div className="settings-confirm-icon">
                  <FaUserTimes />
                </div>

                <h3>
                  Delete Account?
                </h3>

                <p>
                  Your account, transactions,
                  accounts and associated data will be
                  permanently deleted. This action
                  cannot be undone.
                </p>

                <div className="settings-modal-actions">
                  <button
                    type="button"
                    className="settings-modal-cancel"
                    onClick={() =>
                      setActiveModal(null)
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="settings-modal-confirm"
                    onClick={
                      handleDeleteAccount
                    }
                    disabled={saving}
                  >
                    {saving
                      ? "Deleting..."
                      : "Delete Account"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FaCogIcon() {
  return (
    <span className="settings-cog">
      ⚙
    </span>
  );
}

export default Settings;
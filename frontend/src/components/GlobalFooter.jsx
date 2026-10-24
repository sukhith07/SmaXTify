import { Link, useLocation } from "react-router-dom";
import {
  FaWallet,
  FaArrowRight,
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaEnvelope,
  FaLifeRing,
  FaUserCircle,
  FaCog,
  FaBell,
  FaShieldAlt,
  FaHome,
  FaReceipt,
  FaUniversity,
  FaCreditCard,
  FaBullseye,
  FaChartBar,
  FaExchangeAlt,
  FaCalendarAlt,
  FaRobot,
} from "react-icons/fa";
import "./styles/GlobalFooter.css";

const SUPPORT_EMAIL = "sukhithgowda07@gmail.com";

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/sukhith07/SmaXTify",
    Icon: FaGithub,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/sukhith-k-v",
    Icon: FaLinkedin,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/_sukhith._.2226?obrf=bGNuajh3eTFvMWg2",
    Icon: FaInstagram,
  },
];

const footerGroups = [
  {
    title: "Finance",
    links: [
      { label: "Dashboard", to: "/dashboard", Icon: FaHome },
      { label: "Accounts", to: "/accounts", Icon: FaUniversity },
      { label: "Budget Planner", to: "/budget", Icon: FaWallet },
      { label: "Savings Goals", to: "/goals", Icon: FaBullseye },
      { label: "Reports", to: "/reports", Icon: FaChartBar },
    ],
  },
  {
    title: "Tools",
    links: [
      {
        label: "Currency Converter",
        to: "/currency",
        Icon: FaExchangeAlt,
      },
      {
        label: "Subscriptions",
        to: "/subscriptions",
        Icon: FaCreditCard,
      },
      {
        label: "AI Receipt Scanner",
        to: "/ai-scan",
        Icon: FaRobot,
      },
      {
        label: "Calendar",
        to: "/calendar",
        Icon: FaCalendarAlt,
      },
    ],
  },
];

const publicAccountLinks = [
  { label: "Settings", to: "/settings" },
  { label: "Notifications", to: "/notifications" },
  { label: "Log In", to: "/login" },
  { label: "Create Account", to: "/register" },
];

const authenticatedAccountLinks = [
  {
    label: "My Profile",
    to: "/settings",
    Icon: FaUserCircle,
  },
  {
    label: "Settings",
    to: "/settings",
    Icon: FaCog,
  },
  {
    label: "Notifications",
    to: "/notifications",
    Icon: FaBell,
  },
  {
    label: "Account Security",
    to: "/settings",
    Icon: FaShieldAlt,
  },
];

function GlobalFooter() {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const isLandingPage = location.pathname === "/";

  const isLegalPage = [
    "/privacy-policy",
    "/terms-of-service",
  ].includes(location.pathname);

  const showPublicAccountLinks = isLandingPage || isLegalPage;

  const accountLinks = showPublicAccountLinks
    ? publicAccountLinks
    : authenticatedAccountLinks;

  return (
    <footer
      className={`global-footer ${
        isLandingPage ? "global-footer--landing" : ""
      }`}
    >
      <div className="global-footer-container">
        <div className="global-footer-main">
          <section className="global-footer-brand">
            <Link
              to="/"
              className="global-footer-logo"
              aria-label="SmaXTify home"
            >
              <span className="global-footer-logo-icon">
                <FaWallet aria-hidden="true" />
              </span>

              <span className="global-footer-brand-name">
                SmaXTify
              </span>
            </Link>

            <span className="global-footer-brand-label">
              SMART EXPENSE TRACKER
            </span>

            <p className="global-footer-description">
              Take control of your finances with smarter
              expense tracking, thoughtful budgeting, and
              clearer financial insights.
            </p>

            <Link
              to="/dashboard"
              className="global-footer-cta"
            >
              {isLandingPage
                ? "Explore Dashboard"
                : "Go to Dashboard"}
              <FaArrowRight aria-hidden="true" />
            </Link>

            <div className="global-footer-socials">
              <h2 className="global-footer-social-heading">
                Connect with us
              </h2>

              <div className="global-footer-social-list">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="global-footer-social-link"
                    aria-label={`Visit SmaXTify on ${label}`}
                    title={label}
                  >
                    <Icon aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </section>

          {footerGroups.map((group) => (
            <nav
              key={group.title}
              className="global-footer-column"
              aria-label={`${group.title} links`}
            >
              <h2>{group.title}</h2>

              <ul>
                {group.links.map(({ label, to, Icon }) => (
                  <li key={to}>
                    <Link to={to}>
                      <Icon
                        aria-hidden="true"
                        style={{
                          marginRight: "8px",
                          verticalAlign: "-2px",
                          flexShrink: 0,
                        }}
                      />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav
            className="global-footer-column"
            aria-label="Account links"
          >
            <h2>Account</h2>

            <ul>
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to}>
                    {link.Icon && (
                      <link.Icon
                        aria-hidden="true"
                        style={{
                          marginRight: "8px",
                          verticalAlign: "-2px",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section className="global-footer-column global-footer-contact">
            <h2>Contact &amp; Support</h2>

            <p className="global-footer-contact-copy">
              Have a question about SmaXTify? Send us an
              email and we'll be happy to hear from you.
            </p>

            <a
              className="global-footer-contact-link"
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                "SmaXTify Support"
              )}`}
            >
              <FaEnvelope aria-hidden="true" />
              <span>{SUPPORT_EMAIL}</span>
            </a>

            <span className="global-footer-contact-note">
              <FaLifeRing aria-hidden="true" />
              <span>We're here to help.</span>
            </span>
          </section>
        </div>

        <div className="global-footer-bottom">
          <p className="global-footer-copyright">
            © {currentYear} SmaXTify. All rights reserved.
          </p>

          <nav
            className="global-footer-legal-links"
            aria-label="Legal links"
          >
            <Link to="/privacy-policy">Privacy Policy</Link>
            <span aria-hidden="true">|</span>
            <Link to="/terms-of-service">Terms of Service</Link>
          </nav>

          <p className="global-footer-tagline">
            Spend smarter | Save better.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default GlobalFooter;
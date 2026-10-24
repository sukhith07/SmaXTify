import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaArrowLeft,
  FaEnvelope,
} from "react-icons/fa";
import "../components/styles/LegalPages.css";

const SUPPORT_EMAIL = "sukhithgowda07@gmail.com";

function PrivacyPolicy() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(
    () =>
      Boolean(
        localStorage.getItem("token") ||
          localStorage.getItem("smaxtify-token")
      )
  );

  const validReturnPaths = ["/settings", "/", "/dashboard"];

  const requestedReturnPath = location.state?.from;

  const returnPath = validReturnPaths.includes(requestedReturnPath)
    ? requestedReturnPath
    : isAuthenticated
      ? "/dashboard"
      : "/";

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const syncAuthentication = () => {
      setIsAuthenticated(
        Boolean(
          localStorage.getItem("token") ||
            localStorage.getItem("smaxtify-token")
        )
      );
    };

    window.addEventListener("storage", syncAuthentication);
    window.addEventListener("smaxtify-auth-change", syncAuthentication);

    return () => {
      window.removeEventListener("storage", syncAuthentication);
      window.removeEventListener("smaxtify-auth-change", syncAuthentication);
    };
  }, []);

  const handleBack = (event) => {
    event.preventDefault();
    navigate(returnPath);
  };

  return (
    <main
      className={`legal-page legal-page--monochrome ${
        isAuthenticated
          ? "legal-page--authenticated"
          : "legal-page--public"
      }`}
    >
      <div className="legal-container">
        <Link
          to={returnPath}
          className="legal-back-link"
          onClick={handleBack}
        >
          <FaArrowLeft aria-hidden="true" />
          Back to SmaXTify
        </Link>

        <header className="legal-header">
          <span className="legal-icon">
            <FaShieldAlt aria-hidden="true" />
          </span>

          <p className="legal-eyebrow">SMAXTIFY</p>
          <h1>Privacy Policy</h1>

          <p className="legal-intro">
            Learn how SmaXTify may collect, use, and protect
            information when you use the application.
          </p>

          <p className="legal-updated">
            Last updated: October 18, 2026
          </p>
        </header>

        <article className="legal-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              SmaXTify is a personal finance management
              application designed to help users organize
              income, expenses, budgets, savings goals,
              subscriptions, reminders, and financial reports.
            </p>
            <p>
              This policy describes the categories of
              information the application may process.
              Actual practices depend on the features you
              use and the services configured in your
              deployment.
            </p>
          </section>

          <section>
            <h2>2. Information We May Collect</h2>
            <p>
              Depending on the features you use, SmaXTify
              may process:
            </p>
            <ul>
              <li>
                <strong>Account information:</strong> name,
                email address, profile picture, and
                authentication-related identifiers.
              </li>
              <li>
                <strong>Financial information:</strong>{" "}
                income, expenses, transaction descriptions,
                account records, budgets, and savings goals.
              </li>
              <li>
                <strong>Tracking information:</strong>{" "}
                subscription details, bill reminders, and
                related dates or amounts.
              </li>
              <li>
                <strong>Preferences:</strong> theme,
                notification settings, and other application
                preferences.
              </li>
              <li>
                <strong>Messages and uploads:</strong> AI
                chat messages, receipt images, and other
                information submitted through supported
                features.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. How Information Is Used</h2>
            <p>Information may be used to:</p>
            <ul>
              <li>Create and manage your account.</li>
              <li>Organize financial activity and records.</li>
              <li>Calculate budgets, summaries, and reports.</li>
              <li>Track subscriptions, goals, and reminders.</li>
              <li>
                Provide AI-assisted categorization,
                receipt extraction, and financial insights.
              </li>
              <li>Save preferences and provide app features.</li>
              <li>
                Troubleshoot issues and maintain application
                security and reliability.
              </li>
            </ul>
          </section>

          <section>
            <h2>4. Authentication and Profile Information</h2>
            <p>
              SmaXTify may support email-based accounts or
              third-party sign-in, depending on the
              configured authentication options. Profile
              details may be used to identify your account
              and display your profile in the application.
            </p>
            <p>
              Third-party authentication providers may
              process information under their own
              applicable privacy policies.
            </p>
          </section>

          <section>
            <h2>5. AI Features and Receipt Scanning</h2>
            <p>
              When you use AI features, submitted information
              may be processed to generate responses,
              categorize transactions, summarize reports,
              or extract details from receipt images.
            </p>
            <p>
              If an external AI provider is configured,
              relevant prompts, text, or images may be sent
              to that provider to deliver the requested
              feature. The provider's terms and privacy
              practices may also apply.
            </p>
            <p>
              Avoid submitting passwords, authentication
              secrets, or unnecessary sensitive information
              through AI features.
            </p>
          </section>

          <section>
            <h2>6. Storage and Security</h2>
            <p>
              SmaXTify may store account and application
              information in its configured database and
              supporting services. Appropriate technical
              and organizational safeguards should be used
              to protect information against unauthorized
              access, alteration, or disclosure.
            </p>
            <p>
              No electronic storage or transmission method
              can be guaranteed to be completely secure.
              Protect your account credentials and use
              trusted devices when accessing the application.
            </p>
          </section>

          <section>
            <h2>7. Sharing of Information</h2>
            <p>
              Information may be processed by service
              providers needed to operate features you
              request, such as authentication, database
              hosting, email delivery, or AI processing.
            </p>
            <p>
              Information may also be disclosed when
              required by applicable law or when necessary
              to address security issues or protect legal
              rights. Actual providers and disclosures
              depend on the application's configuration
              and applicable requirements.
            </p>
          </section>

          <section>
            <h2>8. Cookies and Local Storage</h2>
            <p>
              The application may use browser storage or
              similar technologies to retain preferences,
              such as the selected theme, or to support
              authentication and application functionality.
              The exact data stored depends on the
              implementation.
            </p>
            <p>
              Clearing browser storage may affect saved
              preferences or require you to sign in again.
            </p>
          </section>

          <section>
            <h2>9. Your Choices and Data Requests</h2>
            <p>
              Depending on available features and applicable
              law, you may be able to review or update
              profile information, change preferences, and
              request access to, correction of, or deletion
              of personal information.
            </p>
            <p>
              Contact the service owner for assistance
              with privacy-related requests. Some information
              may need to be retained where legally required.
            </p>
          </section>

          <section>
            <h2>10. Children's Privacy</h2>
            <p>
              SmaXTify is not intended to collect personal
              information from children in violation of
              applicable privacy laws. If you believe a
              child has provided personal information
              inappropriately, contact the service owner.
            </p>
          </section>

          <section>
            <h2>11. Third-Party Services and Links</h2>
            <p>
              Certain features may depend on external
              services or link to third-party websites.
              SmaXTify does not control the independent
              privacy practices of those services.
              Review their policies before sharing
              information with them.
            </p>
          </section>

          <section>
            <h2>12. Changes to This Policy</h2>
            <p>
              This policy may be updated when application
              features, service providers, or applicable
              requirements change. The latest version and
              its revision date will be displayed on this page.
            </p>
          </section>

          <section className="legal-contact-card">
            <FaEnvelope aria-hidden="true" />
            <div>
              <h2>Privacy Questions?</h2>
              <p>
                Contact us at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </div>
          </section>
        </article>

        <nav className="legal-bottom-links" aria-label="Legal pages">
          <Link
            to="/terms-of-service"
            state={{ from: returnPath }}
          >
            Terms of Service
          </Link>
          <Link to={returnPath}>SmaXTify Home</Link>
        </nav>
      </div>
    </main>
  );
}

export default PrivacyPolicy;
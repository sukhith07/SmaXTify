import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  FaWallet,
  FaRobot,
  FaChartPie,
  FaChartLine,
  FaShieldAlt,
  FaReceipt,
  FaArrowRight,
  FaArrowUp,
  FaBrain,
  FaMoneyBillWave,
  FaPiggyBank,
} from "react-icons/fa";

import "../components/styles/Landing.css";

export default function Landing() {
  const { t, i18n } = useTranslation();

  const [showScroll, setShowScroll] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [showLanguages, setShowLanguages] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef(null);

  const languageOptions = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "te", name: "తెలుగు", flag: "🇮🇳" },
  ];

  const getLanguage = (code) =>
    languageOptions.find(
      (language) =>
        language.code === (code || "en").split("-")[0]
    ) || languageOptions[0];

  const [selectedLanguage, setSelectedLanguage] = useState(() =>
    getLanguage(i18n.resolvedLanguage || i18n.language)
  );

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setSelectedLanguage(
      getLanguage(i18n.resolvedLanguage || i18n.language)
    );
  }, [i18n.resolvedLanguage, i18n.language]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language.code);
    setShowLanguages(false);
  };

  const handlePlayDemo = async () => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = false;
    video.volume = 1;

    try {
      await video.play();
    } catch (error) {
      console.error("Unable to play the SmaXTify demo:", error);
      setIsPlaying(false);
    }
  };

  const features = [
    {
      icon: <FaRobot />,
      title: t("featureCard1Title"),
      desc: t("featureCard1Desc"),
    },
    {
      icon: <FaReceipt />,
      title: t("featureCard2Title"),
      desc: t("featureCard2Desc"),
    },
    {
      icon: <FaChartPie />,
      title: t("featureCard3Title"),
      desc: t("featureCard3Desc"),
    },
    {
      icon: <FaBrain />,
      title: t("featureCard4Title"),
      desc: t("featureCard4Desc"),
    },
    {
      icon: <FaWallet />,
      title: t("featureCard5Title"),
      desc: t("featureCard5Desc"),
    },
    {
      icon: <FaShieldAlt />,
      title: t("featureCard6Title"),
      desc: t("featureCard6Desc"),
    },
  ];

  const stats = [
    { number: "10K+", label: t("transactions") },
    { number: "99.9%", label: t("accuracy") },
    { number: "24×7", label: t("aiSupport") },
  ];

  const faqs = [
    { question: t("faq1Question"), answer: t("faq1Answer"), icon: "💰" },
    { question: t("faq2Question"), answer: t("faq2Answer"), icon: "🔒" },
    { question: t("faq3Question"), answer: t("faq3Answer"), icon: "📊" },
    { question: t("faq4Question"), answer: t("faq4Answer"), icon: "🤖" },
    { question: t("faq5Question"), answer: t("faq5Answer"), icon: "📱" },
    { question: t("faq6Question"), answer: t("faq6Answer"), icon: "💳" },
    { question: t("faq7Question"), answer: t("faq7Answer"), icon: "🧾" },
    { question: t("faq8Question"), answer: t("faq8Answer"), icon: "📈" },
    { question: t("faq9Question"), answer: t("faq9Answer"), icon: "☁️" },
    { question: t("faq10Question"), answer: t("faq10Answer"), icon: "🌐" },
  ];

  return (
    <div className="landing-page">
      {/* Background */}
      <div className="bg-circle circle1"></div>
      <div className="bg-circle circle2"></div>
      <div className="bg-circle circle3"></div>

      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="logo-area">
          <div className="logo-circle">
            <FaWallet />
          </div>

          <div>
            <h2>SmaXTify</h2>
            <span>Smart Expense Tracker</span>
          </div>
        </div>

        <div className="nav-links">
          <a href="#features" className="nav-pill">
            {t("Features")}
          </a>

          <a href="#how" className="nav-pill">
            {t("How It Works")}
          </a>

          <a href="#ai" className="nav-pill">
            {t("SmaXTify.AI")}
          </a>

          <a href="#faq" className="nav-pill">
            {t("FAQ")}
          </a>

          <a href="#contact" className="nav-pill">
            {t("Contact")}
          </a>

          <div className="language-menu">
            <button
              type="button"
              className="language-btn"
              onClick={() =>
                setShowLanguages((previous) => !previous)
              }
              aria-expanded={showLanguages}
              aria-haspopup="true"
            >
              {selectedLanguage.flag} {selectedLanguage.name} ▼
            </button>

            {showLanguages && (
              <div className="language-dropdown">
                {languageOptions.map((language) => (
                  <button
                    type="button"
                    key={language.code}
                    onClick={() => handleLanguageChange(language)}
                  >
                    {language.flag} {language.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-left">
          <div className="badge">{t("heroBadge")}</div>

          <h1>
            {t("heroTitle1")}
            <br />
            <span>{t("heroTitle2")}</span>
          </h1>

          <p>{t("heroDescription")}</p>

          <div className="hero-buttons">
            <Link to="/register" className="primary-btn">
              {t("getStarted")}
              <FaArrowRight />
            </Link>

            <Link to="/login" className="secondary-btn">
              {t("login")}
            </Link>
          </div>

          <div className="hero-stats">
            {stats.map((item, index) => (
              <div key={index} className="stat-card">
                <h3>{item.number}</h3>
                <p>{item.label}</p>
              </div>
            ))}
          </div>

          {/* SmaXTify Demo Video */}
          <div className="hero-demo">
            <div className="hero-demo-header">
              <span className="hero-demo-tag">SMAXTIFY DEMO</span>
              <span className="hero-demo-duration">10 seconds</span>
            </div>

            <div className="hero-demo-player">
              <video
                ref={videoRef}
                className="hero-demo-video"
                src="/videos/smaxtify-demo.mp4"
                controls
                playsInline
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onEnded={() => setIsPlaying(false)}
              >
                Your browser does not support HTML video.
              </video>

              {!isPlaying && (
                <button
                  type="button"
                  className="hero-demo-play"
                  onClick={handlePlayDemo}
                  aria-label="Play SmaXTify demo with sound"
                >
                  <span className="hero-demo-play-icon">▶</span>
                  <span className="hero-demo-play-label"></span>
                  <span className="hero-demo-sound"></span>
                </button>
              )}
            </div>

            <p className="hero-demo-caption">
              {t("heroDemoCaption", {
                defaultValue:
                  "See how SmaXTify makes managing your finances smarter.",
              })}
            </p>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="hero-right">
          <div className="dashboard-preview">
            <div className="preview-header">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="preview-content">
              <div className="balance-card">
                <small>{t("totalBalance")}</small>
                <h2>₹84,250</h2>

                <p className="balance-growth">
                  ▲ +12.5% {t("thisMonth")}
                </p>
              </div>

              <div className="summary-grid">
                <div className="summary-box income">
                  <FaMoneyBillWave />
                  <div>
                    <small>{t("income")}</small>
                    <h4>₹50,000</h4>
                  </div>
                </div>

                <div className="summary-box expense">
                  <FaWallet />
                  <div>
                    <small>{t("expenses")}</small>
                    <h4>₹18,700</h4>
                  </div>
                </div>

                <div className="summary-box saving">
                  <FaPiggyBank />
                  <div>
                    <small>{t("savings")}</small>
                    <h4>₹31,300</h4>
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>{t("monthlyAnalytics")}</h3>
                  <FaChartLine />
                </div>

                <div className="fake-chart">
                  <div className="bar b1"></div>
                  <div className="bar b2"></div>
                  <div className="bar b3"></div>
                  <div className="bar b4"></div>
                  <div className="bar b5"></div>
                  <div className="bar b6"></div>
                </div>
              </div>

              <div className="recent-transactions">
                <h3>{t("recentTransactions")}</h3>

                <div className="transaction">
                  <span>{t("foodDelivery")}</span>
                  <strong>- ₹450</strong>
                </div>

                <div className="transaction">
                  <span>{t("electricityBill")}</span>
                  <strong>- ₹2,100</strong>
                </div>

                <div className="transaction">
                  <span>{t("monthlySalary")}</span>
                  <strong style={{ color: "#22c55e" }}>
                    + ₹50,000
                  </strong>
                </div>

                <div className="transaction">
                  <span>{t("internetRecharge")}</span>
                  <strong>- ₹999</strong>
                </div>

                <div className="transaction">
                  <span>{t("groceryShopping")}</span>
                  <strong>- ₹3,250</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="section-title">
          <span className="section-tag">{t("whyChoose")}</span>

          <h2>
            {t("featuresHeading1")}
            <span> {t("featuresHeading2")}</span>
          </h2>

          <p>{t("featuresDescription")}</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="how-section">
        <div className="section-title">
          <span className="section-tag">{t("howTag")}</span>

          <h2>
            {t("howTitle1")}
            <span> {t("howTitle2")}</span>
          </h2>

          <p>{t("howDescription")}</p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>{t("step1Title")}</h3>
            <p>{t("step1Desc")}</p>
          </div>

          <div className="step-arrow">
            <FaArrowRight />
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>{t("step2Title")}</h3>
            <p>{t("step2Desc")}</p>
          </div>

          <div className="step-arrow">
            <FaArrowRight />
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>{t("step3Title")}</h3>
            <p>{t("step3Desc")}</p>
          </div>

          <div className="step-arrow">
            <FaArrowRight />
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <h3>{t("step4Title")}</h3>
            <p>{t("step4Desc")}</p>
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" className="ai-section">
        <div className="ai-left">
          <span className="section-tag">{t("aiTag")}</span>

          <h2>
            {t("aiTitle1")}
            <span> {t("aiTitle2")}</span>
          </h2>

          <p>{t("aiDescription")}</p>

          <div className="ai-features">
            <div className="ai-feature">✅ {t("aiFeature1")}</div>
            <div className="ai-feature">✅ {t("aiFeature2")}</div>
            <div className="ai-feature">✅ {t("aiFeature3")}</div>
            <div className="ai-feature">✅ {t("aiFeature4")}</div>
            <div className="ai-feature">✅ {t("aiFeature5")}</div>
            <div className="ai-feature">✅ {t("aiFeature6")}</div>
          </div>
        </div>

        <div className="ai-right">
          <div className="ai-card">
            <div className="ai-header">
              <div className="ai-logo">
                <FaRobot />
              </div>

              <div>
                <h3>SmaXTify.AI</h3>
                <small>{t("aiStatus")}</small>
              </div>
            </div>

            <div className="chat-preview">
              <div className="message user">{t("chatUser1")}</div>

              <div className="message ai">
                {t("chatAi1")}
                <strong> {t("chatAi1Highlight")}</strong>
              </div>

              <div className="message user">{t("chatUser2")}</div>

              <div className="message ai">{t("chatAi2")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <div className="faq-title">
          <span className="section-tag">{t("faqTag")}</span>
          <h2>{t("faqTitle")}</h2>
          <p className="faq-subtitle">
            Find answers to common questions about SmaXTify.
          </p>
        </div>

        <div className="faq-container">
          {faqs.map((faq, index) => {
            const isActive = activeFAQ === index;
            const answerId = `faq-answer-${index}`;

            return (
              <article
                key={index}
                className={`faq-card${isActive ? " active" : ""}`}
              >
                <button
                  type="button"
                  className="faq-question"
                  onClick={() =>
                    setActiveFAQ(isActive ? null : index)
                  }
                  aria-expanded={isActive}
                  aria-controls={answerId}
                >
                  <span className="faq-left">
                    <span className="faq-icon" aria-hidden="true">
                      {faq.icon}
                    </span>

                    <span className="faq-question-text">
                      {faq.question}
                    </span>
                  </span>

                  <span className="faq-plus" aria-hidden="true">
                    {isActive ? "−" : "+"}
                  </span>
                </button>

                {isActive && (
                  <div className="faq-answer" id={answerId}>
                    <div className="faq-answer-content">
                      <span className="faq-answer-line"></span>
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Contact */}
      <section className="contact-section" id="contact">
        <div className="contact-header">
          <span className="section-tag">{t("contactTag")}</span>
          <h2>{t("contactTitle")}</h2>

          <p>
            {t("contactDescription1")}
            <br />
            {t("contactDescription2")}
          </p>
        </div>

        <div className="contact-container">
          <div className="contact-card">
            <div className="contact-icon">📧</div>
            <h3>{t("email")}</h3>
            <p>sukhithgowda07@gmail.com</p>
          </div>

          <div className="contact-card">
            <div className="contact-icon">📞</div>
            <h3>{t("phone")}</h3>
            <p>+91 99163 40530</p>
          </div>

          <div className="contact-card">
            <div className="contact-icon">📍</div>
            <h3>{t("location")}</h3>
            <p>Bengaluru, Karnataka, India</p>
          </div>
        </div>

        <div className="contact-bottom">
          <h3>{t("needHelp")}</h3>
          <p>{t("needHelpDesc")}</p>

          <a
            href="mailto:sukhithgowda07@gmail.com"
            className="contact-btn"
          >
            {t("contactSupport")}
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <span className="section-tag">{t("ctaTag")}</span>

          <h2>
            {t("ctaTitle1")}
            <span> {t("ctaTitle2")}</span>
          </h2>

          <p>{t("ctaDescription")}</p>

          <div className="cta-buttons">
            <Link to="/register" className="primary-btn">
              {t("getStarted")}
              <FaArrowRight />
            </Link>

            <Link to="/login" className="secondary-btn">
              {t("login")}
            </Link>
          </div>
        </div>
      </section>

      {/* Back to Top */}
      {showScroll && (
        <button
          type="button"
          className="back-to-top"
          onClick={scrollToTop}
          aria-label="Back to Top"
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  );
}
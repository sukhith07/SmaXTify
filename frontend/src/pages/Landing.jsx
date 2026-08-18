import React, { useState, useEffect } from "react";
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

 const [showScroll, setShowScroll] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setShowScroll(window.scrollY > 300);
  };

  window.addEventListener("scroll", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

  const { t, i18n } = useTranslation();

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
  {
    number: "10K+",
    label: t("transactions"),
  },
  {
    number: "99.9%",
    label: t("accuracy"),
  },
  {
    number: "24×7",
    label: t("aiSupport"),
  },
];

  const [activeFAQ, setActiveFAQ] = useState(null);
const [showLanguages, setShowLanguages] = useState(false);

const [selectedLanguage, setSelectedLanguage] = useState({
  name: "English",
  flag: "",
});

const faqs = [
  {
    question: t("faq1Question"),
    answer: t("faq1Answer"),
    icon: "💰",
  },
  {
    question: t("faq2Question"),
    answer: t("faq2Answer"),
    icon: "🔒",
  },
  {
    question: t("faq3Question"),
    answer: t("faq3Answer"),
    icon: "📊",
  },
  {
    question: t("faq4Question"),
    answer: t("faq4Answer"),
    icon: "🤖",
  },
  {
    question: t("faq5Question"),
    answer: t("faq5Answer"),
    icon: "📱",
  },
  {
    question: t("faq6Question"),
    answer: t("faq6Answer"),
    icon: "💳",
  },
  {
    question: t("faq7Question"),
    answer: t("faq7Answer"),
    icon: "🧾",
  },
  {
    question: t("faq8Question"),
    answer: t("faq8Answer"),
    icon: "📈",
  },
  {
    question: t("faq9Question"),
    answer: t("faq9Answer"),
    icon: "☁️",
  },
  {
    question: t("faq10Question"),
    answer: t("faq10Answer"),
    icon: "🌐",
  },
];
const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "te", name: "తెలుగు", flag: "🇮🇳" },
];

  return (
    <div className="landing-page">

      {/* Background */}
      <div className="bg-circle circle1"></div>
      <div className="bg-circle circle2"></div>
      <div className="bg-circle circle3"></div>

      {/* ================= NAVBAR ================= */}

      <nav className="landing-navbar">

        <div className="logo-area">

          <div className="logo-circle">
            <FaWallet />
          </div>

          <div>
            <h2>SmaXTify</h2>
            <span>AI Expense Tracker</span>
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
  className="language-btn"
  onClick={() => setShowLanguages(!showLanguages)}
>
  {selectedLanguage.flag} {selectedLanguage.name} ▼
</button>

    {showLanguages && (

      <div className="language-dropdown">

  {languages.map((lang, index) => (

    <button
      key={index}
     onClick={() => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang.code);
    setShowLanguages(false);
}}
    >
      {lang.flag} {lang.name}
    </button>

  ))}

</div>

    )}

  </div>

</div>

      </nav>
            {/* ================= HERO ================= */}

      <section className="hero">

        <div className="hero-left">

          <div className="badge">
            {t("heroBadge")}
          </div>

          <h1>
            {t("heroTitle1")}
            <br />
            <span>{t("heroTitle2")}</span>
          </h1>

          <p>
           {t("heroDescription")}
           
          </p>

          <div className="hero-buttons">

            <Link
              to="/register"
              className="primary-btn"
            >
              {t("getStarted")}
              <FaArrowRight />
            </Link>

            <Link
              to="/login"
              className="secondary-btn"
            >
             {t("login")}
            </Link>

          </div>

          <div className="hero-stats">

            {stats.map((item, index) => (

              <div
                key={index}
                className="stat-card"
              >

                <h3>{item.number}</h3>

                <p>{item.label}</p>

              </div>

            ))}

          </div>

        </div>    


        {/* ================= DASHBOARD PREVIEW ================= */}

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
</section>.

    {/* ================= FEATURES ================= */}

<section
  id="features"
  className="features-section"
>
  <div className="section-title">

    <span className="section-tag">
      {t("whyChoose")}
    </span>

    <h2>
      {t("featuresHeading1")}
      <span> {t("featuresHeading2")}</span>
    </h2>

    <p>
      {t("featuresDescription")}
    </p>

  </div>

  <div className="features-grid">

    {features.map((feature, index) => (

      <div
        key={index}
        className="feature-card"
      >

        <div className="feature-icon">
          {feature.icon}
        </div>

        <h3>{feature.title}</h3>

        <p>{feature.desc}</p>

      </div>

    ))}

  </div>

</section>


      {/* ================= HOW IT WORKS ================= */}

<section
  id="how"
  className="how-section"
>
  <div className="section-title">

    <span className="section-tag">
      {t("howTag")}
    </span>

    <h2>
      {t("howTitle1")}
      <span> {t("howTitle2")}</span>
    </h2>

    <p>
      {t("howDescription")}
    </p>

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
           {/* ================= AI SECTION ================= */}

<section
  id="ai"
  className="ai-section"
>

  <div className="ai-left">

    <span className="section-tag">
      {t("aiTag")}
    </span>

    <h2>
      {t("aiTitle1")}
      <span> {t("aiTitle2")}</span>
    </h2>

    <p>
      {t("aiDescription")}
    </p>

    <div className="ai-features">

      <div className="ai-feature">
        ✅ {t("aiFeature1")}
      </div>

      <div className="ai-feature">
        ✅ {t("aiFeature2")}
      </div>

      <div className="ai-feature">
        ✅ {t("aiFeature3")}
      </div>

      <div className="ai-feature">
        ✅ {t("aiFeature4")}
      </div>

      <div className="ai-feature">
        ✅ {t("aiFeature5")}
      </div>

      <div className="ai-feature">
        ✅ {t("aiFeature6")}
      </div>

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

        <div className="message user">
          {t("chatUser1")}
        </div>

        <div className="message ai">
          {t("chatAi1")}
          <strong> {t("chatAi1Highlight")}</strong>
        </div>

        <div className="message user">
          {t("chatUser2")}
        </div>

        <div className="message ai">
          {t("chatAi2")}
        </div>

      </div>

    </div>

  </div>

</section>
 {/* ================= FAQ ================= */}

<section className="faq-section" id="faq">

  <div className="faq-title">

    <span className="section-tag">
      {t("faqTag")}
      </span>

    <h2>{t("faqTitle")}</h2>

  </div>

  <div className="faq-container">

    {faqs.map((faq, index) => (

      <div
        key={index}
        className={
          activeFAQ === index
            ? "faq-card active"
            : "faq-card"
        }
      >

        <div
          className="faq-question"
          onClick={() =>
            setActiveFAQ(
              activeFAQ === index ? null : index
            )
          }
        >

          <div className="faq-left">

            <div className="faq-icon">
              {faq.icon}
            </div>

            <h3>{faq.question}</h3>

          </div>

          <div className="faq-plus">
            {activeFAQ === index ? "−" : "+"}
          </div>

        </div>

        {activeFAQ === index && (

          <div className="faq-answer">
            <p>{faq.answer}</p>
          </div>

        )}

      </div>

    ))}

  </div>

</section>

 {/* ================= CONTACT ================= */}

<section className="contact-section" id="contact">

  <div className="contact-header">

    <span className="section-tag">
      {t("contactTag")}
      </span>

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

 {/* ================= CTA ================= */}

<section className="cta-section">

  <div className="cta-card">

    <span className="section-tag">
      {t("ctaTag")}
    </span>

    <h2>
      {t("ctaTitle1")}
      <span> {t("ctaTitle2")}</span>
    </h2>

    <p>
      {t("ctaDescription")}
    </p>

    <div className="cta-buttons">

      <Link
        to="/register"
        className="primary-btn"
      >
        {t("getStarted")}
        <FaArrowRight />
      </Link>

      <Link
        to="/login"
        className="secondary-btn"
      >
        {t("login")}
      </Link>

    </div>

  </div>

</section>
      {/* ================= FOOTER ================= */}

<footer className="landing-footer">

  <div className="footer-column">

    <div className="logo-area">

      <div className="logo-circle">
        <FaWallet />
      </div>

      <div>
        <h2>SmaXTify</h2>
        <span>
          <small>
            <b>{t("footerSubtitle")}</b>
          </small>
        </span>
      </div>

    </div>

    <p>{t("footerDesc1")}</p>
    <p>{t("footerDesc2")}</p>
    <p>{t("footerDesc3")}</p>

  </div>

  <div className="footer-column">

    <h3>{t("quickLinks")}</h3>

    <a href="#features">{t("features")}</a>
    <a href="#how">{t("howItWorks")}</a>
    <a href="#ai">{t("ai")}</a>

    <Link to="/register">
      {t("register")}
    </Link>

    <Link to="/login">
      {t("login")}
    </Link>

  </div>

  <div className="footer-column">

    <h3>{t("coreFeatures")}</h3>

    <p>✔ {t("featureExpense")}</p>
    <p>✔ {t("featureBudget")}</p>
    <p>✔ {t("featureAI")}</p>
    <p>✔ {t("featureReceipt")}</p>
    <p>✔ {t("featureAnalytics")}</p>
    <p>✔ {t("featureCloud")}</p>

  </div>

</footer>

<div className="copyright">

  © {new Date().getFullYear()} SmaXTify.
  {t("copyright")}
</div>

  {/* ================= BACK TO TOP ================= */}

{showScroll && (
  <button
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

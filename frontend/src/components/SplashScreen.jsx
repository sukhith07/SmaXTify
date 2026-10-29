
import { useEffect, useState } from "react";
import "./styles/SplashScreen.css";

const TAGLINE = ["Track", "Plan", "Save", "Grow"];

function SplashScreen() {
  const [visibleWords, setVisibleWords] = useState(0);

  useEffect(() => {
    const timers = TAGLINE.map((_, index) =>
      window.setTimeout(() => {
        setVisibleWords(index + 1);
      }, 650 + index * 300)
    );

    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <section
      className="smaxtify-splash"
      role="status"
      aria-label="Loading SmaXTify"
    >
      <div className="smaxtify-splash__glow smaxtify-splash__glow--blue" />
      <div className="smaxtify-splash__glow smaxtify-splash__glow--green" />

      <div className="smaxtify-splash__content">
        <div className="smaxtify-splash__logo-wrap">
          <div className="smaxtify-splash__logo-ring" />
          <img
            className="smaxtify-splash__logo"
            src="/SmaXTify.png"
            alt="SmaXTify logo"
            fetchPriority="high"
          />
        </div>

        <h1 className="smaxtify-splash__brand">SmaXTify</h1>

        <p className="smaxtify-splash__description">
          Smart Expense Tracker
        </p>

        <div
          className="smaxtify-splash__tagline"
          aria-label="Track, Plan, Save, Grow"
        >
          {TAGLINE.map((word, index) => (
            <span
              className={`smaxtify-splash__word ${
                index < visibleWords
                  ? "smaxtify-splash__word--visible"
                  : ""
              }`}
              key={word}
            >
              {word}
            </span>
          ))}
        </div>

        <div className="smaxtify-splash__loader" aria-hidden="true">
          <span />
        </div>
      </div>

      <span className="smaxtify-splash__footer">
        YOUR MONEY. YOUR FUTURE.
      </span>
    </section>
  );
}

export default SplashScreen;
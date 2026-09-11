import { useState } from "react";
import {
  FaChartPie,
  FaArrowTrendUp,
  FaCalendarDays,
} from "react-icons/fa6";

import "../styles/reportHeader.css";

function ReportHeader() {
  const [animationKey, setAnimationKey] = useState(0);

  const currentDate = new Date();

  const month = currentDate.toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const handleHeaderClick = () => {
    setAnimationKey((prev) => prev + 1);
  };

  const handleHeaderKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleHeaderClick();
    }
  };

  return (
    <section
      className="report-header"
      onClick={handleHeaderClick}
      onKeyDown={handleHeaderKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Reports and Analytics"
    >
      <div className="report-header-content">
        <div className="report-header-main">
          <div className="report-header-icon">
            <FaChartPie />
          </div>

          <div
            key={animationKey}
            className="report-header-text"
          >
            <h1>Reports & Analytics</h1>

            <p>
              Understand your spending,
              income and financial progress
              at a glance.
            </p>
          </div>
        </div>

        <div className="report-header-meta">
          <div className="report-period">
            <FaCalendarDays />

            <div>
              <span>Reporting Period</span>

              <strong>{month}</strong>
            </div>
          </div>

          <div className="report-status">
            <FaArrowTrendUp />

            <span>Financial Summary</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReportHeader;
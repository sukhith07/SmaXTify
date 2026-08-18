import {
  FaChartPie,
  FaArrowTrendUp,
  FaCalendarDays,
} from "react-icons/fa6";

import "../styles/reportHeader.css";

function ReportHeader() {

  const currentDate = new Date();

  const month = currentDate.toLocaleString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  );

  return (
    <section className="report-header">

      <div className="report-header-content">

        {/* =================================
            Left Content
        ================================= */}

        <div className="report-header-main">

          <div className="report-header-icon">
            <FaChartPie />
          </div>

          <div>

            <h1>
              Reports & Analytics
            </h1>

            <p>
              Understand your spending,
              income and financial progress
              at a glance.
            </p>

          </div>

        </div>

        {/* =================================
            Right Content
        ================================= */}

        <div className="report-header-meta">

          <div className="report-period">

            <FaCalendarDays />

            <div>
              <span>Reporting Period</span>

              <strong>
                {month}
              </strong>
            </div>

          </div>

          <div className="report-status">

            <FaArrowTrendUp />

            <span>
              Financial Summary
            </span>

          </div>

        </div>

      </div>

    </section>
  );
}

export default ReportHeader;
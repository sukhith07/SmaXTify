import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

import { FaChartPie } from "react-icons/fa";

import "../styles/reportCategoryChart.css";

// =====================================================
// Register Chart.js Components
// =====================================================

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

// =====================================================
// Professional Category Colors
// =====================================================

const CATEGORY_COLORS = {
  Food: "#2563eb",
  Shopping: "#7c3aed",
  Education: "#10b981",
  Transport: "#f59e0b",
  Bills: "#ef4444",
  Healthcare: "#06b6d4",
  Travel: "#f97316",
  Entertainment: "#ec4899",
  Rent: "#8b5cf6",
  Groceries: "#14b8a6",
  Salary: "#22c55e",
  Business: "#6366f1",
  Freelance: "#0ea5e9",
  Investment: "#84cc16",
  Gift: "#e11d48",
  Other: "#64748b",
};

// Fallback colors for unknown categories

const FALLBACK_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#f97316",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
];

// =====================================================
// Component
// =====================================================

function ReportCategoryChart({
  transactions = [],
}) {

  // ===================================================
  // Calculate Expense By Category
  // ===================================================

  const categoryTotals = {};

  transactions.forEach((transaction) => {

    if (
      transaction.type !== "Expense"
    ) {
      return;
    }

    const category =
      transaction.category ||
      "Other";

    const amount =
      Number(transaction.amount) || 0;

    categoryTotals[category] =
      (categoryTotals[category] || 0) +
      amount;
  });

  // ===================================================
  // Prepare Chart Data
  // ===================================================

  const labels =
    Object.keys(categoryTotals);

  const values =
    Object.values(categoryTotals);

  const totalExpense =
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  // ===================================================
  // Generate Colors
  // ===================================================

  const backgroundColors =
    labels.map(
      (category, index) =>
        CATEGORY_COLORS[category] ||
        FALLBACK_COLORS[
          index %
          FALLBACK_COLORS.length
        ]
    );

  // Slightly darker border effect

  const hoverColors =
    backgroundColors.map((color) =>
      color
    );

  // ===================================================
  // Chart Data
  // ===================================================

  const data = {

    labels,

    datasets: [

      {

        data: values,

        backgroundColor:
          backgroundColors,

        hoverBackgroundColor:
          hoverColors,

        borderColor:
          "#ffffff",

        borderWidth: 3,

        hoverBorderColor:
          "#ffffff",

        hoverBorderWidth: 4,

        hoverOffset: 10,

        spacing: 2,

      },

    ],

  };

  // ===================================================
  // Chart Options
  // ===================================================

  const options = {

    responsive: true,

    maintainAspectRatio: false,

    cutout: "68%",

    animation: {

      duration: 800,

      easing: "easeOutQuart",

    },

    plugins: {

      legend: {

        display: true,

        position: "bottom",

        labels: {

          usePointStyle: true,

          pointStyle: "circle",

          padding: 18,

          color: "#64748b",

          font: {

            size: 12,

            weight: "600",

          },

        },

      },

      tooltip: {

        backgroundColor:
          "rgba(15, 23, 42, 0.95)",

        titleColor:
          "#ffffff",

        bodyColor:
          "#ffffff",

        padding: 12,

        cornerRadius: 10,

        displayColors: true,

        callbacks: {

          label: (context) => {

            const value =
              Number(
                context.raw
              ) || 0;

            const percentage =
              totalExpense === 0
                ? 0
                : (
                    (value /
                      totalExpense) *
                    100
                  ).toFixed(1);

            return (
              ` ₹${value.toLocaleString(
                "en-IN"
              )} (${percentage}%)`
            );

          },

        },

      },

    },

  };

  // ===================================================
  // Empty State
  // ===================================================

  if (
    labels.length === 0 ||
    totalExpense === 0
  ) {

    return (

      <section className="report-chart-card">

        <div className="report-chart-header">

          <div className="report-chart-title">

            <div className="report-chart-icon">

              <FaChartPie />

            </div>

            <div>

              <h2>
                Expense by Category
              </h2>

              <p>
                See where your money is going.
              </p>

            </div>

          </div>

        </div>

        <div className="report-chart-empty">

          <div className="report-chart-empty-icon">

            <FaChartPie />

          </div>

          <h3>
            No Expense Data
          </h3>

          <p>
            There are no expenses for the
            selected filters.
          </p>

        </div>

      </section>

    );
  }

  // ===================================================
  // Render
  // ===================================================

  return (

    <section className="report-chart-card">

      {/* =============================================
          Header
      ============================================= */}

      <div className="report-chart-header">

        <div className="report-chart-title">

          <div className="report-chart-icon">

            <FaChartPie />

          </div>

          <div>

            <h2>
              Expense by Category
            </h2>

            <p>
              See where your money is going.
            </p>

          </div>

        </div>

        <div className="report-chart-total">

          <span>
            Total Expense
          </span>

          <strong>
            ₹{totalExpense.toLocaleString(
              "en-IN"
            )}
          </strong>

        </div>

      </div>

      {/* =============================================
          Doughnut Chart
      ============================================= */}

      <div className="report-doughnut-wrapper">

        <Doughnut
          data={data}
          options={options}
        />

        <div className="report-doughnut-center">

          <span>
            Total
          </span>

          <strong>
            ₹{totalExpense.toLocaleString(
              "en-IN"
            )}
          </strong>

        </div>

      </div>

    </section>

  );
}

export default ReportCategoryChart;
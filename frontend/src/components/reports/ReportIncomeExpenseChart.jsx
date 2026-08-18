import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

import {
  FaChartColumn,
} from "react-icons/fa6";

import "../styles/reportIncomeExpenseChart.css";

// =====================================================
// Register Chart.js
// =====================================================

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

// =====================================================
// Component
// =====================================================

function ReportIncomeExpenseChart({
  income = 0,
  expense = 0,
}) {

  const totalIncome =
    Number(income) || 0;

  const totalExpense =
    Number(expense) || 0;

  // ===================================================
  // Chart Data
  // ===================================================

  const data = {

    labels: [
      "Income",
      "Expense",
    ],

    datasets: [

      {
        label: "Amount",

        data: [
          totalIncome,
          totalExpense,
        ],

        // ==========================================
        // IMPORTANT:
        // Explicit colors for each bar
        // ==========================================

        backgroundColor: [
          "#22c55e",
          "#ef4444",
        ],

        borderColor: [
          "#16a34a",
          "#dc2626",
        ],

        hoverBackgroundColor: [
          "#16a34a",
          "#dc2626",
        ],

        hoverBorderColor: [
          "#15803d",
          "#b91c1c",
        ],

        borderWidth: 1,

        borderRadius: 10,

        borderSkipped: false,

        barThickness: 55,

      },

    ],

  };

  // ===================================================
  // Chart Options
  // ===================================================

  const options = {

    responsive: true,

    maintainAspectRatio: false,

    interaction: {

      intersect: false,

      mode: "index",

    },

    animation: {

      duration: 800,

      easing: "easeOutQuart",

    },

    plugins: {

      legend: {

        display: false,

      },

      tooltip: {

        backgroundColor:
          "rgba(15, 23, 42, 0.95)",

        titleColor:
          "#ffffff",

        bodyColor:
          "#ffffff",

        displayColors: true,

        padding: 12,

        cornerRadius: 10,

        callbacks: {

          title: (items) => {

            return (
              items[0]?.label ||
              ""
            );

          },

          label: (context) => {

            const value =
              Number(
                context.raw
              ) || 0;

            return (
              ` ₹${value.toLocaleString(
                "en-IN"
              )}`
            );

          },

        },

      },

    },

    scales: {

      x: {

        grid: {

          display: false,

        },

        border: {

          display: false,

        },

        ticks: {

          color: "#64748b",

          font: {

            size: 12,

            weight: "700",

          },

        },

      },

      y: {

        beginAtZero: true,

        border: {

          display: false,

        },

        grid: {

          color:
            "rgba(148, 163, 184, 0.15)",

          drawTicks: false,

        },

        ticks: {

          color: "#94a3b8",

          padding: 10,

          font: {

            size: 11,

          },

          callback: (value) => {

            const number =
              Number(value);

            if (
              number >= 1000000
            ) {

              return (
                `₹${(
                  number /
                  1000000
                ).toFixed(1)}M`
              );

            }

            if (
              number >= 1000
            ) {

              return (
                `₹${(
                  number /
                  1000
                ).toFixed(0)}K`
              );

            }

            return `₹${number}`;

          },

        },

      },

    },

  };

  // ===================================================
  // Render
  // ===================================================

  return (

    <section className="report-income-expense-card">

      {/* =============================================
          Header
      ============================================= */}

      <div className="report-income-expense-header">

        <div className="report-income-expense-title">

          <div className="report-income-expense-icon">

            <FaChartColumn />

          </div>

          <div>

            <h2>
              Income vs Expense
            </h2>

            <p>
              Compare your earnings and spending.
            </p>

          </div>

        </div>

      </div>


      {/* =============================================
          Quick Values
      ============================================= */}

      <div className="report-income-expense-values">

        <div className="report-income-value">

          <span>
            Income
          </span>

          <strong>
            ₹{totalIncome.toLocaleString(
              "en-IN"
            )}
          </strong>

        </div>


        <div className="report-expense-value">

          <span>
            Expense
          </span>

          <strong>
            ₹{totalExpense.toLocaleString(
              "en-IN"
            )}
          </strong>

        </div>

      </div>


      {/* =============================================
          Bar Chart
      ============================================= */}

      <div className="report-income-expense-chart">

        <Bar
          data={data}
          options={options}
        />

      </div>

    </section>

  );

}

export default ReportIncomeExpenseChart;
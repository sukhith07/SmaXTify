import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";

import {
  FaChartLine,
} from "react-icons/fa6";

import "../styles/reportTrendChart.css";


// =====================================================
// Register Chart.js Components
// =====================================================

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);


// =====================================================
// Component
// =====================================================

function ReportTrendChart({
  transactions = [],
}) {

  // =====================================================
  // Prepare Daily Data
  // =====================================================

  const dailyData = {};


  transactions.forEach((transaction) => {

    if (!transaction.date) {
      return;
    }

    const date =
      new Date(transaction.date);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return;
    }


    const key =
      date.toISOString().split("T")[0];


    if (!dailyData[key]) {

      dailyData[key] = {

        income: 0,

        expense: 0,

      };

    }


    const amount =
      Number(transaction.amount) || 0;


    if (
      transaction.type === "Income"
    ) {

      dailyData[key].income += amount;

    }


    if (
      transaction.type === "Expense"
    ) {

      dailyData[key].expense += amount;

    }

  });


  // =====================================================
  // Sort Dates
  // =====================================================

  const sortedDates =
    Object.keys(dailyData).sort(
      (a, b) =>
        new Date(a) -
        new Date(b)
    );


  // =====================================================
  // Format Labels
  // =====================================================

  const labels =
    sortedDates.map((date) => {

      const formattedDate =
        new Date(
          `${date}T00:00:00`
        );

      return formattedDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
        }
      );

    });


  // =====================================================
  // Values
  // =====================================================

  const incomeValues =
    sortedDates.map(
      (date) =>
        dailyData[date].income
    );


  const expenseValues =
    sortedDates.map(
      (date) =>
        dailyData[date].expense
    );


  // =====================================================
  // Chart Data
  // =====================================================

  const data = {

    labels,

    datasets: [

      {
        label: "Income",

        data: incomeValues,

        borderColor: "#16a34a",

        backgroundColor:
          "rgba(22, 163, 74, 0.10)",

        pointBackgroundColor:
          "#16a34a",

        pointBorderColor:
          "#ffffff",

        pointBorderWidth: 2,

        pointRadius: 4,

        pointHoverRadius: 6,

        borderWidth: 3,

        tension: 0.4,

        fill: true,

      },


      {
        label: "Expense",

        data: expenseValues,

        borderColor: "#ef4444",

        backgroundColor:
          "rgba(239, 68, 68, 0.08)",

        pointBackgroundColor:
          "#ef4444",

        pointBorderColor:
          "#ffffff",

        pointBorderWidth: 2,

        pointRadius: 4,

        pointHoverRadius: 6,

        borderWidth: 3,

        tension: 0.4,

        fill: true,

      },

    ],

  };


  // =====================================================
  // Chart Options
  // =====================================================

  const options = {

    responsive: true,

    maintainAspectRatio: false,

    interaction: {

      mode: "index",

      intersect: false,

    },


    plugins: {

      legend: {

        display: true,

        position: "top",

        align: "end",

        labels: {

          usePointStyle: true,

          pointStyle: "circle",

          padding: 18,

          color: "#475569",

          font: {

            size: 12,

            weight: "700",

          },

        },

      },


      tooltip: {

        displayColors: true,

        padding: 12,

        callbacks: {

          label: (context) => {

            const value =
              Number(
                context.raw
              ) || 0;

            return ` ${context.dataset.label}: ₹${value.toLocaleString(
              "en-IN"
            )}`;

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

          color: "#94a3b8",

          font: {

            size: 11,

            weight: "600",

          },

          maxRotation: 0,

          autoSkip: true,

          maxTicksLimit: 10,

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

            if (
              Number(value) >= 1000000
            ) {

              return `₹${(
                Number(value) /
                1000000
              ).toFixed(1)}M`;

            }


            if (
              Number(value) >= 1000
            ) {

              return `₹${(
                Number(value) /
                1000
              ).toFixed(0)}K`;

            }


            return `₹${value}`;

          },

        },

      },

    },

  };


  // =====================================================
  // Empty State
  // =====================================================

  if (
    sortedDates.length === 0
  ) {

    return (

      <section className="report-trend-card">

        <div className="report-trend-header">

          <div className="report-trend-title">

            <div className="report-trend-icon">

              <FaChartLine />

            </div>

            <div>

              <h2>
                Income & Expense Trend
              </h2>

              <p>
                Track your financial activity over time.
              </p>

            </div>

          </div>

        </div>


        <div className="report-trend-empty">

          <div className="report-trend-empty-icon">

            <FaChartLine />

          </div>

          <h3>
            No Trend Data
          </h3>

          <p>
            Add some transactions to see your
            income and expense trend.
          </p>

        </div>

      </section>

    );

  }


  // =====================================================
  // Render
  // =====================================================

  return (

    <section className="report-trend-card">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="report-trend-header">

        <div className="report-trend-title">

          <div className="report-trend-icon">

            <FaChartLine />

          </div>


          <div>

            <h2>
              Income & Expense Trend
            </h2>

            <p>
              Track your financial activity over time.
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          CHART
      ================================================= */}

      <div className="report-trend-chart">

        <Line
          data={data}
          options={options}
        />

      </div>

    </section>

  );

}


export default ReportTrendChart;
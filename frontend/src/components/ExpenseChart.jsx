import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

import {
  FaArrowUp,
  FaArrowDown,
  FaExchangeAlt,
} from "react-icons/fa";

import "./styles/expenseChart.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function ExpenseChart({ expenses = [] }) {
  const income = expenses
    .filter((item) => item.type === "Income")
    .reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    );

  const expense = expenses
    .filter((item) => item.type === "Expense")
    .reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    );

  const transfer = expenses
    .filter((item) => item.type === "Transfer")
    .reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    );

  const data = {
    labels: [
      "Income",
      "Expense",
      "Transfer",
    ],

    datasets: [
      {
        data: [
          income,
          expense,
          transfer,
        ],

        backgroundColor: [
          "#10b981",
          "#ef4444",
          "#3b82f6",
        ],

        borderColor: [
          "#ffffff",
          "#ffffff",
          "#ffffff",
        ],

        borderWidth: 4,

        hoverOffset: 18,
      },
    ],
  };

  const options = {
    responsive: true,

    maintainAspectRatio: false,

    cutout: "68%",

    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div
      className="chart-card"
      id="analytics"
    >
      <h2>
        Income vs Expense vs Transfer
      </h2>

      <div className="chart-wrapper">
        <div className="chart-box">
          <Doughnut
            data={data}
            options={options}
          />
        </div>

        <div className="chart-legend">
          <div className="legend-card income">
            <FaArrowUp />

            <div>
              <span>Income</span>

              <h3>
                ₹
                {income.toLocaleString(
                  "en-IN"
                )}
              </h3>
            </div>
          </div>

          <div className="legend-card expense">
            <FaArrowDown />

            <div>
              <span>Expense</span>

              <h3>
                ₹
                {expense.toLocaleString(
                  "en-IN"
                )}
              </h3>
            </div>
          </div>

          <div className="legend-card transfer">
            <FaExchangeAlt />

            <div>
              <span>Transfer</span>

              <h3>
                ₹
                {transfer.toLocaleString(
                  "en-IN"
                )}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpenseChart;
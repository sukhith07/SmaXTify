import {
  FaArrowDown,
  FaArrowUp,
  FaWallet,
  FaChartLine,
  FaPiggyBank,
} from "react-icons/fa";

import "../styles/reportSummary.css";

function ReportSummary({
  income = 0,
  expense = 0,
  balance = 0,
}) {

  const safeIncome = Number(income) || 0;
  const safeExpense = Number(expense) || 0;
  const safeBalance = Number(balance) || 0;

  const savingsRate =
    safeIncome > 0
      ? Math.max(
          Math.round(
            (safeBalance / safeIncome) * 100
          ),
          0
        )
      : 0;

  const formatCurrency = (value) =>
    `₹${value.toLocaleString("en-IN")}`;

  const cards = [
    {
      key: "income",
      label: "Total Income",
      value: formatCurrency(safeIncome),
      description: "Money received",
      icon: <FaArrowDown />,
      className: "income",
    },

    {
      key: "expense",
      label: "Total Expenses",
      value: formatCurrency(safeExpense),
      description: "Money spent",
      icon: <FaArrowUp />,
      className: "expense",
    },

    {
      key: "balance",
      label: "Current Balance",
      value: formatCurrency(safeBalance),
      description:
        safeBalance >= 0
          ? "Available balance"
          : "Negative balance",
      icon: <FaWallet />,
      className:
        safeBalance >= 0
          ? "balance"
          : "negative",
    },

    {
      key: "savings",
      label: "Savings Rate",
      value: `${savingsRate}%`,
      description: "Income retained",
      icon: <FaPiggyBank />,
      className: "savings",
    },
  ];

  return (
    <div className="report-summary-grid">

      {cards.map((card) => (

        <article
          key={card.key}
          className={`report-summary-card ${card.className}`}
        >

          <div className="report-summary-top">

            <div className="report-summary-icon">
              {card.icon}
            </div>

            <span className="report-summary-label">
              {card.label}
            </span>

          </div>

          <div className="report-summary-value">
            {card.value}
          </div>

          <div className="report-summary-footer">

            <span>
              {card.description}
            </span>

            <FaChartLine />

          </div>

        </article>

      ))}

    </div>
  );
}

export default ReportSummary;
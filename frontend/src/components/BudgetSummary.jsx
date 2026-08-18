import {
  FaWallet,
  FaMoneyBillWave,
  FaPiggyBank,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";

import "./styles/budgetSummary.css";

function BudgetSummary({
  totalBudget = 0,
  totalSpent = 0,
  remainingBudget = 0,
  overallPercentage,
}) {

  // ==========================================
  // Safe Numbers
  // ==========================================

  const budget = Number(totalBudget) || 0;
  const spent = Number(totalSpent) || 0;

  const calculatedRemaining = Number(
    remainingBudget ?? budget - spent
  );

  const isOverBudget = calculatedRemaining < 0;

  const displayRemaining = Math.abs(calculatedRemaining);

  const percentage =
    overallPercentage !== undefined
      ? Number(overallPercentage)
      : budget === 0
      ? 0
      : Math.min(
          Math.round((spent / budget) * 100),
          100
        );

  // ==========================================
  // Summary Cards
  // ==========================================

  const cards = [
    {
      title: "Total Budget",
      value: budget,
      icon: <FaWallet />,
      color: "#2563eb",
    },
    {
      title: "Spent",
      value: spent,
      icon: <FaMoneyBillWave />,
      color: "#ef4444",
    },
    {
      title: isOverBudget
        ? "Over Budget"
        : "Remaining",
      value: displayRemaining,
      icon: isOverBudget
        ? <FaExclamationTriangle />
        : <FaPiggyBank />,
      color: isOverBudget
        ? "#ef4444"
        : "#22c55e",
      danger: isOverBudget,
    },
    {
      title: "Budget Used",
      value: `${percentage}%`,
      icon: <FaChartLine />,
      color: "#7c3aed",
      percentage: true,
    },
  ];

  return (

    <div className="budget-summary">

      {cards.map((card, index) => (

        <div
          key={index}
          className={`budget-summary-card ${
            card.danger ? "danger-card" : ""
          }`}
        >

          <div
            className="budget-summary-icon"
            style={{
              background: card.color,
            }}
          >
            {card.icon}
          </div>

          <div className="budget-summary-content">

            <small>
              {card.title}
            </small>

            <h2
              style={{
                color: card.danger
                  ? "#dc2626"
                  : "#0f172a",
              }}
            >
              {card.percentage
                ? card.value
                : `₹${card.value.toLocaleString("en-IN")}`}
            </h2>

          </div>

        </div>

      ))}

    </div>

  );

}

export default BudgetSummary;
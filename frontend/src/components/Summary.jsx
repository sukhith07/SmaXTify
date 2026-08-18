import {
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaPiggyBank,
} from "react-icons/fa";

import "./styles/summary.css";

function Summary({ expenses }) {

  const totalIncome = expenses
    .filter((item) => item.type === "Income")
    .reduce((acc, item) => acc + Number(item.amount), 0);

  const totalExpense = expenses
    .filter((item) => item.type === "Expense")
    .reduce((acc, item) => acc + Number(item.amount), 0);

  const balance = totalIncome - totalExpense;

  const savings =
    totalIncome > 0
      ? ((balance / totalIncome) * 100).toFixed(1)
      : 0;

  const cards = [
    {
      title: "Total Balance",
      value: `₹${balance.toLocaleString()}`,
      icon: <FaWallet />,
      className: "balance-card",
    },
    {
      title: "Income",
      value: `₹${totalIncome.toLocaleString()}`,
      icon: <FaArrowUp />,
      className: "income-card",
    },
    {
      title: "Expenses",
      value: `₹${totalExpense.toLocaleString()}`,
      icon: <FaArrowDown />,
      className: "expense-card",
    },
    {
      title: "Savings",
      value: `${savings}%`,
      icon: <FaPiggyBank />,
      className: "saving-card",
    },
  ];

  return (
    <section
      className="summary-section"
      id="dashboard"
    >
      {cards.map((card, index) => (
        <div
          key={index}
          className={`summary-card ${card.className}`}
        >
          <div className="summary-icon">
            {card.icon}
          </div>

          <div className="summary-content">
            <h4>{card.title}</h4>
            <h2>{card.value}</h2>
          </div>
        </div>
      ))}
    </section>
  );
}

export default Summary;
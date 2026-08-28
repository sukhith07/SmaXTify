import {
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaPiggyBank,
} from "react-icons/fa";

import "./styles/summary.css";

function Summary({
  expenses = [],
  accounts = [],
  totalAccountBalance,
}) {
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

  const balance =
    income - expense;

  const savings =
    income > 0
      ? Number(
          ((balance / income) * 100).toFixed(1)
        )
      : 0;

  const calculatedAccountBalance =
    Array.isArray(accounts)
      ? accounts.reduce(
          (total, account) =>
            total +
            Number(account.balance || 0),
          0
        )
      : 0;

  const finalTotalBalance =
    totalAccountBalance !== undefined &&
    totalAccountBalance !== null
      ? Number(totalAccountBalance)
      : calculatedAccountBalance;

  return (
    <section className="summary-cards">

      <div className="summary-card balance-card">
        <div className="summary-icon">
          <FaWallet />
        </div>

        <div className="summary-content">
          <span>Total Balance</span>

          <strong>
            ₹
            {finalTotalBalance.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }
            )}
          </strong>
        </div>
      </div>

      <div className="summary-card income-card">
        <div className="summary-icon">
          <FaArrowUp />
        </div>

        <div className="summary-content">
          <span>Income</span>

          <strong>
            ₹
            {income.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }
            )}
          </strong>
        </div>
      </div>

      <div className="summary-card expense-card">
        <div className="summary-icon">
          <FaArrowDown />
        </div>

        <div className="summary-content">
          <span>Expenses</span>

          <strong>
            ₹
            {expense.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }
            )}
          </strong>
        </div>
      </div>

      <div className="summary-card savings-card">
        <div className="summary-icon">
          <FaPiggyBank />
        </div>

        <div className="summary-content">
          <span>Savings</span>

          <strong>
            {savings}%
          </strong>
        </div>
      </div>

    </section>
  );
}

export default Summary;
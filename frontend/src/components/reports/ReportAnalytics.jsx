import {
  FaPiggyBank,
  FaWallet,
  FaChartPie,
  FaReceipt,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaMoneyBillTrendUp,
} from "react-icons/fa6";

import "../styles/reportAnalytics.css";

function ReportAnalytics({
  income = 0,
  expense = 0,
  balance = 0,
  totalTransactions = 0,
  transactions = [],
}) {
  // =====================================================
  // SAFE VALUES
  // =====================================================

  const totalIncome = Number(income) || 0;
  const totalExpense = Number(expense) || 0;
  const totalBalance = Number(balance) || 0;
  const transactionCount = Number(totalTransactions) || 0;

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (value) => {
    return `₹${Math.abs(Number(value) || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  // =====================================================
  // EXPENSE TRANSACTIONS
  // =====================================================

  const expenseTransactions = Array.isArray(transactions)
    ? transactions.filter(
        (item) => item.type === "Expense"
      )
    : [];

  // =====================================================
  // SAVINGS RATE
  // =====================================================

  const savingsRate =
    totalIncome > 0
      ? Math.round(
          (totalBalance / totalIncome) * 100
        )
      : 0;

  // =====================================================
  // AVERAGE EXPENSE
  // =====================================================

  const averageExpense =
    expenseTransactions.length > 0
      ? totalExpense /
        expenseTransactions.length
      : 0;

  // =====================================================
  // CATEGORY TOTALS
  // =====================================================

  const categoryTotals = {};

  expenseTransactions.forEach((transaction) => {
    const category =
      transaction.category || "Other";

    const amount =
      Number(transaction.amount) || 0;

    categoryTotals[category] =
      (categoryTotals[category] || 0) +
      amount;
  });

  // =====================================================
  // TOP SPENDING CATEGORY
  // =====================================================

  const highestCategory = Object.entries(
    categoryTotals
  ).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const highestCategoryName =
    highestCategory?.[0] || "No data";

  const highestCategoryAmount =
    highestCategory?.[1] || 0;

  // =====================================================
  // LARGEST EXPENSE
  // =====================================================

  const largestExpense =
    expenseTransactions.reduce(
      (largest, transaction) => {
        const currentAmount =
          Number(transaction.amount) || 0;

        const largestAmount =
          Number(largest?.amount) || 0;

        return currentAmount > largestAmount
          ? transaction
          : largest;
      },
      null
    );

  // =====================================================
  // SAVINGS STATUS
  // =====================================================

  let savingsDescription = "No income recorded";

  if (totalIncome > 0) {
    if (savingsRate >= 20) {
      savingsDescription =
        "Excellent savings performance";
    } else if (savingsRate >= 10) {
      savingsDescription =
        "Good savings performance";
    } else if (savingsRate > 0) {
      savingsDescription =
        "Low savings performance";
    } else {
      savingsDescription =
        "No savings in selected period";
    }
  }

  // =====================================================
  // BALANCE STATUS
  // =====================================================

  const balancePositive =
    totalBalance >= 0;

  // =====================================================
  // ANALYTICS CARDS
  // =====================================================

  const cards = [
    {
      title: "Savings Rate",

      value: `${savingsRate}%`,

      description: savingsDescription,

      icon: <FaPiggyBank />,

      className:
        savingsRate >= 20
          ? "analytics-green"
          : savingsRate > 0
          ? "analytics-blue"
          : "analytics-red",
    },

    {
      title: "Average Expense",

      value: formatCurrency(
        averageExpense
      ),

      description:
        expenseTransactions.length > 0
          ? "Average per expense transaction"
          : "No expense transactions",

      icon: <FaWallet />,

      className: "analytics-blue",
    },

    {
      title: "Top Category",

      value: highestCategoryName,

      description:
        highestCategory
          ? `${formatCurrency(
              highestCategoryAmount
            )} spent in this category`
          : "No expense data",

      icon: <FaChartPie />,

      className: "analytics-purple",
    },

    {
      title: "Largest Expense",

      value: largestExpense
        ? formatCurrency(
            largestExpense.amount
          )
        : "₹0",

      description:
        largestExpense?.title ||
        "No expense data",

      icon: <FaArrowTrendDown />,

      className: "analytics-red",
    },

    {
      title: "Transactions",

      value:
        transactionCount.toLocaleString(
          "en-IN"
        ),

      description:
        "Transactions in selected period",

      icon: <FaReceipt />,

      className: "analytics-orange",
    },

    {
      title: "Net Balance",

      value: balancePositive
        ? formatCurrency(totalBalance)
        : `-${formatCurrency(totalBalance)}`,

      description: balancePositive
        ? "Positive financial balance"
        : "Expenses exceed income",

      icon: balancePositive ? (
        <FaArrowTrendUp />
      ) : (
        <FaArrowTrendDown />
      ),

      className: balancePositive
        ? "analytics-green"
        : "analytics-red",
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="report-analytics">

      {/* ===============================================
          SECTION HEADER
      =============================================== */}

      <div className="report-analytics-heading">

        <div className="report-analytics-heading-icon">
          <FaMoneyBillTrendUp />
        </div>

        <div>
          <h2>
            Financial Analytics
          </h2>

          <p>
            A detailed overview of your
            financial performance for the
            selected period.
          </p>
        </div>

      </div>

      {/* ===============================================
          ANALYTICS CARDS
      =============================================== */}

      <div className="report-analytics-grid">

        {cards.map((card, index) => (
          <div
            className={`report-analytics-card ${card.className}`}
            key={index}
          >

            {/* Card Header */}

            <div className="analytics-card-top">

              <div className="analytics-card-icon">
                {card.icon}
              </div>

              <span>
                {card.title}
              </span>

            </div>

            {/* Main Value */}

            <strong className="analytics-card-value">
              {card.value}
            </strong>

            {/* Description */}

            <p className="analytics-card-description">
              {card.description}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}

export default ReportAnalytics;
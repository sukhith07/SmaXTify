import {
  FaLightbulb,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

import "./styles/budgetInsights.css";

function BudgetInsights({ categories = [] }) {

  const insights = [];

  categories.forEach((item) => {

    if (item.limit === 0) return;

    const percentage =
      (item.spent / item.limit) * 100;

    if (percentage >= 100) {

      insights.push({
        icon: <FaExclamationTriangle />,
        color: "danger",
        text: `${item.category} budget exceeded by ₹${(
          item.spent - item.limit
        ).toLocaleString()}.`,
      });

    } else if (percentage >= 80) {

      insights.push({
        icon: <FaExclamationTriangle />,
        color: "warning",
        text: `${item.category} budget is almost exhausted.`,
      });

    } else {

      insights.push({
        icon: <FaCheckCircle />,
        color: "success",
        text: `${item.category} spending is under control.`,
      });

    }

  });

  return (

    <div className="budget-insights">

      <div className="budget-insights-title">

        <FaLightbulb />

        <h2>Budget Insights</h2>

      </div>

      {insights.length === 0 ? (

        <p>No insights available.</p>

      ) : (

        insights.map((item, index) => (

          <div
            key={index}
            className={`insight-card ${item.color}`}
          >

            {item.icon}

            <span>{item.text}</span>

          </div>

        ))

      )}

    </div>

  );

}

export default BudgetInsights;
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import "./styles/budgetUsageGauge.css";

function BudgetUsageGauge({
  totalBudget = 0,
  totalSpent = 0,
}) {

  const percentage =
    totalBudget === 0
      ? 0
      : Math.min(
          Math.floor((totalSpent / totalBudget) * 100),
          100
        );

  let color = "#22c55e";

  if (percentage >= 90) {

    color = "#ef4444";

  } else if (percentage >= 70) {

    color = "#f59e0b";

  }

  return (

    <div className="budget-gauge-card">

      <h2>

        Budget Usage

      </h2>

      <div className="budget-gauge">

        <CircularProgressbar

          value={percentage}

          text={`${percentage}%`}

          styles={buildStyles({

            pathColor: color,

            textColor: "#0f172a",

            trailColor: "#e5e7eb",

            strokeLinecap: "round",

            textSize: "18px",

          })}

        />

      </div>

      <div className="budget-gauge-footer">

        <span>

          Budget

          <strong>

            ₹{totalBudget.toLocaleString()}

          </strong>

        </span>

        <span>

          Spent

          <strong>

            ₹{totalSpent.toLocaleString()}

          </strong>

        </span>

      </div>

    </div>

  );

}

export default BudgetUsageGauge;
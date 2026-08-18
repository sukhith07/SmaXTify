import {
  FaBell,
  FaExclamationCircle,
} from "react-icons/fa";

import "./styles/budgetAlerts.css";

function BudgetAlerts({ categories = [] }) {

  const alerts = categories.filter((item) => {

    if (item.limit === 0) return false;

    return (item.spent / item.limit) * 100 >= 90;

  });

  if (alerts.length === 0) return null;

  return (

    <div className="budget-alerts">

      <div className="alerts-title">

        <FaBell />

        <h2>Budget Alerts</h2>

      </div>

      {alerts.map((item) => (

        <div
          key={item.category}
          className="alert-card"
        >

          <FaExclamationCircle />

          <span>

            {item.spent > item.limit
              ? `${item.category} budget exceeded by ₹${(
                  item.spent - item.limit
                ).toLocaleString()}`
              : `${item.category} budget reached ${Math.floor(
                  (item.spent / item.limit) * 100
                )}%`}

          </span>

        </div>

      ))}

    </div>

  );

}

export default BudgetAlerts;
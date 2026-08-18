import "./styles/budgetCategoryCard.css";

function BudgetCategoryCard({
  category,
  limit,
  spent,
}) {

  const hasBudget = limit > 0;

  const remaining = hasBudget
    ? limit - spent
    : 0;

  const percentage = hasBudget
    ? Math.min(
        Math.round((spent / limit) * 100),
        100
      )
    : 0;

  let color = "#22c55e";

  if (hasBudget) {
    if (percentage >= 90) {
      color = "#ef4444";
    } else if (percentage >= 70) {
      color = "#f59e0b";
    }
  }

  return (

    <div className="budget-category-card">

      <div className="budget-category-header">

        <h3>{category}</h3>

        <span>
          {hasBudget ? `${percentage}%` : "--"}
        </span>

      </div>

      <div className="budget-progress">

        <div
          className="budget-progress-fill"
          style={{
            width: hasBudget
              ? `${percentage}%`
              : "0%",
            background: color,
          }}
        />

      </div>

      <div className="budget-values">

        <div>

          <small>Budget</small>

          <strong>
            {hasBudget
              ? `₹${limit.toLocaleString()}`
              : "Not Set"}
          </strong>

        </div>

        <div>

          <small>Spent</small>

          <strong>
            ₹{spent.toLocaleString()}
          </strong>

        </div>

        <div>

          <small>
            {hasBudget
              ? "Remaining"
              : "Status"}
          </small>

          <strong
            style={{
              color: hasBudget
                ? remaining < 0
                  ? "#ef4444"
                  : "#22c55e"
                : spent > 0
                ? "#f59e0b"
                : "#64748b",
            }}
          >
            {hasBudget
              ? `₹${remaining.toLocaleString()}`
              : spent > 0
              ? "No Budget"
              : "--"}
          </strong>

        </div>

      </div>

      {!hasBudget && spent > 0 && (

        <div className="budget-warning">

          ⚠ No Budget Assigned

        </div>

      )}

      {hasBudget && remaining < 0 && (

        <div className="budget-warning">

          ⚠ Over Budget by ₹
          {Math.abs(remaining).toLocaleString()}

        </div>

      )}

    </div>

  );

}

export default BudgetCategoryCard;
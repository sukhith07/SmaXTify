import {
  FaEdit,
  FaTrash,
  FaPiggyBank,
  FaCalendarAlt,
  FaCheckCircle,
} from "react-icons/fa";

import "./styles/goalCard.css";

function GoalCard({
  goal,
  onAddSavings,
  onEdit,
  onDelete,
}) {
  // ==========================
  // Values
  // ==========================

  const saved = Number(goal?.savedAmount) || 0;
  const target = Number(goal?.targetAmount) || 0;

  // Remaining amount
  const remaining = Math.max(target - saved, 0);

  // Goal completed
  const completed = target > 0 && saved >= target;

  // ==========================
  // Progress
  // ==========================

  const percentage =
    target > 0
      ? Math.min(
          Math.floor((saved / target) * 100),
          100
        )
      : 0;

  // ==========================
  // Progress Color
  // ==========================

  let progressColor = "#ef4444";

  if (percentage >= 70) {
    progressColor = "#22c55e";
  } else if (percentage >= 31) {
    progressColor = "#f59e0b";
  }

  // ==========================
  // Currency Formatter
  // ==========================

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  // ==========================
  // Date Formatter
  // ==========================

  const formatDate = (date) => {
    if (!date) {
      return "No Target Date";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "No Target Date";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="goal-card">

      {/* =================================
          HEADER
      ================================= */}

      <div className="goal-header">

        <div className="goal-icon">
          {goal?.icon || "🎯"}
        </div>

        <div className="goal-header-content">

          <h2>
            {goal?.title || "Savings Goal"}
          </h2>

          <p>
            <FaCalendarAlt />

            <span>
              {formatDate(goal?.targetDate)}
            </span>
          </p>

        </div>

      </div>

      {/* =================================
          STATUS
      ================================= */}

      {completed ? (

        <div className="goal-completed">

          <FaCheckCircle />

          <span>
            Goal Achieved 🎉
          </span>

        </div>

      ) : (

        <div className="goal-remaining">

          <span>
            💰
          </span>

          <span>
            {formatAmount(remaining)}
            {" "}
            remaining to achieve your goal
          </span>

        </div>

      )}

      {/* =================================
          PROGRESS
      ================================= */}

      <div className="goal-progress">

        <div className="progress-top">

          <span>
            Progress
          </span>

          <span>
            {percentage}%
          </span>

        </div>

        <div className="progress-bar">

          <div
            className="progress-fill"
            style={{
              width: `${percentage}%`,
              background: progressColor,
            }}
          />

        </div>

      </div>

      {/* =================================
          AMOUNT DETAILS
      ================================= */}

      <div className="goal-details">

        {/* Saved */}

        <div className="goal-detail-box">

          <small>
            Saved
          </small>

          <h3>
            {formatAmount(saved)}
          </h3>

        </div>

        {/* Target */}

        <div className="goal-detail-box">

          <small>
            Target
          </small>

          <h3>
            {formatAmount(target)}
          </h3>

        </div>

        {/* Remaining */}

        <div className="goal-detail-box">

          <small>
            Remaining
          </small>

          <h3
            className={
              completed
                ? "goal-remaining-value completed"
                : "goal-remaining-value"
            }
          >
            {formatAmount(remaining)}
          </h3>

        </div>

      </div>

      {/* =================================
          ACTIONS
      ================================= */}

      <div className="goal-actions">

        <button
          type="button"
          className="save-btn"
          disabled={completed}
          onClick={() => onAddSavings(goal)}
        >

          <FaPiggyBank />

          <span>
            {completed
              ? "Completed"
              : "Add Savings"}
          </span>

        </button>

        <button
          type="button"
          className="edit-btn"
          onClick={() => onEdit(goal)}
          aria-label="Edit goal"
        >

          <FaEdit />

        </button>

        <button
          type="button"
          className="delete-btn"
          onClick={() => onDelete(goal)}
          aria-label="Delete goal"
        >

          <FaTrash />

        </button>

      </div>

    </div>
  );
}

export default GoalCard;
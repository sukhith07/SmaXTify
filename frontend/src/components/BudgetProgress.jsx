import {
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";



function BudgetProgress({ categories = [] }) {

  const progress = categories.map((item) => {

    const limit = Number(item.limit || 0);
    const spent = Number(item.spent || 0);

    const percentage =
      limit === 0
        ? 0
        : Math.min(
            Math.round((spent / limit) * 100),
            100
          );

    const remaining = Math.max(limit - spent, 0);

    let status = "safe";

    if (percentage >= 100) {

      status = "danger";

    } else if (percentage >= 80) {

      status = "warning";

    }

    return {
      ...item,
      percentage,
      remaining,
      status,
    };

  });

  const getBadgeClass = (status) => {

    switch (status) {

      case "danger":
        return "progress-badge danger";

      case "warning":
        return "progress-badge warning";

      default:
        return "progress-badge success";

    }

  };

  const getRemainingClass = (status) => {

    switch (status) {

      case "danger":
        return "danger";

      case "warning":
        return "warning";

      default:
        return "remaining";

    }

  };

  const getIcon = (status) => {

    switch (status) {

      case "danger":
        return <FaTimesCircle />;

      case "warning":
        return <FaExclamationTriangle />;

      default:
        return <FaCheckCircle />;

    }

  };

  return (
        <div className="budget-progress-card">

      <div className="budget-progress-header">

        <FaChartLine />

        <h2>Budget Progress</h2>

      </div>

      {progress.length === 0 ? (

        <div className="progress-empty">

          <h3>📊 No Budget Progress</h3>

          <p>
            Create a monthly budget and add some
            expenses to track your spending.
          </p>

        </div>

      ) : (

        progress.map((item) => (

          <div
            key={item.category}
            className="progress-item"
          >

            <div className="progress-title">

              <span>
                {item.category}
              </span>

              <span>
                ₹{Number(item.spent).toLocaleString()} /
                ₹{Number(item.limit).toLocaleString()}
              </span>

            </div>

            <div className="progress-bar">

              <div
                className="progress-fill"
                style={{
                  width: `${item.percentage}%`,
                  background:
                    item.status === "danger"
                      ? "#dc2626"
                      : item.status === "warning"
                      ? "#f59e0b"
                      : "#22c55e",
                }}
              />

            </div>

            <div className="progress-footer">

              <small
                className={getRemainingClass(
                  item.status
                )}
              >
                Remaining ₹
                {Number(item.remaining).toLocaleString()}
              </small>

              <div
                className={getBadgeClass(
                  item.status
                )}
              >

                {getIcon(item.status)}

                &nbsp;

                {item.percentage}%

              </div>

            </div>

          </div>

        ))

      )}

    </div>

  );

}

export default BudgetProgress;
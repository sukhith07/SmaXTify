import {
  FaTrashAlt,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTrophy,
} from "react-icons/fa";

import "./styles/deleteConfirmModal.css";

function DeleteGoalModal({
  isOpen,
  goal,
  onClose,
  onConfirm,
  loading = false,
}) {
  if (!isOpen || !goal) return null;

  // Calculate completion automatically
  const isCompleted =
    Number(goal.savedAmount) >= Number(goal.targetAmount);

  return (
    <div className="delete-overlay">
      <div className="delete-modal">

        <button
          className="delete-close-btn"
          onClick={onClose}
        >
          <FaTimes />
        </button>

        {/* Icon */}

        <div
          className={
            isCompleted
              ? "delete-icon completed"
              : "delete-icon"
          }
        >
          {isCompleted ? (
            <FaTrophy />
          ) : (
            <FaTrashAlt />
          )}
        </div>

        {/* Heading */}

        <h2>
          {isCompleted
            ? "Remove Completed Goal?"
            : "Delete Goal?"}
        </h2>

        {/* Goal Name */}

        <p className="delete-message">
          Are you sure you want to delete{" "}
          <strong>
            {goal.icon} {goal.title}
          </strong>
          ?
        </p>

        {/* Message */}

        {isCompleted ? (
          <div className="warning-box success">

            <FaCheckCircle />

            <span>
              🏆 Congratulations! This goal has already been achieved.
              Deleting it will permanently remove it from your
              achievements and history.
            </span>

          </div>
        ) : (
          <div className="warning-box">

            <FaExclamationTriangle />

            <span>
              This action cannot be undone.
            </span>

          </div>
        )}

        {/* Buttons */}

        <div className="delete-buttons">

          <button
            className="cancel-delete"
            onClick={onClose}
            disabled={loading}
          >
            <FaTimes />
            Cancel
          </button>

          <button
            className="confirm-delete"
            onClick={onConfirm}
            disabled={loading}
          >
            <FaTrashAlt />

            {loading
              ? "Deleting..."
              : isCompleted
              ? "Remove Goal"
              : "Delete Goal"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default DeleteGoalModal;
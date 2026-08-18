import {
  FaTrashAlt,
  FaTimes,
  FaCheckCircle,
  FaTrophy,
} from "react-icons/fa";

import "./styles/deleteGoalModal.css";

function DeleteGoalModal({
  isOpen,
  onClose,
  onConfirm,
  goal,
  loading,
}) {
  if (!isOpen || !goal) return null;

  // Goal is completed only if saved amount reached target
  const isCompleted =
    Number(goal.savedAmount) >= Number(goal.targetAmount);

  return (
    <div className="modal-overlay">
      <div className="delete-goal-modal">

        <button
          className="close-btn"
          onClick={onClose}
        >
          <FaTimes />
        </button>

        {/* Top Icon */}

        <div
          className={`delete-icon ${
            isCompleted ? "completed" : ""
          }`}
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

        <p>
          Are you sure you want to delete{" "}
          <strong>
            {goal.icon} {goal.title}
          </strong>
          ?
        </p>

        {/* Message */}

        {isCompleted ? (
          <div className="completed-message">
            <FaCheckCircle />

            <span>
              🎉 Congratulations! You achieved this goal.
              Removing it will delete it permanently from
              your achievements and history.
            </span>
          </div>
        ) : (
          <span className="delete-note">
            This action cannot be undone.
          </span>
        )}

        {/* Buttons */}

        <div className="delete-buttons">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="confirm-delete-btn"
            onClick={onConfirm}
            disabled={loading}
          >
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
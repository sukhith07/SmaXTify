import {
  FaTrashAlt,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";

import "./styles/deleteConfirmModal.css";

function DeleteConfirmModal({
  isOpen,
  title,
  onClose,
  onConfirm,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="delete-overlay">
      <div className="delete-modal">
        <button
          type="button"
          className="delete-close-btn"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
        >
          <FaTimes />
        </button>

        <div className="delete-icon">
          <FaTrashAlt />
        </div>

        <h2>Delete Transaction?</h2>

        <p className="delete-message">
          Are you sure you want to delete this
          transaction?
        </p>

        {title && (
          <div className="delete-item-name">
            {title}
          </div>
        )}

        <div className="warning-box">
          <FaExclamationTriangle />

          <span>
            This transaction will be permanently
            removed from your transaction history.
          </span>
        </div>

        <div className="delete-buttons">
          <button
            type="button"
            className="cancel-delete"
            onClick={onClose}
            disabled={loading}
          >
            <FaTimes />
            Cancel
          </button>

          <button
            type="button"
            className="confirm-delete"
            onClick={onConfirm}
            disabled={loading}
          >
            <FaTrashAlt />

            {loading
              ? "Deleting..."
              : "Delete Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
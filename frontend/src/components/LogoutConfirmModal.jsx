import { FaSignOutAlt, FaTimes } from "react-icons/fa";
import "./styles/logoutConfirmModal.css";

function LogoutConfirmModal({
  isOpen,
  onClose,
  onLogout,
}) {
  if (!isOpen) return null;

  return (
    <div className="logout-overlay">

      <div className="logout-modal">

        <div className="logout-header">

          <FaSignOutAlt />

          <h2>Logout</h2>

        </div>

        <p className="logout-message">
          Are you sure you want to logout?
        </p>

        <div className="logout-buttons">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            <FaTimes />
            Cancel
          </button>

          <button
            className="logout-confirm-btn"
            onClick={onLogout}
          >
            <FaSignOutAlt />
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}

export default LogoutConfirmModal;
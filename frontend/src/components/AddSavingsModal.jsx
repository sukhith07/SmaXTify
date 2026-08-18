import { useState, useEffect } from "react";
import { FaPiggyBank, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../services/api";

import "./styles/addSavingsModal.css";

function AddSavingsModal({
  isOpen,
  onClose,
  goal,
  loadGoals,
}) {

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (isOpen) {

      setAmount("");

    }

  }, [isOpen]);

  if (!isOpen || !goal) return null;

  const remaining =
    goal.targetAmount - goal.savedAmount;

  const handleSave = async () => {

    const value = Number(amount);

    if (amount === "") {

      toast.error("Please enter an amount.");

      return;

    }

    if (isNaN(value)) {

      toast.error("Only numbers are allowed.");

      return;

    }

    if (value <= 0) {

      toast.error(
        "Amount must be greater than 0."
      );

      return;

    }

    if (value > remaining) {

      toast.error(
        `You can add only ₹${remaining.toLocaleString()}`
      );

      return;

    }

    try {

      setLoading(true);

      await API.put(
        `/goals/${goal._id}/add`,
        {
          amount: value,
        }
      );

      if (value === remaining) {

        toast.success(
          "🎉 Goal Completed!"
        );

      } else {

        toast.success(
          "Savings Added Successfully"
        );

      }

      loadGoals();

      onClose();

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to add savings."
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="modal-overlay">

      <div className="add-savings-modal">

        <button
          className="close-btn"
          onClick={onClose}
        >

          <FaTimes />

        </button>

        <h2>

          <FaPiggyBank />

          Add Savings

        </h2>

        <p className="goal-name">

          {goal.icon} {goal.title}

        </p>

        <div className="goal-summary">

          <div>

            <small>Saved</small>

            <strong>

              ₹{goal.savedAmount.toLocaleString()}

            </strong>

          </div>

          <div>

            <small>Remaining</small>

            <strong>

              ₹{remaining.toLocaleString()}

            </strong>

          </div>

        </div>

        <input
          type="number"
          placeholder="Enter Amount"
          min="1"
          max={remaining}
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
        />

        <button
          className="save-savings-btn"
          onClick={handleSave}
          disabled={loading}
        >

          {loading
            ? "Saving..."
            : "Add Savings"}

        </button>

      </div>

    </div>

  );

}

export default AddSavingsModal;
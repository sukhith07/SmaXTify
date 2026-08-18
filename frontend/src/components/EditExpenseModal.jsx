import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  FaEdit,
  FaWallet,
  FaTag,
  FaRupeeSign,
  FaTimes,
  FaSave,
  FaChevronDown,
  FaMoneyBillWave,
  FaCoins,
} from "react-icons/fa";

import API from "../services/api";
import "./styles/editExpenseModal.css";

function EditExpenseModal({
  isOpen,
  onClose,
  expense,
  onUpdate,
}) {

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    amount: "",
    type: "Expense",
  });

  const [loading, setLoading] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {

    if (expense) {

      setFormData({
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
        type: expense.type,
      });

    }

  }, [expense]);

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {

        setDropdownOpen(false);

      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);

  if (!isOpen) return null;

  // -----------------------------
  // AI Category Detection
  // -----------------------------

  const detectCategory = (title, type) => {

    if (type === "Income")
      return "";

    const text = title.toLowerCase();

    const categories = {

      Food: [
        "pizza",
        "food",
        "lunch",
        "dinner",
        "breakfast",
        "coffee",
        "tea",
        "restaurant",
      ],

      Transport: [
        "uber",
        "ola",
        "bus",
        "fuel",
        "petrol",
        "diesel",
      ],

      Shopping: [
        "amazon",
        "flipkart",
        "shopping",
        "shoe",
        "shirt",
        "dress",
      ],

      Bills: [
        "electricity",
        "wifi",
        "internet",
        "bill",
        "gas",
      ],

      Education: [
        "book",
        "books",
        "college",
        "course",
      ],

      Entertainment: [
        "movie",
        "netflix",
        "spotify",
        "game",
      ],

    };

    for (const key in categories) {

      if (
        categories[key].some(word =>
          text.includes(word)
        )
      ) {

        return key;

      }

    }

    return "";

  };
    // -----------------------------
  // Handle Input Change
  // -----------------------------

  const handleChange = (e) => {

    const { name, value } = e.target;

    let updated = {

      ...formData,

      [name]: value,

    };

    if (name === "title") {

      updated.category = detectCategory(
        value,
        formData.type
      );

    }

    setFormData(updated);

  };

  // -----------------------------
  // Select Transaction Type
  // -----------------------------

  const selectType = (type) => {

    setFormData(prev => ({

      ...prev,

      type,

      category: detectCategory(
        prev.title,
        type
      ),

    }));

    setDropdownOpen(false);

  };

  // -----------------------------
  // Update Transaction
  // -----------------------------

  const handleUpdate = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const res = await API.put(

        `/expenses/${expense._id}`,

        formData

      );

      onUpdate(res.data.expense);

      toast.success(
        "Transaction Updated Successfully!"
      );

      onClose();

    } catch (err) {

      toast.error(

        err.response?.data?.message ||

        "Update Failed"

      );

    } finally {

      setLoading(false);

    }

  };

  // -----------------------------
  // Current Selected Type
  // -----------------------------

  const currentType =

    formData.type === "Income"

      ? {

          icon: <FaCoins />,

          text: "Income",

        }

      : {

          icon: <FaMoneyBillWave />,

          text: "Expense",

        };

  return (

    <div className="modal-overlay">

      <div className="edit-modal">

        <div className="modal-header">

          <FaEdit />

          <h2>Edit Transaction</h2>

        </div>

        <form onSubmit={handleUpdate}>

          <div className="modal-input">

            <FaWallet />

            <input
              type="text"
              name="title"
              placeholder="Transaction Title"
              value={formData.title}
              onChange={handleChange}
              required
            />

          </div>

          <div className="modal-input">

            <FaTag />

            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              required
            />

          </div>

          <div className="modal-input">

            <FaRupeeSign />

            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />

          </div>
                    {/* Custom Transaction Type */}

          <div
            className="custom-select"
            ref={dropdownRef}
          >

            <label>Transaction Type</label>

            <button
              type="button"
              className="select-btn"
              onClick={() =>
                setDropdownOpen(!dropdownOpen)
              }
            >

              <span className="selected-item">

                {currentType.icon}

                {currentType.text}

              </span>

              <FaChevronDown
                className={
                  dropdownOpen
                    ? "rotate"
                    : ""
                }
              />

            </button>

            {dropdownOpen && (

              <div className="select-menu">

                <div
                  className={
                    formData.type === "Expense"
                      ? "select-option active"
                      : "select-option"
                  }
                  onClick={() =>
                    selectType("Expense")
                  }
                >

                  <FaMoneyBillWave />

                  Expense

                </div>

                <div
                  className={
                    formData.type === "Income"
                      ? "select-option active"
                      : "select-option"
                  }
                  onClick={() =>
                    selectType("Income")
                  }
                >

                  <FaCoins />

                  Income

                </div>

              </div>

            )}

          </div>

          <div className="modal-buttons">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >

              <FaTimes />

              Cancel

            </button>

            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >

              <FaSave />

              {loading
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default EditExpenseModal;
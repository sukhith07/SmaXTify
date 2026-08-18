import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaWallet,
  FaTag,
  FaRupeeSign,
  FaPlusCircle,
  FaChevronDown,
  FaMoneyBillWave,
  FaCoins,
} from "react-icons/fa";

import API from "../services/api";
import "./styles/addExpense.css";

function AddExpense({ expenses = [], setExpenses }) {

  const [expense, setExpense] = useState({
    title: "",
    category: "",
    amount: "",
    type: "Expense",
  });

  const [loading, setLoading] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
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

  // ==========================
  // AI Category Detection
  // ==========================

  const detectCategory = (title, type) => {

    if (type === "Income")
      return "";

    const text = title.toLowerCase();

    const categories = {

      Food: [
        "food",
        "pizza",
        "burger",
        "coffee",
        "tea",
        "breakfast",
        "lunch",
        "dinner",
        "restaurant",
        "swiggy",
        "zomato",
      ],

      Transport: [
        "uber",
        "ola",
        "bus",
        "metro",
        "cab",
        "taxi",
        "petrol",
        "diesel",
        "fuel",
      ],

      Shopping: [
        "amazon",
        "flipkart",
        "shopping",
        "dress",
        "shirt",
        "shoe",
        "bag",
      ],

      Bills: [
        "bill",
        "electricity",
        "water",
        "wifi",
        "internet",
        "recharge",
        "gas",
      ],

      Entertainment: [
        "movie",
        "netflix",
        "prime",
        "spotify",
        "game",
        "gaming",
      ],

      Health: [
        "hospital",
        "doctor",
        "medicine",
        "medical",
        "pharmacy",
        "Insurance"
      ],

    };

    for (const category in categories) {

      if (
        categories[category].some(keyword =>
          text.includes(keyword)
        )
      ) {

        return category;

      }

    }

    return "";

  };

  // ==========================
  // Handle Input Change
  // ==========================

   const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedExpense = {
      ...expense,
      [name]: value,
    };

    if (name === "title") {
      updatedExpense.category = detectCategory(value, expense.type);
    }

    setExpense(updatedExpense);
  };
    // ==========================
  // Select Transaction Type
  // ==========================

  const selectType = (type) => {

    setExpense(prev => ({

      ...prev,

      type,

      category: detectCategory(
        prev.title,
        type
      ),

    }));

    setDropdownOpen(false);

  };

  // ==========================
  // Submit Transaction
  // ==========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const res = await API.post(

        "/expenses",

        expense

      );

      setExpenses(prev => [

        ...prev,

        res.data.expense,

      ]);

      toast.success(
        "Transaction Added Successfully!"
      );

      setExpense({

        title: "",

        category: "",

        amount: "",

        type: "Expense",

      });

      setDropdownOpen(false);

    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Failed to add transaction."

      );

    } finally {

      setLoading(false);

    }

  };

  // ==========================
  // Current Selected Type
  // ==========================

  const currentType = expense.type === "Income"

    ? {

        icon: <FaCoins />,

        text: "Income",

      }

    : {

        icon: <FaMoneyBillWave />,

        text: "Expense",

      };
        return (

    <div className="expense-form" id="add-expense">

      <h2>

        <FaPlusCircle />

        Add Transaction

      </h2>

      <form onSubmit={handleSubmit}>

        {/* Title */}

        <div className="field">

          <label>Transaction Title</label>

          <div className="input-box">

            <FaWallet />

            <input
              type="text"
              name="title"
              placeholder="Lunch, Salary..."
              value={expense.title}
              onChange={handleChange}
              required
            />

          </div>

        </div>

        {/* Category */}

        <div className="field">

          <label>Category</label>

          <div className="input-box">

            <FaTag />

            <input
              type="text"
              name="category"
              placeholder="AI Auto Detect"
              value={expense.category}
              onChange={handleChange}
              required
            />

          </div>

        </div>

        {/* Amount */}

        <div className="field">

          <label>Amount</label>

          <div className="input-box">

            <FaRupeeSign />

            <input
              type="number"
              name="amount"
              placeholder="₹0"
              value={expense.amount}
              onChange={handleChange}
              required
            />

          </div>

        </div>

        {/* Custom Dropdown */}

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
                  expense.type === "Expense"
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
                  expense.type === "Income"
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

        <button
          className="add-btn"
          type="submit"
          disabled={loading}
        >

          <FaPlusCircle />

          {loading
            ? "Adding..."
            : "Add Transaction"}

        </button>

      </form>

    </div>

  );

};

export default AddExpense;
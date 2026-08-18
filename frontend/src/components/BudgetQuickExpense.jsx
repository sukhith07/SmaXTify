  import { useState } from "react";
  import {
    FaPlusCircle,
    FaWallet,
    FaTag,
    FaCalendarAlt,
    FaFileInvoiceDollar,
  } from "react-icons/fa";
  import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
  import Select from "react-select";
  import DatePicker from "react-datepicker";

  import "react-datepicker/dist/react-datepicker.css";
  import { toast } from "react-toastify";
  import API from "../services/api";

  import "./styles/budgetQuickExpense.css";

  const categoryOptions = [
    { value: "Food", label: "🍔 Food" },
    { value: "Transport", label: "🚌 Transport" },
    { value: "Shopping", label: "🛍 Shopping" },
    { value: "Bills", label: "💡 Bills" },
    { value: "Entertainment", label: "🎬 Entertainment" },
    { value: "Healthcare", label: "🏥 Healthcare" },
    { value: "Education", label: "🎓 Education" },
    { value: "Travel", label: "✈️ Travel" },
    { value: "Groceries", label: "🛒 Groceries" },
    { value: "Rent", label: "🏠 Rent" },
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Helper functions for local date parsing and formatting
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const formatLocalDate = (dateObj) => {
    if (!dateObj) return "";
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  function BudgetQuickExpense({ onExpenseAdded }) {
    const today = formatLocalDate(new Date());

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
      title: "",
      category: "",
      amount: "",
      date: today,
    });

    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 30; year <= currentYear + 10; year++) {
      years.push(year);
    }

    // ==========================
    // Handle Input Change
    // ==========================
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    // ==========================
    // Reset Form
    // ==========================
    const resetForm = () => {
      setFormData({
        title: "",
        category: "",
        amount: "",
        date: today,
      });
    };

    // ==========================
    // Add Expense
    // ==========================
    const addExpense = async (e) => {
      e.preventDefault();

      if (!formData.title.trim()) {
        return toast.warning("Please enter expense title");
      }

      if (!formData.category) {
        return toast.warning("Please select a category");
      }

      if (!formData.amount || Number(formData.amount) <= 0) {
        return toast.warning("Please enter a valid amount");
      }

      if (!formData.date) {
        return toast.warning("Please select a date");
      }

      try {
        setLoading(true);

        await API.post("/expenses", {
          title: formData.title.trim(),
          category: formData.category,
          amount: Number(formData.amount),
          type: "Expense",
          date: formData.date,
        });

        toast.success("Expense Added Successfully");

        resetForm();

        if (onExpenseAdded) {
          await onExpenseAdded();
        }
      } catch (err) {
        console.error(err);
        toast.error(
          err.response?.data?.message || "Failed to add expense"
        );
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="quick-expense-card">
        {/* Header */}
        <div className="quick-expense-header">
          <div className="quick-expense-icon">
            <FaPlusCircle />
          </div>

          <div>
            <h2>Quick Add Expense</h2>
            <p>
              Record an expense instantly without leaving your Budget Planner.
            </p>
          </div>
        </div>

        <form className="quick-expense-form" onSubmit={addExpense}>
          {/* Expense Title */}
          <div className="quick-input">
            <label htmlFor="quick-expense-title">
              <FaFileInvoiceDollar />
              Expense Title
            </label>

            <input
              id="quick-expense-title"
              type="text"
              name="title"
              placeholder="e.g. Lunch"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Category */}
          <div className="quick-input">
            <label id="quick-expense-category-label">
              <FaTag />
              Category
            </label>

            <Select
              aria-labelledby="quick-expense-category-label"
              classNamePrefix="budget-select"
              options={categoryOptions}
              isSearchable={false}
              placeholder="Select Category"
              value={
                categoryOptions.find(
                  (option) => option.value === formData.category
                ) || null
              }
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  category: selected ? selected.value : "",
                }))
              }
            />
          </div>

          {/* Amount */}
          <div className="quick-input">
            <label htmlFor="quick-expense-amount">
              <FaWallet />
              Amount
            </label>

            <input
              id="quick-expense-amount"
              type="number"
              name="amount"
              min="1"
              placeholder="₹ Enter Amount"
              value={formData.amount}
              onChange={handleChange}
            />
          </div>

          {/* Date */}
          <div className="quick-input">
            <label htmlFor="quick-expense-date">
              <FaCalendarAlt />
              Date
            </label>

            <DatePicker
              id="quick-expense-date"
              selected={parseLocalDate(formData.date)}
              onChange={(selectedDate) => {
                if (!selectedDate) return;
                setFormData((prev) => ({
                  ...prev,
                  date: formatLocalDate(selectedDate),
                }));
              }}
              dateFormat="dd MMM yyyy"
              className="datepicker"
              placeholderText="Select Date"
              popperPlacement="bottom-start"
              renderCustomHeader={({
                date,
                changeYear,
                changeMonth,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => (
                <div className="custom-datepicker-header">
                  <div className="custom-datepicker-nav-row">
                    <button
                      type="button"
                      className="calendar-nav-btn"
                      onClick={decreaseMonth}
                      disabled={prevMonthButtonDisabled}
                      aria-label="Previous Month"
                    >
                      <FaChevronLeft />
                    </button>

                    <div className="custom-datepicker-dropdowns">
                      <select
                        className="datepicker-header-select"
                        value={date.getMonth()}
                        onChange={(e) => changeMonth(Number(e.target.value))}
                      >
                        {months.map((month, index) => (
                          <option key={month} value={index}>
                            {month}
                          </option>
                        ))}
                      </select>

                      <select
                        className="datepicker-header-select"
                        value={date.getFullYear()}
                        onChange={(e) => changeYear(Number(e.target.value))}
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      className="calendar-nav-btn"
                      onClick={increaseMonth}
                      disabled={nextMonthButtonDisabled}
                      aria-label="Next Month"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              )}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="quick-expense-btn"
            disabled={loading}
          >
            <FaPlusCircle />
            {loading ? "Adding Expense..." : "Add Expense"}
          </button>
        </form>
      </div>
    );
  }

  export default BudgetQuickExpense;
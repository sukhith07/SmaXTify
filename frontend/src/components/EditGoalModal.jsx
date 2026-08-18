import { useState, useEffect } from "react";

import {
  FaBullseye,
  FaRupeeSign,
  FaCalendarAlt,
  FaSave,
  FaTimes,
} from "react-icons/fa";

import {
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { toast } from "react-toastify";
import API from "../services/api";

import "./styles/editGoalModal.css";

const goalIcons = [
  "🎯",
  "💻",
  "🚗",
  "🏍️",
  "🏠",
  "✈️",
  "📱",
  "🎓",
  "💍",
  "🎮",
  "💰",
  "🛒",
];

function EditGoalModal({
  isOpen,
  onClose,
  goal,
  loadGoals,
}) {

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    targetAmount: "",
    icon: "🎯",
    targetDate: null,
  });

  useEffect(() => {

    if (goal) {

      setForm({

        title: goal.title,

        targetAmount: goal.targetAmount,

        icon: goal.icon || "🎯",

        targetDate: goal.targetDate
          ? new Date(goal.targetDate)
          : null,

      });

    }

  }, [goal]);

  if (!isOpen || !goal) return null;

  const handleChange = (e) => {

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!form.title.trim()) {
      return toast.error("Goal title is required.");
    }

    if (Number(form.targetAmount) <= 0) {
      return toast.error(
        "Target amount must be greater than 0."
      );
    }

    if (
      Number(form.targetAmount) <
      goal.savedAmount
    ) {
      return toast.error(
        `Target amount cannot be less than ₹${goal.savedAmount.toLocaleString()}`
      );
    }

    try {

      setLoading(true);

      await API.put(`/goals/${goal._id}`, {

        title: form.title,

        targetAmount: Number(form.targetAmount),

        icon: form.icon,

        targetDate: form.targetDate,

      });

      toast.success(
        "Goal Updated Successfully"
      );

      await loadGoals();

      onClose();

    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Failed to update goal"

      );

    } finally {

      setLoading(false);

    }

  };

  // ==========================================
  // Premium Calendar Header
  // ==========================================

  const renderCalendarHeader = ({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => {

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

    const currentYear =
      new Date().getFullYear();

    const years = [];

    for (
      let year = currentYear;
      year <= currentYear + 20;
      year++
    ) {
      years.push(year);
    }

    return (

      <div className="goal-calendar-header">

        <h2>

          {months[date.getMonth()]}{" "}
          {date.getFullYear()}

        </h2>

        <div className="goal-calendar-controls">

          <button
            type="button"
            className="goal-calendar-nav"
            onClick={decreaseMonth}
            disabled={prevMonthButtonDisabled}
          >

            <FaChevronLeft />

          </button>

          <select
            value={months[date.getMonth()]}
            onChange={({ target: { value } }) =>
              changeMonth(
                months.indexOf(value)
              )
            }
          >

            {months.map((month) => (

              <option
                key={month}
                value={month}
              >
                {month}
              </option>

            ))}

          </select>

          <select
            value={date.getFullYear()}
            onChange={({ target: { value } }) =>
              changeYear(Number(value))
            }
          >

            {years.map((year) => (

              <option
                key={year}
                value={year}
              >
                {year}
              </option>

            ))}

          </select>

          <button
            type="button"
            className="goal-calendar-nav"
            onClick={increaseMonth}
            disabled={nextMonthButtonDisabled}
          >

            <FaChevronRight />

          </button>

        </div>

      </div>

    );

  };
    return (

    <div className="modal-overlay">

      <div className="edit-goal-modal">

        <button
          type="button"
          className="close-btn"
          onClick={onClose}
        >

          <FaTimes />

        </button>

        <h2>

          ✏️ Edit Goal

        </h2>

        <form onSubmit={handleSubmit}>

          {/* ==========================
              Goal Name
          ========================== */}

          <div className="field">

            <label>

              <FaBullseye />

              Goal Name

            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter Goal Name"
            />

          </div>

          {/* ==========================
              Target Amount
          ========================== */}

          <div className="field">

            <label>

              <FaRupeeSign />

              Target Amount

            </label>

            <input
              type="number"
              name="targetAmount"
              value={form.targetAmount}
              onChange={handleChange}
              placeholder="₹ 0"
            />

          </div>

          {/* ==========================
              Goal Icon
          ========================== */}

          <div className="field">

            <label>

              🎯 Choose Goal Icon

            </label>

            <div className="icon-picker">

              {goalIcons.map((emoji) => (

                <button
                  key={emoji}
                  type="button"
                  className={
                    form.icon === emoji
                      ? "goal-icon active"
                      : "goal-icon"
                  }
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      icon: emoji,
                    }))
                  }
                >

                  {emoji}

                </button>

              ))}

            </div>

          </div>

          {/* ==========================
              Target Date
          ========================== */}

          <div className="field">

            <label>

              <FaCalendarAlt />

              Target Date

            </label>

            <DatePicker
              selected={form.targetDate}
              onChange={(date) =>
                setForm((prev) => ({
                  ...prev,
                  targetDate: date,
                }))
              }

              className="datepicker"

              placeholderText="Select Target Date"

              dateFormat="dd MMM yyyy"

              minDate={new Date()}

              popperPlacement="bottom-start"

              todayButton="Today"

              showMonthDropdown

              showYearDropdown

              dropdownMode="select"

              scrollableYearDropdown

              yearDropdownItemNumber={100}

              renderCustomHeader={renderCalendarHeader}
            />
                      </div>

          {/* ==========================
              Action Buttons
          ========================== */}

          <div className="goal-buttons">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="update-btn"
              disabled={loading}
            >

              <FaSave />

              {loading
                ? "Updating..."
                : "Save Changes"}

            </button>

          </div>

        </form>

      </div>

    </div>
      );

}

export default EditGoalModal;
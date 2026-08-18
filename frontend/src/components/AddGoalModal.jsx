import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  FaTimes,
  FaBullseye,
} from "react-icons/fa";

import {
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";

import { toast } from "react-toastify";

import API from "../services/api";

import "./styles/addGoalModal.css";

const icons = [
  "🎯",
  "💻",
  "🚗",
  "🏍️",
  "🏠",
  "✈️",
  "🎓",
  "💍",
  "🎮",
  "📱",
  "🚀",
  "🏖️",
];

function AddGoalModal({
  isOpen,
  onClose,
  loadGoals,
}) {

  const [loading, setLoading] = useState(false);

  /* ==========================================================
     MOBILE DETECTION
  ========================================================== */

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined"
      ? window.innerWidth <= 600
      : false
  );

  useEffect(() => {

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };

  }, []);

  /* ==========================================================
     FORM STATE
  ========================================================== */

  const [goal, setGoal] = useState({
    title: "",
    targetAmount: "",
    savedAmount: "",
    targetDate: null,
    icon: "🎯",
  });

  if (!isOpen) return null;

  /* ==========================================================
     HANDLE INPUT
  ========================================================== */

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setGoal((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  /* ==========================================================
     RESET FORM
  ========================================================== */

  const resetForm = () => {

    setGoal({
      title: "",
      targetAmount: "",
      savedAmount: "",
      targetDate: null,
      icon: "🎯",
    });

  };

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!goal.title.trim()) {

      return toast.error(
        "Goal title is required."
      );

    }

    if (
      Number(goal.targetAmount) <= 0
    ) {

      return toast.error(
        "Enter a valid target amount."
      );

    }

    try {

      setLoading(true);

      await API.post("/goals", {

        title: goal.title,

        targetAmount:
          Number(goal.targetAmount),

        savedAmount:
          Number(goal.savedAmount || 0),

        targetDate:
          goal.targetDate,

        icon:
          goal.icon,

      });

      toast.success(
        "Goal Created Successfully!"
      );

      await loadGoals();

      resetForm();

      onClose();

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to create goal."
      );

    } finally {

      setLoading(false);

    }

  };

  /* ==========================================================
     PREMIUM CALENDAR HEADER
  ========================================================== */

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

          {/* PREVIOUS */}

          <button
            type="button"
            className="goal-calendar-nav"
            onClick={decreaseMonth}
            disabled={
              prevMonthButtonDisabled
            }
            aria-label="Previous month"
          >
            <FaChevronLeft />
          </button>

          {/* MONTH */}

          <select
            value={
              months[date.getMonth()]
            }
            onChange={({
              target: { value },
            }) =>
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

          {/* YEAR */}

          <select
            value={
              date.getFullYear()
            }
            onChange={({
              target: { value },
            }) =>
              changeYear(
                Number(value)
              )
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

          {/* NEXT */}

          <button
            type="button"
            className="goal-calendar-nav"
            onClick={increaseMonth}
            disabled={
              nextMonthButtonDisabled
            }
            aria-label="Next month"
          >
            <FaChevronRight />
          </button>

        </div>

      </div>

    );

  };

  /* ==========================================================
     CLOSE MODAL
  ========================================================== */

  const handleClose = () => {

    if (loading) return;

    resetForm();

    onClose();

  };

  return (

    <div className="goal-modal-overlay">

      <div className="goal-modal">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="goal-modal-header">

          <h2>

            <FaBullseye />

            <span>
              Create Savings Goal
            </span>

          </h2>

          <button
            type="button"
            className="goal-close-btn"
            onClick={handleClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>

        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          className="goal-form"
          onSubmit={handleSubmit}
        >

          {/* GOAL NAME */}

          <div className="goal-form-field">

            <label>
              Goal Name
            </label>

            <input
              type="text"
              name="title"
              placeholder="MacBook, Bike..."
              value={goal.title}
              onChange={handleChange}
              required
            />

          </div>

          {/* TARGET AMOUNT */}

          <div className="goal-form-field">

            <label>
              Target Amount
            </label>

            <input
              type="number"
              name="targetAmount"
              placeholder="₹50000"
              value={goal.targetAmount}
              onChange={handleChange}
              min="1"
              required
            />

          </div>

          {/* INITIAL SAVINGS */}

          <div className="goal-form-field">

            <label>
              Initial Savings
            </label>

            <input
              type="number"
              name="savedAmount"
              placeholder="₹0"
              value={goal.savedAmount}
              onChange={handleChange}
              min="0"
            />

          </div>

          {/* TARGET DATE */}

          <div className="goal-form-field">

            <label>
              Target Date
            </label>

            <DatePicker

              selected={
                goal.targetDate
              }

              onChange={(date) =>
                setGoal((prev) => ({
                  ...prev,
                  targetDate: date,
                }))
              }

              className="goal-datepicker"

              placeholderText={
                "Select Target Date"
              }

              dateFormat="dd MMM yyyy"

              minDate={new Date()}

              todayButton="Today"

              showMonthDropdown

              showYearDropdown

              dropdownMode="select"

              scrollableYearDropdown

              yearDropdownItemNumber={100}

              renderCustomHeader={
                renderCalendarHeader
              }

              /* ==================================================
                 MOBILE FIX
              ================================================== */

              withPortal={isMobile}

              portalId={
                "goal-date-picker-portal"
              }

              popperPlacement={
                "bottom-start"
              }

              popperModifiers={[
                {
                  name: "flip",
                  options: {
                    fallbackPlacements: [],
                  },
                },
                {
                  name: "preventOverflow",
                  options: {
                    boundary: "viewport",
                    padding: 8,
                  },
                },
              ]}

            />

          </div>

          {/* GOAL ICON */}

          <div className="goal-form-field">

            <label>
              Select Goal Icon
            </label>

            <div className="goal-icons">

              {icons.map((emoji) => (

                <button
                  key={emoji}
                  type="button"
                  className={
                    goal.icon === emoji
                      ? "goal-icon active"
                      : "goal-icon"
                  }
                  onClick={() =>
                    setGoal((prev) => ({
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

          {/* ==================================================
              BUTTONS
          ================================================== */}

          <div className="goal-buttons">

            <button
              type="button"
              className="cancel-btn"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-goal-btn"
              disabled={loading}
            >

              {loading
                ? "Creating..."
                : "Create Goal"}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default AddGoalModal;
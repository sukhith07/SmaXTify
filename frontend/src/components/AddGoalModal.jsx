import { useEffect, useRef, useState } from "react";
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

const weekdays = [
  "SU",
  "MO",
  "TU",
  "WE",
  "TH",
  "FR",
  "SA",
];

function AddGoalModal({
  isOpen,
  onClose,
  loadGoals,
}) {
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] =
    useState(false);

  const [calendarDate, setCalendarDate] =
    useState(new Date());

  const calendarRef = useRef(null);
  const dateFieldRef = useRef(null);

  const [goal, setGoal] = useState({
    title: "",
    targetAmount: "",
    savedAmount: "",
    targetDate: null,
    icon: "🎯",
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        if (calendarOpen) {
          setCalendarOpen(false);
          return;
        }

        if (!loading) {
          handleClose();
        }
      }
    };

    const handleOutsideClick = (event) => {
      if (
        calendarOpen &&
        calendarRef.current &&
        dateFieldRef.current &&
        !calendarRef.current.contains(
          event.target
        ) &&
        !dateFieldRef.current.contains(
          event.target
        )
      ) {
        setCalendarOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [
    isOpen,
    calendarOpen,
    loading,
  ]);

  if (!isOpen) {
    return null;
  }

  const today = new Date();

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

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

  const resetForm = () => {
    setGoal({
      title: "",
      targetAmount: "",
      savedAmount: "",
      targetDate: null,
      icon: "🎯",
    });

    setCalendarOpen(false);
    setCalendarDate(new Date());
  };

  const handleClose = () => {
    if (loading) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!goal.title.trim()) {
      toast.error(
        "Goal title is required."
      );
      return;
    }

    if (Number(goal.targetAmount) <= 0) {
      toast.error(
        "Enter a valid target amount."
      );
      return;
    }

    if (
      Number(goal.savedAmount || 0) >
      Number(goal.targetAmount)
    ) {
      toast.error(
        "Initial savings cannot be greater than the target amount."
      );
      return;
    }

    try {
      setLoading(true);

      await API.post("/goals", {
        title: goal.title.trim(),
        targetAmount: Number(
          goal.targetAmount
        ),
        savedAmount: Number(
          goal.savedAmount || 0
        ),
        targetDate: goal.targetDate,
        icon: goal.icon,
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

  const getDaysInMonth = (
    year,
    month
  ) => {
    return new Date(
      year,
      month + 1,
      0
    ).getDate();
  };

  const getFirstDayOfMonth = (
    year,
    month
  ) => {
    return new Date(
      year,
      month,
      1
    ).getDay();
  };

  const isSameDay = (
    date1,
    date2
  ) => {
    if (!date1 || !date2) {
      return false;
    }

    return (
      date1.getFullYear() ===
        date2.getFullYear() &&
      date1.getMonth() ===
        date2.getMonth() &&
      date1.getDate() ===
        date2.getDate()
    );
  };

  const isBeforeToday = (
    year,
    month,
    day
  ) => {
    const date = new Date(
      year,
      month,
      day
    );

    return date < startOfToday;
  };

  const selectDate = (
    year,
    month,
    day
  ) => {
    if (
      isBeforeToday(
        year,
        month,
        day
      )
    ) {
      return;
    }

    const selectedDate = new Date(
      year,
      month,
      day
    );

    setGoal((prev) => ({
      ...prev,
      targetDate: selectedDate,
    }));

    setCalendarOpen(false);
  };

  const goPreviousMonth = () => {
    const minimumMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const currentMonth = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      1
    );

    if (
      currentMonth <= minimumMonth
    ) {
      return;
    }

    setCalendarDate(
      new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth() - 1,
        1
      )
    );
  };

  const goNextMonth = () => {
    setCalendarDate(
      new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth() + 1,
        1
      )
    );
  };

  const changeCalendarMonth = (
    event
  ) => {
    const month = Number(
      event.target.value
    );

    setCalendarDate(
      new Date(
        calendarDate.getFullYear(),
        month,
        1
      )
    );
  };

  const changeCalendarYear = (
    event
  ) => {
    const year = Number(
      event.target.value
    );

    setCalendarDate(
      new Date(
        year,
        calendarDate.getMonth(),
        1
      )
    );
  };

  const goToday = () => {
    setCalendarDate(new Date());

    setGoal((prev) => ({
      ...prev,
      targetDate: new Date(),
    }));

    setCalendarOpen(false);
  };

  const renderCalendar = () => {
    const year =
      calendarDate.getFullYear();

    const month =
      calendarDate.getMonth();

    const daysInMonth =
      getDaysInMonth(
        year,
        month
      );

    const firstDay =
      getFirstDayOfMonth(
        year,
        month
      );

    const previousMonthDays =
      getDaysInMonth(
        year,
        month - 1
      );

    const totalCells =
      Math.ceil(
        (firstDay +
          daysInMonth) /
          7
      ) * 7;

    const days = [];

    for (
      let index = 0;
      index < totalCells;
      index++
    ) {
      const dayNumber =
        index - firstDay + 1;

      if (dayNumber <= 0) {
        const day =
          previousMonthDays +
          dayNumber;

        days.push(
          <div
            key={`prev-${index}`}
            className="goal-calendar-day outside"
          >
            {day}
          </div>
        );

        continue;
      }

      if (
        dayNumber > daysInMonth
      ) {
        const day =
          dayNumber -
          daysInMonth;

        days.push(
          <div
            key={`next-${index}`}
            className="goal-calendar-day outside"
          >
            {day}
          </div>
        );

        continue;
      }

      const date = new Date(
        year,
        month,
        dayNumber
      );

      const disabled =
        date < startOfToday;

      const selected =
        isSameDay(
          date,
          goal.targetDate
        );

      const isToday =
        isSameDay(
          date,
          today
        );

      days.push(
        <button
          key={`day-${dayNumber}`}
          type="button"
          className={[
            "goal-calendar-day",
            selected
              ? "selected"
              : "",
            isToday
              ? "today"
              : "",
            disabled
              ? "disabled"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          disabled={disabled}
          onClick={() =>
            selectDate(
              year,
              month,
              dayNumber
            )
          }
        >
          {dayNumber}
        </button>
      );
    }

    return days;
  };

  const years = [];

  for (
    let year = today.getFullYear();
    year <=
    today.getFullYear() + 50;
    year++
  ) {
    years.push(year);
  }

  return (
    <div
      className="goal-modal-overlay"
      onMouseDown={(e) => {
        if (
          e.target ===
            e.currentTarget &&
          !loading
        ) {
          handleClose();
        }
      }}
    >
      <div
        className="goal-modal"
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >
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
            disabled={loading}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <form
          className="goal-form"
          onSubmit={handleSubmit}
        >
          <div className="goal-form-field">
            <label htmlFor="goal-title">
              Goal Name
            </label>

            <input
              id="goal-title"
              type="text"
              name="title"
              placeholder="MacBook, Bike..."
              value={goal.title}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <div className="goal-form-field">
            <label htmlFor="goal-target">
              Target Amount
            </label>

            <input
              id="goal-target"
              type="number"
              name="targetAmount"
              placeholder="₹50000"
              value={goal.targetAmount}
              onChange={handleChange}
              min="1"
              step="1"
              required
            />
          </div>

          <div className="goal-form-field">
            <label htmlFor="goal-saved">
              Initial Savings
            </label>

            <input
              id="goal-saved"
              type="number"
              name="savedAmount"
              placeholder="₹0"
              value={goal.savedAmount}
              onChange={handleChange}
              min="0"
              step="1"
            />
          </div>

          <div
            ref={dateFieldRef}
            className="goal-form-field goal-date-field"
          >
            <label htmlFor="goal-date">
              Target Date
            </label>

            <div className="goal-datepicker-wrapper">
              <button
                id="goal-date"
                type="button"
                className={
                  calendarOpen
                    ? "goal-datepicker goal-datepicker-open"
                    : "goal-datepicker"
                }
                onClick={() => {
                  if (!calendarOpen) {
                    setCalendarDate(
                      goal.targetDate ||
                        new Date()
                    );
                  }

                  setCalendarOpen(
                    (prev) => !prev
                  );
                }}
              >
                {goal.targetDate
                  ? goal.targetDate.toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month:
                          "short",
                        year: "numeric",
                      }
                    )
                  : "Select Target Date"}
              </button>

              {calendarOpen && (
                <div
                  ref={calendarRef}
                  className="goal-calendar-popper"
                >
                  <div className="goal-calendar-header">
                    <div className="goal-calendar-title">
                      {
                        months[
                          calendarDate.getMonth()
                        ]
                      }{" "}
                      {
                        calendarDate.getFullYear()
                      }
                    </div>

                    <div className="goal-calendar-controls">
                      <button
                        type="button"
                        className="goal-calendar-nav"
                        onClick={
                          goPreviousMonth
                        }
                        disabled={
                          calendarDate.getFullYear() ===
                            today.getFullYear() &&
                          calendarDate.getMonth() ===
                            today.getMonth()
                        }
                        aria-label="Previous month"
                      >
                        <FaChevronLeft />
                      </button>

                      <select
                        value={
                          calendarDate.getMonth()
                        }
                        onChange={
                          changeCalendarMonth
                        }
                        aria-label="Select month"
                      >
                        {months.map(
                          (
                            monthName,
                            index
                          ) => (
                            <option
                              key={
                                monthName
                              }
                              value={
                                index
                              }
                            >
                              {
                                monthName
                              }
                            </option>
                          )
                        )}
                      </select>

                      <select
                        value={
                          calendarDate.getFullYear()
                        }
                        onChange={
                          changeCalendarYear
                        }
                        aria-label="Select year"
                      >
                        {years.map(
                          (year) => (
                            <option
                              key={year}
                              value={
                                year
                              }
                            >
                              {year}
                            </option>
                          )
                        )}
                      </select>

                      <button
                        type="button"
                        className="goal-calendar-nav"
                        onClick={
                          goNextMonth
                        }
                        aria-label="Next month"
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  </div>

                  <div className="goal-calendar-weekdays">
                    {weekdays.map(
                      (day) => (
                        <div
                          key={day}
                          className="goal-calendar-weekday"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  <div className="goal-calendar-grid">
                    {renderCalendar()}
                  </div>

                  <button
                    type="button"
                    className="goal-calendar-today"
                    onClick={goToday}
                  >
                    Today
                  </button>
                </div>
              )}
            </div>
          </div>

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
                  aria-label={`Select ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

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
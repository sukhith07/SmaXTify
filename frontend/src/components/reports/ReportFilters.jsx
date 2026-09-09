import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaFilter,
  FaCalendarAlt,
  FaSyncAlt,
} from "react-icons/fa";
import {
  FaChevronLeft,
  FaChevronRight,
  FaXmark,
} from "react-icons/fa6";
import "../styles/reportFilters.css";

const MONTHS = [
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

const WEEKDAYS = [
  "SU",
  "MO",
  "TU",
  "WE",
  "TH",
  "FR",
  "SA",
];

function formatDate(date) {
  if (!date) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

function startOfDay(date) {
  if (!date) return null;

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function isSameDate(first, second) {
  if (!first || !second) return false;

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function isBeforeDate(first, second) {
  if (!first || !second) return false;

  return startOfDay(first) < startOfDay(second);
}

function isAfterDate(first, second) {
  if (!first || !second) return false;

  return startOfDay(first) > startOfDay(second);
}

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();

  const startDate = new Date(
    year,
    month,
    1 - firstWeekday
  );

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

/* =========================================================
   CUSTOM CALENDAR
========================================================= */

function CustomCalendar({
  value,
  onChange,
  minDate,
  maxDate,
  onClose,
  anchorRef,
}) {
  const calendarRef = useRef(null);
  const today = new Date();

  const initialDate = value || minDate || today;

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(
      initialDate.getFullYear(),
      initialDate.getMonth(),
      1
    )
  );

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    visibility: "hidden",
  });

  const years = useMemo(() => {
    const currentYear = today.getFullYear();

    return Array.from(
      { length: 31 },
      (_, index) => currentYear - 10 + index
    );
  }, []);

  const days = useMemo(
    () =>
      getCalendarDays(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth()
      ),
    [visibleMonth]
  );

  /* ---------------------------------------------------------
     Position calendar
  --------------------------------------------------------- */

  const updatePosition = () => {
    if (!anchorRef?.current || !calendarRef.current) {
      return;
    }

    const anchorRect =
      anchorRef.current.getBoundingClientRect();

    const calendarRect =
      calendarRef.current.getBoundingClientRect();

    const gap = 7;
    const padding = 10;

    /*
      Center calendar horizontally with the date field.
    */
    let left =
      anchorRect.left +
      anchorRect.width / 2 -
      calendarRect.width / 2;

    /*
      Normally show above the date field.
    */
    let top =
      anchorRect.top -
      calendarRect.height -
      gap;

    /*
      Keep inside left/right viewport.
    */
    if (
      left + calendarRect.width >
      window.innerWidth - padding
    ) {
      left =
        window.innerWidth -
        calendarRect.width -
        padding;
    }

    if (left < padding) {
      left = padding;
    }

    /*
      If there is not enough room above,
      show below the date field.
    */
    if (top < padding) {
      top = anchorRect.bottom + gap;
    }

    /*
      Final vertical protection.
    */
    if (
      top + calendarRect.height >
      window.innerHeight - padding
    ) {
      top =
        window.innerHeight -
        calendarRect.height -
        padding;
    }

    if (top < padding) {
      top = padding;
    }

    setPosition({
      top,
      left,
      visibility: "visible",
    });
  };

  useEffect(() => {
    const frame = requestAnimationFrame(updatePosition);

    const handleResize = () => {
      requestAnimationFrame(updatePosition);
    };

    /*
      IMPORTANT:
      Calendar closes when page is scrolled.
      It will never remain floating over the page.
    */
    const handleScroll = () => {
      onClose();
    };

    window.addEventListener("resize", handleResize);

    window.addEventListener(
      "scroll",
      handleScroll,
      true
    );

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener(
        "resize",
        handleResize
      );

      window.removeEventListener(
        "scroll",
        handleScroll,
        true
      );
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(updatePosition);
  }, [visibleMonth]);

  /* ---------------------------------------------------------
     Month navigation
  --------------------------------------------------------- */

  const previousMonth = () => {
    setVisibleMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1
        )
    );
  };

  const nextMonth = () => {
    setVisibleMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          1
        )
    );
  };

  const handleMonthChange = (event) => {
    setVisibleMonth(
      new Date(
        visibleMonth.getFullYear(),
        Number(event.target.value),
        1
      )
    );
  };

  const handleYearChange = (event) => {
    setVisibleMonth(
      new Date(
        Number(event.target.value),
        visibleMonth.getMonth(),
        1
      )
    );
  };

  /* ---------------------------------------------------------
     Date selection
  --------------------------------------------------------- */

  const handleDateClick = (date) => {
    if (minDate && isBeforeDate(date, minDate)) {
      return;
    }

    if (maxDate && isAfterDate(date, maxDate)) {
      return;
    }

    onChange(new Date(date));
    onClose();
  };

  const handleToday = () => {
    const currentDate = new Date();

    if (
      (minDate &&
        isBeforeDate(currentDate, minDate)) ||
      (maxDate &&
        isAfterDate(currentDate, maxDate))
    ) {
      return;
    }

    onChange(currentDate);
    onClose();
  };

  /* ---------------------------------------------------------
     Calendar
  --------------------------------------------------------- */

  const calendar = (
    <div
      ref={calendarRef}
      className="report-custom-calendar"
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        visibility: position.visibility,
      }}
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      {/* HEADER */}
      <div className="report-custom-calendar-header">
        <button
          type="button"
          className="report-calendar-nav"
          onClick={previousMonth}
          aria-label="Previous month"
        >
          <FaChevronLeft />
        </button>

        <div className="report-calendar-selects">
          <select
            value={visibleMonth.getMonth()}
            onChange={handleMonthChange}
            aria-label="Select month"
          >
            {MONTHS.map((month, index) => (
              <option
                key={month}
                value={index}
              >
                {month}
              </option>
            ))}
          </select>

          <select
            value={visibleMonth.getFullYear()}
            onChange={handleYearChange}
            aria-label="Select year"
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
        </div>

        <button
          type="button"
          className="report-calendar-nav"
          onClick={nextMonth}
          aria-label="Next month"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* WEEKDAYS */}
      <div className="report-calendar-weekdays">
        {WEEKDAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* DAYS */}
      <div className="report-calendar-days">
        {days.map((date) => {
          const outsideMonth =
            date.getMonth() !==
            visibleMonth.getMonth();

          const disabled =
            (minDate &&
              isBeforeDate(date, minDate)) ||
            (maxDate &&
              isAfterDate(date, maxDate));

          const selected = isSameDate(
            date,
            value
          );

          const isToday = isSameDate(
            date,
            today
          );

          return (
            <button
              type="button"
              key={date.toISOString()}
              className={[
                "report-calendar-day",
                outsideMonth
                  ? "outside-month"
                  : "",
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
                handleDateClick(date)
              }
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* TODAY */}
      <button
        type="button"
        className="report-calendar-today"
        onClick={handleToday}
      >
        Today
      </button>
    </div>
  );

  return createPortal(
    calendar,
    document.body
  );
}

/* =========================================================
   DATE FIELD
========================================================= */

function ReportDateField({
  value,
  onChange,
  placeholder,
  minDate,
  maxDate,
}) {
  const wrapperRef = useRef(null);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const calendar =
        document.querySelector(
          ".report-custom-calendar"
        );

      if (
        wrapperRef.current &&
        wrapperRef.current.contains(event.target)
      ) {
        return;
      }

      if (
        calendar &&
        calendar.contains(event.target)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const clearDate = (event) => {
    event.stopPropagation();
    onChange(null);
  };

  return (
    <div
      ref={wrapperRef}
      className="report-date-picker-wrapper"
    >
      <button
        type="button"
        className={[
          "report-date-picker-button",
          open ? "open" : "",
          value ? "has-value" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() =>
          setOpen((current) => !current)
        }
      >
        <span className="report-date-value">
          {value
            ? formatDate(value)
            : placeholder}
        </span>

        {value && (
          <span
            className="report-date-clear"
            onClick={clearDate}
            role="button"
            tabIndex={0}
          >
            <FaXmark />
          </span>
        )}
      </button>

      {open && (
        <CustomCalendar
          value={value}
          onChange={onChange}
          minDate={minDate}
          maxDate={maxDate}
          onClose={() => setOpen(false)}
          anchorRef={wrapperRef}
        />
      )}
    </div>
  );
}

/* =========================================================
   REPORT FILTERS
========================================================= */

function ReportFilters({
  period,
  setPeriod,
  category,
  setCategory,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onReset,
  categories = [],
}) {
  const handleStartDateChange = (date) => {
    setStartDate(date);

    if (
      date &&
      endDate &&
      isAfterDate(date, endDate)
    ) {
      setEndDate(null);
    }
  };

  const handleEndDateChange = (date) => {
    if (
      date &&
      startDate &&
      isBeforeDate(date, startDate)
    ) {
      return;
    }

    setEndDate(date);
  };

  return (
    <section className="report-filters">
      {/* FILTER HEADER */}
      <div className="report-filter-heading">
        <div className="report-filter-title">
          <div className="report-filter-icon">
            <FaFilter />
          </div>

          <div className="report-filter-title-content">
            <h2>Report Filters</h2>

            <p>
              Customize the data shown in your report.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="report-reset-btn"
          onClick={onReset}
        >
          <FaSyncAlt />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="report-filter-controls">
        {/* TIME PERIOD */}
        <div className="report-filter-group">
          <label>
            <FaCalendarAlt />
            <span>Time Period</span>
          </label>

          <div className="report-period-buttons">
            <button
              type="button"
              className={
                period === "thisMonth"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPeriod("thisMonth")
              }
            >
              This Month
            </button>

            <button
              type="button"
              className={
                period === "lastMonth"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPeriod("lastMonth")
              }
            >
              Last Month
            </button>

            <button
              type="button"
              className={
                period === "thisYear"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPeriod("thisYear")
              }
            >
              This Year
            </button>

            <button
              type="button"
              className={
                period === "allTime"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPeriod("allTime")
              }
            >
              All Time
            </button>

            <button
              type="button"
              className={
                period === "custom"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPeriod("custom")
              }
            >
              Custom Range
            </button>
          </div>
        </div>

        {/* CATEGORY */}
        <div className="report-filter-group category-filter">
          <label>
            <FaFilter />
            <span>Category</span>
          </label>

          <select
            className="report-category-select"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          >
            <option value="">
              All Categories
            </option>

            {categories.map((item) => {
              const value =
                typeof item === "string"
                  ? item
                  : item.value || item.name;

              const label =
                typeof item === "string"
                  ? item
                  : item.label ||
                    item.name ||
                    item.value;

              return (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        {/* CUSTOM RANGE */}
        {period === "custom" && (
          <div className="report-custom-date-range">
            {/* START DATE */}
            <div className="report-date-group">
              <div className="report-date-label">
                <span className="report-date-label-icon">
                  <FaCalendarAlt />
                </span>

                <span className="report-date-label-text">
                  <strong>Start Date</strong>
                  <small>
                    Choose the beginning date
                  </small>
                </span>
              </div>

              <ReportDateField
                value={startDate}
                onChange={handleStartDateChange}
                placeholder="Select start date"
                maxDate={endDate}
              />
            </div>

            {/* END DATE */}
            <div className="report-date-group">
              <div className="report-date-label">
                <span className="report-date-label-icon">
                  <FaCalendarAlt />
                </span>

                <span className="report-date-label-text">
                  <strong>End Date</strong>
                  <small>
                    Choose the ending date
                  </small>
                </span>
              </div>

              <ReportDateField
                value={endDate}
                onChange={handleEndDateChange}
                placeholder="Select end date"
                minDate={startDate}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ReportFilters;
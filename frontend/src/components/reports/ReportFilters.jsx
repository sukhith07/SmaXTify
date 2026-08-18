import {
  FaCalendarDays,
  FaFilter,
  FaRotate,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import "../styles/reportFilters.css";


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
}) {

  // =====================================================
  // PERIOD OPTIONS
  // =====================================================

  const periods = [
    {
      value: "thisMonth",
      label: "This Month",
    },
    {
      value: "lastMonth",
      label: "Last Month",
    },
    {
      value: "thisYear",
      label: "This Year",
    },
    {
      value: "allTime",
      label: "All Time",
    },
    {
      value: "custom",
      label: "Custom Range",
    },
  ];


  // =====================================================
  // CATEGORY OPTIONS
  // =====================================================

  const categories = [
    "All Categories",
    "Food",
    "Shopping",
    "Travel",
    "Transport",
    "Bills",
    "Healthcare",
    "Education",
    "Entertainment",
    "Rent",
    "Groceries",
    "Salary",
    "Business",
    "Freelance",
    "Investment",
    "Gift",
    "Other",
  ];


  // =====================================================
  // HANDLE PERIOD CHANGE
  // =====================================================

  const handlePeriodChange = (value) => {

    setPeriod(value);

    // Clear custom dates when leaving
    // custom range.

    if (value !== "custom") {

      setStartDate("");

      setEndDate("");

    }

  };


  // =====================================================
  // START DATE CHANGE
  // =====================================================

  const handleStartDateChange = (date) => {

    setStartDate(date);

    // If selected start date is after
    // current end date, clear end date.

    if (
      date &&
      endDate &&
      date > endDate
    ) {

      setEndDate(null);

    }

  };


  // =====================================================
  // END DATE CHANGE
  // =====================================================

  const handleEndDateChange = (date) => {

    setEndDate(date);

  };


  return (

    <section className="report-filters">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="report-filter-heading">

        <div className="report-filter-title">

          <div className="report-filter-icon">

            <FaFilter />

          </div>


          <div className="report-filter-title-content">

            <h2>
              Report Filters
            </h2>

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

          <FaRotate />

          <span>
            Reset Filters
          </span>

        </button>

      </div>


      {/* =================================================
          FILTER CONTROLS
      ================================================= */}

      <div className="report-filter-controls">


        {/* ===============================================
            TIME PERIOD
        =============================================== */}

        <div className="report-filter-group">

          <label>

            <FaCalendarDays />

            <span>
              Time Period
            </span>

          </label>


          <div className="report-period-buttons">

            {periods.map((item) => (

              <button
                key={item.value}
                type="button"
                className={
                  period === item.value
                    ? "active"
                    : ""
                }
                onClick={() =>
                  handlePeriodChange(
                    item.value
                  )
                }
              >

                {item.label}

              </button>

            ))}

          </div>

        </div>


        {/* ===============================================
            CATEGORY
        =============================================== */}

        <div className="report-filter-group category-filter">

          <label>

            <FaFilter />

            <span>
              Category
            </span>

          </label>


          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
            className="report-category-select"
          >

            {categories.map((item) => (

              <option
                key={item}
                value={item}
              >
                {item}
              </option>

            ))}

          </select>

        </div>


        {/* ===============================================
            CUSTOM DATE RANGE
        =============================================== */}

        {period === "custom" && (

          <div className="report-custom-date-range">


            {/* =========================================
                START DATE
            ========================================= */}

            <div className="report-date-group">

              <label>

                <FaCalendarDays />

                <span>
                  Start Date
                </span>

              </label>


              <DatePicker
                selected={
                  startDate || null
                }

                onChange={
                  handleStartDateChange
                }

                selectsStart

                startDate={
                  startDate || null
                }

                endDate={
                  endDate || null
                }

                maxDate={
                  endDate ||
                  new Date()
                }

                dateFormat="dd MMM yyyy"

                placeholderText="Select start date"

                className="report-date-picker"

                calendarClassName="report-calendar"

                popperClassName="report-datepicker-popper"

                showPopperArrow={false}

                isClearable

                renderCustomHeader={({
                  date,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (

                  <div className="report-calendar-header">


                    <button
                      type="button"
                      className="report-calendar-nav"
                      onClick={
                        decreaseMonth
                      }
                      disabled={
                        prevMonthButtonDisabled
                      }
                      aria-label="Previous month"
                    >

                      <FaChevronLeft />

                    </button>


                    <div className="report-calendar-title">

                      {date.toLocaleString(
                        "default",
                        {
                          month: "long",
                          year: "numeric",
                        }
                      )}

                    </div>


                    <button
                      type="button"
                      className="report-calendar-nav"
                      onClick={
                        increaseMonth
                      }
                      disabled={
                        nextMonthButtonDisabled
                      }
                      aria-label="Next month"
                    >

                      <FaChevronRight />

                    </button>

                  </div>

                )}

              />

            </div>


            {/* =========================================
                END DATE
            ========================================= */}

            <div className="report-date-group">

              <label>

                <FaCalendarDays />

                <span>
                  End Date
                </span>

              </label>


              <DatePicker
                selected={
                  endDate || null
                }

                onChange={
                  handleEndDateChange
                }

                selectsEnd

                startDate={
                  startDate || null
                }

                endDate={
                  endDate || null
                }

                minDate={
                  startDate || null
                }

                maxDate={
                  new Date()
                }

                dateFormat="dd MMM yyyy"

                placeholderText="Select end date"

                className="report-date-picker"

                calendarClassName="report-calendar"

                popperClassName="report-datepicker-popper"

                showPopperArrow={false}

                isClearable

                renderCustomHeader={({
                  date,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (

                  <div className="report-calendar-header">


                    <button
                      type="button"
                      className="report-calendar-nav"
                      onClick={
                        decreaseMonth
                      }
                      disabled={
                        prevMonthButtonDisabled
                      }
                      aria-label="Previous month"
                    >

                      <FaChevronLeft />

                    </button>


                    <div className="report-calendar-title">

                      {date.toLocaleString(
                        "default",
                        {
                          month: "long",
                          year: "numeric",
                        }
                      )}

                    </div>


                    <button
                      type="button"
                      className="report-calendar-nav"
                      onClick={
                        increaseMonth
                      }
                      disabled={
                        nextMonthButtonDisabled
                      }
                      aria-label="Next month"
                    >

                      <FaChevronRight />

                    </button>

                  </div>

                )}

              />

            </div>

          </div>

        )}

      </div>

    </section>

  );

}


export default ReportFilters;
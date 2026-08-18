import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FaChevronLeft,
  FaChevronRight,
  FaCalendarDay,
  FaMinus,
  FaXmark,
  FaRotateRight,
  FaStar,
} from "react-icons/fa6";

import { useCalendar } from "../context/CalendarContext";

import {
  getMonthEvents,
  clearCalendarYearCache,
} from "../services/calendarService";

import "../components/styles/calendar.css";

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

function Calendar() {
  const {
    calendarOpen,
    selectedDate,
    selectDate,
    closeCalendar,
  } = useCalendar();

  const today = new Date();

  const [currentDate, setCurrentDate] =
    useState(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      )
    );

  const [position, setPosition] = useState(() => {
    const saved =
      localStorage.getItem(
        "calendarPosition"
      );

    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const [eventMap, setEventMap] =
    useState({});

  const [isLoading, setIsLoading] =
    useState(false);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const windowRef = useRef(null);
  const dragging = useRef(false);

  const dragOffset = useRef({
    x: 0,
    y: 0,
  });

  const monthNames = [
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

  const dayNames = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const calendarDays = useMemo(() => {
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      days.push(day);
    }

    return days;
  }, [firstDay, daysInMonth]);

  useEffect(() => {
    if (!calendarOpen) {
      return;
    }

    setCurrentDate(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      )
    );
  }, [calendarOpen, selectedDate]);

  useEffect(() => {
    if (!calendarOpen) {
      return;
    }

    let cancelled = false;

    const loadEvents = async () => {
      setIsLoading(true);
      setError("");

      try {
        const events =
          await getMonthEvents(
            year,
            month
          );

        if (cancelled) {
          return;
        }

        const normalized = {};

        if (
          events &&
          typeof events === "object"
        ) {
          Object.entries(events).forEach(
            ([date, values]) => {
              if (
                !Array.isArray(values)
              ) {
                return;
              }

              const validEvents =
                values
                  .map((event) => {
                    if (
                      !event ||
                      typeof event !==
                        "object"
                    ) {
                      return null;
                    }

                    const name =
                      event.name ||
                      event.title ||
                      event.label ||
                      event.localName ||
                      event.festivalName;

                    if (!name) {
                      return null;
                    }

                    return {
                      ...event,
                      name: String(name)
                        .replace(
                          /\s+/g,
                          " "
                        )
                        .trim(),
                      icon:
                        event.icon ||
                        "📅",
                      category:
                        event.category ||
                        "Festival / Holiday",
                    };
                  })
                  .filter(Boolean);

              if (
                validEvents.length > 0
              ) {
                normalized[date] =
                  validEvents;
              }
            }
          );
        }

        setEventMap(normalized);
      } catch (err) {
        console.error(
          "Calendar event loading error:",
          err
        );

        if (!cancelled) {
          setEventMap({});
          setError(
            err?.message ||
              "Unable to load festivals and holidays."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      cancelled = true;
    };
  }, [
    calendarOpen,
    year,
    month,
  ]);

  useEffect(() => {
    if (!position) {
      return;
    }

    localStorage.setItem(
      "calendarPosition",
      JSON.stringify(position)
    );
  }, [position]);

  useEffect(() => {
    if (
      !calendarOpen ||
      position
    ) {
      return;
    }

    const width = 420;

    setPosition({
      x: Math.max(
        15,
        window.innerWidth -
          width -
          25
      ),
      y: 120,
    });
  }, [
    calendarOpen,
    position,
  ]);

  const createDateKey = (date) => {
    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;
  };

  const getEventsForDay = (day) => {
    if (!day) {
      return [];
    }

    const date = new Date(
      year,
      month,
      day
    );

    const dateKey =
      createDateKey(date);

    const events =
      eventMap?.[dateKey];

    if (!Array.isArray(events)) {
      return [];
    }

    return events.filter(
      (event) =>
        event &&
        typeof event === "object" &&
        event.name
    );
  };

  const goToPreviousMonth = () => {
    if (
      year === MIN_YEAR &&
      month === 0
    ) {
      return;
    }

    setCurrentDate(
      new Date(
        year,
        month - 1,
        1
      )
    );
  };

  const goToNextMonth = () => {
    if (
      year === MAX_YEAR &&
      month === 11
    ) {
      return;
    }

    setCurrentDate(
      new Date(
        year,
        month + 1,
        1
      )
    );
  };

  const goToToday = () => {
    const now = new Date();

    if (
      now.getFullYear() <
        MIN_YEAR ||
      now.getFullYear() >
        MAX_YEAR
    ) {
      return;
    }

    setCurrentDate(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      )
    );

    selectDate(now);
    setMessage("");
  };

  const handleRefresh = async () => {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    setError("");
    setMessage("");

    try {
      clearCalendarYearCache(
        year
      );

      const events =
        await getMonthEvents(
          year,
          month,
          true
        );

      const normalized = {};

      if (
        events &&
        typeof events === "object"
      ) {
        Object.entries(events).forEach(
          ([date, values]) => {
            if (
              !Array.isArray(values)
            ) {
              return;
            }

            const validEvents =
              values
                .filter(
                  (event) =>
                    event &&
                    typeof event ===
                      "object"
                )
                .map((event) => ({
                  ...event,
                  name: String(
                    event.name ||
                      event.title ||
                      event.label ||
                      event.localName ||
                      event.festivalName ||
                      ""
                  )
                    .replace(
                      /\s+/g,
                      " "
                    )
                    .trim(),
                  icon:
                    event.icon ||
                    "📅",
                  category:
                    event.category ||
                    "Festival / Holiday",
                }))
                .filter(
                  (event) =>
                    event.name
                );

            if (
              validEvents.length > 0
            ) {
              normalized[date] =
                validEvents;
            }
          }
        );
      }

      setEventMap(normalized);

      setMessage(
        "Calendar refreshed"
      );

      window.setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (err) {
      console.error(
        "Calendar refresh error:",
        err
      );

      setError(
        err?.message ||
          "Unable to refresh calendar."
      );
    } finally {
      window.setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  const handleDateSelect = (day) => {
    if (!day) {
      return;
    }

    const date = new Date(
      year,
      month,
      day
    );

    selectDate(date);
    setMessage("");
  };

  const isToday = (day) => {
    if (!day) {
      return false;
    }

    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (
      !day ||
      !selectedDate
    ) {
      return false;
    }

    return (
      day ===
        selectedDate.getDate() &&
      month ===
        selectedDate.getMonth() &&
      year ===
        selectedDate.getFullYear()
    );
  };

  const selectedDateKey =
    selectedDate
      ? createDateKey(
          selectedDate
        )
      : "";

  const selectedEvents =
    selectedDateKey &&
    Array.isArray(
      eventMap?.[
        selectedDateKey
      ]
    )
      ? eventMap[selectedDateKey]
      : [];

  const selectedDateText =
    selectedDate.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  const startDragging = (event) => {
    if (
      event.target.closest(
        ".calendar-window-actions"
      )
    ) {
      return;
    }

    if (
      event.button !== 0 ||
      !windowRef.current
    ) {
      return;
    }

    const rect =
      windowRef.current.getBoundingClientRect();

    dragging.current = true;

    dragOffset.current = {
      x:
        event.clientX -
        rect.left,
      y:
        event.clientY -
        rect.top,
    };

    document.body.style.userSelect =
      "none";
  };

  const dragWindow = (event) => {
    if (
      !dragging.current ||
      !windowRef.current
    ) {
      return;
    }

    const width =
      windowRef.current.offsetWidth;

    const height =
      windowRef.current.offsetHeight;

    const maxX = Math.max(
      15,
      window.innerWidth -
        width -
        15
    );

    const maxY = Math.max(
      15,
      window.innerHeight -
        height -
        15
    );

    const newX = Math.max(
      15,
      Math.min(
        event.clientX -
          dragOffset.current.x,
        maxX
      )
    );

    const newY = Math.max(
      15,
      Math.min(
        event.clientY -
          dragOffset.current.y,
        maxY
      )
    );

    setPosition({
      x: newX,
      y: newY,
    });
  };

  const stopDragging = () => {
    dragging.current = false;

    document.body.style.userSelect =
      "";
  };

  useEffect(() => {
    document.addEventListener(
      "mousemove",
      dragWindow
    );

    document.addEventListener(
      "mouseup",
      stopDragging
    );

    return () => {
      document.removeEventListener(
        "mousemove",
        dragWindow
      );

      document.removeEventListener(
        "mouseup",
        stopDragging
      );

      document.body.style.userSelect =
        "";
    };
  });

  if (!calendarOpen) {
    return null;
  }

  const positionStyle = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
      }
    : {
        right: "25px",
        top: "120px",
      };

  return (
    <div className="calendar-floating-layer">
      <section
        ref={windowRef}
        className="calendar-window"
        style={positionStyle}
      >
        <div
          className="calendar-window-header"
          onMouseDown={startDragging}
        >
          <div className="calendar-window-title">
            <div className="calendar-window-icon">
              <FaCalendarDay />
            </div>

            <div>
              <strong>
                SmaXTify Calendar
              </strong>

              <span>
                Smart Expense Tracker
              </span>
            </div>
          </div>

          <div className="calendar-window-actions">
            <button
              type="button"
              title="Refresh calendar"
              onClick={
                handleRefresh
              }
              disabled={
                isRefreshing
              }
            >
              <FaRotateRight
                className={
                  isRefreshing
                    ? "calendar-refresh-spin"
                    : ""
                }
              />
            </button>

            <button
              type="button"
              title="Minimize calendar"
              onClick={
                closeCalendar
              }
            >
              <FaMinus />
            </button>

            <button
              type="button"
              title="Close calendar"
              onClick={
                closeCalendar
              }
            >
              <FaXmark />
            </button>
          </div>
        </div>

        <div className="calendar-window-body">
          <div className="calendar-toolbar">
            <div>
              <h2>
                {monthNames[month]}{" "}
                {year}
              </h2>

              <p>
                Select a date to use
                anywhere in SmaXTify.
              </p>
            </div>

            <div className="calendar-controls">
              <button
                type="button"
                className="calendar-today-btn"
                onClick={goToToday}
              >
                Today
              </button>

              <button
                type="button"
                className="calendar-nav-btn"
                onClick={
                  goToPreviousMonth
                }
                disabled={
                  year === MIN_YEAR &&
                  month === 0
                }
                aria-label="Previous month"
              >
                <FaChevronLeft />
              </button>

              <button
                type="button"
                className="calendar-nav-btn"
                onClick={
                  goToNextMonth
                }
                disabled={
                  year === MAX_YEAR &&
                  month === 11
                }
                aria-label="Next month"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>

          {message && (
            <div className="calendar-refresh-message">
              <FaRotateRight />
              {message}
            </div>
          )}

          {isLoading && (
            <div className="calendar-loading">
              Loading festivals and
              holidays...
            </div>
          )}

          {error && (
            <div className="calendar-error">
              {error}
            </div>
          )}

          <div className="calendar-weekdays">
            {dayNames.map(
              (day) => (
                <div
                  key={day}
                  className="calendar-weekday"
                >
                  {day}
                </div>
              )
            )}
          </div>

          <div className="calendar-grid">
            {calendarDays.map(
              (day, index) => {
                const events =
                  getEventsForDay(
                    day
                  );

                const hasEvent =
                  events.length > 0;

                return (
                  <button
                    type="button"
                    key={`${year}-${month}-${index}`}
                    className={`
                      calendar-day
                      ${
                        !day
                          ? "empty"
                          : ""
                      }
                      ${
                        isToday(day)
                          ? "today"
                          : ""
                      }
                      ${
                        isSelected(day)
                          ? "selected"
                          : ""
                      }
                      ${
                        hasEvent
                          ? "has-event"
                          : ""
                      }
                    `}
                    onClick={() =>
                      handleDateSelect(
                        day
                      )
                    }
                    disabled={!day}
                    title={
                      hasEvent
                        ? events
                            .map(
                              (
                                event
                              ) =>
                                event.name
                            )
                            .join(
                              " • "
                            )
                        : ""
                    }
                  >
                    {day && (
                      <>
                        <div className="calendar-day-top">
                          <span>
                            {day}
                          </span>

                          {isToday(
                            day
                          ) && (
                            <small>
                              Today
                            </small>
                          )}
                        </div>

                        {hasEvent && (
                          <div className="calendar-day-events">
                            <FaStar />

                            <span>
                              {
                                events[0]
                                  .name
                              }
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              }
            )}
          </div>

          <div className="calendar-selected-card">
            <div className="calendar-selected-icon">
              <FaCalendarDay />
            </div>

            <div className="calendar-selected-content">
              <span>
                SELECTED DATE
              </span>

              <h3>
                {selectedDateText}
              </h3>

              {selectedEvents.length >
              0 ? (
                <div className="calendar-event-list">
                  {selectedEvents.map(
                    (
                      event,
                      index
                    ) => (
                      <div
                        key={`${event.name}-${index}`}
                        className="calendar-event-item"
                      >
                        <span className="calendar-event-icon">
                          {event.icon ||
                            "📅"}
                        </span>

                        <div>
                          <strong>
                            {
                              event.name
                            }
                          </strong>

                          <small>
                            {event.category ||
                              "Festival / Holiday"}
                          </small>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p>
                  No festival or public
                  holiday on this date.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Calendar;
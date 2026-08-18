import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const CalendarContext = createContext(null);

export function CalendarProvider({ children }) {
  const [calendarOpen, setCalendarOpen] =
    useState(false);

  const [selectedDate, setSelectedDate] =
    useState(new Date());

  const openCalendar = () => {
    setCalendarOpen(true);
  };

  const closeCalendar = () => {
    setCalendarOpen(false);
  };

  const toggleCalendar = () => {
    setCalendarOpen(
      (current) => !current
    );
  };

  const selectDate = (date) => {
    if (!date) {
      return;
    }

    const newDate =
      date instanceof Date
        ? date
        : new Date(date);

    if (isNaN(newDate.getTime())) {
      return;
    }

    setSelectedDate(newDate);
  };

  const value = useMemo(
    () => ({
      calendarOpen,
      selectedDate,
      openCalendar,
      closeCalendar,
      toggleCalendar,
      selectDate,
      setSelectedDate,
    }),
    [
      calendarOpen,
      selectedDate,
    ]
  );

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context =
    useContext(CalendarContext);

  if (!context) {
    throw new Error(
      "useCalendar must be used inside CalendarProvider"
    );
  }

  return context;
}
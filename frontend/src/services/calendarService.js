import {
  getFestivals,
  getPanchangam,
  Observer,
} from "@ishubhamx/panchangam-js";

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

const INDIA_LATITUDE = 12.9716;
const INDIA_LONGITUDE = 77.5946;
const INDIA_ELEVATION = 920;
const INDIA_TIMEZONE_OFFSET = 330;

const observer = new Observer(
  INDIA_LATITUDE,
  INDIA_LONGITUDE,
  INDIA_ELEVATION
);

const monthCache = new Map();
const yearCache = new Map();

const FIXED_INDIAN_HOLIDAYS = [
  {
    month: 0,
    day: 1,
    name: "New Year's Day",
    category: "Public Holiday",
    icon: "🎉",
  },
  {
    month: 0,
    day: 26,
    name: "Republic Day",
    category: "National Holiday",
    icon: "🇮🇳",
  },
  {
    month: 4,
    day: 1,
    name: "May Day",
    category: "Public Holiday",
    icon: "👷",
  },
  {
    month: 7,
    day: 15,
    name: "Independence Day",
    category: "National Holiday",
    icon: "🇮🇳",
  },
  {
    month: 9,
    day: 2,
    name: "Gandhi Jayanti",
    category: "National Holiday",
    icon: "🇮🇳",
  },
  {
    month: 11,
    day: 25,
    name: "Christmas Day",
    category: "Christian Holiday",
    icon: "🎄",
  },
];

const FESTIVAL_RULES = [
  {
    test: (name) =>
      /ganesh|ganesha|ganapati|vinayaka.*chaturthi/i.test(name),
    name: "Ganesha Chaturthi",
    category: "Hindu Festival",
    icon: "🐘",
  },
  {
    test: (name) =>
      /vijaya.*dashami|vijayadashami|vijay.*dasami|dussehra|dasara/i.test(
        name
      ),
    name: "Dussehra / Vijayadashami",
    category: "Hindu Festival",
    icon: "🏹",
  },
  {
    test: (name) =>
      /diwali|deepavali|deepawali/i.test(name),
    name: "Diwali",
    category: "Hindu Festival",
    icon: "🪔",
  },
  {
    test: (name) =>
      /\bholi\b/i.test(name),
    name: "Holi",
    category: "Hindu Festival",
    icon: "🎨",
  },
  {
    test: (name) =>
      /maha.*shivaratri|mahashivaratri|shivaratri/i.test(name),
    name: "Maha Shivaratri",
    category: "Hindu Festival",
    icon: "🔱",
  },
  {
    test: (name) =>
      /janmashtami|krishna.*janmashtami|krishna.*jayanti/i.test(name),
    name: "Krishna Janmashtami",
    category: "Hindu Festival",
    icon: "🦚",
  },
  {
    test: (name) =>
      /rama.*navami|ram.*navami/i.test(name),
    name: "Rama Navami",
    category: "Hindu Festival",
    icon: "🏹",
  },
  {
    test: (name) =>
      /raksha.*bandhan|rakhi/i.test(name),
    name: "Raksha Bandhan",
    category: "Hindu Festival",
    icon: "🧵",
  },
  {
    test: (name) =>
      /makar.*sankranti|sankranti/i.test(name),
    name: "Makar Sankranti",
    category: "Hindu Festival",
    icon: "🪁",
  },
  {
    test: (name) =>
      /pongal|thai.*pongal/i.test(name),
    name: "Pongal",
    category: "Regional Festival",
    icon: "🌾",
  },
  {
    test: (name) =>
      /ugadi|yugadi/i.test(name),
    name: "Ugadi",
    category: "Regional Festival",
    icon: "🌱",
  },
  {
    test: (name) =>
      /gudi.*padwa/i.test(name),
    name: "Gudi Padwa",
    category: "Regional Festival",
    icon: "🚩",
  },
  {
    test: (name) =>
      /\bonam\b/i.test(name),
    name: "Onam",
    category: "Regional Festival",
    icon: "🌼",
  },
  {
    test: (name) =>
      /\bvishu\b/i.test(name),
    name: "Vishu",
    category: "Regional Festival",
    icon: "🌼",
  },
  {
    test: (name) =>
      /navratri|navaratri|sharad.*navratri/i.test(name),
    name: "Navratri",
    category: "Hindu Festival",
    icon: "🌺",
  },
  {
    test: (name) =>
      /durga.*puja/i.test(name),
    name: "Durga Puja",
    category: "Hindu Festival",
    icon: "🌺",
  },
  {
    test: (name) =>
      /dhanteras/i.test(name),
    name: "Dhanteras",
    category: "Hindu Festival",
    icon: "💰",
  },
  {
    test: (name) =>
      /naraka.*chaturdashi/i.test(name),
    name: "Naraka Chaturdashi",
    category: "Hindu Festival",
    icon: "🪔",
  },
  {
    test: (name) =>
      /govardhan.*puja/i.test(name),
    name: "Govardhan Puja",
    category: "Hindu Festival",
    icon: "⛰️",
  },
  {
    test: (name) =>
      /bhai.*dooj/i.test(name),
    name: "Bhai Dooj",
    category: "Hindu Festival",
    icon: "🪔",
  },
  {
    test: (name) =>
      /akshaya.*tritiya/i.test(name),
    name: "Akshaya Tritiya",
    category: "Hindu Festival",
    icon: "✨",
  },
  {
    test: (name) =>
      /hanuman.*jayanti/i.test(name),
    name: "Hanuman Jayanti",
    category: "Hindu Festival",
    icon: "🙏",
  },
  {
    test: (name) =>
      /buddha.*purnima|buddha.*jayanti/i.test(name),
    name: "Buddha Purnima",
    category: "Buddhist Festival",
    icon: "☸️",
  },
  {
    test: (name) =>
      /mahavir.*jayanti/i.test(name),
    name: "Mahavir Jayanti",
    category: "Jain Festival",
    icon: "🙏",
  },
  {
    test: (name) =>
      /guru.*purnima/i.test(name),
    name: "Guru Purnima",
    category: "Hindu Festival",
    icon: "🙏",
  },
  {
    test: (name) =>
      /vasant.*panchami|saraswati.*puja/i.test(name),
    name: "Vasant Panchami",
    category: "Hindu Festival",
    icon: "🌼",
  },
  {
    test: (name) =>
      /karwa.*chauth/i.test(name),
    name: "Karwa Chauth",
    category: "Hindu Festival",
    icon: "🌙",
  },
  {
    test: (name) =>
      /chhath.*puja/i.test(name),
    name: "Chhath Puja",
    category: "Hindu Festival",
    icon: "🌅",
  },
  {
    test: (name) =>
      /eid.*fitr|eid.*ul.*fitr/i.test(name),
    name: "Eid al-Fitr",
    category: "Islamic Holiday",
    icon: "🌙",
  },
  {
    test: (name) =>
      /eid.*adha|eid.*ul.*adha|bakrid|bakri.*eid/i.test(name),
    name: "Eid al-Adha",
    category: "Islamic Holiday",
    icon: "🌙",
  },
  {
    test: (name) =>
      /muharram/i.test(name),
    name: "Muharram",
    category: "Islamic Holiday",
    icon: "🌙",
  },
  {
    test: (name) =>
      /mawlid|milad.*un.*nabi|eid.*milad/i.test(name),
    name: "Mawlid",
    category: "Islamic Holiday",
    icon: "🌙",
  },
  {
    test: (name) =>
      /good.*friday/i.test(name),
    name: "Good Friday",
    category: "Christian Holiday",
    icon: "✝️",
  },
  {
    test: (name) =>
      /\beaster\b/i.test(name),
    name: "Easter",
    category: "Christian Holiday",
    icon: "✝️",
  },
  {
    test: (name) =>
      /christmas/i.test(name),
    name: "Christmas Day",
    category: "Christian Holiday",
    icon: "🎄",
  },
  {
    test: (name) =>
      /\bekadashi\b/i.test(name),
    name: "Ekadashi",
    category: "Hindu Observance",
    icon: "🕉️",
  },
  {
    test: (name) =>
      /\bpurnima\b/i.test(name),
    name: "Purnima",
    category: "Hindu Observance",
    icon: "🌕",
  },
  {
    test: (name) =>
      /\bamavasya\b/i.test(name),
    name: "Amavasya",
    category: "Hindu Observance",
    icon: "🌑",
  },
];

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeName(name) {
  if (!name) {
    return "";
  }

  return String(name)
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeFestival(
  name,
  category = "Festival",
  icon = "⭐",
  extra = {}
) {
  const cleanName = normalizeName(name);

  if (!cleanName) {
    return null;
  }

  const rule = FESTIVAL_RULES.find((item) =>
    item.test(cleanName)
  );

  if (rule) {
    return {
      name: rule.name,
      category: rule.category,
      icon: rule.icon,
      ...extra,
    };
  }

  return {
    name: cleanName,
    category,
    icon,
    ...extra,
  };
}

function addEvent(map, dateKey, event) {
  if (!dateKey || !event) {
    return;
  }

  if (!map[dateKey]) {
    map[dateKey] = [];
  }

  const exists = map[dateKey].some(
    (item) =>
      item.name === event.name &&
      item.category === event.category
  );

  if (!exists) {
    map[dateKey].push(event);
  }
}

function sortEvents(events) {
  const priority = {
    "National Holiday": 1,
    "Public Holiday": 2,
    "Bank Holiday": 3,
    "Religious Holiday": 4,
    "Hindu Festival": 5,
    "Regional Festival": 6,
    "Buddhist Festival": 7,
    "Jain Festival": 8,
    "Islamic Holiday": 9,
    "Christian Holiday": 10,
    "Hindu Observance": 11,
    "Optional Holiday": 12,
    Observance: 13,
    Festival: 14,
  };

  return [...events].sort((a, b) => {
    const aPriority = priority[a.category] || 99;
    const bPriority = priority[b.category] || 99;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    return a.name.localeCompare(b.name);
  });
}

function validateYear(year) {
  if (
    !Number.isInteger(year) ||
    year < MIN_YEAR ||
    year > MAX_YEAR
  ) {
    throw new Error(
      `Calendar year must be between ${MIN_YEAR} and ${MAX_YEAR}.`
    );
  }
}

function getFixedHolidays(year) {
  const events = {};

  FIXED_INDIAN_HOLIDAYS.forEach((holiday) => {
    const date = new Date(
      year,
      holiday.month,
      holiday.day
    );

    addEvent(events, formatDateKey(date), {
      name: holiday.name,
      category: holiday.category,
      icon: holiday.icon,
      source: "SmaXTify",
    });
  });

  return events;
}

function extractFestivalArray(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (result && Array.isArray(result.festivals)) {
    return result.festivals;
  }

  if (result && Array.isArray(result.events)) {
    return result.events;
  }

  return [];
}

function calculatePanchang(date) {
  return getPanchangam(
    date,
    observer,
    {
      timezoneOffset: INDIA_TIMEZONE_OFFSET,
      calendarType: "purnimanta",
    }
  );
}

function calculateFestivalsForDate(date) {
  const events = {};

  try {
    const panchang = calculatePanchang(date);

    if (!panchang) {
      return events;
    }

    const festivalResult = getFestivals({
      date,
      observer,
      sunrise: panchang.sunrise,
      masa: panchang.masa,
      paksha: panchang.paksha,
      vara: panchang.vara,
      timezoneOffset: INDIA_TIMEZONE_OFFSET,
      calendarType: "purnimanta",
    });

    const festivals =
      extractFestivalArray(festivalResult);

    festivals.forEach((festival) => {
      if (!festival) {
        return;
      }

      const festivalName =
        festival.name ||
        festival.title ||
        festival.festivalName;

      if (!festivalName) {
        return;
      }

      const event = normalizeFestival(
        festivalName,
        festival.category || "Hindu Festival",
        festival.icon || "🪔",
        {
          source: "Panchangam",
          originalName: festivalName,
          type: festival.type,
        }
      );

      addEvent(
        events,
        formatDateKey(date),
        event
      );
    });
  } catch (error) {
    console.warn(
      "Festival calculation failed:",
      formatDateKey(date),
      error
    );
  }

  return events;
}

function calculateMonth(year, month) {
  const events = {};

  const fixedEvents = getFixedHolidays(year);

  Object.entries(fixedEvents).forEach(
    ([dateKey, eventList]) => {
      const [eventYear, eventMonth] =
        dateKey.split("-").map(Number);

      if (
        eventYear === year &&
        eventMonth === month + 1
      ) {
        eventList.forEach((event) => {
          addEvent(events, dateKey, event);
        });
      }
    }
  );

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      year,
      month,
      day
    );

    const dailyEvents =
      calculateFestivalsForDate(date);

    Object.entries(dailyEvents).forEach(
      ([dateKey, eventList]) => {
        eventList.forEach((event) => {
          addEvent(events, dateKey, event);
        });
      }
    );
  }

  Object.keys(events).forEach((dateKey) => {
    events[dateKey] = sortEvents(
      events[dateKey]
    );
  });

  return events;
}

async function getOfficialHolidays(year) {
  try {
    const response = await fetch(
      `https://date.nager.at/api/v4/Holidays/IN/${year}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      return {};
    }

    const holidays = await response.json();

    if (!Array.isArray(holidays)) {
      return {};
    }

    const events = {};

    holidays.forEach((holiday) => {
      if (!holiday?.date) {
        return;
      }

      const types = Array.isArray(
        holiday.holidayTypes
      )
        ? holiday.holidayTypes
        : [];

      let category = "Public Holiday";

      if (holiday.nationalHoliday) {
        category = "National Holiday";
      } else if (types.includes("Bank")) {
        category = "Bank Holiday";
      } else if (types.includes("Optional")) {
        category = "Optional Holiday";
      } else if (types.includes("Observance")) {
        category = "Observance";
      }

      const event = normalizeFestival(
        holiday.localName ||
          holiday.name,
        category,
        holiday.nationalHoliday
          ? "🇮🇳"
          : "📅",
        {
          source: "Nager.Date",
          localName:
            holiday.localName ||
            holiday.name,
          holidayTypes: types,
          nationalHoliday:
            Boolean(
              holiday.nationalHoliday
            ),
          subdivisionCodes:
            holiday.subdivisionCodes || [],
        }
      );

      addEvent(
        events,
        holiday.date,
        event
      );
    });

    return events;
  } catch {
    return {};
  }
}

function mergeEventMaps(...maps) {
  const result = {};

  maps.forEach((map) => {
    Object.entries(map || {}).forEach(
      ([dateKey, events]) => {
        if (!Array.isArray(events)) {
          return;
        }

        events.forEach((event) => {
          addEvent(
            result,
            dateKey,
            event
          );
        });
      }
    );
  });

  return result;
}

export async function getMonthEvents(
  year,
  month,
  forceRefresh = false
) {
  validateYear(year);

  if (
    !Number.isInteger(month) ||
    month < 0 ||
    month > 11
  ) {
    throw new Error(
      "Calendar month must be between 0 and 11."
    );
  }

  const cacheKey = `${year}-${month}`;

  if (
    !forceRefresh &&
    monthCache.has(cacheKey)
  ) {
    return monthCache.get(cacheKey);
  }

  const calculatedEvents =
    calculateMonth(
      year,
      month
    );

  const officialEvents =
    await getOfficialHolidays(year);

  const monthOfficialEvents = {};

  Object.entries(
    officialEvents
  ).forEach(([dateKey, eventList]) => {
    const [eventYear, eventMonth] =
      dateKey.split("-").map(Number);

    if (
      eventYear === year &&
      eventMonth === month + 1
    ) {
      eventList.forEach((event) => {
        addEvent(
          monthOfficialEvents,
          dateKey,
          event
        );
      });
    }
  });

  const merged = mergeEventMaps(
    calculatedEvents,
    monthOfficialEvents
  );

  Object.keys(merged).forEach((dateKey) => {
    merged[dateKey] = sortEvents(
      merged[dateKey]
    );
  });

  monthCache.set(
    cacheKey,
    merged
  );

  return merged;
}

export async function getCalendarEvents(
  year,
  forceRefresh = false
) {
  validateYear(year);

  const cacheKey = String(year);

  if (
    !forceRefresh &&
    yearCache.has(cacheKey)
  ) {
    return yearCache.get(cacheKey);
  }

  const result = {};

  for (let month = 0; month < 12; month++) {
    const monthEvents =
      await getMonthEvents(
        year,
        month,
        forceRefresh
      );

    Object.entries(
      monthEvents
    ).forEach(([dateKey, events]) => {
      events.forEach((event) => {
        addEvent(
          result,
          dateKey,
          event
        );
      });
    });
  }

  Object.keys(result).forEach((dateKey) => {
    result[dateKey] = sortEvents(
      result[dateKey]
    );
  });

  yearCache.set(
    cacheKey,
    result
  );

  return result;
}

export function getEventsForDate(
  eventMapOrDate,
  maybeDate
) {
  if (
    eventMapOrDate &&
    typeof eventMapOrDate === "object" &&
    maybeDate instanceof Date
  ) {
    const key = formatDateKey(
      maybeDate
    );

    return Array.isArray(
      eventMapOrDate[key]
    )
      ? eventMapOrDate[key]
      : [];
  }

  if (
    eventMapOrDate instanceof Date ||
    typeof eventMapOrDate === "string" ||
    typeof eventMapOrDate === "number"
  ) {
    const date = new Date(
      eventMapOrDate
    );

    if (
      Number.isNaN(date.getTime())
    ) {
      return Promise.resolve([]);
    }

    return getMonthEvents(
      date.getFullYear(),
      date.getMonth()
    ).then((events) => {
      return (
        events[
          formatDateKey(date)
        ] || []
      );
    });
  }

  return [];
}

export function clearCalendarCache() {
  monthCache.clear();
  yearCache.clear();
}

export function clearCalendarYearCache(year) {
  validateYear(year);

  yearCache.delete(
    String(year)
  );

  for (let month = 0; month < 12; month++) {
    monthCache.delete(
      `${year}-${month}`
    );
  }
}

export function getCalendarYearRange() {
  return {
    minYear: MIN_YEAR,
    maxYear: MAX_YEAR,
  };
}

export function formatCalendarDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  return formatDateKey(date);
}
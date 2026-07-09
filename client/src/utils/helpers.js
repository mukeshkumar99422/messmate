import { DAYS, MEALS, DEFAULT_TIMES, MEAL_START_TIME } from "../assets/assets";

// ============================================================================
// 1. DATE & TIME FORMATTING HANDLERS
// ============================================================================

/**
 * Formats a serving time range object into a clean, human-readable string.
 * @param {Object} time - The serving time container object.
 * @param {string} time.start - Start time in 24hr format ("HH:mm").
 * @param {string} time.end - End time in 24hr format ("HH:mm").
 * @returns {string} Clean readable format (e.g., "07:30 AM - 09:30 AM")
 */
export const formatTimeRange = (time) => {
  if (!time || !time.start || !time.end) return "Time not set";

  const convertTo12Hour = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12;
    const paddedMinutes = String(minutes).padStart(2, "0");
    return `${adjustedHours}:${paddedMinutes} ${ampm}`;
  };

  return `${convertTo12Hour(time.start)} - ${convertTo12Hour(time.end)}`;
};

/**
 * Formats a 24-hour time string ("HH:mm") into a 12-hour AM/PM string.
 * @param {string} t - 24-hour time string.
 * @returns {string} Formatted 12-hour time string (e.g., "7:30 PM").
 */
export const to12h = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
};

/**
 * Converts a 12-hour time string with an AM/PM period marker into a standard 24-hour clock value.
 * @param {string} timeStr - Time string input (e.g., "07:30 PM").
 * @returns {string} 24-hour formatted clock representation ("21:30").
 */
export const to24h = (timeStr) => {
  if (!timeStr) return "";

  const [time, period] = timeStr.trim().split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (period.toUpperCase() === "AM" && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

/**
 * Formats an ISO date string or Date object into a clean UK localized string format.
 * @param {string|Date} dateInput - Raw calendar date input payload.
 * @returns {string} Formatted string layout representation (e.g., "25 February 2026").
 */
export const formatDate = (dateInput) => {
  const date = new Date(dateInput);
  if (isNaN(date)) return "";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Dynamically infers the current or upcoming targeted meal category token based on the client machine's hours.
 * @returns {string} Lowercase meal string token enum boundary match ('breakfast', 'lunch', or 'dinner').
 */
export const getDefaultMealByTime = () => {
  const hour = new Date().getHours();
  if (hour >= 19) return "dinner";
  if (hour >= 12) return "lunch";
  return "breakfast";
};

/**
 * Safely fetches the current date string in YYYY-MM-DD format based strictly on IST.
 */
export const getISTDateString = () => {
  const date = new Date();
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

// ============================================================================
// 2. ANALYTICS RANGE & BOUNDARY SOLVERS
// ============================================================================

/**
 * Computes the historical 'from' and 'to' date parameters for purchase data filtering.
 * Supports specific relative options as well as concrete monthly limits.
 * @param {string} type - Relative scope code tag ('7d', '1m', '1y', 'all').
 * @param {string} selectedMonth - Raw month string directly from input forms ("YYYY-MM").
 * @returns {Object} Boundaries bundle structure: { from: "YYYY-MM-DD", to: "YYYY-MM-DD" }
 */
export const resolveRange = (type, selectedMonth) => {
  const now = new Date();
  let from = new Date();
  let to = new Date();

  // Normalize operating boundaries cleanly
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  if (selectedMonth) {
    const [y, m] = selectedMonth.split("-");
    from = new Date(parseInt(y), parseInt(m) - 1, 1);
    to = new Date(parseInt(y), parseInt(m), 0);
  } else {
    switch (type) {
      case "7d":
        from.setDate(now.getDate() - 6);
        break;
      case "1m":
        from.setMonth(now.getMonth() - 1);
        break;
      case "1y":
        from.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
        from = new Date("2000-01-01");
        break;
      default:
        from.setMonth(now.getMonth() - 1);
    }
  }

  const formatISODate = (d) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split("T")[0];
  };

  return { from: formatISODate(from), to: formatISODate(to) };
};

/**
 * Restricts active reporting grouping categories dynamically depending on selected tracking boundaries.
 * @param {string} range - Chosen historical calendar window.
 * @returns {Array<string>} List of available layout keys ('daily', 'weekly', 'monthly').
 */
export const allowedGroupings = (range) => {
  if (range === "7d") return ["daily"];
  if (range === "1m") return ["daily", "weekly"];
  return ["weekly", "monthly"];
};

/**
 * Evaluates whether a student can log an extra purchase for a target meal relative to serving timelines.
 * @param {string} selectedDate - Operational purchase tracking target day ("YYYY-MM-DD").
 * @param {string} meal - Targeted meal token reference.
 * @returns {boolean} True if current time has passed the serving start threshold line, false otherwise.
 */
export const canPurchaseMeal = (selectedDate, meal) => {
  const now = new Date();
  const [h, m] = MEAL_START_TIME[meal].split(":").map(Number);
  const mealDateTime = new Date(selectedDate);
  mealDateTime.setHours(h, m, 0, 0);
  return now >= mealDateTime;
};

// ============================================================================
// 3. SCHEMA INTEGRITY & DATA VALIDATORS
// ============================================================================

/**
 * Inspects a menu document structure snapshot to verify the presence of actual meal arrays.
 * @param {Object} menuObject - Main dynamic menu context object data frame.
 * @returns {boolean} True if any core diet properties are populated, false otherwise.
 */
export const hasMenuData = (menuObject) => {
  return !!(
    menuObject &&
    (menuObject.breakfast?.diet?.length ||
      menuObject.lunch?.diet?.length ||
      menuObject.dinner?.diet?.length)
  );
};

// ============================================================================
// 4. GENERATORS & MASTER MENU DICTIONARY OBJECT HYDRATORS
// ============================================================================

/**
 * Generates an empty weekly menu shell structure prepopulated with default serving times.
 * @returns {Object} Structured weekly menu dictionary skeleton.
 */
export const generateEmptyMenu = () => {
  const menu = {};
  DAYS.forEach((day) => {
    menu[day] = {};
    MEALS.forEach((meal) => {
      menu[day][meal] = {
        time: { ...DEFAULT_TIMES[meal] },
        diet: [],
        extras: [],
      };
    });
  });
  return menu;
};

/**
 * Restructures raw unstructured payloads extracted from AI vision models to ensure schema compliance.
 * @param {Object} aiData - Parsed raw output block delivered from Gemini.
 * @returns {Object} Sanitized, complete database-ready weekly menu configuration model.
 */
export const normalizeMenuData = (aiData) => {
  if (!aiData) return generateEmptyMenu();
  const normalized = JSON.parse(JSON.stringify(generateEmptyMenu()));

  Object.keys(aiData).forEach((day) => {
    const dayKey = day.toLowerCase();

    if (normalized[dayKey]) {
      Object.keys(aiData[day]).forEach((meal) => {
        const mealKey = meal.toLowerCase();

        if (normalized[dayKey][mealKey]) {
          const rawMeal = aiData[day][meal];

          // 1. Normalize Diet Arrays
          const diet = Array.isArray(rawMeal.diet) ? rawMeal.diet : [];
          const formattedDiet = diet.map((item) =>
            typeof item === "string" ? { name: item.trim() } : { name: item.name?.trim() || "" }
          ).filter(d => d.name !== "");

          // 2. Normalize Extras Arrays
          const extras = Array.isArray(rawMeal.extras) ? rawMeal.extras : [];
          const formattedExtras = extras.map((item) =>
            typeof item === "string"
              ? { name: item.trim(), price: 0 }
              : { name: item.name?.trim() || "", price: Number(item.price) || 0 }
          ).filter(e => e.name !== "");

          // 3. Normalize Timings
          const formattedTime = {
            start: rawMeal.time?.start || DEFAULT_TIMES[mealKey].start,
            end: rawMeal.time?.end || DEFAULT_TIMES[mealKey].end,
          };

          normalized[dayKey][mealKey] = {
            time: formattedTime,
            diet: formattedDiet,
            extras: formattedExtras,
          };
        }
      });
    }
  });

  return normalized;
};

// ============================================================================
// 5. ADMINISTRATIVE ACCOUNT CREDENTIAL GENERATORS
// ============================================================================

/**
 * Generates a unique 5-digit administrative accountant tracking identification token.
 * @returns {string} String identifier representation matching "acc_XXXXX".
 */
export const generateLoginId = () => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `acc_${randomNum}`;
};

/**
 * Generates an 8-character password string meeting complex entropy requirements.
 * Excludes ambiguous visual character profiles (1, l, I, 0, O, o).
 * @returns {string} Secure character password string payload (e.g., "KpTw#742").
 */
export const generatePassword = () => {
  const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowers = "abcdefghjkmnpqrstuvwxyz";
  const numbers = "23456789";
  const specials = "@#$&*";

  const getRandomChar = (charset) => charset[Math.floor(Math.random() * charset.length)];

  return (
    getRandomChar(uppers) +
    getRandomChar(lowers) +
    getRandomChar(lowers) +
    getRandomChar(uppers) +
    getRandomChar(specials) +
    getRandomChar(numbers) +
    getRandomChar(numbers) +
    getRandomChar(numbers)
  );
};

/**
 * Bundles a generated administrative Login ID and strong password string tuple pair together.
 * @returns {Array<string>} Tuple structured array mapping: [loginId, password]
 */
export const generateIdPass = () => {
  return [generateLoginId(), generatePassword()];
};
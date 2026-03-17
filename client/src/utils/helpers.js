import toast from "react-hot-toast";

//----------------------
export const to12h = (t) => {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2,"0")} ${ampm}`;
};

//---------------------
export const formatTimeRange = (timeObj) => {
  if (!timeObj?.start || !timeObj?.end) return "Served Daily";

  return `${to12h(timeObj.start)} - ${to12h(timeObj.end)}`;
};

//----------------------

export const to24h = (timeStr) =>{
  if(!timeStr) return "";

  const [time, period] = timeStr.trim().split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if(period.toUpperCase() === "PM" && hours !==12) hours+=12;
  if(period.toUpperCase() === "AM" && hours ===12) hours=0;

  return `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}`;
}

//--------------------
export const formatDate = (dateInput)=>{
  const date = new Date(dateInput);

  if (isNaN(date)) return "";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}


//-----------------
export const getDefaultMealByTime = () => {
  const hour = new Date().getHours();
  if (hour >= 19) return "dinner";
  if (hour >= 12) return "lunch";
  return "breakfast";
};

//--------------------
export const resolveRange = (type, selectedMonth) => {
  const now = new Date();
  let from = new Date();
  let to = new Date();

  // Reset hours
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

  const formatDate = (d) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split("T")[0];
  };

  return { from: formatDate(from), to: formatDate(to) };
};

//-------------------------
export const toastWarn = (msg)=>{
  toast(msg, {
    icon: "⚠️",
    style: {
      borderRadius: '10px',
      background: '#fff7ed', // light orange background
      color: '#c2410c',      // dark orange text
    },
  })
}


//------------------------

export const generateLoginId = () => {
  // Generates a clean 5-digit random number between 10000 and 99999
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `acc_${randomNum}`;
};

export const generatePassword = () => {
  // Excluded ambiguous characters: 1, l, I, 0, O, o
  const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ"; 
  const lowers = "abcdefghjkmnpqrstuvwxyz"; 
  const numbers = "23456789"; 
  const specials = "@#$&*";

  const getRandom = (charset) => charset[Math.floor(Math.random() * charset.length)];

  // Format: [Upper][Lower][Lower][Upper][Special][Num][Num][Num]
  // Example output: "KpTw#742"
  const pass = 
    getRandom(uppers) + 
    getRandom(lowers) + 
    getRandom(lowers) + 
    getRandom(uppers) + 
    getRandom(specials) + 
    getRandom(numbers) + 
    getRandom(numbers) + 
    getRandom(numbers);

  return pass;
};

export const generateIdPass = () => {
  const lid = generateLoginId();
  const pass = generatePassword();

  return [lid, pass];
};


// -------------------------
export const hasMenuData = (todayMenu) => {
  return todayMenu && (
    todayMenu.breakfast?.diet || 
    todayMenu.lunch?.diet || 
    todayMenu.dinner?.diet
  )
}


//-------------------------
import { DAYS,MEALS,DEFAULT_TIMES } from "../assets/assets";
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

export const normalizeMenuData = (aiData) => {
  const normalized = JSON.parse(JSON.stringify(generateEmptyMenu()));

  Object.keys(aiData).forEach((day) => {
    // Standardize day keys to lowercase to match our DAYS constant
    const dayKey = day.toLowerCase();
    
    if (normalized[dayKey]) {
      Object.keys(aiData[day]).forEach((meal) => {
        const mealKey = meal.toLowerCase();
        
        if (normalized[dayKey][mealKey]) {
          const rawMeal = aiData[day][meal];

          // 1. Normalize Diet: Ensure it's an array of {name: string}
          const diet = Array.isArray(rawMeal.diet) ? rawMeal.diet : [];
          const formattedDiet = diet.map((item) =>
            typeof item === "string" ? { name: item } : { name: item.name || "" }
          );

          // 2. Normalize Extras: Ensure it's an array of {name: string, price: string|number}
          const extras = Array.isArray(rawMeal.extras) ? rawMeal.extras : [];
          const formattedExtras = extras.map((item) =>
            typeof item === "string" 
              ? { name: item, price: "0" } 
              : { name: item.name || "", price: item.price || "0" }
          );

          // 3. Normalize Time: Use AI time if valid, otherwise fallback to defaults
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
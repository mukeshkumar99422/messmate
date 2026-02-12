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

export const generateLoginId = () =>{
  const randomStr = Math.random().toString(36).slice(-6);
  return `acc_${randomStr}`;
}

export const generatePassword = () =>{
  return Math.random().toString(36).slice(-10).toUpperCase()
}


export const generateIdPass = () => {
  const lid=generateLoginId();
  const pass = generatePassword();

  return [lid,pass];
};

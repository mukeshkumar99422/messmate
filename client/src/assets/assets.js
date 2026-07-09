import heroImg from './heroImg.png'
import logo from './logo.png'
import logo2 from './logo2.png'
import logo3 from './logo3.png'
import logo_dark from './logo_dark.png'
import itemsNotUpdated from './itemsNotUpdated.png'
import nitkkrLogo from './nitkkr-logo.png'


export const assets ={
    heroImg,
    logo,logo2,logo3,
    logo_dark,
    itemsNotUpdated,
    nitkkrLogo
}

export const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const MEALS = ["breakfast", "lunch", "dinner"];

export const DEFAULT_TIMES = {
  breakfast: { start: "07:30", end: "09:30" },
  lunch: { start: "12:30", end: "14:30" },
  dinner: { start: "19:30", end: "21:30" },
};


export const MEAL_START_TIME = {
  breakfast: "07:00",
  lunch: "12:00",
  dinner: "19:00",
};


// analyse extra
export const RANGE_OPTIONS = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last month", value: "1m" },
  { label: "Last year", value: "1y" },
  { label: "Overall", value: "all" },
];
export const GROUPING_OPTIONS = ["daily", "weekly", "monthly"];
export const COLORS = ["#22c55e", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6"];

// LANDING PAGE
export const CORE_FEATURES = [
  { 
    icon: "fa-utensils", 
    theme: "bg-green-50 text-[#16a34a] border-green-100", 
    title: "Live Menu Dashboard", 
    text: "Access structured breakfast, lunch, and dinner configurations updated in real-time by your hostel's accountant." 
  },
  { 
    icon: "fa-cart-shopping", 
    theme: "bg-purple-50 text-purple-600 border-purple-100", 
    title: "Seamless Extras Logging", 
    text: "Purchase optional add-on side dishes via an integrated cart interface that locks items directly to your profile ledger." 
  },
  { 
    icon: "fa-chart-pie", 
    theme: "bg-blue-50 text-blue-600 border-blue-100", 
    title: "Analytical Expense Tracking", 
    text: "Monitor spending patterns across interactive daily, weekly, or monthly tracking charts powered by Recharts." 
  },
  { 
    icon: "fa-wand-magic-sparkles", 
    theme: "bg-amber-50 text-amber-600 border-amber-100", 
    title: "AI Menu Extraction", 
    text: "Allows accountants to photograph messy printed menus and instantly parse them into database schemas via Gemini." 
  },
  { 
    icon: "fa-star-half-stroke", 
    theme: "bg-orange-50 text-orange-600 border-orange-100", 
    title: "Student Feedback Loop", 
    text: "Empowers students to rate individual dishes, select descriptive tags, and submit quick improvement suggestions after meals." 
  },
  { 
    icon: "fa-brain", 
    theme: "bg-rose-50 text-rose-600 border-rose-100", 
    title: "AI Feedback Analysis", 
    text: "Simplifies raw complaints for accountants by automatically compiling trends, favorite items, and actionable areas." 
  }
];
export const FAQS = [
  { 
    q: "How does the AI Menu Extraction handle regional names?", 
    a: "The embedded Gemini-2.5-Flash framework automatically translates multi-lingual entries into English schemas before parsing layout variables into database cells." 
  },
  { 
    q: "Can a student mutate or tamper with extra billing totals?", 
    a: "No. The backend server computes strict array totals dynamically in isolated middleware fields, checking item definitions against active price boundaries before saving requests." 
  },
  { 
    q: "What happens if a student transitions between hostels mid-semester?", 
    a: "Students can update their hostel allocation instantly via their profile module window, which adjusts administrative metric counts atomically across database logs." 
  }
];
export const PAIN_POINTS = [
  { 
    icon: "fa-calendar-xmark", 
    title: "Notice Board Mystery", 
    text: "Walking all the way down to the mess entry door just to check if the menu matches your preferences." 
  },
  { 
    icon: "fa-calculator", 
    title: "Blind Extras Budgeting", 
    text: "Losing track of how many extra items you bought, leading to surprising bill adjustments at the end of the month." 
  },
  { 
    icon: "fa-comment-slash", 
    title: "One-Way Feedback", 
    text: "No transparent channel to communicate food preferences or rate the quality of meals constructively." 
  }
];


// tags for rating
export const QUICK_TAGS_FOR_DIET =[
  // 1 Star: Critical issues / Unhygienic
  ["Foreign Object", "Oily", "Undercooked", "Burnt", "Unhygienic", "Unhealthy", "Inedible", "Smelling"],
  
  // 2 Star: Poor quality / Bad preparation
  ["Watery", "Chewy", "Tasteless", "Too Spicy", "Served Cold", "Poor Quality"],
  
  // 3 Star: Average / Okay
  ["Average Taste", "Fine", "Healthy but Plain", "Standard Quality", "Decent Hygiene"],
  
  // 4 Star: Good / Healthy / Clean
  ["Tasty & Fresh", "Very Hygienic", "Healthy Option", "Perfect Balance", "Nice & Hot", "Thick & Fresh"],
  
  // 5 Star: Excellent
  ["Delicious!", "Super Clean!", "Highly Nutritious", "Home-like Taste", "Perfect Spices", "Loved It!"]
];
export const QUICK_TAGS_FOR_EXTRA =[
  // 1 Star: Waste of money / Unclean
  ["Unclean Prep", "Overpriced", "Tiny Portion", "Stale/Not Fresh", "Too Greasy", "Horrible Taste"],
  
  // 2 Star: Disappointing value
  ["Lacks Flavor", "Soggy or Limp", "Disappointing Size", "Too Sweet", "Dry or Chewy", "Too Artificial"],
  
  // 3 Star: Fair / Satisfactory
  ["Okay Flavor", "Decent Portion", "Clean Enough", "Worth a Try", "Satisfied Cravings"],
  
  // 4 Star: Great value & quality
  ["Value for Money", "Great Taste", "Good Quantity", "Fresh & Clean", "Crispy & Hot", "Rich Flavor"],
  
  // 5 Star: Exceptional
  ["Worth Every Penny!", "Absolute Fire 🔥", "Premium Quality", "Super Hygienic", "Perfect Portion"]
];
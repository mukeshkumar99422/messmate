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
  // ==================== STUDENT CONCERNS ====================
  {
    q: "I accidentally selected the wrong hostel during signup. How can I fix it?",
    a: "Don't worry! You can easily change it without creating a new account. Go to your 'My Profile' icon in the navbar, expand the 'Hostel Allocation' section, select your correct hostel from the dropdown, and hit save."
  },
  {
    q: "Why can't I update purhcases for extra items before the scheduled meal time?",
    a: "To prevent accidental billing and ensure fairness, extra purchases can only be logged once the official serving time for that meal has actually started. For example, lunch add-ons can only be added after lunch services officially open."
  },
  {
    q: "I'm looking at my 'Analyse Extra' dashboard. Can I filter my history by a specific month?",
    a: "Yes! While the dashboard gives you quick presets like '7 Days' or '1 Month', you can use the native calendar picker under 'Select Specific Month' to view your exact spending history and item breakdown for any previous month."
  },
  {
    q: "What should I do if I didn't receive the login or password-reset OTP in my inbox?",
    a: "First, make sure you are checking your valid registered email address'. If it's not in your main inbox, please double-check your Spam or Junk folder. You can request a fresh code after the 30-second on-screen timer expires."
  },
  {
    q: "How does the rating system work? Is my feedback anonymous?",
    a: "When you tap on any dish inside your daily meal card, a quick rating pop-up will appear. Your rating score and tags help the Mess Committee see quality trends. While your name isn't blasted publicly, constructive suggestions are grouped to help accountants make concrete improvements."
  },

  // ==================== ACCOUNTANT CONCERNS ====================
  {
    q: "How accurate is the 'Extract & Autofill' feature when uploading a picture of a handwritten menu?",
    a: "The built-in AI handles standard typed or neatly printed menus flawlessly. If your menu sheet is handwritten, make sure the photo has great lighting, is not blurry, and is taken from directly above. You can always review and manually correct any text field on screen before saving the full menu."
  },
  {
    q: "If I make an override update to today's lunch menu, will it permanently change our standard weekly menu?",
    a: "No. Updating 'Today's Menu' acts as a temporary overlay strictly for that specific calendar date. It allows you to log sudden situational changes (e.g., swapping a vegetable or offering a special festival sweet) without resetting your baseline 7-day layout."
  },
  {
    q: "What happens to the students' dashboard view when I upload a completely new weekly menu schedule?",
    a: "The platform executes an instant cache clearing routine across all student timelines for your hostel. The very next time any student opens the app, they will instantly see the fresh schedule seamlessly without needing to log out or manually refresh."
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
  ["Worth Every Penny!", "Absolute Fire", "Premium Quality", "Super Hygienic", "Perfect Portion"]
];
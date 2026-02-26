//hostels
export const dummyHostels = [
  { id: 1, name: "Chakardhar Bhawan" , residents: "boys"},
  { id: 2, name: "Chakardhar Bhawan" , residents: "boys"},
  { id: 3, name: "Chakardhar Bhawan" , residents: "boys"},
  { id: 4, name: "Chakardhar Bhawan" , residents: "boys"},
  { id: 5, name: "Chakardhar Bhawan" , residents: "boys"},
  { id: 6, name: "Chakardhar Bhawan" , residents: "boys"},
  { id: 7, name: "Chakardhar Bhawan" , residents: "boys"},
  { id: 8, name: "Chakardhar Bhawan" , residents: "boys"},
  { id: 9, name: "Chakardhar Bhawan" , residents: "boys"},
  { id: 10, name: "Chakardhar Bhawan" , residents: "boys"},
  { id: 11, name: "Chakardhar Bhawan" , residents: "boys"},
  { id: 12, name: "Kalpana Bhawan" , residents: "girls"},
  { id: 13, name: "Kalpana Bhawan" , residents: "girls"},
  { id: 14, name: "Kalpana Bhawan" , residents: "girls"},
];

//user -> structure vary depending upon role
export const dummyUser = {
  _id: "64fa12ab90c1",
  name: "Mukesh Kumar",
  identifier: "123103017@nitkkr.ac.in",
  role: "student",
  hostelId: 5,
  hostelName: "Chakardhar Bhawan",
  isVerified: true,
};

//mess today menu for student
export const dummyTodayMenuStudent = {
  breakfast: {
    time: { start: "07:30", end: "09:30" },
    diet: [
      { name: "Idli" },
      { name: "Sambar" },
      { name: "Coconut Chutney" }
    ],
    extras: [
      { name: "Extra Idli", price: 20 },
      { name: "Vada", price: 15 }
    ],
    updated: true
  },

  lunch: {
    time: { start: "12:30", end: "14:30" },
    diet: [
      { name: "Rice" },
      { name: "Dal Fry" },
      { name: "Mixed Veg" }
    ],
    extras: [
      { name: "Paneer Curry", price: 40 },
      { name: "Curd", price: 10 }
    ],
    updated: false
  },

  dinner: {
    time: { start: "19:30", end: "21:30" },
    diet: [
      { name: "Chapati" },
      { name: "Aloo Sabzi" }
    ],
    extras: [
      { name: "Egg Curry", price: 35 }
    ],
    updated: true
  }
};

//dummy day wise menu for student
export const dummyMenuStudent = {
    breakfast: {
      time: { start: "07:30", end: "09:30" },
      diet: [
        { name: "Idli" },
        { name: "Sambar" },
        { name: "Coconut Chutney" }
      ],
      extras: [
        { name: "Extra Idli", price: 20 },
        { name: "Vada", price: 15 }
      ],
    },

    lunch: {
      time: { start: "12:30", end: "14:30" },
      diet: [
        { name: "Rice" },
        { name: "Dal Fry" },
        { name: "Mixed Veg" }
      ],
      extras: [
        { name: "Paneer Curry", price: 40 },
        { name: "Curd", price: 10 }
      ],
    },

    dinner: {
      time: { start: "19:30", end: "21:30" },
      diet: [
        { name: "Chapati" },
        { name: "Aloo Sabzi" }
      ],
      extras: [
        { name: "Egg Curry", price: 35 }
      ],
    }
};


//extra items
export const dummyExtraItems = [
  { id: "ex_101", name: "Paneer Butter Masala", unitPrice: 40},
  { id: "ex_102", name: "Extra Rice", unitPrice: 10},
  { id: "ex_103", name: "Curd Bowl", unitPrice: 15},
  { id: "ex_104", name: "Sweet Dish", unitPrice: 20}
];



//analyse extra items
export const dummyAnalyseExtraResponse =  [
  {
    date: "2026-02-01",
    meal: "breakfast",
    items: [
      { id: "ex_201", name: "Masala Dosa", unitPrice: 40, qty: 1 },
      { id: "ex_202", name: "Filter Coffee", unitPrice: 15, qty: 1 }
    ],
    totalAmount: 55,
  },
  {
    date: "2026-02-02",
    meal: "lunch",
    items: [
      { id: "ex_203", name: "Chicken Biryani", unitPrice: 120, qty: 1 },
      { id: "ex_204", name: "Thums Up", unitPrice: 20, qty: 1 }
    ],
    totalAmount: 140,
  },
  
  {
    date: "2026-02-03",
    meal: "dinner",
    items: [
      { id: "ex_205", name: "Egg Fried Rice", unitPrice: 60, qty: 1 },
      { id: "ex_206", name: "Gobi Manchurian", unitPrice: 50, qty: 1 },
      { id: "ex_207", name: "Extra Chapati", unitPrice: 8, qty: 2 }
    ],
    totalAmount: 126,
  },

  {
    date: "2026-02-05",
    meal: "breakfast",
    items: [
      { id: "ex_208", name: "Aloo Paratha", unitPrice: 25, qty: 2 },
      { id: "ex_209", name: "Extra Curd", unitPrice: 10, qty: 1 }
    ],
    totalAmount: 60,
  },
  
  {
    date: "2026-02-08",
    meal: "lunch",
    items: [
      { id: "ex_210", name: "Paneer Butter Masala", unitPrice: 110, qty: 1 },
      { id: "ex_211", name: "Butter Naan", unitPrice: 25, qty: 2 }
    ],
    totalAmount: 160,
  },
  {
    date: "2026-02-08",
    meal: "dinner",
    items: [
      { id: "ex_212", name: "Boiled Eggs", unitPrice: 10, qty: 3 },
      { id: "ex_213", name: "Milk", unitPrice: 15, qty: 1 }
    ],
    totalAmount: 45,
  },

  {
    date: "2026-02-12",
    meal: "snacks",
    items: [
      { id: "ex_214", name: "Samosa", unitPrice: 12, qty: 2 },
      { id: "ex_215", name: "Tea", unitPrice: 10, qty: 2 }
    ],
    totalAmount: 44,
  }
];

//today mess menu for accountant
export const dummyTodayMenu = {
  breakfast: {
    time: { start: "07:30", end: "09:30" },
    diet: [
      { name: "Idli" },
      { name: "Sambar" },
      { name: "Coconut Chutney" }
    ],
    extras: [
      { name: "Extra Idli", price: 20 },
      { name: "Vada", price: 15 }
    ],
    updated: true
  },

  lunch: {
    time: { start: "12:30", end: "14:30" },
    diet: [
      { name: "Rice" },
      { name: "Dal Fry" },
      { name: "Mixed Veg" }
    ],
    extras: [
      { name: "Paneer Curry", price: 40 },
      { name: "Curd", price: 10 }
    ],
    updated: false
  },

  dinner: {
    time: { start: "19:30", end: "21:30" },
    diet: [
      { name: "Chapati" },
      { name: "Aloo Sabzi" }
    ],
    extras: [
      { name: "Egg Curry", price: 35 }
    ],
    updated: true
  }
};


//dummy weekly menu for accountant
export const dummyWeeklyMenu = {
  updatedOn: "2026-02-01T10:30:00Z",

  menu: {
    monday: {
      breakfast: {
        time: { start: "07:30", end: "09:30" },
        diet: [{ name: "Idli" }, { name: "Sambar" }, { name: "Chutney" }],
        extras: [{ name: "Extra Idli", price: 20 }]
      },
      lunch: {
        time: { start: "12:30", end: "14:30" },
        diet: [{ name: "Rice" }, { name: "Dal" }, { name: "Paneer Curry" }],
        extras: [{ name: "Curd", price: 10 }]
      },
      dinner: {
        time: { start: "19:30", end: "21:30" },
        diet: [{ name: "Chapati" }, { name: "Veg Curry" }],
        extras: []
      }
    },

    tuesday: {
      breakfast: {
        time: { start: "07:30", end: "09:30" },
        diet: [{ name: "Upma" }, { name: "Chutney" }],
        extras: [{ name: "Vada", price: 15 }]
      },
      lunch: {
        time: { start: "12:30", end: "14:30" },
        diet: [{ name: "Rice" }, { name: "Rajma" }],
        extras: []
      },
      dinner: {
        time: { start: "19:30", end: "21:30" },
        diet: [{ name: "Chapati" }, { name: "Paneer Curry" }],
        extras: [{ name: "Extra Chapati", price: 8 }]
      }
    },

    wednesday: {
      breakfast: {
        time: { start: "07:30", end: "09:30" },
        diet: [{ name: "Dosa" }, { name: "Sambar" }],
        extras: [{ name: "Extra Dosa", price: 25 }]
      },
      lunch: {
        time: { start: "12:30", end: "14:30" },
        diet: [{ name: "Rice" }, { name: "Chole" }],
        extras: [{ name: "Onion Salad", price: 5 }]
      },
      dinner: {
        time: { start: "19:30", end: "21:30" },
        diet: [{ name: "Chapati" }, { name: "Dal Fry" }],
        extras: []
      }
    },

    thursday: {
      breakfast: {
        time: { start: "07:30", end: "09:30" },
        diet: [{ name: "Poha" }, { name: "Tea" }],
        extras: [{ name: "Extra Poha", price: 18 }]
      },
      lunch: {
        time: { start: "12:30", end: "14:30" },
        diet: [{ name: "Rice" }, { name: "Kadhi Pakoda" }],
        extras: [{ name: "Curd", price: 10 }]
      },
      dinner: {
        time: { start: "19:30", end: "21:30" },
        diet: [{ name: "Chapati" }, { name: "Aloo Gobi" }],
        extras: []
      }
    },

    friday: {
      breakfast: {
        time: { start: "07:30", end: "09:30" },
        diet: [{ name: "Puri" }, { name: "Aloo Sabzi" }],
        extras: [{ name: "Extra Puri", price: 12 }]
      },
      lunch: {
        time: { start: "12:30", end: "14:30" },
        diet: [{ name: "Rice" }, { name: "Dal Tadka" }],
        extras: [{ name: "Papad", price: 5 }]
      },
      dinner: {
        time: { start: "19:30", end: "21:30" },
        diet: [{ name: "Chapati" }, { name: "Mix Veg" }],
        extras: []
      }
    },

    saturday: {
      breakfast: {
        time: { start: "08:00", end: "10:00" },
        diet: [{ name: "Paratha" }, { name: "Curd" }],
        extras: [{ name: "Butter", price: 10 }]
      },
      lunch: {
        time: { start: "13:00", end: "15:00" },
        diet: [{ name: "Rice" }, { name: "Veg Biryani" }],
        extras: [{ name: "Raita", price: 10 }]
      },
      dinner: {
        time: { start: "19:30", end: "21:30" },
        diet: [{ name: "Chapati" }, { name: "Paneer Butter Masala" }],
        extras: [{ name: "Extra Paneer", price: 40 }]
      }
    },

    sunday: {
      breakfast: {
        time: { start: "08:00", end: "10:00" },
        diet: [{ name: "Bread Toast" }, { name: "Jam" }, { name: "Milk" }],
        extras: [{ name: "Boiled Egg", price: 10 }]
      },
      lunch: {
        time: { start: "13:00", end: "15:00" },
        diet: [{ name: "Rice" }, { name: "Special Thali" }],
        extras: [{ name: "Sweet", price: 20 }]
      },
      dinner: {
        time: { start: "19:30", end: "21:30" },
        diet: [{ name: "Chapati" }, { name: "Light Veg Curry" }],
        extras: []
      }
    }
  }
};


//dummy hostel accounts for admin
export const dummyAdminHostelAccounts = [
  { id: 1, name: "Chakardhar Bhawan", residents: "boys", students: 200,
    accountantContactNo: "7049049987", accountantEmail: "123103017@nitkkr.ac.in",
    hostelContactNo: "7049049987", hostelEmail: "123103017@nitkkr.ac.in",
    loginId: "acc_1",
  },
  { id: 2, name: "Chakardhar Bhawan", residents: "boys",  students: 200,
    accountantContactNo: "7049049987", accountantEmail: "123103017@nitkkr.ac.in",
    hostelContactNo: "7049049987", hostelEmail: "123103017@nitkkr.ac.in",
    loginId: "acc_2",
  },
  { id: 3, name: "Chakardhar Bhawan", residents: "boys",  students: 200,
    accountantContactNo: "7049049987", accountantEmail: "123103017@nitkkr.ac.in",
    hostelContactNo: "7049049987", hostelEmail: "123103017@nitkkr.ac.in",
    loginId: "acc_3",
  },
  { id: 4, name: "Chakardhar Bhawan", residents: "boys",  students: 200,
    accountantContactNo: "7049049987", accountantEmail: "123103017@nitkkr.ac.in",
    hostelContactNo: "7049049987", hostelEmail: "123103017@nitkkr.ac.in",
    loginId: "acc_4",
  },
  { id: 5, name: "Chakardhar Bhawan", residents: "boys",  students: 200,
    accountantContactNo: "7049049987", accountantEmail: "123103017@nitkkr.ac.in",
    hostelContactNo: "7049049987", hostelEmail: "123103017@nitkkr.ac.in",
    loginId: "acc_5", 
  },
  { id: 6, name: "Chakardhar Bhawan", residents: "boys",  students: 200,
    accountantContactNo: "7049049987", accountantEmail: "123103017@nitkkr.ac.in",
    hostelContactNo: "7049049987", hostelEmail: "123103017@nitkkr.ac.in",
    loginId: "acc_6", 
  },
  { id: 7, name: "Chakardhar Bhawan", residents: "boys",  students: 200,
    accountantContactNo: "7049049987", accountantEmail: "123103017@nitkkr.ac.in",
    hostelContactNo: "7049049987", hostelEmail: "123103017@nitkkr.ac.in",
    loginId: "acc_7", 
  },
  { id: 8, name: "Chakardhar Bhawan", residents: "boys",  students: 200,
    accountantContactNo: "7049049987", accountantEmail: "123103017@nitkkr.ac.in",
    hostelContactNo: "7049049987", hostelEmail: "123103017@nitkkr.ac.in",
    loginId: "acc_8", 
  },
  { id: 9, name: "Chakardhar Bhawan", residents: "boys",  students: 200,
    accountantContactNo: "7049049987", accountantEmail: "123103017@nitkkr.ac.in",
    hostelContactNo: "7049049987", hostelEmail: "123103017@nitkkr.ac.in",
    loginId: "acc_9", 
  },
  { id: 10, name: "Chakardhar Bhawan", residents: "boys",  students: 200,
    accountantContactNo: "7049049987", accountantEmail: "123103017@nitkkr.ac.in",
    hostelContactNo: "7049049987", hostelEmail: "123103017@nitkkr.ac.in",
    loginId: "acc_10", 
  },
  { id: 11, name: "Chakardhar Bhawan", residents: "boys",  students: 200,
    accountantContactNo: "7049049987", accountantEmail: "123103017@nitkkr.ac.in",
    hostelContactNo: "7049049987", hostelEmail: "123103017@nitkkr.ac.in",
    loginId: "acc_11", 
  },
  { id: 12, name: "Kalpana Bhawan", residents: "girls",  students: 200,
    accountantContactNo: "7049049987", accountantEmail: "123103017@nitkkr.ac.in",
    hostelContactNo: "7049049987", hostelEmail: "123103017@nitkkr.ac.in",
    loginId: "acc_12", 
  },
  { id: 13, name: "Kalpana Bhawan", residents: "girls",  students: 200,
    accountantContactNo: "7049049987", accountantEmail: "123103017@nitkkr.ac.in",
    hostelContactNo: "7049049987", hostelEmail: "123103017@nitkkr.ac.in",
    loginId: "acc_13", 
  },
  { id: 14, name: "Kalpana Bhawan", residents: "girls",  students: 200,
    accountantContactNo: "7049049987", accountantEmail: "123103017@nitkkr.ac.in",
    hostelContactNo: "7049049987", hostelEmail: "123103017@nitkkr.ac.in",
    loginId: "acc_14", 
  },
];

export const dummyAdminStudentsData = [
  { identifier: "123109001@nitkkr.ac.in", name: "Mukesh Kumar"},
  { identifier: "123109002@nitkkr.ac.in", name: "Rohit Sharma"},
  { identifier: "123109003@nitkkr.ac.in", name: "Aman Verma"},
  { identifier: "123109004@nitkkr.ac.in", name: "Suresh Yadav"},
  { identifier: "123109005@nitkkr.ac.in", name: "Ankit Singh"},
  { identifier: "123109006@nitkkr.ac.in", name: "Rahul Mehta"},
  { identifier: "123109007@nitkkr.ac.in", name: "Deepak Kumar"},
  { identifier: "123109008@nitkkr.ac.in", name: "Nitin Gupta"},
  { identifier: "123109009@nitkkr.ac.in", name: "Vikas Chauhan"},
  { identifier: "123109010@nitkkr.ac.in", name: "Pankaj Jain",},
  { identifier: "123109011@nitkkr.ac.in", name: "Sachin Patel",},

  { identifier: "123109012@nitkkr.ac.in", name: "Kunal Arora"},
  { identifier: "123109013@nitkkr.ac.in", name: "Manish Pandey"},
  { identifier: "123109014@nitkkr.ac.in", name: "Harsh Vardhan"},
  { identifier: "123109015@nitkkr.ac.in", name: "Abhishek Roy"},
  { identifier: "123109016@nitkkr.ac.in", name: "Shubham Mishra"},
  { identifier: "123109017@nitkkr.ac.in", name: "Aditya Joshi"},
  { identifier: "123109018@nitkkr.ac.in", name: "Ravi Prakash"},
  { identifier: "123109019@nitkkr.ac.in", name: "Mohit Bansal"},
  { identifier: "123109020@nitkkr.ac.in", name: "Yash Malhotra"},
  { identifier: "123109021@nitkkr.ac.in", name: "Arjun Khanna"},
]

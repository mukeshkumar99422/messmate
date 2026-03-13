# Mess Mate - Hostel Mess Companion

Mess Mate is a comprehensive full-stack web application designed to streamline student mess diet management, track extra meal purchases, and simplify menu updates for hostel administration. 

## 🚀 Demos

Here is a quick look at the different modules of Mess Mate in action:

| Authentication |
| :---: |
| ![Login Flow](./demo/login.gif) |

| Student Portal |
| :---: |
| ![Student Features](./demo/student.gif) |



| Accountant Dashboard |
| :---: |
| ![Accountant Features](./demo/accountant.gif) |

| Admin Panel |
| :---: |
| ![Admin Features](./demo/admin.gif) |

## ✨ Features

### Authentication
* **Role-Based Login:** Intelligent access control that automatically routes users to their respective interfaces (Admin Panel, Accountant Dashboard, or Student Portal) based on their assigned role.
* **Versatile Login Flow:** Secure login using standard password authentication, OTP-based login, and a "forgot password" recovery option.
* **Student Sign-up:** Seamless registration asking for Name, Email, Hostel, Password, and Password Confirmation.
* **OTP Validation:** Mandatory email OTP validation directly after signup to activate the account before logging in.

### Student Portal
* **Menu Viewer:** Check today's menu instantly or browse the complete 7-day schedule by selecting specific days.
* **Purchase Tracking:** Log and update daily purchases of extra mess items by selecting the specific date and meal time.
* **Spending Analytics:** In-depth purchase analysis with customizable date ranges (last week, last month, overall, or custom month).
  * *Meal-wise Spending:* Overall expenditure broken down by specific meals.
  * *Item-wise Spending:* Breakdown of costs based on individual extra items.
  * *Trend Analysis:* Visual spending trends over the selected time frame.

### Accountant Dashboard
* **Daily Menu Management:** View and update the current day's menu, including meal timings, regular items, and extra items.
* **AI-Powered Menu Updation:** View the full weekly menu and easily update it by uploading an image of a physical menu. Powered by Generative AI, the system automatically extracts and structures the menu data from the image.

### Admin Panel
* **Hostel Management:** View complete data across all hostels.
* **Onboarding:** Add new hostels to the system and generate unique login credentials (ID & password) for their respective accountants.
* **Credential Management:** Update existing hostel data and manage accountant login credentials.
* **Student Roster Management:** Filter the student database by hostel, batch, course, or branch. Easily remove inactive or passed-out student accounts to keep the database clean.

## 🛠️ Technologies Used
* **Frontend:** React.js, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **AI Integration:** Gemini AI (for image-to-text menu extraction)

## ⚙️ How to Use (Local Setup)

Follow these steps to set up and run Mess Mate on your local machine.

### Prerequisites
Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
* A [Google Gemini API Key](https://aistudio.google.com/app/apikey)
* An App Password for your Gmail account (to send OTPs)

### 1. Clone the Repository
```bash
git clone https://github.com/mukeshkumar99422/messmate
cd messmate
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a .env file in the server directory and add the following variables:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=frontend_url
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd client
npm install
```

Create a .env file in the client directory and add the following variables:
```
VITE_BACKEND_URL=backend_url/api
```

### 5. Start the servers
In server terminal
```bash
npm run server
```
In client terminal
```bash
npm run dev
```
Update client and server URI in .env files
Restart servers

### 6. Admin Initialization
Because the Admin account bypasses standard signup, you will need to run your admin creation script to securely generate the first admin user in your MongoDB database:

```bash
cd server
node createAdmin.js
```
You can now log in at http://localhost:5173/login using your Admin credentials, and start adding hostels.

---
*Developed by Mukesh Kumar*
# Sweetly — Smart Blood Glucose Tracker

A web application designed for diabetes patients to record up to 4 blood glucose readings a day, analyze glucose trends, and view daily, month-to-date, and monthly summary reports.

---

## 🌟 Overview

**Sweetly** provides a calm, distraction-free companion for blood glucose management. It features:
- A health-tech landing page with an editorial retro-modern aesthetic, custom digital glucometer illustration, and live glucose analytics charts.
- An authenticated Patient Dashboard for logging daily checks across 4 meal slots, monitoring key daily statistics, and viewing paginated history logs with full **Add, View, Edit, and Delete (CRUD)** capabilities.
- Strict data isolation ensuring every patient accesses only their own private health records.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 (SPA with Vite)
- **Routing**: React Router DOM (v7)
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Icons**: Lucide React
- **Typography**: `Fraunces` (editorial serif for headlines) & `Plus Jakarta Sans` (body and numerals)
- **Testing**: Vitest, React Testing Library, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: PostgreSQL (connection pool with `pg`)
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs` password hashing (10 salt rounds)
- **Testing**: Jest, Supertest

---

## 📋 Key Features

- **Full CRUD for Glucose Readings**: Add, View, Edit, and Delete entries with confirmation prompts.
- **5-Row Paginated History Table**: Keeps the dashboard compact and readable with Previous / Next navigation controls and total record indicators.
- **Timezone-Safe Date Storage**: Stored as calendar `YYYY-MM-DD` strings to prevent UTC midnight shifts from displaying yesterday's date.
- **Interactive Glucose Visualizations**:
  - *Daily Breakdown*: Color-coded meal slot bars with trend curve and target band.
  - *Monthly Trend*: 30-day longitudinal area curve tracking day-to-day fluctuations.
  - Collision-free target range indicators (70–140 mg/dL) positioned safely outside data points.
  - Empty states with a direct `[+ Add Reading in Dashboard]` shortcut for new users.
- **Consistent Full-Width Canvas**: Responsive `max-w-[1440px]` design system eliminating awkward blank margins across all screen resolutions.

---

## 📐 Business Rules & Validations

1. **Glucose Value Boundaries**:
   - Required (*"Please enter a glucose value."*).
   - Valid range: **40 to 600 mg/dL** (*"Value must be between 40 and 600 mg/dl."*).
2. **Meal Slots**:
   - Must be one of: `morning`, `after_breakfast`, `after_lunch`, `after_dinner`.
   - **One reading per slot per day**: Entering a duplicate slot for the same date is blocked (*"You already have a [Slot] reading for this date."*).
3. **Daily Limit**:
   - Maximum **4 readings per day** across the 4 meal slots (*"You can add only 4 readings per day."*).
4. **Date Constraints**:
   - Dates cannot be in the future (*"Date cannot be in the future."*).
   - Patients can record readings for today, yesterday, or any past day.
5. **Editing Rule**:
   - When updating an existing reading (`PUT /api/readings/:id`), the backend and frontend conflict checks ignore the row being edited so changing the value or slot is never falsely blocked by duplicate rules.
6. **Clinical Target Range**:
   - Normal target range: **70 to 140 mg/dL**.
   - Readings `< 70 mg/dL` are flagged as **Low** (amber badge).
   - Readings `> 140 mg/dL` are flagged as **Elevated** (coral badge).
   - Readings `70–140 mg/dL` are flagged as **In Range** (mint green badge).

---

## 📡 API Documentation

All protected endpoints require an `Authorization: Bearer <token>` header.

### Authentication Endpoints

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | `{ "name": "...", "email": "...", "password": "..." }` |
| `POST` | `/api/auth/login` | Authenticate & get token | `{ "email": "...", "password": "..." }` |
| `GET` | `/api/auth/me` | Fetch authenticated user | *None* |

### Glucose Readings Endpoints

| Method | Endpoint | Description | Parameters / Body |
|---|---|---|---|
| `POST` | `/api/readings` | Add a glucose reading | `{ "date": "YYYY-MM-DD", "slot": "morning", "value": 110 }` |
| `GET` | `/api/readings` | List readings (paginated) | `?date=YYYY-MM-DD&page=1&limit=20` |
| `PUT` | `/api/readings/:id` | Update an existing reading | `{ "date": "YYYY-MM-DD", "slot": "morning", "value": 115 }` |
| `DELETE` | `/api/readings/:id` | Delete a reading | *None* |

### Reports & Analytics Endpoints

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/reports/daily` | Selected date report | `?date=YYYY-MM-DD` |
| `GET` | `/api/reports/month-to-date` | 1st of month to date | `?date=YYYY-MM-DD` |
| `GET` | `/api/reports/monthly` | Full month summary | `?month=YYYY-MM` |

---

## 🚀 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)

---

### 1. Database Setup

1. Start your local PostgreSQL service.
2. Create the development and test databases:
   ```sql
   CREATE DATABASE glucose_db;
   CREATE DATABASE glucose_test;
   ```

---

### 2. Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables in `backend/.env`:
   ```ini
   PORT=5000
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/glucose_db
   TEST_DATABASE_URL=postgresql://postgres:your_password@localhost:5432/glucose_test
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```
4. *(Optional)* Seed sample data and create a demo patient account:
   ```bash
   npm run seed
   ```
   *Demo credentials created by seed script:*
   - **Email**: `demo@sweety.com`
   - **Password**: `Demo@123`
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:5000`.

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 🧪 Running the Tests

### Backend Tests (Jest + Supertest)
Runs automated integration tests covering user registration, login, auth protection, reading validations, 4-reading limit, duplicate slot checks, and daily/monthly reports:
```bash
cd backend
npm test
```

**Frontend tests** (React Testing Library + Vitest):
```bash
cd frontend
npm test
```

They cover the reading form: rendering, every validation message, duplicate-slot and 4-per-day handling, adding a reading, editing a reading and cancelling an edit.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📝 Notes

### Assumptions
- The "date cannot be in the future" check uses the server's local date.
- "Maximum 4 readings per day" is checked before the "one reading per slot" rule.
- The monthly report is the whole previous month relative to the selected date, as in the brief.
- The 70–140 mg/dL target range and the Low / In Range / Elevated labels are my own choice, for display only.
- The signup form asks for 8-character passwords, while the API accepts 6 or more.
- Dates are handled as plain `YYYY-MM-DD` strings to avoid timezone shifts.
- Tables are created automatically from `backend/src/models/schema.sql` when the server or seed script starts.

### What I would improve with more time
- Refresh tokens and automatic logout when a token expires
- Docker Compose for PostgreSQL and the app
- Frontend tests for the login flow and the reports
- Month-to-date chart and caching of report results
- A doctor role to view assigned patients' reports

## 🎥 Demo

Screen recording:https://drive.google.com/file/d/1tGhYFEvI3tA877hC-B9zNyW0PyK_6rIb/view?usp=sharing
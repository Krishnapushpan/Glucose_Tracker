# Sweety – Blood Glucose Tracker

A web application designed for diabetes patients to record up to 4 blood glucose readings a day and view daily, month-to-date, and monthly summary reports.

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (with `pg` connection pool)
- **Security & Auth**: bcryptjs (password hashing with 10 salt rounds), JSON Web Tokens (JWT)
- **Testing**: Jest, Supertest
- **Frontend**: React (Vite), Modern responsive UI

---

## 📋 Features

1. **User Authentication**
   - Registration with Name, Email, and Password.
   - Hashed password storage with bcrypt (plain-text passwords are never stored).
   - Login issuing secure JWT tokens.
   - Strict data isolation: authenticated users only access their own readings.

2. **Glucose Readings Tracking**
   - 4 slots: *Morning (fasting)*, *After breakfast*, *After lunch*, *After dinner*.
   - Validation rules:
     - Value is required (*"Please enter a glucose value."*)
     - Value between 40 and 600 (*"Value must be between 40 and 600 mg/dl."*)
     - One reading per slot per day (*"You already have an [Slot] reading for this date."*)
     - Maximum 4 readings per day (*"You can add only 4 readings per day."*)
     - Date cannot be in the future (*"Date cannot be in the future."*)

3. **Reports & Statistics**
   - **Daily Report**: Selected date's readings with breakdown by slot, highest, lowest, average (rounded to 1 decimal), and total count.
   - **Month-to-Date Report**: 1st of current month to selected date.
   - **Monthly Report**: Entire previous month.
   - Friendly empty states when no data is recorded.

---

## 📝 Design Decisions & Assumptions

1. **Database Schema & Constraints**:
   - `users`: `id`, `name`, `email` (unique, lowercase), `password_hash`, `created_at`.
   - `readings`: `id`, `user_id`, `date` (DATE), `slot` (VARCHAR), `value_mg_dl` (INTEGER), `created_at`, `updated_at`.
   - A unique constraint `(user_id, date, slot)` is enforced in PostgreSQL to eliminate duplicate slot entries at the database level in addition to application-level checks.
2. **Date Storage**:
   - Stored in standard `YYYY-MM-DD` ISO format to prevent timezone offset discrepancies when filtering across days and months.
3. **Authentication Isolation**:
   - All readings endpoints are guarded by `authenticateToken` middleware which extracts `req.user.id`. Every database query explicitly filters by `WHERE user_id = $1`.

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
# Configure your PostgreSQL connection in .env:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/glucose_db
npm run dev
```

Run backend tests:
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


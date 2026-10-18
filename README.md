# 🎓 EduTrack — Student Management System

A production-grade, full-stack **Student Management System** designed for colleges, universities, and training academies. Built with **React + Vite** on the frontend, **Node.js + Express** on the backend, and persistent **SQLite** storage with automated migrations and idempotent demo data seeding.

---

## 🌟 Key Features

### 1. 📊 Institutional Dashboard
- **Executive Summary Metrics**: Real-time counter cards for *Total Students*, *Active Students* (with % rate), *Inactive / On Leave Students*, and *Distinct Academic Programs*.
- **Department Distribution Chart**: Visual capacity bars showing enrollment counts and percentage share per academic major.
- **Recently Enrolled Students**: Activity feed displaying recent registrations with avatar badges, department tags, and quick-inspection modals.

### 2. 🗂️ Student Directory & Record Management
- **Full CRUD Lifecycle**: Create, Read, Update, and Delete student records with real-time feedback.
- **Standardized Student ID**: Auto-generates structured, permanent student identifiers formatted as `STU-YYYY-XXXX` (e.g. `STU-2026-0001`).
- **Live Search & Filtering**: Multi-field search across Student Name, ID, Email, and Department with instant debounce.
- **Department & Status Filters**: Filter by specific departments (*Computer Science*, *Data Science & AI*, *Cybersecurity*, etc.) or enrollment status (*Active* / *Inactive*).
- **Multi-Column Sorting**: Sort ascending or descending by Student Name, ID, Enrollment Date, Department, or Registration Timestamp.
- **Pagination**: Configurable rows per page (5, 10, 20, 50) with pagination controls.
- **One-Click CSV Export**: Download filtered or full student lists as timestamped CSV files.
- **Clipboard Utility**: One-click copy for Student IDs.

### 3. 🛡️ Validation & Data Integrity
- **Client & Server-Side Validation**: Sanitizes and validates full names, phone numbers (7–15 digits), ISO dates, and valid RFC 5322 emails.
- **Duplicate Email Prevention**: Gracefully prevents duplicate emails on both creation and modification with HTTP `409 Conflict` and UI error highlighting.
- **Safe Deletion Dialog**: Confirmation modal with student profile details to prevent accidental record loss.

### 4. ⚡ System Health & REST Diagnostics
- **Live Diagnostics View**: Built-in monitor displaying Express server status, SQLite WAL mode, security headers, and interactive endpoint catalog.

---

## 🏗️ Architecture & Tech Stack

```
[ Frontend: React 19 + Vite ]  <--- HTTP / JSON Proxy --->  [ Backend: Express 5 + Node.js 24 ]
          |                                                               |
  Vanilla CSS Tokens                                            better-sqlite3 Engine
  Responsive Admin UI                                                     |
  Lucide-React Icons                                            [ SQLite: students.db ]
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 6/8, Vanilla CSS (Custom Design System & Tokens), Lucide Icons |
| **Backend** | Node.js (v18+ / v20+ / v24+), Express 5, CORS, Dotenv, Morgan |
| **Database** | SQLite 3 via `better-sqlite3` with Write-Ahead Logging (WAL) & Foreign Keys |
| **Testing** | Node.js native test runner (`node:test`) + `supertest` for end-to-end integration tests |

---

## 📁 Project Directory Structure

```
student-management-system/
├── .env.example              # Template environment variables
├── .gitignore                # Comprehensive ignore rules (DB, env, node_modules)
├── package.json              # Root workspace orchestrator with dev & build scripts
├── README.md                 # Technical documentation & usage guide
├── backend/
│   ├── .env.example          # Backend environment template
│   ├── .env                  # Local development config (git-ignored)
│   ├── package.json          # Backend dependencies and scripts
│   ├── data/                 # SQLite storage directory
│   │   └── students.db       # Persistent SQLite database file (git-ignored)
│   ├── src/
│   │   ├── app.js            # Express application setup & middleware mounting
│   │   ├── server.js         # HTTP server entrypoint & auto-seeder
│   │   ├── config/
│   │   │   └── index.js      # Centralized environment configuration
│   │   ├── controllers/
│   │   │   └── studentController.js # CRUD & dashboard controller logic
│   │   ├── db/
│   │   │   ├── database.js   # SQLite connection, schema initialization & ID generator
│   │   │   └── seed.js       # Safe, idempotent demo data seeding script
│   │   ├── middleware/
│   │   │   ├── errorHandler.js # Centralized 404 & error handling
│   │   │   └── security.js   # CORS policy and security headers
│   │   ├── routes/
│   │   │   ├── studentRoutes.js   # /api/students endpoints
│   │   │   ├── dashboardRoutes.js # /api/dashboard/stats endpoints
│   │   │   └── healthRoutes.js    # /api/health endpoint
│   │   └── validators/
│   │       └── studentValidator.js # Payload normalization and validation
│   └── tests/
│       └── api.test.js       # Automated integration test suite (16 tests)
└── frontend/
    ├── index.html            # HTML entry point with Google Fonts
    ├── package.json          # Frontend dependencies (React, Vite, Lucide)
    ├── vite.config.js        # Vite configuration with /api proxy to port 5000
    ├── public/
    │   └── favicon.svg       # Educational SVG crest favicon
    └── src/
        ├── main.jsx          # React DOM root mounting
        ├── App.jsx           # Master application coordinator and state
        ├── App.css           # Responsive layout & component CSS
        ├── index.css         # Design system tokens, variables & typography
        ├── services/
        │   └── api.js        # Native fetch API client with error handling
        └── components/
            ├── Sidebar.jsx   # Collegiate navigation drawer with mobile support
            ├── Header.jsx    # Sticky navigation bar with API health pill & CTA
            ├── DashboardView.jsx # Summary cards, distribution bars, recent list
            ├── StudentsView.jsx  # Data table with search, filters, pagination
            ├── DepartmentsView.jsx # Department statistics & program breakdown
            ├── SystemView.jsx    # Health diagnostics & endpoint reference
            ├── StudentModal.jsx  # Add / Edit student modal with live validation
            ├── StudentDetailsModal.jsx # Comprehensive student profile view
            ├── DeleteConfirmModal.jsx # Safe deletion warning dialog
            └── Toast.jsx     # Floating notification alert component
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher (tested on `v24.14.0`)
- **npm**: `v9.0.0` or higher
- **Git** (optional, for version control)

### 1. Installation

From the project root folder:

```bash
# Install root dependencies (concurrently)
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

*(Or simply run `npm run install:all`)*

### 2. Environment Setup

Create `.env` files from templates:

```bash
# Root template
cp .env.example .env

# Backend environment file
cp backend/.env.example backend/.env
```

Default `.env` configuration:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DB_PATH=./data/students.db
DEBUG_SQL=false
```

### 3. Database Seeding (Optional)
The database auto-seeds on first server start if empty, but you can manually seed or re-seed at any time. The seeder is **idempotent** (safe against duplicate runs):

```bash
npm run seed
```

### 4. Running the Application

#### Option A: Concurrent Development (Recommended)
Starts both the backend API server (`http://localhost:5000`) and the Vite frontend dev server (`http://localhost:5173`) simultaneously:

```bash
npm run dev
```

#### Option B: Individual Services
```bash
# Terminal 1 - Backend API Server
npm run dev:backend

# Terminal 2 - Frontend Dev Server
npm run dev:frontend
```

Once running, access:
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📡 REST API Documentation

All API responses adhere to standard JSON structures:
- **Success**: `{ success: true, data: ..., message?: string, pagination?: {...} }`
- **Error**: `{ success: false, error: string, details?: Array<{ field: string, message: string }> }`

### Endpoints Overview

| Method | Endpoint | Description | Query Parameters / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service and database connectivity health check | None |
| `GET` | `/api/dashboard/stats` | Aggregated metrics, course distribution, and recent students | None |
| `GET` | `/api/students` | Paginated list of student records | `page`, `limit`, `search`, `course`, `status`, `sortBy`, `sortOrder` |
| `GET` | `/api/students/:id` | Fetch single student record by Student ID | `:id` (e.g. `STU-2026-0001`) |
| `POST` | `/api/students` | Register a new student record | JSON body (see schema below) |
| `PUT` | `/api/students/:id` | Update an existing student's details | JSON body |
| `DELETE` | `/api/students/:id` | Permanently delete a student record | `:id` |

### Sample Requests & Responses

#### 1. Create Student (`POST /api/students`)
**Request Body:**
```json
{
  "full_name": "Eleanor Vance",
  "email": "eleanor.vance@example.edu",
  "phone": "+1 (555) 432-1098",
  "course": "Computer Science",
  "enrollment_date": "2026-02-01",
  "status": "Active"
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Student record created successfully.",
  "data": {
    "id": "STU-2026-0013",
    "full_name": "Eleanor Vance",
    "email": "eleanor.vance@example.edu",
    "phone": "+1 (555) 432-1098",
    "course": "Computer Science",
    "enrollment_date": "2026-02-01",
    "status": "Active",
    "created_at": "2026-02-01 12:00:00",
    "updated_at": "2026-02-01 12:00:00"
  }
}
```

#### 2. Duplicate Email Error (`POST /api/students`)
**Response (`409 Conflict`):**
```json
{
  "success": false,
  "error": "A student with email \"eleanor.vance@example.edu\" already exists.",
  "details": [
    {
      "field": "email",
      "message": "Email address is already in use by another student."
    }
  ]
}
```

#### 3. Dashboard Statistics (`GET /api/dashboard/stats`)
**Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "totalStudents": 12,
    "activeStudents": 9,
    "inactiveStudents": 3,
    "totalCourses": 8,
    "coursesList": [
      "Biotechnology",
      "Business Administration",
      "Computer Science",
      "Cybersecurity",
      "Data Science & AI",
      "Electrical & Electronics",
      "Information Technology",
      "Mechanical Engineering"
    ],
    "courseDistribution": [
      { "course": "Computer Science", "count": 2 },
      { "course": "Data Science & AI", "count": 2 },
      { "course": "Cybersecurity", "count": 2 }
    ],
    "recentStudents": [...]
  }
}
```

---

## 🗄️ Database & Schema

The application uses SQLite with Write-Ahead Logging (WAL) for high performance and concurrency. Tables and indexes are generated automatically on application boot.

### Table Schema: `students`
```sql
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  phone TEXT NOT NULL,
  course TEXT NOT NULL,
  enrollment_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('Active', 'Inactive')),
  created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
  updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at);
CREATE INDEX IF NOT EXISTS idx_students_full_name ON students(full_name);
```

---

## 🧪 Testing & Verification

The backend includes a comprehensive, automated integration test suite written with Node's native `node:test` runner and `supertest`.

### Run Automated Tests
```bash
npm test
```

### Verified Test Cases (16 Passing Tests):
1. ✅ Health check endpoint returns `200 OK` and `healthy` database status.
2. ✅ Dashboard stats calculates accurate totals, active counts, and distributions.
3. ✅ Students endpoint returns properly paginated records with page limits.
4. ✅ Case-insensitive multi-field search matches students.
5. ✅ Course and department filtering isolates matching records.
6. ✅ Required field validation returns `400 Bad Request` with field error details.
7. ✅ Invalid email format returns `400 Bad Request`.
8. ✅ Student creation generates structured `STU-YYYY-XXXX` identifier.
9. ✅ Duplicate email prevention triggers `409 Conflict`.
10. ✅ Retrieve individual student profile by ID (`200 OK`).
11. ✅ Non-existent student query returns structured `404 Not Found`.
12. ✅ Update student record updates timestamp and details (`200 OK`).
13. ✅ Update preventing collision with another student's email (`409 Conflict`).
14. ✅ Student deletion removes record and returns confirmation (`200 OK`).
15. ✅ Re-deleting already deleted record returns `404 Not Found`.
16. ✅ Centralized 404 handler catches invalid API routes.

---

## 🔒 Security & Reliability Measures

- **Parameterized Queries**: All database interactions use prepared statements (`?`) with `better-sqlite3`, eliminating SQL injection risks.
- **Strict CORS Policy**: Restricted to the configured origin (`http://localhost:5173`), preventing unauthorized cross-origin requests.
- **Defensive Error Handling**: Internal stack traces and database details are sanitized from client responses in production.
- **Request Body Limits**: JSON and URL-encoded bodies are strictly constrained to 100kb to mitigate DoS payloads.
- **Security Headers**: Essential HTTP security headers set (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`).
- **Input Sanitization**: Strings are trimmed, emails normalized to lowercase, and phone numbers validated for digit counts.

---

## 🛠️ Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **Port 5000 is already in use** | Update `PORT=5001` in `.env` and `backend/.env`, and update the proxy target in `frontend/vite.config.js`. |
| **CORS error in browser console** | Ensure `CORS_ORIGIN=http://localhost:5173` matches the exact URL of your Vite frontend. |
| **Database file locked or reset** | The database is saved persistently in `backend/data/students.db`. Ensure proper file permissions on the directory. |
| **Frontend displays "API Offline"** | Start the backend server (`npm run dev:backend` or `npm run dev`) and verify `http://localhost:5000/api/health` responds. |

---

## 📦 GitHub Preparation & Safe Push Guide

Follow these steps to push this project to your own GitHub account:

1. **Verify your local Git configuration**:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

2. **Stage tracked files**:
   ```bash
   git add .
   ```

3. **Verify staged files (ensure no `.env` or `.db` files are included)**:
   ```bash
   git status
   ```

4. **Create initial commit**:
   ```bash
   git commit -m "feat: complete initial release of Student Management System"
   ```

5. **Create a new empty repository on GitHub** (e.g. `student-management-system`).

6. **Add the remote and push**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/student-management-system.git
   git push -u origin main
   ```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

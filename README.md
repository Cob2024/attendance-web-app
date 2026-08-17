# SmartAttend — Next-Gen University Attendance Management System

SmartAttend is a security-hardened, full-stack attendance management system engineered for higher education institutions (specifically tailored for Takoradi Technical University - TTU). It eliminates proxy attendance through **GPS geofencing**, **device hardware fingerprint binding**, **one-time live session passcodes**, and **configurable session auto-close timers**.

---

## 🚀 Key Features

### 1. 📍 GPS Geofencing & Haversine Distance Verification
- Lecturers initiate live attendance sessions with their current GPS coordinates.
- Students must be physically located within a **50-meter radius** (server-calculated via Haversine formula) to mark attendance.
- Coordinates and distances are logged and audited on both server and client.

### 2. 📱 Hardware Device Fingerprint Binding (Anti-Proxy)
- Each student account is cryptographically bound to their device browser on first login.
- Prevents students from logging in on friends' phones to mark proxy attendance.
- Administrators have one-click **"Reset Device"** controls if a student switches hardware or browsers.

### 3. ⏳ Session Auto-Close & Real-Time Countdown
- Lecturers can set configurable session durations (**15m, 30m, 45m, 1h, 1.5h, 2h, or Until Stopped**).
- Real-time countdown timer displayed on active lecturer sessions.
- Sessions automatically expire on the backend and frontend when the timer runs out.

### 4. 👥 Explicit Student Enrollment Management
- Manage student course enrollments explicitly with single and bulk enrollment options.
- **Bulk Auto-Enrollment**: Automatically enroll students matching course programme and level.
- Lecturers and Administrators can view enrolled rosters and unenroll students when needed.

### 5. 📊 Enhanced Reports & PDF / CSV Exports
- **CSV / Excel Export**: One-click download of clean, structured attendance sheets with student details, timestamps, and course metadata.
- **Admin System-Wide Reports**: Export attendance records across all courses and programmes.
- **PDF Report Generation**: Formatted PDF attendance sheets with statistical summaries powered by `jsPDF` and `jspdf-autotable`.

### 6. 🌓 Persistent Dark / Light Mode
- Seamless theme switching with smooth CSS transitions across all views, tables, cards, charts, and modals.
- Persisted in browser `localStorage` and synchronized across user sessions.

---

## 📦 Architecture & Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler / Server**: Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4 & custom theme design system
- **Charts & Visualizations**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast notifications)
- **PDF Generation**: jsPDF + jspdf-autotable

### Backend
- **Runtime**: Node.js with TypeScript & Express
- **ORM**: Prisma Client v5 / v7
- **Database**: SQLite (`prisma/dev.db`)
- **Security**: JSON Web Tokens (JWT), Argon2/bcrypt password hashing, CORS, Helmet
- **Geospatial Utilities**: Haversine distance calculation

---

## 🗂️ Project Structure

```
├── server/                          # Backend Express & Prisma application
│   ├── prisma/
│   │   ├── schema.prisma            # Prisma schema (User, Course, Session, Attendance, Enrollment, DeviceBinding)
│   │   ├── dev.db                   # SQLite database
│   │   └── seed.ts                  # Database seeder with TTU demo data
│   ├── src/
│   │   ├── index.ts                 # Express server entry point
│   │   ├── db.ts                    # Prisma client singleton
│   │   ├── middleware/
│   │   │   └── auth.ts              # JWT authentication & RBAC middleware
│   │   ├── routes/
│   │   │   ├── authRoutes.ts        # Authentication & profile endpoints
│   │   │   ├── courseRoutes.ts      # Course management endpoints
│   │   │   ├── attendanceRoutes.ts  # Session & attendance marking endpoints
│   │   │   ├── adminRoutes.ts       # Admin & device management endpoints
│   │   │   └── enrollmentRoutes.ts  # Student course enrollment endpoints
│   │   └── utils/
│   │       └── haversine.ts         # Server-side GPS distance calculation
│   └── package.json
│
├── src/                             # Frontend React application
│   ├── app/
│   │   ├── App.tsx                  # Root application router
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Auth & device state provider
│   │   ├── pages/
│   │   │   ├── Login.tsx            # Login portal
│   │   │   ├── StudentDashboard.tsx # Student dashboard & 1-tap marking
│   │   │   ├── LecturerDashboard.tsx# Lecturer controls, live sessions & charts
│   │   │   └── AdminDashboard.tsx   # Courses, lecturers, students & device resets
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # Responsive navigation & theme toggle
│   │   │   ├── ProtectedRoute.tsx   # RBAC route guard
│   │   │   └── EditProfileModal.tsx # Profile management
│   │   └── services/
│   │       ├── apiClient.ts         # REST API HTTP client
│   │       ├── apiData.ts           # Frontend API integration service
│   │       ├── geolocation.ts       # Browser GPS position service
│   │       └── mockData.ts          # LocalStorage fallback & export helpers
│   └── styles/
│       ├── theme.css                # TTU Navy / Gold brand palette & dark mode
│       └── fonts.css                # Typography
└── package.json
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js 18+** installed
- **npm** or **pnpm**

### 1. Install Dependencies

**Root (Frontend):**
```bash
npm install
```

**Server (Backend):**
```bash
cd server
npm install
```

### 2. Initialize Database & Run Seed

Inside the `server/` directory:
```bash
npx prisma db push
npx prisma db seed
```

### 3. Run Applications

**Start the Backend Server (Port 5000):**
```bash
cd server
npm run dev
```

**Start the Frontend App (Port 5173):**
```bash
# In the project root directory:
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🔑 Demo Credentials

### 👨‍🎓 Student Accounts
| Name | Email | Password | Student ID | Programme & Level |
|------|-------|----------|------------|-------------------|
| Arhinful Emmanuel Kwabena | `arhinful.emmanuel@ttu.edu.gh` | `student123` | `BC/GRD/22/118` | BTech Graphic Design, Level 300 |
| Joel Teye Tetteh | `joel.tetteh@ttu.edu.gh` | `student123` | `BC/GRD/22/101` | BTech Graphic Design, Level 300 |
| Bernard Mensah Otupri | `bernard.otupri@ttu.edu.gh` | `student123` | `BC/GRD/22/149` | BTech Graphic Design, Level 300 |
| Emmanuel Lokko | `emmanuel.lokko@ttu.edu.gh` | `student123` | `BC/GRD/22/102` | BTech Graphic Design, Level 300 |
| Abigail Mensah | `abigail.mensah@ttu.edu.gh` | `student123` | `BC/FSD/22/045` | BTech Fashion Design, Level 300 |

### 👨‍🏫 Lecturer Accounts
| Name | Email | Password | Role |
|------|-------|----------|------|
| Mr. Ernest Kudordjie | `ernest.kudordjie@ttu.edu.gh` | `lecturer123` | Lecturer |
| Mr. Ernest Kudzordzi | `ernest.kudzordzi@ttu.edu.gh` | `lecturer123` | Lecturer |
| Mr. Nduro | `nduro@ttu.edu.gh` | `lecturer123` | Lecturer |
| Prof. Betty Fanniyan | `betty.fanniyan@ttu.edu.gh` | `lecturer123` | Lecturer |

### 🛡️ Admin Account
| Name | Email | Password | Role |
|------|-------|----------|------|
| System Administrator | `admin@ttu.edu.gh` | `admin123` | Administrator |

---

## 📡 REST API Documentation

### Auth (`/api/auth`)
- `POST /api/auth/register` — Register a new student or lecturer
- `POST /api/auth/login` — Authenticate and receive JWT token + device binding check
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `PUT /api/auth/profile` — Update user profile information
- `POST /api/auth/change-password` — Change account password

### Courses (`/api/courses`)
- `GET /api/courses` — Get courses (filtered by user role: assigned for lecturers, enrolled for students)
- `POST /api/courses` — Create a new course (Admin only)
- `PUT /api/courses/:id` — Update course details or reassign lecturer (Admin only)
- `DELETE /api/courses/:id` — Delete a course and associated records (Admin only)

### Attendance & Live Sessions (`/api/attendance`)
- `POST /api/attendance/session/start` — Start live GPS attendance session with duration (`durationMinutes`)
- `POST /api/attendance/session/end` — Manually close active attendance session
- `GET /api/attendance/session/active/:courseId` — Get active session (auto-closes expired sessions)
- `POST /api/attendance/mark` — Mark student attendance with GPS coordinates + Haversine check
- `POST /api/attendance/manual` — Manually mark attendance (Lecturer/Admin)
- `GET /api/attendance/records` — Fetch attendance records with date and course filters

### Student Enrollment (`/api/enrollments`)
- `POST /api/enrollments/enroll` — Explicitly enroll student(s) into a course
- `POST /api/enrollments/unenroll` — Unenroll student from a course
- `GET /api/enrollments/course/:courseId` — Get enrolled students for a course
- `GET /api/enrollments/student/:studentId` — Get courses enrolled by a student
- `POST /api/enrollments/auto-enroll/:courseId` — Bulk auto-enroll students by programme & level

### Admin & Security (`/api/admin`)
- `GET /api/admin/users` — List all registered system users
- `PUT /api/admin/users/:id` — Update user record
- `DELETE /api/admin/users/:id` — Delete user account and cascade cleanup
- `POST /api/admin/device/reset` — Reset student hardware device lock

---

## 📄 License
This project is open source and available for institutional and educational deployment.

# SmartAttend - Attendance Management System

A full-featured attendance management system with separate dashboards for students and lecturers, built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Authentication System
- **Role-based login** (Student/Lecturer)
- **Secure session management** with localStorage
- **Protected routes** preventing unauthorized access
- **Automatic redirection** to role-specific dashboards

### Student Dashboard
- ✅ View personal profile (Name, Student ID, Course, Level)
- ✅ View all enrolled courses
- ✅ Mark attendance for each course
- ✅ Prevent duplicate attendance for the same day
- ✅ View attendance history with course details
- ✅ Real-time attendance percentage per course
- ✅ Clean, card-based UI design

### Lecturer Dashboard
- ✅ Create and manage courses
- ✅ View all assigned courses
- ✅ View enrolled students per course
- ✅ View attendance records by course and date range
- ✅ Search students by name or ID
- ✅ Filter attendance by date range
- ✅ **Download attendance reports as PDF** (with jsPDF)
- ✅ Attendance analytics with charts (using Recharts)
- ✅ Course statistics (total sessions, average attendance, etc.)

### PDF Generation
- Course name and code
- Date range filter
- Student names and IDs
- Attendance status
- Timestamp
- Statistical summary

## 📦 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **PDF Generation**: jsPDF + jspdf-autotable
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Data Storage**: localStorage (simulated backend)

## 🗂️ Project Structure

```
/src
├── /app
│   ├── App.tsx                          # Main app component
│   ├── routes.ts                        # React Router configuration
│   │
│   ├── /context
│   │   └── AuthContext.tsx              # Authentication state management
│   │
│   ├── /services
│   │   └── mockData.ts                  # Mock database service (localStorage)
│   │
│   ├── /components
│   │   ├── ProtectedRoute.tsx           # Route protection wrapper
│   │   └── Sidebar.tsx                  # Navigation sidebar
│   │
│   └── /pages
│       ├── Login.tsx                    # Login page
│       ├── StudentDashboard.tsx         # Student dashboard
│       └── LecturerDashboard.tsx        # Lecturer dashboard
│
└── /styles
    ├── theme.css                        # Theme tokens
    └── fonts.css                        # Font imports
```

## 🎯 Database Structure (localStorage)

### Users
```typescript
{
  id: string
  name: string
  email: string
  password: string
  role: 'student' | 'lecturer'
  studentId?: string      // Only for students
  course?: string         // Only for students
  level?: string          // Only for students
}
```

### Courses
```typescript
{
  id: string
  courseName: string
  courseCode: string
  lecturerId: string
}
```

### Enrollments
```typescript
{
  studentId: string
  courseId: string
}
```

### Attendance
```typescript
{
  id: string
  studentId: string
  courseId: string
  date: string           // YYYY-MM-DD format
  status: 'present' | 'absent'
  timestamp: string      // ISO 8601 format
}
```

## 🔑 Demo Credentials

### Student Accounts
| Name | Email | Password | Student ID |
|------|-------|----------|------------|
| Arhinful Emmanuel Kwabena | emmanuel@student.com | student123 | BC/GRD/22/118 |
| Joel Teye Tetteh | joel@student.com | student123 | BC/GRD/22/101 |
| Bernard Mensah Otupri | bernard@student.com | student123 | BC/GRD/22/149 |
| Emmanuel Lokko | lokko@student.com | student123 | BC/GRD/22/102 |

### Lecturer Accounts
| Name | Email | Password |
|------|-------|----------|
| Dr. Jane Wilson | jane@lecturer.com | lecturer123 |
| Prof. Michael Davis | michael@lecturer.com | lecturer123 |

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager

### Installation

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd smartattend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

5. **Login with demo credentials**
   - Use any of the demo accounts listed above
   - Students will be redirected to `/student`
   - Lecturers will be redirected to `/lecturer`

## 📖 Usage Guide

### For Students

1. **Login** with student credentials
2. **View your profile** - See your name, student ID, course, and level
3. **Mark attendance** - Click "Mark Attendance" button on any enrolled course card
4. **View attendance history** - Scroll down to see your complete attendance records
5. **Check attendance percentage** - Each course card shows your attendance rate

### For Lecturers

1. **Login** with lecturer credentials
2. **View dashboard statistics** - See total courses, students, sessions, and average attendance
3. **Select a course** - Use the dropdown to switch between your courses
4. **Create new course** - Click "Create Course" button and fill in details
5. **View attendance records** - See all attendance records in a table format
6. **Filter records**:
   - Use search to find specific students
   - Set start and end dates to filter by date range
7. **Download PDF report** - Click "Download PDF" to generate a comprehensive report
8. **View enrolled students** - Scroll down to see all students in the selected course
9. **Analyze trends** - View the attendance chart showing the last 7 days

## 🔒 Security Features

- ✅ Password-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Protected routes (cannot access other role's dashboard)
- ✅ Session persistence with localStorage
- ✅ Automatic logout functionality
- ✅ Input validation for course creation

## 🎨 UI/UX Features

- Modern, clean dashboard design
- Responsive layout (works on mobile and desktop)
- Sidebar navigation
- Card-based components
- Interactive charts and graphs
- Toast notifications for user actions
- Loading states for async operations
- Empty states with helpful messages
- Hover effects and smooth transitions

## 🔧 Key Functions

### Student Functions
- `getStudentCourses(studentId)` - Get all enrolled courses
- `markAttendance(studentId, courseId)` - Mark attendance (prevents duplicates)
- `getStudentAttendance(studentId)` - Get attendance history

### Lecturer Functions
- `getLecturerCourses(lecturerId)` - Get all assigned courses
- `getCourseAttendance(courseId, startDate?, endDate?)` - Get filtered attendance records
- `getCourseStudents(courseId)` - Get enrolled students
- `createCourse(courseName, courseCode, lecturerId)` - Create new course
- `getAttendanceStats(courseId)` - Get course statistics

## 📊 Analytics

The system calculates:
- **Per-course attendance percentage** for each student
- **Average attendance rate** across all students in a course
- **Total sessions** conducted
- **Attendance trends** over time (visualized in charts)

## 🌟 Advanced Features

1. **Duplicate Prevention**: Students cannot mark attendance twice for the same course on the same day
2. **Real-time Updates**: All changes are immediately reflected in the UI
3. **Date-based Filtering**: Lecturers can filter attendance by custom date ranges
4. **Search Functionality**: Quick search through student names and IDs
5. **PDF Export**: Professional PDF reports with tables and statistics
6. **Visual Analytics**: Bar charts showing attendance trends

## 🛠️ Customization

### Adding New Mock Data

Edit `/src/app/services/mockData.ts` and add to the appropriate arrays:
- `users` - Add students or lecturers
- `courses` - Add new courses
- `enrollments` - Link students to courses
- `attendance` - Add historical attendance records

### Styling

All styles use Tailwind CSS classes. To customize:
- Edit color schemes in component files
- Modify `/src/styles/theme.css` for global theme tokens
- All components are fully responsive by default

## 📝 Notes

- This is a **frontend-only application** using localStorage for data persistence
- Data is **not shared between browsers** or devices
- Clearing browser data will **reset the application**
- Perfect for **demonstration** and **prototyping** purposes
- For production use, integrate with a real backend (Node.js + MongoDB/PostgreSQL)

## 🎓 Educational Use

This project demonstrates:
- React Context API for state management
- React Router for SPA navigation
- Protected routes implementation
- Role-based access control
- PDF generation in the browser
- Data visualization with charts
- Form handling and validation
- LocalStorage as a data layer
- Modern UI/UX patterns

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Support

For issues or questions, please review the code structure and demo credentials above.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

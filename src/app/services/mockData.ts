// Initialize mock database in localStorage
export const initializeMockData = () => {
  if (!localStorage.getItem('initialized')) {
    // Users (students and lecturers)
    const users = [
      // Students
      {
        id: 's1',
        name: 'Arhinful Emmanuel Kwabena',
        email: 'student@ttu.edu.gh',
        password: 'student123',
        role: 'student',
        studentId: 'BC/GRD/22/118',
        course: 'Graphic Design',
        level: 'Level 400'
      },
      {
        id: 's2',
        name: 'Joel Teye Tetteh',
        email: 'student@ttu.edu.gh',
        password: 'student123',
        role: 'student',
        studentId: 'BC/GRD/22/101',
        course: 'Graphic Design',
        level: 'Level 400'
      },
      {
        id: 's3',
        name: 'Bernard Mensah Otupri',
        email: 'student@ttu.edu.gh',
        password: 'student123',
        role: 'student',
        studentId: 'BC/GRD/22/149',
        course: 'Graphic Design',
        level: 'Level 400'
      },
      {
        id: 's4',
        name: 'Emmanuel Lokko',
        email: 'student@ttu.edu.gh',
        password: 'student123',
        role: 'student',
        studentId: 'BC/GRD/22/102',
        course: 'Graphic Design',
        level: 'Level 400'
      },
      // Lecturers
      {
        id: 'l1',
        name: 'Mr. Patrick Edu Bempah',
        email: 'lecturer@ttu.edu.gh',
        password: 'lecturer123',
        role: 'lecturer'
      },
      {
        id: 'l2',
        name: 'Mr. Ernest Kudzordzi',
        email: 'lecturer@ttu.edu.gh',
        password: 'lecturer123',
        role: 'lecturer'
      },
      {
        id: 'l3',
        name: 'Mr. Nduro',
        email: 'lecturer@ttu.edu.gh',
        password: 'lecturer123',
        role: 'lecturer'
      },
      {
        id: 'l4',
        name: 'Prof. Betty Fanniyan',
        email: 'lecturer@ttu.edu.gh',
        password: 'lecturer123',
        role: 'lecturer'
      }
    ];

    // Courses
    const courses = [
      {
        id: 'c1',
        courseName: 'Production Management',
        courseCode: 'GRD301',
        lecturerId: 'l1'
      },
      {
        id: 'c2',
        courseName: 'Web Design',
        courseCode: 'GRD302',
        lecturerId: 'l2'
      },
      {
        id: 'c3',
        courseName: 'Seminar in Graphic',
        courseCode: 'GRD303',
        lecturerId: 'l3'
      },
      {
        id: 'c4',
        courseName: 'Research Methodology',
        courseCode: 'GRD304',
        lecturerId: 'l4'
      }
    ];

    // Enrollments (student-course relationships)
    const enrollments = [
      { studentId: 's1', courseId: 'c1' },
      { studentId: 's1', courseId: 'c2' },
      { studentId: 's1', courseId: 'c3' },
      { studentId: 's2', courseId: 'c1' },
      { studentId: 's2', courseId: 'c3' },
      { studentId: 's3', courseId: 'c2' },
      { studentId: 's3', courseId: 'c3' },
      { studentId: 's4', courseId: 'c1' },
      { studentId: 's4', courseId: 'c3' }
    ];

    // Attendance records (some sample data)
    const attendance = [
      {
        id: 'a1',
        studentId: 's1',
        courseId: 'c1',
        date: '2026-02-17',
        status: 'present',
        timestamp: '2026-02-17T09:00:00Z'
      },
      {
        id: 'a2',
        studentId: 's2',
        courseId: 'c1',
        date: '2026-02-17',
        status: 'present',
        timestamp: '2026-02-17T09:05:00Z'
      },
      {
        id: 'a3',
        studentId: 's1',
        courseId: 'c2',
        date: '2026-02-18',
        status: 'present',
        timestamp: '2026-02-18T10:00:00Z'
      },
      {
        id: 'a4',
        studentId: 's1',
        courseId: 'c1',
        date: '2026-02-19',
        status: 'present',
        timestamp: '2026-02-19T09:00:00Z'
      },
      {
        id: 'a5',
        studentId: 's2',
        courseId: 'c2',
        date: '2026-02-18',
        status: 'present',
        timestamp: '2026-02-18T10:02:00Z'
      }
    ];

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('courses', JSON.stringify(courses));
    localStorage.setItem('enrollments', JSON.stringify(enrollments));
    localStorage.setItem('attendance', JSON.stringify(attendance));
    localStorage.setItem('initialized', 'true');
  }
};

// Get all courses for a student
export const getStudentCourses = (studentId: string) => {
  const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');

  const studentEnrollments = enrollments.filter((e: any) => e.studentId === studentId);
  return studentEnrollments.map((e: any) =>
    courses.find((c: any) => c.id === e.courseId)
  ).filter(Boolean);
};

// Get all courses for a lecturer
export const getLecturerCourses = (lecturerId: string) => {
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  return courses.filter((c: any) => c.lecturerId === lecturerId);
};

// Generate a unique 5-character attendance code for a course
export const generateAttendanceCode = (courseId: string, lecturerId: string) => {
  const codes = JSON.parse(localStorage.getItem('attendanceCodes') || '[]');

  // Deactivate any existing active code for this course
  codes.forEach((c: any) => {
    if (c.courseId === courseId && c.active) {
      c.active = false;
    }
  });

  // Generate random 5-char alphanumeric code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0/O, 1/I)
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const newCode = {
    id: `code${Date.now()}`,
    courseId,
    lecturerId,
    code,
    active: true,
    createdAt: new Date().toISOString()
  };

  codes.push(newCode);
  localStorage.setItem('attendanceCodes', JSON.stringify(codes));

  return newCode;
};

// Get the currently active attendance code for a course
export const getActiveCode = (courseId: string) => {
  const codes = JSON.parse(localStorage.getItem('attendanceCodes') || '[]');
  return codes.find((c: any) => c.courseId === courseId && c.active) || null;
};

// Deactivate the active code for a course
export const deactivateCode = (courseId: string) => {
  const codes = JSON.parse(localStorage.getItem('attendanceCodes') || '[]');
  codes.forEach((c: any) => {
    if (c.courseId === courseId && c.active) {
      c.active = false;
    }
  });
  localStorage.setItem('attendanceCodes', JSON.stringify(codes));
  return { success: true };
};

// Mark attendance (requires a valid attendance code)
export const markAttendance = (studentId: string, courseId: string, code: string) => {
  // Validate attendance code
  const activeCode = getActiveCode(courseId);
  if (!activeCode) {
    return { success: false, error: 'No active attendance session for this course' };
  }
  if (activeCode.code !== code.toUpperCase()) {
    return { success: false, error: 'Invalid attendance code' };
  }

  const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
  const today = new Date().toISOString().split('T')[0];

  // Check if already marked today
  const alreadyMarked = attendance.some(
    (a: any) => a.studentId === studentId && a.courseId === courseId && a.date === today
  );

  if (alreadyMarked) {
    return { success: false, error: 'Attendance already marked for today' };
  }

  const newAttendance = {
    id: `a${Date.now()}`,
    studentId,
    courseId,
    date: today,
    status: 'present',
    timestamp: new Date().toISOString()
  };

  attendance.push(newAttendance);
  localStorage.setItem('attendance', JSON.stringify(attendance));

  return { success: true };
};

// Get student attendance history
export const getStudentAttendance = (studentId: string) => {
  const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');

  return attendance
    .filter((a: any) => a.studentId === studentId)
    .map((a: any) => ({
      ...a,
      course: courses.find((c: any) => c.id === a.courseId)
    }))
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Get attendance for a course
export const getCourseAttendance = (courseId: string, startDate?: string, endDate?: string) => {
  const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  let filtered = attendance.filter((a: any) => a.courseId === courseId);

  if (startDate) {
    filtered = filtered.filter((a: any) => a.date >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter((a: any) => a.date <= endDate);
  }

  return filtered.map((a: any) => ({
    ...a,
    student: users.find((u: any) => u.id === a.studentId)
  }));
};

// Get enrolled students for a course
export const getCourseStudents = (courseId: string) => {
  const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  const courseEnrollments = enrollments.filter((e: any) => e.courseId === courseId);
  return courseEnrollments.map((e: any) =>
    users.find((u: any) => u.id === e.studentId)
  ).filter(Boolean);
};

// Enroll a student into a course by student ID
export const enrollStudent = (studentIdInput: string, courseId: string) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');

  // Find user by studentId field
  const student = users.find((u: any) => u.studentId === studentIdInput && u.role === 'student');
  if (!student) {
    return { success: false, error: 'Student not found. Check the Student ID.' };
  }

  // Check if already enrolled
  const alreadyEnrolled = enrollments.some(
    (e: any) => e.studentId === student.id && e.courseId === courseId
  );
  if (alreadyEnrolled) {
    return { success: false, error: 'Student is already enrolled in this class' };
  }

  enrollments.push({ studentId: student.id, courseId });
  localStorage.setItem('enrollments', JSON.stringify(enrollments));

  return { success: true, student };
};

// Create a new course
export const createCourse = (courseName: string, courseCode: string, lecturerId: string) => {
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');

  const newCourse = {
    id: `c${Date.now()}`,
    courseName,
    courseCode,
    lecturerId
  };

  courses.push(newCourse);
  localStorage.setItem('courses', JSON.stringify(courses));

  // Auto-enroll all students in the new course
  const students = users.filter((u: any) => u.role === 'student');
  students.forEach((student: any) => {
    enrollments.push({ studentId: student.id, courseId: newCourse.id });
  });
  localStorage.setItem('enrollments', JSON.stringify(enrollments));

  return { success: true, course: newCourse };
};

// Get attendance statistics
export const getAttendanceStats = (courseId: string) => {
  const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
  const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');

  const courseAttendance = attendance.filter((a: any) => a.courseId === courseId);
  const enrolledCount = enrollments.filter((e: any) => e.courseId === courseId).length;

  // Get unique dates
  const dates = [...new Set(courseAttendance.map((a: any) => a.date))];
  const totalSessions = dates.length;

  return {
    totalSessions,
    totalAttendances: courseAttendance.length,
    enrolledStudents: enrolledCount,
    averageAttendance: totalSessions > 0 ? (courseAttendance.length / (totalSessions * enrolledCount)) * 100 : 0
  };
};

// Register a new user (student or lecturer)
export const registerUser = (
  name: string,
  email: string,
  password: string,
  role: 'student' | 'lecturer',
  studentId?: string,
  course?: string,
  level?: string
) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  // Check if email + role combo already exists
  const existing = users.find((u: any) => u.email === email && u.role === role);
  if (existing) {
    return { success: false, error: 'An account with this email already exists' };
  }

  // For students, check if student ID is already taken
  if (role === 'student') {
    if (!studentId || !course || !level) {
      return { success: false, error: 'Student ID, Course, and Level are required for students' };
    }
    const existingStudentId = users.find((u: any) => u.studentId === studentId);
    if (existingStudentId) {
      return { success: false, error: 'This Student ID is already registered' };
    }
  }

  const newUser: any = {
    id: `${role === 'student' ? 's' : 'l'}${Date.now()}`,
    name,
    email,
    password,
    role,
  };

  if (role === 'student') {
    newUser.studentId = studentId;
    newUser.course = course;
    newUser.level = level;
  }

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  // Auto-enroll new students into all existing courses
  if (role === 'student') {
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    courses.forEach((c: any) => {
      enrollments.push({ studentId: newUser.id, courseId: c.id });
    });
    localStorage.setItem('enrollments', JSON.stringify(enrollments));
  }

  const { password: _, ...userWithoutPassword } = newUser;
  return { success: true, user: userWithoutPassword };
};

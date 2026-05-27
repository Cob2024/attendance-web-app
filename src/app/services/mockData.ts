// ============================================================
// Mock Data Service — University Model
// Courses belong to a programme + level + semester.
// Admin creates courses and assigns lecturers.
// Students are auto-enrolled by programme + level matching.
// ============================================================

export interface CourseData {
  id: string;
  courseName: string;
  courseCode: string;
  programme: string;
  level: string;
  semester: string;
  lecturerId: string;
}

// Available programmes and levels
export const PROGRAMMES = [
  'Graphic Design',
  'Fashion Design',
  'Painting & Sculpture',
  'Textile Design',
  'Industrial Art',
];

export const LEVELS = ['Level 100', 'Level 200', 'Level 300', 'Level 400'];

export const CURRENT_SEMESTER = 'Semester 1, 2025/2026';

// ============================================================
// Initialize mock database
// ============================================================
export const initializeMockData = () => {
  // Patch existing stored data to match updated mock user details
  try {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const patchMap: Record<string, { name?: string; email?: string; role?: string }> = {
      'l1': { name: 'Mr. Ernest Kudordjie', email: 'ernest.kudordjie@ttu.edu.gh' },
      's1': { email: 'arhinful.emmanuel@ttu.edu.gh' },
      's2': { email: 'joel.tetteh@ttu.edu.gh' },
      's3': { email: 'bernard.otupri@ttu.edu.gh' },
      's4': { email: 'emmanuel.lokko@ttu.edu.gh' },
      'l2': { email: 'ernest.kudzordzi@ttu.edu.gh' },
      'l3': { email: 'nduro@ttu.edu.gh' },
      'l4': { email: 'betty.fanniyan@ttu.edu.gh' },
    };
    let updated = false;
    storedUsers.forEach((u: any) => {
      const patch = patchMap[u.id];
      if (patch) {
        if (patch.name && u.name !== patch.name) { u.name = patch.name; updated = true; }
        if (patch.email && u.email !== patch.email) { u.email = patch.email; updated = true; }
      }
    });
    if (updated) {
      localStorage.setItem('users', JSON.stringify(storedUsers));
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (currentUser && patchMap[currentUser.id]) {
        const patch = patchMap[currentUser.id];
        if (patch.name) currentUser.name = patch.name;
        if (patch.email) currentUser.email = patch.email;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    }
  } catch (e) {
    console.error("Failed to patch mock data", e);
  }

  // Patch existing courses to add programme/level/semester if missing
  try {
    const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const coursePatch: Record<string, { programme?: string; level?: string; semester?: string }> = {
      'c1': { programme: 'Graphic Design', level: 'Level 400', semester: CURRENT_SEMESTER },
      'c2': { programme: 'Graphic Design', level: 'Level 400', semester: CURRENT_SEMESTER },
      'c3': { programme: 'Graphic Design', level: 'Level 400', semester: CURRENT_SEMESTER },
      'c4': { programme: 'Graphic Design', level: 'Level 400', semester: CURRENT_SEMESTER },
    };
    let coursesUpdated = false;
    storedCourses.forEach((c: any) => {
      const patch = coursePatch[c.id];
      if (patch) {
        if (!c.programme) { c.programme = patch.programme; coursesUpdated = true; }
        if (!c.level) { c.level = patch.level; coursesUpdated = true; }
        if (!c.semester) { c.semester = patch.semester; coursesUpdated = true; }
      }
    });
    if (coursesUpdated) {
      localStorage.setItem('courses', JSON.stringify(storedCourses));
    }
  } catch (e) {
    console.error("Failed to patch course data", e);
  }

  if (!localStorage.getItem('initialized_v2')) {
    // Clear old data format
    localStorage.removeItem('initialized');
    localStorage.removeItem('enrollments');

    // Users (admin, students, lecturers)
    const users = [
      // Admin
      {
        id: 'a1',
        name: 'System Administrator',
        email: 'admin@ttu.edu.gh',
        password: 'admin123',
        role: 'admin'
      },
      // Students — Graphic Design Level 400
      {
        id: 's1',
        name: 'Arhinful Emmanuel Kwabena',
        email: 'arhinful.emmanuel@ttu.edu.gh',
        password: 'student123',
        role: 'student',
        studentId: 'BC/GRD/22/118',
        programme: 'Graphic Design',
        level: 'Level 400'
      },
      {
        id: 's2',
        name: 'Joel Teye Tetteh',
        email: 'joel.tetteh@ttu.edu.gh',
        password: 'student123',
        role: 'student',
        studentId: 'BC/GRD/22/101',
        programme: 'Graphic Design',
        level: 'Level 400'
      },
      {
        id: 's3',
        name: 'Bernard Mensah Otupri',
        email: 'bernard.otupri@ttu.edu.gh',
        password: 'student123',
        role: 'student',
        studentId: 'BC/GRD/22/149',
        programme: 'Graphic Design',
        level: 'Level 400'
      },
      {
        id: 's4',
        name: 'Emmanuel Lokko',
        email: 'emmanuel.lokko@ttu.edu.gh',
        password: 'student123',
        role: 'student',
        studentId: 'BC/GRD/22/102',
        programme: 'Graphic Design',
        level: 'Level 400'
      },
      // A student from a different programme — to test separation
      {
        id: 's5',
        name: 'Abigail Mensah',
        email: 'abigail.mensah@ttu.edu.gh',
        password: 'student123',
        role: 'student',
        studentId: 'BC/FSD/22/045',
        programme: 'Fashion Design',
        level: 'Level 400'
      },
      // Lecturers
      {
        id: 'l1',
        name: 'Mr. Ernest Kudordjie',
        email: 'ernest.kudordjie@ttu.edu.gh',
        password: 'lecturer123',
        role: 'lecturer'
      },
      {
        id: 'l2',
        name: 'Mr. Ernest Kudzordzi',
        email: 'ernest.kudzordzi@ttu.edu.gh',
        password: 'lecturer123',
        role: 'lecturer'
      },
      {
        id: 'l3',
        name: 'Mr. Nduro',
        email: 'nduro@ttu.edu.gh',
        password: 'lecturer123',
        role: 'lecturer'
      },
      {
        id: 'l4',
        name: 'Prof. Betty Fanniyan',
        email: 'betty.fanniyan@ttu.edu.gh',
        password: 'lecturer123',
        role: 'lecturer'
      }
    ];

    // Courses — now linked to programme + level + semester
    // Assigned to lecturers BY ADMIN (not by lecturers themselves)
    const courses: CourseData[] = [
      {
        id: 'c1',
        courseName: 'Production Management',
        courseCode: 'GRD301',
        programme: 'Graphic Design',
        level: 'Level 400',
        semester: CURRENT_SEMESTER,
        lecturerId: 'l1'
      },
      {
        id: 'c2',
        courseName: 'Web Design',
        courseCode: 'GRD302',
        programme: 'Graphic Design',
        level: 'Level 400',
        semester: CURRENT_SEMESTER,
        lecturerId: 'l2'
      },
      {
        id: 'c3',
        courseName: 'Seminar in Graphic',
        courseCode: 'GRD303',
        programme: 'Graphic Design',
        level: 'Level 400',
        semester: CURRENT_SEMESTER,
        lecturerId: 'l3'
      },
      {
        id: 'c4',
        courseName: 'Research Methodology',
        courseCode: 'GRD304',
        programme: 'Graphic Design',
        level: 'Level 400',
        semester: CURRENT_SEMESTER,
        lecturerId: 'l4'
      },
      // Fashion Design course — only Fashion Design students see this
      {
        id: 'c5',
        courseName: 'Fashion Illustration',
        courseCode: 'FSD401',
        programme: 'Fashion Design',
        level: 'Level 400',
        semester: CURRENT_SEMESTER,
        lecturerId: 'l1' // A lecturer can teach across programmes
      }
    ];

    // Attendance records (sample data)
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
    localStorage.setItem('attendance', JSON.stringify(attendance));
    localStorage.setItem('initialized_v2', 'true');
  }
};

// ============================================================
// Student Functions
// ============================================================

// Get courses for a student — auto-matched by programme + level
export const getStudentCourses = (studentId: string) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  const student = users.find((u: any) => u.id === studentId);

  if (!student) return [];

  // Return courses matching the student's programme and level
  return courses.filter(
    (c: any) => c.programme === student.programme && c.level === student.level
  );
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

// ============================================================
// Lecturer Functions
// ============================================================

// Get all courses assigned to a lecturer
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
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
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

// Get students enrolled in a course — by programme + level matching
export const getCourseStudents = (courseId: string) => {
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  const course = courses.find((c: any) => c.id === courseId);
  if (!course) return [];

  // Find all students whose programme + level match this course
  return users.filter(
    (u: any) =>
      u.role === 'student' &&
      u.programme === course.programme &&
      u.level === course.level
  );
};

// Get attendance statistics
export const getAttendanceStats = (courseId: string) => {
  const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
  const courseStudents = getCourseStudents(courseId);

  const courseAttendance = attendance.filter((a: any) => a.courseId === courseId);
  const enrolledCount = courseStudents.length;

  // Get unique dates
  const dates = [...new Set(courseAttendance.map((a: any) => a.date))];
  const totalSessions = dates.length;

  return {
    totalSessions,
    totalAttendances: courseAttendance.length,
    enrolledStudents: enrolledCount,
    averageAttendance: totalSessions > 0 && enrolledCount > 0
      ? (courseAttendance.length / (totalSessions * enrolledCount)) * 100
      : 0
  };
};

// ============================================================
// Admin Functions
// ============================================================

// Get all courses
export const getAllCourses = () => {
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  return courses.map((c: any) => ({
    ...c,
    lecturer: users.find((u: any) => u.id === c.lecturerId)
  }));
};

// Get all lecturers
export const getAllLecturers = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  return users.filter((u: any) => u.role === 'lecturer');
};

// Get all students
export const getAllStudents = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  return users.filter((u: any) => u.role === 'student');
};

// Create a new course (admin only)
export const createCourse = (
  courseName: string,
  courseCode: string,
  programme: string,
  level: string,
  semester: string,
  lecturerId: string
) => {
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');

  // Check for duplicate course code
  const existing = courses.find((c: any) => c.courseCode === courseCode);
  if (existing) {
    return { success: false, error: 'A course with this code already exists' };
  }

  const newCourse: CourseData = {
    id: `c${Date.now()}`,
    courseName,
    courseCode,
    programme,
    level,
    semester,
    lecturerId
  };

  courses.push(newCourse);
  localStorage.setItem('courses', JSON.stringify(courses));

  return { success: true, course: newCourse };
};

// Update a course (admin only) — e.g., reassign lecturer
export const updateCourse = (
  courseId: string,
  updates: Partial<Omit<CourseData, 'id'>>
) => {
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  const courseIndex = courses.findIndex((c: any) => c.id === courseId);

  if (courseIndex === -1) {
    return { success: false, error: 'Course not found' };
  }

  // If changing course code, check for duplicates
  if (updates.courseCode && updates.courseCode !== courses[courseIndex].courseCode) {
    const dup = courses.find((c: any) => c.courseCode === updates.courseCode && c.id !== courseId);
    if (dup) {
      return { success: false, error: 'A course with this code already exists' };
    }
  }

  Object.assign(courses[courseIndex], updates);
  localStorage.setItem('courses', JSON.stringify(courses));

  return { success: true, course: courses[courseIndex] };
};

// Delete a course (admin only)
export const deleteCourse = (courseId: string) => {
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
  const attendanceCodes = JSON.parse(localStorage.getItem('attendanceCodes') || '[]');

  const updatedCourses = courses.filter((c: any) => c.id !== courseId);
  const updatedAttendance = attendance.filter((a: any) => a.courseId !== courseId);
  const updatedCodes = attendanceCodes.filter((c: any) => c.courseId !== courseId);

  localStorage.setItem('courses', JSON.stringify(updatedCourses));
  localStorage.setItem('attendance', JSON.stringify(updatedAttendance));
  localStorage.setItem('attendanceCodes', JSON.stringify(updatedCodes));

  return { success: true };
};

// ============================================================
// Auth Functions
// ============================================================

// Register a new user (student or lecturer)
export const registerUser = (
  name: string,
  email: string,
  password: string,
  role: 'student' | 'lecturer',
  studentId?: string,
  programme?: string,
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
    if (!studentId || !programme || !level) {
      return { success: false, error: 'Student ID, Programme, and Level are required for students' };
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
    newUser.programme = programme;
    newUser.level = level;
  }

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  const { password: _, ...userWithoutPassword } = newUser;
  return { success: true, user: userWithoutPassword };
};

// Update an existing user's profile
export const updateUserProfile = (
  userId: string,
  updates: {
    name?: string;
    email?: string;
    studentId?: string;
    programme?: string;
    level?: string;
    profilePicture?: string;
  }
) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex((u: any) => u.id === userId);

  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }

  const currentUser = users[userIndex];

  if (updates.name !== undefined && !updates.name.trim()) {
    return { success: false, error: 'Name cannot be empty' };
  }

  if (updates.email !== undefined && !updates.email.trim()) {
    return { success: false, error: 'Email cannot be empty' };
  }

  if (updates.email && updates.email !== currentUser.email) {
    const emailConflict = users.find(
      (u: any) => u.id !== userId && u.email === updates.email && u.role === currentUser.role
    );
    if (emailConflict) {
      return { success: false, error: 'An account with this email already exists' };
    }
  }

  if (currentUser.role === 'student' && updates.studentId && updates.studentId !== currentUser.studentId) {
    const idConflict = users.find(
      (u: any) => u.id !== userId && u.studentId === updates.studentId
    );
    if (idConflict) {
      return { success: false, error: 'This Student ID is already registered' };
    }
  }

  // Apply updates
  if (updates.name) users[userIndex].name = updates.name.trim();
  if (updates.email) users[userIndex].email = updates.email.trim();
  if (updates.studentId !== undefined) users[userIndex].studentId = updates.studentId.trim();
  if (updates.programme !== undefined) users[userIndex].programme = updates.programme.trim();
  if (updates.level !== undefined) users[userIndex].level = updates.level.trim();
  if (updates.profilePicture !== undefined) users[userIndex].profilePicture = updates.profilePicture;

  localStorage.setItem('users', JSON.stringify(users));

  const { password: _pw, ...updatedUserWithoutPassword } = users[userIndex];
  return { success: true, user: updatedUserWithoutPassword };
};

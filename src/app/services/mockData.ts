// ============================================================
// Mock Data Service — University Model
// Courses belong to a programme + level + semester.
// Admin creates courses and assigns lecturers.
// Students are auto-enrolled by programme + level matching.
//
// Attendance uses GPS geofencing (50m radius) + device
// fingerprinting to prevent proxy attendance.
// ============================================================

import { calculateDistance } from './geolocation';

const GEOFENCE_RADIUS_METERS = 50;

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
  if (!localStorage.getItem('initialized_clean_production_v1')) {
    // Clear old demo data
    localStorage.removeItem('initialized');
    localStorage.removeItem('initialized_v2');
    localStorage.removeItem('initialized_v3');
    localStorage.removeItem('activeSessions');
    localStorage.removeItem('attendanceRecords');

    // Only master Admin account is seeded; real faculty/students are registered or added via Admin
    const users = [
      {
        id: 'a1',
        name: 'System Administrator',
        email: 'admin@ttu.edu.gh',
        password: 'admin123',
        role: 'admin'
      }
    ];

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('courses', JSON.stringify([]));
    localStorage.setItem('attendance', JSON.stringify([]));
    localStorage.setItem('enrollments', JSON.stringify([]));
    localStorage.setItem('deviceBindings', JSON.stringify({}));
    localStorage.setItem('initialized_clean_production_v1', 'true');
  }
};

// ============================================================
// Student Functions
// ============================================================

// Get courses for a student — uses enrollment table, falls back to programme+level
export const getStudentCourses = (studentId: string) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
  const student = users.find((u: any) => u.id === studentId);

  if (!student) return [];

  // Check for explicit enrollments first
  const studentEnrollments = enrollments.filter((e: any) => e.studentId === studentId);
  if (studentEnrollments.length > 0) {
    return courses.filter((c: any) =>
      studentEnrollments.some((e: any) => e.courseId === c.id)
    );
  }

  // Fallback: return courses matching the student's programme and level
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

// Mark attendance — validates GPS location + device fingerprint
export const markAttendance = (
  studentId: string,
  courseId: string,
  studentLat: number,
  studentLng: number,
  deviceFingerprint: string
) => {
  // Validate active session exists
  const session = getActiveCode(courseId);
  if (!session) {
    return { success: false, error: 'No active attendance session for this course' };
  }

  // Validate device fingerprint
  const deviceCheck = validateDevice(studentId, deviceFingerprint);
  if (!deviceCheck.valid) {
    return { success: false, error: deviceCheck.error || 'Device verification failed' };
  }

  // Validate GPS location (50m radius)
  if (session.lecturerLat != null && session.lecturerLng != null) {
    const distance = calculateDistance(
      studentLat,
      studentLng,
      session.lecturerLat,
      session.lecturerLng
    );
    if (distance > GEOFENCE_RADIUS_METERS) {
      return {
        success: false,
        error: `You are too far from the class location (${Math.round(distance)}m away, max ${GEOFENCE_RADIUS_METERS}m)`,
      };
    }
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

  return { success: true, distance: Math.round(distance) };
};

// ============================================================
// Lecturer Functions
// ============================================================

// Get all courses assigned to a lecturer
export const getLecturerCourses = (lecturerId: string) => {
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  return courses.filter((c: any) => c.lecturerId === lecturerId);
};

// Start an attendance session — stores lecturer GPS for geofencing (with auto-close)
export const startAttendanceSession = (
  courseId: string,
  lecturerId: string,
  lecturerLat: number,
  lecturerLng: number,
  durationMinutes: number = 30
) => {
  const codes = JSON.parse(localStorage.getItem('attendanceCodes') || '[]');

  // Deactivate any existing active session for this course
  codes.forEach((c: any) => {
    if (c.courseId === courseId && c.active) {
      c.active = false;
    }
  });

  // Generate random 5-char alphanumeric code (internal session ID)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Compute expiry time (0 = no auto-close)
  const expiresAt = durationMinutes > 0
    ? new Date(Date.now() + durationMinutes * 60 * 1000).toISOString()
    : null;

  const newSession = {
    id: `code${Date.now()}`,
    courseId,
    lecturerId,
    code,
    active: true,
    createdAt: new Date().toISOString(),
    lecturerLat,
    lecturerLng,
    radiusMeters: GEOFENCE_RADIUS_METERS,
    durationMinutes,
    expiresAt,
  };

  codes.push(newSession);
  localStorage.setItem('attendanceCodes', JSON.stringify(codes));

  return newSession;
};

// Get the currently active attendance code for a course (auto-closes expired)
export const getActiveCode = (courseId: string) => {
  const codes = JSON.parse(localStorage.getItem('attendanceCodes') || '[]');
  const now = new Date();

  // Auto-close expired sessions
  let changed = false;
  codes.forEach((c: any) => {
    if (c.active && c.expiresAt && new Date(c.expiresAt) <= now) {
      c.active = false;
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem('attendanceCodes', JSON.stringify(codes));
  }

  return codes.find((c: any) => c.courseId === courseId && c.active) || null;
};

// Deactivate the active session for a course and mark unchecked students absent
export const deactivateCode = (courseId: string) => {
  const codes = JSON.parse(localStorage.getItem('attendanceCodes') || '[]');
  codes.forEach((c: any) => {
    if (c.courseId === courseId && c.active) {
      c.active = false;
    }
  });
  localStorage.setItem('attendanceCodes', JSON.stringify(codes));

  // Auto-mark enrolled students who didn't check in as absent
  const today = new Date().toISOString().split('T')[0];
  const enrolledStudents = getCourseStudents(courseId);
  const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');

  enrolledStudents.forEach((student: any) => {
    const alreadyRecorded = attendance.some(
      (a: any) => a.studentId === student.id && a.courseId === courseId && a.date === today
    );
    if (!alreadyRecorded) {
      attendance.push({
        id: `a_absent_${student.id}_${Date.now()}`,
        studentId: student.id,
        courseId,
        date: today,
        status: 'absent',
        timestamp: new Date().toISOString(),
      });
    }
  });
  localStorage.setItem('attendance', JSON.stringify(attendance));

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

// Get students enrolled in a course — via enrollment table, fallback to programme+level
export const getCourseStudents = (courseId: string) => {
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');

  const course = courses.find((c: any) => c.id === courseId);
  if (!course) return [];

  // Check for explicit enrollments first
  const courseEnrollments = enrollments.filter((e: any) => e.courseId === courseId);
  if (courseEnrollments.length > 0) {
    return users.filter((u: any) =>
      u.role === 'student' &&
      courseEnrollments.some((e: any) => e.studentId === u.id)
    );
  }

  // Fallback: find all students whose programme + level match this course
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

  const courseAttendance = attendance.filter((a: any) => a.courseId === courseId && a.status === 'present');
  const enrolledCount = courseStudents.length;

  // Get unique dates
  const dates = [...new Set(attendance.filter((a: any) => a.courseId === courseId).map((a: any) => a.date))];
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
// Device Fingerprint Binding Functions
// ============================================================

// Register a device fingerprint for a user (called on first login)
export const registerDevice = (userId: string, fingerprint: string) => {
  const bindings = JSON.parse(localStorage.getItem('deviceBindings') || '{}');
  bindings[userId] = {
    fingerprint,
    registeredAt: new Date().toISOString(),
  };
  localStorage.setItem('deviceBindings', JSON.stringify(bindings));
};

// Get the registered device for a user
export const getRegisteredDevice = (userId: string) => {
  const bindings = JSON.parse(localStorage.getItem('deviceBindings') || '{}');
  return bindings[userId] || null;
};

// Validate that the current device matches the registered device
export const validateDevice = (userId: string, currentFingerprint: string): { valid: boolean; error?: string } => {
  const bindings = JSON.parse(localStorage.getItem('deviceBindings') || '{}');
  const binding = bindings[userId];

  // No device registered yet — auto-register current device
  if (!binding || !binding.fingerprint) {
    registerDevice(userId, currentFingerprint);
    return { valid: true };
  }

  // Check if fingerprint matches
  if (binding.fingerprint !== currentFingerprint) {
    return {
      valid: false,
      error: 'This student account is currently linked to a different browser/device. Log in as Admin to click "Reset Device", or use the original device.',
    };
  }

  return { valid: true };
};

// Reset device binding for a user (admin function)
export const resetDeviceBinding = (userId: string) => {
  const bindings = JSON.parse(localStorage.getItem('deviceBindings') || '{}');
  delete bindings[userId];
  localStorage.setItem('deviceBindings', JSON.stringify(bindings));
  return { success: true };
};

// Get active sessions for a student's enrolled courses
export const getActiveSessionsForStudent = (studentId: string) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const codes = JSON.parse(localStorage.getItem('attendanceCodes') || '[]');

  // Get courses via enrollment-aware function
  const studentCourses = getStudentCourses(studentId);

  // Auto-close expired sessions
  const now = new Date();
  let changed = false;
  codes.forEach((c: any) => {
    if (c.active && c.expiresAt && new Date(c.expiresAt) <= now) {
      c.active = false;
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem('attendanceCodes', JSON.stringify(codes));
  }

  // Find active sessions for those courses
  const activeSessions = codes.filter(
    (c: any) => c.active && studentCourses.some((sc: any) => sc.id === c.courseId)
  );

  // Enrich with course data and lecturer info
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  return activeSessions.map((session: any) => {
    const course = courses.find((c: any) => c.id === session.courseId);
    const lecturer = users.find((u: any) => u.id === session.lecturerId);
    return {
      ...session,
      course,
      lecturer,
    };
  });
};

// ============================================================
// Enrollment Management Functions
// ============================================================

// Enroll a student in a course
export const enrollStudent = (studentId: string, courseId: string) => {
  const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');

  // Check for duplicate
  const existing = enrollments.find(
    (e: any) => e.studentId === studentId && e.courseId === courseId
  );
  if (existing) {
    return { success: false, error: 'Student is already enrolled in this course' };
  }

  const newEnrollment = {
    id: `enr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    studentId,
    courseId,
    enrolledAt: new Date().toISOString(),
  };

  enrollments.push(newEnrollment);
  localStorage.setItem('enrollments', JSON.stringify(enrollments));

  return { success: true, enrollment: newEnrollment };
};

// Unenroll a student from a course
export const unenrollStudent = (studentId: string, courseId: string) => {
  const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
  const updated = enrollments.filter(
    (e: any) => !(e.studentId === studentId && e.courseId === courseId)
  );

  if (updated.length === enrollments.length) {
    return { success: false, error: 'Enrollment not found' };
  }

  localStorage.setItem('enrollments', JSON.stringify(updated));
  return { success: true };
};

// Get all enrollments for a course
export const getEnrolledStudents = (courseId: string) => {
  const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  return enrollments
    .filter((e: any) => e.courseId === courseId)
    .map((e: any) => {
      const student = users.find((u: any) => u.id === e.studentId);
      return { ...e, student };
    })
    .filter((e: any) => e.student);
};

// Auto-enroll students matching programme + level
export const autoEnrollStudents = (courseId: string) => {
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');

  const course = courses.find((c: any) => c.id === courseId);
  if (!course) return { success: false, error: 'Course not found', enrolled: 0 };

  const matchingStudents = users.filter(
    (u: any) => u.role === 'student' && u.programme === course.programme && u.level === course.level
  );

  let enrolled = 0;
  matchingStudents.forEach((student: any) => {
    const exists = enrollments.some(
      (e: any) => e.studentId === student.id && e.courseId === courseId
    );
    if (!exists) {
      enrollments.push({
        id: `enr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        studentId: student.id,
        courseId,
        enrolledAt: new Date().toISOString(),
      });
      enrolled++;
    }
  });

  localStorage.setItem('enrollments', JSON.stringify(enrollments));
  return {
    success: true,
    enrolled,
    total: matchingStudents.length,
    message: `Enrolled ${enrolled} students from ${course.programme} ${course.level}`,
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

// ============================================================
// Password Management
// ============================================================

// Change a user's password
export const changePassword = (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex((u: any) => u.id === userId);

  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }

  if (users[userIndex].password !== currentPassword) {
    return { success: false, error: 'Current password is incorrect' };
  }

  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters' };
  }

  users[userIndex].password = newPassword;
  localStorage.setItem('users', JSON.stringify(users));

  return { success: true };
};

// ============================================================
// Admin User Management
// ============================================================

// Delete a user (admin only)
export const deleteUser = (userId: string) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
  const bindings = JSON.parse(localStorage.getItem('deviceBindings') || '{}');

  const user = users.find((u: any) => u.id === userId);
  if (!user) return { success: false, error: 'User not found' };
  if (user.role === 'admin') return { success: false, error: 'Cannot delete admin accounts' };

  // Remove user
  const updatedUsers = users.filter((u: any) => u.id !== userId);
  localStorage.setItem('users', JSON.stringify(updatedUsers));

  // Remove their attendance records
  const updatedAttendance = attendance.filter((a: any) => a.studentId !== userId);
  localStorage.setItem('attendance', JSON.stringify(updatedAttendance));

  // Remove device binding
  delete bindings[userId];
  localStorage.setItem('deviceBindings', JSON.stringify(bindings));

  // If the user is a lecturer, unassign their courses
  if (user.role === 'lecturer') {
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    courses.forEach((c: any) => {
      if (c.lecturerId === userId) {
        c.lecturerId = '';
      }
    });
    localStorage.setItem('courses', JSON.stringify(courses));
  }

  return { success: true };
};

// Admin update user (can change name, email, student details)
export const adminUpdateUser = (
  userId: string,
  updates: {
    name?: string;
    email?: string;
    studentId?: string;
    programme?: string;
    level?: string;
    password?: string;
  }
) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex((u: any) => u.id === userId);

  if (userIndex === -1) return { success: false, error: 'User not found' };

  const currentUser = users[userIndex];

  // Email uniqueness check
  if (updates.email && updates.email !== currentUser.email) {
    const emailConflict = users.find(
      (u: any) => u.id !== userId && u.email === updates.email && u.role === currentUser.role
    );
    if (emailConflict) return { success: false, error: 'An account with this email already exists' };
  }

  // Student ID uniqueness check
  if (updates.studentId && updates.studentId !== currentUser.studentId) {
    const idConflict = users.find(
      (u: any) => u.id !== userId && u.studentId === updates.studentId
    );
    if (idConflict) return { success: false, error: 'This Student ID is already registered' };
  }

  if (updates.name) users[userIndex].name = updates.name.trim();
  if (updates.email) users[userIndex].email = updates.email.trim();
  if (updates.studentId !== undefined) users[userIndex].studentId = updates.studentId.trim();
  if (updates.programme !== undefined) users[userIndex].programme = updates.programme.trim();
  if (updates.level !== undefined) users[userIndex].level = updates.level.trim();
  if (updates.password) users[userIndex].password = updates.password;

  localStorage.setItem('users', JSON.stringify(users));

  const { password: _pw, ...userWithout } = users[userIndex];
  return { success: true, user: userWithout };
};

// ============================================================
// Lecturer Manual Attendance Functions
// ============================================================

// Manually mark attendance for a student (lecturer/admin function)
export const manualMarkAttendance = (
  studentId: string,
  courseId: string,
  date: string,
  status: 'present' | 'absent'
) => {
  const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');

  // Check if record already exists for this student/course/date
  const existingIndex = attendance.findIndex(
    (a: any) => a.studentId === studentId && a.courseId === courseId && a.date === date
  );

  if (existingIndex !== -1) {
    // Update existing record
    attendance[existingIndex].status = status;
    attendance[existingIndex].timestamp = new Date().toISOString();
    attendance[existingIndex].manual = true;
  } else {
    // Create new record
    attendance.push({
      id: `a${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      studentId,
      courseId,
      date,
      status,
      timestamp: new Date().toISOString(),
      manual: true,
    });
  }

  localStorage.setItem('attendance', JSON.stringify(attendance));
  return { success: true };
};

// Remove an attendance record
export const removeAttendance = (attendanceId: string) => {
  const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
  const updated = attendance.filter((a: any) => a.id !== attendanceId);
  localStorage.setItem('attendance', JSON.stringify(updated));
  return { success: true };
};

// ============================================================
// Session History
// ============================================================

// Get all past sessions for a lecturer's course
export const getSessionHistory = (courseId: string) => {
  const codes = JSON.parse(localStorage.getItem('attendanceCodes') || '[]');
  const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  return codes
    .filter((c: any) => c.courseId === courseId)
    .map((session: any) => {
      const sessionDate = session.createdAt?.split('T')[0] || '';
      const sessionAttendance = attendance.filter(
        (a: any) => a.courseId === courseId && a.date === sessionDate
      );
      const lecturer = users.find((u: any) => u.id === session.lecturerId);
      return {
        ...session,
        lecturer,
        attendanceCount: sessionAttendance.length,
        date: sessionDate,
      };
    })
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// ============================================================
// CSV Export
// ============================================================

// Generate CSV string for attendance records
export const exportAttendanceCSV = (courseId: string, startDate?: string, endDate?: string) => {
  const records = getCourseAttendance(courseId, startDate, endDate);
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  const course = courses.find((c: any) => c.id === courseId);

  if (!course || records.length === 0) return null;

  const headers = ['Date', 'Student Name', 'Student ID', 'Status', 'Time'];
  const rows = records.map((r: any) => [
    r.date,
    r.student?.name || 'N/A',
    r.student?.studentId || 'N/A',
    r.status === 'present' ? 'Present' : 'Absent',
    new Date(r.timestamp).toLocaleTimeString(),
  ]);

  const csvContent = [
    `Course: ${course.courseName} (${course.courseCode})`,
    `Programme: ${course.programme} | Level: ${course.level}`,
    `Generated: ${new Date().toLocaleString()}`,
    '',
    headers.join(','),
    ...rows.map((row: string[]) => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

// Generate system-wide CSV report for all courses (Admin)
export const exportAllAttendanceCSV = (programmeFilter?: string, levelFilter?: string) => {
  const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  if (attendance.length === 0) return null;

  const headers = ['Course Code', 'Course Name', 'Programme', 'Level', 'Date', 'Student Name', 'Student ID', 'Status', 'Time'];
  
  const filteredRecords = attendance.filter((record: any) => {
    const course = courses.find((c: any) => c.id === record.courseId);
    if (!course) return false;
    if (programmeFilter && programmeFilter !== 'All' && course.programme !== programmeFilter) return false;
    if (levelFilter && levelFilter !== 'All' && course.level !== levelFilter) return false;
    return true;
  });

  if (filteredRecords.length === 0) return null;

  const rows = filteredRecords.map((record: any) => {
    const course = courses.find((c: any) => c.id === record.courseId) || {};
    const student = users.find((u: any) => u.id === record.studentId) || {};
    return [
      course.courseCode || 'N/A',
      course.courseName || 'N/A',
      course.programme || 'N/A',
      course.level || 'N/A',
      record.date || 'N/A',
      student.name || 'N/A',
      student.studentId || 'N/A',
      record.status === 'present' ? 'Present' : 'Absent',
      record.timestamp ? new Date(record.timestamp).toLocaleTimeString() : 'N/A',
    ];
  });

  const csvContent = [
    `SmartAttend System-Wide Attendance Report`,
    `Filter: Programme: ${programmeFilter || 'All'} | Level: ${levelFilter || 'All'}`,
    `Total Records: ${rows.length}`,
    `Generated: ${new Date().toLocaleString()}`,
    '',
    headers.join(','),
    ...rows.map((row: string[]) => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};


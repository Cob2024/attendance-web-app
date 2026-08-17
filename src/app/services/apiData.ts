// ============================================================
// Production API Data Service
// Connects frontend to the Express REST API server at /api
// ============================================================

import { apiFetch, setAuthToken, clearAuthToken } from './apiClient';

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
  studentId?: string;
  programme?: string;
  level?: string;
  profilePicture?: string;
}

// ------------------------------------------------------------
// Authentication API
// ------------------------------------------------------------

export const loginUserApi = async (
  email: string,
  password: string,
  role: string,
  deviceFingerprint?: string
) => {
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role, deviceFingerprint }),
    });

    if (data.success && data.token) {
      setAuthToken(data.token);
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const registerUserApi = async (
  name: string,
  email: string,
  password: string,
  role: string,
  studentId?: string,
  programme?: string,
  level?: string
) => {
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, studentId, programme, level }),
    });

    if (data.success && data.token) {
      setAuthToken(data.token);
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const getCurrentUserApi = async () => {
  try {
    const data = await apiFetch('/auth/me');
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const changePasswordApi = async (currentPassword: string, newPassword: string) => {
  try {
    return await apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// ------------------------------------------------------------
// Courses API
// ------------------------------------------------------------

export const getCoursesApi = async () => {
  try {
    const data = await apiFetch('/courses');
    return data.courses || [];
  } catch (err: any) {
    console.error('Failed to fetch courses:', err);
    return [];
  }
};

export const createCourseApi = async (
  courseName: string,
  courseCode: string,
  programme: string,
  level: string,
  lecturerId: string
) => {
  try {
    return await apiFetch('/courses', {
      method: 'POST',
      body: JSON.stringify({ courseName, courseCode, programme, level, lecturerId }),
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const updateCourseApi = async (id: string, updates: any) => {
  try {
    return await apiFetch(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const deleteCourseApi = async (id: string) => {
  try {
    return await apiFetch(`/courses/${id}`, {
      method: 'DELETE',
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// ------------------------------------------------------------
// Attendance API
// ------------------------------------------------------------

export const startSessionApi = async (
  courseId: string,
  latitude: number,
  longitude: number,
  radiusMeters: number = 50,
  durationMinutes: number = 30
) => {
  try {
    return await apiFetch('/attendance/session/start', {
      method: 'POST',
      body: JSON.stringify({ courseId, latitude, longitude, radiusMeters, durationMinutes }),
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const endSessionApi = async (courseId: string) => {
  try {
    return await apiFetch('/attendance/session/end', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const getActiveSessionApi = async (courseId: string) => {
  try {
    const data = await apiFetch(`/attendance/session/active/${courseId}`);
    return data.session || null;
  } catch (err: any) {
    return null;
  }
};

export const markAttendanceApi = async (
  courseId: string,
  latitude: number,
  longitude: number,
  otpCode?: string
) => {
  try {
    return await apiFetch('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ courseId, latitude, longitude, otpCode }),
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const manualMarkAttendanceApi = async (
  studentId: string,
  courseId: string,
  date: string,
  status: 'present' | 'absent'
) => {
  try {
    return await apiFetch('/attendance/manual', {
      method: 'POST',
      body: JSON.stringify({ studentId, courseId, date, status }),
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const getAttendanceRecordsApi = async (params: {
  courseId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    const query = new URLSearchParams(params as any).toString();
    const data = await apiFetch(`/attendance/records?${query}`);
    return data.records || [];
  } catch (err: any) {
    return [];
  }
};

// ------------------------------------------------------------
// Admin User Management API
// ------------------------------------------------------------

export const getAllUsersApi = async () => {
  try {
    const data = await apiFetch('/admin/users');
    return data.users || [];
  } catch (err: any) {
    return [];
  }
};

export const adminUpdateUserApi = async (id: string, updates: any) => {
  try {
    return await apiFetch(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const deleteUserApi = async (id: string) => {
  try {
    return await apiFetch(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const resetDeviceBindingApi = async (studentId: string) => {
  try {
    return await apiFetch('/admin/device/reset', {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// ------------------------------------------------------------
// Enrollment API
// ------------------------------------------------------------

export const enrollStudentApi = async (studentId: string, courseId: string) => {
  try {
    return await apiFetch('/enrollments/enroll', {
      method: 'POST',
      body: JSON.stringify({ studentId, courseId }),
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const enrollStudentsBulkApi = async (studentIds: string[], courseId: string) => {
  try {
    return await apiFetch('/enrollments/enroll', {
      method: 'POST',
      body: JSON.stringify({ studentIds, courseId }),
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const unenrollStudentApi = async (studentId: string, courseId: string) => {
  try {
    return await apiFetch('/enrollments/unenroll', {
      method: 'POST',
      body: JSON.stringify({ studentId, courseId }),
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const getCourseEnrollmentsApi = async (courseId: string) => {
  try {
    const data = await apiFetch(`/enrollments/course/${courseId}`);
    return data.students || [];
  } catch (err: any) {
    return [];
  }
};

export const getStudentEnrollmentsApi = async (studentId: string) => {
  try {
    const data = await apiFetch(`/enrollments/student/${studentId}`);
    return data.courses || [];
  } catch (err: any) {
    return [];
  }
};

export const autoEnrollApi = async (courseId: string) => {
  try {
    return await apiFetch(`/enrollments/auto-enroll/${courseId}`, {
      method: 'POST',
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

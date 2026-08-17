import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { EditProfileModal } from '../components/EditProfileModal';
import {
  getAllCourses,
  getAllLecturers,
  getAllStudents,
  createCourse,
  updateCourse,
  deleteCourse,
  getRegisteredDevice,
  resetDeviceBinding,
  deleteUser,
  adminUpdateUser,
  registerUser,
  PROGRAMMES,
  LEVELS,
  CURRENT_SEMESTER
} from '../services/mockData';
import {
  BookOpen,
  Users,
  GraduationCap,
  Plus,
  Trash2,
  Menu,
  Pencil,
  Search,
  ShieldCheck,
  BarChart3,
  Edit3,
  Save,
  X,
  Smartphone,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentView = location.pathname;

  const [courses, setCourses] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [deviceBindings, setDeviceBindings] = useState<any>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Course state
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newProgramme, setNewProgramme] = useState(PROGRAMMES[0]);
  const [newLevel, setNewLevel] = useState(LEVELS[3]);
  const [newLecturerId, setNewLecturerId] = useState('');

  // Edit Course state
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editLecturerId, setEditLecturerId] = useState('');

  const refreshData = () => {
    setCourses([...getAllCourses()]);
    setLecturers([...getAllLecturers()]);
    setStudents([...getAllStudents()]);
    setDeviceBindings(JSON.parse(localStorage.getItem('deviceBindings') || '{}'));
  };

  // Edit user state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserStudentId, setEditUserStudentId] = useState('');
  const [editUserProgramme, setEditUserProgramme] = useState('');
  const [editUserLevel, setEditUserLevel] = useState('');

  // Add lecturer state
  const [showAddLecturer, setShowAddLecturer] = useState(false);
  const [newLecturerName, setNewLecturerName] = useState('');
  const [newLecturerEmail, setNewLecturerEmail] = useState('');
  const [newLecturerPassword, setNewLecturerPassword] = useState('lecturer123');

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreateCourse = () => {
    if (!newCourseName.trim() || !newCourseCode.trim() || !newLecturerId) {
      toast.error('Please fill in all fields and select a lecturer');
      return;
    }

    const result = createCourse(
      newCourseName.trim(),
      newCourseCode.trim().toUpperCase(),
      newProgramme,
      newLevel,
      CURRENT_SEMESTER,
      newLecturerId
    );

    if (result.success) {
      toast.success('Course created and lecturer assigned!');
      setShowCreateCourse(false);
      setNewCourseName('');
      setNewCourseCode('');
      setNewLecturerId('');
      refreshData();
    } else {
      toast.error(result.error || 'Failed to create course');
    }
  };

  const handleDeleteCourse = (courseId: string, courseName: string) => {
    if (window.confirm(`Delete "${courseName}"? This will also remove all attendance records for this course.`)) {
      const result = deleteCourse(courseId);
      if (result.success) {
        toast.success('Course deleted');
        refreshData();
      } else {
        toast.error('Failed to delete course');
      }
    }
  };

  const handleReassignLecturer = (courseId: string) => {
    if (!editLecturerId) {
      toast.error('Please select a lecturer');
      return;
    }
    const result = updateCourse(courseId, { lecturerId: editLecturerId });
    if (result.success) {
      toast.success('Lecturer reassigned!');
      setEditingCourseId(null);
      setEditLecturerId('');
      refreshData();
    } else {
      toast.error(result.error || 'Failed to reassign');
    }
  };

  const handleResetDevice = (studentId: string, studentName: string) => {
    if (window.confirm(`Reset device binding for ${studentName}? This will allow the student to sign in and mark attendance on a new phone/device.`)) {
      const result = resetDeviceBinding(studentId);
      if (result.success) {
        toast.success(`Device binding reset for ${studentName}! They can now log in on a new device.`);
        refreshData();
      } else {
        toast.error('Failed to reset device binding');
      }
    }
  };

  const handleDeleteUser = (userId: string, userName: string, role: string) => {
    if (window.confirm(`Delete ${role} "${userName}"? This action cannot be undone and will remove all their associated data.`)) {
      const result = deleteUser(userId);
      if (result.success) {
        toast.success(`${role === 'student' ? 'Student' : 'Lecturer'} "${userName}" deleted successfully`);
        refreshData();
      } else {
        toast.error(result.error || 'Failed to delete user');
      }
    }
  };

  const startEditUser = (user: any) => {
    setEditingUserId(user.id);
    setEditUserName(user.name || '');
    setEditUserEmail(user.email || '');
    setEditUserStudentId(user.studentId || '');
    setEditUserProgramme(user.programme || '');
    setEditUserLevel(user.level || '');
  };

  const handleSaveUser = (userId: string) => {
    const updates: any = {
      name: editUserName,
      email: editUserEmail,
    };
    const user = [...students, ...lecturers].find((u: any) => u.id === userId);
    if (user?.role === 'student') {
      updates.studentId = editUserStudentId;
      updates.programme = editUserProgramme;
      updates.level = editUserLevel;
    }
    const result = adminUpdateUser(userId, updates);
    if (result.success) {
      toast.success('User updated successfully');
      setEditingUserId(null);
      refreshData();
    } else {
      toast.error(result.error || 'Failed to update user');
    }
  };

  const handleAddLecturer = () => {
    if (!newLecturerName.trim() || !newLecturerEmail.trim()) {
      toast.error('Please enter name and email');
      return;
    }
    const result = registerUser(
      newLecturerName.trim(),
      newLecturerEmail.trim(),
      newLecturerPassword,
      'lecturer'
    );
    if (result.success) {
      toast.success(`Lecturer "${newLecturerName}" added with password: ${newLecturerPassword}`);
      setShowAddLecturer(false);
      setNewLecturerName('');
      setNewLecturerEmail('');
      setNewLecturerPassword('lecturer123');
      refreshData();
    } else {
      toast.error(result.error || 'Failed to add lecturer');
    }
  };

  // Filter courses for search
  const filteredCourses = courses.filter(
    (c) =>
      c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.programme.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter students for search
  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.programme?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isDashboard = currentView === '/admin' || currentView === '/admin/';
  const isCoursesView = currentView.startsWith('/admin/courses');
  const isLecturersView = currentView.startsWith('/admin/lecturers');
  const isStudentsView = currentView.startsWith('/admin/students');

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8">

          {/* ===== DASHBOARD VIEW ===== */}
          {isDashboard && (
            <>
              <div className="flex items-center gap-3 mb-6 lg:mb-8">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6 text-gray-700" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600">System overview and management</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Courses</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{courses.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Lecturers</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{lecturers.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Students</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{students.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Programmes</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {new Set(courses.map((c: any) => c.programme)).size}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <button
                  onClick={() => navigate('/admin/courses')}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
                >
                  <BookOpen className="w-8 h-8 text-ttu-navy mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900 mb-1">Manage Courses</h3>
                  <p className="text-sm text-gray-500">Create, edit, and assign lecturers to courses</p>
                </button>
                <button
                  onClick={() => navigate('/admin/lecturers')}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
                >
                  <GraduationCap className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900 mb-1">View Lecturers</h3>
                  <p className="text-sm text-gray-500">See all lecturers and their course assignments</p>
                </button>
                <button
                  onClick={() => navigate('/admin/students')}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
                >
                  <Smartphone className="w-8 h-8 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900 mb-1">Manage Devices</h3>
                  <p className="text-sm text-gray-500">Reset student device locks when they switch phones</p>
                </button>
                <button
                  onClick={() => setShowCreateCourse(true)}
                  className="bg-gradient-to-r from-ttu-navy to-ttu-navy-dark rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left group text-white"
                >
                  <Plus className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-1">Create Course</h3>
                  <p className="text-sm text-white/70">Add a new course and assign a lecturer</p>
                </button>
              </div>

              {/* Courses by Programme */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Courses by Programme</h2>
                </div>
                <div className="p-4 lg:p-6">
                  {PROGRAMMES.map((programme) => {
                    const programmeCourses = courses.filter((c: any) => c.programme === programme);
                    if (programmeCourses.length === 0) return null;
                    return (
                      <div key={programme} className="mb-6 last:mb-0">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                          {programme} ({programmeCourses.length} course{programmeCourses.length !== 1 ? 's' : ''})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {programmeCourses.map((course: any) => (
                            <div key={course.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                              <p className="font-medium text-gray-900 text-sm">{course.courseName}</p>
                              <p className="text-xs text-gray-500 font-mono">{course.courseCode} · {course.level}</p>
                              <p className="text-xs text-ttu-navy mt-1">
                                {course.lecturer?.name || 'Unassigned'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ===== COURSES VIEW ===== */}
          {isCoursesView && (
            <>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 lg:mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors"
                      aria-label="Open menu"
                    >
                      <Menu className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Course Management</h1>
                  </div>
                  <p className="text-gray-600 ml-11 lg:ml-0">Create courses, assign lecturers, and manage programmes</p>
                </div>
                <button
                  onClick={() => setShowCreateCourse(true)}
                  className="px-4 py-2 bg-ttu-navy text-white rounded-lg font-medium hover:bg-ttu-navy-dark transition-colors flex items-center justify-center gap-2 ml-11 lg:ml-0 self-start"
                >
                  <Plus className="w-5 h-5" />
                  Create New Course
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent bg-white"
                  placeholder="Search courses by name, code, or programme..."
                />
              </div>

              {/* Courses Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Programme</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Level</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Lecturer</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Students</th>
                        <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredCourses.map((course: any) => {
                        const studentCount = students.filter(
                          (s: any) => s.programme === course.programme && s.level === course.level
                        ).length;

                        return (
                          <tr key={course.id} className="hover:bg-gray-50">
                            <td className="px-4 lg:px-6 py-4">
                              <p className="font-medium text-gray-900 text-sm">{course.courseName}</p>
                              <p className="text-xs text-gray-500 font-mono">{course.courseCode}</p>
                            </td>
                            <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{course.programme}</td>
                            <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{course.level}</td>
                            <td className="px-4 lg:px-6 py-4">
                              {editingCourseId === course.id ? (
                                <div className="flex items-center gap-2">
                                  <select
                                    value={editLecturerId}
                                    onChange={(e) => setEditLecturerId(e.target.value)}
                                    className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                                  >
                                    <option value="">Select...</option>
                                    {lecturers.map((l: any) => (
                                      <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleReassignLecturer(course.id)}
                                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => { setEditingCourseId(null); setEditLecturerId(''); }}
                                    className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-900">{course.lecturer?.name || 'Unassigned'}</span>
                                  <button
                                    onClick={() => { setEditingCourseId(course.id); setEditLecturerId(course.lecturerId); }}
                                    className="p-1 text-gray-400 hover:text-ttu-navy hover:bg-ttu-navy-50 rounded transition-colors"
                                    title="Reassign lecturer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">
                              {studentCount}
                            </td>
                            <td className="px-4 lg:px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteCourse(course.id, course.courseName)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete course"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredCourses.length === 0 && (
                  <div className="p-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {searchQuery ? 'No courses match your search' : 'No courses created yet'}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ===== LECTURERS VIEW ===== */}
          {isLecturersView && (
            <>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 lg:mb-8">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors"
                    aria-label="Open menu"
                  >
                    <Menu className="w-6 h-6 text-gray-700" />
                  </button>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Lecturers</h1>
                    <p className="text-gray-600">All registered lecturers and their assigned courses</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddLecturer(true)}
                  className="px-4 py-2 bg-ttu-navy text-white rounded-lg font-medium hover:bg-ttu-navy-dark transition-colors flex items-center justify-center gap-2 ml-11 lg:ml-0 self-start"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Lecturer
                </button>
              </div>

              <div className="space-y-4">
                {lecturers.map((lecturer: any) => {
                  const lecturerCourses = courses.filter((c: any) => c.lecturerId === lecturer.id);
                  const isEditing = editingUserId === lecturer.id;
                  return (
                    <div key={lecturer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="px-4 lg:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-ttu-navy-50 rounded-full flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-ttu-navy" />
                          </div>
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editUserName}
                                onChange={(e) => setEditUserName(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                                placeholder="Name"
                              />
                              <input
                                type="email"
                                value={editUserEmail}
                                onChange={(e) => setEditUserEmail(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                                placeholder="Email"
                              />
                            </div>
                          ) : (
                            <div>
                              <h3 className="font-semibold text-gray-900">{lecturer.name}</h3>
                              <p className="text-sm text-gray-500">{lecturer.email}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-16 sm:ml-0">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {lecturerCourses.length} course{lecturerCourses.length !== 1 ? 's' : ''}
                          </span>
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveUser(lecturer.id)}
                                className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="Save"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditUser(lecturer)}
                                className="p-1.5 text-gray-400 hover:text-ttu-navy hover:bg-ttu-navy-50 rounded-lg transition-colors"
                                title="Edit lecturer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(lecturer.id, lecturer.name, 'lecturer')}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete lecturer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {lecturerCourses.length > 0 && (
                        <div className="px-4 lg:px-6 py-3 bg-gray-50 border-t border-gray-200">
                          <div className="flex flex-wrap gap-2">
                            {lecturerCourses.map((course: any) => (
                              <span
                                key={course.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-700"
                              >
                                <BookOpen className="w-3 h-3" />
                                {course.courseCode} — {course.courseName}
                                <span className="text-gray-400">({course.programme}, {course.level})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {lecturers.length === 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No lecturers registered yet</p>
                  </div>
                )}
              </div>

              {/* Add Lecturer Modal */}
              {showAddLecturer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl p-6 max-w-md w-full">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Add New Lecturer</h3>
                    <p className="text-sm text-gray-500 mb-6">Create a new lecturer account</p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={newLecturerName}
                          onChange={(e) => setNewLecturerName(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                          placeholder="e.g., Dr. John Smith"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          value={newLecturerEmail}
                          onChange={(e) => setNewLecturerEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                          placeholder="e.g., john.smith@ttu.edu.gh"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password</label>
                        <input
                          type="text"
                          value={newLecturerPassword}
                          onChange={(e) => setNewLecturerPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                        />
                        <p className="text-xs text-gray-400 mt-1">The lecturer can change this after first login</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => { setShowAddLecturer(false); setNewLecturerName(''); setNewLecturerEmail(''); }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddLecturer}
                        className="flex-1 px-4 py-2 bg-ttu-navy text-white rounded-lg font-medium hover:bg-ttu-navy-dark transition-colors"
                      >
                        Add Lecturer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== STUDENTS & DEVICE MANAGEMENT VIEW ===== */}
          {isStudentsView && (
            <>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 lg:mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors"
                      aria-label="Open menu"
                    >
                      <Menu className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Student & Device Management</h1>
                  </div>
                  <p className="text-gray-600 ml-11 lg:ml-0">
                    View enrolled students and reset device locks when a student changes their phone or browser.
                  </p>
                </div>
              </div>

              {/* Security info banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-blue-900">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Device Lock Protection Active</p>
                    <p className="text-blue-700 text-xs mt-0.5">
                      Students are bound to their device upon their first login to prevent proxy attendance. If a student gets a new phone or changes browsers, click <strong>"Reset Device"</strong> to clear their old device binding.
                    </p>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent bg-white text-sm"
                  placeholder="Search students by name, student ID, programme, level, or email..."
                />
              </div>

              {/* Students Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Programme & Level</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Lock Status</th>
                        <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredStudents.map((student: any) => {
                        const deviceBinding = deviceBindings[student.id] || getRegisteredDevice(student.id);
                        const isEditing = editingUserId === student.id;

                        return (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editUserName}
                                  onChange={(e) => setEditUserName(e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm font-semibold w-full max-w-[180px] focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                                />
                              ) : (
                                <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                              )}
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editUserStudentId}
                                  onChange={(e) => setEditUserStudentId(e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm font-mono w-full max-w-[140px] focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                                />
                              ) : (
                                student.studentId
                              )}
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                              {isEditing ? (
                                <div className="space-y-1">
                                  <select
                                    value={editUserProgramme}
                                    onChange={(e) => setEditUserProgramme(e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm w-full max-w-[160px] focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                                  >
                                    {PROGRAMMES.map(p => <option key={p} value={p}>{p}</option>)}
                                  </select>
                                  <select
                                    value={editUserLevel}
                                    onChange={(e) => setEditUserLevel(e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm w-full max-w-[160px] focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                                  >
                                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                  </select>
                                </div>
                              ) : (
                                <>
                                  <p className="font-medium text-gray-800">{student.programme}</p>
                                  <p className="text-xs text-gray-500">{student.level}</p>
                                </>
                              )}
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                              {isEditing ? (
                                <input
                                  type="email"
                                  value={editUserEmail}
                                  onChange={(e) => setEditUserEmail(e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm w-full max-w-[200px] focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                                />
                              ) : (
                                student.email
                              )}
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              {deviceBinding ? (
                                <div className="flex flex-col">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 w-fit">
                                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                                    Device Linked
                                  </span>
                                  <span className="text-[11px] text-gray-400 mt-1">
                                    Linked: {new Date(deviceBinding.registeredAt).toLocaleDateString()}
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 w-fit">
                                  <AlertTriangle className="w-3.5 h-3.5 text-gray-400" />
                                  No Device Bound
                                </span>
                              )}
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => handleSaveUser(student.id)}
                                      className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                      title="Save changes"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setEditingUserId(null)}
                                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                                      title="Cancel"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => startEditUser(student)}
                                      className="p-1.5 text-gray-400 hover:text-ttu-navy hover:bg-ttu-navy-50 rounded-lg transition-colors"
                                      title="Edit student"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleResetDevice(student.id, student.name)}
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                        deviceBinding
                                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                                      }`}
                                      title="Reset device lock"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                      Reset
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(student.id, student.name, 'student')}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete student"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredStudents.length === 0 && (
                  <div className="p-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {searchQuery ? 'No students match your search' : 'No students registered yet'}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ===== CREATE COURSE MODAL ===== */}
          {showCreateCourse && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Create New Course</h3>
                <p className="text-sm text-gray-500 mb-6">Define the course details and assign a lecturer</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
                    <input
                      type="text"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                      placeholder="e.g., Production Management"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
                    <input
                      type="text"
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                      placeholder="e.g., GRD301"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Programme *</label>
                      <select
                        value={newProgramme}
                        onChange={(e) => setNewProgramme(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent bg-white"
                      >
                        {PROGRAMMES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                      <select
                        value={newLevel}
                        onChange={(e) => setNewLevel(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent bg-white"
                      >
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Lecturer *</label>
                    <select
                      value={newLecturerId}
                      onChange={(e) => setNewLecturerId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent bg-white"
                    >
                      <option value="">Select a lecturer...</option>
                      {lecturers.map((l: any) => (
                        <option key={l.id} value={l.id}>{l.name} ({l.email})</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                    <p>
                      <strong>Auto-enrollment:</strong> All students registered as <strong>{newProgramme}</strong>, <strong>{newLevel}</strong> will
                      automatically see this course on their dashboard.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateCourse(false);
                      setNewCourseName('');
                      setNewCourseCode('');
                      setNewLecturerId('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCourse}
                    className="flex-1 px-4 py-2 bg-ttu-navy text-white rounded-lg font-medium hover:bg-ttu-navy-dark transition-colors"
                  >
                    Create Course
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Profile Modal */}
          <EditProfileModal
            isOpen={showEditProfile}
            onClose={() => setShowEditProfile(false)}
          />
        </div>
      </div>
    </div>
  );
};

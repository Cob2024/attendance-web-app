import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { EditProfileModal } from '../components/EditProfileModal';
import {
  getStudentCourses,
  markAttendance,
  getStudentAttendance,
  getCourseAttendance,
  getActiveSessionsForStudent,
  getActiveCode,
  getAttendanceStats
} from '../services/mockData';
import { getCurrentPosition } from '../services/geolocation';
import { markAttendanceApi } from '../services/apiData';
import { checkServerHealth } from '../services/apiClient';
import {
  CheckCircle,
  Clock,
  BookOpen,
  User,
  IdCard,
  GraduationCap,
  MapPin,
  Menu,
  Pencil,
  Radio,
  Loader2,
  AlertCircle,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

export const StudentDashboard: React.FC = () => {
  const { user, deviceFingerprint } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null); // courseId being loaded
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const isCoursesView = location.pathname.startsWith('/student/courses');

  useEffect(() => {
    if (user) {
      const studentCourses = getStudentCourses(user.id);
      setCourses(studentCourses);

      const history = getStudentAttendance(user.id);
      setAttendanceHistory(history);
    }
  }, [user]);

  // Poll for active sessions every 10 seconds
  useEffect(() => {
    if (!user) return;

    const refreshSessions = () => {
      const sessions = getActiveSessionsForStudent(user.id);
      setActiveSessions(sessions);
    };

    refreshSessions();
    const interval = setInterval(refreshSessions, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAttendance = async (courseId: string) => {
    if (!user || !deviceFingerprint) return;

    setLoading(courseId);

    try {
      // Get the student's GPS position
      const position = await getCurrentPosition();

      // Attempt live backend API call first
      const isOnline = await checkServerHealth();
      if (isOnline) {
        const apiResult = await markAttendanceApi(
          courseId,
          position.latitude,
          position.longitude
        );

        if (apiResult.success) {
          toast.success('Attendance marked successfully!');
          const history = getStudentAttendance(user.id);
          setAttendanceHistory(history);
          setLoading(null);
          return;
        } else {
          toast.error(apiResult.error || 'Failed to mark attendance');
          setLoading(null);
          return;
        }
      }

      // Local fallback
      const result = markAttendance(
        user.id,
        courseId,
        position.latitude,
        position.longitude,
        deviceFingerprint
      );

      if (result.success) {
        toast.success('Attendance marked successfully!');
        const history = getStudentAttendance(user.id);
        setAttendanceHistory(history);
      } else {
        toast.error(result.error || 'Failed to mark attendance');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to get your location. Please enable GPS.');
    } finally {
      setLoading(null);
    }
  };

  const getAttendancePercentage = (courseId: string) => {
    const allCourseRecords = getCourseAttendance(courseId);
    const uniqueDates = new Set(allCourseRecords.map((a: any) => a.date));
    const totalSessions = uniqueDates.size;

    if (totalSessions === 0) return 0;

    const studentAttendances = attendanceHistory.filter(a => a.courseId === courseId && a.status === 'present');
    return Math.round((studentAttendances.length / totalSessions) * 100);
  };

  const isTodayMarked = (courseId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceHistory.some(a => a.courseId === courseId && a.date === today);
  };

  const hasActiveSession = (courseId: string) => {
    return activeSessions.some(s => s.courseId === courseId);
  };

  const getSessionForCourse = (courseId: string) => {
    return activeSessions.find(s => s.courseId === courseId);
  };

  // Render the attendance action button for a course card
  const renderAttendanceAction = (course: any) => {
    if (isTodayMarked(course.id)) {
      return (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 rounded-xl">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-semibold">Marked for today</span>
        </div>
      );
    }

    const session = getSessionForCourse(course.id);
    const isLoading = loading === course.id;

    if (session) {
      return (
        <div className="space-y-2">
          {/* Active session indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="text-xs font-medium text-emerald-700">
              Live session by {session.lecturer?.name || 'Lecturer'}
            </span>
          </div>

          <button
            onClick={() => handleMarkAttendance(course.id)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 bg-ttu-navy text-white rounded-lg font-medium hover:bg-ttu-navy-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Location...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                Mark Attendance
              </>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-400 rounded-lg">
        <Clock className="w-4 h-4" />
        <span className="text-sm">No active session</span>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center gap-3 mb-2">
              {/* Hamburger — mobile only */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {isCoursesView ? 'My Courses' : `Welcome back, ${user?.name}!`}
              </h1>
            </div>
            <p className="text-gray-600 lg:ml-0 ml-11">
              {isCoursesView ? "All the courses you are currently enrolled in" : "Manage your attendance and view your courses"}
            </p>
          </div>

          {/* Active Sessions Banner */}
          {!isCoursesView && activeSessions.length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Radio className="w-5 h-5 animate-pulse" />
                <h2 className="font-semibold">
                  {activeSessions.length} Active Session{activeSessions.length !== 1 ? 's' : ''}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeSessions.map(session => (
                  <div
                    key={session.id}
                    className="bg-white/15 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">{session.course?.courseName}</p>
                      <p className="text-emerald-200 text-xs">{session.course?.courseCode} • {session.lecturer?.name}</p>
                    </div>
                    {isTodayMarked(session.courseId) ? (
                      <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Done</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMarkAttendance(session.courseId)}
                        disabled={loading === session.courseId}
                        className="px-3 py-1.5 bg-white text-ttu-navy rounded-lg text-xs font-semibold hover:bg-white/90 transition-colors disabled:opacity-70 flex items-center gap-1.5 cursor-pointer"
                      >
                        {loading === session.courseId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <MapPin className="w-3 h-3" />
                        )}
                        Mark
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-emerald-200">
                <Shield className="w-3.5 h-3.5" />
                <p className="text-xs">Location verified within 50m • Device locked to your account</p>
              </div>
            </div>
          )}

          {isCoursesView ? (
            /* ===== MY COURSES VIEW ===== */
            <div className="mb-6 lg:mb-8">
              {/* Stats Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 mb-1">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 mb-1">Active Sessions</p>
                  <p className="text-2xl font-bold text-emerald-600">{activeSessions.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 mb-1">Total Attended</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceHistory.filter(a => a.status === 'present').length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 mb-1">Overall Attendance</p>
                  <p className="text-2xl font-bold text-ttu-navy">
                    {courses.length > 0
                      ? Math.round(courses.reduce((sum, c) => sum + getAttendancePercentage(c.id), 0) / courses.length)
                      : 0}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {courses.length > 0 ? courses.map((course) => {
                  const stats = getAttendanceStats(course.id);
                  const myAttendances = attendanceHistory.filter(a => a.courseId === course.id && a.status === 'present').length;
                  return (
                  <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4 lg:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="min-w-0 flex-1 mr-3">
                          <h3 className="font-semibold text-gray-900 mb-1 truncate">{course.courseName}</h3>
                          <p className="text-sm text-gray-500">{course.courseCode}</p>
                        </div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-ttu-navy-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-ttu-navy" />
                        </div>
                      </div>

                      {/* Detailed Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-sm font-bold text-gray-900">{myAttendances}</p>
                          <p className="text-[10px] text-gray-500 uppercase">Attended</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-sm font-bold text-gray-900">{stats.totalSessions}</p>
                          <p className="text-[10px] text-gray-500 uppercase">Sessions</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className={`text-sm font-bold ${getAttendancePercentage(course.id) >= 75 ? 'text-green-600' : getAttendancePercentage(course.id) >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                            {getAttendancePercentage(course.id)}%
                          </p>
                          <p className="text-[10px] text-gray-500 uppercase">Rate</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Attendance</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {getAttendancePercentage(course.id)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${getAttendancePercentage(course.id) >= 75 ? 'bg-green-500' : getAttendancePercentage(course.id) >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${getAttendancePercentage(course.id)}%` }}
                          ></div>
                        </div>
                      </div>

                      {renderAttendanceAction(course)}
                    </div>
                  </div>
                  );
                }) : (
                  <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Yet</h3>
                    <p className="text-gray-500">You are not enrolled in any courses currently.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ===== DASHBOARD VIEW ===== */
            <>
              {/* Profile Card */}
              <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6 lg:mb-8 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Student Profile</h2>
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-ttu-navy bg-ttu-navy-50 rounded-lg hover:bg-ttu-navy-100 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                    ) : (
                      <div className="w-10 h-10 bg-ttu-navy-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-ttu-navy" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IdCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">Student ID</p>
                      <p className="font-medium text-gray-900 truncate">{user?.studentId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">Programme</p>
                      <p className="font-medium text-gray-900 truncate">{user?.programme}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">Level</p>
                      <p className="font-medium text-gray-900 truncate">{user?.level}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Courses */}
              <div className="mb-6 lg:mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">My Courses</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {courses.slice(0, 3).map((course) => (
                    <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-4 lg:p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="min-w-0 flex-1 mr-3">
                            <h3 className="font-semibold text-gray-900 mb-1 truncate">{course.courseName}</h3>
                            <p className="text-sm text-gray-500">{course.courseCode}</p>
                          </div>
                          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-ttu-navy-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-ttu-navy" />
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Attendance</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {getAttendancePercentage(course.id)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-ttu-navy h-2 rounded-full transition-all"
                              style={{ width: `${getAttendancePercentage(course.id)}%` }}
                            ></div>
                          </div>
                        </div>

                        {renderAttendanceAction(course)}
                      </div>
                    </div>
                  ))}
                </div>
                {courses.length > 3 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => navigate('/student/courses')}
                      className="text-ttu-navy font-medium hover:text-ttu-navy-dark transition-colors text-sm"
                    >
                      View all courses →
                    </button>
                  </div>
                )}
              </div>

              {/* Attendance History */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Attendance</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {attendanceHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Course
                            </th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                              Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {attendanceHistory.slice(0, 10).map((record, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(record.date).toLocaleDateString()}
                              </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {record.course?.courseName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {record.course?.courseCode}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3" />
                                  Present
                                </span>
                              </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                                {new Date(record.timestamp).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No attendance records yet</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Edit Profile Modal */}
          <EditProfileModal
            isOpen={showEditProfile}
            onClose={() => setShowEditProfile(false)}
          />

          {/* OTP Passcode Verification Modal */}
        </div>
      </div>
    </div>
  );
};
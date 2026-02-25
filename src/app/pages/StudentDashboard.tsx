import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { getStudentCourses, markAttendance, getStudentAttendance } from '../services/mockData';
import { CheckCircle, Clock, BookOpen, User, IdCard, GraduationCap, KeyRound, Menu } from 'lucide-react';
import { toast } from 'sonner';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [codeInputCourse, setCodeInputCourse] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const studentCourses = getStudentCourses(user.id);
      setCourses(studentCourses);

      const history = getStudentAttendance(user.id);
      setAttendanceHistory(history);
    }
  }, [user]);

  const handleMarkAttendance = async (courseId: string) => {
    if (!user || !attendanceCode.trim()) {
      toast.error('Please enter the attendance code');
      return;
    }

    setLoading(true);
    const result = markAttendance(user.id, courseId, attendanceCode.trim());

    if (result.success) {
      toast.success('Attendance marked successfully!');
      const history = getStudentAttendance(user.id);
      setAttendanceHistory(history);
      setAttendanceCode('');
      setCodeInputCourse(null);
    } else {
      toast.error(result.error || 'Failed to mark attendance');
    }

    setLoading(false);
  };

  const getAttendancePercentage = (courseId: string) => {
    const courseAttendances = attendanceHistory.filter(a => a.courseId === courseId);
    const totalSessions = courseAttendances.length;
    const presentSessions = courseAttendances.filter(a => a.status === 'present').length;

    if (totalSessions === 0) return 0;
    return Math.round((presentSessions / totalSessions) * 100);
  };

  const isTodayMarked = (courseId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceHistory.some(a => a.courseId === courseId && a.date === today);
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
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
            </div>
            <p className="text-gray-600 lg:ml-0 ml-11">Manage your attendance and view your courses</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6 lg:mb-8 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ttu-navy-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-ttu-navy" />
                </div>
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
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium text-gray-900 truncate">{user?.course}</p>
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
              {courses.map((course) => (
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

                    {isTodayMarked(course.id) ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Marked for today</span>
                      </div>
                    ) : codeInputCourse === course.id ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={attendanceCode}
                            onChange={(e) => setAttendanceCode(e.target.value.toUpperCase())}
                            maxLength={5}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center font-mono text-lg tracking-widest uppercase focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                            placeholder="_ _ _ _ _"
                            autoFocus
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setCodeInputCourse(null);
                              setAttendanceCode('');
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(course.id)}
                            disabled={loading || attendanceCode.length < 5}
                            className="flex-1 px-3 py-2 bg-ttu-navy text-white rounded-lg text-sm font-medium hover:bg-ttu-navy-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Verifying...' : 'Submit'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setCodeInputCourse(course.id);
                          setAttendanceCode('');
                        }}
                        className="w-full px-4 py-2 bg-ttu-navy text-white rounded-lg font-medium hover:bg-ttu-navy-dark transition-colors flex items-center justify-center gap-2"
                      >
                        <KeyRound className="w-4 h-4" />
                        Enter Code
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
        </div>
      </div>
    </div>
  );
};

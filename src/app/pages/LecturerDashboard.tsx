import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router';
import { useSocket } from '../hooks/useSocket';
import { Sidebar } from '../components/Sidebar';
import {
  getLecturerCourses,
  getCourseAttendance,
  getCourseStudents,
  getAttendanceStats,
  startAttendanceSession,
  getActiveCode,
  deactivateCode,
  manualMarkAttendance,
  exportAttendanceCSV,
  getSessionHistory
} from '../services/mockData';
import { checkServerHealth } from '../services/apiClient';
import {
  getCoursesApi,
  startSessionApi,
  endSessionApi,
  getActiveSessionApi,
  manualMarkAttendanceApi,
  getAttendanceRecordsApi,
  getCourseEnrollmentsApi,
  getAttendanceWarningsApi
} from '../services/apiData';
import { getCurrentPosition } from '../services/geolocation';
import { EditProfileModal } from '../components/EditProfileModal';
import {
  BookOpen,
  Users,
  TrendingUp,
  Download,
  Search,
  Filter,
  Calendar,
  MapPin,
  XCircle,
  UserX,
  UserCheck,
  Clock,
  Menu,
  Pencil,
  Mail,
  Eye,
  Play,
  Radio,
  FileSpreadsheet,
  History,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

export const LecturerDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isClassesView = location.pathname.startsWith('/lecturer/classes');
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [courseStudents, setCourseStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCode, setActiveCode] = useState<any>(null);
  const [sessionStudentCount, setSessionStudentCount] = useState(0);
  const [startingSession, setStartingSession] = useState(false);
  const [summaryDate, setSummaryDate] = useState(new Date().toISOString().split('T')[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [sessionDuration, setSessionDuration] = useState(30);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [liveFeed, setLiveFeed] = useState<any[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);
  const { joinCourse, leaveCourse, on, off } = useSocket();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      const isOnline = await checkServerHealth();
      if (isOnline) {
        const allCourses = await getCoursesApi();
        if (allCourses && Array.isArray(allCourses)) {
          const myCourses = allCourses.filter((c: any) => c.lecturerId === user.id);
          setCourses(myCourses);
          if (myCourses.length > 0 && !selectedCourse) {
            setSelectedCourse(myCourses[0]);
          }
          return;
        }
      }

      const lecturerCourses = getLecturerCourses(user.id);
      setCourses(lecturerCourses);
      if (lecturerCourses.length > 0 && !selectedCourse) {
        setSelectedCourse(lecturerCourses[0]);
      }
    };
    fetchCourses();
  }, [user]);

  useEffect(() => {
    const loadCourseData = async () => {
      if (!selectedCourse) return;

      const isOnline = await checkServerHealth();
      if (isOnline) {
        try {
          const [students, records, activeSession, warningsData] = await Promise.all([
            getCourseEnrollmentsApi(selectedCourse.id),
            getAttendanceRecordsApi({ courseId: selectedCourse.id, startDate, endDate }),
            getActiveSessionApi(selectedCourse.id),
            getAttendanceWarningsApi(selectedCourse.id)
          ]);

          setCourseStudents(students || []);
          setAttendanceRecords(records || []);
          setActiveCode(activeSession);
          if (warningsData?.warnings) {
            setAtRiskStudents(warningsData.warnings);
          }

          // Calculate real stats from live records
          const uniqueDates = Array.from(new Set((records || []).map((r: any) => r.date)));
          const totalSessions = uniqueDates.length;
          const totalPresent = (records || []).filter((r: any) => r.status === 'present').length;
          const totalPossible = (students?.length || 0) * (totalSessions || 1);
          const avgRate = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;

          setStats({
            totalStudents: students?.length || 0,
            totalSessions,
            averageAttendance: avgRate,
            presentCount: totalPresent,
          });
          return;
        } catch (e) {
          console.warn('API error loading course data, falling back', e);
        }
      }

      // Local fallback
      const records = getCourseAttendance(selectedCourse.id, startDate, endDate);
      setAttendanceRecords(records);

      const students = getCourseStudents(selectedCourse.id);
      setCourseStudents(students);

      const courseStats = getAttendanceStats(selectedCourse.id);
      setStats(courseStats);

      // Check for active attendance code
      const code = getActiveCode(selectedCourse.id);
      setActiveCode(code);
    };

    loadCourseData();
  }, [selectedCourse, startDate, endDate]);

  // Socket.io: Join/leave course rooms for real-time events
  useEffect(() => {
    if (!selectedCourse) return;
    joinCourse(selectedCourse.id);
    return () => {
      leaveCourse(selectedCourse.id);
    };
  }, [selectedCourse, joinCourse, leaveCourse]);

  // Socket.io: Listen for real-time attendance events
  const handleAttendanceMarked = useCallback((data: any) => {
    setLiveFeed(prev => [data, ...prev].slice(0, 20));
    setSessionStudentCount(prev => prev + 1);
    toast.success(`${data.studentName} checked in (${data.distance}m away)`, {
      icon: '⚡',
      duration: 3000,
    });
  }, []);

  useEffect(() => {
    on('attendance:marked', handleAttendanceMarked);
    return () => {
      off('attendance:marked', handleAttendanceMarked);
    };
  }, [on, off, handleAttendanceMarked]);

  // Auto-refresh student count for active session
  useEffect(() => {
    if (!activeCode || !selectedCourse) return;

    const refreshCount = () => {
      const today = new Date().toISOString().split('T')[0];
      const records = getCourseAttendance(selectedCourse.id);
      const todayRecords = records.filter((r: any) => r.date === today);
      setSessionStudentCount(todayRecords.length);
    };

    refreshCount();
    const interval = setInterval(refreshCount, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [activeCode, selectedCourse]);

  // Countdown timer for active sessions with auto-close
  useEffect(() => {
    if (!activeCode || !activeCode.expiresAt) {
      setCountdown(null);
      return;
    }

    const tick = () => {
      const now = Date.now();
      const expiresAt = new Date(activeCode.expiresAt).getTime();
      const remaining = expiresAt - now;

      if (remaining <= 0) {
        // Auto-close the session
        handleEndSession();
        setCountdown(null);
        toast.info('Session auto-closed — time expired.');
        return;
      }

      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setCountdown(`${mins}:${secs.toString().padStart(2, '0')}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeCode]);

  const handleStartSession = async () => {
    if (!selectedCourse || !user) return;
    setStartingSession(true);

    try {
      const position = await getCurrentPosition();
      const isOnline = await checkServerHealth();
      if (isOnline) {
        const apiRes = await startSessionApi(
          selectedCourse.id,
          position.latitude,
          position.longitude,
          50,
          sessionDuration
        );
        if (apiRes.success && apiRes.session) {
          setActiveCode(apiRes.session);
          const durationLabel = sessionDuration > 0 ? `(${sessionDuration} min)` : '(Until stopped)';
          toast.success(`Attendance session started ${durationLabel}! GPS Geofence active.`);
          return;
        }
      }

      const newSession = startAttendanceSession(
        selectedCourse.id,
        user.id,
        position.latitude,
        position.longitude,
        sessionDuration
      );
      setActiveCode(newSession);
      const durationLabel = sessionDuration > 0 ? `(${sessionDuration} min)` : '(Until stopped)';
      toast.success(`Attendance session started ${durationLabel}! Your location has been captured.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to get location. Please enable GPS.');
    } finally {
      setStartingSession(false);
    }
  };

  const handleEndSession = async () => {
    if (!selectedCourse) return;
    const isOnline = await checkServerHealth();
    if (isOnline) {
      await endSessionApi(selectedCourse.id);
    }

    deactivateCode(selectedCourse.id);
    setActiveCode(null);
    setSessionStudentCount(0);
    toast.success('Attendance session ended');

    // Refresh records
    const records = getCourseAttendance(selectedCourse.id, startDate, endDate);
    setAttendanceRecords(records);
    const courseStats = getAttendanceStats(selectedCourse.id);
    setStats(courseStats);
  };

  const downloadPDF = () => {
    if (!selectedCourse) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Attendance Report', 14, 20);

    // Course Info
    doc.setFontSize(12);
    doc.text(`Course: ${selectedCourse.courseName}`, 14, 30);
    doc.text(`Course Code: ${selectedCourse.courseCode}`, 14, 37);

    if (startDate && endDate) {
      doc.text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, 14, 44);
    } else {
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 44);
    }

    // Prepare table data
    const tableData = attendanceRecords.map(record => [
      new Date(record.date).toLocaleDateString(),
      record.student?.name || 'N/A',
      record.student?.studentId || 'N/A',
      record.status === 'present' ? 'Present' : 'Absent',
      new Date(record.timestamp).toLocaleTimeString()
    ]);

    // Add table
    autoTable(doc, {
      startY: 52,
      head: [['Date', 'Student Name', 'Student ID', 'Status', 'Time']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [27, 42, 91] },
      styles: { fontSize: 10 }
    });

    // Statistics
    const finalY = (doc as any).lastAutoTable.finalY || 52;
    doc.setFontSize(12);
    doc.text('Statistics:', 14, finalY + 10);
    doc.setFontSize(10);
    doc.text(`Total Sessions: ${stats?.totalSessions || 0}`, 14, finalY + 17);
    doc.text(`Total Attendances: ${stats?.totalAttendances || 0}`, 14, finalY + 24);
    doc.text(`Enrolled Students: ${stats?.enrolledStudents || 0}`, 14, finalY + 31);
    doc.text(`Average Attendance: ${stats?.averageAttendance?.toFixed(2) || 0}%`, 14, finalY + 38);

    // Save PDF
    doc.save(`${selectedCourse.courseCode}_attendance_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF downloaded successfully!');
  };

  const downloadCSV = () => {
    if (!selectedCourse) return;
    const csv = exportAttendanceCSV(selectedCourse.id, startDate, endDate);
    if (!csv) {
      toast.error('No records to export');
      return;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedCourse.courseCode}_attendance_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully!');
  };

  const handleManualMark = (studentId: string, courseId: string, date: string, newStatus: 'present' | 'absent') => {
    manualMarkAttendance(studentId, courseId, date, newStatus);
    // Refresh records
    const records = getCourseAttendance(selectedCourse.id, startDate, endDate);
    setAttendanceRecords(records);
    const courseStats = getAttendanceStats(selectedCourse.id);
    setStats(courseStats);
    toast.success(`Marked as ${newStatus}`);
  };

  const handleViewSessionHistory = () => {
    if (!selectedCourse) return;
    const history = getSessionHistory(selectedCourse.id);
    setSessionHistory(history);
    setShowSessionHistory(!showSessionHistory);
  };

  const getChartData = () => {
    // Group by date and count attendances
    const dateMap = new Map();
    
    // Pre-fill last 7 days with 0 attendance
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap.set(dateStr, 0);
    }

    attendanceRecords.forEach(record => {
      const date = new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dateMap.has(date)) {
        dateMap.set(date, dateMap.get(date) + 1);
      }
    });

    const realData = Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      attendance: count
    }));

    // If all values are 0, show sample trend data so chart is never empty
    const hasRealData = realData.some(d => d.attendance > 0);
    if (!hasRealData && courseStudents.length > 0) {
      const totalStudents = courseStudents.length;
      return realData.map((d, i) => ({
        ...d,
        attendance: Math.max(1, Math.round(totalStudents * [0.65, 0.80, 0.45, 0.90, 0.70, 0.85, 0.75][i]))
      }));
    }

    return realData;
  };

  const filteredRecords = attendanceRecords.filter(record => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      record.student?.name?.toLowerCase().includes(query) ||
      record.student?.studentId?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8">

          {/* ===== MY CLASSES VIEW ===== */}
          {isClassesView ? (
            <>
              {/* Header */}
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
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My Classes</h1>
                  </div>
                  <p className="text-gray-600 ml-11 lg:ml-0">All your assigned courses at a glance</p>
                </div>
              </div>

              {/* Course Cards Grid */}
              {courses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {courses.map((course) => {
                    const courseStats = getAttendanceStats(course.id);
                    const students = getCourseStudents(course.id);
                    const code = getActiveCode(course.id);

                    return (
                      <div
                        key={course.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-ttu-navy to-ttu-navy-dark p-4 lg:p-5">
                          <div>
                            <h3 className="font-semibold text-white text-lg mb-1 truncate">{course.courseName}</h3>
                            <p className="text-white/70 text-sm font-mono">{course.courseCode}</p>
                          </div>

                          {code && (
                            <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-lg">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-white/90 text-xs font-medium">Live Session</span>
                            </div>
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="p-4 lg:p-5">
                          {/* Stats Row */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="text-center">
                              <p className="text-lg font-bold text-gray-900">{students.length}</p>
                              <p className="text-xs text-gray-500">Students</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-gray-900">{courseStats.totalSessions}</p>
                              <p className="text-xs text-gray-500">Sessions</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-gray-900">{courseStats.averageAttendance?.toFixed(0) || 0}%</p>
                              <p className="text-xs text-gray-500">Avg. Att.</p>
                            </div>
                          </div>

                          {/* Attendance Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">Average Attendance</span>
                              <span className="text-xs font-semibold text-gray-700">{courseStats.averageAttendance?.toFixed(1) || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-ttu-navy h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(courseStats.averageAttendance || 0, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              navigate('/lecturer');
                            }}
                            className="w-full px-4 py-2 bg-ttu-navy-50 text-ttu-navy rounded-lg font-medium hover:bg-ttu-navy-100 transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View Dashboard
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Classes Assigned</h3>
                  <p className="text-gray-500">You have not been assigned any courses yet. Contact your administrator.</p>
                </div>
              )}



              {/* Edit Profile Modal */}
              <EditProfileModal
                isOpen={showEditProfile}
                onClose={() => setShowEditProfile(false)}
              />
            </>
          ) : (
            <>
          {/* ===== DASHBOARD VIEW ===== */}
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 lg:mb-8">
            <div>
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
                  Welcome back, {user?.name}!
                </h1>
              </div>
              <p className="text-gray-600 ml-11 lg:ml-0">Manage courses and track student attendance</p>
            </div>

            {/* Class Switcher */}
            {courses.length > 0 && (
              <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 ml-11 lg:ml-0">
                <BookOpen className="w-5 h-5 text-ttu-navy flex-shrink-0" />
                <select
                  value={selectedCourse?.id || ''}
                  onChange={(e) => {
                    const course = courses.find(c => c.id === e.target.value);
                    setSelectedCourse(course);
                  }}
                  className="bg-transparent text-sm font-semibold text-gray-900 border-none focus:ring-0 cursor-pointer pr-8 w-full lg:w-auto"
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.courseName} ({course.courseCode})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Lecturer Profile Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6 lg:mb-8 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Lecturer Profile</h2>
              <button
                onClick={() => setShowEditProfile(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-ttu-navy bg-ttu-navy-50 rounded-lg hover:bg-ttu-navy-100 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                ) : (
                  <div className="w-10 h-10 bg-ttu-navy-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-ttu-navy" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-gray-500 mb-1">Total Courses</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">{courses.length}</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-ttu-navy-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-ttu-navy" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-gray-500 mb-1">Total Students</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">{courseStudents.length}</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-gray-500 mb-1">Total Sessions</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats?.totalSessions || 0}</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-gray-500 mb-1">Avg. Attendance</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats?.averageAttendance?.toFixed(1) || 0}%</p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Course Selection and Actions */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6 lg:mb-8 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0 sm:min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Course
                </label>
                <select
                  value={selectedCourse?.id || ''}
                  onChange={(e) => {
                    const course = courses.find(c => c.id === e.target.value);
                    setSelectedCourse(course);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.courseName} ({course.courseCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:self-end">
                {/* Duration Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Duration
                  </label>
                  <select
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(parseInt(e.target.value))}
                    disabled={!!activeCode}
                    className="w-full lg:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent text-sm disabled:opacity-50"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                    <option value={0}>Until I stop</option>
                  </select>
                </div>

                <div className="sm:self-end">
                <button
                  onClick={handleStartSession}
                  disabled={!selectedCourse || !!activeCode || startingSession}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                  {startingSession ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Session
                    </>
                  )}
                </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Attendance Session Banner */}
          {activeCode && (
            <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-ttu-navy rounded-2xl shadow-xl p-5 lg:p-7 mb-6 lg:mb-8 text-white relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Radio className="w-5 h-5 text-emerald-300 animate-pulse" />
                    <p className="text-emerald-100 text-sm font-semibold tracking-wide uppercase">Live GPS Session Active</p>
                  </div>
                  <p className="text-white font-bold text-xl mb-1">
                    {selectedCourse?.courseName} ({selectedCourse?.courseCode})
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                      <p className="text-emerald-200 text-xs mb-1">Students Marked Present</p>
                      <p className="text-2xl sm:text-3xl font-extrabold text-white">{sessionStudentCount}</p>
                    </div>

                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                      <p className="text-emerald-200 text-xs mb-1">Total Enrolled</p>
                      <p className="text-2xl sm:text-3xl font-extrabold text-white">{courseStudents.length}</p>
                    </div>

                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-200" />
                        <p className="text-emerald-200 text-xs">GPS Geofence</p>
                      </div>
                      <p className="text-sm font-semibold text-white">Active ✓</p>
                      <p className="text-xs text-emerald-200">50m radius bound</p>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-200 mt-3">
                    Instant 1-Tap Attendance enabled • Started at {new Date(activeCode.createdAt).toLocaleTimeString()}
                    {activeCode.durationMinutes > 0 && ` • Duration: ${activeCode.durationMinutes} min`}
                  </p>
                </div>

                <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto">
                  {/* Countdown Timer */}
                  {countdown && (
                    <div className="flex-1 lg:flex-initial bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                      <p className="text-emerald-200 text-xs mb-1">Time Remaining</p>
                      <p className={`text-2xl font-extrabold font-mono ${
                        countdown && parseInt(countdown.split(':')[0]) < 5 ? 'text-yellow-300' : 'text-white'
                      }`}>
                        {countdown}
                      </p>
                    </div>
                  )}
                  {!countdown && activeCode.durationMinutes === 0 && (
                    <div className="flex-1 lg:flex-initial bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                      <p className="text-emerald-200 text-xs mb-1">Duration</p>
                      <p className="text-lg font-bold text-white">Until Stopped</p>
                    </div>
                  )}
                  <button
                    onClick={handleEndSession}
                    className="flex-1 lg:flex-initial px-5 py-3 bg-red-500/90 hover:bg-red-600 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    End Session
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ⚡ Real-Time Live Feed — shown when session is active */}
          {activeCode && liveFeed.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 lg:mb-8 overflow-hidden">
              <div className="px-4 lg:px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">Live Attendance Feed</h2>
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
                  Real-time
                </span>
              </div>
              <div className="divide-y divide-gray-100 max-h-[280px] overflow-y-auto">
                {liveFeed.map((entry, idx) => (
                  <div
                    key={`${entry.timestamp}-${idx}`}
                    className="px-4 lg:px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors animate-[slideIn_0.3s_ease-out]"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{entry.studentName}</p>
                      <p className="text-xs text-gray-500">{entry.studentIdNumber} • {entry.distance}m away</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendance Chart — always visible */}
          {selectedCourse && (
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6 lg:mb-8 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Attendance Trend (Last 7 Days)</h2>
                {!attendanceRecords.some(r => {
                  const d = new Date(r.date);
                  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
                  return d >= weekAgo;
                }) && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Sample Data</span>
                )}
              </div>
              <ChartContainer 
                config={{
                  attendance: {
                    label: "Attendance",
                    color: "#1B2A5B",
                  }
                }}
                className="w-full h-[250px]"
              >
                <BarChart data={getChartData()} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }} 
                    tickMargin={10}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }} 
                    allowDecimals={false}
                  />
                  <ChartTooltip 
                    cursor={false} 
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar 
                    dataKey="attendance" 
                    fill="var(--color-attendance)" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          )}

          {/* Filters and Actions */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-4">
              <div className="flex-1 min-w-0 lg:min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Students
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                    placeholder="Search by name or ID..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:flex lg:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full lg:w-auto px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full lg:w-auto px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={downloadPDF}
                  disabled={!selectedCourse || filteredRecords.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  PDF
                </button>
                <button
                  onClick={downloadCSV}
                  disabled={!selectedCourse || filteredRecords.length === 0}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  CSV
                </button>
              </div>
            </div>
          </div>

          {/* Attendance Records Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Attendance Records</h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {filteredRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Student ID
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRecords.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.student?.name || 'N/A'}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {record.student?.studentId || 'N/A'}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          {record.status === 'present' ? (
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Present
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Absent
                            </span>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {new Date(record.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No attendance records found</p>
                {selectedCourse && (
                  <p className="text-sm text-gray-400 mt-1">
                    Try adjusting your filters or select a different course
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Daily Attendance Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6 lg:mt-8">
            <div className="px-4 lg:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Daily Attendance Summary</h2>
                <p className="text-sm text-gray-500 mt-1">
                  View present and absent students for a specific date
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">View Date:</label>
                <input
                  type="date"
                  value={summaryDate}
                  onChange={(e) => setSummaryDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Student ID
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Marked Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courseStudents.map((student, index) => {
                    const record = attendanceRecords.find(
                      r => r.studentId === student.id && r.date === summaryDate
                    );
                    const isPresent = record?.status === 'present';

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {student.studentId}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleManualMark(
                              student.id,
                              selectedCourse.id,
                              summaryDate,
                              isPresent ? 'absent' : 'present'
                            )}
                            className="group cursor-pointer"
                            title={`Click to mark ${isPresent ? 'absent' : 'present'}`}
                          >
                            {isPresent ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 group-hover:bg-red-100 group-hover:text-red-700 transition-colors">
                                <UserCheck className="w-3.5 h-3.5 group-hover:hidden" />
                                <UserX className="w-3.5 h-3.5 hidden group-hover:block" />
                                <span className="group-hover:hidden">Present</span>
                                <span className="hidden group-hover:inline">Mark Absent</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 group-hover:bg-green-100 group-hover:text-green-700 transition-colors">
                                <UserX className="w-3.5 h-3.5 group-hover:hidden" />
                                <UserCheck className="w-3.5 h-3.5 hidden group-hover:block" />
                                <span className="group-hover:hidden">Absent</span>
                                <span className="hidden group-hover:inline">Mark Present</span>
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {isPresent && record ? new Date(record.timestamp).toLocaleTimeString() : '-'}
                        </td>
                      </tr>
                    );
                  })}
                  {courseStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        No students enrolled in this course
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 lg:px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex gap-4 lg:gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">
                    Present: {courseStudents.filter(s => attendanceRecords.some(r => r.studentId === s.id && r.date === summaryDate && r.status === 'present')).length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">
                    Absent: {courseStudents.filter(s => !attendanceRecords.some(r => r.studentId === s.id && r.date === summaryDate && r.status === 'present')).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Session History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6 lg:mt-8">
            <button
              onClick={handleViewSessionHistory}
              className="w-full px-4 lg:px-6 py-4 border-b border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Session History</h2>
              </div>
              <span className="text-sm text-gray-400">{showSessionHistory ? 'Hide' : 'Show'}</span>
            </button>
            {showSessionHistory && (
              <div className="divide-y divide-gray-200">
                {sessionHistory.length > 0 ? sessionHistory.map((session: any, idx: number) => (
                  <div key={idx} className="px-4 lg:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${session.active ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(session.createdAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500">
                          Started at {new Date(session.createdAt).toLocaleTimeString()} {session.active && '• Active now'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-5 sm:ml-0">
                      <span className="text-sm font-semibold text-gray-700">{session.attendanceCount} students</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${session.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {session.active ? 'Live' : 'Ended'}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    No sessions recorded yet. Start an attendance session to see history here.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enrolled Students */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6 lg:mt-8">
            <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Enrolled Students</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {courseStudents.length} student{courseStudents.length !== 1 ? 's' : ''} enrolled
                  <span className="text-gray-400 ml-2">(auto-enrolled by programme + level)</span>
                </p>
              </div>
            </div>

            {courseStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Email
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Course
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {courseStudents.map((student, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.studentId}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {student.email}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {student.programme}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No students enrolled yet</p>
              </div>
            )}
          </div>

          {/* Edit Profile Modal */}
          <EditProfileModal
            isOpen={showEditProfile}
            onClose={() => setShowEditProfile(false)}
          />
          </>
          )}
        </div>
      </div>
    </div>
  );
};

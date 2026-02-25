import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import {
  getLecturerCourses,
  getCourseAttendance,
  getCourseStudents,
  createCourse,
  getAttendanceStats,
  generateAttendanceCode,
  getActiveCode,
  deactivateCode,
  enrollStudent
} from '../services/mockData';
import {
  BookOpen,
  Users,
  TrendingUp,
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  Key,
  Copy,
  XCircle,
  UserPlus,
  UserX,
  UserCheck,
  Clock,
  Menu
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

export const LecturerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [courseStudents, setCourseStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCode, setActiveCode] = useState<any>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentId, setNewStudentId] = useState('');
  const [summaryDate, setSummaryDate] = useState(new Date().toISOString().split('T')[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const lecturerCourses = getLecturerCourses(user.id);
      setCourses(lecturerCourses);

      if (lecturerCourses.length > 0 && !selectedCourse) {
        setSelectedCourse(lecturerCourses[0]);
      }
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      const records = getCourseAttendance(selectedCourse.id, startDate, endDate);
      setAttendanceRecords(records);

      const students = getCourseStudents(selectedCourse.id);
      setCourseStudents(students);

      const courseStats = getAttendanceStats(selectedCourse.id);
      setStats(courseStats);

      // Check for active attendance code
      const code = getActiveCode(selectedCourse.id);
      setActiveCode(code);
    }
  }, [selectedCourse, startDate, endDate]);

  const handleCreateCourse = () => {
    if (!user || !newCourseName || !newCourseCode) {
      toast.error('Please fill in all fields');
      return;
    }

    const result = createCourse(newCourseName, newCourseCode, user.id);

    if (result.success) {
      toast.success('Course created successfully!');
      const updatedCourses = getLecturerCourses(user.id);
      setCourses(updatedCourses);
      setNewCourseName('');
      setNewCourseCode('');
      setShowCreateCourse(false);
    }
  };

  const handleGenerateCode = () => {
    if (!selectedCourse || !user) return;
    const newCode = generateAttendanceCode(selectedCourse.id, user.id);
    setActiveCode(newCode);
    toast.success('Attendance code generated!');
  };

  const handleDeactivateCode = () => {
    if (!selectedCourse) return;
    deactivateCode(selectedCourse.id);
    setActiveCode(null);
    toast.success('Attendance session ended');
  };

  const handleCopyCode = () => {
    if (activeCode) {
      navigator.clipboard.writeText(activeCode.code);
      toast.success('Code copied to clipboard!');
    }
  };

  const handleEnrollStudent = () => {
    if (!selectedCourse || !newStudentId.trim()) {
      toast.error('Please enter a Student ID');
      return;
    }

    const result = enrollStudent(newStudentId.trim(), selectedCourse.id);

    if (result.success) {
      toast.success(`Student enrolled in ${selectedCourse.courseName}!`);
      const students = getCourseStudents(selectedCourse.id);
      setCourseStudents(students);
      setNewStudentId('');
      setShowAddStudent(false);
    } else {
      toast.error(result.error || 'Failed to enroll student');
    }
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

  const getChartData = () => {
    // Group by date and count attendances
    const dateMap = new Map();
    attendanceRecords.forEach(record => {
      const date = new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    return Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      attendance: count
    })).slice(-7); // Last 7 days
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
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Lecturer Dashboard</h1>
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
                <button
                  onClick={handleGenerateCode}
                  disabled={!selectedCourse || !!activeCode}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Key className="w-5 h-5" />
                  Generate Code
                </button>
                <button
                  onClick={() => setShowCreateCourse(true)}
                  className="px-4 py-2 bg-ttu-navy text-white rounded-lg font-medium hover:bg-ttu-navy-dark transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Course
                </button>
              </div>
            </div>
          </div>

          {/* Active Attendance Code Display */}
          {activeCode && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-4 lg:p-6 mb-6 lg:mb-8 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-emerald-100 text-sm font-medium mb-1">Active Attendance Code</p>
                  <p className="text-xs text-emerald-200 mb-3">
                    {selectedCourse?.courseName} ({selectedCourse?.courseCode})
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl lg:text-4xl font-mono font-bold tracking-[0.2em] lg:tracking-[0.3em] bg-white/20 px-4 lg:px-6 py-2 lg:py-3 rounded-xl">
                      {activeCode.code}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200 mt-3">
                    Generated at {new Date(activeCode.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex sm:flex-col gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 backdrop-blur-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </button>
                  <button
                    onClick={handleDeactivateCode}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    End Session
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Course Modal */}
          {showCreateCourse && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Course</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Name
                    </label>
                    <input
                      type="text"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                      placeholder="e.g., Machine Learning"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Code
                    </label>
                    <input
                      type="text"
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                      placeholder="e.g., CS401"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateCourse(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCourse}
                    className="flex-1 px-4 py-2 bg-ttu-navy text-white rounded-lg font-medium hover:bg-ttu-navy-dark transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Chart */}
          {getChartData().length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6 lg:mb-8 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend (Last 7 Days)</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="attendance" fill="#1B2A5B" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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

              <button
                onClick={downloadPDF}
                disabled={!selectedCourse || filteredRecords.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
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
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Present
                          </span>
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
                    const isPresent = !!record;

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {student.studentId}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          {isPresent ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              <UserCheck className="w-3.5 h-3.5" />
                              Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                              <UserX className="w-3.5 h-3.5" />
                              Absent
                            </span>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {isPresent ? new Date(record.timestamp).toLocaleTimeString() : '-'}
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
                    Present: {courseStudents.filter(s => attendanceRecords.some(r => r.studentId === s.id && r.date === summaryDate)).length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">
                    Absent: {courseStudents.filter(s => !attendanceRecords.some(r => r.studentId === s.id && r.date === summaryDate)).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enrolled Students */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6 lg:mt-8">
            <div className="px-4 lg:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Enrolled Students</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {courseStudents.length} student{courseStudents.length !== 1 ? 's' : ''} enrolled
                </p>
              </div>
              <button
                onClick={() => setShowAddStudent(true)}
                className="px-4 py-2 bg-ttu-navy text-white rounded-lg font-medium hover:bg-ttu-navy-dark transition-colors flex items-center justify-center gap-2 text-sm self-start sm:self-auto"
              >
                <UserPlus className="w-4 h-4" />
                Add Student
              </button>
            </div>

            {/* Add Student Modal */}
            {showAddStudent && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Student to Class</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {selectedCourse?.courseName} ({selectedCourse?.courseCode})
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID
                    </label>
                    <input
                      type="text"
                      value={newStudentId}
                      onChange={(e) => setNewStudentId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                      placeholder="e.g., BC/GRD/22/118"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowAddStudent(false);
                        setNewStudentId('');
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEnrollStudent}
                      className="flex-1 px-4 py-2 bg-ttu-navy text-white rounded-lg font-medium hover:bg-ttu-navy-dark transition-colors"
                    >
                      Enroll
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                          {student.course}
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
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, AlertCircle, UserCheck, User, IdCard, BookOpen, BarChart3, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('');
  const [level, setLevel] = useState('');
  const [role, setRole] = useState<'student' | 'lecturer' | ''>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setStudentId('');
    setCourse('');
    setLevel('');
    setRole('');
    setError('');
  };

  const toggleMode = () => {
    resetForm();
    setIsSignup(!isSignup);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!role) {
      setError('Please select whether you are a Student or Lecturer');
      return;
    }

    setLoading(true);

    if (isSignup) {
      // Signup validation
      if (!name.trim()) {
        setError('Please enter your full name');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (role === 'student' && (!studentId.trim() || !course.trim() || !level)) {
        setError('Please fill in all student details (Student ID, Course, Level)');
        setLoading(false);
        return;
      }

      const result = await signup(
        name.trim(),
        email.trim(),
        password,
        role,
        role === 'student' ? studentId.trim() : undefined,
        role === 'student' ? course.trim() : undefined,
        role === 'student' ? level : undefined
      );

      if (result.success) {
        navigate(role === 'student' ? '/student' : '/lecturer');
      } else {
        setError(result.error || 'Signup failed');
      }
    } else {
      // Login
      const result = await login(email, password, role);

      if (result.success) {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
          const user = JSON.parse(userData);
          navigate(user.role === 'student' ? '/student' : '/lecturer');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ttu-navy-50 to-ttu-navy-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8">
          {/* Logo and Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 mb-4">
              <img src="/assets/ttu-logo.png" alt="Takoradi Technical University Logo" className="w-20 h-20 sm:w-28 sm:h-28 object-contain" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">SmartAttend</h1>
            <p className="text-gray-600">{isSignup ? 'Create your account' : 'Attendance Management System'}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a:
              </label>
              <div className="flex gap-4">
                <label
                  className={`flex-1 flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${role === 'student'
                    ? 'border-ttu-navy bg-ttu-navy-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={role === 'student'}
                    onChange={() => setRole(role === 'student' ? '' : 'student')}
                    className="w-4 h-4 text-ttu-navy rounded border-gray-300 focus:ring-ttu-navy"
                  />
                  <div className="flex items-center gap-2">
                    <GraduationCap className={`w-5 h-5 ${role === 'student' ? 'text-ttu-navy' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${role === 'student' ? 'text-ttu-navy' : 'text-gray-600'}`}>
                      Student
                    </span>
                  </div>
                </label>

                <label
                  className={`flex-1 flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${role === 'lecturer'
                    ? 'border-ttu-navy bg-ttu-navy-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={role === 'lecturer'}
                    onChange={() => setRole(role === 'lecturer' ? '' : 'lecturer')}
                    className="w-4 h-4 text-ttu-navy rounded border-gray-300 focus:ring-ttu-navy"
                  />
                  <div className="flex items-center gap-2">
                    <UserCheck className={`w-5 h-5 ${role === 'lecturer' ? 'text-ttu-navy' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${role === 'lecturer' ? 'text-ttu-navy' : 'text-gray-600'}`}>
                      Lecturer
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Full Name (signup only) */}
            {isSignup && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                    placeholder="e.g. Arhinful Emmanuel Kwabena"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                  placeholder={role === 'lecturer' ? 'lecturer@ttu.edu.gh' : 'student@ttu.edu.gh'}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Confirm Password (signup only) */}
            {isSignup && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {/* Student-specific fields (signup only) */}
            {isSignup && role === 'student' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-semibold text-ttu-navy flex items-center gap-2">
                  <IdCard className="w-4 h-4" />
                  Student Details
                </p>

                {/* Student ID */}
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="studentId"
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent bg-white"
                      placeholder="e.g. BC/GRD/22/118"
                      required
                    />
                  </div>
                </div>

                {/* Course / Programme */}
                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                    Course / Programme
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="course"
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent bg-white"
                      placeholder="e.g. Graphic Design"
                      required
                    />
                  </div>
                </div>

                {/* Level */}
                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <div className="relative">
                    <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      id="level"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ttu-navy focus:border-transparent bg-white appearance-none"
                      required
                    >
                      <option value="">Select your level</option>
                      <option value="Level 100">Level 100</option>
                      <option value="Level 200">Level 200</option>
                      <option value="Level 300">Level 300</option>
                      <option value="Level 400">Level 400</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ttu-navy text-white py-2.5 rounded-lg font-medium hover:bg-ttu-navy-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? (isSignup ? 'Creating Account...' : 'Logging in...')
                : (isSignup ? 'Create Account' : 'Login')
              }
            </button>
          </form>

          {/* Toggle between Login and Signup */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={toggleMode}
                className="ml-1 font-semibold text-ttu-navy hover:text-ttu-navy-dark transition-colors underline underline-offset-2"
              >
                {isSignup ? 'Log in' : 'Sign up'}
              </button>
            </p>
          </div>

          {/* Demo Credentials (login mode only) */}
          {!isSignup && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-700">Student:</p>
                  <p>Email: student@ttu.edu.gh</p>
                  <p>Password: student123</p>
                </div>
                <div className="mt-2">
                  <p className="font-medium text-gray-700">Lecturer:</p>
                  <p>Email: lecturer@ttu.edu.gh</p>
                  <p>Password: lecturer123</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

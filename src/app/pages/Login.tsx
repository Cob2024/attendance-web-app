import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth, UserRole } from '../context/AuthContext';
import {
  GraduationCap,
  Mail,
  Lock,
  AlertCircle,
  UserCheck,
  User,
  IdCard,
  BookOpen,
  BarChart3,
  ShieldCheck,
  MapPin,
  Smartphone,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

export const Login: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [programme, setProgramme] = useState('');
  const [level, setLevel] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
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
    setProgramme('');
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
      setError('Please select whether you are a Student, Lecturer, or Admin');
      return;
    }

    setLoading(true);

    if (isSignup) {
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
      if (role === 'admin') {
        setError('Admin accounts cannot be created via signup. Contact system administrator.');
        setLoading(false);
        return;
      }
      if (role === 'student' && (!studentId.trim() || !programme.trim() || !level)) {
        setError('Please fill in all student details (Student ID, Programme, Level)');
        setLoading(false);
        return;
      }

      const result = await signup(
        name.trim(),
        email.trim(),
        password,
        role as 'student' | 'lecturer',
        role === 'student' ? studentId.trim() : undefined,
        role === 'student' ? programme.trim() : undefined,
        role === 'student' ? level : undefined
      );

      if (result.success) {
        navigate(role === 'student' ? '/student' : '/lecturer');
      } else {
        setError(result.error || 'Signup failed');
      }
    } else {
      const result = await login(email, password, role);

      if (result.success) {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
          const user = JSON.parse(userData);
          navigate(user.role === 'student' ? '/student' : user.role === 'admin' ? '/admin' : '/lecturer');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-3 sm:p-4 lg:p-6">
      {/* Two-Sided Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[500px] max-h-[90vh] border border-gray-200/80">

        {/* ===== LEFT SIDE: Campus Hero Image Container (Visible on lg+) ===== */}
        <div className="lg:w-1/2 relative bg-ttu-navy min-h-[250px] lg:min-h-full flex flex-col justify-between p-6 lg:p-8 overflow-hidden">
          {/* Background Campus Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/ttu-campus-hero.jpg"
              alt="Takoradi Technical University Campus"
              className="w-full h-full object-cover object-center transform scale-105"
            />
            {/* Rich Navy Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-ttu-navy-dark/95 via-ttu-navy/85 to-ttu-navy/60 backdrop-brightness-95"></div>
          </div>

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-lg flex-shrink-0">
              <img src="/assets/ttu-logo.png" alt="TTU Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">Takoradi Technical University</h2>
              <p className="text-xs text-ttu-gold font-semibold uppercase tracking-widest">SmartAttend Portal</p>
            </div>
          </div>

          {/* Hero Content & Feature Highlights */}
          <div className="relative z-10 my-8 lg:my-auto text-white space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-ttu-gold">
              <ShieldCheck className="w-4 h-4 text-ttu-gold" />
              <span>Location & Hardware Verified Attendance</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Streamlined GPS & Mobile Attendance System
            </h1>

            <p className="text-sm text-white/80 leading-relaxed max-w-lg">
              Welcome to the official attendance management platform. Ensure accurate session tracking with geofenced location verification and hardware device locking.
            </p>

            {/* Feature List Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-xs font-medium text-white/90">50m Radius GPS Geofence</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                <Smartphone className="w-5 h-5 text-purple-300 flex-shrink-0" />
                <span className="text-xs font-medium text-white/90">Anti-Proxy Device Lock</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                <BarChart3 className="w-5 h-5 text-amber-300 flex-shrink-0" />
                <span className="text-xs font-medium text-white/90">Real-time Analytics</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-teal-300 flex-shrink-0" />
                <span className="text-xs font-medium text-white/90">Instant PDF & CSV Export</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Quote */}
          <div className="relative z-10 pt-4 border-t border-white/10">
            <p className="text-[11px] text-white/60">
              © 2026 Takoradi Technical University — Excellence in Applied Technology
            </p>
          </div>
        </div>

        {/* ===== RIGHT SIDE: Login / Signup Form Container ===== */}
        <div className="lg:w-1/2 p-6 sm:p-8 lg:p-8 flex flex-col justify-center bg-white overflow-y-auto max-h-[85vh] lg:max-h-full">
          <div className="max-w-md w-full mx-auto">

            {/* Mobile Header Logo (visible on mobile only) */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-flex items-center justify-center w-28 h-28 mb-2 p-2 bg-white rounded-2xl shadow-md border border-gray-200">
                <img src="/assets/ttu-logo.png" alt="Takoradi Technical University Logo" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">SmartAttend</h2>
              <p className="text-xs text-gray-500">Takoradi Technical University</p>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {isSignup ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isSignup ? 'Fill in your details to register on SmartAttend' : 'Sign in to access your attendance portal'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection Cards */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Select Role <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole(role === 'student' ? '' : 'student')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      role === 'student'
                        ? 'border-ttu-navy bg-ttu-navy-50 text-ttu-navy font-semibold shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <GraduationCap className={`w-5 h-5 ${role === 'student' ? 'text-ttu-navy' : 'text-gray-400'}`} />
                    <span className="text-xs">Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole(role === 'lecturer' ? '' : 'lecturer')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      role === 'lecturer'
                        ? 'border-ttu-navy bg-ttu-navy-50 text-ttu-navy font-semibold shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <UserCheck className={`w-5 h-5 ${role === 'lecturer' ? 'text-ttu-navy' : 'text-gray-400'}`} />
                    <span className="text-xs">Lecturer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole(role === 'admin' ? '' : 'admin')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'border-ttu-navy bg-ttu-navy-50 text-ttu-navy font-semibold shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <ShieldCheck className={`w-5 h-5 ${role === 'admin' ? 'text-ttu-navy' : 'text-gray-400'}`} />
                    <span className="text-xs">Admin</span>
                  </button>
                </div>
              </div>

              {/* Default Administrator Quick Access */}
              {!isSignup && (
                <div className="bg-amber-50/80 dark:bg-amber-950/40 rounded-xl p-3 border border-amber-200 dark:border-amber-800 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-amber-900 dark:text-amber-200">Default Admin:</span>
                      <span className="text-amber-800 dark:text-amber-300 font-mono text-[11px] truncate">admin@ttu.edu.gh</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRole('admin');
                        setEmail('admin@ttu.edu.gh');
                        setPassword('admin123');
                        setError('');
                      }}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-[11px] transition-colors flex-shrink-0 cursor-pointer shadow-xs"
                      title="Quick Fill Admin Credentials"
                    >
                      Fill Admin
                    </button>
                  </div>
                </div>
              )}

              {/* Full Name (signup only) */}
              {isSignup && (
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ttu-navy focus:border-transparent text-sm"
                      placeholder="e.g. Arhinful Emmanuel Kwabena"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ttu-navy focus:border-transparent text-sm"
                    placeholder={role === 'lecturer' ? 'lecturer@ttu.edu.gh' : 'student@ttu.edu.gh'}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ttu-navy focus:border-transparent text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (signup only) */}
              {isSignup && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ttu-navy focus:border-transparent text-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors p-1"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Student Extra Details (signup only) */}
              {isSignup && role === 'student' && (
                <div className="space-y-3 pt-1 border-t border-gray-100">
                  <div>
                    <label htmlFor="studentId" className="block text-xs font-medium text-gray-700 mb-1">
                      Student ID Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="studentId"
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ttu-navy focus:border-transparent text-sm"
                        placeholder="e.g. BC/GRD/22/118"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="course" className="block text-xs font-medium text-gray-700 mb-1">
                      Programme <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="course"
                        type="text"
                        value={programme}
                        onChange={(e) => setProgramme(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ttu-navy focus:border-transparent text-sm"
                        placeholder="e.g. Graphic Design"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="level" className="block text-xs font-medium text-gray-700 mb-1">
                      Level <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        id="level"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ttu-navy focus:border-transparent text-sm bg-white"
                        required
                      >
                        <option value="">Select level</option>
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
                className="w-full bg-ttu-navy text-white py-3 rounded-xl font-semibold hover:bg-ttu-navy-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-2"
              >
                {loading
                  ? (isSignup ? 'Creating Account...' : 'Logging in...')
                  : (isSignup ? 'Create Account' : 'Sign In to Portal')
                }
              </button>
            </form>

            {/* Toggle Login/Signup */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-600">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={toggleMode}
                  className="ml-1 font-semibold text-ttu-navy hover:text-ttu-navy-dark transition-colors underline underline-offset-2"
                >
                  {isSignup ? 'Log in' : 'Sign up'}
                </button>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

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
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] flex items-center justify-center p-0 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Subtle Background Glow Orbs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container — Full width/height on mobile, luxury rounded card on desktop */}
      <div className="w-full sm:max-w-5xl xl:max-w-6xl bg-white dark:bg-slate-900 min-h-screen sm:min-h-0 sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col lg:flex-row border-0 sm:border border-slate-200/80 dark:border-slate-800 relative z-10 backdrop-blur-xl">

        {/* ===== LEFT SIDE: Campus Hero Image Container (Visible on lg+) ===== */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-ttu-navy min-h-full flex-col justify-between p-8 xl:p-12 overflow-hidden">
          {/* Background Campus Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/ttu-campus-hero.jpg"
              alt="Takoradi Technical University Campus"
              className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 hover:scale-110"
            />
            {/* Rich Navy Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-ttu-navy/90 to-ttu-navy/70 backdrop-brightness-90"></div>
          </div>

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2.5 shadow-xl ring-2 ring-amber-400/40 flex-shrink-0">
              <img src="/assets/ttu-logo.png" alt="TTU Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white leading-tight tracking-tight">Takoradi Technical University</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">SmartAttend Portal</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] text-emerald-300 font-medium">Cloud Active</span>
              </div>
            </div>
          </div>

          {/* Hero Content & Feature Highlights */}
          <div className="relative z-10 my-auto text-white space-y-6 py-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-amber-300 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Location & Hardware Verified Attendance</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight">
              Next-Gen GPS & Mobile Attendance System
            </h1>

            <p className="text-sm text-slate-200/90 leading-relaxed max-w-lg">
              Official institutional attendance platform. Ensure tamper-proof session tracking with geofenced location verification and hardware device locking.
            </p>

            {/* Feature List Badges */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:bg-white/15 transition-all">
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">50m GPS Geofence</div>
                  <div className="text-[10px] text-slate-300">Classroom radius verification</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:bg-white/15 transition-all">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <Smartphone className="w-4 h-4 text-purple-300 flex-shrink-0" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Anti-Proxy Lock</div>
                  <div className="text-[10px] text-slate-300">Single hardware device binding</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:bg-white/15 transition-all">
                <div className="p-2 bg-amber-500/20 rounded-xl">
                  <BarChart3 className="w-4 h-4 text-amber-300 flex-shrink-0" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Live Roster Sync</div>
                  <div className="text-[10px] text-slate-300">Instant check-in updates</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 hover:bg-white/15 transition-all">
                <div className="p-2 bg-teal-500/20 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-teal-300 flex-shrink-0" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">PDF & Excel Reports</div>
                  <div className="text-[10px] text-slate-300">One-click compliance sheets</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Quote */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-300/80">
            <span>© 2026 Takoradi Technical University</span>
            <span className="text-amber-400 font-semibold italic">"Nsa na adwen ma mpuntu"</span>
          </div>
        </div>

        {/* ===== RIGHT SIDE: Login / Signup Form Container ===== */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 xl:p-12 flex flex-col justify-center bg-white dark:bg-slate-900">
          <div className="max-w-md w-full mx-auto">

            {/* Mobile Header Banner (Compact & Elegant on Mobile) */}
            <div className="lg:hidden flex items-center gap-3.5 mb-5 pb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-sm border border-gray-200 dark:border-slate-700 flex-shrink-0">
                <img src="/assets/ttu-logo.png" alt="TTU Logo" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight truncate">SmartAttend Portal</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Takoradi Technical University</p>
              </div>
            </div>

            {/* Segmented Tab Switcher (Sign In vs Register) */}
            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl mb-6 border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => { if (isSignup) toggleMode(); }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  !isSignup
                    ? 'bg-white dark:bg-slate-900 text-ttu-navy dark:text-amber-400 shadow-sm border border-slate-200/50 dark:border-slate-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { if (!isSignup) toggleMode(); }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  isSignup
                    ? 'bg-white dark:bg-slate-900 text-ttu-navy dark:text-amber-400 shadow-sm border border-slate-200/50 dark:border-slate-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="mb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isSignup ? 'Create Your Account' : 'Welcome Back'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isSignup ? 'Register to start tracking attendance' : 'Sign in to access your attendance portal'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2.5 text-red-700 dark:text-red-300 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="leading-snug">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection Cards */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Role <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole(role === 'student' ? '' : 'student')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 ${
                      role === 'student'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-slate-900 dark:text-amber-300 font-bold shadow-md shadow-amber-500/10 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className={`p-1.5 rounded-xl ${role === 'student' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'}`}>
                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xs font-semibold">Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole(role === 'lecturer' ? '' : 'lecturer')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 ${
                      role === 'lecturer'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-slate-900 dark:text-amber-300 font-bold shadow-md shadow-amber-500/10 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className={`p-1.5 rounded-xl ${role === 'lecturer' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'}`}>
                      <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xs font-semibold">Lecturer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole(role === 'admin' ? '' : 'admin')}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 ${
                      role === 'admin'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-slate-900 dark:text-amber-300 font-bold shadow-md shadow-amber-500/10 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className={`p-1.5 rounded-xl ${role === 'admin' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'}`}>
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xs font-semibold">Admin</span>
                  </button>
                </div>
              </div>

              {/* Default Administrator Quick Access */}
              {!isSignup && (
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl p-3 border border-amber-500/20 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex-shrink-0">🔑</span>
                      <div className="min-w-0 truncate">
                        <span className="font-bold text-slate-900 dark:text-amber-200">Default Admin: </span>
                        <span className="text-slate-600 dark:text-amber-300 font-mono text-[11px]">admin@ttu.edu.gh</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRole('admin');
                        setEmail('admin@ttu.edu.gh');
                        setPassword('admin123');
                        setError('');
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs transition-all flex-shrink-0 cursor-pointer shadow-xs hover:shadow-md active:scale-95"
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
                  <label htmlFor="name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm dark:text-white transition-all placeholder:text-slate-400"
                      placeholder="e.g. Arhinful Emmanuel Kwabena"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm dark:text-white transition-all placeholder:text-slate-400"
                    placeholder={role === 'lecturer' ? 'lecturer@ttu.edu.gh' : role === 'admin' ? 'admin@ttu.edu.gh' : 'student@ttu.edu.gh'}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm dark:text-white transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (signup only) */}
              {isSignup && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm dark:text-white transition-all placeholder:text-slate-400"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Student Extra Details (signup only) */}
              {isSignup && role === 'student' && (
                <div className="space-y-3 pt-2.5 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <label htmlFor="studentId" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Student ID Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="studentId"
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm dark:text-white transition-all placeholder:text-slate-400"
                        placeholder="e.g. BC/GRD/22/118"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="course" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Programme <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="course"
                        type="text"
                        value={programme}
                        onChange={(e) => setProgramme(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm dark:text-white transition-all placeholder:text-slate-400"
                        placeholder="e.g. Graphic Design"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="level" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Level <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <BarChart3 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        id="level"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm dark:text-white transition-all"
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
                className="w-full bg-gradient-to-r from-ttu-navy via-slate-900 to-ttu-navy hover:from-slate-900 hover:to-ttu-navy text-white py-3.5 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-ttu-navy/20 active:scale-[0.99] mt-4 text-sm sm:text-base cursor-pointer border border-white/10"
              >
                {loading
                  ? (isSignup ? 'Creating Account...' : 'Authenticating...')
                  : (isSignup ? 'Create Account' : 'Sign In to Portal')
                }
              </button>
            </form>

            {/* Toggle Login/Signup Footer */}
            <div className="mt-6 text-center pb-4 sm:pb-0">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="ml-1.5 font-bold text-ttu-navy dark:text-amber-400 hover:underline cursor-pointer"
                >
                  {isSignup ? 'Sign in' : 'Create account'}
                </button>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

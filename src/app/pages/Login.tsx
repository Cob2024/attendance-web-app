import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  UserCheck,
  Mail,
  Lock,
  User,
  IdCard,
  BookOpen,
  BarChart3,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';

export const Login: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [role, setRole] = useState<'student' | 'lecturer'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [programme, setProgramme] = useState('');
  const [level, setLevel] = useState('');
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
    setError('');
  };

  const toggleMode = () => {
    resetForm();
    setIsSignup(!isSignup);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
      if (role === 'student' && (!studentId.trim() || !programme.trim() || !level)) {
        setError('Please fill in all student details (Student ID, Programme, Level)');
        setLoading(false);
        return;
      }

      const result = await signup(
        name.trim(),
        email.trim(),
        password,
        role,
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
          navigate(user.role === 'student' ? '/student' : '/lecturer');
        }
      } else {
        setError(result.error || 'Login failed. Please verify your credentials and selected role.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      {/* Subtle Ambient Radial Highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-50 to-slate-100 dark:from-amber-500/10 dark:via-slate-950 dark:to-slate-950 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Institutional Branding Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 p-2.5 mx-auto flex items-center justify-center ring-4 ring-amber-500/10">
            <img src="/assets/ttu-logo.png" alt="TTU Crest" className="w-full h-full object-contain" />
          </div>
          <h1 className="mt-4 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Takoradi Technical University
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            SmartAttend Attendance Portal
          </p>
        </div>

        {/* Main Clean Card */}
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 rounded-3xl">
          
          {/* Segmented Sign In / Create Account Toggle */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { if (isSignup) toggleMode(); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !isSignup
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { if (!isSignup) toggleMode(); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isSignup
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Role Pill Selector */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  role === 'student'
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 ring-1 ring-amber-500/30 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${role === 'student' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('lecturer')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  role === 'lecturer'
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 ring-1 ring-amber-500/30 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <UserCheck className={`w-4 h-4 ${role === 'lecturer' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                <span>Lecturer</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                role="alert"
                className="alert alert-error alert-soft mb-4 p-3 rounded-xl flex items-center gap-2.5 text-xs"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="leading-snug">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Sign up only) */}
            {isSignup && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kwabena Mensah"
                    className="input input-bordered w-full pl-10 pr-4 py-2.5 text-sm rounded-xl"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Institutional Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'student' ? 'student@ttu.edu.gh' : 'lecturer@ttu.edu.gh'}
                  className="input input-bordered w-full pl-10 pr-4 py-2.5 text-sm rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password <span className="text-red-500">*</span>
                </label>
                {!isSignup && (
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input input-bordered w-full pl-10 pr-10 py-2.5 text-sm rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 z-10"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign up only) */}
            {isSignup && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input input-bordered w-full pl-10 pr-10 py-2.5 text-sm rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 z-10"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Extra Student Details (Sign up only) */}
            {isSignup && role === 'student' && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. BC/GRD/22/101"
                      className="input input-bordered w-full pl-10 pr-4 py-2.5 text-sm rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Programme <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <input
                      type="text"
                      value={programme}
                      onChange={(e) => setProgramme(e.target.value)}
                      placeholder="e.g. Graphic Design"
                      className="input input-bordered w-full pl-10 pr-4 py-2.5 text-sm rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Academic Level <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BarChart3 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="select select-bordered w-full pl-10 pr-4 py-2.5 text-sm rounded-xl"
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

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block mt-2 font-bold py-3 text-sm rounded-xl shadow-md gap-2"
            >
              {loading ? (
                <span>{isSignup ? 'Creating Account...' : 'Authenticating...'}</span>
              ) : (
                <>
                  <span>{isSignup ? 'Create Account' : 'Sign In to Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Bar (Clean & Compact) */}
          {!isSignup && (
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Quick Demo:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRole('student');
                    setEmail('kwabena.mensah@ttu.edu.gh');
                    setPassword('student123');
                    setError('');
                  }}
                  className="btn btn-ghost btn-xs bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 text-[11px] font-semibold text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('lecturer');
                    setEmail('frank.odoom@ttu.edu.gh');
                    setPassword('lecturer123');
                    setError('');
                  }}
                  className="btn btn-ghost btn-xs bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 text-[11px] font-semibold text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  👨‍🏫 Lecturer
                </button>
              </div>
            </div>
          )}

          {/* Bottom Switcher */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isSignup ? 'Already registered?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                {isSignup ? 'Sign in' : 'Create an account'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <button
            type="button"
            onClick={() => navigate('/privacy')}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            Privacy Policy &amp; Geolocation Data Usage
          </button>
          <p className="text-[11px] text-slate-400">
            © 2026 Takoradi Technical University. All rights reserved.
          </p>
        </div>
      </div>

      {/* Forgot Password Recovery Modal */}
      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        defaultRole={role}
        onSuccess={(completedIdentifier) => {
          if (completedIdentifier.includes('@')) {
            setEmail(completedIdentifier);
          }
        }}
      />
    </div>
  );
};

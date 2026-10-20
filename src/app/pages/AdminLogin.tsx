import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Terminal,
  Fingerprint,
  ServerCrash
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password, 'admin');

    if (result.success) {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          setError('Access denied. This portal is restricted to system administrators.');
          localStorage.removeItem('currentUser');
        }
      }
    } else {
      setError(result.error || 'Authentication failed. Invalid administrator credentials.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Security-themed background animated elements */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
      />

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFhMWYzYyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiBvcGFjaXR5PSIwLjMiLz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >

        {/* Back to main site link */}
        <motion.button
          type="button"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to SmartAttend</span>
        </motion.button>

        {/* Admin Shield Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center">
            <span className="animate-ping absolute inset-0 rounded-2xl bg-amber-400/20 duration-1000"></span>
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/80 shadow-2xl shadow-slate-900/50 mb-5 ring-1 ring-slate-600/30">
              <ShieldCheck className="w-10 h-10 text-amber-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            System Administration
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
            Restricted access portal. Authorized administrators only.
          </p>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
            <Fingerprint className="w-3.5 h-3.5 text-slate-600" />
            <span>Encrypted</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-700"></div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
            <Terminal className="w-3.5 h-3.5 text-slate-600" />
            <span>Rate Limited</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-700"></div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
            <ServerCrash className="w-3.5 h-3.5 text-slate-600" />
            <span>Audited</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-2xl p-7 sm:p-8 shadow-2xl">

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="mb-5 p-3.5 bg-red-950/50 border border-red-800/60 rounded-xl flex items-start gap-2.5 text-red-300 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="leading-snug text-xs">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="adminEmail" className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="adminEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm text-white transition-all placeholder:text-slate-500"
                  placeholder="admin@ttu.edu.gh"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="adminPassword" className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="adminPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-800/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm text-white transition-all placeholder:text-slate-500"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-slate-950 py-3.5 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-amber-500/20 text-sm cursor-pointer border border-amber-400/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-slate-900"></span>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Authenticate
                </span>
              )}
            </motion.button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-2">
          <button
            type="button"
            onClick={() => navigate('/privacy')}
            className="text-[11px] text-slate-500 hover:text-amber-400 underline transition-colors cursor-pointer"
          >
            Privacy Policy &amp; Security Compliance
          </button>
          <p className="text-[11px] text-slate-600">
            © 2026 Takoradi Technical University — SmartAttend Administration
          </p>
          <p className="text-[10px] text-slate-700">
            Unauthorized access attempts are logged and reported.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router';
import {
  ShieldCheck,
  MapPin,
  Smartphone,
  Zap,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  UserCheck,
  Building2,
  Lock,
  Globe,
  Clock,
  Sparkles,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A1128] text-slate-900 dark:text-slate-100 font-sans selection:bg-ttu-gold selection:text-ttu-navy transition-colors duration-300">
      
      {/* ============================================================
       * 1. TOP NAVIGATION BAR
       * ============================================================ */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0A1128]/80 backdrop-blur-lg border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-md border border-slate-200/60">
              <img src="/assets/ttu-logo.png" alt="TTU Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-lg font-bold text-ttu-navy dark:text-white leading-tight block">SmartAttend</span>
              <span className="text-[10px] text-ttu-gold font-semibold uppercase tracking-wider block -mt-0.5">Takoradi Technical Univ.</span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-ttu-navy dark:hover:text-ttu-gold transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-ttu-navy dark:hover:text-ttu-gold transition-colors">How It Works</a>
            <a href="#portals" className="hover:text-ttu-navy dark:hover:text-ttu-gold transition-colors">Portals</a>
            <a href="#about" className="hover:text-ttu-navy dark:hover:text-ttu-gold transition-colors">About TTU</a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-ttu-navy dark:text-white hover:text-ttu-navy-light transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-ttu-navy text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-ttu-navy-dark transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 group cursor-pointer"
            >
              <span>Access Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-ttu-gold" />
            </button>
          </div>
        </div>
      </nav>


      {/* ============================================================
       * 2. HERO SECTION
       * ============================================================ */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-8">
        {/* Decorative Background Gradients */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-blue-500/10 via-amber-500/10 to-emerald-500/10 blur-3xl rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto text-center space-y-6">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 bg-ttu-navy-50 dark:bg-slate-800/80 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-ttu-navy dark:text-ttu-gold shadow-sm">
            <Sparkles className="w-4 h-4 text-ttu-gold animate-pulse" />
            <span>Official Takoradi Technical University Attendance Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Smart, <span className="bg-gradient-to-r from-ttu-navy via-blue-700 to-indigo-600 dark:from-blue-400 dark:to-ttu-gold bg-clip-text text-transparent">GPS-Verified Attendance</span> for Higher Education
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate proxy attendance and tedious paper sheets with 1-tap location-geofenced verification, hardware device locking, and real-time faculty analytics.
          </p>

          {/* Hero Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-3.5 bg-ttu-navy text-white rounded-xl font-bold text-sm hover:bg-ttu-navy-dark transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <span>Launch SmartAttend Portal</span>
              <ArrowRight className="w-4 h-4 text-ttu-gold group-hover:translate-x-1.5 transition-transform" />
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-center"
            >
              See How It Works
            </a>
          </div>

          {/* Hero Image Card Showcase */}
          <div className="pt-10 max-w-5xl mx-auto relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
              <img
                src="/assets/ttu-campus-hero.png"
                alt="Takoradi Technical University Campus"
                className="w-full max-h-[460px] object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ttu-navy-dark/90 via-ttu-navy-dark/40 to-transparent"></div>

              {/* Overlaid Floating Metrics */}
              <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left text-white">
                <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Speed</span>
                  </div>
                  <p className="text-xl font-bold">&lt; 1 Second</p>
                  <p className="text-[11px] text-white/70">1-Tap Verification</p>
                </div>

                <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-2 text-ttu-gold mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Geofence</span>
                  </div>
                  <p className="text-xl font-bold">50m Radius</p>
                  <p className="text-[11px] text-white/70">Classroom GPS Lock</p>
                </div>

                <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-2 text-purple-300 mb-1">
                    <Smartphone className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Anti-Proxy</span>
                  </div>
                  <p className="text-xl font-bold">100% Bound</p>
                  <p className="text-[11px] text-white/70">Device Fingerprinting</p>
                </div>

                <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-2 text-amber-300 mb-1">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Exports</span>
                  </div>
                  <p className="text-xl font-bold">CSV & PDF</p>
                  <p className="text-[11px] text-white/70">Instant Faculty Reports</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ============================================================
       * 3. CORE FEATURES SECTION
       * ============================================================ */}
      <section id="features" className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold text-ttu-gold uppercase tracking-widest">Built for TTU Excellence</h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Why SmartAttend Replaces Paper Registers
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Designed specifically for multi-level programmes across Takoradi Technical University departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Feature 1 */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">50m GPS Geofencing</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Server-side Haversine algorithms verify that the student is physically present inside the designated classroom coordinate boundary.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Anti-Proxy Device Lock</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Student accounts are bound to a single hardware fingerprint upon first login, preventing students from signing in for absent classmates.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sub-Second 1-Tap Marking</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Attendance marking completes in under 1 second without typing codes or scanning, keeping lectures focused on learning.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Real-Time Faculty Analytics</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Lecturers monitor live student counts, present vs. absent percentages, and 7-day attendance trends dynamically.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Instant CSV & PDF Export</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Generate official academic attendance sheets ready for examination eligibility verification with a single click.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Admin Device Reset Control</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Administrators can reset lost or upgraded student device bindings instantly from the central user management control panel.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ============================================================
       * 4. HOW IT WORKS TIMELINE
       * ============================================================ */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold text-ttu-gold uppercase tracking-widest">Workflow</h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              How SmartAttend Works in 3 Steps
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md space-y-4 relative">
              <div className="w-10 h-10 bg-ttu-navy text-ttu-gold font-extrabold rounded-xl flex items-center justify-center text-lg shadow-md">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Lecturer Launches Session</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                The lecturer clicks "Start Session" on their dashboard. The system captures the classroom's GPS coordinates automatically.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md space-y-4 relative">
              <div className="w-10 h-10 bg-ttu-navy text-ttu-gold font-extrabold rounded-xl flex items-center justify-center text-lg shadow-md">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Student Taps "Mark"</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Students open SmartAttend on their mobile device inside the classroom and tap "Mark Attendance" in 1 click.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md space-y-4 relative">
              <div className="w-10 h-10 bg-ttu-navy text-ttu-gold font-extrabold rounded-xl flex items-center justify-center text-lg shadow-md">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Instant Backend Verification</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                The server verifies student location (&lt;50m) and hardware device lock in under 1 second and records attendance instantly.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ============================================================
       * 5. ROLE PORTALS PREVIEW
       * ============================================================ */}
      <section id="portals" className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold text-ttu-gold uppercase tracking-widest">Role-Based Access</h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Tailored Portals for Everyone
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Student Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Student Portal</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1-Tap GPS Attendance</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Attendance Percentage Tracker</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Course Breakdown & History</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl font-semibold text-xs hover:bg-slate-100 transition-colors"
              >
                Sign In as Student
              </button>
            </div>

            {/* Lecturer Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border-2 border-ttu-navy dark:border-ttu-gold/60 shadow-lg flex flex-col justify-between space-y-6 relative">
              <span className="absolute -top-3 right-6 bg-ttu-navy text-ttu-gold text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow">
                Faculty Choice
              </span>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Lecturer Portal</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Start Live GPS Attendance Session</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Manual Status Override</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Download Official CSV Reports</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-ttu-navy text-white rounded-xl font-semibold text-xs hover:bg-ttu-navy-dark transition-colors shadow-md"
              >
                Sign In as Lecturer
              </button>
            </div>

            {/* Admin Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Admin Command Center</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> System-Wide User Management</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Reset Hardware Device Locks</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Course & Faculty Assignments</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl font-semibold text-xs hover:bg-slate-100 transition-colors"
              >
                Sign In as Admin
              </button>
            </div>

          </div>
        </div>
      </section>


      {/* ============================================================
       * 6. FOOTER
       * ============================================================ */}
      <footer id="about" className="bg-ttu-navy text-white py-12 px-4 sm:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1">
              <img src="/assets/ttu-logo.png" alt="TTU Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h5 className="font-bold text-base">Takoradi Technical University</h5>
              <p className="text-xs text-ttu-gold font-medium">SmartAttend Official Management Portal</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center md:text-right">
            © 2026 Takoradi Technical University — All Rights Reserved.<br />
            Excellence in Applied Technology & Research
          </p>
        </div>
      </footer>

    </div>
  );
};

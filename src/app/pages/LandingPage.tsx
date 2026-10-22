import React from 'react';
import { useNavigate } from 'react-router';
import { motion, type Variants } from 'motion/react';
import {
  MapPin,
  Smartphone,
  Zap,
  BarChart3,
  FileSpreadsheet,
  Radio,
  ArrowRight,
  GraduationCap,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-900 selection:text-white transition-colors duration-200">
      
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)]" />
      </div>

      {/* ============================================================
       * 1. TOP NAVIGATION BAR (Clean, Monochrome, High Contrast)
       * ============================================================ */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center p-1.5 shadow-xs border border-slate-200 dark:border-slate-800 flex-shrink-0 group-hover:border-slate-400 dark:group-hover:border-slate-600 transition-colors">
              <img src="/assets/ttu-logo.png" alt="TTU Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                  SmartAttend
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  v2.5
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                Takoradi Technical University
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#portals" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Portals
            </a>
            <a href="#about" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              About
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/login')}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>


      {/* ============================================================
       * 2. HERO SECTION
       * ============================================================ */}
      <section className="pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center space-y-6"
        >
          
          {/* Status Badge */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-900 dark:text-white">SmartAttend Cloud</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400">Takoradi Technical University System</span>
          </motion.div>

          {/* Headline (Pure text, no distracting rainbow gradients) */}
          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]"
          >
            Zero-Proxy, Geofenced Attendance for Modern Campuses.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Eliminate paper rosters and proxy check-ins. SmartAttend pairs cryptographic device fingerprinting with 50-meter GPS geofencing and real-time faculty telemetry.
          </motion.p>

          {/* Action Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch SmartAttend Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
            >
              How It Works
            </a>
          </motion.div>

          {/* Campus Hero Media Card */}
          <motion.div
            variants={fadeInUp}
            className="pt-8 sm:pt-10 max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xl">
              <img
                src="/assets/ttu-campus-hero.jpg"
                alt="Takoradi Technical University Campus"
                className="w-full max-h-[460px] object-cover object-center"
              />
              {/* Neutral Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

              {/* Status Pill on Top Corner */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/80 text-white text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active 50m Radar Geofence</span>
              </div>

              {/* Metrics Row (Unified, Monochrome Frosting) */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-left">
                {[
                  { icon: Zap, label: "LATENCY", value: "< 1 Second", desc: "1-Tap Verification" },
                  { icon: MapPin, label: "GEOFENCE", value: "50m Radius", desc: "Haversine GPS Lock" },
                  { icon: Smartphone, label: "HARDWARE", value: "100% Bound", desc: "Anti-Proxy Fingerprint" },
                  { icon: FileSpreadsheet, label: "COMPLIANCE", value: "75% Engine", desc: "Exam Clearance Rule" }
                ].map((metric, i) => (
                  <div
                    key={i}
                    className="bg-slate-900/80 backdrop-blur-md p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-800 text-white"
                  >
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <metric.icon className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-[10px] font-bold tracking-wider">{metric.label}</span>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-white">{metric.value}</p>
                    <p className="text-[11px] text-slate-400">{metric.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </motion.div>
      </section>


      {/* ============================================================
       * 3. CORE FEATURES SECTION (Clean, Unified Styling)
       * ============================================================ */}
      <section id="features" className="py-20 sm:py-24 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Engineered for Academic Integrity
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Built specifically to eliminate attendance fraud in high-density university lecture halls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                icon: MapPin,
                title: "50m GPS Geofencing",
                desc: "Server-side Haversine algorithms verify that the student's mobile device is physically located inside the classroom boundary."
              },
              {
                icon: Smartphone,
                title: "Anti-Proxy Device Binding",
                desc: "Student accounts are bound to a single mobile hardware signature upon first login, completely stopping remote proxy attendance."
              },
              {
                icon: Zap,
                title: "Offline-First Sync",
                desc: "Attendance is recorded in an offline outbox if campus connectivity drops, and reconciles automatically when reconnected."
              },
              {
                icon: BarChart3,
                title: "Real-Time Faculty Telemetry",
                desc: "Lecturers view live student headcounts, present lists, and attendance charts updated instantaneously via WebSockets."
              },
              {
                icon: FileSpreadsheet,
                title: "Official PDF & CSV Exports",
                desc: "Generate university-standard attendance sheets with student IDs, course metadata, and statistical summaries with one click."
              },
              {
                icon: Radio,
                title: "Automated Session Timers",
                desc: "Configurable countdown windows automatically lock out late submissions and mark absent students without manual overhead."
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ============================================================
       * 4. HOW IT WORKS (Minimal, Numbered Workflow)
       * ============================================================ */}
      <section id="how-it-works" className="py-20 sm:py-24 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Simple 3-Step Process
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Saves up to 15 minutes of lecture time every single class session.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Lecturer Launches Session",
                desc: "The lecturer starts attendance on their phone or tablet. The system locks room coordinates and begins the session timer."
              },
              {
                step: "02",
                title: "Student Taps to Check In",
                desc: "Students open SmartAttend within the lecture room and tap 'Mark Attendance'. Location and device fingerprint are verified."
              },
              {
                step: "03",
                title: "Instant Verification & Audit",
                desc: "The server checks geodesic distance (<50m), confirms student enrollment, records the entry, and updates reports in real time."
              }
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-extrabold flex items-center justify-center">
                  {item.step}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ============================================================
       * 5. ROLE PORTALS (Clean Monochromatic Cards)
       * ============================================================ */}
      <section id="portals" className="py-20 sm:py-24 bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Access
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Dedicated Portals
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sign in to your designated academic portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* Student Card */}
            <div className="bg-slate-50 dark:bg-slate-900 p-7 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Student Access
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Student Portal</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Check in to live classes, monitor your 75% exam clearance progress, and view attendance history.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-slate-300 flex-shrink-0" />
                    <span>1-Tap GPS Classroom Attendance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-slate-300 flex-shrink-0" />
                    <span>75% Examination Eligibility Tracker</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-slate-300 flex-shrink-0" />
                    <span>Offline Outbox with Auto-Sync</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-sm transition-colors cursor-pointer shadow-xs"
              >
                Sign In as Student
              </button>
            </div>

            {/* Lecturer Card */}
            <div className="bg-slate-50 dark:bg-slate-900 p-7 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl flex items-center justify-center shadow-xs">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Faculty Access
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Lecturer Portal</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Initiate geofenced attendance sessions, monitor live attendee rosters, and download official records.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-slate-300 flex-shrink-0" />
                    <span>50m Geofence Session Launcher</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-slate-300 flex-shrink-0" />
                    <span>Real-Time Live Attendee Feed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-slate-300 flex-shrink-0" />
                    <span>Instant TTU PDF & CSV Sheet Export</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold text-sm transition-colors cursor-pointer shadow-xs"
              >
                Sign In as Lecturer
              </button>
            </div>

          </div>
        </div>
      </section>


      {/* ============================================================
       * 6. FOOTER (Clean, Understated)
       * ============================================================ */}
      <footer id="about" className="bg-white dark:bg-slate-950 py-12 px-4 sm:px-8 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center p-1.5 border border-slate-200 dark:border-slate-800 shadow-xs flex-shrink-0">
              <img src="/assets/ttu-logo.png" alt="TTU Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">Takoradi Technical University</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">SmartAttend Official Management System</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 text-xs">
            <button
              onClick={() => navigate('/privacy')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors underline cursor-pointer"
            >
              Privacy Policy & Terms
            </button>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <p className="text-center md:text-right">
              © 2026 Takoradi Technical University — All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

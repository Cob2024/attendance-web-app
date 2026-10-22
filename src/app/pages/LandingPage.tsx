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
  Award,
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#00205B] selection:text-[#FFC72C] transition-colors duration-200 relative overflow-x-hidden">
      
      {/* Subtle TTU Brand Ambient Light Gradients (Navy & Gold only) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-20 w-[500px] h-[500px] bg-[#00205B]/10 dark:bg-[#1E3A75]/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 -right-24 w-[450px] h-[450px] bg-[#FFC72C]/10 dark:bg-[#FFC72C]/10 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] opacity-40 dark:opacity-15" />
      </div>

      {/* ============================================================
       * 1. TOP NAVIGATION BAR (TTU Institutional Branding)
       * ============================================================ */}
      <header className="sticky top-0 z-50 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center p-1.5 shadow-sm border border-slate-200 dark:border-slate-800 ring-2 ring-[#FFC72C]/40 flex-shrink-0 group-hover:scale-105 transition-transform">
              <img src="/assets/ttu-logo.png" alt="TTU Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-[#00205B] dark:text-white tracking-tight leading-none">
                  SmartAttend
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-[#FFC72C] border border-amber-500/30">
                  v2.5
                </span>
              </div>
              <span className="text-[11px] text-amber-600 dark:text-[#FFC72C] font-bold uppercase tracking-wider block mt-0.5">
                Takoradi Technical University
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-[#00205B] dark:hover:text-[#FFC72C] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#00205B] dark:hover:text-[#FFC72C] transition-colors">
              How It Works
            </a>
            <a href="#portals" className="hover:text-[#00205B] dark:hover:text-[#FFC72C] transition-colors">
              Portals
            </a>
            <a href="#about" className="hover:text-[#00205B] dark:hover:text-[#FFC72C] transition-colors">
              About TTU
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/login')}
              className="px-3.5 py-2 text-xs sm:text-sm font-bold text-[#00205B] dark:text-slate-200 hover:text-amber-600 dark:hover:text-[#FFC72C] transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-[#00205B] hover:bg-[#001744] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-[#FFC72C]/30 hover:shadow-[#00205B]/20"
            >
              <span>Access Portal</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FFC72C]" />
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
          
          {/* Institutional Badge */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full border border-amber-500/30 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 animate-pulse" />
            <span className="font-bold text-[#00205B] dark:text-white">SmartAttend Cloud</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-amber-600 dark:text-[#FFC72C]">Takoradi Technical University</span>
          </motion.div>

          {/* Headline (Updated with requested wording & TTU logo colors) */}
          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.14] max-w-4xl mx-auto"
          >
            A web based attendance <span className="bg-gradient-to-r from-[#00205B] via-[#1E3A75] to-amber-500 dark:from-blue-400 dark:via-blue-200 dark:to-[#FFC72C] bg-clip-text text-transparent">for Modern Campuses</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Engineered for Takoradi Technical University. Eliminate paper registers with 50m GPS geofencing, cryptographic device binding, and automated 75% exam clearance audits.
          </motion.p>

          {/* Action Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#00205B] hover:bg-[#001744] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#00205B]/25 flex items-center justify-center gap-2 cursor-pointer border border-[#FFC72C]/40 group"
            >
              <span>Launch SmartAttend Portal</span>
              <ArrowRight className="w-4 h-4 text-[#FFC72C] group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-sm hover:border-[#00205B] dark:hover:border-[#FFC72C] transition-colors text-center shadow-xs"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Campus Hero Media Card */}
          <motion.div
            variants={fadeInUp}
            className="pt-8 sm:pt-10 max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-slate-200/90 dark:border-slate-800 bg-slate-900 shadow-2xl">
              <img
                src="/assets/ttu-campus-hero.jpg"
                alt="Takoradi Technical University Campus"
                className="w-full max-h-[460px] object-cover object-center"
              />
              {/* Rich TTU Dark Navy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#001238] via-[#001238]/60 to-transparent" />

              {/* Status Pill on Top Corner */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 hidden sm:flex items-center gap-2 bg-[#00205B]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#FFC72C]/40 text-white text-xs font-semibold shadow-md">
                <span className="w-2 h-2 rounded-full bg-[#FFC72C] animate-ping" />
                <span className="text-[#FFC72C]">Active 50m Radar Geofence</span>
              </div>

              {/* Metrics Row (Infused with TTU Gold, Navy & Red) */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-left">
                {[
                  { icon: Zap, label: "LATENCY", value: "< 1 Second", desc: "1-Tap Verification", iconColor: "text-[#FFC72C]" },
                  { icon: MapPin, label: "GEOFENCE", value: "50m Radius", desc: "Haversine GPS Lock", iconColor: "text-sky-300" },
                  { icon: Smartphone, label: "HARDWARE", value: "100% Bound", desc: "Anti-Proxy Signature", iconColor: "text-red-400" },
                  { icon: FileSpreadsheet, label: "COMPLIANCE", value: "75% Engine", desc: "Exam Clearance Rule", iconColor: "text-amber-300" }
                ].map((metric, i) => (
                  <div
                    key={i}
                    className="bg-white/10 dark:bg-slate-900/80 backdrop-blur-md p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-white/20 text-white"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <metric.icon className={`w-3.5 h-3.5 ${metric.iconColor}`} />
                      <span className="text-[10px] font-bold tracking-wider text-slate-300">{metric.label}</span>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-white">{metric.value}</p>
                    <p className="text-[11px] text-slate-300">{metric.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </motion.div>
      </section>


      {/* ============================================================
       * 3. CORE FEATURES SECTION (TTU Brand Palettes)
       * ============================================================ */}
      <section id="features" className="py-20 sm:py-24 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-[#FFC72C] text-xs font-bold uppercase tracking-widest border border-amber-500/25">
              <Award className="w-3.5 h-3.5 text-[#FFC72C]" />
              <span>Built for TTU Excellence</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Why SmartAttend Replaces Paper Registers
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Engineered specifically to solve high-density lecture hall challenges across Takoradi Technical University faculties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                icon: MapPin,
                title: "50m GPS Geofencing",
                desc: "Server-side Haversine geodesic algorithms verify that the student's mobile device is physically located inside the lecture room perimeter.",
                accentBorder: "border-l-4 border-l-[#00205B] dark:border-l-blue-400",
                iconBg: "bg-[#00205B]/10 text-[#00205B] dark:bg-blue-950/60 dark:text-blue-300"
              },
              {
                icon: Smartphone,
                title: "Anti-Proxy Device Binding",
                desc: "Student accounts are locked to a single cryptographic device hardware signature upon first login, completely stopping proxy signing.",
                accentBorder: "border-l-4 border-l-[#C8102E] dark:border-l-red-500",
                iconBg: "bg-red-500/10 text-[#C8102E] dark:bg-red-950/60 dark:text-red-400"
              },
              {
                icon: Zap,
                title: "Eventual Consistency Sync",
                desc: "Attendance is stored in an offline outbox if campus Wi-Fi drops, and reconciles idempotently with the server upon reconnection.",
                accentBorder: "border-l-4 border-l-[#FFC72C] dark:border-l-amber-400",
                iconBg: "bg-amber-500/15 text-amber-700 dark:bg-amber-950/60 dark:text-[#FFC72C]"
              },
              {
                icon: BarChart3,
                title: "Real-Time Faculty Telemetry",
                desc: "Lecturers view live student headcounts, present lists, and attendance charts updated instantaneously via WebSockets.",
                accentBorder: "border-l-4 border-l-[#1E3A75] dark:border-l-sky-400",
                iconBg: "bg-sky-500/10 text-[#1E3A75] dark:bg-sky-950/60 dark:text-sky-300"
              },
              {
                icon: FileSpreadsheet,
                title: "Official TTU PDF & CSV Reports",
                desc: "Generate university-standard attendance sheets complete with student IDs, course metadata, and statistical summaries with one click.",
                accentBorder: "border-l-4 border-l-[#FFC72C] dark:border-l-amber-400",
                iconBg: "bg-amber-500/15 text-amber-700 dark:bg-amber-950/60 dark:text-[#FFC72C]"
              },
              {
                icon: Radio,
                title: "Automated Session Timers",
                desc: "Configurable countdown windows automatically lock out late submissions and mark absent students without manual overhead.",
                accentBorder: "border-l-4 border-l-[#C8102E] dark:border-l-red-500",
                iconBg: "bg-red-500/10 text-[#C8102E] dark:bg-red-950/60 dark:text-red-400"
              }
            ].map((feature, i) => (
              <div
                key={i}
                className={`p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 ${feature.accentBorder} hover:shadow-md transition-all space-y-3`}
              >
                <div className={`w-10 h-10 rounded-xl ${feature.iconBg} flex items-center justify-center`}>
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
       * 4. HOW IT WORKS (TTU Flagship Rhythmic Steps)
       * ============================================================ */}
      <section id="how-it-works" className="py-20 sm:py-24 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-amber-600 dark:text-[#FFC72C] uppercase tracking-widest">
              Simple Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Frictionless Campus Workflow
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Saves up to 15 minutes of lecture time every single class session.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                badgeBg: "bg-[#00205B] text-[#FFC72C] border border-[#FFC72C]/40",
                title: "Lecturer Launches Session",
                desc: "The lecturer starts attendance on their phone or tablet. SmartAttend captures lecture hall coordinates and begins the countdown timer."
              },
              {
                step: "02",
                badgeBg: "bg-[#FFC72C] text-[#00205B] border border-amber-400 shadow-sm",
                title: "Student Taps to Check In",
                desc: "Students open SmartAttend within the lecture room and tap 'Mark Attendance'. Location and device fingerprint are verified."
              },
              {
                step: "03",
                badgeBg: "bg-[#C8102E] text-white border border-red-400 shadow-sm",
                title: "Instant Verification & Audit",
                desc: "The server checks geodesic distance (<50m), confirms student enrollment, records the entry, and updates reports in real time."
              }
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 rounded-xl ${item.badgeBg} text-sm font-black flex items-center justify-center`}>
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
       * 5. ROLE PORTALS (TTU Brand Accents)
       * ============================================================ */}
      <section id="portals" className="py-20 sm:py-24 bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-amber-600 dark:text-[#FFC72C] uppercase tracking-widest">
              Role-Based Access
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Tailored Portals for Campus Users
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Select your designated academic portal below to proceed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* Student Card */}
            <div className="bg-slate-50 dark:bg-slate-900 p-7 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6 hover:shadow-lg transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-[#00205B] dark:text-blue-300 rounded-xl flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-6 h-6 text-[#00205B] dark:text-blue-400" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                    Student Access
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Student Portal</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Check in to live classes, monitor your 75% examination eligibility clearance, and view course history.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00205B] dark:text-blue-400 flex-shrink-0" />
                    <span>1-Tap GPS Classroom Attendance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00205B] dark:text-blue-400 flex-shrink-0" />
                    <span>75% Examination Eligibility Tracker</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00205B] dark:text-blue-400 flex-shrink-0" />
                    <span>Offline Outbox with Auto-Sync</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#00205B] dark:text-white border-2 border-[#00205B]/30 hover:border-[#00205B] rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-xs"
              >
                Sign In as Student
              </button>
            </div>

            {/* Lecturer Card */}
            <div className="bg-slate-50 dark:bg-slate-900 p-7 sm:p-8 rounded-2xl border-2 border-[#00205B] dark:border-amber-400/60 flex flex-col justify-between space-y-6 hover:shadow-xl transition-all relative">
              <span className="absolute -top-3 right-6 bg-[#00205B] text-[#FFC72C] text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm border border-[#FFC72C]/40">
                Faculty Hub
              </span>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-[#FFC72C] rounded-xl flex items-center justify-center shadow-xs">
                  <UserCheck className="w-6 h-6 text-amber-700 dark:text-[#FFC72C]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-[#FFC72C] uppercase tracking-wider">
                    Faculty Access
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Lecturer Portal</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Initiate geofenced attendance sessions, monitor live attendee rosters, and download official records.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-[#FFC72C] flex-shrink-0" />
                    <span>50m Geofence Session Launcher</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-[#FFC72C] flex-shrink-0" />
                    <span>Real-Time Live Attendee Feed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-[#FFC72C] flex-shrink-0" />
                    <span>Instant TTU PDF & CSV Sheet Export</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-[#00205B] hover:bg-[#001744] text-[#FFC72C] rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-md border border-[#FFC72C]/40 flex items-center justify-center gap-1.5"
              >
                <span>Sign In as Lecturer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>


      {/* ============================================================
       * 6. FOOTER (TTU Navy & Gold Emblematic Base)
       * ============================================================ */}
      <footer id="about" className="bg-[#001238] text-white py-12 px-4 sm:px-8 border-t-4 border-[#FFC72C]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center p-1.5 border border-white/20 shadow-md flex-shrink-0">
              <img src="/assets/ttu-logo.png" alt="TTU Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-sm text-white leading-tight">Takoradi Technical University</p>
              <p className="text-xs text-[#FFC72C] font-semibold">SmartAttend Official Management System</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-300">
            <button
              onClick={() => navigate('/privacy')}
              className="hover:text-[#FFC72C] transition-colors underline cursor-pointer"
            >
              Privacy Policy & Terms
            </button>
            <span className="hidden sm:inline text-slate-500">•</span>
            <p className="text-center md:text-right">
              © 2026 Takoradi Technical University — All Rights Reserved.<br />
              <span className="text-[#FFC72C] font-semibold italic">"Nsa na adwen ma mpuntu"</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

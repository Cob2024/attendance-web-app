import React from 'react';
import { useNavigate } from 'react-router';
import { motion, type Variants } from 'motion/react';
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
  Lock,
  Globe,
  Clock,
  Sparkles,
  ChevronRight,
  FileSpreadsheet,
  Radio,
  Layers,
  Award
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1E] text-slate-900 dark:text-slate-100 font-sans selection:bg-ttu-gold selection:text-ttu-navy transition-colors duration-300 overflow-x-hidden relative">
      
      {/* Dynamic Ambient Background Glow Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-blue-600/10 dark:bg-blue-500/15 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 -right-20 w-[550px] h-[550px] bg-amber-500/10 dark:bg-ttu-gold/10 rounded-full blur-[130px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 25, 0],
            y: [0, 25, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute -bottom-20 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-[120px]"
        />
      </div>

      {/* ============================================================
       * 1. TOP NAVIGATION BAR
       * ============================================================ */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-white/75 dark:bg-[#070D1E]/75 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 transition-all shadow-xs"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand Name */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3.5 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl flex items-center justify-center p-1.5 shadow-md border border-slate-200/80 flex-shrink-0 ring-2 ring-ttu-gold/30">
              <img src="/assets/ttu-logo.png" alt="TTU Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-ttu-navy dark:text-white leading-tight tracking-tight">SmartAttend</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-600 dark:text-ttu-gold border border-amber-400/30">
                  v2.5
                </span>
              </div>
              <span className="text-[11px] text-ttu-gold font-bold uppercase tracking-wider block -mt-0.5">
                Takoradi Technical Univ.
              </span>
            </div>
          </motion.div>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-ttu-navy dark:hover:text-ttu-gold transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="hover:text-ttu-navy dark:hover:text-ttu-gold transition-colors duration-200">How It Works</a>
            <a href="#portals" className="hover:text-ttu-navy dark:hover:text-ttu-gold transition-colors duration-200">Portals</a>
            <a href="#about" className="hover:text-ttu-navy dark:hover:text-ttu-gold transition-colors duration-200">About TTU</a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-ttu-navy dark:text-slate-200 hover:text-blue-600 dark:hover:text-ttu-gold transition-colors cursor-pointer"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 10px 25px -5px rgba(0, 32, 91, 0.3)" }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/login')}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-ttu-navy via-slate-900 to-ttu-navy text-white rounded-xl text-xs sm:text-sm font-bold hover:brightness-110 transition-all duration-300 shadow-md flex items-center gap-2 group cursor-pointer border border-white/10"
            >
              <span>Access Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-ttu-gold" />
            </motion.button>
          </div>
        </div>
      </motion.nav>


      {/* ============================================================
       * 2. HERO SECTION
       * ============================================================ */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto text-center space-y-6"
        >
          
          {/* Top Badge */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/90 dark:border-slate-700/80 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-ttu-navy dark:text-white font-bold">SmartAttend Cloud</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 dark:text-slate-300">Official Takoradi Technical University Attendance Platform</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12] max-w-4xl mx-auto"
          >
            Zero-Proxy, <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-500 dark:from-blue-400 dark:via-indigo-300 dark:to-ttu-gold bg-clip-text text-transparent">GPS Geofenced Attendance</span> for Modern Campuses
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Say goodbye to paper attendance registers. SmartAttend combines cryptographic device binding, sub-second 50m Haversine GPS verification, and real-time faculty telemetry.
          </motion.p>

          {/* Hero Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-ttu-navy via-slate-900 to-ttu-navy text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-ttu-navy/30 flex items-center justify-center gap-2.5 cursor-pointer group border border-white/10"
            >
              <span>Launch SmartAttend Portal</span>
              <ArrowRight className="w-4 h-4 text-ttu-gold group-hover:translate-x-1.5 transition-transform" />
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="#how-it-works"
              className="w-full sm:w-auto px-7 py-3.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-xl font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all text-center shadow-xs"
            >
              See How It Works
            </motion.a>
          </motion.div>

          {/* Hero Showcase Card */}
          <motion.div
            variants={fadeInUp}
            className="pt-8 sm:pt-12 max-w-5xl mx-auto relative group"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-900">
              <img
                src="/assets/ttu-campus-hero.jpg"
                alt="Takoradi Technical University Campus"
                className="w-full max-h-[480px] object-cover object-center transform group-hover:scale-102 transition-transform duration-700"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070D1E] via-[#070D1E]/40 to-transparent"></div>

              {/* Floating Geofence Radar Pulse Graphic */}
              <div className="absolute top-6 right-6 hidden sm:flex items-center gap-2.5 bg-black/40 backdrop-blur-xl px-3.5 py-2 rounded-full border border-white/15 text-white text-xs font-semibold">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span>Active 50m Radar Geofence</span>
              </div>

              {/* Overlaid Floating Metrics */}
              <div className="absolute bottom-5 left-5 right-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left text-white">
                <motion.div
                  whileHover={{ y: -4, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                  className="bg-white/15 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 transition-all"
                >
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Latency</span>
                  </div>
                  <p className="text-xl font-extrabold">&lt; 1 Second</p>
                  <p className="text-[11px] text-white/80">1-Tap Verification</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                  className="bg-white/15 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 transition-all"
                >
                  <div className="flex items-center gap-2 text-amber-300 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Geofence</span>
                  </div>
                  <p className="text-xl font-extrabold">50m Radius</p>
                  <p className="text-[11px] text-white/80">Haversine GPS Lock</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                  className="bg-white/15 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 transition-all"
                >
                  <div className="flex items-center gap-2 text-purple-300 mb-1">
                    <Smartphone className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Anti-Proxy</span>
                  </div>
                  <p className="text-xl font-extrabold">100% Bound</p>
                  <p className="text-[11px] text-white/80">Hardware Fingerprinting</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                  className="bg-white/15 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 transition-all"
                >
                  <div className="flex items-center gap-2 text-teal-300 mb-1">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Compliance</span>
                  </div>
                  <p className="text-xl font-extrabold">75% Engine</p>
                  <p className="text-[11px] text-white/80">Exam Eligibility Track</p>
                </motion.div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </section>


      {/* ============================================================
       * 3. CORE FEATURES SECTION
       * ============================================================ */}
      <section id="features" className="py-20 sm:py-28 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-y border-slate-200/70 dark:border-slate-800/80 px-4 sm:px-8 relative">
        <div className="max-w-7xl mx-auto space-y-14">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3 max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-600 dark:text-ttu-gold text-xs font-bold uppercase tracking-widest border border-amber-400/20">
              <Award className="w-3.5 h-3.5" />
              <span>Built for TTU Excellence</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Why SmartAttend Replaces Paper Registers
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Engineered specifically to solve high-density lecture hall challenges across Takoradi Technical University faculties.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {[
              {
                icon: MapPin,
                title: "50m GPS Geofencing",
                desc: "Server-side Haversine geodesic algorithms verify that the student's mobile device is physically present within the 50-meter classroom boundary.",
                color: "emerald",
                bg: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
                border: "hover:border-emerald-500/40"
              },
              {
                icon: Smartphone,
                title: "Anti-Proxy Device Lock",
                desc: "Each student account is cryptographically locked to a single browser hardware fingerprint upon first login, eliminating proxy signing.",
                color: "purple",
                bg: "bg-purple-500/10 text-purple-500 dark:text-purple-400",
                border: "hover:border-purple-500/40"
              },
              {
                icon: Zap,
                title: "Sub-Second 1-Tap Marking",
                desc: "Students mark attendance with a single tap. No QR code bottlenecks, no projector issues, and no paper roster passing.",
                color: "blue",
                bg: "bg-blue-500/10 text-blue-500 dark:text-blue-400",
                border: "hover:border-blue-500/40"
              },
              {
                icon: BarChart3,
                title: "Real-Time Faculty Analytics",
                desc: "Lecturers observe live attendee counts, absent roll lists, and real-time percentage charts updating live via WebSockets.",
                color: "amber",
                bg: "bg-amber-500/10 text-amber-500 dark:text-amber-400",
                border: "hover:border-amber-500/40"
              },
              {
                icon: FileSpreadsheet,
                title: "Instant PDF & CSV Reports",
                desc: "Generate university-formatted attendance sheets complete with student IDs, course metadata, and statistics with one click.",
                color: "teal",
                bg: "bg-teal-500/10 text-teal-500 dark:text-teal-400",
                border: "hover:border-teal-500/40"
              },
              {
                icon: Radio,
                title: "Automated Session Expiry",
                desc: "Configurable session timers (15m, 30m, 1h) automatically lock out late submissions and mark absent students without manual intervention.",
                color: "rose",
                bg: "bg-rose-500/10 text-rose-500 dark:text-rose-400",
                border: "hover:border-rose-500/40"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`p-6 sm:p-7 bg-white dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-700/70 transition-all duration-300 shadow-sm hover:shadow-xl ${feature.border} group`}
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}

          </div>
        </div>
      </section>


      {/* ============================================================
       * 4. HOW IT WORKS TIMELINE
       * ============================================================ */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-8 relative">
        <div className="max-w-5xl mx-auto space-y-14">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-500/20">
              <Layers className="w-3.5 h-3.5" />
              <span>Simple 3-Step Workflow</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Frictionless Campus Workflow
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Engineered to save 15 minutes of instructional time every lecture.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {[
              {
                step: "01",
                title: "Lecturer Launches Session",
                desc: "The lecturer starts a live session from their tablet or laptop. SmartAttend captures classroom coordinates and activates the countdown timer."
              },
              {
                step: "02",
                title: "Student Taps In Range",
                desc: "Students open SmartAttend on their phones inside the lecture hall and tap 'Mark Attendance' in one touch."
              },
              {
                step: "03",
                title: "Instant Verification & Audit",
                desc: "The server calculates geodesic distance (&lt;50m), confirms hardware binding, records attendance, and streams updates to faculty in real time."
              }
            ].map((stepItem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -6 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-7 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-md space-y-4 relative group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-ttu-navy to-slate-900 text-ttu-gold font-black rounded-xl flex items-center justify-center text-lg shadow-md border border-ttu-gold/30 group-hover:scale-105 transition-transform">
                  {stepItem.step}
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{stepItem.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {stepItem.desc}
                </p>
              </motion.div>
            ))}

          </div>
        </div>
      </section>


      {/* ============================================================
       * 5. ROLE PORTALS PREVIEW (Student & Lecturer Only)
       * ============================================================ */}
      <section id="portals" className="py-20 sm:py-28 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3"
          >
            <h2 className="text-xs font-bold text-ttu-gold uppercase tracking-widest">Role-Based Access</h2>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Tailored Portals for Everyone
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Select your portal below to sign in or register.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6 sm:gap-8">
            
            {/* Student Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-6 shadow-lg hover:shadow-2xl transition-all"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center ring-1 ring-blue-500/20">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Student Access</span>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">Student Portal</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Track your physical classroom attendance, check your 75% exam clearance progress, and view course history.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 1-Tap Classroom GPS Attendance</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 75% Examination Clearance Tracker</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Course Rosters & Historical Records</li>
                </ul>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
                className="w-full py-3.5 bg-slate-100 dark:bg-slate-700/80 text-slate-900 dark:text-white border border-slate-300/80 dark:border-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Sign In as Student
              </motion.button>
            </motion.div>

            {/* Lecturer Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl border-2 border-ttu-navy dark:border-ttu-gold/60 shadow-xl flex flex-col justify-between space-y-6 relative group"
            >
              <span className="absolute -top-3.5 right-6 bg-gradient-to-r from-ttu-navy to-slate-900 text-ttu-gold text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md border border-ttu-gold/40">
                Faculty Hub
              </span>
              <div className="space-y-4">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center ring-1 ring-emerald-500/20">
                  <UserCheck className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Faculty Access</span>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">Lecturer Portal</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Launch GPS attendance sessions with automated timers, monitor live attendee counts, and export branded sheets.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Live Geofence Session Launcher</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Real-Time Live Ticker Feed</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> One-Click TTU PDF & CSV Exports</li>
                </ul>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
                className="w-full py-3.5 bg-gradient-to-r from-ttu-navy via-slate-900 to-ttu-navy text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-md cursor-pointer border border-white/10"
              >
                Sign In as Lecturer
              </motion.button>
            </motion.div>

          </div>
        </div>
      </section>


      {/* ============================================================
       * 6. FOOTER
       * ============================================================ */}
      <footer id="about" className="bg-gradient-to-b from-[#070D1E] to-[#040813] text-white py-14 px-4 sm:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1.5 shadow-md flex-shrink-0">
              <img src="/assets/ttu-logo.png" alt="TTU Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h5 className="font-bold text-lg leading-tight">Takoradi Technical University</h5>
              <p className="text-xs text-ttu-gold font-semibold uppercase tracking-wider">SmartAttend Official Management Portal</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center md:text-right leading-relaxed">
            © 2026 Takoradi Technical University — All Rights Reserved.<br />
            <span className="text-ttu-gold font-semibold italic">"Nsa na adwen ma mpuntu"</span>
          </p>
        </div>
      </footer>

    </div>
  );
};

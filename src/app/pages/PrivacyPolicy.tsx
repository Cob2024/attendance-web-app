import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Shield,
  MapPin,
  Smartphone,
  FileText,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Building2,
  Server,
  Eye,
  AlertCircle
} from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1E] text-slate-900 dark:text-slate-100 font-sans selection:bg-ttu-gold selection:text-ttu-navy transition-colors duration-300">
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#070D1E]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-xs border border-slate-200 dark:border-slate-700">
              <img src="/assets/ttu-logo.png" alt="TTU Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-base text-ttu-navy dark:text-white leading-tight block">SmartAttend</span>
              <span className="text-[10px] text-ttu-gold font-bold uppercase tracking-wider block">TTU Privacy Center</span>
            </div>
          </div>

          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-ttu-navy dark:hover:text-ttu-gold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal</span>
          </motion.button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
        
        {/* Document Title Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-500/20">
            <Shield className="w-3.5 h-3.5" />
            <span>Institutional Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            SmartAttend Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Last Updated: Academic Year 2026/2027 • Ghana Data Protection Act (Act 843) Compliant</span>
          </p>
        </motion.div>

        {/* Quick Highlights Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-slate-900/80 rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Privacy Highlights at a Glance</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-1">
              <span className="font-bold text-slate-800 dark:text-white block">📍 Point-in-Time Location Only</span>
              <p>GPS is queried exclusively when you tap "Mark Attendance". No background or continuous location tracking occurs.</p>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-1">
              <span className="font-bold text-slate-800 dark:text-white block">📱 Device Hardware Binding</span>
              <p>A cryptographic hash binds your account to your device to eliminate proxy attendance. Only verified admins can reset this lock.</p>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-1">
              <span className="font-bold text-slate-800 dark:text-white block">🎓 Purely Academic Records</span>
              <p>Data is used exclusively for university course records and official 75% end-of-semester examination clearance auditing.</p>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-1">
              <span className="font-bold text-slate-800 dark:text-white block">🛡️ Zero Third-Party Selling</span>
              <p>Your institutional data is never monetized, sold, or shared with commercial advertising brokers.</p>
            </div>
          </div>
        </motion.div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-ttu-navy text-ttu-gold text-xs font-black">1</span>
              <span>Information We Collect</span>
            </h3>
            <p>
              SmartAttend processes user data required to facilitate automated classroom attendance verification at <strong>Takoradi Technical University (TTU)</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Academic Profile Data:</strong> Full Name, TTU Institutional Email (`@ttu.edu.gh`), Student ID (e.g., `BC/GRD/22/101`), Enrolled Programme, and Academic Level.
              </li>
              <li>
                <strong>GPS Geospatial Coordinates:</strong> Exact latitude and longitude received via browser Geolocation (`navigator.geolocation`) at the single instant of attendance submission.
              </li>
              <li>
                <strong>Hardware Device Fingerprint:</strong> A one-way cryptographic hash composed of non-identifying technical characteristics (screen resolution, platform, canvas/audio entropy, user-agent).
              </li>
              <li>
                <strong>Attendance Records:</strong> Timestamps, course codes, distance calculations (meters from lecturer), and verification status (`present` or `absent`).
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-ttu-navy text-ttu-gold text-xs font-black">2</span>
              <span>How GPS Location Data is Handled</span>
            </h3>
            <p>
              To maintain academic integrity without intruding on student privacy, SmartAttend implements strict geospatial handling principles:
            </p>
            <div className="bg-blue-50/70 dark:bg-blue-950/30 border-l-4 border-blue-500 p-4 rounded-r-xl space-y-1.5">
              <span className="font-bold text-blue-900 dark:text-blue-300 text-xs uppercase tracking-wider block">Haversine 50-Meter Boundary</span>
              <p className="text-xs text-blue-800/90 dark:text-blue-300/90">
                The server computes the distance between student coordinates and the lecturer’s session coordinates using the Haversine formula. Coordinates are never tracked continuously or monitored outside active lecture periods.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-ttu-navy text-ttu-gold text-xs font-black">3</span>
              <span>Device Fingerprint & Anti-Proxy Security</span>
            </h3>
            <p>
              To prevent proxy check-ins (students submitting attendance on behalf of absent friends), SmartAttend binds each student account to the first physical device browser used to sign in.
            </p>
            <p>
              If you change your phone or switch browsers, an institutional administrator can reset your device binding through the central admin panel after identity confirmation.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-ttu-navy text-ttu-gold text-xs font-black">4</span>
              <span>Data Storage & Security Safeguards</span>
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Encryption in Transit:</strong> All client-server communications are encrypted using Transport Layer Security (HTTPS/WSS TLS 1.3).</li>
              <li><strong>Password Security:</strong> Account passwords are protected with strong cryptographic hashing (Argon2 / Bcrypt with salted rounds).</li>
              <li><strong>Role-Based Access:</strong> Lecturers can only access rosters and attendance records for courses assigned to them. Students can only view their own attendance history.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-ttu-navy text-ttu-gold text-xs font-black">5</span>
              <span>Compliance with University Regulations</span>
            </h3>
            <p>
              SmartAttend operates under Takoradi Technical University Academic Regulations governing examination eligibility (specifically the minimum 75% attendance threshold) and aligns with the <strong>Data Protection Act of Ghana, 2012 (Act 843)</strong>.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-ttu-navy text-ttu-gold text-xs font-black">6</span>
              <span>Contact & Administrative Enquiries</span>
            </h3>
            <p>
              For enquiries regarding attendance audits, device resets, or privacy concerns, please contact the institutional administrator or your department head:
            </p>
            <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs space-y-1 font-mono">
              <p>Takoradi Technical University — SmartAttend Administration</p>
              <p>Email: <span className="text-ttu-navy dark:text-ttu-gold font-bold">admin@ttu.edu.gh</span></p>
              <p>Takoradi, Western Region, Ghana</p>
            </div>
          </section>

        </div>

        {/* Back Button Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-ttu-navy text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-ttu-navy-dark transition-colors shadow-md cursor-pointer"
          >
            Return to SmartAttend Portal
          </motion.button>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-[#070D1E] to-[#040813] text-white py-8 px-4 border-t border-slate-800 text-center text-xs text-slate-400">
        <p>© 2026 Takoradi Technical University — All Rights Reserved.</p>
        <p className="text-ttu-gold font-semibold italic mt-1">"Nsa na adwen ma mpuntu"</p>
      </footer>

    </div>
  );
};


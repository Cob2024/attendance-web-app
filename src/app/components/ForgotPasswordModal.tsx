import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  GraduationCap,
  UserCheck,
  ArrowRight,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { requestPasswordResetApi, verifyResetCodeApi, resetPasswordApi } from '../services/apiData';
import { mockRequestPasswordReset, mockVerifyResetCode, mockResetPassword } from '../services/mockData';
import { checkServerHealth } from '../services/apiClient';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'student' | 'lecturer';
  onSuccess?: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'student',
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [role, setRole] = useState<'student' | 'lecturer'>(defaultRole);
  const [channel, setChannel] = useState<'email' | 'sms'>('email');
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [resetSessionToken, setResetSessionToken] = useState('');
  const [verifiedResetToken, setVerifiedResetToken] = useState('');
  const [maskedTarget, setMaskedTarget] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devCodeBanner, setDevCodeBanner] = useState<string | null>(null);

  // Countdown timer for Step 2
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes = 900s

  useEffect(() => {
    if (defaultRole) {
      setRole(defaultRole);
    }
  }, [defaultRole]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const resetAll = () => {
    setStep(1);
    setIdentifier('');
    setCode('');
    setResetSessionToken('');
    setVerifiedResetToken('');
    setMaskedTarget('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setDevCodeBanner(null);
    setTimeLeft(900);
    setLoading(false);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Step 1: Request Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDevCodeBanner(null);

    if (!identifier.trim()) {
      setError(channel === 'email' ? 'Please enter your TTU institutional email' : 'Please enter your phone number or student ID');
      return;
    }

    setLoading(true);

    try {
      const isOnline = await checkServerHealth();
      let res: any;

      if (isOnline) {
        res = await requestPasswordResetApi(identifier.trim(), channel, role);
      } else {
        res = mockRequestPasswordReset(identifier.trim(), channel, role);
      }

      if (res.success && res.resetSessionToken) {
        setResetSessionToken(res.resetSessionToken);
        setMaskedTarget(res.maskedTarget || identifier.trim());
        setTimeLeft(900);
        setStep(2);
        toast.success(`Verification code dispatched to ${res.maskedTarget || identifier.trim()}`);
        if (res.devCode) {
          setDevCodeBanner(res.devCode);
        }
      } else {
        setError(res.error || 'Failed to request reset code. Please check your details.');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.trim().length !== 6) {
      setError('Please enter the full 6-digit verification code');
      return;
    }

    setLoading(true);

    try {
      const isOnline = await checkServerHealth();
      let res: any;

      if (isOnline) {
        res = await verifyResetCodeApi(code.trim(), resetSessionToken);
      } else {
        res = mockVerifyResetCode(code.trim(), resetSessionToken);
      }

      if (res.success && res.verifiedResetToken) {
        setVerifiedResetToken(res.verifiedResetToken);
        setStep(3);
        toast.success('Code verified successfully!');
      } else {
        setError(res.error || 'Invalid or expired code. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const isOnline = await checkServerHealth();
      let res: any;

      if (isOnline) {
        res = await resetPasswordApi(newPassword, verifiedResetToken);
      } else {
        res = mockResetPassword(newPassword, verifiedResetToken);
      }

      if (res.success) {
        setStep(4);
        toast.success('Your password has been reset successfully!');
        if (onSuccess) {
          onSuccess(identifier.trim());
        }
      } else {
        setError(res.error || 'Failed to update password. Please request a new code.');
      }
    } catch (err: any) {
      setError(err?.message || 'Password update failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative"
      >
        {/* Top Gradient Ribbon */}
        <div className="h-2 w-full bg-gradient-to-r from-ttu-navy via-amber-500 to-ttu-navy"></div>

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Password Recovery
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 1 && 'Step 1 of 3: Request Verification Code'}
                {step === 2 && 'Step 2 of 3: Enter Verification Code'}
                {step === 3 && 'Step 3 of 3: Set New Password'}
                {step === 4 && 'Recovery Complete'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close recovery dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dev / Test Code Callout (Testing Day Convenience) */}
        {devCodeBanner && step === 2 && (
          <div className="mx-6 mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 dark:text-amber-400 font-bold">🧪 Testing OTP:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm tracking-widest">{devCodeBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setCode(devCodeBanner)}
              className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              Auto-Fill
            </button>
          </div>
        )}

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-300 text-xs"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Contents */}
        <div className="p-6">
          {/* ================= STEP 1: Request Code ================= */}
          {step === 1 && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Select Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      role === 'student'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('lecturer')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      role === 'lecturer'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Lecturer</span>
                  </button>
                </div>
              </div>

              {/* Delivery Channel Radio Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Send Code Via
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('email')}
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      channel === 'email'
                        ? 'border-ttu-navy dark:border-amber-500 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-amber-400 ring-2 ring-ttu-navy/10 dark:ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <Mail className="w-5 h-5 text-amber-500" />
                    <span>Institutional Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      channel === 'sms'
                        ? 'border-ttu-navy dark:border-amber-500 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-amber-400 ring-2 ring-ttu-navy/10 dark:ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-amber-500" />
                    <span>Mobile SMS</span>
                  </button>
                </div>
              </div>

              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {channel === 'email' ? 'Institutional TTU Email' : 'Mobile Phone Number or Student ID'}
                </label>
                <div className="relative">
                  {channel === 'email' ? (
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  ) : (
                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  )}
                  <input
                    type={channel === 'email' ? 'email' : 'text'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      channel === 'email'
                        ? (role === 'student' ? 'kwabena.mensah@ttu.edu.gh' : 'frank.odoom@ttu.edu.gh')
                        : '0244123456 or BC/GRD/22/101'
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm dark:text-white transition-all placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-gradient-to-r from-ttu-navy via-slate-900 to-ttu-navy hover:from-slate-900 hover:to-ttu-navy text-white py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 text-sm cursor-pointer shadow-md flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span>Sending Code...</span>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
          )}

          {/* ================= STEP 2: Enter OTP Code ================= */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="text-center py-1">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  We sent a 6-digit verification code to:
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                  {maskedTarget}
                </p>
              </div>

              {/* 6-digit Code Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-center">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full py-3 text-center tracking-[0.5em] text-2xl font-mono font-black bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-900 dark:text-white"
                  autoFocus
                  required
                />
              </div>

              {/* Expiration Timer & Resend */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span>
                  Expires in: <strong className="text-amber-600 dark:text-amber-400 font-mono">{formatTime(timeLeft)}</strong>
                </span>
                <button
                  type="button"
                  disabled={loading}
                  onClick={(e) => handleRequestCode(e as any)}
                  className="inline-flex items-center gap-1 text-ttu-navy dark:text-amber-400 font-bold hover:underline cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <motion.button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 text-sm cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </motion.button>
              </div>
            </form>
          )}

          {/* ================= STEP 3: Set New Password ================= */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center py-1">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Verification verified. Set your new portal password:
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm dark:text-white transition-all"
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

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm dark:text-white transition-all"
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

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 text-sm cursor-pointer shadow-md flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Saving New Password...' : 'Save & Update Password'}
              </motion.button>
            </form>
          )}

          {/* ================= STEP 4: Success Screen ================= */}
          {step === 4 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Password Updated!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Your credentials have been securely refreshed. You can now log into your TTU SmartAttend portal.
                </p>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-ttu-navy via-slate-900 to-ttu-navy text-white py-3 rounded-xl font-bold text-sm cursor-pointer shadow-md mt-4"
              >
                Return to Sign In
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};


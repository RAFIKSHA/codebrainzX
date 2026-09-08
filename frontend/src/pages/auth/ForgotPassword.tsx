import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { setSEOMetadata } from '../../utils/seo';
import { Mail, CheckCircle, ArrowLeft, Loader2, KeyRound, Check, X, AlertCircle } from 'lucide-react';
import Logo from '../../components/brand/Logo';

const ForgotPassword: React.FC = () => {
  const { sendOtp, resetPassword } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVal, setOtpVal] = useState<string[]>(new Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Password rules evaluation
  const rules = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  const strengthScore = Object.values(rules).filter(Boolean).length;

  useEffect(() => {
    setSEOMetadata({
      title: 'Reset Password | CodexPetra',
      description: 'Request a password reset OTP to regain access to your CodexPetra account.',
      canonicalUrl: 'https://codexpetra.com/forgot-password',
      noindex: true,
    });
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Request OTP code
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await sendOtp(email, 'forgot_password');
      setOtpSent(true);
      setResendCooldown(30);
      setTimeout(() => {
        if (otpInputsRef.current[0]) otpInputsRef.current[0].focus();
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to send OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP inputs interactions
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    const val = element.value;
    if (isNaN(Number(val))) return;

    const newOtp = [...otpVal];
    newOtp[index] = val.substring(val.length - 1);
    setOtpVal(newOtp);

    // Auto-advance
    if (val && index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otpVal[index] && index > 0 && otpInputsRef.current[index - 1]) {
        otpInputsRef.current[index - 1]?.focus();
      }
      const newOtp = [...otpVal];
      newOtp[index] = '';
      setOtpVal(newOtp);
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && !isNaN(Number(pasteData))) {
      const newOtp = pasteData.split('');
      setOtpVal(newOtp);
      otpInputsRef.current[5]?.focus();
    }
  };

  // Submit Password reset verify
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpVal.join('');

    if (code.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (strengthScore < 5) {
      setError('Please fulfill all password requirements.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await resetPassword(email, code, newPassword);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.password?.[0] || 
        'Failed to reset password. The OTP code may be invalid or expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStrengthLabel = () => {
    if (!newPassword) return '';
    if (strengthScore <= 2) return 'Weak';
    if (strengthScore <= 4) return 'Medium';
    return 'Strong & Secure';
  };

  const getStrengthColor = () => {
    if (strengthScore <= 2) return 'bg-red-500';
    if (strengthScore <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-16 bg-slate-50 dark:bg-[#020204] transition-colors duration-200 min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-600/5 dark:bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/5 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="w-full max-w-md bg-white/90 dark:bg-[#08090e]/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8 relative z-10">
        
        {/* Header Block */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo showText={false} iconSize={36} className="mb-3" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            {success
              ? 'Password successfully updated'
              : !otpSent
              ? "We'll send you an OTP to verify ownership"
              : 'Enter verification OTP and create new password'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 rounded-xl flex items-start gap-2.5 text-xs text-red-650 dark:text-red-400 font-semibold leading-relaxed">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-800 rounded-xl flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-400 leading-relaxed font-semibold">
              <CheckCircle size={20} className="shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <span className="font-black text-slate-900 dark:text-white block mb-1 uppercase tracking-wider text-[10px]">Reset Successful!</span>
                Your account password has been updated. You can now use your new password to sign in.
              </div>
            </div>
            <Link
              to="/login"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
            >
              <ArrowLeft size={16} />
              Return to Sign In
            </Link>
          </div>
        ) : !otpSent ? (
          /* Request OTP Form */
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email address"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0c0d14] border border-slate-250 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-indigo-500/30 focus:border-blue-500 dark:focus:border-indigo-500 transition-all text-xs disabled:opacity-50 font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Requesting Code...
                </>
              ) : (
                'Request Reset Code'
              )}
            </button>

            <Link
              to="/login"
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 transition-all"
            >
              <ArrowLeft size={15} />
              Cancel & Return
            </Link>
          </form>
        ) : (
          /* OTP verification & Reset password Form */
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="text-center space-y-1.5 pb-2 border-b border-slate-100 dark:border-white/10">
              <span className="text-[10px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest block">Verification Code Sent</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please enter the 6-digit passcode sent to <br />
                <strong className="text-slate-800 dark:text-white font-bold">{email}</strong>
              </p>
            </div>

            {/* 6 inputs */}
            <div className="flex justify-center gap-2 py-2">
              {otpVal.map((data, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  disabled={loading}
                  ref={(el) => { otpInputsRef.current[idx] = el; }}
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  onPaste={handleOtpPaste}
                  className="w-12 h-12 text-center text-lg font-black bg-slate-50 dark:bg-[#0c0d14] border border-slate-250 dark:border-white/10 rounded-xl text-blue-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-indigo-500/30 focus:border-blue-500 dark:focus:border-indigo-500 transition-all font-mono"
                />
              ))}
            </div>

            <div className="flex justify-center mb-4">
              {resendCooldown > 0 ? (
                <span className="text-xs text-slate-500 dark:text-slate-400">Resend code in <strong className="font-mono">{resendCooldown}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="text-xs font-black text-blue-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Resend Verification OTP
                </button>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <KeyRound size={15} />
                </span>
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter a new strong password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0c0d14] border border-slate-250 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-indigo-500/30 focus:border-blue-500 dark:focus:border-indigo-500 transition-all text-xs disabled:opacity-50 font-bold"
                />
              </div>

              {/* Password strength meter */}
              {newPassword && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-455 dark:text-slate-400 uppercase tracking-wider">Strength:</span>
                    <span className={`capitalize ${strengthScore <= 2 ? 'text-red-500' : strengthScore <= 4 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {getStrengthLabel()}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden flex gap-0.5">
                    <div className={`h-full flex-1 transition-colors ${strengthScore >= 1 ? getStrengthColor() : 'bg-slate-200 dark:bg-white/10'}`} />
                    <div className={`h-full flex-1 transition-colors ${strengthScore >= 2 ? getStrengthColor() : 'bg-slate-200 dark:bg-white/10'}`} />
                    <div className={`h-full flex-1 transition-colors ${strengthScore >= 3 ? getStrengthColor() : 'bg-slate-200 dark:bg-white/10'}`} />
                    <div className={`h-full flex-1 transition-colors ${strengthScore >= 4 ? getStrengthColor() : 'bg-slate-200 dark:bg-white/10'}`} />
                    <div className={`h-full flex-1 transition-colors ${strengthScore >= 5 ? getStrengthColor() : 'bg-slate-200 dark:bg-white/10'}`} />
                  </div>

                  {/* Requirements list */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2 text-[10px] text-slate-500 dark:text-slate-400 font-bold border-t border-slate-100 dark:border-white/10">
                    <div className="flex items-center gap-1.5">
                      {rules.length ? <Check size={11} className="text-emerald-500" /> : <X size={11} className="text-slate-400" />}
                      <span>Min 8 characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {rules.uppercase ? <Check size={11} className="text-emerald-500" /> : <X size={11} className="text-slate-400" />}
                      <span>1 uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {rules.lowercase ? <Check size={11} className="text-emerald-500" /> : <X size={11} className="text-slate-400" />}
                      <span>1 lowercase letter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {rules.number ? <Check size={11} className="text-emerald-500" /> : <X size={11} className="text-slate-400" />}
                      <span>1 number digit</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {rules.special ? <Check size={11} className="text-emerald-500" /> : <X size={11} className="text-slate-400" />}
                      <span>1 special symbol</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <KeyRound size={15} />
                </span>
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0c0d14] border border-slate-250 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-455 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-indigo-500/30 focus:border-blue-500 dark:focus:border-indigo-500 transition-all text-xs disabled:opacity-50 font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Save Password & Sign In'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

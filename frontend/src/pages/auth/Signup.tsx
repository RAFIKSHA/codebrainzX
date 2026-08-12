import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { setSEOMetadata } from '../../utils/seo';
import { Mail, KeyRound, User as UserIcon, AlertCircle, Loader2, Check, X, ShieldCheck } from 'lucide-react';
import Logo from '../../components/brand/Logo';

const Signup: React.FC = () => {
  const { sendRegisterOtp, verifyRegisterOtp, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // OTP Verification Stage
  const [otpSent, setOtpSent] = useState(false);
  const [otpVal, setOtpVal] = useState<string[]>(new Array(6).fill(''));
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Password Validation Checklist
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const strengthScore = Object.values(rules).filter(Boolean).length;

  useEffect(() => {
    setSEOMetadata({
      title: 'Sign Up | CodexPetra',
      description: 'Create a free student account on CodexPetra to start learning algorithms, practicing aptitude, and participating in hackathons.',
    });
    // Redirect if already logged in
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Google Sign-up Load GSI
  useEffect(() => {
    const handleGoogleCredentialResponse = async (response: any) => {
      setLoading(true);
      setError(null);
      try {
        await loginWithGoogle(response.credential);
        navigate('/dashboard');
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || "Google registration failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const initializeGoogle = () => {
      if (window.google) {
        const win = window as any;
        if (!win.googleAccountsInitialized) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "153134546344-5vm50570c1sfakftk67pnq8f9do0kli2.apps.googleusercontent.com",
            callback: handleGoogleCredentialResponse,
          });
          win.googleAccountsInitialized = true;
        }
        window.google.accounts.id.renderButton(
          document.getElementById("google-signup-btn"),
          { theme: "outline", size: "large", width: "350", text: "signup_with" }
        );
      }
    };

    if (!document.getElementById("google-gsi-script")) {
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.id = "google-gsi-script";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    } else {
      initializeGoogle();
    }
  }, [loginWithGoogle, navigate]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const getStrengthLabel = () => {
    if (!password) return '';
    if (strengthScore <= 2) return 'Weak';
    if (strengthScore <= 4) return 'Medium';
    return 'Strong & Secure';
  };

  const getStrengthColor = () => {
    if (strengthScore <= 2) return 'bg-red-500';
    if (strengthScore <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  // Stage 1: Send registration OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (strengthScore < 5) {
      setError('Please fulfill all password requirements.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await sendRegisterOtp(email);
      setOtpSent(true);
      setResendCooldown(30);
      setTimeout(() => {
        if (otpInputsRef.current[0]) otpInputsRef.current[0].focus();
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.email?.[0] || 
        'Failed to verify email availability. Please check the email entered.'
      );
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

  // Stage 2: Verify OTP and create account
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpVal.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await verifyRegisterOtp(email, code, fullName, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        'Incorrect or expired passcode. Please verify code or try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-16 bg-slate-50 dark:bg-[#07080c] transition-colors duration-200 min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-8 relative z-10">
        
        {/* Header Block */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo showText={false} iconSize={36} className="mb-3" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            {!otpSent 
              ? 'Start your structured programming path today' 
              : 'Enter verification OTP sent to your email'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/15 border border-red-200/60 dark:border-red-900/40 rounded-xl flex items-start gap-2.5 text-xs text-red-650 dark:text-red-400 font-semibold leading-relaxed">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!otpSent ? (
          /* Step 1: Input details and check email availability */
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <UserIcon size={15} />
                </span>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-955/20 border border-slate-250 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white placeholder-slate-455 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs disabled:opacity-50 font-bold"
                />
              </div>
            </div>

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
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-955/20 border border-slate-250 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white placeholder-slate-455 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs disabled:opacity-50 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <KeyRound size={15} />
                </span>
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-955/20 border border-slate-250 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white placeholder-slate-455 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs disabled:opacity-50 font-bold"
                />
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-455 uppercase tracking-wider">Strength:</span>
                    <span className={`capitalize ${strengthScore <= 2 ? 'text-red-500' : strengthScore <= 4 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {getStrengthLabel()}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden flex gap-0.5">
                    <div className={`h-full flex-1 transition-colors ${strengthScore >= 1 ? getStrengthColor() : 'bg-slate-200 dark:bg-slate-955'}`} />
                    <div className={`h-full flex-1 transition-colors ${strengthScore >= 2 ? getStrengthColor() : 'bg-slate-200 dark:bg-slate-955'}`} />
                    <div className={`h-full flex-1 transition-colors ${strengthScore >= 3 ? getStrengthColor() : 'bg-slate-200 dark:bg-slate-955'}`} />
                    <div className={`h-full flex-1 transition-colors ${strengthScore >= 4 ? getStrengthColor() : 'bg-slate-200 dark:bg-slate-955'}`} />
                    <div className={`h-full flex-1 transition-colors ${strengthScore >= 5 ? getStrengthColor() : 'bg-slate-200 dark:bg-slate-955'}`} />
                  </div>

                  {/* Requirements Checklist */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2 text-[10px] text-slate-500 dark:text-slate-450 font-bold border-t border-slate-100 dark:border-slate-850">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending code...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>
        ) : (
          /* Step 2: Verification Code Input Stage */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center space-y-1 pb-1">
              <span className="inline-block p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                <ShieldCheck size={20} />
              </span>
              <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Verify Passcode</h4>
              <p className="text-xs text-slate-500 leading-normal">
                We have sent a verification code to <br />
                <strong className="text-slate-850 dark:text-slate-350">{email}</strong>
              </p>
            </div>

            {/* OTP code inputs */}
            <div className="flex justify-center gap-2">
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
                  className="w-12 h-12 text-center text-lg font-black bg-slate-50 dark:bg-slate-955/30 border border-slate-250 dark:border-slate-850 rounded-xl text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                />
              ))}
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Verify & Create Account'
                )}
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                {resendCooldown > 0 ? (
                  <span>Resend code in <strong className="font-mono">{resendCooldown}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    className="font-black text-blue-600 dark:text-blue-400 hover:underline cursor-pointer text-xs"
                  >
                    Resend Code
                  </button>
                )}
                <span>&bull;</span>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtpVal(new Array(6).fill('')); setError(null); }}
                  className="font-black text-slate-550 dark:text-slate-400 hover:underline cursor-pointer text-xs"
                >
                  Edit Registration Details
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Google Registration Section */}
        {!otpSent && (
          <div className="space-y-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-slate-150 dark:bg-slate-850"></div>
              <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider font-mono">or continue with</span>
              <div className="flex-1 h-[1px] bg-slate-150 dark:bg-slate-850"></div>
            </div>

            {/* GIS Google button target */}
            <div className="w-full relative flex items-center justify-center min-h-[40px] select-none">
              <div id="google-signup-btn" className="w-full"></div>
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-slate-100 dark:border-slate-850 pt-6 text-center text-xs text-slate-500 font-semibold">
          Already have an account?{' '}
          <Link to="/login" className="font-black text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-wider text-[10px] ml-1">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

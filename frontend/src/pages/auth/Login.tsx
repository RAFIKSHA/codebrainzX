import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { setSEOMetadata } from '../../utils/seo';
import { KeyRound, Mail, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import Logo from '../../components/brand/Logo';

declare global {
  interface Window {
    google?: any;
  }
}

const Login: React.FC = () => {
  const { login, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Redirect handling
  const queryParams = new URLSearchParams(window.location.search);
  const redirectPath = queryParams.get('redirect') || '/dashboard';

  // State Management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load Remembered email
  useEffect(() => {
    setSEOMetadata({
      title: 'Sign In | CodexPetra',
      description: 'Log in to your CodexPetra account to continue solving coding problems, practicing aptitude, and participating in hackathons.',
    });
    
    const savedEmail = localStorage.getItem('remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    if (user) {
      navigate(redirectPath);
    }
  }, [user, navigate, redirectPath]);

  // Google Login Script Load
  useEffect(() => {
    const handleGoogleCredentialResponse = async (response: any) => {
      setLoading(true);
      setError(null);
      try {
        const loggedUser = await loginWithGoogle(response.credential);
        if (loggedUser.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate(redirectPath);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || "Google login failed. Please try again.");
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
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: "350", text: "continue_with" }
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
  }, [loginWithGoogle, navigate, redirectPath]);

  // Submit Password login
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem('remember_email', email);
      } else {
        localStorage.removeItem('remember_email');
      }

      const loggedUser = await login(email, password);
      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(redirectPath);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        'Invalid email or password. Please try again.'
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
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Welcome to CodexPetra</h2>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">Sign in to solve coding problems and track progression</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/15 border border-red-200/60 dark:border-red-900/40 rounded-xl flex items-start gap-2.5 text-xs text-red-650 dark:text-red-400 font-semibold leading-relaxed">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Email & Password Login Form */}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest mb-1.5">
              Email / Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail size={15} />
              </span>
              <input
                type="text"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or username"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-955/20 border border-slate-250 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs disabled:opacity-50 font-bold"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline tracking-tight"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <KeyRound size={15} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-955/20 border border-slate-250 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white placeholder-slate-455 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs disabled:opacity-50 font-bold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-455 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 focus:ring-blue-500 text-blue-600 cursor-pointer"
            />
            <label htmlFor="remember" className="text-xs font-semibold text-slate-550 dark:text-slate-400 cursor-pointer select-none">
              Remember email
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Separator / Social Login Section */}
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-slate-150 dark:bg-slate-850"></div>
            <span className="text-[10px] font-black uppercase text-slate-455 tracking-wider font-mono">or continue with</span>
            <div className="flex-1 h-[1px] bg-slate-150 dark:bg-slate-850"></div>
          </div>

          {/* GIS Google button target */}
          <div className="w-full relative flex items-center justify-center min-h-[40px] select-none">
            <div id="google-signin-btn" className="w-full"></div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 dark:border-slate-850 pt-6 text-center text-xs text-slate-500 font-semibold">
          New to CodexPetra?{' '}
          <Link to="/signup" className="font-black text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-wider text-[10px] ml-1">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

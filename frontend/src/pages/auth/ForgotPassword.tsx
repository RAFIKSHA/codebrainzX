import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { setSEOMetadata } from '../../utils/seo';
import { Mail, CheckCircle, ArrowLeft, CodeXml, Loader2 } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSEOMetadata({
      title: 'Reset Password | CodeBrainzX',
      description: 'Request a password reset link to regain access to your CodeBrainzX account.',
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate sending email API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-16 bg-slate-50 dark:bg-[#090a0f] transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl mb-4">
            <CodeXml size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reset password</h2>
          <p className="text-sm text-slate-500 mt-2">
            {!success ? "We'll send you an email with reset instructions" : "Check your inbox"}
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-start gap-3 text-sm text-emerald-800 dark:text-emerald-400">
              <CheckCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-1">Reset link sent!</span>
                If an account exists for <strong className="text-slate-950 dark:text-white">{email}</strong>, you will receive a password reset link shortly.
              </div>
            </div>
            <Link
              to="/login"
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-850 dark:text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending Link...
                </>
              ) : (
                'Send Reset Instructions'
              )}
            </button>

            <Link
              to="/login"
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850/30 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 transition-all"
            >
              <ArrowLeft size={15} />
              Cancel & Go Back
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

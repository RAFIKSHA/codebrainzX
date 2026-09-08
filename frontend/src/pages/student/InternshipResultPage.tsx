import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Award, CheckCircle2, TrendingUp, Clock, Code, BookOpen, 
  Sparkles, ArrowRight, ShieldCheck, Mail, Phone, Users, 
  ExternalLink, ChevronRight, Check, AlertCircle, Share2
} from 'lucide-react';
import { internshipService, type AttemptResult } from '../../services/internship';
import { setSEOMetadata } from '../../utils/seo';

const InternshipResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSEOMetadata({
      title: 'Assessment Score Card | CodexPetra Internship',
      description: 'Your verified score card and scholarship eligibility result for the CodexPetra Internship Program.'
    });

    const fetchResult = async () => {
      if (!attemptId) return;
      try {
        setLoading(true);
        const data = await internshipService.getAttemptResult(parseInt(attemptId));
        setResult(data);
      } catch (err) {
        console.error('Failed to load assessment result', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-[#080912]">
        <div className="w-10 h-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-400">Loading your score card...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-[#080912]">
        <AlertCircle size={40} className="text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Score Card Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">We were unable to locate your assessment result.</p>
        <Link to="/internships" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Back to Internship Programs
        </Link>
      </div>
    );
  }

  const scorePct = Math.round(result.score_percentage || 0);
  const minutesTaken = Math.round((result.time_spent_seconds || 2400) / 60);

  // SVG Circular Gauge calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scorePct / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080912] text-slate-900 dark:text-slate-100 py-12 md:py-20 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* 1. SCORE CARD HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden"
        >
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Top Label */}
          <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-5 mb-8">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wide">
                Assessment Complete
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                {result.application?.application_id}
              </span>
            </div>

            <span className="text-xs font-bold text-slate-500">
              {result.application?.internship_title}
            </span>
          </div>

          {/* Main Score Indicator Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Circular Gauge on Left */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 text-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    className="text-blue-600 dark:text-blue-500 transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black tracking-tighter text-slate-950 dark:text-white">
                    {scorePct}%
                  </span>
                </div>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-3">
                Overall Assessment Score
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Combined MCQ & Coding Evaluation
              </p>
            </div>

            {/* Metric Cards on Right */}
            <div className="md:col-span-7 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  MCQ Score
                </span>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {result.mcq_score.toFixed(0)} <span className="text-xs font-semibold text-slate-400">/ {result.mcq_max_score.toFixed(0)}</span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
                  Aptitude & Concepts
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Coding Score
                </span>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {result.coding_score.toFixed(0)} <span className="text-xs font-semibold text-slate-400">/ {result.coding_max_score.toFixed(0)}</span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
                  Automated Test Cases
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Questions Correct
                </span>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {result.correct_questions} <span className="text-xs font-semibold text-slate-400">/ {result.total_questions}</span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
                  Accuracy: {Math.round((result.correct_questions / (result.total_questions || 1)) * 100)}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Time Taken
                </span>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {minutesTaken} <span className="text-xs font-semibold text-slate-400">min</span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
                  Of 60 min allocated
                </span>
              </div>
            </div>

          </div>
        </motion.div>

        {/* 2. PERFORMANCE BREAKDOWN BY TOPIC */}
        {Array.isArray(result.topic_breakdown) && result.topic_breakdown.length > 0 && (
          <div className="bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" />
              <span>Domain Performance Breakdown</span>
            </h3>

            <div className="space-y-4">
              {result.topic_breakdown.map((item, tIdx) => (
                <div key={tIdx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-750 dark:text-slate-300">{item.topic}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. SCHOLARSHIP RESULT CARD */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`p-7 sm:p-9 rounded-3xl border shadow-xl relative overflow-hidden ${
            result.is_eligible_for_concession
              ? 'bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-transparent border-purple-300 dark:border-purple-800/80'
              : 'bg-white dark:bg-[#0e101f] border-slate-200 dark:border-slate-800'
          }`}
        >
          {result.is_eligible_for_concession ? (
            <div className="space-y-6 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wide">
                    <Sparkles size={12} />
                    <span>Your Assessment Benefit</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-950 dark:text-white">
                    Congratulations, {result.application?.full_name}!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                    Based on your assessment score of <strong>{scorePct}%</strong>, you have unlocked merit-based fee concession for the {result.application?.internship_title}.
                  </p>
                </div>

                {/* Big Concession Pill */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#0e101f] border border-purple-200 dark:border-purple-800/80 text-center shrink-0 shadow-lg shadow-purple-500/5">
                  <span className="text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {result.concession_percentage.toFixed(0)}%
                  </span>
                  <span className="text-[11px] font-extrabold text-purple-700 dark:text-purple-300 uppercase tracking-tight block mt-0.5">
                    Concession Awarded
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wide">
                Assessment Completed
              </span>
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">
                Assessment Record Updated
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Your current score does not qualify for a scholarship concession under the current criteria. You can still continue with the internship application if you meet the program requirements.
              </p>
            </div>
          )}
        </motion.div>

        {/* 4. FINAL INTERVIEW MESSAGE (THE CRITICAL NEXT STEP) */}
        <div className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-extrabold text-slate-950 dark:text-white tracking-tight">
                Next Steps & Interview Stage
              </h3>
            </div>
            
            {/* Status Pill */}
            <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Application Under Review
            </span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            <p>
              Your assessment has been successfully recorded in the recruitment database.
            </p>
            <p>
              Our engineering review panel will evaluate your full profile and coding testcase submissions. If you are shortlisted for the next stage, <strong>our team will connect with you regarding the technical interview.</strong>
            </p>
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-blue-900 dark:text-blue-200 text-xs font-semibold flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Please keep your registered email ({result.application?.email}) and phone number available for interview communications.</span>
            </div>
          </div>

          {/* Bottom Action CTAs */}
          <div className="pt-4 border-t border-slate-150 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => navigate(`/internships/dashboard?application_id=${result.application?.application_id}`)}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Go to Internship Dashboard</span>
              <ArrowRight size={14} />
            </button>

            <Link
              to="/internships"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Explore Other Internship Programs
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default InternshipResultPage;

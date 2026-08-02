import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Trophy, Clock, AlertTriangle, CheckCircle, XCircle, ArrowLeft
} from 'lucide-react';

interface ResponseDetail {
  id: number;
  question: number;
  question_title: string;
  code: string;
  language_slug: string;
  status: string;
  passed_test_cases: number;
  total_test_cases: number;
}

interface AttemptDetails {
  id: number;
  test_title: string;
  started_at: string;
  completed_at: string;
  status: string;
  score: number;
  max_score: number;
  warnings_count: number;
  time_spent: number;
  responses: ResponseDetail[];
}

const CodingTestResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const attempt = (location.state as { attemptDetails?: AttemptDetails } | null)?.attemptDetails;

  if (!attempt) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900 rounded-2xl text-center text-red-600">
        <AlertTriangle size={36} className="mx-auto mb-3" />
        <h3 className="font-bold text-lg mb-1">Session Data Missing</h3>
        <p className="text-sm mb-4">Could not load the completed attempt summary.</p>
        <button 
          onClick={() => navigate('/dashboard/coding')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const passPercentage = (attempt.score / (attempt.max_score || 1)) * 100;
  const isPassed = passPercentage >= 40.0; // Assume default 40% pass mark

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Back button */}
      <button
        onClick={() => navigate('/dashboard/coding')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </button>

      {/* Main Score Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-8 hover:shadow-md transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-850">
          <div>
            <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest font-mono">
              ASSESSMENT VERDICT
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {attempt.test_title}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Attempt ID: {attempt.id} | Completed at: {new Date(attempt.completed_at).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Score Obtained</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {attempt.score.toFixed(1)} <span className="text-sm font-semibold text-slate-400">/ {attempt.max_score}</span>
              </span>
            </div>
            
            <div className={`px-4 py-2 rounded-2xl border text-xs font-bold ${
              isPassed 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
            }`}>
              {isPassed ? 'PASSED' : 'FAILED'}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850/50 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
            <Trophy className="text-yellow-500" size={24} />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Success Rate</span>
              <span className="text-sm font-bold font-mono">{passPercentage.toFixed(0)}%</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850/50 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
            <Clock className="text-blue-500" size={24} />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Time Spent</span>
              <span className="text-sm font-bold font-mono">{formatDuration(attempt.time_spent)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850/50 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
            <AlertTriangle className="text-red-500" size={24} />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Violations Warnings</span>
              <span className="text-sm font-bold font-mono">{attempt.warnings_count} Warnings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Response details */}
      <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest font-mono mb-4">
        Question Breakdown
      </h3>

      <div className="space-y-4">
        {attempt.responses && attempt.responses.map((resp) => {
          const tcPass = resp.status === 'Accepted';
          return (
            <div 
              key={resp.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {resp.question_title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>Lang: {resp.language_slug || 'n/a'}</span>
                  <span>|</span>
                  <span>Test Cases: {resp.passed_test_cases}/{resp.total_test_cases}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className={`text-xs font-mono font-bold ${
                  tcPass ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {resp.status}
                </span>
                {tcPass ? (
                  <CheckCircle className="text-emerald-500" size={18} />
                ) : (
                  <XCircle className="text-red-500" size={18} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CodingTestResultPage;

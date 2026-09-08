import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Clock, Award, Briefcase, Calendar, 
  ExternalLink, Search, Sparkles, ChevronRight, User, 
  ShieldCheck, AlertCircle, FileText, ArrowRight, Video, 
  HelpCircle, RefreshCw
} from 'lucide-react';
import { internshipService, type InternshipApplication } from '../../services/internship';
import { useAuth } from '../../context/AuthContext';
import { setSEOMetadata } from '../../utils/seo';

const STAGES = [
  { key: 'applied', label: 'Application Submitted', desc: 'Basic details & education verified' },
  { key: 'assessment_completed', label: 'Assessment Completed', desc: 'MCQ + Coding test recorded' },
  { key: 'score_generated', label: 'Score Generated', desc: 'Overall percentage calculated' },
  { key: 'concession_checked', label: 'Concession Checked', desc: 'Scholarship rule matched' },
  { key: 'under_review', label: 'Under Review', desc: 'Engineering panel reviewing profile' },
  { key: 'interview_scheduled', label: 'Interview', desc: 'Technical & hiring discussion' },
  { key: 'selected', label: 'Internship Offer', desc: 'Selected for CodexPetra Internship' }
];

const InternshipStudentDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState(searchParams.get('application_id') || '');
  const [selectedApp, setSelectedApp] = useState<InternshipApplication | null>(null);

  const fetchDashboard = async (codeToFetch?: string) => {
    try {
      setLoading(true);
      const code = codeToFetch !== undefined ? codeToFetch : searchCode;
      const data = await internshipService.getStudentDashboard(code || undefined);
      setApplications(data.applications);
      if (data.applications.length > 0) {
        setSelectedApp(data.applications[0]);
      } else {
        setSelectedApp(null);
      }
    } catch (err) {
      console.error('Failed to load student dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSEOMetadata({
      title: 'Internship Application Dashboard | CodexPetra',
      description: 'Track your CodexPetra Internship recruitment journey, test score, concession status, and interview schedule.'
    });

    fetchDashboard(searchCode);
  }, []);

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      fetchDashboard(searchCode.trim());
    }
  };

  // Helper to determine stage index for the progress timeline
  const getStageIndex = (status: string, hasAttempt: boolean) => {
    if (status === 'selected') return 6;
    if (status === 'interview_scheduled') return 5;
    if (status === 'under_review' || status === 'shortlisted') return 4;
    if (status === 'assessment_completed' || hasAttempt) return 3;
    if (status === 'assessment_pending') return 1;
    return 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020204] text-slate-900 dark:text-slate-100 py-10 md:py-16 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-wide">
              Candidate Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-2">
              Internship Recruitment Journey
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Track your application status, assessment evaluation, and interview schedule in real time.
            </p>
          </div>

          {/* Search by Application ID */}
          <form onSubmit={handleLookupSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search Application ID..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#08090e] border border-slate-200 dark:border-white/10 text-xs font-mono focus:outline-none focus:border-blue-500 w-52 sm:w-64"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              Lookup
            </button>
          </form>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-400">Loading your applications...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <FileText size={28} />
            </div>
            <h3 className="font-extrabold text-lg text-slate-950 dark:text-white">
              No Application Found
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Enter your unique Application ID (e.g. <code>CP-INT-2026-XXXX</code>) above or explore available programs to apply.
            </p>
            <Link
              to="/internships"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition-colors"
            >
              <span>Explore Internship Programs</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Applications List */}
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Your Applications ({applications.length})
              </span>

              <div className="space-y-3">
                {applications.map((app) => {
                  const isSelected = selectedApp?.id === app.id;
                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white dark:bg-[#0e101f] border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-500/20'
                          : 'bg-white/60 dark:bg-[#0e101f]/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                          {app.application_id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          app.status === 'selected'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : app.status === 'interview_scheduled'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : app.status === 'under_review' || app.status === 'shortlisted'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-850 dark:text-slate-300'
                        }`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                        {app.internship_title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Applied on {new Date(app.created_at).toLocaleDateString()}
                      </p>

                      {app.attempt_score !== null && app.attempt_score !== undefined && (
                        <div className="mt-3 pt-3 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-500">Assessment Score:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                            {app.attempt_score}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Active Journey Timeline & Dossier */}
            {selectedApp && (
              <div className="lg:col-span-8 space-y-6">
                
                {/* Application Overview Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-800 pb-5">
                    <div>
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                        {selectedApp.application_id}
                      </span>
                      <h2 className="text-xl font-extrabold text-slate-950 dark:text-white mt-0.5">
                        {selectedApp.internship_title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      {selectedApp.attempt_id && (
                        <button
                          onClick={() => navigate(`/internships/assessment/${selectedApp.attempt_id}/result`)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>View Score Card</span>
                          <ExternalLink size={13} />
                        </button>
                      )}

                      {selectedApp.attempt_status !== 'completed' && (
                        <button
                          onClick={() => navigate(`/internships/assessment/${selectedApp.application_id}/instructions`)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Take Assessment</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Assessment
                      </span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {selectedApp.attempt_score !== null ? `${selectedApp.attempt_score}%` : 'Pending'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Concession
                      </span>
                      <span className="text-sm font-black text-purple-600 dark:text-purple-400">
                        {selectedApp.concession_percentage ? `${selectedApp.concession_percentage}%` : 'Standard'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Current Status
                      </span>
                      <span className="text-xs font-extrabold uppercase text-amber-600 dark:text-amber-400">
                        {selectedApp.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Next Action
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {selectedApp.status === 'interview_scheduled' ? 'Join Interview' : 'Engineering Review'}
                      </span>
                    </div>
                  </div>

                  {/* Interview Schedule Banner if Scheduled */}
                  {selectedApp.interview_date && (
                    <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                          <Calendar size={14} />
                          <span>Technical Interview Scheduled</span>
                        </span>
                        <span className="text-purple-600 dark:text-purple-400 font-mono font-bold">
                          {new Date(selectedApp.interview_date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-purple-700 dark:text-purple-300 text-[11px]">
                        Mode: {selectedApp.interview_mode || 'Google Meet / Video Call'}
                      </p>
                      {selectedApp.interview_link && (
                        <a
                          href={selectedApp.interview_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-purple-700 dark:text-purple-300 hover:underline"
                        >
                          <Video size={12} />
                          <span>Join Meeting Link</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Complete 7-Stage Recruitment Journey Timeline */}
                  <div className="space-y-4 pt-4 border-t border-slate-150 dark:border-slate-800">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      Recruitment Journey Progress
                    </h3>

                    <div className="space-y-3">
                      {STAGES.map((stg, sIdx) => {
                        const currentStageIdx = getStageIndex(selectedApp.status, !!selectedApp.attempt_id);
                        const isDone = sIdx < currentStageIdx;
                        const isCurrent = sIdx === currentStageIdx;
                        const isUpcoming = sIdx > currentStageIdx;

                        return (
                          <div 
                            key={stg.key}
                            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                              isCurrent
                                ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 shadow-sm'
                                : isDone
                                ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                                : 'bg-transparent border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                isDone
                                  ? 'bg-emerald-600 text-white'
                                  : isCurrent
                                  ? 'bg-blue-600 text-white animate-pulse'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {isDone ? '✓' : sIdx + 1}
                              </div>
                              <div>
                                <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">
                                  {stg.label}
                                </h5>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {stg.desc}
                                </p>
                              </div>
                            </div>

                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                              isDone
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                                : isCurrent
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : 'text-slate-400'
                            }`}>
                              {isDone ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default InternshipStudentDashboard;

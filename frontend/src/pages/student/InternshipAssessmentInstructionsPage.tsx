import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, Code, FileText, Award, ShieldAlert, 
  CheckCircle2, AlertTriangle, Play, HelpCircle, X, Loader2,
  ChevronRight, ShieldCheck, Terminal, AlertCircle, Check, 
  MessageCircle, Info, Laptop, Eye
} from 'lucide-react';
import { 
  internshipService, 
  type InternshipApplication, 
  type AttemptEngineState 
} from '../../services/internship';
import { setSEOMetadata } from '../../utils/seo';

const InternshipAssessmentInstructionsPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  const [app, setApp] = useState<InternshipApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setSEOMetadata({
      title: 'Assessment Briefing & Rules | CodexPetra Career Portal',
      description: 'Review rules and instructions before starting your CodexPetra Internship entrance and scholarship assessment.',
      noindex: true,
    });

    const fetchApp = async () => {
      if (!applicationId) return;
      try {
        setLoading(true);
        const data = await internshipService.getApplicationByCode(applicationId);
        setApp(data);
      } catch (err) {
        console.error('Failed to load application details', err);
        setErrorMsg('Application could not be found.');
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [applicationId]);

  const handleStartAssessment = async () => {
    if (!applicationId) return;
    try {
      setStarting(true);
      setErrorMsg(null);
      const attemptState = await internshipService.startAssessment(applicationId);
      navigate(`/internships/assessment/${attemptState.id}/engine`);
    } catch (err: any) {
      console.error('Failed to start assessment', err);
      const msg = err.response?.data?.error || 'Unable to launch assessment engine. Please try again.';
      setErrorMsg(msg);
      setShowModal(false);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-[#070913]">
        <div className="w-10 h-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading assessment briefing...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#070913] text-slate-900 dark:text-slate-100 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Breadcrumb Ribbon */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div className="space-y-1">
            <Link
              to={`/internships/application/${applicationId}/confirmation`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors mb-1"
            >
              <ArrowLeft size={14} />
              <span>Back to Confirmation</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Stage 2: Entrance Assessment
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Examination Guidelines
              </span>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-[#0e1222] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                ✓
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Application
              </span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                2
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                Assessment
              </span>
            </div>
            <ChevronRight size={14} className="text-slate-400 hidden sm:inline" />
            <div className="items-center gap-2 opacity-50 hidden sm:flex">
              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Offer
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Full-Page Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Candidate & Assessment Details */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Candidate & Program Summary */}
            <div className="bg-white dark:bg-[#0e1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-wider">
                {app?.internship_title || 'CodexPetra Internship'}
              </span>

              <div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Candidate Profile
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {app?.full_name || 'Candidate'}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ID: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{applicationId}</span>
                </span>
              </div>

              {/* Assessment Specs Mini-list */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Total Duration</span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <Clock size={13} className="text-blue-600" />
                    <span>30 Minutes</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Total Questions</span>
                  <span className="font-bold text-slate-900 dark:text-white">30 MCQs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Total Marks</span>
                  <span className="font-bold text-slate-900 dark:text-white">30 Marks (1/Q)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Passing Benchmark</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">50% Minimum</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Max Scholarship</span>
                  <span className="font-black text-purple-600 dark:text-purple-400">75% Concession</span>
                </div>
              </div>
            </div>

            {/* Proctoring & Integrity Notice */}
            <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <ShieldAlert size={16} className="shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Automated Proctoring Active
                </span>
              </div>
              <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                The assessment is continuously monitored for tab switches, window resizing, and background tool execution. Please keep focus on the active exam window.
              </p>
            </div>

            {/* Direct Support */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <span>Technical issues during test?</span>
              </div>
              <a
                href="https://wa.me/919999999999?text=Hi%20CodexPetra,%20I%20am%20facing%20an%20issue%20in%20the%20Internship%20Assessment"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
              >
                <MessageCircle size={14} />
                <span>Help Desk</span>
              </a>
            </div>

          </div>

          {/* Right Column: Full Briefing, Guidelines & Launch */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-white dark:bg-[#0e1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm space-y-8">
              
              {/* Header */}
              <div className="border-b border-slate-150 dark:border-slate-800/80 pb-6">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                  Assessment Structure & Guidelines
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Please review the complete test structure and examination protocol carefully before launching the assessment engine.
                </p>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Structure Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    <FileText size={15} />
                    <span>SDLC, Agile & Architecture</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    15 Core Concept Questions
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Evaluates requirement analysis, agile sprints, Git branching, merge conflicts, REST API methods, and microservice flows.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    <Code size={15} />
                    <span>Databases, Security & Scenarios</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    15 Practical Engineering Scenarios
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Evaluates SQL filtering, table normalization, auth tokens, password security, load testing, caching, and bug reproduction.
                  </p>
                </div>
              </div>

              {/* Guidelines List */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
                  <span>Important Instructions & Rules</span>
                </h3>

                <div className="space-y-2.5">
                  {[
                    'The assessment timer of 60 minutes starts immediately upon clicking Launch and cannot be paused.',
                    'You may switch freely between questions using the question navigator palette.',
                    'Coding problems can be tested against sample inputs before final submission.',
                    'Your progress and answers are saved automatically in real time.',
                    'Ensure a stable internet connection and quiet environment throughout the session.',
                  ].map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Launch CTA */}
              <div className="pt-4 border-t border-slate-150 dark:border-slate-800/80">
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-black text-sm sm:text-base shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Play size={18} fill="currentColor" />
                  <span>Launch Assessment Engine</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Confirmation Launch Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#0e1222] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <Clock size={28} />
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">
                  Launch Skill Assessment?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Once started, the <strong>60-minute countdown timer</strong> will run continuously. Ensure you are ready before proceeding.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={starting}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartAssessment}
                  disabled={starting}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {starting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Initializing...</span>
                    </>
                  ) : (
                    <span>I am Ready, Start</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default InternshipAssessmentInstructionsPage;

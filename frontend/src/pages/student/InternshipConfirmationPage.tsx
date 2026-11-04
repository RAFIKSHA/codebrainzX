import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, ArrowRight, ShieldCheck, FileText, 
  Calendar, Code, Clock, Award, HelpCircle, ExternalLink,
  ChevronRight, Copy, Check, User, Mail, Sparkles,
  MessageCircle, Phone, ArrowLeft, BookOpen, Layers
} from 'lucide-react';
import { internshipService, type InternshipApplication } from '../../services/internship';
import { setSEOMetadata } from '../../utils/seo';

const InternshipConfirmationPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  
  const [app, setApp] = useState<InternshipApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSEOMetadata({
      title: 'Application Submitted | CodexPetra Career Portal',
      description: 'Your application for the CodexPetra Internship Program has been received. Proceed to the entrance assessment.',
      noindex: true,
    });

    const fetchApp = async () => {
      if (!applicationId) return;
      try {
        setLoading(true);
        const data = await internshipService.getApplicationByCode(applicationId);
        setApp(data);
      } catch (err) {
        console.error('Failed to load application confirmation', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [applicationId]);

  const copyAppId = () => {
    if (applicationId) {
      navigator.clipboard.writeText(applicationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-[#070913]">
        <div className="w-10 h-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verifying application record...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#070913] text-slate-900 dark:text-slate-100 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Stepper */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div className="space-y-1">
            <Link
              to="/internships"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors mb-1"
            >
              <ArrowLeft size={14} />
              <span>Back to All Programs</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>Application Registered</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Stage 1 of 3 Complete
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

        {/* 2-Column Full-Page Inline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Application Receipt & Status */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Success Receipt Card */}
            <div className="bg-white dark:bg-[#0e1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <CheckCircle2 size={26} strokeWidth={2.3} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950 dark:text-white">
                    Application Verified
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your candidate record is actively registered.
                  </p>
                </div>
              </div>

              {/* Receipt Details Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Application ID
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                      {applicationId}
                    </span>
                    <button
                      onClick={copyAppId}
                      className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                      title="Copy Application ID"
                    >
                      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Candidate Name
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {app?.full_name || 'Candidate'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Program Track
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {app?.internship_title || 'CodexPetra Internship'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Current Status
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-[11px] font-extrabold uppercase tracking-wide">
                    Assessment Ready
                  </span>
                </div>
              </div>

              {/* Support info */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <MessageCircle size={15} className="text-emerald-500 shrink-0" />
                  <span>Queries regarding test schedule?</span>
                </div>
                <a
                  href="https://wa.me/917028352298?text=Hi%20CodexPetra,%20I%20have%20submitted%20my%20application"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
                >
                  WhatsApp Support →
                </a>
              </div>

            </div>

          </div>

          {/* Right Column: Assessment Gateway & Action */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white dark:bg-[#0e1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
              
              <div>
                <span className="px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-wider">
                  Mandatory Next Step
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight mt-3">
                  Online Entrance Assessment
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Your skill assessment evaluates your foundational problem solving and core programming logic. High performance grants merit scholarship concessions and unlocks fast-tracked cohort admission.
                </p>
              </div>

              {/* Assessment Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Format</span>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">30 MCQs</div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Full Stack Tech</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Questions</span>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">30 Questions</div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">1 Mark Each</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">30 Minutes</div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Timer Starts on Launch</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scholarship</span>
                  <div className="text-sm font-black text-purple-600 dark:text-purple-400 mt-0.5">Up to 75%</div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Merit Concession</span>
                </div>
              </div>

              {/* Scholarship Tiers Matrix */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/60 via-purple-50/60 to-indigo-50/60 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-indigo-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Award size={15} className="text-purple-600 dark:text-purple-400" />
                  <span>Merit Scholarship Benchmarks</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white/80 dark:bg-[#070913]/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="font-extrabold text-purple-600 dark:text-purple-400">85%+ Score</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">75% Fee Concession</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/80 dark:bg-[#070913]/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">70% – 84% Score</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">50% Fee Concession</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/80 dark:bg-[#070913]/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">50% – 69% Score</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">25% Fee Concession</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                <button
                  onClick={() => navigate(`/internships/assessment/${applicationId}/instructions`)}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-black text-sm sm:text-base shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <span>Proceed to Assessment Instructions</span>
                  <ArrowRight size={18} />
                </button>

                <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1">
                  <Link
                    to={`/internships/dashboard?application_id=${applicationId}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    View Application in Student Dashboard
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default InternshipConfirmationPage;

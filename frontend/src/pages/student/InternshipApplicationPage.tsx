import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, CheckCircle, Shield, Sparkles, Building2, 
  GraduationCap, Code2, Globe, Link2, 
  AlertCircle, ChevronRight, User, Mail, Phone, MapPin, 
  BookOpen, Layers, CheckSquare, Loader2, MessageCircle, 
  Award, ShieldCheck, Clock, FileText, CheckCircle2, Lock,
  Copy, Check, RefreshCw, ExternalLink, AlertTriangle
} from 'lucide-react';
import { internshipService, type InternshipProgram, type ApplicationFormData, type InternshipApplication } from '../../services/internship';
import { useAuth } from '../../context/AuthContext';
import { setSEOMetadata } from '../../utils/seo';

const InternshipApplicationPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [program, setProgram] = useState<InternshipProgram | null>(null);
  const [existingApp, setExistingApp] = useState<InternshipApplication | null>(null);
  const [showFreshForm, setShowFreshForm] = useState(false);
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<ApplicationFormData>({
    full_name: user?.username ? (user.username === 'student' ? 'Aarav Sharma' : user.username) : '',
    email: user?.email || '',
    phone: '',
    city: '',
    college: '',
    course: '',
    year_of_study: '3rd Year',
    primary_skill: '',
    programming_experience: 'Intermediate (1–2 years)',
    preferred_technology: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
    agreement_accepted: true,
  });

  useEffect(() => {
    setSEOMetadata({
      title: 'Apply for Internship | CodexPetra Career Portal',
      description: 'Submit your application for the CodexPetra Internship Program and qualify for skill assessment and scholarship opportunities.',
      noindex: true,
    });

    const loadData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setErrorMsg(null);
        let programData: InternshipProgram | null = null;
        try {
          programData = await internshipService.getProgramBySlug(slug);
        } catch (slugErr) {
          // If direct slug lookup fails, fetch all published programs and match
          try {
            const allPrograms = await internshipService.getPrograms();
            if (allPrograms && allPrograms.length > 0) {
              const matched = allPrograms.find(p => 
                p.slug.toLowerCase().includes(slug.toLowerCase().split('-')[0]) ||
                slug.toLowerCase().includes(p.slug.toLowerCase().split('-')[0]) ||
                p.title.toLowerCase().includes(slug.toLowerCase().split('-')[0])
              ) || allPrograms[0];
              programData = matched;
            }
          } catch (listErr) {
            console.error('Fallback program list lookup failed', listErr);
          }
        }

        if (!programData) {
          // Robust fallback mock if backend is empty
          programData = {
            id: 1,
            title: slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') + ' Internship',
            slug: slug,
            badge: 'CODEXPETRA INTERNSHIP 2026',
            subtitle: 'Learn → Build → Prove',
            description: 'Hands-on practical development experience with modern engineering standards, real projects and mentorship.',
            duration: '8 Weeks',
            mode: 'online',
            program_type: 'Skill-Based Internship',
            stipend_info: 'Performance-Based',
            who_can_apply: ['College students & graduates', 'Beginner to intermediate developers'],
            skills_covered: ['Python', 'Web Development', 'Databases', 'APIs'],
            highlights: [
              { number: '01', title: 'Skill Assessment', description: 'Entrance & merit scholarship evaluation.' },
              { number: '02', title: 'Mentorship', description: 'Guidance from senior engineers.' }
            ],
            certificate_info: 'Program Completion Based',
            mentorship_info: 'Available with Engineers',
            interview_info: 'Shortlisted Candidates',
            is_published: true,
            status: 'open',
            display_order: 1,
            applications_count: 0,
            created_at: new Date().toISOString()
          };
        }

        setProgram(programData);

        if (programData.skills_covered && programData.skills_covered.length > 0 && !formData.primary_skill) {
          setFormData(prev => ({
            ...prev,
            primary_skill: programData.skills_covered[0],
            preferred_technology: programData.skills_covered.slice(0, 3).join(', ')
          }));
        }

        // Check if current user or email already applied
        const emailToCheck = user?.email || '';
        if (programData.slug) {
          try {
            const checkRes = await internshipService.getMyApplicationForProgram(programData.slug, emailToCheck);
            if (checkRes.has_applied && checkRes.application) {
              setExistingApp(checkRes.application);
            }
          } catch (checkErr) {
            // Unauthenticated or check skipped
          }
        }

      } catch (err: any) {
        console.error('Error fetching program details', err);
        setErrorMsg('Failed to load internship program details.');
      } finally {
        setLoading(false);
      }
    };


    loadData();
  }, [slug, user]);

  const copyAppId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;

    if (!formData.full_name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.city.trim()) {
      setErrorMsg('Please complete all required personal information fields.');
      return;
    }

    if (!formData.college.trim() || !formData.course.trim() || !formData.primary_skill.trim()) {
      setErrorMsg('Please complete all required education and technical skill fields.');
      return;
    }

    if (!formData.agreement_accepted) {
      setErrorMsg('Please confirm that the provided information is accurate.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      const res = await internshipService.applyForProgram(slug, formData);
      
      // If already applied, display the active application card
      if (res.message && res.message.toLowerCase().includes('already exists')) {
        setExistingApp(res.application);
        setShowFreshForm(false);
        return;
      }

      const appId = res.application.application_id;
      navigate(`/internships/application/${appId}/confirmation`);
    } catch (err: any) {
      console.error('Application submission failed', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to submit application. Please verify your details.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-[#070913]">
        <div className="w-10 h-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading application portal...</span>
      </div>
    );
  }

  // Determine application status label & badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selected':
        return { label: 'Selected / Offer Extended', color: 'bg-emerald-500 text-white' };
      case 'shortlisted':
        return { label: 'Shortlisted & Approved', color: 'bg-blue-600 text-white' };
      case 'interview_scheduled':
        return { label: 'Interview Scheduled', color: 'bg-purple-600 text-white' };
      case 'assessment_completed':
      case 'under_review':
        return { label: 'Assessment Completed • Under Review', color: 'bg-indigo-600 text-white' };
      case 'assessment_pending':
      case 'applied':
      default:
        return { label: 'Application Active • Assessment Ready', color: 'bg-amber-500 text-slate-950 font-black' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#070913] text-slate-900 dark:text-slate-100 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Portal Header & Progress Ribbon */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div className="space-y-1">
            <Link
              to="/internships"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors mb-1"
            >
              <ArrowLeft size={14} />
              <span>Back to All Internship Programs</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Official Career Portal
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Cohort 2026 Admissions
              </span>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-[#0e1222] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shadow-xs ${
                existingApp ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {existingApp ? '✓' : '1'}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Application
              </span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
                existingApp && existingApp.attempt_status === 'completed'
                  ? 'bg-emerald-600 text-white'
                  : existingApp
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {existingApp && existingApp.attempt_status === 'completed' ? '✓' : '2'}
              </span>
              <span className={`text-xs ${
                existingApp ? 'font-bold text-blue-600 dark:text-blue-400' : 'font-semibold text-slate-600 dark:text-slate-400 opacity-60'
              }`}>
                Assessment
              </span>
            </div>
            <ChevronRight size={14} className="text-slate-400 hidden sm:inline" />
            <div className="items-center gap-2 hidden sm:flex">
              <span className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
                existingApp && ['selected', 'shortlisted'].includes(existingApp.status)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 opacity-60'
              }`}>
                3
              </span>
              <span className={`text-xs ${
                existingApp && ['selected', 'shortlisted'].includes(existingApp.status)
                  ? 'font-bold text-emerald-600 dark:text-emerald-400'
                  : 'font-semibold text-slate-600 dark:text-slate-400 opacity-60'
              }`}>
                Offer
              </span>
            </div>
          </div>
        </div>

        {/* Full-Page 2-Column Inline Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Sticky Brand & Program Sidebar) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Program Profile Box */}
            <div className="bg-white dark:bg-[#0e1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-wider">
                  {program?.badge || 'INTERNSHIP 2026'}
                </span>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                  {program?.mode || 'Remote'}
                </span>
              </div>

              <h2 className="text-xl font-black text-slate-950 dark:text-white leading-snug">
                {program?.title || 'Software Engineering Internship'}
              </h2>
              
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {program?.description || 'Hands-on production engineering internship with 1-on-1 mentorship, live projects, and placement assistance.'}
              </p>

              {/* Scholarship Highlight Banner */}
              <div className="mt-5 p-3.5 rounded-xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-200/60 dark:border-purple-800/40 flex items-center gap-3">
                <Award size={20} className="text-purple-600 dark:text-purple-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                    Merit Scholarship
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Up to 75% Concession based on test score
                  </div>
                </div>
              </div>

              {/* Skills tags */}
              {program?.skills_covered && program.skills_covered.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                    Core Tech Stack
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {program.skills_covered.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Selection Process Roadmap */}
            <div className="bg-white dark:bg-[#0e1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock size={14} className="text-blue-600 dark:text-blue-400" />
                <span>Admissions Process</span>
              </h3>

              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {[
                  { step: '01', title: 'Submit Profile', desc: 'Fill your educational and technical background', active: !existingApp },
                  { step: '02', title: 'Skill Assessment', desc: '30-Question Entrance Assessment (30 Mins)', active: !!existingApp && existingApp.attempt_status !== 'completed' },
                  { step: '03', title: 'Merit Score Card', desc: 'Instant evaluation & scholarship grant', active: !!existingApp && existingApp.attempt_status === 'completed' },
                  { step: '04', title: 'Offer Letter', desc: 'Cohort onboarding & mentor pairing', active: !!existingApp && ['shortlisted', 'selected'].includes(existingApp.status) },
                ].map((item, idx) => (
                  <div key={idx} className="relative flex items-start gap-3.5 pl-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 z-10 ${
                      item.active 
                        ? 'bg-blue-600 text-white shadow-xs ring-4 ring-blue-100 dark:ring-blue-950' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {item.step}
                    </span>
                    <div>
                      <div className={`text-xs font-bold ${item.active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Coordinator Support / WhatsApp Widget */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                  Admissions Support Desk
                </span>
              </div>
              <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed">
                Have questions regarding eligibility, test syllabus, or stipend structure?
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href="https://wa.me/919999999999?text=Hi%20CodexPetra%20Team,%20I%20have%20a%20question%20regarding%20the%20Internship%20Application"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <MessageCircle size={14} />
                  <span>Chat on WhatsApp</span>
                </a>
                <a
                  href="tel:+918001234567"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:border-slate-300 transition-colors"
                >
                  <Phone size={13} />
                  <span>Call Coordinator</span>
                </a>
              </div>
            </div>

            {/* SSL & Privacy Trust Badge */}
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              <Lock size={12} />
              <span>256-Bit SSL Encrypted Official Application</span>
            </div>

          </div>

          {/* Right Column: Dynamic View (Active Application Portal vs Registration Form) */}
          <div className="lg:col-span-8">
            
            {/* --- VIEW 1: ALREADY APPLIED / APPLICATION ACTIVE PORTAL --- */}
            {existingApp && !showFreshForm ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#0e1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm space-y-6"
              >
                {/* Header with Status Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-800/80 pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Active Application Found
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                      Application Status Portal
                    </h1>
                  </div>

                  <div className="shrink-0">
                    {(() => {
                      const badge = getStatusBadge(existingApp.status);
                      return (
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide inline-block shadow-xs ${badge.color}`}>
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Application Record Details Box */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Application ID
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                        {existingApp.application_id}
                      </span>
                      <button
                        onClick={() => copyAppId(existingApp.application_id)}
                        className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                        title="Copy ID"
                      >
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold">Candidate Name</span>
                      <span className="font-bold text-slate-900 dark:text-white">{existingApp.full_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold">Registered Email</span>
                      <span className="font-bold text-slate-900 dark:text-white">{existingApp.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold">College / University</span>
                      <span className="font-bold text-slate-900 dark:text-white">{existingApp.college}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold">Course & Year</span>
                      <span className="font-bold text-slate-900 dark:text-white">{existingApp.course} ({existingApp.year_of_study})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold">Primary Focus Skill</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{existingApp.primary_skill}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px] font-semibold">Applied Program</span>
                      <span className="font-bold text-slate-900 dark:text-white">{existingApp.internship_title}</span>
                    </div>
                  </div>
                </div>

                {/* Assessment Status & Direct Gateway Action Card */}
                {existingApp.attempt_status === 'completed' ? (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-blue-50/70 to-purple-50/70 dark:from-emerald-950/20 dark:via-blue-950/20 dark:to-purple-950/20 border border-emerald-200/70 dark:border-emerald-800/50 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm">
                        <CheckCircle2 size={18} />
                        <span>Entrance Assessment Completed</span>
                      </div>
                      {existingApp.attempt_score !== null && (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-black text-xs">
                          Score: {existingApp.attempt_score}%
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                      Your assessment evaluation has been completed and verified. Your performance metrics are recorded for recruitment and scholarship allocation.
                    </p>

                    {existingApp.concession_percentage ? (
                      <div className="p-3 rounded-xl bg-white/80 dark:bg-[#070913]/60 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                          Scholarship Concession Awarded
                        </span>
                        <span className="text-xs font-black text-purple-600 dark:text-purple-400 font-mono">
                          {existingApp.concession_percentage}% Fee Concession
                        </span>
                      </div>
                    ) : null}

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      {existingApp.attempt_id && (
                        <button
                          onClick={() => navigate(`/internships/assessment/${existingApp.attempt_id}/result`)}
                          className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Award size={15} />
                          <span>View Verified Score Card</span>
                        </button>
                      )}
                      <Link
                        to={`/internships/dashboard?application_id=${existingApp.application_id}`}
                        className="py-3.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Student Dashboard</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/70 to-purple-50/70 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border border-blue-200/70 dark:border-blue-800/50 space-y-4">
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-extrabold text-sm">
                      <Sparkles size={18} />
                      <span>Next Step: Skill Assessment (30 MCQs • 30 Mins)</span>
                    </div>

                    <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                      Your application is active and approved for examination. You can start your 30-minute entrance assessment whenever you are ready.
                    </p>

                    <button
                      onClick={() => navigate(`/internships/assessment/${existingApp.application_id}/instructions`)}
                      className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-black text-sm sm:text-base shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <span>Proceed to Entrance Assessment (30 MCQs)</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                )}

                {/* Option to fill fresh form */}
                <div className="pt-4 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Need to submit for another applicant?</span>
                  <button
                    type="button"
                    onClick={() => setShowFreshForm(true)}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Open Fresh Application Form →
                  </button>
                </div>

              </motion.div>
            ) : (

              /* --- VIEW 2: FULL INLINE REGISTRATION FORM --- */
              <div className="bg-white dark:bg-[#0e1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm">
                
                {/* Form Header */}
                <div className="border-b border-slate-150 dark:border-slate-800/80 pb-6 mb-8">
                  {existingApp && (
                    <div className="mb-3 flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs">
                      <span className="font-bold text-amber-800 dark:text-amber-300">
                        You have an existing application ({existingApp.application_id}).
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowFreshForm(false)}
                        className="font-black text-amber-900 dark:text-amber-200 underline cursor-pointer"
                      >
                        View My Application
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                    <FileText size={14} />
                    <span>Candidate Registration</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                    Internship Application Form
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Please provide your accurate educational and technical profile. Your details will be registered for the entrance assessment and merit scholarship review.
                  </p>
                </div>

                {/* Error Message */}
                {errorMsg && (
                  <div className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-3">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Main Application Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* 1. PERSONAL INFORMATION */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
                        1
                      </span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        Personal & Contact Information
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Aarav Sharma"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="e.g. aarav.sharma@example.com"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Phone Number (WhatsApp Preferred) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="e.g. +91 98765 43210"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Current City / Location <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Bengaluru, Pune, Delhi, Mumbai"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. ACADEMIC BACKGROUND */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold flex items-center justify-center">
                        2
                      </span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        Academic Background & College
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          College / University Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="text"
                            name="college"
                            value={formData.college}
                            onChange={handleChange}
                            required
                            placeholder="e.g. National Institute of Technology / RV College / Mumbai University"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Degree / Branch of Study <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <GraduationCap size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="text"
                            name="course"
                            value={formData.course}
                            onChange={handleChange}
                            required
                            placeholder="e.g. B.Tech Computer Science / BCA / MCA"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Current Year of Study <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="year_of_study"
                          value={formData.year_of_study}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all font-medium"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year (Final Year)</option>
                          <option value="Graduate / Alum">Recent Graduate / Alumnus</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 3. TECHNICAL INFORMATION */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="w-5 h-5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-xs font-extrabold flex items-center justify-center">
                        3
                      </span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        Technical Skills & Focus Track
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Primary Programming Language / Skill <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Code2 size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="text"
                            name="primary_skill"
                            value={formData.primary_skill}
                            onChange={handleChange}
                            required
                            placeholder="e.g. JavaScript, Python, React, Java, C++"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-purple-400 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Hands-on Coding Experience
                        </label>
                        <select
                          name="programming_experience"
                          value={formData.programming_experience}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-purple-400 transition-all font-medium"
                        >
                          <option value="Beginner (< 1 year)">Beginner (&lt; 1 year coursework)</option>
                          <option value="Intermediate (1–2 years)">Intermediate (1–2 years project practice)</option>
                          <option value="Advanced (2+ years)">Advanced (2+ years full-stack / competitive)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Preferred Stacks & Frameworks
                        </label>
                        <input
                          type="text"
                          name="preferred_technology"
                          value={formData.preferred_technology}
                          onChange={handleChange}
                          placeholder="e.g. MERN (MongoDB, Express, React, Node.js), Next.js, Django, PostgreSQL"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-purple-400 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. ONLINE PROFILES & PORTFOLIO */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center justify-center">
                          4
                        </span>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                          Online Profiles & Portfolios (Optional)
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hidden sm:inline">
                        Boosts direct shortlisting
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-650 dark:text-slate-350 mb-1.5">
                          GitHub Profile
                        </label>
                        <div className="relative">
                          <Link2 size={14} className="absolute left-3.5 top-3 text-slate-400" />
                          <input
                            type="url"
                            name="github_url"
                            value={formData.github_url}
                            onChange={handleChange}
                            placeholder="https://github.com/..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-650 dark:text-slate-350 mb-1.5">
                          LinkedIn Profile
                        </label>
                        <div className="relative">
                          <Globe size={14} className="absolute left-3.5 top-3 text-slate-400" />
                          <input
                            type="url"
                            name="linkedin_url"
                            value={formData.linkedin_url}
                            onChange={handleChange}
                            placeholder="https://linkedin.com/in/..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-650 dark:text-slate-350 mb-1.5">
                          Portfolio / Project Link
                        </label>
                        <div className="relative">
                          <Globe size={14} className="absolute left-3.5 top-3 text-slate-400" />
                          <input
                            type="url"
                            name="portfolio_url"
                            value={formData.portfolio_url}
                            onChange={handleChange}
                            placeholder="https://yourportfolio.me"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. DECLARATION & TERMS */}
                  <div className="pt-4 border-t border-slate-150 dark:border-slate-800/80">
                    <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 cursor-pointer select-none hover:bg-slate-100/70 dark:hover:bg-slate-900 transition-colors">
                      <input
                        type="checkbox"
                        name="agreement_accepted"
                        checked={formData.agreement_accepted}
                        onChange={handleChange}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-900 cursor-pointer"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        I hereby certify that all information submitted in this application is accurate. I agree to undertake the structured entrance assessment independently under the examination code of conduct.
                      </span>
                    </label>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-black text-sm sm:text-base shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Validating & Registering Application...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Application & Proceed to Assessment</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-3 text-center">
                      <Sparkles size={13} className="text-amber-500" />
                      <span>Instant eligibility confirmation. Assessment link generated immediately upon submission.</span>
                    </div>
                  </div>

                </form>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default InternshipApplicationPage;

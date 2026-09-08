import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Plus, Edit3, Trash2, CheckCircle2, ShieldAlert, 
  Search, Filter, ChevronRight, Users, Code, Award, 
  Calendar, Layers, Check, X, AlertCircle, TrendingUp, 
  BarChart, Sparkles, Clock, Globe, Briefcase, FileText, 
  Send, ExternalLink, Video, Eye, ShieldCheck, CheckSquare, BookOpen,
  Settings, ChevronDown, ChevronUp, Loader2, RefreshCw, HelpCircle, CheckCheck
} from 'lucide-react';
import { 
  internshipService, 
  type InternshipProgram, 
  type ScholarshipRule, 
  type InternshipApplication, 
  type InternshipAdminAnalytics 
} from '../../services/internship';
import { setSEOMetadata } from '../../utils/seo';

type AdminTab = 'programs' | 'assessments' | 'scholarships' | 'applications' | 'pipeline' | 'analytics';

const InternshipAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('programs');
  
  // Data States
  const [programs, setPrograms] = useState<InternshipProgram[]>([]);
  const [scholarshipRules, setScholarshipRules] = useState<ScholarshipRule[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [analytics, setAnalytics] = useState<InternshipAdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchAppQuery, setSearchAppQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProgram, setFilterProgram] = useState<string>('all');

  // Modal States
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Partial<InternshipProgram> | null>(null);

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<ScholarshipRule> | null>(null);

  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [candidateNotes, setCandidateNotes] = useState('');

  // Assessment Question Selector & Config States
  const [showQuestionSelectorModal, setShowQuestionSelectorModal] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | null>(null);
  const [selectorType, setSelectorType] = useState<'coding' | 'mcq'>('coding');
  const [availableCodingBank, setAvailableCodingBank] = useState<any[]>([]);
  const [availableMCQBank, setAvailableMCQBank] = useState<any[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [bankTopicFilter, setBankTopicFilter] = useState<string>('all');
  const [bankLevelFilter, setBankLevelFilter] = useState<string>('all');
  const [bankFilters, setBankFilters] = useState<{
    coding_topics: { id: number; name: string }[];
    coding_levels: { id: number; name: string }[];
    mcq_topics: { id: number; name: string }[];
    difficulties: { id: string; name: string }[];
  } | null>(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [unlinkingKey, setUnlinkingKey] = useState<string | null>(null);
  const [expandedProgramAssessment, setExpandedProgramAssessment] = useState<Record<number, 'mcq' | 'coding' | null>>({});

  const [showAssessmentConfigModal, setShowAssessmentConfigModal] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<{
    id?: number;
    programId?: number;
    programTitle?: string;
    title: string;
    duration_minutes: number;
    total_marks: number;
    passing_percentage: number;
    instructions: string;
    is_published: boolean;
  } | null>(null);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [progs, rules, apps, stats] = await Promise.all([
        internshipService.getPrograms(),
        internshipService.adminGetScholarshipRules(),
        internshipService.adminGetApplications(),
        internshipService.adminGetAnalytics()
      ]);
      setPrograms(progs);
      setScholarshipRules(rules);
      setApplications(apps);
      setAnalytics(stats);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSEOMetadata({
      title: 'Internship Recruitment Hub | Admin Portal',
      description: 'Manage CodexPetra internship programs, entrance assessments, scholarship rule engine, and candidate recruitment funnel.'
    });

    loadAllData();
  }, []);

  // --- Program Modal Handlers ---
  const handleOpenCreateProgram = () => {
    setEditingProgram({
      title: '',
      slug: '',
      badge: 'CODEXPETRA INTERNSHIP 2026',
      subtitle: 'Learn → Build → Prove',
      description: '',
      duration: '8 Weeks',
      mode: 'online',
      program_type: 'Skill-Based Internship',
      stipend_info: 'Performance-Based',
      who_can_apply: ['College students', 'Fresh graduates'],
      skills_covered: ['Python', 'React', 'DSA'],
      certificate_info: 'Program Completion Based',
      mentorship_info: 'Available with Senior Engineers',
      is_published: true,
      status: 'open'
    });
    setShowProgramModal(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram || !editingProgram.title) return;
    try {
      await internshipService.adminSaveProgram(editingProgram);
      setShowProgramModal(false);
      loadAllData();
    } catch (err) {
      console.error('Failed to save program', err);
      alert('Failed to save internship program.');
    }
  };

  // --- Scholarship Rule Engine Handlers ---
  const handleOpenCreateRule = () => {
    setEditingRule({
      title: 'Merit Tier',
      min_score: 80.0,
      max_score: 89.9,
      concession_percentage: 50.0,
      badge_label: '50% Concession',
      description: 'High merit performance',
      is_active: true,
      order: scholarshipRules.length + 1
    });
    setShowRuleModal(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule || editingRule.min_score === undefined || editingRule.max_score === undefined) return;

    // Validate score ranges
    if (editingRule.min_score < 0 || editingRule.max_score > 100 || editingRule.min_score > editingRule.max_score) {
      alert('Invalid score range. Min score must be <= Max score, between 0 and 100.');
      return;
    }

    try {
      await internshipService.adminSaveScholarshipRule(editingRule);
      setShowRuleModal(false);
      loadAllData();
    } catch (err) {
      console.error('Failed to save scholarship rule', err);
      alert('Failed to save scholarship rule.');
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm('Are you sure you want to delete this scholarship rule?')) return;
    try {
      await internshipService.adminDeleteScholarshipRule(id);
      loadAllData();
    } catch (err) {
      console.error('Failed to delete rule', err);
    }
  };

  // --- Question Bank Selector Handlers ---
  const handleOpenQuestionSelector = async (assessmentId: number, type: 'coding' | 'mcq') => {
    setSelectedAssessmentId(assessmentId);
    setSelectorType(type);
    setBankSearchQuery('');
    setBankTopicFilter('all');
    setBankLevelFilter('all');
    setBankLoading(true);
    setShowQuestionSelectorModal(true);

    try {
      // Load filters if not cached
      if (!bankFilters) {
        const filters = await internshipService.adminGetQuestionBankFilters();
        setBankFilters(filters);
      }

      const currentProg = programs.find(p => p.assessment?.id === assessmentId);

      if (type === 'coding') {
        const data = await internshipService.adminGetQuestionBankCoding();
        setAvailableCodingBank(data);
        const preselected = currentProg?.assessment?.coding_question_ids || 
                            currentProg?.assessment?.coding_questions_list?.map(q => q.id) || [];
        setSelectedQuestionIds(preselected);
      } else {
        const data = await internshipService.adminGetQuestionBankMCQ();
        setAvailableMCQBank(data);
        const preselected = currentProg?.assessment?.mcq_question_ids || 
                            currentProg?.assessment?.mcq_questions_list?.map(q => q.id) || [];
        setSelectedQuestionIds(preselected);
      }
    } catch (err) {
      console.error('Failed to load question bank data', err);
    } finally {
      setBankLoading(false);
    }
  };

  const handleRefreshBankQuestions = async (type: 'coding' | 'mcq', search: string, topic: string, levelOrDiff: string) => {
    try {
      setBankLoading(true);
      if (type === 'coding') {
        const params: any = {};
        if (search) params.search = search;
        if (topic !== 'all') params.topic = topic;
        if (levelOrDiff !== 'all') params.level = levelOrDiff;
        const data = await internshipService.adminGetQuestionBankCoding(params);
        setAvailableCodingBank(data);
      } else {
        const params: any = {};
        if (search) params.search = search;
        if (topic !== 'all') params.topic = topic;
        if (levelOrDiff !== 'all') params.difficulty = levelOrDiff;
        const data = await internshipService.adminGetQuestionBankMCQ(params);
        setAvailableMCQBank(data);
      }
    } catch (err) {
      console.error('Failed to filter question bank', err);
    } finally {
      setBankLoading(false);
    }
  };

  const handleSelectAllFiltered = () => {
    const list = selectorType === 'coding' ? availableCodingBank : availableMCQBank;
    const allFilteredIds = list.map(q => q.id);
    setSelectedQuestionIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
  };

  const handleDeselectAllFiltered = () => {
    const list = selectorType === 'coding' ? availableCodingBank : availableMCQBank;
    const allFilteredIds = new Set(list.map(q => q.id));
    setSelectedQuestionIds(prev => prev.filter(id => !allFilteredIds.has(id)));
  };

  const handleSaveSelectedQuestions = async () => {
    if (!selectedAssessmentId) return;
    try {
      setSavingQuestions(true);
      if (selectorType === 'coding') {
        await internshipService.adminSelectCodingQuestions(selectedAssessmentId, selectedQuestionIds);
      } else {
        await internshipService.adminSelectMCQQuestions(selectedAssessmentId, selectedQuestionIds);
      }
      setShowQuestionSelectorModal(false);
      await loadAllData();
    } catch (err) {
      console.error('Failed to update assessment questions', err);
      alert('Failed to update questions.');
    } finally {
      setSavingQuestions(false);
    }
  };

  const handleUnlinkQuestion = async (assessmentId: number, type: 'coding' | 'mcq', questionId: number) => {
    if (!confirm(`Are you sure you want to unlink this ${type === 'coding' ? 'coding problem' : 'MCQ'} from the assessment?`)) return;
    const key = `${assessmentId}-${type}-${questionId}`;
    try {
      setUnlinkingKey(key);
      await internshipService.adminUnlinkQuestion(assessmentId, type, questionId);
      await loadAllData();
    } catch (err) {
      console.error('Failed to unlink question', err);
      alert('Failed to unlink question.');
    } finally {
      setUnlinkingKey(null);
    }
  };

  // --- Assessment Configuration Modal Handlers ---
  const handleOpenEditAssessment = (prog: InternshipProgram) => {
    if (prog.assessment) {
      setEditingAssessment({
        id: prog.assessment.id,
        programId: prog.id,
        programTitle: prog.title,
        title: prog.assessment.title || `${prog.title} Assessment`,
        duration_minutes: prog.assessment.duration_minutes || 60,
        total_marks: prog.assessment.total_marks || 100,
        passing_percentage: prog.assessment.passing_percentage || 40.0,
        instructions: prog.assessment.instructions || '- Complete the assessment within allotted time.\n- Evaluation is automatic.',
        is_published: prog.assessment.is_published ?? true
      });
    } else {
      setEditingAssessment({
        programId: prog.id,
        programTitle: prog.title,
        title: `${prog.title} Entrance Assessment`,
        duration_minutes: 60,
        total_marks: 100,
        passing_percentage: 40.0,
        instructions: '- Complete the assessment within allotted time.\n- Maintain full screen examination environment.',
        is_published: true
      });
    }
    setShowAssessmentConfigModal(true);
  };

  const handleSaveAssessmentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssessment) return;
    try {
      if (editingAssessment.id) {
        await internshipService.adminSaveAssessment(editingAssessment.id, {
          title: editingAssessment.title,
          duration_minutes: editingAssessment.duration_minutes,
          total_marks: editingAssessment.total_marks,
          passing_percentage: editingAssessment.passing_percentage,
          instructions: editingAssessment.instructions,
          is_published: editingAssessment.is_published
        });
      } else if (editingAssessment.programId) {
        await internshipService.adminCreateAssessment({
          internship: editingAssessment.programId,
          title: editingAssessment.title,
          duration_minutes: editingAssessment.duration_minutes,
          total_marks: editingAssessment.total_marks,
          passing_percentage: editingAssessment.passing_percentage,
          instructions: editingAssessment.instructions,
          is_published: editingAssessment.is_published
        });
      }
      setShowAssessmentConfigModal(false);
      await loadAllData();
    } catch (err) {
      console.error('Failed to save assessment configuration', err);
      alert('Failed to save assessment settings.');
    }
  };

  // --- Candidate Dossier Handlers ---
  const handleOpenCandidate = async (appId: number) => {
    try {
      const detail = await internshipService.adminGetApplicationDetail(appId);
      setSelectedCandidate(detail);
      setCandidateNotes(detail.admin_notes || '');
      setShowCandidateModal(true);
    } catch (err) {
      console.error('Failed to fetch candidate dossier', err);
    }
  };

  const handleUpdateCandidateStage = async (newStatus: string) => {
    if (!selectedCandidate) return;
    try {
      await internshipService.adminUpdateStage(selectedCandidate.id, {
        status: newStatus,
        admin_notes: candidateNotes
      });
      setSelectedCandidate({ ...selectedCandidate, status: newStatus, admin_notes: candidateNotes });
      loadAllData();
    } catch (err) {
      console.error('Failed to update candidate status', err);
    }
  };

  // Filtered Applications Table Data
  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchAppQuery || 
      app.full_name.toLowerCase().includes(searchAppQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchAppQuery.toLowerCase()) ||
      app.application_id.toLowerCase().includes(searchAppQuery.toLowerCase()) ||
      app.college.toLowerCase().includes(searchAppQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesProgram = filterProgram === 'all' || String(app.internship) === filterProgram;

    return matchesSearch && matchesStatus && matchesProgram;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07080f] text-slate-900 dark:text-slate-100 pb-20 transition-colors">
      
      {/* Top Admin Header */}
      <div className="bg-white dark:bg-[#0b0c16] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
                <span>Internship Management Suite</span>
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase">
                  Admin
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Programs • Question Selector • Scholarship Rules • Recruitment Pipeline
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreateProgram}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Create Program</span>
            </button>
            <button
              onClick={handleOpenCreateRule}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Add Scholarship Tier</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-100 dark:border-slate-800/80 pt-2 text-xs font-bold">
          {[
            { id: 'programs', label: 'Programs', icon: BookOpen },
            { id: 'assessments', label: 'Assessment Config', icon: Code },
            { id: 'scholarships', label: 'Scholarship Rule Engine', icon: Sparkles },
            { id: 'applications', label: `Applications (${applications.length})`, icon: FileText },
            { id: 'pipeline', label: 'Kanban Pipeline', icon: Layers },
            { id: 'analytics', label: 'Analytics', icon: BarChart },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        
        {/* TAB 1: PROGRAMS MANAGEMENT */}
        {activeTab === 'programs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Internship Programs ({programs.length})
                </h2>
                <p className="text-xs text-slate-500">Configure tracks, duration, requirements, and publishing status.</p>
              </div>
              <button
                onClick={handleOpenCreateProgram}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Plus size={13} />
                <span>New Program</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {programs.map(p => (
                <div key={p.id} className="p-6 rounded-3xl bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        p.is_published ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.is_published ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                        {p.duration}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-950 dark:text-white">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {p.description}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-1">
                      {p.skills_covered?.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      {p.applications_count} Candidates
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          await internshipService.adminTogglePublishProgram(p.slug);
                          loadAllData();
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        {p.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingProgram(p);
                          setShowProgramModal(true);
                        }}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer"
                      >
                        <Edit3 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ASSESSMENT BUILDER & QUESTION SELECTOR */}
        {activeTab === 'assessments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">
                    Entrance Assessment Configuration
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase">
                    Live Data Link
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Link existing coding problems from the database question bank and aptitude MCQs without duplicating data.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadAllData()}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Reload all assessments"
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {programs.map(p => {
                const assessment = p.assessment;
                const expanded = expandedProgramAssessment[p.id] || null;

                if (!assessment) {
                  return (
                    <div key={p.id} className="p-6 rounded-3xl bg-white dark:bg-[#0e101f] border border-dashed border-slate-300 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{p.slug}</span>
                        <h3 className="font-extrabold text-base text-slate-950 dark:text-white mt-0.5">
                          {p.title}
                        </h3>
                        <p className="text-xs text-slate-400">No assessment currently configured for this program track.</p>
                      </div>
                      <button
                        onClick={() => handleOpenEditAssessment(p)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Plus size={14} />
                        <span>Initialize Entrance Assessment</span>
                      </button>
                    </div>
                  );
                }

                const mcqList = assessment.mcq_questions_list || [];
                const codingList = assessment.coding_questions_list || [];
                const totalMarks = assessment.total_marks || 100;
                const durationMins = assessment.duration_minutes || 60;
                const passingPct = assessment.passing_percentage || 40.0;

                return (
                  <div key={p.id} className="rounded-3xl bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
                    
                    {/* Program & Assessment Header */}
                    <div className="p-6 border-b border-slate-150 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                              {p.slug}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              assessment.is_published 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            }`}>
                              {assessment.is_published ? 'Live / Published' : 'Draft / Unlisted'}
                            </span>
                          </div>
                          
                          <h3 className="font-black text-lg text-slate-950 dark:text-white">
                            {assessment.title || `${p.title} Assessment`}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Track: <strong className="text-slate-700 dark:text-slate-300">{p.title}</strong> ({p.duration})
                          </p>
                        </div>

                        {/* Summary Metrics & Actions */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-2 bg-white dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                            <Clock size={13} className="text-blue-500" />
                            <span>{durationMins} Mins</span>
                          </div>

                          <div className="flex items-center gap-2 bg-white dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                            <Award size={13} className="text-purple-500" />
                            <span>{totalMarks} Marks</span>
                          </div>

                          <div className="flex items-center gap-2 bg-white dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                            <ShieldCheck size={13} className="text-emerald-500" />
                            <span>Pass: {passingPct}%</span>
                          </div>

                          <button
                            onClick={() => handleOpenEditAssessment(p)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Edit Assessment Settings"
                          >
                            <Settings size={15} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Question Bank Linker Action Row */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* MCQ Section Card */}
                      <div className={`p-5 rounded-2xl border transition-all ${
                        expanded === 'mcq'
                          ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800/80 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
                              <BookOpen size={16} />
                            </div>
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                                Aptitude & Concept MCQs
                              </h4>
                              <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                                {assessment.mcq_count || mcqList.length} Questions Linked
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenQuestionSelector(assessment.id, 'mcq')}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>Link MCQs</span>
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                          Single/Multiple choice questions linked directly from Aptitude & Core Engineering question bank.
                        </p>

                        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setExpandedProgramAssessment(prev => ({
                              ...prev,
                              [p.id]: prev[p.id] === 'mcq' ? null : 'mcq'
                            }))}
                            className="text-xs font-extrabold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>{expanded === 'mcq' ? 'Hide Linked MCQs' : `View / Manage Linked (${assessment.mcq_count || mcqList.length})`}</span>
                            {expanded === 'mcq' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>

                          <span className="text-[10px] font-semibold text-slate-400">
                            Evaluated automatically
                          </span>
                        </div>
                      </div>

                      {/* Coding Section Card */}
                      <div className={`p-5 rounded-2xl border transition-all ${
                        expanded === 'coding'
                          ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800/80 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
                              <Code size={16} />
                            </div>
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                                Coding Problems
                              </h4>
                              <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                                {assessment.coding_count || codingList.length} Problems Linked
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenQuestionSelector(assessment.id, 'coding')}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>Link Problems</span>
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                          Algorithmic coding problems linked directly with Judge0 automated testcase execution.
                        </p>

                        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setExpandedProgramAssessment(prev => ({
                              ...prev,
                              [p.id]: prev[p.id] === 'coding' ? null : 'coding'
                            }))}
                            className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>{expanded === 'coding' ? 'Hide Linked Problems' : `View / Manage Linked (${assessment.coding_count || codingList.length})`}</span>
                            {expanded === 'coding' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>

                          <span className="text-[10px] font-semibold text-slate-400">
                            Multi-language runtime
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Expandable Inline Linked Questions Accordion */}
                    <AnimatePresence>
                      {expanded === 'mcq' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-6 pb-6 pt-2 border-t border-slate-150 dark:border-slate-800"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                              Linked Aptitude & Concept MCQs ({mcqList.length})
                            </span>
                            <button
                              onClick={() => handleOpenQuestionSelector(assessment.id, 'mcq')}
                              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                            >
                              + Add More MCQs
                            </button>
                          </div>

                          {mcqList.length === 0 ? (
                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 text-center text-xs text-slate-400">
                              No MCQs currently linked to this assessment. Click <strong>"Link MCQs"</strong> above to select from question bank.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {mcqList.map((mcq, idx) => {
                                const isUnlinking = unlinkingKey === `${assessment.id}-mcq-${mcq.id}`;
                                return (
                                  <div
                                    key={mcq.id}
                                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121424] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2.5"
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 font-mono">
                                          #{idx + 1}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                                            {mcq.marks || 1}M
                                          </span>
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                            {mcq.difficulty || 'Medium'}
                                          </span>
                                        </div>
                                      </div>

                                      <h5 className="font-extrabold text-xs text-slate-950 dark:text-white line-clamp-2">
                                        {mcq.title || mcq.statement}
                                      </h5>
                                      {mcq.topic && (
                                        <span className="text-[10px] text-slate-400 block truncate">
                                          {mcq.topic}
                                        </span>
                                      )}
                                    </div>

                                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-end">
                                      <button
                                        onClick={() => handleUnlinkQuestion(assessment.id, 'mcq', mcq.id)}
                                        disabled={isUnlinking}
                                        className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                      >
                                        <Trash2 size={12} />
                                        <span>{isUnlinking ? 'Unlinking...' : 'Unlink'}</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {expanded === 'coding' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-6 pb-6 pt-2 border-t border-slate-150 dark:border-slate-800"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                              Linked Coding Problems ({codingList.length})
                            </span>
                            <button
                              onClick={() => handleOpenQuestionSelector(assessment.id, 'coding')}
                              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                              + Add More Coding Problems
                            </button>
                          </div>

                          {codingList.length === 0 ? (
                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 text-center text-xs text-slate-400">
                              No coding problems currently linked to this assessment. Click <strong>"Link Problems"</strong> above to select from question bank.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {codingList.map((cq, idx) => {
                                const isUnlinking = unlinkingKey === `${assessment.id}-coding-${cq.id}`;
                                return (
                                  <div
                                    key={cq.id}
                                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121424] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2.5"
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 font-mono">
                                          #{idx + 1}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                            {cq.level || 'Easy'}
                                          </span>
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                            {cq.test_cases_count || 0} Testcases
                                          </span>
                                        </div>
                                      </div>

                                      <h5 className="font-extrabold text-xs text-slate-950 dark:text-white line-clamp-2">
                                        {cq.title}
                                      </h5>
                                      {cq.topic && (
                                        <span className="text-[10px] text-slate-400 block truncate">
                                          {cq.topic}
                                        </span>
                                      )}
                                    </div>

                                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-end">
                                      <button
                                        onClick={() => handleUnlinkQuestion(assessment.id, 'coding', cq.id)}
                                        disabled={isUnlinking}
                                        className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                      >
                                        <Trash2 size={12} />
                                        <span>{isUnlinking ? 'Unlinking...' : 'Unlink'}</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SCHOLARSHIP RULE ENGINE */}
        {activeTab === 'scholarships' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Visual Scholarship Rule Engine
                </h2>
                <p className="text-xs text-slate-500">
                  Configurable score ranges and fee concession percentages. Dynamically updates the student ladder and result evaluation.
                </p>
              </div>
              <button
                onClick={handleOpenCreateRule}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Score Tier</span>
              </button>
            </div>

            <div className="bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6">Score Range</th>
                      <th className="py-3.5 px-6">Concession %</th>
                      <th className="py-3.5 px-6">Tier Title</th>
                      <th className="py-3.5 px-6">Scope</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                    {scholarshipRules.map(rule => (
                      <tr key={rule.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-sm text-slate-900 dark:text-white">
                          {rule.min_score.toFixed(0)}% – {rule.max_score.toFixed(0)}%
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-xs">
                            {rule.concession_percentage.toFixed(0)}% Concession
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">
                          {rule.title || rule.badge_label}
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {rule.internship ? 'Track Specific' : 'Global (All Programs)'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            rule.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {rule.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingRule(rule);
                              setShowRuleModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-850"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: APPLICATIONS MANAGEMENT TABLE */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            
            {/* Header & Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Candidate Applications ({filteredApplications.length})
                </h2>
                <p className="text-xs text-slate-500">Review assessment scores, fee concessions, and update hiring stage.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchAppQuery}
                    onChange={(e) => setSearchAppQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-blue-500 w-48"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">All Stages</option>
                  <option value="applied">Applied</option>
                  <option value="assessment_pending">Assessment Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="selected">Selected</option>
                </select>
              </div>
            </div>

            {/* Candidate Table */}
            <div className="bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6">App ID</th>
                      <th className="py-3.5 px-6">Student</th>
                      <th className="py-3.5 px-6">Track</th>
                      <th className="py-3.5 px-6 text-center">Score</th>
                      <th className="py-3.5 px-6 text-center">Concession</th>
                      <th className="py-3.5 px-6">Stage</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                    {filteredApplications.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                          {app.application_id}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-extrabold text-slate-950 dark:text-white">
                            {app.full_name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {app.email} • {app.college}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                          {app.internship_title}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {app.attempt_score !== null ? (
                            <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                              {app.attempt_score}%
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Pending</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {app.concession_percentage ? (
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-[11px]">
                              {app.concession_percentage}%
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">0%</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            app.status === 'selected'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : app.status === 'interview_scheduled'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : app.status === 'under_review' || app.status === 'shortlisted'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400'
                          }`}>
                            {app.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleOpenCandidate(app.id)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-sm cursor-pointer"
                          >
                            Dossier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: KANBAN RECRUITMENT PIPELINE */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Kanban Recruitment Funnel
              </h2>
              <p className="text-xs text-slate-500">
                Visual stage progression from initial submission to final internship selection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 overflow-x-auto pb-4">
              {[
                { stage: 'applied', label: 'APPLIED', color: 'border-slate-300 dark:border-slate-800' },
                { stage: 'assessment_pending', label: 'ASSESSMENT', color: 'border-blue-300 dark:border-blue-800' },
                { stage: 'under_review', label: 'UNDER REVIEW', color: 'border-amber-300 dark:border-amber-800' },
                { stage: 'shortlisted', label: 'SHORTLISTED', color: 'border-indigo-300 dark:border-indigo-800' },
                { stage: 'interview_scheduled', label: 'INTERVIEW', color: 'border-purple-300 dark:border-purple-800' },
                { stage: 'selected', label: 'SELECTED', color: 'border-emerald-300 dark:border-emerald-800' },
              ].map(col => {
                const candidatesInStage = applications.filter(a => a.status === col.stage);

                return (
                  <div key={col.stage} className="bg-slate-100/70 dark:bg-[#0c0e1a] rounded-3xl p-3.5 flex flex-col space-y-3 min-w-[200px]">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        {col.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-mono text-[10px] font-bold">
                        {candidatesInStage.length}
                      </span>
                    </div>

                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[550px]">
                      {candidatesInStage.map(cand => (
                        <div
                          key={cand.id}
                          onClick={() => handleOpenCandidate(cand.id)}
                          className="p-3.5 rounded-2xl bg-white dark:bg-[#121424] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow hover:border-blue-400 transition-all cursor-pointer space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                              {cand.application_id}
                            </span>
                            {cand.attempt_score !== null && (
                              <span className="font-mono font-black text-xs text-slate-900 dark:text-white">
                                {cand.attempt_score}%
                              </span>
                            )}
                          </div>

                          <h5 className="font-extrabold text-xs text-slate-950 dark:text-white leading-tight">
                            {cand.full_name}
                          </h5>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {cand.college}
                          </p>

                          {cand.concession_percentage ? (
                            <span className="inline-block px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold">
                              {cand.concession_percentage}% Concession
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: ANALYTICS */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Internship Funnel & Score Analytics
              </h2>
              <p className="text-xs text-slate-500">Live recruitment conversion metrics and score distributions.</p>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {[
                { label: 'Total Applications', val: analytics.total_applications, icon: FileText, color: 'text-blue-500' },
                { label: 'Assessments Taken', val: analytics.assessments_completed, icon: Code, color: 'text-indigo-500' },
                { label: 'Average Score', val: `${analytics.average_score}%`, icon: TrendingUp, color: 'text-emerald-500' },
                { label: 'Shortlisted', val: analytics.shortlisted, icon: Award, color: 'text-amber-500' },
                { label: 'Interviews', val: analytics.interviews, icon: Video, color: 'text-purple-500' },
                { label: 'Selected', val: analytics.selected, icon: CheckCircle2, color: 'text-cyan-500' },
              ].map((stat, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 text-center">
                  <stat.icon size={18} className={`${stat.color} mx-auto mb-2`} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {stat.label}
                  </span>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {stat.val}
                  </div>
                </div>
              ))}
            </div>

            {/* Concession Tier Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">
                  Scholarship Concession Distribution
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.concession_distribution).map(([tier, count], idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700 dark:text-slate-300">{tier}</span>
                        <span className="font-mono text-purple-600 dark:text-purple-400">{count} Candidates</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600"
                          style={{ width: `${Math.min(100, (count / Math.max(1, analytics.assessments_completed)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">
                  Recruitment Funnel Conversion
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.funnel).map(([stg, count], idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700 dark:text-slate-300">{stg}</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400">{count}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-600"
                          style={{ width: `${Math.min(100, (count / Math.max(1, analytics.total_applications)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- CANDIDATE DOSSIER MODAL --- */}
      <AnimatePresence>
        {showCandidateModal && selectedCandidate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    {selectedCandidate.application_id}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-950 dark:text-white mt-0.5">
                    {selectedCandidate.full_name}
                  </h3>
                </div>
                <button
                  onClick={() => setShowCandidateModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Personal & Academic Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="text-slate-400 block text-[10px]">Email</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCandidate.email}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="text-slate-400 block text-[10px]">Phone</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCandidate.phone}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="text-slate-400 block text-[10px]">College</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCandidate.college}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="text-slate-400 block text-[10px]">Course & Year</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCandidate.course} ({selectedCandidate.year_of_study})</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="text-slate-400 block text-[10px]">Primary Skill</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCandidate.primary_skill}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <span className="text-slate-400 block text-[10px]">Track</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCandidate.internship_title}</span>
                </div>
              </div>

              {/* Assessment Score Summary */}
              {selectedCandidate.attempt && (
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 space-y-2">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                    Assessment Performance Summary
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Overall Score</span>
                      <span className="font-black text-sm text-blue-600 dark:text-blue-400">{selectedCandidate.attempt.score_percentage}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">MCQ Score</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCandidate.attempt.mcq_score} / {selectedCandidate.attempt.mcq_max_score}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Coding Score</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCandidate.attempt.coding_score} / {selectedCandidate.attempt.coding_max_score}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Concession</span>
                      <span className="font-black text-sm text-purple-600 dark:text-purple-400">{selectedCandidate.attempt.concession_percentage}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Internal Notes & Stage Updater */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Internal Review Notes
                </label>
                <textarea
                  value={candidateNotes}
                  onChange={(e) => setCandidateNotes(e.target.value)}
                  placeholder="Add evaluation comments, interview feedback, or review observations..."
                  className="w-full h-20 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Quick Stage Transition Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-150 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-semibold">Change Candidate Stage:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateCandidateStage('shortlisted')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleUpdateCandidateStage('interview_scheduled')}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Schedule Interview
                  </button>
                  <button
                    onClick={() => handleUpdateCandidateStage('selected')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Select for Internship
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ADVANCED QUESTION BANK SELECTOR MODAL --- */}
      <AnimatePresence>
        {showQuestionSelectorModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8 max-h-[88vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
                      Database Question Bank Linker
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-950 dark:text-white">
                    Link {selectorType === 'coding' ? 'Coding Problems' : 'Aptitude & Concept MCQs'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Links to active database questions without duplicating data. Changes apply to the entrance assessment immediately.
                  </p>
                </div>
                <button
                  onClick={() => setShowQuestionSelectorModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Multi-Field Filter & Search Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
                {/* Search Input */}
                <div className="sm:col-span-5 relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by title or topic..."
                    value={bankSearchQuery}
                    onChange={(e) => {
                      setBankSearchQuery(e.target.value);
                      handleRefreshBankQuestions(selectorType, e.target.value, bankTopicFilter, bankLevelFilter);
                    }}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Topic Filter Dropdown */}
                <div className="sm:col-span-4">
                  <select
                    value={bankTopicFilter}
                    onChange={(e) => {
                      setBankTopicFilter(e.target.value);
                      handleRefreshBankQuestions(selectorType, bankSearchQuery, e.target.value, bankLevelFilter);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Topics / Tracks</option>
                    {selectorType === 'coding' ? (
                      bankFilters?.coding_topics.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))
                    ) : (
                      bankFilters?.mcq_topics.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))
                    )}
                  </select>
                </div>

                {/* Level / Difficulty Filter */}
                <div className="sm:col-span-3">
                  <select
                    value={bankLevelFilter}
                    onChange={(e) => {
                      setBankLevelFilter(e.target.value);
                      handleRefreshBankQuestions(selectorType, bankSearchQuery, bankTopicFilter, e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Difficulties</option>
                    {selectorType === 'coding' ? (
                      bankFilters?.coding_levels.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))
                    ) : (
                      bankFilters?.difficulties.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Selection Summary & Batch Actions Ribbon */}
              <div className="flex items-center justify-between px-1 py-1 text-xs border-b border-slate-150 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-black text-[11px]">
                    {selectedQuestionIds.length} Selected
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    (Showing {(selectorType === 'coding' ? availableCodingBank : availableMCQBank).length} available)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <CheckCheck size={13} />
                    <span>Select All Filtered</span>
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllFiltered}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:underline cursor-pointer"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Questions Scrollable List with Checkboxes */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[300px] max-h-[420px]">
                {bankLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 size={24} className="animate-spin text-blue-500" />
                    <span className="text-xs">Loading questions from platform repository...</span>
                  </div>
                ) : (selectorType === 'coding' ? availableCodingBank : availableMCQBank).length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No questions found matching your filter criteria. Try adjusting the search or topic filter.
                  </div>
                ) : (
                  (selectorType === 'coding' ? availableCodingBank : availableMCQBank).map(q => {
                    const isChecked = selectedQuestionIds.includes(q.id);

                    return (
                      <div
                        key={q.id}
                        onClick={() => {
                          setSelectedQuestionIds(prev => 
                            isChecked ? prev.filter(id => id !== q.id) : [...prev, q.id]
                          );
                        }}
                        className={`p-3.5 rounded-2xl border flex items-start justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                            : 'bg-white dark:bg-[#0b0c16] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0 pr-3">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs font-bold mt-0.5 shrink-0 ${
                            isChecked 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                          }`}>
                            {isChecked && <Check size={13} />}
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-extrabold text-xs text-slate-950 dark:text-white leading-snug">
                                {q.title}
                              </h5>
                            </div>

                            {q.statement && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                {q.statement}
                              </p>
                            )}

                            <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                              {q.topic && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                                  {q.topic}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                                (q.level || q.difficulty) === 'Easy' || (q.level || q.difficulty) === 'easy'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : (q.level || q.difficulty) === 'Hard' || (q.level || q.difficulty) === 'hard'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              }`}>
                                {q.level || q.difficulty || 'Medium'}
                              </span>

                              {selectorType === 'coding' ? (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {q.test_cases_count || 0} Testcases
                                </span>
                              ) : (
                                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-bold">
                                  {q.marks || 1} Mark
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className={`text-[11px] font-bold ${isChecked ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                            {isChecked ? 'Linked' : '+ Link'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sticky Footer */}
              <div className="pt-4 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400">Total Selected: </span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {selectedQuestionIds.length} {selectorType === 'coding' ? 'Problems' : 'MCQs'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuestionSelectorModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSelectedQuestions}
                    disabled={savingQuestions}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {savingQuestions ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Saving Linkage...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Save Linked Questions ({selectedQuestionIds.length})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ASSESSMENT PARAMETERS CONFIG MODAL --- */}
      <AnimatePresence>
        {showAssessmentConfigModal && editingAssessment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-950 dark:text-white">
                    {editingAssessment.id ? 'Configure Assessment Parameters' : 'Create Entrance Assessment'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingAssessment.programTitle}
                  </p>
                </div>
                <button onClick={() => setShowAssessmentConfigModal(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveAssessmentConfig} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assessment Title</label>
                  <input
                    type="text"
                    value={editingAssessment.title || ''}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, title: e.target.value })}
                    required
                    placeholder="e.g. CodexPetra Full Stack Assessment"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      min="5"
                      max="360"
                      value={editingAssessment.duration_minutes || 60}
                      onChange={(e) => setEditingAssessment({ ...editingAssessment, duration_minutes: parseInt(e.target.value) || 60 })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Total Marks</label>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={editingAssessment.total_marks || 100}
                      onChange={(e) => setEditingAssessment({ ...editingAssessment, total_marks: parseInt(e.target.value) || 100 })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pass %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={editingAssessment.passing_percentage || 40.0}
                      onChange={(e) => setEditingAssessment({ ...editingAssessment, passing_percentage: parseFloat(e.target.value) || 40.0 })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none font-mono text-emerald-600 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Proctoring Instructions</label>
                  <textarea
                    rows={4}
                    value={editingAssessment.instructions || ''}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, instructions: e.target.value })}
                    placeholder="Enter instructions for candidates..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none font-sans"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_published_assessment"
                    checked={editingAssessment.is_published}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, is_published: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <label htmlFor="is_published_assessment" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Publish Assessment (Active for candidate test attempts)
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-150 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAssessmentConfigModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer"
                  >
                    Save Assessment Settings
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- SCHOLARSHIP RULE CREATE/EDIT MODAL --- */}
      <AnimatePresence>
        {showRuleModal && editingRule && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-slate-950 dark:text-white">
                  {editingRule.id ? 'Edit Scholarship Tier' : 'Add Scholarship Tier'}
                </h3>
                <button onClick={() => setShowRuleModal(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tier Title</label>
                  <input
                    type="text"
                    value={editingRule.title || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Min Score %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={editingRule.min_score || 0}
                      onChange={(e) => setEditingRule({ ...editingRule, min_score: parseFloat(e.target.value) })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Max Score %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={editingRule.max_score || 100}
                      onChange={(e) => setEditingRule({ ...editingRule, max_score: parseFloat(e.target.value) })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Concession Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingRule.concession_percentage || 0}
                    onChange={(e) => setEditingRule({ ...editingRule, concession_percentage: parseFloat(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none font-mono text-purple-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Badge Description</label>
                  <input
                    type="text"
                    value={editingRule.description || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-150 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRuleModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md cursor-pointer"
                  >
                    Save Tier
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PROGRAM CREATE/EDIT MODAL --- */}
      <AnimatePresence>
        {showProgramModal && editingProgram && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-slate-950 dark:text-white">
                  {editingProgram.id ? 'Edit Internship Program' : 'Create Internship Program'}
                </h3>
                <button onClick={() => setShowProgramModal(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveProgram} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Program Title</label>
                  <input
                    type="text"
                    value={editingProgram.title || ''}
                    onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })}
                    required
                    placeholder="e.g. Full Stack Engineering Internship"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                    <input
                      type="text"
                      value={editingProgram.duration || '8 Weeks'}
                      onChange={(e) => setEditingProgram({ ...editingProgram, duration: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mode</label>
                    <select
                      value={editingProgram.mode || 'online'}
                      onChange={(e: any) => setEditingProgram({ ...editingProgram, mode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                    >
                      <option value="online">Online</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    value={editingProgram.description || ''}
                    onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })}
                    rows={3}
                    placeholder="Enter comprehensive description..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-150 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProgramModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer"
                  >
                    Save Program
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default InternshipAdminPanel;

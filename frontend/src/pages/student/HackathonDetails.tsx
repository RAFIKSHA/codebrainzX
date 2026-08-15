import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ChevronRight, Calendar, Users, Trophy, Clock, MapPin, DollarSign, Zap,
  BookOpen, Layers, Code2, Shield, Target, GitBranch, Globe, Server, Database,
  Lock, Package, CheckCircle2, ArrowRight, XCircle, AlertCircle, Tag,
  ChevronDown, ChevronUp, Loader, Star, FileText, Cpu, Workflow,
  Mail, Phone, HelpCircle, Download, ExternalLink, Flame, Award, Sparkles
} from 'lucide-react';
import api from '../../services/api';

// ─── Interfaces ────────────────────────────────────────────────────────────────
interface Hackathon {
  id: number; title: string; slug: string; banner_url: string | null;
  description: string; problem_statement: string; rules: string; theme: string;
  category: string; difficulty: string; venue: string; mode: string;
  start_date: string; end_date: string; registration_deadline: string;
  presentation_date: string | null; prize_pool: string; registration_fee: string;
  max_teams: number; max_team_members: number; judging_criteria: string;
  sponsors: { name: string; logo: string }[];
  faqs: { question: string; answer: string }[];
  attachments: { name: string; url: string }[];
  status: string; registered_teams_count: number; remaining_slots: number;
}
interface ProblemStatement {
  id: number; hackathon: number; title: string; description: string;
  difficulty: 'easy' | 'medium' | 'hard'; tech_stack: string[];
  order: number; application_count: number;
}
interface ProblemApplication {
  id: number; hackathon: number; problem_statement: number;
  problem_statement_detail: ProblemStatement;
  selected_tech_stack: string[]; team_name: string;
}

type TabId = 'dashboard' | 'overview' | 'problems' | 'requirements' | 'features' | 'techstack' | 'faq';

// ─── Colour helpers ────────────────────────────────────────────────────────────
const difficultyConfig = {
  easy:   { label: 'Easy',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/40' },
  medium: { label: 'Medium', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/40' },
  hard:   { label: 'Hard',   cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/40' },
};

// Tech-stack icon map (lucide)
const techIcons: Record<string, React.ReactNode> = {
  React: <Code2 size={12}/>, Vue: <Code2 size={12}/>, Angular: <Code2 size={12}/>,
  Node: <Server size={12}/>, Django: <Server size={12}/>, Flask: <Server size={12}/>,
  FastAPI: <Server size={12}/>, Spring: <Server size={12}/>,
  PostgreSQL: <Database size={12}/>, MongoDB: <Database size={12}/>, MySQL: <Database size={12}/>,
  Firebase: <Database size={12}/>, Redis: <Database size={12}/>,
  Python: <Cpu size={12}/>, JavaScript: <Cpu size={12}/>, TypeScript: <Cpu size={12}/>,
  Java: <Cpu size={12}/>, Go: <Cpu size={12}/>, Rust: <Cpu size={12}/>,
  Docker: <Package size={12}/>, Kubernetes: <Package size={12}/>, AWS: <Globe size={12}/>,
  GCP: <Globe size={12}/>, Azure: <Globe size={12}/>, Vercel: <Globe size={12}/>,
  Git: <GitBranch size={12}/>, GitHub: <GitBranch size={12}/>,
  JWT: <Lock size={12}/>, OAuth: <Lock size={12}/>, Auth0: <Lock size={12}/>,
  'AI/ML': <Zap size={12}/>, TensorFlow: <Zap size={12}/>, PyTorch: <Zap size={12}/>,
  Flutter: <Code2 size={12}/>, 'React Native': <Code2 size={12}/>,
};

// ─── Small sub-components ──────────────────────────────────────────────────────
const TechBadge: React.FC<{ tag: string; size?: 'sm' | 'md' }> = ({ tag, size = 'md' }) => (
  <span className={`inline-flex items-center gap-1 font-bold border rounded-full ${
    size === 'sm'
      ? 'px-2 py-0.5 text-[9px] bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800/40'
      : 'px-2.5 py-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700'
  }`}>
    {techIcons[tag] ?? <Code2 size={10}/>} {tag}
  </span>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color?: string }> = ({
  icon, label, value, color = 'blue'
}) => {
  const colors: Record<string, string> = {
    blue:   'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
    emerald:'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
    amber:  'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
    rose:   'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400',
    slate:  'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  };
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colors[color] ?? colors.blue}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">{label}</p>
        <p className="text-xs font-black text-slate-900 dark:text-white truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
};

const ProgressBar: React.FC<{ label: string; pct: number; color?: string }> = ({ label, pct, color = 'bg-blue-600' }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-[11px]">
      <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      <span className="font-black text-slate-900 dark:text-white">{pct}%</span>
    </div>
    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div style={{ width: `${pct}%` }} className={`h-full ${color} rounded-full transition-all duration-700`}/>
    </div>
  </div>
);

const Accordion: React.FC<{ question: string; answer: string; index: number }> = ({ question, answer, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden transition-all ${open ? 'shadow-sm' : ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-850/30 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-3 text-sm font-bold text-slate-900 dark:text-white">
          <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[10px] font-black flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          {question}
        </span>
        {open ? <ChevronUp size={15} className="text-slate-400 shrink-0"/> : <ChevronDown size={15} className="text-slate-400 shrink-0"/>}
      </button>
      {open && (
        <div className="px-5 pb-4 pt-0">
          <div className="pl-9 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-850 pt-3">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const HackathonDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [registeredTeam, setRegisteredTeam] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [viewingPublicLanding, setViewingPublicLanding] = useState(false);

  // Problem statements
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
  const [myApplication, setMyApplication] = useState<ProblemApplication | null>(null);
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [expandedPsId, setExpandedPsId] = useState<number | null>(null);
  const [psLoading, setPsLoading] = useState(false);
  const [psError, setPsError] = useState<string | null>(null);

  // Project Submission States
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectGithubUrl, setProjectGithubUrl] = useState('');
  const [projectDemoUrl, setProjectDemoUrl] = useState('');
  const [projectPresentationUrl, setProjectPresentationUrl] = useState('');
  const [isEditingSubmission, setIsEditingSubmission] = useState(true);
  const [submissionSubmitting, setSubmissionSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    if (registeredTeam) {
      setProjectTitle(registeredTeam.project_title || '');
      setProjectDescription(registeredTeam.project_description || '');
      setProjectGithubUrl(registeredTeam.project_github_url || '');
      setProjectDemoUrl(registeredTeam.project_demo_url || '');
      setProjectPresentationUrl(registeredTeam.project_presentation_url || '');
      
      // If already has title and github url, view details first
      if (registeredTeam.project_title && registeredTeam.project_github_url) {
        setIsEditingSubmission(false);
      } else {
        setIsEditingSubmission(true);
      }
    }
  }, [registeredTeam]);

  const fetchProblemData = useCallback(async (hackathonId: number) => {
    setPsLoading(true);
    try {
      const psRes = await api.get(`/hackathon-problem-statements/?hackathon_id=${hackathonId}`);
      setProblemStatements(psRes.data);
      if (user) {
        const myAppRes = await api.get(`/hackathon-problem-applications/my_application/?hackathon_id=${hackathonId}`);
        setMyApplication(myAppRes.data || null);
      }
    } catch (err) { console.error(err); }
    finally { setPsLoading(false); }
  }, [user]);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/hackathons/${slug}/details_by_slug/`);
        if (res.data) { setHackathon(res.data); checkIfRegistered(res.data.id); fetchProblemData(res.data.id); }
      } catch {
        try {
          const listRes = await api.get('/hackathons/');
          const match = listRes.data.find((h: Hackathon) => h.slug === slug);
          if (match) { setHackathon(match); checkIfRegistered(match.id); fetchProblemData(match.id); }
        } catch (e) { console.error(e); }
      } finally { setLoading(false); }
    };
    fetchDetails();
  }, [slug]);

  const checkIfRegistered = async (id: number) => {
    if (!user) return;
    try {
      const res = await api.get('/hackathon-teams/my_registrations/');
      const match = res.data.find((t: any) => t.hackathon === id);
      setRegisteredTeam(match || null);
      if (match && match.application_status === 'approved') {
        setActiveTab('dashboard');
      }
    } catch {}
  };

  const handleApplyToProblem = async (ps: ProblemStatement) => {
    if (!hackathon || !user) return;
    if (!window.confirm(`Apply to "${ps.title}"?\nYou can only apply to one problem statement per hackathon.`)) return;
    setApplyingId(ps.id); setPsError(null);
    try {
      await api.post('/hackathon-problem-applications/', {
        hackathon: hackathon.id, problem_statement: ps.id,
        selected_tech_stack: ps.tech_stack, team_name: registeredTeam?.name || '',
      });
      await fetchProblemData(hackathon.id);
    } catch (err: any) {
      const msg = err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Failed to apply. Please try again.';
      setPsError(msg);
    } finally { setApplyingId(null); }
  };

  const handleProjectSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeredTeam) return;

    setSubmissionSubmitting(true);
    setSubmissionError(null);
    setSubmissionSuccess(false);

    try {
      const payload = {
        project_title: projectTitle,
        project_description: projectDescription,
        project_github_url: projectGithubUrl,
        project_demo_url: projectDemoUrl || null,
        project_presentation_url: projectPresentationUrl || null
      };

      const res = await api.post(`/hackathon-teams/${registeredTeam.id}/submit_project/`, payload);
      setRegisteredTeam(res.data);
      setSubmissionSuccess(true);
      setIsEditingSubmission(false);
      setTimeout(() => setSubmissionSuccess(false), 5000);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.non_field_errors?.[0] || 'Failed to submit deliverables.';
      setSubmissionError(msg);
    } finally {
      setSubmissionSubmitting(false);
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-5 w-64 bg-slate-200 dark:bg-slate-800 rounded-full"/>
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl"/>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl"/>
            <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl"/>
          </div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl"/>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Hackathon Not Found</h3>
        <Link to="/dashboard/hackathons" className="text-blue-600 dark:text-blue-400 mt-2 hover:underline inline-block text-sm">← Back to Dashboard</Link>
      </div>
    );
  }

  const isClosed = hackathon.status === 'closed'
    || hackathon.remaining_slots === 0
    || new Date(hackathon.registration_deadline).getTime() < Date.now();

  const daysLeft = Math.max(0, Math.ceil((new Date(hackathon.registration_deadline).getTime() - Date.now()) / 86400000));

  // Aggregate unique tech tags across all problem statements
  const allTechTags = [...new Set(problemStatements.flatMap(p => p.tech_stack || []))];

  const showDashboardTab = registeredTeam && registeredTeam.application_status === 'approved';

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    ...(showDashboardTab ? [{ id: 'dashboard' as TabId, label: 'Participation Dashboard', icon: <Trophy size={13}/> }] : []),
    { id: 'overview',      label: 'Overview',          icon: <Globe size={13}/>       },
    { id: 'problems',      label: `Problems (${problemStatements.length})`, icon: <Layers size={13}/> },
    { id: 'requirements',  label: 'Requirements',      icon: <Shield size={13}/>      },
    { id: 'features',      label: 'Features',          icon: <Zap size={13}/>         },
    { id: 'techstack',     label: 'Tech Stack',        icon: <Cpu size={13}/>         },
    { id: 'faq',           label: 'FAQ',               icon: <HelpCircle size={13}/>  },
  ];

  // Feature cards for Features tab
  const featureCards = [
    { icon: <Shield size={18}/>, title: 'Role-Based Access', desc: 'Admin, Team Lead and member dashboards with distinct permissions.', color: 'blue' },
    { icon: <Users size={18}/>,  title: 'Team Management',   desc: 'Create and manage your team, invite co-members, assign roles.', color: 'purple' },
    { icon: <FileText size={18}/>,title: 'Submission Portal', desc: 'Upload deliverables, GitHub repos, decks, and demos.', color: 'emerald' },
    { icon: <CheckCircle2 size={18}/>, title: 'Review System', desc: 'Judges can approve, reject or comment on submissions.', color: 'amber' },
    { icon: <Target size={18}/>, title: 'Analytics Dashboard', desc: 'Real-time performance tracking, leaderboards and metrics.', color: 'rose' },
    { icon: <Zap size={18}/>,    title: 'Live Notifications', desc: 'Instant alerts for status changes, deadlines and announcements.', color: 'slate' },
  ];

  const featureColors: Record<string, string> = {
    blue:   'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
    emerald:'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
    amber:  'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
    rose:   'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400',
    slate:  'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  };

  // Tech stack grouped by category (derive from problem statement tags + sensible defaults)
  const techCategories: { label: string; icon: React.ReactNode; tags: string[] }[] = [
    { label: 'Frontend',       icon: <Code2 size={14}/>,   tags: allTechTags.filter(t => ['React','Vue','Angular','Next.js','Flutter','React Native','Svelte'].includes(t)) },
    { label: 'Backend',        icon: <Server size={14}/>,  tags: allTechTags.filter(t => ['Node','Django','Flask','FastAPI','Spring','Express','Rails'].includes(t)) },
    { label: 'Language',       icon: <Cpu size={14}/>,     tags: allTechTags.filter(t => ['Python','JavaScript','TypeScript','Java','Go','Rust','C++','C#'].includes(t)) },
    { label: 'Database',       icon: <Database size={14}/>,tags: allTechTags.filter(t => ['PostgreSQL','MongoDB','MySQL','Firebase','Redis','SQLite','Supabase'].includes(t)) },
    { label: 'AI / ML',        icon: <Zap size={14}/>,     tags: allTechTags.filter(t => ['AI/ML','TensorFlow','PyTorch','scikit-learn','OpenAI','LangChain','HuggingFace'].includes(t)) },
    { label: 'DevOps & Cloud', icon: <Globe size={14}/>,   tags: allTechTags.filter(t => ['Docker','Kubernetes','AWS','GCP','Azure','Vercel','Railway'].includes(t)) },
    { label: 'Auth',           icon: <Lock size={14}/>,    tags: allTechTags.filter(t => ['JWT','OAuth','Auth0','Keycloak','Firebase Auth'].includes(t)) },
    { label: 'Version Control',icon: <GitBranch size={14}/>,tags: allTechTags.filter(t => ['Git','GitHub','GitLab','Bitbucket'].includes(t)) },
    { label: 'Other',          icon: <Package size={14}/>, tags: allTechTags.filter(t =>
        !['React','Vue','Angular','Next.js','Flutter','React Native','Svelte',
          'Node','Django','Flask','FastAPI','Spring','Express','Rails',
          'Python','JavaScript','TypeScript','Java','Go','Rust','C++','C#',
          'PostgreSQL','MongoDB','MySQL','Firebase','Redis','SQLite','Supabase',
          'AI/ML','TensorFlow','PyTorch','scikit-learn','OpenAI','LangChain','HuggingFace',
          'Docker','Kubernetes','AWS','GCP','Azure','Vercel','Railway',
          'JWT','OAuth','Auth0','Keycloak','Firebase Auth',
          'Git','GitHub','GitLab','Bitbucket'].includes(t)
      )
    },
  ].filter(cat => cat.tags.length > 0);

  const judgingCriteria = [
    { label: 'Technical Complexity', pct: 40, color: 'bg-blue-600'    },
    { label: 'Innovation',           pct: 30, color: 'bg-purple-600'  },
    { label: 'Impact & Feasibility', pct: 20, color: 'bg-emerald-600' },
    { label: 'Presentation',         pct: 10, color: 'bg-amber-500'   },
  ];

  if (registeredTeam && !viewingPublicLanding) {
    const isApproved = registeredTeam.application_status === 'approved';
    const isPending = registeredTeam.application_status === 'pending' || registeredTeam.application_status === 'waitlisted';
    const isRejected = registeredTeam.application_status === 'rejected';

    return (
      <div className="space-y-6 select-none animate-fade-in -mt-2">
        {/* Workspace Breadcrumb & Header Toggle Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Link to="/dashboard/hackathons" className="hover:text-slate-600 dark:hover:text-white transition-colors">Hackathons</Link>
              <ChevronRight size={10} className="text-slate-600"/>
              <span className="truncate max-w-[150px]">{hackathon.title}</span>
            </nav>
            <h1 className="text-xl sm:text-2xl font-black text-slate-905 dark:text-white mt-1 leading-tight flex items-center gap-2">
              Hacker Workspace <span className="text-slate-300 dark:text-slate-700 font-light">|</span> <span className="text-blue-605 dark:text-blue-400 font-medium">Team {registeredTeam.name}</span>
            </h1>
          </div>
          
          <button
            onClick={() => setViewingPublicLanding(true)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer flex items-center gap-1.5"
          >
            <Globe size={13} /> View Public Event Page
          </button>
        </div>

        {/* Status Notification Banners */}
        {isPending && (
          <div className="p-5 bg-amber-500/10 text-amber-705 dark:bg-amber-955/20 dark:text-amber-400 border border-amber-500/15 rounded-3xl flex items-start gap-3">
            <Clock size={18} className="shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1 text-xs">
              <p className="font-black uppercase tracking-wider text-[10px]">Application Status: Under Verification Review</p>
              <p className="font-semibold leading-relaxed">
                We have received your registration details and UPI UTR Transaction number. Our administrators are verifying the transaction. Once verified, your status will turn to Approved and your Stage 4 Project Workspace deliverables portal will unlock. Typically reviewed within 1-2 hours.
              </p>
              <div className="bg-white/40 dark:bg-slate-900/40 p-3 rounded-2xl border border-amber-500/10 mt-3 space-y-1 max-w-md font-mono text-[10px] text-slate-700 dark:text-slate-350">
                <div className="flex justify-between"><span>Registration ID:</span> <span className="font-bold">{registeredTeam.registration_number || 'N/A'}</span></div>
                <div className="flex justify-between"><span>Payment Method:</span> <span className="font-bold capitalize">{registeredTeam.payment_method || 'UPI'}</span></div>
                <div className="flex justify-between"><span>Transaction Reference:</span> <span className="font-bold">{registeredTeam.utr_number || 'Verification Pending'}</span></div>
              </div>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="p-5 bg-red-500/10 text-red-650 dark:bg-red-950/20 dark:text-red-400 border border-red-500/15 rounded-3xl flex items-start gap-3">
            <XCircle size={18} className="shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs">
              <p className="font-black uppercase tracking-wider text-[10px]">Application Status: Registration Rejected</p>
              <p className="font-semibold leading-relaxed">
                Unfortunately, your application profile was rejected by our panel due to verification issues or incomplete information.
              </p>
              <button
                onClick={() => navigate(`/dashboard/hackathons/${hackathon.slug}/register`)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[11px] font-bold transition shadow shadow-red-500/10 cursor-pointer"
              >
                Resubmit Application
              </button>
            </div>
          </div>
        )}

        {/* Hacker Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Stage Timeline column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Timeline header */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-slate-455 font-bold uppercase tracking-wider">Hacker Lifecycle Tracker</span>
              <span className="text-slate-500 font-mono">Stages completed: {isApproved ? '3/4' : '2/4'}</span>
            </div>

            {/* STAGE 1: REGISTRATION COMPLETED */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200/30">
                <CheckCircle2 size={18} />
              </div>
              <div className="space-y-1.5 flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Stage 1: Application Intake</span>
                <h3 className="text-xs font-black text-slate-900 dark:text-white">Registration Profile Created</h3>
                <p className="text-[11px] text-slate-455 dark:text-slate-450 leading-relaxed font-semibold">
                  You registered under team <span className="font-bold text-slate-850 dark:text-slate-200">'{registeredTeam.name}'</span>. Academic verification from college <span className="font-semibold text-slate-700 dark:text-slate-350">{registeredTeam.college}</span> has been logged.
                </p>
              </div>
            </div>

            {/* STAGE 2: PROBLEM LOCKED */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200/30">
                <CheckCircle2 size={18} />
              </div>
              <div className="space-y-2.5 flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Stage 2: Target Challenge Choice</span>
                <h3 className="text-xs font-black text-slate-900 dark:text-white">Problem Statement Locked</h3>
                
                {registeredTeam.problem_statement_detail ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-150/40 dark:border-slate-850 pb-2">
                      <h4 className="text-xs font-black text-slate-850 dark:text-white">{registeredTeam.problem_statement_detail.title}</h4>
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded border ${
                        registeredTeam.problem_statement_detail.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-705 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400' :
                        registeredTeam.problem_statement_detail.difficulty === 'hard' ? 'bg-red-50 text-red-705 border-red-250 dark:bg-red-950/20 dark:text-red-400' :
                        'bg-amber-50 text-amber-705 border-amber-250 dark:bg-amber-955/20 dark:text-amber-400'
                      }`}>{registeredTeam.problem_statement_detail.difficulty}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      {registeredTeam.problem_statement_detail.short_description || registeredTeam.problem_statement_detail.description}
                    </p>
                    {registeredTeam.problem_statement_detail.tech_stack && registeredTeam.problem_statement_detail.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {registeredTeam.problem_statement_detail.tech_stack.map((t: string) => (
                          <span key={t} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[9px] font-bold rounded border border-blue-200/20">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-455 italic">No problem selected.</p>
                )}
              </div>
            </div>

            {/* STAGE 3: TEAM FORMATION */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200/30">
                <CheckCircle2 size={18} />
              </div>
              <div className="space-y-2.5 flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Stage 3: Roster Composition</span>
                <h3 className="text-xs font-black text-slate-900 dark:text-white">Team Roster Verified</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-655">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl">
                    <span className="text-[8px] font-black uppercase tracking-widest text-blue-600 block">Team Leader</span>
                    <span className="font-extrabold text-slate-900 dark:text-white block mt-0.5">{registeredTeam.leader_name}</span>
                    <span className="text-[10px] text-slate-455 block mt-0.5 font-semibold">{registeredTeam.leader_email}</span>
                  </div>

                  {registeredTeam.members && registeredTeam.members.map((m: any, idx: number) => (
                    <div key={idx} className="p-3.5 bg-slate-50/70 dark:bg-slate-955/20 border border-slate-150 dark:border-slate-850 rounded-2xl">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Co-Member #{idx + 2}</span>
                      <span className="font-bold text-slate-900 dark:text-white block mt-0.5">{m.name}</span>
                      <span className="text-[10px] text-slate-455 block mt-0.5 font-semibold">{m.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* STAGE 4: SOLUTIONS DELIVERABLES WORKSPACE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-start gap-4 relative overflow-hidden">
              {!isApproved && (
                <div className="absolute inset-0 bg-slate-50/70 dark:bg-slate-955/70 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center text-center p-6">
                  <Lock size={28} className="text-slate-400 dark:text-slate-600 mb-2" />
                  <h4 className="text-xs font-black text-slate-855 dark:text-slate-200 uppercase tracking-wider">Workspace Deliverables Portal Locked</h4>
                  <p className="text-[10px] text-slate-450 max-w-sm mt-1 leading-relaxed">
                    Submit phase deliverables will automatically unlock immediately once the administrator verifies your transaction UTR reference check.
                  </p>
                </div>
              )}

              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                registeredTeam.project_submitted_at
                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-600 text-blue-600 animate-pulse'
              }`}>
                {registeredTeam.project_submitted_at ? <CheckCircle2 size={18} /> : <Zap size={15} />}
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Stage 4: Workspace Deliverables Portal</span>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white">
                      {registeredTeam.project_submitted_at ? 'Project Solutions Submitted' : 'Pending Deliverables Submission'}
                    </h3>
                    {registeredTeam.project_submitted_at && (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-650 border border-emerald-500/20 text-[9px] font-black uppercase rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* Display Submission Success */}
                {submissionSuccess && (
                  <div className="p-4 bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border border-emerald-500/20 dark:border-emerald-850 rounded-2xl text-xs font-bold flex items-center gap-2 animate-slide-in">
                    <CheckCircle2 size={16} /> Deliverables saved successfully!
                  </div>
                )}

                {/* Display Submission Errors */}
                {submissionError && (
                  <div className="p-4 bg-red-500/10 text-red-655 dark:text-red-400 border border-red-500/20 dark:border-red-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-shake">
                    <AlertCircle size={16} /> {submissionError}
                  </div>
                )}

                {/* Read-Only Solution Details View */}
                {!isEditingSubmission && registeredTeam.project_title ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-4">
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Project Title</span>
                        <h5 className="text-xs font-black text-slate-900 dark:text-white mt-0.5 leading-snug">{registeredTeam.project_title}</h5>
                      </div>

                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Project Description</span>
                        <p className="text-[11px] text-slate-650 dark:text-slate-400 mt-1 leading-relaxed whitespace-pre-wrap font-semibold">
                          {registeredTeam.project_description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                        <div className="p-3 bg-white dark:bg-slate-905 border border-slate-100 dark:border-slate-850 rounded-xl">
                          <span className="text-[8px] font-black uppercase text-slate-400 block">GitHub Repository</span>
                          <a href={registeredTeam.project_github_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold block truncate mt-1">
                            GitHub Link →
                          </a>
                        </div>

                        {registeredTeam.project_demo_url && (
                          <div className="p-3 bg-white dark:bg-slate-905 border border-slate-100 dark:border-slate-850 rounded-xl">
                            <span className="text-[8px] font-black uppercase text-slate-400 block">Live Demo Link</span>
                            <a href={registeredTeam.project_demo_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold block truncate mt-1">
                              Demo Link →
                            </a>
                          </div>
                        )}

                        {registeredTeam.project_presentation_url && (
                          <div className="p-3 bg-white dark:bg-slate-905 border border-slate-100 dark:border-slate-850 rounded-xl">
                            <span className="text-[8px] font-black uppercase text-slate-400 block">Presentation / Video</span>
                            <a href={registeredTeam.project_presentation_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold block truncate mt-1">
                              Presentation Link →
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="text-[9px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-150/45 dark:border-slate-850 font-mono">
                        Submitted at: {new Date(registeredTeam.project_submitted_at).toLocaleString()}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEditingSubmission(true)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-350 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Update Solution deliverables
                    </button>
                  </div>
                ) : (
                  /* Submission Edit Form */
                  <form onSubmit={handleProjectSubmission} className="space-y-4 animate-fade-in max-w-xl">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-405 block mb-1">Project Title *</label>
                      <input
                        type="text"
                        required
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        placeholder="e.g. AgriScan: AI Crop Pathogen Detection"
                        className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-405 block mb-1">Project Description *</label>
                      <textarea
                        required
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        rows={4}
                        placeholder="Describe your implementation approach, methodology, architecture, and feature sets..."
                        className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-805 dark:text-slate-205 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-405 block mb-1">GitHub Repository URL *</label>
                      <input
                        type="url"
                        required
                        value={projectGithubUrl}
                        onChange={(e) => setProjectGithubUrl(e.target.value)}
                        placeholder="https://github.com/team/repository"
                        className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-808 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-550 dark:text-slate-405 block mb-1">Live Demo Link (Optional)</label>
                        <input
                          type="url"
                          value={projectDemoUrl}
                          onChange={(e) => setProjectDemoUrl(e.target.value)}
                          placeholder="https://demo.platform.com"
                          className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-808 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-555 dark:text-slate-405 block mb-1">Presentation / Deck Link (Optional)</label>
                        <input
                          type="url"
                          value={projectPresentationUrl}
                          onChange={(e) => setProjectPresentationUrl(e.target.value)}
                          placeholder="Google Slides or Pitch Video URL"
                          className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-808 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={submissionSubmitting}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10 cursor-pointer flex items-center gap-1.5"
                      >
                        {submissionSubmitting ? <Loader size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                        {submissionSubmitting ? 'Submitting Solution...' : 'Submit Deliverables'}
                      </button>

                      {registeredTeam.project_title && (
                        <button
                          type="button"
                          onClick={() => setIsEditingSubmission(false)}
                          className="px-4 py-2.5 border border-slate-250 dark:border-slate-800 text-slate-500 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>

          {/* Right Sidebar column */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
            
            {/* Quick overview metrics card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Workspace Profile</h3>
              
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-850">
                  <span className="text-slate-455 font-bold">Workspace Role</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px]">Team Leader</span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-850">
                  <span className="text-slate-455">Registration Fee</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {parseFloat(hackathon.registration_fee) > 0 ? `₹${Math.round(parseFloat(hackathon.registration_fee))}` : 'Free Entrance'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-850">
                  <span className="text-slate-455">College Campus</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[130px]">{registeredTeam.college}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-455">Submissions Status</span>
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                    registeredTeam.project_submitted_at
                      ? 'bg-emerald-105 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-500/10'
                      : 'bg-amber-105 text-amber-650 dark:bg-amber-955/20 dark:text-amber-450 border border-amber-500/10'
                  }`}>
                    {registeredTeam.project_submitted_at ? 'Submitted' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Rules & Downloads */}
            {hackathon.attachments && hackathon.attachments.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Resources & Attachments</h3>
                <div className="space-y-1.5">
                  {hackathon.attachments.map((file: any, idx: number) => (
                    <a key={idx} href={file.url} target="_blank" rel="noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-955/40 hover:bg-slate-100 dark:hover:bg-slate-850/50 text-[11px] font-bold text-blue-605 dark:text-blue-400 transition-colors">
                      <span className="flex items-center gap-1.5 truncate pr-2"><FileText size={12} className="text-slate-400 shrink-0"/> {file.name}</span>
                      <Download size={11} className="shrink-0"/>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Support Desk */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3.5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Hacker Support Desk</h3>
              <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                Facing payment verification delays, UTR errors, or need problem specifications help? Contact the support helpline.
              </p>
              <div className="space-y-2 pt-1">
                <a href="mailto:portal-hackathons@codexpetra.com" className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-350 hover:text-blue-600">
                  <Mail size={12} className="text-slate-400" /> portal-hackathons@codexpetra.com
                </a>
                <a href="tel:+919876543210" className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-350 hover:text-blue-600">
                  <Phone size={12} className="text-slate-400" /> +91 98765 43210
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0 -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 md:-mt-8">
      {registeredTeam && (
        <div className="bg-blue-600 text-white p-3.5 text-center text-xs font-bold flex justify-center items-center gap-3 shadow-md rounded-b-2xl animate-slide-in relative z-30 select-none">
          <Sparkles size={14} className="animate-pulse text-yellow-300" />
          <span>You are registered for this hackathon!</span>
          <button
            onClick={() => setViewingPublicLanding(false)}
            className="px-4 py-1.5 bg-white text-blue-650 hover:bg-slate-100 rounded-xl font-black uppercase text-[10px] shadow transition cursor-pointer"
          >
            Go to Hacker Workspace →
          </button>
        </div>
      )}

      {/* ── Hero / Header ─────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"/>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"/>

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-8 py-8 space-y-5">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <ChevronRight size={12} className="text-slate-600"/>
            <Link to="/dashboard/hackathons" className="hover:text-white transition-colors">Hackathons</Link>
            <ChevronRight size={12} className="text-slate-600"/>
            <span className="text-slate-300 truncate max-w-[200px]">{hackathon.title}</span>
          </nav>

          {/* Status badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
              isClosed
                ? 'bg-red-500/10 text-red-300 border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isClosed ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`}/>
              {isClosed ? 'Registration Closed' : 'Open for Applications'}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border bg-blue-500/10 text-blue-300 border-blue-500/20">
              {hackathon.mode}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border bg-purple-500/10 text-purple-300 border-purple-500/20">
              {hackathon.category || 'Technology'}
            </span>
            {hackathon.difficulty && (
              <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border bg-amber-500/10 text-amber-300 border-amber-500/20">
                <Flame size={9} className="inline mr-0.5"/> {hackathon.difficulty}
              </span>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
              {hackathon.title}
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Theme: <span className="text-blue-400 font-semibold">{hackathon.theme}</span>
              {hackathon.venue && <> · <MapPin size={12} className="inline"/> {hackathon.venue}</>}
            </p>
          </div>

          {/* Bottom row: deadline chip + tech tags */}
          <div className="flex flex-wrap items-center gap-3 pb-2">
            {!isClosed && (
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-full px-3 py-1.5 text-[10px] font-bold">
                <Clock size={11}/> {daysLeft}d left to apply
              </div>
            )}
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold">
              <Calendar size={11}/>
              Deadline: {new Date(hackathon.registration_deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold">
              <Trophy size={11}/> Prize: {hackathon.prize_pool}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Grid ──────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── MAIN CONTENT (8 cols) ─────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-5">

            {/* Tab Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-1.5 flex flex-wrap gap-1 shadow-sm">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* ── TAB: PARTICIPATION DASHBOARD ───────────────────────────────────── */}
            {activeTab === 'dashboard' && registeredTeam && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Dashboard Intro banner */}
                <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-3xl relative overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/30">
                    Active Participation
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5 leading-snug">
                    Welcome to your Hacker Dashboard, Team <span className="text-emerald-600">{registeredTeam.name}</span>!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Track your registration stages, review your selected problem specs, and submit your project deliverables when ready.
                  </p>
                </div>

                {/* 4-Stage Stepper Dashboard */}
                <div className="space-y-6">
                  
                  {/* STEP 1: REGISTRATION APPROVED */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Stage 1: Registration Status</h4>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Registration Approved & Verified</p>
                      <p className="text-[11px] text-slate-455 dark:text-slate-450 leading-relaxed font-semibold">
                        Your registration for <span className="font-bold text-slate-700 dark:text-slate-350">{hackathon.title}</span> has been confirmed by the administrators.
                      </p>
                    </div>
                  </div>

                  {/* STEP 2: PROBLEM STATEMENT SELECTED */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Stage 2: Selected Challenge</h4>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Problem Statement Locked</p>
                      
                      {registeredTeam.problem_statement_detail ? (
                        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-xs font-black text-slate-850 dark:text-white leading-snug">{registeredTeam.problem_statement_detail.title}</h5>
                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-full border ${
                              registeredTeam.problem_statement_detail.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-705 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400' :
                              registeredTeam.problem_statement_detail.difficulty === 'hard' ? 'bg-red-50 text-red-705 border-red-250 dark:bg-red-950/20 dark:text-red-400' :
                              'bg-amber-50 text-amber-755 border-amber-250 dark:bg-amber-955/20 dark:text-amber-400'
                            }`}>{registeredTeam.problem_statement_detail.difficulty}</span>
                          </div>
                          
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                            {registeredTeam.problem_statement_detail.short_description || registeredTeam.problem_statement_detail.description}
                          </p>

                          {registeredTeam.problem_statement_detail.tech_stack && registeredTeam.problem_statement_detail.tech_stack.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {registeredTeam.problem_statement_detail.tech_stack.map((t: string) => (
                                <span key={t} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[9px] font-bold rounded-full border border-blue-200/20">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-455">No problem statement details attached.</p>
                      )}
                    </div>
                  </div>

                  {/* STEP 3: TEAM SETUP COMPLETED */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="space-y-3 flex-1">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Stage 3: Team Roster</h4>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Roster Composition Completed</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl">
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 block font-bold">Team Leader</span>
                          <span className="font-extrabold text-slate-900 dark:text-white block mt-0.5">{registeredTeam.leader_name}</span>
                          <span className="text-[10px] text-slate-455 block mt-0.5 font-semibold">{registeredTeam.leader_email}</span>
                          <span className="text-[10px] text-slate-455 block mt-0.5 font-mono">{registeredTeam.leader_mobile}</span>
                        </div>

                        {registeredTeam.members && registeredTeam.members.map((m: any, i: number) => (
                          <div key={i} className="p-3 bg-slate-50/70 dark:bg-slate-955/20 border border-slate-150 dark:border-slate-850 rounded-2xl">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block font-bold">Co-Member #{i + 2}</span>
                            <span className="font-bold text-slate-900 dark:text-white block mt-0.5">{m.name}</span>
                            <span className="text-[10px] text-slate-455 block mt-0.5 font-semibold">{m.email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* STEP 4: SOLUTION SUBMISSION */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                      registeredTeam.project_submitted_at
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-600 text-blue-600 animate-pulse'
                    }`}>
                      {registeredTeam.project_submitted_at ? <CheckCircle2 size={18} /> : <Zap size={15} />}
                    </div>

                    <div className="space-y-4 flex-1">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Stage 4: Solution Deliverables</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {registeredTeam.project_submitted_at ? 'Deliverables Submitted Successfully' : 'Deliverables Pending Submission'}
                          </p>
                          {registeredTeam.project_submitted_at && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase rounded-full border border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-450 dark:border-emerald-800/40">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Display Submission Success */}
                      {submissionSuccess && (
                        <div className="p-4 bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border border-emerald-500/20 dark:border-emerald-850 rounded-2xl text-xs font-bold flex items-center gap-2 animate-slide-in">
                          <CheckCircle2 size={16} /> Deliverables saved successfully!
                        </div>
                      )}

                      {/* Display Submission Errors */}
                      {submissionError && (
                        <div className="p-4 bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/20 dark:border-red-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-shake">
                          <AlertCircle size={16} /> {submissionError}
                        </div>
                      )}

                      {/* Read-Only Solution Details View */}
                      {!isEditingSubmission && registeredTeam.project_title ? (
                        <div className="space-y-4 animate-fade-in">
                          <div className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3.5">
                            <div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block font-bold">Project Title</span>
                              <h5 className="text-xs font-black text-slate-900 dark:text-white mt-0.5 leading-snug">{registeredTeam.project_title}</h5>
                            </div>

                            <div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block font-bold">Project Description</span>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed whitespace-pre-wrap font-semibold">
                                {registeredTeam.project_description}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] pt-1">
                              <div className="p-2.5 bg-white dark:bg-slate-905 border border-slate-100 dark:border-slate-850 rounded-xl">
                                <span className="text-[8px] font-black uppercase text-slate-400 block">GitHub Repository</span>
                                <a href={registeredTeam.project_github_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold block truncate mt-1">
                                  GitHub Link →
                                </a>
                              </div>

                              {registeredTeam.project_demo_url && (
                                <div className="p-2.5 bg-white dark:bg-slate-905 border border-slate-100 dark:border-slate-850 rounded-xl">
                                  <span className="text-[8px] font-black uppercase text-slate-400 block">Live Demo Link</span>
                                  <a href={registeredTeam.project_demo_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold block truncate mt-1">
                                    Demo Link →
                                  </a>
                                </div>
                              )}

                              {registeredTeam.project_presentation_url && (
                                <div className="p-2.5 bg-white dark:bg-slate-905 border border-slate-100 dark:border-slate-850 rounded-xl">
                                  <span className="text-[8px] font-black uppercase text-slate-400 block">Presentation / Video</span>
                                  <a href={registeredTeam.project_presentation_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold block truncate mt-1">
                                    Presentation Link →
                                  </a>
                                </div>
                              )}
                            </div>

                            <div className="text-[9px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-150/45 dark:border-slate-850">
                              Submitted at: {new Date(registeredTeam.project_submitted_at).toLocaleString()}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsEditingSubmission(true)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-350 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Edit Solution Details
                          </button>
                        </div>
                      ) : (
                        /* Submission Edit Form */
                        <form onSubmit={handleProjectSubmission} className="space-y-4 animate-fade-in max-w-xl">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-405 block mb-1">Project Title *</label>
                            <input
                              type="text"
                              required
                              value={projectTitle}
                              onChange={(e) => setProjectTitle(e.target.value)}
                              placeholder="e.g. AgriScan: AI Crop Pathogen Detection"
                              className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-405 block mb-1">Project Description *</label>
                            <textarea
                              required
                              value={projectDescription}
                              onChange={(e) => setProjectDescription(e.target.value)}
                              rows={4}
                              placeholder="Describe your implementation approach, methodology, architecture, and feature sets..."
                              className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-405 block mb-1">GitHub Repository URL *</label>
                            <input
                              type="url"
                              required
                              value={projectGithubUrl}
                              onChange={(e) => setProjectGithubUrl(e.target.value)}
                              placeholder="https://github.com/team/repository"
                              className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-808 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-slate-550 dark:text-slate-405 block mb-1">Live Demo Link (Optional)</label>
                              <input
                                type="url"
                                value={projectDemoUrl}
                                onChange={(e) => setProjectDemoUrl(e.target.value)}
                                placeholder="https://demo.platform.com"
                                className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-808 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-550 dark:text-slate-405 block mb-1">Presentation / Deck Link (Optional)</label>
                              <input
                                type="url"
                                value={projectPresentationUrl}
                                onChange={(e) => setProjectPresentationUrl(e.target.value)}
                                placeholder="Google Slides or Pitch Video URL"
                                className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-808 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <button
                              type="submit"
                              disabled={submissionSubmitting}
                              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10 cursor-pointer flex items-center gap-1.5"
                            >
                              {submissionSubmitting ? <Loader size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                              {submissionSubmitting ? 'Submitting Solution...' : 'Submit Deliverables'}
                            </button>

                            {registeredTeam.project_title && (
                              <button
                                type="button"
                                onClick={() => setIsEditingSubmission(false)}
                                className="px-4 py-2.5 border border-slate-250 dark:border-slate-800 text-slate-500 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </form>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ── TAB: OVERVIEW ─────────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* About card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <BookOpen size={14}/>
                    </div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">About This Hackathon</h2>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{hackathon.description}</p>
                </div>

                {/* Quick stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatCard icon={<Users size={16}/>}    label="Team Size"    value={`Up to ${hackathon.max_team_members} members`} color="blue"/>
                  <StatCard icon={<Clock size={16}/>}    label="Duration"     value={`${Math.ceil((new Date(hackathon.end_date).getTime() - new Date(hackathon.start_date).getTime()) / 86400000)}d hackathon`} color="purple"/>
                  <StatCard icon={<Trophy size={16}/>}   label="Prize Pool"   value={hackathon.prize_pool} color="amber"/>
                  <StatCard icon={<Target size={16}/>}   label="Difficulty"   value={hackathon.difficulty || 'Open'} color="rose"/>
                  <StatCard icon={<Layers size={16}/>}   label="Problems"     value={`${problemStatements.length} available`} color="emerald"/>
                  <StatCard icon={<DollarSign size={16}/>} label="Entry Fee"  value={parseFloat(hackathon.registration_fee) > 0 ? `₹${Math.round(parseFloat(hackathon.registration_fee))}` : 'Free'} color="slate"/>
                </div>

                {/* Timeline */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Calendar size={14}/>
                    </div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">Event Timeline</h2>
                  </div>
                  <div className="relative border-l-2 border-dashed border-slate-200 dark:border-slate-800 ml-4 space-y-5">
                    {[
                      { dot: 'bg-blue-600', label: 'Registration Deadline', date: hackathon.registration_deadline, sub: 'Submit your team registration before this date.' },
                      { dot: 'bg-emerald-500', label: 'Hackathon Start', date: hackathon.start_date, sub: 'Coding begins — problem statements released.' },
                      { dot: 'bg-amber-500', label: 'Submission Deadline', date: hackathon.end_date, sub: 'Final code and presentation must be submitted.' },
                      ...(hackathon.presentation_date ? [{ dot: 'bg-indigo-600', label: 'Presentations & Demo Day', date: hackathon.presentation_date, sub: 'Live demos and jury evaluation.' }] : []),
                    ].map((item, i) => (
                      <div key={i} className="relative pl-6">
                        <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${item.dot} shadow-sm`}/>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">{item.label}</h4>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                          {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{item.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sponsors */}
                {hackathon.sponsors && hackathon.sponsors.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><Award size={15} className="text-amber-500"/> Event Sponsors</h2>
                    <div className="flex flex-wrap gap-4 items-center">
                      {hackathon.sponsors.map((sp, i) => (
                        <div key={i} className="h-10 px-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/50 dark:border-slate-800 flex items-center justify-center filter grayscale hover:grayscale-0 transition-all">
                          <img src={sp.logo} alt={sp.name} className="h-full object-contain max-w-[120px]"/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: PROBLEMS ─────────────────────────────────────────────────── */}
            {activeTab === 'problems' && (
              <div className="space-y-4">
                {/* Applied banner */}
                {myApplication && (
                  <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl px-5 py-3.5">
                    <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0"/>
                    <div>
                      <p className="text-xs font-black text-emerald-800 dark:text-emerald-300">Applied to: {myApplication.problem_statement_detail?.title}</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5">Your selection is locked. Contact organizers to change.</p>
                    </div>
                  </div>
                )}

                {psError && (
                  <div className="flex items-start gap-2.5 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/40 rounded-2xl text-xs text-red-700 dark:text-red-400">
                    <AlertCircle size={14} className="shrink-0 mt-0.5"/> <span className="font-semibold">{psError}</span>
                  </div>
                )}

                {psLoading ? (
                  <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
                    <Loader size={28} className="animate-spin text-blue-600"/> <span className="text-xs font-semibold">Loading problems…</span>
                  </div>
                ) : problemStatements.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                    <Layers size={36} className="mx-auto text-slate-300 dark:text-slate-700 mb-3"/>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No problem statements added yet.</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Check back soon — organizers are adding challenges.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {problemStatements.map((ps, idx) => {
                      const isApplied = myApplication?.problem_statement === ps.id;
                      const hasApplied = !!myApplication && !isApplied;
                      const isExpanded = expandedPsId === ps.id;
                      const diff = difficultyConfig[ps.difficulty] ?? difficultyConfig.medium;
                      return (
                        <div key={ps.id} className={`rounded-2xl border transition-all overflow-hidden ${
                          isApplied
                            ? 'border-emerald-300/70 dark:border-emerald-700/50 bg-emerald-50/30 dark:bg-emerald-950/10 shadow-sm'
                            : 'border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300/50 dark:hover:border-blue-700/40 hover:shadow-md'
                        }`}>
                          {/* Applied ribbon */}
                          {isApplied && (
                            <div className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1 flex items-center gap-1.5">
                              <CheckCircle2 size={10}/> Your Selection
                            </div>
                          )}
                          <div className="p-5 space-y-3">
                            {/* Header row */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xs shrink-0">
                                  {String(idx + 1).padStart(2, '0')}
                                </div>
                                <div className="min-w-0">
                                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">{ps.title}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full border ${diff.cls}`}>{diff.label}</span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
                                      <Users size={9}/> {ps.application_count} Applied
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button onClick={() => setExpandedPsId(isExpanded ? null : ps.id)}
                                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer shrink-0">
                                {isExpanded ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                              </button>
                            </div>

                            {/* Description */}
                            <p className={`text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                              {ps.description}
                            </p>

                            {/* Tech badges */}
                            {ps.tech_stack && ps.tech_stack.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {ps.tech_stack.map(t => <TechBadge key={t} tag={t} size="sm"/>)}
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-850">
                              <span className="text-[10px] text-slate-400 font-semibold">Problem #{idx + 1}</span>
                              {!user ? (
                                <Link to="/login" className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-xl shadow-sm hover:bg-blue-700 transition-colors">Login to Apply</Link>
                              ) : isApplied ? (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl text-[10px] font-black uppercase">
                                  <CheckCircle2 size={11}/> Applied
                                </span>
                              ) : hasApplied ? (
                                <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl text-[10px] font-bold uppercase cursor-not-allowed">Applied Elsewhere</span>
                              ) : isClosed ? (
                                <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl text-[10px] font-bold uppercase">Closed</span>
                              ) : (
                                <button onClick={() => handleApplyToProblem(ps)} disabled={applyingId === ps.id}
                                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-[10px] font-black uppercase rounded-xl shadow-sm transition-all cursor-pointer">
                                  {applyingId === ps.id ? <Loader size={11} className="animate-spin"/> : <ArrowRight size={11}/>}
                                  {applyingId === ps.id ? 'Applying…' : 'Apply Now'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: REQUIREMENTS ─────────────────────────────────────────────── */}
            {activeTab === 'requirements' && (
              <div className="space-y-4">
                {[
                  { icon: <BookOpen size={14}/>, title: 'Problem Background', color: 'blue', content: hackathon.description },
                  { icon: <AlertCircle size={14}/>, title: 'Current Challenges', color: 'amber', content: hackathon.problem_statement },
                  { icon: <Target size={14}/>, title: 'Rules & Constraints', color: 'rose', content: hackathon.rules },
                  { icon: <FileText size={14}/>, title: 'Judging Criteria', color: 'purple', content: hackathon.judging_criteria },
                ].filter(s => s.content).map((section, i) => {
                  const sectionColors: Record<string, string> = {
                    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
                    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
                    rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
                    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
                  };
                  return (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${sectionColors[section.color]}`}>{section.icon}</div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">{section.title}</h3>
                      </div>
                      <pre className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-850">
                        {section.content}
                      </pre>
                    </div>
                  );
                })}
                {!hackathon.description && !hackathon.problem_statement && !hackathon.rules && (
                  <div className="text-center py-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                    <p className="text-sm text-slate-400">No requirements published yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: FEATURES ─────────────────────────────────────────────────── */}
            {activeTab === 'features' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-2">
                  <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><Zap size={15} className="text-blue-600"/> Expected Platform Features</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">Your solution should ideally cover some or all of the following feature areas.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {featureCards.map((card, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all space-y-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${featureColors[card.color] ?? featureColors.slate}`}>
                        {card.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">{card.title}</h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">{card.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB: TECH STACK ───────────────────────────────────────────────── */}
            {activeTab === 'techstack' && (
              <div className="space-y-4">
                {techCategories.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
                    <Cpu size={36} className="mx-auto text-slate-300 dark:text-slate-700"/>
                    <p className="text-sm text-slate-400 font-semibold">Tech stack will appear here once problem statements are added.</p>
                  </div>
                ) : techCategories.map((cat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">{cat.icon}</div>
                      <span className="text-xs font-black uppercase tracking-wider">{cat.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cat.tags.map(t => <TechBadge key={t} tag={t}/>)}
                    </div>
                  </div>
                ))}

                {/* All tags fallback if no categories matched */}
                {techCategories.length === 0 && allTechTags.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Recommended Technologies</h3>
                    <div className="flex flex-wrap gap-2">{allTechTags.map(t => <TechBadge key={t} tag={t}/>)}</div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: FAQ ──────────────────────────────────────────────────────── */}
            {activeTab === 'faq' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-2">
                  <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><HelpCircle size={15} className="text-blue-600"/> Frequently Asked Questions</h2>
                </div>
                {hackathon.faqs && hackathon.faqs.length > 0 ? (
                  <div className="space-y-2">
                    {hackathon.faqs.map((faq, i) => <Accordion key={i} question={faq.question} answer={faq.answer} index={i}/>)}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                    <HelpCircle size={36} className="mx-auto text-slate-300 dark:text-slate-700 mb-3"/>
                    <p className="text-sm text-slate-400">No FAQs added yet.</p>
                  </div>
                )}

                {/* Contact card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Still have questions?</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a href="mailto:portal-hackathons@codexpetra.com"
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/40 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors">
                      <Mail size={13}/> portal-hackathons@codexpetra.com
                    </a>
                    <a href="tel:+919876543210"
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors">
                      <Phone size={13}/> +91 98765 43210
                    </a>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT SIDEBAR (4 cols) ─────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24" ref={sidebarRef}>

            {/* Registration Brief Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Registration Brief</h3>

              {/* Fee */}
              <div className="flex items-end justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entry Fee</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    {parseFloat(hackathon.registration_fee) > 0 ? `₹${Math.round(parseFloat(hackathon.registration_fee))}` : 'Free'}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${
                  isClosed
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/40'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/40'
                }`}>{isClosed ? 'Closed' : 'Open'}</span>
              </div>

              {/* Detail list */}
              <div className="space-y-3 text-xs">
                {[
                  { icon: <MapPin size={12}/>,     label: 'Mode',        value: hackathon.mode },
                  { icon: <Globe size={12}/>,      label: 'Venue',       value: hackathon.venue || 'Virtual' },
                  { icon: <Users size={12}/>,      label: 'Max Teams',   value: `${hackathon.max_teams} teams` },
                  { icon: <Users size={12}/>,      label: 'Team Size',   value: `Up to ${hackathon.max_team_members}` },
                  { icon: <Trophy size={12}/>,     label: 'Prize Pool',  value: hackathon.prize_pool },
                  { icon: <Layers size={12}/>,     label: 'Problems',    value: `${problemStatements.length} available` },
                  { icon: <Clock size={12}/>,      label: 'Deadline',    value: new Date(hackathon.registration_deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 shrink-0">{row.icon}{row.label}</span>
                    <span className="font-bold text-slate-900 dark:text-white text-right truncate max-w-[140px] capitalize">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Applied problem mini-card */}
              {myApplication && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl p-4 space-y-1.5">
                  <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={10}/> Applied To</p>
                  <p className="text-xs font-black text-emerald-900 dark:text-emerald-200 leading-snug">{myApplication.problem_statement_detail?.title}</p>
                  {myApplication.selected_tech_stack && myApplication.selected_tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {myApplication.selected_tech_stack.map(t => (
                        <span key={t} className="px-1.5 py-0.5 bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[8px] font-bold rounded-full border border-emerald-200/40">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="space-y-2 pt-1">
                {registeredTeam ? (
                  <>
                    {registeredTeam.application_status === 'approved' && (
                      <div className="w-full py-3 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 text-center text-xs font-black uppercase flex items-center justify-center gap-2">
                        <CheckCircle2 size={14}/> Registered & Approved
                      </div>
                    )}
                    {registeredTeam.application_status === 'rejected' && (
                      <div className="space-y-2">
                        <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl">
                          <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase flex items-center gap-1"><XCircle size={11}/> Registration Rejected</p>
                          <p className="text-[10px] text-red-700 dark:text-red-300 mt-1">Your registration was rejected by the admin.</p>
                        </div>
                        <button onClick={() => navigate(`/dashboard/hackathons/${hackathon.slug}/register`)}
                          className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase transition-all shadow-sm shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2">
                          Resubmit <ArrowRight size={13}/>
                        </button>
                      </div>
                    )}
                    {(registeredTeam.application_status === 'pending' || registeredTeam.application_status === 'waitlisted') && (
                      <div className="w-full py-3 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 text-center text-xs font-black uppercase flex items-center justify-center gap-2">
                        <Clock size={14}/> Under Review
                      </div>
                    )}
                  </>
                ) : isClosed ? (
                  <div className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-center text-xs font-black uppercase">
                    Registration Closed
                  </div>
                ) : (
                  <button onClick={() => navigate(`/dashboard/hackathons/${hackathon.slug}/register`)}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase transition-all shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 cursor-pointer flex items-center justify-center gap-2 group">
                    Apply for Hackathon <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform"/>
                  </button>
                )}

                <button onClick={() => setActiveTab('problems')}
                  className="w-full py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                  <Layers size={12}/> Browse Problem Statements
                </button>
              </div>

              {/* Attachments */}
              {hackathon.attachments && hackathon.attachments.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Downloads</p>
                  <div className="space-y-1.5">
                    {hackathon.attachments.map((file, i) => (
                      <a key={i} href={file.url} target="_blank" rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-850/50 text-[11px] font-bold text-blue-600 dark:text-blue-400 transition-colors">
                        <span className="flex items-center gap-1.5 truncate pr-2"><FileText size={12} className="text-slate-400 shrink-0"/> {file.name}</span>
                        <Download size={11} className="shrink-0"/>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Judging Criteria Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Star size={13}/>
                </div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Judging Criteria</h3>
              </div>
              {hackathon.judging_criteria ? (
                <div className="space-y-3">
                  {judgingCriteria.map((item, i) => (
                    <ProgressBar key={i} label={item.label} pct={item.pct} color={item.color}/>
                  ))}
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1 leading-relaxed italic">
                    {hackathon.judging_criteria}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {judgingCriteria.map((item, i) => (
                    <ProgressBar key={i} label={item.label} pct={item.pct} color={item.color}/>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Info: Mentors (static) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Event Mentors</h3>
              <div className="space-y-3">
                {[
                  { name: 'Dr. Ananya Sen', role: 'AI Research Lead, TechLab', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80' },
                  { name: 'Vikram Malhotra', role: 'Solutions Architect, Google', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={m.avatar} alt={m.name} className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm shrink-0"/>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{m.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonDetails;

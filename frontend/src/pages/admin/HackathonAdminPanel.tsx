import React, { useEffect, useState } from 'react';
import { Trophy, Users, FileText, Mail, Settings, Award, Search, Check, X, ShieldCheck, Download, PlusCircle, Edit3, BarChart, DollarSign, Send, Layers, Tag, Trash2, ChevronDown, ChevronUp, BookOpen, Loader } from 'lucide-react';
import api from '../../services/api';

interface Hackathon {
  id: number;
  title: string;
  slug: string;
  banner_url: string | null;
  description: string;
  problem_statement: string;
  rules: string;
  theme: string;
  category: string;
  difficulty: string;
  venue: string;
  mode: 'online' | 'offline' | 'hybrid';
  start_date: string;
  end_date: string;
  registration_deadline: string;
  presentation_date: string | null;
  prize_pool: string;
  registration_fee: string;
  max_teams: number;
  max_team_members: number;
  judging_criteria: string;
  sponsors: any[];
  faqs: any[];
  attachments: any[];
  status: 'draft' | 'published' | 'closed' | 'completed';
  registered_teams_count: number;
  remaining_slots: number;
  registration_percentage: number;
}

interface TeamMember {
  name: string;
  email: string;
  phone: string;
  college: string;
}

interface Team {
  id: number;
  name: string;
  college: string;
  department: string;
  year: string;
  leader_name: string;
  leader_email: string;
  leader_mobile: string;
  leader_roll_number: string;
  registration_number: string;
  payment_status: 'success' | 'pending' | 'none';
  utr_number?: string;
  payment_record_id?: number;
  application_status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  hackathon: number;
  members: TeamMember[];
  created_at: string;
}

interface Application {
  id: number;
  hackathon: number;
  hackathon_title: string;
  team: number;
  team_details: Team;
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  created_at: string;
}

interface Payment {
  id: number;
  amount: string;
  payment_id: string;
  status: string;
  invoice_number: string;
  receipt_url: string;
  hackathon_title: string;
  team_name: string;
  created_at: string;
}

interface EmailLog {
  id: number;
  recipient_email: string;
  subject: string;
  body: string;
  sent_at: string;
  status: string;
  hackathon_title: string;
}

const HackathonAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hackathons' | 'problems' | 'applications' | 'teams' | 'payments' | 'analytics' | 'certificates' | 'emails' | 'settings'>('hackathons');
  
  // Data States
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState<Hackathon | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Problem Statements State ────────────────────────────────────────────────
  interface ProblemStatement {
    id: number;
    hackathon: number;
    hackathon_title: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tech_stack: string[];
    order: number;
    application_count: number;
    created_at: string;
  }
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
  const [problemHackathonId, setProblemHackathonId] = useState<string>('');
  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<ProblemStatement | null>(null);
  const [modalHackathonId, setModalHackathonId] = useState<string>(''); // hackathon selected inside modal
  const [problemTitle, setProblemTitle] = useState('');
  const [problemDesc, setProblemDesc] = useState('');
  const [problemDifficulty, setProblemDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [problemTechStack, setProblemTechStack] = useState<string[]>([]);
  const [problemTechInput, setProblemTechInput] = useState('');
  const [problemOrder, setProblemOrder] = useState(0);
  const [problemSubmitting, setProblemSubmitting] = useState(false);
  // ────────────────────────────────────────────────────────────────────────────

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHackathon, setFilterHackathon] = useState<string>('all');

  // Form States for Hackathon Create/Edit
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [rules, setRules] = useState('');
  const [theme, setTheme] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [mode, setMode] = useState<'online' | 'offline' | 'hybrid'>('online');
  const [venue, setVenue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [regDeadline, setRegDeadline] = useState('');
  const [presDate, setPresDate] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [regFee, setRegFee] = useState('0.00');
  const [maxTeams, setMaxTeams] = useState(50);
  const [maxMembers, setMaxMembers] = useState(5);
  const [judging, setJudging] = useState('');
  const [statusVal, setStatusVal] = useState<'draft' | 'published' | 'closed' | 'completed'>('draft');

  // Dynamic FAQs input
  const [formFaqs, setFormFaqs] = useState<{ question: string; answer: string }[]>([]);
  // Dynamic Sponsors input
  const [formSponsors, setFormSponsors] = useState<{ name: string; logo: string }[]>([]);

  // Email Blaster state
  const [emailHackathonId, setEmailHackathonId] = useState('');
  const [emailReminderType, setEmailReminderType] = useState('7_days');
  const [emailCustomContent, setEmailCustomContent] = useState('');

  // Payment search & status filter
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  // Certificate state variables
  const [selectedCertHackathonId, setSelectedCertHackathonId] = useState('');
  const [winnerTeamId, setWinnerTeamId] = useState('');
  const [runnerUpTeamId, setRunnerUpTeamId] = useState('');
  const [selectedParticipationTeamIds, setSelectedParticipationTeamIds] = useState<number[]>([]);

  // Settings State
  const [globalMaxMembers, setGlobalMaxMembers] = useState(5);
  const [globalRegFee, setGlobalRegFee] = useState('199.00');
  const [globalMaxTeams, setGlobalMaxTeams] = useState(50);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'hackathons') {
        const res = await api.get('/hackathons/');
        setHackathons(res.data);
      } else if (activeTab === 'problems') {
        const hacks = await api.get('/hackathons/');
        setHackathons(hacks.data);
        if (hacks.data.length > 0) {
          const firstId = String(hacks.data[0].id);
          const useId = problemHackathonId || firstId;
          if (!problemHackathonId) setProblemHackathonId(firstId);
          const ps = await api.get(`/hackathon-problem-statements/?hackathon_id=${useId}`);
          setProblemStatements(ps.data);
        }
      } else if (activeTab === 'applications') {
        const res = await api.get('/hackathon-applications/');
        setApplications(res.data);
        const hacks = await api.get('/hackathons/');
        setHackathons(hacks.data);
      } else if (activeTab === 'teams') {
        const res = await api.get('/hackathon-teams/');
        setTeams(res.data);
        const hacks = await api.get('/hackathons/');
        setHackathons(hacks.data);
      } else if (activeTab === 'payments') {
        const res = await api.get('/hackathon-payments/');
        setPayments(res.data);
        // Also fetch analytics summary
        const ana = await api.get('/admin/hackathons/analytics/');
        setAnalytics(ana.data);
      } else if (activeTab === 'analytics') {
        const ana = await api.get('/admin/hackathons/analytics/');
        setAnalytics(ana.data);
      } else if (activeTab === 'emails') {
        const res = await api.get('/hackathon-emails/');
        setEmailLogs(res.data);
        const hacks = await api.get('/hackathons/');
        setHackathons(hacks.data);
      } else if (activeTab === 'certificates') {
        const hacks = await api.get('/hackathons/');
        setHackathons(hacks.data);
        if (hacks.data.length > 0 && !selectedCertHackathonId) {
          setSelectedCertHackathonId(String(hacks.data[0].id));
        }
        const teamsRes = await api.get('/hackathon-teams/');
        setTeams(teamsRes.data);
      } else if (activeTab === 'settings') {
        // try to fetch settings
        try {
          const res = await api.get('/hackathon-settings/');
          const maxMem = res.data.find((s: any) => s.key === 'max_team_members');
          const fee = res.data.find((s: any) => s.key === 'default_registration_fee');
          const lim = res.data.find((s: any) => s.key === 'default_max_teams');
          if (maxMem) setGlobalMaxMembers(maxMem.value);
          if (fee) setGlobalRegFee(fee.value);
          if (lim) setGlobalMaxTeams(lim.value);
        } catch (e) {
          console.log("Settings not initialized yet, using defaults");
        }
      }
    } catch (err) {
      console.error("Error loading admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewClick = () => {
    setEditingHackathon(null);
    setTitle('');
    setDescription('');
    setProblemStatement('');
    setRules('');
    setTheme('');
    setCategory('');
    setDifficulty('Medium');
    setMode('online');
    setVenue('');
    setStartDate('');
    setEndDate('');
    setRegDeadline('');
    setPresDate('');
    setPrizePool('');
    setRegFee('0.00');
    setMaxTeams(50);
    setMaxMembers(5);
    setJudging('');
    setFormFaqs([]);
    setFormSponsors([]);
    setStatusVal('draft');
    setModalOpen(true);
  };

  const handleEditClick = (hack: Hackathon) => {
    setEditingHackathon(hack);
    setTitle(hack.title);
    setDescription(hack.description);
    setProblemStatement(hack.problem_statement || '');
    setRules(hack.rules || '');
    setTheme(hack.theme);
    setCategory(hack.category || '');
    setDifficulty(hack.difficulty);
    setMode(hack.mode);
    setVenue(hack.venue || '');
    setStartDate(hack.start_date.substring(0, 16));
    setEndDate(hack.end_date.substring(0, 16));
    setRegDeadline(hack.registration_deadline.substring(0, 16));
    setPresDate(hack.presentation_date ? hack.presentation_date.substring(0, 10) : '');
    setPrizePool(hack.prize_pool);
    setRegFee(hack.registration_fee);
    setMaxTeams(hack.max_teams);
    setMaxMembers(hack.max_team_members);
    setJudging(hack.judging_criteria || '');
    setFormFaqs(hack.faqs || []);
    setFormSponsors(hack.sponsors || []);
    setStatusVal(hack.status);
    setModalOpen(true);
  };

  const handleSaveHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      title,
      description,
      problem_statement: problemStatement,
      rules,
      theme,
      category,
      difficulty,
      mode,
      venue,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      registration_deadline: new Date(regDeadline).toISOString(),
      presentation_date: presDate ? new Date(presDate).toISOString() : null,
      prize_pool: prizePool,
      registration_fee: regFee,
      max_teams: maxTeams,
      max_team_members: maxMembers,
      judging_criteria: judging,
      faqs: formFaqs,
      sponsors: formSponsors,
      status: statusVal
    };

    try {
      if (editingHackathon) {
        await api.put(`/hackathons/${editingHackathon.id}/`, payload);
      } else {
        await api.post('/hackathons/', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to save hackathon. Verify input formats.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (hack: Hackathon, newStatus: Hackathon['status']) => {
    try {
      await api.patch(`/hackathons/${hack.id}/`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Problem Statement Handlers ──────────────────────────────────────────────
  const fetchProblems = async (hackId: string) => {
    try {
      const ps = await api.get(`/hackathon-problem-statements/?hackathon_id=${hackId}`);
      setProblemStatements(ps.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProblemHackathonChange = async (hid: string) => {
    setProblemHackathonId(hid);
    await fetchProblems(hid);
  };

  const openAddProblem = async () => {
    // Ensure hackathons are loaded before opening modal
    let hackList = hackathons;
    if (hackathons.length === 0) {
      try {
        const hacks = await api.get('/hackathons/');
        setHackathons(hacks.data);
        hackList = hacks.data;
        if (hacks.data.length > 0 && !problemHackathonId) {
          setProblemHackathonId(String(hacks.data[0].id));
        }
      } catch (err) {
        console.error('Failed to fetch hackathons', err);
      }
    }
    const defaultHackId = problemHackathonId || (hackList.length > 0 ? String(hackList[0].id) : '');
    setModalHackathonId(defaultHackId);
    setEditingProblem(null);
    setProblemTitle('');
    setProblemDesc('');
    setProblemDifficulty('medium');
    setProblemTechStack([]);
    setProblemTechInput('');
    setProblemOrder(0);
    setProblemModalOpen(true);
  };

  const openEditProblem = (p: ProblemStatement) => {
    setEditingProblem(p);
    setModalHackathonId(String(p.hackathon));
    setProblemTitle(p.title);
    setProblemDesc(p.description);
    setProblemDifficulty(p.difficulty);
    setProblemTechStack(p.tech_stack || []);
    setProblemTechInput('');
    setProblemOrder(p.order);
    setProblemModalOpen(true);
  };

  const handleAddTechTag = () => {
    const tag = problemTechInput.trim();
    if (tag && !problemTechStack.includes(tag)) {
      setProblemTechStack([...problemTechStack, tag]);
    }
    setProblemTechInput('');
  };

  const handleRemoveTechTag = (tag: string) => {
    setProblemTechStack(problemTechStack.filter(t => t !== tag));
  };

  const handleSaveProblem = async (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();
    const hackId = modalHackathonId || problemHackathonId;
    if (!hackId) { alert('Please select a hackathon first.'); return; }
    setProblemSubmitting(true);
    const payload = {
      hackathon: parseInt(hackId),
      title: problemTitle,
      description: problemDesc,
      difficulty: problemDifficulty,
      tech_stack: problemTechStack,
      order: problemOrder,
    };
    try {
      if (editingProblem) {
        await api.put(`/hackathon-problem-statements/${editingProblem.id}/`, payload);
      } else {
        await api.post('/hackathon-problem-statements/', payload);
      }
      // Refresh the list
      if (hackId === (problemHackathonId || hackId)) {
        setProblemHackathonId(hackId);
      }
      await fetchProblems(hackId);
      if (addAnother) {
        // Reset form fields but keep modal open and hackathon selected
        setProblemTitle('');
        setProblemDesc('');
        setProblemDifficulty('medium');
        setProblemTechStack([]);
        setProblemTechInput('');
        setProblemOrder(0);
        setEditingProblem(null);
      } else {
        setProblemModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save problem statement.');
    } finally {
      setProblemSubmitting(false);
    }
  };

  const handleDeleteProblem = async (id: number) => {
    if (!window.confirm('Delete this problem statement? This cannot be undone.')) return;
    try {
      await api.delete(`/hackathon-problem-statements/${id}/`);
      await fetchProblems(problemHackathonId);
    } catch (err) {
      console.error(err);
      alert('Failed to delete problem statement.');
    }
  };
  // ────────────────────────────────────────────────────────────────────────────

  // Applications approval handlers
  const handleApprove = async (id: number) => {
    try {
      await api.post(`/hackathon-applications/${id}/approve/`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.post(`/hackathon-applications/${id}/reject/`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleWaitlist = async (id: number) => {
    try {
      await api.post(`/hackathon-applications/${id}/waitlist/`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = (hackathonId: number) => {
    window.open(`${api.defaults.baseURL}/hackathon-applications/export_csv/?hackathon_id=${hackathonId}`, '_blank');
  };

  const handleApprovePayment = async (id: number) => {
    if (!window.confirm("Are you sure you want to verify and approve this payment? This will also approve the team registration application.")) return;
    setLoading(true);
    try {
      await api.post(`/hackathon-payments/${id}/approve/`);
      alert("Payment verified and application approved successfully!");
      
      // Refresh all state data
      const res = await api.get('/hackathon-payments/');
      setPayments(res.data);
      const ana = await api.get('/admin/hackathons/analytics/');
      setAnalytics(ana.data);
      const apps = await api.get('/hackathon-applications/');
      setApplications(apps.data);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to approve payment.");
    } finally {
      setLoading(false);
    }
  };

  // Email Reminders Trigger
  const handleSendReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailHackathonId) {
      alert("Please select a hackathon first.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/hackathon-emails/send_broadcast_reminder/', {
        hackathon_id: emailHackathonId,
        reminder_type: emailReminderType,
        content: emailCustomContent
      });
      alert("Broadcast reminder emails dispatched successfully.");
      setEmailCustomContent('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to send broadcast emails.");
    } finally {
      setSubmitting(false);
    }
  };

  // Settings updates
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Create/update bulk settings endpoints
      await api.post('/hackathon-settings/', { key: 'max_team_members', value: globalMaxMembers });
      await api.post('/hackathon-settings/', { key: 'default_registration_fee', value: globalRegFee });
      await api.post('/hackathon-settings/', { key: 'default_max_teams', value: globalMaxTeams });
      alert("Admin Hackathon configurations updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update configurations.");
    } finally {
      setSubmitting(false);
    }
  };

  // Certificates generation
  const handleGenerateCerts = async () => {
    if (!selectedCertHackathonId) {
      alert("Please select a hackathon first.");
      return;
    }
    
    setSubmitting(true);
    try {
      const hackathonId = parseInt(selectedCertHackathonId);
      let successMessages: string[] = [];

      // 1. Dispatch Winner if selected
      if (winnerTeamId) {
        await api.post('/hackathon-certificates/generate_certificates/', {
          hackathon_id: hackathonId,
          type: 'winner',
          teams: [parseInt(winnerTeamId)]
        });
        successMessages.push("Winner certificates generated.");
      }

      // 2. Dispatch Runner-Up if selected
      if (runnerUpTeamId) {
        await api.post('/hackathon-certificates/generate_certificates/', {
          hackathon_id: hackathonId,
          type: 'runner_up',
          teams: [parseInt(runnerUpTeamId)]
        });
        successMessages.push("Runner-Up certificates generated.");
      }

      // 3. Dispatch Participation if any selected
      if (selectedParticipationTeamIds.length > 0) {
        await api.post('/hackathon-certificates/generate_certificates/', {
          hackathon_id: hackathonId,
          type: 'participation',
          teams: selectedParticipationTeamIds
        });
        successMessages.push("Participation certificates generated.");
      }

      if (successMessages.length === 0) {
        alert("No teams were selected for certificate generation.");
      } else {
        alert(`Certificates generated and dispatched successfully!\n- ${successMessages.join('\n- ')}`);
        // Reset selections
        setWinnerTeamId('');
        setRunnerUpTeamId('');
        setSelectedParticipationTeamIds([]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate or dispatch certificates.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper inputs arrays updates
  const addFormFaq = () => {
    setFormFaqs([...formFaqs, { question: '', answer: '' }]);
  };

  const removeFormFaq = (idx: number) => {
    setFormFaqs(formFaqs.filter((_, i) => i !== idx));
  };

  const updateFormFaq = (idx: number, field: 'question' | 'answer', val: string) => {
    const updated = [...formFaqs];
    updated[idx][field] = val;
    setFormFaqs(updated);
  };

  const addFormSponsor = () => {
    setFormSponsors([...formSponsors, { name: '', logo: '' }]);
  };

  const removeFormSponsor = (idx: number) => {
    setFormSponsors(formSponsors.filter((_, i) => i !== idx));
  };

  const updateFormSponsor = (idx: number, field: 'name' | 'logo', val: string) => {
    const updated = [...formSponsors];
    updated[idx][field] = val;
    setFormSponsors(updated);
  };

  // Filter application listings safely
  const filteredApps = applications.filter(app => {
    const leaderName = app.team_details?.leader_name || '';
    const teamName = app.team_details?.name || '';
    const query = searchQuery.toLowerCase();
    
    const leaderMatch = leaderName.toLowerCase().includes(query) || 
                        teamName.toLowerCase().includes(query);
    const matchesHackathon = filterHackathon === 'all' || String(app.hackathon) === filterHackathon;
    return leaderMatch && matchesHackathon;
  });

  // Filter teams listings safely
  const filteredTeams = teams.filter(t => {
    const teamName = t.name || '';
    const leaderName = t.leader_name || '';
    const query = searchQuery.toLowerCase();
    
    const teamMatch = teamName.toLowerCase().includes(query) || 
                      leaderName.toLowerCase().includes(query);
    const matchesHackathon = filterHackathon === 'all' || String(t.hackathon) === filterHackathon;
    return teamMatch && matchesHackathon;
  });

  // Filter payments listings safely
  const filteredPayments = payments.filter(pay => {
    const teamName = pay.team_name || '';
    const invoiceNum = pay.invoice_number || '';
    const paymentId = pay.payment_id || '';
    const query = paymentSearch.toLowerCase();
    
    const searchMatch = teamName.toLowerCase().includes(query) ||
                        invoiceNum.toLowerCase().includes(query) ||
                        paymentId.toLowerCase().includes(query);
    const statusMatch = paymentStatusFilter === 'all' || pay.status === paymentStatusFilter;
    return searchMatch && statusMatch;
  });

  if (modalOpen) {
    return (
      <div className="space-y-6 select-none max-w-4xl mx-auto">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Hackathon Admin Suite
          </button>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-350">
            {editingHackathon ? 'Edit Event' : 'Create Event'}
          </span>
        </div>

        {/* Editor Form Inline */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-black text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-3 mb-6">
            {editingHackathon ? 'Edit Hackathon Details' : 'Create New Hackathon Event'}
          </h3>

          <form onSubmit={handleSaveHackathon} className="space-y-6">
            
            {/* Basic Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. National Hackathon Challenge"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Theme *</label>
                <input
                  type="text"
                  required
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. FinTech, AI, HealthCare"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Category (Optional)</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Open Innovation"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Mode *</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none cursor-pointer"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Venue / Video Link</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Campus Labs, Teams Link"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-850 pt-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">End Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Reg Deadline *</label>
                <input
                  type="datetime-local"
                  required
                  value={regDeadline}
                  onChange={(e) => setRegDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Financials & Limits */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-slate-100 dark:border-slate-850 pt-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Prize Pool *</label>
                <input
                  type="text"
                  required
                  value={prizePool}
                  onChange={(e) => setPrizePool(e.target.value)}
                  placeholder="e.g. ₹1,00,000"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Reg Fee (INR) *</label>
                <input
                  type="text"
                  required
                  value={regFee}
                  onChange={(e) => setRegFee(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Max Teams Limit *</label>
                <input
                  type="number"
                  required
                  value={maxTeams}
                  onChange={(e) => setMaxTeams(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Max Team Size *</label>
                <input
                  type="number"
                  required
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none"
                />
              </div>
            </div>

            {/* Text Areas */}
            <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="General description of the hackathon..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Problem Statement Tracks</label>
                <textarea
                  rows={3}
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Enter details of problem statements or specific themes..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Rules & Guidelines</label>
                <textarea
                  rows={3}
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder="General rules of code submission..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Judging & Evaluation Criteria</label>
                <textarea
                  rows={2}
                  value={judging}
                  onChange={(e) => setJudging(e.target.value)}
                  placeholder="Criteria used to select winner teams..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none"
                ></textarea>
              </div>
            </div>

            {/* Status config */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-4">
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Event Status</label>
              <select
                value={statusVal}
                onChange={(e) => setStatusVal(e.target.value as any)}
                className="px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Dynamic Sponsors & FAQs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-850 pt-4">
              
              {/* Dynamic FAQs */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Manage FAQs</span>
                  <button type="button" onClick={addFormFaq} className="text-[10px] text-blue-650 dark:text-blue-400 font-bold hover:underline">
                    + Add FAQ
                  </button>
                </div>
                {formFaqs.map((faq, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150/40 dark:border-slate-800 space-y-2 relative">
                    <button type="button" onClick={() => removeFormFaq(idx)} className="absolute top-1 right-2 text-red-500 font-bold text-xs">
                      ×
                    </button>
                    <input
                      type="text"
                      placeholder="FAQ Question"
                      value={faq.question}
                      onChange={(e) => updateFormFaq(idx, 'question', e.target.value)}
                      className="w-full px-2 py-1 text-[11px] border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="FAQ Answer"
                      value={faq.answer}
                      onChange={(e) => updateFormFaq(idx, 'answer', e.target.value)}
                      className="w-full px-2 py-1 text-[11px] border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900"
                    />
                  </div>
                ))}
              </div>

              {/* Dynamic Sponsors */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Manage Sponsors</span>
                  <button type="button" onClick={addFormSponsor} className="text-[10px] text-blue-650 dark:text-blue-400 font-bold hover:underline">
                    + Add Sponsor
                  </button>
                </div>
                {formSponsors.map((sp, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150/40 dark:border-slate-800 space-y-2 relative">
                    <button type="button" onClick={() => removeFormSponsor(idx)} className="absolute top-1 right-2 text-red-500 font-bold text-xs">
                      ×
                    </button>
                    <input
                      type="text"
                      placeholder="Sponsor Name"
                      value={sp.name}
                      onChange={(e) => updateFormSponsor(idx, 'name', e.target.value)}
                      className="w-full px-2 py-1 text-[11px] border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900"
                    />
                    <input
                      type="url"
                      placeholder="Logo URL"
                      value={sp.logo}
                      onChange={(e) => updateFormSponsor(idx, 'logo', e.target.value)}
                      className="w-full px-2 py-1 text-[11px] border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900"
                    />
                  </div>
                ))}
              </div>

            </div>

            {/* Form Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 border border-slate-250 dark:border-slate-800 text-slate-705 dark:text-slate-400 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-650 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                {submitting ? 'Saving...' : 'Save Hackathon'}
              </button>
            </div>

          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      
      {/* Header title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Hackathon Admin Suite
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publish hackathons, inspect applications, review payment charts, and trigger scheduled reminders.
          </p>
        </div>
        
        {activeTab === 'hackathons' && (
          <button
            onClick={handleCreateNewClick}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <PlusCircle size={15} /> Create Hackathon
          </button>
        )}
        {activeTab === 'problems' && (
          <button
            onClick={openAddProblem}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <PlusCircle size={15} /> Add Problem Statement
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {[
          { id: 'hackathons', label: 'Hackathons', icon: Trophy },
          { id: 'problems', label: 'Problem Statements', icon: Layers },
          { id: 'applications', label: 'Applications', icon: FileText },
          { id: 'teams', label: 'Teams', icon: Users },
          { id: 'payments', label: 'Payments', icon: DollarSign },
          { id: 'analytics', label: 'Analytics', icon: BarChart },
          { id: 'certificates', label: 'Certificates', icon: Award },
          { id: 'emails', label: 'Emails Blaster', icon: Mail },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                active 
                  ? 'border-blue-600 text-blue-650 dark:border-blue-500 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-950/10'
                  : 'border-transparent text-slate-550 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6">
          <div className="h-10 bg-slate-200 dark:bg-slate-850 rounded-xl animate-pulse w-1/3"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-850 rounded-2xl animate-pulse"></div>
        </div>
      ) : (
        <>
          {/* TAB: PROBLEM STATEMENTS MANAGEMENT */}
          {activeTab === 'problems' && (
            <div className="space-y-6 animate-fade-in">

              {/* Problem Statement Create/Edit Modal */}
              {problemModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers size={18} className="text-blue-600" />
                        {editingProblem ? 'Edit Problem Statement' : 'Add Problem Statement'}
                      </h3>
                      <button onClick={() => setProblemModalOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                    <form onSubmit={(e) => handleSaveProblem(e, false)} className="space-y-4">
                      {/* Hackathon Selector inside modal */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Hackathon *</label>
                        {hackathons.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No hackathons found. Create one first.</p>
                        ) : (
                          <select
                            required
                            value={modalHackathonId}
                            onChange={e => setModalHackathonId(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-semibold"
                          >
                            <option value="">-- Select Hackathon --</option>
                            {hackathons.map(h => (
                              <option key={h.id} value={h.id}>{h.title}</option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Title *</label>
                        <input type="text" required value={problemTitle} onChange={e => setProblemTitle(e.target.value)}
                          placeholder="e.g. AI-Powered Healthcare Solution"
                          className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Description *</label>
                        <textarea required rows={4} value={problemDesc} onChange={e => setProblemDesc(e.target.value)}
                          placeholder="Describe the problem, context, expected solution, and constraints..."
                          className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 block mb-1">Difficulty *</label>
                          <select value={problemDifficulty} onChange={e => setProblemDifficulty(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none cursor-pointer">
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 block mb-1">Display Order</label>
                          <input type="number" value={problemOrder} onChange={e => setProblemOrder(parseInt(e.target.value) || 0)}
                            className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none" />
                        </div>
                      </div>
                      {/* Tech Stack Tag Input */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Recommended Tech Stack</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={problemTechInput}
                            onChange={e => setProblemTechInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTechTag(); } }}
                            placeholder="e.g. React, Python, AI/ML — press Enter to add"
                            className="flex-1 px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button type="button" onClick={handleAddTechTag}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors">
                            Add
                          </button>
                        </div>
                        {problemTechStack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {problemTechStack.map(tag => (
                              <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 rounded-full text-[10px] font-bold">
                                {tag}
                                <button type="button" onClick={() => handleRemoveTechTag(tag)} className="hover:text-red-500 transition-colors cursor-pointer">
                                  <X size={10} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                        <button type="button" onClick={() => setProblemModalOpen(false)}
                          className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          Cancel
                        </button>
                        {!editingProblem && (
                          <button
                            type="button"
                            disabled={problemSubmitting}
                            onClick={(e) => handleSaveProblem(e as any, true)}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all flex items-center gap-2"
                          >
                            {problemSubmitting && <Loader size={12} className="animate-spin" />}
                            Save & Add Another
                          </button>
                        )}
                        <button type="submit" disabled={problemSubmitting}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all flex items-center gap-2">
                          {problemSubmitting && <Loader size={12} className="animate-spin" />}
                          {editingProblem ? 'Update Problem' : 'Save & Close'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Header + Hackathon Picker */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl px-6 py-4 shadow-sm">
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers size={16} className="text-blue-600" /> Problem Statements Manager
                  </h2>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Add, edit, and manage problem statements for each hackathon. Students can apply to one per event.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={problemHackathonId}
                    onChange={e => handleProblemHackathonChange(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none cursor-pointer font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {hackathons.map(h => (
                      <option key={h.id} value={h.id}>{h.title}</option>
                    ))}
                  </select>
                  <button onClick={openAddProblem}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer">
                    <PlusCircle size={14} /> Add Problem
                  </button>
                </div>
              </div>

              {/* Problem Statement Cards */}
              {problemStatements.length === 0 ? (
                <div className="text-center py-20 bg-white/40 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                  <h3 className="font-bold text-slate-700 dark:text-slate-400">No Problem Statements Yet</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click 'Add Problem' to create the first problem statement for this hackathon.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {problemStatements.map((ps, idx) => {
                    const diffColor = ps.difficulty === 'easy'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/40'
                      : ps.difficulty === 'medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/40'
                      : 'bg-red-50 text-red-700 border-red-200/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/40';
                    return (
                      <div key={ps.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3 relative">
                        {/* Card top badge strip */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full border ${diffColor}`}>
                              {ps.difficulty}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">#{idx + 1}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button onClick={() => openEditProblem(ps)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer" title="Edit">
                              <Edit3 size={13} />
                            </button>
                            <button onClick={() => handleDeleteProblem(ps.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors cursor-pointer" title="Delete">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="font-black text-sm text-slate-900 dark:text-white leading-tight">{ps.title}</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">{ps.description}</p>
                        </div>

                        {/* Tech Stack Tags */}
                        {ps.tech_stack && ps.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {ps.tech_stack.map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 text-[9px] font-bold rounded-full border border-slate-200/60 dark:border-slate-750">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer — application count */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                            <Users size={13} className="text-blue-500" />
                            <span>{ps.application_count} {ps.application_count === 1 ? 'Team' : 'Teams'} Applied</span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">Order: {ps.order}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: HACKATHONS MANAGEMENT */}
          {activeTab === 'hackathons' && (

            <div className="grid grid-cols-1 gap-6">
              {hackathons.length === 0 ? (
                <div className="text-center py-20 bg-white/40 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Trophy size={48} className="mx-auto text-slate-300 dark:text-slate-750 mb-4" />
                  <h3 className="font-bold text-slate-700 dark:text-slate-450">No Hackathons Created</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-550 mt-1">Click 'Create Hackathon' above to set up your first challenge.</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-450 font-bold border-b border-slate-150 dark:border-slate-850">
                          <th className="px-6 py-3">Event Details</th>
                          <th className="px-6 py-3">Theme</th>
                          <th className="px-6 py-3">Dates</th>
                          <th className="px-6 py-3">Registrations</th>
                          <th className="px-6 py-3">Fee & Prize</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-750 dark:text-slate-350">
                        {hackathons.map(hack => (
                          <tr key={hack.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                            <td className="px-6 py-4">
                              <span className="font-bold text-slate-900 dark:text-white block">{hack.title}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Mode: <span className="capitalize">{hack.mode}</span> | Difficulty: {hack.difficulty}</span>
                            </td>
                            <td className="px-6 py-4">{hack.theme}</td>
                            <td className="px-6 py-4">
                              <span>Start: {new Date(hack.start_date).toLocaleDateString()}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Deadline: {new Date(hack.registration_deadline).toLocaleDateString()}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{hack.registered_teams_count} / {hack.max_teams}</span>
                                <span className="text-[10px] text-slate-400">({hack.registration_percentage}%)</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-slate-900 dark:text-white block">Fee: ₹{Math.round(parseFloat(hack.registration_fee))}</span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Pool: {hack.prize_pool}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${
                                hack.status === 'published' ? 'bg-emerald-500/10 text-emerald-650 border-emerald-500/20' :
                                hack.status === 'completed' ? 'bg-blue-500/10 text-blue-650 border-blue-500/20' :
                                hack.status === 'closed' ? 'bg-red-500/10 text-red-650 border-red-500/20' :
                                'bg-slate-500/10 text-slate-650 border-slate-550/20'
                              }`}>
                                {hack.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditClick(hack)}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-blue-650"
                                  title="Edit hackathon details"
                                >
                                  <Edit3 size={14} />
                                </button>
                                
                                {hack.status === 'draft' && (
                                  <button
                                    onClick={() => handleToggleStatus(hack, 'published')}
                                    className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold text-[10px] uppercase shadow-sm"
                                  >
                                    Publish
                                  </button>
                                )}

                                {hack.status === 'published' && (
                                  <button
                                    onClick={() => handleToggleStatus(hack, 'closed')}
                                    className="px-2 py-0.5 bg-red-550 text-white rounded font-bold text-[10px] uppercase shadow-sm"
                                  >
                                    Close
                                  </button>
                                )}

                                {hack.status === 'closed' && (
                                  <button
                                    onClick={() => handleToggleStatus(hack, 'completed')}
                                    className="px-2 py-0.5 bg-blue-600 text-white rounded font-bold text-[10px] uppercase shadow-sm"
                                  >
                                    Complete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: APPLICATIONS APPROVAL */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              
              {/* Toolbar */}
              <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                
                <div className="relative w-full md:w-80">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search team or leader..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
                  <select
                    value={filterHackathon}
                    onChange={(e) => setFilterHackathon(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">All Hackathons</option>
                    {hackathons.map(h => (
                      <option key={h.id} value={h.id}>{h.title}</option>
                    ))}
                  </select>

                  {filterHackathon !== 'all' && (
                    <button
                      onClick={() => handleExportCSV(parseInt(filterHackathon))}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-all shadow-sm"
                    >
                      <Download size={13} /> Export CSV
                    </button>
                  )}
                </div>

              </div>

              {/* Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm overflow-hidden">
                {filteredApps.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-550">
                    No applications matching criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-450 font-bold border-b border-slate-150 dark:border-slate-850">
                          <th className="px-6 py-3">Team Name</th>
                          <th className="px-6 py-3">Hackathon</th>
                          <th className="px-6 py-3">Leader</th>
                          <th className="px-6 py-3">Members Count</th>
                          <th className="px-6 py-3">Payment</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3 text-right">Decisions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-750 dark:text-slate-350">
                        {filteredApps.map(app => (
                          <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                            <td className="px-6 py-3.5">
                              <span className="font-bold text-slate-900 dark:text-white block">{app.team_details?.name}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">{app.team_details?.college}</span>
                            </td>
                            <td className="px-6 py-3.5">{app.hackathon_title}</td>
                            <td className="px-6 py-3.5">
                              <span>{app.team_details?.leader_name}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{app.team_details?.leader_email}</span>
                            </td>
                            <td className="px-6 py-3.5">{(app.team_details?.members?.length || 0) + 1} / {hackathons.find(h=>h.id===app.hackathon)?.max_team_members || 5}</td>
                             <td className="px-6 py-3.5 space-y-1">
                              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                                app.team_details?.payment_status === 'success' 
                                  ? 'bg-emerald-500/10 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400' 
                                  : app.team_details?.payment_status === 'pending'
                                  ? 'bg-amber-500/10 text-amber-650 dark:bg-amber-955/20 dark:text-amber-400'
                                  : 'bg-slate-100 text-slate-550 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {app.team_details?.payment_status === 'none' ? 'unpaid' : (app.team_details?.payment_status || 'unpaid')}
                              </span>
                              {app.team_details?.payment_status === 'pending' && (
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold space-y-0.5">
                                  <span className="block font-mono bg-slate-50 dark:bg-slate-950 px-1 py-0.5 rounded border border-slate-100 dark:border-slate-850 w-max">
                                    UTR: {app.team_details?.utr_number}
                                  </span>
                                  {app.team_details?.payment_record_id && (
                                    <button
                                      onClick={() => handleApprovePayment(app.team_details.payment_record_id!)}
                                      className="text-[9px] text-emerald-650 dark:text-emerald-400 hover:underline font-black cursor-pointer block text-left"
                                    >
                                      Approve Payment
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-3.5">
                              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${
                                app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-650 border-emerald-500/20' :
                                app.status === 'rejected' ? 'bg-red-500/10 text-red-650 border-red-500/20' :
                                app.status === 'waitlisted' ? 'bg-amber-500/10 text-amber-650 border-amber-500/20' :
                                'bg-blue-500/10 text-blue-650 border-blue-500/20'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {app.status !== 'approved' && (
                                  <button
                                    onClick={() => handleApprove(app.id)}
                                    className="p-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded transition-all cursor-pointer"
                                    title="Approve Application"
                                  >
                                    <Check size={12} />
                                  </button>
                                )}

                                {app.status !== 'rejected' && (
                                  <button
                                    onClick={() => handleReject(app.id)}
                                    className="p-1 bg-red-500/10 text-red-650 hover:bg-red-550 hover:text-white border border-red-500/20 rounded transition-all cursor-pointer"
                                    title="Reject Application"
                                  >
                                    <X size={12} />
                                  </button>
                                )}

                                {app.status === 'pending' && (
                                  <button
                                    onClick={() => handleWaitlist(app.id)}
                                    className="px-2 py-1 bg-amber-500/10 text-amber-650 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/20 rounded transition-all font-bold text-[9px] uppercase cursor-pointer"
                                  >
                                    Waitlist
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: TEAMS */}
          {activeTab === 'teams' && (
            <div className="space-y-6">
              
              {/* Toolbar */}
              <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                
                <div className="relative w-full md:w-80">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <select
                    value={filterHackathon}
                    onChange={(e) => setFilterHackathon(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">All Hackathons</option>
                    {hackathons.map(h => (
                      <option key={h.id} value={h.id}>{h.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* listings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTeams.map(team => {
                  const hackInfo = hackathons.find(h => h.id === team.hackathon);
                  return (
                    <div key={team.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase bg-blue-550/10 text-blue-600 dark:text-blue-400 border border-blue-550/20 px-2 py-0.5 rounded">
                          {hackInfo?.title || 'Hackathon Event'}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2 leading-tight">
                          {team.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Registration ID: {team.registration_number}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1 text-slate-500 dark:text-slate-450 border-r border-slate-100 dark:border-slate-850 pr-2">
                          <h4 className="font-bold text-slate-800 dark:text-slate-300">Leader details</h4>
                          <p>Name: {team.leader_name}</p>
                          <p>Email: {team.leader_email}</p>
                          <p>Roll No: {team.leader_roll_number}</p>
                          <p>Mobile: {team.leader_mobile}</p>
                        </div>
                        <div className="space-y-1 text-slate-500 dark:text-slate-450">
                          <h4 className="font-bold text-slate-800 dark:text-slate-300">Academic info</h4>
                          <p>College: {team.college}</p>
                          <p>Dept: {team.department}</p>
                          <p>Year: {team.year} Year</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-850 pt-3">
                        <h4 className="font-bold text-slate-850 dark:text-slate-300 text-xs mb-1.5">Co-Members ({team.members.length})</h4>
                        {team.members.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">No co-members registered (Solo)</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {team.members.map((m, idx) => (
                              <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-850 text-slate-650 dark:text-slate-350 text-[10px] font-medium rounded-lg border border-slate-200/50 dark:border-slate-800" title={m.phone}>
                                {m.name} ({m.email})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 4: FINANCE & PAYMENTS DASHBOARD */}
          {activeTab === 'payments' && analytics && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "Today's Revenue", val: `₹${Math.round(analytics.metrics.today_revenue)}`, icon: DollarSign, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20" },
                  { title: "Monthly Revenue", val: `₹${Math.round(analytics.metrics.monthly_revenue)}`, icon: DollarSign, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20" },
                  { title: "Total Revenue", val: `₹${Math.round(analytics.metrics.total_revenue)}`, icon: DollarSign, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" },
                  { title: "Successful Transactions", val: analytics.metrics.successful_payments, icon: ShieldCheck, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/20" }
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{kpi.title}</span>
                        <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">{kpi.val}</span>
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                        <Icon size={20} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Charts & Graphs Row (Dynamic CSS grids) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Popular events charts */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Revenue & Sales Per Hackathon</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Inspect performances and earnings by individual challenges.</p>
                  </div>

                  <div className="space-y-4">
                    {analytics.event_performance.map((evt: any, i: number) => {
                      const percentage = Math.min(100, (evt.registrations / evt.max_teams) * 100);
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-850 dark:text-white">{evt.title}</span>
                            <span className="text-slate-500 dark:text-slate-450">₹{Math.round(evt.revenue)} ({evt.registrations} Regs)</span>
                          </div>
                          <div className="h-3 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                            <div style={{ width: `${percentage}%` }} className="h-full bg-blue-600 rounded-full transition-all duration-500"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pie Chart / Distribution of Payments */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Transaction Status Breakdown</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Successful vs Pending checkout attempts.</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {[
                      { status: "Successful Transactions", count: analytics.metrics.successful_payments, color: "bg-emerald-500" },
                      { status: "Pending Authorizations", count: analytics.metrics.pending_payments, color: "bg-amber-500" },
                      { status: "Failed Transactions", count: analytics.metrics.failed_payments, color: "bg-red-500" }
                    ].map((item, idx) => {
                      const total = analytics.metrics.successful_payments + analytics.metrics.pending_payments + analytics.metrics.failed_payments;
                      const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
                      return (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-slate-650 dark:text-slate-400">
                            <span className={`w-3 h-3 rounded-full ${item.color} shrink-0`}></span>
                            <span>{item.status}</span>
                          </div>
                          <span className="font-bold text-slate-950 dark:text-white">{item.count} ({percent}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Transactions List */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Ledger Records</h3>
                  <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search team or code..."
                        value={paymentSearch}
                        onChange={(e) => setPaymentSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-855 dark:text-slate-200 focus:outline-none w-48 sm:w-56"
                      />
                    </div>
                    <select
                      value={paymentStatusFilter}
                      onChange={(e) => setPaymentStatusFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-705 dark:text-slate-350 focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="success">Success</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-450 font-bold border-b border-slate-150 dark:border-slate-850">
                        <th className="px-6 py-3">Invoice ID</th>
                        <th className="px-6 py-3">Hackathon</th>
                        <th className="px-6 py-3">Team Name</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Transaction Code</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Timestamp</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-750 dark:text-slate-350">
                      {filteredPayments.map(pay => (
                        <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                          <td className="px-6 py-3.5 font-bold">{pay.invoice_number}</td>
                          <td className="px-6 py-3.5">{pay.hackathon_title}</td>
                          <td className="px-6 py-3.5">{pay.team_name}</td>
                          <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">₹{Math.round(parseFloat(pay.amount))}</td>
                          <td className="px-6 py-3.5 font-mono text-[10px]">{pay.payment_id}</td>
                          <td className="px-6 py-3.5">
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${
                              pay.status === 'success' 
                                ? 'bg-emerald-500/10 text-emerald-650 border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-450'
                                : pay.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-650 border-amber-500/20 dark:bg-amber-955/20 dark:text-amber-400'
                                : 'bg-red-500/10 text-red-650 border-red-500/20 dark:bg-red-955/20 dark:text-red-400'
                            }`}>
                              {pay.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-slate-400">{new Date(pay.created_at).toLocaleString()}</td>
                          <td className="px-6 py-3.5 text-right">
                            {pay.status === 'pending' && (
                              <button
                                onClick={() => handleApprovePayment(pay.id)}
                                className="p-1 bg-emerald-500/10 text-emerald-650 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded transition-all cursor-pointer inline-flex items-center justify-center shadow-sm"
                                title="Approve & Verify Payment"
                              >
                                <Check size={12} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: ANALYTICS DETAIL */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Analytics KPI grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { title: "Total Hackathons", val: analytics.metrics.total_hackathons },
                  { title: "Active Registrations", val: analytics.metrics.total_applications },
                  { title: "Total Participants", val: analytics.metrics.total_participants },
                  { title: "Registered Colleges", val: analytics.metrics.total_colleges },
                  { title: "Upcoming Events", val: analytics.metrics.upcoming },
                  { title: "Approved Teams", val: analytics.metrics.approved_teams },
                  { title: "Average Team Size", val: `${analytics.metrics.avg_team_size} members` },
                  { title: "Popular Event", val: analytics.metrics.most_popular }
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-center">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{stat.title}</span>
                    <span className="text-xl sm:text-2xl font-black text-slate-905 dark:text-white mt-1 block truncate" title={String(stat.val)}>{stat.val}</span>
                  </div>
                ))}
              </div>

              {/* Registration trend graph mock visual representation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Registrations graph */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl shadow-sm space-y-6">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Daily Registrations Trend (Last 14 Days)</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Visual representation of daily sign-ups.</p>
                  </div>
                  
                  {analytics.daily_registrations.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-10">No recent sign-ups logged.</p>
                  ) : (
                    <div className="flex justify-between items-end h-40 pt-4 px-2">
                      {analytics.daily_registrations.map((day: any, i: number) => {
                        const maxVal = Math.max(...analytics.daily_registrations.map((d: any) => d.value)) || 1;
                        const heightPercent = (day.value / maxVal) * 100;
                        return (
                          <div key={i} className="flex flex-col items-center flex-1 gap-2">
                            <div className="relative group w-full flex justify-center">
                              <span className="absolute bottom-full mb-1 text-[9px] font-black text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                {day.value}
                              </span>
                              <div
                                style={{ height: `${Math.max(10, heightPercent)}%` }}
                                className="w-4 bg-blue-600/80 hover:bg-blue-600 rounded-t-md transition-all duration-300 shadow-sm"
                              ></div>
                            </div>
                            <span className="text-[9px] text-slate-455 font-bold mt-1 rotate-45 select-none sm:rotate-0">
                              {day.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Colleges Leaderboard */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-3xl shadow-sm space-y-6">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Top Participating Institutions</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Inspect colleges generating the highest participation metrics.</p>
                  </div>

                  <div className="space-y-4">
                    {analytics.colleges.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-10">No registered colleges found.</p>
                    ) : (
                      analytics.colleges.map((col: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 dark:border-slate-850/50 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center font-bold text-[10px] text-blue-600 dark:text-blue-400">
                              {index + 1}
                            </span>
                            <span className="font-bold text-slate-750 dark:text-slate-350">{col.college}</span>
                          </div>
                          <span className="font-black text-slate-900 dark:text-white">{col.count} Teams</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 6: CERTIFICATE GENERATION & DISTRIBUTION */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-905 dark:text-white">Generate Certificates</h3>
                  <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
                    Select the winning teams and decide participation certificates. Generated credentials will be dispatched to each member's dashboard immediately.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Select Hackathon */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-550 block mb-1">Select completed Hackathon</label>
                    <select
                      value={selectedCertHackathonId}
                      onChange={(e) => {
                        setSelectedCertHackathonId(e.target.value);
                        setWinnerTeamId('');
                        setRunnerUpTeamId('');
                        setSelectedParticipationTeamIds([]);
                      }}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 cursor-pointer"
                    >
                      <option value="">Select completed event</option>
                      {hackathons.map(h => (
                        <option key={h.id} value={h.id}>{h.title} ({h.status})</option>
                      ))}
                    </select>
                  </div>

                  {selectedCertHackathonId && (() => {
                    const eventTeams = teams.filter(t => String(t.hackathon) === String(selectedCertHackathonId));
                    return (
                      <div className="space-y-6 border-t border-slate-100 dark:border-slate-850 pt-4 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Choose Winner */}
                          <div>
                            <label className="text-[11px] font-bold text-slate-550 block mb-1">Choose Winner Team</label>
                            <select
                              value={winnerTeamId}
                              onChange={(e) => {
                                setWinnerTeamId(e.target.value);
                                if (e.target.value === runnerUpTeamId) setRunnerUpTeamId('');
                                setSelectedParticipationTeamIds(prev => prev.filter(id => id !== parseInt(e.target.value)));
                              }}
                              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 cursor-pointer"
                            >
                              <option value="">Select Winner</option>
                              {eventTeams.map(t => (
                                <option key={t.id} value={t.id}>{t.name} (Leader: {t.leader_name})</option>
                              ))}
                            </select>
                          </div>

                          {/* Choose Runner-Up */}
                          <div>
                            <label className="text-[11px] font-bold text-slate-550 block mb-1">Choose Runner-Up Team</label>
                            <select
                              value={runnerUpTeamId}
                              onChange={(e) => {
                                setRunnerUpTeamId(e.target.value);
                                setSelectedParticipationTeamIds(prev => prev.filter(id => id !== parseInt(e.target.value)));
                              }}
                              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 cursor-pointer"
                            >
                              <option value="">Select Runner-Up</option>
                              {eventTeams.filter(t => String(t.id) !== String(winnerTeamId)).map(t => (
                                <option key={t.id} value={t.id}>{t.name} (Leader: {t.leader_name})</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Participation Select list */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-1.5">
                            <label className="text-[11px] font-bold text-slate-550 block">Select remaining Teams for Participation Certificates</label>
                            {eventTeams.filter(t => String(t.id) !== String(winnerTeamId) && String(t.id) !== String(runnerUpTeamId)).length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const eligible = eventTeams
                                    .filter(t => String(t.id) !== String(winnerTeamId) && String(t.id) !== String(runnerUpTeamId))
                                    .map(t => t.id);
                                  
                                  if (selectedParticipationTeamIds.length === eligible.length) {
                                    setSelectedParticipationTeamIds([]);
                                  } else {
                                    setSelectedParticipationTeamIds(eligible);
                                  }
                                }}
                                className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                              >
                                {selectedParticipationTeamIds.length === eventTeams.filter(t => String(t.id) !== String(winnerTeamId) && String(t.id) !== String(runnerUpTeamId)).length
                                  ? 'Deselect All' : 'Select All'}
                              </button>
                            )}
                          </div>

                          {eventTeams.filter(t => String(t.id) !== String(winnerTeamId) && String(t.id) !== String(runnerUpTeamId)).length === 0 ? (
                            <p className="text-xs text-slate-400 dark:text-slate-550 italic">No remaining teams eligible for participation.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
                              {eventTeams
                                .filter(t => String(t.id) !== String(winnerTeamId) && String(t.id) !== String(runnerUpTeamId))
                                .map(t => {
                                  const checked = selectedParticipationTeamIds.includes(t.id);
                                  return (
                                    <label
                                      key={t.id}
                                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all select-none ${
                                        checked 
                                          ? 'border-blue-500/30 bg-blue-50/10 text-blue-600 dark:text-blue-400' 
                                          : 'border-slate-150/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => {
                                          if (checked) {
                                            setSelectedParticipationTeamIds(prev => prev.filter(id => id !== t.id));
                                          } else {
                                            setSelectedParticipationTeamIds(prev => [...prev, t.id]);
                                          }
                                        }}
                                        className="rounded border-slate-300 dark:border-slate-750 text-blue-650 focus:ring-blue-500 cursor-pointer"
                                      />
                                      <div className="truncate">
                                        <span className="block truncate">{t.name}</span>
                                        <span className="block text-[9px] text-slate-400 font-semibold truncate">Leader: {t.leader_name}</span>
                                      </div>
                                    </label>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <button
                  onClick={handleGenerateCerts}
                  disabled={submitting || !selectedCertHackathonId}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 animate-pulse-slow"
                >
                  {submitting ? 'Generating certificates...' : 'Generate & Dispatch Certificates'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: EMAILS CONTROL HUB */}
          {activeTab === 'emails' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Email Blaster Section */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-905 dark:text-white">Broadcast Email Notification</h3>
                  <p className="text-xs text-slate-450 dark:text-slate-550 mt-0.5">Send custom announcements or reminders to all members.</p>
                </div>

                <form onSubmit={handleSendReminder} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Target Hackathon Event</label>
                    <select
                      value={emailHackathonId}
                      onChange={(e) => setEmailHackathonId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 cursor-pointer"
                    >
                      <option value="">Select Event</option>
                      {hackathons.map(h => (
                        <option key={h.id} value={h.id}>{h.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Reminder Schedule Type</label>
                    <select
                      value={emailReminderType}
                      onChange={(e) => setEmailReminderType(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 cursor-pointer"
                    >
                      <option value="7_days">7 Days Before reminder</option>
                      <option value="3_days">3 Days Before reminder</option>
                      <option value="1_day">1 Day Before reminder</option>
                      <option value="morning">On Event Morning reminder</option>
                      <option value="custom">Custom Announcement Blast</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Custom Message Body (Optional)</label>
                    <textarea
                      rows={5}
                      value={emailCustomContent}
                      onChange={(e) => setEmailCustomContent(e.target.value)}
                      placeholder="Leave empty to use the system default notification template, or enter custom announcement..."
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-blue-650 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-xl shadow transition-all cursor-pointer"
                  >
                    <Send size={13} className="inline mr-1" /> Broadcast Emails
                  </button>

                </form>
              </div>

              {/* Log History */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-850">
                  <h3 className="font-bold text-slate-805 dark:text-slate-200 text-sm">Dispatched Email Log (Recent 30)</h3>
                </div>

                {emailLogs.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">
                    No email logs found.
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[460px] divide-y divide-slate-100 dark:divide-slate-850">
                    {emailLogs.slice(0, 30).map(log => (
                      <div key={log.id} className="p-4 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">To: {log.recipient_email}</span>
                          <span className="text-[10px] text-slate-400">{new Date(log.sent_at).toLocaleString()}</span>
                        </div>
                        <p className="mt-1 text-slate-650 dark:text-slate-350"><span className="font-bold text-slate-400">Subject:</span> {log.subject}</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Event: {log.hackathon_title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 8: ADMIN SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="font-extrabold text-sm text-slate-905 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2 mb-4">
                Default Hackathon Settings
              </h3>
              
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Default Max Team Size (bounds)</label>
                  <input
                    type="number"
                    value={globalMaxMembers}
                    onChange={(e) => setGlobalMaxMembers(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Default Registration Fee (INR)</label>
                  <input
                    type="text"
                    value={globalRegFee}
                    onChange={(e) => setGlobalRegFee(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Default Max Capacity (Teams)</label>
                  <input
                    type="number"
                    value={globalMaxTeams}
                    onChange={(e) => setGlobalMaxTeams(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-250 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-650 hover:bg-blue-750 text-white font-bold text-xs uppercase rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {submitting ? 'Saving settings...' : 'Update Configs'}
                </button>
              </form>
            </div>
          )}
        </>
      )}



    </div>
  );
};

export default HackathonAdminPanel;

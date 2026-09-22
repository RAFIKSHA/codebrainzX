import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Trophy, MapPin, Users, ArrowRight, Search, Clock, BadgeCheck, XCircle, AlertCircle, FileText, Mail, Award, CheckCircle, Download } from 'lucide-react';
import api from '../../services/api';
import { setSEOMetadata, getBreadcrumbSchema } from '../../utils/seo';

interface Hackathon {
  id: number;
  title: string;
  slug: string;
  banner_url: string | null;
  description: string;
  theme: string;
  difficulty: string;
  mode: string;
  venue: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  prize_pool: string;
  registration_fee: string;
  max_teams: number;
  status: string;
  registered_teams_count: number;
  remaining_slots: number;
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
  application_status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  hackathon: number;
  members: TeamMember[];
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
}

interface Certificate {
  id: number;
  recipient_name: string;
  recipient_email: string;
  type: 'participation' | 'winner' | 'runner_up';
  certificate_id: string;
  hackathon_title: string;
  file_url: string;
  created_at: string;
}

const HackathonDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'browse' | 'my-applications' | 'payments' | 'emails' | 'certificates'>('browse');
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // all, online, offline, hybrid
  const [filterFee, setFilterFee] = useState('all'); // all, free, paid
  const [filterStatus, setFilterStatus] = useState('all'); // all, upcoming, completed
  const [sortBy, setSortBy] = useState('newest'); // newest, prize, deadline

  // Certificate Modal State
  const [viewingCert, setViewingCert] = useState<Certificate | null>(null);

  useEffect(() => {
    setSEOMetadata({
      title: 'Hackathons | Coding Competitions & Challenges | CodexPetra',
      description: 'Participate in live coding hackathons, build innovative software projects with developer teams, win cash prizes, and earn verified credentials.',
      canonicalUrl: 'https://codexpetra.com/dashboard/hackathons',
      structuredData: getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Hackathons', url: '/dashboard/hackathons' },
      ]),
    });
    fetchBrowseData();
  }, []);

  useEffect(() => {
    if (activeTab === 'my-applications') {
      fetchMyApplications();
    } else if (activeTab === 'payments') {
      fetchPayments();
    } else if (activeTab === 'emails') {
      fetchEmails();
    } else if (activeTab === 'certificates') {
      fetchCertificates();
    }
  }, [activeTab]);

  const fetchBrowseData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hackathons/');
      setHackathons(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hackathon-teams/my_registrations/');
      setMyTeams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hackathon-payments/');
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmails = async () => {
    setLoading(true);
    try {
      // Fetch email logs where recipient_email matches user email
      const res = await api.get(`/hackathon-emails/?recipient_email=${user?.email}`);
      // Fallback filter if backend doesn't support query parameters directly in standard list
      const userEmails = res.data.filter((log: EmailLog) => log.recipient_email === user?.email);
      setEmails(userEmails);
    } catch (err) {
      console.error(err);
      // fallback mock logs if admin endpoint throws auth permissions
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hackathon-certificates/');
      setCertificates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Hackathons
  const filteredHackathons = hackathons
    .filter(h => {
      const matchesSearch = h.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            h.theme.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode = filterMode === 'all' || h.mode === filterMode;
      const isPaid = parseFloat(h.registration_fee) > 0;
      const matchesFee = filterFee === 'all' || (filterFee === 'free' && !isPaid) || (filterFee === 'paid' && isPaid);
      
      const isCompleted = h.status === 'completed';
      const matchesStatus = filterStatus === 'all' || 
                            (filterStatus === 'upcoming' && !isCompleted) || 
                            (filterStatus === 'completed' && isCompleted);

      return matchesSearch && matchesMode && matchesFee && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      }
      if (sortBy === 'prize') {
        const prizeA = parseInt(a.prize_pool.replace(/[^0-9]/g, '')) || 0;
        const prizeB = parseInt(b.prize_pool.replace(/[^0-9]/g, '')) || 0;
        return prizeB - prizeA;
      }
      if (sortBy === 'deadline') {
        return new Date(a.registration_deadline).getTime() - new Date(b.registration_deadline).getTime();
      }
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-500/10 text-emerald-650 border-emerald-500/20';
      case 'closed': return 'bg-red-500/10 text-red-650 border-red-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-650 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-650 border-slate-500/20';
    }
  };

  const getAppStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <BadgeCheck className="text-emerald-500" size={18} />;
      case 'rejected': return <XCircle className="text-red-500" size={18} />;
      case 'waitlisted': return <AlertCircle className="text-amber-500" size={18} />;
      default: return <Clock className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Hackathon Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse premium campus hackathons, register teams, track approvals, and manage certificates.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {[
          { id: 'browse', label: 'Explore Hackathons', icon: Trophy },
          { id: 'my-applications', label: 'My Registrations', icon: Users },
          { id: 'payments', label: 'Payments History', icon: FileText },
          { id: 'emails', label: 'Email History', icon: Mail },
          { id: 'certificates', label: 'Certificates', icon: Award }
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

      {/* Tab Contents */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl h-80"></div>
          ))}
        </div>
      ) : (
        <>
          {/* BROWSE TAB */}
          {activeTab === 'browse' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search */}
                <div className="relative w-full md:w-80">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search events or themes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
                  
                  {/* Mode */}
                  <select
                    value={filterMode}
                    onChange={(e) => setFilterMode(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">All Modes</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>

                  {/* Fee */}
                  <select
                    value={filterFee}
                    onChange={(e) => setFilterFee(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">All Pricing</option>
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>

                  {/* Timeline Status */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">All Events</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>

                  {/* Sorting */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="newest">Sort: Newest</option>
                    <option value="prize">Sort: Prize Pool</option>
                    <option value="deadline">Sort: Deadline</option>
                  </select>
                </div>

              </div>

              {/* Grid cards */}
              {filteredHackathons.length === 0 ? (
                <div className="text-center py-20 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Trophy size={48} className="mx-auto text-slate-300 dark:text-slate-750 mb-4" />
                  <h3 className="font-bold text-slate-700 dark:text-slate-400">No Hackathons Found</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-550 mt-1">Try resetting your search query or filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHackathons.map(hack => {
                    const isPaid = parseFloat(hack.registration_fee) > 0;
                    const spotsRemaining = Math.max(0, hack.max_teams - hack.registered_teams_count);
                    const isClosed = spotsRemaining === 0 || hack.status === 'closed' || new Date(hack.registration_deadline).getTime() < Date.now();
                    const progressPercent = Math.min(100, (hack.registered_teams_count / hack.max_teams) * 100);

                    return (
                      <div
                        key={hack.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                      >
                        {/* Banner Top */}
                        <div className="h-32 bg-slate-100 dark:bg-slate-850 relative overflow-hidden flex items-center justify-center">
                          {hack.banner_url ? (
                            <img src={hack.banner_url} alt={hack.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-4 text-center">
                              <Trophy size={28} className="text-blue-500/80 mb-1" />
                              <span className="text-[10px] font-black text-blue-600/50 uppercase tracking-widest">CodexPetra</span>
                            </div>
                          )}
                          
                          {/* Badges Overlay */}
                          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md border backdrop-blur-md shadow-sm ${getStatusColor(hack.status)}`}>
                              {hack.status === 'published' ? 'Open' : hack.status}
                            </span>
                            <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-md bg-black/55 text-white border border-white/10 backdrop-blur-md shadow-sm w-max">
                              {hack.difficulty}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                          <div>
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                              {hack.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-455 mt-1.5 line-clamp-2">
                              {hack.description}
                            </p>
                          </div>

                          <div className="space-y-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                              <div className="flex items-center gap-1.5 truncate">
                                <Trophy size={12} className="text-amber-500 shrink-0" />
                                <span>Pool: {hack.prize_pool}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FileText size={12} className="text-blue-500 shrink-0" />
                                <span>Fee: {isPaid ? `₹${Math.round(parseFloat(hack.registration_fee))}` : 'Free'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin size={12} className="text-emerald-500 shrink-0" />
                                <span className="capitalize">{hack.mode}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users size={12} className="text-indigo-500 shrink-0" />
                                <span>Limit: {hack.max_teams} Teams</span>
                              </div>
                            </div>

                            {/* Date info */}
                            <div className="flex justify-between items-center text-[9px] text-slate-400 dark:text-slate-500 pt-1">
                              <span>Deadline: {new Date(hack.registration_deadline).toLocaleDateString()}</span>
                              <span>Date: {new Date(hack.start_date).toLocaleDateString()}</span>
                            </div>

                            {/* Slots progress bar */}
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between text-[9px] font-bold text-slate-550 dark:text-slate-450">
                                <span>Remaining Slots: {spotsRemaining}</span>
                                <span>{Math.round(progressPercent)}% Full</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${progressPercent}%` }}
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isClosed ? 'bg-red-500' : progressPercent > 80 ? 'bg-amber-500' : 'bg-blue-600'
                                  }`}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer actions */}
                        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                          <Link
                            to={`/dashboard/hackathons/${hack.slug}`}
                            className="text-[10px] font-extrabold uppercase text-slate-650 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200"
                          >
                            View Details
                          </Link>
                          
                          {isClosed ? (
                            <span className="px-3 py-1 text-[10px] font-extrabold uppercase bg-red-100/60 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-lg border border-red-500/10">
                              CLOSED
                            </span>
                          ) : (
                            <Link
                              to={`/dashboard/hackathons/${hack.slug}`}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-[10px] font-extrabold uppercase rounded-lg shadow-sm flex items-center gap-1 group transition-all"
                            >
                              Apply Now <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* APPLICATIONS TAB */}
          {activeTab === 'my-applications' && (
            <div className="space-y-6">
              {myTeams.length === 0 ? (
                <div className="text-center py-20 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Users size={48} className="mx-auto text-slate-300 dark:text-slate-750 mb-4" />
                  <h3 className="font-bold text-slate-700 dark:text-slate-400">No Registrations Yet</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-550 mt-1">
                    You have not registered for any hackathons. Go to 'Explore Hackathons' to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myTeams.map(team => {
                    const hackInfo = hackathons.find(h => h.id === team.hackathon);
                    const hasSucceededPayment = team.payment_status === 'success';

                    return (
                      <div
                        key={team.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">
                          <div>
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                              Registered Team
                            </span>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                              {team.name}
                            </h3>
                            <p className="text-xs text-slate-550 dark:text-slate-400">
                              Hackathon: <span className="font-bold text-slate-850 dark:text-slate-200">{hackInfo?.title || 'Loading...'}</span>
                            </p>
                          </div>

                          {/* Action controls */}
                          <div className="flex items-center gap-3">
                            {/* App status */}
                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 px-3 py-1.5 rounded-xl">
                              {getAppStatusIcon(team.application_status)}
                              <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">
                                App: {team.application_status}
                              </span>
                            </div>                             {/* Pay status */}
                            {team.payment_status === 'success' ? (
                              <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl shadow-sm">
                                <CheckCircle size={13} className="text-emerald-500" />
                                <span className="text-[10px] font-black uppercase">Paid & Verified</span>
                              </div>
                            ) : team.payment_status === 'pending' ? (
                              <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-650 dark:bg-amber-955/20 dark:text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-xl shadow-sm">
                                <Clock size={13} className="text-amber-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase" title={`UTR: ${team.utr_number}`}>
                                  Pay Pending
                                </span>
                              </div>
                            ) : team.application_status === 'rejected' ? (
                              <div className="flex items-center gap-1.5 bg-red-500/10 text-red-650 dark:bg-red-955/20 dark:text-red-400 border border-red-500/20 px-3 py-1.5 rounded-xl shadow-sm">
                                <XCircle size={13} className="text-red-500" />
                                <span className="text-[10px] font-black uppercase">Failed</span>
                              </div>
                            ) : hackInfo && parseFloat(hackInfo.registration_fee) > 0 ? (
                              <Link
                                to={`/dashboard/hackathons/${hackInfo.slug}/register?step=5&team_id=${team.id}`}
                                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black uppercase rounded-xl shadow transition-colors"
                              >
                                Pay Fee (₹{Math.round(parseFloat(hackInfo.registration_fee))})
                              </Link>
                            ) : (
                              <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl shadow-sm">
                                <CheckCircle size={13} className="text-emerald-500" />
                                <span className="text-[10px] font-black uppercase">Free Entry</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Rejected Alert message block */}
                        {team.application_status === 'rejected' && (
                          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-850 rounded-2xl mb-4 space-y-2">
                            <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider block">Registration Rejected</span>
                            <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed font-semibold">
                              Your registration was rejected by the administrator. <br />
                              Reason: <span className="font-extrabold italic text-red-800 dark:text-red-200">"payment utr wrong hai fake transaction detected"</span>
                            </p>
                            <div className="pt-1.5">
                              <Link
                                to={`/dashboard/hackathons/${hackInfo?.slug}/register`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-colors shadow-sm"
                              >
                                Resubmit Registration
                              </Link>
                            </div>
                          </div>
                        )}

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 dark:text-slate-400">
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Leader Details</h4>
                            <p>Name: {team.leader_name}</p>
                            <p>Email: {team.leader_email}</p>
                            <p>Roll No: {team.leader_roll_number}</p>
                            <p>Reg ID: {team.registration_number}</p>
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Academic & Socials</h4>
                            <p>College: {team.college}</p>
                            <p>Dept/Year: {team.department} - {team.year} Year</p>
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Members ({team.members.length})</h4>
                            {team.members.length === 0 ? (
                              <p className="text-slate-450 italic">Solo Team</p>
                            ) : (
                              <ul className="list-disc pl-4 space-y-0.5">
                                {team.members.map((m, i) => (
                                  <li key={i}>{m.name} ({m.email})</li>
                                ))}
                              </ul>
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

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-850">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Payment History</h3>
              </div>
              
              {payments.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">
                  No payment transactions found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-450 font-bold border-b border-slate-150 dark:border-slate-850">
                        <th className="px-6 py-3">Invoice Number</th>
                        <th className="px-6 py-3">Hackathon</th>
                        <th className="px-6 py-3">Team</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Transaction ID</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                      {payments.map(pay => (
                        <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                          <td className="px-6 py-3.5 font-bold">{pay.invoice_number}</td>
                          <td className="px-6 py-3.5">{pay.hackathon_title}</td>
                          <td className="px-6 py-3.5">{pay.team_name}</td>
                          <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">₹{Math.round(parseFloat(pay.amount))}</td>
                          <td className="px-6 py-3.5 font-mono text-[10px]">{pay.payment_id}</td>
                          <td className="px-6 py-3.5">
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-500/10 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-500/10">
                              {pay.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-slate-450">{new Date(pay.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-3.5 text-right">
                            {/* Simulator receipt link */}
                            <a
                              href={pay.receipt_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-blue-600 hover:underline dark:text-blue-400"
                            >
                              <Download size={12} /> PDF
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* EMAIL HISTORY TAB */}
          {activeTab === 'emails' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-850">
                <h3 className="font-bold text-slate-850 dark:text-slate-200 text-sm">Dispatched Email History</h3>
              </div>
              
              {emails.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">
                  No registered emails logged for {user?.email}.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  {emails.map(email => (
                    <div key={email.id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">
                          {email.subject}
                        </h4>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {new Date(email.sent_at).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <pre className="text-xs text-slate-550 dark:text-slate-400 font-sans whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150/40 dark:border-slate-850/60 mt-2">
                        {email.body}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CERTIFICATES TAB */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              {certificates.length === 0 ? (
                <div className="text-center py-20 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Award size={48} className="mx-auto text-slate-300 dark:text-slate-750 mb-4" />
                  <h3 className="font-bold text-slate-700 dark:text-slate-400">No Certificates Issued</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-550 mt-1 font-medium">
                    Certificates will appear here once administrators mark hackathons completed and issue them.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map(cert => (
                    <div
                      key={cert.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between"
                    >
                      <div className="p-5 space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-650 dark:text-blue-450 border border-blue-200/50 dark:border-blue-800 flex items-center justify-center">
                          <Award size={20} />
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-450 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                            {cert.type.replace('_', ' ')}
                          </span>
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-2 leading-tight">
                            {cert.hackathon_title}
                          </h3>
                          <p className="text-[11px] text-slate-550 mt-1 dark:text-slate-400">
                            Recipient: {cert.recipient_name}
                          </p>
                          <span className="text-[9px] text-slate-400 block mt-1 font-mono">
                            ID: {cert.certificate_id}
                          </span>
                        </div>
                      </div>

                      <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                        <button
                          onClick={() => setViewingCert(cert)}
                          className="text-[10px] font-bold uppercase text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                        >
                          View Certificate
                        </button>
                        <a
                          href={cert.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-[10px] font-extrabold uppercase rounded-lg shadow-sm flex items-center gap-1"
                        >
                          <Download size={10} /> Download PDF
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Dynamic Certificate Modal Simulator */}
      {viewingCert && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 w-full max-w-3xl relative shadow-2xl overflow-hidden">
            
            {/* Background design accents */}
            <div className="absolute inset-0 border-[16px] border-double border-slate-100 dark:border-slate-850 rounded-3xl pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>

            <div className="text-center space-y-6 pt-4 pb-6 px-4">
              <span className="font-serif italic text-2xl text-slate-550 dark:text-slate-400 block">
                Certificate of Recognition
              </span>
              
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-blue-650 to-transparent mx-auto"></div>
              
              <p className="text-xs text-slate-450 uppercase tracking-widest font-sans">
                THIS IS PROUDLY PRESENTED TO
              </p>
              
              <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-wide border-b border-slate-200 dark:border-slate-850 pb-2 w-max mx-auto px-6 font-bold">
                {viewingCert.recipient_name}
              </h2>

              <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                for outstanding dedication and active contribution as a participant during the event
                <span className="font-bold text-slate-950 dark:text-white block mt-1 text-sm">{viewingCert.hackathon_title}</span>
                organized by the CodexPetra Technical Portal.
              </p>

              <div className="grid grid-cols-2 gap-10 max-w-md mx-auto pt-8">
                <div className="text-center">
                  <div className="h-[1px] bg-slate-350 dark:bg-slate-700 w-3/4 mx-auto mb-1"></div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Faculty Coordinator</span>
                </div>
                <div className="text-center">
                  <div className="h-[1px] bg-slate-350 dark:bg-slate-700 w-3/4 mx-auto mb-1"></div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Dean of Engineering</span>
                </div>
              </div>

              <div className="pt-4 text-[9px] text-slate-400 font-mono flex justify-between px-6 border-t border-slate-100 dark:border-slate-850">
                <span>Verification ID: {viewingCert.certificate_id}</span>
                <span>Issued Date: {new Date(viewingCert.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setViewingCert(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default HackathonDashboard;

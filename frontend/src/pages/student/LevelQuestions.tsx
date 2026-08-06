import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { setSEOMetadata, getCourseSchema } from '../../utils/seo';
import { useAuth } from '../../context/AuthContext';
import {
  enrichQuestions,
  toggleQuestionFlag,
  isBlind75Question,
  calculateStreak,
  type EnrichedQuestion
} from '../../utils/codingHelpers';
import {
  ArrowLeft, Play, CheckCircle2, Circle, Star, Heart, ThumbsUp,
  Clock, HardDrive, ShieldAlert, Loader2, Search, SlidersHorizontal, HelpCircle,
  ChevronLeft, ChevronRight, CodeXml, Flame, Bell, Award, Laptop, Layers, BookOpen, Trophy, Settings, Filter, Lock, Unlock, History
} from 'lucide-react';

interface Question {
  id: number;
  title: string;
  slug: string;
  time_limit: number;
  memory_limit: number;
  order: number;
  solved: boolean;
  level_name: string;
  topic_name: string;
}

interface TopicDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface Submission {
  id: number;
  question_title: string;
  question: number;
  language_name: string;
  status: string;
  created_at: string;
}

const LevelQuestions: React.FC = () => {
  const { topicId, levelName } = useParams<{ topicId: string; levelName: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Search & Filter state for in-place level questions
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('coding_sidebar_collapsed');
    return saved === 'true';
  });

  // Notification states
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Handle outside click for notification dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Questions for this specific topic and level
  const { data: questions, isLoading: qLoading, error: qError } = useQuery<Question[]>({
    queryKey: ['questions', topicId, levelName],
    queryFn: async () => {
      const response = await api.get(`/questions/?topic=${topicId}&level=${levelName}`);
      return response.data;
    }
  });

  // Fetch Topic details to construct breadcrumbs and header
  const { data: topic } = useQuery<TopicDetail>({
    queryKey: ['topic', topicId],
    queryFn: async () => {
      const response = await api.get(`/topics/${topicId}/`);
      return response.data;
    }
  });

  // Fetch Submissions history to compute streak
  const { data: submissions } = useQuery<Submission[]>({
    queryKey: ['recentSubmissions'],
    queryFn: async () => {
      const response = await api.get('/submissions/');
      return response.data;
    }
  });

  const streak = useMemo(() => {
    const streakData = calculateStreak(submissions || []);
    return streakData.currentStreak;
  }, [submissions]);

  // Fetch Notifications
  const { data: notifications } = useQuery<any[]>({
    queryKey: ['hackathonNotifications'],
    queryFn: async () => {
      const response = await api.get('/hackathon-notifications/');
      return response.data;
    },
    enabled: !!user
  });

  const unreadNotifsCount = useMemo(() => {
    return notifications?.filter(n => !n.is_read).length || 0;
  }, [notifications]);

  useEffect(() => {
    if (topic && levelName) {
      const displayLevel = levelName.charAt(0).toUpperCase() + levelName.slice(1);
      setSEOMetadata({
        title: `${topic.name} (${displayLevel}) | CodeBrainzX`,
        description: `Practice ${displayLevel} coding challenges in ${topic.name}. Learn algorithms, write code in Python, Java, JavaScript, C++, C and check execution test cases.`,
        canonicalUrl: window.location.href,
        structuredData: getCourseSchema(
          `${topic.name} - ${displayLevel} Level`,
          topic.description,
          window.location.href
        ),
      });
    }
  }, [topic, levelName]);

  // Enrich raw questions with client-side premium details
  const enrichedQuestions = useMemo(() => {
    if (!questions || !topic) return [];
    const topicMap = { [topic.id]: topic.name };
    return enrichQuestions(questions, topicMap);
  }, [questions, topic]);

  // Filter enriched questions
  const filteredQuestions = useMemo(() => {
    let res = [...enrichedQuestions];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      res = res.filter(q =>
        q.title.toLowerCase().includes(query) ||
        q.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    if (statusFilter) {
      const isSolved = statusFilter === 'solved';
      res = res.filter(q => q.solved === isSolved);
    }

    return res;
  }, [enrichedQuestions, searchQuery, statusFilter]);

  const handleToggleFlag = (id: number, flagType: 'bookmarks' | 'favorites' | 'liked') => {
    toggleQuestionFlag(id, flagType);
    queryClient.invalidateQueries({ queryKey: ['questions', topicId, levelName] });
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/hackathon-notifications/mark_all_as_read/');
      queryClient.invalidateQueries({ queryKey: ['hackathonNotifications'] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSingleRead = async (id: number) => {
    try {
      await api.post(`/hackathon-notifications/${id}/mark_as_read/`);
      queryClient.invalidateQueries({ queryKey: ['hackathonNotifications'] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSidebarClick = (viewId: string) => {
    navigate(`/dashboard/coding?tab=${viewId}`);
  };

  const handleGlobalSearchChange = (val: string) => {
    navigate(`/dashboard/coding?search=${encodeURIComponent(val)}`);
  };

  const getLevelLabel = (lvl?: string) => {
    if (!lvl) return '';
    return lvl.charAt(0).toUpperCase() + lvl.slice(1);
  };

  const getLevelColor = (lvl?: string) => {
    switch (lvl) {
      case 'basic': return 'text-blue-450 bg-blue-500/10 border-blue-500/20';
      case 'easy': return 'text-sky-450 bg-sky-500/10 border-sky-500/20';
      case 'medium': return 'text-amber-450 bg-amber-500/10 border-amber-500/20';
      case 'hard': return 'text-rose-455 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400 border-slate-800';
    }
  };

  const solvedCount = questions?.filter(q => q.solved).length || 0;
  const totalCount = questions?.length || 0;

  return (
    <div className="w-screen h-screen flex flex-col bg-[#07080d] text-slate-200 overflow-hidden font-sans relative select-none">
      
      {/* Background ambient glowing rings */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* A. DEDICATED TOP PORTAL NAVBAR */}
      <header className="h-16 border-b border-slate-850 bg-[#090b14] px-6 flex items-center justify-between gap-6 shrink-0 relative z-30 shadow-md">
        
        {/* Left Section: Back Button + Clickable Logo */}
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-1 text-[10px] font-black text-slate-450 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-850 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft size={13} />
            <span>Back to Dashboard</span>
          </Link>
          <div className="w-[1px] h-5 bg-slate-800"></div>
          <Link to="/dashboard" className="flex items-center gap-2 group cursor-pointer">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white group-hover:scale-105 transition-transform duration-200">
              <CodeXml size={16} />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">
              CodeBrainz<span className="text-blue-455">X</span>
            </span>
          </Link>
          <span className="hidden sm:inline text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded tracking-widest font-mono">
            Premium Portal
          </span>
        </div>

        {/* Middle Section: Global Search */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
            <input
              type="text"
              placeholder="Search portal questions globally..."
              onChange={(e) => handleGlobalSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-955 border border-slate-850 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-slate-200 transition-all font-bold"
            />
          </div>
        </div>

        {/* Right Section: Streak status, Notification system bell dropdown & User Avatar */}
        <div className="flex items-center gap-3">
          
          {/* Streak Flame badge */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-455 font-mono text-[11px] font-black">
            <Flame size={12} className="fill-orange-400 animate-pulse" />
            <span>{streak}d</span>
          </div>

          {/* Notifications Panel */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Bell size={14} />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-black animate-bounce">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-80 bg-[#0d0f19] border border-slate-855 rounded-xl shadow-2xl p-4 z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-850 mb-3">
                    <span className="text-xs font-black text-slate-200">Alerts & Notifications</span>
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-bold hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                    {notifications && notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkSingleRead(n.id)}
                          className={`p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                            n.is_read
                              ? 'bg-slate-955/20 border-slate-850/40 text-slate-500 hover:bg-slate-900/60'
                              : 'bg-blue-955/20 border-blue-900/30 text-slate-200 hover:bg-blue-900/20'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h5 className="text-xs font-black truncate">{n.title}</h5>
                            {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1"></span>}
                          </div>
                          <p className="text-[10px] mt-1 leading-relaxed text-slate-400">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-500 text-xs italic">
                        No notifications.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User profile identifier widget */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-955 border border-slate-850">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-[10px]">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] font-black text-slate-350 hidden sm:inline max-w-[80px] truncate">{user?.username}</span>
          </div>

        </div>
      </header>

      {/* B. MAIN PORTAL WORKSPACE BODY */}
      <div className="flex-grow flex flex-row overflow-hidden relative z-10 w-full h-[calc(100vh-4rem)]">
        
        {/* Left Sidebar */}
        <aside
          className={`bg-[#0a0c16]/90 border-r border-slate-850 p-4 transition-all duration-300 flex flex-col justify-between shrink-0 h-full ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2 pb-3 border-b border-slate-850">
              {!sidebarCollapsed ? (
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-550">
                  Navigation
                </span>
              ) : (
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-650 mx-auto">Nav</span>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-1.5 rounded-lg bg-slate-950 border border-slate-855 hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {sidebarCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
              </button>
            </div>

            <nav className="flex flex-col gap-1.5">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Award },
                { id: 'all', label: 'Problems', icon: Laptop },
                { id: 'companies', label: 'Companies', icon: Layers },
                { id: 'topics', label: 'Topics', icon: BookOpen },
                { id: 'contests', label: 'Contests', icon: Trophy, badge: 'Live' },
                { id: 'bookmarks', label: 'Bookmarks', icon: Star },
                { id: 'recent', label: 'Submissions', icon: History },
                { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
                { id: 'profile', label: 'Settings', icon: Settings }
              ].map((item) => {
                const active = item.id === 'topics'; // Hardcoded active selection for Level Questions
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSidebarClick(item.id)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all relative shrink-0 cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-650 text-white shadow-lg shadow-blue-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon size={16} className={active ? 'scale-105' : 'opacity-85'} />
                    {!sidebarCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {item.badge && !sidebarCollapsed && (
                      <span className="text-[9px] bg-red-500/20 text-red-405 border border-red-500/30 px-1.5 py-0.5 rounded font-extrabold uppercase animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {!sidebarCollapsed && user && (
            <div className="hidden lg:flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-850 mt-6">
              <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-[10px] shadow-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-[11px] font-black text-slate-300 truncate">{user.username}</div>
                <div className="text-[9px] text-slate-550 font-mono">Global Rank</div>
              </div>
            </div>
          )}
        </aside>

        {/* Scrollable Right Panel Workspace */}
        <main className="flex-grow overflow-y-auto px-6 py-6 md:py-8 min-w-0">
          <div className="max-w-5xl w-full mx-auto space-y-6">
            
            {/* Back Button & Breadcrumbs */}
            <div>
              <Link
                to="/dashboard/coding?tab=topics"
                className="inline-flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-white transition-colors mb-3 group"
              >
                <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to Topics Map
              </Link>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                <Link to="/dashboard" className="hover:text-blue-400">dashboard</Link>
                <span>/</span>
                <Link to="/dashboard/coding" className="hover:text-blue-400">coding</Link>
                <span>/</span>
                <span className="text-slate-400">{topic?.name?.toLowerCase() || 'topic'}</span>
                <span>/</span>
                <span className="text-blue-400">{levelName?.toLowerCase()}</span>
              </div>
            </div>

            {/* Header Card */}
            <div className="bg-[#0e111b] border border-slate-850 rounded-3xl p-6 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-[9px] font-black rounded border uppercase tracking-wider ${getLevelColor(levelName)}`}>
                    {getLevelLabel(levelName)} Level
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-200">
                  {topic?.name} Questions Set
                </h2>
                <p className="text-xs text-slate-550 max-w-xl leading-relaxed">
                  {topic?.description}
                </p>
              </div>

              <div className="shrink-0 text-slate-500 text-xs font-bold bg-slate-950 border border-slate-850 p-4 rounded-2xl flex items-center gap-3 relative z-10">
                <div>
                  <span className="font-extrabold text-lg text-slate-205 font-mono block">
                    {solvedCount} / {totalCount}
                  </span>
                  Completed
                </div>
                <div className="w-10 h-10 rounded-full border-4 border-blue-500/20 border-t-blue-500 flex items-center justify-center font-bold text-xs font-mono text-slate-200">
                  {totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Search & local status filter bar */}
            <div className="bg-[#0e111b] border border-slate-855 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                <input
                  type="text"
                  placeholder="Search problems in this set..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-955 border border-slate-850 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-slate-200 transition-all font-bold"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 text-[10px] font-black uppercase tracking-wider bg-slate-955 border border-slate-850 rounded-xl outline-none text-slate-400 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">All Status</option>
                    <option value="solved">Solved</option>
                    <option value="unsolved">Unsolved</option>
                  </select>
                  <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-550 pointer-events-none" size={10} />
                </div>
              </div>
            </div>

            {/* Questions list Table */}
            {qLoading ? (
              <div className="flex justify-center items-center py-16 text-slate-500 font-bold">
                <Loader2 className="animate-spin text-blue-500 mr-2" />
                Loading questions...
              </div>
            ) : qError ? (
              <div className="p-6 bg-red-955/20 border border-red-900/50 rounded-2xl text-center text-red-455 flex flex-col items-center gap-2">
                <ShieldAlert size={28} className="text-red-500 animate-pulse" />
                <h4 className="font-bold text-base">Failed to fetch questions</h4>
                <p className="text-sm">Please refresh the page or contact support.</p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-16 bg-[#0e111b] border border-slate-850 rounded-3xl p-8">
                <HelpCircle size={40} className="mx-auto mb-2 text-slate-600 animate-pulse" />
                <h4 className="font-bold text-base text-slate-350 mb-1">No Questions Found</h4>
                <p className="text-xs text-slate-500">Either no problems match your query or they are not yet published.</p>
              </div>
            ) : (
              <div className="bg-[#0e111b] border border-slate-855 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-500 font-black uppercase tracking-wider bg-slate-955/20">
                        <th className="py-4 pl-6 w-12 text-center">Status</th>
                        <th className="py-4 px-4">Title</th>
                        <th className="py-4 px-4 w-28 text-center">Acceptance</th>
                        <th className="py-4 px-4">Companies</th>
                        <th className="py-4 px-4">Tags</th>
                        <th className="py-4 pr-6 w-32 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300">
                      {filteredQuestions.map((q) => (
                        <tr key={q.id} className="hover:bg-slate-855/20 transition-colors">
                          <td className="py-4 pl-6 text-center">
                            {q.solved ? (
                              <CheckCircle2 className="text-emerald-450 inline-block" size={16} />
                            ) : (
                              <Circle className="text-slate-750 inline-block" size={15} />
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/questions/${q.id}`}
                                  className="font-black text-slate-200 hover:text-blue-400 transition-colors"
                                >
                                  {q.order}. {q.title}
                                </Link>

                                {/* Star / Heart / Likes buttons */}
                                <button
                                  onClick={() => handleToggleFlag(q.id, 'bookmarks')}
                                  className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                                    q.is_bookmarked ? 'text-amber-400' : 'text-slate-650'
                                  }`}
                                  title="Bookmark"
                                >
                                  <Star size={11} className={q.is_bookmarked ? 'fill-amber-400' : ''} />
                                </button>

                                <button
                                  onClick={() => handleToggleFlag(q.id, 'favorites')}
                                  className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                                    q.is_favorite ? 'text-rose-400' : 'text-slate-650'
                                  }`}
                                  title="Favorite"
                                >
                                  <Heart size={11} className={q.is_favorite ? 'fill-rose-400' : ''} />
                                </button>

                                <button
                                  onClick={() => handleToggleFlag(q.id, 'liked')}
                                  className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                                    q.is_liked ? 'text-blue-400' : 'text-slate-650'
                                  }`}
                                  title="Like"
                                >
                                  <ThumbsUp size={11} className={q.is_liked ? 'fill-blue-400' : ''} />
                                </button>
                                {q.is_liked && <span className="text-[9px] font-bold text-blue-400 font-mono">+{q.likes}</span>}
                              </div>
                              
                              <div className="flex items-center gap-3 text-[9px] text-slate-550 font-mono">
                                <span className="flex items-center gap-1">
                                  <Clock size={10} />
                                  {q.time_limit}s
                                </span>
                                <span className="flex items-center gap-1">
                                  <HardDrive size={10} />
                                  {q.memory_limit}MB
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-bold text-slate-350">
                            {q.acceptance_rate}%
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {q.companies.map(c => (
                                <span key={c} className="text-[9px] font-black uppercase bg-slate-955 text-slate-450 border border-slate-850 px-1.5 py-0.5 rounded">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {q.tags.map(t => (
                                <span key={t} className="text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 pr-6 text-center">
                            <Link
                              to={`/questions/${q.id}`}
                              className={`px-3 py-1.5 text-[10px] font-black rounded-lg inline-flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer ${
                                q.solved
                                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                                  : 'bg-blue-600 hover:bg-blue-550 text-white shadow-lg shadow-blue-500/10'
                              }`}
                            >
                              {q.solved ? 'Review' : 'Solve'}
                              <Play size={9} fill="currentColor" className={q.solved ? 'opacity-50' : ''} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default LevelQuestions;

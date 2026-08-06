import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { setSEOMetadata } from '../../utils/seo';
import {
  enrichQuestions,
  toggleQuestionFlag,
  calculateStreak,
  isBlind75Question,
  COMPANY_LIST,
  type EnrichedQuestion
} from '../../utils/codingHelpers';
import {
  BookOpen, Sparkles, Lock, Unlock, CheckCircle2, Circle, Star, Heart, ThumbsUp,
  History, Settings, LogOut, ChevronRight, ChevronLeft, Loader2, AlertCircle,
  Search, SlidersHorizontal, ArrowUpDown, Flame, Trophy, Award, Target,
  Laptop, CheckCircle, HelpCircle, RefreshCw, Layers, Calendar, Bell, ChevronDown, User, Play, Clock, TrendingUp, Compass, BarChart3, Filter, CodeXml
} from 'lucide-react';

interface Level {
  id: number;
  level: 'basic' | 'easy' | 'medium' | 'hard';
  is_locked: boolean;
  total_questions: number;
  solved_questions: number;
}

interface Topic {
  id: number;
  name: string;
  slug: string;
  description: string;
  order: number;
  levels: Level[];
  total_questions: number;
  solved_questions: number;
}

interface Submission {
  id: number;
  question_title: string;
  question: number;
  language_name: string;
  status: string;
  created_at: string;
}

// Numerical interpolator for counts (Rank, Streak, etc.)
const AnimatedCounter: React.FC<{ value: number; duration?: number; prefix?: string }> = ({ value, duration = 800, prefix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <>{prefix}{count.toLocaleString()}</>;
};

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();

  // Navigation Sidebar States
  const [activeView, setActiveView] = useState<'dashboard' | 'all' | 'companies' | 'topics' | 'contests' | 'bookmarks' | 'recent' | 'leaderboard' | 'profile'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('coding_sidebar_collapsed');
    return saved === 'true';
  });

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('order');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Notification UI States
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Sync tab state with URL query parameters if provided
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      if (tabParam === 'history') {
        setActiveView('recent');
      } else {
        setActiveView(tabParam as any);
      }
    }
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
      setActiveView('all');
    }
  }, [location]);

  // Persist sidebar collapse preference
  useEffect(() => {
    localStorage.setItem('coding_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Fetch Topics data
  const { data: topics, isLoading: topicsLoading, error: topicsError } = useQuery<Topic[]>({
    queryKey: ['topics'],
    queryFn: async () => {
      const response = await api.get('/topics/');
      return response.data;
    }
  });

  // Fetch all questions
  const { data: rawQuestions, isLoading: questionsLoading } = useQuery<any[]>({
    queryKey: ['allQuestions'],
    queryFn: async () => {
      const response = await api.get('/questions/');
      return response.data;
    }
  });

  // Fetch Submissions history
  const { data: submissions, isLoading: subsLoading } = useQuery<Submission[]>({
    queryKey: ['recentSubmissions'],
    queryFn: async () => {
      const response = await api.get('/submissions/');
      return response.data;
    }
  });

  // Fetch Notifications
  const { data: notifications, refetch: refetchNotifs } = useQuery<any[]>({
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
    setSEOMetadata({
      title: 'Premium FAANG Coding Portal | CodexPetra',
      description: 'Master the coding interview. Solve challenges by topic, company sheets, or curated sheets like Blind 75.',
    });
  }, []);

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

  // Enrich raw questions with client-side premium details
  const questions = useMemo(() => {
    if (!rawQuestions) return [];
    const topicMap: Record<number, string> = {};
    if (topics) {
      topics.forEach(t => {
        topicMap[t.id] = t.name;
      });
    }
    return enrichQuestions(rawQuestions, topicMap);
  }, [rawQuestions, topics]);

  // Compute overall interactive statistics
  const stats = useMemo(() => {
    const total = questions.length;
    const solved = questions.filter(q => q.solved).length;

    const easyQs = questions.filter(q => q.level_name === 'basic' || q.level_name === 'easy');
    const easyTotal = easyQs.length;
    const easySolved = easyQs.filter(q => q.solved).length;

    const mediumQs = questions.filter(q => q.level_name === 'medium');
    const mediumTotal = mediumQs.length;
    const mediumSolved = mediumQs.filter(q => q.solved).length;

    const hardQs = questions.filter(q => q.level_name === 'hard');
    const hardTotal = hardQs.length;
    const hardSolved = hardQs.filter(q => q.solved).length;

    const totalAcceptedSubmissions = submissions?.filter(s => s.status === 'Accepted').length || 0;
    const totalSubmissions = submissions?.length || 0;
    const userAcceptanceRate = totalSubmissions > 0
      ? Math.round((totalAcceptedSubmissions / totalSubmissions) * 100)
      : 0;

    const streakData = calculateStreak(submissions || []);

    // Calculate rank
    const rank = total > 0 ? Math.max(1, 12050 - (solved * 350) - (submissions?.length || 0) * 12) : 9999;

    return {
      total,
      solved,
      solvedRatio: total > 0 ? solved / total : 0,
      easyTotal,
      easySolved,
      mediumTotal,
      mediumSolved,
      hardTotal,
      hardSolved,
      userAcceptanceRate,
      streak: streakData.currentStreak,
      activeDays: streakData.totalActiveDays,
      rank
    };
  }, [questions, submissions]);

  // Handle Likes/Bookmarks / Favorites local updates
  const handleToggleFlag = (id: number, flagType: 'bookmarks' | 'favorites' | 'liked') => {
    toggleQuestionFlag(id, flagType);
    queryClient.invalidateQueries({ queryKey: ['allQuestions'] });
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

  // Switch to problems tab and apply search query
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (activeView !== 'all' && activeView !== 'bookmarks') {
      setActiveView('all');
    }
  };

  // Filter & Sort calculations
  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    if (activeView === 'bookmarks') {
      result = result.filter(q => q.is_bookmarked || q.is_favorite);
    }

    // Apply Filters
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(q =>
        q.title.toLowerCase().includes(query) ||
        q.topic_name.toLowerCase().includes(query) ||
        q.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (selectedDifficulty) {
      if (selectedDifficulty === 'easy') {
        result = result.filter(q => q.level_name === 'basic' || q.level_name === 'easy');
      } else {
        result = result.filter(q => q.level_name === selectedDifficulty);
      }
    }

    if (selectedStatus) {
      const isSolved = selectedStatus === 'solved';
      result = result.filter(q => q.solved === isSolved);
    }

    if (selectedTopic) {
      result = result.filter(q => String(q.topic) === selectedTopic);
    }

    if (selectedCompany) {
      const companyQuery = selectedCompany.toLowerCase();
      result = result.filter(q => q.companies.some(c => c.toLowerCase() === companyQuery));
    }

    // Apply Sorting
    result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'difficulty') {
        const priority: Record<string, number> = { basic: 1, easy: 2, medium: 3, hard: 4 };
        return (priority[a.level_name] || 0) - (priority[b.level_name] || 0);
      } else if (sortBy === 'acceptance') {
        return b.acceptance_rate - a.acceptance_rate;
      } else {
        return a.order - b.order;
      }
    });

    return result;
  }, [questions, activeView, searchQuery, selectedDifficulty, selectedStatus, selectedTopic, selectedCompany, sortBy]);

  // Paginated questions
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredQuestions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuestions, currentPage]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDifficulty, selectedStatus, selectedTopic, selectedCompany, sortBy, activeView]);

  // Daily Challenge Pick
  const dailyQuestion = useMemo(() => {
    if (questions.length === 0) return null;
    const day = new Date().getDate();
    return questions[day % questions.length] || questions[0];
  }, [questions]);

  // Countdown timer for Daily Challenge
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Trending Problems (highest likes)
  const trendingProblems = useMemo(() => {
    return [...questions].sort((a, b) => b.likes - a.likes).slice(0, 3);
  }, [questions]);

  // Continue Solving
  const nextToSolve = useMemo(() => {
    return questions.find(q => !q.solved) || null;
  }, [questions]);

  // Recommended for you (selection of unsolved medium/easy)
  const recommendedQuestions = useMemo(() => {
    return questions.filter(q => !q.solved).slice(0, 3);
  }, [questions]);

  // Weekly Submissions Grid (last 7 calendar days)
  const weeklyActivity = useMemo(() => {
    const days = [];
    const acceptedDates = new Set(
      (submissions || [])
        .filter(s => s.status === 'Accepted')
        .map(s => new Date(s.created_at).toDateString())
    );

    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      days.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        active: acceptedDates.has(date.toDateString()),
        dayNum: date.getDate()
      });
    }
    return days;
  }, [submissions]);

  // Dynamic Leaderboard sorting
  const leaderboard = useMemo(() => {
    const list = [
      { name: user?.username || 'You', solved: stats.solved, streak: stats.streak, avatar: (user?.username || 'U').substring(0, 2).toUpperCase(), isCurrentUser: true },
      { name: 'ByteCommander', solved: 72, streak: 45, avatar: 'BC' },
      { name: 'AlgorithmicWizard', solved: 68, streak: 32, avatar: 'AW' },
      { name: 'DevOpsQueen', solved: 64, streak: 28, avatar: 'DQ' },
      { name: 'CodeCatalyst', solved: 58, streak: 19, avatar: 'CC' },
      { name: 'SyntaxStriker', solved: 52, streak: 14, avatar: 'SS' },
      { name: 'StackOverflower', solved: 44, streak: 8, avatar: 'SO' },
    ];
    list.sort((a, b) => b.solved - a.solved);
    return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [stats.solved, stats.streak, user]);

  const getLevelLabel = (lvl: string) => {
    switch (lvl) {
      case 'basic': return 'Basic';
      case 'easy': return 'Easy';
      case 'medium': return 'Medium';
      case 'hard': return 'Hard';
      default: return lvl;
    }
  };

  const getLevelBadgeColor = (lvl: string, isLocked: boolean, isCompleted: boolean) => {
    if (isLocked) {
      return 'bg-slate-800/40 text-slate-500 border border-slate-700/50';
    }
    if (isCompleted) {
      return 'bg-emerald-955/20 text-emerald-400 border border-emerald-900/40';
    }

    switch (lvl) {
      case 'basic': return 'bg-blue-955/20 text-blue-400 border border-blue-900/40';
      case 'easy': return 'bg-sky-955/20 text-sky-400 border border-sky-900/40';
      case 'medium': return 'bg-amber-955/20 text-amber-400 border border-amber-900/40';
      case 'hard': return 'bg-rose-955/20 text-rose-455 border border-rose-900/40';
      default: return 'bg-slate-800 text-slate-350 border border-slate-700';
    }
  };

  const getCompanyStyles = (slug: string) => {
    switch (slug) {
      case 'google': return {
        bg: 'from-red-500/10 to-orange-500/10 border-slate-800 hover:border-red-500/30 hover:shadow-red-500/10',
        text: 'text-red-400',
        logo: 'G',
        gradient: 'from-red-500 via-yellow-500 to-green-500'
      };
      case 'amazon': return {
        bg: 'from-yellow-600/10 to-amber-500/10 border-slate-800 hover:border-amber-500/30 hover:shadow-amber-500/10',
        text: 'text-amber-400',
        logo: 'A',
        gradient: 'from-amber-500 to-yellow-650'
      };
      case 'microsoft': return {
        bg: 'from-blue-600/10 to-sky-500/10 border-slate-800 hover:border-blue-500/30 hover:shadow-blue-500/10',
        text: 'text-blue-400',
        logo: 'M',
        gradient: 'from-blue-500 to-indigo-500'
      };
      case 'meta': return {
        bg: 'from-indigo-600/10 to-blue-500/10 border-slate-800 hover:border-indigo-500/30 hover:shadow-indigo-500/10',
        text: 'text-indigo-400',
        logo: '∞',
        gradient: 'from-blue-600 to-violet-500'
      };
      case 'apple': return {
        bg: 'from-gray-500/10 to-slate-400/10 border-slate-800 hover:border-slate-400/30 hover:shadow-slate-400/10',
        text: 'text-slate-200',
        logo: '',
        gradient: 'from-slate-200 to-slate-500'
      };
      case 'netflix': return {
        bg: 'from-rose-700/10 to-red-600/10 border-slate-800 hover:border-rose-600/30 hover:shadow-rose-600/10',
        text: 'text-rose-500',
        logo: 'N',
        gradient: 'from-red-600 to-rose-800'
      };
      case 'tcs': return {
        bg: 'from-cyan-600/10 to-sky-500/10 border-slate-800 hover:border-sky-500/30 hover:shadow-sky-500/10',
        text: 'text-sky-400',
        logo: 'T',
        gradient: 'from-sky-500 to-cyan-500'
      };
      case 'infosys': return {
        bg: 'from-green-600/10 to-emerald-500/10 border-slate-800 hover:border-emerald-500/30 hover:shadow-emerald-500/10',
        text: 'text-green-400',
        logo: 'I',
        gradient: 'from-green-500 to-emerald-600'
      };
      case 'accenture': return {
        bg: 'from-purple-600/10 to-fuchsia-500/10 border-slate-800 hover:border-fuchsia-500/30 hover:shadow-fuchsia-500/10',
        text: 'text-fuchsia-400',
        logo: 'A>',
        gradient: 'from-purple-500 to-fuchsia-500'
      };
      default: return {
        bg: 'from-slate-600/10 to-slate-500/10 border-slate-800 hover:border-slate-500/30 hover:shadow-slate-500/10',
        text: 'text-slate-400',
        logo: 'C',
        gradient: 'from-slate-500 to-slate-600'
      };
    }
  };

  const isLoading = topicsLoading || questionsLoading;

  return (
    <div className="w-screen h-screen flex flex-col bg-[#07080d] text-slate-200 overflow-hidden font-sans relative">
      
      {/* Background ambient glowing rings */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* A. DEDICATED TOP PORTAL NAVBAR */}
      <header className="h-16 border-b border-slate-800/80 bg-[#090b14] px-6 flex items-center justify-between gap-6 shrink-0 relative z-30 shadow-md">
        
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
              CodeBrainz<span className="text-blue-450">X</span>
            </span>
          </Link>
          <span className="hidden sm:inline text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded tracking-widest font-mono">
            Premium Portal
          </span>
        </div>

        {/* Middle Section: Search, Company & Topic Filters */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-lg">
          
          {/* Search bar */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
            <input
              type="text"
              placeholder="Search portal questions, tags..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-850 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-slate-200 transition-all font-bold"
            />
          </div>

          {/* Quick Topic Filter */}
          <div className="relative shrink-0">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-[10px] font-black uppercase tracking-wider bg-slate-950 border border-slate-850 rounded-lg outline-none text-slate-450 focus:border-blue-500 cursor-pointer"
            >
              <option value="">Topic</option>
              {topics?.map(t => (
                <option key={t.id} value={String(t.id)}>{t.name}</option>
              ))}
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-550 pointer-events-none" size={10} />
          </div>

          {/* Quick Difficulty Filter */}
          <div className="relative shrink-0">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-[10px] font-black uppercase tracking-wider bg-slate-955 border border-slate-850 rounded-lg outline-none text-slate-455 focus:border-blue-500 cursor-pointer"
            >
              <option value="">Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-555 pointer-events-none" size={10} />
          </div>
        </div>

        {/* Right Section: Streak status, Notification system bell dropdown & User Avatar */}
        <div className="flex items-center gap-3">
          
          {/* Streak Flame badge */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-455 font-mono text-[11px] font-black">
            <Flame size={12} className="fill-orange-400 animate-pulse" />
            <span>{stats.streak}d</span>
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
                  className="absolute right-0 mt-3 w-80 bg-[#0d0f19] border border-slate-850 rounded-xl shadow-2xl p-4 z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
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
                              ? 'bg-slate-950/20 border-slate-850/40 text-slate-500 hover:bg-slate-900/60'
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
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-850">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-[10px]">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] font-black text-slate-350 hidden sm:inline max-w-[80px] truncate">{user?.username}</span>
          </div>

        </div>
      </header>

      {/* B. MAIN PORTAL WORKSPACE BODY */}
      <div className="flex-grow flex flex-row overflow-hidden relative z-10 w-full h-[calc(100vh-4rem)]">
        
        {/* Left Collapsible Sub-Navigation Sidebar */}
        <aside
          className={`bg-[#0a0c16]/90 border-r border-slate-850 p-4 transition-all duration-300 flex flex-col justify-between shrink-0 h-full ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2 pb-3 border-b border-slate-850">
              {!sidebarCollapsed ? (
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Navigation
                </span>
              ) : (
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-650 mx-auto">Nav</span>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-1.5 rounded-lg bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
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
                const active = activeView === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as any)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all relative shrink-0 cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-650 text-white shadow-lg shadow-blue-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon size={16} className={active ? 'scale-105' : 'opacity-80'} />
                    {!sidebarCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {item.badge && !sidebarCollapsed && (
                      <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-extrabold uppercase animate-pulse">
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
                <div className="text-[9px] text-slate-550 font-mono">Global Rank #{stats.rank}</div>
              </div>
            </div>
          )}
        </aside>

        {/* Scrollable Right Panel Workspace View */}
        <main className="flex-grow overflow-y-auto px-6 py-6 md:py-8 min-w-0">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {isLoading ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-44 bg-[#0d0f1a] border border-slate-850 rounded-3xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-80 bg-[#0d0f1a] border border-slate-850 rounded-2xl"></div>
                  <div className="h-80 bg-[#0d0f1a] border border-slate-850 rounded-2xl"></div>
                </div>
              </div>
            ) : topicsError ? (
              <div className="p-8 bg-rose-955/20 border border-rose-900/50 rounded-2xl text-center text-rose-455 flex flex-col items-center gap-3">
                <AlertCircle size={40} className="text-rose-500 animate-bounce" />
                <h3 className="font-extrabold text-lg">Server Connection Interrupted</h3>
                <p className="text-sm max-w-md">We could not pull the latest challenges database. Verify your compiler microservices are running locally.</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  
                  {/* VIEW A: DASHBOARD HUB */}
                  {activeView === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      
                      {/* Left 2 Columns */}
                      <div className="lg:col-span-2 space-y-6">
                        
                        {/* Premium Ambient Hero Banner */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-[#0c0f24] via-[#0d122e] to-[#070915] border border-blue-900/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
                          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>
                          <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
                          
                          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-3">
                              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-black uppercase tracking-widest">
                                <Sparkles size={14} className="text-amber-400 animate-pulse" />
                                Premium FAANG Coding Suite
                              </div>
                              <h2 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-350 bg-clip-text text-transparent">
                                Welcome Back, {user?.username}!
                              </h2>
                              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                                Hone your technical interview skills with real-time feedback, mock tests, and top corporate interview sheets.
                              </p>
                            </div>

                            {/* Interactive gauge badge */}
                            <div className="flex items-center gap-4 bg-slate-950/60 backdrop-blur-md rounded-2xl p-4 border border-slate-800 shrink-0">
                              <div className="text-right">
                                <span className="text-[10px] text-slate-500 block uppercase font-black tracking-wider mb-0.5">Acceptance Rate</span>
                                <span className="text-lg font-black font-mono text-blue-400">{stats.userAcceptanceRate}%</span>
                              </div>
                              <div className="w-12 h-12 rounded-full border-[3px] border-slate-850 flex items-center justify-center font-extrabold text-[11px] font-mono text-emerald-450 relative">
                                <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0">
                                  <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    className="stroke-emerald-400/80"
                                    strokeWidth="3"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 20}
                                    strokeDashoffset={2 * Math.PI * 20 * (1 - stats.userAcceptanceRate / 100)}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span className="z-10">{stats.userAcceptanceRate}%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stats Summary Cards Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          
                          {/* Solved Card */}
                          <div className="bg-[#0e111b] border border-slate-850 p-4.5 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-slate-550 uppercase tracking-widest">Solved</span>
                              <CheckCircle2 size={15} className="text-emerald-500" />
                            </div>
                            <div className="mt-2.5">
                              <span className="text-2xl font-black font-mono text-slate-200">
                                <AnimatedCounter value={stats.solved} />
                              </span>
                              <span className="text-xs text-slate-500 font-bold font-mono"> / {stats.total}</span>
                            </div>
                            <div className="text-[9px] text-slate-500 font-bold mt-1 uppercase">Challenges Done</div>
                          </div>

                          {/* Acceptance Card */}
                          <div className="bg-[#0e111b] border border-slate-850 p-4.5 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-slate-550 uppercase tracking-widest">Acceptance</span>
                              <Target size={15} className="text-blue-500" />
                            </div>
                            <div className="mt-2.5 text-2xl font-black font-mono text-slate-200">
                              <AnimatedCounter value={stats.userAcceptanceRate} />%
                        </div>
                            <div className="text-[9px] text-slate-500 font-bold mt-1 uppercase">Success Score</div>
                          </div>

                          {/* Streak Card */}
                          <div className="bg-[#0e111b] border border-slate-850 p-4.5 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-slate-555 uppercase tracking-widest">Streak</span>
                              <Flame size={15} className="text-orange-500" />
                            </div>
                            <div className="mt-2.5 text-2xl font-black font-mono text-slate-200">
                              <AnimatedCounter value={stats.streak} />
                            </div>
                            <div className="text-[9px] text-slate-500 font-bold mt-1 uppercase">Days Active</div>
                          </div>

                          {/* Rank Card */}
                          <div className="bg-[#0e111b] border border-slate-850 p-4.5 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black text-slate-550 uppercase tracking-widest">Rank</span>
                              <Trophy size={15} className="text-indigo-500" />
                            </div>
                            <div className="mt-2.5 text-2xl font-black font-mono text-slate-200">
                              <AnimatedCounter value={stats.rank} prefix="#" />
                            </div>
                            <div className="text-[9px] text-slate-500 font-bold mt-1 uppercase">Global Position</div>
                          </div>

                        </div>

                        {/* Company Explorer */}
                        <div className="bg-[#0e111b] border border-slate-850 rounded-2xl p-6 shadow-2xl">
                          <div className="flex items-center gap-2 mb-4">
                            <Layers size={16} className="text-blue-400" />
                            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">Company Explorer</h3>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {COMPANY_LIST.map((comp) => {
                              const count = questions.filter(q => q.companies.some(c => c.toLowerCase() === comp.slug)).length;
                              const style = getCompanyStyles(comp.slug);
                              return (
                                <button
                                  key={comp.slug}
                                  onClick={() => {
                                    setSelectedCompany(comp.slug);
                                    setActiveView('all');
                                  }}
                                  className={`relative overflow-hidden p-3.5 rounded-xl border bg-gradient-to-br ${style.bg} hover:scale-[1.02] active:scale-[0.98] transition-all text-left cursor-pointer group`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className={`text-xs font-black uppercase tracking-wider ${style.text}`}>
                                      {comp.name}
                                    </span>
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-200 to-slate-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-inner">
                                      {style.logo}
                                    </div>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-bold mt-2">{count} Curated Sheets</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Topic progress grid */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <BookOpen size={16} className="text-blue-400" />
                            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">Topic Progress Map</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {topics?.map((topic) => {
                              const topicPercent = topic.total_questions > 0
                                ? Math.round((topic.solved_questions / topic.total_questions) * 100)
                                : 0;
                              return (
                                <div key={topic.id} className="bg-[#0e111b] border border-slate-850 p-5 rounded-2xl hover:border-slate-700 transition-colors">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-black text-slate-200 text-xs tracking-wide">
                                      {topic.name}
                                    </h4>
                                    <span className="text-[9px] font-mono font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                                      {topic.solved_questions}/{topic.total_questions}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 leading-relaxed mb-4 line-clamp-2 h-7">{topic.description}</p>
                                  
                                  {/* Linear Progress */}
                                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-850 mb-4">
                                    <div
                                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                                      style={{ width: `${topicPercent}%` }}
                                    ></div>
                                  </div>

                                  {/* Levels Pill Grid */}
                                  <div className="grid grid-cols-2 gap-2">
                                    {topic.levels.map((level) => {
                                      const isCompleted = level.total_questions > 0 && level.solved_questions === level.total_questions;
                                      const isLocked = level.is_locked;
                                      return (
                                        <div key={level.id}>
                                          {isLocked ? (
                                            <div
                                              className="flex items-center justify-between p-2 rounded-lg text-[10px] bg-slate-950/20 text-slate-600 border border-slate-900/60 cursor-not-allowed select-none"
                                              title="Unlock predecessor level first"
                                            >
                                              <span className="flex items-center gap-1 font-bold">
                                                <Lock size={10} />
                                                {getLevelLabel(level.level)}
                                              </span>
                                              <span className="font-mono opacity-65">{level.total_questions}Q</span>
                                            </div>
                                          ) : (
                                            <Link
                                              to={`/topics/${topic.id}/level/${level.level}`}
                                              className={`flex items-center justify-between p-2 rounded-lg text-[10px] transition-all hover:scale-[1.02] border font-bold ${getLevelBadgeColor(level.level, isLocked, isCompleted)}`}
                                            >
                                              <span className="flex items-center gap-1">
                                                {isCompleted ? <CheckCircle2 size={11} className="text-emerald-400" /> : <Unlock size={10} />}
                                                {getLevelLabel(level.level)}
                                              </span>
                                              <span className="font-mono text-[9px]">{level.solved_questions}/{level.total_questions}</span>
                                            </Link>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        
                        {/* Daily Challenge Card */}
                        {dailyQuestion && (
                          <div className="relative overflow-hidden bg-[#0e111b] border border-indigo-900/40 p-5 rounded-2xl">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-455 animate-ping"></span>
                                Daily Challenge
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 font-bold flex items-center gap-1 bg-slate-955/40 px-2 py-0.5 rounded border border-slate-800">
                                <Clock size={10} />
                                {timeLeft}
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-200">{dailyQuestion.title}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border bg-rose-955/20 text-rose-455 border-rose-900/30">
                                {getLevelLabel(dailyQuestion.level_name)}
                              </span>
                              <span className="text-[9px] font-mono font-bold text-slate-500">Acceptance: {dailyQuestion.acceptance_rate}%</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-2 font-bold flex items-center gap-1">
                              <Sparkles size={11} className="text-amber-500" />
                              <span>Double streaks enabled today.</span>
                            </div>
                            <Link
                              to={`/questions/${dailyQuestion.id}`}
                              className="w-full mt-4 py-2 bg-indigo-650 hover:bg-indigo-550 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Play size={10} className="fill-white" />
                              <span>Attempt Challenge</span>
                            </Link>
                          </div>
                        )}

                        {/* Progress Circle breakdown widget */}
                        <div className="bg-[#0e111b] border border-slate-855 rounded-2xl p-5 text-center">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Practice Distribution</h4>
                          
                          <div className="relative flex justify-center items-center my-6">
                            <svg className="w-28 h-28 transform -rotate-90">
                              <circle
                                cx="56"
                                cy="56"
                                r="44"
                                className="stroke-slate-955"
                                strokeWidth="6"
                                fill="transparent"
                              />
                              <circle
                                cx="56"
                                cy="56"
                                r="44"
                                className="stroke-blue-500 transition-all duration-1000"
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 44}
                                strokeDashoffset={2 * Math.PI * 44 * (1 - stats.solvedRatio)}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                              <span className="text-xl font-black font-mono text-slate-200">
                                {stats.solved}
                              </span>
                              <span className="text-[8px] text-slate-555 uppercase tracking-widest font-black font-mono">
                                / {stats.total} Done
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2.5 text-left mt-2">
                            {[
                              { label: 'Easy', solved: stats.easySolved, total: stats.easyTotal, color: 'bg-emerald-500', text: 'text-emerald-400' },
                              { label: 'Medium', solved: stats.mediumSolved, total: stats.mediumTotal, color: 'bg-amber-500', text: 'text-amber-400' },
                              { label: 'Hard', solved: stats.hardSolved, total: stats.hardTotal, color: 'bg-rose-500', text: 'text-rose-455' }
                            ].map((item) => (
                              <div key={item.label}>
                                <div className="flex justify-between text-[10px] font-black mb-1">
                                  <span className={item.text}>{item.label}</span>
                                  <span className="text-slate-500 font-mono">{item.solved} / {item.total}</span>
                                </div>
                                <div className="w-full bg-slate-955 h-1 rounded-full overflow-hidden border border-slate-850/50">
                                  <div
                                    className={`h-full ${item.color}`}
                                    style={{ width: `${item.total > 0 ? (item.solved / item.total) * 100 : 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* GitHub style Weekly Activity Heat grid */}
                        <div className="bg-[#0e111b] border border-slate-850 rounded-2xl p-5">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Weekly Intensity</h4>
                          <div className="flex items-center justify-between gap-1.5">
                            {weeklyActivity.map((day, idx) => (
                              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                                <span className="text-[9px] text-slate-555 font-bold uppercase">{day.label}</span>
                                <div
                                  className={`w-full aspect-square max-w-[28px] rounded-lg border transition-all ${
                                    day.active
                                      ? 'bg-gradient-to-tr from-emerald-600 to-green-500 border-emerald-500/40 shadow-md shadow-emerald-500/10'
                                      : 'bg-slate-955 border-slate-850/80'
                                  }`}
                                  title={`${day.active ? 'Activity recorded' : 'No runs completed'}`}
                                ></div>
                                <span className="text-[8px] text-slate-600 font-bold">{day.dayNum}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Custom solved activity wave graph */}
                        <div className="bg-[#0e111b] border border-slate-850 rounded-2xl p-5 space-y-3">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <TrendingUp size={13} className="text-blue-400" />
                            Submission Activity
                          </h4>
                          <div className="h-16 w-full relative overflow-hidden bg-slate-955/40 rounded-xl border border-slate-850 flex items-end">
                            <svg className="w-full h-full text-blue-500 absolute bottom-0 left-0" viewBox="0 0 100 30" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
                                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>
                              <path
                                d="M0 25 Q15 15, 30 20 T60 10 T90 5 T100 12 L100 30 L0 30 Z"
                                fill="url(#chartGrad)"
                              />
                              <path
                                d="M0 25 Q15 15, 30 20 T60 10 T90 5 T100 12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute top-2 left-3 text-[9px] font-mono text-slate-500 font-bold">Activity Index</div>
                            <div className="absolute bottom-2 right-3 text-[9px] font-mono text-slate-500 font-bold">Last 7d</div>
                          </div>
                        </div>

                        {/* Recommended / Continue solving listing widget */}
                        <div className="bg-[#0e111b] border border-slate-850 rounded-2xl p-5 space-y-3">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Compass size={13} className="text-blue-455" />
                            Recommended For You
                          </h4>
                          <div className="space-y-2">
                            {recommendedQuestions.length > 0 ? (
                              recommendedQuestions.map((q) => (
                                <Link
                                  key={q.id}
                                  to={`/questions/${q.id}`}
                                  className="flex justify-between items-center p-2 rounded-lg bg-slate-955/40 border border-slate-850 hover:border-slate-700 transition-colors"
                                >
                                  <span className="text-[10px] text-slate-350 font-bold truncate max-w-[150px]">{q.title}</span>
                                  <span className="text-[8px] font-black uppercase tracking-wider border px-1.5 py-0.5 rounded bg-emerald-955/20 text-emerald-455 border-emerald-900/30">
                                    {getLevelLabel(q.level_name)}
                                  </span>
                                </Link>
                              ))
                            ) : (
                              <div className="text-[10px] text-slate-500 italic">No recommendations. You solved everything!</div>
                            )}
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* VIEW B: PROBLEMS TABLE & FILTERS */}
                  {(activeView === 'all' || activeView === 'bookmarks') && (
                    <div className="space-y-6">
                      
                      {/* Sticky Filter Bar */}
                      <div className="bg-[#0e111b] border border-slate-850 p-4 rounded-2xl sticky top-0 z-25 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative flex-grow w-full md:w-auto">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-550" size={15} />
                          <input
                            type="text"
                            placeholder="Search title, tag, or topic name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-955 border border-slate-850 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-slate-200 transition-all font-bold"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                          
                          {/* Topic Selector */}
                          <div className="relative">
                            <select
                              value={selectedTopic}
                              onChange={(e) => setSelectedTopic(e.target.value)}
                              className="appearance-none pl-3 pr-8 py-2 text-[10px] font-black uppercase tracking-wider bg-slate-955 border border-slate-850 rounded-xl outline-none text-slate-400 focus:border-blue-500 cursor-pointer"
                            >
                              <option value="">All Topics</option>
                              {topics?.map(t => (
                                <option key={t.id} value={String(t.id)}>{t.name}</option>
                              ))}
                            </select>
                            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-550 pointer-events-none" size={10} />
                          </div>

                          {/* Difficulty Selector */}
                          <div className="relative">
                            <select
                              value={selectedDifficulty}
                              onChange={(e) => setSelectedDifficulty(e.target.value)}
                              className="appearance-none pl-3 pr-8 py-2 text-[10px] font-black uppercase tracking-wider bg-slate-955 border border-slate-850 rounded-xl outline-none text-slate-405 focus:border-blue-500 cursor-pointer"
                            >
                              <option value="">All Difficulties</option>
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                            <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-555 pointer-events-none" size={10} />
                          </div>

                          {/* Status Selector */}
                          <div className="relative">
                            <select
                              value={selectedStatus}
                              onChange={(e) => setSelectedStatus(e.target.value)}
                              className="appearance-none pl-3 pr-8 py-2 text-[10px] font-black uppercase tracking-wider bg-slate-955 border border-slate-850 rounded-xl outline-none text-slate-405 focus:border-blue-500 cursor-pointer"
                            >
                              <option value="">All Status</option>
                              <option value="solved">Solved</option>
                              <option value="unsolved">Unsolved</option>
                            </select>
                            <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-555 pointer-events-none" size={10} />
                          </div>

                          {/* Sort Selector */}
                          <div className="relative">
                            <select
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value)}
                              className="appearance-none pl-3 pr-8 py-2 text-[10px] font-black uppercase tracking-wider bg-slate-955 border border-slate-850 rounded-xl outline-none text-slate-405 focus:border-blue-500 cursor-pointer"
                            >
                              <option value="order">Sort ID</option>
                              <option value="title">Sort Name</option>
                              <option value="difficulty">Sort Difficulty</option>
                              <option value="acceptance">Sort Acceptance</option>
                            </select>
                            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-555 pointer-events-none" size={10} />
                          </div>

                        </div>
                      </div>

                      {/* Horizontal Scroll Company chips */}
                      <div className="flex items-center gap-2 pb-2.5 overflow-x-auto no-scrollbar border-b border-slate-850">
                        <span className="text-[10px] font-black text-slate-550 uppercase tracking-widest mr-1">Company:</span>
                        <button
                          onClick={() => setSelectedCompany('')}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black cursor-pointer transition-colors border ${
                            selectedCompany === ''
                              ? 'bg-blue-600 text-white border-blue-650/20'
                              : 'bg-slate-955 text-slate-400 border-slate-850 hover:text-white'
                          }`}
                        >
                          ALL
                        </button>
                        {COMPANY_LIST.map((comp) => {
                          const isActive = selectedCompany.toLowerCase() === comp.slug;
                          return (
                            <button
                              key={comp.slug}
                              onClick={() => setSelectedCompany(isActive ? '' : comp.slug)}
                              className={`px-3 py-1.5 rounded-full text-[10px] font-black cursor-pointer transition-colors border ${
                                isActive
                                  ? 'bg-blue-600 text-white border-blue-650/20'
                                  : 'bg-slate-955 text-slate-400 border-slate-850 hover:text-white'
                              }`}
                            >
                              {comp.name}
                            </button>
                          );
                        })}
                      </div>

                      {/* Problems table */}
                      {filteredQuestions.length === 0 ? (
                        <div className="text-center py-20 bg-[#0e111b] border border-slate-850 rounded-3xl p-8">
                          <HelpCircle size={44} className="mx-auto mb-3 text-slate-600 animate-pulse" />
                          <h3 className="text-base font-black text-slate-350">No Challenges Found</h3>
                          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">Adjust search parameters or choose different category filters.</p>
                        </div>
                      ) : (
                        <div className="bg-[#0e111b] border border-slate-855 rounded-2xl overflow-hidden shadow-2xl">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                              <thead>
                                <tr className="border-b border-slate-850 text-slate-500 font-black uppercase tracking-wider bg-slate-955/20">
                                  <th className="py-4 pl-6 w-12 text-center">Status</th>
                                  <th className="py-4 px-4">Title</th>
                                  <th className="py-4 px-4 w-28">Difficulty</th>
                                  <th className="py-4 px-4 w-28 text-center">Acceptance</th>
                                  <th className="py-4 px-4 w-40">Companies</th>
                                  <th className="py-4 px-4 w-48">Tags</th>
                                  <th className="py-4 pr-6 w-32 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-850 text-slate-300">
                                {paginatedQuestions.map((q) => {
                                  const priority: Record<string, string> = {
                                    basic: 'text-blue-450 bg-blue-500/10 border-blue-500/20',
                                    easy: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
                                    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                                    hard: 'text-rose-455 bg-rose-500/10 border-rose-500/20',
                                  };
                                  return (
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

                                            {/* Bookmark button */}
                                            <button
                                              onClick={() => handleToggleFlag(q.id, 'bookmarks')}
                                              className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${q.is_bookmarked ? 'text-amber-405' : 'text-slate-600'}`}
                                              title="Bookmark"
                                            >
                                              <Star size={11} className={q.is_bookmarked ? 'fill-amber-400' : ''} />
                                            </button>

                                            <button
                                              onClick={() => handleToggleFlag(q.id, 'favorites')}
                                              className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${q.is_favorite ? 'text-rose-405' : 'text-slate-600'}`}
                                              title="Favorite"
                                            >
                                              <Heart size={11} className={q.is_favorite ? 'fill-rose-400' : ''} />
                                            </button>

                                            <button
                                              onClick={() => handleToggleFlag(q.id, 'liked')}
                                              className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${q.is_liked ? 'text-blue-405' : 'text-slate-600'}`}
                                              title="Like"
                                            >
                                              <ThumbsUp size={11} className={q.is_liked ? 'fill-blue-405' : ''} />
                                            </button>
                                            {q.is_liked && <span className="text-[9px] font-bold text-blue-400 font-mono">+{q.likes}</span>}
                                          </div>
                                          <span className="text-[9px] text-slate-550 font-mono">Limits: {q.time_limit}s / {q.memory_limit}MB</span>
                                        </div>
                                      </td>
                                      <td className="py-4 px-4">
                                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${priority[q.level_name] || 'text-slate-400'}`}>
                                          {getLevelLabel(q.level_name)}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4 text-center font-mono font-bold text-slate-350">
                                        {q.acceptance_rate}%
                                      </td>
                                      <td className="py-4 px-4">
                                        <div className="flex flex-wrap gap-1">
                                          {q.companies.slice(0, 2).map(c => (
                                            <span key={c} className="text-[9px] font-black uppercase bg-slate-955 text-slate-450 border border-slate-850 px-1.5 py-0.5 rounded">
                                              {c}
                                            </span>
                                          ))}
                                          {q.companies.length > 2 && (
                                            <span className="text-[9px] font-bold text-slate-550">+{q.companies.length - 2}</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-4 px-4">
                                        <div className="flex flex-wrap gap-1">
                                          {q.tags.slice(0, 2).map(t => (
                                            <span key={t} className="text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">
                                              {t}
                                            </span>
                                          ))}
                                        </div>
                                      </td>
                                      <td className="py-4 pr-6 text-center">
                                        <Link
                                          to={`/questions/${q.id}`}
                                          className={`px-3 py-1.5 text-[10px] font-black rounded-lg inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                                            q.solved
                                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10'
                                          }`}
                                        >
                                          {q.solved ? 'Review' : 'Solve'}
                                          <ChevronRight size={11} />
                                        </Link>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination Footer */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-850 bg-slate-955/25">
                              <span className="text-[10px] text-slate-500 font-bold">
                                Page {currentPage} of {totalPages} ({filteredQuestions.length} Problems)
                              </span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                  disabled={currentPage === 1}
                                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-955 hover:bg-slate-900 text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  <ChevronLeft size={14} />
                                </button>
                                <button
                                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                  disabled={currentPage === totalPages}
                                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-955 hover:bg-slate-900 text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  <ChevronRight size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                  {/* VIEW C: COMPANY EXPLORER */}
                  {activeView === 'companies' && (
                    <div className="bg-[#0e111b] border border-slate-850 rounded-2xl p-6 space-y-6">
                      <div className="flex items-center gap-2">
                        <Layers size={17} className="text-blue-400" />
                        <h3 className="text-base font-black text-slate-200 uppercase tracking-wide">FAANG+ Sheet Explorer</h3>
                      </div>
                      <p className="text-xs text-slate-450 leading-relaxed max-w-xl">
                        Target companies explicitly. Click on any cards below to load structured sheets that closely mimic the live tech assessments of specific organizations.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {COMPANY_LIST.map((comp) => {
                          const count = questions.filter(q => q.companies.some(c => c.toLowerCase() === comp.slug)).length;
                          const style = getCompanyStyles(comp.slug);
                          return (
                            <div
                              key={comp.slug}
                              onClick={() => {
                                setSelectedCompany(comp.slug);
                                setActiveView('all');
                              }}
                              className={`relative overflow-hidden p-5 rounded-2xl border bg-gradient-to-br ${style.bg} hover:scale-[1.02] active:scale-[0.98] transition-all text-left cursor-pointer group flex flex-col justify-between h-36`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className={`text-base font-black uppercase tracking-wider ${style.text}`}>{comp.name}</h4>
                                  <p className="text-[10px] text-slate-500 mt-1 font-bold">Interviews & Assessments</p>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-black/20">
                                  {style.logo}
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-4">
                                <span className="text-xs font-black font-mono text-slate-350">{count} Challenges</span>
                                <span className="text-[10px] font-bold text-slate-550 flex items-center gap-1 group-hover:text-slate-300 transition-colors">
                                  Explore Sheet
                                  <ChevronRight size={12} />
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* VIEW D: TOPICS PROGRESS TAB */}
                  {activeView === 'topics' && (
                    <div className="bg-[#0e111b] border border-slate-855 rounded-2xl p-6 space-y-6">
                      <div className="flex items-center gap-2">
                        <BookOpen size={17} className="text-blue-400" />
                        <h3 className="text-base font-black text-slate-200 uppercase tracking-wide">Category Progression Maps</h3>
                      </div>
                      <p className="text-xs text-slate-455 leading-relaxed max-w-xl">
                        Follow logical sequences. Complete basic modules to automatically trigger unlocks for advanced and complex challenges.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {topics?.map((topic) => {
                          const topicPercent = topic.total_questions > 0
                            ? Math.round((topic.solved_questions / topic.total_questions) * 100)
                            : 0;
                          return (
                            <div key={topic.id} className="bg-slate-955/20 border border-slate-850 p-5 rounded-2xl relative overflow-hidden hover:border-slate-700 transition-colors">
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-black text-slate-200 text-sm tracking-wide">
                                  {topic.name}
                                </h4>
                                <span className="text-[10px] font-mono font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                                  {topic.solved_questions}/{topic.total_questions} Solved
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed mb-5">{topic.description}</p>
                              
                              {/* Linear Progress */}
                              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-850 mb-5">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                                  style={{ width: `${topicPercent}%` }}
                                ></div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                {topic.levels.map((level) => {
                                  const isCompleted = level.total_questions > 0 && level.solved_questions === level.total_questions;
                                  const isLocked = level.is_locked;
                                  return (
                                    <div key={level.id}>
                                      {isLocked ? (
                                        <div className="flex items-center justify-between p-2.5 rounded-lg text-xs bg-slate-900/40 text-slate-600 border border-slate-900/60 cursor-not-allowed select-none">
                                          <span className="flex items-center gap-1.5 font-bold">
                                            <Lock size={11} />
                                            {getLevelLabel(level.level)}
                                          </span>
                                          <span className="font-mono opacity-65">{level.total_questions}Q</span>
                                        </div>
                                      ) : (
                                        <Link
                                          to={`/topics/${topic.id}/level/${level.level}`}
                                          className={`flex items-center justify-between p-2.5 rounded-lg text-xs transition-all hover:scale-[1.02] border font-bold ${getLevelBadgeColor(level.level, isLocked, isCompleted)}`}
                                        >
                                          <span className="flex items-center gap-1.5">
                                            {isCompleted ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Unlock size={11} />}
                                            {getLevelLabel(level.level)}
                                          </span>
                                          <span className="font-mono">{level.solved_questions}/{level.total_questions}</span>
                                        </Link>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* VIEW E: CONTESTS AND HACKATHONS */}
                  {activeView === 'contests' && (
                    <div className="bg-[#0e111b] border border-slate-855 rounded-2xl p-6 space-y-6">
                      <div className="flex items-center gap-2">
                        <Trophy size={17} className="text-red-400" />
                        <h3 className="text-base font-black text-slate-200 uppercase tracking-wide">Studio hackathons & Contests</h3>
                      </div>
                      <p className="text-xs text-slate-450 leading-relaxed max-w-xl">
                        Test your logic in real-time. Join community contests or structured developer hackathons to scale global scoreboards.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Contest card 1 */}
                        <div className="bg-slate-955/45 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between h-44 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl"></div>
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-black bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded uppercase">Biweekly Arena</span>
                              <span className="text-[10px] font-mono text-slate-500 font-bold">Starts in 3h 15m</span>
                            </div>
                            <h4 className="text-sm font-black text-slate-200 mt-3">CodexPetra Weekly Contest 405</h4>
                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Solve 4 algorithm problems in 90 minutes. Earn platform rank credits.</p>
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-[10px] font-mono text-slate-400">Prizes: 500 XP + Badges</span>
                            <button className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-black cursor-pointer transition-colors shadow-sm">
                              Register Now
                            </button>
                          </div>
                        </div>

                        {/* Hackathon Link card */}
                        <div className="bg-slate-955/45 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between h-44 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded uppercase">Hackathon Hub</span>
                              <span className="text-[10px] font-mono text-emerald-405 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                Active
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-200 mt-3">Web3 Cloud Hackathon 2026</h4>
                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Build distributed apps on cloud compilers. Submit builds for audit.</p>
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-[10px] font-mono text-slate-400">Team sizes: 1 to 4 members</span>
                            <Link
                              to="/dashboard/hackathons"
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black cursor-pointer transition-colors shadow-sm"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* VIEW F: SUBMISSIONS AUDIT LOGS */}
                  {activeView === 'recent' && (
                    <div className="bg-[#0e111b] border border-slate-850 rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <History size={17} className="text-blue-450" />
                        <h3 className="text-base font-black text-slate-200 uppercase tracking-wide">Submission Activity Feed</h3>
                      </div>

                      {subsLoading ? (
                        <div className="flex justify-center items-center py-12 text-slate-500 font-bold">
                          <Loader2 className="animate-spin text-blue-550 mr-2" />
                          Auditing files...
                        </div>
                      ) : !submissions || submissions.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl p-8">
                          <History size={36} className="mx-auto mb-2 text-slate-600 animate-pulse" />
                          <p className="text-xs font-bold text-slate-550">No submissions found in logs.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-850">
                          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                            <thead>
                              <tr className="border-b border-slate-850 text-slate-500 font-black uppercase bg-slate-955/20">
                                <th className="py-3 px-4">Challenge Name</th>
                                <th className="py-3 px-4 w-28">Language</th>
                                <th className="py-3 px-4 w-32">Status</th>
                                <th className="py-3 px-4 w-44">Submitted At</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850 text-slate-300">
                              {submissions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-slate-850/10 transition-colors">
                                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-200 hover:text-blue-450 transition-colors">
                                    <Link to={`/questions/${sub.question}`}>{sub.question_title}</Link>
                                  </td>
                                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400 font-bold">{sub.language_name}</td>
                                  <td className="py-3.5 px-4">
                                    <span
                                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black border ${
                                        sub.status === 'Accepted'
                                          ? 'bg-emerald-955/20 text-emerald-455 border-emerald-900/40'
                                          : 'bg-rose-955/20 text-rose-455 border-rose-900/40'
                                      }`}
                                    >
                                      {sub.status}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-[10px] text-slate-505 font-mono font-bold">
                                    {new Date(sub.created_at).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* VIEW G: GAMIFIED LEADERBOARD */}
                  {activeView === 'leaderboard' && (
                    <div className="bg-[#0e111b] border border-slate-850 rounded-2xl p-6 space-y-6">
                      <div className="flex items-center gap-2">
                        <Trophy size={17} className="text-indigo-400" />
                        <h3 className="text-base font-black text-slate-200 uppercase tracking-wide">Platform Leaderboards</h3>
                      </div>
                      <p className="text-xs text-slate-455 leading-relaxed max-w-xl">
                        Rankings are refreshed every coding run. Climb up standard modules by solving problems with fewer attempts and higher test-case completion rates.
                      </p>

                      {/* Top 3 podium display */}
                      <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto pt-6 pb-2 text-center items-end">
                        
                        {/* Rank 2 */}
                        {leaderboard[1] && (
                          <div className="flex flex-col items-center">
                            <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-slate-550 flex items-center justify-center font-bold text-xs text-slate-300 shadow-md">
                              {leaderboard[1].avatar}
                            </div>
                            <span className="text-[10px] font-bold text-slate-355 mt-1 truncate max-w-[80px]">{leaderboard[1].name}</span>
                            <div className="h-16 w-full bg-slate-955/40 border border-slate-850 rounded-t-lg mt-2 flex flex-col justify-center items-center">
                              <span className="text-sm font-black text-slate-350">2nd</span>
                              <span className="text-[9px] text-slate-500 font-mono">{leaderboard[1].solved} Qs</span>
                            </div>
                          </div>
                        )}

                        {/* Rank 1 */}
                        {leaderboard[0] && (
                          <div className="flex flex-col items-center">
                            <div className="relative">
                              <Sparkles size={16} className="text-amber-500 absolute -top-4 left-1/2 -translate-x-1/2 fill-amber-500 animate-pulse" />
                              <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-amber-500 flex items-center justify-center font-black text-sm text-amber-400 shadow-lg shadow-amber-500/10">
                                {leaderboard[0].avatar}
                              </div>
                            </div>
                            <span className="text-xs font-black text-slate-200 mt-1 truncate max-w-[90px]">{leaderboard[0].name}</span>
                            <div className="h-24 w-full bg-indigo-955/10 border border-indigo-900/30 rounded-t-xl mt-2 flex flex-col justify-center items-center">
                              <span className="text-base font-black text-amber-400">1st</span>
                              <span className="text-[10px] text-indigo-400 font-mono font-bold">{leaderboard[0].solved} Qs</span>
                            </div>
                          </div>
                        )}

                        {/* Rank 3 */}
                        {leaderboard[2] && (
                          <div className="flex flex-col items-center">
                            <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-amber-750 flex items-center justify-center font-bold text-xs text-amber-600 shadow-md">
                              {leaderboard[2].avatar}
                            </div>
                            <span className="text-[10px] font-bold text-slate-355 mt-1 truncate max-w-[80px]">{leaderboard[2].name}</span>
                            <div className="h-12 w-full bg-slate-955/40 border border-slate-855 rounded-t-lg mt-2 flex flex-col justify-center items-center">
                              <span className="text-xs font-black text-amber-705">3rd</span>
                              <span className="text-[9px] text-slate-500 font-mono">{leaderboard[2].solved} Qs</span>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Leaderboard Table list */}
                      <div className="overflow-x-auto rounded-xl border border-slate-855 max-w-2xl mx-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-850 text-slate-505 font-black uppercase bg-slate-955/20">
                              <th className="py-3 px-4 w-16 text-center">Rank</th>
                              <th className="py-3 px-4">User</th>
                              <th className="py-3 px-4 w-28 text-center">Solved</th>
                              <th className="py-3 px-4 w-28 text-center">Streak</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850 text-slate-300">
                            {leaderboard.map((item) => (
                              <tr
                                key={item.name}
                                className={`transition-colors ${
                                  item.isCurrentUser
                                    ? 'bg-blue-600/10 font-bold border-l-2 border-l-blue-500'
                                    : 'hover:bg-slate-855/10'
                                }`}
                              >
                                <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">#{item.rank}</td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-full bg-slate-800 text-[10px] font-black flex items-center justify-center border border-slate-700/50">
                                      {item.avatar}
                                    </div>
                                    <span className={item.isCurrentUser ? 'text-blue-400' : 'text-slate-200'}>
                                      {item.name} {item.isCurrentUser && '(You)'}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-350">{item.solved} Qs</td>
                                <td className="py-3.5 px-4 text-center font-mono text-orange-455 font-bold flex items-center justify-center gap-1">
                                  <Flame size={12} className="fill-orange-400/20" />
                                  {item.streak}d
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* VIEW H: ACCOUNT PROFILE */}
                  {activeView === 'profile' && (
                    <div className="max-w-2xl bg-[#0e111b] border border-slate-850 rounded-2xl p-6 sm:p-8">
                      <div className="flex items-center gap-5 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 text-white shadow-xl border border-blue-400 flex items-center justify-center text-3xl font-black">
                          {user?.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-200">{user?.username}</h3>
                          <p className="text-xs text-slate-500 uppercase tracking-widest font-black font-mono mt-1">Platform Account ({user?.role})</p>
                        </div>
                      </div>

                      <div className="space-y-6 border-t border-slate-800 pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Email Address</span>
                            <span className="text-xs font-bold text-slate-300">{user?.email || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Interactive Badges</span>
                            <span className="text-xs font-bold text-emerald-405 flex items-center gap-1">
                              <Sparkles size={12} className="fill-emerald-400/10" />
                              Rank #{stats.rank} Coder
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-[#1a1d2e] pt-6 flex gap-4">
                          <button
                            onClick={logout}
                            className="px-4 py-2 border border-rose-900/50 bg-rose-955/10 hover:bg-rose-955/35 text-rose-400 font-black rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                          >
                            <LogOut size={13} />
                            Logout Session
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

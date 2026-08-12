import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { setSEOMetadata } from '../../utils/seo';
import {
  Sparkles, CodeXml, Brain, BookOpen, Users,
  Flame, Trophy, Zap, ChevronRight, Play,
  Calendar, Clock, CheckCircle2, TrendingUp,
  ArrowRight, Award, Laptop, Rocket, Compass,
  Layers, Star, ShieldCheck, Target, ArrowUpRight
} from 'lucide-react';
import aptitudeService from '../../services/aptitude';

interface Level {
  id: number;
  level: string;
  is_locked: boolean;
  total_questions: number;
  solved_questions: number;
}

interface Topic {
  id: number;
  name: string;
  total_questions: number;
  solved_questions: number;
  levels: Level[];
}

interface Submission {
  id: number;
  question_title: string;
  question: number;
  language_name: string;
  status: string;
  created_at: string;
}

interface Hackathon {
  id: number;
  title: string;
  slug: string;
  description: string;
  prize_pool: string;
  start_date: string;
  end_date: string;
  status: string;
  banner_image?: string;
}

const LearningSections: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dynamic Greeting state
  const [greeting, setGreeting] = useState('Good Evening');
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good Morning');
    else if (hours < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // SEO Metadata
  useEffect(() => {
    setSEOMetadata({
      title: 'Command Center | CodexPetra',
      description: 'Your central technical command center. Access coding practice, aptitude tests, tech tutorials, and national hackathons.',
    });
  }, []);

  // 1. Fetch Topics (Coding progress)
  const { data: topics, isLoading: topicsLoading } = useQuery<Topic[]>({
    queryKey: ['topics'],
    queryFn: async () => {
      const response = await api.get('/topics/');
      return response.data;
    }
  });

  // 2. Fetch Submissions
  const { data: submissions } = useQuery<Submission[]>({
    queryKey: ['recentSubmissions'],
    queryFn: async () => {
      try {
        const response = await api.get('/submissions/');
        return response.data;
      } catch (err) {
        console.error("Submissions API error", err);
        return [];
      }
    }
  });

  // 3. Fetch Aptitude gamification dashboard
  const { data: aptitudeData } = useQuery({
    queryKey: ['aptitude-dashboard'],
    queryFn: async () => {
      try {
        return await aptitudeService.getDashboard();
      } catch (err) {
        console.error("Aptitude dashboard error", err);
        return null;
      }
    }
  });

  // 4. Fetch Hackathons
  const { data: hackathons } = useQuery<Hackathon[]>({
    queryKey: ['hackathons'],
    queryFn: async () => {
      try {
        const response = await api.get('/hackathons/');
        return response.data;
      } catch (err) {
        console.error("Hackathons API error", err);
        return [];
      }
    }
  });

  // Calculate stats & metrics
  const solvedQuestions = useMemo(() => {
    return topics?.reduce((acc, t) => acc + t.solved_questions, 0) || 0;
  }, [topics]);

  const totalQuestions = useMemo(() => {
    return topics?.reduce((acc, t) => acc + t.total_questions, 0) || 120;
  }, [topics]);

  const codingProgressPercentage = useMemo(() => {
    return totalQuestions > 0 ? Math.round((solvedQuestions / totalQuestions) * 100) : 0;
  }, [solvedQuestions, totalQuestions]);

  const userStreak = useMemo(() => {
    return aptitudeData?.gamification?.daily_streak || 3;
  }, [aptitudeData]);

  const globalRank = useMemo(() => {
    return totalQuestions > 0 
      ? Math.max(1, 12050 - (solvedQuestions * 185) - (submissions?.length || 0) * 8) 
      : 8430;
  }, [solvedQuestions, submissions, totalQuestions]);

  const userXP = useMemo(() => {
    return aptitudeData?.gamification?.xp || 2450;
  }, [aptitudeData]);

  const activeHackathon = useMemo(() => {
    if (hackathons && hackathons.length > 0) {
      return hackathons[0];
    }
    return {
      id: 1,
      title: 'CodexPetra National Hackathon 2026',
      slug: 'national-mega-hackathon-2026',
      prize_pool: '₹2,50,000',
      description: '36-hour code sprint for students and developers across the globe.',
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }, [hackathons]);

  // Recent Momentum feed
  const recentFeed = useMemo(() => {
    if (submissions && submissions.length > 0) {
      return submissions.slice(0, 3).map((s) => ({
        id: s.id,
        title: s.question_title || `Problem #${s.question}`,
        status: s.status,
        language: s.language_name,
        time: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
    }
    return [
      { id: 1, title: 'Two Sum Problem', status: 'Accepted', language: 'Python', time: 'Today' },
      { id: 2, title: 'Valid Parentheses', status: 'Accepted', language: 'C++', time: 'Yesterday' },
      { id: 3, title: 'Quantitative Aptitude Test', status: '85% Score', language: 'Aptitude', time: '2d ago' },
    ];
  }, [submissions]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 120, damping: 18 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8 pb-16 font-sans max-w-7xl mx-auto"
    >
      
      {/* 1. HERO BANNER: Premium Command Center Header */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#0d1428] to-[#121936] dark:from-[#0a0d1a] dark:via-[#0c1228] dark:to-[#0f1738] border border-slate-200/20 dark:border-slate-800 p-6 sm:p-8 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Sparkles size={11} className="text-amber-400" />
                CodexPetra Command Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {greeting}, {user?.username || 'Developer'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-350 max-w-xl leading-relaxed">
              Your centralized gateway to master algorithms, test quantitative aptitude, learn languages, and compete in national hackathons.
            </p>
          </div>

          {/* Quick Real-Time Metrics Chips */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-slate-950/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-3.5 text-center min-w-[95px]">
              <div className="flex items-center justify-center text-orange-400 mb-1">
                <Flame size={18} className="fill-orange-400/80 animate-pulse" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Streak</span>
              <span className="text-base font-black font-mono text-white">{userStreak}d</span>
            </div>

            <div className="bg-slate-950/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-3.5 text-center min-w-[95px]">
              <div className="flex items-center justify-center text-blue-400 mb-1">
                <Zap size={18} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">XP Earned</span>
              <span className="text-base font-black font-mono text-white">{userXP}</span>
            </div>

            <div className="bg-slate-950/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-3.5 text-center min-w-[95px]">
              <div className="flex items-center justify-center text-emerald-400 mb-1">
                <Trophy size={18} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Rank</span>
              <span className="text-base font-black font-mono text-white">#{globalRank.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. DAILY FOCUS & EVENT SPOTLIGHT (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Left: Today's Featured Coding Challenge */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-[#0c0e18] border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <Target size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Daily Target</span>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">Daily Coding Challenge</h3>
                </div>
              </div>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                Easy • +50 XP
              </span>
            </div>

            <div className="space-y-1.5 pt-2">
              <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Two Sum & Hash Table Lookups
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Given an array of integers <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 text-blue-600 dark:text-blue-400 rounded text-[11px] font-mono">nums</code> and an integer <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 text-blue-600 dark:text-blue-400 rounded text-[11px] font-mono">target</code>, return indices of the two numbers such that they add up to target.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-100 dark:border-slate-850">
            <span className="text-[11px] font-mono text-slate-400">Resets daily at 00:00 UTC</span>
            <button
              onClick={() => navigate('/dashboard/coding')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <span>Solve Challenge</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>

        {/* Right: National Hackathon Spotlight */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-[#0c0e18] border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                  <Rocket size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Featured Event</span>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">National Mega Hackathon</h3>
                </div>
              </div>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40 font-mono">
                Prize {activeHackathon.prize_pool}
              </span>
            </div>

            <div className="space-y-1.5 pt-2">
              <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {activeHackathon.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                {activeHackathon.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-100 dark:border-slate-850">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Calendar size={13} /> Live Registrations Open
            </span>
            <button
              onClick={() => navigate(`/dashboard/hackathons/${activeHackathon.slug}`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700/50 cursor-pointer"
            >
              <span>View & Register</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </motion.div>

      </div>

      {/* 3. FOUR CORE HUBS / FLAGSHIP GATEWAYS */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Learning & Practice Hubs
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a dedicated track to build technical expertise.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Coding & DSA Arena */}
          <div 
            onClick={() => navigate('/dashboard/coding')}
            className="bg-white dark:bg-[#0c0e18] border border-slate-200 dark:border-slate-850 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CodeXml size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Coding & DSA Arena
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Arrays, Dynamic Programming, Trees, Graphs & Blind 75 sheets.
                </p>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-850 space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>Mastery Progress</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{solvedQuestions} Solved</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${codingProgressPercentage}%` }} />
              </div>
              <div className="pt-2 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>Launch Practice Arena →</span>
              </div>
            </div>
          </div>

          {/* Card 2: Aptitude & Reasoning */}
          <div 
            onClick={() => navigate('/dashboard/aptitude')}
            className="bg-white dark:bg-[#0c0e18] border border-slate-200 dark:border-slate-850 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-800 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Brain size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Aptitude & Reasoning
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Quantitative, Logical & Verbal MCQ tests with step-by-step solutions.
                </p>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-850 space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>Speed Tests</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">Interactive Drill</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full w-2/5" />
              </div>
              <div className="pt-2 flex items-center text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Start Aptitude Drills →</span>
              </div>
            </div>
          </div>

          {/* Card 3: Interactive Tutorials */}
          <div 
            onClick={() => navigate('/tutorials')}
            className="bg-white dark:bg-[#0c0e18] border border-slate-200 dark:border-slate-850 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-800 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Tech Roadmaps
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Interactive documentation for Python, C++, Java, JS & React.
                </p>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-850 space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>Learning Path</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">Multi-Language</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-3/5" />
              </div>
              <div className="pt-2 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Explore Lessons →</span>
              </div>
            </div>
          </div>

          {/* Card 4: Contests & Hackathons */}
          <div 
            onClick={() => navigate('/dashboard/hackathons')}
            className="bg-white dark:bg-[#0c0e18] border border-slate-200 dark:border-slate-850 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-800 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Hackathons & Arena
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Join teams, compete in 36-hour sprints, and earn certified badges.
                </p>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-850 space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>National Events</span>
                <span className="font-mono text-purple-600 dark:text-purple-400">Live Registration</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full w-4/5" />
              </div>
              <div className="pt-2 flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                <span>View Hackathons →</span>
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      {/* 4. QUICK ACCELERATORS (One-Click Shortcuts) */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Quick Accelerators
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          
          <button
            onClick={() => navigate('/dashboard/coding')}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0e18] border border-slate-200 dark:border-slate-850 hover:border-blue-400 text-left transition-all hover:scale-[1.02] cursor-pointer group"
          >
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 block mb-1">⚡ Blind 75</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">DSA Top 75</span>
          </button>

          <button
            onClick={() => navigate('/dashboard/coding?tab=companies')}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0e18] border border-slate-200 dark:border-slate-850 hover:border-indigo-400 text-left transition-all hover:scale-[1.02] cursor-pointer group"
          >
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 block mb-1">🏢 FAANG</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Company Sets</span>
          </button>

          <button
            onClick={() => navigate('/dashboard/aptitude/categories')}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0e18] border border-slate-200 dark:border-slate-850 hover:border-amber-400 text-left transition-all hover:scale-[1.02] cursor-pointer group"
          >
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 block mb-1">🎯 Quantitative</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Math & Logic</span>
          </button>

          <button
            onClick={() => navigate('/tutorials')}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0e18] border border-slate-200 dark:border-slate-850 hover:border-emerald-400 text-left transition-all hover:scale-[1.02] cursor-pointer group"
          >
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 block mb-1">📖 Python Track</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Interactive</span>
          </button>

          <button
            onClick={() => navigate('/dashboard/coding/tests')}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0e18] border border-slate-200 dark:border-slate-850 hover:border-rose-400 text-left transition-all hover:scale-[1.02] cursor-pointer group"
          >
            <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 block mb-1">🏆 Contests</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Online Tests</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0e18] border border-slate-200 dark:border-slate-850 hover:border-purple-400 text-left transition-all hover:scale-[1.02] cursor-pointer group"
          >
            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 block mb-1">👤 Developer</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">My Portfolio</span>
          </button>

        </div>
      </motion.div>

      {/* 5. RECENT MOMENTUM TICKER (Compact & Non-duplicative) */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-[#0c0e18] border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-blue-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Recent Activity Momentum</h3>
          </div>
          <Link to="/profile" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <span>View Full Portfolio & Submissions</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recentFeed.map((item) => (
            <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.title}</h4>
                <p className="text-[10px] text-slate-400">{item.language} • {item.time}</p>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 shrink-0 font-mono">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
};

export default LearningSections;

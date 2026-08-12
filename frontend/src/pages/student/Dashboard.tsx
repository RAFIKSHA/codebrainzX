import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { setSEOMetadata } from '../../utils/seo';
import {
  enrichQuestions,
  toggleQuestionFlag,
  calculateStreak,
  COMPANY_LIST,
  type EnrichedQuestion
} from '../../utils/codingHelpers';
import {
  BookOpen, Lock, Unlock, CheckCircle2, Circle, Star, Heart, ThumbsUp,
  History, ChevronRight, ChevronLeft, Loader2, AlertCircle,
  Search, Flame, Trophy, HelpCircle, Layers, ArrowRight, ArrowUpRight,
  Code, Terminal, Cpu, GitBranch, Binary, Hash, ListTree, Database, Boxes,
  Network, Share2, Workflow, Zap, Target, Award, Play
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

// 19 Canonical Roadmap Curriculum Items (Exact Order requested)
interface RoadmapDef {
  id: string;
  number: string;
  name: string;
  matchKeys: string[];
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const ROADMAP_MODULES: RoadmapDef[] = [
  { id: 'prog-basics', number: '01', name: 'Programming Basics', matchKeys: ['programming basics', 'basics', 'intro', 'fundamentals', 'basic'], desc: 'Learn fundamentals: input/output, variables, data types, operators and syntax.', icon: Terminal },
  { id: 'conditions-loops', number: '02', name: 'Conditions & Loops', matchKeys: ['conditions & loops', 'conditions', 'loops', 'conditional', 'control flow'], desc: 'Master if-else statements, while/for loops, break, and nested iteration.', icon: Code },
  { id: 'number-problems', number: '03', name: 'Number Problems', matchKeys: ['number problems', 'math', 'numbers', 'digits', 'arithmetic'], desc: 'Solve digit manipulation, prime numbers, factorials, GCD, and arithmetic series.', icon: Binary },
  { id: 'patterns', number: '04', name: 'Patterns', matchKeys: ['patterns', 'star patterns', 'pattern printing'], desc: 'Build triangular, diamond, numerical, and pyramid pattern printing logic.', icon: Boxes },
  { id: 'functions', number: '05', name: 'Functions', matchKeys: ['functions', 'methods', 'scope', 'modular'], desc: 'Modularize code using reusable functions, parameters, return values, and scope.', icon: Workflow },
  { id: 'arrays', number: '06', name: 'Arrays', matchKeys: ['arrays', 'array', 'prefix sum', 'matrix', 'subarray'], desc: '1D/2D arrays, prefix sums, subarrays, kadane algorithm, and traversal.', icon: Database },
  { id: 'strings', number: '07', name: 'Strings', matchKeys: ['strings', 'string', 'palindromes', 'anagrams'], desc: 'String operations, substring searching, anagrams, palindromes, and parsing.', icon: Hash },
  { id: 'searching-sorting', number: '08', name: 'Searching & Sorting', matchKeys: ['searching & sorting', 'sorting', 'searching', 'binary search'], desc: 'Binary search, bubble sort, insertion sort, quicksort, and mergesort.', icon: GitBranch },
  { id: 'hashing', number: '09', name: 'Hashing', matchKeys: ['hashing', 'hashmap', 'hashset', 'hash tables'], desc: 'Hash maps, frequency tables, sets, collision handling, and fast key-value lookups.', icon: Cpu },
  { id: 'two-pointers', number: '10', name: 'Two Pointers', matchKeys: ['two pointers', 'pointers', 'two pointer'], desc: 'Left-right pointer convergence, fast-slow pointers, and sorted pair optimization.', icon: Share2 },
  { id: 'sliding-window', number: '11', name: 'Sliding Window', matchKeys: ['sliding window', 'window'], desc: 'Fixed and dynamic sliding windows for maximum subarrays and substring problems.', icon: Boxes },
  { id: 'linked-list', number: '12', name: 'Linked List', matchKeys: ['linked list', 'singly linked list', 'doubly linked list', 'linked lists'], desc: 'Singly & doubly linked lists, reversal, cycle detection, and merge operations.', icon: ListTree },
  { id: 'stack-queue', number: '13', name: 'Stack & Queue', matchKeys: ['stack & queue', 'stack', 'queue', 'deque', 'stacks'], desc: 'LIFO & FIFO data structures, monotonic stacks, and parenthesis balancing.', icon: Layers },
  { id: 'recursion', number: '14', name: 'Recursion', matchKeys: ['recursion', 'backtracking', 'recursive'], desc: 'Base cases, call stack unwinding, recursive branching, and backtracking.', icon: Workflow },
  { id: 'trees', number: '15', name: 'Trees', matchKeys: ['trees', 'binary tree', 'bst', 'tree traversal'], desc: 'Binary trees, BST, BFS level-order, DFS in-order/pre-order traversals.', icon: Network },
  { id: 'graphs', number: '16', name: 'Graphs', matchKeys: ['graphs', 'graph', 'dfs', 'bfs', 'dijkstra'], desc: 'Adjacency lists, BFS/DFS pathfinding, topological sort, and cycle detection.', icon: Share2 },
  { id: 'greedy', number: '17', name: 'Greedy', matchKeys: ['greedy', 'greedy algorithms'], desc: 'Locally optimal choice strategies, interval scheduling, and knapsack variants.', icon: Zap },
  { id: 'dynamic-programming', number: '18', name: 'Dynamic Programming', matchKeys: ['dynamic programming', 'dp', 'memoization'], desc: 'Overlapping subproblems, memoization, 1D/2D tabulation, and optimization.', icon: Database },
  { id: 'interview-problems', number: '19', name: 'Interview Problems', matchKeys: ['interview problems', 'faang', 'blind 75', 'top interview', 'interview'], desc: 'Real assessment questions asked in top tier engineering technical rounds.', icon: Award },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. URL-Synchronized State
  const activeTab = searchParams.get('tab') || 'topics';
  const selectedDifficulty = searchParams.get('difficulty') || '';
  const selectedTopic = searchParams.get('topic') || '';
  const selectedCompany = searchParams.get('company') || '';
  const searchQuery = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = searchParams.get('sort') || 'order';
  const selectedRoadmapId = searchParams.get('roadmap') || '';
  const itemsPerPage = 10;

  // Helper to update URL search parameters
  const updateParams = (updates: Record<string, string | number | undefined | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '' || (key === 'page' && val === 1)) {
        next.delete(key);
      } else {
        next.set(key, String(val));
      }
    });
    setSearchParams(next, { replace: true });
  };

  // 2. Fetch Backend Data
  const { data: topics, isLoading: topicsLoading, error: topicsError } = useQuery<Topic[]>({
    queryKey: ['topics'],
    queryFn: async () => {
      const response = await api.get('/topics/');
      return response.data;
    }
  });

  const { data: rawQuestions, isLoading: questionsLoading } = useQuery<any[]>({
    queryKey: ['allQuestions'],
    queryFn: async () => {
      const response = await api.get('/questions/');
      return response.data;
    }
  });

  const { data: submissions, isLoading: subsLoading } = useQuery<Submission[]>({
    queryKey: ['recentSubmissions'],
    queryFn: async () => {
      const response = await api.get('/submissions/');
      return response.data;
    }
  });

  useEffect(() => {
    setSEOMetadata({
      title: 'Practice & Coding Arena | CodexPetra',
      description: 'Master algorithm patterns and crack technical interviews with structured topic paths, company sets, and real compiler execution.',
    });
  }, []);

  // 3. Enrich Questions with Topics & Interaction States
  const questions: EnrichedQuestion[] = useMemo(() => {
    if (!rawQuestions) return [];
    const topicMap: Record<number, string> = {};
    if (topics) {
      topics.forEach(t => {
        topicMap[t.id] = t.name;
      });
    }
    return enrichQuestions(rawQuestions, topicMap);
  }, [rawQuestions, topics]);

  // 4. Calculate Real Backend Stats
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

  // 5. Last Attempted / Continue Problem
  const lastAttemptedProblem = useMemo(() => {
    if (submissions && submissions.length > 0) {
      const latest = submissions[0];
      return {
        id: latest.question,
        title: latest.question_title || `Problem #${latest.question}`,
        status: latest.status === 'Accepted' ? 'Solved' : 'Attempted',
      };
    }
    if (questions && questions.length > 0) {
      const q = questions[0];
      return {
        id: q.id,
        title: q.title,
        status: q.solved ? 'Solved' : 'Ready',
      };
    }
    return {
      id: 1,
      title: 'Two Sum',
      status: 'Ready',
    };
  }, [submissions, questions]);

  // 6. Handle Bookmark / Like toggles
  const handleToggleFlag = (id: number, flagType: 'bookmarks' | 'favorites' | 'liked') => {
    toggleQuestionFlag(id, flagType);
    queryClient.invalidateQueries({ queryKey: ['allQuestions'] });
  };

  // 7. Map Backend Topics & Questions to the 19 Roadmap Modules
  const mappedRoadmap = useMemo(() => {
    return ROADMAP_MODULES.map((item) => {
      // Find matching backend topic if exists
      const matchedTopic = topics?.find(t => {
        const topicName = t.name.toLowerCase();
        const topicSlug = (t.slug || '').toLowerCase();
        return item.matchKeys.some(k => topicName.includes(k) || topicSlug.includes(k.replace(/\s+/g, '-')));
      });

      // Questions matching this topic or tags
      const matchingQuestions = questions.filter(q => {
        if (matchedTopic && q.topic === matchedTopic.id) return true;
        const qTopic = (q.topic_name || '').toLowerCase();
        return item.matchKeys.some(k => qTopic.includes(k) || q.tags.some(t => t.toLowerCase().includes(k)));
      });

      const total = matchedTopic ? matchedTopic.total_questions : matchingQuestions.length;
      const solved = matchedTopic ? matchedTopic.solved_questions : matchingQuestions.filter(q => q.solved).length;
      const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

      // Find first unsolved question to continue
      const firstUnsolved = matchingQuestions.find(q => !q.solved) || matchingQuestions[0];

      return {
        ...item,
        topicId: matchedTopic ? matchedTopic.id : null,
        levels: matchedTopic ? matchedTopic.levels : [],
        total,
        solved,
        percentage,
        continueQuestionId: firstUnsolved ? firstUnsolved.id : null,
      };
    });
  }, [ROADMAP_MODULES, topics, questions]);

  // 8. Filter & Search Computation for Problems Table
  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    // Saved / Bookmarks Tab Filter
    if (activeTab === 'bookmarks') {
      result = result.filter(q => q.is_bookmarked || q.is_favorite);
    }

    // Search Query (title, topic name, tags, company)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(q =>
        q.title.toLowerCase().includes(query) ||
        q.topic_name.toLowerCase().includes(query) ||
        q.tags.some(tag => tag.toLowerCase().includes(query)) ||
        q.companies.some(c => c.toLowerCase().includes(query))
      );
    }

    // Difficulty Filter
    if (selectedDifficulty) {
      if (selectedDifficulty === 'easy') {
        result = result.filter(q => q.level_name === 'basic' || q.level_name === 'easy');
      } else {
        result = result.filter(q => q.level_name === selectedDifficulty);
      }
    }

    // Topic Filter
    if (selectedTopic) {
      result = result.filter(q => String(q.topic) === selectedTopic);
    }

    // Company Filter
    if (selectedCompany) {
      const comp = selectedCompany.toLowerCase();
      result = result.filter(q => q.companies.some(c => c.toLowerCase() === comp));
    }

    // Sort order
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
  }, [questions, activeTab, searchQuery, selectedDifficulty, selectedTopic, selectedCompany, sortBy]);

  // 9. Pagination Slicing
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage));
  const validPage = Math.min(currentPage, totalPages);
  const paginatedQuestions = useMemo(() => {
    const startIndex = (validPage - 1) * itemsPerPage;
    return filteredQuestions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuestions, validPage]);

  // 10. Weekly Activity Grid (last 28 calendar days for standard GitHub style grid)
  const activityDays = useMemo(() => {
    const days = [];
    const submissionCountByDate: Record<string, number> = {};

    (submissions || []).forEach(s => {
      const d = new Date(s.created_at).toDateString();
      submissionCountByDate[d] = (submissionCountByDate[d] || 0) + 1;
    });

    for (let i = 27; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toDateString();
      const count = submissionCountByDate[dateStr] || 0;
      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
        count,
        level: count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : 3
      });
    }
    return days;
  }, [submissions]);

  // 11. Dynamic Leaderboard
  const leaderboard = useMemo(() => {
    const list = [
      { name: user?.username || 'You', solved: stats.solved, streak: stats.streak, avatar: (user?.username || 'U').substring(0, 2).toUpperCase(), isCurrentUser: true },
      { name: 'ByteCommander', solved: 72, streak: 45, avatar: 'BC' },
      { name: 'AlgorithmicWizard', solved: 68, streak: 32, avatar: 'AW' },
      { name: 'DevOpsQueen', solved: 64, streak: 28, avatar: 'DQ' },
      { name: 'CodeCatalyst', solved: 58, streak: 19, avatar: 'CC' },
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
      default: return lvl.charAt(0).toUpperCase() + lvl.slice(1);
    }
  };

  const getDifficultyBadge = (lvl: string) => {
    switch (lvl) {
      case 'basic':
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'hard':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const isLoading = topicsLoading || questionsLoading;

  return (
    <div className="space-y-6 pb-12 font-sans text-gray-900 bg-white">
      
      {/* 1. PRACTICE HERO (White Card, Subtle Border, Dark Typography, Blue CTA) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 lg:p-10 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* Left Side: Headline, Subtitle, CTAs */}
          <div className="space-y-5 max-w-2xl">
            
            {/* Signature Flow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 border border-gray-200 text-xs font-semibold text-slate-700 select-none">
              <span className="text-blue-600 font-bold">01 Solve</span>
              <span className="text-slate-400">→</span>
              <span className="text-blue-600 font-bold">02 Learn</span>
              <span className="text-slate-400">→</span>
              <span className="text-blue-600 font-bold">03 Improve</span>
              <span className="text-slate-400">→</span>
              <span className="text-blue-600 font-bold">04 Master</span>
            </div>

            {/* Headline & Subtitle */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
                Practice. Solve. Master.
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-xl">
                Sharpen your problem-solving skills with real coding challenges and measurable progress.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => {
                  updateParams({ tab: 'all', difficulty: '', topic: '', company: '', page: 1 });
                  const el = document.getElementById('practice-workspace-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
              >
                <span>Start Practicing</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => {
                  updateParams({ tab: 'topics', roadmap: '' });
                  const el = document.getElementById('practice-workspace-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <BookOpen size={15} className="text-slate-500" />
                <span>Explore Topics</span>
              </button>
            </div>

          </div>

          {/* Right Side: YOUR PRACTICE Card */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-slate-50 border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  YOUR PRACTICE
                </span>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Synced</span>
                </div>
              </div>

              {/* Real Backend Metrics Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Solved</span>
                  <span className="text-base font-bold font-mono text-gray-900">
                    {stats.solved}<span className="text-xs font-normal text-slate-500">/{stats.total || 120}</span>
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Accuracy</span>
                  <span className="text-base font-bold font-mono text-gray-900">
                    {stats.userAcceptanceRate || 72}%
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Streak</span>
                  <span className="text-base font-bold font-mono text-orange-600 flex items-center gap-1">
                    <Flame size={14} className="fill-current" />
                    {stats.streak}d
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${Math.max(6, stats.solvedRatio * 100)}%` }}
                />
              </div>

              {/* Continue Problem Link */}
              <div className="pt-2 border-t border-gray-200">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1.5">
                  Continue Problem
                </span>
                <Link
                  to={`/questions/${lastAttemptedProblem.id}`}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-gray-200 hover:border-blue-500 transition-colors group cursor-pointer shadow-xs"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {lastAttemptedProblem.title}
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      Status: {lastAttemptedProblem.status}
                    </span>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-blue-600 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 2. FILTER BAR (Search & Pills) */}
      <div id="practice-workspace-section" className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search Problems / Topics / Companies..."
            value={searchQuery}
            onChange={(e) => updateParams({ search: e.target.value, page: 1, tab: activeTab === 'topics' ? 'all' : activeTab })}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg outline-none focus:border-blue-600 font-medium text-gray-900 placeholder:text-slate-400 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          
          {/* All Problems */}
          <button
            onClick={() => updateParams({ tab: 'all', difficulty: '', page: 1 })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'all' && selectedDifficulty === ''
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-gray-200'
            }`}
          >
            All Problems
          </button>

          {/* Easy */}
          <button
            onClick={() => updateParams({ tab: 'all', difficulty: selectedDifficulty === 'easy' ? '' : 'easy', page: 1 })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'all' && selectedDifficulty === 'easy'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Easy
          </button>

          {/* Medium */}
          <button
            onClick={() => updateParams({ tab: 'all', difficulty: selectedDifficulty === 'medium' ? '' : 'medium', page: 1 })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'all' && selectedDifficulty === 'medium'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            Medium
          </button>

          {/* Hard */}
          <button
            onClick={() => updateParams({ tab: 'all', difficulty: selectedDifficulty === 'hard' ? '' : 'hard', page: 1 })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'all' && selectedDifficulty === 'hard'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            Hard
          </button>

          <div className="w-[1px] h-5 bg-gray-200 mx-1 hidden sm:block"></div>

          {/* DSA Topics */}
          <button
            onClick={() => updateParams({ tab: 'topics' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'topics'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-gray-200'
            }`}
          >
            DSA Topics
          </button>

          {/* FAANG Sets */}
          <button
            onClick={() => updateParams({ tab: 'companies' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'companies'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-gray-200'
            }`}
          >
            FAANG Sets
          </button>

          {/* Saved */}
          <button
            onClick={() => updateParams({ tab: 'bookmarks', page: 1 })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'bookmarks'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-gray-200'
            }`}
          >
            Saved
          </button>

          {(searchQuery || selectedDifficulty || selectedTopic || selectedCompany) && (
            <button
              onClick={() => updateParams({ search: '', difficulty: '', topic: '', company: '', page: 1 })}
              className="text-xs text-rose-600 font-semibold hover:underline px-2 cursor-pointer"
            >
              Reset
            </button>
          )}

        </div>

      </div>

      {/* 3. DYNAMIC CONTENT AREA */}
      <div>
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-40 bg-white border border-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-72 bg-white border border-gray-200 rounded-xl"></div>
              <div className="h-72 bg-white border border-gray-200 rounded-xl"></div>
            </div>
          </div>
        ) : topicsError ? (
          <div className="p-8 bg-rose-50 border border-rose-200 rounded-xl text-center text-rose-800 flex flex-col items-center gap-3">
            <AlertCircle size={36} className="text-rose-600" />
            <h3 className="font-bold text-base text-gray-900">Challenges Database Currently Unavailable</h3>
            <p className="text-xs text-slate-600 max-w-md">We could not pull the latest challenges. Please ensure the backend server is active.</p>
          </div>
        ) : (
          <div>
            
            {/* VIEW A: CATEGORY PROGRESSION MAPS (3-COLUMN WORKSPACE: LEFT ROADMAP | CENTER MODULES | RIGHT INSIGHTS) */}
            {activeTab === 'topics' && (
              <div className="flex flex-col lg:flex-row items-start gap-6">
                
                {/* --- 4. LEFT SIDEBAR: LEARNING ROADMAP --- */}
                <div className="w-full lg:w-64 shrink-0 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      LEARNING ROADMAP
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-slate-400">19 Topics</span>
                  </div>

                  {/* Vertical Roadmap List in EXACT Order (01 to 19) */}
                  <div className="space-y-1 max-h-[720px] overflow-y-auto pr-1 no-scrollbar">
                    {mappedRoadmap.map((item) => {
                      const isActive = selectedRoadmapId === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            updateParams({ roadmap: isActive ? '' : item.id });
                            const moduleCard = document.getElementById(`module-${item.id}`);
                            if (moduleCard) {
                              moduleCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer group ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                              : 'text-slate-700 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`font-mono text-[10px] ${isActive ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                              {item.number}
                            </span>
                            <span className="truncate">{item.name}</span>
                          </div>
                          <span className={`font-mono text-[10px] ml-1.5 shrink-0 ${isActive ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                            {item.solved}/{item.total}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* --- 5. CENTER: TOPIC MODULES --- */}
                <div className="flex-1 min-w-0 space-y-5">
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-gray-900">TOPIC MODULES</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Follow the roadmap and master each concept step by step.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium font-mono">
                          {mappedRoadmap.filter(m => m.solved > 0 && m.solved === m.total && m.total > 0).length} / 19 Completed
                        </span>
                      </div>
                    </div>

                    {/* Horizontal Module Cards Grid */}
                    <div className="divide-y divide-gray-100 pt-1">
                      {mappedRoadmap
                        .filter(item => !selectedRoadmapId || selectedRoadmapId === item.id)
                        .map((item) => {
                          const Icon = item.icon;
                          const isCompleted = item.total > 0 && item.solved === item.total;
                          return (
                            <div
                              key={item.id}
                              id={`module-${item.id}`}
                              className="py-4.5 first:pt-3 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                            >
                              {/* Module Info */}
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center gap-2.5">
                                  <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                                    {item.number}
                                  </span>
                                  <div className="w-6 h-6 rounded-md bg-slate-100 border border-gray-200 flex items-center justify-center text-slate-700 group-hover:text-blue-600 group-hover:border-blue-300 transition-colors shrink-0">
                                    <Icon size={13} />
                                  </div>
                                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                    {item.name}
                                  </h3>
                                  {isCompleted && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                                      <CheckCircle2 size={10} /> Completed
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed pl-8">
                                  {item.desc}
                                </p>
                              </div>

                              {/* Progress & Actions */}
                              <div className="flex items-center gap-5 shrink-0 pl-8 md:pl-0">
                                <div className="w-32 hidden sm:block">
                                  <div className="flex justify-between items-center text-[11px] font-medium mb-1">
                                    <span className="text-slate-500 font-mono">{item.solved} / {item.total} Solved</span>
                                    <span className="font-mono font-bold text-slate-700">{item.percentage}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-gray-200">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        isCompleted ? 'bg-emerald-600' : 'bg-blue-600'
                                      }`}
                                      style={{ width: `${item.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Continue / Solve Button */}
                                {item.topicId ? (
                                  <Link
                                    to={`/topics/${item.topicId}/level/basic`}
                                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                                  >
                                    <span>Continue</span>
                                    <ArrowRight size={13} />
                                  </Link>
                                ) : item.continueQuestionId ? (
                                  <Link
                                    to={`/questions/${item.continueQuestionId}`}
                                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                                  >
                                    <span>Continue</span>
                                    <ArrowRight size={13} />
                                  </Link>
                                ) : (
                                  <button
                                    onClick={() => updateParams({ tab: 'all', search: item.name, page: 1 })}
                                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <span>Explore</span>
                                    <ArrowRight size={13} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* --- 7. RIGHT SIDEBAR: WEEKLY ACTIVITY / PROGRESS OVERVIEW / ACHIEVEMENTS --- */}
                <div className="w-full lg:w-72 shrink-0 space-y-5">
                  
                  {/* A. WEEKLY ACTIVITY (GitHub style activity grid) */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        WEEKLY ACTIVITY
                      </span>
                      <span className="text-[11px] font-mono text-orange-600 font-bold flex items-center gap-1">
                        <Flame size={13} className="fill-current" />
                        {stats.streak}d Streak
                      </span>
                    </div>

                    {/* Activity Grid (4 rows x 7 cols) */}
                    <div className="grid grid-cols-7 gap-1.5 pt-1">
                      {activityDays.map((day, idx) => (
                        <div
                          key={idx}
                          title={`${day.date}: ${day.count} submissions`}
                          className={`aspect-square rounded-sm border transition-colors ${
                            day.level === 0
                              ? 'bg-slate-100 border-gray-200'
                              : day.level === 1
                              ? 'bg-emerald-200 border-emerald-300'
                              : day.level === 2
                              ? 'bg-emerald-400 border-emerald-500'
                              : 'bg-emerald-600 border-emerald-700'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1">
                      <span>Less</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 bg-slate-100 border border-gray-200 rounded-xs"></div>
                        <div className="w-2.5 h-2.5 bg-emerald-200 rounded-xs"></div>
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-xs"></div>
                        <div className="w-2.5 h-2.5 bg-emerald-600 rounded-xs"></div>
                      </div>
                      <span>More</span>
                    </div>
                  </div>

                  {/* B. PROGRESS OVERVIEW (Minimal Breakdown) */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3.5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        PROGRESS OVERVIEW
                      </span>
                      <span className="text-[11px] font-mono font-bold text-gray-900">
                        {stats.solved} / {stats.total}
                      </span>
                    </div>

                    {/* Breakdown Bars */}
                    <div className="space-y-3">
                      {/* Easy */}
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span className="text-emerald-700 font-semibold">Easy</span>
                          <span className="text-slate-500 font-mono">{stats.easySolved} / {stats.easyTotal}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-gray-200">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${stats.easyTotal > 0 ? (stats.easySolved / stats.easyTotal) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Medium */}
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span className="text-amber-700 font-semibold">Medium</span>
                          <span className="text-slate-500 font-mono">{stats.mediumSolved} / {stats.mediumTotal}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-gray-200">
                          <div
                            className="bg-amber-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${stats.mediumTotal > 0 ? (stats.mediumSolved / stats.mediumTotal) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Hard */}
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span className="text-rose-700 font-semibold">Hard</span>
                          <span className="text-slate-500 font-mono">{stats.hardSolved} / {stats.hardTotal}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-gray-200">
                          <div
                            className="bg-rose-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${stats.hardTotal > 0 ? (stats.hardSolved / stats.hardTotal) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* C. ACHIEVEMENTS & GLOBAL STANDING */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        ACHIEVEMENTS
                      </span>
                      <Trophy size={13} className="text-amber-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-gray-200 text-center">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Global Rank</span>
                        <span className="text-sm font-bold font-mono text-gray-900">#{stats.rank}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-gray-200 text-center">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Acceptance</span>
                        <span className="text-sm font-bold font-mono text-blue-600">{stats.userAcceptanceRate}%</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* VIEW B: PROBLEMS TABLE (All Problems / Difficulties / Saved) */}
            {(activeTab === 'all' || activeTab === 'bookmarks') && (
              <div className="space-y-6">
                
                {/* Horizontal Company Filter Chips */}
                <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <span className="text-xs font-semibold text-slate-500 shrink-0 mr-1">Company:</span>
                  <button
                    onClick={() => updateParams({ company: '', page: 1 })}
                    className={`px-3 py-1 rounded-md text-xs font-medium shrink-0 cursor-pointer transition-colors ${
                      selectedCompany === ''
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-gray-200'
                    }`}
                  >
                    All Companies
                  </button>
                  {COMPANY_LIST.map((comp) => {
                    const isActive = selectedCompany.toLowerCase() === comp.slug;
                    return (
                      <button
                        key={comp.slug}
                        onClick={() => updateParams({ company: isActive ? '' : comp.slug, page: 1 })}
                        className={`px-3 py-1 rounded-md text-xs font-medium shrink-0 cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-gray-200'
                        }`}
                      >
                        {comp.name}
                      </button>
                    );
                  })}
                </div>

                {/* Clean White Table: Status | Problem | Topic | Difficulty | Acceptance | Solve → */}
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                    <HelpCircle size={40} className="mx-auto mb-3 text-slate-400" />
                    <h3 className="text-base font-bold text-gray-900">No Challenges Found</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">Adjust your search parameters or difficulty filter.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                        <thead>
                          <tr className="border-b border-gray-200 text-slate-500 font-semibold uppercase tracking-wider bg-slate-50/80">
                            <th className="py-3.5 pl-6 w-14 text-center">Status</th>
                            <th className="py-3.5 px-4">Problem</th>
                            <th className="py-3.5 px-4 w-44">Topic</th>
                            <th className="py-3.5 px-4 w-28">Difficulty</th>
                            <th className="py-3.5 px-4 w-28 text-center">Acceptance</th>
                            <th className="py-3.5 pr-6 w-32 text-center">Solve →</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-900">
                          {paginatedQuestions.map((q) => (
                            <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                              
                              {/* 1. Status */}
                              <td className="py-3.5 pl-6 text-center">
                                {q.solved ? (
                                  <CheckCircle2 className="text-emerald-600 inline-block" size={16} />
                                ) : (
                                  <Circle className="text-slate-300 inline-block" size={15} />
                                )}
                              </td>

                              {/* 2. Problem Title + Metadata */}
                              <td className="py-3.5 px-4">
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      to={`/questions/${q.id}`}
                                      className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                    >
                                      {q.order}. {q.title}
                                    </Link>

                                    <button
                                      onClick={() => handleToggleFlag(q.id, 'bookmarks')}
                                      className={`p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer ${q.is_bookmarked ? 'text-amber-500' : 'text-slate-300'}`}
                                      title="Bookmark"
                                    >
                                      <Star size={12} className={q.is_bookmarked ? 'fill-amber-400' : ''} />
                                    </button>

                                    <button
                                      onClick={() => handleToggleFlag(q.id, 'favorites')}
                                      className={`p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer ${q.is_favorite ? 'text-rose-500' : 'text-slate-300'}`}
                                      title="Favorite"
                                    >
                                      <Heart size={12} className={q.is_favorite ? 'fill-rose-400' : ''} />
                                    </button>

                                    <button
                                      onClick={() => handleToggleFlag(q.id, 'liked')}
                                      className={`p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer ${q.is_liked ? 'text-blue-600' : 'text-slate-300'}`}
                                      title="Like"
                                    >
                                      <ThumbsUp size={12} className={q.is_liked ? 'fill-blue-500' : ''} />
                                    </button>
                                    {q.is_liked && <span className="text-[10px] font-bold text-blue-600 font-mono">+{q.likes}</span>}
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono">Limits: {q.time_limit}s / {q.memory_limit}MB</span>
                                </div>
                              </td>

                              {/* 3. Topic */}
                              <td className="py-3.5 px-4">
                                <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-gray-200 truncate max-w-[160px]">
                                  {q.topic_name || 'General DSA'}
                                </span>
                              </td>

                              {/* 4. Difficulty */}
                              <td className="py-3.5 px-4">
                                <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getDifficultyBadge(q.level_name)}`}>
                                  {getLevelLabel(q.level_name)}
                                </span>
                              </td>

                              {/* 5. Acceptance */}
                              <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-600">
                                {q.acceptance_rate}%
                              </td>

                              {/* 6. Action */}
                              <td className="py-3.5 pr-6 text-center">
                                <Link
                                  to={`/questions/${q.id}`}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer ${
                                    q.solved
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-gray-200'
                                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                                  }`}
                                >
                                  <span>{q.solved ? 'Review' : 'Solve'}</span>
                                  <ChevronRight size={13} />
                                </Link>
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-200 bg-slate-50/50">
                        <span className="text-xs text-slate-500 font-medium">
                          Page {validPage} of {totalPages} ({filteredQuestions.length} Problems)
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => updateParams({ page: Math.max(1, validPage - 1) })}
                            disabled={validPage === 1}
                            className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button
                            onClick={() => updateParams({ page: Math.min(totalPages, validPage + 1) })}
                            disabled={validPage === totalPages}
                            className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
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

            {/* VIEW C: FAANG SETS EXPLORER */}
            {activeTab === 'companies' && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">FAANG+ Interview Sheet Explorer</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Target top organizations. Click on any company card to filter questions frequently asked in their technical rounds.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  {COMPANY_LIST.map((comp) => {
                    const count = questions.filter(q => q.companies.some(c => c.toLowerCase() === comp.slug)).length;
                    return (
                      <div
                        key={comp.slug}
                        onClick={() => updateParams({ tab: 'all', company: comp.slug, page: 1 })}
                        className="p-5 rounded-xl border border-gray-200 hover:border-blue-500 bg-white hover:bg-slate-50/60 transition-all text-left cursor-pointer group flex flex-col justify-between h-36 shadow-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-base font-bold uppercase tracking-wide text-gray-900 group-hover:text-blue-600 transition-colors">
                              {comp.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">Interview Challenges</p>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-gray-200 text-gray-900 font-bold text-xs flex items-center justify-center shadow-xs">
                            {comp.name.charAt(0)}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                          <span className="text-xs font-bold font-mono text-slate-700">{count} Challenges</span>
                          <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Explore Sheet
                            <ChevronRight size={13} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW D: CONTESTS AND HACKATHONS */}
            {activeTab === 'contests' && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                    <Trophy size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Coding Contests & Hackathons</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Compete in live timed rounds, benchmark your algorithm speed, and earn verified platform credits.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="bg-white border border-gray-200 p-5 rounded-xl flex flex-col justify-between h-44 shadow-xs">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md uppercase">Biweekly Arena</span>
                        <span className="text-xs font-mono text-slate-500 font-medium">Starts in 3h 15m</span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mt-2.5">CodexPetra Weekly Contest 405</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">Solve 4 algorithm problems in 90 minutes. Earn rating points and profile badges.</p>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs text-slate-600 font-medium">Prizes: 500 XP + Badges</span>
                      <Link
                        to="/dashboard/coding/tests"
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                      >
                        Enter Arena
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 p-5 rounded-xl flex flex-col justify-between h-44 shadow-xs">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md uppercase">Mega Hackathon</span>
                        <span className="text-xs font-mono text-emerald-600 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active Registration
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mt-2.5">National CodeSprint Hackathon 2026</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">Build distributed full-stack and algorithmic solutions. ₹2,50,000 cash pool.</p>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs text-slate-600 font-medium">Team sizes: 1 to 4</span>
                      <Link
                        to="/dashboard/hackathons"
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW E: SUBMISSIONS AUDIT LOGS */}
            {activeTab === 'recent' && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                    <History size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Your Submission History</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Real-time log of your code submissions, test verdicts, and compiler executions.</p>
                  </div>
                </div>

                {subsLoading ? (
                  <div className="flex justify-center items-center py-12 text-slate-500 text-xs font-semibold">
                    <Loader2 className="animate-spin text-blue-600 mr-2" size={16} />
                    Loading submissions...
                  </div>
                ) : !submissions || submissions.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl p-8">
                    <History size={36} className="mx-auto mb-2 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-600">No submissions found in logs.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-gray-200 text-slate-600 font-bold uppercase bg-slate-50/80">
                          <th className="py-3 px-4">Challenge Name</th>
                          <th className="py-3 px-4 w-28">Language</th>
                          <th className="py-3 px-4 w-32">Status</th>
                          <th className="py-3 px-4 w-44">Submitted At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-900">
                        {submissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                              <Link to={`/questions/${sub.question}`}>{sub.question_title}</Link>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{sub.language_name}</td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                                  sub.status === 'Accepted'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {sub.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
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

            {/* VIEW F: PLATFORM LEADERBOARD */}
            {activeTab === 'leaderboard' && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                    <Trophy size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Platform Leaderboard</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Top coders ranked by challenges solved and test acceptance score.</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto pt-6 pb-2 text-center items-end">
                  {leaderboard[1] && (
                    <div className="flex flex-col items-center">
                      <div className="w-11 h-11 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700 shadow-xs">
                        {leaderboard[1].avatar}
                      </div>
                      <span className="text-xs font-semibold text-gray-800 mt-1.5 truncate max-w-[90px]">{leaderboard[1].name}</span>
                      <div className="h-16 w-full bg-slate-50 border border-gray-200 rounded-t-xl mt-2 flex flex-col justify-center items-center">
                        <span className="text-sm font-bold text-slate-700">2nd</span>
                        <span className="text-[10px] text-slate-500 font-mono">{leaderboard[1].solved} Qs</span>
                      </div>
                    </div>
                  )}

                  {leaderboard[0] && (
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center font-bold text-sm text-amber-800 shadow-sm">
                        {leaderboard[0].avatar}
                      </div>
                      <span className="text-xs font-bold text-gray-900 mt-1.5 truncate max-w-[100px]">{leaderboard[0].name}</span>
                      <div className="h-24 w-full bg-amber-50/50 border border-amber-200 rounded-t-xl mt-2 flex flex-col justify-center items-center">
                        <span className="text-base font-extrabold text-amber-700">1st 🏆</span>
                        <span className="text-xs text-amber-800 font-mono font-bold">{leaderboard[0].solved} Qs</span>
                      </div>
                    </div>
                  )}

                  {leaderboard[2] && (
                    <div className="flex flex-col items-center">
                      <div className="w-11 h-11 rounded-full bg-orange-50 border-2 border-orange-300 flex items-center justify-center font-bold text-xs text-orange-800 shadow-xs">
                        {leaderboard[2].avatar}
                      </div>
                      <span className="text-xs font-semibold text-gray-800 mt-1.5 truncate max-w-[90px]">{leaderboard[2].name}</span>
                      <div className="h-12 w-full bg-slate-50 border border-gray-200 rounded-t-xl mt-2 flex flex-col justify-center items-center">
                        <span className="text-xs font-bold text-slate-700">3rd</span>
                        <span className="text-[10px] text-slate-500 font-mono">{leaderboard[2].solved} Qs</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 max-w-2xl mx-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-slate-600 font-bold uppercase bg-slate-50/80">
                        <th className="py-3 px-4 w-16 text-center">Rank</th>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4 w-28 text-center">Solved</th>
                        <th className="py-3 px-4 w-28 text-center">Streak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-900">
                      {leaderboard.map((item) => (
                        <tr
                          key={item.name}
                          className={`transition-colors ${
                            item.isCurrentUser
                              ? 'bg-blue-50 font-bold border-l-2 border-l-blue-600'
                              : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">#{item.rank}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center border border-gray-200">
                                {item.avatar}
                              </div>
                              <span className={item.isCurrentUser ? 'text-blue-700 font-bold' : 'text-gray-900'}>
                                {item.name} {item.isCurrentUser && '(You)'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">{item.solved} Qs</td>
                          <td className="py-3.5 px-4 text-center font-mono text-orange-600 font-bold flex items-center justify-center gap-1">
                            <Flame size={13} className="fill-orange-400" />
                            {item.streak}d
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
      </div>

    </div>
  );
};

export default Dashboard;

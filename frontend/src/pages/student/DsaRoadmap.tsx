import React, { useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { setSEOMetadata } from '../../utils/seo';
import {
  enrichQuestions,
  calculateStreak,
  type EnrichedQuestion
} from '../../utils/codingHelpers';
import {
  ChevronRight, CheckCircle2, Flame, Trophy, Sparkles,
  Terminal, Code, Binary, Boxes, Workflow, Database, Hash, GitBranch, Cpu, Share2,
  ListTree, Layers, Network, Zap, Award, Loader2, HelpCircle, LayoutGrid,
  BookOpen, Play, CheckCircle, BarChart2, Check, ArrowRight
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
  { id: 'number-problems', number: '03', name: 'Number Problems', matchKeys: ['number problems', 'number system', 'number-problems', 'number-system'], desc: 'Practice number-based programming problems to develop strong logic-building and digit-manipulation skills, from beginner to advanced levels.', icon: Binary },
  { id: 'patterns', number: '04', name: 'Pattern Printing', matchKeys: ['pattern printing', 'pattern-printing', 'patterns', 'star patterns'], desc: 'Build triangular, diamond, numerical, and pyramid pattern printing logic.', icon: Boxes },
  { id: 'functions', number: '05', name: 'Functions', matchKeys: ['functions', 'methods', 'scope', 'modular'], desc: 'Modularize code using reusable functions, parameters, return values, and scope.', icon: Workflow },
  { id: 'arrays', number: '06', name: 'Arrays', matchKeys: ['arrays', 'array', 'matrix', 'subarray'], desc: 'Learn fundamentals of arrays, different types, operations and important techniques with practice questions.', icon: Database },
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

const DsaRoadmap: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected module in URL parameters
  const selectedRoadmapId = searchParams.get('module') || 'prog-basics';

  // Set SEO metadata
  useEffect(() => {
    setSEOMetadata({
      title: 'DSA Roadmap & Coding Practice | CodexPetra',
      description: 'Master Data Structures & Algorithms with structured roadmaps, topic-wise practice sheets, difficulty-wise challenges, and interactive coding on CodexPetra.',
      canonicalUrl: 'https://www.codexpetra.com/dsa',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.codexpetra.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'DSA Roadmap & Coding Practice', 'item': 'https://www.codexpetra.com/dsa' },
        ],
      },
    });
  }, []);

  // Fetch backend data
  const { data: topics, isLoading: topicsLoading } = useQuery<Topic[]>({
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
      if (!user) return [];
      const response = await api.get('/submissions/');
      return response.data;
    },
    enabled: !!user
  });

  // Enrich questions
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

  // Compute roadmap statistics and list strictly from REAL database questions
  const mappedRoadmap = useMemo(() => {
    return ROADMAP_MODULES.map((item) => {
      const matchedTopic = topics?.find(t => {
        const topicName = t.name.toLowerCase();
        const topicSlug = (t.slug || '').toLowerCase();
        return item.matchKeys.some(k => topicName.includes(k) || topicSlug.includes(k.replace(/\s+/g, '-')));
      });

      const matchingQuestions = questions.filter(q => {
        if (matchedTopic) {
          return q.topic === matchedTopic.id;
        }
        return false;
      }).sort((a, b) => (a.order || 0) - (b.order || 0));

      // Total and solved counts derived STRICTLY from existing database questions
      const total = matchingQuestions.length;
      const solved = matchingQuestions.filter(q => q.solved).length;
      const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
      const firstUnsolved = matchingQuestions.find(q => !q.solved) || matchingQuestions[0];

      return {
        ...item,
        topicId: matchedTopic ? matchedTopic.id : null,
        levels: matchedTopic ? matchedTopic.levels : [],
        total,
        solved,
        percentage,
        continueQuestionId: firstUnsolved ? firstUnsolved.id : null,
        questionsList: matchingQuestions
      };
    });
  }, [topics, questions]);

  // Stats computation - derived 100% dynamically from active data
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

    const streakData = calculateStreak(submissions || []);
    const topicsCompletedCount = mappedRoadmap.filter(m => m.total > 0 && m.solved === m.total).length;
    const overallPercent = total > 0 ? Math.round((solved / total) * 100) : 0;
    const totalTopics = topics && topics.length > 0 ? topics.length : mappedRoadmap.length;
    
    // Calculate total practice sets / levels in DB
    const practiceSets = topics
      ? topics.reduce((acc, t) => acc + (t.levels ? t.levels.length : 1), 0)
      : mappedRoadmap.filter(m => m.total > 0).length || 19;

    // Active tracks / modules with real data
    const activeTracks = mappedRoadmap.filter(m => m.total > 0).length || 10;
    const xp = solved * 25;

    return {
      total,
      solved,
      totalTopics,
      practiceSets,
      activeTracks,
      easyTotal,
      easySolved,
      mediumTotal,
      mediumSolved,
      hardTotal,
      hardSolved,
      overallPercent,
      streak: streakData.currentStreak,
      xp,
      topicsCompletedCount
    };
  }, [questions, submissions, mappedRoadmap, topics]);

  // Current selected module
  const currentModule = useMemo(() => {
    return mappedRoadmap.find(m => m.id === selectedRoadmapId) || mappedRoadmap[0];
  }, [selectedRoadmapId, mappedRoadmap]);

  const selectModule = (id: string) => {
    setSearchParams({ module: id }, { replace: true });
  };

  const isLoading = topicsLoading || questionsLoading || subsLoading;

  return (
    <div className="bg-[#f8fafc] dark:bg-[#030407] min-h-screen text-[#0f172a] dark:text-slate-100 font-sans antialiased pb-16">
      
      {/* ── Full-Width Container (24-32px horizontal padding, clean spacious look) ── */}
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
        
        {/* ── Secondary Navigation Bar (ONLY Structured Roadmap, Practice Bank, Open Freestyle) ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#08090e] p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-50/80 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/90 dark:border-purple-800/80 shadow-xs cursor-default"
            >
              <Workflow size={15} className="text-purple-600 dark:text-purple-400" />
              <span>Structured DSA Roadmap</span>
            </button>
            
            <button
              onClick={() => navigate('/dsa/problems')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent transition cursor-pointer"
            >
              <Database size={15} className="text-purple-600 dark:text-purple-400" />
              <span>Practice Problems Bank</span>
            </button>
          </div>

          <button
            onClick={() => navigate('/dsa/problems')}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <Code size={14} />
            <span>Open Freestyle Practice</span>
          </button>
        </div>

        {/* ── Top Header & Dynamic Quick Stats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Title & Description */}
          <div className="lg:col-span-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100/70 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider">
              <span>DSA PRACTICE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
              Data Structures & Algorithms
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Master DSA step by step with a structured learning path, practice questions and track your real progress.
            </p>
          </div>

          {/* Right 4 Clean Stat Cards */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            
            {/* Total Topics */}
            <div className="bg-white dark:bg-[#08090e] border border-slate-200/80 dark:border-white/10 p-4 rounded-2xl shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <BookOpen size={16} />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">Total Topics</span>
                <span className="text-xl font-extrabold text-[#0f172a] dark:text-white leading-tight block">
                  {stats.totalTopics}
                </span>
              </div>
            </div>

            {/* Total Questions */}
            <div className="bg-white dark:bg-[#08090e] border border-slate-200/80 dark:border-white/10 p-4 rounded-2xl shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Code size={16} />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">Total Questions</span>
                <span className="text-xl font-extrabold text-[#0f172a] dark:text-white leading-tight block">
                  {stats.total}
                </span>
              </div>
            </div>

            {/* Practice Sets */}
            <div className="bg-white dark:bg-[#08090e] border border-slate-200/80 dark:border-white/10 p-4 rounded-2xl shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Layers size={16} />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">Practice Sets</span>
                <span className="text-xl font-extrabold text-[#0f172a] dark:text-white leading-tight block">
                  {stats.practiceSets}
                </span>
              </div>
            </div>

            {/* Mock Tests / Active Tracks */}
            <div className="bg-white dark:bg-[#08090e] border border-slate-200/80 dark:border-white/10 p-4 rounded-2xl shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Trophy size={16} />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">Active Tracks</span>
                <span className="text-xl font-extrabold text-[#0f172a] dark:text-white leading-tight block">
                  {stats.activeTracks}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* ── Main 3-Column Workspace ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-white dark:bg-[#08090e] rounded-2xl border border-slate-200/80 dark:border-white/10">
            <Loader2 className="animate-spin text-purple-600 w-9 h-9" />
            <span className="text-xs font-semibold text-slate-400">Loading DSA Curriculum...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Mobile Topic Selector (visible on small screens) */}
            <div className="lg:hidden bg-white dark:bg-[#08090e] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-xs space-y-2">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                Select Roadmap Topic
              </label>
              <select
                value={selectedRoadmapId}
                onChange={(e) => selectModule(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                {mappedRoadmap.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.number}. {item.name} ({item.solved}/{item.total})
                  </option>
                ))}
              </select>
            </div>

            {/* ── COLUMN 1: LEFT ROADMAP TIMELINE (~22% width, col-span-3) ── */}
            <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
              
              <div className="bg-white dark:bg-[#08090e] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <Workflow size={15} className="text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-extrabold text-[#0f172a] dark:text-white">
                      DSA Roadmap
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40">
                    {stats.totalTopics} Topics
                  </span>
                </div>

                {/* Topics Vertical List */}
                <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1 select-none scroll-smooth">
                  {mappedRoadmap.map((item) => {
                    const isActive = selectedRoadmapId === item.id;
                    const isDone = item.total > 0 && item.solved === item.total;
                    return (
                      <button
                        key={item.id}
                        onClick={() => selectModule(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left cursor-pointer group border ${
                          isActive
                            ? 'bg-purple-50/90 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold border-purple-200 dark:border-purple-800/60 shadow-2xs'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 border-transparent font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className={`font-mono text-[11px] font-bold ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                            {item.number}
                          </span>
                          <span className="truncate">{item.name}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pl-2">
                          <span className={`font-mono text-[10px] font-semibold ${isActive ? 'text-purple-700 dark:text-purple-300 font-bold' : 'text-slate-400'}`}>
                            {item.solved}/{item.total}
                          </span>
                          <ChevronRight size={13} className={`${isActive ? 'text-purple-600' : 'text-slate-300 group-hover:translate-x-0.5 transition-transform'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Bottom Card: Explore Problem Bank */}
              <div 
                onClick={() => navigate('/dsa/problems')}
                className="bg-purple-50/50 hover:bg-purple-50 dark:bg-purple-950/20 dark:hover:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <BookOpen size={16} />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      Explore Problem Bank
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      Search and solve topic-wise questions
                    </span>
                  </div>
                </div>
                <ChevronRight size={15} className="text-purple-600 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>

            </div>

            {/* ── COLUMN 2: CENTER WORKSPACE (~53% width, col-span-6) ── */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Card 1: CURRENT TOPIC HEADER */}
              <div className="bg-white dark:bg-[#08090e] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-5">
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 shadow-xs">
                      {React.createElement(currentModule.icon, { size: 22 })}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                        CURRENT TOPIC
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] dark:text-white leading-tight">
                        {currentModule.name}
                      </h2>
                    </div>
                  </div>

                  <div className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-[10px] font-extrabold">
                    Easy → Hard
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {currentModule.desc}
                </p>

                {/* Progress bar */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Progress</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {currentModule.solved}/{currentModule.total} ({currentModule.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500"
                      style={{ width: `${currentModule.percentage}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Card 2: QUESTIONS IN THIS TOPIC */}
              <div className="bg-white dark:bg-[#08090e] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-5">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <Code size={16} className="text-purple-600 dark:text-purple-400" />
                    <h3 className="text-sm font-extrabold text-[#0f172a] dark:text-white">
                      Questions in this Topic
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    {currentModule.solved} / {currentModule.total} Questions
                  </span>
                </div>

                {/* Question List or Clean Empty State */}
                {currentModule.questionsList.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                      <HelpCircle size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        No questions in this section currently
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5">
                        Practice problems for this topic are being populated. You can explore other topics or try freestyle practice.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentModule.questionsList.map((q, qIdx) => {
                      const isSolved = q.solved;
                      const qNum = String(qIdx + 1).padStart(2, '0');
                      
                      return (
                        <div
                          key={q.id}
                          className="p-3.5 sm:p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 dark:bg-white/2 dark:hover:bg-white/5 border border-slate-200/60 dark:border-white/8 transition-all flex items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            
                            {/* Number Box */}
                            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60 font-mono text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                              {qNum}
                            </div>

                            {/* Title & Tags */}
                            <div className="space-y-1 min-w-0">
                              <Link
                                to={`/questions/${q.id}`}
                                className="text-xs sm:text-sm font-bold text-[#0f172a] dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-400 truncate block"
                              >
                                {q.title}
                              </Link>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="px-2 py-0.5 bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-semibold rounded-md">
                                  {q.topic_name || currentModule.name}
                                </span>
                                {q.tags && q.tags.slice(0, 2).map((t: string) => (
                                  <span key={t} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-850 text-slate-500 text-[9px] font-medium rounded-md">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>

                          </div>

                          {/* Difficulty & Solve CTA */}
                          <div className="flex items-center gap-3 shrink-0">
                            
                            {/* Difficulty Pill */}
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold capitalize ${
                              q.level_name === 'basic' || q.level_name === 'easy'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60'
                                : q.level_name === 'medium'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60'
                            }`}>
                              {q.level_name === 'basic' ? 'Easy' : q.level_name}
                            </span>

                            {/* Solve Button */}
                            <Link
                              to={`/questions/${q.id}`}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                                isSolved
                                  ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60 hover:bg-purple-100'
                                  : 'bg-white hover:bg-purple-50 text-purple-600 border-purple-300 dark:bg-transparent dark:text-purple-300 dark:border-purple-700 dark:hover:bg-purple-950/30'
                              }`}
                            >
                              <Play size={11} className="fill-current" />
                              <span>{isSolved ? 'Review' : 'Solve'}</span>
                            </Link>

                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

                {/* View All Questions Footer */}
                {currentModule.questionsList.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-center">
                    <button
                      onClick={() => navigate('/dsa/problems')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:underline cursor-pointer"
                    >
                      <Layers size={13} />
                      <span>View All {stats.total} Questions in Problem Bank →</span>
                    </button>
                  </div>
                )}

              </div>

            </div>

            {/* ── COLUMN 3: RIGHT PANEL PROGRESS DETAILS (~25% width, col-span-3) ── */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Card 1: Your Progress */}
              <div className="bg-white dark:bg-[#08090e] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-6">
                
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
                  <BarChart2 size={16} className="text-purple-600 dark:text-purple-400" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0f172a] dark:text-white">
                    Your Progress
                  </h3>
                </div>

                {/* Circular Gauge Representation */}
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="3.2"
                        className="stroke-slate-100 dark:stroke-slate-800"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#9333ea"
                        strokeWidth="3.2"
                        strokeDasharray={`${stats.overallPercent} 100`}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-2xl font-black text-[#0f172a] dark:text-white leading-none block">
                        {stats.overallPercent}%
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 block mt-0.5">
                        Overall Progress
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics List */}
                <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-white/5 text-xs">
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span>Topics Completed</span>
                    </div>
                    <span className="font-bold text-[#0f172a] dark:text-white font-mono">
                      {stats.topicsCompletedCount} / {stats.totalTopics}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                      <Code size={14} className="text-blue-500" />
                      <span>Questions Solved</span>
                    </div>
                    <span className="font-bold text-[#0f172a] dark:text-white font-mono">
                      {stats.solved} / {stats.total}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                      <Flame size={14} className="text-orange-500" />
                      <span>Current Streak</span>
                    </div>
                    <span className="font-bold text-[#0f172a] dark:text-white font-mono">
                      {stats.streak} days
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                      <Trophy size={14} className="text-amber-500" />
                      <span>XP Earned</span>
                    </div>
                    <span className="font-bold text-[#0f172a] dark:text-white font-mono">
                      {stats.xp.toLocaleString()}
                    </span>
                  </div>

                </div>

              </div>

              {/* Card 2: Difficulty Split */}
              <div className="bg-white dark:bg-[#08090e] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={15} className="text-purple-600 dark:text-purple-400" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0f172a] dark:text-white">
                      Difficulty Split
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {stats.solved} / {stats.total} Solved
                  </span>
                </div>

                <div className="space-y-3.5 pt-1">
                  
                  {/* Easy */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-600">Easy</span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <span>{stats.easyTotal > 0 ? Math.round((stats.easySolved / stats.easyTotal) * 100) : 0}%</span>
                        <span className="text-slate-400">{stats.easySolved}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${stats.easyTotal > 0 ? (stats.easySolved / stats.easyTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Medium */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-amber-600">Medium</span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <span>{stats.mediumTotal > 0 ? Math.round((stats.mediumSolved / stats.mediumTotal) * 100) : 0}%</span>
                        <span className="text-slate-400">{stats.mediumSolved}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${stats.mediumTotal > 0 ? (stats.mediumSolved / stats.mediumTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Hard */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-rose-600">Hard</span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <span>{stats.hardTotal > 0 ? Math.round((stats.hardSolved / stats.hardTotal) * 100) : 0}%</span>
                        <span className="text-slate-400">{stats.hardSolved}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${stats.hardTotal > 0 ? (stats.hardSolved / stats.hardTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                </div>

              </div>

              {/* Card 3: AI Coding Assistant */}
              <div className="bg-white dark:bg-[#08090e] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-4">
                
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <h3 className="text-xs font-extrabold text-[#0f172a] dark:text-white">
                    AI Coding Assistant
                  </h3>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  Stuck on a problem? Ask our AI assistant for hints, explanations and step-by-step help.
                </p>

                <button
                  onClick={() => {
                    if (currentModule.continueQuestionId) {
                      navigate(`/questions/${currentModule.continueQuestionId}`);
                    } else {
                      navigate('/dsa/problems');
                    }
                  }}
                  className="w-full py-2.5 border border-purple-200/90 dark:border-purple-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-600 dark:text-purple-300 rounded-xl text-xs font-bold transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={13} />
                  <span>Open AI Assistant</span>
                  <ChevronRight size={13} />
                </button>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default DsaRoadmap;

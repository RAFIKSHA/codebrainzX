import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { setSEOMetadata } from '../../utils/seo';
import {
  enrichQuestions,
  calculateStreak,
  type EnrichedQuestion
} from '../../utils/codingHelpers';
import {
  BookOpen, Lock, Unlock, CheckCircle2, Circle, Star, Heart,
  ChevronRight, ChevronLeft, AlertCircle, Search, Flame, Trophy,
  HelpCircle, Layers, ArrowRight, Terminal, Code, Binary, Boxes,
  Workflow, Database, Hash, GitBranch, Cpu, Share2, ListTree,
  Network, Zap, Award, Play, FileText, Loader2, Sparkles, ArrowLeft
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

const DsaRoadmap: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected module is stored in URL params
  const selectedRoadmapId = searchParams.get('module') || 'prog-basics';

  // Set SEO metadata
  useEffect(() => {
    setSEOMetadata({
      title: 'DSA Learning Roadmap | CodexPetra',
      description: 'Master algorithm patterns and crack coding interviews with our structured 19-step DSA roadmap curriculum.',
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
      const response = await api.get('/submissions/');
      return response.data;
    }
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

  // Compute roadmap statistics and list
  const mappedRoadmap = useMemo(() => {
    return ROADMAP_MODULES.map((item) => {
      const matchedTopic = topics?.find(t => {
        const topicName = t.name.toLowerCase();
        const topicSlug = (t.slug || '').toLowerCase();
        return item.matchKeys.some(k => topicName.includes(k) || topicSlug.includes(k.replace(/\s+/g, '-')));
      });

      const matchingQuestions = questions.filter(q => {
        if (matchedTopic && q.topic === matchedTopic.id) return true;
        const qTopic = (q.topic_name || '').toLowerCase();
        return item.matchKeys.some(k => qTopic.includes(k) || q.tags.some(t => t.toLowerCase().includes(k)));
      });

      const total = matchedTopic ? matchedTopic.total_questions : matchingQuestions.length;
      const solved = matchedTopic ? matchedTopic.solved_questions : matchingQuestions.filter(q => q.solved).length;
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

  // Stats computation
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

  // Activity Grid Data (last 28 days)
  const activityDays = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = submissions?.filter(s => s.created_at.startsWith(dateStr)).length || 0;
      let level = 0;
      if (count > 0 && count <= 2) level = 1;
      else if (count > 2 && count <= 5) level = 2;
      else if (count > 5) level = 3;

      arr.push({ date: d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), count, level });
    }
    return arr;
  }, [submissions]);

  // Current selected module
  const currentModule = useMemo(() => {
    return mappedRoadmap.find(m => m.id === selectedRoadmapId) || mappedRoadmap[0];
  }, [selectedRoadmapId, mappedRoadmap]);

  const selectModule = (id: string) => {
    setSearchParams({ module: id }, { replace: true });
  };

  const isLoading = topicsLoading || questionsLoading || subsLoading;

  return (
    <div className="space-y-6 select-none animate-fade-in -mt-2">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Link to="/dashboard" className="hover:text-slate-605 dark:hover:text-white transition-colors">Dashboard</Link>
            <ChevronRight size={10} className="text-slate-650" />
            <span className="text-blue-600 dark:text-blue-400">DSA Learning Roadmap</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-black text-slate-905 dark:text-white mt-1 leading-tight">
            Data Structures & Algorithms Syllabus
          </h1>
        </div>

        <button
          onClick={() => navigate('/dashboard/coding/problems')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm shadow-blue-500/10"
        >
          Explore Freestyle Playground <ArrowRight size={13} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMN 1: LEFT SIDEBAR TIMELINE (19 TOPICS) */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-455">
                ROADMAP PATTERNS
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">19 Topics</span>
            </div>

            <div className="space-y-1 max-h-[640px] overflow-y-auto pr-1 no-scrollbar">
              {mappedRoadmap.map((item) => {
                const isActive = selectedRoadmapId === item.id;
                const isDone = item.total > 0 && item.solved === item.total;
                return (
                  <button
                    key={item.id}
                    onClick={() => selectModule(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left cursor-pointer group ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-955/40 text-blue-650 dark:text-blue-400 font-bold border border-blue-200/40 dark:border-blue-800/30'
                        : 'text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850/30 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`font-mono text-[10px] ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                        {item.number}
                      </span>
                      <span className="truncate">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isDone ? (
                        <CheckCircle2 size={12} className="text-emerald-500" />
                      ) : (
                        <span className={`font-mono text-[9px] ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                          {item.solved}/{item.total}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: CENTER MODULE DETAILS & CHALLENGES LIST */}
          <div className="lg:col-span-6 space-y-6">
            {/* Selected Module Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  {React.createElement(currentModule.icon, { size: 18 })}
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-455 tracking-wider">Concept {currentModule.number}</span>
                  <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">{currentModule.name}</h2>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {currentModule.desc}
              </p>

              {/* Progress bar inside module */}
              <div className="pt-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-455 mb-1.5">
                  <span>Topic Progress</span>
                  <span>{currentModule.solved} / {currentModule.total} Solved ({currentModule.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      currentModule.solved === currentModule.total && currentModule.total > 0 ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${currentModule.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Questions list belonging to selected module */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-455 uppercase tracking-widest">Syllabus Questions</h3>
                <span className="text-[10px] font-bold text-slate-400">{currentModule.questionsList.length} items available</span>
              </div>

              {currentModule.questionsList.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <AlertCircle className="mx-auto text-slate-400 w-8 h-8" />
                  <p className="text-xs text-slate-550 italic font-semibold">No syllabus questions added for this topic module yet.</p>
                  <button
                    onClick={() => navigate('/dashboard/coding/problems')}
                    className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 hover:bg-slate-100 text-slate-750 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Browse Freestyle Problems
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentModule.questionsList.map((q) => {
                    const isSolved = q.solved;
                    return (
                      <div
                        key={q.id}
                        className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-955/20 border border-slate-150 dark:border-slate-850/60 rounded-2xl hover:border-blue-300 dark:hover:border-blue-900 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`shrink-0 ${isSolved ? 'text-emerald-500' : 'text-slate-300'}`}>
                            {isSolved ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <Link
                              to={`/questions/${q.id}`}
                              className="text-xs font-black text-slate-800 dark:text-slate-200 hover:text-blue-650 hover:underline truncate block"
                            >
                              {q.title}
                            </Link>
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.2 text-[8px] font-black uppercase rounded border ${
                                q.level_name === 'easy' || q.level_name === 'basic' ? 'bg-emerald-50 text-emerald-705 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400' :
                                q.level_name === 'hard' ? 'bg-red-50 text-red-750 border-red-250 dark:bg-red-950/20 dark:text-red-400' :
                                'bg-amber-50 text-amber-705 border-amber-250 dark:bg-amber-955/20 dark:text-amber-400'
                              }`}>{q.level_name === 'basic' ? 'easy' : q.level_name}</span>
                              
                              {q.tags && q.tags.slice(0, 2).map((t: string) => (
                                <span key={t} className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-805 text-slate-500 text-[8px] font-bold rounded">{t}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Link
                          to={`/questions/${q.id}`}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 shadow-xs"
                        >
                          {isSolved ? 'Review' : 'Solve'}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: RIGHT PANEL PROGRESS INSIGHTS & COMPANION */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
            {/* Daily Streak Grid */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-455">
                  WEEKLY ACTIVITY
                </span>
                <span className="text-[11px] font-mono text-orange-600 dark:text-orange-450 font-bold flex items-center gap-1">
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
                    className={`aspect-square rounded-md border transition-colors ${
                      day.level === 0
                        ? 'bg-slate-50 dark:bg-slate-950 border-slate-200/50 dark:border-slate-850'
                        : day.level === 1
                        ? 'bg-emerald-100/70 border-emerald-200/50 dark:bg-emerald-950/20'
                        : day.level === 2
                        ? 'bg-emerald-300 border-emerald-400 dark:bg-emerald-700/50'
                        : 'bg-emerald-500 border-emerald-600'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold pt-1">
                <span>Less</span>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-850 rounded-sm"></div>
                  <div className="w-2.5 h-2.5 bg-emerald-100/70 rounded-sm"></div>
                  <div className="w-2.5 h-2.5 bg-emerald-350 rounded-sm"></div>
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div>
                </div>
                <span>More</span>
              </div>
            </div>

            {/* Level breakdown Progress Bars */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-455">
                  DIFFICULTY SPLIT
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white">
                  {stats.solved} / {stats.total} Solved
                </span>
              </div>

              <div className="space-y-3.5">
                {/* Easy */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-emerald-650">Easy / Basic</span>
                    <span className="text-slate-455 font-mono">{stats.easySolved} / {stats.easyTotal}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${stats.easyTotal > 0 ? (stats.easySolved / stats.easyTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Medium */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-amber-650">Medium</span>
                    <span className="text-slate-455 font-mono">{stats.mediumSolved} / {stats.mediumTotal}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${stats.mediumTotal > 0 ? (stats.mediumSolved / stats.mediumTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Hard */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-rose-650">Hard</span>
                    <span className="text-slate-455 font-mono">{stats.hardSolved} / {stats.hardTotal}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${stats.hardTotal > 0 ? (stats.hardSolved / stats.hardTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Companion Prompt Drawer */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="text-purple-600 w-4 h-4 animate-pulse" />
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-250 uppercase tracking-wider">AI Coding Assistant</h3>
              </div>
              <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                Stuck on understanding {currentModule.name}? Ask the companion panel inside the playground to explain recursive traces, space complexity, or loops variables!
              </p>
              <button
                onClick={() => {
                  if (currentModule.continueQuestionId) {
                    navigate(`/questions/${currentModule.continueQuestionId}`);
                  } else {
                    navigate('/dashboard/coding/problems');
                  }
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 text-[10px] font-black uppercase rounded-xl transition cursor-pointer text-center"
              >
                Launch Companion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DsaRoadmap;

import React, { useEffect, useMemo, useState } from 'react';
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
  ChevronRight, CheckCircle2, Circle, Flame, Trophy, Sparkles, BookOpen, ArrowRight,
  Terminal, Code, Binary, Boxes, Workflow, Database, Hash, GitBranch, Cpu, Share2,
  ListTree, Network, Zap, Award, Loader2, HelpCircle, AlertCircle, LayoutGrid
} from 'lucide-react';

import dsaHeroImg from '../../assets/dsa_illustration.jpg';

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
  { id: 'arrays', number: '06', name: 'Arrays', matchKeys: ['arrays', 'array', 'matrix', 'subarray'], desc: '1D/2D arrays, prefix sums, subarrays, kadane algorithm, and traversal.', icon: Database },
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
      title: 'Data Structures & Algorithms Roadmap | CodexPetra',
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
    const topicsCompletedCount = mappedRoadmap.filter(m => m.total > 0 && m.solved === m.total).length;

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
      rank,
      topicsCompletedCount
    };
  }, [questions, submissions, mappedRoadmap]);

  // Current selected module
  const currentModule = useMemo(() => {
    return mappedRoadmap.find(m => m.id === selectedRoadmapId) || mappedRoadmap[0];
  }, [selectedRoadmapId, mappedRoadmap]);

  const selectModule = (id: string) => {
    setSearchParams({ module: id }, { replace: true });
  };

  const isLoading = topicsLoading || questionsLoading || subsLoading;

  return (
    <div className="bg-[#fcfdff] dark:bg-[#08090d] min-h-screen text-[#0f172a] dark:text-slate-100 font-sans antialiased">
      {/* Container - Full-Width max-width of 1480px */}
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* ── Wide DSA Hero/Header Section ── */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-950 to-[#121320] text-white rounded-[24px] overflow-hidden p-8 sm:p-10 shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8 min-h-[300px]">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

          {/* Left Hero Content */}
          <div className="space-y-6 flex-1 min-w-0 z-10">
            <div className="space-y-2">
              <nav className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                <Link to="/dashboard" className="hover:text-purple-300 transition-colors">Dashboard</Link>
                <ChevronRight size={10} className="text-slate-600" />
                <span className="text-slate-300">DSA Roadmap</span>
              </nav>
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-tight">
                Data Structures & Algorithms
              </h1>
              <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                Master DSA step by step with a structured learning path, practice questions and track your real progress.
              </p>
            </div>

            {/* Rectangular stats row */}
            <div className="flex flex-wrap gap-3 pt-1 select-none">
              {[
                { label: 'Topics', val: '19' },
                { label: 'Questions', val: '320+' },
                { label: 'Practice Sets', val: '32' },
                { label: 'Mock Tests', val: '10' },
                { label: 'Difficulty', val: 'Beginner to Advanced' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-slate-900/60 backdrop-blur-xs border border-slate-850 px-4 py-2.5 rounded-xl text-center flex flex-col justify-center min-w-[90px]">
                  <span className="text-xs sm:text-sm font-black text-white block">{stat.val}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mt-0.5">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Hero Graphic Mockup */}
          <div className="w-full md:w-5/12 lg:w-4/12 shrink-0 flex justify-center z-10 relative">
            <div className="relative group w-full max-w-[340px]">
              <img
                src={dsaHeroImg}
                alt="CodexPetra DSA visual mock representation"
                className="w-full h-auto object-contain rounded-2xl shadow-xl border border-slate-800 transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Main Workspace: Spacious 3-Column Layout ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-[#4f46e5] w-10 h-10" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUMN 1: LEFT ROADMAP TIMELINE (19 Topics, scrolls independently if needed) */}
            <div className="lg:col-span-3 bg-white dark:bg-[#0c0d14] border border-slate-200/60 dark:border-slate-850 rounded-[20px] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-850/60">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-455 block">
                  ROADMAP
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">{stats.topicsCompletedCount} / 19 Completed</span>
              </div>

              {/* Scrollable container with normal vertical scroll - no traps */}
              <div className="space-y-1.5 max-h-[720px] overflow-y-auto pr-1 select-none scroll-smooth">
                {mappedRoadmap.map((item) => {
                  const isActive = selectedRoadmapId === item.id;
                  const isDone = item.total > 0 && item.solved === item.total;
                  return (
                    <button
                      key={item.id}
                      onClick={() => selectModule(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-xs transition-all text-left cursor-pointer group border ${
                        isActive
                          ? 'bg-purple-50/60 dark:bg-purple-950/20 text-[#4f46e5] dark:text-[#8b5cf6] font-extrabold border-purple-200/40 dark:border-purple-900/30 shadow-xs'
                          : 'text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850/20 border-transparent font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={`font-mono text-[10px] ${isActive ? 'text-[#4f46e5] dark:text-[#8b5cf6]' : 'text-slate-400'}`}>
                          {item.number}
                        </span>
                        <span className="truncate">{item.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 pl-2">
                        {isDone ? (
                          <CheckCircle2 size={12} className="text-emerald-500" />
                        ) : (
                          <span className={`font-mono text-[9px] ${isActive ? 'text-[#4f46e5]' : 'text-slate-400'}`}>
                            {item.solved}/{item.total}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* View Full Roadmap CTA Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-850/60">
                <button
                  onClick={() => navigate('/dashboard/coding/problems')}
                  className="w-full py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-850/40 transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <LayoutGrid size={12} /> View Full Roadmap
                </button>
              </div>
            </div>

            {/* COLUMN 2: CENTER WORKSPACE (Widest center path with comfortable breathing room) */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* CURRENT CONCEPT CARD */}
              <div className="bg-white dark:bg-[#0c0d14] border border-slate-200/60 dark:border-slate-850 rounded-[24px] p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[16px] bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex items-center justify-center text-[#4f46e5] dark:text-purple-400 shrink-0 shadow-xs">
                    {React.createElement(currentModule.icon, { size: 20 })}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">CURRENT CONCEPT</span>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">{currentModule.name}</h2>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                  {currentModule.desc}
                </p>

                {/* Progress bar info inside card */}
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-455">
                    <span>Topic Progress</span>
                    <span>{currentModule.solved} / {currentModule.total} Solved ({currentModule.percentage}%)</span>
                  </div>
                  <div className="w-full bg-[#f1f5f9] dark:bg-slate-850 h-2.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        currentModule.solved === currentModule.total && currentModule.total > 0 ? 'bg-emerald-500 shadow-sm' : 'bg-[#4f46e5]'
                      }`}
                      style={{ width: `${currentModule.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* TOPICS IN THIS CONCEPT LIST */}
              <div className="bg-white dark:bg-[#0c0d14] border border-slate-200/60 dark:border-slate-850 rounded-[24px] p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-6">
                <div className="pb-4 border-b border-slate-100 dark:border-slate-850/60 flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-455 uppercase tracking-widest">TOPICS IN THIS CONCEPT</h3>
                  <span className="text-[10px] font-mono font-bold text-slate-400">{currentModule.questionsList.length} Questions</span>
                </div>

                {currentModule.questionsList.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <HelpCircle className="mx-auto text-slate-300 w-10 h-10" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No questions mapped yet</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">Syllabus content is currently being populated by our administrators.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5 pt-1">
                    {currentModule.questionsList.map((q) => {
                      const isSolved = q.solved;
                      return (
                        <div
                          key={q.id}
                          className="flex items-center justify-between p-4 bg-slate-50/40 dark:bg-slate-955/15 border border-slate-150/70 dark:border-slate-850/60 rounded-2xl hover:border-purple-300 dark:hover:border-purple-900 hover:bg-slate-50/75 dark:hover:bg-slate-955/25 transition-all duration-200 shadow-2xs group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-4">
                            {/* Checkbox Status */}
                            <div className={`shrink-0 ${isSolved ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`}>
                              {isSolved ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                  <CheckCircle2 size={13} className="stroke-[3]" />
                                </div>
                              ) : (
                                <Circle size={18} className="stroke-[1.5]" />
                              )}
                            </div>

                            <div className="space-y-1 min-w-0">
                              <Link
                                to={`/questions/${q.id}`}
                                className="text-xs font-black text-slate-850 dark:text-slate-200 hover:text-[#4f46e5] hover:underline truncate block"
                              >
                                {q.title}
                              </Link>
                              
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Difficulty Badge */}
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                                  q.level_name === 'basic' || q.level_name === 'easy'
                                    ? 'bg-emerald-50 text-emerald-705 border-emerald-250 dark:bg-emerald-950/20'
                                    : q.level_name === 'medium'
                                    ? 'bg-amber-50 text-amber-705 border-amber-250 dark:bg-amber-955/20'
                                    : 'bg-red-50 text-red-750 border-red-250 dark:bg-red-950/20'
                                }`}>
                                  {q.level_name === 'basic' ? 'easy' : q.level_name}
                                </span>
                                
                                {/* Tags */}
                                {q.tags && q.tags.slice(0, 2).map((t: string) => (
                                  <span key={t} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[8px] font-bold rounded-md">{t}</span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Solved Status Ratio + Button */}
                          <div className="flex items-center gap-5 shrink-0 select-none">
                            <span className="text-[10px] font-mono font-bold text-slate-455 hidden sm:block">
                              {isSolved ? '1 / 1' : '0 / 1'}
                            </span>
                            
                            <Link
                              to={`/questions/${q.id}`}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 text-center min-w-[70px] shadow-2xs ${
                                isSolved
                                  ? 'border border-purple-200 text-[#4f46e5] bg-purple-50/20 hover:bg-purple-50 dark:border-purple-900/40 dark:text-purple-400 dark:hover:bg-purple-950/20'
                                  : 'border border-blue-200 text-blue-650 bg-blue-50/20 hover:bg-blue-50 dark:border-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-950/20'
                              }`}
                            >
                              {isSolved ? 'Review' : 'Solve'}
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* View All chevron toggle */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-850/60">
                  <button
                    onClick={() => navigate('/dashboard/coding/problems')}
                    className="w-full py-2 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 transition cursor-pointer text-center"
                  >
                    View All {currentModule.questionsList.length} Topics
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMN 3: RIGHT PANEL PROGRESS DETAILS (Progress + Difficulty + AI helper) */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* YOUR PROGRESS CARD */}
              <div className="bg-white dark:bg-[#0c0d14] border border-slate-200/60 dark:border-slate-850 rounded-[24px] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-5">
                <div className="pb-2.5 border-b border-slate-100 dark:border-slate-850/60 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-455">
                    YOUR PROGRESS
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">Overall Progress</span>
                    <span className="text-3xl font-black text-[#0f172a] dark:text-white leading-none block">{stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0}%</span>
                  </div>

                  {/* Smooth wave area chart graph */}
                  <div className="w-full pt-1">
                    <svg className="w-full h-12 text-[#6366f1]" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 15 C10 15, 20 5, 30 10 C40 15, 50 2, 60 12 C70 22, 80 8, 90 12 C95 14, 100 8, 100 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M0 15 C10 15, 20 5, 30 10 C40 15, 50 2, 60 12 C70 22, 80 8, 90 12 C95 14, 100 8, 100 8 L100 20 L0 20 Z" fill="url(#wave-grad)" opacity="0.1" />
                      <defs>
                        <linearGradient id="wave-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="currentColor" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Grid stats details */}
                  <div className="grid grid-cols-2 gap-3 text-center border-t border-slate-100 dark:border-slate-850/60 pt-4 select-none">
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850/40">
                      <span className="text-sm font-black text-slate-850 dark:text-slate-100">{stats.topicsCompletedCount}</span>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mt-0.5">Topics Completed</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850/40">
                      <span className="text-sm font-black text-slate-850 dark:text-slate-100">{stats.solved}</span>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mt-0.5">Questions Solved</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850/40">
                      <span className="text-sm font-black text-slate-855 dark:text-slate-100 flex items-center justify-center gap-0.5">
                        <Flame size={12} className="fill-orange-400 text-orange-600" /> {stats.streak}d
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mt-0.5">Current Streak</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-955/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850/40">
                      <span className="text-sm font-black text-slate-855 dark:text-slate-100 flex items-center justify-center gap-0.5">
                        <Trophy size={11} className="text-amber-500" /> {stats.solved * 10}
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mt-0.5">XP Earned</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DIFFICULTY SPLIT CARD */}
              <div className="bg-white dark:bg-[#0c0d14] border border-slate-200/60 dark:border-slate-850 rounded-[24px] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-4">
                <div className="pb-2.5 border-b border-slate-100 dark:border-slate-850/60 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-455">
                    DIFFICULTY SPLIT
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {stats.solved} / {stats.total} Solved
                  </span>
                </div>

                <div className="space-y-3 pt-1 select-none">
                  {/* Easy */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-emerald-705">Easy</span>
                      <span className="text-slate-455 font-mono">{stats.easySolved} / {stats.easyTotal}</span>
                    </div>
                    <div className="w-full bg-[#f1f5f9] dark:bg-slate-850 h-1.5 rounded-full overflow-hidden border border-slate-200/30 dark:border-slate-800/40">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-350"
                        style={{ width: `${stats.easyTotal > 0 ? (stats.easySolved / stats.easyTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Medium */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-amber-705">Medium</span>
                      <span className="text-slate-455 font-mono">{stats.mediumSolved} / {stats.mediumTotal}</span>
                    </div>
                    <div className="w-full bg-[#f1f5f9] dark:bg-slate-850 h-1.5 rounded-full overflow-hidden border border-slate-200/30 dark:border-slate-800/40">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-350"
                        style={{ width: `${stats.mediumTotal > 0 ? (stats.mediumSolved / stats.mediumTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Hard */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-rose-705">Hard</span>
                      <span className="text-slate-455 font-mono">{stats.hardSolved} / {stats.hardTotal}</span>
                    </div>
                    <div className="w-full bg-[#f1f5f9] dark:bg-slate-850 h-1.5 rounded-full overflow-hidden border border-slate-200/30 dark:border-slate-800/40">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-350"
                        style={{ width: `${stats.hardTotal > 0 ? (stats.hardSolved / stats.hardTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI CODING ASSISTANT CARD */}
              <div className="bg-white dark:bg-[#0c0d14] border border-slate-200/60 dark:border-slate-850 rounded-[24px] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-850/60">
                  <Sparkles className="text-purple-600 w-4 h-4 animate-pulse shrink-0" />
                  <h3 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">AI CODING ASSISTANT</h3>
                </div>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  Stuck on understanding {currentModule.name}? Ask the AI assistant inside the playground to get help and hints.
                </p>
                <button
                  onClick={() => {
                    if (currentModule.continueQuestionId) {
                      navigate(`/questions/${currentModule.continueQuestionId}`);
                    } else {
                      navigate('/dashboard/coding/problems');
                    }
                  }}
                  className="w-full py-2.5 border border-purple-200 text-[#4f46e5] dark:border-purple-900/50 dark:text-purple-450 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 text-[10px] font-black uppercase rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={11} /> Open AI Assistant
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ── Bottom Wide Banner ── */}
        <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white p-5 rounded-[20px] shadow-md flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Zap size={18} className="text-yellow-300 animate-pulse" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black">Keep going! Consistency is the key to mastery.</p>
              <p className="text-[10px] text-purple-200 font-medium">Small daily steps lead to compound skills gains.</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard/coding/problems')}
            className="px-5 py-2.5 bg-white text-[#4f46e5] hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm cursor-pointer"
          >
            Explore Freestyle Playground →
          </button>
        </div>

      </div>
    </div>
  );
};

export default DsaRoadmap;

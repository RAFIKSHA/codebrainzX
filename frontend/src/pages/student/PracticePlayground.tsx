import React, { useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
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
  Search, Flame, Trophy, HelpCircle, Layers, ArrowRight, Sparkles, Award
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

const PracticePlayground: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL parameters sync
  const activeTab = searchParams.get('tab') || 'all';
  const selectedDifficulty = searchParams.get('difficulty') || '';
  const selectedTopic = searchParams.get('topic') || '';
  const selectedCompany = searchParams.get('company') || '';
  const searchQuery = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = searchParams.get('sort') || 'order';
  const itemsPerPage = 10;

  // Helper to update search params in url
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

  // Set SEO metadata
  useEffect(() => {
    setSEOMetadata({
      title: 'Practice Playground | CodexPetra',
      description: 'Practice programming challenges, filters by difficulty, company sheets, and track submissions.',
    });
  }, []);

  // Fetch backend data
  const { data: topics } = useQuery<Topic[]>({
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

  // Handle bookmarks / flags
  const handleToggleFlag = (id: number, flagType: 'bookmarks' | 'favorites' | 'liked') => {
    toggleQuestionFlag(id, flagType);
    queryClient.invalidateQueries({ queryKey: ['allQuestions'] });
  };

  // Compute filters
  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    if (activeTab === 'bookmarks') {
      result = result.filter(q => q.is_bookmarked || q.is_favorite);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(q =>
        q.title.toLowerCase().includes(query) ||
        q.topic_name.toLowerCase().includes(query) ||
        q.tags.some(tag => tag.toLowerCase().includes(query)) ||
        q.companies.some(c => c.toLowerCase().includes(query))
      );
    }

    if (selectedDifficulty) {
      if (selectedDifficulty === 'easy') {
        result = result.filter(q => q.level_name === 'basic' || q.level_name === 'easy');
      } else {
        result = result.filter(q => q.level_name === selectedDifficulty);
      }
    }

    if (selectedTopic) {
      result = result.filter(q => String(q.topic) === selectedTopic);
    }

    if (selectedCompany) {
      const comp = selectedCompany.toLowerCase();
      result = result.filter(q => q.companies.some(c => c.toLowerCase() === comp));
    }

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

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage));
  const validPage = Math.min(currentPage, totalPages);
  const paginatedQuestions = useMemo(() => {
    const startIndex = (validPage - 1) * itemsPerPage;
    return filteredQuestions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuestions, validPage]);

  // Stats
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
      rank
    };
  }, [questions, submissions]);

  // Leaderboard ranking mock list
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

  const isLoading = questionsLoading || subsLoading;

  return (
    <div className="space-y-6 select-none animate-fade-in -mt-2">
      {/* Header breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Link to="/dashboard" className="hover:text-slate-605 dark:hover:text-white transition-colors">Dashboard</Link>
            <ChevronRight size={10} className="text-slate-650" />
            <span className="text-blue-600 dark:text-blue-400">Practice Playground</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-black text-slate-905 dark:text-white mt-1 leading-tight">
            Freestyle Coding Playground
          </h1>
        </div>

        <button
          onClick={() => navigate('/dashboard/coding/dsa')}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm shadow-purple-500/10"
        >
          <BookOpen size={13} /> View Structured DSA Roadmap
        </button>
      </div>

      {/* Tabs list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-1.5 flex flex-wrap gap-1 shadow-sm select-none">
        {[
          { id: 'all', label: 'All Problems' },
          { id: 'companies', label: 'Company Sheets' },
          { id: 'bookmarks', label: 'My Bookmarks' },
          { id: 'recent', label: 'Recent Submissions' },
          { id: 'leaderboard', label: 'Leaderboard' }
        ].map(t => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => updateParams({ tab: t.id, page: 1, company: '' })}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-850/50'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main workspace */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Filter Search Bar */}
            {(activeTab === 'all' || activeTab === 'bookmarks') && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2 relative">
                    <Search className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => updateParams({ search: e.target.value, page: 1 })}
                      placeholder="Search questions by title, topic tags..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => updateParams({ difficulty: e.target.value, page: 1 })}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer font-bold"
                    >
                      <option value="">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={sortBy}
                      onChange={(e) => updateParams({ sort: e.target.value, page: 1 })}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer font-bold"
                    >
                      <option value="order">Sort by ID</option>
                      <option value="title">Sort by Title</option>
                      <option value="difficulty">Sort by Difficulty</option>
                      <option value="acceptance">Sort by Acceptance</option>
                    </select>
                  </div>
                </div>

                {/* Company filter chips */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 select-none">
                  <span className="text-[10px] font-black uppercase text-slate-455 tracking-wider shrink-0 mr-1">Fast Sheets:</span>
                  <button
                    onClick={() => updateParams({ company: '', page: 1 })}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 cursor-pointer border transition-colors ${
                      selectedCompany === ''
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 text-slate-600 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    All
                  </button>
                  {COMPANY_LIST.map((comp) => {
                    const isActive = selectedCompany.toLowerCase() === comp.slug;
                    return (
                      <button
                        key={comp.slug}
                        onClick={() => updateParams({ company: isActive ? '' : comp.slug, page: 1 })}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 cursor-pointer border transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 text-slate-600 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {comp.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB VIEW: ALL & BOOKMARKS TABLE */}
            {(activeTab === 'all' || activeTab === 'bookmarks') && (
              <div className="space-y-4">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 shadow-sm">
                    <HelpCircle size={36} className="mx-auto mb-2 text-slate-400" />
                    <h3 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider">No Challenges Found</h3>
                    <p className="text-[11px] text-slate-450 mt-1 max-w-xs mx-auto">Adjust your search parameters or select another difficulty tab.</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                        <thead>
                          <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                            <th className="py-3.5 pl-6 w-14 text-center">Status</th>
                            <th className="py-3.5 px-4">Problem</th>
                            <th className="py-3.5 px-4 w-44">Topic</th>
                            <th className="py-3.5 px-4 w-28">Difficulty</th>
                            <th className="py-3.5 px-4 w-28 text-center">Acceptance</th>
                            <th className="py-3.5 pr-6 w-32 text-center">Solve</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 text-slate-900 dark:text-slate-200">
                          {paginatedQuestions.map((q) => (
                            <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-955/20 transition-colors">
                              <td className="py-3.5 pl-6 text-center">
                                {q.solved ? (
                                  <CheckCircle2 className="text-emerald-500 inline-block" size={16} />
                                ) : (
                                  <Circle className="text-slate-300 inline-block" size={15} />
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      to={`/questions/${q.id}`}
                                      className="font-black text-slate-850 dark:text-slate-200 hover:text-blue-600 transition-colors"
                                    >
                                      {q.order}. {q.title}
                                    </Link>

                                    <button
                                      onClick={() => handleToggleFlag(q.id, 'bookmarks')}
                                      className={`p-1 rounded hover:bg-slate-105 transition-colors cursor-pointer ${q.is_bookmarked ? 'text-amber-500' : 'text-slate-300'}`}
                                      title="Bookmark"
                                    >
                                      <Star size={11} className={q.is_bookmarked ? 'fill-amber-400' : ''} />
                                    </button>

                                    <button
                                      onClick={() => handleToggleFlag(q.id, 'favorites')}
                                      className={`p-1 rounded hover:bg-slate-105 transition-colors cursor-pointer ${q.is_favorite ? 'text-rose-500' : 'text-slate-300'}`}
                                      title="Favorite"
                                    >
                                      <Heart size={11} className={q.is_favorite ? 'fill-rose-400' : ''} />
                                    </button>

                                    <button
                                      onClick={() => handleToggleFlag(q.id, 'liked')}
                                      className={`p-1 rounded hover:bg-slate-105 transition-colors cursor-pointer ${q.is_liked ? 'text-blue-600' : 'text-slate-300'}`}
                                      title="Like"
                                    >
                                      <ThumbsUp size={11} className={q.is_liked ? 'fill-blue-500' : ''} />
                                    </button>
                                  </div>
                                  <span className="text-[9px] text-slate-450 font-mono">Limits: {q.time_limit}s / {q.memory_limit}MB</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-slate-500 font-semibold truncate max-w-[150px]">
                                {q.topic_name}
                              </td>

                              <td className="py-3.5 px-4 font-semibold uppercase">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-wider border ${
                                  q.level_name === 'basic' || q.level_name === 'easy'
                                    ? 'bg-emerald-50 text-emerald-705 border-emerald-250 dark:bg-emerald-950/20'
                                    : q.level_name === 'medium'
                                    ? 'bg-amber-50 text-amber-705 border-amber-250 dark:bg-amber-955/20'
                                    : 'bg-red-50 text-red-750 border-red-250 dark:bg-red-950/20'
                                }`}>
                                  {q.level_name === 'basic' ? 'easy' : q.level_name}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">
                                {q.acceptance_rate}%
                              </td>

                              <td className="py-3.5 pr-6 text-center">
                                <Link
                                  to={`/questions/${q.id}`}
                                  className="px-3.5 py-1.5 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xs inline-block"
                                >
                                  {q.solved ? 'Review' : 'Solve'}
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center px-6 py-4.5 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/10 select-none text-xs">
                        <span className="text-slate-455 font-bold">
                          Page {validPage} of {totalPages}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            disabled={validPage === 1}
                            onClick={() => updateParams({ page: validPage - 1 })}
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-650 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            disabled={validPage === totalPages}
                            onClick={() => updateParams({ page: validPage + 1 })}
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-650 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB VIEW: COMPANY INTERVIEW CARDS */}
            {activeTab === 'companies' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Company Interview Sheets</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Explore challenges historically asked in top technology engineering interviews.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  {COMPANY_LIST.map((comp) => {
                    const count = questions.filter(q => q.companies.some(c => c.toLowerCase() === comp.slug)).length;
                    return (
                      <div
                        key={comp.slug}
                        onClick={() => updateParams({ tab: 'all', company: comp.slug, page: 1 })}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-white dark:bg-slate-950/20 hover:bg-slate-50/50 transition-all text-left cursor-pointer group flex flex-col justify-between h-36 shadow-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wide text-slate-850 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                              {comp.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Mock Challenges</p>
                          </div>
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-800 dark:text-slate-250 font-bold text-xs flex items-center justify-center">
                            {comp.name.charAt(0)}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-850/60">
                          <span className="text-[11px] font-bold font-mono text-slate-650">{count} Challenges</span>
                          <span className="text-[11px] font-black text-blue-650 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Explore Sheet <ChevronRight size={13} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB VIEW: SUBMISSION LOGS */}
            {activeTab === 'recent' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <History size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">My Submission History</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Real-time log of previous test runs and compiler verifications.</p>
                  </div>
                </div>

                {!submissions || submissions.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl p-8">
                    <History size={36} className="mx-auto mb-2 text-slate-400" />
                    <p className="text-xs font-bold text-slate-550 italic">No submissions logged yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-850">
                    <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-500 font-bold uppercase bg-slate-50/80 dark:bg-slate-950/20">
                          <th className="py-3 px-4">Challenge Name</th>
                          <th className="py-3 px-4 w-28">Language</th>
                          <th className="py-3 px-4 w-32">Status</th>
                          <th className="py-3 px-4 w-44">Submitted At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 text-slate-900 dark:text-slate-200">
                        {submissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-955/20 transition-colors">
                            <td className="py-3.5 px-4 font-black text-slate-800 dark:text-slate-250 hover:text-blue-650 transition-colors">
                              <Link to={`/questions/${sub.question}`}>{sub.question_title}</Link>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{sub.language_name}</td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black border ${
                                  sub.status === 'Accepted'
                                    ? 'bg-emerald-50 text-emerald-705 border-emerald-250 dark:bg-emerald-950/20'
                                    : 'bg-rose-50 text-rose-705 border-rose-250 dark:bg-rose-955/20'
                                }`}
                              >
                                {sub.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-400 dark:text-slate-500 font-mono">
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

            {/* TAB VIEW: LEADERBOARD */}
            {activeTab === 'leaderboard' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Trophy size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Platform Leaderboard</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Top coders ranked by challenges solved and compiler accuracy scores.</p>
                  </div>
                </div>

                {/* Podiums */}
                <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto pt-6 pb-2 text-center items-end select-none">
                  {leaderboard[1] && (
                    <div className="flex flex-col items-center">
                      <div className="w-11 h-11 rounded-full bg-slate-100 border-2 border-slate-300 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shadow-xs">
                        {leaderboard[1].avatar}
                      </div>
                      <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 mt-1.5 truncate max-w-[90px]">{leaderboard[1].name}</span>
                      <div className="h-16 w-full bg-slate-50/70 border border-slate-200 dark:bg-slate-950/50 dark:border-slate-850 rounded-t-2xl mt-2 flex flex-col justify-center items-center">
                        <span className="text-xs font-black text-slate-500">2nd</span>
                        <span className="text-[9px] text-slate-400 font-mono mt-0.5">{leaderboard[1].solved} Qs</span>
                      </div>
                    </div>
                  )}

                  {leaderboard[0] && (
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-400 dark:bg-amber-955/20 dark:border-amber-700/50 flex items-center justify-center font-bold text-sm text-amber-800 dark:text-amber-300 shadow-sm">
                        {leaderboard[0].avatar}
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white mt-1.5 truncate max-w-[100px]">{leaderboard[0].name}</span>
                      <div className="h-24 w-full bg-amber-50/30 border border-amber-200/50 dark:bg-amber-955/10 dark:border-amber-900/30 rounded-t-2xl mt-2 flex flex-col justify-center items-center">
                        <span className="text-xs font-black text-amber-750">1st 🏆</span>
                        <span className="text-[10px] text-amber-805 font-mono font-bold mt-0.5">{leaderboard[0].solved} Qs</span>
                      </div>
                    </div>
                  )}

                  {leaderboard[2] && (
                    <div className="flex flex-col items-center">
                      <div className="w-11 h-11 rounded-full bg-orange-50 border-2 border-orange-300 dark:bg-orange-955/20 dark:border-orange-700/50 flex items-center justify-center font-bold text-xs text-orange-850 dark:text-orange-300 shadow-xs">
                        {leaderboard[2].avatar}
                      </div>
                      <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 mt-1.5 truncate max-w-[90px]">{leaderboard[2].name}</span>
                      <div className="h-12 w-full bg-slate-50/70 border border-slate-200 dark:bg-slate-955/50 dark:border-slate-850 rounded-t-2xl mt-2 flex flex-col justify-center items-center">
                        <span className="text-xs font-black text-slate-500">3rd</span>
                        <span className="text-[9px] text-slate-400 font-mono mt-0.5">{leaderboard[2].solved} Qs</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-850 max-w-2xl mx-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-500 font-bold uppercase bg-slate-50/80 dark:bg-slate-950/20">
                        <th className="py-3 px-4 w-16 text-center">Rank</th>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4 w-28 text-center">Solved</th>
                        <th className="py-3 px-4 w-28 text-center">Streak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 text-slate-900 dark:text-slate-200">
                      {leaderboard.map((item) => (
                        <tr
                          key={item.name}
                          className={`transition-colors ${
                            item.isCurrentUser
                              ? 'bg-blue-50/75 dark:bg-blue-955/35 font-bold border-l-2 border-l-blue-600'
                              : 'hover:bg-slate-50/50 dark:hover:bg-slate-955/20'
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-650">{item.rank}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-800 dark:text-slate-350 text-[10px] font-bold flex items-center justify-center border border-slate-200 dark:border-slate-800">
                                {item.avatar}
                              </div>
                              <span className={item.isCurrentUser ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-850 dark:text-slate-200'}>
                                {item.name} {item.isCurrentUser && '(You)'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-650">{item.solved} Qs</td>
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

          {/* Right sidebar stats panel */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 select-none">
            {/* Quick overview metrics card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">My Practice Profile</h3>
              
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-850">
                  <span className="text-slate-455 font-bold">Streaks</span>
                  <span className="font-extrabold text-orange-600 dark:text-orange-400 flex items-center gap-0.5">
                    <Flame size={14} className="fill-orange-400" /> {stats.streak} Days
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-850">
                  <span className="text-slate-455">Platform Rank</span>
                  <span className="font-bold text-slate-905 dark:text-white">#{stats.rank}</span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-850">
                  <span className="text-slate-455">Solved Questions</span>
                  <span className="font-bold text-slate-905 dark:text-white">{stats.solved} / {stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-455">Acceptance Rate</span>
                  <span className="font-bold text-slate-905 dark:text-white">{stats.userAcceptanceRate}%</span>
                </div>
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

            {/* Quick Contest Promo card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2">
                <Trophy className="text-amber-500 w-4 h-4" />
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-250 uppercase tracking-wider">Weekly Coding Arena</h3>
              </div>
              <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                Join our next live timed contest, benchmark your code accuracy speed, and earn special profile ratings.
              </p>
              <button
                onClick={() => updateParams({ tab: 'contests' })}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase rounded-xl transition cursor-pointer text-center"
              >
                Explore Contests
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PracticePlayground;

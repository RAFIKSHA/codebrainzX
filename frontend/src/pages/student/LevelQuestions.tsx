import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { setSEOMetadata, getCourseSchema } from '../../utils/seo';
import {
  enrichQuestions,
  toggleQuestionFlag,
} from '../../utils/codingHelpers';
import {
  ArrowLeft, CheckCircle2, Circle, Star, Heart, ThumbsUp,
  Clock, HardDrive, ShieldAlert, Loader2, Search, SlidersHorizontal, HelpCircle,
  ChevronRight, Lock, BookOpen
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

const LevelQuestions: React.FC = () => {
  const { topicId, levelName } = useParams<{ topicId: string; levelName: string }>();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch Questions for this specific topic and level
  const { data: questions, isLoading: qLoading, error: qError } = useQuery<Question[]>({
    queryKey: ['questions', topicId, levelName],
    queryFn: async () => {
      const response = await api.get(`/questions/?topic=${topicId}&level=${levelName}`);
      return response.data;
    }
  });

  // Fetch Topic details
  const { data: topic } = useQuery<TopicDetail>({
    queryKey: ['topic', topicId],
    queryFn: async () => {
      const response = await api.get(`/topics/${topicId}/`);
      return response.data;
    }
  });

  useEffect(() => {
    if (topic && levelName) {
      const displayLevel = levelName.charAt(0).toUpperCase() + levelName.slice(1);
      setSEOMetadata({
        title: `${topic.name} (${displayLevel}) | CodexPetra Practice`,
        description: `Practice ${displayLevel} coding challenges in ${topic.name}. Learn algorithm patterns and run code executions.`,
        canonicalUrl: window.location.href,
        structuredData: getCourseSchema(
          `${topic.name} - ${displayLevel} Level`,
          topic.description,
          window.location.href
        ),
      });
    }
  }, [topic, levelName]);

  // Enrich raw questions
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

  const getLevelLabel = (lvl?: string) => {
    if (!lvl) return '';
    return lvl.charAt(0).toUpperCase() + lvl.slice(1);
  };

  const getLevelColor = (lvl?: string) => {
    switch (lvl) {
      case 'basic': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'easy': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'medium': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'hard': return 'text-rose-700 bg-rose-50 border-rose-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const solvedCount = questions?.filter(q => q.solved).length || 0;
  const totalCount = questions?.length || 0;
  const percentCompleted = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. BREADCRUMB & BACK NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/dashboard/coding"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Coding Arena</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <span>/</span>
          <Link to="/dashboard/coding" className="hover:text-blue-600">Practice</Link>
          <span>/</span>
          <span className="text-slate-700">{topic?.name || 'Topic'}</span>
          <span>/</span>
          <span className="text-blue-600 font-semibold">{getLevelLabel(levelName)}</span>
        </div>
      </div>

      {/* 2. TOPIC & LEVEL HEADER CARD (Pure White MNC) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getLevelColor(levelName)}`}>
              {getLevelLabel(levelName)} Level
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {topic?.name} Challenges
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {topic?.description || 'Solve challenges in this level to develop algorithmic thinking and master patterns.'}
          </p>
        </div>

        {/* Solved Progress Counter */}
        <div className="shrink-0 bg-slate-50 border border-slate-200 p-4.5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Completed</span>
            <span className="font-mono text-xl font-bold text-slate-900">
              {solvedCount} <span className="text-xs font-normal text-slate-500">/ {totalCount}</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-full border-[3px] border-slate-200 border-t-blue-600 flex items-center justify-center font-bold text-xs font-mono text-slate-800">
            {percentCompleted}%
          </div>
        </div>
      </div>

      {/* 3. SEARCH & STATUS FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search problems in this topic set..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium text-slate-900 placeholder:text-slate-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 focus:border-blue-500 cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="solved">Solved</option>
              <option value="unsolved">Unsolved</option>
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
          </div>
        </div>
      </div>

      {/* 4. QUESTIONS TABLE */}
      {qLoading ? (
        <div className="flex justify-center items-center py-16 text-slate-500 text-xs font-semibold">
          <Loader2 className="animate-spin text-blue-600 mr-2" size={16} />
          Loading questions...
        </div>
      ) : qError ? (
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-800 flex flex-col items-center gap-2 shadow-sm">
          <ShieldAlert size={32} className="text-rose-600" />
          <h4 className="font-bold text-base text-slate-900">Failed to Fetch Questions</h4>
          <p className="text-xs text-slate-600">Please verify your compiler services or refresh the page.</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <HelpCircle size={40} className="mx-auto mb-2 text-slate-400" />
          <h4 className="font-bold text-base text-slate-900 mb-1">No Questions Found</h4>
          <p className="text-xs text-slate-500">Either no problems match your query or they are not yet published.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider bg-slate-50/80">
                  <th className="py-3.5 pl-6 w-12 text-center">Status</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4 w-28 text-center">Acceptance</th>
                  <th className="py-3.5 px-4">Companies</th>
                  <th className="py-3.5 px-4">Tags</th>
                  <th className="py-3.5 pr-6 w-32 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-6 text-center">
                      {q.solved ? (
                        <CheckCircle2 className="text-emerald-600 inline-block" size={16} />
                      ) : (
                        <Circle className="text-slate-300 inline-block" size={15} />
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/questions/${q.id}`}
                            className="font-bold text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            {q.order}. {q.title}
                          </Link>

                          {/* Star / Heart / Likes buttons */}
                          <button
                            onClick={() => handleToggleFlag(q.id, 'bookmarks')}
                            className={`p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer ${
                              q.is_bookmarked ? 'text-amber-500' : 'text-slate-350'
                            }`}
                            title="Bookmark"
                          >
                            <Star size={12} className={q.is_bookmarked ? 'fill-amber-400' : ''} />
                          </button>

                          <button
                            onClick={() => handleToggleFlag(q.id, 'favorites')}
                            className={`p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer ${
                              q.is_favorite ? 'text-rose-500' : 'text-slate-350'
                            }`}
                            title="Favorite"
                          >
                            <Heart size={12} className={q.is_favorite ? 'fill-rose-400' : ''} />
                          </button>

                          <button
                            onClick={() => handleToggleFlag(q.id, 'liked')}
                            className={`p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer ${
                              q.is_liked ? 'text-blue-600' : 'text-slate-350'
                            }`}
                            title="Like"
                          >
                            <ThumbsUp size={12} className={q.is_liked ? 'fill-blue-500' : ''} />
                          </button>
                          {q.is_liked && <span className="text-[10px] font-bold text-blue-600 font-mono">+{q.likes}</span>}
                        </div>
                        
                        <div className="flex items-center gap-3 text-[10px] text-slate-450 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {q.time_limit}s
                          </span>
                          <span className="flex items-center gap-1">
                            <HardDrive size={11} />
                            {q.memory_limit}MB
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-600">
                      {q.acceptance_rate}%
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {q.companies.map(c => (
                          <span key={c} className="text-[10px] font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {q.tags.map(t => (
                          <span key={t} className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 pr-6 text-center">
                      <Link
                        to={`/questions/${q.id}`}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                          q.solved
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        <span>{q.solved ? 'Review' : 'Solve'}</span>
                        <ChevronRight size={12} />
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
  );
};

export default LevelQuestions;

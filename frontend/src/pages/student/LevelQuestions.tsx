import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { setSEOMetadata, getCourseSchema } from '../../utils/seo';
import { ArrowLeft, Play, CheckCircle2, Circle, Clock, HardDrive, ShieldAlert, Loader2 } from 'lucide-react';

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

  // Fetch Questions for this specific topic and level
  const { data: questions, isLoading: qLoading, error: qError } = useQuery<Question[]>({
    queryKey: ['questions', topicId, levelName],
    queryFn: async () => {
      const response = await api.get(`/questions/?topic=${topicId}&level=${levelName}`);
      // Backend returns a list filtered by query parameters
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

  const getLevelLabel = (lvl?: string) => {
    if (!lvl) return '';
    return lvl.charAt(0).toUpperCase() + lvl.slice(1);
  };

  const getLevelColor = (lvl?: string) => {
    switch (lvl) {
      case 'basic': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
      case 'easy': return 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-850';
      case 'medium': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-850';
      case 'hard': return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-850';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto px-4 py-8">
      {/* Back Button & Breadcrumbs */}
      <div className="mb-6">
        <Link
          to="/dashboard/coding"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-3"
        >
          <ArrowLeft size={15} />
          Back to Coding
        </Link>
        
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-mono">
          <Link to="/dashboard" className="hover:text-blue-500">dashboard</Link>
          <span>/</span>
          <Link to="/dashboard/coding" className="hover:text-blue-500">coding</Link>
          <span>/</span>
          <span className="text-slate-650 dark:text-slate-350">{topic?.name?.toLowerCase() || 'topic'}</span>
          <span>/</span>
          <span className="text-blue-600 dark:text-blue-400">{levelName?.toLowerCase()}</span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded border uppercase ${getLevelColor(levelName)}`}>
                {getLevelLabel(levelName)} Level
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {topic?.name} Questions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              {topic?.description}
            </p>
          </div>

          <div className="shrink-0 text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl">
            <span className="font-semibold text-slate-900 dark:text-white font-mono block">
              {questions?.filter(q => q.solved).length || 0} / {questions?.length || 0}
            </span>
            Completed Challenges
          </div>
        </div>
      </div>

      {/* Questions list */}
      {qLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-blue-600 mr-2" />
          Loading questions...
        </div>
      ) : qError ? (
        <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-center text-red-650 dark:text-red-400 flex flex-col items-center gap-2">
          <ShieldAlert size={28} />
          <h4 className="font-bold text-base">Failed to fetch questions</h4>
          <p className="text-sm">Please refresh the page or contact support.</p>
        </div>
      ) : !questions || questions.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <h4 className="font-bold text-base text-slate-800 dark:text-white mb-2">No questions published yet</h4>
          <p className="text-sm">Check back later or try other topics in the dashboard.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <div
              key={question.id}
              className={`p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm hover:shadow hover:border-slate-300 dark:hover:border-slate-700 transition-all`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-1">
                  {question.solved ? (
                    <CheckCircle2 className="text-emerald-500" size={18} />
                  ) : (
                    <Circle className="text-slate-300 dark:text-slate-600" size={18} />
                  )}
                </span>
                
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base hover:text-blue-600 transition-colors">
                    <Link to={`/questions/${question.id}`}>
                      {question.order}. {question.title}
                    </Link>
                  </h4>
                  
                  {/* Limits bar */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {question.time_limit}s
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive size={12} />
                      {question.memory_limit}MB
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to={`/questions/${question.id}`}
                className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer ${
                  question.solved
                    ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200'
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-blue-500/10'
                }`}
              >
                {question.solved ? 'Review solution' : 'Solve problem'}
                <Play size={12} fill="currentColor" className={question.solved ? 'opacity-50' : ''} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LevelQuestions;

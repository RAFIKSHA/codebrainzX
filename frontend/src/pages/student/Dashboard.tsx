import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { setSEOMetadata } from '../../utils/seo';
import { 
  BookOpen, Sparkles, Lock, Unlock, CheckCircle2, 
  History, Settings, LogOut, ChevronRight, Loader2, AlertCircle
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

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'topics' | 'history' | 'profile'>('topics');
  const location = useLocation();

  // Sync tab state with URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'topics' || tabParam === 'history' || tabParam === 'profile') {
      setActiveTab(tabParam);
    }
  }, [location]);

  // Fetch Topics data
  const { data: topics, isLoading: topicsLoading, error: topicsError } = useQuery<Topic[]>({
    queryKey: ['topics'],
    queryFn: async () => {
      const response = await api.get('/topics/');
      return response.data;
    }
  });

  // Fetch Submissions history
  const { data: submissions, isLoading: subsLoading } = useQuery<Submission[]>({
    queryKey: ['recentSubmissions'],
    queryFn: async () => {
      const response = await api.get('/submissions/');
      return response.data;
    },
    enabled: activeTab === 'history' || activeTab === 'topics' // Fetch when dashboard mounts or tab shifts
  });

  useEffect(() => {
    setSEOMetadata({
      title: 'Coding Dashboard | CodeBrainzX',
      description: 'Track your coding levels progress, solve questions in Arrays, Strings, Sorting, Stacks, and review submissions history.',
    });
  }, []);

  // Calculate Overall stats
  const totalQuestions = topics?.reduce((acc, t) => acc + t.total_questions, 0) || 0;
  const solvedQuestions = topics?.reduce((acc, t) => acc + t.solved_questions, 0) || 0;
  const overallPercentage = totalQuestions > 0 ? Math.round((solvedQuestions / totalQuestions) * 100) : 0;

  // Level display helper
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
    if (isLocked) return 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border border-slate-200 dark:border-slate-700';
    if (isCompleted) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
    
    // Unlocked but not completed
    switch (lvl) {
      case 'basic': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      case 'easy': return 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border border-sky-200 dark:border-sky-850';
      case 'medium': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-850';
      case 'hard': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-850';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-750 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-8">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles size={14} className="animate-spin-slow" />
              Welcome Back
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">Hello, {user?.username}!</h2>
            <p className="text-blue-100 text-sm mt-1 max-w-lg leading-relaxed">
              Continue your progressive path. Solve questions to unlock harder coding challenges.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shrink-0">
            <div className="text-right">
              <span className="text-xs text-blue-200 block uppercase font-semibold">Total Progress</span>
              <span className="text-xl font-bold font-mono">{solvedQuestions} / {totalQuestions} Solved</span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-white flex items-center justify-center font-bold text-sm font-mono shrink-0">
              {overallPercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8">
        <button
          onClick={() => setActiveTab('topics')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
            activeTab === 'topics'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'
          }`}
        >
          <BookOpen size={16} />
          Topics & Levels
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'
          }`}
        >
          <History size={16} />
          Submissions History
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'
          }`}
        >
          <Settings size={16} />
          Account Profile
        </button>
      </div>

      {/* TAB CONTENT: TOPICS */}
      {activeTab === 'topics' && (
        <div>
          {topicsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 4].map(n => (
                <div key={n} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse">
                  <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-850 rounded mb-6"></div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-10 bg-slate-100 dark:bg-slate-850 rounded-xl"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : topicsError ? (
            <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-center text-red-650 dark:text-red-400 flex flex-col items-center gap-2">
              <AlertCircle size={32} />
              <h3 className="font-bold text-lg">Failed to load topics</h3>
              <p className="text-sm">Please ensure your backend server is active and try again.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {topics?.map((topic) => {
                const topicPercentage = topic.total_questions > 0 
                  ? Math.round((topic.solved_questions / topic.total_questions) * 100)
                  : 0;

                return (
                  <div
                    key={topic.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow transition-all p-6 flex flex-col justify-between"
                  >
                    <div>
                      {/* Topic Title */}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-slate-950 dark:text-white group hover:text-blue-600 transition-colors">
                          {topic.name}
                        </h3>
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded">
                          {topic.solved_questions}/{topic.total_questions} Solved
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                        {topic.description}
                      </p>

                      {/* Topic Progress Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-6 overflow-hidden">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${topicPercentage}%` }}
                        ></div>
                      </div>

                      {/* Levels Grid */}
                      <div className="space-y-2.5">
                        {topic.levels.map((level) => {
                          const isCompleted = level.total_questions > 0 && level.solved_questions === level.total_questions;
                          const isLocked = level.is_locked;

                          return (
                            <div key={level.id}>
                              {isLocked ? (
                                <div
                                  className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 opacity-60 bg-slate-100/50 dark:bg-slate-850/40 text-slate-400 cursor-not-allowed border border-slate-150 dark:border-slate-800`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <Lock size={15} />
                                    <span className="text-sm font-semibold">{getLevelLabel(level.level)} Level</span>
                                  </div>
                                  <span className="text-xs font-mono">{level.total_questions} challenges</span>
                                </div>
                              ) : (
                                <Link
                                  to={`/topics/${topic.id}/level/${level.level}`}
                                  className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 hover:translate-x-0.5 border ${getLevelBadgeColor(level.level, isLocked, isCompleted)}`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    {isCompleted ? <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" /> : <Unlock size={15} />}
                                    <span className="text-sm font-semibold">{getLevelLabel(level.level)} Level</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold">
                                      {level.solved_questions}/{level.total_questions} Solved
                                    </span>
                                    <ChevronRight size={14} />
                                  </div>
                                </Link>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SUBMISSIONS HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Submissions</h3>
          
          {subsLoading ? (
            <div className="flex justify-center items-center py-12 text-slate-500">
              <Loader2 className="animate-spin text-blue-600 mr-2" />
              Loading history...
            </div>
          ) : !submissions || submissions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-850 rounded-xl">
              <History size={36} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">You haven't submitted any code yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                    <th className="pb-3 pr-4">Question</th>
                    <th className="pb-3 px-4">Language</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="text-slate-800 dark:text-slate-300">
                      <td className="py-3.5 pr-4 font-semibold hover:text-blue-600">
                        <Link to={`/questions/${sub.question}`}>{sub.question_title}</Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">{sub.language_name}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            sub.status === 'Accepted'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50'
                              : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/50'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
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

      {/* TAB CONTENT: PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-3xl font-bold">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.username}</h3>
              <p className="text-sm text-slate-450 uppercase font-bold tracking-wider">{user?.role} Profile</p>
            </div>
          </div>

          <div className="space-y-6 border-t border-slate-100 dark:border-slate-850 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</span>
                <span className="text-sm font-semibold text-slate-850 dark:text-slate-200">{user?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Solved</span>
                <span className="text-sm font-semibold text-slate-850 dark:text-slate-200">{solvedQuestions} Questions</span>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-850 pt-6 flex gap-4">
              <button
                onClick={logout}
                className="px-4 py-2 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-650 dark:text-red-400 font-semibold rounded-lg text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

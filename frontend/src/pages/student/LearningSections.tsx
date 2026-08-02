import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { setSEOMetadata } from '../../utils/seo';
import { 
  Sparkles, CodeXml, Brain, Users, FileText, 
  Trophy, BookOpen, Bot, ChevronRight 
} from 'lucide-react';

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

const LearningSections: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch Topics to show real progress in Coding section
  const { data: topics, isLoading: topicsLoading } = useQuery<Topic[]>({
    queryKey: ['topics'],
    queryFn: async () => {
      const response = await api.get('/topics/');
      return response.data;
    }
  });

  useEffect(() => {
    setSEOMetadata({
      title: 'Learning Hub | CodeBrainzX',
      description: 'Select your learning section: Coding algorithms, logical aptitude, interview prep sheets, and CS core subject MCQs.',
    });
  }, []);

  // Compute Coding progress
  const totalQuestions = topics?.reduce((acc, t) => acc + t.total_questions, 0) || 0;
  const solvedQuestions = topics?.reduce((acc, t) => acc + t.solved_questions, 0) || 0;
  const overallPercentage = totalQuestions > 0 ? Math.round((solvedQuestions / totalQuestions) * 100) : 0;

  // Sections configuration
  const sections = [
    {
      id: 'coding',
      title: 'Coding Practice',
      description: 'Master programming by solving algorithmic challenges across topics like Arrays, Strings, Sorting, and Stacks.',
      icon: CodeXml,
      gradient: 'from-blue-600 to-indigo-600 dark:from-blue-500/20 dark:to-indigo-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      badge: 'Active',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
      route: '/dashboard/coding',
      showProgress: true,
    },
    {
      id: 'aptitude',
      title: 'Aptitude & Reasoning',
      description: 'Sharpen your problem-solving skills with quantitative aptitude, logical reasoning, and verbal analysis tests.',
      icon: Brain,
      gradient: 'from-amber-500 to-orange-600 dark:from-amber-500/10 dark:to-orange-500/10',
      iconColor: 'text-amber-500 dark:text-amber-400',
      badge: '120+ Practice Sets',
      badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-100 dark:border-blue-900/50',
      route: '/dashboard/aptitude',
      showProgress: false,
    },
    {
      id: 'interview',
      title: 'Interview Preparation',
      description: 'Prepare for technical and behavioral interviews with sheets, curated FAQs, and company-wise mock paths.',
      icon: Users,
      gradient: 'from-emerald-500 to-teal-600 dark:from-emerald-500/10 dark:to-teal-500/10',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      badge: 'Placement Sheets',
      badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-purple-100 dark:border-purple-900/50',
      route: '/dashboard/interview',
      showProgress: false,
    },
    {
      id: 'mcq',
      title: 'MCQ Practice',
      description: 'Revise foundational computer science subjects including Operating Systems, DBMS, Networks, and OOPS concepts.',
      icon: FileText,
      gradient: 'from-rose-500 to-pink-600 dark:from-rose-500/10 dark:to-pink-500/10',
      iconColor: 'text-rose-500 dark:text-rose-400',
      badge: 'CS Core Subjects',
      badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100 dark:border-rose-900/50',
      route: '/dashboard/mcq',
      showProgress: false,
    },
    {
      id: 'contests',
      title: 'Competitive Contests',
      description: 'Participate in structured, timed virtual programming contests to compete globally and raise your leaderboard rank.',
      icon: Trophy,
      gradient: 'from-purple-600 to-fuchsia-600 dark:from-purple-500/10 dark:to-fuchsia-500/10',
      iconColor: 'text-purple-500 dark:text-purple-400',
      badge: 'Ranked Contests',
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-450 border-amber-100 dark:border-amber-900/50',
      route: '/dashboard/contests',
      showProgress: false,
    },
    {
      id: 'courses',
      title: 'Structured Courses',
      description: 'Follow conceptual, step-by-step pathways designed by industry practitioners to go from beginner to pro coder.',
      icon: BookOpen,
      gradient: 'from-sky-500 to-cyan-600 dark:from-sky-500/10 dark:to-cyan-500/10',
      iconColor: 'text-sky-500 dark:text-sky-400',
      badge: 'Learning Paths',
      badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/50',
      route: '/dashboard/courses',
      showProgress: false,
    },
    {
      id: 'ai-practice',
      title: 'AI Practice Mock',
      description: 'Get evaluated by an intelligent AI assistant which grades logic correctness, suggests fixes, and conducts interviews.',
      icon: Bot,
      gradient: 'from-violet-600 to-indigo-700 dark:from-violet-600/10 dark:to-indigo-700/10',
      iconColor: 'text-violet-500 dark:text-violet-400',
      badge: 'Coming Soon',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      route: '/dashboard/ai-practice',
      showProgress: false,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Overall Stats Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 dark:from-[#0b0d19] dark:via-[#111325] dark:to-[#090b14] border border-slate-200 dark:border-slate-850 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles size={14} className="animate-pulse" />
              Learning Hub Dashboard
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
              Welcome back, {user?.username}!
            </h2>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Explore our core learning sections. Select a module below to start practice rounds, learn new concepts, or track your completion status.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-slate-800 shrink-0">
            <div className="text-right">
              <span className="text-xs text-slate-450 block uppercase font-bold tracking-wider mb-0.5">Coding Progress</span>
              {topicsLoading ? (
                <span className="text-sm font-semibold text-slate-500">Calculating...</span>
              ) : (
                <span className="text-lg font-bold font-mono text-blue-400">{solvedQuestions} / {totalQuestions} Solved</span>
              )}
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 flex items-center justify-center font-bold text-sm font-mono text-white shrink-0">
              {overallPercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Learning Modules Section Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-2.5 h-6 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
          <h3 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Learning Sections
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Pick a category to boost your technical competence and interview readiness.
        </p>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              onClick={() => navigate(section.route)}
              className="group bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between cursor-pointer relative overflow-hidden"
            >
              {/* Background gradient hint */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-100 to-transparent dark:from-slate-900/50 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 ${section.iconColor}`}>
                    <Icon size={22} />
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${section.badgeColor}`}>
                    {section.badge}
                  </span>
                </div>

                {/* Card Title & Description */}
                <div>
                  <h4 className="text-base font-bold text-slate-950 dark:text-slate-100 flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {section.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                    {section.description}
                  </p>
                </div>
              </div>

              {/* Progress or Actions Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850/60 flex items-center justify-between">
                {section.showProgress ? (
                  <div className="flex-1 mr-4">
                    {topicsLoading ? (
                      <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded animate-pulse w-24"></div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold font-mono text-slate-500">
                          <span>Progress</span>
                          <span>{solvedQuestions}/{totalQuestions} Solved</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${overallPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500">
                    Explore track
                  </span>
                )}

                <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/20 group-hover:border-blue-200 dark:group-hover:border-blue-900/50 flex items-center justify-center transition-all shrink-0">
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningSections;

import React, { useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { setSEOMetadata } from '../../utils/seo';
import { tutorialsService } from '../../services/tutorials';
import {
  CodeXml,
  Brain,
  BookOpen,
  Trophy,
  ArrowRight,
  Sparkles,
  Calendar,
  Users,
  Award,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  Loader2,
  FileCode,
  CheckSquare
} from 'lucide-react';
import heroImg from '../../assets/hero.png';

interface Hackathon {
  id: number;
  title: string;
  slug: string;
  description: string;
  prize_pool: string;
  start_date: string;
  end_date: string;
  status: string;
  banner_url?: string;
  registered_teams_count?: number;
}

const LearningSections: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Set SEO Metadata
  useEffect(() => {
    setSEOMetadata({
      title: 'Practice coding, Aptitude & Learn | CodexPetra',
      description: 'CodexPetra student dashboard hub. Track progress, practice aptitude, solve coding questions and access structured lessons.',
    });
  }, []);

  // Fetch Continue Learning data
  const { data: continueLearning, isLoading: continueLearningLoading } = useQuery({
    queryKey: ['continue-learning'],
    queryFn: async () => {
      try {
        return await tutorialsService.getContinueLearning();
      } catch (err: any) {
        if (err.response?.status === 404) {
          return null; // safe fallback
        }
        throw err;
      }
    }
  });

  // Fetch Hackathons
  const { data: hackathons, isLoading: hackathonsLoading } = useQuery<Hackathon[]>({
    queryKey: ['hackathons'],
    queryFn: async () => {
      const response = await api.get('/hackathons/');
      return response.data;
    }
  });

  // Prioritize Hackathons (1. Live, 2. Upcoming, 3. Active)
  const activeHackathon = useMemo(() => {
    if (!hackathons || hackathons.length === 0) return null;
    const now = new Date();
    
    const live = hackathons.filter(h => {
      const start = new Date(h.start_date);
      const end = new Date(h.end_date);
      return h.status === 'published' && now >= start && now <= end;
    });
    if (live.length > 0) return { ...live[0], badgeStatus: 'Live', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30' };

    const upcoming = hackathons.filter(h => {
      const start = new Date(h.start_date);
      return h.status === 'published' && now < start;
    });
    if (upcoming.length > 0) return { ...upcoming[0], badgeStatus: 'Upcoming', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/30' };

    const published = hackathons.filter(h => h.status === 'published');
    if (published.length > 0) return { ...published[0], badgeStatus: 'Active', badgeColor: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800' };

    return { ...hackathons[0], badgeStatus: hackathons[0].status.toUpperCase(), badgeColor: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800' };
  }, [hackathons]);

  // Starts in X days calculation helper
  const timeRemaining = useMemo(() => {
    if (!activeHackathon) return '';
    const now = new Date();
    const start = new Date(activeHackathon.start_date);
    const diffTime = start.getTime() - now.getTime();
    if (diffTime <= 0) return 'Live now';
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Starts tomorrow';
    return `Starts in ${diffDays} days`;
  }, [activeHackathon]);

  // Helper for dynamic language logos in Continue Learning
  const renderLanguageIcon = (slug: string) => {
    const s = slug.toLowerCase();
    if (s.includes('python') || s === 'py') {
      return (
        <div className="w-16 h-16 bg-[#eff6ff] rounded-xl flex items-center justify-center shrink-0 border border-blue-50/50">
          <svg className="w-9 h-9" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M55 5C27.386 5 28.082 17.014 28.082 17.014L28.1 29.418H55.432C69.362 29.418 70.366 41.522 70.366 41.522L70.386 48.334H82.914C82.914 48.334 105 46.22 105 18.59C105 -9.04 82.614 5 55 5Z" fill="#387EB8"/>
            <path d="M55 105C82.614 105 81.918 92.986 81.918 92.986L81.9 80.582H54.568C40.638 80.582 39.634 68.478 39.634 68.478L39.614 61.666H27.086C27.086 61.666 5 63.78 5 91.41C5 119.04 27.386 105 55 105Z" fill="#FFE052"/>
            <circle cx="43" cy="18" r="4.5" fill="white"/>
            <circle cx="67" cy="92" r="4.5" fill="black" fillOpacity="0.8"/>
          </svg>
        </div>
      );
    }
    if (s.includes('java') || s === 'js' || s.includes('javascript')) {
      return (
        <div className="w-16 h-16 bg-[#fff7ed] rounded-xl flex items-center justify-center shrink-0 border border-orange-50/50">
          <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" fill="#f97316" stroke="none" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <line x1="6" y1="2" x2="6" y2="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="14" y1="2" x2="14" y2="4" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-16 h-16 bg-[#f3e8ff] rounded-xl flex items-center justify-center shrink-0 border border-purple-50/50">
        <CodeXml className="text-purple-650 w-8 h-8" />
      </div>
    );
  };

  return (
    <div className="bg-[#f8fafc] dark:bg-[#090a0f] min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 font-sans text-slate-800 dark:text-slate-100 flex flex-col gap-8">
      
      {/* ── SECTION 1: TOP HERO / WELCOME SECTION ── */}
      <div className="bg-white dark:bg-[#0c0d14] border border-[#e2e8f0] dark:border-slate-850 rounded-[20px] p-8 sm:p-12 md:p-14 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col justify-center min-h-[340px] md:min-h-[380px]">
        
        {/* Left Side Content */}
        <div className="space-y-6 md:w-7/12 relative z-10">
          <div className="space-y-2">
            <span className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 block">
              <span className="text-[#4f46e5] font-bold">Welcome</span> back, {user?.username || 'Learner'} 👋
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#0f172a] dark:text-white tracking-tight leading-tight">
              Practice. Learn. Succeed.
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
              CodexPetra is your all-in-one platform to practice coding, improve aptitude and build real-world skills.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-4 pt-1">
            <button
              onClick={() => navigate('/dashboard/coding')}
              className="px-6 py-3 rounded-lg bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Start Practicing</span>
              <ArrowRight size={14} />
            </button>
            <a
              href="#explore-sections"
              className="px-6 py-3 rounded-lg border border-[#e2e8f0] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 bg-white text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center"
            >
              Explore Platform
            </a>
          </div>

          {/* Value Points in Row */}
          <div className="flex flex-wrap items-center gap-8 mt-10 pt-8 border-t border-slate-100 dark:border-slate-850/60">
            {[
              { icon: FileCode, label: 'Curated Content', desc: 'High quality, exam ready' },
              { icon: CheckSquare, label: 'Track Progress', desc: 'Measure and improve' },
              { icon: Calendar, label: 'Stay Consistent', desc: 'Small steps, big results' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-[#e2e8f0] dark:border-slate-800 bg-white dark:bg-[#0c0d14] rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                    <Icon size={16} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight">{item.label}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-none block">{item.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Workspace Floated Image - Absolute relative to whole card container */}
        <img
          src={heroImg}
          alt="Workspace layout - laptop, black cup, books"
          className="absolute right-0 bottom-0 top-0 h-full w-full hidden md:block object-cover object-right select-none z-0"
        />
      </div>

      {/* ── SECTION 2: CONTINUE LEARNING & EXPLORE ROW ── */}
      <div id="explore-sections" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Continue Learning */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-[#4f46e5]" size={20} />
            <h2 className="text-base font-bold text-[#0f172a] dark:text-white tracking-tight">Continue Learning</h2>
          </div>

          {continueLearningLoading ? (
            /* Skeleton */
            <div className="bg-white dark:bg-[#0c0d14] border border-[#e2e8f0] dark:border-slate-850 rounded-2xl p-6 shadow-sm animate-pulse space-y-4 h-[220px]" />
          ) : !continueLearning || continueLearning.completed_lessons === 0 && continueLearning.progress_percent === 0 ? (
            /* Empty State */
            <div className="bg-white dark:bg-[#0c0d14] border border-[#e2e8f0] dark:border-slate-850 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4 h-[220px]">
              <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/20 text-[#4f46e5] flex items-center justify-center">
                <Sparkles size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Start your learning journey 🚀</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Explore our structured programming courses and start learning today.</p>
              </div>
              <button
                onClick={() => navigate('/tutorials')}
                className="px-4 py-2 rounded-lg bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Explore Learning →</span>
              </button>
            </div>
          ) : (
            /* Continue Card */
            <div className="bg-white dark:bg-[#0c0d14] border border-[#e2e8f0] dark:border-slate-850 rounded-2xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col justify-between min-h-[220px] hover:border-purple-300 dark:hover:border-purple-900 transition-all duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {renderLanguageIcon(continueLearning.course_slug)}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-wider text-[#4f46e5] dark:text-[#8b5cf6] uppercase block">
                      {continueLearning.course_name}
                    </span>
                    <h3 className="text-base font-bold text-[#0f172a] dark:text-white leading-snug">
                      {continueLearning.lesson_title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {continueLearning.chapter_name}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <button
                    onClick={() => navigate(`/tutorials/${continueLearning.course_slug}/${continueLearning.lesson_slug}`)}
                    className="px-4 py-2 border border-purple-200 dark:border-purple-900/40 text-purple-650 dark:text-purple-400 rounded-lg text-xs font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Continue Learning</span>
                    <ArrowRight size={12} />
                  </button>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Last accessed {continueLearning.last_accessed}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-850/60">
                <div className="w-full bg-[#f1f5f9] dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#4f46e5] h-full rounded-full transition-all duration-500"
                    style={{ width: `${continueLearning.progress_percent}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-650 dark:text-slate-400 shrink-0">
                  {continueLearning.progress_percent}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Explore Codexpetra */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-[#4f46e5]" size={18} />
              <h2 className="text-base font-bold text-[#0f172a] dark:text-white tracking-tight">Explore Codexpetra</h2>
            </div>
            <Link to="/tutorials" className="text-xs font-bold text-[#4f46e5] hover:underline flex items-center gap-0.5">
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* 5 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {[
              {
                title: 'DSA Roadmap',
                desc: '19-step structured coding curriculum from fundamentals to advanced data structures.',
                cta: 'Start Learning Path →',
                path: '/dashboard/coding/dsa',
                icon: CodeXml,
                color: 'text-[#8b5cf6] bg-[#f5f3ff] dark:bg-[#8b5cf6]/10',
                hoverBorder: 'hover:border-[#ddd6fe] dark:hover:border-violet-900',
                hoverCta: 'hover:text-[#6d28d9]'
              },
              {
                title: 'Practice Playground',
                desc: 'Freestyle coding problem bank, filter search sheets and company interview sets.',
                cta: 'Freestyle Practice →',
                path: '/dashboard/coding/problems',
                icon: LayoutGrid,
                color: 'text-[#4f46e5] bg-[#eef2ff] dark:bg-[#4f46e5]/10',
                hoverBorder: 'hover:border-[#c5c2f7] dark:hover:border-purple-900',
                hoverCta: 'hover:text-[#4338ca]'
              },
              {
                title: 'Learn',
                desc: 'Interactive lessons, structured paths and concept clarity.',
                cta: 'Start Learning →',
                path: '/tutorials',
                icon: BookOpen,
                color: 'text-[#10b981] bg-[#ecfdf5] dark:bg-[#10b981]/10',
                hoverBorder: 'hover:border-[#a7f3d0] dark:hover:border-emerald-900',
                hoverCta: 'hover:text-[#047857]'
              },
              {
                title: 'Aptitude',
                desc: 'Quantitative, logical and verbal reasoning practice.',
                cta: 'Practice Aptitude →',
                path: '/dashboard/aptitude',
                icon: Brain,
                color: 'text-[#f97316] bg-[#fff7ed] dark:bg-[#f97316]/10',
                hoverBorder: 'hover:border-[#fed7aa] dark:hover:border-orange-900',
                hoverCta: 'hover:text-[#c2410c]'
              },
              {
                title: 'Test Series',
                desc: 'Mock tests and company specific test series.',
                cta: 'Explore Tests →',
                path: '/test-series',
                icon: LayoutGrid,
                color: 'text-[#8b5cf6] bg-[#f5f3ff] dark:bg-[#8b5cf6]/10',
                hoverBorder: 'hover:border-[#ddd6fe] dark:hover:border-violet-900',
                hoverCta: 'hover:text-[#6d28d9]'
              }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(card.path)}
                  className={`bg-white dark:bg-[#0c0d14] border border-[#e2e8f0] dark:border-slate-850 rounded-2xl p-5 flex flex-col justify-between min-h-[220px] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-200 cursor-pointer group ${card.hoverBorder}`}
                >
                  <div className="space-y-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#4f46e5] dark:group-hover:text-purple-400 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                  <div className={`pt-4 flex items-center text-xs font-bold ${card.color.split(' ')[0]} ${card.hoverCta}`}>
                    <span>{card.cta}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── SECTION 3: HACKATHONS & CHALLENGES ── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="text-[#4f46e5]" size={20} />
            <h2 className="text-base font-bold text-[#0f172a] dark:text-white tracking-tight">Hackathons & Challenges</h2>
          </div>
          <Link
            to="/dashboard/hackathons"
            className="text-xs font-bold text-[#4f46e5] hover:underline flex items-center gap-0.5"
          >
            <span>View All Hackathons</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {hackathonsLoading ? (
          /* Loading skeleton */
          <div className="bg-white dark:bg-[#0c0d14] border border-[#e2e8f0] dark:border-slate-850 rounded-[20px] p-8 shadow-sm animate-pulse h-48" />
        ) : activeHackathon ? (
          /* Real Hackathon Card */
          <div className="bg-white dark:bg-[#0c0d14] border border-[#e2e8f0] dark:border-slate-850 rounded-[20px] p-6 sm:p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] hover:shadow-md hover:border-purple-300 dark:hover:border-purple-900 transition-all duration-200 flex flex-col md:flex-row items-center gap-8">
            
            {/* Left Image Banner */}
            <div className="w-full md:w-[260px] h-[160px] bg-slate-900 rounded-xl overflow-hidden shrink-0 relative">
              {activeHackathon.banner_url ? (
                <img
                  src={activeHackathon.banner_url}
                  alt={activeHackathon.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-purple-950/20 text-purple-650 select-none">
                  <Trophy size={48} className="opacity-85" />
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-1">CodexPetra Challenge</span>
                </div>
              )}
            </div>

            {/* Middle Details info */}
            <div className="flex-1 space-y-3 min-w-0">
              <div>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-[#f5f3ff] text-[#6d28d9] border border-[#ddd6fe]">
                  {activeHackathon.badgeStatus}
                </span>
                <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mt-2 leading-snug">
                  {activeHackathon.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {activeHackathon.description}
                </p>
              </div>

              {/* Specs inline row */}
              <div className="flex flex-wrap items-center gap-6 mt-4 pt-1">
                {/* Time remaining */}
                <div className="flex items-center gap-1.5 text-xs text-slate-550 dark:text-slate-400 font-medium">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  <span>{timeRemaining}</span>
                </div>

                {/* Registered teams / members */}
                <div className="flex items-center gap-1.5 text-xs text-slate-550 dark:text-slate-400 font-medium">
                  <Users size={14} className="text-slate-400 shrink-0" />
                  <span>{activeHackathon.registered_teams_count || 0} Teams</span>
                </div>

                {/* Prize Pool */}
                <div className="flex items-center gap-1.5 text-xs text-slate-550 dark:text-slate-400 font-medium">
                  <Award size={14} className="text-slate-400 shrink-0" />
                  <span>{activeHackathon.prize_pool || 'Exciting Prizes'}</span>
                </div>
              </div>
            </div>

            {/* Far Right Action Button */}
            <div className="shrink-0 w-full md:w-auto">
              <button
                onClick={() => navigate(`/dashboard/hackathons/${activeHackathon.slug}`)}
                className="w-full md:w-auto px-6 py-3 rounded-lg bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-purple-500/10"
              >
                <span>Register Now</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        ) : (
          /* Empty Hackathons State */
          <div className="bg-white dark:bg-[#0c0d14] border border-[#e2e8f0] dark:border-slate-850 rounded-[20px] p-8 shadow-sm text-center text-slate-400 dark:text-slate-500 text-xs font-bold">
            No active challenges or hackathons. Check back later!
          </div>
        )}
      </div>

    </div>
  );
};

export default LearningSections;

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Brain, Clock, ChevronRight, BookOpen, BarChart2,
  CheckCircle, XCircle, Bookmark, Play, RefreshCw,
  AlertCircle, Target, Trophy, Star, Zap, Users, Sparkles
} from 'lucide-react';
import aptitudeService from '../../services/aptitude';
import type { AptitudeDashboardData, AptitudeCategory, AptitudeTest, AptitudeTrainer } from '../../services/aptitude';
import { setSEOMetadata, getBreadcrumbSchema } from '../../utils/seo';

const AptitudeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AptitudeDashboardData | null>(null);
  const [categories, setCategories] = useState<AptitudeCategory[]>([]);
  const [tests, setTests] = useState<AptitudeTest[]>([]);
  const [trainers, setTrainers] = useState<AptitudeTrainer[]>([]);
  const [activeSection, setActiveSection] = useState<'topics' | 'mocks' | 'companies'>('topics');

  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashRes, catRes, testRes, trRes] = await Promise.all([
        aptitudeService.getDashboard(),
        aptitudeService.getCategories(),
        aptitudeService.getTests(),
        aptitudeService.getTrainers(true)
      ]);
      setData(dashRes);
      setCategories(catRes);
      setTests(testRes);
      setTrainers(trRes);
    } catch (err: any) {
      setError('Failed to load. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetch(); 
    setSEOMetadata({
      title: 'Aptitude & Reasoning Practice | CodexPetra',
      description: 'Master quantitative aptitude, logical reasoning, and verbal ability with categorized practice questions, mock tests, and company placement papers.',
      canonicalUrl: 'https://codexpetra.com/dashboard/aptitude',
      structuredData: getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Aptitude Practice', url: '/dashboard/aptitude' },
      ]),
    });
  }, []);

  const handleStartTest = async (testId: number) => {
    try {
      await aptitudeService.startTest(testId);
      navigate(`/dashboard/aptitude/test/${testId}`);
    } catch {
      alert('Could not start test. Please try again.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex items-center gap-3 text-slate-500">
        <RefreshCw size={18} className="animate-spin" />
        <span className="text-sm">Loading aptitude section...</span>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <AlertCircle size={36} className="text-red-400" />
      <p className="text-sm text-slate-500">{error}</p>
      <button onClick={fetch} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg">Retry</button>
    </div>
  );

  const { gamification, stats, pending_attempt, weak_areas } = data;
  const mockTests = tests.filter(t => t.test_type === 'mock');
  const companyTests = tests.filter(t => t.test_type === 'company');

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 font-sans">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Brain size={22} className="text-blue-600" />
            Aptitude Practice
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Prepare for placements — Topics, Mock Tests & Company Papers
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-lg font-semibold">
            <Zap size={14} /> Level {gamification?.level ?? 1}
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-lg font-semibold">
            <Star size={14} /> {gamification?.xp ?? 0} XP
          </div>
        </div>
      </div>

      {/* ── Resume Banner ── */}
      {pending_attempt && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">Resume: {pending_attempt.test_title}</p>
              <p className="text-xs text-slate-500">You were on Question #{pending_attempt.current_question_index + 1}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/dashboard/aptitude/test/${pending_attempt.test_id}`)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <Play size={12} fill="white" /> Continue Test
          </button>
        </div>
      )}

      {/* ── Learn from Trainers Section ── */}
      {trainers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Learn from Trainers</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Expert curated modules & questions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {trainers.slice(0, 3).map((t) => (
              <div
                key={t.id}
                onClick={() => navigate(`/dashboard/aptitude/trainer/${t.id}`)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-3">
                  {/* Trainer Avatar + Info */}
                  <div className="flex items-center gap-3">
                    <TrainerAvatar name={t.name} image={t.profile_image} size="md" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {t.name}
                      </h3>
                      <span className="inline-block text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 px-2 py-0.5 rounded mt-0.5 truncate max-w-full">
                        {t.specialization}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  {t.bio && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {t.bio}
                    </p>
                  )}
                </div>


                {/* Footer stats & link */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400 font-medium">
                    <span>{t.question_count} Qs</span>
                    <span>•</span>
                    <span>{t.topic_count} Topics</span>
                  </div>
                  <span className="font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Explore <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Left: Main Content ── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Section Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            {([
              { id: 'topics', label: 'Topic-wise Practice', icon: BookOpen },
              { id: 'mocks', label: `Mock Tests (${mockTests.length})`, icon: Target },
              { id: 'companies', label: `Company Papers (${companyTests.length})`, icon: Trophy },
            ] as const).map(tab => {
              const Icon = tab.icon;
              const active = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── TOPICS TAB ── */}
          {activeSection === 'topics' && (
            <div className="space-y-4">
              {categories.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">No categories available.</div>
              ) : (
                categories.map(cat => (
                  <div key={cat.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    {/* Category Header */}
                    <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white">{cat.name}</h3>
                      <span className="text-xs text-slate-400 font-medium">{cat.topics?.length || 0} topics</span>
                    </div>
                    {/* Topics List */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(cat.topics || []).length === 0 ? (
                        <p className="text-xs text-slate-400 px-5 py-4">No topics in this category.</p>
                      ) : (
                        (cat.topics || []).map(topic => (
                          <button
                            key={topic.id}
                            onClick={() => navigate(`/dashboard/aptitude/topic/${topic.id}`)}
                            className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {topic.name}
                              </p>
                              {topic.description && (
                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{topic.description}</p>
                              )}
                            </div>
                            <ChevronRight size={15} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 shrink-0 ml-4 transition-colors" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── MOCK TESTS TAB ── */}
          {activeSection === 'mocks' && (
            <div className="space-y-3">
              {mockTests.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  <BookOpen size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400">No mock tests available yet.</p>
                </div>
              ) : (
                mockTests.map(test => (
                  <TestCard key={test.id} test={test} onStart={handleStartTest} />
                ))
              )}
            </div>
          )}

          {/* ── COMPANY PAPERS TAB ── */}
          {activeSection === 'companies' && (
            <div className="space-y-3">
              {companyTests.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  <BookOpen size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400">No company papers available yet.</p>
                </div>
              ) : (
                companyTests.map(test => (
                  <TestCard key={test.id} test={test} onStart={handleStartTest} />
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Right Sidebar ── */}
        <div className="space-y-5">

          {/* My Stats */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">My Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Tests Taken', value: stats?.total_attempts ?? 0, color: 'text-blue-600' },
                { label: 'Avg Accuracy', value: stats?.avg_accuracy != null ? `${stats.avg_accuracy.toFixed(0)}%` : '0%', color: 'text-emerald-600' },
                { label: 'Bookmarks', value: stats?.bookmarks_count ?? 0, color: 'text-amber-600' },
                { label: 'Wrong Qs', value: stats?.wrong_questions_count ?? 0, color: 'text-red-500' },
              ].map((s, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-0.5">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{s.label}</p>
                  <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="space-y-1.5 pt-1">
              <Link
                to="/dashboard/aptitude/practice?mode=bookmarks"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <span className="flex items-center gap-2"><Bookmark size={13} className="text-amber-500" /> Bookmarked Questions</span>
                <ChevronRight size={13} className="text-slate-300" />
              </Link>
              <Link
                to="/dashboard/aptitude/practice?mode=wrong"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <span className="flex items-center gap-2"><XCircle size={13} className="text-red-400" /> Incorrectly Answered</span>
                <ChevronRight size={13} className="text-slate-300" />
              </Link>
            </div>
          </div>

          {/* Weak Areas */}
          {weak_areas && weak_areas.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Focus Areas</h3>
              <div className="space-y-3">
                {weak_areas.slice(0, 4).map(wa => (
                  <div key={wa.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{wa.name}</span>
                      <span className="text-red-500">{wa.accuracy.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${wa.accuracy}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/dashboard/aptitude/practice?mode=recommend"
                className="flex items-center justify-center gap-1.5 w-full py-2 mt-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors"
              >
                <BarChart2 size={12} /> Practice Weak Areas
              </Link>
            </div>
          )}

          {/* Achievements */}
          {gamification?.badges && gamification.badges.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Badges Earned</h3>
              <div className="space-y-2">
                {gamification.badges.slice(0, 4).map(badge => (
                  <div key={badge.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800 text-blue-500 flex items-center justify-center shrink-0">
                      <CheckCircle size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{badge.badge_name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{badge.badge_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard Mini */}
          <LeaderboardSidebar />
        </div>
      </div>
    </div>
  );
};

// ── Test Card Component ──
const TestCard: React.FC<{ test: AptitudeTest; onStart: (id: number) => void }> = ({ test, onStart }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
          {test.test_type === 'mock' ? 'MOCK' : 'COMPANY'}
        </span>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{test.title}</h4>
      </div>
      {test.description && (
        <p className="text-xs text-slate-500 line-clamp-1">{test.description}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
        <span className="flex items-center gap-1"><Clock size={11} /> {test.overall_duration} mins</span>
        <span>•</span>
        <span>{test.question_count} questions</span>
        <span>•</span>
        <span>{test.total_marks} marks</span>
        {test.negative_marking && (
          <><span>•</span><span className="text-red-500 font-semibold">–ve marking</span></>
        )}
      </div>
    </div>
    <button
      onClick={() => onStart(test.id)}
      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer shadow-sm"
    >
      <Play size={12} fill="white" /> Start
    </button>
  </div>
);

// ── Leaderboard Sidebar Component ──
const LeaderboardSidebar: React.FC = () => {
  const [board, setBoard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'overall' | 'weekly'>('overall');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setBoard(await aptitudeService.getLeaderboard(period));
      } catch { setBoard([]); }
      finally { setLoading(false); }
    };
    load();
  }, [period]);

  const rankColors = ['text-amber-500', 'text-slate-400', 'text-amber-700'];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Leaderboard</h3>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value as any)}
          className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 rounded-lg px-2 py-1 outline-none cursor-pointer"
        >
          <option value="overall">Overall</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      {loading ? (
        <div className="flex justify-center py-4"><RefreshCw size={14} className="animate-spin text-slate-300" /></div>
      ) : board.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">No rankings yet.</p>
      ) : (
        <div className="space-y-1.5">
          {board.slice(0, 8).map(player => (
            <div key={player.rank} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black w-4 text-center ${rankColors[player.rank - 1] || 'text-slate-400'}`}>
                  {player.rank}
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[90px]">{player.username}</span>
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{player.xp} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Trainer Avatar Component ──
export const TrainerAvatar: React.FC<{ name: string; image?: string | null; size?: 'sm' | 'md' | 'lg' }> = ({ name, image, size = 'md' }) => {

  const [imgFailed, setImgFailed] = useState(false);
  
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-20 h-20 text-2xl'
  }[size];

  const roundedClass = size === 'lg' ? 'rounded-2xl' : 'rounded-full';

  // Sanitize image URL to prevent localhost mixed content issues
  const sanitizedImage = React.useMemo(() => {
    if (!image) return null;
    let url = image.trim();
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      if (url.startsWith('http://localhost:8000') || url.startsWith('http://127.0.0.1:8000')) {
        return url.replace(/^http:\/\/(localhost|127\.0\.0\.1):8000/, 'https://codebrainzx.onrender.com');
      }
      if (url.startsWith('http://')) {
        return 'https://' + url.slice(7);
      }
    }
    return url;
  }, [image]);

  if (sanitizedImage && !imgFailed) {
    return (
      <img
        src={sanitizedImage}
        alt={name}
        className={`${sizeClasses} ${roundedClass} object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm`}
        onError={() => setImgFailed(true)}
      />
    );
  }

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'TR';

  return (
    <div className={`${sizeClasses} ${roundedClass} bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-sm shrink-0`}>
      {initials}
    </div>
  );
};

export default AptitudeDashboard;


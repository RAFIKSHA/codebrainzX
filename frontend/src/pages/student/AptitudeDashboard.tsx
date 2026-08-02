import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Brain, Award, Coins, Clock, Play, ChevronRight, 
  Bookmark, AlertTriangle, AlertCircle, Sparkles, BookOpen, Flame, RefreshCw
} from 'lucide-react';
import aptitudeService from '../../services/aptitude';
import type { AptitudeDashboardData, AptitudeCategory, AptitudeTest } from '../../services/aptitude';

const AptitudeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AptitudeDashboardData | null>(null);
  const [categories, setCategories] = useState<AptitudeCategory[]>([]);
  const [tests, setTests] = useState<AptitudeTest[]>([]);
  const [activeTab, setActiveTab] = useState<'practice' | 'mocks' | 'companies'>('practice');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashRes, catRes, testRes] = await Promise.all([
        aptitudeService.getDashboard(),
        aptitudeService.getCategories(),
        aptitudeService.getTests()
      ]);
      setData(dashRes);
      setCategories(catRes);
      setTests(testRes);
      if (catRes.length > 0) {
        setSelectedCategory(catRes[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
        <p className="text-slate-400 text-sm font-semibold">Loading your Aptitude Dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 max-w-md mx-auto text-center px-4">
        <AlertCircle className="text-red-500" size={48} />
        <h3 className="text-lg font-bold text-slate-200">Something went wrong</h3>
        <p className="text-slate-450 text-sm">{error || 'Unable to retrieve dashboard stats.'}</p>
        <button 
          onClick={fetchDashboardData}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
        >
          Retry
        </button>
      </div>
    );
  }

  const { gamification, stats, pending_attempt, weak_areas } = data;

  const currentCategory = categories.find(c => c.id === selectedCategory);

  // Filter tests by active tab
  const filteredTests = tests.filter(t => {
    if (activeTab === 'mocks') return t.test_type === 'mock';
    if (activeTab === 'companies') return t.test_type === 'company';
    return false;
  });

  const handleStartTest = async (testId: number) => {
    try {
      await aptitudeService.startTest(testId);
      navigate(`/dashboard/aptitude/test/${testId}`);
    } catch (err) {
      console.error('Error starting test:', err);
      alert('Could not start the assessment. Please try again.');
    }
  };

  // Streaks configuration helper
  const renderStreakDays = (currentStreak: number) => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const todayIndex = (new Date().getDay() + 6) % 7; // Convert Sunday=0 to index=6, Mon=0
    return (
      <div className="flex justify-between items-center gap-1.5 mt-3">
        {days.map((day, idx) => {
          const isActive = idx <= todayIndex && currentStreak > 0;
          return (
            <div key={idx} className="flex flex-col items-center gap-1 flex-1">
              <span className={`text-[10px] font-bold ${idx === todayIndex ? 'text-blue-500' : 'text-slate-500'}`}>{day}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                isActive 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-sm shadow-amber-500/5' 
                  : 'bg-slate-900/40 border-slate-800 text-slate-600'
              }`}>
                <Flame size={13} className={isActive ? 'animate-pulse' : ''} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] space-y-8 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 pb-16 font-sans">
      
      {/* 1. Gamification Hero Hub Banner */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row justify-between gap-8">
        
        {/* User stats left */}
        <div className="flex-1 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-lg shadow-sm">
              {gamification.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#111827] leading-tight">Welcome, {gamification.username}!</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Sparkles size={12} className="text-[#2563EB]" />
                Earn XP points and level up with every question.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-slate-50 border border-[#E5E7EB] p-4 rounded-xl">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Level</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#2563EB]">{gamification.level}</span>
                <span className="text-xs text-slate-400 font-medium">/ 50</span>
              </div>
            </div>
            <div className="space-y-1 border-x border-[#E5E7EB] px-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">XP Earned</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-emerald-600">{gamification.xp}</span>
                <span className="text-xs text-slate-400 font-medium">pts</span>
              </div>
            </div>
            <div className="space-y-1 pl-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Coins</span>
              <div className="flex items-center gap-1 text-amber-600">
                <Coins size={16} />
                <span className="text-2xl font-bold">{gamification.coins}</span>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500">Level Progression</span>
              <span className="text-slate-700">{(gamification.xp % 200)} / 200 XP</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-[#E5E7EB]">
              <div 
                className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                style={{ width: `${((gamification.xp % 200) / 200) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Streaks Widget Right */}
        <div className="w-full lg:w-80 bg-slate-50 border border-[#E5E7EB] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-650 border border-amber-200">
                <Flame size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 block">Streak Engine</span>
                <span className="text-[10px] text-slate-400">Daily practice streak</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-amber-600">{gamification.daily_streak}</span>
              <span className="text-[10px] text-slate-400 font-bold block">DAYS</span>
            </div>
          </div>
          
          {renderStreakDays(gamification.daily_streak)}
        </div>
      </div>

      {/* 2. Continue last test attempt notifications */}
      {pending_attempt && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-blue-50/50 border border-blue-100 rounded-xl shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100/50 rounded-xl text-[#2563EB]">
              <Clock size={20} />
            </div>
            <div>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-100 border border-blue-200 text-[#2563EB] rounded">
                Active Session Pending
              </span>
              <h4 className="text-sm font-bold text-[#111827] mt-1">Resume Test: {pending_attempt.test_title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">You were on Question #{pending_attempt.current_question_index + 1}. Your timer is paused.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate(`/dashboard/aptitude/test/${pending_attempt.test_id}`)}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer shadow-sm"
          >
            <Play size={14} fill="white" />
            Continue Test
          </button>
        </div>
      )}

      {/* 3. Core Panels Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Mock tests, Practice Modules */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Practice/Tests Selector Panel */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
              <div className="flex items-center gap-4">
                <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <Brain size={18} className="text-[#2563EB]" />
                  Assessment Engine
                </h3>
                <Link 
                  to="/dashboard/aptitude/categories" 
                  className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-bold hover:underline"
                >
                  Explore Categories →
                </Link>
              </div>
              
              {/* Tab Selector */}
              <div className="flex bg-slate-50 p-1 rounded-xl border border-[#E5E7EB]">
                <button
                  onClick={() => setActiveTab('practice')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'practice' 
                      ? 'bg-[#2563EB] text-white shadow-sm' 
                      : 'text-slate-500 hover:text-[#111827]'
                  }`}
                >
                  Topic Practice
                </button>
                <button
                  onClick={() => setActiveTab('mocks')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'mocks' 
                      ? 'bg-[#2563EB] text-white shadow-sm' 
                      : 'text-slate-500 hover:text-[#111827]'
                  }`}
                >
                  Mock Tests
                </button>
                <button
                  onClick={() => setActiveTab('companies')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'companies' 
                      ? 'bg-[#2563EB] text-white shadow-sm' 
                      : 'text-slate-500 hover:text-[#111827]'
                  }`}
                >
                  Company Papers
                </button>
              </div>
            </div>

            {/* TAB CONTENT: TOPIC PRACTICE */}
            {activeTab === 'practice' && (
              <div className="space-y-6">
                {/* Category Header Row */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors shrink-0 cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-blue-50 border-blue-200 text-[#2563EB] font-bold'
                          : 'bg-slate-50 border-[#E5E7EB] text-slate-500 hover:text-[#111827] hover:border-slate-350'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Topics List Grid */}
                {currentCategory && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentCategory.topics.map((topic) => (
                      <div 
                        key={topic.id}
                        onClick={() => navigate(`/dashboard/aptitude/topic/${topic.id}`)}
                        className="group flex items-center justify-between p-4 bg-slate-50 border border-[#E5E7EB] hover:bg-slate-100/50 hover:border-slate-300 rounded-xl cursor-pointer transition-colors shadow-sm"
                      >
                        <div className="space-y-1 pr-4">
                          <h4 className="text-sm font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors leading-tight">
                            {topic.name}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {topic.description || 'Practice quantitative equations and analytical puzzles.'}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-[#E5E7EB] group-hover:border-blue-300 text-slate-400 group-hover:text-[#2563EB] transition-colors shrink-0">
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: MOCK TESTS & COMPANY PAPERS */}
            {activeTab !== 'practice' && (
              <div className="space-y-4">
                {filteredTests.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-[#E5E7EB] bg-slate-50 rounded-xl space-y-2">
                    <BookOpen className="mx-auto text-slate-400" size={32} />
                    <p className="text-slate-550 text-xs font-semibold">No assessments available in this section</p>
                    <p className="text-slate-400 text-[11px]">Check back later for updated papers.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTests.map((test) => (
                      <div 
                        key={test.id} 
                        className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-50 border border-blue-100 text-[#2563EB] rounded">
                              {test.test_type === 'mock' ? 'MOCK' : 'COMPANY'}
                            </span>
                            <h4 className="text-sm font-bold text-[#111827]">{test.title}</h4>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1">{test.description || 'Full NQT simulation setup.'}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                            <span className="flex items-center gap-1"><Clock size={12} /> {test.overall_duration} Mins</span>
                            <span>•</span>
                            <span>{test.question_count} Qs</span>
                            <span>•</span>
                            <span>{test.total_marks} Marks</span>
                            {test.negative_marking && (
                              <>
                                <span>•</span>
                                <span className="text-red-550 font-semibold">Negative Marking</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartTest(test.id)}
                          className="px-4 h-[38px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold transition-colors shadow-sm shrink-0 cursor-pointer"
                        >
                          Start Test
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Gamification Badges Achievements Box */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
              <Award size={18} className="text-[#2563EB]" />
              Unlocked Achievements
            </h3>
            {gamification.badges.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-[#E5E7EB] bg-slate-50 rounded-xl">
                No badges unlocked yet. Solve tests with high accuracy to earn achievements!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {gamification.badges.map((badge) => (
                  <div key={badge.id} className="bg-slate-50 border border-[#E5E7EB] p-4 rounded-xl text-center space-y-2 flex flex-col items-center hover:border-slate-300 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center">
                      <Award size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#111827]">{badge.badge_name}</h4>
                      <p className="text-[10px] text-slate-400 uppercase mt-0.5">{badge.badge_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Analytics, Recommendations, Leaderboard */}
        <div className="space-y-8 text-[#111827]">
          
          {/* Quick Stats Panel */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Personal Insights</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-[#E5E7EB] p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Mock Exams</span>
                <span className="text-xl font-bold text-[#111827]">{stats.total_attempts}</span>
              </div>
              <div className="bg-slate-50 border border-[#E5E7EB] p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Accuracy</span>
                <span className="text-xl font-bold text-emerald-600">{stats.avg_accuracy.toFixed(1)}%</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Link 
                to="/dashboard/aptitude/practice?mode=bookmarks" 
                className="flex items-center justify-between p-3 bg-slate-50 border border-[#E5E7EB] hover:bg-slate-100/50 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2"><Bookmark size={14} className="text-[#2563EB]" /> Bookmarks</span>
                <span className="px-2 py-0.5 rounded bg-white border border-[#E5E7EB] text-[10px] text-slate-500 font-bold">{stats.bookmarks_count}</span>
              </Link>
              <Link 
                to="/dashboard/aptitude/practice?mode=wrong" 
                className="flex items-center justify-between p-3 bg-slate-50 border border-[#E5E7EB] hover:bg-slate-100/50 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2"><AlertTriangle size={14} className="text-red-500" /> Incorrectly Solved</span>
                <span className="px-2 py-0.5 rounded bg-white border border-[#E5E7EB] text-[10px] text-red-500 font-bold">{stats.wrong_questions_count}</span>
              </Link>
            </div>
          </div>

          {/* Strong / Weak Topic mastery */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Weakness & Recommendation</h3>
            
            {weak_areas.length === 0 ? (
              <div className="text-xs text-slate-500 py-3 text-center border border-dashed border-[#E5E7EB] bg-slate-50 rounded-xl">
                Great job! You have no topics below 50% accuracy.
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-[10px] text-red-500 uppercase tracking-wider font-bold block">Weak areas (&lt; 50%)</span>
                {weak_areas.map((wa) => (
                  <div key={wa.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{wa.name}</span>
                      <span className="text-red-650 font-bold">{wa.accuracy.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-[#E5E7EB]">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${wa.accuracy}%` }}></div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-2 border-t border-[#E5E7EB]">
                  <Link
                    to="/dashboard/aptitude/practice?mode=recommend"
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 border border-blue-100 text-[#2563EB] hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Sparkles size={13} />
                    AI Recommended Practice
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Leaderboard Rankings */}
          <LeaderboardWidget />

        </div>

      </div>

    </div>
  );
};

// Internal Sub-component for Leaderboard
const LeaderboardWidget: React.FC = () => {
  const [board, setBoard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'overall' | 'weekly'>('overall');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await aptitudeService.getLeaderboard(period);
        setBoard(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period]);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-[#111827]">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Leaderboard</h3>
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value as any)}
          className="bg-white border border-[#D1D5DB] text-slate-700 text-xs font-semibold rounded-lg px-2 py-1 outline-none focus:border-[#2563EB]"
        >
          <option value="overall">Overall</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-6 text-slate-500 text-xs font-medium">
          <RefreshCw className="animate-spin text-[#2563EB] mr-2" size={14} /> Loading rankings...
        </div>
      ) : board.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs font-medium">No active leaderboard stats.</div>
      ) : (
        <div className="space-y-2">
          {board.map((player) => (
            <div 
              key={player.rank}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold ${
                player.rank === 1 
                  ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm' 
                  : player.rank === 2
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : player.rank === 3
                  ? 'bg-amber-50/50 border-amber-100 text-amber-800'
                  : 'bg-white border-[#E5E7EB] text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-4 font-black text-center text-slate-400">{player.rank}</span>
                <span className="truncate max-w-[120px] font-bold text-slate-800">{player.username}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded font-bold">Lvl {player.level}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold text-[#111827]">{player.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AptitudeDashboard;

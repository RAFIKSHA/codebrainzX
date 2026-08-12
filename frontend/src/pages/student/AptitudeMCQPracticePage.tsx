import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Bookmark, ChevronLeft, ChevronRight, Check, X,
  Eye, Flame, Zap, AlertCircle, Loader2, HelpCircle,
  Lightbulb, ArrowLeft
} from 'lucide-react';
import aptitudeService from '../../services/aptitude';
import type { AptitudeQuestion } from '../../services/aptitude';
import { useAuth } from '../../context/AuthContext';

type QStatus = 'not-visited' | 'answered' | 'not-answered' | 'marked';

const AptitudeMCQPracticePage: React.FC = () => {
  const { user } = useAuth();
  const { subtopicId } = useParams<{ subtopicId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const topicId = searchParams.get('topic');
  const trainerId = searchParams.get('trainer');

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  // Keyed by question id
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [visitedSet, setVisitedSet] = useState<Set<number>>(new Set());
  const [reportedQuestions, setReportedQuestions] = useState<Record<number, boolean>>({});
  const [showReportDialog, setShowReportDialog] = useState(false);

  // User streak & score for header (Only populated for logged in user)
  const [userGamification, setUserGamification] = useState<{ streak: number; score: number }>({
    streak: 0,
    score: 0
  });

  /* ── Fetch real gamification stats if logged in ── */
  useEffect(() => {
    if (user) {
      aptitudeService.getDashboard()
        .then(res => {
          if (res?.gamification) {
            setUserGamification({
              streak: res.gamification.daily_streak || 0,
              score: res.gamification.xp || 0
            });
          }
        })
        .catch(() => {});
    }
  }, [user]);

  /* ── Fetch questions ── */
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { practice: 'true' };
      if (subtopicId && subtopicId !== 'all') params.sub_topic = subtopicId;
      if (topicId) params.topic = topicId;
      if (trainerId) params.trainer = trainerId;

      const qs = await aptitudeService.getQuestions(params);
      setQuestions(qs);

      const bMap: Record<number, boolean> = {};
      qs.forEach(q => { bMap[q.id] = !!(q as any).is_bookmarked; });
      setBookmarked(bMap);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setMarkedForReview({});
      setVisitedSet(new Set([qs[0]?.id ?? -1]));
    } catch (e) {
      console.error('Failed to load questions:', e);
    } finally {
      setLoading(false);
    }
  }, [subtopicId, topicId, trainerId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  /* ── Filtered Questions ── */
  const filteredQs = questions.filter(q =>
    difficultyFilter === 'all' || q.difficulty.toLowerCase() === difficultyFilter
  );
  const total = filteredQs.length;
  const currentQ = filteredQs[currentIndex];

  const getStatus = (idx: number): QStatus => {
    const id = filteredQs[idx]?.id;
    if (!visitedSet.has(id)) return 'not-visited';
    if (markedForReview[id]) return 'marked';
    if (selectedAnswers[id]) return 'answered';
    return 'not-answered';
  };

  const answered = filteredQs.filter(q => !!selectedAnswers[q.id]).length;
  const notAnswered = filteredQs.filter(q => visitedSet.has(q.id) && !selectedAnswers[q.id] && !markedForReview[q.id]).length;
  const reviewCount = filteredQs.filter(q => !!markedForReview[q.id]).length;
  const notVisited = filteredQs.filter(q => !visitedSet.has(q.id)).length;

  /* ── Handlers ── */
  const goTo = (idx: number) => {
    if (idx < 0 || idx >= total) return;
    setCurrentIndex(idx);
    setVisitedSet(prev => new Set([...prev, filteredQs[idx].id]));
  };

  const handleSelect = (qId: number, key: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: key }));
  };

  const toggleBookmark = async (qId: number) => {
    try {
      const res = await aptitudeService.bookmarkQuestion(qId);
      setBookmarked(prev => ({ ...prev, [qId]: res.bookmarked }));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleReview = (qId: number) => {
    setMarkedForReview(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleReport = (qId: number) => {
    setReportedQuestions(prev => ({ ...prev, [qId]: true }));
    setShowReportDialog(true);
    setTimeout(() => setShowReportDialog(false), 3000);
  };

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 size={32} className="animate-spin text-[#6332F6]" />
        <p className="text-sm font-semibold text-slate-500">Loading Practice Questions...</p>
      </div>
    );
  }

  /* ── Empty State ── */
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <HelpCircle size={40} className="text-slate-300" />
        <h3 className="text-base font-bold text-slate-700">No questions available</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          There are no questions matching the current difficulty filter.
        </p>
        <button
          onClick={() => setDifficultyFilter('all')}
          className="px-4 py-2 bg-[#6332F6] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#5225D4] transition-colors"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  // Format breadcrumbs
  const categoryName = currentQ?.category_name || 'Aptitude';
  const topicName = currentQ?.topic_name || 'Percentages';
  const subTopicName = currentQ?.sub_topic_name || 'Percentage Basics';

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 md:-mt-8 min-h-screen bg-[#F8FAFC] dark:bg-[#07080d] font-sans pb-12 select-none">

      {/* ──────────────────────────────────────────────────────────
          1. TOP PURPLE GRADIENT BREADCRUMB / STATUS BAR
          ────────────────────────────────────────────────────────── */}
      <div className="w-full bg-gradient-to-r from-[#180C66] via-[#3B1CC7] to-[#5527E6] text-white px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Left: Back & Breadcrumb navigation */}
          <div className="flex items-center gap-3 text-xs font-medium flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-white/90 hover:text-white font-semibold transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2 text-white/80">
              <Link to="/dashboard/aptitude" className="hover:text-white transition-colors">
                Aptitude
              </Link>
              <ChevronRight size={13} className="text-white/50 shrink-0" />
              <span className="text-white/90">{topicName}</span>
              <ChevronRight size={13} className="text-white/50 shrink-0" />
              <span className="text-white font-bold">{subTopicName}</span>
            </div>
          </div>

          {/* Right: Streak & Score Stats (Only visible when user is logged in) */}
          {user && (
            <div className="flex items-center gap-5 shrink-0 self-end sm:self-auto">
              {/* Streak */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Flame size={18} className="text-amber-400 fill-amber-400 animate-pulse" />
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] uppercase font-semibold text-white/70 tracking-wider">Streak</p>
                  <p className="text-sm font-black text-white">{userGamification.streak} days</p>
                </div>
              </div>

              <div className="h-7 w-px bg-white/20" />

              {/* Score */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Zap size={18} className="text-amber-300 fill-amber-300" />
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] uppercase font-semibold text-white/70 tracking-wider">Score</p>
                  <p className="text-sm font-black text-white">{userGamification.score}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA (2-COLUMN GRID)
          ────────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ════════════════════════════════════════════════════════
              LEFT COLUMN: QUESTION, OPTIONS & CONTROLS
              ════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-4">

            {/* Question Sub-Header / Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Question {currentIndex + 1} of {total}
                </span>

                {/* Difficulty Badge */}
                <span
                  className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-md tracking-wider ${
                    currentQ.difficulty.toLowerCase() === 'easy'
                      ? 'bg-[#E8F8F0] text-[#10B981] dark:bg-emerald-950/40 dark:text-emerald-400'
                      : currentQ.difficulty.toLowerCase() === 'medium'
                      ? 'bg-[#FEF3C7] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400'
                      : 'bg-[#FEE2E2] text-[#EF4444] dark:bg-red-950/40 dark:text-red-400'
                  }`}
                >
                  {currentQ.difficulty}
                </span>

                {/* Marks */}
                <span className="text-xs font-semibold text-slate-400">
                  Marks: {currentQ.marks || 1}
                </span>

                {/* Mark for Review Button */}
                <button
                  onClick={() => toggleReview(currentQ.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#6332F6] hover:text-[#4F22D6] transition-colors cursor-pointer ml-1"
                >
                  <Bookmark
                    size={15}
                    className={markedForReview[currentQ.id] ? 'fill-[#6332F6] text-[#6332F6]' : 'text-[#6332F6]'}
                  />
                  <span>{markedForReview[currentQ.id] ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>
              </div>

              {/* Report Button */}
              <button
                onClick={() => handleReport(currentQ.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <AlertCircle size={14} />
                <span>{reportedQuestions[currentQ.id] ? 'Reported' : 'Report'}</span>
              </button>
            </div>

            {/* Report Toast Notification */}
            {showReportDialog && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                <span>Thank you. Your report has been submitted to the content team for review.</span>
              </div>
            )}

            {/* Question Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-[0_2px_16px_rgba(0,0,0,0.03)] relative overflow-hidden">
              {/* Left purple gradient accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#6332F6] to-[#8B5CF6] rounded-l-2xl" />

              <div className="flex items-start gap-4">
                <span className="text-lg font-black text-[#6332F6] shrink-0 leading-none pt-1">
                  Q.
                </span>
                <div className="flex-1 space-y-2">
                  <p className="text-base sm:text-[17px] text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                    {currentQ.statement}
                  </p>

                  {/* Question Image if present */}
                  {currentQ.image_url && (
                    <div className="mt-4 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 max-w-lg">
                      <img
                        src={currentQ.image_url}
                        alt="Question figure"
                        className="max-h-72 object-contain mx-auto p-4"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Answer Options Stack */}
            <div className="space-y-3.5 pt-1">
              {currentQ.options?.map(opt => {
                const isSelected = selectedAnswers[currentQ.id] === opt.key;

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelect(currentQ.id, opt.key)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-[#F5F3FF] dark:bg-purple-950/30 border-2 border-[#7C3AED] shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-purple-300 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 shadow-[0_1px_4px_rgba(0,0,0,0.02)]'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Option Letter Circle */}
                      <span
                        className={`w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'bg-[#6D28D9] text-white shadow-sm'
                            : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:border-purple-300'
                        }`}
                      >
                        {opt.key}
                      </span>

                      {/* Option Text */}
                      <span
                        className={`text-sm sm:text-base leading-relaxed ${
                          isSelected
                            ? 'text-slate-950 dark:text-white font-bold'
                            : 'text-slate-700 dark:text-slate-300 font-medium'
                        }`}
                      >
                        {opt.text}
                      </span>
                    </div>

                    {/* Right Checkmark Icon (Visible when Selected) */}
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#6D28D9] text-white flex items-center justify-center shrink-0 shadow-sm ml-3">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Solution & Explanation Card (Optional after answering) */}
            {selectedAnswers[currentQ.id] && currentQ.explanation && (
              <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 rounded-2xl p-6 shadow-sm space-y-3 mt-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                    <Lightbulb size={14} /> Explanation & Solution
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Correct Answer: <strong className="text-emerald-600">Option {currentQ.correct_answer?.join(', ')}</strong>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-normal">
                  {currentQ.explanation}
                </p>

                {currentQ.shortcut_trick && (
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl space-y-1">
                    <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                      ⚡ Shortcut Trick
                    </p>
                    <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                      {currentQ.shortcut_trick}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Navigation Bar */}
            <div className="flex items-center justify-between pt-6 pb-2">
              {/* Previous Button */}
              <button
                type="button"
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              {/* Dot Pagination Indicator */}
              <div className="flex items-center gap-2">
                {filteredQs.slice(0, Math.min(total, 12)).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goTo(idx)}
                    className={`transition-all ${
                      idx === currentIndex
                        ? 'w-2.5 h-2.5 rounded-full bg-[#6D28D9] scale-110'
                        : selectedAnswers[filteredQs[idx]?.id]
                        ? 'w-2.5 h-2.5 rounded-full bg-purple-300 dark:bg-purple-800'
                        : 'w-2.5 h-2.5 rounded-full border border-purple-300 dark:border-purple-700 bg-transparent'
                    }`}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => goTo(currentIndex + 1)}
                disabled={currentIndex === total - 1}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>

          </div>

          {/* ════════════════════════════════════════════════════════
              RIGHT COLUMN: STICKY "YOUR PROGRESS" PANEL
              ════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 sticky top-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-6">

              {/* Header */}
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                YOUR PROGRESS
              </h3>

              {/* 3 Metric Columns: Answered | Not Answered | Review */}
              <div className="grid grid-cols-3 gap-2">
                {/* Answered */}
                <div className="text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mx-auto mb-2 shadow-xs">
                    <Check size={16} strokeWidth={2.5} />
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {answered}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">
                    Answered
                  </p>
                </div>

                {/* Not Answered */}
                <div className="text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center mx-auto mb-2 shadow-xs">
                    <X size={16} strokeWidth={2.5} />
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {notAnswered}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">
                    Not Answered
                  </p>
                </div>

                {/* Review */}
                <div className="text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mx-auto mb-2 shadow-xs">
                    <Eye size={16} strokeWidth={2.5} />
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {reviewCount}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">
                    Review
                  </p>
                </div>
              </div>

              {/* Progress Bar Section */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
                    PROGRESS BAR
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {answered} / {total}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6366F1] to-[#7C3AED] rounded-full transition-all duration-300"
                    style={{ width: `${total > 0 ? (answered / total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  DIFFICULTY FILTER
                </h4>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['all', 'easy', 'medium', 'hard'] as const).map(diff => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => {
                        setDifficultyFilter(diff);
                        setCurrentIndex(0);
                      }}
                      className={`text-xs font-bold py-1.5 rounded-full capitalize transition-all cursor-pointer text-center ${
                        difficultyFilter === diff
                          ? 'bg-[#5B21B6] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Navigator Grid */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  QUESTION NAVIGATOR
                </h4>

                <div className="flex flex-wrap gap-2.5">
                  {filteredQs.map((item, idx) => {
                    const isCurrent = idx === currentIndex;
                    const status = getStatus(idx);

                    let buttonClass = 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-300';

                    if (isCurrent) {
                      buttonClass = 'bg-[#5B21B6] text-white font-black ring-4 ring-purple-100 dark:ring-purple-950/60 shadow-sm border-transparent';
                    } else if (status === 'answered') {
                      buttonClass = 'bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/30 font-bold';
                    } else if (status === 'marked') {
                      buttonClass = 'bg-[#EDE9FE] text-[#7C3AED] border border-[#7C3AED]/30 font-bold';
                    } else if (status === 'not-answered') {
                      buttonClass = 'bg-[#FEE2E2] text-[#EF4444] border border-[#EF4444]/30 font-bold';
                    }

                    return (
                      <button
                        key={item.id || idx}
                        type="button"
                        onClick={() => goTo(idx)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all cursor-pointer shrink-0 ${buttonClass}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Legend */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] shrink-0" />
                  <span>Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1] dark:bg-slate-700 shrink-0" />
                  <span>Not Visited</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AptitudeMCQPracticePage;

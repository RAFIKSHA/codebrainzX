import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Bookmark, ChevronLeft, ChevronRight, CheckCircle2,
  XCircle, Lightbulb, HelpCircle, Loader2, Flag, ArrowLeft
} from 'lucide-react';
import aptitudeService from '../../services/aptitude';
import type { AptitudeQuestion } from '../../services/aptitude';

/* ────────────────────────────────────────────────────────────
   Status constants – mirrors TCS NQT panel colour semantics
   ──────────────────────────────────────────────────────────── */
type QStatus = 'not-visited' | 'answered' | 'not-answered' | 'marked';

const AptitudeMCQPracticePage: React.FC = () => {
  const { subtopicId } = useParams<{ subtopicId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const topicId = new URLSearchParams(location.search).get('topic');

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  // keyed by question id
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [visitedSet, setVisitedSet] = useState<Set<number>>(new Set());

  /* ── fetch ── */
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { practice: 'true' };
      if (subtopicId === 'all' && topicId) params.topic = topicId;
      else params.sub_topic = subtopicId;

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
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [subtopicId, topicId]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  /* ── derived ── */
  const filteredQs = questions.filter(q =>
    difficultyFilter === 'all' || q.difficulty.toLowerCase() === difficultyFilter
  );
  const total = filteredQs.length;
  const q = filteredQs[currentIndex];

  const getStatus = (idx: number): QStatus => {
    const id = filteredQs[idx]?.id;
    if (!visitedSet.has(id)) return 'not-visited';
    if (markedForReview[id]) return 'marked';
    if (selectedAnswers[id]) return 'answered';
    return 'not-answered';
  };

  const answered = filteredQs.filter(q => !!selectedAnswers[q.id]).length;
  const notAnswered = filteredQs.filter(q => visitedSet.has(q.id) && !selectedAnswers[q.id] && !markedForReview[q.id]).length;
  const reviewCount = Object.keys(markedForReview).filter(k => markedForReview[+k]).length;
  const notVisited = filteredQs.filter(q => !visitedSet.has(q.id)).length;

  /* ── handlers ── */
  const goTo = (idx: number) => {
    if (idx < 0 || idx >= total) return;
    setCurrentIndex(idx);
    setVisitedSet(prev => new Set([...prev, filteredQs[idx].id]));
  };

  const handleSelect = (qId: number, key: string) => {
    if (selectedAnswers[qId]) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: key }));
  };

  const toggleBookmark = async (qId: number) => {
    try {
      const res = await aptitudeService.bookmarkQuestion(qId);
      setBookmarked(prev => ({ ...prev, [qId]: res.bookmarked }));
    } catch (e) { console.error(e); }
  };

  const toggleReview = (qId: number) => {
    setMarkedForReview(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  /* ── status badge helpers ── */
  const statusDot: Record<QStatus, string> = {
    'not-visited': 'bg-slate-200 text-slate-600 border-slate-300',
    'answered': 'bg-emerald-500 text-white border-emerald-500',
    'not-answered': 'bg-red-500 text-white border-red-500',
    'marked': 'bg-purple-500 text-white border-purple-500',
  };
  const diffColor = (d: string) =>
    d === 'easy' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
    d === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
    'bg-red-100 text-red-700 border-red-200';

  /* ── loading ── */
  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-slate-950 z-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="animate-spin text-blue-600" />
        <p className="text-sm text-slate-500">Loading questions...</p>
      </div>
    </div>
  );

  if (total === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <HelpCircle size={36} className="text-slate-300" />
      <p className="text-sm text-slate-500">No questions found for this filter.</p>
      <button onClick={() => setDifficultyFilter('all')} className="text-xs font-bold text-blue-600 underline">Clear filter</button>
    </div>
  );

  /* ══════════════════════════════════════════════════════════
     RENDER — Full-screen TCS NQT style layout
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col min-h-screen bg-[#F1F3F5] dark:bg-slate-950 font-sans select-none">

      {/* ── TOP HEADER BAR ── */}
      <header className="bg-[#003087] dark:bg-slate-900 text-white h-12 flex items-center px-4 gap-4 shrink-0 shadow-md z-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="h-5 w-px bg-white/20" />

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-blue-100 truncate">
            {q?.topic_name || 'Aptitude Practice'}
            {q?.sub_topic_name && <span className="text-white/60"> › {q.sub_topic_name}</span>}
          </span>
        </div>

        {/* Difficulty filter pills */}
        <div className="flex items-center gap-1">
          {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
            <button
              key={d}
              onClick={() => { setDifficultyFilter(d); setCurrentIndex(0); }}
              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                difficultyFilter === d
                  ? 'bg-white text-[#003087]'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </header>

      {/* ── MAIN BODY ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ──── LEFT: QUESTION PANEL ──── */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">

          {/* Question Meta Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                Question <span className="text-slate-900 dark:text-white">{currentIndex + 1}</span> of {total}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${diffColor(q.difficulty)}`}>
                {q.difficulty}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded">
                Marks: {q.marks}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Mark for Review */}
              <button
                onClick={() => toggleReview(q.id)}
                title="Mark for Review"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  markedForReview[q.id]
                    ? 'bg-purple-50 border-purple-300 text-purple-700'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-purple-300'
                }`}
              >
                <Flag size={11} /> Mark for Review
              </button>

              {/* Bookmark */}
              <button
                onClick={() => toggleBookmark(q.id)}
                title="Bookmark"
                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                  bookmarked[q.id]
                    ? 'bg-amber-50 border-amber-300 text-amber-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-amber-300'
                }`}
              >
                <Bookmark size={14} fill={bookmarked[q.id] ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Question Statement */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-medium whitespace-pre-wrap">
              {q.statement}
            </p>
            {q.image_url && (
              <div className="mt-4 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950">
                <img src={q.image_url} alt="Question" className="max-h-64 object-contain mx-auto p-3" />
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-2.5">
            {q.options?.map(opt => {
              const isSelected = selectedAnswers[q.id] === opt.key;
              const isCorrect = q.correct_answer?.includes(opt.key);
              const hasAnswered = !!selectedAnswers[q.id];

              let style = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-slate-800 cursor-pointer';
              let labelStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';

              if (hasAnswered) {
                if (isCorrect) {
                  style = 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-800 dark:text-emerald-300';
                  labelStyle = 'bg-emerald-500 text-white border-emerald-500';
                } else if (isSelected) {
                  style = 'bg-red-50 dark:bg-red-950/30 border-red-300 text-red-800 dark:text-red-300';
                  labelStyle = 'bg-red-500 text-white border-red-500';
                } else {
                  style = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={opt.key}
                  onClick={() => handleSelect(q.id, opt.key)}
                  disabled={hasAnswered}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl border text-sm text-left transition-all ${style} ${!hasAnswered ? '' : 'cursor-default'}`}
                >
                  <span className={`w-7 h-7 shrink-0 rounded-lg border flex items-center justify-center text-xs font-black transition-all ${labelStyle}`}>
                    {hasAnswered && isCorrect ? <CheckCircle2 size={14} /> :
                     hasAnswered && isSelected ? <XCircle size={14} /> :
                     opt.key}
                  </span>
                  <span className="leading-relaxed">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Solution Panel — appears after answering */}
          {selectedAnswers[q.id] && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide pb-2 border-b border-slate-100 dark:border-slate-800">
                <CheckCircle2 size={14} className="text-emerald-500" /> Solution
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                Correct Answer: <span className="font-black">Option {q.correct_answer?.join(', ')}</span>
              </div>

              {q.explanation && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Explanation</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{q.explanation}</p>
                </div>
              )}

              {q.shortcut_trick && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3.5 space-y-1">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                    <Lightbulb size={11} /> Shortcut / Trick
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed whitespace-pre-wrap">{q.shortcut_trick}</p>
                </div>
              )}

              {q.company_tags && q.company_tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {q.company_tags.map(t => (
                    <span key={t} className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{t}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom Nav Buttons */}
          <div className="flex items-center justify-between pt-2 pb-6">
            <button
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <span className="text-xs text-slate-400 font-medium">{currentIndex + 1} / {total}</span>

            <button
              onClick={() => goTo(currentIndex + 1)}
              disabled={currentIndex === total - 1}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#003087] hover:bg-[#002070] text-white text-xs font-bold rounded-lg disabled:opacity-40 transition-all cursor-pointer shadow-sm"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </main>

        {/* ──── RIGHT: QUESTION NAVIGATOR PANEL ──── */}
        <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shrink-0 overflow-y-auto">

          {/* Summary Stats */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Question Summary</p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Answered: {answered}
              </div>
              <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Not Answered: {notAnswered}
              </div>
              <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                <span className="w-3 h-3 rounded-sm bg-purple-500 inline-block" /> Review: {reviewCount}
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700 inline-block" /> Not Visited: {notVisited}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
              <span>Progress</span>
              <span>{answered}/{total}</span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: total > 0 ? `${(answered / total) * 100}%` : '0%' }}
              />
            </div>
          </div>

          {/* Question Grid */}
          <div className="flex-1 p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Question Navigator</p>
            <div className="grid grid-cols-5 gap-1.5">
              {filteredQs.map((_, idx) => {
                const status = getStatus(idx);
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => goTo(idx)}
                    title={`Question ${idx + 1}`}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all cursor-pointer shadow-sm ring-offset-1 ${
                      isCurrent
                        ? 'ring-2 ring-[#003087] ring-offset-2 bg-[#003087] border-[#003087] text-white'
                        : statusDot[status]
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            {[
              { color: 'bg-emerald-500', label: 'Answered' },
              { color: 'bg-red-500', label: 'Not Answered' },
              { color: 'bg-purple-500', label: 'Marked for Review' },
              { color: 'bg-slate-200 dark:bg-slate-700', label: 'Not Visited' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                <span className={`w-3 h-3 rounded-sm ${l.color} shrink-0`} />
                {l.label}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATOR ── */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="flex flex-wrap gap-1.5 justify-center">
          {filteredQs.map((_, idx) => {
            const status = getStatus(idx);
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold border transition-all cursor-pointer ${
                  isCurrent ? 'ring-2 ring-blue-600 ring-offset-1 bg-[#003087] border-[#003087] text-white' : statusDot[status]
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default AptitudeMCQPracticePage;

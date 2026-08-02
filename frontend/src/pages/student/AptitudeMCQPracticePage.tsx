import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bookmark, ChevronLeft, ChevronRight, HelpCircle, Lightbulb, 
  CheckCircle2, XCircle, ArrowLeft, Loader2, Sparkles, Filter 
} from 'lucide-react';
import aptitudeService from '../../services/aptitude';
import type { AptitudeQuestion } from '../../services/aptitude';

const AptitudeMCQPracticePage: React.FC = () => {
  const { subtopicId } = useParams<{ subtopicId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const topicId = queryParams.get('topic');

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // MCQ state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [bookmarkedState, setBookmarkedState] = useState<Record<number, boolean>>({});
  const [_showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { practice: 'true' };
      if (subtopicId === 'all' && topicId) {
        params.topic = topicId;
      } else {
        params.sub_topic = subtopicId;
      }

      const qs = await aptitudeService.getQuestions(params);
      setQuestions(qs);
      
      // Initialize bookmarked state map
      const bMap: Record<number, boolean> = {};
      qs.forEach(q => {
        bMap[q.id] = !!(q as any).is_bookmarked;
      });
      setBookmarkedState(bMap);
      
      setCurrentIndex(0);
      setSelectedAnswers({});
      setShowExplanation({});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [subtopicId, topicId]);

  // Apply Client side difficulty filters
  const filteredQuestions = questions.filter(q => {
    if (difficultyFilter === 'all') return true;
    return q.difficulty.toLowerCase() === difficultyFilter;
  });

  const activeQuestion = filteredQuestions[currentIndex];

  const handleSelectOption = (qId: number, key: string) => {
    if (selectedAnswers[qId]) return; // Answer already lock-evaluated
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: key
    }));
    setShowExplanation(prev => ({
      ...prev,
      [qId]: true
    }));
  };

  const handleToggleBookmark = async (qId: number) => {
    try {
      const res = await aptitudeService.bookmarkQuestion(qId);
      setBookmarkedState(prev => ({
        ...prev,
        [qId]: res.bookmarked
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Progress metrics calculation
  const totalCount = filteredQuestions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="animate-spin text-[#2563EB]" size={32} />
        <p className="text-slate-500 text-xs font-semibold">Configuring dynamic practice session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] space-y-8 animate-fade-in max-w-3xl mx-auto px-4 pb-16 font-sans">
      
      {/* 1. Header Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5 pt-6">
        <div className="space-y-1">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft size={14} />
            Back to Topics
          </button>
          <h2 className="text-lg font-bold text-[#111827]">
            {activeQuestion ? activeQuestion.topic_name : 'Practice Engine'}
            {activeQuestion?.sub_topic_name && <span className="text-slate-450 font-normal text-sm"> › {activeQuestion.sub_topic_name}</span>}
          </h2>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1 bg-slate-50 border border-[#E5E7EB] p-1 rounded-lg">
          <Filter size={12} className="text-slate-400 ml-2 mr-1" />
          {['all', 'easy', 'medium', 'hard'].map((d) => (
            <button
              key={d}
              onClick={() => {
                setDifficultyFilter(d as any);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-bold transition-all cursor-pointer ${
                difficultyFilter === d 
                  ? 'bg-[#2563EB] text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#E5E7EB] bg-white rounded-xl space-y-3 shadow-sm">
          <HelpCircle className="mx-auto text-slate-400" size={40} />
          <p className="text-slate-500 text-sm font-bold">No practice questions found</p>
          <p className="text-slate-400 text-xs">There are no questions matching this subtopic or difficulty filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* 2. Progress Tracker Bar */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-2 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
              <span>MCQ PRACTICE COMPLETED</span>
              <span className="text-[#2563EB] font-bold">{answeredCount} / {totalCount} Solved ({Math.round(progressPercent)}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-[#E5E7EB]">
              <div 
                className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* 3. Question Practice Body Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 space-y-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] relative overflow-hidden">
            
            {/* Question Card Meta */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 border border-blue-100 text-[#2563EB]">
                  Question {currentIndex + 1} of {totalCount}
                </span>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  activeQuestion.difficulty === 'easy' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                  activeQuestion.difficulty === 'medium' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                  'bg-red-50 border-red-100 text-red-700'
                }`}>
                  {activeQuestion.difficulty}
                </span>
                <span className="text-slate-400 text-[10px] font-semibold">Marks: {activeQuestion.marks}</span>
              </div>
              
              <button 
                onClick={() => handleToggleBookmark(activeQuestion.id)}
                className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                  bookmarkedState[activeQuestion.id]
                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                    : 'bg-white border-[#E5E7EB] hover:border-slate-350 text-slate-400'
                }`}
              >
                <Bookmark size={15} fill={bookmarkedState[activeQuestion.id] ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Question Statement */}
            <div className="space-y-4">
              <div className="text-sm font-semibold text-[#111827] leading-relaxed whitespace-pre-wrap">
                {activeQuestion.statement}
              </div>
              {activeQuestion.image_url && (
                <div className="my-4 max-w-full rounded-xl overflow-hidden border border-[#E5E7EB] bg-slate-50">
                  <img src={activeQuestion.image_url} alt="Question diagram" className="max-h-72 object-contain mx-auto p-4" />
                </div>
              )}
            </div>

            {/* MCQ Options Choices List */}
            <div className="grid grid-cols-1 gap-3.5">
              {activeQuestion.options?.map((option) => {
                const isSelected = selectedAnswers[activeQuestion.id] === option.key;
                const isCorrectOption = activeQuestion.correct_answer?.includes(option.key);
                const hasAnswered = !!selectedAnswers[activeQuestion.id];
                
                let optionStyle = 'bg-white border-[#E5E7EB] hover:border-slate-350 text-slate-700 hover:bg-slate-50';
                
                if (hasAnswered) {
                  if (isCorrectOption) {
                    optionStyle = 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold';
                  } else if (isSelected) {
                    optionStyle = 'bg-red-50 border-red-200 text-red-700 font-bold';
                  } else {
                    optionStyle = 'bg-white border-[#E5E7EB] text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={option.key}
                    onClick={() => handleSelectOption(activeQuestion.id, option.key)}
                    disabled={hasAnswered}
                    className={`group flex items-center gap-4 p-4 rounded-xl border text-left text-xs transition-colors relative overflow-hidden ${
                      !hasAnswered ? 'cursor-pointer' : ''
                    } ${optionStyle}`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-colors shrink-0 border ${
                      hasAnswered && isCorrectOption 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : hasAnswered && isSelected 
                          ? 'bg-red-500 border-red-500 text-white'
                          : 'bg-slate-50 border-[#E5E7EB] group-hover:border-blue-300 text-slate-500 group-hover:text-[#2563EB]'
                    }`}>
                      {hasAnswered && isCorrectOption ? <CheckCircle2 size={13} /> :
                       hasAnswered && isSelected ? <XCircle size={13} /> :
                       option.key}
                    </span>
                    <span className="flex-1 leading-relaxed">{option.text}</span>
                  </button>
                );
              })}
            </div>

            {/* 4. collapsible detailed explanation/solution */}
            {selectedAnswers[activeQuestion.id] && (
              <div className="pt-6 border-t border-[#E5E7EB] space-y-5 animate-slide-up">
                
                {/* Reveal option banner */}
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Sparkles className="text-amber-500" size={16} />
                  <span>SOLUTIONS PANEL</span>
                </div>

                <div className="bg-slate-50 border border-[#E5E7EB] p-5 rounded-xl space-y-4">
                  {/* Correct Key */}
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                    <CheckCircle2 size={14} />
                    <span>Correct Option: Option {activeQuestion.correct_answer?.join(', ')}</span>
                  </div>

                  {/* Explanation */}
                  {activeQuestion.explanation && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Detailed Step-by-Step Explanation</span>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {activeQuestion.explanation}
                      </p>
                    </div>
                  )}

                  {/* Shortcut Trick */}
                  {activeQuestion.shortcut_trick && (
                    <div className="pt-2 border-t border-[#E5E7EB] space-y-1">
                      <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Lightbulb size={12} /> Shortcut / Formula Trick
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {activeQuestion.shortcut_trick}
                      </p>
                    </div>
                  )}

                  {/* References & Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E5E7EB] text-[10px] text-slate-400">
                    {activeQuestion.company_tags && activeQuestion.company_tags.length > 0 && (
                      <div>
                        <strong className="text-slate-500 font-bold uppercase block tracking-wider mb-1">Company Tags</strong>
                        <div className="flex flex-wrap gap-1.5">
                          {activeQuestion.company_tags.map(t => <span key={t} className="px-2 py-0.5 rounded bg-white border border-[#E5E7EB] font-semibold">{t}</span>)}
                        </div>
                      </div>
                    )}
                    {activeQuestion.source && (
                      <div>
                        <strong className="text-slate-500 font-bold uppercase block tracking-wider mb-1">Source Reference</strong>
                        <span className="font-semibold text-slate-600">{activeQuestion.source}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* 5. Navigation Buttons Footer */}
            <div className="flex justify-between items-center border-t border-[#E5E7EB] pt-5 mt-4">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 px-4 py-2 border border-[#E5E7EB] hover:bg-slate-50 disabled:opacity-40 text-slate-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              
              <button
                onClick={() => setCurrentIndex(prev => Math.min(totalCount - 1, prev + 1))}
                disabled={currentIndex === totalCount - 1}
                className="flex items-center gap-1 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>

          </div>

          {/* 6. Question numbers selector grid */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-3 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Question Navigator Grid</span>
            <div className="flex flex-wrap gap-2">
              {filteredQuestions.map((_, idx) => {
                const isCurrent = currentIndex === idx;
                const isSolved = !!selectedAnswers[filteredQuestions[idx].id];
                
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors cursor-pointer ${
                      isCurrent 
                        ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-sm' 
                        : isSolved 
                          ? 'bg-emerald-50 border-emerald-250 text-emerald-700' 
                          : 'bg-white border-[#E5E7EB] text-slate-400 hover:text-slate-700 hover:border-slate-350'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AptitudeMCQPracticePage;

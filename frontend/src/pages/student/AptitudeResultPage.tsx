import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, CheckCircle, XCircle, Clock, 
  HelpCircle, ChevronDown, ChevronUp, Star, Lightbulb, BookOpen, ArrowLeft, RefreshCw
} from 'lucide-react';
import aptitudeService from '../../services/aptitude';

interface SectionPerf {
  section_id: number;
  section_name: string;
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  time_spent: number;
  accuracy: number;
}

interface TopicPerf {
  topic_id: number;
  topic_name: string;
  total: number;
  correct: number;
  accuracy: number;
}

interface ReviewQuestion {
  id: number;
  title: string;
  statement: string;
  difficulty: string;
  question_type: string;
  options: Array<{ key: string; text: string }>;
  correct_answer: string[];
  explanation: string;
  shortcut_trick: string;
  hint: string;
  marks: number;
  negative_marks: number;
  selected_options: string[];
  is_correct: boolean;
  time_spent: number;
}

interface ResultData {
  attempt: {
    id: number;
    test_title: string;
    test_type: string;
    started_at: string;
    completed_at: string;
    score: number;
    max_score: number;
    accuracy: number;
    rank: number;
    percentile: number;
    attempted_questions: number;
    correct_questions: number;
    wrong_questions: number;
    skipped_questions: number;
    time_spent: number;
  };
  sections_performance: SectionPerf[];
  topics_performance: TopicPerf[];
  difficulty_performance: Record<string, { correct: number; total: number }>;
  weak_areas: string[];
  strong_areas: string[];
  review_questions: ReviewQuestion[];
}

const AptitudeResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ResultData | null>(null);
  const [expandedQId, setExpandedQId] = useState<number | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await aptitudeService.getTestResults(Number(attemptId));
        setData(res as any);
      } catch (err) {
        console.error(err);
        alert('Failed to retrieve test performance metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-slate-500">
        <RefreshCw className="animate-spin text-[#2563EB]" size={32} />
        <p className="text-slate-550 text-sm font-semibold">Running diagnostic performance analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-slate-500 font-medium">
        No result data could be found for attempt #{attemptId}
      </div>
    );
  }

  const { attempt, sections_performance, topics_performance, weak_areas, strong_areas, review_questions } = data;

  // Formatter helper for minutes
  const formatTimeSpent = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] space-y-8 animate-fade-in max-w-5xl mx-auto px-4 pb-16 font-sans">
      {/* Back Header */}
      <div className="flex items-center justify-between pt-6">
        <button 
          onClick={() => navigate('/dashboard/aptitude')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </button>
        <span className="text-[10px] font-mono text-slate-400">attempt / report / {attempt.id}</span>
      </div>

      {/* Hero Performance Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex flex-col md:flex-row justify-between items-center gap-8">
        
        <div className="space-y-4 text-center md:text-left flex-1 w-full">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg">
              <Trophy size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Assessment Complete</span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mt-0.5">{attempt.test_title}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 border border-[#E5E7EB] p-4 rounded-xl text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Score</span>
              <span className="text-xl font-bold text-[#111827]">{attempt.score} <span className="text-xs text-slate-400 font-medium">/ {attempt.max_score}</span></span>
            </div>
            <div className="border-l border-[#E5E7EB]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Accuracy</span>
              <span className="text-xl font-bold text-emerald-600">{attempt.accuracy.toFixed(0)}%</span>
            </div>
            <div className="border-l border-[#E5E7EB]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Percentile</span>
              <span className="text-xl font-bold text-indigo-650">{attempt.percentile.toFixed(1)}%</span>
            </div>
            <div className="border-l border-[#E5E7EB]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Rank</span>
              <span className="text-xl font-bold text-amber-600">#{attempt.rank}</span>
            </div>
          </div>
        </div>

        {/* Accuracy Ring widget right */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0 bg-slate-50 rounded-full border border-[#E5E7EB] shadow-sm">
          <svg className="w-28 h-28 transform -rotate-90">
            <circle cx="56" cy="56" r="48" stroke="currentColor" className="text-slate-100" strokeWidth="8" fill="transparent" />
            <circle cx="56" cy="56" r="48" stroke="currentColor" className="text-emerald-500" strokeWidth="8" fill="transparent" 
              strokeDasharray={2 * Math.PI * 48}
              strokeDashoffset={2 * Math.PI * 48 * (1 - attempt.accuracy / 100)}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-[#111827]">{attempt.accuracy.toFixed(0)}%</span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Accuracy</span>
          </div>
        </div>
      </div>

      {/* Diagnostics metrics dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left column: attempt numbers breakdown, strengths/weaknesses */}
        <div className="space-y-8">
          
          {/* Attempt Breakdown */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Response Split</h3>
            
            <div className="space-y-3 font-semibold text-xs text-slate-600">
              <div className="flex items-center justify-between p-2 bg-slate-50 border border-[#E5E7EB] rounded-lg">
                <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-600" /> Correct Answers</span>
                <span className="font-bold text-[#111827]">{attempt.correct_questions}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 border border-[#E5E7EB] rounded-lg">
                <span className="flex items-center gap-1.5"><XCircle size={14} className="text-red-500" /> Incorrect Answers</span>
                <span className="font-bold text-[#111827]">{attempt.wrong_questions}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 border border-[#E5E7EB] rounded-lg">
                <span className="flex items-center gap-1.5"><HelpCircle size={14} className="text-slate-400" /> Skipped Questions</span>
                <span className="font-bold text-[#111827]">{attempt.skipped_questions}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 border border-[#E5E7EB] rounded-lg">
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#2563EB]" /> Total Time Taken</span>
                <span className="font-bold text-[#111827]">{formatTimeSpent(attempt.time_spent)}</span>
              </div>
            </div>
          </div>

          {/* Strong / Weak Topic summary list */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Mastery Analysis</h3>
            
            <div className="space-y-4">
              {/* Strong Areas */}
              <div className="space-y-2">
                <span className="text-[9px] text-emerald-600 uppercase tracking-wider font-bold block">Strong Topics (&gt;= 75%)</span>
                {strong_areas.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No topics qualified yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {strong_areas.map((sa) => (
                      <span key={sa} className="px-2.5 py-1 bg-emerald-50 border border-emerald-250 text-emerald-700 text-[10px] font-semibold rounded-md">{sa}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Weak Areas */}
              <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
                <span className="text-[9px] text-red-650 uppercase tracking-wider font-bold block">Weak Topics (&lt; 50%)</span>
                {weak_areas.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No topics qualified yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {weak_areas.map((wa) => (
                      <span key={wa} className="px-2.5 py-1 bg-red-50 border border-red-150 text-red-600 text-[10px] font-semibold rounded-md">{wa}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right columns: tabular sectional stats & topic breakdown */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Section table */}
          {sections_performance.length > 0 && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Section-wise Diagnostics</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5">Section</th>
                      <th className="py-2.5 text-center">Correct / Qs</th>
                      <th className="py-2.5 text-center">Accuracy</th>
                      <th className="py-2.5 text-center">Time Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections_performance.map((sec) => (
                      <tr key={sec.section_id} className="border-b border-slate-100 font-semibold text-slate-600">
                        <td className="py-3 font-bold text-slate-800">{sec.section_name}</td>
                        <td className="py-3 text-center">{sec.correct} <span className="text-slate-400">/ {sec.total}</span></td>
                        <td className="py-3 text-center text-emerald-600 font-bold">{sec.accuracy.toFixed(0)}%</td>
                        <td className="py-3 text-center text-slate-500">{formatTimeSpent(sec.time_spent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Topic performance List */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Topic-wise Metrics</h3>
            <div className="space-y-4">
              {topics_performance.map((topic) => (
                <div key={topic.topic_id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>{topic.topic_name} <span className="text-[10px] text-slate-450 font-normal">({topic.correct}/{topic.total} Qs)</span></span>
                    <span className={topic.accuracy >= 75 ? 'text-emerald-600 font-bold' : topic.accuracy < 50 ? 'text-red-500 font-bold' : 'text-slate-600'}>{topic.accuracy.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-[#E5E7EB]">
                    <div className={`h-full rounded-full ${
                      topic.accuracy >= 75 ? 'bg-emerald-500' : topic.accuracy < 50 ? 'bg-red-500' : 'bg-[#2563EB]'
                    }`} style={{ width: `${topic.accuracy}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 4. Question Review Accordion Index */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
          <BookOpen className="text-[#2563EB]" size={18} />
          Detailed Questions & Solutions Review
        </h3>

        <div className="space-y-4">
          {review_questions.map((q, idx) => {
            const isExpanded = expandedQId === q.id;
            const isUnanswered = q.selected_options.length === 0;
            
            const selectedStr = isUnanswered ? 'Not Answered' : q.selected_options.join(', ');
            const correctStr = q.correct_answer.join(', ');

            return (
              <div 
                key={q.id}
                className={`border rounded-xl overflow-hidden transition-colors ${
                  isExpanded 
                    ? 'border-slate-300 bg-slate-50/50 shadow-sm' 
                    : q.is_correct 
                    ? 'border-emerald-200 hover:border-emerald-350 bg-emerald-50/20'
                    : isUnanswered
                    ? 'border-[#E5E7EB] hover:border-slate-350 bg-slate-50/40'
                    : 'border-red-200 hover:border-red-350 bg-red-50/20'
                }`}
              >
                {/* Header Accordion bar */}
                <div 
                  onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 text-[#111827]">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      q.is_correct 
                        ? 'bg-emerald-500 text-white border border-emerald-500' 
                        : isUnanswered
                        ? 'bg-slate-200 border border-slate-300 text-slate-500'
                        : 'bg-red-500 text-white border border-red-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold truncate leading-tight">{q.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">Spent: {formatTimeSpent(q.time_spent)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                      q.is_correct 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                        : isUnanswered
                        ? 'bg-slate-100 border border-slate-200 text-slate-500'
                        : 'bg-red-50 border-red-100 text-red-750'
                    }`}>
                      {q.is_correct ? 'Correct' : isUnanswered ? 'Skipped' : 'Incorrect'}
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details section */}
                {isExpanded && (
                  <div className="p-6 border-t border-[#E5E7EB] bg-slate-50/50 space-y-6 text-xs leading-relaxed text-[#111827]">
                    
                    {/* Question Statement */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Question Statement</h4>
                      <p className="text-sm font-semibold leading-relaxed text-slate-800 markdown-rendered">{q.statement}</p>
                    </div>

                    {/* Options checklist if applicable */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt) => {
                          const isOptionSelected = q.selected_options.includes(opt.key);
                          const isOptionCorrect = q.correct_answer.includes(opt.key);

                          let borderStyle = 'border-[#E5E7EB] bg-white text-slate-600';
                          if (isOptionCorrect) borderStyle = 'border-emerald-300 bg-emerald-50 text-emerald-700 font-semibold';
                          else if (isOptionSelected) borderStyle = 'border-red-300 bg-red-50 text-red-700';

                          return (
                            <div key={opt.key} className={`p-3 rounded-lg border flex items-center gap-2 ${borderStyle}`}>
                              <span className={`w-5 h-5 rounded-md border flex items-center justify-center font-bold text-[10px] ${
                                isOptionCorrect ? 'bg-emerald-500 border-emerald-500 text-white' :
                                isOptionSelected ? 'bg-red-500 border-red-500 text-white' : 'border-[#D1D5DB] text-slate-400'
                              }`}>
                                {opt.key}
                              </span>
                              <span>{opt.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Answer Comparison */}
                    <div className="flex gap-4 p-4 bg-white border border-[#E5E7EB] rounded-lg shadow-sm">
                      <div className="flex-1 space-y-1">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Your Answer Selection</span>
                        <span className={`font-bold text-sm ${q.is_correct ? 'text-emerald-600' : 'text-red-500'}`}>{selectedStr}</span>
                      </div>
                      <div className="flex-1 space-y-1 border-l border-[#E5E7EB] pl-4">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Correct Verified Answer</span>
                        <span className="font-bold text-sm text-emerald-600">{correctStr}</span>
                      </div>
                    </div>

                    {/* Explanations & Solutions widgets */}
                    <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
                      
                      {/* Detailed Explanation */}
                      {q.explanation && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                            <BookOpen size={13} className="text-[#2563EB]" /> Detailed Explanation
                          </span>
                          <p className="text-slate-600 bg-white p-3 rounded-lg border border-[#E5E7EB] leading-relaxed markdown-rendered">{q.explanation}</p>
                        </div>
                      )}

                      {/* Shortcut Tricks */}
                      {q.shortcut_trick && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider flex items-center gap-1.5">
                            <Lightbulb size={13} className="text-amber-500" /> Shortcut Trick Method
                          </span>
                          <p className="text-amber-800 bg-amber-50/50 p-3 rounded-lg border border-amber-200 leading-relaxed markdown-rendered">{q.shortcut_trick}</p>
                        </div>
                      )}

                      {/* Hint */}
                      {q.hint && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                            <Star size={13} className="text-slate-400" /> Question Hint
                          </span>
                          <p className="text-slate-500 italic bg-slate-100/50 p-3 rounded-lg border border-slate-200">{q.hint}</p>
                        </div>
                      )}

                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default AptitudeResultPage;

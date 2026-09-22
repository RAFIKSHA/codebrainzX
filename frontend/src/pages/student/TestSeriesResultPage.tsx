import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Award, CheckCircle, XCircle, HelpCircle, Clock, AlertTriangle, Eye } from 'lucide-react';
import testSeriesService from '../../services/testSeries';
import { setSEOMetadata } from '../../utils/seo';

const TestSeriesResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    setSEOMetadata({
      title: 'Practice Test Series Results | CodexPetra',
      description: 'Review your placement test metrics, accuracy, correct answers, and official solutions explanation.',
      noindex: true,
    });
  }, []);

  const { data: attempt, isLoading } = useQuery({
    queryKey: ['testAttemptDetail', attemptId],
    queryFn: () => testSeriesService.getAttempt(Number(attemptId)),
    enabled: !!attemptId,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse space-y-6">
        <div className="h-10 bg-slate-105 dark:bg-slate-850 rounded w-1/3 mx-auto" />
        <div className="h-48 bg-slate-105 dark:bg-slate-850 rounded" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Attempt not found</h2>
        <button onClick={() => navigate('/test-series')} className="px-4 py-2 bg-purple-600 text-white rounded-xl">
          Back to Hub
        </button>
      </div>
    );
  }

  const test = attempt.test_details;
  const pct = attempt.max_score > 0 ? Math.round((attempt.score / attempt.max_score) * 100) : 0;
  const isPass = pct >= 40; // standard pass criteria

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-slate-800 dark:text-slate-200">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/test-series')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-purple-600 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Test Series Hub
      </button>

      {/* Result Meta Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">
            Test Attempt Result
          </h1>
          <h2 className="text-lg font-bold text-purple-650 dark:text-purple-400">
            {test?.name}
          </h2>
          <p className="text-xs text-slate-400">
            Completed on {new Date(attempt.completed_at || '').toLocaleDateString()} at {new Date(attempt.completed_at || '').toLocaleTimeString()}
          </p>
        </div>

        {/* Score Ring */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center font-extrabold shadow-sm ${
            isPass ? 'border-emerald-500 text-emerald-600' : 'border-red-500 text-red-500'
          }`}>
            <span className="text-2xl">{pct}%</span>
            <span className="text-[9px] uppercase tracking-wide">{isPass ? 'Passed' : 'Failed'}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1.5 font-bold">
            {attempt.score} / {attempt.max_score} Marks
          </span>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <CheckCircle size={18} className="text-emerald-500 mb-1" />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Correct</span>
          <span className="text-base font-extrabold text-slate-950 dark:text-white mt-0.5">{attempt.correct_questions}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <XCircle size={18} className="text-red-500 mb-1" />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Incorrect</span>
          <span className="text-base font-extrabold text-slate-950 dark:text-white mt-0.5">{attempt.wrong_questions}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <HelpCircle size={18} className="text-slate-400 mb-1" />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Skipped</span>
          <span className="text-base font-extrabold text-slate-950 dark:text-white mt-0.5">{attempt.skipped_questions}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <Clock size={18} className="text-purple-600 mb-1" />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Accuracy</span>
          <span className="text-base font-extrabold text-slate-950 dark:text-white mt-0.5">{Math.round(attempt.accuracy)}%</span>
        </div>
      </div>

      {/* Question review details */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-850 pb-3 flex items-center gap-2">
          <Eye size={18} className="text-purple-600" />
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">Question Review</h3>
        </div>

        <div className="space-y-6">
          {attempt.responses.map((resp: any, idx: number) => {
            const isCoding = resp.coding_question !== null;
            const q = isCoding ? resp.coding_question_details : resp.aptitude_question_details;
            
            if (!q) return null;

            return (
              <div
                key={resp.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 space-y-4 shadow-sm"
              >
                {/* Top Status */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Question {idx + 1}</span>
                    <h4 className="font-bold text-slate-950 dark:text-white text-sm">{q.title}</h4>
                  </div>

                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border uppercase ${
                    resp.is_correct 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400' 
                      : resp.is_answered 
                      ? 'bg-red-50 text-red-700 border-red-250 dark:bg-red-950/20 dark:text-red-400'
                      : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-850 dark:text-slate-400'
                  }`}>
                    {resp.is_correct ? 'Correct' : resp.is_answered ? 'Incorrect' : 'Skipped'}
                  </span>
                </div>

                {/* Question Statement */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-xl">
                  {q.statement}
                </p>

                {/* Choices or Code review */}
                {isCoding ? (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-[9px] text-slate-450 uppercase block mb-1">Your Code Submission:</span>
                      <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">{resp.code || 'Skipped (No code submitted)'}</pre>
                    </div>
                    {resp.error_message && (
                      <div className="p-3 bg-red-50 text-red-650 rounded-xl font-mono text-[10px]">
                        <span className="font-bold uppercase text-[9px] block mb-1">Compiler Error:</span>
                        {resp.error_message}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-[9px] text-slate-450 uppercase block mb-1">Your Selection:</span>
                      <div className="flex gap-2 flex-wrap">
                        {resp.selected_options.map((opt: string) => (
                          <span key={opt} className="px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-lg font-bold text-purple-650">{opt}</span>
                        ))}
                        {resp.selected_options.length === 0 && <span className="text-slate-400 italic">No option selected</span>}
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-[9px] text-slate-450 uppercase block mb-1">Correct Answer:</span>
                      <div className="flex gap-2 flex-wrap">
                        {(q.correct_answer || []).map((opt: string) => (
                          <span key={opt} className="px-2.5 py-1 bg-emerald-50 border border-emerald-250 rounded-lg font-bold text-emerald-650">{opt}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="border-t border-slate-100 dark:border-slate-850 pt-3 text-xs leading-relaxed">
                    <span className="font-extrabold text-slate-850 dark:text-white block mb-1">Official Solution Explanation:</span>
                    <p className="text-slate-500">{q.explanation}</p>
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

export default TestSeriesResultPage;

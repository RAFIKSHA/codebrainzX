import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CheckCircle2, AlertCircle, Sparkles, Trophy, 
  ArrowRight, ArrowLeft, Code2, Play, Check, RotateCcw
} from 'lucide-react';
import type { PythonLesson, PracticeProblem, QuizQuestion } from './types';
import { publicApi } from '../../../services/api';

interface PracticeModalProps {
  lesson: PythonLesson;
  isOpen: boolean;
  onClose: () => void;
  onCompletePractice: (lessonId: string) => void;
  isCompleted: boolean;
}

export const PracticeModal: React.FC<PracticeModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onCompletePractice,
  isCompleted,
}) => {
  const problems = lesson.practiceProblems || [];
  const [activeTab, setActiveTab] = useState<'problem' | 'quiz'>('problem');
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  
  // Code runner states
  const activeProblem: PracticeProblem | undefined = problems[selectedProblemIndex];
  const [userCode, setUserCode] = useState<string>(activeProblem?.starterCode?.python || '');
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState<string>('');
  const [testResults, setTestResults] = useState<Array<{ passed: boolean; input: string; expected: string; actual: string }>>([]);

  // Quiz states
  const quizzes = lesson.quizzes || [];
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Update starter code when active problem changes
  React.useEffect(() => {
    if (activeProblem) {
      setUserCode(activeProblem.starterCode?.python || '');
      setRunOutput('');
      setTestResults([]);
    }
  }, [activeProblem]);

  if (!isOpen) return null;

  const handleRunCode = async () => {
    if (!activeProblem) return;
    setIsRunning(true);
    setRunOutput('Running code against test cases...');
    
    try {
      const results: Array<{ passed: boolean; input: string; expected: string; actual: string }> = [];
      let overallOutput = '';

      for (const tc of activeProblem.testCases) {
        try {
          const res = await publicApi.post('/tutorials/lessons/run-code/', {
            code: userCode,
            language_slug: 'python',
            input_data: tc.input_data,
          });
          const actualOut = (res.data.stdout || '').trim();
          const expectedOut = tc.expected_output.trim();
          const passed = actualOut === expectedOut;
          results.push({
            passed,
            input: tc.input_data,
            expected: expectedOut,
            actual: actualOut || res.data.stderr || 'No output',
          });
          if (!overallOutput) {
            overallOutput = res.data.stdout || res.data.stderr || 'Execution completed.';
          }
        } catch (e: any) {
          results.push({
            passed: false,
            input: tc.input_data,
            expected: tc.expected_output,
            actual: e.message || 'Execution error',
          });
        }
      }

      setTestResults(results);
      const allPassed = results.every(r => r.passed);
      if (allPassed) {
        setRunOutput('🎉 All test cases passed successfully!');
        onCompletePractice(lesson.id);
      } else {
        setRunOutput(overallOutput || 'Some test cases failed. Check results below.');
      }
    } catch (err: any) {
      setRunOutput(`Error running code: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleQuizSelect = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const currentQuiz: QuizQuestion | undefined = quizzes[currentQuizIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl bg-white dark:bg-[#0f121a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#151924] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Practice: {lesson.title}
              </h3>
              <span className="text-[11px] text-slate-500">
                Level 1 Foundations • {problems.length} coding challenges & {quizzes.length} quiz checks
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab('problem')}
                className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'problem' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Coding Challenges ({problems.length})
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'quiz' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Concept Quiz ({quizzes.length})
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'problem' && activeProblem ? (
            <div className="space-y-6">
              {/* Problem Selector Bar if multiple problems */}
              {problems.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800">
                  {problems.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProblemIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedProblemIndex === idx
                          ? 'bg-purple-600 text-white font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      Problem {idx + 1}: {p.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Problem Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {activeProblem.order}. {activeProblem.title}
                  </h4>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {activeProblem.difficulty}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeProblem.statement}
                </p>

                {activeProblem.examples && activeProblem.examples.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">Sample Example</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 font-mono text-[11px]">Input:</span>
                        <pre className="bg-white dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 mt-1 font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{activeProblem.examples[0].input}</pre>
                      </div>
                      <div>
                        <span className="text-slate-400 font-mono text-[11px]">Output:</span>
                        <pre className="bg-white dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 mt-1 font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{activeProblem.examples[0].output}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Code Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-purple-600" />
                    Python Solution Sandbox
                  </span>
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isRunning ? 'Running...' : 'Run Test Cases'}</span>
                  </button>
                </div>
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  rows={8}
                  className="w-full font-mono text-xs p-3 rounded-xl bg-slate-900 text-emerald-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                  spellCheck={false}
                />
              </div>

              {/* Test Results Output */}
              {(runOutput || testResults.length > 0) && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Execution Output</span>
                    {testResults.length > 0 && (
                      <span className={`text-[11px] font-bold ${testResults.every(r => r.passed) ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {testResults.filter(r => r.passed).length} / {testResults.length} Passed
                      </span>
                    )}
                  </div>
                  {testResults.length > 0 ? (
                    <div className="space-y-2">
                      {testResults.map((tr, idx) => (
                        <div key={idx} className={`p-2.5 rounded-lg border text-xs font-mono flex items-start gap-2 ${tr.passed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300'}`}>
                          {tr.passed ? <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                          <div className="flex-1 space-y-0.5">
                            <div><strong>Case {idx + 1}:</strong> {tr.passed ? 'PASSED' : 'FAILED'}</div>
                            <div className="text-[11px] opacity-80">Expected: {tr.expected} | Got: {tr.actual}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{runOutput}</pre>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === 'quiz' && currentQuiz ? (
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold uppercase tracking-wider text-purple-600">Question {currentQuizIndex + 1} of {quizzes.length}</span>
                <span>Type: {currentQuiz.type.toUpperCase()}</span>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {currentQuiz.question}
                </h4>

                {currentQuiz.codeSnippet && (
                  <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                    {currentQuiz.codeSnippet}
                  </pre>
                )}
              </div>

              <div className="space-y-2.5">
                {currentQuiz.options.map((opt, optIdx) => {
                  const isSelected = selectedQuizAnswers[currentQuizIndex] === optIdx;
                  const isCorrect = optIdx === currentQuiz.correctIndex;
                  const showResult = quizSubmitted;

                  let optionStyle = 'border-slate-200 dark:border-slate-800 hover:border-purple-400 bg-white dark:bg-slate-900';
                  if (isSelected) {
                    optionStyle = 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-semibold';
                  }
                  if (showResult) {
                    if (isCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleQuizSelect(currentQuizIndex, optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                    >
                      <span>{opt}</span>
                      {showResult && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {quizSubmitted && currentQuiz.explanation && (
                <div className="p-3.5 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-xl text-xs text-blue-900 dark:text-blue-200">
                  <strong>Explanation:</strong> {currentQuiz.explanation}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    if (currentQuizIndex > 0) {
                      setCurrentQuizIndex(prev => prev - 1);
                      setQuizSubmitted(false);
                    }
                  }}
                  disabled={currentQuizIndex === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 disabled:opacity-40"
                >
                  Previous
                </button>

                {!quizSubmitted ? (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    disabled={selectedQuizAnswers[currentQuizIndex] === undefined}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold disabled:opacity-50"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (currentQuizIndex < quizzes.length - 1) {
                        setCurrentQuizIndex(prev => prev + 1);
                        setQuizSubmitted(false);
                      } else {
                        onCompletePractice(lesson.id);
                        onClose();
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                  >
                    {currentQuizIndex < quizzes.length - 1 ? 'Next Question' : 'Finish Practice'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p>Practice exercises ready for this lesson.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

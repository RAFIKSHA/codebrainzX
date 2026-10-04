import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, CheckCircle2, Award, Clock, AlertCircle, RotateCcw, 
  ChevronRight, ArrowRight, ShieldCheck, Check 
} from 'lucide-react';
import { LEVEL_1_FINAL_ASSESSMENT } from './curriculumData';
import type { QuizQuestion } from './types';

interface Level1AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssessmentPassed: (score: number) => void;
}

export const Level1AssessmentModal: React.FC<Level1AssessmentModalProps> = ({
  isOpen,
  onClose,
  onAssessmentPassed,
}) => {
  const assessment = LEVEL_1_FINAL_ASSESSMENT;
  const questions = assessment.questions;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (!isOpen) return null;

  const handleSelect = (optionIdx: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
  };

  const handleFinish = () => {
    let calculated = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        calculated += 1;
      }
    });
    setScore(calculated);
    setIsSubmitted(true);
    if (calculated >= 7) {
      onAssessmentPassed(calculated);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  const currentQ: QuizQuestion = questions[currentIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-white dark:bg-[#0e111a] rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#141824] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {assessment.title}
              </h3>
              <span className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>10 Questions</span> • <span>Passing Score: 70%</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isSubmitted ? (
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Question progress */}
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold uppercase tracking-wider text-purple-600">Question {currentIdx + 1} of {questions.length}</span>
                <span>{Object.keys(answers).length} / {questions.length} Answered</span>
              </div>

              {/* Question text */}
              <div className="space-y-3">
                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentQ.question}
                </h4>

                {currentQ.codeSnippet && (
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                    {currentQ.codeSnippet}
                  </pre>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = answers[currentIdx] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Nav buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setCurrentIdx(prev => Math.max(prev - 1, 0))}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 disabled:opacity-40"
                >
                  Previous
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(prev => Math.min(prev + 1, questions.length - 1))}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    disabled={Object.keys(answers).length < questions.length}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                  >
                    Submit Assessment
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center py-8 max-w-md mx-auto space-y-4">
              <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                score >= 7 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
              }`}>
                <Award className="w-8 h-8" />
              </div>

              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                {score >= 7 ? 'Level 1 Assessment Passed! 🚀' : 'Keep Practicing!'}
              </h4>

              <p className="text-sm text-slate-600 dark:text-slate-300">
                You scored <strong>{score}</strong> out of <strong>{questions.length}</strong> ({Math.round((score / questions.length) * 100)}%).
                {score >= 7 ? ' You have successfully mastered Level 1 — Python Foundations.' : ' Review the foundation lessons and retry to achieve certification.'}
              </p>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Test</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

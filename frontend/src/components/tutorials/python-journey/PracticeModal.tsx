import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CheckCircle2, AlertCircle, Sparkles, Trophy, 
  ArrowRight, HelpCircle, ChevronRight, RotateCcw
} from 'lucide-react';
import type { PythonConcept, PracticeQuestion } from './types';

interface PracticeModalProps {
  concept: PythonConcept;
  isOpen: boolean;
  onClose: () => void;
  onCompletePractice: (conceptId: string) => void;
  isCompleted: boolean;
}

export const PracticeModal: React.FC<PracticeModalProps> = ({
  concept,
  isOpen,
  onClose,
  onCompletePractice,
  isCompleted,
}) => {
  const questions = concept.practice.questions;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [allFinished, setAllFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ: PracticeQuestion = questions[currentIndex] || {
    id: 'default',
    difficulty: 'easy',
    title: 'Concept Check',
    question: `Have you thoroughly reviewed the ${concept.title} concept?`,
    options: ['Yes, I understand it well!', 'I need to review the code again.'],
    correctIndex: 0,
    explanation: 'Great job! Consistent conceptual understanding is key to mastering Python.'
  };

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setSubmitted(true);
    if (selectedOption === currentQ.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      setAllFinished(true);
      onCompletePractice(concept.id);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setScore(0);
    setAllFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-white dark:bg-[#121620] rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-transparent border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Practice: {concept.title}
              </h3>
              <span className="text-[11px] text-slate-650 dark:text-slate-400">
                Question {currentIndex + 1} of {questions.length} • Difficulty: {currentQ.difficulty.toUpperCase()}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {allFinished ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Practice Completed! 🎉
              </h4>
              <p className="text-sm text-slate-650 dark:text-slate-400 max-w-sm mb-6">
                You've successfully tested your understanding of <strong className="text-purple-400">{concept.title}</strong>.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retry
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md"
                >
                  Continue Learning <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Question Text */}
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 leading-relaxed">
                {currentQ.question}
              </h4>

              {/* Code Snippet if applicable */}
              {currentQ.codeSnippet && (
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-purple-300 mb-4 overflow-x-auto">
                  {currentQ.codeSnippet}
                </pre>
              )}

              {/* Options List */}
              <div className="space-y-2.5 mb-5">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  let optionStyles = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-purple-400';

                  if (submitted) {
                    if (isCorrect) {
                      optionStyles = 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optionStyles = 'border-rose-500 bg-rose-950/40 text-rose-300';
                    } else {
                      optionStyles = 'border-slate-800 opacity-40';
                    }
                  } else if (isSelected) {
                    optionStyles = 'border-purple-500 bg-purple-950/40 text-purple-300 font-semibold shadow-[0_0_15px_rgba(168,85,247,0.2)]';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={submitted}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between text-xs sm:text-sm ${optionStyles}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-mono text-xs text-slate-600 dark:text-slate-400 font-bold">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {submitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation upon submission */}
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3.5 rounded-2xl border text-xs leading-relaxed mb-4 ${
                    selectedOption === currentQ.correctIndex
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <strong className="block font-bold mb-0.5">
                    {selectedOption === currentQ.correctIndex ? '✓ Correct!' : '✗ Explanation:'}
                  </strong>
                  {currentQ.explanation}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!allFinished && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-[#151a26] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {submitted ? 'Review explanation' : 'Select an option to verify'}
            </span>

            {submitted ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all"
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Practice'}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={selectedOption === null}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold shadow-md transition-all"
              >
                Check Answer
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

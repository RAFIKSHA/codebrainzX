import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  X, Puzzle, ArrowRight, ArrowDown, Sparkles, 
  Code2, ExternalLink, CheckCircle2, ChevronRight
} from 'lucide-react';
import type { PythonConcept } from './types';

interface DSAConnectionModalProps {
  concept: PythonConcept;
  isOpen: boolean;
  onClose: () => void;
}

export const DSAConnectionModal: React.FC<DSAConnectionModalProps> = ({
  concept,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const dsa = concept.dsaConnection;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-white dark:bg-[#121620] rounded-3xl border border-rose-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-transparent border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Puzzle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                DSA Bridge: {concept.title}
              </h3>
              <span className="text-[11px] text-slate-650 dark:text-slate-400">
                From Python Syntax to Interview Mastery
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* Summary Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/30 to-purple-950/30 border border-rose-500/20 text-slate-200">
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-1">
              {dsa.title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {dsa.summary}
            </p>
            <div className="mt-3 text-[11px] text-rose-200/90 font-medium">
              💡 <span className="font-bold">Interview Reality:</span> {dsa.whyItMatters}
            </div>
          </div>

          {/* Stepper Pathway from Concept to Advanced DSA */}
          <div>
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Concept Progression to Algorithms
            </h5>

            <div className="space-y-2.5">
              {dsa.steps.map((step, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
                >
                  <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      {step.title}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Problem Patterns */}
          {dsa.recommendedProblems.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Target Interview Problems
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dsa.recommendedProblems.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        {p.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Pattern: {p.pattern}
                      </span>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                      p.difficulty === 'Easy'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : p.difficulty === 'Medium'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {p.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#151a26] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link
            to="/dashboard/coding/dsa"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
          >
            <span>Open DSA Roadmap</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Got it, Back to Lesson
          </button>
        </div>
      </motion.div>
    </div>
  );
};

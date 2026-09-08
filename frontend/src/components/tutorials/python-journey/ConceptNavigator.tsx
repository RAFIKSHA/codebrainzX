import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Circle, Lock, Map, ChevronRight, 
  Sparkles, Compass, BookOpen, Layers, Award
} from 'lucide-react';
import type { PythonConcept, ConceptStatus } from './types';
import { PYTHON_CONCEPTS, getNearbyConcepts, CATEGORIES } from './curriculumData';

interface ConceptNavigatorProps {
  activeConcept: PythonConcept;
  onSelectConcept: (conceptId: string) => void;
  completedIds: string[];
  onOpenRoadmap: () => void;
}

export const ConceptNavigator: React.FC<ConceptNavigatorProps> = ({
  activeConcept,
  onSelectConcept,
  completedIds,
  onOpenRoadmap,
}) => {
  // Show ~7 nearby concepts centered around the current index
  const visibleConcepts = getNearbyConcepts(activeConcept.id, 7);

  const totalConcepts = PYTHON_CONCEPTS.length;
  const completedCount = completedIds.length;
  const progressPercent = Math.round((completedCount / totalConcepts) * 100);

  const nextConcept = activeConcept.nextConceptId 
    ? PYTHON_CONCEPTS.find(c => c.id === activeConcept.nextConceptId) 
    : null;

  return (
    <div className="w-full h-full flex flex-col justify-between bg-white dark:bg-[#0e1118] border-r border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 select-none overflow-y-auto">
      {/* 1. Header & Progress Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600/10 dark:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xs">
              Py
            </div>
            <div>
              <h3 className="text-xs font-black tracking-wider uppercase text-slate-800 dark:text-slate-200">
                PYTHON JOURNEY
              </h3>
              <p className="text-[10px] text-slate-650 dark:text-slate-400">Concept-Based Track</p>
            </div>
          </div>
        </div>

        {/* Subtle Progress Bar */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3.5 border border-slate-200/60 dark:border-slate-800/60 mb-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Curriculum Progress</span>
            <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
              {completedCount} / {totalConcepts} ({progressPercent}%)
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(progressPercent, 6)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-650 dark:text-slate-400">
            <span className="truncate max-w-[100px]">Current: <strong className="text-slate-700 dark:text-slate-200">{activeConcept.title}</strong></span>
            {nextConcept && (
              <span className="truncate max-w-[100px] text-right">Next: <strong className="text-purple-600 dark:text-purple-400">{nextConcept.title}</strong></span>
            )}
          </div>
        </div>

        {/* 2. Nearby Concepts Stepper (Window around current concept) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">
              Connected Path
            </span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
              Focused View
            </span>
          </div>

          <div className="relative pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-1.5 ml-2">
            {visibleConcepts.map((concept) => {
              const isActive = concept.id === activeConcept.id;
              const isCompleted = completedIds.includes(concept.id);
              const category = CATEGORIES[concept.category];

              return (
                <motion.button
                  key={concept.id}
                  layout
                  onClick={() => onSelectConcept(concept.id)}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group relative ${
                    isActive
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold border border-purple-300 dark:border-purple-800/80 shadow-sm'
                      : isCompleted
                      ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      : 'text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {/* Status Dot / Check */}
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : isActive ? (
                        <div className="w-4 h-4 rounded-full bg-purple-600 dark:bg-purple-400 flex items-center justify-center text-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        </div>
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-650 group-hover:text-purple-400 transition-colors" />
                      )}
                    </div>

                    <span className="truncate">{concept.title}</span>
                  </div>

                  {/* Category Pill Mini Indicator */}
                  <span 
                    className="text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold flex-shrink-0"
                    style={{ 
                      backgroundColor: category.bgColor, 
                      color: category.color 
                    }}
                  >
                    {category.number}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Bottom Action: View Full Roadmap */}
      <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        <button
          onClick={onOpenRoadmap}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-750 hover:border-purple-300 dark:hover:border-purple-700 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 text-xs font-semibold transition-all shadow-sm group"
        >
          <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:rotate-45 transition-transform duration-300" />
          <span>View Full Python Roadmap</span>
        </button>
      </div>
    </div>
  );
};

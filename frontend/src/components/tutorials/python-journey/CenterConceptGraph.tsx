import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Circle, Lock, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Sparkles, Layers, Compass, Play, BookOpen, ChevronRight, Eye
} from 'lucide-react';
import type { PythonConcept, ConceptStatus } from './types';
import { CATEGORIES, getConceptById } from './curriculumData';
import { ConceptVisualizer } from './ConceptVisualizer';

interface CenterConceptGraphProps {
  activeConcept: PythonConcept;
  onSelectConcept: (conceptId: string) => void;
  completedIds: string[];
  onOpenRoadmap: () => void;
}

export const CenterConceptGraph: React.FC<CenterConceptGraphProps> = ({
  activeConcept,
  onSelectConcept,
  completedIds,
  onOpenRoadmap,
}) => {
  const category = CATEGORIES[activeConcept.category];

  // Identify nearby connected concepts
  const prevConcept = activeConcept.prerequisites.length > 0 
    ? getConceptById(activeConcept.prerequisites[0]) 
    : null;

  const nextConcept = activeConcept.nextConceptId 
    ? getConceptById(activeConcept.nextConceptId) 
    : null;

  const relatedUp = activeConcept.relatedConceptIds[0] && activeConcept.relatedConceptIds[0] !== prevConcept?.id
    ? getConceptById(activeConcept.relatedConceptIds[0])
    : null;

  const relatedDown = activeConcept.relatedConceptIds[1] && activeConcept.relatedConceptIds[1] !== nextConcept?.id
    ? getConceptById(activeConcept.relatedConceptIds[1])
    : (activeConcept.relatedConceptIds[2] ? getConceptById(activeConcept.relatedConceptIds[2]) : null);

  const getStatus = (id: string): ConceptStatus => {
    if (completedIds.includes(id)) return 'COMPLETED';
    if (id === activeConcept.id) return 'IN_PROGRESS';
    return 'NOT_STARTED';
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 select-none overflow-hidden">
      {/* Background Subtle Tech Grid & Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/15 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Header Information in Center View */}
      <div className="w-full flex items-center justify-between z-10 mb-2">
        <div className="flex items-center gap-2">
          <div 
            className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border flex items-center gap-1.5"
            style={{ 
              backgroundColor: category.bgColor, 
              color: category.color, 
              borderColor: category.borderColor 
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color }} />
            {category.number} {category.name}
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400 hidden sm:inline">
            • Step {activeConcept.order} of 16
          </span>
        </div>

        <button
          onClick={onOpenRoadmap}
          className="flex items-center gap-1.5 text-xs text-purple-650 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-350 font-medium px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 transition-all shadow-sm"
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">View Full</span> Roadmap
        </button>
      </div>

      {/* Relational Knowledge Graph Canvas */}
      <div className="relative w-full max-w-2xl flex-grow flex items-center justify-center my-2 sm:my-4 min-h-[380px]">
        {/* Animated Connecting SVG Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Connection Lines from Center (50%, 50%) to surrounding nodes */}
          {prevConcept && (
            <line 
              x1="22%" y1="50%" x2="42%" y2="50%" 
              stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4 4" 
              className="animate-[dash_20s_linear_infinite]"
            />
          )}
          {nextConcept && (
            <line 
              x1="58%" y1="50%" x2="78%" y2="50%" 
              stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4 4"
            />
          )}
          {relatedUp && (
            <line 
              x1="50%" y1="20%" x2="50%" y2="38%" 
              stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3"
              className="dark:stroke-slate-700"
            />
          )}
          {relatedDown && (
            <line 
              x1="50%" y1="62%" x2="50%" y2="80%" 
              stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3"
              className="dark:stroke-slate-700"
            />
          )}
        </svg>

        {/* 1. TOP NODE (Parent / Related Prerequisite) */}
        {relatedUp && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            <SatelliteNode
              concept={relatedUp}
              position="top"
              status={getStatus(relatedUp.id)}
              onClick={() => onSelectConcept(relatedUp.id)}
            />
          </div>
        )}

        {/* 2. LEFT NODE (Previous Concept in Journey) */}
        {prevConcept && (
          <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10">
            <SatelliteNode
              concept={prevConcept}
              position="left"
              status={getStatus(prevConcept.id)}
              onClick={() => onSelectConcept(prevConcept.id)}
            />
          </div>
        )}

        {/* 3. CENTER ACTIVE CONCEPT NODE (Dominant & Glowing) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeConcept.id}
            initial={{ opacity: 0, scale: 0.88, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -10 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="z-20 w-full max-w-sm sm:max-w-md bg-white dark:bg-[#12151e] rounded-3xl p-5 sm:p-6 border-2 border-purple-500 shadow-[0_10px_35px_rgba(139,92,246,0.22)] dark:shadow-[0_10px_35px_rgba(139,92,246,0.15)] flex flex-col items-center text-center relative"
          >
            {/* Active Aura Halo */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 opacity-20 blur-lg -z-10" />

            {/* Active Node Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-650 dark:text-purple-300 text-xs font-semibold mb-3">
              <span className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-ping" />
              CURRENT CONCEPT
            </div>

            {/* Title & Icon */}
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase mb-2">
              {activeConcept.title}
            </h2>

            {/* Short 1-liner definition */}
            <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-350 leading-relaxed max-w-xs mb-4">
              {activeConcept.shortDefinition}
            </p>

            {/* Mini Visualizer Teaser */}
            <div className="w-full my-1 scale-95 origin-center">
              <ConceptVisualizer concept={activeConcept} compact={true} />
            </div>

            {/* Action Buttons inside Center Card */}
            <div className="mt-4 w-full flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                <span>{completedIds.includes(activeConcept.id) ? '✓ Completed' : '● In Progress'}</span>
              </div>

              {nextConcept && (
                <button
                  onClick={() => onSelectConcept(nextConcept.id)}
                  className="flex items-center gap-1 text-xs font-bold text-purple-650 dark:text-purple-300 hover:text-purple-700 group transition-colors"
                >
                  <span>Next: {nextConcept.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 4. RIGHT NODE (Next Concept in Journey) */}
        {nextConcept && (
          <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10">
            <SatelliteNode
              concept={nextConcept}
              position="right"
              status={getStatus(nextConcept.id)}
              onClick={() => onSelectConcept(nextConcept.id)}
            />
          </div>
        )}

        {/* 5. BOTTOM NODE (Upcoming Sibling) */}
        {relatedDown && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
            <SatelliteNode
              concept={relatedDown}
              position="bottom"
              status={getStatus(relatedDown.id)}
              onClick={() => onSelectConcept(relatedDown.id)}
            />
          </div>
        )}
      </div>

      {/* Bottom Subtitle / Guidance */}
      <div className="w-full flex items-center justify-center gap-3 text-xs text-slate-650 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
        <span className="flex items-center gap-1">
          <ArrowLeft className="w-3 h-3 text-purple-600 dark:text-purple-400" /> Click connected nodes to navigate
        </span>
        <span>•</span>
        <span className="hidden sm:inline">Focus on one idea at a time</span>
      </div>
    </div>
  );
};

interface SatelliteNodeProps {
  concept: PythonConcept;
  position: 'top' | 'left' | 'right' | 'bottom';
  status: ConceptStatus;
  onClick: () => void;
}

const SatelliteNode: React.FC<SatelliteNodeProps> = ({ concept, position, status, onClick }) => {
  const isCompleted = status === 'COMPLETED';

  return (
    <motion.button
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`group relative bg-white/90 dark:bg-[#151924]/90 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border transition-all text-left shadow-md flex items-center gap-2.5 max-w-[170px] sm:max-w-[200px] ${
        isCompleted
          ? 'border-emerald-500/40 hover:border-emerald-500 shadow-emerald-500/5'
          : 'border-slate-200 dark:border-slate-800 hover:border-purple-400 hover:shadow-purple-500/10'
      }`}
    >
      {/* Position Badge & Status Icon */}
      <div className="flex-shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <Circle className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
        )}
      </div>

      <div className="overflow-hidden">
        <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase block tracking-wider truncate">
          {position === 'left' ? 'Previous' : position === 'right' ? 'Next' : 'Connected'}
        </span>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate block">
          {concept.title}
        </span>
      </div>
    </motion.button>
  );
};

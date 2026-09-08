import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Circle, ArrowRight, ArrowLeft, Bookmark, 
  BookmarkCheck, Sparkles, Globe, Lightbulb, HelpCircle, 
  Puzzle, Check, Share2, Layers, BookOpen, Trophy, 
  Terminal, ChevronRight, Hash, ShieldCheck
} from 'lucide-react';
import type { PythonConcept } from './types';
import { CATEGORIES, getConceptById } from './curriculumData';
import { ConceptVisualizer } from './ConceptVisualizer';
import { CodePlayground } from './CodePlayground';

interface ConceptLessonPanelProps {
  concept: PythonConcept;
  onSelectConcept: (conceptId: string) => void;
  onToggleComplete: (conceptId: string) => void;
  isCompleted: boolean;
  onOpenPractice: () => void;
  onOpenDSA: () => void;
  isPracticeCompleted: boolean;
}

export const ConceptLessonPanel: React.FC<ConceptLessonPanelProps> = ({
  concept,
  onSelectConcept,
  onToggleComplete,
  isCompleted,
  onOpenPractice,
  onOpenDSA,
  isPracticeCompleted,
}) => {
  const category = CATEGORIES[concept.category];
  const [activeTab, setActiveTab] = useState<'understand' | 'visualize' | 'code' | 'practice' | 'connect'>('understand');
  const [selectedDomainIdx, setSelectedDomainIdx] = useState(0);

  const prevConcept = concept.prerequisites.length > 0 
    ? getConceptById(concept.prerequisites[0]) 
    : null;

  const nextConcept = concept.nextConceptId 
    ? getConceptById(concept.nextConceptId) 
    : null;

  const allDomains = [
    concept.realWorld.primaryDomain,
    ...(concept.realWorld.otherDomains || [])
  ];

  const currentDomain = allDomains[selectedDomainIdx] || concept.realWorld.primaryDomain;

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#0e1118] border-l border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-7 overflow-y-auto select-text scroll-smooth">
      {/* 1. Header: Category Badge & Completion Check */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div 
          className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border flex items-center gap-1.5"
          style={{ 
            backgroundColor: category.bgColor, 
            color: category.color, 
            borderColor: category.borderColor 
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color }} />
          {category.number} {category.name}
        </div>

        <button
          onClick={() => onToggleComplete(concept.id)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-xl transition-all ${
            isCompleted
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-emerald-500'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isCompleted ? 'Completed ✓' : 'Mark Complete'}</span>
        </button>
      </div>

      {/* 2. Main Concept Title */}
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase mb-4">
        {concept.title}
      </h1>

      {/* 3. Learning Flow Stepper */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between mb-6 overflow-x-auto text-[11px] font-bold">
        {[
          { id: 'understand', label: 'Understand' },
          { id: 'visualize', label: 'Visualize' },
          { id: 'code', label: 'Code' },
          { id: 'practice', label: 'Practice' },
          { id: 'connect', label: 'Connect' }
        ].map((step, idx) => {
          const isActive = activeTab === step.id;
          return (
            <button
              key={step.id}
              onClick={() => {
                setActiveTab(step.id as any);
                const elem = document.getElementById(`section-${step.id}`);
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 whitespace-nowrap ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{step.label}</span>
              {idx < 4 && <span className="opacity-40 ml-1">→</span>}
            </button>
          );
        })}
      </div>

      {/* 4. Definition Section */}
      <div id="section-understand" className="space-y-4 mb-6">
        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-650 dark:text-slate-400 mb-1">
            Definition
          </h3>
          <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {concept.definition}
          </p>
        </div>

        {/* In Simple Words Callout */}
        <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 text-slate-700 dark:text-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-1.5">
            <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>IN SIMPLE WORDS</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
            {concept.simpleExplanation}
          </p>
        </div>
      </div>

      {/* 5. Interactive Visual Explanation Section */}
      <div id="section-visualize" className="space-y-3 mb-6">
        <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-650 dark:text-slate-400">
          Visual Explanation
        </h3>
        <ConceptVisualizer concept={concept} compact={false} />
      </div>

      {/* 6. Why Does This Matter? */}
      <div className="space-y-3 mb-6">
        <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-650 dark:text-slate-400">
          Why Does This Matter?
        </h3>
        <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
          {concept.whyItMatters.description}
        </p>

        {/* Connected Concept Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">Foundational for:</span>
          {concept.whyItMatters.connectedChips.map(chip => (
            <span
              key={chip}
              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* 7. Real-World Connection (Single Elegant Section) */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-650 dark:text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>REAL-WORLD CONNECTION</span>
          </h3>

          {allDomains.length > 1 && (
            <div className="flex gap-1">
              {allDomains.map((d, idx) => (
                <button
                  key={d.domain}
                  onClick={() => setSelectedDomainIdx(idx)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-all ${
                    selectedDomainIdx === idx
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d.domain}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {currentDomain.domain}
            </span>
            <span className="text-[11px] text-slate-650 dark:text-slate-400">
              {currentDomain.description}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
            {currentDomain.mappings.map((m, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <span className="text-purple-600 dark:text-purple-400 font-bold truncate">{m.key}</span>
                <span className="text-slate-600 dark:text-slate-300 font-semibold">{m.typeOrValue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8. Code Section */}
      <div id="section-code" className="space-y-3 mb-6">
        <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-650 dark:text-slate-400 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>CODE PLAYGROUND</span>
        </h3>

        <CodePlayground
          initialCode={concept.code.snippet}
          expectedOutput={concept.code.expectedOutput}
          conceptTitle={concept.title}
        />
      </div>

      {/* 9. Practice Section */}
      <div id="section-practice" className="space-y-3 mb-6">
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/20 via-indigo-900/10 to-transparent border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                PRACTICE THIS CONCEPT
              </h4>
            </div>
            <p className="text-xs text-slate-650 dark:text-slate-400">
              Test what you just learned with curated quizzes &amp; interview drills.
            </p>

            <div className="flex gap-2 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                Easy: {concept.practice.easyCount}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                Medium: {concept.practice.mediumCount}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold">
                Interview: {concept.practice.interviewCount}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenPractice}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all whitespace-nowrap flex items-center justify-center gap-1.5"
          >
            <span>{isPracticeCompleted ? 'Practice Again' : 'Start Practice'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 10. DSA Connection */}
      <div id="section-connect" className="space-y-3 mb-6">
        <div className="p-4 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              <Puzzle className="w-4 h-4" />
              <span>DSA &amp; INTERVIEW CONNECTION</span>
            </div>
            <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed max-w-md">
              {concept.dsaConnection.whyItMatters}
            </p>
          </div>

          <button
            onClick={onOpenDSA}
            className="flex-shrink-0 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl border border-rose-500/30 transition-all flex items-center gap-1"
          >
            <span>Explore Bridge</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 11. Concept Relationship Map ("YOU ARE HERE") */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 mb-6">
        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-650 dark:text-slate-400 block mb-2">
          YOU ARE HERE IN LEARNING PATH
        </span>

        <div className="flex items-center justify-between text-xs font-medium">
          {prevConcept ? (
            <button
              onClick={() => onSelectConcept(prevConcept.id)}
              className="text-slate-650 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 truncate max-w-[100px]"
            >
              ← {prevConcept.title}
            </button>
          ) : (
            <span className="text-slate-400 dark:text-slate-600">Start of Journey</span>
          )}

          <div className="px-3 py-1 rounded-lg bg-purple-600 text-white font-bold text-xs shadow-sm">
            ● {concept.title}
          </div>

          {nextConcept ? (
            <button
              onClick={() => onSelectConcept(nextConcept.id)}
              className="text-purple-650 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold truncate max-w-[100px] text-right"
            >
              {nextConcept.title} →
            </button>
          ) : (
            <span className="text-slate-400 dark:text-slate-600">End of Track</span>
          )}
        </div>
      </div>

      {/* 12. "NEXT CONCEPT" CONTINUOUS JOURNEY EXPERIENCE */}
      {nextConcept && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-slate-900/40 border-2 border-purple-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> CONCEPT COMPLETE
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Ready for Step {nextConcept.order}
            </span>
          </div>

          <div>
            <span className="text-xs font-mono text-purple-300 uppercase tracking-wider block">
              NEXT CONCEPT
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">
              {nextConcept.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">
              &quot;{concept.nextConceptReason}&quot;
            </p>
          </div>

          <button
            onClick={() => onSelectConcept(nextConcept.id)}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all flex items-center justify-center gap-2 group"
          >
            <span>Continue to {nextConcept.title}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};

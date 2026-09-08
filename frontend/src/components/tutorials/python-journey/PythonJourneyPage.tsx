import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Compass, Trophy, 
  Puzzle, BookOpen, Layers, Menu, X, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { PYTHON_CONCEPTS, getConceptById } from './curriculumData';
import type { PythonConcept } from './types';
import { ConceptNavigator } from './ConceptNavigator';
import { CenterConceptGraph } from './CenterConceptGraph';
import { ConceptLessonPanel } from './ConceptLessonPanel';
import { FullRoadmapModal } from './FullRoadmapModal';
import { PracticeModal } from './PracticeModal';
import { DSAConnectionModal } from './DSAConnectionModal';
import { setSEOMetadata } from '../../../utils/seo';
import { useAuth } from '../../../context/AuthContext';
import { tutorialsService } from '../../../services/tutorials';

export const PythonJourneyPage: React.FC = () => {
  const { lessonSlug } = useParams<{ lessonSlug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active Concept Resolution
  const activeConceptId = lessonSlug || 'variables';
  const activeConcept: PythonConcept = getConceptById(activeConceptId);

  // Progress Tracking State
  const [completedConceptIds, setCompletedConceptIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('python_journey_completed');
      return saved ? JSON.parse(saved) : ['python-basics'];
    } catch {
      return ['python-basics'];
    }
  });

  const [completedPracticeIds, setCompletedPracticeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('python_journey_practices');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & Mobile View States
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const [isDSAOpen, setIsDSAOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'journey' | 'lesson'>('lesson');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Synchronize SEO & History
  useEffect(() => {
    setSEOMetadata({
      title: `${activeConcept.title} - Python Concept Journey | CodexPetra`,
      description: activeConcept.definition,
      canonicalUrl: `${window.location.origin}/tutorials/python/${activeConcept.id}`,
    });
  }, [activeConcept]);

  // Concept Selection Handler with smooth client-side transition
  const handleSelectConcept = useCallback((conceptId: string) => {
    navigate(`/tutorials/python/${conceptId}`);
    setMobileSidebarOpen(false);
  }, [navigate]);

  // Toggle Concept Completion
  const handleToggleComplete = (conceptId: string) => {
    let updated: string[];
    if (completedConceptIds.includes(conceptId)) {
      updated = completedConceptIds.filter(id => id !== conceptId);
    } else {
      updated = [...completedConceptIds, conceptId];
    }
    setCompletedConceptIds(updated);
    localStorage.setItem('python_journey_completed', JSON.stringify(updated));
  };

  // Complete Practice Handler
  const handleCompletePractice = (conceptId: string) => {
    if (!completedPracticeIds.includes(conceptId)) {
      const updated = [...completedPracticeIds, conceptId];
      setCompletedPracticeIds(updated);
      localStorage.setItem('python_journey_practices', JSON.stringify(updated));
    }
    // Also auto-mark concept as completed
    if (!completedConceptIds.includes(conceptId)) {
      handleToggleComplete(conceptId);
    }
  };

  // Keyboard navigation shortcuts (ArrowLeft: Previous, ArrowRight: Next, Esc: Close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isRoadmapOpen || isPracticeOpen || isDSAOpen) {
        if (e.key === 'Escape') {
          setIsRoadmapOpen(false);
          setIsPracticeOpen(false);
          setIsDSAOpen(false);
        }
        return;
      }

      // Avoid capturing arrows when typing in textarea / inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' && activeConcept.nextConceptId) {
        handleSelectConcept(activeConcept.nextConceptId);
      } else if (e.key === 'ArrowLeft' && activeConcept.prerequisites.length > 0) {
        handleSelectConcept(activeConcept.prerequisites[0]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeConcept, isRoadmapOpen, isPracticeOpen, isDSAOpen, handleSelectConcept]);

  const prevConcept = activeConcept.prerequisites.length > 0 
    ? getConceptById(activeConcept.prerequisites[0]) 
    : null;

  const nextConcept = activeConcept.nextConceptId 
    ? getConceptById(activeConcept.nextConceptId) 
    : null;

  return (
    <div className="flex-grow flex flex-col h-[calc(100vh-65px)] bg-slate-50 dark:bg-[#090b10] overflow-hidden text-slate-800 dark:text-slate-200">
      {/* Mobile Top Subheader & View Switcher */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#0e1118] border-b border-slate-200 dark:border-slate-800 z-20">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"
        >
          {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Path</span>
        </button>

        {/* Mobile Tab Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setMobileTab('journey')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mobileTab === 'journey'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Graph
          </button>
          <button
            onClick={() => setMobileTab('lesson')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mobileTab === 'lesson'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Lesson
          </button>
        </div>

        <button
          onClick={() => setIsRoadmapOpen(true)}
          className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold flex items-center gap-1"
        >
          <Compass className="w-4 h-4" />
          <span>Map</span>
        </button>
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="lg:hidden fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-[#0e1118] shadow-2xl pt-16"
          >
            <ConceptNavigator
              activeConcept={activeConcept}
              onSelectConcept={handleSelectConcept}
              completedIds={completedConceptIds}
              onOpenRoadmap={() => {
                setMobileSidebarOpen(false);
                setIsRoadmapOpen(true);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 3-Panel Desktop Layout */}
      <div className="flex-grow flex flex-row h-full overflow-hidden">
        {/* LEFT PANEL: Small Learning Journey Navigator */}
        <aside className="hidden lg:block w-[260px] xl:w-[280px] h-full flex-shrink-0">
          <ConceptNavigator
            activeConcept={activeConcept}
            onSelectConcept={handleSelectConcept}
            completedIds={completedConceptIds}
            onOpenRoadmap={() => setIsRoadmapOpen(true)}
          />
        </aside>

        {/* CENTER PANEL: Large Visual Concept Area (The Heart of the Experience) */}
        <main className={`flex-grow h-full overflow-y-auto ${
          mobileTab === 'lesson' ? 'hidden lg:flex' : 'flex'
        } flex-col items-center justify-center`}>
          <CenterConceptGraph
            activeConcept={activeConcept}
            onSelectConcept={handleSelectConcept}
            completedIds={completedConceptIds}
            onOpenRoadmap={() => setIsRoadmapOpen(true)}
          />
        </main>

        {/* RIGHT PANEL: Concept Learning Panel */}
        <section className={`w-full lg:w-[480px] xl:w-[560px] 2xl:w-[620px] h-full flex-shrink-0 ${
          mobileTab === 'journey' ? 'hidden lg:block' : 'block'
        }`}>
          <ConceptLessonPanel
            concept={activeConcept}
            onSelectConcept={handleSelectConcept}
            onToggleComplete={handleToggleComplete}
            isCompleted={completedConceptIds.includes(activeConcept.id)}
            onOpenPractice={() => setIsPracticeOpen(true)}
            onOpenDSA={() => setIsDSAOpen(true)}
            isPracticeCompleted={completedPracticeIds.includes(activeConcept.id)}
          />
        </section>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="lg:hidden flex items-center justify-between p-3 bg-white dark:bg-[#0e1118] border-t border-slate-200 dark:border-slate-800 z-20">
        {prevConcept ? (
          <button
            onClick={() => handleSelectConcept(prevConcept.id)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">{prevConcept.title}</span>
          </button>
        ) : <div />}

        <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">
          {activeConcept.order} / {PYTHON_CONCEPTS.length}
        </span>

        {nextConcept ? (
          <button
            onClick={() => handleSelectConcept(nextConcept.id)}
            className="flex items-center gap-1 text-xs font-bold text-white px-3.5 py-1.5 rounded-xl bg-purple-600 shadow-sm"
          >
            <span className="truncate max-w-[100px]">{nextConcept.title}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : <div />}
      </div>

      {/* MODALS */}
      {/* 1. Full Roadmap Modal */}
      <FullRoadmapModal
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
        activeConceptId={activeConcept.id}
        onSelectConcept={handleSelectConcept}
        completedIds={completedConceptIds}
      />

      {/* 2. Practice Modal */}
      <PracticeModal
        concept={activeConcept}
        isOpen={isPracticeOpen}
        onClose={() => setIsPracticeOpen(false)}
        onCompletePractice={handleCompletePractice}
        isCompleted={completedPracticeIds.includes(activeConcept.id)}
      />

      {/* 3. DSA Connection Modal */}
      <DSAConnectionModal
        concept={activeConcept}
        isOpen={isDSAOpen}
        onClose={() => setIsDSAOpen(false)}
      />
    </div>
  );
};

export default PythonJourneyPage;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Search, CheckCircle2, Circle, Sparkles, 
  Map, ArrowRight, BookOpen, Layers, Check 
} from 'lucide-react';
import { COURSE_LEVELS, getAllLessons } from './curriculumData';

interface FullRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  completedIds: string[];
}

export const FullRoadmapModal: React.FC<FullRoadmapModalProps> = ({
  isOpen,
  onClose,
  activeLessonId,
  onSelectLesson,
  completedIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleLessonClick = (id: string) => {
    onSelectLesson(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-5xl h-[90vh] bg-white dark:bg-[#0c0f17] rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Roadmap Modal Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#121622] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold text-sm">
              🐍
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-2">
                Python Mastery Course Roadmap
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete progression track from Level 1 Foundations to Advanced DSA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics..."
                className="pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#181d2c] border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500 w-44 sm:w-60"
              />
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Levels and Lessons Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {COURSE_LEVELS.map((level) => {
            const levelLessons = level.lessons.filter(l => 
              l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              l.lessonNumber.includes(searchQuery)
            );

            if (levelLessons.length === 0) return null;

            return (
              <div key={level.levelNumber} className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                      {level.levelNumber}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {level.name}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">{level.lessons.length} Lessons</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {levelLessons.map((l) => {
                    const isActive = l.id === activeLessonId;
                    const isCompleted = completedIds.includes(l.id);

                    return (
                      <button
                        key={l.id}
                        onClick={() => handleLessonClick(l.id)}
                        className={`text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          isActive
                            ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-600 shadow-sm'
                            : 'bg-white dark:bg-[#121622] border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700'
                        }`}
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400">
                            <span>{l.lessonNumber}</span>
                            <span>•</span>
                            <span className="text-slate-400 font-normal">{l.readingTime}</span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {l.title}
                          </h4>
                        </div>
                        {isCompleted && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Search, CheckCircle2, Circle, Lock, Sparkles, 
  Map, ArrowRight, BookOpen, Layers
} from 'lucide-react';
import type { PythonConcept, CategoryKey } from './types';
import { PYTHON_CONCEPTS, CATEGORIES } from './curriculumData';

interface FullRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeConceptId: string;
  onSelectConcept: (conceptId: string) => void;
  completedIds: string[];
}

export const FullRoadmapModal: React.FC<FullRoadmapModalProps> = ({
  isOpen,
  onClose,
  activeConceptId,
  onSelectConcept,
  completedIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryKey | 'all'>('all');

  if (!isOpen) return null;

  const categoryKeys: CategoryKey[] = ['foundation', 'logic', 'core', 'oop', 'advanced', 'dsa'];

  const filteredConcepts = PYTHON_CONCEPTS.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.shortDefinition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || c.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleConceptClick = (id: string) => {
    onSelectConcept(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-6xl h-[92vh] bg-white dark:bg-[#0c0f17] rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Roadmap Modal Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#121622] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold text-sm">
              Py
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-2">
                PYTHON ROADMAP MIND MAP
              </h2>
              <p className="text-xs text-slate-650 dark:text-slate-400">
                Bird&apos;s-eye view of all 6 progressive learning stages
              </p>
            </div>
          </div>

          {/* Search and Category Filter */}
          <div className="flex items-center gap-3 flex-grow sm:flex-grow-0">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search concepts..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-[#0f131d] border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            All Categories ({PYTHON_CONCEPTS.length})
          </button>

          {categoryKeys.map((catKey) => {
            const cat = CATEGORIES[catKey];
            const isSelected = selectedCategoryFilter === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategoryFilter(catKey)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span>{cat.number} {cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Grid View of Categories & Nodes */}
        <div className="p-6 overflow-y-auto flex-grow bg-slate-50/50 dark:bg-[#0a0d14]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryKeys.map((catKey) => {
              const cat = CATEGORIES[catKey];
              const conceptsInCat = filteredConcepts.filter(c => c.category === catKey);

              if (conceptsInCat.length === 0) return null;

              return (
                <div 
                  key={catKey}
                  className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col"
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs font-mono"
                      style={{ 
                        backgroundColor: cat.bgColor, 
                        color: cat.color,
                        border: `1px solid ${cat.borderColor}`
                      }}
                    >
                      {cat.number}
                    </div>
                    <div>
                      <h3 className="text-xs font-black tracking-wider uppercase" style={{ color: cat.color }}>
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-slate-650 dark:text-slate-400">{cat.title}</p>
                    </div>
                  </div>

                  {/* List of Concepts in this Category */}
                  <div className="space-y-2 flex-grow">
                    {conceptsInCat.map((concept) => {
                      const isActive = concept.id === activeConceptId;
                      const isCompleted = completedIds.includes(concept.id);

                      return (
                        <motion.button
                          key={concept.id}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleConceptClick(concept.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                            isActive
                              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                              : isCompleted
                              ? 'bg-slate-50 dark:bg-slate-900/40 border-emerald-500/40 hover:border-emerald-500'
                              : 'bg-slate-50/70 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 hover:border-purple-400'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            ) : isActive ? (
                              <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-white flex-shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              </div>
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-purple-400 flex-shrink-0" />
                            )}

                            <div>
                              <span className={`text-xs font-bold block truncate ${
                                isActive 
                                  ? 'text-purple-700 dark:text-purple-300' 
                                  : 'text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                              }`}>
                                {concept.title}
                              </span>
                              <span className="text-[10px] text-slate-650 dark:text-slate-400 line-clamp-1">
                                {concept.shortDefinition}
                              </span>
                            </div>
                          </div>

                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

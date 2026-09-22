import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users, BookOpen, Brain, Play, ChevronRight, CheckCircle2,
  BarChart2, Target, Award, ArrowLeft, Loader2, AlertCircle
} from 'lucide-react';
import aptitudeService from '../../services/aptitude';
import type { AptitudeTrainerDetail } from '../../services/aptitude';
import { TrainerAvatar } from './AptitudeDashboard';

const AptitudeTrainerProfilePage: React.FC = () => {

  const { trainerId } = useParams<{ trainerId: string }>();
  const navigate = useNavigate();

  const [trainer, setTrainer] = useState<AptitudeTrainerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const fetchProfile = async () => {
    if (!trainerId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await aptitudeService.getTrainerProfile(Number(trainerId));
      setTrainer(data);
      if (data.categories.length > 0) {
        setSelectedCategoryId(data.categories[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load trainer profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [trainerId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-semibold text-slate-500">Loading trainer curriculum...</p>
      </div>
    );
  }

  if (error || !trainer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-sm text-slate-500">{error || 'Trainer not found'}</p>
        <button
          onClick={() => navigate('/dashboard/aptitude')}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg"
        >
          Back to Hub
        </button>
      </div>
    );
  }

  const { user_stats, categories } = trainer;
  const activeCategory = categories.find(c => c.id === selectedCategoryId) || categories[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 font-sans">
      
      {/* ── Breadcrumb & Back ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/dashboard/aptitude" className="hover:text-blue-600 transition-colors">Aptitude Hub</Link>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300">Trainers</span>
          <span>/</span>
          <span className="text-blue-600 font-bold">{trainer.name}</span>
        </div>
        <button
          onClick={() => navigate('/dashboard/aptitude')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Hub
        </button>
      </div>

      {/* ── Trainer Profile Hero Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <TrainerAvatar name={trainer.name} image={trainer.profile_image} size="lg" />
            <div>

              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">{trainer.name}</h1>
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full">
                  {trainer.is_active ? 'Active Trainer' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
                {trainer.specialization}
              </p>
              {trainer.bio && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
                  {trainer.bio}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate(`/dashboard/aptitude/subtopic/all/practice?trainer=${trainer.id}`)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0 self-stretch sm:self-center justify-center"
          >
            <Play size={14} fill="white" /> Practice All Trainer Questions
          </button>
        </div>

        {/* ── Metrics Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Questions</span>
            <p className="text-lg font-black text-blue-600">{trainer.question_count}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Topics Covered</span>
            <p className="text-lg font-black text-indigo-600">{trainer.topic_count}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Your Solved / Total</span>
            <p className="text-lg font-black text-emerald-600">{user_stats?.questions_attempted ?? 0} / {trainer.question_count}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Your Accuracy</span>
            <p className="text-lg font-black text-amber-600">{user_stats?.accuracy ?? 0}%</p>
          </div>
        </div>
      </div>

      {/* ── Trainer Curriculum Hierarchy: Category → Topic → Questions ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" />
            Curriculum by {trainer.name}
          </h2>
          <span className="text-xs text-slate-400 font-medium">Select a topic to launch targeted practice</span>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 shadow-sm">
            <Brain size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No questions published yet</p>
            <p className="text-xs text-slate-400">Questions created by this trainer will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Category Navigation Pills */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-1.5 shadow-sm">
              <span className="text-[11px] uppercase font-bold text-slate-400 px-3 py-1 block">Categories</span>
              {categories.map((cat) => {
                const isActive = activeCategory?.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <span className="truncate pr-2">{cat.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                      {cat.total_questions} Qs
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Topics under Selected Category */}
            <div className="lg:col-span-3 space-y-3">
              {activeCategory?.topics.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                  No topics in this category for this trainer.
                </div>
              ) : (
                activeCategory?.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {topic.name}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                          {topic.question_count} Questions
                        </span>
                      </div>
                      {topic.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">{topic.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => navigate(`/dashboard/aptitude/subtopic/all/practice?topic=${topic.id}&trainer=${trainer.id}`)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                      >
                        <Play size={12} fill="white" /> Practice Topic
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};

export default AptitudeTrainerProfilePage;

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ChevronLeft, ChevronDown, Check, Play, Copy, 
  Bookmark, BookmarkCheck, Share2, Target, Lightbulb, 
  AlertCircle, CheckCircle2, XCircle, Code2, ArrowRight, ArrowLeft,
  Clock, BookOpen, Award, Sparkles, Terminal, Compass, Menu, X, ExternalLink
} from 'lucide-react';
import { 
  COURSE_LEVELS, getLessonById, LEVEL_1_LESSONS, 
  LEVEL_1_PRACTICE_PROBLEMS, LEVEL_1_MINI_PROJECT, LEVEL_1_FINAL_ASSESSMENT 
} from './curriculumData';
import type { PythonLesson, CourseCurriculumLevel, PracticeProblem } from './types';
import { setSEOMetadata, getBreadcrumbSchema } from '../../../utils/seo';
import { useAuth } from '../../../context/AuthContext';
import { tutorialsService } from '../../../services/tutorials';
import { publicApi } from '../../../services/api';
import { PracticeModal } from './PracticeModal';
import { Level1AssessmentModal } from './Level1AssessmentModal';
import { MiniProjectModal } from './MiniProjectModal';
import { FullRoadmapModal } from './FullRoadmapModal';

export const PythonJourneyPage: React.FC = () => {
  const { lessonSlug } = useParams<{ lessonSlug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active Lesson Resolution
  const activeSlug = lessonSlug || '1-1-introduction-to-python';
  const lesson: PythonLesson = useMemo(() => getLessonById(activeSlug), [activeSlug]);

  // Collapsible Accordion Levels in Left Sidebar (Level 1 expanded by default)
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({ 1: true });

  // Progress Tracking State
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tutorials_completed_lessons');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Normalize strings
        return Array.isArray(parsed) ? parsed.map((s: string) => s.replace('python/', '')) : [];
      }
      return ['1-1-introduction-to-python'];
    } catch {
      return ['1-1-introduction-to-python'];
    }
  });

  // Bookmarking State
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Live Interactive Code Sandbox State
  const [codeSnippet, setCodeSnippet] = useState<string>(lesson.codeExample?.code || '');
  const [codeOutput, setCodeOutput] = useState<string>(lesson.codeExample?.output || '');
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Quiz interactive state
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState<Record<string, boolean>>({});

  // Modals
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isMiniProjectModalOpen, setIsMiniProjectModalOpen] = useState(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Active Table of Contents Item
  const [activeTocId, setActiveTocId] = useState<string>('');

  // Sync when lesson changes
  useEffect(() => {
    setCodeSnippet(lesson.codeExample?.code || '');
    setCodeOutput(lesson.codeExample?.output || '');
    setSelectedQuizAnswers({});
    setSubmittedQuizzes({});

    // Bookmark check
    try {
      const bookmarks = JSON.parse(localStorage.getItem('tutorials_bookmarks') || '[]');
      setIsBookmarked(bookmarks.some((b: any) => b.lessonSlug === lesson.id));
    } catch {
      setIsBookmarked(false);
    }

    // SEO Metadata
    setSEOMetadata({
      title: `${lesson.title} - Python Tutorial | CodexPetra`,
      description: lesson.introduction,
      canonicalUrl: `https://codexpetra.com/tutorials/python/${lesson.id}`,
      structuredData: getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Tutorials', url: '/tutorials' },
        { name: 'Python', url: '/tutorials/python' },
        { name: lesson.chapterName, url: `/tutorials/python` },
        { name: lesson.title, url: `/tutorials/python/${lesson.id}` },
      ]),
    });

    // Auto-scroll to top of main content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lesson]);

  // Sync progress with backend on mount
  useEffect(() => {
    if (user) {
      tutorialsService.getUserProgress().then(res => {
        if (res?.completed_slugs) {
          const cleaned = res.completed_slugs.map(s => s.replace('python/', ''));
          setCompletedLessonIds(prev => Array.from(new Set([...prev, ...cleaned])));
        }
      }).catch(err => console.error(err));
    }
  }, [user]);

  // Table of Contents scrollspy observer
  useEffect(() => {
    const handleScroll = () => {
      const headings = lesson.sections.map(s => document.getElementById(s.id)).filter(Boolean);
      const scrollPos = window.scrollY + 140;

      for (let i = headings.length - 1; i >= 0; i--) {
        const el = headings[i];
        if (el && el.offsetTop <= scrollPos) {
          setActiveTocId(el.id);
          return;
        }
      }
      if (headings.length > 0 && headings[0]) {
        setActiveTocId(headings[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lesson]);

  // Toggle Level Collapsing
  const toggleLevel = (levelNumber: number) => {
    setExpandedLevels(prev => ({ ...prev, [levelNumber]: !prev[levelNumber] }));
  };

  // Toggle Lesson Completion
  const handleToggleComplete = async (targetId: string = lesson.id) => {
    const isCompleted = completedLessonIds.includes(targetId);
    let updated: string[];
    if (isCompleted) {
      updated = completedLessonIds.filter(id => id !== targetId);
    } else {
      updated = [...completedLessonIds, targetId];
      triggerConfetti();
    }
    setCompletedLessonIds(updated);
    localStorage.setItem('tutorials_completed_lessons', JSON.stringify(updated.map(id => `python/${id}`)));

    if (user) {
      try {
        // Find lesson ID if backend mapping available
        await tutorialsService.completeLesson(1, !isCompleted);
      } catch (e) {
        console.error("Backend progress sync error:", e);
      }
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = () => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem('tutorials_bookmarks') || '[]');
      let updated: any[];
      if (isBookmarked) {
        updated = bookmarks.filter((b: any) => b.lessonSlug !== lesson.id);
        setIsBookmarked(false);
      } else {
        updated = [...bookmarks, { langSlug: 'python', langName: 'Python', lessonSlug: lesson.id, lessonTitle: lesson.title }];
        setIsBookmarked(true);
      }
      localStorage.setItem('tutorials_bookmarks', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Run Code via backend Judge0
  const handleRunCode = async () => {
    setIsRunning(true);
    setCodeOutput('Compiling and executing Python script...');
    try {
      const res = await publicApi.post('/tutorials/lessons/run-code/', {
        code: codeSnippet,
        language_slug: 'python',
        input_data: '',
      });
      if (res.data.stderr) {
        setCodeOutput(`ERROR (stderr):\n${res.data.stderr}`);
      } else if (res.data.compile_output) {
        setCodeOutput(`COMPILE ERROR:\n${res.data.compile_output}`);
      } else {
        setCodeOutput(res.data.stdout || 'Execution completed with no output.');
      }
    } catch (e: any) {
      setCodeOutput(`Execution Error: ${e.response?.data?.error || e.message || 'Server connection failed.'}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Handle Quiz selection
  const handleSelectQuiz = (quizId: string, optIdx: number) => {
    if (submittedQuizzes[quizId]) return;
    setSelectedQuizAnswers(prev => ({ ...prev, [quizId]: optIdx }));
  };

  const handleSubmitQuiz = (quizId: string, correctIdx: number) => {
    setSubmittedQuizzes(prev => ({ ...prev, [quizId]: true }));
    if (selectedQuizAnswers[quizId] === correctIdx) {
      triggerConfetti();
    }
  };

  // Confetti Canvas trigger
  const triggerConfetti = () => {
    const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces: any[] = [];
    const colors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#6366f1'];
    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height - 20,
        r: Math.random() * 5 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;
      pieces.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - (p.r / 3)) * 15;
        if (p.y <= canvas.height) active = true;
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });
      if (active) requestAnimationFrame(draw);
    };
    draw();
  };

  // Calculations for Progress
  const totalLevel1Lessons = COURSE_LEVELS[0].lessons.length;
  const completedLevel1Count = COURSE_LEVELS[0].lessons.filter(l => completedLessonIds.includes(l.id)).length;
  const level1ProgressPercent = Math.round((completedLevel1Count / totalLevel1Lessons) * 100);

  // Previous and Next Lessons
  const allLevel1Lessons = COURSE_LEVELS[0].lessons;
  const currentIdx = allLevel1Lessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIdx > 0 ? allLevel1Lessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLevel1Lessons.length - 1 ? allLevel1Lessons[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-[#07080d] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-150">
      {/* Confetti canvas */}
      <canvas id="confetti-canvas" className="fixed inset-0 pointer-events-none z-50 w-full h-full" />

      {/* Top Mobile Subheader Bar */}
      <div className="lg:hidden sticky top-16 z-30 flex items-center justify-between px-4 py-2.5 bg-white/95 dark:bg-[#0c0e17]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800"
        >
          <Menu className="w-4 h-4" />
          <span>Curriculum ({completedLevel1Count}/{totalLevel1Lessons})</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPracticeModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Practice</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#0c0e17] border-r border-slate-200 dark:border-slate-800 shadow-2xl p-4 flex flex-col pt-16 overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-600/10 text-purple-600 flex items-center justify-center font-bold text-xs">🐍</div>
                  <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Python Curriculum</h3>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Curriculum Accordion */}
              <div className="space-y-4">
                {COURSE_LEVELS.map((lvl) => (
                  <div key={lvl.levelNumber} className="space-y-1">
                    <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 block">
                      {lvl.name}
                    </span>
                    <div className="space-y-0.5">
                      {lvl.lessons.map((l) => {
                        const isActive = l.id === lesson.id;
                        const isDone = completedLessonIds.includes(l.id);
                        return (
                          <Link
                            key={l.id}
                            to={`/tutorials/python/${l.id}`}
                            onClick={() => setMobileSidebarOpen(false)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 font-bold border-l-4 border-purple-600'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
                            }`}
                          >
                            <span className="truncate mr-2">{l.lessonNumber} {l.title}</span>
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3-COLUMN RESPONSIVE LAYOUT CONTAINER */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[1520px] mx-auto px-3 sm:px-6 lg:px-8 py-4 lg:py-6 flex gap-6">

        {/* ----------------------------------------------------------------------- */}
        {/* LEFT SIDEBAR: Course Navigation (260–280px) */}
        {/* ----------------------------------------------------------------------- */}
        <aside className="hidden lg:flex flex-col w-[260px] xl:w-[280px] shrink-0 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto pr-1 select-none">
          {/* Sidebar Header */}
          <div className="p-4 bg-white dark:bg-[#0e111a] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/10 dark:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl shrink-0 shadow-inner">
                🐍
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate">
                  Python Journey
                </h2>
                <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                  Learn • Practice • Build
                </p>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500 dark:text-slate-400">Level 1 Progress</span>
                <span className="text-purple-600 dark:text-purple-400">{completedLevel1Count} / {totalLevel1Lessons} completed</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${level1ProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Curriculum Accordion List */}
          <div className="space-y-2 flex-1 overflow-y-auto pb-4">
            {COURSE_LEVELS.map((lvl) => {
              const isExpanded = !!expandedLevels[lvl.levelNumber];
              const isLevel1 = lvl.levelNumber === 1;

              return (
                <div key={lvl.levelNumber} className="rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-[#0e111a]/70 overflow-hidden">
                  <button
                    onClick={() => toggleLevel(lvl.levelNumber)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 ${
                        isLevel1 ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {lvl.levelNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {lvl.name}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="p-1.5 pt-0 space-y-0.5 border-t border-slate-100 dark:border-slate-800/60">
                      {lvl.lessons.map((l) => {
                        const isActive = l.id === lesson.id;
                        const isDone = completedLessonIds.includes(l.id);

                        return (
                          <Link
                            key={l.id}
                            to={`/tutorials/python/${l.id}`}
                            className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all ${
                              isActive
                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-bold border-l-3 border-purple-600 shadow-2xs'
                                : 'text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
                              <span className="truncate">{l.lessonNumber} {l.title}</span>
                            </div>
                            {isDone ? (
                              <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Practice Makes Progress Promo Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/60 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200/60 dark:border-purple-900/40 text-xs space-y-2.5 mt-auto">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold">
              <Sparkles className="w-4 h-4 shrink-0 text-purple-600" />
              <span>Practice Makes Progress</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
              Solve problems, take tests and level up your skills.
            </p>
            <button
              onClick={() => setIsPracticeModalOpen(true)}
              className="w-full py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <span>Start Practice</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </aside>

        {/* ----------------------------------------------------------------------- */}
        {/* CENTER COLUMN: Main Tutorial Content Reader (Flexible / Largest Area) */}
        {/* ----------------------------------------------------------------------- */}
        <main className="flex-1 min-w-0 max-w-4xl space-y-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
            <Link to="/" className="hover:text-purple-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/tutorials" className="hover:text-purple-600 transition-colors">Tutorials</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/tutorials/python" className="hover:text-purple-600 transition-colors">Python</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-purple-600 dark:text-purple-400 font-bold">{lesson.chapterName}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 truncate">{lesson.title}</span>
          </div>

          {/* Lesson Header Block */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold">
                <span>🐍</span>
                <span>Python</span>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Lesson {lesson.lessonNumber}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {lesson.title}
            </h1>

            <p className="text-base text-slate-650 dark:text-slate-300 leading-relaxed max-w-3xl">
              {lesson.introduction}
            </p>

            {/* Metadata and Quick Navigation Bar */}
            <div className="flex items-center justify-between gap-4 py-3 border-y border-slate-200/80 dark:border-slate-800 flex-wrap">
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-600" />
                  {lesson.readingTime}
                </span>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                  <Check className="w-3 h-3 stroke-[3]" />
                  {lesson.difficulty}
                </span>
                <button
                  onClick={handleToggleBookmark}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    isBookmarked
                      ? 'border-purple-300 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              {/* Prev / Next Quick Header Buttons */}
              <div className="flex items-center gap-2">
                {prevLesson && (
                  <Link
                    to={`/tutorials/python/${prevLesson.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </Link>
                )}
                {nextLesson && (
                  <Link
                    to={`/tutorials/python/${nextLesson.id}`}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Learning Objectives Box */}
          {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
            <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 text-blue-950 dark:text-blue-200 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-sm text-blue-700 dark:text-blue-300">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Learning Objectives</span>
              </div>
              <p className="text-xs text-blue-800/80 dark:text-blue-300/80">
                By the end of this lesson you will be able to:
              </p>
              <ul className="space-y-1.5 text-xs sm:text-sm pl-2">
                {lesson.learningObjectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-2" />
                    <span className="leading-relaxed">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Structured Lesson Content Sections */}
          <div className="space-y-10">
            {lesson.sections.map((sec) => (
              <section key={sec.id} id={sec.id} className="space-y-4 scroll-mt-24">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight pb-2 border-b border-slate-100 dark:border-slate-800">
                  {sec.title}
                </h2>

                <div 
                  className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{ __html: sec.content.replace(/\n/g, '<br />').replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs text-purple-600 dark:text-purple-400 font-bold border border-slate-200 dark:border-slate-700">$1</code>') }}
                />

                {/* Optional Callout / Analogy Box */}
                {sec.callout && (
                  <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${
                    sec.callout.type === 'analogy' || sec.callout.type === 'tip'
                      ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-950 dark:text-amber-200'
                      : 'bg-purple-50/70 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40 text-purple-950 dark:text-purple-200'
                  }`}>
                    <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <strong className="block font-bold">{sec.callout.title}</strong>
                      <p className="opacity-90 leading-relaxed">{sec.callout.text}</p>
                    </div>
                  </div>
                )}

                {/* Optional Structured Cards */}
                {sec.cards && sec.cards.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {sec.cards.map((card, cIdx) => (
                      <div key={cIdx} className="p-4 rounded-xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {card.title}
                          </h4>
                          {card.tag && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 font-mono">
                              {card.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional Comparison Table */}
                {sec.comparisonTable && (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e111a] shadow-2xs mt-3">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                        <tr>
                          {sec.comparisonTable.headers.map((h, hIdx) => (
                            <th key={hIdx} className="px-4 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {sec.comparisonTable.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                            {row.map((cell, cellIdx) => (
                              <td key={cellIdx} className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* PROFESSIONAL CODE BLOCK & OUTPUT SECTION */}
          {/* ========================================================================= */}
          {lesson.codeExample && (
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-600" />
                <span>Example: Code & Output</span>
              </h2>

              <div className="rounded-2xl border border-slate-800 bg-[#0f121a] overflow-hidden shadow-xl">
                {/* Editor Top Bar */}
                <div className="px-4 py-2.5 bg-[#151924] border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono font-bold text-slate-300 text-xs flex items-center gap-1.5">
                      <span>🐍</span> {lesson.codeExample.language}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3 h-3" />
                      <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                    </button>
                  </div>
                </div>

                {/* Editor & Output Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 font-mono text-xs">
                  {/* Code Editor Body */}
                  <div className="lg:col-span-7 p-4 bg-[#0d1017] text-slate-200 overflow-x-auto">
                    <textarea
                      value={codeSnippet}
                      onChange={(e) => setCodeSnippet(e.target.value)}
                      rows={Math.max(codeSnippet.split('\n').length + 1, 8)}
                      className="w-full bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                      spellCheck={false}
                    />
                  </div>

                  {/* Output Terminal Pane */}
                  <div className="lg:col-span-5 p-4 bg-[#07090e] text-slate-300 space-y-2 overflow-x-auto flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Output:
                      </span>
                      <pre className="font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {codeOutput || 'Click "Run Code" to execute.'}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works Explanation */}
              {lesson.codeExample.howItWorks && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0e111a] border border-slate-200 dark:border-slate-800 space-y-2 text-xs sm:text-sm">
                  <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs block">
                    How It Works:
                  </span>
                  <ul className="space-y-1.5 pl-2 text-slate-650 dark:text-slate-300">
                    {lesson.codeExample.howItWorks.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2">
                        <span className="font-bold text-purple-600">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* COMMON MISTAKES */}
          {/* ========================================================================= */}
          {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
            <section className="space-y-3 pt-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span>Common Beginner Mistakes</span>
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {lesson.commonMistakes.map((m, mIdx) => (
                  <div key={mIdx} className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900/40 space-y-2 text-xs sm:text-sm">
                    <strong className="text-red-900 dark:text-red-300 font-bold block">
                      ❌ {m.mistake}
                    </strong>
                    {m.badCode && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400">
                          <span className="text-[10px] font-bold block text-red-500 uppercase">Incorrect:</span>
                          {m.badCode}
                        </div>
                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                          <span className="text-[10px] font-bold block text-emerald-500 uppercase">Correct:</span>
                          {m.goodCode}
                        </div>
                      </div>
                    )}
                    <p className="text-slate-650 dark:text-slate-300">{m.explanation}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* KEY POINTS TO REMEMBER (Subtle Green Box with Checkmarks) */}
          {/* ========================================================================= */}
          {lesson.keyPoints && lesson.keyPoints.length > 0 && (
            <section className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-200 space-y-3 shadow-2xs">
              <h3 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Key Points to Remember</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm pl-1">
                {lesson.keyPoints.map((kp, kpIdx) => (
                  <li key={kpIdx} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="leading-relaxed">{kp}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ========================================================================= */}
          {/* PRACTICE PROBLEMS CONNECTION */}
          {/* ========================================================================= */}
          {lesson.practiceProblems && lesson.practiceProblems.length > 0 && (
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-purple-600" />
                  <span>Practice Challenges ({lesson.practiceProblems.length})</span>
                </h3>
                <button
                  onClick={() => setIsPracticeModalOpen(true)}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Interactive Runner</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lesson.practiceProblems.map((prob) => (
                  <div
                    key={prob.id}
                    className="p-4 rounded-xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs hover:border-purple-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {prob.order}. {prob.title}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 uppercase">
                        {prob.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {prob.statement}
                    </p>
                    <button
                      onClick={() => setIsPracticeModalOpen(true)}
                      className="w-full py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Solve Problem →
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* CONCEPT CHECK / INLINE QUIZZES */}
          {/* ========================================================================= */}
          {lesson.quizzes && lesson.quizzes.length > 0 && (
            <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Concept Check: Quiz Questions</span>
              </h3>

              <div className="space-y-4">
                {lesson.quizzes.map((quiz, qIdx) => {
                  const isSubmitted = submittedQuizzes[quiz.id];
                  const selectedOpt = selectedQuizAnswers[quiz.id];

                  return (
                    <div key={quiz.id} className="p-5 rounded-2xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-bold uppercase tracking-wider text-purple-600">Question {qIdx + 1}</span>
                        <span className="uppercase text-[10px]">{quiz.type}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {quiz.question}
                      </h4>

                      {quiz.codeSnippet && (
                        <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
                          {quiz.codeSnippet}
                        </pre>
                      )}

                      <div className="space-y-2">
                        {quiz.options.map((opt, optIdx) => {
                          const isSelected = selectedOpt === optIdx;
                          const isCorrect = optIdx === quiz.correctIndex;

                          let btnClass = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-purple-300';
                          if (isSelected) {
                            btnClass = 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold';
                          }
                          if (isSubmitted) {
                            if (isCorrect) {
                              btnClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
                            } else if (isSelected && !isCorrect) {
                              btnClass = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectQuiz(quiz.id, optIdx)}
                              className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${btnClass}`}
                            >
                              <span>{opt}</span>
                              {isSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {!isSubmitted ? (
                        <button
                          onClick={() => handleSubmitQuiz(quiz.id, quiz.correctIndex)}
                          disabled={selectedOpt === undefined}
                          className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          Check Answer
                        </button>
                      ) : (
                        quiz.explanation && (
                          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border-l-4 border-blue-500 text-xs text-blue-900 dark:text-blue-200">
                            <strong>Explanation:</strong> {quiz.explanation}
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* LEVEL 1 MINI PROJECT & FINAL TEST PROMO SECTION */}
          {/* ========================================================================= */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/10 via-indigo-900/10 to-transparent border border-purple-500/30 space-y-2.5">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
                <Award className="w-5 h-5 text-purple-600" />
                <span>Level 1 Mini Project</span>
              </div>
              <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed">
                Build the <strong>Student Basic Information & Report Card Program</strong> with real input and formatted output.
              </p>
              <button
                onClick={() => setIsMiniProjectModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Launch Mini Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900/10 via-teal-900/10 to-transparent border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Level 1 Final Assessment</span>
              </div>
              <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed">
                Take the 10-question final test covering all 7 foundation lessons to earn completion status.
              </p>
              <button
                onClick={() => setIsAssessmentModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Start Assessment Test</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* BOTTOM LESSON NAVIGATION CONTROLS */}
          {/* ========================================================================= */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap pb-12">
            <div>
              {prevLesson ? (
                <Link
                  to={`/tutorials/python/${prevLesson.id}`}
                  className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-400 bg-white dark:bg-[#0e111a] transition-all group"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Previous Lesson</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{prevLesson.title}</span>
                  </div>
                </Link>
              ) : <div />}
            </div>

            <button
              onClick={() => handleToggleComplete(lesson.id)}
              className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                completedLessonIds.includes(lesson.id)
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{completedLessonIds.includes(lesson.id) ? 'Lesson Completed!' : 'Mark as Completed'}</span>
            </button>

            <div>
              {nextLesson ? (
                <Link
                  to={`/tutorials/python/${nextLesson.id}`}
                  className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-400 bg-white dark:bg-[#0e111a] transition-all group"
                >
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Next Lesson</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{nextLesson.title}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                </Link>
              ) : <div />}
            </div>
          </div>
        </main>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT SIDEBAR: Outline, Related Topics, Progress, Next Lesson (220–280px) */}
        {/* ----------------------------------------------------------------------- */}
        <aside className="hidden xl:flex flex-col w-[260px] lg:w-[270px] shrink-0 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto space-y-4 select-none pr-1">
          {/* 1. On This Page Table of Contents */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0e111a] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              On This Page
            </h3>
            <nav className="space-y-1">
              {lesson.sections.map((sec) => {
                const isActive = activeTocId === sec.id;
                return (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(sec.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`block px-2.5 py-1.5 rounded-lg text-xs transition-all truncate ${
                      isActive
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-bold border-l-2 border-purple-600'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    {sec.title}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* 2. Google AdSense / CodexPetra Promo Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-slate-900 dark:to-purple-950/30 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
              <span>Skill Booster</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">Ad</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                Build your skills. Get future ready.
              </h4>
              <p className="text-[11px] text-slate-500">
                Learn with CodexPetra interactive tracks.
              </p>
            </div>
            <button
              onClick={() => setIsRoadmapModalOpen(true)}
              className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] shadow-xs transition-colors cursor-pointer"
            >
              Explore Now
            </button>
          </div>

          {/* 3. Related Topics */}
          {lesson.relatedTopics && lesson.relatedTopics.length > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0e111a] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Related Topics
              </h3>
              <div className="space-y-1.5">
                {lesson.relatedTopics.map((rt) => (
                  <Link
                    key={rt.id}
                    to={`/tutorials/python/${rt.id}`}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all text-xs group"
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block group-hover:text-purple-600">
                        {rt.title}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {rt.chapterName}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 4. Your Progress Circular / Bar Gauge */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0e111a] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Your Progress
            </h3>
            <div className="flex items-center gap-3">
              {/* Circular Gauge */}
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-purple-600 transition-all duration-500"
                    strokeDasharray={`${level1ProgressPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[11px] font-black text-slate-800 dark:text-slate-200">
                  {level1ProgressPercent}%
                </span>
              </div>

              <div className="min-w-0 space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  Python Foundations
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {completedLevel1Count} / {totalLevel1Lessons} lessons completed
                </span>
              </div>
            </div>
          </div>

          {/* 5. Next Lesson Card */}
          {nextLesson && (
            <Link
              to={`/tutorials/python/${nextLesson.id}`}
              className="p-4 rounded-2xl bg-white dark:bg-[#0e111a] border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-purple-400 transition-all block space-y-2 group"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Next Lesson
              </span>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 min-w-0 pr-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 truncate">
                    {nextLesson.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    Level 1 • {nextLesson.readingTime}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          )}
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      <PracticeModal
        lesson={lesson}
        isOpen={isPracticeModalOpen}
        onClose={() => setIsPracticeModalOpen(false)}
        onCompletePractice={() => handleToggleComplete(lesson.id)}
        isCompleted={completedLessonIds.includes(lesson.id)}
      />

      <Level1AssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        onAssessmentPassed={(score) => {
          handleToggleComplete(lesson.id);
          triggerConfetti();
        }}
      />

      <MiniProjectModal
        isOpen={isMiniProjectModalOpen}
        onClose={() => setIsMiniProjectModalOpen(false)}
        onProjectCompleted={() => {
          handleToggleComplete(lesson.id);
          triggerConfetti();
        }}
      />

      <FullRoadmapModal
        isOpen={isRoadmapModalOpen}
        onClose={() => setIsRoadmapModalOpen(false)}
        activeLessonId={lesson.id}
        onSelectLesson={(id) => navigate(`/tutorials/python/${id}`)}
        completedIds={completedLessonIds}
      />
    </div>
  );
};

export default PythonJourneyPage;

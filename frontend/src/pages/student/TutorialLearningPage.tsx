import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import { publicApi } from '../../services/api';
import { tutorialsService } from '../../services/tutorials';
import type { TutorialLesson, TutorialChapter, TutorialLanguage } from '../../services/tutorials';
import { useAuth } from '../../context/AuthContext';
import { setSEOMetadata } from '../../utils/seo';
import { 
  ChevronRight, ChevronLeft, Check, Play, Copy, 
  Download, Maximize2, Minimize2, Sun, Moon, Type, Printer, 
  Share2, Bookmark, BookmarkCheck, ArrowUp, RefreshCw, AlertCircle, 
  CheckCircle2, XCircle, Loader2, Clock, Code, Award,
  HelpCircle as QuizIcon, BookMarked
} from 'lucide-react';

const TutorialLearningPage: React.FC = () => {
  const { langSlug, lessonSlug } = useParams<{ langSlug: string; lessonSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Reading settings states
  const [fontSize, setFontSize] = useState<number>(16); // in pixels
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // editor dark mode
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  // Table of Contents Outline
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeTocId, setActiveTocId] = useState<string>('');

  // Lesson states
  const [code, setCode] = useState<string>('');
  const [codeOutput, setCodeOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [inputData, setInputData] = useState<string>('');
  const [editorLang, setEditorLang] = useState<string>('python');

  // Multi-language code tab mapping
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [activeLangTab, setActiveLangTab] = useState<string>('python');

  // Quiz states
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, string>>({}); // quiz_id -> option
  const [submittedQuizzes, setSubmittedQuizzes] = useState<Record<number, boolean>>({}); // quiz_id -> boolean

  // Practice states
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, string>>({}); // practice_id -> text
  const [submittedPractices, setSubmittedPractices] = useState<Record<number, { isCorrect: boolean; showFeedback: boolean }>>({});

  const timerRef = useRef<number>(0);

  // 1. Fetch current language overview
  const { data: language } = useQuery<TutorialLanguage>({
    queryKey: ['tutorial-language', langSlug],
    queryFn: async () => {
      const languages = await tutorialsService.getLanguages();
      const current = languages.find(l => l.slug === langSlug);
      if (!current) throw new Error('Language not found');
      return current;
    },
    enabled: !!langSlug,
  });

  // 2. Fetch all chapters for this language (for left sidebar)
  const { data: chapters } = useQuery<TutorialChapter[]>({
    queryKey: ['tutorial-chapters', langSlug],
    queryFn: () => tutorialsService.getChapters({ language_slug: langSlug }),
    enabled: !!langSlug,
  });

  // 3. Fetch all lessons for this language (to build sidebar list and next/prev nav)
  const { data: lessons } = useQuery<TutorialLesson[]>({
    queryKey: ['tutorial-lessons', langSlug],
    queryFn: () => tutorialsService.getLessons({ language_slug: langSlug }),
    enabled: !!langSlug,
  });

  // 4. Fetch/Lookup current lesson details (quizzes, practices, blocks included)
  const activeLessonSlug = lessonSlug || (lessons && lessons.length > 0 ? lessons[0].slug : '');
  
  const { data: lesson, isLoading: lessonLoading, error: lessonError } = useQuery<TutorialLesson>({
    queryKey: ['tutorial-lesson-detail', langSlug, activeLessonSlug],
    queryFn: () => tutorialsService.lookupLesson(langSlug!, activeLessonSlug),
    enabled: !!langSlug && !!activeLessonSlug,
  });

  // Helper map from language slug to Monaco language syntax
  const mapSlugToMonacoLanguage = (slug: string): string => {
    const map: Record<string, string> = {
      python: 'python',
      py: 'python',
      javascript: 'javascript',
      js: 'javascript',
      html: 'html',
      css: 'css',
      cpp: 'cpp',
      c: 'c',
      java: 'java',
      sql: 'sql',
    };
    return map[slug.toLowerCase()] || 'python';
  };

  // Initialize lesson parameters, codes, bookmarks
  useEffect(() => {
    if (lesson) {
      // Parse Multi-Language code templates if stored in JSON block format
      let parsedMap: Record<string, string> = {};
      const lessonCode = lesson.code_example || '';
      try {
        const trimmedCode = lessonCode.trim();
        if (trimmedCode.startsWith('{') && trimmedCode.endsWith('}')) {
          parsedMap = JSON.parse(trimmedCode);
        }
      } catch (e) {
        console.error("Code example is plain text, not multi-language JSON:", e);
      }

      if (Object.keys(parsedMap).length > 0) {
        setCodeMap(parsedMap);
        const firstLang = Object.keys(parsedMap)[0];
        setActiveLangTab(firstLang);
        setCode(parsedMap[firstLang]);
        setEditorLang(mapSlugToMonacoLanguage(firstLang));
      } else {
        const langKey = langSlug || 'python';
        setCodeMap({ [langKey]: lessonCode });
        setActiveLangTab(langKey);
        setCode(lessonCode);
        setEditorLang(mapSlugToMonacoLanguage(langKey));
      }

      setCodeOutput('');

      // Check bookmark status
      try {
        const bookmarksList = JSON.parse(localStorage.getItem('tutorials_bookmarks') || '[]');
        const exists = bookmarksList.some((b: any) => b.langSlug === langSlug && b.lessonSlug === lesson.slug);
        setIsBookmarked(exists);

        // Add to history
        const historyList = JSON.parse(localStorage.getItem('tutorials_history') || '[]');
        const filteredHistory = historyList.filter((h: any) => !(h.langSlug === langSlug && h.lessonSlug === lesson.slug));
        const updatedHistory = [
          { langSlug, langName: language?.name || langSlug, lessonSlug: lesson.slug, lessonTitle: lesson.title, timestamp: Date.now() },
          ...filteredHistory
        ];
        localStorage.setItem('tutorials_history', JSON.stringify(updatedHistory.slice(0, 10)));
      } catch (e) {
        console.error(e);
      }

      // Quiz and practice reset
      setSelectedQuizAnswers({});
      setSubmittedQuizzes({});
      setPracticeAnswers({});
      setSubmittedPractices({});

      // Set SEO Metadata
      setSEOMetadata({
        title: lesson.seo_title || `${lesson.title} - ${language?.name || ''} Tutorial`,
        description: lesson.seo_description || `Learn ${lesson.title} in our free ${language?.name || ''} course. Example codes, inline quizzes, and interactive practice exercises.`,
        canonicalUrl: window.location.origin + `/tutorials/${langSlug}/${lesson.slug}`,
      });

      // 5. Scan Headings for Table of Contents after render
      setTimeout(() => {
        const container = document.getElementById('lesson-content-body');
        if (container) {
          const headings = container.querySelectorAll('h2, h3');
          const tocItems: any[] = [];
          headings.forEach((heading, idx) => {
            const text = heading.textContent || '';
            const id = heading.id || `heading-${idx}`;
            heading.id = id; // Force unique DOM ID
            const level = heading.tagName.toLowerCase() === 'h2' ? 2 : 3;
            tocItems.push({ id, text, level });
          });
          setToc(tocItems);
        }
      }, 300);
    }
  }, [lesson, langSlug, language]);

  // Load completed lessons list and scroll listeners
  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        try {
          const res = await tutorialsService.getUserProgress();
          setCompletedSlugs(res.completed_slugs);
        } catch (e) {
          console.error("Failed to load backend progress", e);
        }
      } else {
        try {
          const completed = JSON.parse(localStorage.getItem('tutorials_completed_lessons') || '[]');
          setCompletedSlugs(completed);
        } catch (e) {
          console.error(e);
        }
      }
    };
    loadProgress();

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
      setShowBackToTop(window.scrollY > 300);

      // Active Table of Contents Highlighter
      const container = document.getElementById('lesson-content-body');
      if (container) {
        const headings = container.querySelectorAll('h2, h3');
        let currentActive = '';
        const scrollPos = window.scrollY + 120;
        
        headings.forEach((heading) => {
          const top = (heading as HTMLElement).offsetTop;
          if (scrollPos >= top) {
            currentActive = heading.id;
          }
        });
        setActiveTocId(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  // Time tracker for views analytics
  useEffect(() => {
    if (lesson) {
      timerRef.current = Date.now();
      return () => {
        const timeSpent = Math.round((Date.now() - timerRef.current) / 1000);
        if (timeSpent >= 5) {
          tutorialsService.trackLessonView(lesson.id, timeSpent).catch(err => console.error(err));
        }
      };
    }
  }, [lesson]);

  // Next and Previous Lesson navigation calculators
  const sortedLessons = lessons ? [...lessons].sort((a, b) => a.display_order - b.display_order) : [];
  const currentIdx = sortedLessons.findIndex(l => l.slug === activeLessonSlug);
  const prevLesson = currentIdx > 0 ? sortedLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < sortedLessons.length - 1 ? sortedLessons[currentIdx + 1] : null;

  // Chapter progress calculations
  const chapLessons = lesson ? sortedLessons.filter(l => l.chapter === lesson.chapter) : [];
  const completedInChap = chapLessons.filter(l => completedSlugs.includes(`${langSlug}/${l.slug}`)).length;
  const completionRate = chapLessons.length > 0 ? Math.round((completedInChap / chapLessons.length) * 100) : 0;

  // SVG Radial circle calculations
  const radialRadius = 24;
  const radialCircumference = 2 * Math.PI * radialRadius;
  const strokeDashoffset = radialCircumference - (completionRate / 100) * radialCircumference;

  // Toggle lesson completion status
  const handleToggleCompletion = async () => {
    if (!lesson) return;
    const key = `${langSlug}/${lesson.slug}`;
    const isCompletedNow = !completedSlugs.includes(key);
    
    let updated: string[];
    if (completedSlugs.includes(key)) {
      updated = completedSlugs.filter(s => s !== key);
    } else {
      updated = [...completedSlugs, key];
    }
    setCompletedSlugs(updated);
    localStorage.setItem('tutorials_completed_lessons', JSON.stringify(updated));
    
    if (user) {
      try {
        await tutorialsService.completeLesson(lesson.id, isCompletedNow);
      } catch (e) {
        console.error("Failed to sync completion with backend", e);
      }
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = () => {
    if (!lesson) return;
    try {
      const bookmarksList = JSON.parse(localStorage.getItem('tutorials_bookmarks') || '[]');
      let updated: any[];
      if (isBookmarked) {
        updated = bookmarksList.filter((b: any) => !(b.langSlug === langSlug && b.lessonSlug === lesson.slug));
        setIsBookmarked(false);
      } else {
        updated = [
          ...bookmarksList,
          { langSlug, langName: language?.name || langSlug, lessonSlug: lesson.slug, lessonTitle: lesson.title }
        ];
        setIsBookmarked(true);
      }
      localStorage.setItem('tutorials_bookmarks', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Font adjustments
  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 1, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 1, 12));

  // Copy code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  // Download code file
  const handleDownloadCode = () => {
    const extensionMap: Record<string, string> = { python: 'py', javascript: 'js', html: 'html', css: 'css', cpp: 'cpp', c: 'c', java: 'java', sql: 'sql' };
    const ext = extensionMap[editorLang] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeLessonSlug || 'code'}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Run Code via backend Judge0 compiler
  const handleRunCode = async () => {
    if (editorLang === 'html') {
      setCodeOutput('Rendering HTML live preview...');
      return;
    }
    setIsRunning(true);
    setCodeOutput('Compiling and running code on remote Judge0 server...');
    try {
      const response = await publicApi.post('/tutorials/lessons/run-code/', {
        code,
        language_slug: activeLangTab,
        input_data: inputData
      });
      const data = response.data;
      if (data.stderr) {
        setCodeOutput(`ERROR (stderr):\n${data.stderr}`);
      } else if (data.compile_output) {
        setCodeOutput(`COMPILE ERROR:\n${data.compile_output}`);
      } else {
        setCodeOutput(data.stdout || 'Program completed with no output.');
      }
    } catch (e: any) {
      console.error(e);
      setCodeOutput(`Execution Error: ${e.response?.data?.error || e.message || 'Server connection failed.'}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Switch Multi-Language Tab
  const handleSwitchLanguageTab = (lang: string) => {
    setActiveLangTab(lang);
    setCode(codeMap[lang] || '');
    setEditorLang(mapSlugToMonacoLanguage(lang));
    setCodeOutput('');
  };

  // Share Lesson link
  const handleShareLesson = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Lesson URL copied to clipboard!');
  };

  // Print Lesson
  const handlePrintLesson = () => window.print();

  // Handle Quiz Option Click
  const handleQuizOptionClick = (quizId: number, option: string) => {
    if (submittedQuizzes[quizId]) return;
    setSelectedQuizAnswers(prev => ({ ...prev, [quizId]: option }));
  };

  // Trigger lightweight canvas-based confetti explosion
  const triggerConfetti = () => {
    const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const pieces: any[] = [];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    
    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height - 20,
        r: Math.random() * 5 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0
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
        
        if (p.y <= canvas.height) {
          active = true;
        }
        
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });
      
      if (active) {
        requestAnimationFrame(draw);
      }
    };
    
    draw();
  };

  const handleSubmitQuiz = (quizId: number) => {
    if (!selectedQuizAnswers[quizId]) return;
    setSubmittedQuizzes(prev => ({ ...prev, [quizId]: true }));
    
    // Check if all submitted quizzes are correct and trigger confetti
    setTimeout(() => {
      const rightOptions = lesson?.quizzes?.flatMap(q => q.questions || []) || [];
      const answersMap = { ...selectedQuizAnswers, [quizId]: selectedQuizAnswers[quizId] };
      
      const allDone = rightOptions.every(q => answersMap[q.id] === q.correct_option);
      if (allDone) {
        triggerConfetti();
      }
    }, 100);
  };

  const handleRetryQuiz = (quizId: number) => {
    setSelectedQuizAnswers(prev => { const next = { ...prev }; delete next[quizId]; return next; });
    setSubmittedQuizzes(prev => { const next = { ...prev }; delete next[quizId]; return next; });
  };

  // Handle Practice Questions
  const handlePracticeChange = (id: number, val: string) => {
    if (submittedPractices[id]?.showFeedback) return;
    setPracticeAnswers(prev => ({ ...prev, [id]: val }));
  };

  const handleSubmitPractice = (id: number, correctAnswer: string) => {
    const ans = practiceAnswers[id]?.trim().toLowerCase() || '';
    const correct = correctAnswer.trim().toLowerCase();
    const isCorrect = ans === correct;
    setSubmittedPractices(prev => ({ 
      ...prev, 
      [id]: { isCorrect, showFeedback: true } 
    }));
  };

  const handleRetryPractice = (id: number) => {
    setPracticeAnswers(prev => ({ ...prev, [id]: '' }));
    setSubmittedPractices(prev => { const next = { ...prev }; delete next[id]; return next; });
  };

  // Render Markdown to premium responsive HTML
  const renderMarkdown = (text: string) => {
    if (!text) return '';
    let parsed = text;
    // Glassmorphic Note containers
    parsed = parsed.replace(/^> Note:\s*(.*)$/gim, `
      <div class="my-6 p-5 bg-blue-500/5 dark:bg-blue-500/10 border-l-4 border-blue-500 rounded-r-2xl text-blue-900 dark:text-blue-200 backdrop-blur-md shadow-sm">
        <div class="flex items-center gap-1.5 font-black uppercase tracking-wider text-[11px] text-blue-600 dark:text-blue-400 mb-1.5">
          <span class="p-1 rounded-md bg-blue-500/10"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></span>
          Note Context
        </div>
        <p class="text-slate-800 dark:text-slate-300">$1</p>
      </div>
    `);
    
    // Glassmorphic Tip containers
    parsed = parsed.replace(/^> Tip:\s*(.*)$/gim, `
      <div class="my-6 p-5 bg-emerald-500/5 dark:bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-2xl text-emerald-900 dark:text-emerald-200 backdrop-blur-md shadow-sm">
        <div class="flex items-center gap-1.5 font-black uppercase tracking-wider text-[11px] text-emerald-600 dark:text-emerald-400 mb-1.5">
          <span class="p-1 rounded-md bg-emerald-500/10"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg></span>
          Pro Tip
        </div>
        <p class="text-slate-800 dark:text-slate-300">$1</p>
      </div>
    `);

    // Glassmorphic Warning containers
    parsed = parsed.replace(/^> Warning:\s*(.*)$/gim, `
      <div class="my-6 p-5 bg-amber-500/5 dark:bg-amber-500/10 border-l-4 border-amber-500 rounded-r-2xl text-amber-900 dark:text-amber-200 backdrop-blur-md shadow-sm">
        <div class="flex items-center gap-1.5 font-black uppercase tracking-wider text-[11px] text-amber-600 dark:text-amber-400 mb-1.5">
          <span class="p-1 rounded-md bg-amber-500/10"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></span>
          Warning / Caution
        </div>
        <p class="text-slate-800 dark:text-slate-300">$1</p>
      </div>
    `);
    
    // Headers with specific IDs for table of contents highlights
    parsed = parsed.replace(/^###\s*(.*)$/gim, (_, p1) => {
      const headingId = p1.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return `<h4 id="${headingId}" class="text-base font-bold text-slate-805 dark:text-slate-100 mt-6 mb-2">${p1}</h4>`;
    });
    parsed = parsed.replace(/^##\s*(.*)$/gim, (_, p1) => {
      const headingId = p1.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return `<h3 id="${headingId}" class="text-xl font-black text-slate-905 dark:text-white mt-8 mb-4 border-b border-slate-100 dark:border-slate-850 pb-2.5">${p1}</h3>`;
    });
    parsed = parsed.replace(/^#\s*(.*)$/gim, (_, p1) => {
      const headingId = p1.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return `<h2 id="${headingId}" class="text-2xl font-black text-slate-950 dark:text-white mt-10 mb-4">${p1}</h2>`;
    });

    // Bold, Italic, inline code
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    parsed = parsed.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-red-500 font-mono text-[13px]">$1</code>');
    
    // Tables parser
    parsed = parsed.replace(/\|(.+)\|/g, (_, content) => {
      const cells = content.split('|').map((c: string) => c.trim());
      const isHeader = cells.every((c: string) => c.startsWith('---'));
      if (isHeader) return '';
      return `<tr>${cells.map((c: string) => `<td class="px-4 py-2.5 border-b border-slate-100 dark:border-slate-850">${c}</td>`).join('')}</tr>`;
    });
    
    parsed = parsed.replace(/\n/g, '<br />');
    return parsed;
  };

  if (lessonLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 dark:bg-[#07080d]">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-3" size={36} />
          <p className="text-slate-500 font-medium">Loading lesson contents...</p>
        </div>
      </div>
    );
  }

  if (lessonError || !lesson) {
    return (
      <div className="max-w-xl mx-auto my-12 text-center p-8 bg-white dark:bg-[#0c0e17] border border-slate-205 dark:border-slate-850 rounded-2xl">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Lesson Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">We couldn't retrieve this lesson contents.</p>
        <button onClick={() => navigate('/tutorials')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow hover:bg-blue-700">
          Back to Tutorials
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-grow bg-white dark:bg-[#07080d] transition-colors duration-200 print:bg-white print:text-black">
      {/* Confetti canvas animation */}
      <canvas id="confetti-canvas" className="fixed inset-0 pointer-events-none z-50 w-full h-full" />

      {/* Scroll progress dial bar */}
      <div 
        className="fixed top-16 left-0 right-0 h-1 bg-blue-600 z-50 transition-all duration-100 print:hidden"
        style={{ width: `${scrollProgress}%` }}
      ></div>

      {/* LEFT SIDEBAR: Dynamic chapters & outline list */}
      <aside className="hidden lg:block w-72 border-r border-slate-200 dark:border-slate-850 bg-white/70 dark:bg-[#0b0c14]/80 backdrop-blur-md sticky top-16 h-[calc(100vh-4rem)] shrink-0 overflow-y-auto select-none p-4 space-y-4 print:hidden">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <BookMarked className="text-blue-650" size={18} />
          <h3 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate">
            {language?.name} Outline
          </h3>
        </div>

        <div className="space-y-4 pt-2">
          {chapters?.map((chap) => {
            const chapLessons = sortedLessons.filter(l => l.chapter === chap.id);
            if (chapLessons.length === 0) return null;

            return (
              <div key={chap.id} className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 block">
                  {chap.name}
                </span>
                <div className="space-y-0.5">
                  {chapLessons.map((l) => {
                    const isActive = l.slug === activeLessonSlug;
                    const isCompleted = completedSlugs.includes(`${langSlug}/${l.slug}`);
                    return (
                      <Link
                        key={l.id}
                        to={`/tutorials/${langSlug}/${l.slug}`}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                          isActive
                            ? 'bg-blue-50/80 text-blue-650 dark:bg-blue-950/30 dark:text-blue-450 border-l-4 border-blue-600 dark:border-blue-500 font-bold shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60 border-l-4 border-transparent'
                        }`}
                      >
                        <span className="truncate mr-2">{l.title}</span>
                        {isCompleted && (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 border border-emerald-600 shadow-sm animate-scale-in">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* CORE SPLIT GRID LAYOUT */}
      <div className="flex-1 flex min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* CENTER READER CONTENT: GitBook constraints max-w-3xl */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-3xl border-r border-slate-100 dark:border-slate-850/50 print:p-0 print:border-none">
          {/* Breadcrumb row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-850 print:hidden">
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-slate-400 dark:text-slate-550">
              <Link to="/tutorials" className="hover:text-blue-500 transition-colors">Tutorials</Link>
              <ChevronRight size={12} />
              <Link to={`/tutorials/${langSlug}`} className="hover:text-blue-500 transition-colors capitalize">{langSlug}</Link>
              <ChevronRight size={12} />
              <span className="text-slate-650 dark:text-slate-350 truncate">{lesson.title}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Font settings */}
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-slate-50/50 dark:bg-slate-900/50">
                <button onClick={decreaseFontSize} className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded cursor-pointer"><Type size={13} className="scale-75" /></button>
                <span className="text-[10px] font-bold px-1.5 text-slate-400 font-mono">{fontSize}px</span>
                <button onClick={increaseFontSize} className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded cursor-pointer"><Type size={15} /></button>
              </div>
              <button onClick={handlePrintLesson} className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-slate-805 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-sm"><Printer size={13} /></button>
              <button onClick={handleShareLesson} className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-slate-805 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-sm"><Share2 size={13} /></button>
              <button onClick={handleToggleBookmark} className={`p-2 border rounded-lg cursor-pointer transition-all shadow-sm ${isBookmarked ? 'border-indigo-200 bg-indigo-500/10 text-indigo-500' : 'border-slate-200 dark:border-slate-800 text-slate-505 bg-slate-50/50 dark:bg-slate-900/50'}`}>{isBookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}</button>
            </div>
          </div>

          {/* Document header info */}
          <div className="my-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {language?.name}
              </span>
              <span className="text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Clock size={11} /> {lesson.estimated_reading_time} min read
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white leading-tight">
              {lesson.title}
            </h1>
          </div>

          {/* Reader Body content container */}
          <div id="lesson-content-body" className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-300 leading-relaxed space-y-6">
            <div 
              style={{ fontSize: `${fontSize}px` }} 
              dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.content || '') }} 
            />

            {/* Blocks renderer */}
            {lesson.blocks && lesson.blocks.length > 0 && (
              <div className="space-y-6" style={{ fontSize: `${fontSize}px` }}>
                {lesson.blocks.map((block) => (
                  <div key={block.id}>
                    {block.block_type === 'paragraph' && (
                      <p className="leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }} />
                    )}
                    {block.block_type === 'heading' && (
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1" dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }} />
                    )}
                    {block.block_type === 'note' && (
                      <div className="p-5 bg-blue-500/5 dark:bg-blue-500/10 border-l-4 border-blue-500 rounded-r-2xl text-blue-900 dark:text-blue-200">
                        <span className="font-bold block uppercase tracking-wider text-xs mb-1">Note Context</span>
                        <p dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }} />
                      </div>
                    )}
                    {block.block_type === 'tip' && (
                      <div className="p-5 bg-emerald-500/5 dark:bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-2xl text-emerald-900 dark:text-emerald-200">
                        <span className="font-bold block uppercase tracking-wider text-xs mb-1">Pro Tip</span>
                        <p dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }} />
                      </div>
                    )}
                    {block.block_type === 'warning' && (
                      <div className="p-5 bg-amber-500/5 dark:bg-amber-500/10 border-l-4 border-amber-500 rounded-r-2xl text-amber-900 dark:text-amber-200">
                        <span className="font-bold block uppercase tracking-wider text-xs mb-1">Caution</span>
                        <p dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }} />
                      </div>
                    )}
                    {block.block_type === 'code' && (
                      <div className="my-4 bg-slate-900 rounded-xl overflow-hidden shadow-md font-mono border border-slate-800">
                        <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center bg-slate-950/70">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{block.data?.language || 'Code'}</span>
                          <button onClick={() => { navigator.clipboard.writeText(block.content); alert('Copied!'); }} className="text-slate-400 hover:text-white cursor-pointer"><Copy size={12} /></button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-xs text-slate-200"><code>{block.content}</code></pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INTERACTIVE CODE WORKSPACE EDITOR */}
          {code && (
            <div className="my-8 bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-lg print:hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-850 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center gap-3">
                  <Code className="text-blue-500" size={16} />
                  {/* MULTI-LANGUAGE TABS SELECTOR */}
                  <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-850 pl-3">
                    {Object.keys(codeMap).map(tabKey => (
                      <button
                        key={tabKey}
                        onClick={() => handleSwitchLanguageTab(tabKey)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                          activeLangTab === tabKey
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-850'
                        }`}
                      >
                        {tabKey}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-550 cursor-pointer shadow-sm">{isDarkMode ? <Sun size={13} /> : <Moon size={13} />}</button>
                  <button onClick={handleCopyCode} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-550 cursor-pointer shadow-sm"><Copy size={13} /></button>
                  <button onClick={handleDownloadCode} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-550 cursor-pointer shadow-sm"><Download size={13} /></button>
                  <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-550 cursor-pointer shadow-sm">{isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}</button>
                </div>
              </div>

              {/* Editor Workspace Split Panels */}
              <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-4' : ''}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-200 dark:border-slate-850 min-h-[300px]">
                  {/* Monaco Editor source writer */}
                  <div className="relative border-r border-slate-200 dark:border-slate-850 flex flex-col min-h-[300px]">
                    <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                      <span>Source Editor ({editorLang})</span>
                    </div>
                    <div className="flex-1">
                      <Editor
                        height="300px"
                        language={editorLang}
                        theme={isDarkMode ? 'vs-dark' : 'light'}
                        value={code}
                        onChange={(val) => setCode(val || '')}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 13,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                        }}
                      />
                    </div>
                  </div>

                  {/* Terminal run screen */}
                  <div className="bg-slate-950 text-slate-100 font-mono text-xs p-4 flex flex-col justify-between min-h-[300px]">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 border-b border-slate-900 pb-1.5 tracking-wider uppercase">
                        <span>Remote Output Terminal (via Judge0)</span>
                        {isRunning && <span className="text-blue-500 animate-pulse">executing...</span>}
                      </div>
                      {editorLang === 'html' ? (
                        <div className="bg-white rounded-lg p-2 min-h-[200px] border border-slate-800">
                          <iframe title="HTML Output" srcDoc={code} className="w-full h-[200px] border-none bg-white" sandbox="allow-scripts" />
                        </div>
                      ) : (
                        <pre className="overflow-auto max-h-[200px] whitespace-pre-wrap select-all text-emerald-400 font-mono text-xs">
                          {codeOutput || 'Click Run Code below to compile remotely on Judge0...'}
                        </pre>
                      )}
                    </div>

                    {editorLang !== 'html' && (
                      <div className="pt-4 border-t border-slate-900/60 mt-4">
                        <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Standard Inputs (stdin)</label>
                        <input
                          type="text"
                          value={inputData}
                          onChange={(e) => setInputData(e.target.value)}
                          placeholder="Provide input arguments..."
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-650 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border-t border-slate-150 dark:border-slate-850 flex justify-between items-center">
                  <button onClick={() => setCode(codeMap[activeLangTab] || '')} className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-205 cursor-pointer">
                    Reset Starter Code
                  </button>
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {isRunning ? <RefreshCw className="animate-spin" size={13} /> : <Play size={13} />}
                    Run Code
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* INLINE QUIZZES */}
          {lesson.quizzes && lesson.quizzes.length > 0 && (
            <div className="my-8 space-y-6 print:hidden">
              <div className="flex items-center gap-2 border-b border-slate-150 dark:border-slate-850 pb-2">
                <QuizIcon className="text-amber-500" size={20} />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Check Your Progress</h3>
              </div>

              {lesson.quizzes.map((quiz) => (
                <div key={quiz.id} className="bg-slate-50/50 dark:bg-slate-950/15 border border-slate-200 dark:border-slate-855 rounded-2xl p-6 space-y-6">
                  <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-200 uppercase tracking-wider">{quiz.title}</h4>
                  
                  {quiz.questions?.map((q) => {
                    const isSubmitted = submittedQuizzes[q.id];
                    const selectedOpt = selectedQuizAnswers[q.id];
                    const isCorrect = selectedOpt === q.correct_option;

                    return (
                      <div key={q.id} className="space-y-3">
                        <p className="font-semibold text-slate-850 dark:text-slate-150 text-sm">
                          {q.display_order}. {q.question_text}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {([
                            { key: 'A', text: q.option_a },
                            { key: 'B', text: q.option_b },
                            { key: 'C', text: q.option_c },
                            { key: 'D', text: q.option_d },
                          ]).map((opt) => {
                            const isSelected = selectedOpt === opt.key;
                            const isRightAnswer = opt.key === q.correct_option;
                            
                            let btnStyle = 'border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-[#0c0e17] dark:hover:bg-slate-900';
                            if (isSubmitted) {
                              if (isSelected) {
                                btnStyle = isRightAnswer 
                                  ? 'border-emerald-350 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900 shadow-sm shadow-emerald-500/5'
                                  : 'border-red-350 bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900 shadow-sm shadow-red-500/5';
                              } else if (isRightAnswer) {
                                btnStyle = 'border-emerald-350 bg-emerald-50 text-emerald-805 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900';
                              }
                            } else if (isSelected) {
                              btnStyle = 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900 text-blue-600 dark:text-blue-400 font-bold';
                            }

                            return (
                              <button
                                key={opt.key}
                                onClick={() => handleQuizOptionClick(q.id, opt.key)}
                                disabled={isSubmitted}
                                className={`flex items-start text-left p-3.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all hover:scale-[1.01] duration-150 ${btnStyle}`}
                              >
                                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] mr-2 shrink-0">
                                  {opt.key}
                                </span>
                                <span className="flex-1">{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>

                        {isSubmitted && (
                          <div className="p-4 rounded-xl border mt-3 animate-slide-up bg-white/40 dark:bg-[#0c0e17]/50 border-slate-200 dark:border-slate-850">
                            <div className="flex items-center gap-2 mb-2">
                              {isCorrect ? (
                                <><CheckCircle2 size={16} className="text-emerald-500" /><span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">Correct!</span></>
                              ) : (
                                <><XCircle size={16} className="text-red-500" /><span className="font-bold text-xs text-red-650 dark:text-red-400">Incorrect choice</span></>
                              )}
                            </div>
                            {q.explanation && <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-mono">{q.explanation}</p>}
                            <button onClick={() => handleRetryQuiz(q.id)} className="mt-3 text-[10px] text-slate-450 hover:text-slate-850 dark:hover:text-slate-250 font-bold flex items-center gap-1 cursor-pointer"><RefreshCw size={10} /> Retry Question</button>
                          </div>
                        )}

                        {!isSubmitted && selectedOpt && (
                          <button onClick={() => handleSubmitQuiz(q.id)} className="px-4 py-1.5 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-750 text-white rounded-lg text-xs font-bold shadow cursor-pointer transition-all">Submit Answer</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* INLINE PRACTICES */}
          {lesson.practices && lesson.practices.length > 0 && (
            <div className="my-8 space-y-6 print:hidden">
              <div className="flex items-center gap-2 border-b border-slate-150 dark:border-slate-855 pb-2">
                <Award className="text-indigo-500" size={20} />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Tasks</h3>
              </div>

              {lesson.practices.map((p) => {
                const feedback = submittedPractices[p.id];
                const ansVal = practiceAnswers[p.id] || '';

                return (
                  <div key={p.id} className="bg-slate-50/50 dark:bg-slate-950/15 border border-slate-200 dark:border-slate-855 rounded-2xl p-6 space-y-4">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 font-bold uppercase tracking-wider">
                        {p.question_type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-850 dark:text-slate-150 text-sm">
                      {p.display_order}. {p.question_text}
                    </p>

                    {p.code_snippet && (
                      <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-900 max-h-48 select-all">
                        <pre><code>{p.code_snippet}</code></pre>
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Your Answer</label>
                      <input
                        type="text"
                        value={ansVal}
                        onChange={(e) => handlePracticeChange(p.id, e.target.value)}
                        disabled={!!feedback?.showFeedback}
                        placeholder="Type response here..."
                        className="w-full bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-805 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />

                      {feedback?.showFeedback && (
                        <div className="p-4 rounded-xl border mt-3 bg-white/40 dark:bg-[#0c0e17]/50 border-slate-200 dark:border-slate-850">
                          <div className="flex items-center gap-2 mb-2">
                            {feedback.isCorrect ? (
                              <><CheckCircle2 size={16} className="text-emerald-500" /><span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">Correct!</span></>
                            ) : (
                              <><XCircle size={16} className="text-red-500" /><span className="font-bold text-xs text-red-650 dark:text-red-400">Incorrect</span></>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Expected Answer: <code className="text-emerald-500 font-bold font-mono">{p.correct_answer}</code></p>
                          {p.explanation && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-mono">{p.explanation}</p>}
                          <button onClick={() => handleRetryPractice(p.id)} className="mt-3 text-[10px] text-slate-450 hover:text-slate-850 dark:hover:text-slate-250 font-bold flex items-center gap-1 cursor-pointer"><RefreshCw size={10} /> Retry Practice</button>
                        </div>
                      )}

                      {!feedback?.showFeedback && ansVal.trim() && (
                        <button onClick={() => handleSubmitPractice(p.id, p.correct_answer)} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg text-xs font-semibold shadow cursor-pointer transition-all">Submit Practice</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* BOTTOM NAVIGATION ROW */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-slate-100 dark:border-slate-850 print:hidden">
            {prevLesson ? (
              <Link
                to={`/tutorials/${langSlug}/${prevLesson.slug}`}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider bg-slate-50 hover:bg-slate-100 border border-slate-150 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 dark:border-slate-800 px-4 py-2.5 rounded-xl"
              >
                <ChevronLeft size={16} /> Previous Lesson
              </Link>
            ) : (
              <div />
            )}

            <button
              onClick={handleToggleCompletion}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm border cursor-pointer ${
                completedSlugs.includes(`${langSlug}/${lesson.slug}`)
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                  : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-blue-500/10 hover:shadow-blue-500/20 dark:bg-blue-500 dark:hover:bg-blue-650'
              }`}
            >
              <Check size={14} strokeWidth={3} />
              {completedSlugs.includes(`${langSlug}/${lesson.slug}`) ? 'Completed' : 'Mark Completed'}
            </button>

            {nextLesson ? (
              <Link
                to={`/tutorials/${langSlug}/${nextLesson.slug}`}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider bg-slate-50 hover:bg-slate-100 border border-slate-150 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 dark:border-slate-800 px-4 py-2.5 rounded-xl"
              >
                Next Lesson <ChevronRight size={16} />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </main>

        {/* FLOATING RIGHT SIDEBAR: Table of Contents & Chapter Radial Progress Dial */}
        <aside className="hidden xl:block w-64 p-6 space-y-8 sticky top-16 h-[calc(100vh-4rem)] shrink-0 overflow-y-auto print:hidden">
          {/* Circular Chapter radial progress dial */}
          <div className="bg-slate-50/50 dark:bg-slate-950/15 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 text-center space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Chapter Completion</span>
            
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r={radialRadius} className="text-slate-200 dark:text-slate-800/80" strokeWidth="4" stroke="currentColor" fill="transparent" />
                <circle cx="32" cy="32" r={radialRadius} className="text-emerald-500 transition-all duration-300" strokeWidth="4" strokeDasharray={radialCircumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" stroke="currentColor" fill="transparent" />
              </svg>
              <span className="absolute text-xs font-black font-mono text-slate-800 dark:text-slate-205">{completionRate}%</span>
            </div>
            
            <span className="text-[10px] text-slate-500 font-bold block">{completedInChap} of {chapLessons.length} Completed</span>
          </div>

          {/* Table of Contents outline */}
          {toc.length > 0 && (
            <div className="space-y-4">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block border-b border-slate-100 dark:border-slate-800 pb-2">On this page</span>
              
              <nav className="space-y-2">
                {toc.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const el = document.getElementById(item.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`block w-full text-left text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                      item.level === 3 ? 'pl-3' : ''
                    } ${
                      activeTocId === item.id
                        ? 'text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-550 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {item.text}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </aside>

      </div>

      {/* FLOAT BACK TO TOP BUTTON */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/10 cursor-pointer transition-all z-40 animate-scale-in border border-blue-500 print:hidden"
          title="Back to Top"
        >
          <ArrowUp size={16} />
        </button>
      )}
    </div>
  );
};

export default TutorialLearningPage;

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, CheckCircle, Flag, ChevronLeft, ChevronRight, 
  Play, RotateCcw, Send, AlertTriangle, Check, X, 
  Code, BookOpen, Layers, Terminal, Sparkles, Loader2,
  Maximize2, Minimize2, CheckSquare, ShieldAlert
} from 'lucide-react';
import { 
  internshipService, 
  type AttemptEngineState, 
  type AssessmentMCQQuestion, 
  type AssessmentCodingQuestion, 
  type QuestionResponse, 
  type AttemptResult 
} from '../../services/internship';
import { useTheme } from '../../context/ThemeContext';
import { setSEOMetadata } from '../../utils/seo';

const InternshipAssessmentEngine: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Assessment Engine State
  const [engineState, setEngineState] = useState<AttemptEngineState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluatingStep, setEvaluatingStep] = useState(0);

  // Active Navigation & Question Index
  // 0 to mcq_questions.length - 1 => MCQs
  // mcq_questions.length to total_questions - 1 => Coding Questions
  const [currentIdx, setCurrentIdx] = useState(0);
  const [activeSection, setActiveSection] = useState<'mcq' | 'coding'>('mcq');

  // Local Responses Store for instantaneous UI responsiveness
  const [localResponses, setLocalResponses] = useState<Record<number, {
    selected_options?: any[];
    code?: string;
    language_slug?: string;
    is_marked_for_review?: boolean;
    is_answered?: boolean;
  }>>({});

  // Coding Execution State
  const [activeCodingLang, setActiveCodingLang] = useState('python');
  const [codeExecuting, setCodeExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [activeTestTab, setActiveTestTab] = useState<'problem' | 'output'>('problem');

  // Timer & Proctoring
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(3600); // 60 mins default
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Listen to browser fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (!fs && !loading && !submitting) {
        setShowFullscreenPrompt(true);
      } else {
        setShowFullscreenPrompt(false);
      }
    };

    // Auto-enter fullscreen on first user click if not already
    const handleFirstInteraction = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      window.removeEventListener('click', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [loading, submitting]);

  const enterFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Could not enter fullscreen:', err);
      });
    }
    setShowFullscreenPrompt(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      enterFullscreen();
    } else {
      document.exitFullscreen().catch(err => {
        console.warn('Could not exit fullscreen:', err);
      });
    }
  };

  // Load Attempt Engine State
  useEffect(() => {
    setSEOMetadata({
      title: 'CodexPetra Internship Assessment Engine',
      description: 'Production Assessment Engine for CodexPetra Internship Program.'
    });

    const loadState = async () => {
      if (!attemptId) return;
      try {
        setLoading(true);
        const data = await internshipService.getAttemptEngineState(parseInt(attemptId));
        setEngineState(data);

        // If already completed, redirect directly to result
        if (data.status === 'completed') {
          navigate(`/internships/assessment/${attemptId}/result`);
          return;
        }

        // Initialize local response state from backend responses
        const initResponses: Record<number, any> = {};
        data.responses.forEach(r => {
          const qId = r.question_type === 'mcq' ? r.mcq_question : r.coding_question;
          if (qId !== undefined) {
            initResponses[qId] = {
              selected_options: r.selected_options || [],
              code: r.code || '',
              language_slug: r.language_slug || 'python',
              is_marked_for_review: r.is_marked_for_review || false,
              is_answered: r.is_answered || false
            };
          }
        });
        setLocalResponses(initResponses);

        // Compute elapsed time from started_at
        if (data.started_at) {
          const started = new Date(data.started_at).getTime();
          const now = Date.now();
          const elapsed = Math.floor((now - started) / 1000);
          const totalSecs = (data.duration_minutes || 60) * 60;
          const remaining = Math.max(0, totalSecs - elapsed);
          setTimeLeftSeconds(remaining);
        }
      } catch (err) {
        console.error('Error initializing assessment engine', err);
      } finally {
        setLoading(false);
      }
    };

    loadState();
  }, [attemptId, navigate]);

  // Live Timer
  useEffect(() => {
    if (loading || submitting) return;

    timerRef.current = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, submitting]);

  // Tab switch warning listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && engineState && attemptId) {
        internshipService.recordWarning(parseInt(attemptId)).catch(console.error);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [engineState, attemptId]);

  const mcqs = engineState?.mcq_questions || [];
  const codings = engineState?.coding_questions || [];
  const totalQuestions = mcqs.length + codings.length;

  // Determine current active question
  const isCurrentMCQ = currentIdx < mcqs.length;
  const currentMCQ = isCurrentMCQ ? mcqs[currentIdx] : null;
  const currentCoding = !isCurrentMCQ ? codings[currentIdx - mcqs.length] : null;
  const activeQuestionId = isCurrentMCQ ? currentMCQ?.id : currentCoding?.id;

  // Format Timer String (MM:SS)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // MCQ Selection Handler
  const handleSelectMCQOption = async (option: any) => {
    if (!currentMCQ || !attemptId) return;
    const qId = currentMCQ.id;
    const currentSelected = localResponses[qId]?.selected_options || [];
    
    // Single select option
    const newSelected = [option];
    const isMarked = localResponses[qId]?.is_marked_for_review || false;

    setLocalResponses(prev => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        selected_options: newSelected,
        is_answered: true
      }
    }));

    // Auto-save to backend asynchronously
    try {
      await internshipService.saveMCQAnswer(parseInt(attemptId), {
        question_id: qId,
        selected_options: newSelected,
        is_marked_for_review: isMarked
      });
    } catch (err) {
      console.error('Error auto-saving MCQ response', err);
    }
  };

  // Toggle Mark for Review
  const handleToggleReview = async () => {
    if (!activeQuestionId || !attemptId) return;
    const currentMarked = !localResponses[activeQuestionId]?.is_marked_for_review;

    setLocalResponses(prev => ({
      ...prev,
      [activeQuestionId]: {
        ...prev[activeQuestionId],
        is_marked_for_review: currentMarked
      }
    }));

    if (isCurrentMCQ) {
      internshipService.saveMCQAnswer(parseInt(attemptId), {
        question_id: activeQuestionId,
        selected_options: localResponses[activeQuestionId]?.selected_options || [],
        is_marked_for_review: currentMarked
      }).catch(console.error);
    } else {
      internshipService.saveCodeAnswer(parseInt(attemptId), {
        question_id: activeQuestionId,
        code: localResponses[activeQuestionId]?.code || '',
        language_slug: activeCodingLang,
        is_marked_for_review: currentMarked
      }).catch(console.error);
    }
  };

  // Code Change Handler
  const handleCodeChange = (codeVal: string) => {
    if (!currentCoding || !attemptId) return;
    const qId = currentCoding.id;

    setLocalResponses(prev => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        code: codeVal,
        language_slug: activeCodingLang,
        is_answered: codeVal.trim().length > 0
      }
    }));
  };

  // Run Code against Sample Test Cases
  const handleRunCode = async () => {
    if (!currentCoding || !attemptId) return;
    const qId = currentCoding.id;
    const code = localResponses[qId]?.code || currentCoding.starter_code_parsed?.[activeCodingLang] || '';

    try {
      setCodeExecuting(true);
      setActiveTestTab('output');
      const result = await internshipService.runCode(parseInt(attemptId), {
        question_id: qId,
        code: code,
        language_slug: activeCodingLang
      });
      setExecutionResult(result);
    } catch (err: any) {
      console.error('Run code error', err);
      setExecutionResult({
        status: 'Error',
        error_message: 'Failed to connect to execution server. Please try again.'
      });
    } finally {
      setCodeExecuting(false);
    }
  };

  // Save Code Solution
  const handleSaveCode = async () => {
    if (!currentCoding || !attemptId) return;
    const qId = currentCoding.id;
    const code = localResponses[qId]?.code || '';

    try {
      await internshipService.saveCodeAnswer(parseInt(attemptId), {
        question_id: qId,
        code: code,
        language_slug: activeCodingLang,
        is_marked_for_review: localResponses[qId]?.is_marked_for_review || false
      });
    } catch (err) {
      console.error('Error saving code', err);
    }
  };

  // Navigate to Question
  const goToQuestion = (index: number) => {
    // If leaving a coding problem, auto-save code
    if (!isCurrentMCQ) {
      handleSaveCode();
    }
    setCurrentIdx(index);
    setActiveSection(index < mcqs.length ? 'mcq' : 'coding');
    setExecutionResult(null);
    setActiveTestTab('problem');
  };

  // Save & Next
  const handleNext = () => {
    if (!isCurrentMCQ) {
      handleSaveCode();
    }
    if (currentIdx < totalQuestions - 1) {
      goToQuestion(currentIdx + 1);
    }
  };

  // Final Submission Flow with Evaluation Animation
  const handleAutoSubmit = () => {
    handleSubmitAssessment();
  };

  const handleSubmitAssessment = async () => {
    if (!attemptId) return;
    try {
      setShowSubmitModal(false);
      setSubmitting(true);

      // Trigger multi-step evaluation animation
      setEvaluatingStep(1); // Evaluating MCQs
      setTimeout(() => setEvaluatingStep(2), 700); // Evaluating Coding
      setTimeout(() => setEvaluatingStep(3), 1400); // Score calculated
      setTimeout(() => setEvaluatingStep(4), 2100); // Finalizing result

      const timeSpent = (engineState?.duration_minutes || 60) * 60 - timeLeftSeconds;
      const result = await internshipService.submitAssessment(parseInt(attemptId), Math.max(timeSpent, 60));

      setTimeout(() => {
        navigate(`/internships/assessment/${attemptId}/result`);
      }, 2500);
    } catch (err) {
      console.error('Submission failed', err);
      setSubmitting(false);
      alert('Failed to submit assessment. Please check your connection and try again.');
    }
  };

  // Count answered and flagged
  const answeredCount = Object.values(localResponses).filter(r => r.is_answered).length;
  const markedCount = Object.values(localResponses).filter(r => r.is_marked_for_review).length;
  const unansweredCount = totalQuestions - answeredCount;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-950 text-white">
        <div className="w-10 h-10 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Launching Assessment Engine...
        </span>
      </div>
    );
  }

  // --- SUBMITTING / EVALUATION OVERLAY ---
  if (submitting) {
    return (
      <div className="min-h-screen bg-[#080912] text-white flex flex-col items-center justify-center p-6 select-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0e101f] border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Assessment Submitted
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Evaluating your responses & calculating merit scholarship eligibility...
            </p>
          </div>

          {/* Animated Evaluation Checklist */}
          <div className="space-y-3 text-left text-xs font-semibold">
            <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${evaluatingStep >= 1 ? 'bg-blue-950/40 text-blue-300 border border-blue-800/60' : 'text-slate-500'}`}>
              {evaluatingStep >= 1 ? <Check size={16} className="text-emerald-400" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-600 animate-spin" />}
              <span>MCQ responses evaluated</span>
            </div>

            <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${evaluatingStep >= 2 ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/60' : 'text-slate-500'}`}>
              {evaluatingStep >= 2 ? <Check size={16} className="text-emerald-400" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-600 animate-spin" />}
              <span>Coding submissions evaluated against test cases</span>
            </div>

            <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${evaluatingStep >= 3 ? 'bg-purple-950/40 text-purple-300 border border-purple-800/60' : 'text-slate-500'}`}>
              {evaluatingStep >= 3 ? <Check size={16} className="text-emerald-400" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-600 animate-spin" />}
              <span>Overall score & scholarship rule matched</span>
            </div>

            <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${evaluatingStep >= 4 ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60' : 'text-slate-500'}`}>
              {evaluatingStep >= 4 ? <Check size={16} className="text-emerald-400" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-600 animate-spin" />}
              <span>Preparing your score card...</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden flex flex-col bg-slate-100 dark:bg-[#07080f] text-slate-900 dark:text-slate-100 select-none z-50">
      
      {/* FULL SCREEN WARNING BANNER (When student exits full screen) */}
      {showFullscreenPrompt && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-extrabold flex items-center justify-between shadow-md shrink-0 z-50 animate-fadeIn">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>Proctored Environment: Full screen mode is required for this examination.</span>
          </div>
          <button
            type="button"
            onClick={enterFullscreen}
            className="px-3 py-1 bg-slate-950 text-white rounded-lg text-xs font-black hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Enter Full Screen
          </button>
        </div>
      )}

      {/* 1. TOP HEADER BAR */}
      <header className="sticky top-0 z-40 h-14 bg-white dark:bg-[#0b0c16] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-sm shrink-0">
        
        {/* Brand & Assessment Title */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
            CP
          </div>
          <div>
            <h1 className="font-extrabold text-xs sm:text-sm text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
              <span>{engineState?.assessment_title || 'CodexPetra Assessment'}</span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-slate-400 font-mono">
                [{engineState?.application_details?.application_id}]
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Question Counter */}
        <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300 hidden md:flex items-center gap-1.5">
          <span>Question</span>
          <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-mono font-black">
            {currentIdx + 1}
          </span>
          <span>of {totalQuestions}</span>
        </div>

        {/* Right: Sticky Countdown Timer, Fullscreen Toggle & Submit CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Full Screen Toggle Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                : 'bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 animate-pulse'
            }`}
            title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
          </button>

          {/* Countdown Timer */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-mono font-extrabold transition-colors ${
            timeLeftSeconds < 300 
              ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 animate-pulse' 
              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
          }`}>
            <Clock size={14} className={timeLeftSeconds < 300 ? 'text-red-500' : 'text-blue-500'} />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          {/* Submit Test Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Submit Test</span>
            <Send size={12} />
          </button>
        </div>
      </header>

      {/* 2. MAIN SPLIT ASSESSMENT ENGINE BODY */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT / SIDEBAR: QUESTION PALETTE */}
        <aside className="w-full md:w-72 bg-white dark:bg-[#0b0c16] border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 p-4 space-y-4 overflow-y-auto">
          
          {/* Section Selector Tabs */}
          {codings.length > 0 ? (
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-bold">
              <button
                onClick={() => {
                  setActiveSection('mcq');
                  goToQuestion(0);
                }}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeSection === 'mcq' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                MCQs ({mcqs.length})
              </button>
              <button
                onClick={() => {
                  setActiveSection('coding');
                  goToQuestion(mcqs.length);
                }}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeSection === 'coding' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Coding ({codings.length})
              </button>
            </div>
          ) : (
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-center">
              <span className="text-xs font-black text-blue-700 dark:text-blue-300">
                Full Stack Assessment ({mcqs.length} MCQs)
              </span>
            </div>
          )}

          {/* Question Navigator Grid */}
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              {activeSection === 'mcq' ? 'Aptitude & Concept MCQs' : 'Coding Problems'}
            </span>

            <div className="grid grid-cols-5 gap-2">
              {(activeSection === 'mcq' ? mcqs : codings).map((q, localIdx) => {
                const globalIdx = activeSection === 'mcq' ? localIdx : localIdx + mcqs.length;
                const isCurrent = currentIdx === globalIdx;
                const qResp = localResponses[q.id];
                const isAnswered = qResp?.is_answered;
                const isMarked = qResp?.is_marked_for_review;

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(globalIdx)}
                    className={`h-9 rounded-xl font-mono text-xs font-extrabold transition-all relative flex items-center justify-center cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105 z-10'
                        : isMarked
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
                        : isAnswered
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span>{(globalIdx + 1).toString().padStart(2, '0')}</span>
                    {isMarked && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                    {isAnswered && !isCurrent && (
                      <span className="absolute bottom-0.5 right-1 text-[8px]">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Palette Legend */}
          <div className="pt-3 border-t border-slate-150 dark:border-slate-800/80 space-y-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-400" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-blue-600" />
              <span>Current Question</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-amber-100 dark:bg-amber-950 border border-amber-400" />
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700" />
              <span>Unanswered</span>
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span>Answered:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{answeredCount} / {totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span>Marked:</span>
              <span className="font-extrabold text-amber-600 dark:text-amber-400">{markedCount}</span>
            </div>
          </div>
        </aside>

        {/* RIGHT / MAIN QUESTION AREA */}
        <main className="flex-1 flex flex-col bg-slate-50 dark:bg-[#07080f] overflow-hidden">
          
          {/* MCQ VIEW EXPERIENCE */}
          {isCurrentMCQ && currentMCQ && (
            <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 max-w-4xl mx-auto w-full overflow-y-auto">
              
              {/* Question Statement & Header */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-black font-mono">
                      Q{currentIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Single Correct MCQ • {currentMCQ.marks || 1} Mark
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase">
                    {currentMCQ.difficulty || 'Medium'}
                  </span>
                </div>

                <div className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-relaxed">
                  {currentMCQ.statement}
                </div>

                {/* Option Cards */}
                <div className="space-y-3 pt-2">
                  {Array.isArray(currentMCQ.options) && currentMCQ.options.map((opt, oIdx) => {
                    const optText = typeof opt === 'object' ? (opt.text || opt.statement || JSON.stringify(opt)) : String(opt);
                    const isSelected = localResponses[currentMCQ.id]?.selected_options?.includes(optText);
                    const letter = String.fromCharCode(65 + oIdx);

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectMCQOption(optText)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 shadow-sm shadow-blue-500/10'
                            : 'bg-white dark:bg-[#0e101f] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs transition-colors shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                        }`}>
                          {letter}
                        </div>
                        <span className={`text-xs sm:text-sm font-semibold leading-normal ${
                          isSelected ? 'text-blue-950 dark:text-blue-100 font-bold' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {optText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom MCQ Action Bar */}
              <div className="pt-6 mt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleToggleReview}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                    localResponses[currentMCQ.id]?.is_marked_for_review
                      ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Flag size={14} />
                  <span>{localResponses[currentMCQ.id]?.is_marked_for_review ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={currentIdx === 0}
                    onClick={() => goToQuestion(currentIdx - 1)}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Save & Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* CODING PROBLEM WORKSPACE (SPLIT 2-PANE) */}
          {!isCurrentMCQ && currentCoding && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              
              {/* Left Pane: Problem Statement, Specs & Examples */}
              <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0c16] p-6 overflow-y-auto space-y-6">
                
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-black font-mono">
                      Q{currentIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Coding Challenge • 20 Marks
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
                    {currentCoding.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">
                      {currentCoding.topic_name || 'Algorithms'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase">
                      {currentCoding.level_name || 'Medium'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    Description
                  </h4>
                  <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {currentCoding.statement}
                  </div>
                </div>

                {/* Input & Output Format */}
                {currentCoding.input_format && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      Input Format
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      {currentCoding.input_format}
                    </p>
                  </div>
                )}

                {currentCoding.output_format && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      Output Format
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      {currentCoding.output_format}
                    </p>
                  </div>
                )}

                {/* Constraints */}
                {currentCoding.constraints && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      Constraints
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
                      {currentCoding.constraints}
                    </p>
                  </div>
                )}

                {/* Examples */}
                {Array.isArray(currentCoding.examples_parsed) && currentCoding.examples_parsed.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      Examples
                    </h4>
                    {currentCoding.examples_parsed.map((ex, exIdx) => (
                      <div key={exIdx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-mono">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Input:</span>
                          <span className="text-slate-800 dark:text-slate-200">{ex.input}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Output:</span>
                          <span className="text-slate-800 dark:text-slate-200">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className="text-[11px] text-slate-500 font-sans">
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Right Pane: Monaco Code Editor & Test Results */}
              <div className="lg:col-span-7 flex flex-col bg-[#1e1e1e] overflow-hidden">
                
                {/* Editor Toolbar */}
                <div className="h-11 bg-[#181818] border-b border-[#2d2d2d] px-4 flex items-center justify-between text-xs">
                  {/* Language Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">Language:</span>
                    <select
                      value={activeCodingLang}
                      onChange={(e) => setActiveCodingLang(e.target.value)}
                      className="bg-[#252526] text-slate-200 border border-[#3c3c3c] rounded px-2.5 py-1 text-xs font-mono focus:outline-none cursor-pointer"
                    >
                      <option value="python">Python 3.10</option>
                      <option value="javascript">JavaScript (Node.js)</option>
                      <option value="cpp">C++ (GCC)</option>
                      <option value="java">Java (OpenJDK)</option>
                    </select>
                  </div>

                  {/* Editor Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const starter = currentCoding.starter_code_parsed?.[activeCodingLang] || '';
                        handleCodeChange(starter);
                      }}
                      className="p-1.5 rounded hover:bg-[#2d2d2d] text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Reset Code Template"
                    >
                      <RotateCcw size={13} />
                    </button>

                    <button
                      onClick={handleRunCode}
                      disabled={codeExecuting}
                      className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {codeExecuting ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <Play size={12} fill="currentColor" />
                          <span>Run Tests</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Monaco Editor Component */}
                <div className="flex-1 relative min-h-[300px]">
                  <Editor
                    height="100%"
                    language={activeCodingLang === 'python' ? 'python' : activeCodingLang === 'javascript' ? 'javascript' : activeCodingLang === 'java' ? 'java' : 'cpp'}
                    theme="vs-dark"
                    value={localResponses[currentCoding.id]?.code !== undefined ? localResponses[currentCoding.id]?.code : (currentCoding.starter_code_parsed?.[activeCodingLang] || 'def solution():\n    pass\n')}
                    onChange={(val) => handleCodeChange(val || '')}
                    options={{
                      fontSize: 13,
                      lineNumbers: 'on',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 4,
                    }}
                  />
                </div>

                {/* Test Output Drawer */}
                {activeTestTab === 'output' && executionResult && (
                  <div className="h-48 bg-[#181818] border-t border-[#2d2d2d] p-4 overflow-y-auto space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-300">Test Execution Output:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          executionResult.status === 'Accepted'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          {executionResult.status || 'Executed'}
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTestTab('problem')}
                        className="text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        ✕ Close
                      </button>
                    </div>

                    {executionResult.error_message ? (
                      <div className="text-red-400 bg-red-950/40 p-2.5 rounded border border-red-900/60 whitespace-pre-wrap text-[11px]">
                        {executionResult.error_message}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-slate-400 text-[11px]">
                          Passed {executionResult.passed_count || 0} / {executionResult.total_count || 0} Sample Test Cases
                        </div>
                        {Array.isArray(executionResult.test_case_details) && executionResult.test_case_details.map((tc: any, tcIdx: number) => (
                          <div key={tcIdx} className="p-2 rounded bg-[#222] border border-[#333] space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={tc.status === 'Passed' ? 'text-emerald-400' : 'text-red-400'}>
                                {tc.status === 'Passed' ? '✓' : '✗'} Test Case {tcIdx + 1}:
                              </span>
                              <span className="text-slate-400">{tc.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Coding Footer Navigation */}
                <div className="h-12 bg-white dark:bg-[#0b0c16] border-t border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleToggleReview}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      localResponses[currentCoding.id]?.is_marked_for_review
                        ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Flag size={13} />
                    <span>{localResponses[currentCoding.id]?.is_marked_for_review ? 'Marked' : 'Mark'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => goToQuestion(currentIdx - 1)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{currentIdx === totalQuestions - 1 ? 'Review' : 'Next Question'}</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>

      </div>

      {/* 3. SUBMISSION CONFIRMATION MODAL */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="bg-white dark:bg-[#0e101f] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              <div>
                <h4 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                  Submit Assessment?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Once submitted, your responses will be evaluated and you cannot change your answers.
                </p>
              </div>

              {/* Assessment Breakdown Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Answered:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{answeredCount} / {totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Coding Problems Attempted:</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">
                    {codings.filter(c => localResponses[c.id]?.is_answered).length} / {codings.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Marked for Review:</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">{markedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Unanswered Questions:</span>
                  <span className="font-extrabold text-slate-500">{unansweredCount}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Continue Test
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAssessment}
                  className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Submit Assessment</span>
                  <Send size={13} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default InternshipAssessmentEngine;

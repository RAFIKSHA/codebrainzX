import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  AlertTriangle, ChevronLeft, ChevronRight,
  Clock, ShieldAlert, FileCode, Loader2
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import api from '../../services/api';

interface TestCase {
  id: number;
  input_data: string;
  expected_output: string;
  is_hidden: boolean;
}

interface Question {
  id: number;
  title: string;
  statement: string;
  constraints: string;
  input_format?: string;
  output_format?: string;
  examples?: string;
  starter_code: string; // JSON string
  time_limit: number;
  memory_limit: number;
  test_cases: TestCase[];
}

interface TestQuestion {
  id: number;
  points: number;
  order: number;
  question: number;
  question_details: Question;
}

interface CodingAttemptPayload {
  id: number;
  test: number;
  test_title: string;
  status: string;
  started_at: string;
  warnings_count: number;
  time_spent: number;
  test_questions?: TestQuestion[];
  responses?: any[];
}

interface Language {
  id: number;
  name: string;
  slug: string;
}

const CodingTestEngine: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState<CodingAttemptPayload | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);

  // Questions and response states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [codeMap, setCodeMap] = useState<Record<number, string>>({}); // question_id -> code
  const [langMap, setLangMap] = useState<Record<number, string>>({}); // question_id -> lang_slug
  const [consoleMap, setConsoleMap] = useState<Record<number, any>>({}); // question_id -> compile_result

  // Timer and proctoring
  const [timeLeft, setTimeLeft] = useState<number>(3600); // defaults to 1 hr in seconds
  const [warnings, setWarnings] = useState<number>(0);
  const [_isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenModal, setShowFullscreenModal] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);
  const saveTimeoutRef = useRef<Record<number, any>>({});

  const fetchLanguages = async () => {
    try {
      const response = await api.get('/languages/');
      setLanguages(response.data);
    } catch (e) {
      console.error('Error fetching languages:', e);
    }
  };

  const loadTestAttempt = async () => {
    try {
      setLoading(true);
      await fetchLanguages();

      let attemptData: CodingAttemptPayload;
      const locState = location.state as { attemptData?: CodingAttemptPayload } | null;
      
      if (locState?.attemptData) {
        attemptData = locState.attemptData;
      } else {
        const startRes = await api.post('/coding/attempts/start/', { test: Number(testId) });
        attemptData = startRes.data;
      }

      // Fetch full test details to resolve questions
      const testRes = await api.get(`/coding/tests/${testId}/`);
      const testDetails = testRes.data;

      setAttempt(attemptData);
      setWarnings(attemptData.warnings_count);
      
      // Load questions
      const qs = testDetails.test_questions.map((tq: any) => tq.question_details);
      setQuestions(qs);

      // Initialize code response map
      const initialCodes: Record<number, string> = {};
      const initialLangs: Record<number, string> = {};
      
      // Parse answers if resuming
      if (attemptData.responses && attemptData.responses.length > 0) {
        attemptData.responses.forEach((resp: any) => {
          initialCodes[resp.question] = resp.code;
          initialLangs[resp.question] = resp.language_slug;
        });
      }

      // Fill in default starter codes if blank
      qs.forEach((q: Question) => {
        if (!initialCodes[q.id]) {
          try {
            const starters = JSON.parse(q.starter_code);
            initialCodes[q.id] = starters['python'] || Object.values(starters)[0] || '';
            initialLangs[q.id] = 'python';
          } catch (e) {
            initialCodes[q.id] = '';
            initialLangs[q.id] = 'python';
          }
        }
      });

      setCodeMap(initialCodes);
      setLangMap(initialLangs);

      // Estimate time left
      const durationSeconds = testDetails.overall_duration * 60;
      const elapsedSeconds = (new Date().getTime() - new Date(attemptData.started_at).getTime()) / 1000;
      const remaining = Math.max(0, Math.floor(durationSeconds - elapsedSeconds));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        handleSubmitTest(true);
      }

    } catch (err) {
      console.error(err);
      alert('Assessment failed to initialize. Returning to dashboard.');
      navigate('/dashboard/coding');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestAttempt();

    // Proctoring tab focus checking
    const handleVisibility = async () => {
      if (document.hidden && attempt) {
        try {
          const res = await api.post(`/coding/attempts/${attempt.id}/warning/`);
          setWarnings(res.data.warnings_count);
          if (res.data.status === 'submitted') {
            alert('Test auto-submitted due to tab-switch violations.');
            navigate('/dashboard/coding');
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testId, attempt?.id]);

  // Main countdown timer
  useEffect(() => {
    if (loading || submitting || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, timeLeft, submitting]);

  // Handle fullscreen toggle
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (!fs && !submitting && !loading) {
        setShowFullscreenModal(true);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [submitting, loading]);

  const enterFullscreen = () => {
    const elem = containerRef.current;
    if (elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
      setIsFullscreen(true);
      setShowFullscreenModal(false);
    }
  };

  // Sync selected language when changing questions
  useEffect(() => {
    if (questions.length > 0 && languages.length > 0) {
      const q = questions[activeIdx];
      const activeLangSlug = langMap[q.id] || 'python';
      const langObj = languages.find(l => l.slug === activeLangSlug) || languages[0];
      setSelectedLang(langObj);
    }
  }, [activeIdx, questions, languages, langMap]);

  // Autosave to backend with debounce (3 seconds)
  const triggerAutoSave = (questionId: number, code: string, langSlug: string) => {
    if (saveTimeoutRef.current[questionId]) {
      clearTimeout(saveTimeoutRef.current[questionId]);
    }
    saveTimeoutRef.current[questionId] = setTimeout(async () => {
      if (!attempt) return;
      try {
        await api.post(`/coding/attempts/${attempt.id}/save-response/`, {
          question: questionId,
          code: code,
          language_slug: langSlug
        });
      } catch (e) {
        console.error('Autosave error:', e);
      }
    }, 3000);
  };

  const handleCodeChange = (val: string) => {
    if (questions.length === 0) return;
    const q = questions[activeIdx];
    setCodeMap(prev => ({ ...prev, [q.id]: val }));
    if (selectedLang) {
      triggerAutoSave(q.id, val, selectedLang.slug);
    }
  };

  const handleLangChange = (langSlug: string) => {
    if (questions.length === 0) return;
    const q = questions[activeIdx];
    
    // Switch starter code if empty or reload standard starter code
    try {
      const starters = JSON.parse(q.starter_code);
      const newCode = starters[langSlug] || codeMap[q.id] || '';
      setCodeMap(prev => ({ ...prev, [q.id]: newCode }));
      setLangMap(prev => ({ ...prev, [q.id]: langSlug }));
      
      const langObj = languages.find(l => l.slug === langSlug) || null;
      setSelectedLang(langObj);

      triggerAutoSave(q.id, newCode, langSlug);
    } catch (e) {
      console.error(e);
    }
  };

  // Compile & Run locally/sandbox
  const [running, setRunning] = useState(false);
  const handleRun = async () => {
    if (questions.length === 0 || !selectedLang) return;
    const q = questions[activeIdx];
    const currentCode = codeMap[q.id] || '';

    try {
      setRunning(true);
      const res = await api.post(`/questions/${q.id}/run/`, {
        code: currentCode,
        language_slug: selectedLang.slug
      });
      setConsoleMap(prev => ({ ...prev, [q.id]: res.data }));
    } catch (e: any) {
      setConsoleMap(prev => ({
        ...prev,
        [q.id]: {
          type: 'error',
          message: e.response?.data?.error || 'Execution failed.'
        }
      }));
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitTest = async (isAuto = false) => {
    if (!attempt || submitting) return;
    
    if (!isAuto) {
      const confirmSubmit = window.confirm("Are you sure you want to finish the test? Your answers will be submitted for scoring.");
      if (!confirmSubmit) return;
    }

    try {
      setSubmitting(true);
      
      // Save final active response first
      if (questions.length > 0) {
        const activeQ = questions[activeIdx];
        await api.post(`/coding/attempts/${attempt.id}/save-response/`, {
          question: activeQ.id,
          code: codeMap[activeQ.id] || '',
          language_slug: langMap[activeQ.id] || 'python'
        });
      }

      const res = await api.post(`/coding/attempts/${attempt.id}/submit/`);
      
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error(err));
      }
      
      navigate(`/dashboard/coding/test/${testId}/results`, { state: { attemptDetails: res.data } });
    } catch (e) {
      console.error('Submission failed:', e);
      alert('Error submitting assessment. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  // Prevent drag, right click, and copy/paste
  const preventCheating = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      alert('Copy/paste is strictly blocked in this assessment sandbox.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-slate-400 font-semibold">Configuring timed coding workspace...</p>
      </div>
    );
  }

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeQ = questions[activeIdx];
  const activeConsole = activeQ ? consoleMap[activeQ.id] : null;

  return (
    <div 
      ref={containerRef}
      onKeyDown={preventCheating}
      onContextMenu={(e) => { e.preventDefault(); alert('Right-click is disabled in proctored assessment.'); }}
      className="flex flex-col h-screen w-screen bg-slate-100 dark:bg-[#090b11] select-none text-slate-800 dark:text-slate-200 overflow-hidden"
    >
      {/* Fullscreen Block Modal */}
      {showFullscreenModal && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 text-center text-white">
          <ShieldAlert size={64} className="text-yellow-500 mb-6 animate-bounce" />
          <h2 className="text-2xl font-extrabold mb-2">Timed Proctoring Setup</h2>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            This coding assessment requires fullscreen mode to activate anti-cheat controls. Exiting fullscreen or shifting tabs will log cheating warnings.
          </p>
          <button
            onClick={enterFullscreen}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-extrabold shadow shadow-blue-500/20 cursor-pointer"
          >
            Enter Assessment Fullscreen
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="bg-red-500/10 text-red-500 text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wider uppercase border border-red-500/20">
            PROCTORED ASSESSMENT
          </span>
          <span className="text-slate-400">|</span>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            {attempt?.test_title}
          </h2>
        </div>

        <div className="flex items-center gap-6">
          {/* Warnings Counter */}
          <div className="flex items-center gap-2 bg-yellow-500/5 text-yellow-600 dark:text-yellow-500 px-3 py-1 rounded-lg border border-yellow-500/10">
            <AlertTriangle size={15} />
            <span className="text-xs font-bold font-mono">Warnings: {warnings}/3</span>
          </div>

          {/* Countdown timer */}
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border font-mono font-bold text-sm ${
            timeLeft <= 300 
              ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' 
              : 'bg-slate-50 dark:bg-slate-850 text-slate-650 dark:text-slate-350 border-slate-200 dark:border-slate-800'
          }`}>
            <Clock size={16} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Main Splits workspace */}
      {activeQ && (
        <div className="flex-grow flex overflow-hidden">
          {/* LEFT: Question description */}
          <div className="w-1/2 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-850 overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold text-blue-500 uppercase tracking-widest font-mono">
                Question {activeIdx + 1} of {questions.length}
              </span>
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-500 font-mono">
                Points: 10
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
              {activeQ.title}
            </h1>

            <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-8 space-y-4">
              <p className="whitespace-pre-line">{activeQ.statement}</p>
            </div>

            {activeQ.input_format && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Input Format</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-850/10 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800 whitespace-pre-wrap">
                  {activeQ.input_format}
                </p>
              </div>
            )}

            {activeQ.output_format && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Output Format</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-850/10 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800 whitespace-pre-wrap">
                  {activeQ.output_format}
                </p>
              </div>
            )}

            {activeQ.constraints && (
              <div className="mb-8">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Constraints</h4>
                <pre className="p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800 rounded-xl font-mono text-[11px] text-slate-650 dark:text-slate-350">
                  {activeQ.constraints}
                </pre>
              </div>
            )}
          </div>

          {/* RIGHT: Editor + Console */}
          <div className="w-1/2 flex flex-col overflow-hidden bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-850">
            {/* Editor Header */}
            <div className="h-12 border-b border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileCode size={16} className="text-blue-500" />
                <select
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-white"
                  value={selectedLang?.slug || ''}
                  onChange={(e) => handleLangChange(e.target.value)}
                >
                  {languages.map(lang => (
                    <option key={lang.id} value={lang.slug}>{lang.name}</option>
                  ))}
                </select>
              </div>

              <span className="text-[10px] text-slate-400 font-mono">
                autosaved
              </span>
            </div>

            {/* Monaco Canvas */}
            <div className="flex-grow relative bg-[#1e1e1e]">
              <Editor
                height="100%"
                theme="vs-dark"
                language={selectedLang?.slug || 'python'}
                value={codeMap[activeQ.id] || ''}
                onChange={(val) => handleCodeChange(val || '')}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  scrollBeyondLastLine: false,
                  lineHeight: 22,
                  contextmenu: false // disables default right click context menu inside editor
                }}
              />
            </div>

            {/* Console Drawer */}
            <div className="h-48 border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 flex flex-col shrink-0 overflow-hidden">
              <div className="h-9 border-b border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 px-4 flex items-center shrink-0">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest font-mono">
                  Console Output
                </span>
              </div>

              <div className="flex-grow p-4 overflow-y-auto font-mono text-xs text-slate-800 dark:text-slate-350">
                {running && (
                  <div className="flex items-center gap-2 text-blue-500">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Compiling and running sample suite...</span>
                  </div>
                )}
                {!activeConsole && !running && (
                  <span className="text-slate-400">Run code to verify logic against sample cases.</span>
                )}
                {activeConsole && activeConsole.type === 'error' && (
                  <div className="text-red-500 bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                    <p className="font-bold">Error:</p>
                    <pre className="whitespace-pre-wrap mt-1 text-[11px]">{activeConsole.message}</pre>
                  </div>
                )}
                {activeConsole && activeConsole.status && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className={`text-sm font-extrabold ${
                        activeConsole.status === 'Accepted' ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                        {activeConsole.status}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Passed Cases: {activeConsole.passed_count} / {activeConsole.total_count}
                      </span>
                    </div>

                    {activeConsole.error_message && (
                      <pre className="text-red-500 bg-red-500/5 border border-red-500/10 p-2.5 rounded whitespace-pre-wrap text-[11px]">{activeConsole.error_message}</pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom control panel */}
      <div className="h-16 border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 z-10 shadow-lg">
        {/* Navigation buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveIdx(prev => Math.max(0, prev - 1))}
            disabled={activeIdx === 0}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft size={14} className="inline mr-1" />
            Previous
          </button>
          
          <button
            onClick={() => setActiveIdx(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={activeIdx === questions.length - 1}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-30 cursor-pointer"
          >
            Next
            <ChevronRight size={14} className="inline ml-1" />
          </button>
        </div>

        {/* Compile / Submit Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleRun}
            disabled={running || submitting}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-50"
          >
            Compile & Run
          </button>

          <button
            onClick={() => handleSubmitTest(false)}
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow shadow-blue-500/10 cursor-pointer disabled:opacity-50"
          >
            Submit Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodingTestEngine;

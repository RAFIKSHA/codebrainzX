import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Brain, Calculator, ChevronLeft, ChevronRight, Clock, FileCode, Loader2, Play, AlertTriangle, X
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import api from '../../services/api';
import testSeriesService from '../../services/testSeries';
import type { TestAttempt } from '../../services/testSeries';
import { useTheme } from '../../context/ThemeContext';

interface Language {
  id: number;
  name: string;
  slug: string;
}

const TestSeriesEngine: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<number, any>>({});

  // Active question index
  const [activeIdx, setActiveIdx] = useState<number>(0);
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState<number>(0); // In seconds
  const timerRef = useRef<any>(null);

  // Visited and Marked states (TCS portal style)
  const [visitedMap, setVisitedMap] = useState<Record<number, boolean>>({});
  const [markedMap, setMarkedMap] = useState<Record<number, boolean>>({});

  // Coding specific states
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);
  const [codeMap, setCodeMap] = useState<Record<number, string>>({}); // question_id -> code
  const [langMap, setLangMap] = useState<Record<number, string>>({}); // question_id -> lang_slug
  const [consoleMap, setConsoleMap] = useState<Record<number, any>>({}); // question_id -> compile_result
  const [runningCode, setRunningCode] = useState<boolean>(false);

  // Aptitude specific states
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [calcInput, setCalcInput] = useState<string>('');

  // Proctoring warnings
  const [warnings, setWarnings] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchLanguages = async () => {
    try {
      const response = await api.get('/languages/');
      setLanguages(response.data);
    } catch (e) {
      console.error('Error fetching languages:', e);
    }
  };

  const loadAttempt = async () => {
    try {
      setLoading(true);
      let payload: any;
      const locState = location.state as { attemptData?: any } | null;

      if (locState?.attemptData) {
        payload = locState.attemptData;
      } else {
        payload = await testSeriesService.getAttempt(Number(attemptId));
        const startPayload = await testSeriesService.startTest(payload.test);
        payload = startPayload;
      }

      setAttempt(payload.attempt);
      setQuestions(payload.questions);
      setResponses(payload.responses || {});
      setTimeLeft(payload.time_left_seconds);
      setWarnings(payload.attempt.warnings_count || 0);

      // Initialize visited state
      const visited: Record<number, boolean> = {};
      if (payload.questions.length > 0) {
        visited[payload.questions[0].id] = true;
      }
      setVisitedMap(visited);

      // Initialize maps if coding
      if (payload.attempt.test_details.series_details?.category_details?.type === 'coding' || payload.questions[0]?.constraints !== undefined) {
        await fetchLanguages();
        const codes: Record<number, string> = {};
        const langs: Record<number, string> = {};

        payload.questions.forEach((q: any) => {
          const resp = payload.responses[q.id];
          codes[q.id] = resp?.code || '';
          langs[q.id] = resp?.language_slug || 'python';
        });

        setCodeMap(codes);
        setLangMap(langs);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load test session. Returning to hub.');
      navigate('/test-series');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttempt();

    const handleVisibilityChange = () => {
      if (document.hidden && !submitting) {
        setWarnings(prev => {
          const nextWarn = prev + 1;
          if (nextWarn >= 3) {
            handleSubmit(true);
          } else {
            alert(`Anti-Cheat Warning ${nextWarn}/3: Do not navigate away from the test tab.`);
          }
          return nextWarn;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [attemptId]);

  // Main countdown timer loop
  useEffect(() => {
    if (loading || submitting || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(true); // Auto submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, timeLeft, submitting]);

  // Track visited question state
  const activeQuestion = questions[activeIdx];
  const activeQuestionId = activeQuestion?.id;

  useEffect(() => {
    if (activeQuestionId) {
      setVisitedMap(prev => ({ ...prev, [activeQuestionId]: true }));
    }
  }, [activeIdx, activeQuestionId]);

  // Sync active language dropdown
  useEffect(() => {
    if (activeQuestionId && langMap[activeQuestionId] && languages.length > 0) {
      const lang = languages.find(l => l.slug === langMap[activeQuestionId]);
      if (lang) setSelectedLang(lang);
    } else if (languages.length > 0 && !selectedLang) {
      setSelectedLang(languages.find(l => l.slug === 'python') || languages[0]);
    }
  }, [activeIdx, langMap, languages, activeQuestionId]);

  const handleLanguageChange = (slug: string) => {
    const lang = languages.find(l => l.slug === slug);
    if (lang && activeQuestionId) {
      setSelectedLang(lang);
      setLangMap(prev => ({ ...prev, [activeQuestionId]: slug }));
      
      if (!codeMap[activeQuestionId] && activeQuestion.starter_code) {
        try {
          const starters = JSON.parse(activeQuestion.starter_code);
          if (starters[slug]) {
            setCodeMap(prev => ({ ...prev, [activeQuestionId]: starters[slug] }));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  // Option select handler
  const handleOptionSelect = async (optKey: string) => {
    if (!attempt || !activeQuestionId) return;

    const currentResp = responses[activeQuestionId] || { selected_options: [] };
    let newOptions: string[] = [];

    if (activeQuestion.question_type === 'multiple_mcq') {
      const idx = currentResp.selected_options.indexOf(optKey);
      if (idx > -1) {
        newOptions = currentResp.selected_options.filter((o: string) => o !== optKey);
      } else {
        newOptions = [...currentResp.selected_options, optKey];
      }
    } else {
      newOptions = [optKey];
    }

    setResponses(prev => ({
      ...prev,
      [activeQuestionId]: {
        ...currentResp,
        selected_options: newOptions,
        is_answered: newOptions.length > 0
      }
    }));

    try {
      await testSeriesService.saveAnswer(attempt.id, {
        question_id: activeQuestionId,
        selected_options: newOptions,
        is_answered: newOptions.length > 0,
        time_spent: 1
      });
    } catch (e) {
      console.error('Save failed', e);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (!activeQuestionId) return;
    setCodeMap(prev => ({ ...prev, [activeQuestionId]: value || '' }));
  };

  const handleSaveCodingResponse = async () => {
    if (!attempt || !activeQuestionId || !selectedLang) return;
    const code = codeMap[activeQuestionId] || '';
    
    try {
      await testSeriesService.saveAnswer(attempt.id, {
        question_id: activeQuestionId,
        code,
        language_slug: selectedLang.slug,
        is_answered: code.trim().length > 0,
        time_spent: 1
      });

      setResponses(prev => ({
        ...prev,
        [activeQuestionId]: {
          ...prev[activeQuestionId],
          is_answered: code.trim().length > 0,
          code,
          language_slug: selectedLang.slug
        }
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const runCode = async () => {
    if (!activeQuestionId || !selectedLang) return;
    setRunningCode(true);
    setConsoleMap(prev => ({ ...prev, [activeQuestionId]: { status: 'running', message: 'Compiling and executing code...' } }));

    const code = codeMap[activeQuestionId] || '';

    try {
      const res = await api.post(`/questions/${activeQuestionId}/run/`, {
        code,
        language_id: selectedLang.id
      });
      setConsoleMap(prev => ({ ...prev, [activeQuestionId]: res.data }));
      await handleSaveCodingResponse();
    } catch (err: any) {
      console.error(err);
      setConsoleMap(prev => ({
        ...prev,
        [activeQuestionId]: {
          status: 'error',
          message: err.response?.data?.error || 'Execution request failed'
        }
      }));
    } finally {
      setRunningCode(false);
    }
  };

  // Navigations standard to TCS Portal
  const handleClearResponse = async () => {
    if (!attempt || !activeQuestionId) return;
    
    if (languages.length > 0) {
      setCodeMap(prev => ({ ...prev, [activeQuestionId]: '' }));
      try {
        await testSeriesService.saveAnswer(attempt.id, {
          question_id: activeQuestionId,
          code: '',
          language_slug: selectedLang?.slug || 'python',
          is_answered: false,
          time_spent: 1
        });
      } catch (e) { console.error(e); }
    } else {
      setResponses(prev => ({
        ...prev,
        [activeQuestionId]: {
          ...prev[activeQuestionId],
          selected_options: [],
          is_answered: false
        }
      }));
      try {
        await testSeriesService.saveAnswer(attempt.id, {
          question_id: activeQuestionId,
          selected_options: [],
          is_answered: false,
          time_spent: 1
        });
      } catch (e) { console.error(e); }
    }
    setMarkedMap(prev => ({ ...prev, [activeQuestionId]: false }));
  };

  const handleMarkForReviewAndNext = async () => {
    if (!activeQuestionId) return;
    setMarkedMap(prev => ({ ...prev, [activeQuestionId]: true }));
    if (languages.length > 0) {
      await handleSaveCodingResponse();
    }
    advanceQuestion();
  };

  const handleSaveAndNext = async () => {
    if (!activeQuestionId) return;
    setMarkedMap(prev => ({ ...prev, [activeQuestionId]: false }));
    if (languages.length > 0) {
      await handleSaveCodingResponse();
    }
    advanceQuestion();
  };

  const advanceQuestion = () => {
    if (activeIdx < questions.length - 1) {
      setActiveIdx(prev => prev + 1);
    }
  };

  const handleSubmit = async (auto = false) => {
    if (!attempt) return;
    if (!auto && !confirm('Are you sure you want to submit and end this exam section?')) return;

    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      if (languages.length > 0) {
        await handleSaveCodingResponse();
      }
      const res = await testSeriesService.submitTest(attempt.id);
      navigate(`/test-series/attempt/${res.id}/result`);
    } catch (err) {
      console.error(err);
      alert('Failed to submit test series. Please try again.');
      setSubmitting(false);
    }
  };

  const calcPress = (char: string) => {
    if (char === 'C') {
      setCalcInput('');
    } else if (char === '=') {
      try {
        const clean = calcInput.replace(/[^0-9+\-*/().]/g, '');
        const res = new Function(`return ${clean}`)();
        setCalcInput(String(res));
      } catch {
        setCalcInput('Error');
      }
    } else {
      setCalcInput(prev => prev + char);
    }
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? String(h).padStart(2, '0') + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Derive Palette Counts
  const getPaletteStatus = (qId: number) => {
    const hasAnswer = responses[qId]?.is_answered;
    const isMarked = markedMap[qId];
    const hasVisited = visitedMap[qId];

    if (hasAnswer && isMarked) return 'answered_marked';
    if (hasAnswer) return 'answered';
    if (isMarked) return 'marked';
    if (hasVisited) return 'not_answered';
    return 'unvisited';
  };

  const statusCounts = {
    answered: 0,
    not_answered: 0,
    unvisited: 0,
    marked: 0,
    answered_marked: 0
  };

  questions.forEach(q => {
    const status = getPaletteStatus(q.id);
    statusCounts[status]++;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <Loader2 size={36} className="animate-spin text-purple-650" />
        <span className="text-xs font-semibold text-slate-400">Loading placement test workspace...</span>
      </div>
    );
  }

  const isCodingTest = languages.length > 0;
  const activeCode = codeMap[activeQuestionId] || '';
  const consoleResult = consoleMap[activeQuestionId];
  const candidateName = attempt?.user_details?.first_name 
    ? `${attempt.user_details.first_name} ${attempt.user_details.last_name || ''}` 
    : 'Candidate Student';

  return (
    <div ref={containerRef} className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans overflow-hidden select-none">
      
      {/* TCS iON Top Exam Header */}
      <header className="h-12 bg-slate-800 border-b border-slate-900 text-white flex items-center justify-between px-6 shrink-0 z-40 select-none">
        <div className="flex items-center gap-3">
          <Brain size={18} className="text-blue-400" />
          <span className="font-extrabold text-sm tracking-wide uppercase">
            {attempt?.test_details?.name} Placement Test
          </span>
        </div>

        {/* Proctor warnings indicator */}
        <div className="flex items-center gap-6">
          {warnings > 0 && (
            <div className="text-[10px] font-bold text-red-400 bg-red-950/40 border border-red-900 px-2 py-0.5 rounded flex items-center gap-1.5 animate-pulse">
              <AlertTriangle size={12} />
              <span>Warnings: {warnings}/3</span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-700/60 px-3 py-1 rounded-md text-xs">
            <span className="text-slate-350">Time Left:</span>
            <Clock size={14} className="text-amber-400" />
            <span className="font-mono font-extrabold text-white text-sm">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* TCS Sections bar */}
      <div className="h-10 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 px-6 flex items-center shrink-0 text-xs">
        <div className="flex gap-1.5 h-full items-end select-none">
          <button className="px-4 py-2 bg-blue-650 dark:bg-blue-750 text-white font-bold rounded-t-lg border-b border-transparent shrink-0">
            {isCodingTest ? 'Programming Round' : 'Cognitive Assessment'}
          </button>
        </div>
      </div>

      {/* Main Workspace Workspace */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* Workspace: Left & Center Columns (Question & Response workspace) */}
        <div className="flex-grow flex flex-col overflow-hidden">
          <div className="flex-grow flex overflow-hidden">
            
            {/* Left Column: Question panel */}
            <div className={`${isCodingTest ? 'w-1/2' : 'w-full'} flex flex-col h-full border-r border-slate-200 dark:border-slate-850 overflow-hidden bg-white dark:bg-slate-900`}>
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 shrink-0 flex justify-between items-center text-[10px]">
                <span className="font-bold text-slate-450 uppercase tracking-wider">Question No. {activeIdx + 1}</span>
                <span className="text-[9px] bg-slate-150 dark:bg-slate-800 px-2 py-0.5 rounded font-extrabold uppercase">
                  Marks: {activeQuestion?.marks || (attempt?.max_score ? (attempt.max_score / questions.length).toFixed(1) : '10')}
                </span>
              </div>

              {/* Scrollable Description details */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6 text-sm">
                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white leading-tight">
                  {activeQuestion?.title || `Question ${activeIdx + 1}`}
                </h2>
                <div className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                  {activeQuestion?.statement}
                </div>

                {isCodingTest && (
                  <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-850 text-xs">
                    {activeQuestion?.constraints && (
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-slate-450 uppercase tracking-wider">Constraints</h4>
                        <pre className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900 font-mono">{activeQuestion.constraints}</pre>
                      </div>
                    )}
                    
                    {activeQuestion?.input_format && (
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-slate-450 uppercase tracking-wider">Input Format</h4>
                        <p className="text-slate-650 dark:text-slate-400">{activeQuestion.input_format}</p>
                      </div>
                    )}

                    {activeQuestion?.output_format && (
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-slate-450 uppercase tracking-wider">Output Format</h4>
                        <p className="text-slate-650 dark:text-slate-400">{activeQuestion.output_format}</p>
                      </div>
                    )}

                    {/* Example test cases */}
                    {activeQuestion?.examples && (() => {
                      try {
                        const parsed = typeof activeQuestion.examples === 'string' ? JSON.parse(activeQuestion.examples) : activeQuestion.examples;
                        if (Array.isArray(parsed) && parsed.length > 0) {
                          return (
                            <div className="space-y-4">
                              <h4 className="font-extrabold text-slate-450 uppercase tracking-wider">Example Cases</h4>
                              {parsed.map((ex: any, idx: number) => (
                                <div key={idx} className="border border-slate-200 dark:border-slate-850 p-4 rounded-2xl bg-slate-50/20 space-y-2">
                                  <span className="font-bold text-[10px] text-purple-650 block">Case {idx + 1}</span>
                                  <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                                    <div className="bg-slate-50 dark:bg-slate-950 p-2 border border-slate-100 rounded-lg">
                                      <span className="font-bold text-[9px] text-slate-400 font-sans block mb-0.5">Input:</span>
                                      <pre className="whitespace-pre-wrap">{ex.input}</pre>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-950 p-2 border border-slate-100 rounded-lg">
                                      <span className="font-bold text-[9px] text-slate-400 font-sans block mb-0.5">Output:</span>
                                      <pre className="whitespace-pre-wrap">{ex.output}</pre>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        }
                      } catch {
                        return null;
                      }
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Code Editor workspace (for Coding) or Options selector (for Aptitude) */}
            {isCodingTest ? (
              <div className="w-1/2 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-850">
                <div className="h-11 border-b border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 px-4 flex items-center justify-between shrink-0 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-450 uppercase tracking-wider">Language:</span>
                    <select
                      value={selectedLang?.slug || 'python'}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="h-7 border rounded px-1.5 bg-white text-slate-850 focus:outline-none"
                    >
                      {languages.map((l) => (
                        <option key={l.id} value={l.slug}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={runCode}
                    disabled={runningCode}
                    className="h-7 px-3 bg-slate-105 hover:bg-slate-200 dark:bg-slate-850 text-slate-850 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-[10px] font-bold"
                  >
                    {runningCode ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />} Run Custom Tests
                  </button>
                </div>

                <div className="flex-grow border-b border-slate-200 dark:border-slate-850 overflow-hidden relative">
                  <Editor
                    height="100%"
                    language={
                      selectedLang?.slug === 'python' ? 'python' :
                      selectedLang?.slug === 'javascript' ? 'javascript' :
                      selectedLang?.slug === 'java' ? 'java' : 'cpp'
                    }
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    value={activeCode}
                    onChange={handleCodeChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 12,
                      lineNumbers: 'on',
                      automaticLayout: true,
                      scrollBeyondLastLine: false
                    }}
                  />
                </div>

                <div className="h-36 bg-white dark:bg-slate-900 flex flex-col overflow-hidden shrink-0">
                  <div className="h-7 px-4 border-b border-slate-150 dark:border-slate-850 flex items-center bg-slate-50/50 dark:bg-slate-950/20 text-[9px] font-bold text-slate-450 uppercase tracking-wider select-none shrink-0">
                    Console Results Log
                  </div>
                  <div className="flex-grow p-4 overflow-y-auto font-mono text-[10px] leading-relaxed text-slate-650 dark:text-slate-400">
                    {consoleResult ? (
                      consoleResult.status === 'running' ? (
                        <div className="flex items-center gap-2 text-blue-500 font-bold">
                          <Loader2 size={12} className="animate-spin" />
                          <span>{consoleResult.message}</span>
                        </div>
                      ) : consoleResult.status === 'Accepted' ? (
                        <div className="text-emerald-600 font-bold">✓ Compile success. Passed public test cases ({consoleResult.passed_test_cases}/{consoleResult.total_test_cases})</div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-red-550 font-bold">✗ {consoleResult.status} ({consoleResult.passed_test_cases}/{consoleResult.total_test_cases})</div>
                          {consoleResult.error_message && <pre className="bg-red-50/40 p-2 rounded border border-red-100 text-red-650">{consoleResult.error_message}</pre>}
                        </div>
                      )
                    ) : (
                      <div className="text-slate-400 italic">Compile log empty. Write solutions and click Run.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Aptitude selector pane
              <div className="flex-grow flex flex-col p-6 space-y-6 overflow-y-auto relative bg-slate-50 dark:bg-slate-950">
                <div className="absolute right-6 top-6 z-20">
                  <button
                    onClick={() => setShowCalculator(!showCalculator)}
                    className="p-2 bg-white dark:bg-slate-900 border rounded-full text-slate-650 hover:text-purple-650 transition-colors shadow-sm flex items-center justify-center cursor-pointer"
                    title="Math Calculator"
                  >
                    <Calculator size={18} />
                  </button>
                </div>

                {showCalculator && (
                  <div className="absolute right-6 top-20 z-35 w-48 bg-white dark:bg-slate-900 border rounded-2xl p-3.5 shadow-xl space-y-2 animate-scaleIn select-none font-mono">
                    <input
                      type="text"
                      readOnly
                      value={calcInput}
                      className="w-full text-right px-2 py-1 bg-slate-50 border rounded text-xs text-slate-800"
                    />
                    <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-bold">
                      {['C', '(', ')', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '=', ' '].map((char) => (
                        <button
                          key={char}
                          onClick={() => calcPress(char)}
                          className={`p-1.5 rounded cursor-pointer ${
                            char === '=' ? 'bg-purple-650 text-white col-span-2' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          {char}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-10">
                  <h3 className="text-sm font-bold text-slate-450 uppercase tracking-wider">Select Option:</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {(() => {
                      const resp = responses[activeQuestionId] || { selected_options: [] };
                      const userOpts = resp.selected_options || [];

                      let opts = activeQuestion?.options || [];
                      if (typeof opts === 'string') {
                        try { opts = JSON.parse(opts); } catch {}
                      }

                      if (Array.isArray(opts)) {
                        return opts.map((opt: any) => {
                          const optKey = opt.key || opt;
                          const optText = opt.text || opt;
                          const isSelected = userOpts.includes(optKey);

                          return (
                            <div
                              key={optKey}
                              onClick={() => handleOptionSelect(optKey)}
                              className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition-all hover:scale-[1.002] ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50/20 font-semibold text-blue-750 dark:text-blue-405'
                                  : 'border-slate-200 bg-white dark:bg-slate-900 hover:border-blue-200'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                isSelected ? 'bg-blue-600 border-blue-700 text-white' : 'border-slate-300 bg-slate-50 text-slate-500'
                              }`}>
                                {optKey}
                              </div>
                              <div className="text-xs leading-relaxed text-slate-850 dark:text-slate-300">{optText}</div>
                            </div>
                          );
                        });
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TCS Portal Bottom action bar */}
          <footer className="h-14 border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 px-6 flex items-center justify-between shrink-0 select-none">
            <div className="flex gap-2">
              <button
                onClick={handleMarkForReviewAndNext}
                className="h-9 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 text-slate-750 dark:text-slate-200 text-xs font-bold rounded border border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                Mark for Review & Next
              </button>
              <button
                onClick={handleClearResponse}
                className="h-9 px-4 bg-slate-105 hover:bg-slate-200 dark:bg-slate-850 text-slate-750 dark:text-slate-200 text-xs font-bold rounded border border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                Clear Response
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveIdx(prev => Math.max(0, prev - 1))}
                disabled={activeIdx === 0}
                className="h-9 w-9 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-250 rounded flex items-center justify-center cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setActiveIdx(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={activeIdx === questions.length - 1}
                className="h-9 w-9 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-250 rounded flex items-center justify-center cursor-pointer disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
              
              <button
                onClick={handleSaveAndNext}
                className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded cursor-pointer shadow-sm"
              >
                Save & Next
              </button>
            </div>
          </footer>
        </div>

        {/* Workspace: Right Column (TCS Exam Palette & Candidate profile card) */}
        <aside className="w-72 border-l border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 flex flex-col overflow-hidden shrink-0 select-none">
          
          {/* Candidate Bio block */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-850 bg-slate-100 dark:bg-slate-950 flex items-center gap-3 shrink-0">
            <div className="w-12 h-14 bg-slate-300 dark:bg-slate-800 rounded border border-slate-350 dark:border-slate-700 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0 relative overflow-hidden shadow-inner">
              <span className="text-[10px] uppercase font-bold text-center">Photo</span>
            </div>
            <div className="space-y-0.5 text-xs text-slate-800 dark:text-slate-300 overflow-hidden">
              <div className="font-extrabold truncate" title={candidateName}>{candidateName}</div>
              <div className="text-[10px] text-slate-450 uppercase font-bold">Roll: {attemptId}</div>
              <div className="text-[10px] text-blue-600 font-extrabold truncate">CodexPetra Suite</div>
            </div>
          </div>

          {/* Color status palette grid */}
          <div className="flex-grow p-4 overflow-y-auto space-y-6">
            
            {/* Status Legend Panel */}
            <div className="space-y-2 border-b border-slate-200 dark:border-slate-850 pb-4">
              <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Question Palette Stats</h4>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-655 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-600 text-white font-bold flex items-center justify-center shadow-inner text-[9px]">{statusCounts.answered}</div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-red-655 text-white font-bold flex items-center justify-center shadow-inner text-[9px]">{statusCounts.not_answered}</div>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold border flex items-center justify-center text-[9px]">{statusCounts.unvisited}</div>
                  <span>Not Visited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-purple-650 text-white font-bold flex items-center justify-center shadow-inner text-[9px]">{statusCounts.marked}</div>
                  <span>Marked</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <div className="w-6 h-6 rounded bg-purple-650 text-white font-bold flex items-center justify-center shadow-inner text-[9px] relative">
                    {statusCounts.answered_marked}
                    <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                  </div>
                  <span>Answered & Marked for Review</span>
                </div>
              </div>
            </div>

            {/* Circular index palette buttons */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Choose a Question:</h4>
              <div className="grid grid-cols-4 gap-2.5">
                {questions.map((q, idx) => {
                  const status = getPaletteStatus(q.id);
                  const isCurrent = idx === activeIdx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setActiveIdx(idx)}
                      className={`w-10 h-10 rounded-lg text-xs font-extrabold flex items-center justify-center border transition-all cursor-pointer shadow-sm hover:scale-[1.03] ${
                        isCurrent 
                          ? 'border-blue-600 dark:border-blue-400 ring-2 ring-blue-600/30' 
                          : 'border-transparent'
                      } ${
                        status === 'answered' ? 'bg-emerald-600 text-white' :
                        status === 'answered_marked' ? 'bg-purple-650 text-white relative' :
                        status === 'marked' ? 'bg-purple-650 text-white' :
                        status === 'not_answered' ? 'bg-red-655 text-white' :
                        'bg-slate-200 dark:bg-slate-800 text-slate-655 dark:text-slate-400 border border-slate-350 dark:border-slate-700'
                      }`}
                    >
                      {idx + 1}
                      {status === 'answered_marked' && (
                        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sidebar bottom submission area */}
          <div className="p-4 border-t border-slate-250 dark:border-slate-850 bg-slate-100 dark:bg-slate-950 shrink-0">
            <button
              onClick={() => handleSubmit()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Submit Exam
            </button>
          </div>

        </aside>

      </div>

    </div>
  );
};

export default TestSeriesEngine;

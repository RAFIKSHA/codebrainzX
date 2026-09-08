import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import api from '../../services/api';
import { setSEOMetadata, getQuestionSchema } from '../../utils/seo';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Terminal, Play, CheckCircle2, AlertTriangle, HelpCircle,
  RefreshCw, FileCode, Clock, HardDrive, History, Loader2, Maximize2, Minimize2,
  Settings, Check, X, ShieldAlert, Cpu, Sparkles, BookOpen, LogIn
} from 'lucide-react';

interface Language {
  id: number;
  name: string;
  slug: string;
  extension: string;
}

interface TestCase {
  id: number;
  input_data: string;
  expected_output: string;
  is_hidden: boolean;
}

interface Question {
  id: number;
  title: string;
  slug: string;
  statement: string;
  constraints: string;
  input_format?: string;
  output_format?: string;
  notes?: string;
  examples?: string;
  starter_code: string; // JSON string
  time_limit: number;
  memory_limit: number;
  test_cases: TestCase[];
  solved: boolean;
  level_name: string;
  topic_slug: string;
}

interface Submission {
  id: number;
  status: string;
  language_name: string;
  execution_time: number;
  memory_usage: number;
  passed_test_cases: number;
  total_test_cases: number;
  created_at: string;
}

const QuestionPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [selectedLang, setSelectedLang] = useState<Language | null>(null);
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'results' | 'testcases' | 'submissions'>('results');
  const [consoleLog, setConsoleLog] = useState<any>(null);

  // Fullscreen & panel toggles
  const [isDescFullscreen, setIsDescFullscreen] = useState(false);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [activePanel, setActivePanel] = useState<'description' | 'hints' | 'submissions' | 'editorial'>('description');
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);

  // Sync editor theme with global theme
  useEffect(() => {
    setEditorTheme(theme === 'dark' ? 'vs-dark' : 'light');
  }, [theme]);

  // Fetch languages
  const { data: languages } = useQuery<Language[]>({
    queryKey: ['languages'],
    queryFn: async () => {
      const response = await api.get('/languages/');
      return response.data;
    }
  });

  // Fetch question details
  const { data: question, isLoading: qLoading, isError: qError } = useQuery<Question>({
    queryKey: ['question', questionId],
    queryFn: async () => {
      const response = await api.get(`/questions/${questionId}/`);
      return response.data;
    }
  });

  // Fetch submissions history for this question
  const { data: submissions, refetch: refetchSubmissions } = useQuery<Submission[]>({
    queryKey: ['submissions', questionId],
    queryFn: async () => {
      if (!user) return [];
      const response = await api.get(`/submissions/?question=${questionId}`);
      return response.data;
    },
    enabled: !!user
  });

  // Load starter code or saved progress on question load
  useEffect(() => {
    if (question && languages && languages.length > 0) {
      try {
        const parsedStarters = JSON.parse(question.starter_code);
        
        // Try loading from localStorage
        const savedCode = localStorage.getItem(`code_${questionId}`);
        let finalCodeMap = parsedStarters;
        if (savedCode) {
          try {
            const parsedSaved = JSON.parse(savedCode);
            finalCodeMap = { ...parsedStarters, ...parsedSaved };
          } catch (e) {
            console.error('Error parsing saved code:', e);
          }
        }
        setCodeMap(finalCodeMap);
        
        // Load last used language or default to python
        const savedLang = localStorage.getItem(`lang_${questionId}`);
        const defaultLang = languages.find(l => l.slug === savedLang) || 
                            languages.find(l => l.slug === 'python') || 
                            languages[0];
        setSelectedLang(defaultLang);
      } catch (err) {
        console.error('Error parsing starter code:', err);
      }

      setSEOMetadata({
        title: `${question.title} | CodexPetra IDE`,
        description: `Solve the coding challenge ${question.title}. Write solutions in Python, C++, Java, JavaScript, and run compiled test suites.`,
        canonicalUrl: window.location.href,
        structuredData: getQuestionSchema(question.title, question.statement, question.level_name),
      });
    }
  }, [question, languages, questionId]);

  // Save code changes to localStorage
  useEffect(() => {
    if (questionId && Object.keys(codeMap).length > 0) {
      localStorage.setItem(`code_${questionId}`, JSON.stringify(codeMap));
    }
  }, [codeMap, questionId]);

  // Save selected language to localStorage
  useEffect(() => {
    if (questionId && selectedLang) {
      localStorage.setItem(`lang_${questionId}`, selectedLang.slug);
    }
  }, [selectedLang, questionId]);

  // Run Code mutation
  const runMutation = useMutation({
    mutationFn: async (payload: { code: string; language_slug: string }) => {
      const response = await api.post(`/questions/${questionId}/run/`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      setConsoleLog({
        type: data.overall_status === 'passed' ? 'success' : 'error',
        message: data.overall_status === 'passed' ? 'All public test cases passed successfully!' : 'Code execution failed or produced mismatched output.',
        details: data
      });
      setActiveConsoleTab('results');
    },
    onError: (err: any) => {
      setConsoleLog({
        type: 'error',
        message: err.response?.data?.error || 'Execution failed. Compilation server might be temporarily busy.'
      });
      setActiveConsoleTab('results');
    }
  });

  // Submit Code mutation
  const submitMutation = useMutation({
    mutationFn: async (payload: { code: string; language_slug: string }) => {
      const response = await api.post(`/questions/${questionId}/submit/`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      setConsoleLog({
        type: data.overall_status === 'accepted' ? 'success' : 'error',
        message: data.overall_status === 'accepted' ? '🎉 Accepted! Solution verified across full test case suite.' : 'Wrong Answer or Runtime Error during evaluation.',
        details: data
      });
      setActiveConsoleTab('results');
      queryClient.invalidateQueries({ queryKey: ['question', questionId] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      refetchSubmissions();
    },
    onError: (err: any) => {
      setConsoleLog({
        type: 'error',
        message: err.response?.data?.error || 'Submission failed. Compiler service might be temporarily unavailable.'
      });
      setActiveConsoleTab('results');
    }
  });

  const handleRun = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!selectedLang) return;
    setConsoleLog(null);
    runMutation.mutate({
      code: codeMap[selectedLang.slug] || '',
      language_slug: selectedLang.slug
    });
  };

  const handleSubmit = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!selectedLang) return;
    setConsoleLog(null);
    submitMutation.mutate({
      code: codeMap[selectedLang.slug] || '',
      language_slug: selectedLang.slug
    });
  };

  const handleReset = () => {
    if (!question || !selectedLang) return;
    try {
      const originalStarters = JSON.parse(question.starter_code);
      setCodeMap(prev => ({
        ...prev,
        [selectedLang.slug]: originalStarters[selectedLang.slug] || ''
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const updateCode = (newCode: string) => {
    if (!selectedLang) return;
    setCodeMap(prev => ({
      ...prev,
      [selectedLang.slug]: newCode
    }));
  };

  const getDifficultyColor = (lvl?: string) => {
    switch (lvl) {
      case 'basic': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'easy': return 'text-sky-500 bg-sky-500/10 border-sky-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'hard': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-500';
    }
  };

  if (qLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[70vh] bg-slate-50 dark:bg-[#07080d]">
        <Loader2 className="animate-spin text-blue-600 mb-3" size={40} />
        <span className="text-slate-500 dark:text-slate-400 font-extrabold text-sm tracking-wider uppercase font-mono animate-pulse">
          Assembling compiler workspace...
        </span>
      </div>
    );
  }

  if (qError || !question) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-3xl text-center text-red-650 flex flex-col items-center gap-3">
        <ShieldAlert size={44} className="text-red-550 animate-bounce" />
        <h3 className="font-extrabold text-lg">IDE Session Terminated</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Could not load the problem variables from the compilation database. Ensure APIs are active.</p>
        <Link to="/dashboard/coding" className="mt-2 px-5 py-2.5 bg-red-600 hover:bg-red-750 text-white rounded-xl text-xs font-bold transition-all shadow-md">
          Return to Coding Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#07080d]">
      {/* Top Header Bar */}
      <header className="h-12 border-b border-slate-200 dark:border-slate-850 bg-white/70 dark:bg-[#0b0c14]/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 transition-colors z-10">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/coding"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Coding Hub
          </Link>
          <span className="text-slate-300 dark:text-slate-800">|</span>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-205 flex items-center gap-2">
            <BookOpen size={13} className="text-blue-500" />
            {question.title}
          </span>
          {question.solved && (
            <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded-md border border-emerald-500/20 uppercase tracking-widest font-mono">
              <CheckCircle2 size={10} className="fill-emerald-500/10" />
              SOLVED
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded border border-slate-200/50 dark:border-slate-800/60 uppercase">
            editor theme: {editorTheme}
          </span>
        </div>
      </header>

      {/* Main Split Panels Area */}
      <div className={`flex-grow overflow-hidden ${
        isDescFullscreen || isEditorFullscreen ? 'flex flex-col' : 'grid grid-cols-1 lg:grid-cols-2'
      }`}>
        
        {/* LEFT COLUMN: Problem Details */}
        <div className={`flex flex-col h-full bg-white dark:bg-[#0b0c14]/50 border-r border-slate-200 dark:border-slate-850 overflow-y-auto p-6 transition-all ${
          isDescFullscreen ? 'w-full' : isEditorFullscreen ? 'hidden' : ''
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-150 dark:border-slate-850 mb-5">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1">
              <Settings size={11} />
              Description Panel
            </span>
            <button
              onClick={() => {
                setIsDescFullscreen(!isDescFullscreen);
                setIsEditorFullscreen(false);
              }}
              className="text-[11px] text-slate-550 dark:text-slate-450 hover:text-blue-500 dark:hover:text-blue-400 flex items-center gap-1 font-bold cursor-pointer transition-colors"
            >
              {isDescFullscreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
              {isDescFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>

          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            {question.title}
          </h1>

          {/* Limits badges */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mb-6 font-mono font-bold">
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 px-2 py-1 rounded-md border border-slate-200/50 dark:border-slate-800">
              <Clock size={11} className="text-blue-500" />
              Time Limit: {question.time_limit}s
            </span>
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 px-2 py-1 rounded-md border border-slate-200/50 dark:border-slate-800">
              <HardDrive size={11} className="text-indigo-500" />
              Memory Limit: {question.memory_limit}MB
            </span>
            <span className={`px-2 py-1 rounded-md border uppercase tracking-wider ${getDifficultyColor(question.level_name)}`}>
              {question.level_name} Level
            </span>
          </div>

          {/* Problem Statement */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6 space-y-4 font-medium">
            <p className="whitespace-pre-line leading-relaxed">{question.statement}</p>
          </div>

          {/* Input Format */}
          {question.input_format && (
            <div className="mb-5">
              <h4 className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-2 font-mono flex items-center gap-1">
                <Terminal size={11} />
                Input Format
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed bg-slate-100/40 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 whitespace-pre-wrap font-medium">
                {question.input_format}
              </p>
            </div>
          )}

          {/* Output Format */}
          {question.output_format && (
            <div className="mb-5">
              <h4 className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-2 font-mono flex items-center gap-1">
                <Terminal size={11} />
                Output Format
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed bg-slate-100/40 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 whitespace-pre-wrap font-medium">
                {question.output_format}
              </p>
            </div>
          )}

          {/* Constraints */}
          {question.constraints && (
            <div className="mb-6">
              <h4 className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-2 font-mono flex items-center gap-1">
                <Cpu size={11} />
                Constraints
              </h4>
              <pre className="p-3 bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl font-mono text-xs text-slate-650 dark:text-slate-350 whitespace-pre-wrap">
                {question.constraints}
              </pre>
            </div>
          )}

          {/* Examples Display */}
          {(() => {
            let parsedExamples: Array<{ input: string; output: string; explanation?: string }> = [];
            if (question.examples) {
              try {
                parsedExamples = JSON.parse(question.examples);
              } catch (e) {
                parsedExamples = [];
              }
            }
            return (
              <div className="mb-6">
                <h4 className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-3 font-mono flex items-center gap-1">
                  <Sparkles size={11} />
                  Test Case Examples
                </h4>
                <div className="space-y-4 animate-fade-in">
                  {parsedExamples.length > 0 ? (
                    parsedExamples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-100/40 dark:bg-slate-900/20 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 text-xs font-mono"
                      >
                        <p className="font-extrabold text-slate-550 dark:text-slate-400 mb-2">Example {idx + 1}:</p>
                        <div className="space-y-3 mt-2">
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 block mb-1 text-[10px] font-extrabold uppercase font-mono">Input</span>
                            <pre className="bg-white dark:bg-slate-900/80 p-2.5 rounded-lg text-slate-800 dark:text-slate-250 border border-slate-200/50 dark:border-slate-800 overflow-x-auto whitespace-pre-wrap">{ex.input}</pre>
                          </div>
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 block mb-1 text-[10px] font-extrabold uppercase font-mono">Output</span>
                            <pre className="bg-white dark:bg-slate-900/80 p-2.5 rounded-lg text-slate-850 dark:text-emerald-450 border border-slate-200/50 dark:border-slate-800 overflow-x-auto whitespace-pre-wrap">{ex.output}</pre>
                          </div>
                          {ex.explanation && (
                            <div>
                              <span className="text-slate-400 dark:text-slate-500 block mb-1 text-[10px] font-extrabold uppercase font-sans">Explanation</span>
                              <p className="bg-blue-50/10 dark:bg-blue-950/5 p-2.5 rounded-lg text-slate-700 dark:text-slate-300 font-sans leading-relaxed whitespace-pre-wrap border border-blue-500/5">{ex.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    question.test_cases.filter(tc => !tc.is_hidden).map((tc, idx) => (
                      <div
                        key={tc.id}
                        className="bg-slate-100/40 dark:bg-slate-900/20 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 text-xs font-mono"
                      >
                        <p className="font-extrabold text-slate-550 dark:text-slate-400 mb-2">Example {idx + 1}:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 block mb-1 text-[10px] font-extrabold uppercase font-mono">Input</span>
                            <pre className="bg-white dark:bg-slate-900/80 p-2.5 rounded-lg text-slate-800 dark:text-slate-250 border border-slate-200/50 dark:border-slate-800 overflow-x-auto">{tc.input_data}</pre>
                          </div>
                          <div>
                            <span className="text-slate-400 dark:text-slate-500 block mb-1 text-[10px] font-extrabold uppercase font-mono">Expected Output</span>
                            <pre className="bg-white dark:bg-slate-900/80 p-2.5 rounded-lg text-slate-850 dark:text-emerald-450 border border-slate-200/50 dark:border-slate-800 overflow-x-auto">{tc.expected_output}</pre>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })()}

          {/* Notes / Hints */}
          {question.notes && (
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-3 font-mono flex items-center gap-1">
                <HelpCircle size={11} />
                Notes & Hints
              </h4>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed bg-blue-50/10 dark:bg-blue-950/15 p-4 rounded-xl border border-blue-500/10 dark:border-blue-900/30 whitespace-pre-wrap font-medium">
                {question.notes}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Code Editor + Output drawer console */}
        <div className={`flex flex-col h-full overflow-hidden ${
          isEditorFullscreen ? 'w-full' : isDescFullscreen ? 'hidden' : ''
        }`}>
          {/* Editor Control Header */}
          <div className="h-12 border-b border-slate-200 dark:border-slate-850 bg-white/70 dark:bg-[#0b0c14]/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 transition-colors z-10">
            <div className="flex items-center gap-2.5">
              <FileCode size={14} className="text-blue-550" />
              <select
                className="bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-850 dark:text-slate-100 cursor-pointer"
                value={selectedLang?.slug || ''}
                onChange={(e) => {
                  const target = languages?.find(l => l.slug === e.target.value);
                  if (target) setSelectedLang(target);
                }}
              >
                {languages?.map(lang => (
                  <option key={lang.id} value={lang.slug}>{lang.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setIsEditorFullscreen(!isEditorFullscreen);
                  setIsDescFullscreen(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
                title="Toggle Fullscreen Editor"
              >
                {isEditorFullscreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                {isEditorFullscreen ? 'Exit Full' : 'Fullscreen'}
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
                title="Reset code template"
              >
                <RefreshCw size={11} />
                Reset Code
              </button>
            </div>
          </div>

          {/* Monaco Editor Canvas */}
          <div className={`flex-grow relative bg-[#1e1e1e] ${isConsoleExpanded ? 'hidden' : 'block'}`}>
            {selectedLang && (
              <Editor
                height="100%"
                theme={editorTheme}
                language={selectedLang.slug}
                value={codeMap[selectedLang.slug] || ''}
                onChange={(val) => updateCode(val || '')}
                options={{
                  fontSize: 13.5,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  scrollBeyondLastLine: false,
                  lineHeight: 22,
                  tabSize: 4,
                  lineNumbersMinChars: 3,
                }}
              />
            )}
          </div>

          {/* Output Drawer Console */}
          <div className={`border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-[#0b0c14] flex flex-col shrink-0 overflow-hidden transition-all duration-300 ${
            isConsoleExpanded ? 'flex-grow h-full' : 'h-72'
          }`}>
            {/* Drawer Tabs */}
            <div className="h-10 border-b border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 px-4 flex items-center justify-between shrink-0">
              <div className="flex gap-4">
                {[
                  { id: 'results', label: 'Console Output', icon: Terminal },
                  { id: 'testcases', label: 'Custom Input', icon: HelpCircle },
                  { id: 'submissions', label: 'Submissions Logs', icon: History }
                ].map(tab => {
                  const active = activeConsoleTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveConsoleTab(tab.id as any)}
                      className={`h-10 px-1.5 flex items-center gap-1.5 border-b-2 font-bold text-[11px] transition-all cursor-pointer ${
                        active
                          ? 'border-blue-600 text-blue-600 dark:border-blue-450 dark:text-blue-455'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
                      }`}
                    >
                      <Icon size={12} className={active ? 'text-blue-500' : ''} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
                className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-850 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                {isConsoleExpanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                {isConsoleExpanded ? 'Minimize' : 'Maximize'}
              </button>
            </div>

            {/* Console Content Screens */}
            <div className="flex-grow p-4 overflow-y-auto font-mono text-[11px] bg-white dark:bg-[#07080d] text-slate-800 dark:text-slate-200">
              {/* TAB RESULTS */}
              {activeConsoleTab === 'results' && (
                <div className="space-y-3">
                  {!consoleLog && !runMutation.isPending && !submitMutation.isPending && (
                    <span className="text-slate-400 italic">Run or Submit your solution to evaluate output metrics.</span>
                  )}
                  
                  {(runMutation.isPending || submitMutation.isPending) && (
                    <div className="flex items-center gap-2.5 text-blue-500 py-3 font-semibold">
                      <Loader2 size={15} className="animate-spin text-blue-500" />
                      <span>Sending solution payload to sandbox compiler...</span>
                    </div>
                  )}

                  {consoleLog && consoleLog.type === 'error' && (
                    <div className="text-rose-500 bg-rose-500/5 border border-rose-500/25 p-4 rounded-xl">
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <X size={14} className="text-rose-500" />
                        <span>Compilation Error Verdict</span>
                      </div>
                      <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-rose-500 font-mono mt-2 bg-[#0c0508] p-3 rounded-lg border border-rose-950/20">{consoleLog.message}</pre>
                    </div>
                  )}

                  {consoleLog && (consoleLog.type === 'run' || consoleLog.type === 'submit') && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Metric Results Headers */}
                      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Overall Status</span>
                          <span
                            className={`text-sm font-black uppercase ${
                              consoleLog.status === 'Accepted' ? 'text-emerald-500' : 'text-rose-500'
                            }`}
                          >
                            {consoleLog.status}
                          </span>
                        </div>
                        
                        <div className="flex gap-5">
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Passed Cases</span>
                            <span className="font-extrabold text-xs">{consoleLog.passed_count ?? consoleLog.passed_test_cases} / {consoleLog.total_count ?? consoleLog.total_test_cases}</span>
                          </div>
                          {(consoleLog.max_time !== undefined || consoleLog.execution_time !== undefined) && (
                            <div className="text-right">
                              <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Execution Time</span>
                              <span className="font-extrabold font-mono text-xs">{consoleLog.max_time ?? consoleLog.execution_time}s</span>
                            </div>
                          )}
                          {(consoleLog.max_memory !== undefined || consoleLog.memory_usage !== undefined) && (
                            <div className="text-right">
                              <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Max Memory</span>
                              <span className="font-extrabold font-mono text-xs">{((consoleLog.max_memory ?? consoleLog.memory_usage) / 1024).toFixed(2)} MB</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Error Messages */}
                      {consoleLog.error_message && (
                        <div className="text-rose-500 bg-rose-500/5 border border-rose-500/20 p-3.5 rounded-xl whitespace-pre-wrap">
                          {consoleLog.error_message}
                        </div>
                      )}

                      {/* Test Case Breakdown */}
                      {consoleLog.test_case_details && (
                        <div className="space-y-2">
                          <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold mb-2">Test Suite Execution Details</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {consoleLog.test_case_details.map((tc: any, index: number) => {
                              const isOK = tc.status === 'Accepted';
                              return (
                                <div
                                  key={index}
                                  className={`p-3 bg-slate-100/40 dark:bg-slate-900/50 border rounded-xl flex items-center justify-between text-xs transition-all ${
                                    isOK 
                                      ? 'border-emerald-500/10 dark:border-emerald-950/20' 
                                      : 'border-rose-500/15 dark:border-rose-950/20'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={isOK ? 'text-emerald-500' : 'text-rose-500'}>
                                      {isOK ? (
                                        <CheckCircle2 size={13} className="fill-emerald-500/10" />
                                      ) : (
                                        <X size={13} className="text-rose-500" />
                                      )}
                                    </span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-350">
                                      Case {index + 1} {tc.is_hidden && <span className="text-[9px] opacity-60 font-bold bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded ml-1">[Hidden]</span>}
                                    </span>
                                  </div>
                                  <span className={`font-bold text-[10px] font-mono uppercase ${isOK ? 'text-emerald-555' : 'text-rose-600'}`}>
                                    {tc.status}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CUSTOM INPUT */}
              {activeConsoleTab === 'testcases' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">Stdin Console Stream Payload:</span>
                    <button
                      onClick={() => setShowCustomInput(!showCustomInput)}
                      className="text-xs text-blue-600 hover:text-blue-500 font-bold"
                    >
                      {showCustomInput ? 'Hide Panel' : 'Expand Terminal Input'}
                    </button>
                  </div>
                  
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter mock input dataset matching inputs format constraint (e.g. 5\n1 3 5 7 9)"
                    className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Inputs are applied to compilation streams during run commands instead of defaults.</p>
                </div>
              )}

              {/* TAB SUBMISSIONS HISTORY */}
              {activeConsoleTab === 'submissions' && (
                <div className="space-y-2">
                  {!submissions || submissions.length === 0 ? (
                    <span className="text-slate-400 italic">No submissions recorded for this problem yet.</span>
                  ) : (
                    submissions.map((sub) => {
                      const isOK = sub.status === 'Accepted';
                      return (
                        <div
                          key={sub.id}
                          className={`p-3 bg-slate-100/40 dark:bg-slate-900/40 border rounded-xl flex items-center justify-between text-xs transition-all ${
                            isOK ? 'border-emerald-500/10' : 'border-rose-500/10'
                          }`}
                        >
                          <div>
                            <span
                              className={`font-black uppercase mr-3 ${
                                isOK ? 'text-emerald-555' : 'text-rose-500'
                              }`}
                            >
                              {sub.status}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono font-semibold">
                              {sub.language_name} | {new Date(sub.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/50 dark:border-slate-800">
                            {sub.passed_test_cases} / {sub.total_test_cases} Cases
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Run / Submit Action Panel footer */}
            <footer className="h-14 border-t border-slate-200 dark:border-slate-850 bg-white/70 dark:bg-[#0b0c14]/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 transition-colors z-10">
              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">
                Judge0 Compiler Sandbox Engine
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={handleRun}
                  disabled={runMutation.isPending || submitMutation.isPending || !selectedLang}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-250 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Execute code against visible test cases"
                >
                  <Play size={11} fill="currentColor" />
                  Run Code
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={runMutation.isPending || submitMutation.isPending || !selectedLang}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-750 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white text-xs font-extrabold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Submit code against all test cases"
                >
                  <Check size={12} strokeWidth={3} />
                  Submit Code
                </button>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;

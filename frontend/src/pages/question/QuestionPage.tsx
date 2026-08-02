import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import api from '../../services/api';
import { setSEOMetadata, getQuestionSchema } from '../../utils/seo';
import { useTheme } from '../../context/ThemeContext';
import { 
  ArrowLeft, Terminal, Play, CheckCircle2, AlertTriangle, 
  RefreshCw, FileCode, Clock, HardDrive, History, Loader2, HelpCircle,
  Maximize2, Minimize2
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
  const { data: question, isLoading: qLoading, error: qError } = useQuery<Question>({
    queryKey: ['question', questionId],
    queryFn: async () => {
      const response = await api.get(`/questions/${questionId}/`);
      return response.data;
    }
  });

  // Fetch question submissions history
  const { data: submissions, refetch: refetchSubmissions } = useQuery<Submission[]>({
    queryKey: ['submissions', questionId],
    queryFn: async () => {
      const response = await api.get(`/submissions/?question=${questionId}`);
      return response.data;
    }
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
        title: `${question.title} | CodeBrainzX IDE`,
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
      setConsoleLog({ type: 'run', ...data });
      setActiveConsoleTab('results');
    },
    onError: (err: any) => {
      setConsoleLog({
        type: 'error',
        message: err.response?.data?.error || 'Execution failed. Please verify compilation parameters.'
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
      setConsoleLog({ type: 'submit', ...data });
      setActiveConsoleTab('results');
      // Refresh queries to update solved stats
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
    if (!selectedLang) return;
    setConsoleLog(null);
    runMutation.mutate({
      code: codeMap[selectedLang.slug] || '',
      language_slug: selectedLang.slug
    });
  };

  const handleSubmit = () => {
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

  if (qLoading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[70vh]">
        <Loader2 className="animate-spin text-blue-600 mr-2" size={32} />
        <span className="text-slate-500 font-semibold">Preparing coding workspace...</span>
      </div>
    );
  }

  if (qError || !question) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900 rounded-2xl text-center text-red-650">
        <AlertTriangle size={36} className="mx-auto mb-3" />
        <h3 className="font-bold text-lg mb-1">Workspace Error</h3>
        <p className="text-sm mb-4">Could not load the problem statement. Ensure your API is responding.</p>
        <Link to="/dashboard/coding" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold">
          Return to Coding
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Header Bar */}
      <div className="h-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex items-center justify-between shrink-0 transition-colors">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/coding"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={14} />
            Coding
          </Link>
          <span className="text-slate-350 dark:text-slate-700">|</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {question.title}
          </span>
          {question.solved && (
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-200/50">
              <CheckCircle2 size={10} />
              SOLVED
            </span>
          )}
        </div>

        {/* IDE Layout Options */}
        <div className="flex items-center gap-4">
          {/* Theme display */}
          <span className="text-[10px] font-mono text-slate-400">
            theme: {editorTheme}
          </span>
        </div>
      </div>

      {/* Main Splits Area */}
      <div className={`flex-grow overflow-hidden bg-slate-100 dark:bg-[#06070a] ${
        isDescFullscreen || isEditorFullscreen ? 'flex flex-col' : 'grid grid-cols-1 lg:grid-cols-2'
      }`}>
        {/* LEFT COLUMN: Problem Details */}
        <div className={`flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-850 overflow-y-auto p-6 transition-colors ${
          isDescFullscreen ? 'w-full' : isEditorFullscreen ? 'hidden' : ''
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Question details
            </span>
            <button
              onClick={() => {
                setIsDescFullscreen(!isDescFullscreen);
                setIsEditorFullscreen(false);
              }}
              className="text-xs text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 flex items-center gap-1 font-semibold cursor-pointer"
            >
              {isDescFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              {isDescFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">
            {question.title}
          </h1>

          {/* Limits tags */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mb-6 font-mono">
            <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-850 px-2 py-1 rounded border border-slate-150">
              <Clock size={12} />
              Time Limit: {question.time_limit}s
            </span>
            <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-850 px-2 py-1 rounded border border-slate-150">
              <HardDrive size={12} />
              Memory Limit: {question.memory_limit}MB
            </span>
            <span className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 uppercase text-[10px] font-extrabold">
              {question.level_name} Level
            </span>
          </div>

          {/* Problem Statement */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-8 space-y-4">
            <p className="whitespace-pre-line">{question.statement}</p>
          </div>

          {/* Input Format */}
          {question.input_format && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                Input Format
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed bg-slate-50/50 dark:bg-slate-850/10 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800 whitespace-pre-wrap">
                {question.input_format}
              </p>
            </div>
          )}

          {/* Output Format */}
          {question.output_format && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2 font-mono">
                Output Format
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed bg-slate-50/50 dark:bg-slate-850/10 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800 whitespace-pre-wrap">
                {question.output_format}
              </p>
            </div>
          )}

          {/* Constraints */}
          {question.constraints && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 font-mono">
                Constraints
              </h3>
              <pre className="p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-650 dark:text-slate-350">
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
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 font-mono">
                  Examples
                </h3>
                <div className="space-y-4">
                  {parsedExamples.length > 0 ? (
                    parsedExamples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 dark:bg-slate-850/30 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs font-mono"
                      >
                        <p className="font-semibold text-slate-550 dark:text-slate-400 mb-1">Example {idx + 1}:</p>
                        <div className="space-y-2.5 mt-2">
                          <div>
                            <span className="text-slate-400 block mb-1">Input</span>
                            <pre className="bg-slate-150 dark:bg-slate-850 p-2 rounded text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap">{ex.input}</pre>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-1">Output</span>
                            <pre className="bg-slate-150 dark:bg-slate-850 p-2 rounded text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap">{ex.output}</pre>
                          </div>
                          {ex.explanation && (
                            <div>
                              <span className="text-slate-400 block mb-1 font-sans">Explanation</span>
                              <p className="bg-slate-100/50 dark:bg-slate-850/20 p-2.5 rounded text-slate-700 dark:text-slate-350 font-sans leading-relaxed whitespace-pre-wrap">{ex.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    question.test_cases.filter(tc => !tc.is_hidden).map((tc, idx) => (
                      <div
                        key={tc.id}
                        className="bg-slate-50 dark:bg-slate-850/30 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs font-mono"
                      >
                        <p className="font-semibold text-slate-550 dark:text-slate-400 mb-1">Example {idx + 1}:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div>
                            <span className="text-slate-400 block mb-1">Input</span>
                            <pre className="bg-slate-150 dark:bg-slate-850 p-2 rounded text-slate-800 dark:text-slate-200 overflow-x-auto">{tc.input_data}</pre>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-1">Expected Output</span>
                            <pre className="bg-slate-150 dark:bg-slate-850 p-2 rounded text-slate-800 dark:text-slate-200 overflow-x-auto">{tc.expected_output}</pre>
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
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 font-mono">
                Notes & Hints
              </h3>
              <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed bg-blue-50/10 dark:bg-blue-950/10 p-4 rounded-xl border border-blue-100/50 dark:border-blue-900/30 whitespace-pre-wrap">
                {question.notes}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Code Editor + Output Drawer */}
        <div className={`flex flex-col h-full overflow-hidden ${
          isEditorFullscreen ? 'w-full' : isDescFullscreen ? 'hidden' : ''
        }`}>
          {/* Editor Header Bar */}
          <div className="h-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex items-center justify-between shrink-0 transition-colors">
            <div className="flex items-center gap-3">
              <FileCode size={15} className="text-blue-500" />
              <select
                className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-white"
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsEditorFullscreen(!isEditorFullscreen);
                  setIsDescFullscreen(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
              >
                {isEditorFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                {isEditorFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
              >
                <RefreshCw size={12} />
                Reset starter code
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
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  scrollBeyondLastLine: false,
                  lineHeight: 22,
                }}
              />
            )}
          </div>

          {/* Output Drawer Console */}
          <div className={`border-t border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 overflow-hidden transition-colors ${
            isConsoleExpanded ? 'flex-grow h-full' : 'h-64'
          }`}>
            {/* Drawer Tabs */}
            <div className="h-10 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 flex items-center justify-between shrink-0">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveConsoleTab('results')}
                  className={`h-10 px-2 flex items-center gap-1.5 border-b-2 font-semibold text-xs transition-colors cursor-pointer ${
                    activeConsoleTab === 'results'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
                  }`}
                >
                  <Terminal size={12} />
                  Console Output
                </button>
                <button
                  onClick={() => setActiveConsoleTab('testcases')}
                  className={`h-10 px-2 flex items-center gap-1.5 border-b-2 font-semibold text-xs transition-colors cursor-pointer ${
                    activeConsoleTab === 'testcases'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
                  }`}
                >
                  <HelpCircle size={12} />
                  Custom Input
                </button>
                <button
                  onClick={() => setActiveConsoleTab('submissions')}
                  className={`h-10 px-2 flex items-center gap-1.5 border-b-2 font-semibold text-xs transition-colors cursor-pointer ${
                    activeConsoleTab === 'submissions'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'
                  }`}
                >
                  <History size={12} />
                  My Submissions
                </button>
              </div>
              <button
                onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer transition-colors"
              >
                {isConsoleExpanded ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                {isConsoleExpanded ? 'Minimize' : 'Maximize'}
              </button>
            </div>

            {/* Console Content Screens */}
            <div className="flex-grow p-4 overflow-y-auto font-mono text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
              {/* TAB RESULTS */}
              {activeConsoleTab === 'results' && (
                <div>
                  {!consoleLog && !runMutation.isPending && !submitMutation.isPending && (
                    <span className="text-slate-400">Run or Submit your solution to evaluate output metrics.</span>
                  )}
                  {(runMutation.isPending || submitMutation.isPending) && (
                    <div className="flex items-center gap-2 text-blue-500 py-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting code to compiler API... please wait.</span>
                    </div>
                  )}
                  {consoleLog && consoleLog.type === 'error' && (
                    <div className="text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-3 rounded-lg">
                      <p className="font-bold">Error:</p>
                      <pre className="whitespace-pre-wrap mt-1 text-[11px]">{consoleLog.message}</pre>
                    </div>
                  )}
                  {consoleLog && (consoleLog.type === 'run' || consoleLog.type === 'submit') && (
                    <div className="space-y-4">
                      {/* Metric Results Headers */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Overall Verdict</span>
                          <span
                            className={`text-sm font-extrabold ${
                              consoleLog.status === 'Accepted' ? 'text-emerald-500' : 'text-red-500'
                            }`}
                          >
                            {consoleLog.status}
                          </span>
                        </div>
                        
                        <div className="flex gap-6">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Passed Cases</span>
                            <span className="font-bold">{consoleLog.passed_count || consoleLog.passed_test_cases} / {consoleLog.total_count || consoleLog.total_test_cases}</span>
                          </div>
                          {consoleLog.max_time !== undefined && (
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Max CPU Time</span>
                              <span className="font-bold font-mono">{consoleLog.max_time || consoleLog.execution_time}s</span>
                            </div>
                          )}
                          {consoleLog.max_memory !== undefined && (
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Max Memory</span>
                              <span className="font-bold font-mono">{(consoleLog.max_memory || consoleLog.memory_usage).toFixed(0)} KB</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Error Messages */}
                      {consoleLog.error_message && (
                        <div className="text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-3 rounded-lg whitespace-pre-wrap">
                          {consoleLog.error_message}
                        </div>
                      )}

                      {/* Test Case Breakdown */}
                      {consoleLog.test_case_details && (
                        <div className="space-y-2.5">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Evaluation Details</span>
                          {consoleLog.test_case_details.map((tc: any, index: number) => (
                            <div
                              key={index}
                              className="p-3 bg-slate-50 dark:bg-slate-850/30 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className={tc.status === 'Accepted' ? 'text-emerald-500' : 'text-red-500'}>
                                  {tc.status === 'Accepted' ? '✓' : '✗'}
                                </span>
                                <span>Test Case {index + 1} {tc.is_hidden && <strong className="text-slate-400">[Hidden]</strong>}</span>
                              </div>
                              <span className={`font-bold ${tc.status === 'Accepted' ? 'text-emerald-600' : 'text-red-650'}`}>
                                {tc.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CUSTOM INPUT */}
              {activeConsoleTab === 'testcases' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Enter custom input sequence matching stdin constraints:</span>
                    <button
                      onClick={() => setShowCustomInput(!showCustomInput)}
                      className="text-xs text-blue-600 font-semibold"
                    >
                      {showCustomInput ? 'Hide panel' : 'Open input panel'}
                    </button>
                  </div>
                  
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g. 1 2 3"
                    className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400">Custom inputs will be submitted to the compiler context during execution checks.</p>
                </div>
              )}

              {/* TAB SUBMISSIONS HISTORY */}
              {activeConsoleTab === 'submissions' && (
                <div className="space-y-2">
                  {!submissions || submissions.length === 0 ? (
                    <span className="text-slate-450">No submissions recorded for this problem yet.</span>
                  ) : (
                    submissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3 bg-slate-50 dark:bg-slate-850/40 border border-slate-150 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <span
                            className={`font-bold mr-3 ${
                              sub.status === 'Accepted' ? 'text-emerald-500' : 'text-red-500'
                            }`}
                          >
                            {sub.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {sub.language_name} | {new Date(sub.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[10px] font-mono">
                          {sub.passed_test_cases}/{sub.total_test_cases} Cases
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Run / Submit Action Panel */}
            <div className="h-14 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 flex items-center justify-between shrink-0 transition-colors">
              <span className="text-[10px] text-slate-400">
                CodeBrainzX Compiler Sandbox
              </span>
              
              <div className="flex gap-3">
                <button
                  onClick={handleRun}
                  disabled={runMutation.isPending || submitMutation.isPending || !selectedLang}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Play size={12} />
                  Run Code
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={runMutation.isPending || submitMutation.isPending || !selectedLang}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow shadow-blue-500/10 hover:shadow-blue-500/20 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  Submit Solution
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;

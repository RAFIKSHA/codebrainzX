import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Brain, Calculator, ChevronLeft, ChevronRight, Maximize2, ShieldAlert, Clock, RefreshCw, LayoutGrid, X
} from 'lucide-react';
import aptitudeService from '../../services/aptitude';
import type { AptitudeAttemptPayload, AptitudeQuestion } from '../../services/aptitude';

const AptitudeTestEngine: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<AptitudeAttemptPayload['attempt'] | null>(null);
  const [questions, setQuestions] = useState<AptitudeAttemptPayload['questions']>([]);
  const [responses, setResponses] = useState<AptitudeAttemptPayload['responses']>({});
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState<number>(0); // In seconds
  const [sectionTimeLeft, setSectionTimeLeft] = useState<number | null>(null);

  // Active indices
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [_isFullscreen, setIsFullscreen] = useState<boolean>(false); // tracks fullscreen state
  const [showFullscreenModal, setShowFullscreenModal] = useState<boolean>(true);
  
  // Floating Calculator Toggle
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [calcInput, setCalcInput] = useState<string>('');
  
  // Warning Counter for full-screen escapes/tab switches
  const [warnings, setWarnings] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showMobilePalette, setShowMobilePalette] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  const loadTestAttempt = async () => {
    try {
      setLoading(true);
      let payload: AptitudeAttemptPayload;
      
      const locState = location.state as { attemptData?: AptitudeAttemptPayload } | null;
      if (locState?.attemptData) {
        payload = locState.attemptData;
      } else {
        payload = await aptitudeService.startTest(Number(testId));
      }
      
      setAttempt(payload.attempt);
      setQuestions(payload.questions);
      setResponses(payload.responses);
      setTimeLeft(payload.time_left_seconds);
      setActiveIdx(payload.attempt.current_question_index || 0);

      // Section Timer check
      if ((payload.attempt as any).section_timer && payload.attempt.current_section) {
        // Enforce section timer constraints
        // For simplicity: approximate remaining section time from overall remaining time
        // or configure it based on section settings. We will estimate section timer:
        const secDuration = 20 * 60; // 20 minutes default
        setSectionTimeLeft(secDuration);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load test session. Returning to dashboard.');
      navigate('/dashboard/aptitude');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestAttempt();

    // Listeners for anti-cheat
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings(prev => {
          const w = prev + 1;
          if (w >= 3) {
            handleSubmitTest(true); // Auto submit on 3 warnings
          }
          return w;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testId]);

  // Main countdown timer loop
  useEffect(() => {
    if (loading || submitting || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitTest(true); // Auto submit on timeout
          return 0;
        }
        return prev - 1;
      });

      if (sectionTimeLeft !== null) {
        setSectionTimeLeft(prev => {
          if (prev !== null && prev <= 1) {
            // Handle section timeout: switch to next section or auto submit
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, timeLeft, sectionTimeLeft, submitting]);

  // Request Fullscreen
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

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (!fs && !submitting) {
        setShowFullscreenModal(true);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [submitting]);

  const activeQuestion: AptitudeQuestion | undefined = questions[activeIdx];
  const activeResponse = activeQuestion ? responses[activeQuestion.id] : null;

  // Handle option select
  const handleSelectOption = (key: string, isMultiple = false) => {
    if (!activeQuestion) return;
    const currentAns = activeResponse?.selected_options || [];
    let updated: string[];

    if (isMultiple) {
      if (currentAns.includes(key)) {
        updated = currentAns.filter(item => item !== key);
      } else {
        updated = [...currentAns, key];
      }
    } else {
      updated = [key];
    }

    updateResponseState(activeQuestion.id, {
      selected_options: updated,
      is_answered: updated.length > 0
    });
  };

  const handleNumericalAnswer = (value: string) => {
    if (!activeQuestion) return;
    updateResponseState(activeQuestion.id, {
      selected_options: [value],
      is_answered: value.trim() !== ''
    });
  };

  const handleMatchSelect = (leftKey: string, rightVal: string) => {
    if (!activeQuestion) return;
    // selected_options stores mapping: e.g. [{"left": "A", "right": "3"}, ...]
    const currentAns = (activeResponse?.selected_options as any) || [];
    
    // Convert current selected options to standard array structure if it is not
    let cleanAns = Array.isArray(currentAns) ? [...currentAns] : [];
    
    // Update or insert matching object
    const index = cleanAns.findIndex((item: any) => item && item.left === leftKey);
    if (index >= 0) {
      cleanAns[index] = { ...cleanAns[index], right: rightVal };
    } else {
      cleanAns.push({ left: leftKey, right: rightVal });
    }

    updateResponseState(activeQuestion.id, {
      selected_options: cleanAns as any,
      is_answered: cleanAns.length > 0
    });
  };

  const updateResponseState = (qId: number, fields: Partial<typeof responses[number]>) => {
    setResponses(prev => {
      const existing = prev[qId] || { selected_options: [], is_marked_for_review: false, is_answered: false, time_spent: 0 };
      return {
        ...prev,
        [qId]: { ...existing, ...fields }
      };
    });
  };

  const handleSaveAndNext = async () => {
    if (!activeQuestion || !attempt) return;
    const currentResp = responses[activeQuestion.id];
    
    // Save to backend API (auto-save)
    try {
      await aptitudeService.saveAnswer(attempt.id, {
        question_id: activeQuestion.id,
        selected_options: currentResp.selected_options,
        is_marked_for_review: currentResp.is_marked_for_review,
        is_answered: currentResp.is_answered,
        time_spent: 1, // Increment time spent
        current_question_index: activeIdx + 1 < questions.length ? activeIdx + 1 : activeIdx
      });

      // Move to next question index
      if (activeIdx + 1 < questions.length) {
        setActiveIdx(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to auto-save:', err);
    }
  };

  const handleMarkForReview = async () => {
    if (!activeQuestion || !attempt) return;
    const currentResp = responses[activeQuestion.id];
    
    const updatedMarked = true;
    updateResponseState(activeQuestion.id, { is_marked_for_review: updatedMarked });

    try {
      await aptitudeService.saveAnswer(attempt.id, {
        question_id: activeQuestion.id,
        selected_options: currentResp.selected_options,
        is_marked_for_review: updatedMarked,
        is_answered: currentResp.is_answered,
        time_spent: 1,
        current_question_index: activeIdx + 1 < questions.length ? activeIdx + 1 : activeIdx
      });

      if (activeIdx + 1 < questions.length) {
        setActiveIdx(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearResponse = async () => {
    if (!activeQuestion || !attempt) return;
    
    updateResponseState(activeQuestion.id, {
      selected_options: [],
      is_answered: false,
      is_marked_for_review: false
    });

    try {
      await aptitudeService.saveAnswer(attempt.id, {
        question_id: activeQuestion.id,
        selected_options: [],
        is_marked_for_review: false,
        is_answered: false,
        time_spent: 0,
        current_question_index: activeIdx
      });
    } catch (err) {
      console.error(err);
    }
  };



  const handleSubmitTest = async (force = false) => {
    if (!attempt) return;
    if (!force && !window.confirm('Are you sure you want to submit this assessment? You cannot modify answers after submission.')) {
      return;
    }

    try {
      setSubmitting(true);
      await aptitudeService.submitTest(attempt.id);
      
      // Close fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      
      navigate(`/dashboard/aptitude/result/${attempt.id}`);
    } catch (err) {
      console.error(err);
      alert('Error submitting test. Please check network connection.');
      setSubmitting(false);
    }
  };

  // TCS Palette status helper
  const getQuestionStatus = (qId: number) => {
    const res = responses[qId];
    if (!res) return 'not_visited';
    if (res.is_answered && res.is_marked_for_review) return 'answered_marked';
    if (res.is_marked_for_review) return 'marked';
    if (res.is_answered) return 'answered';
    return 'not_answered';
  };

  // Timer Formatter: HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculator logic
  const handleCalcPress = (btn: string) => {
    if (btn === 'C') setCalcInput('');
    else if (btn === '=') {
      try {
        // eslint-disable-next-line no-eval
        const res = eval(calcInput);
        setCalcInput(String(res));
      } catch (err) {
        setCalcInput('Error');
      }
    } else if (btn === '⌫') {
      setCalcInput(prev => prev.slice(0, -1));
    } else {
      setCalcInput(prev => prev + btn);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-slate-100">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
        <p className="text-slate-400 text-sm font-semibold">Configuring secure test engine...</p>
      </div>
    );
  }

  // Count states for palette legend
  const qStatusCounts = {
    answered: questions.filter(q => getQuestionStatus(q.id) === 'answered').length,
    not_answered: questions.filter(q => getQuestionStatus(q.id) === 'not_answered').length,
    marked: questions.filter(q => getQuestionStatus(q.id) === 'marked').length,
    answered_marked: questions.filter(q => getQuestionStatus(q.id) === 'answered_marked').length,
    not_visited: questions.filter(q => getQuestionStatus(q.id) === 'not_visited').length,
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-screen bg-[#F8FAFC] text-[#111827] select-none overflow-hidden relative font-sans"
    >
      
      {/* 1. Fullscreen Modal prompt overlay */}
      {showFullscreenModal && (
        <div className="absolute inset-0 bg-[#F8FAFC] z-[9999] flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center animate-pulse shadow-sm">
            <Maximize2 size={32} />
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-xl font-bold text-[#111827]">Assessment Integrity Setup</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              This is a secure TCS NQT placement examination. To proceed with the assessment, please click the button below to enter Locked Full-Screen mode. Leaving full screen or switching tabs will register a penalty violation.
            </p>
          </div>
          <button
            onClick={enterFullscreen}
            className="px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-bold text-sm transition-colors shadow-sm cursor-pointer"
          >
            Enter Assessment
          </button>
        </div>
      )}

      {/* 2. Top Header Navigation */}
      <header className="h-14 border-b border-[#E5E7EB] bg-white px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Brain className="text-[#2563EB] shrink-0" size={20} />
          <div className="min-w-0">
            <h1 className="text-xs font-bold tracking-wide text-slate-800 truncate max-w-[140px] sm:max-w-xs">{attempt?.test_title}</h1>
            <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded bg-slate-50 border border-[#E5E7EB] text-slate-500 uppercase tracking-widest font-bold mt-0.5">
              Candidate Attempt Session
            </span>
          </div>
        </div>

        {/* Dynamic warning bar */}
        {warnings > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold animate-pulse">
            <ShieldAlert size={12} />
            Warnings: {warnings}/3
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Palette Toggle Button (< lg screens) */}
          <button
            onClick={() => setShowMobilePalette(!showMobilePalette)}
            className="lg:hidden p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-[#E5E7EB] text-[#2563EB] transition-colors cursor-pointer"
            title="Question Palette"
          >
            <LayoutGrid size={16} />
          </button>

          {(attempt as any)?.calculator_enabled && (
            <button 
              onClick={() => setShowCalculator(!showCalculator)}
              className="p-2 rounded-lg bg-white border border-[#D1D5DB] text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              title="Open Calculator"
            >
              <Calculator size={16} />
            </button>
          )}

          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-slate-50 border border-[#E5E7EB] text-slate-700 font-mono text-xs sm:text-sm">
            <Clock size={15} className="text-[#2563EB] animate-pulse shrink-0" />
            <span className="font-bold">{formatTime(timeLeft)}</span>
          </div>

          <button 
            onClick={() => handleSubmitTest(false)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer shrink-0"
          >
            Submit
          </button>
        </div>
      </header>      {/* 3. Main Assessment Workspace Panel */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Workspace: Content/Question Viewer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* LEFT PASSAGE PANEL (Optional for Reading Comprehension / Data Interpretation / Puzzles) */}
          {activeQuestion && activeQuestion.parent && (
            <div className="w-full md:w-[40%] border-r border-[#E5E7EB] bg-slate-50 p-6 overflow-y-auto scrollbar-thin">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Passage / Case Study Details</h3>
              <div 
                className="text-xs leading-relaxed text-slate-650 space-y-4 markdown-rendered"
                dangerouslySetInnerHTML={{ __html: activeQuestion.parent || '' }}
              />
            </div>
          )}

          {/* RIGHT WORKSPACE: ACTIVE QUESTION COMPONENT */}
          <div className="flex-grow flex flex-col justify-between bg-white overflow-y-auto scrollbar-thin">
            
            {/* Question Details header */}
            {activeQuestion ? (
              <div className="p-6 md:p-8 space-y-6 flex-1 text-[#111827]">
                <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">Question {activeIdx + 1} of {questions.length}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                      activeQuestion.difficulty === 'easy' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                      activeQuestion.difficulty === 'medium' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-red-50 border-red-100 text-red-700'
                    }`}>
                      {activeQuestion.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-semibold">Marks: <span className="text-slate-700 font-bold">{activeQuestion.marks}</span></span>
                    {activeQuestion.negative_marks > 0 && (
                      <span className="text-xs text-red-500 font-semibold">Neg: <span className="text-red-650 font-bold">-{activeQuestion.negative_marks}</span></span>
                    )}
                  </div>
                </div>

                {/* Question Statement */}
                <div className="space-y-4">
                  <div className="text-sm sm:text-base font-semibold leading-relaxed text-[#111827] markdown-rendered">
                    {activeQuestion.statement}
                  </div>
                  
                  {/* Dynamic inputs based on question types */}
                  <div className="pt-4 space-y-3">
                    
                    {/* MCQ Options */}
                    {(activeQuestion.question_type === 'single_mcq' || activeQuestion.question_type === 'multiple_mcq' || activeQuestion.question_type === 'assertion_reason' || activeQuestion.question_type === 'statement_based') && (
                      <div className="space-y-2.5">
                        {activeQuestion.options.map((opt) => {
                          const isSelected = activeResponse?.selected_options.includes(opt.key);
                          const isMultiple = activeQuestion.question_type === 'multiple_mcq';
                          return (
                            <button
                              key={opt.key}
                              onClick={() => handleSelectOption(opt.key, isMultiple)}
                              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                                isSelected 
                                  ? 'bg-blue-50 border-blue-500 text-[#2563EB] font-bold shadow-sm' 
                                  : 'bg-white border-[#E5E7EB] hover:border-slate-350 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-lg flex items-center justify-center border font-bold text-[10px] ${
                                isSelected ? 'bg-[#2563EB] border-[#2563EB] text-white' : 'border-[#D1D5DB] text-slate-500'
                              }`}>
                                {opt.key}
                              </div>
                              <span className="flex-1 leading-snug">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* True / False input */}
                    {activeQuestion.question_type === 'true_false' && (
                      <div className="flex gap-4">
                        {['True', 'False'].map((val) => {
                          const isSelected = activeResponse?.selected_options.includes(val);
                          return (
                            <button
                              key={val}
                              onClick={() => handleSelectOption(val, false)}
                              className={`flex-1 p-4 rounded-xl border text-center font-bold text-xs transition-colors cursor-pointer ${
                                isSelected 
                                  ? 'bg-blue-50 border-blue-500 text-[#2563EB]' 
                                  : 'bg-white border-[#E5E7EB] hover:border-slate-350 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Numerical answer input */}
                    {activeQuestion.question_type === 'numerical' && (
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Type your Numerical Answer</label>
                        <input
                          type="text"
                          value={activeResponse?.selected_options[0] || ''}
                          onChange={(e) => handleNumericalAnswer(e.target.value)}
                          placeholder="e.g. 12.5"
                          className="w-full bg-white border border-[#D1D5DB] rounded-lg h-10 px-3 text-[#111827] font-mono text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    )}

                    {/* Match the following columns mapping */}
                    {activeQuestion.question_type === 'match_following' && (
                      <div className="space-y-4">
                        <div className="bg-slate-50 border border-[#E5E7EB] p-4 rounded-xl">
                          <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-3">Match Columns</h4>
                          
                          <div className="space-y-3">
                            {/* Matching Row template */}
                            {((activeQuestion.options as any).left || ['A', 'B', 'C', 'D']).map((leftVal: string) => {
                              const mapping = activeResponse?.selected_options.find((item: any) => item && item.left === leftVal) as any;
                              const selectedRight = mapping ? mapping.right : '';

                              return (
                                <div key={leftVal} className="flex items-center gap-4 justify-between bg-white border border-[#E5E7EB] p-2.5 rounded-lg">
                                  <span className="text-xs text-slate-700 font-semibold">Column Left: <span className="text-[#111827] font-bold">{leftVal}</span></span>
                                  
                                  <select
                                    value={selectedRight}
                                    onChange={(e) => handleMatchSelect(leftVal, e.target.value)}
                                    className="bg-white border border-[#D1D5DB] rounded-lg text-slate-700 text-xs px-2 py-1 outline-none focus:border-[#2563EB]"
                                  >
                                    <option value="">Select match...</option>
                                    {((activeQuestion.options as any).right || ['1', '2', '3', '4']).map((rightVal: string) => (
                                      <option key={rightVal} value={rightVal}>{rightVal}</option>
                                    ))}
                                  </select>
                                </div>
                              );
                            })}
                          </div>

                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">No active question data.</div>
            )}

            {/* Bottom Panel Actions Bar */}
            <div className="h-16 border-t border-[#E5E7EB] bg-white px-6 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex gap-2">
                <button
                  onClick={handleClearResponse}
                  className="px-4 py-2 border border-[#D1D5DB] hover:bg-slate-50 text-slate-650 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Clear Response
                </button>
                <button
                  onClick={handleMarkForReview}
                  className="px-4 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Mark for Review
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={activeIdx === 0}
                  onClick={() => setActiveIdx(prev => prev - 1)}
                  className="p-2 border border-[#D1D5DB] text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 rounded-lg cursor-pointer animate-fade-in"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleSaveAndNext}
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg cursor-pointer shadow-sm"
                >
                  Save & Next
                </button>
                <button
                  disabled={activeIdx === questions.length - 1}
                  onClick={() => setActiveIdx(prev => prev + 1)}
                  className="p-2 border border-[#D1D5DB] text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>

        </div>        {/* Right Palette Column */}
        <aside className="hidden lg:flex flex-col w-72 bg-slate-50 border-l border-[#E5E7EB] select-none justify-between h-full text-[#111827]">
          
          <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-thin">
            
            {/* Color index Legend */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Legend Status</h3>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E5E7EB] rounded">
                  <div className="w-3.5 h-3.5 rounded bg-emerald-600 border border-emerald-700"></div>
                  <span>Answered ({qStatusCounts.answered})</span>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E5E7EB] rounded">
                  <div className="w-3.5 h-3.5 rounded bg-red-500 border border-red-600"></div>
                  <span>Not Ans ({qStatusCounts.not_answered})</span>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E5E7EB] rounded">
                  <div className="w-3.5 h-3.5 rounded bg-purple-600 border border-purple-700"></div>
                  <span>Review ({qStatusCounts.marked})</span>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E5E7EB] rounded">
                  <div className="w-3.5 h-3.5 rounded bg-purple-800 border border-purple-900 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                  <span>Ans & Rev ({qStatusCounts.answered_marked})</span>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E5E7EB] rounded col-span-2">
                  <div className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300"></div>
                  <span>Not Visited ({qStatusCounts.not_visited})</span>
                </div>
              </div>
            </div>

            {/* Question Selector Palette Grid */}
            <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Question Palette</h3>
              
              <div className="grid grid-cols-4 gap-2.5">
                {questions.map((q, idx) => {
                  const status = getQuestionStatus(q.id);
                  const isCurrent = idx === activeIdx;

                  let colorClass = 'bg-slate-200 border-slate-300 text-slate-600';
                  if (status === 'answered') colorClass = 'bg-emerald-600 border-emerald-700 text-white';
                  else if (status === 'not_answered') colorClass = 'bg-red-500 border-red-650 text-white';
                  else if (status === 'marked') colorClass = 'bg-purple-600 border-purple-700 text-white';
                  else if (status === 'answered_marked') colorClass = 'bg-purple-800 border-purple-900 text-white';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setActiveIdx(idx)}
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${colorClass} ${
                        isCurrent ? 'ring-2 ring-[#2563EB] ring-offset-2 ring-offset-white scale-105 shadow-sm' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="p-4 border-t border-[#E5E7EB] bg-slate-100 text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            TCS NQT Online Portal
          </div>
        </aside>

      </div>

      {/* 4. Renders Floating Calculator Widget */}
      {showCalculator && (
        <div className="absolute top-20 right-6 w-64 bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-2xl z-[999] space-y-3 cursor-move text-[#111827]">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calculator size={13} className="text-[#2563EB]" /> Scientific Calculator
            </span>
            <button 
              onClick={() => setShowCalculator(false)}
              className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
          
          {/* Display screen */}
          <div className="bg-slate-50 border border-[#E5E7EB] p-2.5 rounded-lg text-right font-mono text-sm tracking-wider text-slate-800 overflow-hidden h-10 flex items-center justify-end select-text">
            {calcInput || '0'}
          </div>
          
          {/* Buttons */}
          <div className="grid grid-cols-4 gap-1.5 font-bold text-xs">
            {['C', '⌫', '(', ')'].map(btn => (
              <button key={btn} onClick={() => handleCalcPress(btn)} className="p-2.5 bg-slate-100 border border-[#E5E7EB] hover:bg-slate-200 rounded-lg text-[#2563EB] cursor-pointer">{btn}</button>
            ))}
            {['7', '8', '9', '/'].map(btn => (
              <button key={btn} onClick={() => handleCalcPress(btn)} className="p-2.5 bg-slate-50 border border-[#E5E7EB] hover:bg-slate-100 rounded-lg cursor-pointer">{btn}</button>
            ))}
            {['4', '5', '6', '*'].map(btn => (
              <button key={btn} onClick={() => handleCalcPress(btn)} className="p-2.5 bg-slate-50 border border-[#E5E7EB] hover:bg-slate-100 rounded-lg cursor-pointer">{btn}</button>
            ))}
            {['1', '2', '3', '-'].map(btn => (
              <button key={btn} onClick={() => handleCalcPress(btn)} className="p-2.5 bg-slate-50 border border-[#E5E7EB] hover:bg-slate-100 rounded-lg cursor-pointer">{btn}</button>
            ))}
            {['0', '.', '=', '+'].map(btn => (
              <button key={btn} onClick={() => handleCalcPress(btn)} className={`p-2.5 rounded-lg cursor-pointer ${btn === '=' ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]' : 'bg-slate-50 border border-[#E5E7EB] hover:bg-slate-100'}`}>{btn}</button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Mobile Palette Drawer Modal */}
      {showMobilePalette && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] lg:hidden flex justify-end">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-5 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <LayoutGrid size={16} className="text-blue-600" /> Question Palette
              </span>
              <button
                onClick={() => setShowMobilePalette(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {questions.map((q, idx) => {
                const status = getQuestionStatus(q.id);
                const isCurrent = idx === activeIdx;

                let colorClass = 'bg-slate-200 border-slate-300 text-slate-600';
                if (status === 'answered') colorClass = 'bg-emerald-600 border-emerald-700 text-white';
                else if (status === 'not_answered') colorClass = 'bg-red-500 border-red-650 text-white';
                else if (status === 'marked') colorClass = 'bg-purple-600 border-purple-700 text-white';
                else if (status === 'answered_marked') colorClass = 'bg-purple-800 border-purple-900 text-white';

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setActiveIdx(idx);
                      setShowMobilePalette(false);
                    }}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${colorClass} ${
                      isCurrent ? 'ring-2 ring-[#2563EB] ring-offset-2 ring-offset-white scale-105 shadow-sm' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowMobilePalette(false)}
              className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-lg mt-auto cursor-pointer"
            >
              Close Palette
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AptitudeTestEngine;

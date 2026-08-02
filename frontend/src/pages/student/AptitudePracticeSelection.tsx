import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Brain, Settings, Calculator, 
  AlertTriangle, Bookmark, Sparkles, Play, RefreshCw
} from 'lucide-react';
import aptitudeService from '../../services/aptitude';
import type { AptitudeCategory } from '../../services/aptitude';
import api from '../../services/api';

const AptitudePracticeSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state as { categoryId?: number; topicId?: number } | null;

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<AptitudeCategory[]>([]);
  
  // Selection states
  const [mode, setMode] = useState<'topic' | 'bookmarks' | 'wrong' | 'recommend'>('topic');
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [calcEnabled, setCalcEnabled] = useState<boolean>(true);
  
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    // Check search params/mode
    const params = new URLSearchParams(location.search);
    const modeParam = params.get('mode');
    if (modeParam === 'bookmarks') setMode('bookmarks');
    else if (modeParam === 'wrong') setMode('wrong');
    else if (modeParam === 'recommend') setMode('recommend');
    else setMode('topic');

    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const cats = await aptitudeService.getCategories();
        setCategories(cats);
        
        if (stateData?.categoryId) {
          setSelectedCatId(stateData.categoryId);
          if (stateData.topicId) {
            setSelectedTopicId(stateData.topicId);
          }
        } else if (cats.length > 0) {
          setSelectedCatId(cats[0].id);
          if (cats[0].topics.length > 0) {
            setSelectedTopicId(cats[0].topics[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, [location]);

  // Update selected topic when category changes
  const handleCatChange = (catId: number) => {
    setSelectedCatId(catId);
    const cat = categories.find(c => c.id === catId);
    if (cat && cat.topics.length > 0) {
      setSelectedTopicId(cat.topics[0].id);
      setSelectedSubTopicId(null);
    } else {
      setSelectedTopicId(null);
      setSelectedSubTopicId(null);
    }
  };

  const handleTopicChange = (topicId: number) => {
    setSelectedTopicId(topicId);
    setSelectedSubTopicId(null);
  };

  const activeCategory = categories.find(c => c.id === selectedCatId);
  const activeTopic = activeCategory?.topics.find(t => t.id === selectedTopicId);

  const handleStartPractice = async () => {
    try {
      setStarting(true);
      const payload = {
        mode,
        topic_id: mode === 'topic' ? selectedTopicId : null,
        sub_topic_id: mode === 'topic' ? selectedSubTopicId : null,
        difficulty: difficulty === 'all' ? null : difficulty,
        count: questionCount,
        calculator_enabled: calcEnabled
      };

      const response = await api.post('/aptitude/attempts/start-practice/', payload);
      
      // Navigate to the test engine with practice attempt details
      navigate(`/dashboard/aptitude/test/${response.data.attempt.test}`, { 
        state: { isPractice: true, attemptData: response.data } 
      });
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to initialize practice session. Verify you have questions in this topic.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="animate-spin text-[#2563EB]" size={32} />
        <p className="text-slate-500 text-sm font-semibold">Configuring practice environment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] space-y-8 animate-fade-in max-w-3xl mx-auto px-4 pb-16 font-sans">
      {/* Back Link */}
      <div className="flex items-center justify-between pt-6">
        <button 
          onClick={() => navigate('/dashboard/aptitude')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Aptitude Hub
        </button>
        <span className="text-[10px] font-mono text-slate-400">aptitude / practice</span>
      </div>

      {/* Main configuration container */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)] space-y-8 relative overflow-hidden">
        
        {/* Title */}
        <div className="space-y-2 border-b border-[#E5E7EB] pb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827] flex items-center gap-2">
            <Settings className="text-[#2563EB]" size={24} />
            Practice Session Customizer
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Configure your testing workspace. Dynamic mode selects uncompleted questions matching your chosen specifications, simulating a NQT interface.
          </p>
        </div>

        {/* 1. Mode Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setMode('topic')}
            className={`p-4 rounded-xl border text-center flex flex-col items-center gap-2 transition-colors cursor-pointer ${
              mode === 'topic'
                ? 'bg-blue-55/40 border-blue-300 text-[#2563EB] font-bold'
                : 'bg-slate-50 border-[#E5E7EB] hover:border-slate-350 text-slate-500 hover:text-slate-700'
            }`}
          >
            <Brain size={18} />
            <span className="text-xs">Topics</span>
          </button>
          <button
            onClick={() => setMode('bookmarks')}
            className={`p-4 rounded-xl border text-center flex flex-col items-center gap-2 transition-colors cursor-pointer ${
              mode === 'bookmarks'
                ? 'bg-blue-55/40 border-blue-300 text-[#2563EB] font-bold'
                : 'bg-slate-50 border-[#E5E7EB] hover:border-slate-350 text-slate-500 hover:text-slate-700'
            }`}
          >
            <Bookmark size={18} />
            <span className="text-xs">Bookmarks</span>
          </button>
          <button
            onClick={() => setMode('wrong')}
            className={`p-4 rounded-xl border text-center flex flex-col items-center gap-2 transition-colors cursor-pointer ${
              mode === 'wrong'
                ? 'bg-blue-55/40 border-blue-300 text-[#2563EB] font-bold'
                : 'bg-slate-50 border-[#E5E7EB] hover:border-slate-350 text-slate-500 hover:text-slate-700'
            }`}
          >
            <AlertTriangle size={18} />
            <span className="text-xs">Wrong Qs</span>
          </button>
          <button
            onClick={() => setMode('recommend')}
            className={`p-4 rounded-xl border text-center flex flex-col items-center gap-2 transition-colors cursor-pointer ${
              mode === 'recommend'
                ? 'bg-blue-55/40 border-blue-300 text-[#2563EB] font-bold'
                : 'bg-slate-50 border-[#E5E7EB] hover:border-slate-350 text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles size={18} />
            <span className="text-xs">AI Recommend</span>
          </button>
        </div>

        {/* 2. Parameters Selectors based on mode */}
        <div className="space-y-6">
          {mode === 'topic' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-700">
              {/* Category Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                <select
                  value={selectedCatId || ''}
                  onChange={(e) => handleCatChange(Number(e.target.value))}
                  className="w-full bg-white border border-[#D1D5DB] rounded-lg p-3 text-[#111827] text-xs font-semibold focus:border-blue-500 outline-none"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Topic Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Topic</label>
                <select
                  value={selectedTopicId || ''}
                  onChange={(e) => handleTopicChange(Number(e.target.value))}
                  className="w-full bg-white border border-[#D1D5DB] rounded-lg p-3 text-[#111827] text-xs font-semibold focus:border-blue-500 outline-none"
                >
                  {activeCategory?.topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>) || <option>No Topics</option>}
                </select>
              </div>

              {/* Subtopic Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Sub-Topic</label>
                <select
                  value={selectedSubTopicId || ''}
                  onChange={(e) => setSelectedSubTopicId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-white border border-[#D1D5DB] rounded-lg p-3 text-[#111827] text-xs font-semibold focus:border-blue-500 outline-none"
                >
                  <option value="">All Sub-topics</option>
                  {activeTopic?.sub_topics.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Difficulty and size selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#E5E7EB]">
            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Difficulty</label>
              <div className="flex bg-slate-50 border border-[#E5E7EB] p-1 rounded-lg">
                {['all', 'easy', 'medium', 'hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d as any)}
                    className={`flex-1 text-[10px] uppercase font-bold py-2 rounded-md transition-colors cursor-pointer ${
                      difficulty === d 
                        ? 'bg-[#2563EB] text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Questions Size</label>
              <div className="flex bg-slate-50 border border-[#E5E7EB] p-1 rounded-lg">
                {[10, 15, 20, 30].map((c) => (
                  <button
                    key={c}
                    onClick={() => setQuestionCount(c)}
                    className={`flex-1 text-[11px] font-bold py-2 rounded-md transition-colors cursor-pointer ${
                      questionCount === c 
                        ? 'bg-[#2563EB] text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculator Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                <Calculator size={13} className="text-[#2563EB]" /> Tool Config
              </label>
              <div className="flex items-center justify-between bg-slate-50 border border-[#E5E7EB] p-3 rounded-lg">
                <span className="text-[11px] font-bold text-slate-500">On-screen Calculator</span>
                <button
                  onClick={() => setCalcEnabled(!calcEnabled)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${
                    calcEnabled ? 'bg-[#2563EB]' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                    calcEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}></div>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Start Button */}
        <div className="pt-6 border-t border-[#E5E7EB] flex justify-end">
          <button
            onClick={handleStartPractice}
            disabled={starting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white rounded-lg font-bold text-sm transition-colors shadow-sm cursor-pointer"
          >
            {starting ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                Building environment...
              </>
            ) : (
              <>
                <Play size={15} fill="white" />
                Initialize Practice Session
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AptitudePracticeSelection;

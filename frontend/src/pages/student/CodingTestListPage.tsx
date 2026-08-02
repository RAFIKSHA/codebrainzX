import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code, Timer, Play, AlertCircle, RefreshCw, Shield
} from 'lucide-react';
import api from '../../services/api';

interface CodingTest {
  id: number;
  title: string;
  description: string;
  test_type: 'mock' | 'company' | 'practice';
  overall_duration: number;
  section_timer: boolean;
  pass_percentage: number;
  calculator_enabled: boolean;
  questions_count: number;
}

const CodingTestListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tests, setTests] = useState<CodingTest[]>([]);
  const [activeTab, setActiveTab] = useState<'mock' | 'company' | 'practice'>('mock');

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/coding/tests/');
      setTests(response.data);
    } catch (err: any) {
      console.error('Error fetching coding tests:', err);
      setError('Failed to load coding assessments. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleStartTest = async (testId: number) => {
    try {
      const response = await api.post('/coding/attempts/start/', { test: testId });
      navigate(`/dashboard/coding/test/${testId}`, { state: { attemptData: response.data } });
    } catch (err: any) {
      console.error('Error starting test:', err);
      alert(err.response?.data?.error || 'Could not start the test. Please verify active sessions.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
        <p className="text-slate-400 text-sm font-semibold">Loading Coding Assessments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 max-w-md mx-auto text-center px-4">
        <AlertCircle className="text-red-500" size={48} />
        <h3 className="text-lg font-bold text-slate-200">Something went wrong</h3>
        <p className="text-slate-400 text-sm">{error}</p>
        <button 
          onClick={fetchTests}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredTests = tests.filter(t => t.test_type === activeTab);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-500/10 text-blue-500 text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wider uppercase">
              TCS NQT Prep
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Coding Assessment Lab
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Simulate actual company coding patterns with strict timers and proctoring environments.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4">
          <Shield className="text-blue-500" size={24} />
          <div>
            <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">Proctored Mode</h4>
            <p className="text-[10px] text-slate-400">Strict fullscreen and anti-cheat window checks enabled.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 mb-8">
        {(['mock', 'company', 'practice'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-1 text-sm font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === tab 
                ? 'border-blue-500 text-blue-500' 
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            {tab === 'mock' && 'Full Mock Tests'}
            {tab === 'company' && 'Company Specifics'}
            {tab === 'practice' && 'Topic Practice'}
          </button>
        ))}
      </div>

      {/* Grid List */}
      {filteredTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map(test => (
            <div 
              key={test.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <Timer size={14} />
                    {test.overall_duration} Mins
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-[10px] text-slate-400 font-mono">
                    {test.questions_count} Questions
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {test.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-6">
                  {test.description || 'No additional syllabus constraints provided.'}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex items-center justify-between">
                <div className="text-[10px] text-slate-400 font-mono">
                  Pass Mark: {test.pass_percentage}%
                </div>
                <button
                  onClick={() => handleStartTest(test.id)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow shadow-blue-500/10 cursor-pointer"
                >
                  <Play size={12} fill="white" />
                  Start Test
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
          <Code className="mx-auto text-slate-350 dark:text-slate-700 mb-3" size={32} />
          <h4 className="font-bold text-slate-700 dark:text-slate-400">No assessments scheduled</h4>
          <p className="text-xs text-slate-450 mt-1">There are currently no coding tests published in this section.</p>
        </div>
      )}
    </div>
  );
};

export default CodingTestListPage;

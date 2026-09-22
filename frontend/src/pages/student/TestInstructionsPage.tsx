import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Clock, HelpCircle, ShieldAlert, Award, FileText, CheckCircle } from 'lucide-react';
import testSeriesService from '../../services/testSeries';
import { setSEOMetadata } from '../../utils/seo';

const TestInstructionsPage: React.FC = () => {
  const { companySlug, seriesSlug, testId } = useParams<{ companySlug: string; seriesSlug: string; testId: string }>();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSEOMetadata({
      title: 'Test Instructions | CodexPetra Test Series',
      description: 'Review rules, guidelines and scoring criteria before starting your practice test series.',
      noindex: true,
    });
  }, []);

  const { data: companies } = useQuery({
    queryKey: ['testSeriesCompanies'],
    queryFn: testSeriesService.getCompanies,
  });
  const company = companies?.find((c) => c.slug === companySlug);

  const { data: seriesList } = useQuery({
    queryKey: ['testSeriesList', companySlug],
    queryFn: () => testSeriesService.getSeriesList({ company: companySlug }),
    enabled: !!companySlug,
  });
  const series = seriesList?.find((s) => s.slug === seriesSlug);

  const { data: test, isLoading } = useQuery({
    queryKey: ['testDetail', testId],
    queryFn: () => testSeriesService.getTestDetail(Number(testId)),
    enabled: !!testId,
  });

  const startTestMutation = useMutation({
    mutationFn: () => testSeriesService.startTest(Number(testId)),
    onSuccess: (data) => {
      navigate(`/test-series/test/${data.attempt.id}/engine`, { state: { attemptData: data } });
    },
    onError: (err) => {
      console.error(err);
      alert('Failed to start test session. Please try again.');
      setSubmitting(false);
    }
  });

  const handleStart = () => {
    setSubmitting(true);
    startTestMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse space-y-4">
        <div className="h-10 bg-slate-105 dark:bg-slate-850 rounded w-1/3 mx-auto" />
        <div className="h-32 bg-slate-105 dark:bg-slate-850 rounded" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Test not found</h2>
        <button onClick={() => navigate(`/test-series/${companySlug}/${seriesSlug}`)} className="px-4 py-2 bg-purple-600 text-white rounded-xl">
          Back to Series
        </button>
      </div>
    );
  }

  const isCoding = series?.category_type === 'coding';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-slate-800 dark:text-slate-200">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(`/test-series/${companySlug}/${seriesSlug}`)}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-purple-600 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Series Detail
      </button>

      {/* Header Info */}
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-850 pb-6">
        <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">
          {series?.name} — Test {String(test.test_number).padStart(2, '0')}
        </h1>
        <h2 className="text-lg font-bold text-purple-650 dark:text-purple-400">
          {test.name}
        </h2>
        <p className="text-xs text-slate-400">
          {test.description || 'Simulated recruitment rounds with real compilers and test case validations.'}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <HelpCircle size={18} className="text-purple-600 mb-1" />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Questions</span>
          <span className="text-base font-extrabold text-slate-950 dark:text-white mt-0.5">{test.questions_count}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <Clock size={18} className="text-purple-600 mb-1" />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Duration</span>
          <span className="text-base font-extrabold text-slate-950 dark:text-white mt-0.5">{test.duration_minutes} Mins</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <Award size={18} className="text-purple-600 mb-1" />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Marks</span>
          <span className="text-base font-extrabold text-slate-950 dark:text-white mt-0.5">{test.marks} Marks</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <ShieldAlert size={18} className="text-purple-600 mb-1" />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Neg. Marking</span>
          <span className="text-base font-extrabold text-slate-950 dark:text-white mt-0.5">{test.negative_marking ? 'Yes' : 'No'}</span>
        </div>
      </div>

      {/* Sections Available */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-955 dark:text-white uppercase tracking-wider">Test Composition</h3>
        <div className="flex gap-2 flex-wrap">
          {isCoding ? (
            <>
              <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-xl text-xs font-semibold">Coding / Programming</span>
              <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-xl text-xs font-semibold">Data Structures & Algorithms</span>
            </>
          ) : (
            <>
              <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-xl text-xs font-semibold">Quantitative Aptitude</span>
              <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-xl text-xs font-semibold">Logical Reasoning</span>
              <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-xl text-xs font-semibold">Verbal Ability</span>
            </>
          )}
        </div>
      </div>

      {/* General Instructions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 md:p-8 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
          <FileText size={18} className="text-purple-600" />
          <h3 className="text-base font-extrabold text-slate-950 dark:text-white">General Instructions</h3>
        </div>

        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-4 leading-relaxed">
          {test.instructions ? (
            <div className="whitespace-pre-wrap">{test.instructions}</div>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              <li>This test contains <span className="font-bold text-slate-850 dark:text-white">{test.questions_count} questions</span> to be solved in <span className="font-bold text-slate-850 dark:text-white">{test.duration_minutes} minutes</span>.</li>
              <li>Please ensure you have a stable internet connection. Do not close or refresh the test tab during the active session.</li>
              <li>{isCoding ? 'Coding tests are evaluated against hidden test cases. You can run and test code batch multiple times before submitting.' : 'Verify options carefully. You can change choices anytime before submitting.'}</li>
              <li>This test features anti-cheat tracking. Navigating away from the fullscreen compiler window or switching tabs will record a warning. Reaching <span className="font-bold text-red-650">3 warnings</span> will result in automatic submission.</li>
              <li>{test.negative_marking ? 'Warning: Negative marking is ENABLED. Wrong answers will result in mark deductions.' : 'Negative marking is DISABLED. No marks will be deducted for wrong answers.'}</li>
              <li>Click the primary CTA below to initialize your test window. Good luck!</li>
            </ul>
          )}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          onClick={handleStart}
          disabled={submitting}
          className="flex-grow py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'Initializing Session...' : test.attempt_status === 'in_progress' ? 'Resume Test →' : 'Start Test →'}
        </button>

        <button
          onClick={() => {
            alert('Test marked for later practice!');
            navigate(`/test-series/${companySlug}/${seriesSlug}`);
          }}
          className="py-3 px-6 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-750 dark:text-slate-200 border border-slate-200 dark:border-slate-750 rounded-xl text-sm font-bold transition-all cursor-pointer"
        >
          Mark for Later
        </button>
      </div>

    </div>
  );
};

export default TestInstructionsPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, Award, BookOpen, Calendar, HelpCircle, ArrowRight, Play, CheckCircle2, Trophy, AlertCircle } from 'lucide-react';
import testSeriesService from '../../services/testSeries';
import { setSEOMetadata } from '../../utils/seo';

const SeriesDetailPage: React.FC = () => {
  const { companySlug, seriesSlug } = useParams<{ companySlug: string; seriesSlug: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'syllabus' | 'leaderboard'>('overview');

  const { data: companies } = useQuery({
    queryKey: ['testSeriesCompanies'],
    queryFn: testSeriesService.getCompanies,
  });
  const company = companies?.find((c) => c.slug === companySlug);

  const { data: seriesList, isLoading: isSeriesLoading } = useQuery({
    queryKey: ['testSeriesList', companySlug],
    queryFn: () => testSeriesService.getSeriesList({ company: companySlug }),
    enabled: !!companySlug,
  });
  const series = seriesList?.find((s) => s.slug === seriesSlug);

  useEffect(() => {
    if (series) {
      setSEOMetadata({
        title: `${series.name} - Placement Prep | CodexPetra`,
        description: `Unlock access to ${series.name} test series. Solve company coding and aptitude question banks.`,
      });
    }
  }, [series]);

  const { data: tests, isLoading: isTestsLoading } = useQuery({
    queryKey: ['testSeriesTests', series?.id],
    queryFn: () => testSeriesService.getTests({ series: series?.id }),
    enabled: !!series?.id,
  });

  const isLoading = isSeriesLoading || isTestsLoading;

  if (!series && !isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Test Series not found</h2>
        <button onClick={() => navigate(`/test-series/${companySlug}`)} className="px-4 py-2 bg-purple-600 text-white rounded-xl">
          Back to Company
        </button>
      </div>
    );
  }

  // Derive topics covered dynamically
  const topicsCovered = Array.from(new Set(
    tests?.map(t => t.description.split(',').map(s => s.trim())).flat().filter(Boolean) || []
  )).slice(0, 10);

  const defaultTopics = ['Arrays', 'Strings', 'Searching', 'Sorting', 'Hashing', 'Stacks', 'Queues'];
  const finalTopics = topicsCovered.length > 0 ? topicsCovered : defaultTopics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn text-slate-800 dark:text-slate-200">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(`/test-series/${companySlug}`)}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-purple-600 transition-colors"
      >
        <ArrowLeft size={14} /> Back to {company?.name || 'Company'} Test Series
      </button>

      {/* Series Meta Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850/80 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start gap-8 shadow-sm">
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
              series?.difficulty === 'advanced' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400' :
              series?.difficulty === 'intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400' :
              'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400'
            }`}>
              {series?.difficulty}
            </span>
            <span className="text-[10px] bg-slate-50 border border-slate-150 rounded px-1.5 py-0.5 uppercase tracking-wide font-extrabold text-slate-500 dark:bg-slate-850 dark:border-slate-800">
              {series?.category_type} Series
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white leading-tight">
            {series?.name}
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {series?.description || 'Build your fundamentals and placement confidence with structured practice questions designed to simulate actual rounds.'}
          </p>

          <div className="flex flex-wrap gap-6 text-xs text-slate-500 dark:text-slate-400 pt-2">
            <div className="flex items-center gap-1.5">
              <BookOpen size={15} className="text-purple-600" />
              <span>{series?.tests_count} Tests</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HelpCircle size={15} className="text-purple-600" />
              <span>{series?.questions_count} Questions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={15} className="text-purple-600" />
              <span>~{Math.round((series?.total_duration_minutes || 0) / 60)} Hours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={15} className="text-purple-600" />
              <span>Validity: {series?.validity_days} Days</span>
            </div>
          </div>
        </div>

        {/* Dynamic Image or Thumbnail */}
        <div className="w-full lg:w-72 shrink-0">
          {series?.thumbnail_url ? (
            <img
              src={series.thumbnail_url}
              alt={series.name}
              className="w-full h-40 object-cover rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm"
            />
          ) : (
            <div className="w-full h-40 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-slate-200 dark:border-slate-850 flex flex-col items-center justify-center gap-2 text-purple-600 dark:text-purple-400 shadow-inner">
              <Trophy size={42} className="opacity-80" />
              <span className="text-xs font-bold uppercase tracking-wider">Placement Suite</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-850 pb-px text-sm font-semibold">
        {(['overview', 'tests', 'syllabus', 'leaderboard'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 border-b-2 capitalize transition-colors cursor-pointer ${
              activeTab === tab
                ? 'border-purple-600 text-purple-600 dark:border-purple-500 dark:text-purple-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Active View Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'overview' && (
            <div className="space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 md:p-8">
              
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">About this Series</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  This test series contains curated coding challenges and aptitude sets compiled from past recruitment trends. Our detailed evaluations, test suites, and proctored interface will guide you through getting recruitment ready.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">What's Included</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="border border-slate-100 dark:border-slate-850 p-4 rounded-xl space-y-1">
                    <div className="text-slate-400">Total Practice Papers</div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-base">{series?.tests_count} Tests</div>
                  </div>
                  <div className="border border-slate-100 dark:border-slate-850 p-4 rounded-xl space-y-1">
                    <div className="text-slate-400">Preparation Questions</div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-base">{series?.questions_count} Questions</div>
                  </div>
                  <div className="border border-slate-100 dark:border-slate-850 p-4 rounded-xl space-y-1">
                    <div className="text-slate-400">Practice Duration</div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-base">~{Math.round((series?.total_duration_minutes || 0) / 60)} Hours</div>
                  </div>
                  <div className="border border-slate-100 dark:border-slate-850 p-4 rounded-xl space-y-1">
                    <div className="text-slate-400">Course Validity</div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-base">{series?.validity_days} Days access</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">Topics Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {finalTopics.map((topic, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-800 rounded-xl text-xs font-semibold">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-4">
              {isLoading ? (
                [1, 2].map(i => (
                  <div key={i} className="h-20 border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900/60 rounded-xl animate-pulse" />
                ))
              ) : tests && tests.length > 0 ? (
                tests.map((test) => (
                  <div
                    key={test.id}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-purple-300 transition-colors"
                  >
                    {/* Left: Test Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center font-extrabold text-purple-650 shrink-0 text-sm">
                        {String(test.test_number).padStart(2, '0')}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-950 dark:text-white">
                          {test.name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{test.questions_count} Questions</span>
                          <span>·</span>
                          <span>{test.duration_minutes} Minutes</span>
                          <span>·</span>
                          <span className="capitalize">{test.difficulty}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions / Score */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-100 dark:border-slate-850 pt-3 sm:pt-0">
                      <div className="text-xs">
                        {test.attempts_count > 0 ? (
                          <div className="space-y-0.5">
                            <div className="text-slate-400 flex items-center gap-1.5 font-semibold">
                              <CheckCircle2 size={13} className="text-emerald-500" /> Completed
                            </div>
                            <div className="text-slate-500 font-semibold">Best: <span className="text-slate-850 dark:text-white">{test.best_score}%</span></div>
                          </div>
                        ) : test.attempt_status === 'in_progress' ? (
                          <div className="text-amber-500 flex items-center gap-1.5 font-semibold">
                            <AlertCircle size={13} /> In Progress
                          </div>
                        ) : (
                          <div className="text-slate-400 italic">Unattempted</div>
                        )}
                      </div>

                      <button
                        onClick={() => navigate(`/test-series/${companySlug}/${seriesSlug}/test/${test.id}`)}
                        className="px-4 py-2 bg-slate-50 hover:bg-purple-600 hover:text-white dark:bg-slate-850 dark:hover:bg-purple-600 text-slate-750 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-750 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {test.attempt_status === 'in_progress' ? 'Resume Test' : 'Start Test'} <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl">
                  <p className="text-xs text-slate-400">No tests added to this series yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'syllabus' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Curriculum & Topics Structure</h3>
              <div className="space-y-4">
                {finalTopics.map((topic, i) => (
                  <div key={i} className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-3 last:border-b-0 last:pb-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
                    <div className="text-xs font-bold text-slate-850 dark:text-slate-200">{topic}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 md:p-8 text-center py-16 space-y-3">
              <Award size={36} className="mx-auto text-purple-600/80 mb-2" />
              <h4 className="font-bold text-sm text-slate-850 dark:text-slate-300">Leaderboard coming soon</h4>
              <p className="text-xs text-slate-400">Complete tests to compare results against top solvers globally.</p>
            </div>
          )}

        </div>

        {/* Right Side: Quick Action Sidebar (Sticky Tests List or Stats Overview) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-950 dark:text-white">Tests in this Series</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {isLoading ? (
                [1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-50 dark:bg-slate-850 animate-pulse rounded-lg" />)
              ) : tests && tests.length > 0 ? (
                tests.map((test) => (
                  <div
                    key={test.id}
                    onClick={() => navigate(`/test-series/${companySlug}/${seriesSlug}/test/${test.id}`)}
                    className="flex justify-between items-center p-2.5 hover:bg-slate-50 dark:hover:bg-slate-850/60 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{test.name}</div>
                      <div className="text-[10px] text-slate-400">{test.questions_count} Questions · {test.duration_minutes} Mins</div>
                    </div>
                    <ArrowRight size={12} className="text-slate-350 group-hover:text-purple-600" />
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-center py-6 text-xs italic">No tests.</div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default SeriesDetailPage;

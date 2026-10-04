import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Code, Brain, ArrowLeft, Trophy, Clock, ArrowRight, Layers } from 'lucide-react';
import testSeriesService from '../../services/testSeries';
import { setSEOMetadata, getBreadcrumbSchema } from '../../utils/seo';

const CompanySelection: React.FC = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'coding' | 'aptitude'>('overview');

  const { data: companies } = useQuery({
    queryKey: ['testSeriesCompanies'],
    queryFn: testSeriesService.getCompanies,
  });

  const company = companies?.find((c) => c.slug === companySlug);

  useEffect(() => {
    if (company) {
      setSEOMetadata({
        title: `${company.name} Interview Preparation & Placement Tests | CodexPetra`,
        description: `Practice curated coding and aptitude test series designed for ${company.name} placement preparation. Real exam simulation and performance analytics on CodexPetra.`,
        canonicalUrl: `https://www.codexpetra.com/placement-tests/${companySlug}`,
        structuredData: getBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Placement Tests', url: '/placement-tests' },
          { name: `${company.name} Preparation`, url: `/placement-tests/${companySlug}` },
        ]),
      });
    } else {
      setSEOMetadata({
        title: 'Company Interview Preparation & Placement Tracks | CodexPetra',
        description: 'Target company-wise interview preparation, problem archives, and placement hiring patterns on CodexPetra.',
        canonicalUrl: 'https://www.codexpetra.com/interview-preparation',
        structuredData: getBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Interview Preparation', url: '/interview-preparation' },
        ]),
      });
    }
  }, [company, companySlug]);

  const { data: seriesList, isLoading } = useQuery({
    queryKey: ['testSeriesList', companySlug],
    queryFn: () => testSeriesService.getSeriesList({ company: companySlug }),
    enabled: !!companySlug,
  });

  const codingSeries = seriesList?.filter((s) => s.category_type === 'coding') || [];
  const aptitudeSeries = seriesList?.filter((s) => s.category_type === 'aptitude') || [];

  const getTestsCount = (list: typeof codingSeries) => {
    return list.reduce((acc, curr) => acc + (curr.tests_count || 0), 0);
  };

  const codingTestsCount = getTestsCount(codingSeries);
  const aptitudeTestsCount = getTestsCount(aptitudeSeries);

  const displayedSeries = 
    activeTab === 'coding' ? codingSeries :
    activeTab === 'aptitude' ? aptitudeSeries :
    seriesList || [];

  if (!company && !isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Company not found</h2>
        <button onClick={() => navigate('/test-series')} className="px-4 py-2 bg-purple-600 text-white rounded-xl">
          Back to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn text-slate-800 dark:text-slate-200">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/test-series')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-purple-600 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Test Series
      </button>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 dark:border-slate-850 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt={`${company.name} Logo`}
                className="w-14 h-14 object-contain rounded-2xl border border-slate-200 dark:border-slate-800 bg-white p-2 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center font-bold text-purple-650">
                {company?.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {company?.name} Test Series
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Practice curated coding and aptitude tests designed for {company?.name} preparation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Large Selector Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => setActiveTab('coding')}
          className={`cursor-pointer border rounded-2xl p-6 transition-all shadow-sm ${
            activeTab === 'coding'
              ? 'border-purple-600 bg-purple-50/20 dark:bg-purple-950/10'
              : 'border-slate-200 hover:border-purple-300 bg-white dark:bg-slate-900/60'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Coding Series</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">DSA, Algorithms, Problem Solving</p>
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2">
                {codingSeries.length} Series · {codingTestsCount} Tests
              </p>
            </div>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 rounded-xl">
              <Code size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('aptitude')}
          className={`cursor-pointer border rounded-2xl p-6 transition-all shadow-sm ${
            activeTab === 'aptitude'
              ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/10'
              : 'border-slate-200 hover:border-amber-300 bg-white dark:bg-slate-900/60'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aptitude Series</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quantitative, Logical, Verbal</p>
              <p className="text-xs font-semibold text-amber-500 dark:text-amber-400 mt-2">
                {aptitudeSeries.length} Series · {aptitudeTestsCount} Tests
              </p>
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 rounded-xl">
              <Brain size={20} className="text-amber-500 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-850 pb-px text-sm font-semibold">
        {(['overview', 'coding', 'aptitude'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 border-b-2 capitalize transition-colors cursor-pointer ${
              activeTab === tab
                ? 'border-purple-600 text-purple-600 dark:border-purple-500 dark:text-purple-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-305'
            }`}
          >
            {tab === 'overview' ? 'Overview' : tab === 'coding' ? 'Coding Series' : 'Aptitude Series'}
          </button>
        ))}
      </div>

      {/* Series Cards List */}
      <div className="space-y-6">
        {isLoading ? (
          [1, 2].map((i) => (
            <div key={i} className="h-32 border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900/60 animate-pulse rounded-2xl" />
          ))
        ) : displayedSeries.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {displayedSeries.map((series) => (
              <Link
                key={series.id}
                to={`/test-series/${companySlug}/${series.slug}`}
                className="group relative block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-850/80 bg-white dark:bg-slate-900/60 p-6 transition-all hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Side Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {series.name}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                      series.difficulty === 'advanced' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400' :
                      series.difficulty === 'intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400'
                    }`}>
                      {series.difficulty}
                    </span>
                    <span className="text-[10px] bg-slate-50 border border-slate-150 rounded px-1.5 py-0.5 uppercase tracking-wide font-extrabold text-slate-500 dark:bg-slate-850 dark:border-slate-800">
                      {series.category_type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                    {series.description || `Build your placement skills with targeted ${company?.name} preparation.`}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-450 pt-1">
                    <span className="font-semibold">{series.tests_count} Tests</span>
                    <span>·</span>
                    <span className="font-semibold">{series.questions_count} Questions</span>
                    <span>·</span>
                    <span className="font-semibold">~{Math.round(series.total_duration_minutes / 60)} Hours</span>
                  </div>
                </div>

                {/* Right Side Stats & CTA */}
                <div className="border-t md:border-t-0 border-slate-100 dark:border-slate-850 pt-4 md:pt-0 flex items-center justify-between md:justify-end gap-6">
                  <div className="text-left md:text-right text-xs">
                    {series.attempts_count > 0 ? (
                      <>
                        <div className="text-slate-500">Attempts: <span className="font-extrabold text-slate-800 dark:text-white">{series.attempts_count}</span></div>
                        <div className="text-slate-500 mt-0.5">Best Score: <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{series.best_score}%</span></div>
                      </>
                    ) : (
                      <div className="text-slate-400 italic">Not attempted yet</div>
                    )}
                  </div>

                  <div className="px-4 py-2 bg-slate-50 group-hover:bg-purple-600 group-hover:text-white dark:bg-slate-850 dark:group-hover:bg-purple-600 text-slate-750 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-750 transition-all flex items-center gap-1 shrink-0">
                    <span>View Series</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl">
            <Trophy size={36} className="mx-auto text-slate-350 dark:text-slate-750 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-350">No Test Series Available</h3>
            <p className="text-xs text-slate-400 mt-1">There are no test series published in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanySelection;

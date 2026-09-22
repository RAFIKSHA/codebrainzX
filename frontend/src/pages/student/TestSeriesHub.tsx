import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Code, Brain, ArrowRight, Globe, Layers, Trophy, CheckCircle2, Target, BarChart2, ShieldCheck } from 'lucide-react';
import testSeriesService from '../../services/testSeries';
import { setSEOMetadata, getBreadcrumbSchema } from '../../utils/seo';

const TestSeriesHub: React.FC = () => {
  useEffect(() => {
    setSEOMetadata({
      title: 'Test Series | Placement & Competitive Exam Preparation | CodexPetra',
      description: 'Practice company-specific mock test series for TCS, Infosys, Wipro, Amazon, and top tech companies with timed simulations and in-depth performance analytics.',
      canonicalUrl: 'https://codexpetra.com/test-series',
      structuredData: getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Test Series', url: '/test-series' },
      ]),
    });
  }, []);

  const { data: categories, isLoading: isCatsLoading } = useQuery({
    queryKey: ['testSeriesCategories'],
    queryFn: testSeriesService.getCategories,
  });

  const { data: companies, isLoading: isCompsLoading } = useQuery({
    queryKey: ['testSeriesCompanies'],
    queryFn: testSeriesService.getCompanies,
  });

  const isLoading = isCatsLoading || isCompsLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fadeIn text-slate-800 dark:text-slate-200">
      
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/50 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
          <Layers size={13} /> Placement Preparation Portal
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Company Test Series
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          Prepare smarter with structured coding and aptitude test series built around real company recruitment patterns and online assessments.
        </p>
      </div>

      {/* Category Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          [1, 2].map((i) => (
            <div key={i} className="h-44 rounded-2xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900/60 p-8 animate-pulse" />
          ))
        ) : (
          categories
            ?.filter((cat) => cat.is_active)
            .map((cat) => (
              <Link
                key={cat.id}
                to={`/test-series?type=${cat.type}`}
                className="group relative block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-850/80 bg-white dark:bg-slate-900/60 p-8 transition-all hover:scale-[1.01] hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                    {cat.type === 'coding' ? (
                      <Code size={28} className="text-purple-600 dark:text-purple-400" />
                    ) : (
                      <Brain size={28} className="text-amber-500 dark:text-amber-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {cat.description || (cat.type === 'coding' ? 'DSA, Algorithms & Programming Tests' : 'Quantitative, Logical & Verbal Reasoning Tests')}
                    </p>
                  </div>
                </div>
              </Link>
            ))
        )}
      </div>

      {/* Browse by Companies */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-850 pb-4">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Browse by Companies
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access practice material customized specifically for recruitment patterns of top tech firms.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded-2xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900/60 animate-pulse" />
            ))}
          </div>
        ) : companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Link
                key={company.id}
                to={`/test-series/${company.slug}`}
                className="group relative block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-850/80 bg-white dark:bg-slate-900/60 p-6 transition-all hover:scale-[1.02] hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-md flex flex-col justify-between min-h-[170px]"
              >
                {/* Top Section */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-450 line-clamp-2 leading-relaxed mt-1">
                      {company.description || `Crack ${company.name} recruitment rounds with high quality papers.`}
                    </p>
                  </div>

                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={`${company.name} Logo`}
                      className="w-12 h-12 object-contain rounded-xl border border-slate-100 dark:border-slate-800 bg-white p-1.5 shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-850 flex items-center justify-center font-bold text-slate-450 shrink-0">
                      {company.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Info row */}
                <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex gap-4">
                    <div>
                      <span className="font-extrabold text-slate-800 dark:text-white mr-1">
                        {company.coding_series_count}
                      </span>
                      Coding
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-800 dark:text-white mr-1">
                        {company.aptitude_series_count}
                      </span>
                      Aptitude
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-800 dark:text-white mr-1">
                        {company.total_tests_count}
                      </span>
                      Tests
                    </div>
                  </div>

                  <div className="p-1 rounded-full bg-slate-50 dark:bg-slate-850 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                    <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl">
            <Trophy size={40} className="mx-auto text-slate-350 dark:text-slate-700 mb-3" />
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-300">No Companies Configured</h3>
            <p className="text-xs text-slate-400 mt-1">Please check back soon as new placement series are added regularly.</p>
          </div>
        )}
      </div>

      {/* Public Informational & Benefits Section for SEO and Users */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-850">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Why Prepare with CodexPetra Test Series?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Built for engineering students and job-seekers preparing for on-campus and off-campus tech drives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-850 bg-white dark:bg-slate-900/40 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Target size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Company-Specific Patterns</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Curated tests matching exact question formats, time constraints, and sectional cut-offs of top tech recruiters.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-850 bg-white dark:bg-slate-900/40 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BarChart2 size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Real-Time Performance Analytics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Detailed scorecards with topic-wise accuracy, speed metrics, and rank comparisons against all candidates.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-850 bg-white dark:bg-slate-900/40 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Code Evaluation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Multi-language compiled test cases with hidden edge cases to ensure code quality meets industry benchmarks.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TestSeriesHub;

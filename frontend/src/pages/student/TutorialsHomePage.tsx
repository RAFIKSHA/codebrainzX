import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tutorialsService } from '../../services/tutorials';
import type { TutorialLanguage } from '../../services/tutorials';
import { setSEOMetadata, getBreadcrumbSchema } from '../../utils/seo';
import { Search, ArrowRight, Lock, BookOpen } from 'lucide-react';
import {
  PythonLogo,
  JavaLogo,
  CppLogo,
  JavaScriptLogo,
  CLogo,
  CSharpLogo,
  PhpLogo,
  SqlLogo,
  HtmlCssLogo,
  GoLogo,
  KotlinLogo,
  TypeScriptLogo,
  DartLogo,
  SwiftLogo,
  RLogo,
} from '../../components/tutorials/LanguageLogos';

interface LanguageTrackItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  isAvailable: boolean;
  logo: React.ReactNode;
}

const PROGRAMMING_LANGUAGES: LanguageTrackItem[] = [
  {
    id: 'python',
    name: 'Python',
    slug: 'python',
    description: 'Beginner friendly, versatile and powerful language.',
    isAvailable: true,
    logo: <PythonLogo size={48} />,
  },
  {
    id: 'java',
    name: 'Java',
    slug: 'java',
    description: 'Write once, run anywhere. Build robust applications.',
    isAvailable: true,
    logo: <JavaLogo size={48} />,
  },
  {
    id: 'cpp',
    name: 'C++',
    slug: 'cpp',
    description: 'High performance language for system programming.',
    isAvailable: true,
    logo: <CppLogo size={48} />,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    slug: 'javascript',
    description: 'The language of the web. Build interactive websites.',
    isAvailable: true,
    logo: <JavaScriptLogo size={48} />,
  },
  {
    id: 'c',
    name: 'C',
    slug: 'c',
    description: 'Foundation of programming. Simple and efficient.',
    isAvailable: false,
    logo: <CLogo size={48} />,
  },
  {
    id: 'csharp',
    name: 'C#',
    slug: 'csharp',
    description: 'Modern, object-oriented language by Microsoft.',
    isAvailable: false,
    logo: <CSharpLogo size={48} />,
  },
  {
    id: 'php',
    name: 'PHP',
    slug: 'php',
    description: 'Server-side scripting for web development.',
    isAvailable: false,
    logo: <PhpLogo size={48} />,
  },
  {
    id: 'sql',
    name: 'SQL',
    slug: 'sql',
    description: 'Manage and query databases with ease.',
    isAvailable: false,
    logo: <SqlLogo size={48} />,
  },
  {
    id: 'html-css',
    name: 'HTML & CSS',
    slug: 'html-css',
    description: 'Build the structure and style of web pages.',
    isAvailable: false,
    logo: <HtmlCssLogo size={48} />,
  },
  {
    id: 'go',
    name: 'Go (Golang)',
    slug: 'go',
    description: 'Fast, reliable and efficient systems programming.',
    isAvailable: false,
    logo: <GoLogo size={48} />,
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    slug: 'kotlin',
    description: 'Modern language for Android development.',
    isAvailable: false,
    logo: <KotlinLogo size={48} />,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    slug: 'typescript',
    description: 'JavaScript with type safety and better tooling.',
    isAvailable: false,
    logo: <TypeScriptLogo size={48} />,
  },
  {
    id: 'dart',
    name: 'Dart',
    slug: 'dart',
    description: 'Optimized for building modern apps.',
    isAvailable: false,
    logo: <DartLogo size={48} />,
  },
  {
    id: 'swift',
    name: 'Swift',
    slug: 'swift',
    description: 'Powerful language for iOS and macOS apps.',
    isAvailable: false,
    logo: <SwiftLogo size={48} />,
  },
  {
    id: 'r',
    name: 'R',
    slug: 'r',
    description: 'Language for data science and analytics.',
    isAvailable: false,
    logo: <RLogo size={48} />,
  },
];

const TutorialsHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch backend language details in background to sync any dynamic attributes if available
  const { data: _backendLanguages } = useQuery<TutorialLanguage[]>({
    queryKey: ['tutorial-languages'],
    queryFn: () => tutorialsService.getLanguages(),
  });

  useEffect(() => {
    setSEOMetadata({
      title: 'Programming Tutorials & Documentation | CodexPetra',
      description:
        'Explore comprehensive programming tutorials in Python, Java, C++, JavaScript and more. Well-structured tutorials, hands-on coding practice, and interactive compilers.',
      canonicalUrl: 'https://codexpetra.com/tutorials',
      structuredData: getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Programming Tutorials', url: '/tutorials' },
      ]),
    });
  }, []);

  const filteredLanguages = PROGRAMMING_LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-white dark:bg-[#07080e] overflow-hidden transition-colors duration-200">
      {/* Subtle Ambient Background Gradient & Decorative Dots */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-purple-50/60 via-indigo-50/20 to-transparent dark:from-purple-950/15 dark:via-transparent dark:to-transparent pointer-events-none" />

      {/* Decorative Dot Matrix on Left */}
      <div className="absolute left-4 sm:left-8 lg:left-16 top-16 hidden md:grid grid-cols-4 gap-2.5 opacity-25 dark:opacity-10 pointer-events-none select-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={`dot-l-${i}`} className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        ))}
      </div>

      {/* Decorative Dot Matrix on Right */}
      <div className="absolute right-4 sm:right-8 lg:right-16 top-16 hidden md:grid grid-cols-4 gap-2.5 opacity-25 dark:opacity-10 pointer-events-none select-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={`dot-r-${i}`} className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-20 space-y-12">
        {/* ========================================================================= */}
        {/* CENTERED HERO SECTION                                                     */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-4 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
            Learn Programming <br />
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 bg-clip-text text-transparent">
              The Right Way
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-normal">
            Well-structured tutorials, hands-on coding practice,
            <br className="hidden sm:inline" />
            and real-world projects to make you a better developer.
          </p>

          {/* Centered Search Bar */}
          <div className="max-w-xl mx-auto pt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Python, Java, C++, JavaScript..."
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#0c0e17] border border-slate-200/90 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION HEADER: EXPLORE PROGRAMMING LANGUAGES                             */}
        {/* ========================================================================= */}
        <div className="text-center pt-4 space-y-1 animate-fade-in">
          <div className="inline-flex items-center justify-center gap-2.5">
            <span className="w-8 h-[1.5px] bg-purple-300 dark:bg-purple-800 rounded-full" />
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white px-1 tracking-tight">
              Explore Programming Languages
            </h2>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span className="w-8 h-[1.5px] bg-purple-300 dark:bg-purple-800 rounded-full" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Choose a language to start your learning journey
          </p>
        </div>

        {/* ========================================================================= */}
        {/* RESPONSIVE 5-COLUMN CARD GRID                                             */}
        {/* ========================================================================= */}
        {filteredLanguages.length === 0 ? (
          <div className="max-w-md mx-auto py-16 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 animate-fade-in">
            <BookOpen className="mx-auto text-slate-350 dark:text-slate-600" size={40} />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
              No matching languages found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              We couldn't find any language matching "{searchQuery}". Try searching for Python, Java,
              C++, or JavaScript.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6 animate-fade-in">
            {filteredLanguages.map((lang) => (
              <div
                key={lang.id}
                className="bg-white dark:bg-[#0c0e17] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-purple-200 dark:hover:border-purple-900/50 transition-all duration-200 flex flex-col justify-between items-center text-center group relative overflow-hidden"
              >
                {/* Top Logo Container */}
                <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 mb-3 group-hover:scale-105 transition-transform duration-200">
                  {lang.logo}
                </div>

                {/* Language Title & Short Description */}
                <div className="w-full space-y-1.5 flex-1 flex flex-col items-center">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {lang.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[36px] flex items-center justify-center line-clamp-2 px-1">
                    {lang.description}
                  </p>
                </div>

                {/* Action Button */}
                <div className="w-full mt-5">
                  {lang.isAvailable ? (
                    <Link
                      to={`/tutorials/${lang.slug}`}
                      className="w-full py-2.5 px-3 rounded-xl border border-purple-400/50 dark:border-purple-600/50 text-purple-600 dark:text-purple-400 text-xs font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm group-hover:bg-purple-50 dark:group-hover:bg-purple-950/30 cursor-pointer"
                    >
                      <span>Start Learning</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      aria-disabled="true"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs font-medium flex items-center justify-center gap-1.5 cursor-not-allowed select-none opacity-85"
                    >
                      <Lock size={12} className="opacity-70" />
                      <span>Locked</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialsHomePage;

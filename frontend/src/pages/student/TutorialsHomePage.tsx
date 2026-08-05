import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tutorialsService } from '../../services/tutorials';
import type { TutorialLanguage } from '../../services/tutorials';
import { setSEOMetadata } from '../../utils/seo';
import { 
  BookOpen, Search, Clock, ArrowRight, Bookmark, 
  History, Sparkles, Code
} from 'lucide-react';

const TutorialsHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  // Fetch languages
  const { data: languages, isLoading } = useQuery<TutorialLanguage[]>({
    queryKey: ['tutorial-languages'],
    queryFn: () => tutorialsService.getLanguages(),
  });

  useEffect(() => {
    setSEOMetadata({
      title: 'Free Programming Tutorials | Learn Coding Step-by-Step',
      description: 'Learn Python, JavaScript, C++, HTML, CSS, SQL, Git, and Algorithms completely free. Self-paced tutorials with interactive code editors, quizzes, and practice exercises.',
      canonicalUrl: window.location.href,
    });

    // Load history and bookmarks from localStorage
    try {
      const savedHistory = localStorage.getItem('tutorials_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory).slice(0, 4));

      const savedBookmarks = localStorage.getItem('tutorials_bookmarks');
      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks).slice(0, 4));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const filteredLanguages = languages?.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 dark:from-[#0b0d19] dark:via-[#111325] dark:to-[#090b14] border border-slate-200 dark:border-slate-850 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={13} className="animate-pulse" />
            100% Free Learning Library
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Learn Programming <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Without Boundaries
            </span>
          </h1>
          
          <p className="text-slate-350 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Choose from our comprehensive, interactive tutorial tracks. Practice directly in your browser with our built-in compiler, complete test quizzes, and output predictors. No registration required.
          </p>

          {/* Search bar */}
          <div className="max-w-md mx-auto relative mt-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search Python, Java, JavaScript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Continue Reading & Bookmarks Section */}
      {(history.length > 0 || bookmarks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* History */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <History size={18} className="text-blue-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Continue Learning</h3>
              </div>
              <div className="space-y-3">
                {history.map((item, idx) => (
                  <Link
                    key={idx}
                    to={`/tutorials/${item.langSlug}/${item.lessonSlug}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all group"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">{item.langName}</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-500 transition-colors">{item.lessonTitle}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30 group-hover:text-blue-500 transition-all">
                      <ArrowRight size={14} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bookmarks */}
          {bookmarks.length > 0 && (
            <div className="bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Bookmark size={18} className="text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Saved Bookmarks</h3>
              </div>
              <div className="space-y-3">
                {bookmarks.map((item, idx) => (
                  <Link
                    key={idx}
                    to={`/tutorials/${item.langSlug}/${item.lessonSlug}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all group"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">{item.langName}</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-500 transition-colors">{item.lessonTitle}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 group-hover:text-indigo-500 transition-all">
                      <ArrowRight size={14} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Grid Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-6 bg-blue-600 rounded-full"></div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Programming Tutorials</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-450">
          Pick a language card to start your learning path.
        </p>
      </div>

      {/* Cards list */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-850 rounded-2xl p-6 h-52 flex flex-col justify-between animate-pulse">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
                <div className="w-16 h-5 rounded-full bg-slate-200 dark:bg-slate-800"></div>
              </div>
              <div className="space-y-2">
                <div className="w-1/3 h-5 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="w-5/6 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="w-24 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredLanguages.length === 0 ? (
        <div className="bg-white dark:bg-[#0c0e17] border border-slate-205 dark:border-slate-850 rounded-3xl p-12 text-center">
          <BookOpen className="mx-auto text-slate-350 dark:text-slate-600 mb-4" size={48} />
          <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-lg mb-1">No Tutorials Found</h3>
          <p className="text-slate-500 dark:text-slate-450 text-sm max-w-md mx-auto">
            We couldn't find any language matching "{searchQuery}". Please try another search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLanguages.map((lang) => (
            <div
              key={lang.id}
              onClick={() => navigate(`/tutorials/${lang.slug}`)}
              className="group bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-750/80 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-100 to-transparent dark:from-slate-900/50 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    {/* Display Emoji/Char or a Lucide icon if we want. Let's render first letter or simple Icon */}
                    <span className="text-lg font-extrabold uppercase">{lang.name.substring(0, 2)}</span>
                  </div>
                  {lang.difficulty === 'beginner' && (
                    <span className="text-[9px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50">
                      Beginner Friendly
                    </span>
                  )}
                  {lang.difficulty === 'intermediate' && (
                    <span className="text-[9px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-100 dark:border-blue-900/50">
                      Intermediate
                    </span>
                  )}
                  {lang.difficulty === 'advanced' && (
                    <span className="text-[9px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100 dark:border-amber-900/50">
                      Advanced
                    </span>
                  )}
                </div>

                {/* Content */}
                <div>
                  <h4 className="text-base font-bold text-slate-950 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {lang.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 line-clamp-3">
                    {lang.description || `Master ${lang.name} concepts from scratch with hands-on practice, coding editors, quizzes, and learning cards.`}
                  </p>
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850/60 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <Code size={12} />
                    {lang.lessons_count || 0} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {lang.estimated_duration}
                  </span>
                </div>
                
                <button className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-650 border border-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/45 dark:text-blue-400 dark:border-blue-900/50 transition-all flex items-center gap-1 cursor-pointer">
                  Start Learning
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorialsHomePage;

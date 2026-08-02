import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { setSEOMetadata } from '../../utils/seo';
import { ArrowRight, Zap, Sparkles, Lock, Terminal, ChevronDown, CheckCircle } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    setSEOMetadata({
      title: 'CodeBrainzX | Master Coding through Step-by-Step Levels',
      description: 'An interactive, mobile-first coding platform that simplifies learning programming through structured progression levels. Practice Python, Java, C++, and JavaScript.',
      canonicalUrl: window.location.href,
    });
  }, []);

  const faqs = [
    {
      q: 'How does the progression system work?',
      a: 'Each topic (like Arrays, Strings, Sorting) contains four levels: Basic, Easy, Medium, and Hard. To unlock the next level, you must successfully solve all questions in your current level. This ensures you master the basics before moving to complex algorithms.'
    },
    {
      q: 'What languages does the online compiler support?',
      a: 'We support five major languages: Python 3, Java, C, C++, and JavaScript (Node.js). You can run custom test inputs and view real-time metrics for execution times and memory usages.'
    },
    {
      q: 'Is CodeBrainzX free to use?',
      a: 'Yes, CodeBrainzX is completely free. Our goal is to provide a clean, distraction-free environment for students to master algorithmic coding and prepare for interviews.'
    },
    {
      q: 'Can I add my own questions and test cases?',
      a: 'Platform administrators have a dedicated Admin Portal. Admins can create new topics, publish coding challenges, specify starter template code, and upload unlimited hidden/visible test cases.'
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-[#090a0f] transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 opacity-30 dark:opacity-20 pointer-events-none">
          <div className="absolute top-12 left-1/4 w-72 h-72 rounded-full bg-blue-400 blur-3xl"></div>
          <div className="absolute top-24 right-1/4 w-80 h-80 rounded-full bg-indigo-400 blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-6 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
            <Sparkles size={13} />
            Distraction-Free Practice Environment
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Learn Programming <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              One Level at a Time
            </span>
          </h1>
          
          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-650 dark:text-slate-350 max-w-2xl mx-auto leading-relaxed">
            CodeBrainzX structure unlocks advanced coding levels only after you solve the foundation challenges. Fast, responsive, mobile-first IDE.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center justify-center gap-2 group transition-all"
            >
              Start Coding Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-750 flex items-center justify-center gap-2 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-100 dark:border-slate-850">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Built for Progressive Learning</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Everything you need to write, test, and improve your code without clunky integrations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Terminal size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-3">Online Editor</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Fully integrated Monaco Editor environment supports multiple programming languages with auto-completions and adjustable visual modes.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Lock size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-3">Progression Gated</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Lock and unlock mechanism guides students sequentially from Basic logic to Easy, Medium, and Hard challenges.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-3">Judge0 Validation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Robust code compiling checks execution times, memory limits, and handles hidden test cases securely.
            </p>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="bg-slate-100 dark:bg-slate-850/50 py-20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Your Learning Roadmap</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Master programming topics with a structured, incremental path.</p>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 hidden md:block"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {[
                { step: '01', title: 'Pick a Topic', desc: 'Choose from Arrays, Strings, Sorting, Stacks, or Trees.' },
                { step: '02', title: 'Solve Basics', desc: 'Complete foundation exercises to practice input/output mechanics.' },
                { step: '03', title: 'Unlock Harder Levels', desc: 'Once the prior level is cleared, advance to Medium and Hard challenges.' },
                { step: '04', title: 'Assess Success', desc: 'View execution speeds, memory charts, and submission histories.' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-850 p-6 rounded-xl border border-slate-150 dark:border-slate-800 flex flex-col items-center text-center shadow-sm">
                  <div className="w-10 h-10 bg-blue-600 rounded-full text-white flex items-center justify-center font-bold mb-4 text-sm shadow-md">
                    {item.step}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
              A distraction-free environment for pure learning.
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              Unlike other platforms, CodeBrainzX has no gamified currencies, leaderboards, or certificates. We prioritize the learning process so you can focus entirely on writing high-quality algorithms.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                'Interactive compiler outputs with complete stack traces',
                'Custom inputs execution for rapid edge-case debugging',
                'Optimized mobile layouts let you solve problems on the go',
                'Simple dashboards highlight solved vs. total topic levels'
              ].map((point, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-100 dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col justify-between aspect-video relative overflow-hidden group">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="text-xs font-mono text-slate-500 ml-4">compiler_output.py</span>
            </div>
            
            <div className="flex-grow font-mono text-xs text-slate-600 dark:text-slate-455 pt-4 space-y-2">
              <p className="text-blue-500">{"\u003e\u003e\u003e Running testcases..."}</p>
              <p className="text-slate-450">TestCase 1/3: SUCCESS [Time: 0.04s, Memory: 1200KB]</p>
              <p className="text-slate-450">TestCase 2/3: SUCCESS [Time: 0.05s, Memory: 1200KB]</p>
              <p className="text-emerald-600 font-bold">{"\u003e\u003e\u003e Overall Status: ACCEPTED"}</p>
            </div>

            <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-3 py-1 text-xs rounded-lg font-bold shadow-md">
              Fast Compilation
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-4 py-16 border-t border-slate-200 dark:border-slate-850">
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-10">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between font-semibold text-slate-850 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

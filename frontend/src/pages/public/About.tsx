import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { setSEOMetadata, getOrganizationSchema, getBreadcrumbSchema } from '../../utils/seo';
import { Code, Terminal, Brain, Trophy, Users, ShieldCheck, Sparkles, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';

const About: React.FC = () => {
  useEffect(() => {
    setSEOMetadata({
      title: 'About CodexPetra | Developer Learning & Assessment Ecosystem',
      description: 'Learn about CodexPetra, our mission to democratize technical interview prep, high-performance online compilers, aptitude test engines, and developer hiring solutions.',
      canonicalUrl: 'https://www.codexpetra.com/about',
      structuredData: [
        getOrganizationSchema(),
        getBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'About CodexPetra', url: '/about' },
        ]),
      ],
    });
  }, []);

  const values = [
    {
      icon: <Terminal className="text-purple-600 dark:text-purple-400" size={24} />,
      title: 'Hands-On Code Execution',
      description: 'We believe active coding beats passive reading. Our sandbox compiler executes code in real-time across multiple programming languages.'
    },
    {
      icon: <Brain className="text-blue-600 dark:text-blue-400" size={24} />,
      title: 'Comprehensive Aptitude Prep',
      description: 'Categorized quantitative, logical, and verbal practice modules curated to mirror real campus and company placement assessments.'
    },
    {
      icon: <Trophy className="text-amber-600 dark:text-amber-400" size={24} />,
      title: 'Competitive Hackathons & Tests',
      description: 'Live leaderboard challenges and company-specific test series designed to test speed, problem-solving, and accuracy under pressure.'
    },
    {
      icon: <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={24} />,
      title: 'Fair & Transparent Evaluation',
      description: 'Automated test suite runners with strict anti-cheat proctoring and detailed performance diagnostics.'
    }
  ];

  const highlights = [
    'Curated Data Structures & Algorithms Roadmap from Arrays to Dynamic Programming',
    'Interactive Programming Language Tutorials with In-Browser Run Environments',
    'Company-Specific Assessment Papers for Top Tech & Service Companies',
    'Real-time Developer Leaderboards and Gamified XP Progress'
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-[#020204] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-white/8 py-16 sm:py-24 bg-gradient-to-b from-purple-50/50 via-slate-50/30 to-transparent dark:from-purple-950/15 dark:via-transparent dark:to-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold tracking-wide uppercase">
            <Sparkles size={13} /> Empowering Next-Gen Engineers
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Building the Ultimate Platform for <br />
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 bg-clip-text text-transparent">
              Coding Mastery & Placement Success
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            CodexPetra is an all-in-one technical learning and placement ecosystem designed for students, developers, and aspiring software engineers worldwide.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Our Mission
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Technical interviews and campus placement screenings can be overwhelming. CodexPetra bridges the gap between theoretical computer science education and real-world recruitment standards.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Whether you are solving your first algorithmic challenge in Python, brushing up on Quantitative Aptitude, or competing in a 48-hour live hackathon, CodexPetra gives you the tools, feedback, and structure you need to excel.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#07080d] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code size={18} className="text-purple-600 dark:text-purple-400" /> Platform Pillars
            </h3>
            <ul className="space-y-3">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Core Values Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Why Engineers Choose CodexPetra
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Structured learning tracks engineered for measurable skill growth
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <div 
                key={i}
                className="bg-white dark:bg-[#08090e] border border-slate-200 dark:border-white/8 rounded-2xl p-6 space-y-3 shadow-sm hover:border-purple-300 dark:hover:border-purple-800/60 transition-colors"
              >
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 w-fit">
                  {v.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {v.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl mx-auto leading-relaxed">
            Join thousands of developers mastering DSA, practicing aptitude, and clearing technical rounds with CodexPetra.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/signup"
              className="px-6 py-3 rounded-xl bg-white text-purple-700 hover:bg-purple-50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/tutorials"
              className="px-6 py-3 rounded-xl bg-purple-700/60 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm border border-purple-400/30 transition-all flex items-center gap-2"
            >
              <BookOpen size={15} />
              <span>Explore Tutorials</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

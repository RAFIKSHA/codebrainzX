import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { setSEOMetadata, getOrganizationSchema } from '../../utils/seo';
import { motion } from 'framer-motion';
import { 
  Code, Terminal, Award, Users, BookOpen, Brain, 
  Trophy, ChevronRight, Zap, Target, BarChart2, 
  Star, Sparkles, CheckCircle2, ChevronUp, Layers, HelpCircle,
  Briefcase, Building2, Compass, ShieldCheck, ArrowRight
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setSEOMetadata({
      title: 'CodexPetra | Coding, DSA, Aptitude & Placement Preparation',
      description: 'Master coding challenges, DSA roadmap, programming tutorials in Python, Java, C++, JS, aptitude preparation, company test series, live hackathons, and virtual internships on CodexPetra.',
      canonicalUrl: 'https://www.codexpetra.com/',
      structuredData: [
        getOrganizationSchema(),
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          '@id': 'https://www.codexpetra.com/#website',
          'name': 'CodexPetra',
          'url': 'https://www.codexpetra.com/',
          'potentialAction': {
            '@type': 'SearchAction',
            'target': 'https://www.codexpetra.com/tutorials?search={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        }
      ],
    });
  }, []);

  const stats = [
    { value: "12K+", label: "Problems" },
    { value: "350+", label: "Tutorials" },
    { value: "5K+", label: "Active Users" },
    { value: "50+", label: "Hackathons" }
  ];

  const features = [
    {
      icon: <Terminal className="text-blue-500" size={20} />,
      title: "Online Compiler",
      subtitle: "Execute code instantly in 5+ languages"
    },
    {
      icon: <Code className="text-indigo-500" size={20} />,
      title: "Interview Questions",
      subtitle: "Real assessments from Google, Amazon, TCS"
    },
    {
      icon: <Target className="text-purple-500" size={20} />,
      title: "Track Progress",
      subtitle: "Detailed metrics and weak area analysis"
    },
    {
      icon: <Award className="text-emerald-500" size={20} />,
      title: "Certificates",
      subtitle: "Earn verified credentials on completion"
    },
    {
      icon: <Users className="text-amber-500" size={20} />,
      title: "Community",
      subtitle: "Collaborate in sprints and hackathons"
    }
  ];

  // 8 Primary Sections of CodexPetra Platform Architecture
  const primarySections = [
    {
      id: "tutorials",
      number: "01",
      title: "Interactive Tutorials & Language Learning",
      description: "Master Python, Java, C++, and JavaScript with interactive syntax walkthroughs, deep-dive conceptual documentation, and in-browser code execution.",
      icon: <BookOpen className="text-purple-600 dark:text-purple-400" size={26} />,
      bgColor: "bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/40",
      cta: "Learn Python, Java, C++ & JavaScript",
      path: "/tutorials",
      subLinks: [
        { label: "Python Tutorials", path: "/tutorials/python" },
        { label: "Java Tutorials", path: "/tutorials/java" },
        { label: "C++ Tutorials", path: "/tutorials/cpp" },
        { label: "JavaScript Tutorials", path: "/tutorials/javascript" },
      ]
    },
    {
      id: "dsa",
      number: "02",
      title: "DSA Roadmap & Coding Practice Playground",
      description: "Follow a step-by-step Data Structures & Algorithms roadmap, solve topic-wise challenges, and practice on our multi-language interactive playground.",
      icon: <Code className="text-blue-600 dark:text-blue-400" size={26} />,
      bgColor: "bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40",
      cta: "DSA Roadmap & Coding Practice",
      path: "/dsa",
      subLinks: [
        { label: "DSA Roadmap", path: "/dsa/roadmap" },
        { label: "Coding Problems", path: "/dsa/problems" },
        { label: "Difficulty Tracks", path: "/dsa" },
      ]
    },
    {
      id: "aptitude",
      number: "03",
      title: "Aptitude & Logical Reasoning Hub",
      description: "Comprehensive quantitative aptitude, logical reasoning, and verbal ability modules with category-wise practice questions and timed mock tests.",
      icon: <Brain className="text-emerald-600 dark:text-emerald-400" size={26} />,
      bgColor: "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40",
      cta: "Aptitude & Logical Reasoning",
      path: "/aptitude",
      subLinks: [
        { label: "Aptitude Categories", path: "/aptitude/categories" },
        { label: "Quantitative Practice", path: "/aptitude" },
        { label: "Placement Mock Tests", path: "/aptitude" },
      ]
    },
    {
      id: "placement-tests",
      number: "04",
      title: "Company-Specific Placement Test Series",
      description: "Simulate real recruitment examinations with targeted placement mock tests tailored for TCS, Infosys, Wipro, Amazon, and leading tech companies.",
      icon: <Layers className="text-teal-600 dark:text-teal-400" size={26} />,
      bgColor: "bg-teal-50/50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-900/40",
      cta: "Company Placement Test Series",
      path: "/placement-tests",
      subLinks: [
        { label: "TCS Test Series", path: "/placement-tests/tcs" },
        { label: "Infosys Test Series", path: "/placement-tests/infosys" },
        { label: "Wipro Test Series", path: "/placement-tests/wipro" },
      ]
    },
    {
      id: "hackathons",
      number: "05",
      title: "Live Hackathons & Competitive Coding Contests",
      description: "Participate in real-time hackathons and coding sprints. Build production projects, submit solutions, climb leaderboards, and win grand prize pools.",
      icon: <Trophy className="text-amber-500 dark:text-amber-400" size={26} />,
      bgColor: "bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40",
      cta: "Live Hackathons & Coding Contests",
      path: "/hackathons",
      subLinks: [
        { label: "Upcoming Contests", path: "/hackathons" },
        { label: "Hackathon Registration", path: "/hackathons" },
        { label: "Verified Certificates", path: "/hackathons" },
      ]
    },
    {
      id: "internships",
      number: "06",
      title: "Internship Portal & Skill Assessments",
      description: "Apply for verified virtual engineering internships, take automated skill assessment benchmarks, and gain hands-on production experience.",
      icon: <Briefcase className="text-indigo-600 dark:text-indigo-400" size={26} />,
      bgColor: "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40",
      cta: "Internship Portal & Skill Assessments",
      path: "/internships",
      subLinks: [
        { label: "Internship Openings", path: "/internships" },
        { label: "Skill Assessments", path: "/internships" },
        { label: "Verified Credentials", path: "/internships" },
      ]
    },
    {
      id: "interview-prep",
      number: "07",
      title: "Company Selection & Interview Preparation Tracks",
      description: "Target company-wise interview preparation with problem archives, company hiring pattern insights, and curated placement prep tracks.",
      icon: <Building2 className="text-rose-600 dark:text-rose-400" size={26} />,
      bgColor: "bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40",
      cta: "Company Interview Preparation",
      path: "/interview-preparation",
      subLinks: [
        { label: "Company Archives", path: "/interview-preparation" },
        { label: "Interview Prep Tracks", path: "/interview-preparation" },
        { label: "Placement Insights", path: "/placement-tests" },
      ]
    },
    {
      id: "about-platform",
      number: "08",
      title: "About CodexPetra & Developer Ecosystem",
      description: "Learn about CodexPetra's mission to empower developers with modern learning tools, transparent evaluations, and comprehensive career roadmaps.",
      icon: <ShieldCheck className="text-sky-600 dark:text-sky-400" size={26} />,
      bgColor: "bg-sky-50/50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/40",
      cta: "About CodexPetra",
      path: "/about",
      subLinks: [
        { label: "About Us", path: "/about" },
        { label: "Contact Support", path: "/contact" },
        { label: "Privacy Policy", path: "/privacy-policy" },
        { label: "Terms & Conditions", path: "/terms-conditions" },
      ]
    }
  ];

  const topicChips = [
    { name: "Arrays", path: "/dsa" },
    { name: "Strings", path: "/dsa" },
    { name: "Dynamic Programming", path: "/dsa" },
    { name: "Graphs", path: "/dsa" },
    { name: "Trees", path: "/dsa" },
    { name: "Binary Search", path: "/dsa" },
    { name: "Greedy", path: "/dsa" },
    { name: "Quantitative Aptitude", path: "/aptitude" },
    { name: "Logical Reasoning", path: "/aptitude" },
    { name: "Company Tests", path: "/placement-tests" }
  ];

  return (
    <div className="bg-white dark:bg-[#020204] min-h-screen text-slate-800 dark:text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-blue-500/10 transition-colors duration-200">
      
      {/* ── HERO SECTION ── */}
      <section className="relative pt-12 pb-20 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Decorative Grid & Prism background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Copywriting & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Small Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-400 text-xs font-semibold tracking-wide">
              <Sparkles size={12} className="text-indigo-500 dark:text-indigo-400 shrink-0" />
              <span>Complete Learning, Coding, Placement & Internship Ecosystem</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Code. Learn.<br />
              Compete.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-fuchsia-500 to-orange-500">
                Build Your Future.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
              CodexPetra is your unified platform to master programming languages, conquer Data Structures & Algorithms, practice aptitude assessments, excel in company placement test series, participate in live hackathons, and secure virtual internships.
            </p>

            {/* Prominent Crawlable CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                to="/dsa"
                className="px-6 py-3 font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 text-sm cursor-pointer flex items-center gap-2 border border-indigo-700/10"
              >
                <span>DSA Roadmap & Coding Practice</span>
                <ChevronRight size={16} />
              </Link>
              
              <Link 
                to="/tutorials"
                className="px-6 py-3 font-bold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 rounded-xl transition-all text-sm cursor-pointer"
              >
                Learn Python, Java, C++ & JavaScript
              </Link>
            </div>

            {/* Platform Statistics */}
            <div className="pt-8 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((s, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Premium Dashboard Preview */}
          <div className="lg:col-span-5 relative w-full flex justify-center lg:justify-end">
            
            {/* Dashboard Card Container */}
            <div className="relative w-full max-w-[400px] bg-white dark:bg-[#08090e] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl p-6 space-y-6">
              
              {/* Card Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/10">
                <div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Welcome Back</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Developer #42</div>
                </div>
                <div className="px-2 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold">
                  STUDENT
                </div>
              </div>

              {/* Progress & Acceptance Rate Metrics */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Solved Problems */}
                <div className="bg-slate-50 dark:bg-[#0d0e15] border border-slate-100 dark:border-white/10 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Coding Solved</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-extrabold text-slate-800 dark:text-white">342</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">/ 1200</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full w-[28.5%]"></div>
                  </div>
                </div>

                {/* Acceptance Rate */}
                <div className="bg-slate-50 dark:bg-[#0d0e15] border border-slate-100 dark:border-white/10 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Acceptance</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-extrabold text-slate-800 dark:text-white">72.4%</span>
                    <ChevronUp className="text-emerald-500 shrink-0 self-center" size={13} />
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Higher than 82% users</span>
                </div>

              </div>

              {/* Difficulty Circle representation */}
              <div className="flex items-center gap-6 p-3 bg-slate-50 dark:bg-[#0d0e15] border border-slate-100 dark:border-white/10 rounded-xl">
                
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" className="stroke-slate-200 dark:stroke-slate-800" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="50 100" strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="30 100" strokeDashoffset="-50" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="20 100" strokeDashoffset="-80" />
                  </svg>
                  <div className="absolute text-[10px] font-bold text-slate-700 dark:text-slate-200">72%</div>
                </div>

                <div className="space-y-1.5 flex-grow">
                  <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Easy</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">180 Solved</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Medium</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">120 Solved</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Hard</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">42 Solved</span>
                  </div>
                </div>

              </div>

              {/* Recent Activity List */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">Recent Activity</span>
                <div className="divide-y divide-slate-50 dark:divide-white/5">
                  <div className="flex justify-between py-1.5 text-[11px] font-medium">
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">Two Sum</span>
                    <span className="text-emerald-500 font-bold">Solved</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-[11px] font-medium">
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">Valid Parentheses</span>
                    <span className="text-emerald-500 font-bold">Solved</span>
                  </div>
                </div>
              </div>

              {/* Float Widget: Monthly Contest Card */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-[#0a0b10] border border-slate-200 dark:border-white/10 shadow-xl rounded-xl p-3 flex items-center gap-3 w-48 shrink-0 hover:scale-102 transition-transform">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                  <Trophy size={14} />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[10px] font-bold text-slate-900 dark:text-white truncate">Weekly Sprint #24</div>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Sunday 8:00 PM</div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ── FEATURE STRIP ── */}
      <section className="bg-slate-50/50 dark:bg-[#050609] border-y border-slate-100 dark:border-white/8 py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 lg:gap-8 justify-items-center">
            {features.map((f, idx) => (
              <div key={idx} className="flex flex-col items-center text-center gap-2 max-w-[200px]">
                <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#0a0b10] border border-slate-200/60 dark:border-white/10 shadow-sm flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed font-medium">{f.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIMARY ECOSYSTEM SECTIONS (8 CORE PILLARS) ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Compass size={13} /> Platform Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Explore the CodexPetra Ecosystem
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Everything you need in one unified platform: interactive programming tutorials, algorithmic coding challenges, aptitude prep, placement mock test series, live hackathons, and virtual internships.
          </p>
        </div>

        {/* 8 Primary Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {primarySections.map((s) => (
            <motion.div 
              key={s.id}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`rounded-2xl p-6 flex flex-col justify-between ${s.bgColor} border shadow-sm hover:shadow-xl transition-all`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-white dark:bg-[#0e1017] rounded-xl shadow-sm border border-slate-100 dark:border-white/10 flex items-center justify-center shrink-0">
                    {s.icon}
                  </div>
                  <span className="text-xs font-black text-slate-300 dark:text-slate-700">
                    {s.number}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                    {s.description}
                  </p>
                </div>

                {/* Sub links for crawler discovery */}
                <div className="pt-2 border-t border-slate-200/40 dark:border-white/5 space-y-1">
                  {s.subLinks.map((sub, sIdx) => (
                    <Link
                      key={sIdx}
                      to={sub.path}
                      className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      • {sub.label}
                    </Link>
                  ))}
                </div>
              </div>

              <Link 
                to={s.path}
                className="w-full mt-5 py-2.5 bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer group"
              >
                <span>{s.cta}</span>
                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

      </section>

      {/* ── TOPIC CHIPS / INTERNAL LINKING ── */}
      <section className="pb-20 max-w-4xl mx-auto px-4 text-center">
        <div className="space-y-4">
          <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
            Popular Practice Topics & Roadmaps
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {topicChips.map((c, idx) => (
              <Link 
                key={idx} 
                to={c.path} 
                className="px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50/20 dark:hover:bg-blue-950/30 transition-all shadow-sm"
              >
                {c.name}
              </Link>
            ))}
            <Link 
              to="/dsa" 
              className="px-3.5 py-1.5 rounded-full border border-dashed border-slate-300 dark:border-white/20 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all flex items-center gap-1"
            >
              <span>Explore All Modules</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;

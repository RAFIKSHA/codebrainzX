import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { setSEOMetadata } from '../../utils/seo';
import { motion } from 'framer-motion';
import { 
  Code, Terminal, Award, Users, BookOpen, Brain, 
  Trophy, ChevronRight, Zap, Target, BarChart2, 
  Star, Sparkles, CheckCircle2, ChevronUp, Layers, HelpCircle
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setSEOMetadata({
      title: 'CodexPetra | Practice Coding, Aptitude & Learn',
      description: 'Prepare for placements and coding interviews with structured coding challenges, aptitude prep, interactive language tutorials, and mega hackathons.',
      canonicalUrl: window.location.href,
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

  const popularSections = [
    {
      title: "Practice Coding",
      description: "Master algorithms and data structures. Complete curated sheets for specific organizations and levels.",
      icon: <Code className="text-blue-600" size={28} />,
      bgColor: "bg-blue-50/50 border border-blue-100",
      cta: "Start Practicing",
      path: "/dashboard/coding"
    },
    {
      title: "Aptitude & Reasoning",
      description: "No login required! Browse placements topics, read explanations, solve practice questions, and take mock tests.",
      icon: <Brain className="text-emerald-600" size={28} />,
      bgColor: "bg-emerald-50/50 border border-emerald-100",
      cta: "Explore Aptitude",
      path: "/dashboard/aptitude"
    },
    {
      title: "Learn Tutorials",
      description: "Interactive language courses from core variables to advanced system architectures in Python, Java, C++, and JS.",
      icon: <BookOpen className="text-purple-500" size={28} />,
      bgColor: "bg-purple-50/50 border border-purple-100",
      cta: "Browse Tutorials",
      path: "/tutorials"
    },
    {
      title: "Mega Hackathons",
      description: "Compete with developer communities. Collaborate, build real projects under time constraints, and claim grand prize pools.",
      icon: <Trophy className="text-amber-500" size={28} />,
      bgColor: "bg-amber-50/50 border border-amber-100",
      cta: "View Hackathons",
      path: "/dashboard/hackathons"
    }
  ];

  const topicChips = [
    "Arrays", "Strings", "Dynamic Programming", "Graphs", 
    "Trees", "Binary Search", "Greedy", "Maths", "AI/ML", "SQL"
  ];

  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans antialiased overflow-x-hidden selection:bg-blue-500/10">
      
      {/* ── HERO SECTION ── */}
      <section className="relative pt-12 pb-20 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Decorative Grid Grid & Prism background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Copywriting & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Small Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold tracking-wide">
              <Sparkles size={12} className="text-blue-500 shrink-0" />
              <span>Empowering developers to learn, practice & grow</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Code. Learn.<br />
              Compete.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-650">
                Build Your Future.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-xl">
              A complete platform to practice coding, solve real-world problems, prepare for interviews, and participate in signature mega hackathons.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => navigate('/dashboard/coding')}
                className="px-6 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 text-sm cursor-pointer flex items-center gap-2 border border-blue-700/10"
              >
                <span>Start Practicing</span>
                <ChevronRight size={16} />
              </button>
              
              <button 
                onClick={() => navigate('/dashboard/hackathons')}
                className="px-6 py-3 font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-all text-sm cursor-pointer"
              >
                Explore Hackathons
              </button>
            </div>

            {/* Platform Statistics */}
            <div className="pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((s, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Premium Dashboard Preview */}
          <div className="lg:col-span-5 relative w-full flex justify-center lg:justify-end">
            
            {/* Dashboard Card Container */}
            <div className="relative w-full max-w-[400px] bg-white rounded-2xl border border-slate-200/80 shadow-2xl p-6 space-y-6">
              
              {/* Card Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Welcome Back</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">Developer #42</div>
                </div>
                <div className="px-2 py-1 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg text-[10px] font-bold">
                  STUDENT
                </div>
              </div>

              {/* Progress & Acceptance Rate Metrics */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Solved Problems */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Coding Solved</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-extrabold text-slate-800">342</span>
                    <span className="text-[10px] text-slate-400">/ 1200</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full w-[28.5%]"></div>
                  </div>
                </div>

                {/* Acceptance Rate */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Acceptance</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-extrabold text-slate-800">72.4%</span>
                    <ChevronUp className="text-emerald-500 shrink-0 self-center" size={13} />
                  </div>
                  <span className="text-[9px] text-slate-400 block">Higher than 82% users</span>
                </div>

              </div>

              {/* Difficulty Circle / Circular chart visual representation */}
              <div className="flex items-center gap-6 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                
                {/* SVG Semi-Pie Representation */}
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="50 100" strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="30 100" strokeDashoffset="-50" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="20 100" strokeDashoffset="-80" />
                  </svg>
                  <div className="absolute text-[10px] font-bold text-slate-700">72%</div>
                </div>

                {/* Legend list */}
                <div className="space-y-1.5 flex-grow">
                  <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Easy</span>
                    <span className="font-bold text-slate-700">180 Solved</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Medium</span>
                    <span className="font-bold text-slate-700">120 Solved</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Hard</span>
                    <span className="font-bold text-slate-700">42 Solved</span>
                  </div>
                </div>

              </div>

              {/* Recent Activity List */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Recent Activity</span>
                <div className="divide-y divide-slate-50">
                  <div className="flex justify-between py-1.5 text-[11px] font-medium">
                    <span className="text-slate-755 truncate max-w-[200px]">Two Sum</span>
                    <span className="text-emerald-500 font-bold">Solved</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-[11px] font-medium">
                    <span className="text-slate-755 truncate max-w-[200px]">Valid Parentheses</span>
                    <span className="text-emerald-500 font-bold">Solved</span>
                  </div>
                </div>
              </div>

              {/* Float Widget: Monthly Contest Card */}
              <div className="absolute -bottom-6 -left-6 bg-white border border-slate-200 shadow-xl rounded-xl p-3 flex items-center gap-3 w-48 shrink-0 hover:scale-102 transition-transform">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Trophy size={14} />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[10px] font-bold text-slate-900 truncate">Weekly Sprint #24</div>
                  <div className="text-[9px] text-slate-450 mt-0.5 font-medium">Sunday 8:00 PM</div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ── FEATURE STRIP ── */}
      <section className="bg-slate-50/50 border-y border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 lg:gap-8 justify-items-center">
            {features.map((f, idx) => (
              <div key={idx} className="flex flex-col items-center text-center gap-2 max-w-[200px]">
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/60 shadow-sm flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{f.title}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-medium">{f.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR SECTIONS ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Popular Learning Paths
          </h2>
          <p className="text-slate-450 text-xs sm:text-sm mt-2 leading-relaxed">
            Choose from custom practice sets, placement-ready tutorials, coding competitions, or aptitude reasoning practice sheets.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularSections.map((s, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`rounded-2xl p-6 flex flex-col justify-between h-72 ${s.bgColor} shadow-sm shadow-blue-500/2 hover:shadow-xl transition-shadow`}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-105 flex items-center justify-center shrink-0">
                  {s.icon}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{s.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                    {s.description}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => navigate(s.path)}
                className="w-full mt-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{s.cta}</span>
                <ChevronRight size={13} />
              </button>
            </motion.div>
          ))}
        </div>

      </section>

      {/* ── TOPIC CHIPS ── */}
      <section className="pb-20 max-w-3xl mx-auto px-4 text-center">
        <div className="space-y-4">
          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block">
            Popular Topics
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {topicChips.map((c, idx) => (
              <Link 
                key={idx} 
                to="/dashboard/coding" 
                className="px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-655 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/20 transition-all shadow-sm"
              >
                {c}
              </Link>
            ))}
            <Link 
              to="/dashboard/coding" 
              className="px-3.5 py-1.5 rounded-full border border-dashed border-slate-300 text-xs font-semibold text-slate-450 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center gap-1"
            >
              <span>More</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Lock, Bell, Timer, Check, Bookmark, ArrowLeft, ChevronRight
} from 'lucide-react';

// Common Premium Card for Coming Soon Modules
const ComingSoonWrapper: React.FC<{
  title: string;
  description: string;
  category: string;
  children: React.ReactNode;
  isUnlocked?: boolean;
}> = ({ title, description, category, children, isUnlocked = false }) => {
  const [notified, setNotified] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Module Navigation Header */}
      <div className="flex items-center justify-between">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Hub
        </Link>
        <span className="text-xs font-mono text-slate-400">
          dashboard / {category}
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-955 dark:from-[#0b0c14] dark:to-[#0f111e] border border-slate-200 dark:border-slate-850 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-600/10 text-blue-605 dark:text-blue-400 border border-blue-500/20 rounded">
              {isUnlocked ? 'Active Beta' : 'Coming Soon'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
              {title}
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              {description}
            </p>
          </div>

          <button
            onClick={() => setNotified(!notified)}
            className={`flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer shadow-sm ${
              notified 
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                : 'bg-blue-600 hover:bg-blue-750 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-blue-500/10'
            }`}
          >
            {notified ? <Check size={16} /> : <Bell size={16} />}
            {notified ? 'Notification Active' : 'Notify Me on Release'}
          </button>
        </div>
      </div>

      {/* Render Mock Dashboard content underneath */}
      <div className="relative">
        {/* Blur overlay to emphasize coming soon lock */}
        {!isUnlocked && (
          <div className="absolute inset-0 bg-slate-50/20 dark:bg-[#07080d]/40 backdrop-blur-[2px] rounded-3xl z-10 flex flex-col items-center justify-center border border-slate-200/50 dark:border-slate-850/50">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-800 shadow-xl text-center max-w-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto animate-bounce-slow">
                <Lock size={20} />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                Module Locked
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                We are currently finalizing the mock contents, databases, and evaluation APIs for this section. Unlock with CodexPetra Premium soon!
              </p>
            </div>
          </div>
        )}

        {/* Mock Content */}
        <div className={!isUnlocked ? "opacity-40 pointer-events-none select-none" : ""}>
          {children}
        </div>
      </div>
    </div>
  );
};

// 1. Interview Prep Dashboard Placeholder
export const InterviewDashboard: React.FC = () => {
  const sheets = [
    { title: 'SDE Core Placement Sheet', count: '180 Questions', tag: 'Popular' },
    { title: 'FAANG Interview Guide', count: '90 Questions', tag: 'Advanced' },
    { title: 'System Design Fundamentals', count: '25 Case Studies', tag: 'Architect' },
    { title: 'Behavioral & HR Round Prep', count: '40 Scenarios', tag: 'Core' }
  ];

  return (
    <ComingSoonWrapper
      title="Interview Preparation"
      description="Review curated question sheets targets at SDE interviews. Complete case studies, core engineering concepts, and behavioral scripts."
      category="interview"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sheets.map((sheet, i) => (
          <div key={i} className="bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-850 rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100/10 text-blue-600 dark:text-blue-400 font-extrabold uppercase">{sheet.tag}</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 mt-1">{sheet.title}</h4>
              <p className="text-xs text-slate-450">{sheet.count}</p>
            </div>
            <Lock size={16} className="text-slate-400 mr-2" />
          </div>
        ))}
      </div>
    </ComingSoonWrapper>
  );
};

// 3. MCQ Dashboard Placeholder
export const McqDashboard: React.FC = () => {
  const subjects = [
    { name: 'Operating Systems', questions: 120, icon: Bookmark },
    { name: 'Database Management Systems', questions: 140, icon: Bookmark },
    { name: 'Computer Networks', questions: 110, icon: Bookmark },
    { name: 'Object Oriented Programming', questions: 95, icon: Bookmark },
    { name: 'Compiler Design & Automata', questions: 80, icon: Bookmark }
  ];

  return (
    <ComingSoonWrapper
      title="Core CS MCQs"
      description="Practice multiple choice questions compiled from previous gate tests and university exams. Test your grip on core programming and infrastructure theory."
      category="mcq"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub, i) => {
          const Icon = sub.icon;
          return (
            <div key={i} className="bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-850 rounded-2xl p-5 flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-blue-600 dark:text-blue-400">
                <Icon size={18} />
              </div>
              <div className="flex-grow">
                <h4 className="text-xs font-bold text-slate-905 dark:text-slate-200 leading-tight">{sub.name}</h4>
                <span className="text-[10px] text-slate-450 mt-1 block">{sub.questions} Practice MCQs</span>
              </div>
              <Lock size={14} className="text-slate-400" />
            </div>
          );
        })}
      </div>
    </ComingSoonWrapper>
  );
};

// 4. Contests Dashboard Placeholder
export const ContestsDashboard: React.FC = () => {
  const contests = [
    { title: 'Weekly Coding Duel #42', time: 'Aug 8, 2026 20:00', duration: '2 Hours', registered: '1,420 Enrolled' },
    { title: 'Biweekly Speedrun #18', time: 'Aug 15, 2026 19:30', duration: '1.5 Hours', registered: '850 Enrolled' },
    { title: 'Algorithm Hackathon 2026', time: 'Sep 01, 2026 10:00', duration: '24 Hours', registered: '4,500 Enrolled' }
  ];

  return (
    <ComingSoonWrapper
      title="Competitive Contests"
      description="Participate in real-time programming duels, compile solutions, pass test cases, and raise your global rating stats."
      category="contests"
    >
      <div className="space-y-4">
        {contests.map((contest, i) => (
          <div key={i} className="bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-850 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{contest.title}</h4>
              <div className="flex items-center gap-3 text-xs text-slate-450">
                <span className="flex items-center gap-1"><Timer size={12} /> {contest.time}</span>
                <span>•</span>
                <span>{contest.duration}</span>
                <span>•</span>
                <span className="text-blue-500 font-semibold">{contest.registered}</span>
              </div>
            </div>
            <button className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-900/60 cursor-not-allowed">
              Locked
            </button>
          </div>
        ))}
      </div>
    </ComingSoonWrapper>
  );
};

// 5. Courses Dashboard Placeholder
export const CoursesDashboard: React.FC = () => {
  const courses = [
    { title: 'Intro to C++ & Algorithms', level: 'Beginner', duration: '12 Hours', modules: '8 Modules' },
    { title: 'Mastering Advanced Data Structures', level: 'Advanced', duration: '24 Hours', modules: '14 Modules' },
    { title: 'Dynamic Programming Masterclass', level: 'Intermediate', duration: '18 Hours', modules: '10 Modules' }
  ];

  return (
    <ComingSoonWrapper
      title="Structured Courses"
      description="Access fully interactive tutorials covering core algorithms and software design. Complete modular checks and gain completion certifications."
      category="courses"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course, i) => (
          <div key={i} className="bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-850 rounded-2xl p-5 flex flex-col justify-between h-44">
            <div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10 font-bold uppercase">{course.level}</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2 line-clamp-2">{course.title}</h4>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-450 border-t border-slate-100 dark:border-slate-850/60 pt-3">
              <span>{course.modules}</span>
              <span>{course.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </ComingSoonWrapper>
  );
};

// 6. AI Practice Dashboard Placeholder
export const AiPracticeDashboard: React.FC = () => {
  return (
    <ComingSoonWrapper
      title="AI Practice Mock (Beta)"
      description="Practice mock code submissions and behavioral interviewing with an interactive AI tutor. Receive immediate line-by-line logical reviews and syntax corrections."
      category="ai-practice"
    >
      <div className="bg-white dark:bg-[#0c0e17] border border-slate-200 dark:border-slate-850 rounded-2xl p-6 space-y-6">
        {/* Mock Chat View */}
        <div className="space-y-4">
          <div className="flex gap-3 max-w-lg">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center shrink-0">
              AI
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-150 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-350">
              Welcome! Please paste the problem statement or write a prompt of what topic you want to test. I will compile a code snippet and check execution results.
            </div>
          </div>
          
          <div className="flex gap-3 max-w-lg ml-auto flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-xs">
              U
            </div>
            <div className="bg-blue-600 text-white p-3 rounded-2xl text-xs">
              Evaluate my binary search implementation please.
            </div>
          </div>
        </div>

        {/* Mock input text bar */}
        <div className="flex gap-2 border-t border-slate-100 dark:border-slate-850/60 pt-4">
          <input 
            type="text" 
            placeholder="Ask AI practice assistant..." 
            disabled 
            className="flex-grow p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs outline-none"
          />
          <button className="px-5 py-3 rounded-xl bg-blue-600/30 text-white/50 text-xs font-semibold cursor-not-allowed">
            Send
          </button>
        </div>
      </div>
    </ComingSoonWrapper>
  );
};

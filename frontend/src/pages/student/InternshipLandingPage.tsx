import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, Shield, CodeXml, Briefcase, 
  Users, TrendingUp, Star, FileText, Laptop, 
  BarChart3, Database, Terminal, Target, Rocket, 
  Trophy, MessageCircle, Phone, Mail, ArrowUpRight, 
  MapPin, Clock, CheckCircle2, ChevronRight
} from 'lucide-react';
import { internshipService, type InternshipProgram } from '../../services/internship';
import { setSEOMetadata, getBreadcrumbSchema } from '../../utils/seo';
import heroImg from '../../assets/internship_hero.jpg';

const InternshipLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<InternshipProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSEOMetadata({
      title: 'Internship Portal & Skill Assessments | CodexPetra',
      description: 'Build real-world developer solutions, solve challenging technical assessments, and gain hands-on engineering experience with the CodexPetra Internship Program.',
      canonicalUrl: 'https://www.codexpetra.com/internships',
      structuredData: getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Internship Portal & Skill Assessments', url: '/internships' },
      ]),
    });

    const fetchData = async () => {
      try {
        setLoading(true);
        const programsData = await internshipService.getPrograms();
        setPrograms(programsData);
      } catch (err) {
        console.error('Error loading internship programs', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const scrollToTracks = () => {
    const el = document.getElementById('available-tracks');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fallback program roles if database empty or loading
  const displayPrograms = programs.length > 0 ? programs : [
    {
      id: 1,
      title: 'Software Development Intern',
      slug: 'software-development',
      category: 'Engineering',
      mode: 'Remote',
      duration: 'Internship',
      description: 'Build scalable web applications and APIs using modern technologies.',
      skills_covered: ['React', 'Node.js', 'PostgreSQL', 'APIs']
    },
    {
      id: 2,
      title: 'Python Development Intern',
      slug: 'python-development',
      category: 'Engineering',
      mode: 'Remote',
      duration: 'Internship',
      description: 'Work on backend systems, automation scripts and data-driven solutions.',
      skills_covered: ['Python', 'Django', 'FastAPI', 'Databases']
    },
    {
      id: 3,
      title: 'Data / AI Intern',
      slug: 'data-ai-internship',
      category: 'Technology',
      mode: 'Remote',
      duration: 'Internship',
      description: 'Work with data, build ML models and derive insights from complex datasets.',
      skills_covered: ['Python', 'Pandas', 'Machine Learning', 'SQL']
    }
  ];

  const getProgramIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('python')) return Terminal;
    if (t.includes('data') || t.includes('ai')) return Database;
    return CodeXml;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#07080e] text-slate-900 dark:text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-16 sm:space-y-20">

        {/* ── 1. HERO SECTION ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center pt-2">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80 text-purple-600 dark:text-purple-300 text-[11px] font-extrabold tracking-wider uppercase">
              <Target size={13} className="text-purple-600 dark:text-purple-400" />
              <span>CODEXPETRA INTERNSHIP PROGRAM 2026</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-slate-950 dark:text-white leading-[1.12]">
              Build Real Solutions.<br />
              Create Real{' '}
              <span className="text-purple-600 dark:text-purple-400">
                Impact.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Join a performance-driven internship program. Work on real-world projects, get evaluated on your skills, and unlock opportunities to grow with CodexPetra.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                onClick={scrollToTracks}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Apply Now</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={scrollToTracks}
                className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-850 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Programs</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Micro Note */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1">
              <Shield size={14} className="text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Your performance decides what comes next.</span>
            </div>
          </div>

          {/* Right Column: Hero Graphic Mockup & Floating Card */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[480px]">
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-slate-900">
                <img 
                  src={heroImg} 
                  alt="CodexPetra Engineering Laptop Workspace" 
                  className="w-full h-[280px] sm:h-[320px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating "Real Projects" Card */}
              <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-6 bg-white dark:bg-[#0f111d] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl max-w-[260px] sm:max-w-[280px] space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-mono font-black text-xs">
                  {'</>'}
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  Real Projects
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Build production-ready solutions used by real users.
                </p>
              </div>

              {/* Dot Matrix Decoration */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 grid grid-cols-3 gap-1.5 opacity-40 dark:opacity-30 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. HAVE QUESTIONS? CONTACT SUPPORT ROW ── */}
        <section className="bg-white dark:bg-[#0f111d] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            {/* Title */}
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                Have Questions?
              </h3>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                We're here to help!
              </p>
            </div>

            {/* Chat on WhatsApp */}
            <a
              href="https://wa.me/919876543210?text=Hi%20CodexPetra%2C%20I%20have%20a%20query%20regarding%20the%20Internship%202026%20Program."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <MessageCircle size={20} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Chat on WhatsApp
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  Get instant response
                </div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 group-hover:underline">
                  <span>+91 98765 43210</span>
                  <ArrowUpRight size={12} />
                </div>
              </div>
            </a>

            {/* Call Us */}
            <a
              href="tel:+919876543210"
              className="flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Phone size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Call Us
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  Mon – Sat, 10 AM – 7 PM
                </div>
                <div className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-0.5 group-hover:underline">
                  +91 98765 43210
                </div>
              </div>
            </a>

            {/* Email Us */}
            <a
              href="mailto:support@codexpetra.com?subject=Internship%202026%20Query"
              className="flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Mail size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Email Us
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  We'll reply within 24 hrs
                </div>
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 group-hover:underline">
                  support@codexpetra.com
                </div>
              </div>
            </a>
          </div>
        </section>

        {/* ── 3. WHY INTERN WITH CODEXPETRA? ── */}
        <section className="space-y-6 text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            Why Intern with CodexPetra?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: 'Real-world Projects',
                desc: 'Work on real projects that solve actual problems and create real impact.',
                icon: Briefcase
              },
              {
                title: 'Assessment + Selection',
                desc: 'Clear assessments and selection process to ensure fairness and transparency.',
                icon: Users
              },
              {
                title: 'Performance Based Continuity',
                desc: 'High performers get the opportunity to continue and take on bigger challenges.',
                icon: TrendingUp
              },
              {
                title: 'Growth Opportunities',
                desc: 'Top performers may receive pre-placement offers and career opportunities.',
                icon: Star
              }
            ].map((card, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f111d] border border-slate-200/90 dark:border-slate-800/80 shadow-xs hover:border-purple-300 dark:hover:border-purple-800 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <card.icon size={19} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. OUR SELECTION PROCESS (5 Nodes Horizontal Timeline) ── */}
        <section className="text-center space-y-8 pt-4">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
              OUR SELECTION PROCESS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              From Application to Opportunity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-2 relative items-start">
            {[
              {
                step: '01',
                title: 'Apply',
                desc: 'Submit your application and basic details.',
                icon: FileText
              },
              {
                step: '02',
                title: 'Assessment',
                desc: 'Clear the online assessment to showcase your skills.',
                icon: CodeXml
              },
              {
                step: '03',
                title: 'Shortlisting',
                desc: 'Top candidates are shortlisted for projects.',
                icon: Users
              },
              {
                step: '04',
                title: 'Project Allocation',
                desc: 'Work on real-world projects with our team.',
                icon: Laptop
              },
              {
                step: '05',
                title: 'Evaluation',
                desc: 'Performance is reviewed based on your contributions.',
                icon: BarChart3
              }
            ].map((node, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-3 px-2 relative group">
                {/* Node Top Number Pill */}
                <div className="relative">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-[10px] font-black text-purple-700 dark:text-purple-300 font-mono">
                    {node.step}
                  </span>
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-[#0f111d] border-2 border-purple-200 dark:border-purple-800/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mt-2 shadow-sm group-hover:scale-105 group-hover:border-purple-500 transition-all mx-auto">
                    <node.icon size={22} />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {node.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[190px]">
                  {node.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. AVAILABLE INTERNSHIP PROGRAMS (Explore Open Roles) ── */}
        <section id="available-tracks" className="space-y-6 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
                AVAILABLE INTERNSHIP PROGRAMS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight mt-0.5">
                Explore Open Roles
              </h2>
            </div>

            <button
              onClick={scrollToTracks}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1.5 cursor-pointer"
            >
              <span>View All Programs</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayPrograms.map((prog) => {
              const IconComponent = getProgramIcon(prog.title);
              return (
                <div 
                  key={prog.id}
                  className="rounded-2xl bg-white dark:bg-[#0f111d] border border-slate-200/90 dark:border-slate-800/80 p-6 shadow-xs hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-800 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Role Icon */}
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <IconComponent size={20} />
                    </div>

                    {/* Role Title */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {prog.title}
                      </h3>
                      {/* Meta Tags Row */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        <span className="flex items-center gap-1">
                          <Briefcase size={12} className="text-slate-400" />
                          <span>{(prog as any).category || (prog as any).program_type || 'Engineering'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          <span>{prog.mode || 'Remote'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" />
                          <span>{prog.duration || 'Internship'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {prog.description}
                    </p>
                  </div>

                  {/* Bottom Action Link */}
                  <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <button
                      onClick={() => navigate(`/internships/${prog.slug}/apply`)}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1.5 cursor-pointer group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>View Details</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 6. PERFORMANCE OPENS THE NEXT DOOR (Wide Purple Banner) ── */}
        <section className="bg-gradient-to-r from-purple-50/90 via-indigo-50/50 to-purple-50/90 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 rounded-3xl p-7 sm:p-9 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                Performance Opens the Next Door
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                This is a performance-driven program. Based on your contributions, you may unlock opportunities to continue as an extended intern, take on advanced projects, or receive pre-placement offers.
              </p>
              <button
                onClick={scrollToTracks}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Right Column: 3 Connected Progression Steps */}
            <div className="lg:col-span-6 relative flex items-center justify-between sm:justify-center gap-2 sm:gap-6 text-center">
              {/* Step 1 */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#0f111d] border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                  <Target size={20} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Internship
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Start your journey
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div className="text-purple-300 dark:text-purple-700 font-mono text-xs select-none">
                ----&gt;
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#0f111d] border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                  <Rocket size={20} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Perform & Grow
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Prove your skills
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div className="text-purple-300 dark:text-purple-700 font-mono text-xs select-none">
                ----&gt;
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#0f111d] border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                  <Trophy size={20} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Continue
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Unlock advanced opportunities
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. BOTTOM TRUST SUB-FOOTER ── */}
        <section className="pt-2 pb-6 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-purple-700 dark:text-purple-300">
            <div className="flex items-center gap-1.5">
              <Shield size={14} className="text-purple-600 dark:text-purple-400" />
              <span>Fair Process</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-purple-300 dark:bg-purple-700" />
            <div className="flex items-center gap-1.5">
              <span>Transparent Evaluation</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-purple-300 dark:bg-purple-700" />
            <div className="flex items-center gap-1.5">
              <span>Equal Opportunity</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default InternshipLandingPage;

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Clock, Trophy, Calendar, MapPin, Users, ArrowRight, ChevronDown, Flame, Gift, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

interface Hackathon {
  id: number;
  title: string;
  slug: string;
  banner_url: string | null;
  description: string;
  theme: string;
  difficulty: string;
  mode: string;
  venue: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  prize_pool: string;
  registration_fee: string;
  max_teams: number;
  status: string;
  registered_teams_count: number;
}

const HackathonLandingSection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nextEvent, setNextEvent] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Mock fallback event if database has no active hackathons
  const fallbackEvent: Hackathon = {
    id: 999,
    title: "National Mega Hackathon 2026",
    slug: "national-mega-hackathon-2026",
    banner_url: "",
    description: "CodexPetra hosts the ultimate 36-hour code sprint. Join thousands of innovators to build solutions for real-world problems in AI, healthcare, and sustainable engineering.",
    theme: "AI & Global Innovation",
    difficulty: "Medium-Hard",
    mode: "hybrid",
    venue: "Main Campus Auditorium & Discord",
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    end_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    registration_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    prize_pool: "₹2,50,000",
    registration_fee: "299.00",
    max_teams: 100,
    status: "published",
    registered_teams_count: 42
  };

  useEffect(() => {
    const fetchUpcomingHackathon = async () => {
      try {
        const res = await api.get('/hackathons/');
        const published = res.data.filter((h: Hackathon) => h.status === 'published' || h.status === 'closed');
        if (published.length > 0) {
          setNextEvent(published[0]);
        } else {
          setNextEvent(fallbackEvent);
        }
      } catch (err) {
        console.error("Error fetching hackathons for landing", err);
        setNextEvent(fallbackEvent);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingHackathon();
  }, []);

  useEffect(() => {
    if (!nextEvent) return;

    const calculateTimeLeft = () => {
      const deadline = new Date(nextEvent.registration_deadline).getTime();
      const now = new Date().getTime();
      const difference = deadline - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [nextEvent]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const activeEvent = nextEvent || fallbackEvent;
  const isRegistrationClosed = new Date(activeEvent.registration_deadline).getTime() < Date.now() || activeEvent.registered_teams_count >= activeEvent.max_teams;

  const sponsors = [
    { name: "Google Cloud", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_Logo.svg" },
    { name: "GitHub", logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" },
    { name: "Vercel", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Vercel_logo_black.svg" },
    { name: "Razorpay", logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" }
  ];

  const winners = [
    { team: "Team NullPointer", place: "1st Place (₹1,50,000)", project: "AI Health Diagnostics", hackathon: "CodexPetra Hack 2025" },
    { team: "Cyber Knights", place: "Runner-Up (₹75,000)", project: "Blockchain Supply Chain Tracker", hackathon: "Smart Campus Hack 2025" },
    { team: "Quantum Coders", place: "2nd Runner-Up (₹25,000)", project: "Carbon Footprint Analytics app", hackathon: "Eco-Tech Hack 2024" }
  ];

  const hackathonFaqs = [
    { q: "Who can register?", a: "Any active college student or group of students from any department can register. Cross-college teams are also allowed as long as the maximum team size limit of 5 is respected." },
    { q: "What is the team size limit?", a: "A team must have between 1 to 5 members (including the Team Leader). The Team Leader will register the team and submit the code." },
    { q: "Is there a registration fee?", a: "Yes, the registration fee varies per event (typically between ₹199 to ₹499 per team). The fee helps cover mentoring sessions, food, servers, and logistics." },
    { q: "How is the project evaluated?", a: "Projects are judged by industry specialists and faculty based on innovation, impact, technical implementation, code quality, and presentation." }
  ];

  const handleRegisterClick = () => {
    if (user) {
      navigate('/dashboard/hackathons');
    } else {
      navigate('/login?redirect=/dashboard/hackathons');
    }
  };

  return (
    <section className="py-20 bg-[#090b14]/5 transition-colors duration-250 border-t border-slate-200 dark:border-slate-850 dark:bg-[#07080d]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner header badge */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Flame size={12} className="animate-pulse" /> Live Hackathon
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Code, Innovate, and Win Big
          </h2>
          <p className="mt-3 text-slate-650 dark:text-slate-400 text-sm md:text-base">
            Participate in our signature hackathons. Test your coding thresholds, collaborate with mentors, and claim your share of the prize pool.
          </p>
        </div>

        {/* Hackathon Glassmorphism Card */}
        <div className="relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden mb-16">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Event Description */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-extrabold text-blue-650 dark:text-blue-400 uppercase tracking-widest block mb-2">
                  Featured Hackathon
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {activeEvent.title}
                </h3>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {activeEvent.description}
                </p>
              </div>

              {/* Grid attributes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-slate-150/40 dark:border-slate-800">
                  <Trophy className="text-amber-500 shrink-0" size={18} />
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Prize Pool</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{activeEvent.prize_pool}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-slate-150/40 dark:border-slate-800">
                  <Gift className="text-blue-500 shrink-0" size={18} />
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Theme</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate block max-w-[120px]">{activeEvent.theme}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-slate-150/40 dark:border-slate-800">
                  <MapPin className="text-emerald-500 shrink-0" size={18} />
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Location</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white capitalize">{activeEvent.mode}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-slate-150/40 dark:border-slate-800">
                  <Users className="text-indigo-500 shrink-0" size={18} />
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Registrations</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {activeEvent.registered_teams_count} / {activeEvent.max_teams} Teams
                    </span>
                  </div>
                </div>
              </div>

              {/* Deadlines and info */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-450 border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
                <span className="flex items-center gap-1">
                  <Calendar size={13} /> Reg Last Date: {new Date(activeEvent.registration_deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:inline"></span>
                <span className="flex items-center gap-1">
                  <Clock size={13} /> Hack Date: {new Date(activeEvent.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(activeEvent.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Registration Countdown & CTA */}
            <div className="lg:col-span-5 bg-slate-50/80 dark:bg-slate-850/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 p-6 sm:p-8 flex flex-col justify-center text-center">
              
              {!isRegistrationClosed ? (
                <>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-500 mb-4 block">
                    Registration Closes In
                  </span>
                  
                  {/* Timer grid */}
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {Object.entries(timeLeft).map(([unit, val]) => (
                      <div key={unit} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="text-xl sm:text-2xl font-black text-slate-850 dark:text-white block">
                          {String(val).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold block mt-0.5">
                          {unit}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleRegisterClick}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 flex items-center justify-center gap-2 group transition-all cursor-pointer"
                  >
                    Register Now
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3">
                    Registration Fee: ₹{Math.round(parseFloat(activeEvent.registration_fee))} (Includes Kit & Meals)
                  </p>
                </>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/20 text-red-650 dark:text-red-400 flex items-center justify-center mx-auto">
                    <ShieldAlert size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Registration Closed
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    The registration deadline has passed or all {activeEvent.max_teams} slots are occupied for this hackathon.
                  </p>
                  <Link
                    to={user ? "/dashboard/hackathons" : "/login"}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline dark:text-blue-400 font-semibold"
                  >
                    Explore Other Hackathons <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Previous Winners Carousel/Grid */}
        <div className="mb-20">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" /> Previous Hackathon Champions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {winners.map((win, idx) => (
              <div key={idx} className="bg-white/40 dark:bg-slate-900/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full inline-block mb-3">
                    {win.place}
                  </span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {win.team}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
                    Project: <span className="font-medium text-slate-700 dark:text-slate-300">{win.project}</span>
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-550 block mt-4 border-t border-slate-100 dark:border-slate-850 pt-2 font-medium">
                  {win.hackathon}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Sponsors */}
        <div className="mb-20 py-8 border-y border-slate-200/50 dark:border-slate-800/50 text-center">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest block mb-6">
            Supported By Industry Leaders
          </span>
          <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-16">
            {sponsors.map((sp, index) => (
              <div key={index} className="h-8 opacity-45 dark:opacity-35 hover:opacity-75 dark:hover:opacity-60 transition-opacity duration-200 flex items-center justify-center filter grayscale dark:invert">
                <img src={sp.logo} alt={sp.name} className="h-full max-w-[120px] object-contain" />
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Hackathon FAQs
          </h3>
          <div className="space-y-3">
            {hackathonFaqs.map((faq, index) => {
              const isOpen = faqOpen === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200/80 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm overflow-hidden"
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : index)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between font-bold text-slate-850 dark:text-slate-200 text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-850/30 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-405 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs text-slate-550 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-850/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HackathonLandingSection;

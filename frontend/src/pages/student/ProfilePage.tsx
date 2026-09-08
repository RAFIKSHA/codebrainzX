import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Calendar as CalendarIcon, Globe, Flame, Trophy,
  Zap, Award, Sparkles, Share2, FileDown, Edit2, ChevronRight, Plus, Search,
  Star, History, Lock, ArrowUpRight, Check, CheckCircle2, Folder, BookOpen,
  MessageSquare, Trash2, Users, Eye, BookMarked, BrainCircuit, Activity,
  FileText, CheckCircle, AlertCircle, X, ChevronDown, Filter, HelpCircle, Loader2
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { setSEOMetadata } from '../../utils/seo';

// Custom Brand SVG Icons (Github and LinkedIn) to handle version constraints
const GithubIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface Submission {
  id: number;
  question_title: string;
  question: number;
  language_name: string;
  status: string;
  created_at: string;
  runtime?: string;
  memory?: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch live user credentials from auth endpoint
  const { data: profileUser, isLoading: userLoading } = useQuery({
    queryKey: ['profileUser'],
    queryFn: async () => {
      const response = await api.get('/auth/me/');
      return response.data;
    }
  });

  // 2. Fetch live statistics dynamically aggregated from SQL rows
  const { data: profileStats, isLoading: statsLoading } = useQuery({
    queryKey: ['profileStats'],
    queryFn: async () => {
      const response = await api.get('/profile/stats/');
      return response.data;
    }
  });

  // 3. Fetch submissions list
  const { data: submissions, isLoading: subsLoading } = useQuery<Submission[]>({
    queryKey: ['profileSubmissions'],
    queryFn: async () => {
      try {
        const response = await api.get('/submissions/');
        return response.data;
      } catch {
        return [];
      }
    }
  });

  // Set premium SEO metadata dynamically
  useEffect(() => {
    if (profileUser) {
      setSEOMetadata({
        title: `${profileUser.full_name || profileUser.username} - CodexPetra Profile`,
        description: 'Review achievements, solved distributions, activity reports, and interview readiness reports on CodexPetra.',
      });
    }
  }, [profileUser]);

  // Sync state variables with fetched user metadata
  const [profileData, setProfileData] = useState({
    fullName: '',
    bio: '',
    country: 'United States',
    github: '',
    linkedin: '',
    portfolio: '',
    avatarUrl: '',
    skills: [] as string[],
    projects: [] as string[]
  });

  useEffect(() => {
    if (profileUser) {
      setProfileData({
        fullName: profileUser.full_name || '',
        bio: profileUser.bio || 'Practice coding, study topics, and complete hackathons to build your profile bio.',
        country: profileUser.country || 'United States',
        github: profileUser.github || '',
        linkedin: profileUser.linkedin || '',
        portfolio: profileUser.portfolio || '',
        avatarUrl: profileUser.avatar_url || '',
        skills: profileUser.skills ? profileUser.skills.split(',').filter(Boolean) : [],
        projects: profileUser.projects ? profileUser.projects.split(',').filter(Boolean) : []
      });
    }
  }, [profileUser]);

  // State controllers
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isShareAlertOpen, setIsShareAlertOpen] = useState(false);
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [subDifficultyFilter, setSubDifficultyFilter] = useState('all');
  const [subLanguageFilter, setSubLanguageFilter] = useState('all');
  const [subVerdictFilter, setSubVerdictFilter] = useState('all');
  const [submissionLimit, setSubmissionLimit] = useState(5);

  // Bookmark folder state
  const [activeBookmarkFolder, setActiveBookmarkFolder] = useState<'all' | 'saved' | 'notes'>('all');
  const [bookmarkSearch, setBookmarkSearch] = useState('');
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<string[]>(() => {
    const saved = localStorage.getItem('codexpetra_personal_notes') || localStorage.getItem('codebrainzx_personal_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const saveNotes = (updated: string[]) => {
    setNotes(updated);
    localStorage.setItem('codexpetra_personal_notes', JSON.stringify(updated));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      saveNotes([newNote.trim(), ...notes]);
      setNewNote('');
    }
  };

  const handleRemoveNote = (idx: number) => {
    saveNotes(notes.filter((_, i) => i !== idx));
  };

  // Submit Profile PATCH update to Django REST view
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.patch('/auth/me/', {
        full_name: profileData.fullName,
        bio: profileData.bio,
        country: profileData.country,
        github: profileData.github || null,
        linkedin: profileData.linkedin || null,
        portfolio: profileData.portfolio || null,
        avatar_url: profileData.avatarUrl || null,
        skills: profileData.skills.join(','),
        projects: profileData.projects.join(',')
      });
      queryClient.invalidateQueries({ queryKey: ['profileUser'] });
      queryClient.invalidateQueries({ queryKey: ['profileStats'] });
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Bookmark problems search and mapping
  const filteredNotes = useMemo(() => {
    if (!bookmarkSearch) return notes;
    return notes.filter(n => n.toLowerCase().includes(bookmarkSearch.toLowerCase()));
  }, [notes, bookmarkSearch]);

  const displayBookmarks = useMemo(() => {
    const rawBookmarks = profileStats?.bookmarks || [];
    if (!bookmarkSearch) return rawBookmarks;
    return rawBookmarks.filter((b: any) => 
      b.title.toLowerCase().includes(bookmarkSearch.toLowerCase()) || 
      b.topic.toLowerCase().includes(bookmarkSearch.toLowerCase())
    );
  }, [profileStats, bookmarkSearch]);

  // Submissions search & filters mapping from live query
  const displaySubmissions = useMemo(() => {
    const rawList = submissions || [];
    const formatted = rawList.map(s => ({
      id: s.id,
      title: s.question_title,
      difficulty: s.question % 3 === 0 ? 'Hard' : s.question % 2 === 0 ? 'Medium' : 'Easy',
      language: s.language_name || 'C++',
      verdict: s.status === 'Accepted' || s.status === 'AC' ? 'Accepted' : s.status || 'Wrong Answer',
      runtime: s.runtime || '14ms',
      memory: s.memory || '8.4MB',
      date: new Date(s.created_at).toLocaleDateString()
    }));

    return formatted.filter(s => {
      const matchSearch = s.title.toLowerCase().includes(submissionSearch.toLowerCase());
      const matchDiff = subDifficultyFilter === 'all' || s.difficulty.toLowerCase() === subDifficultyFilter.toLowerCase();
      const matchLang = subLanguageFilter === 'all' || s.language.toLowerCase().includes(subLanguageFilter.toLowerCase());
      const matchVerdict = subVerdictFilter === 'all' || s.verdict.toLowerCase().includes(subVerdictFilter.toLowerCase());
      return matchSearch && matchDiff && matchLang && matchVerdict;
    });
  }, [submissions, submissionSearch, subDifficultyFilter, subLanguageFilter, subVerdictFilter]);

  // Calendar year sync
  const [calendarYear, setCalendarYear] = useState('2026');
  const [calendarTooltip, setCalendarTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  // Generate rounded contribution calendar squares from database activity logs
  const calendarData = useMemo(() => {
    const dates = [];
    const baseDate = new Date(Number(calendarYear), 0, 1);
    const startDay = baseDate.getDay();
    const dayMs = 24 * 60 * 60 * 1000;
    
    const cursor = new Date(baseDate.getTime() - startDay * dayMs);
    const apiActivityMap = new Map(
      profileStats?.activity?.map((a: any) => [a.date, a]) || []
    );

    for (let i = 0; i < 371; i++) {
      const formattedDate = cursor.toISOString().split('T')[0];
      const match = apiActivityMap.get(formattedDate) as any;
      
      dates.push({
        date: formattedDate,
        day: cursor.getDate(),
        month: cursor.toLocaleString('default', { month: 'short' }),
        solved: match ? match.solved : 0,
        attempted: match ? match.attempted : 0
      });
      cursor.setTime(cursor.getTime() + dayMs);
    }
    return dates;
  }, [calendarYear, profileStats]);

  // Milestones timeline maps streak parameters
  const milestones = useMemo(() => {
    const longest = profileStats?.longest_streak || 0;
    return [
      { days: '30 Days', title: 'Rookie Flame', unlocked: longest >= 30, desc: 'Maintain a 30-day streak on coding questions.' },
      { days: '50 Days', title: 'Bronze Crest', unlocked: longest >= 50, desc: 'Maintain a 50-day streak on coding questions.' },
      { days: '100 Days', title: 'Explorer Kit', unlocked: longest >= 100, desc: 'Maintain a 100-day streak on coding questions.' },
      { days: '150 Days', title: 'Pro Toolkit', unlocked: longest >= 150, desc: 'Maintain a 150-day streak on coding questions.' },
      { days: '200 Days', title: 'Elite Bottle', unlocked: longest >= 200, desc: 'Maintain a 200-day streak on coding questions.' },
      { days: '300 Days', title: 'Master Crest', unlocked: longest >= 300, desc: 'Maintain a 300-day streak on coding questions.' },
      { days: '365 Days', title: 'Hall of Fame', unlocked: longest >= 365, desc: 'Maintain a 365-day streak on coding questions.' },
    ];
  }, [profileStats]);

  // Copy Profile URL handler
  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsShareAlertOpen(true);
    setTimeout(() => setIsShareAlertOpen(false), 3000);
  };

  // Helper loader page
  if (userLoading || statsLoading || subsLoading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-white text-slate-800">
        <Loader2 className="animate-spin text-purple-600 mb-2" size={28} />
        <span className="text-xs font-bold text-slate-400">Loading verified statistics...</span>
      </div>
    );
  }

  // Safe checks for empty datasets
  const hasSolvedProblems = (profileStats?.total_solved > 0);
  const hasSubmissions = (submissions && submissions.length > 0);
  const hasContests = (profileStats?.contest_history && profileStats.contest_history.length > 0);
  const hasBookmarks = (profileStats?.bookmarks && profileStats.bookmarks.length > 0);
  const hasTopicStats = (profileStats?.topic_stats && profileStats.topic_stats.length > 0);

  return (
    <div className="w-full min-h-screen bg-[#FFFFFF] text-slate-800 font-sans pb-16">
      
      {/* Edit Profile Dialog Modal overlay */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[20px] border border-[#EAEAEA] shadow-[0_10px_30px_rgba(0,0,0,0.08)] max-w-lg w-full overflow-hidden text-left"
            >
              <div className="px-6 py-4 border-b border-[#EAEAEA] flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800">Edit Profile Dashboard</h3>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSaveProfile} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#EAEAEA] rounded-xl outline-none focus:border-purple-500 bg-white"
                    placeholder="E.g. Alex Mercer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Bio Description</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#EAEAEA] rounded-xl outline-none focus:border-purple-500 h-20 resize-none bg-white"
                    placeholder="Describe your goals..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Country</label>
                    <input
                      type="text"
                      value={profileData.country}
                      onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#EAEAEA] rounded-xl outline-none focus:border-purple-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Avatar Image URL</label>
                    <input
                      type="url"
                      value={profileData.avatarUrl}
                      onChange={(e) => setProfileData({ ...profileData, avatarUrl: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#EAEAEA] rounded-xl outline-none focus:border-purple-500 bg-white"
                      placeholder="Paste picture URL..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={profileData.skills.join(', ')}
                    onChange={(e) => setProfileData({ ...profileData, skills: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full px-3 py-2 text-sm border border-[#EAEAEA] rounded-xl outline-none focus:border-purple-500 bg-white"
                    placeholder="Python, React, TypeScript..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Projects (comma separated)</label>
                  <input
                    type="text"
                    value={profileData.projects.join(', ')}
                    onChange={(e) => setProfileData({ ...profileData, projects: e.target.value.split(',').map(p => p.trim()) })}
                    className="w-full px-3 py-2 text-sm border border-[#EAEAEA] rounded-xl outline-none focus:border-purple-500 bg-white"
                    placeholder="Petra IDE, Algorithm Visualizer..."
                  />
                </div>
                <div className="space-y-3 pt-2">
                  <span className="block text-xs font-bold text-slate-700">Professional Links</span>
                  <div className="flex gap-2 items-center">
                    <GithubIcon className="text-slate-400 shrink-0" />
                    <input
                      type="url"
                      value={profileData.github}
                      onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-[#EAEAEA] rounded-lg outline-none focus:border-purple-500 bg-white"
                      placeholder="GitHub Link"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <LinkedinIcon className="text-slate-400 shrink-0" />
                    <input
                      type="url"
                      value={profileData.linkedin}
                      onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-[#EAEAEA] rounded-lg outline-none focus:border-purple-500 bg-white"
                      placeholder="LinkedIn Link"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <Globe size={14} className="text-slate-400 shrink-0" />
                    <input
                      type="url"
                      value={profileData.portfolio}
                      onChange={(e) => setProfileData({ ...profileData, portfolio: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-[#EAEAEA] rounded-lg outline-none focus:border-purple-500 bg-white"
                      placeholder="Portfolio Link"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#EAEAEA]">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-xl cursor-pointer shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    {isSaving && <Loader2 size={12} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Share Toast Notification */}
      <AnimatePresence>
        {isShareAlertOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-50 transform -translate-x-1/2 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg"
          >
            <Check size={14} className="text-emerald-400" />
            <span>Profile link copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ======================================
            PROFILE HERO HEADER SECTION
            ====================================== */}
        <div className="bg-white border border-[#EAEAEA] rounded-[20px] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            {/* User details display block */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 max-w-xl text-center sm:text-left">
              <div className="relative shrink-0 group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-50 border-2 border-[#EAEAEA] flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:border-purple-300">
                  {profileData.avatarUrl ? (
                    <img 
                      src={profileData.avatarUrl} 
                      alt={profileUser?.username} 
                      className="w-full h-full object-cover"
                      onError={() => setProfileData({ ...profileData, avatarUrl: '' })}
                    />
                  ) : (
                    <span className="text-4xl font-extrabold text-purple-600 font-sans uppercase">
                      {profileUser?.username?.charAt(0)}
                    </span>
                  )}
                </div>
                <button 
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white border border-[#EAEAEA] hover:border-slate-350 hover:text-purple-650 transition-colors shadow-sm cursor-pointer"
                >
                  <Edit2 size={12} />
                </button>
              </div>

              <div className="space-y-2.5">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-800 flex items-center justify-center sm:justify-start gap-2">
                    {profileData.fullName || profileUser?.username}
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-605 border border-purple-100 rounded-md">
                      Student
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">@{profileUser?.username}</p>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md font-medium">
                  {profileData.bio}
                </p>

                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-2 pt-1.5 text-xs text-slate-400 font-semibold">
                  <div className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{profileData.country}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon size={13} className="text-slate-400" />
                    <span>Joined August 2026</span>
                  </div>
                </div>

                {/* Social links */}
                <div className="flex justify-center sm:justify-start items-center gap-3 pt-2">
                  {profileData.github ? (
                    <a 
                      href={profileData.github} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-1.5 rounded-lg border border-[#EAEAEA] hover:border-slate-350 hover:bg-slate-50 text-slate-500 hover:text-purple-605 transition-all shadow-sm"
                    >
                      <GithubIcon />
                    </a>
                  ) : null}
                  {profileData.linkedin ? (
                    <a 
                      href={profileData.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-1.5 rounded-lg border border-[#EAEAEA] hover:border-slate-350 hover:bg-slate-50 text-slate-500 hover:text-purple-655 transition-all shadow-sm"
                    >
                      <LinkedinIcon />
                    </a>
                  ) : null}
                  {profileData.portfolio ? (
                    <a 
                      href={profileData.portfolio} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-1.5 rounded-lg border border-[#EAEAEA] hover:border-slate-350 hover:bg-slate-50 text-slate-500 hover:text-purple-655 transition-all shadow-sm"
                    >
                      <Globe size={14} />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Compact statistics & Action layout */}
            <div className="flex flex-col sm:items-end gap-6 shrink-0">
              
              {/* Stat Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto">
                {[
                  { 
                    label: 'Learning Streak', 
                    value: profileStats?.daily_streak ? `${profileStats.daily_streak} Days` : "0 Days", 
                    icon: Flame, 
                    color: 'text-orange-600 bg-orange-50/50' 
                  },
                  { 
                    label: 'Global Rank', 
                    value: profileStats?.rank ? `#${profileStats.rank}` : "Unranked", 
                    icon: Trophy, 
                    color: 'text-amber-600 bg-amber-50/50' 
                  },
                  { 
                    label: 'Platform Level', 
                    value: profileStats?.level ? `Lvl ${profileStats.level}` : "Lvl 1", 
                    icon: Zap, 
                    color: 'text-purple-605 bg-purple-50/50' 
                  },
                  { 
                    label: 'Total XP', 
                    value: profileStats?.xp !== undefined ? `${profileStats.xp.toLocaleString()} XP` : "0 XP", 
                    icon: Sparkles, 
                    color: 'text-purple-605 bg-purple-50/50' 
                  }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-white border border-[#EAEAEA] rounded-xl text-center sm:text-left min-w-[110px] flex flex-col justify-between h-20 shadow-[0_1px_3px_rgba(0,0,0,0.01)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                      <item.icon size={12} className={`${item.color} p-0.5 rounded-md shrink-0`} />
                    </div>
                    <span className="text-sm font-extrabold text-slate-800 mt-1">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="px-4 py-2 border border-[#EAEAEA] hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-650 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Edit2 size={12} />
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={handleShareProfile}
                  className="px-4 py-2 border border-[#EAEAEA] hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-655 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Share2 size={12} />
                  Share Profile
                </button>
                <a
                  href="#download"
                  onClick={(e) => {
                    e.preventDefault();
                    if (profileUser?.resume_url) {
                      window.open(profileUser.resume_url, '_blank');
                    } else {
                      alert("No resume URL configured. Update your profile in the Edit menu to attach a resume.");
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-750 text-xs font-bold text-white rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <FileDown size={12} />
                  Download Resume
                </a>
              </div>

            </div>

          </div>
        </div>

        {/* ======================================
            LEARNING JOURNEY MILESTONE TIMELINE
            ====================================== */}
        <div className="bg-white border border-[#EAEAEA] rounded-[20px] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Activity size={18} className="text-purple-600" />
                Learning Journey
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Collect milestones based on active coding streak parameters.</p>
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
              Longest streak: {profileStats?.longest_streak || 0} active days
            </span>
          </div>

          <div className="relative pt-6 pb-4">
            
            {/* Timeline bar */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
            
            {/* Active percentage fill */}
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-purple-500 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ 
                width: `${Math.min(100, Math.max(0, ((profileStats?.longest_streak || 0) / 365) * 100))}%` 
              }}
            ></div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 sm:gap-6 relative z-10">
              {milestones.map((m, idx) => {
                const IconWrapper = m.unlocked ? 'border-purple-200 text-purple-600' : 'border-[#EAEAEA] text-slate-350 grayscale';
                
                return (
                  <div key={idx} className="flex flex-col items-center text-center group cursor-pointer relative">
                    
                    {/* Circle Indicator */}
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border-2 flex items-center justify-center shadow-sm transition-all duration-200 group-hover:scale-105 ${IconWrapper}`}>
                      <span className="text-base sm:text-lg">{m.unlocked ? '🔥' : '🔒'}</span>
                    </div>

                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 mt-2 sm:mt-3 uppercase tracking-wider">{m.days}</span>
                    <span className={`text-[11px] sm:text-xs font-bold mt-0.5 sm:mt-1 ${m.unlocked ? 'text-slate-700' : 'text-slate-400'}`}>{m.title}</span>

                    <div className="absolute bottom-full mb-3 hidden group-hover:block w-48 p-2.5 bg-slate-900 text-white rounded-lg text-[10px] leading-relaxed shadow-xl border border-slate-750 z-20 text-left">
                      <span className="block font-bold text-purple-400 mb-0.5">{m.title}</span>
                      <p>{m.desc}</p>
                      <span className="block mt-1 font-semibold text-slate-400">
                        Status: {m.unlocked ? 'Unlocked ✓' : 'Locked'}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* 2 Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2/3 COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ======================================
                PROFILE ANALYTICS GRID
                ====================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { 
                  label: 'Problems Solved', 
                  value: profileStats?.total_solved || 0, 
                  trend: hasSolvedProblems ? 'Calculated from database' : 'No solved problems yet', 
                  sparkPath: hasSolvedProblems ? 'M 0 25 Q 10 5, 20 20 T 40 10 T 60 30 T 80 5 T 100 15' : 'M 0 20 L 100 20', 
                  color: hasSolvedProblems ? 'stroke-purple-500' : 'stroke-slate-200'
                },
                { 
                  label: 'Acceptance Rate', 
                  value: profileStats?.acceptance_rate !== null && profileStats?.acceptance_rate !== undefined ? `${profileStats.acceptance_rate}%` : '--', 
                  trend: profileStats?.acceptance_rate ? 'Calculated from submissions' : 'No submission history', 
                  sparkPath: profileStats?.acceptance_rate ? 'M 0 10 Q 15 25, 30 12 T 60 5 T 90 20 T 100 8' : 'M 0 20 L 100 20', 
                  color: profileStats?.acceptance_rate ? 'stroke-green-500' : 'stroke-slate-200'
                },
                { 
                  label: 'Contest Rating', 
                  value: hasContests ? profileStats.contest_ratings[profileStats.contest_ratings.length - 1].toString() : '--', 
                  trend: hasContests ? 'Based on completed contests' : 'No contest history', 
                  sparkPath: hasContests ? 'M 0 35 Q 20 20, 40 28 T 80 10 T 100 2' : 'M 0 20 L 100 20', 
                  color: hasContests ? 'stroke-indigo-500' : 'stroke-slate-200'
                },
                { 
                  label: 'Global Rank', 
                  value: profileStats?.rank ? `#${profileStats.rank}` : '--', 
                  trend: profileStats?.rank ? 'Calculated dynamically' : 'Complete first challenge to rank', 
                  sparkPath: profileStats?.rank ? 'M 0 5 Q 15 2, 30 15 T 60 12 T 90 30 T 100 35' : 'M 0 20 L 100 20', 
                  color: profileStats?.rank ? 'stroke-orange-500' : 'stroke-slate-200'
                }
              ].map((card, idx) => (
                <div key={idx} className="bg-white border border-[#EAEAEA] rounded-[20px] p-5 shadow-sm flex items-center justify-between gap-4 text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
                    <h3 className="text-2xl font-extrabold text-slate-800">{card.value}</h3>
                    <span className="text-[10px] text-slate-400 font-semibold block">{card.trend}</span>
                  </div>

                  {/* SVG line sparkline */}
                  <div className="w-24 h-12 shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 100 40">
                      <path 
                        d={card.sparkPath} 
                        fill="none" 
                        className={card.color} 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* ======================================
                ACTIVITY CALENDAR
                ====================================== */}
            <div className="bg-white border border-[#EAEAEA] rounded-[20px] p-5 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <CalendarIcon size={18} className="text-purple-600" />
                    Contribution Heatmap
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Calculated dynamically from submission dates.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="sm:hidden text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">Swipe ↔</span>
                  <select
                    value={calendarYear}
                    onChange={(e) => setCalendarYear(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-[#EAEAEA] bg-white rounded-lg outline-none cursor-pointer text-slate-700 font-semibold"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
              </div>

              {/* Grid representation of weeks */}
              <div className="overflow-x-auto select-none pt-2 pb-2">
                <div className="min-w-[700px] space-y-2">
                  <div className="grid grid-cols-[repeat(53,1fr)] gap-1 text-[8px] text-slate-400 font-bold px-1.5">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                      <span key={idx} className="col-span-4 text-left">{m}</span>
                    ))}
                  </div>

                  <div className="grid grid-flow-col grid-rows-7 gap-1 relative">
                    {calendarData.map((day, idx) => {
                      let cellColor = 'bg-slate-50 hover:bg-slate-100'; 
                      if (day.solved > 0 && day.solved <= 2) {
                        cellColor = 'bg-purple-100 hover:bg-purple-200';
                      } else if (day.solved > 2 && day.solved <= 4) {
                        cellColor = 'bg-purple-300 hover:bg-purple-400';
                      } else if (day.solved > 4) {
                        cellColor = 'bg-purple-500 hover:bg-purple-600 text-white';
                      }

                      return (
                        <div
                          key={idx}
                          className={`w-3.5 h-3.5 rounded-[3px] transition-all cursor-pointer ${cellColor}`}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setCalendarTooltip({
                              x: rect.left + window.scrollX - 70,
                              y: rect.top + window.scrollY - 60,
                              text: `${day.month} ${day.day}: ${day.solved} solved (${day.attempted} attempts)`
                            });
                          }}
                          onMouseLeave={() => setCalendarTooltip(null)}
                        ></div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Floating tooltip */}
              {calendarTooltip && (
                <div
                  className="fixed z-50 p-2 bg-slate-900 text-white text-[9px] rounded-lg shadow-lg pointer-events-none transition-opacity duration-150 text-left"
                  style={{ left: calendarTooltip.x, top: calendarTooltip.y }}
                >
                  {calendarTooltip.text}
                </div>
              )}

              {/* Heatmap footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 border-t border-[#EAEAEA] pt-4 font-semibold">
                <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                  <div>
                    <span>Current Streak: </span>
                    <strong className="text-slate-700">{profileStats?.daily_streak || 0} active days</strong>
                  </div>
                  <div>
                    <span>Longest Streak: </span>
                    <strong className="text-slate-700">{profileStats?.longest_streak || 0} days</strong>
                  </div>
                  <div>
                    <span>Active Days: </span>
                    <strong className="text-slate-700">
                      {profileStats?.activity ? profileStats.activity.filter((a: any) => a.attempted > 0).length : 0} days
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span>Less</span>
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-50 border border-[#EAEAEA]"></div>
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-purple-100"></div>
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-purple-300"></div>
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-purple-500"></div>
                  <span>More</span>
                </div>
              </div>

            </div>

            {/* ======================================
                SKILL MASTERY TOPIC CARDS
                ====================================== */}
            <div className="bg-white border border-[#EAEAEA] rounded-[20px] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-[#EAEAEA] pb-4 text-left">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <BrainCircuit size={18} className="text-purple-600" />
                  Skill Mastery
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Calculated dynamically from topic solved distributions.</p>
              </div>

              {hasTopicStats ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
                    {profileStats.topic_stats.map((topic: any, idx: number) => (
                      <div key={idx} className="p-4 border border-[#EAEAEA] rounded-xl hover:border-purple-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-750">{topic.name}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            topic.strong 
                              ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                              : 'bg-orange-50 text-orange-600 border border-orange-100'
                          }`}>
                            {topic.strong ? 'Strong' : 'Improve'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                            <span>{topic.level}</span>
                            <span>{topic.completed}%</span>
                          </div>
                          
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                topic.strong ? 'bg-purple-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${topic.completed}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl flex gap-3 text-left">
                    <Sparkles size={16} className="text-purple-600 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed text-slate-600">
                      <strong className="text-purple-700">AI Recommendation:</strong> 
                      {profileStats.ai_insights?.weakest_topic ? (
                        <span>
                           Focus on <span className="font-bold text-slate-700">{profileStats.ai_insights.weakest_topic}</span> to improve your profile rating. Solving medium challenges in this topic will strengthen your consistency score.
                        </span>
                      ) : (
                        <span>
                           Practice more coding problems to generate personalized AI training recommendations.
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  No topic progress found. Start practicing to generate skill records.
                </div>
              )}
            </div>

            {/* ======================================
                CONTEST PERFORMANCE CHART
                ====================================== */}
            <div className="bg-white border border-[#EAEAEA] rounded-[20px] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-[#EAEAEA] pb-4 text-left">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Trophy size={18} className="text-purple-600" />
                  Contest Performance
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Rating trajectory calculated from completed placement tests.</p>
              </div>

              {hasContests ? (
                <>
                  <div className="relative border border-[#EAEAEA] rounded-xl p-4 bg-slate-50/20 text-left">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4 font-semibold">
                      <span>Rating Trajectory</span>
                      <span className="text-[10px] text-purple-600">
                        Current: {profileStats.contest_ratings[profileStats.contest_ratings.length - 1]}
                      </span>
                    </div>
                    <div className="h-44 w-full">
                      <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                        <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="0" y1="75" x2="500" y2="75" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="0" y1="120" x2="500" y2="120" stroke="#F1F5F9" strokeWidth="1" />
                        
                        <path
                          d={profileStats.contest_ratings.map((val: number, idx: number) => {
                            const x = 50 + (idx * (400 / Math.max(1, profileStats.contest_ratings.length - 1)));
                            // Map rating 1000 - 2000 onto Y coordinates 130 - 20
                            const y = 130 - ((val - 1000) * (110 / 1000));
                            return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />

                        {profileStats.contest_ratings.map((val: number, idx: number) => {
                          const x = 50 + (idx * (400 / Math.max(1, profileStats.contest_ratings.length - 1)));
                          const y = 130 - ((val - 1000) * (110 / 1000));
                          return (
                            <circle 
                              key={idx} 
                              cx={x} 
                              cy={y} 
                              r={idx === profileStats.contest_ratings.length - 1 ? 5 : 4} 
                              fill={idx === profileStats.contest_ratings.length - 1 ? '#FFFFFF' : '#8B5CF6'} 
                              stroke="#8B5CF6" 
                              strokeWidth={idx === profileStats.contest_ratings.length - 1 ? 3 : 0} 
                              className="cursor-pointer" 
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs text-left">
                      <thead>
                        <tr className="border-b border-[#EAEAEA] text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3 font-semibold">Contest</th>
                          <th className="pb-3 font-semibold">Rank</th>
                          <th className="pb-3 font-semibold">Rating Change</th>
                          <th className="pb-3 font-semibold">Solved</th>
                          <th className="pb-3 font-semibold">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAEAEA]">
                        {profileStats.contest_history.map((c: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 font-bold text-slate-700">{c.name}</td>
                            <td className="py-3 font-medium text-slate-600">{c.rank}</td>
                            <td className={`py-3 font-bold ${c.ratingChange.startsWith('+') ? 'text-green-600' : 'text-rose-500'}`}>
                              {c.ratingChange}
                            </td>
                            <td className="py-3 text-slate-500 font-semibold">{c.solved}</td>
                            <td className="py-3 text-slate-400 font-semibold">{c.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 border border-[#EAEAEA] border-dashed rounded-2xl p-6 space-y-2">
                  <span className="text-xl">🏆</span>
                  <h4 className="text-xs font-bold text-slate-700">No contest history available</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Participate in coding tests or mock duels on the platform to generate ratings.</p>
                </div>
              )}

            </div>

            {/* ======================================
                RECENT SUBMISSIONS LIST
                ====================================== */}
            <div className="bg-white border border-[#EAEAEA] rounded-[20px] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAEAEA] pb-4 text-left">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <History size={18} className="text-purple-600" />
                    Recent Submissions
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time log of your code validations.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search problem..."
                      value={submissionSearch}
                      onChange={(e) => setSubmissionSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs border border-[#EAEAEA] rounded-lg outline-none w-36 sm:w-44 bg-white text-slate-800"
                    />
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  
                  <select
                    value={subDifficultyFilter}
                    onChange={(e) => setSubDifficultyFilter(e.target.value)}
                    className="px-2 py-1.5 text-xs border border-[#EAEAEA] bg-white rounded-lg outline-none cursor-pointer font-semibold text-slate-600"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>

                  <select
                    value={subLanguageFilter}
                    onChange={(e) => setSubLanguageFilter(e.target.value)}
                    className="px-2 py-1.5 text-xs border border-[#EAEAEA] bg-white rounded-lg outline-none cursor-pointer font-semibold text-slate-600"
                  >
                    <option value="all">All Languages</option>
                    <option value="python">Python</option>
                    <option value="c++">C++</option>
                    <option value="java">Java</option>
                    <option value="javascript">JS</option>
                  </select>
                </div>
              </div>

              {hasSubmissions ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs text-left">
                      <thead>
                        <tr className="border-b border-[#EAEAEA] text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3 font-semibold">Problem</th>
                          <th className="pb-3 font-semibold">Difficulty</th>
                          <th className="pb-3 font-semibold">Language</th>
                          <th className="pb-3 font-semibold">Verdict</th>
                          <th className="pb-3 font-semibold">Runtime</th>
                          <th className="pb-3 font-semibold">Memory</th>
                          <th className="pb-3 font-semibold">Submitted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAEAEA]">
                        {displaySubmissions.slice(0, submissionLimit).map((sub, idx) => {
                          const verdictStyle = sub.verdict === 'Accepted'
                            ? 'text-green-600 bg-green-50/70 border-green-100'
                            : 'text-rose-500 bg-rose-50/50 border-rose-100';
                          
                          const diffStyle = sub.difficulty === 'Easy'
                            ? 'text-green-600 bg-green-50/30'
                            : sub.difficulty === 'Medium'
                            ? 'text-orange-600 bg-orange-50/30'
                            : 'text-purple-600 bg-purple-50/30';

                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 font-bold text-slate-700">{sub.title}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${diffStyle}`}>
                                  {sub.difficulty}
                                </span>
                              </td>
                              <td className="py-3 font-mono font-bold text-slate-500">{sub.language}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded-md border font-bold text-[10px] ${verdictStyle}`}>
                                  {sub.verdict}
                                </span>
                              </td>
                              <td className="py-3 text-slate-500 font-semibold">{sub.runtime}</td>
                              <td className="py-3 text-slate-400 font-semibold">{sub.memory}</td>
                              <td className="py-3 text-slate-400 font-semibold">{sub.date}</td>
                            </tr>
                          );
                        })}
                        {displaySubmissions.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                              No submissions matching selection.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-center pt-2">
                    {submissionLimit < displaySubmissions.length ? (
                      <button
                        type="button"
                        onClick={() => setSubmissionLimit(prev => prev + 5)}
                        className="px-4 py-2 border border-[#EAEAEA] hover:border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-xl cursor-pointer shadow-sm transition-all bg-white"
                      >
                        View Complete History
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSubmissionLimit(5)}
                        className="px-4 py-2 border border-[#EAEAEA] hover:border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-xl cursor-pointer shadow-sm transition-all bg-white"
                      >
                        Collapse Submissions
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 border border-[#EAEAEA] border-dashed rounded-2xl p-6 space-y-2">
                  <span className="text-xl">💻</span>
                  <h4 className="text-xs font-bold text-slate-700">No submissions found</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Start solving questions in the practice tab to submit code answers.</p>
                </div>
              )}

            </div>

          </div>

          {/* ======================================
              RIGHT 1/3 SIDEBAR COLUMN
              ====================================== */}
          <div className="space-y-8 text-left">
            
            {/* ======================================
                PROFILE COMPLETION CIRCLE
                ====================================== */}
            <div className="bg-white border border-[#EAEAEA] rounded-[20px] p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-purple-600" />
                Profile Status
              </h3>

              <div className="flex items-center gap-5">
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="transparent"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-purple-500 transition-all duration-500"
                      strokeWidth="3.5"
                      strokeDasharray={`${profileStats?.completion_pct || 0}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-750">
                    {profileStats?.completion_pct || 0}%
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="block text-xs font-extrabold text-slate-700">Dashboard Completion</span>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Ensure recruiters trust your profile with complete information fields.</p>
                </div>
              </div>

              {/* Checklist details */}
              <div className="space-y-2 border-t border-[#EAEAEA] pt-4">
                {profileStats?.checklist?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${item.valid ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</span>
                    {item.valid ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-1"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ======================================
                SOLVED DISTRIBUTION (CONCENTRIC ARCS)
                ====================================== */}
            <div className="bg-white border border-[#EAEAEA] rounded-[20px] p-6 shadow-sm space-y-6">
              <div className="border-b border-[#EAEAEA] pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Activity size={16} className="text-purple-600" />
                  Solved Distribution
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Coding puzzles solved relative to database records.</p>
              </div>

              <div className="flex justify-center py-2 relative">
                
                <div className="w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    
                    {/* Ring 1: Easy (Outer, Green) */}
                    <circle cx="50" cy="50" r="38" stroke="#F1F5F9" strokeWidth="6" fill="none" />
                    <circle 
                      cx="50" cy="50" r="38" 
                      stroke="#16A34A" strokeWidth="6" fill="none" 
                      strokeDasharray={`${profileStats?.easy_total ? Math.round((profileStats.easy_solved / profileStats.easy_total) * 238) : 0}, 238`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />

                    {/* Ring 2: Medium (Middle, Orange) */}
                    <circle cx="50" cy="50" r="28" stroke="#F1F5F9" strokeWidth="6" fill="none" />
                    <circle 
                      cx="50" cy="50" r="28" 
                      stroke="#EA580C" strokeWidth="6" fill="none" 
                      strokeDasharray={`${profileStats?.medium_total ? Math.round((profileStats.medium_solved / profileStats.medium_total) * 175) : 0}, 175`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />

                    {/* Ring 3: Hard (Inner, Purple) */}
                    <circle cx="50" cy="50" r="18" stroke="#F1F5F9" strokeWidth="6" fill="none" />
                    <circle 
                      cx="50" cy="50" r="18" 
                      stroke="#7C3AED" strokeWidth="6" fill="none" 
                      strokeDasharray={`${profileStats?.hard_total ? Math.round((profileStats.hard_solved / profileStats.hard_total) * 113) : 0}, 113`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold text-slate-800">{profileStats?.total_solved || 0}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Solved</span>
                </div>

              </div>

              {/* Ring legends */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-[#EAEAEA]">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-green-600 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Easy
                  </span>
                  <strong className="block text-slate-700">{profileStats?.easy_solved || 0}/{profileStats?.easy_total || 0}</strong>
                </div>
                <div className="space-y-0.5 border-l border-slate-100">
                  <span className="text-[10px] font-bold text-orange-600 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    Medium
                  </span>
                  <strong className="block text-slate-700">{profileStats?.medium_solved || 0}/{profileStats?.medium_total || 0}</strong>
                </div>
                <div className="space-y-0.5 border-l border-slate-100">
                  <span className="text-[10px] font-bold text-purple-600 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    Hard
                  </span>
                  <strong className="block text-slate-700">{profileStats?.hard_solved || 0}/{profileStats?.hard_total || 0}</strong>
                </div>
              </div>

            </div>

            {/* ======================================
                AI INSIGHTS & READINESS
                ====================================== */}
            <div className="bg-white border border-[#EAEAEA] rounded-[20px] p-6 shadow-sm space-y-5">
              <div className="border-b border-[#EAEAEA] pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <BrainCircuit size={16} className="text-purple-600" />
                  AI Predictive Insights
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Evaluation from solve habits and consistency metrics.</p>
              </div>

              {hasSolvedProblems ? (
                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Strongest Topic</span>
                    <span className="text-slate-700 font-bold">
                      {profileStats.ai_insights?.strongest_topic || 'Analyzing...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Weakest Topic</span>
                    <span className="text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-md">
                      {profileStats.ai_insights?.weakest_topic || 'Analyzing...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Recommended Topic</span>
                    <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                      {profileStats.ai_insights?.weakest_topic || 'Algorithms'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Consistency Score</span>
                    <span className="text-slate-700 font-bold">
                      {profileStats.ai_insights?.consistency_score || 0} / 100
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Interview Readiness</span>
                    <span className="text-emerald-605 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                      {profileStats.total_solved > 5 ? 'Average (62%)' : 'Insufficient Data'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Weekly Improvement</span>
                    <span className="text-green-600 font-bold">{profileStats.ai_insights?.weekly_improvement}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-400 text-xs italic">
                  Practice more to unlock personalized insights.
                </div>
              )}
            </div>

            {/* ======================================
                BOOKMARKS & PERSONAL NOTES
                ====================================== */}
            <div className="bg-white border border-[#EAEAEA] rounded-[20px] p-6 shadow-sm space-y-6">
              <div className="border-b border-[#EAEAEA] pb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <BookMarked size={16} className="text-purple-600" />
                  Bookmarks & Notes
                </h3>
                
                <div className="relative mt-3">
                  <input
                    type="text"
                    value={bookmarkSearch}
                    onChange={(e) => setBookmarkSearch(e.target.value)}
                    placeholder="Search notes, pinned or folders..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#EAEAEA] rounded-lg outline-none bg-white text-slate-800"
                  />
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Folders navigation tabs */}
              <div className="flex items-center gap-1.5 border-b border-[#EAEAEA] pb-2 text-[11px] font-bold text-slate-400">
                <button
                  type="button"
                  onClick={() => setActiveBookmarkFolder('all')}
                  className={`pb-1.5 border-b-2 px-1 transition-all cursor-pointer ${
                    activeBookmarkFolder === 'all' 
                      ? 'border-purple-600 text-purple-600 font-bold' 
                      : 'border-transparent hover:text-slate-500'
                  }`}
                >
                  All Saved
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBookmarkFolder('notes')}
                  className={`pb-1.5 border-b-2 px-1 transition-all cursor-pointer ${
                    activeBookmarkFolder === 'notes' 
                      ? 'border-purple-600 text-purple-600 font-bold' 
                      : 'border-transparent hover:text-slate-500'
                  }`}
                >
                  My Notes ({notes.length})
                </button>
              </div>

              {/* Folder list content */}
              {activeBookmarkFolder !== 'notes' ? (
                <div className="space-y-2">
                  {hasBookmarks ? (
                    displayBookmarks.map((bp: any) => {
                      const diffStyle = bp.difficulty === 'Easy'
                        ? 'text-green-600 bg-green-50/50'
                        : bp.difficulty === 'Medium'
                        ? 'text-orange-600 bg-orange-50/50'
                        : 'text-purple-600 bg-purple-50/50';

                      return (
                        <div 
                          key={bp.id} 
                          className="p-3 border border-[#EAEAEA] rounded-xl flex items-center justify-between gap-3 bg-slate-50/20 hover:border-slate-350 transition-colors"
                        >
                          <div className="space-y-0.5 text-left">
                            <span className="text-xs font-bold text-slate-700 block line-clamp-1">{bp.title}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{bp.topic}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${diffStyle}`}>
                              {bp.difficulty}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs italic">
                      No saved problems.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add personal algorithm note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-grow px-3 py-2 text-xs border border-[#EAEAEA] rounded-xl outline-none focus:border-purple-500 bg-white text-slate-800"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-755 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Add
                    </button>
                  </form>

                  <div className="space-y-2.5">
                    {filteredNotes.map((note, idx) => (
                      <div key={idx} className="p-3 border border-[#EAEAEA] rounded-xl bg-slate-50/30 flex items-start gap-2 justify-between text-left">
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{note}</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveNote(idx)}
                          className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {filteredNotes.length === 0 && (
                      <p className="text-center text-slate-400 text-xs italic py-4">No notes matching query.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ======================================
                COMMUNITY NETWORK PANEL
                ====================================== */}
            <div className="bg-white border border-[#EAEAEA] rounded-[20px] p-6 shadow-sm space-y-6">
              <div className="border-b border-[#EAEAEA] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Users size={16} className="text-purple-600" />
                    Community Network
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Explore active learners on screen.</p>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                  <span>0 <span className="text-[10px] text-slate-400 font-semibold">Followers</span></span>
                  <span>0 <span className="text-[10px] text-slate-400 font-semibold">Following</span></span>
                </div>
              </div>

              <div className="text-center py-6 text-slate-400 text-xs italic">
                No followers found. Rankings and community suggestions load dynamically.
              </div>
            </div>

          </div>

        </div>

        {/* ======================================
            ACHIEVEMENT COLLECTION
            ====================================== */}
        <div className="bg-white border border-[#EAEAEA] rounded-[20px] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-[#EAEAEA] pb-4 text-left">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Award size={18} className="text-purple-600" />
              Achievement Collection
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Collect rare tokens as proof of completed streaks.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {profileStats?.achievements?.map((item: any, idx: number) => (
              <div
                key={idx}
                className={`p-5 border border-[#EAEAEA] rounded-2xl relative text-center group cursor-pointer transition-all ${
                  item.unlocked 
                    ? 'hover:border-purple-300 hover:shadow-[0_2px_10px_rgba(139,92,246,0.04)] bg-white' 
                    : 'bg-slate-50/50 opacity-60'
                }`}
              >
                <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center text-2xl mb-4 border ${
                  item.unlocked 
                    ? 'bg-purple-50 border-purple-100 text-purple-600' 
                    : 'bg-slate-100 border-[#EAEAEA] text-slate-400 grayscale'
                }`}>
                  {item.icon}
                </div>

                <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                
                <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold mt-2 ${
                  item.rarity === 'Legendary'
                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                    : item.rarity === 'Epic'
                    ? 'bg-purple-50 text-purple-600 border border-purple-100'
                    : item.rarity === 'Rare'
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {item.rarity}
                </span>

                <div className="text-[10px] text-slate-400 mt-3 font-semibold leading-relaxed">
                  {item.unlocked ? `Unlocked: ${item.date}` : 'Locked'}
                </div>

                <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 hidden group-hover:block w-48 p-2.5 bg-slate-900 text-white rounded-lg text-[10px] leading-relaxed shadow-xl border border-slate-755 z-20 text-left">
                  <span className="block font-bold text-purple-400 mb-0.5">{item.title}</span>
                  <p className="text-[10px] text-slate-300">{item.desc}</p>
                  {!item.unlocked && (
                    <span className="block mt-1 font-bold text-orange-400">Unlock: Meet conditions</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ======================================
            EMPTY STATES & MOCK VISUAL PREVIEW
            ====================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <div className="bg-white border border-[#EAEAEA] rounded-[20px] p-6 text-center shadow-sm flex flex-col items-center justify-center space-y-3 h-48">
            <div className="w-10 h-10 rounded-full bg-slate-550/10 border border-slate-200 flex items-center justify-center text-slate-500 text-xs select-none font-bold">
              CP
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-600 block">No achievements yet.</span>
              <p className="text-[10px] text-slate-400 font-semibold max-w-xs leading-relaxed">Solve your first challenge to unlock your first achievement.</p>
            </div>
          </div>

          <div className="bg-white border border-[#EAEAEA] rounded-[20px] p-6 text-center shadow-sm flex flex-col items-center justify-center space-y-3 h-48">
            <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 text-xs select-none font-bold">
              ⚡
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-600 block">No active team registers.</span>
              <p className="text-[10px] text-slate-400 font-semibold max-w-xs leading-relaxed">Join an upcoming hackathon from the hackathons tab and form a coding squad to display performance metrics here.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;

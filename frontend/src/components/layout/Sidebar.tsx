import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tutorialsService } from '../../services/tutorials';
import type { TutorialLanguage } from '../../services/tutorials';
import { 
  LayoutDashboard, CodeXml, Brain, Users, FileText, Trophy, 
  BookOpen, Bot, User, LogOut, ChevronLeft, ChevronRight, GraduationCap, Briefcase
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [languages, setLanguages] = useState<TutorialLanguage[]>([]);
  useEffect(() => {
    tutorialsService.getLanguages().then(data => {
      setLanguages(data.slice(0, 6)); // Display top 6 in the sidebar
    }).catch(err => console.error(err));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  interface NavItem {
    name: string;
    path: string;
    icon: any;
    disabled: boolean;
    exact?: boolean;
    match?: (pathname: string) => boolean;
    badge?: string;
  }

  // Nav Items configuration - Clean non-overlapping structure
  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      disabled: false,
      exact: true,
    },
    {
      name: 'Coding Arena',
      path: '/dashboard/coding',
      icon: CodeXml,
      disabled: false,
      // Matches coding practice as well as levels and question paths
      match: (pathname: string) => 
        pathname === '/dashboard/coding' || 
        pathname.startsWith('/topics') || 
        pathname.startsWith('/questions'),
    },
    {
      name: 'Aptitude Hub',
      path: '/dashboard/aptitude',
      icon: Brain,
      disabled: false,
      match: (pathname: string) => pathname.startsWith('/dashboard/aptitude'),
    },
    {
      name: 'Online Tests',
      path: '/dashboard/coding/tests',
      icon: Trophy,
      disabled: false,
      match: (pathname: string) => pathname.startsWith('/dashboard/coding/test'),
    },
    {
      name: 'Hackathons',
      path: '/dashboard/hackathons',
      icon: Users,
      disabled: false,
      match: (pathname: string) => pathname.startsWith('/dashboard/hackathons'),
    },
    {
      name: 'Internships',
      path: '/internships',
      icon: GraduationCap,
      disabled: false,
      match: (pathname: string) => pathname.startsWith('/internships') || pathname.startsWith('/dashboard/internships'),
    },
  ];

  // Helper to determine if a nav item is active
  const isItemActive = (item: typeof navItems[0]) => {
    if (item.match) {
      return item.match(location.pathname);
    }
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <aside 
      className={`hidden md:flex flex-col sticky top-16 h-[calc(100vh-4rem)] bg-white/80 dark:bg-[#030407]/90 backdrop-blur-lg border-r border-slate-200/80 dark:border-white/8 shrink-0 transition-all duration-300 z-30 select-none overflow-y-auto overflow-x-hidden justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col p-4 gap-2">
        {/* Sidebar Header / Toggle */}
        <div className={`flex items-center mb-4 ${collapsed ? 'justify-center' : 'justify-between px-2'}`}>
          {!collapsed && (
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Navigation
            </span>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-550 dark:text-slate-300 border border-slate-200/50 dark:border-white/10 cursor-pointer transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group relative cursor-pointer ${
                  active 
                    ? 'bg-blue-50/80 text-blue-650 dark:bg-indigo-950/40 dark:text-indigo-300 border-l-4 border-blue-600 dark:border-indigo-400 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/5 border-l-4 border-transparent'
                }`}
              >
                <div className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${active ? 'text-blue-600 dark:text-indigo-400' : ''}`}>
                  <Icon size={18} />
                </div>
                {!collapsed && (
                  <span className="truncate flex-1">{item.name}</span>
                )}

                {/* Badge if present */}
                {item.badge && !collapsed && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm select-none">
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Hover Tooltip */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 text-xs font-bold opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap shadow-xl border border-slate-700/50 z-50">
                    {item.name} {item.badge ? `(${item.badge})` : ''}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Programming Tutorials Section */}
        <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
          {!collapsed && (
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block mb-2">
              Tutorials
            </span>
          )}
          <NavLink
            to="/tutorials"
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all group relative cursor-pointer ${
              isActive && location.pathname === '/tutorials'
                ? 'bg-blue-50/80 text-blue-650 dark:bg-blue-950/30 dark:text-blue-450 border-l-4 border-blue-600 dark:border-blue-500 shadow-sm'
                : 'text-slate-650 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60 border-l-4 border-transparent'
            }`}
          >
            <BookOpen size={16} className="shrink-0 text-slate-450" />
            {!collapsed && <span className="truncate flex-1 font-bold">Browse All</span>}
            {collapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 text-xs font-bold opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap shadow-xl border border-slate-700/50 z-50">
                Browse Tutorials
              </div>
            )}
          </NavLink>

          {!collapsed && languages.map(lang => (
            <NavLink
              key={lang.id}
              to={`/tutorials/${lang.slug}`}
              className={() => `flex items-center gap-2.5 px-6 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                location.pathname.startsWith(`/tutorials/${lang.slug}`)
                  ? 'text-blue-605 dark:text-blue-400 font-bold bg-blue-50/40 dark:bg-blue-950/10'
                  : 'text-slate-550 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-900/30'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
              <span className="truncate">{lang.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-250/40 dark:border-white/8 flex flex-col gap-2 bg-slate-50/20 dark:bg-[#020204]">
        {/* User Card */}
        {user && !collapsed && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/40 dark:bg-[#08090e] border border-slate-200/50 dark:border-white/10 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-indigo-950/70 text-blue-600 dark:text-indigo-300 border border-blue-200 dark:border-indigo-800 flex items-center justify-center font-bold text-sm shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-850 dark:text-slate-200 truncate">{user.username}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-extrabold">{user.role}</div>
            </div>
          </div>
        )}

        {/* Profile Link */}
        <NavLink
          to="/profile"
          className={() => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group relative cursor-pointer ${
            location.pathname === '/profile'
              ? 'bg-blue-50/80 text-blue-650 dark:bg-blue-950/30 dark:text-blue-450 border-l-4 border-blue-600 dark:border-blue-500 shadow-sm'
              : 'text-slate-655 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60 border-l-4 border-transparent'
          }`}
        >
          <User size={18} className="shrink-0 group-hover:scale-105 transition-transform" />
          {!collapsed && <span>Account Profile</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 text-xs font-bold opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap shadow-xl border border-slate-700/50 z-50">
              Account Profile
            </div>
          )}
        </NavLink>

        {/* Logout Link */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 group relative w-full text-left cursor-pointer border-l-4 border-transparent"
        >
          <LogOut size={18} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
          {!collapsed && <span>Sign Out</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-red-900 text-white text-xs font-bold opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap shadow-xl z-50">
              Sign Out
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

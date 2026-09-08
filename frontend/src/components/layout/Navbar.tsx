import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Menu, X, LogOut, LayoutDashboard, Bell, User, Sparkles, Code, BookOpen, Users } from 'lucide-react';
import api from '../../services/api';
import Logo from '../brand/Logo';

const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Notification system
  interface HackathonNotification {
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
  }
  const [notifications, setNotifications] = useState<HackathonNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/hackathon-notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/hackathon-notifications/${id}/mark_as_read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/hackathon-notifications/mark_all_as_read/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/75 dark:bg-slate-950/75 backdrop-blur-md border-b border-slate-100 dark:border-slate-900/60 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side: Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center group">
              <Logo showText={true} iconSize={20} />
            </Link>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1 px-4 h-16">
            <div className="flex items-center gap-6 lg:gap-8 h-16">
              <NavLink 
                to="/tutorials" 
                className={({ isActive }) => 
                  `relative h-full flex items-center text-[13px] font-semibold transition-colors ${
                    isActive 
                      ? 'text-purple-600 dark:text-purple-400 font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-purple-600 dark:after:bg-purple-400 after:rounded-full' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'
                  }`
                }
              >
                Tutorials
              </NavLink>
              <NavLink 
                to="/dashboard/coding" 
                className={({ isActive }) => 
                  `relative h-full flex items-center text-[13px] font-semibold transition-colors ${
                    isActive 
                      ? 'text-purple-600 dark:text-purple-400 font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-purple-600 dark:after:bg-purple-400 after:rounded-full' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'
                  }`
                }
              >
                Practice
              </NavLink>
              <NavLink 
                to="/dashboard/aptitude" 
                className={({ isActive }) => 
                  `relative h-full flex items-center text-[13px] font-semibold transition-colors ${
                    isActive 
                      ? 'text-purple-600 dark:text-purple-400 font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-purple-600 dark:after:bg-purple-400 after:rounded-full' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'
                  }`
                }
              >
                Aptitude
              </NavLink>
              <NavLink 
                to="/dashboard/hackathons" 
                className={({ isActive }) => 
                  `relative h-full flex items-center text-[13px] font-semibold transition-colors ${
                    isActive 
                      ? 'text-purple-600 dark:text-purple-400 font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-purple-600 dark:after:bg-purple-400 after:rounded-full' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'
                  }`
                }
              >
                Hackathons
              </NavLink>
              <NavLink 
                to="/test-series" 
                className={({ isActive }) => 
                  `relative h-full flex items-center text-[13px] font-semibold transition-colors ${
                    isActive 
                      ? 'text-purple-600 dark:text-purple-400 font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-purple-600 dark:after:bg-purple-400 after:rounded-full' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'
                  }`
                }
              >
                Test Series
              </NavLink>
              <NavLink 
                to="/internships" 
                className={({ isActive }) => 
                  `relative h-full flex items-center gap-1.5 text-[13px] font-semibold transition-colors ${
                    isActive 
                      ? 'text-purple-600 dark:text-purple-400 font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-purple-600 dark:after:bg-purple-400 after:rounded-full' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'
                  }`
                }
              >
                <span>Internships</span>
                <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[9px] font-extrabold uppercase">
                  2026
                </span>
              </NavLink>
            </div>
          </div>

          {/* Right Side Action Buttons */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-905 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notification Dropdown */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-905 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all relative cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900 shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                      <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                        <Bell size={14} className="text-blue-600 dark:text-blue-400" /> Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-905">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                            className={`p-4 text-left transition-colors duration-150 cursor-pointer ${
                              notif.is_read 
                                ? 'bg-transparent hover:bg-slate-50/50 dark:hover:bg-slate-900/20' 
                                : 'bg-blue-50/30 dark:bg-blue-950/10 hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className={`text-[11px] font-bold ${notif.is_read ? 'text-slate-700 dark:text-slate-400' : 'text-blue-600 dark:text-blue-450'}`}>
                                {notif.title}
                              </span>
                              {!notif.is_read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 shrink-0 mt-1"></span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Authenticated user vs Guest navigation actions */}
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-150 dark:border-slate-900">
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 focus:outline-none cursor-pointer py-1 px-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 text-xs shadow-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    {isAdmin && (
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        Admin <span className="text-[10px] text-slate-400">▾</span>
                      </span>
                    )}
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900 shadow-xl z-50 overflow-hidden text-left py-1.5">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-900">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user.username}</p>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                      >
                        <User size={13} />
                        View Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                      >
                        <LayoutDashboard size={13} />
                        Dashboard Hub
                      </Link>

                      {isAdmin && (
                        <>
                          <div className="px-4 py-1.5 text-[10px] font-extrabold uppercase text-slate-400 border-t border-slate-100 dark:border-slate-900 mt-1">
                            Admin Panels
                          </div>
                          <Link
                            to="/admin/internships"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                          >
                            <Sparkles size={13} />
                            Internships Admin
                          </Link>
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                          >
                            <Code size={13} />
                            Coding Admin
                          </Link>
                          <Link
                            to="/admin/aptitude"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                          >
                            <BookOpen size={13} />
                            Aptitude Admin
                          </Link>
                          <Link
                            to="/admin/hackathons"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                          >
                            <Users size={13} />
                            Hackathons Admin
                          </Link>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-left border-t border-slate-105 dark:border-slate-900 mt-1 cursor-pointer"
                      >
                        <LogOut size={13} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="text-[13px] font-semibold text-slate-655 dark:text-slate-350 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 rounded-lg shadow-sm transition-all border border-purple-700/10"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Action Buttons */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notification on Mobile */}
            {user && (
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-all relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>
            )}

            {/* Direct Profile Icon for Logged in User on Mobile */}
            {user && (
              <Link
                to="/profile"
                className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] shadow-xs"
                title="View Profile"
              >
                {user.username.charAt(0).toUpperCase()}
              </Link>
            )}

            {/* Hamburger / Close Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Notifications Panel Dropdown */}
      {notifOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl px-4 py-3 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
            <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Bell size={14} className="text-blue-600 dark:text-blue-400" /> Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900 mt-2">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">No notifications yet.</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                  className={`p-2.5 text-left rounded-lg transition-colors cursor-pointer ${
                    notif.is_read ? 'text-slate-500' : 'bg-blue-50/50 dark:bg-blue-950/20 text-blue-600'
                  }`}
                >
                  <div className="text-[11px] font-bold">{notif.title}</div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-[#0c0d14] shadow-2xl px-4 py-5 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto animate-fadeIn">
          
          {/* User Profile Card (if logged in) */}
          {user ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-200/50 dark:border-purple-800/50 flex items-center justify-between">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 min-w-0"
              >
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                    <span>{user.username}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {user.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {user.email || 'View Profile & Stats →'}
                  </div>
                </div>
              </Link>

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/80 text-xs font-bold shrink-0 hover:scale-105 transition-transform"
              >
                <User size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Quick Hub Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block mb-1">
              Main Menu
            </span>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-750 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <LayoutDashboard size={16} className="text-purple-600 dark:text-purple-400" />
              <span>Dashboard Hub</span>
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-750 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <User size={16} className="text-blue-600 dark:text-blue-400" />
              <span>My Profile & Stats</span>
            </Link>
            <Link
              to="/dashboard/coding/dsa"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-750 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <Code size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span>DSA Learning Roadmap</span>
            </Link>
            <Link
              to="/dashboard/coding/problems"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-750 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <Code size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>Practice Playground</span>
            </Link>
            <Link
              to="/dashboard/aptitude"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-750 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <Sparkles size={16} className="text-amber-600 dark:text-amber-400" />
              <span>Aptitude Practice</span>
            </Link>
            <Link
              to="/tutorials"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-750 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <BookOpen size={16} className="text-purple-600 dark:text-purple-400" />
              <span>Programming Tutorials</span>
            </Link>
            <Link
              to="/dashboard/hackathons"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-750 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <Users size={16} className="text-pink-600 dark:text-pink-400" />
              <span>Hackathons</span>
            </Link>
            <Link
              to="/test-series"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-750 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <Sparkles size={16} className="text-teal-600 dark:text-teal-400" />
              <span>Test Series</span>
            </Link>
            <Link
              to="/internships"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40"
            >
              <div className="flex items-center gap-3">
                <Sparkles size={16} />
                <span>Internships 2026</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase bg-blue-600 text-white">
                New
              </span>
            </Link>
          </div>

          {/* Admin Panels Section (if admin) */}
          {user && isAdmin && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-850 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 dark:text-amber-400 px-2 block mb-1">
                Admin Control Panels
              </span>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <LayoutDashboard size={14} className="text-amber-500" />
                <span>CMS Central Dashboard</span>
              </Link>
              <Link
                to="/admin/internships"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <Sparkles size={14} />
                <span>Internships Admin</span>
              </Link>
              <Link
                to="/admin/tutorials"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <BookOpen size={14} />
                <span>Tutorials CMS</span>
              </Link>
              <Link
                to="/admin/aptitude"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <Sparkles size={14} />
                <span>Aptitude Admin</span>
              </Link>
              <Link
                to="/admin/hackathons"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <Users size={14} />
                <span>Hackathons Admin</span>
              </Link>
            </div>
          )}

          {/* User Log Out (if logged in) */}
          {user && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-850">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out from CodexPetra</span>
              </button>
            </div>
          )}

        </div>
      )}
    </nav>
  );
};

export default Navbar;

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

          {/* Mobile Drawer Menu Toggle */}
          <div className="flex items-center gap-2.5 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-lg px-4 py-4 space-y-3">
          <div className="space-y-1">
            <Link
              to="/tutorials"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              Tutorials
            </Link>
            <Link
              to="/dashboard/coding"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              Practice
            </Link>
            <Link
              to="/dashboard/aptitude"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              Aptitude
            </Link>
            <Link
              to="/dashboard/hackathons"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              Hackathons
            </Link>
            <Link
              to="/test-series"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              Test Series
            </Link>
            <Link
              to="/internships"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              Internships 2026
            </Link>
          </div>

          {user ? (
            <div className="border-t border-slate-100 dark:border-slate-900 pt-3">
              <div className="flex items-center px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-405 mr-3 text-xs border border-blue-150 dark:border-blue-900">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-white leading-none">{user.username}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{user.email}</div>
                </div>
              </div>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-amber-600 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 px-3 py-2 mt-2 rounded-lg text-sm font-semibold text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-900">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

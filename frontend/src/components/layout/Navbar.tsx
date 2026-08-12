import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Menu, X, LogOut, LayoutDashboard, Bell, Search, User } from 'lucide-react';
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

          {/* Center Navigation & Search Bar */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center px-4">
            
            {/* Premium SaaS Mock Search Bar */}
            <div className="relative w-64 max-w-xs xl:w-72">
              <button 
                onClick={() => navigate(user ? '/dashboard/coding' : '/login')}
                className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-slate-400 dark:text-slate-500 border border-slate-200/80 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/80 transition-all text-left shadow-sm hover:border-slate-350 dark:hover:border-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search size={13} className="text-slate-400 dark:text-slate-500" />
                  <span className="truncate">Search tutorials, topics...</span>
                </div>
                <kbd className="px-1.5 py-0.5 text-[9px] font-mono border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded text-slate-400 dark:text-slate-500 shadow-sm leading-none shrink-0 select-none">
                  Ctrl K
                </kbd>
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-5 lg:gap-6">
              <NavLink 
                to="/tutorials" 
                className={({ isActive }) => 
                  `text-[13px] font-semibold transition-colors ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400 font-bold' 
                      : 'text-slate-650 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`
                }
              >
                Tutorials
              </NavLink>
              <NavLink 
                to="/dashboard/coding" 
                className={({ isActive }) => 
                  `text-[13px] font-semibold transition-colors ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400 font-bold' 
                      : 'text-slate-650 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`
                }
              >
                Practice
              </NavLink>
              <NavLink 
                to="/dashboard/aptitude" 
                className={({ isActive }) => 
                  `text-[13px] font-semibold transition-colors ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400 font-bold' 
                      : 'text-slate-650 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`
                }
              >
                Aptitude
              </NavLink>
              <NavLink 
                to="/dashboard/hackathons" 
                className={({ isActive }) => 
                  `text-[13px] font-semibold transition-colors ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400 font-bold' 
                      : 'text-slate-650 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`
                }
              >
                Hackathons
              </NavLink>
              <NavLink 
                to="/dashboard/coding?tab=companies" 
                className={({ isActive }) => 
                  `text-[13px] font-semibold transition-colors ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-405 font-bold' 
                      : 'text-slate-655 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`
                }
              >
                Companies
              </NavLink>
              <a 
                href="#" 
                onClick={(e) => e.preventDefault()}
                className="text-[13px] font-semibold text-slate-655 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Blog
              </a>
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
                {isAdmin && (
                  <Link 
                    to="/admin/dashboard" 
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-605 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                  >
                    <LayoutDashboard size={14} />
                    Admin
                  </Link>
                )}
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 focus:outline-none cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center font-bold text-blue-600 dark:text-blue-450 border border-blue-100 dark:border-blue-900/60 text-xs shadow-sm transition-transform hover:scale-105">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
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
                  className="text-[13px] font-semibold text-slate-655 dark:text-slate-350 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-sm transition-all border border-blue-700/10"
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
              to="/dashboard/coding?tab=companies"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              Companies
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

import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../brand/Logo';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/80 dark:border-white/8 bg-white dark:bg-[#020204] py-12 transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-4 space-y-4">
            <Logo showText={true} iconSize={18} />
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed font-medium">
              A premium preparation portal for developers to master coding, practice aptitude, learn languages, and win hackathons.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 text-slate-400 dark:text-slate-500">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-450 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-450 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-450 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-450 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 1-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="col-span-1 md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <li>
                <Link to="/tutorials" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Programming Tutorials</Link>
              </li>
              <li>
                <Link to="/dashboard/coding" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Coding Practice</Link>
              </li>
              <li>
                <Link to="/dashboard/aptitude" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Aptitude & Reasoning</Link>
              </li>
              <li>
                <Link to="/test-series" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Test Series</Link>
              </li>
              <li>
                <Link to="/internships" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Internships 2026</Link>
              </li>
            </ul>
          </div>

          {/* Resources & Company Column */}
          <div className="col-span-1 md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">
              Company & Help
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <li>
                <Link to="/about" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">About CodexPetra</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/tutorials" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Developer Documentation</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Terms & Conditions</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom border & copyright */}
        <div className="pt-6 border-t border-slate-100 dark:border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            &copy; {year} CodexPetra. Built for developers. All rights reserved.
          </p>
          <div className="flex gap-4 text-[10px] text-slate-400 dark:text-slate-500">
            <Link to="/privacy-policy" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Support</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

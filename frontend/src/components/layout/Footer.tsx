import React from 'react';
import Logo from '../brand/Logo';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0c10] py-8 transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo showText={true} iconSize={18} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {year} CodexPetra. Built for developers. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-slate-400 dark:text-slate-500">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

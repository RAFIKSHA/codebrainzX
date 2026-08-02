import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#090a0f] transition-colors duration-200">
      <Navbar />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;

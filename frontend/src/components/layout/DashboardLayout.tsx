import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  // Retrieve sidebar state from localStorage, defaulting to false (expanded)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  return (
    <Layout showFooter={false}>
      <div className="flex flex-grow relative min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#07080d] transition-colors duration-200">
        {/* Sidebar Component */}
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        
        {/* Main Content Area */}
        <main 
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300`}
        >
          <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default DashboardLayout;

import React from 'react';
import Layout from './Layout';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <Layout showFooter={false}>
      <div className="flex flex-grow relative min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#07080d] transition-colors duration-200">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default DashboardLayout;


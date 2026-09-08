import React, { useEffect } from 'react';
import { setSEOMetadata, getBreadcrumbSchema } from '../../utils/seo';
import { Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    setSEOMetadata({
      title: 'Privacy Policy | CodexPetra',
      description: 'Learn how CodexPetra collects, protects, and manages your personal data, code submissions, assessment records, and account information.',
      canonicalUrl: 'https://codexpetra.com/privacy-policy',
      structuredData: getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Privacy Policy', url: '/privacy-policy' },
      ]),
    });
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-[#020204] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Hero Header */}
      <section className="border-b border-slate-200/80 dark:border-white/8 py-12 bg-slate-50/50 dark:bg-[#06070b]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Shield size={13} /> Legal & Data Protection
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last Updated: August 2026 • CodexPetra Data Security Standards
          </p>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            1. Introduction & Overview
          </h2>
          <p>
            At CodexPetra (accessible at <strong className="text-slate-800 dark:text-slate-200">https://codexpetra.com/</strong>), we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains our policies regarding the collection, use, disclosure, and protection of your personal information when using our coding practice platform, aptitude assessments, tutorials, and competitive hackathons.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            2. Information We Collect
          </h2>
          <p>We collect information in the following categories:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-slate-800 dark:text-slate-200">Account Credentials:</strong> Name, email address, password hash, and OAuth profile details (such as Google Sign-In identifiers).</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Technical Code Submissions:</strong> Source code submitted to our online compiler sandbox, test cases executed, execution timing, and compiler logs.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Assessment & Test Data:</strong> Aptitude test responses, mock test scores, time spent per question, and leaderboard rankings.</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Device & Usage Analytics:</strong> IP address, browser type, operating system, pages viewed, and session durations to help optimize performance.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            3. How We Use Your Information
          </h2>
          <p>The information we collect is utilized strictly to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Provide, maintain, and improve our interactive coding IDE and aptitude test engines.</li>
            <li>Calculate accurate accuracy metrics, leaderboard XP, and learning progress diagnostics.</li>
            <li>Protect platform integrity against malicious abuse, automated scraping, or anti-cheat violations during live hackathons.</li>
            <li>Send critical account notices, security updates, and test score confirmations.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            4. Code Sandbox Security & Data Retention
          </h2>
          <p>
            When you run code in our compiler sandbox, code snippets are executed in temporary isolated virtual containers. We retain submitted code history linked to your account profile so you can revisit past solutions. We do not sell, rent, or publicly expose your private coding submissions without your consent.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            5. Cookies & Tracking Technologies
          </h2>
          <p>
            CodexPetra uses standard essential cookies and local storage tokens to preserve authentication sessions, theme preferences (Obsidian Black, Crisp White, Warm Study), and test timer progress. You may choose to disable cookies in your browser settings, though certain authenticated features may become unavailable.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            6. Your Privacy Rights & Contact
          </h2>
          <p>
            You have the right to access, update, or request the deletion of your account data at any time. For questions or data removal requests regarding this Privacy Policy, please contact our data team at: <strong className="text-purple-600 dark:text-purple-400">support@codexpetra.com</strong>.
          </p>
        </div>

      </section>
    </div>
  );
};

export default PrivacyPolicy;

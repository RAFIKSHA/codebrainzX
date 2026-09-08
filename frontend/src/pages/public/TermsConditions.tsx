import React, { useEffect } from 'react';
import { setSEOMetadata, getBreadcrumbSchema } from '../../utils/seo';
import { FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

const TermsConditions: React.FC = () => {
  useEffect(() => {
    setSEOMetadata({
      title: 'Terms & Conditions | CodexPetra',
      description: 'Read the terms of service governing user accounts, coding sandbox execution, test series participation, and fair usage policies on CodexPetra.',
      canonicalUrl: 'https://codexpetra.com/terms-conditions',
      structuredData: getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Terms & Conditions', url: '/terms-conditions' },
      ]),
    });
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-[#020204] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Hero Header */}
      <section className="border-b border-slate-200/80 dark:border-white/8 py-12 bg-slate-50/50 dark:bg-[#06070b]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
            <FileText size={13} /> Legal Agreement
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Terms & Conditions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last Updated: August 2026 • Platform Terms of Service
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or using CodexPetra (available at <strong className="text-slate-800 dark:text-slate-200">https://codexpetra.com/</strong>), you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use our services.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            2. User Accounts & Security
          </h2>
          <p>
            To access certain features (such as saving coding progress, participating in test series, or competing in hackathons), you must create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            3. Compiler Sandbox & Fair Use Policy
          </h2>
          <p>
            CodexPetra provides an online code execution sandbox. Users agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Execute malicious code, fork bombs, cryptominers, or unauthorized port scanners.</li>
            <li>Attempt to break out of isolated sandboxes or compromise backend execution servers.</li>
            <li>Submit automated spam requests that degrade system availability for other learners.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            4. Test Series & Academic Integrity
          </h2>
          <p>
            Our company test series and placement aptitude mock tests are designed to evaluate genuine individual problem-solving skills. Using automated cheating bots, unauthorized browser extensions, or plagiarizing answers during proctored contests may result in disqualification and account termination.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            5. Intellectual Property
          </h2>
          <p>
            All original tutorial documentation, problem sets, website design, trademarks, and logos are the intellectual property of CodexPetra. Users retain copyright over original software source code they author and execute in our sandbox editor.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            6. Changes to Terms & Contact
          </h2>
          <p>
            We may update these Terms from time to time. Continued use of the platform after modifications indicates acceptance of the updated terms. For inquiries regarding these terms, contact: <strong className="text-purple-600 dark:text-purple-400">support@codexpetra.com</strong>.
          </p>
        </div>

      </section>
    </div>
  );
};

export default TermsConditions;

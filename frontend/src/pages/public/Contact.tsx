import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { setSEOMetadata, getContactPageSchema, getBreadcrumbSchema } from '../../utils/seo';
import { Mail, MessageSquare, HelpCircle, Send, CheckCircle2, MapPin, Sparkles } from 'lucide-react';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    setSEOMetadata({
      title: 'Contact CodexPetra | Support & Developer Assistance',
      description: 'Get in touch with the CodexPetra support team for inquiries, bug reports, campus hackathons, corporate partnerships, and technical feedback.',
      canonicalUrl: 'https://www.codexpetra.com/contact',
      structuredData: [
        getContactPageSchema(),
        getBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Contact Us', url: '/contact' },
        ]),
      ],
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-[#020204] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-white/8 py-16 bg-gradient-to-b from-purple-50/40 via-slate-50/20 to-transparent dark:from-purple-950/15 dark:via-transparent dark:to-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold tracking-wide uppercase">
            <Sparkles size={13} /> We're here to help
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Get in Touch with CodexPetra
          </h1>

          <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Have questions about our coding practice sandbox, aptitude papers, campus hackathons, or account support? We would love to hear from you.
          </p>
        </div>
      </section>

      {/* Main Content Form & Contact Info */}
      <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Contact Information Cards */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-slate-50 dark:bg-[#07080d] border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-3">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 w-fit">
                <Mail size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Email Support</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                For general questions, bug reports, and account help:
              </p>
              <a 
                href="mailto:support@codexpetra.com"
                className="inline-block text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                support@codexpetra.com
              </a>
            </div>

            <div className="bg-slate-50 dark:bg-[#07080d] border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-3">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 w-fit">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Campus & Hackathons</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                For colleges, universities, and student coding club partnerships:
              </p>
              <a 
                href="mailto:partnerships@codexpetra.com"
                className="inline-block text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                partnerships@codexpetra.com
              </a>
            </div>

            <div className="bg-slate-50 dark:bg-[#07080d] border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 w-fit">
                <HelpCircle size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tutorials & Docs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Looking for programming language documentation and DSA lessons?
              </p>
              <Link 
                to="/tutorials"
                className="inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Explore Tutorials Hub →
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7 bg-white dark:bg-[#08090e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Thank you for reaching out. Our support team will review your message and reply via email shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="px-4 py-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Send a Message
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Alex Taylor"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e17] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e17] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Question regarding test series or coding problems"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e17] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry or feedback in detail..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0e17] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Send size={13} />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

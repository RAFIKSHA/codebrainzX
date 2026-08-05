import React, { useEffect } from 'react';
import { setSEOMetadata } from '../../utils/seo';
import HackathonLandingSection from '../../components/hackathons/HackathonLandingSection';

const LandingPage: React.FC = () => {
  useEffect(() => {
    setSEOMetadata({
      title: 'CodeBrainzX | Live Hackathons & Coding Sprints',
      description: 'Participate in signature hackathons, collaborate with mentors, build innovative solutions, and win prize pools.',
      canonicalUrl: window.location.href,
    });
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-[#090a0f] transition-colors duration-200 min-h-screen">
      <HackathonLandingSection />
    </div>
  );
};

export default LandingPage;

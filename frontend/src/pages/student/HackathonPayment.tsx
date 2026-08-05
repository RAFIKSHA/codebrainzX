import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

const HackathonPayment: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const teamId = searchParams.get('team_id');
    if (slug) {
      const redirectUrl = teamId 
        ? `/dashboard/hackathons/${slug}/register?step=5&team_id=${teamId}` 
        : `/dashboard/hackathons/${slug}/register`;
      navigate(redirectUrl, { replace: true });
    } else {
      navigate('/dashboard/hackathons', { replace: true });
    }
  }, [slug, searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 space-y-2 select-none">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="text-xs font-bold">Redirecting to checkout payment portal...</span>
    </div>
  );
};

export default HackathonPayment;

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageView } from '../../utils/analytics';

const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Construct the full relative path including search query parameters
    const currentPath = location.pathname + location.search;
    pageView(currentPath);
  }, [location]);

  return null;
};

export default AnalyticsTracker;

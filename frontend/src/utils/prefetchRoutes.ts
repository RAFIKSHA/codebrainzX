import { QueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { tutorialsService } from '../services/tutorials';

// In-memory set to prevent duplicate prefetch triggers during the same session
const prefetchedPaths = new Set<string>();

/**
 * Prefetches both the React component bundle chunk and TanStack Query data
 * on hover/focus before the user actually clicks.
 */
export const prefetchSectionData = (
  path: string,
  queryClient: QueryClient,
  userId?: number | string
) => {
  const p = path.toLowerCase().trim();
  const cacheKey = `${p}_${userId || 'anon'}`;
  if (prefetchedPaths.has(cacheKey)) {
    return;
  }
  prefetchedPaths.add(cacheKey);

  try {
    if (p === '/dashboard' || p === '') {
      import('../pages/student/LearningSections');
      queryClient.prefetchQuery({
        queryKey: ['continue-learning', userId],
        queryFn: () => tutorialsService.getContinueLearning(),
      });
      queryClient.prefetchQuery({
        queryKey: ['hackathons'],
        queryFn: () => api.get('/hackathons/').then((res) => res.data),
      });
    } else if (p.startsWith('/dashboard/coding')) {
      import('../pages/student/PracticePlayground');
      import('../pages/student/DsaRoadmap');
      queryClient.prefetchQuery({
        queryKey: ['topics'],
        queryFn: () => api.get('/topics/').then((res) => res.data),
      });
      queryClient.prefetchQuery({
        queryKey: ['allQuestions'],
        queryFn: () => api.get('/questions/').then((res) => res.data),
      });
    } else if (p.startsWith('/dashboard/aptitude')) {
      import('../pages/student/AptitudeDashboard');
      import('../pages/student/AptitudeCategoriesPage');
      queryClient.prefetchQuery({
        queryKey: ['aptitude-dashboard'],
        queryFn: () => api.get('/aptitude/dashboard/').then((res) => res.data),
      });
      queryClient.prefetchQuery({
        queryKey: ['aptitude-categories'],
        queryFn: () => api.get('/aptitude-categories/').then((res) => res.data),
      });
    } else if (p.startsWith('/test-series') || p.startsWith('/dashboard/coding/test')) {
      import('../pages/student/TestSeriesHub');
      queryClient.prefetchQuery({
        queryKey: ['test-series-categories'],
        queryFn: () => api.get('/test-series/categories/').then((res) => res.data),
      });
    } else if (p.startsWith('/dashboard/hackathons') || p.startsWith('/hackathons')) {
      import('../pages/student/HackathonDashboard');
      queryClient.prefetchQuery({
        queryKey: ['hackathons'],
        queryFn: () => api.get('/hackathons/').then((res) => res.data),
      });
    } else if (p.startsWith('/tutorials')) {
      import('../pages/student/TutorialsHomePage');
      queryClient.prefetchQuery({
        queryKey: ['tutorialLanguages'],
        queryFn: () => tutorialsService.getLanguages(),
      });
    } else if (p.startsWith('/internships')) {
      import('../pages/student/InternshipLandingPage');
      queryClient.prefetchQuery({
        queryKey: ['internshipPrograms'],
        queryFn: () => api.get('/internships/programs/').then((res) => res.data),
      });
    }
  } catch {
    // Non-blocking prefetch error suppression
  }
};


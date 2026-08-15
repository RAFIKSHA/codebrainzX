import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import DashboardLayout from './components/layout/DashboardLayout';
import { ProtectedRoute, AdminRoute } from './components/layout/ProtectedRoute';
import AnalyticsTracker from './components/analytics/AnalyticsTracker';

// Lazy Loaded Pages for Fast Bundle Chunks
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const LearningSections = lazy(() => import('./pages/student/LearningSections'));
const CodingDashboard = lazy(() => import('./pages/student/Dashboard'));
const LevelQuestions = lazy(() => import('./pages/student/LevelQuestions'));
const QuestionPage = lazy(() => import('./pages/question/QuestionPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AptitudeDashboard = lazy(() => import('./pages/student/AptitudeDashboard'));
const AptitudePracticeSelection = lazy(() => import('./pages/student/AptitudePracticeSelection'));
const AptitudeTestEngine = lazy(() => import('./pages/student/AptitudeTestEngine'));
const AptitudeResultPage = lazy(() => import('./pages/student/AptitudeResultPage'));
const AptitudeAdminPanel = lazy(() => import('./pages/admin/AptitudeAdminPanel'));
const AptitudeCategoriesPage = lazy(() => import('./pages/student/AptitudeCategoriesPage'));
const AptitudeTopicsPage = lazy(() => import('./pages/student/AptitudeTopicsPage'));
const AptitudeSubTopicsPage = lazy(() => import('./pages/student/AptitudeSubTopicsPage'));
const AptitudeMCQPracticePage = lazy(() => import('./pages/student/AptitudeMCQPracticePage'));
const AptitudeTrainerProfilePage = lazy(() => import('./pages/student/AptitudeTrainerProfilePage'));
const CodingTestListPage = lazy(() => import('./pages/student/CodingTestListPage'));
const CodingTestEngine = lazy(() => import('./pages/student/CodingTestEngine'));
const CodingTestResultPage = lazy(() => import('./pages/student/CodingTestResultPage'));
const AptitudeQuestionCreateEditPage = lazy(() => import('./pages/admin/AptitudeQuestionCreateEditPage'));

// Test Series Pages
const TestSeriesHub = lazy(() => import('./pages/student/TestSeriesHub'));
const CompanySelection = lazy(() => import('./pages/student/CompanySelection'));
const SeriesDetailPage = lazy(() => import('./pages/student/SeriesDetailPage'));
const TestInstructionsPage = lazy(() => import('./pages/student/TestInstructionsPage'));
const TestSeriesEngine = lazy(() => import('./pages/student/TestSeriesEngine'));
const TestSeriesResultPage = lazy(() => import('./pages/student/TestSeriesResultPage'));

// Hackathon Pages
const HackathonDashboard = lazy(() => import('./pages/student/HackathonDashboard'));
const HackathonDetails = lazy(() => import('./pages/student/HackathonDetails'));
const HackathonRegister = lazy(() => import('./pages/student/HackathonRegister'));
const HackathonPayment = lazy(() => import('./pages/student/HackathonPayment'));
const HackathonAdminPanel = lazy(() => import('./pages/admin/HackathonAdminPanel'));

// Tutorials Pages
const TutorialsHomePage = lazy(() => import('./pages/student/TutorialsHomePage'));
const TutorialLearningPage = lazy(() => import('./pages/student/TutorialLearningPage'));
const TutorialsAdminPanel = lazy(() => import('./pages/admin/TutorialsAdminPanel'));
const ProfilePage = lazy(() => import('./pages/student/ProfilePage'));

// Placeholder Pages
import { 
  InterviewDashboard, McqDashboard, 
  CoursesDashboard, AiPracticeDashboard 
} from './pages/student/Placeholders';

const PageLoadingSpinner: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
    <div className="w-9 h-9 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
    <span className="text-xs font-semibold text-slate-400">Loading page...</span>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AnalyticsTracker />
            <Suspense fallback={<PageLoadingSpinner />}>
              <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <Layout>
                    <LandingPage />
                  </Layout>
                }
              />
              <Route
                path="/tutorials"
                element={
                  <Layout>
                    <TutorialsHomePage />
                  </Layout>
                }
              />
              <Route
                path="/tutorials/:langSlug"
                element={
                  <Layout>
                    <TutorialLearningPage />
                  </Layout>
                }
              />
              <Route
                path="/tutorials/:langSlug/:lessonSlug"
                element={
                  <Layout>
                    <TutorialLearningPage />
                  </Layout>
                }
              />
              <Route
                path="/login"
                element={
                  <Layout>
                    <Login />
                  </Layout>
                }
              />
              <Route
                path="/signup"
                element={
                  <Layout>
                    <Signup />
                  </Layout>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <Layout>
                    <ForgotPassword />
                  </Layout>
                }
              />

              {/* Student Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <LearningSections />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ProfilePage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/coding"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <CodingDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/coding/tests"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <CodingTestListPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/coding/test/:testId"
                element={
                  <ProtectedRoute>
                    <CodingTestEngine />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/coding/test/:testId/results"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <CodingTestResultPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/aptitude"
                element={
                  <DashboardLayout>
                    <AptitudeDashboard />
                  </DashboardLayout>
                }
              />
              <Route
                path="/test-series"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <TestSeriesHub />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/test-series/:companySlug"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <CompanySelection />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/test-series/:companySlug/:seriesSlug"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <SeriesDetailPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/test-series/:companySlug/:seriesSlug/test/:testId"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <TestInstructionsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/test-series/test/:attemptId/engine"
                element={
                  <ProtectedRoute>
                    <TestSeriesEngine />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/test-series/attempt/:attemptId/result"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <TestSeriesResultPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/aptitude/practice"
                element={
                  <DashboardLayout>
                    <AptitudePracticeSelection />
                  </DashboardLayout>
                }
              />
              <Route
                path="/dashboard/aptitude/categories"
                element={
                  <DashboardLayout>
                    <AptitudeCategoriesPage />
                  </DashboardLayout>
                }
              />
              <Route
                path="/dashboard/aptitude/category/:categoryId"
                element={
                  <DashboardLayout>
                    <AptitudeTopicsPage />
                  </DashboardLayout>
                }
              />
              <Route
                path="/dashboard/aptitude/topic/:topicId"
                element={
                  <DashboardLayout>
                    <AptitudeSubTopicsPage />
                  </DashboardLayout>
                }
              />
              <Route
                path="/dashboard/aptitude/trainer/:trainerId"
                element={
                  <DashboardLayout>
                    <AptitudeTrainerProfilePage />
                  </DashboardLayout>
                }
              />
              <Route
                path="/dashboard/aptitude/subtopic/:subtopicId/practice"
                element={
                  <DashboardLayout>
                    <AptitudeMCQPracticePage />
                  </DashboardLayout>
                }
              />
              <Route
                path="/dashboard/aptitude/test/:testId"
                element={
                  <Layout showFooter={false}>
                    <AptitudeTestEngine />
                  </Layout>
                }
              />
              <Route
                path="/dashboard/aptitude/result/:attemptId"
                element={
                  <DashboardLayout>
                    <AptitudeResultPage />
                  </DashboardLayout>
                }
              />
              <Route
                path="/dashboard/interview"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <InterviewDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/mcq"
                element={<Navigate to="/dashboard/aptitude/categories" replace />}
              />
              <Route
                path="/dashboard/contests"
                element={<Navigate to="/dashboard/coding/tests" replace />}
              />
              <Route
                path="/dashboard/courses"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <CoursesDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/ai-practice"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AiPracticeDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/hackathons"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <HackathonDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/hackathons/:slug"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <HackathonDetails />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/hackathons/:slug/register"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <HackathonRegister />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/hackathons/:slug/payment"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <HackathonPayment />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/topics/:topicId/level/:levelName"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <LevelQuestions />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/questions/:questionId"
                element={
                  <ProtectedRoute>
                    <Layout showFooter={false}>
                      <QuestionPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/tutorials"
                element={
                  <AdminRoute>
                    <Layout>
                      <TutorialsAdminPanel />
                    </Layout>
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/aptitude"
                element={
                  <AdminRoute>
                    <Layout>
                      <AptitudeAdminPanel />
                    </Layout>
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/hackathons"
                element={
                  <AdminRoute>
                    <Layout>
                      <HackathonAdminPanel />
                    </Layout>
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/aptitude/create-question"
                element={
                  <AdminRoute>
                    <Layout>
                      <AptitudeQuestionCreateEditPage />
                    </Layout>
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/aptitude/edit-question/:questionId"
                element={
                  <AdminRoute>
                    <Layout>
                      <AptitudeQuestionCreateEditPage />
                    </Layout>
                  </AdminRoute>
                }
              />

              {/* Fallback to Home */}
              <Route path="*" element={<NavigateToHome />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Helper redirect component for unmatched paths
const NavigateToHome: React.FC = () => {
  React.useEffect(() => {
    window.location.href = '/';
  }, []);
  return null;
};

export default App;

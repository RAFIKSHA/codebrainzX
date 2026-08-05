import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import DashboardLayout from './components/layout/DashboardLayout';
import { ProtectedRoute, AdminRoute } from './components/layout/ProtectedRoute';

// Pages
import LandingPage from './pages/landing/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import LearningSections from './pages/student/LearningSections';
import CodingDashboard from './pages/student/Dashboard';
import LevelQuestions from './pages/student/LevelQuestions';
import QuestionPage from './pages/question/QuestionPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import { 
  InterviewDashboard, McqDashboard, 
  CoursesDashboard, AiPracticeDashboard 
} from './pages/student/Placeholders';
import AptitudeDashboard from './pages/student/AptitudeDashboard';
import AptitudePracticeSelection from './pages/student/AptitudePracticeSelection';
import AptitudeTestEngine from './pages/student/AptitudeTestEngine';
import AptitudeResultPage from './pages/student/AptitudeResultPage';
import AptitudeAdminPanel from './pages/admin/AptitudeAdminPanel';
import AptitudeCategoriesPage from './pages/student/AptitudeCategoriesPage';
import AptitudeTopicsPage from './pages/student/AptitudeTopicsPage';
import AptitudeSubTopicsPage from './pages/student/AptitudeSubTopicsPage';
import AptitudeMCQPracticePage from './pages/student/AptitudeMCQPracticePage';
import CodingTestListPage from './pages/student/CodingTestListPage';
import CodingTestEngine from './pages/student/CodingTestEngine';
import CodingTestResultPage from './pages/student/CodingTestResultPage';
import AptitudeQuestionCreateEditPage from './pages/admin/AptitudeQuestionCreateEditPage';

// Hackathon Pages
import HackathonDashboard from './pages/student/HackathonDashboard';
import HackathonDetails from './pages/student/HackathonDetails';
import HackathonRegister from './pages/student/HackathonRegister';
import HackathonPayment from './pages/student/HackathonPayment';
import HackathonAdminPanel from './pages/admin/HackathonAdminPanel';

// Tutorials Pages
import TutorialsHomePage from './pages/student/TutorialsHomePage';
import TutorialLearningPage from './pages/student/TutorialLearningPage';
import TutorialsAdminPanel from './pages/admin/TutorialsAdminPanel';


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
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AptitudeDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/aptitude/practice"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AptitudePracticeSelection />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/aptitude/categories"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AptitudeCategoriesPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/aptitude/category/:categoryId"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AptitudeTopicsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/aptitude/topic/:topicId"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AptitudeSubTopicsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/aptitude/subtopic/:subtopicId/practice"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AptitudeMCQPracticePage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/aptitude/test/:testId"
                element={
                  <ProtectedRoute>
                    <Layout showFooter={false}>
                      <AptitudeTestEngine />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/aptitude/result/:attemptId"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AptitudeResultPage />
                    </DashboardLayout>
                  </ProtectedRoute>
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
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <McqDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/contests"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <CodingTestListPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
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

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, UserMeView, TopicViewSet, QuestionLevelViewSet,
    QuestionViewSet, TestCaseViewSet, LanguageViewSet, SubmissionViewSet, AdminStatsView,
    SectionViewSet, ContentItemViewSet, UserViewSet,
    GoogleLoginView, EmailOTPSendView, RegisterSendOTPView, RegisterVerifyView, ForgotPasswordVerifyView,
    ProfileStatsView
)
from .views_aptitude import (
    AptitudeDashboardViewSet, AptitudeCategoryViewSet, AptitudeQuestionViewSet,
    AptitudeTestViewSet, AptitudeTestAttemptViewSet, AptitudeBookmarkViewSet,
    GamificationViewSet, AptitudeTopicViewSet, AptitudeSubTopicViewSet,
    AptitudeTrainerViewSet
)
from .views_coding_test import CodingTestViewSet, CodingTestAttemptViewSet
from .views_test_series import (
    TestSeriesCategoryViewSet, TestSeriesCompanyViewSet, TestSeriesViewSet,
    IndividualTestViewSet, IndividualTestAttemptViewSet
)
from .views_hackathon import (
    HackathonViewSet, TeamViewSet, ApplicationViewSet, PaymentViewSet,
    CertificateViewSet, EmailViewSet, HackathonSettingViewSet, NotificationViewSet,
    AnalyticsView, FileUploadView,
    ProblemStatementViewSet, ProblemApplicationViewSet
)
from .views_tutorials import (
    TutorialLanguageViewSet, TutorialChapterViewSet, TutorialLessonViewSet,
    TutorialLessonBlockViewSet, TutorialQuizViewSet, TutorialQuizQuestionViewSet,
    TutorialPracticeQuestionViewSet, TutorialLessonResourceViewSet,
    TutorialMediaViewSet, TutorialAdminAnalyticsView
)

router = DefaultRouter()
router.register('coding/tests', CodingTestViewSet, basename='coding-test')
router.register('coding/attempts', CodingTestAttemptViewSet, basename='coding-attempt')

router.register('test-series/categories', TestSeriesCategoryViewSet, basename='test-series-category')
router.register('test-series/companies', TestSeriesCompanyViewSet, basename='test-series-company')
router.register('test-series/series', TestSeriesViewSet, basename='test-series')
router.register('test-series/tests', IndividualTestViewSet, basename='test-series-test')
router.register('test-series/attempts', IndividualTestAttemptViewSet, basename='test-series-attempt')

router.register('sections', SectionViewSet, basename='section')
router.register('contentitems', ContentItemViewSet, basename='contentitem')
router.register('users', UserViewSet, basename='user')
router.register('topics', TopicViewSet, basename='topic')
router.register('levels', QuestionLevelViewSet, basename='level')
router.register('questions', QuestionViewSet, basename='question')
router.register('testcases', TestCaseViewSet, basename='testcase')
router.register('languages', LanguageViewSet, basename='language')
router.register('submissions', SubmissionViewSet, basename='submission')

router.register('aptitude/dashboard', AptitudeDashboardViewSet, basename='aptitude-dashboard')
router.register('aptitude/trainers', AptitudeTrainerViewSet, basename='aptitude-trainer')
router.register('aptitude/categories', AptitudeCategoryViewSet, basename='aptitude-category')
router.register('aptitude/topics', AptitudeTopicViewSet, basename='aptitude-topic')
router.register('aptitude/subtopics', AptitudeSubTopicViewSet, basename='aptitude-subtopic')
router.register('aptitude/questions', AptitudeQuestionViewSet, basename='aptitude-question')
router.register('aptitude/tests', AptitudeTestViewSet, basename='aptitude-test')
router.register('aptitude/attempts', AptitudeTestAttemptViewSet, basename='aptitude-attempt')
router.register('aptitude/bookmarks', AptitudeBookmarkViewSet, basename='aptitude-bookmark')
router.register('aptitude/gamification', GamificationViewSet, basename='aptitude-gamification')

# Hackathon Module routers
router.register('hackathons', HackathonViewSet, basename='hackathon')
router.register('hackathon-teams', TeamViewSet, basename='hackathon-team')
router.register('hackathon-applications', ApplicationViewSet, basename='hackathon-application')
router.register('hackathon-payments', PaymentViewSet, basename='hackathon-payment')
router.register('hackathon-certificates', CertificateViewSet, basename='hackathon-certificate')
router.register('hackathon-emails', EmailViewSet, basename='hackathon-email')
router.register('hackathon-settings', HackathonSettingViewSet, basename='hackathon-setting')
router.register('hackathon-notifications', NotificationViewSet, basename='hackathon-notification')
router.register('hackathon-problem-statements', ProblemStatementViewSet, basename='hackathon-problem-statement')
router.register('hackathon-problem-applications', ProblemApplicationViewSet, basename='hackathon-problem-application')

# Tutorials Module routers
router.register('tutorials/languages', TutorialLanguageViewSet, basename='tutorial-language')
router.register('tutorials/chapters', TutorialChapterViewSet, basename='tutorial-chapter')
router.register('tutorials/lessons', TutorialLessonViewSet, basename='tutorial-lesson')
router.register('tutorials/blocks', TutorialLessonBlockViewSet, basename='tutorial-block')
router.register('tutorials/quizzes', TutorialQuizViewSet, basename='tutorial-quiz')
router.register('tutorials/quiz-questions', TutorialQuizQuestionViewSet, basename='tutorial-quiz-question')
router.register('tutorials/practices', TutorialPracticeQuestionViewSet, basename='tutorial-practice')
router.register('tutorials/resources', TutorialLessonResourceViewSet, basename='tutorial-resource')
router.register('tutorials/media', TutorialMediaViewSet, basename='tutorial-media')

urlpatterns = [
    # Auth endpoints
    path('auth/register/send-otp/', RegisterSendOTPView.as_view(), name='register-send-otp'),
    path('auth/register/verify/', RegisterVerifyView.as_view(), name='register-verify'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/me/', UserMeView.as_view(), name='me'),
    path('auth/google/', GoogleLoginView.as_view(), name='google-login'),
    path('auth/otp/send/', EmailOTPSendView.as_view(), name='otp-send'),
    path('auth/forgot-password/reset/', ForgotPasswordVerifyView.as_view(), name='forgot-password-reset'),
    
    # Stats endpoints
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('profile/stats/', ProfileStatsView.as_view(), name='profile-stats'),
    
    # Custom Hackathon endpoints
    path('admin/hackathons/analytics/', AnalyticsView.as_view(), name='hackathon-analytics'),
    path('hackathons/upload/', FileUploadView.as_view(), name='hackathon-upload'),
    
    # Custom Tutorials endpoints
    path('tutorials/admin/analytics/', TutorialAdminAnalyticsView.as_view(), name='tutorial-admin-analytics'),
    
    # Resource endpoints
    path('', include(router.urls)),
]


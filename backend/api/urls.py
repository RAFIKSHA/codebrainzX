from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, UserMeView, TopicViewSet, QuestionLevelViewSet,
    QuestionViewSet, TestCaseViewSet, LanguageViewSet, SubmissionViewSet, AdminStatsView,
    SectionViewSet, ContentItemViewSet, UserViewSet
)
from .views_aptitude import (
    AptitudeDashboardViewSet, AptitudeCategoryViewSet, AptitudeQuestionViewSet,
    AptitudeTestViewSet, AptitudeTestAttemptViewSet, AptitudeBookmarkViewSet,
    GamificationViewSet, AptitudeTopicViewSet, AptitudeSubTopicViewSet
)
from .views_coding_test import CodingTestViewSet, CodingTestAttemptViewSet

router = DefaultRouter()
router.register('coding/tests', CodingTestViewSet, basename='coding-test')
router.register('coding/attempts', CodingTestAttemptViewSet, basename='coding-attempt')

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
router.register('aptitude/categories', AptitudeCategoryViewSet, basename='aptitude-category')
router.register('aptitude/topics', AptitudeTopicViewSet, basename='aptitude-topic')
router.register('aptitude/subtopics', AptitudeSubTopicViewSet, basename='aptitude-subtopic')
router.register('aptitude/questions', AptitudeQuestionViewSet, basename='aptitude-question')
router.register('aptitude/tests', AptitudeTestViewSet, basename='aptitude-test')
router.register('aptitude/attempts', AptitudeTestAttemptViewSet, basename='aptitude-attempt')
router.register('aptitude/bookmarks', AptitudeBookmarkViewSet, basename='aptitude-bookmark')
router.register('aptitude/gamification', GamificationViewSet, basename='aptitude-gamification')

urlpatterns = [
    # Auth endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/me/', UserMeView.as_view(), name='me'),
    
    # Stats endpoints
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    
    # Resource endpoints
    path('', include(router.urls)),
]

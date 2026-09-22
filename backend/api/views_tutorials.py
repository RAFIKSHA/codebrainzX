from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import models
from django.db import transaction
from django.utils import timezone
from .models_tutorials import (
    TutorialLanguage, TutorialChapter, TutorialLesson, TutorialLessonBlock,
    TutorialQuiz, TutorialQuizQuestion, TutorialPracticeQuestion,
    TutorialLessonResource, TutorialMedia, TutorialLessonAnalytics
)
from .serializers_tutorials import (
    TutorialLanguageSerializer, TutorialChapterSerializer, TutorialLessonBlockSerializer,
    TutorialQuizQuestionSerializer, TutorialQuizSerializer, TutorialPracticeQuestionSerializer,
    TutorialLessonResourceSerializer, TutorialMediaSerializer, TutorialLessonAnalyticsSerializer,
    TutorialLessonListSerializer, TutorialLessonDetailSerializer
)
from .permissions import IsAdminUser

class TutorialLanguageViewSet(viewsets.ModelViewSet):
    queryset = TutorialLanguage.objects.all()
    serializer_class = TutorialLanguageSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = TutorialLanguage.objects.all()
        # If user is not admin, only show published languages
        user = self.request.user
        is_admin = False
        if user and user.is_authenticated:
            is_admin = (hasattr(user, 'profile') and user.profile.role == 'admin') or user.is_staff
            
        if not is_admin:
            queryset = queryset.filter(status='published')
        return queryset

    @action(detail=False, methods=['post'], url_path='reorder', permission_classes=[IsAdminUser])
    def reorder(self, request):
        order_list = request.data.get('order', [])
        with transaction.atomic():
            for index, lang_id in enumerate(order_list):
                TutorialLanguage.objects.filter(id=lang_id).update(display_order=index)
        return Response({'status': 'reordered'})


class TutorialChapterViewSet(viewsets.ModelViewSet):
    queryset = TutorialChapter.objects.all()
    serializer_class = TutorialChapterSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = TutorialChapter.objects.all()
        user = self.request.user
        is_admin = False
        if user and user.is_authenticated:
            is_admin = (hasattr(user, 'profile') and user.profile.role == 'admin') or user.is_staff
            
        if not is_admin:
            queryset = queryset.filter(status='published')

        language_id = self.request.query_params.get('language')
        language_slug = self.request.query_params.get('language_slug')
        if language_id:
            queryset = queryset.filter(language_id=language_id)
        elif language_slug:
            queryset = queryset.filter(language__slug=language_slug)

        return queryset

    @action(detail=False, methods=['post'], url_path='reorder', permission_classes=[IsAdminUser])
    def reorder(self, request):
        order_list = request.data.get('order', [])
        with transaction.atomic():
            for index, chap_id in enumerate(order_list):
                TutorialChapter.objects.filter(id=chap_id).update(display_order=index)
        return Response({'status': 'reordered'})


class TutorialLessonViewSet(viewsets.ModelViewSet):
    queryset = TutorialLesson.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return TutorialLessonListSerializer
        return TutorialLessonDetailSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'lookup', 'increment_view']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = TutorialLesson.objects.all()
        user = self.request.user
        is_admin = False
        if user and user.is_authenticated:
            is_admin = (hasattr(user, 'profile') and user.profile.role == 'admin') or user.is_staff
            
        if not is_admin:
            queryset = queryset.filter(status='published')

        language_id = self.request.query_params.get('language')
        language_slug = self.request.query_params.get('language_slug')
        chapter_id = self.request.query_params.get('chapter')
        chapter_slug = self.request.query_params.get('chapter_slug')

        if language_id:
            queryset = queryset.filter(language_id=language_id)
        elif language_slug:
            queryset = queryset.filter(language__slug=language_slug)

        if chapter_id:
            queryset = queryset.filter(chapter_id=chapter_id)
        elif chapter_slug:
            queryset = queryset.filter(chapter__slug=chapter_slug)

        return queryset

    @action(detail=False, methods=['post'], url_path='reorder', permission_classes=[IsAdminUser])
    def reorder(self, request):
        order_list = request.data.get('order', [])
        with transaction.atomic():
            for index, lesson_id in enumerate(order_list):
                TutorialLesson.objects.filter(id=lesson_id).update(display_order=index)
        return Response({'status': 'reordered'})

    @action(detail=False, methods=['get'], url_path='lookup', permission_classes=[permissions.AllowAny])
    def lookup(self, request):
        language_slug = request.query_params.get('language_slug')
        lesson_slug = request.query_params.get('lesson_slug')
        if not language_slug or not lesson_slug:
            return Response({'error': 'language_slug and lesson_slug are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            lesson = TutorialLesson.objects.get(language__slug=language_slug, slug=lesson_slug)
            
            user = request.user
            is_admin = False
            if user and user.is_authenticated:
                is_admin = (hasattr(user, 'profile') and user.profile.role == 'admin') or user.is_staff
            
            if not is_admin and lesson.status != 'published':
                return Response({'error': 'Lesson is not published'}, status=status.HTTP_403_FORBIDDEN)
                
            # Autocreate analytics if missing
            analytics, _ = TutorialLessonAnalytics.objects.get_or_create(lesson=lesson)
            analytics.views_count += 1
            analytics.save()
            
            serializer = self.get_serializer(lesson)
            return Response(serializer.data)
        except TutorialLesson.DoesNotExist:
            return Response({'error': 'Lesson not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], url_path='view', permission_classes=[permissions.AllowAny])
    def increment_view(self, request, pk=None):
        lesson = self.get_object()
        reading_time = request.data.get('reading_time', 0)
        
        analytics, _ = TutorialLessonAnalytics.objects.get_or_create(lesson=lesson)
        analytics.views_count += 1
        if reading_time > 0:
            analytics.total_reading_time += int(reading_time)
            analytics.average_reading_time = float(analytics.total_reading_time) / float(analytics.views_count)
        analytics.save()

        # Log User progress if authenticated
        user = request.user
        if user and user.is_authenticated:
            from .models_tutorials import UserLessonProgress
            progress, created = UserLessonProgress.objects.get_or_create(
                user=user,
                lesson=lesson,
                defaults={'language': lesson.language, 'chapter': lesson.chapter}
            )
            progress.save() # Auto-updates last_accessed_at due to auto_now=True

        return Response({'views': analytics.views_count})

    @action(detail=True, methods=['post'], url_path='complete', permission_classes=[permissions.IsAuthenticated])
    def complete_lesson(self, request, pk=None):
        lesson = self.get_object()
        completed = request.data.get('completed', True)
        
        from .models_tutorials import UserLessonProgress
        progress, created = UserLessonProgress.objects.get_or_create(
            user=request.user,
            lesson=lesson,
            defaults={'language': lesson.language, 'chapter': lesson.chapter}
        )
        progress.completed = completed
        progress.save()
        
        return Response({'completed': progress.completed})

    @action(detail=False, methods=['get'], url_path='user-progress', permission_classes=[permissions.IsAuthenticated])
    def get_user_progress(self, request):
        from .models_tutorials import UserLessonProgress
        progresses = UserLessonProgress.objects.filter(user=request.user)
        completed_slugs = [f"{p.language.slug}/{p.lesson.slug}" for p in progresses if p.completed]
        last_accessed = None
        
        latest = progresses.first()
        if latest:
            last_accessed = {
                'lesson_id': latest.lesson.id,
                'lesson_title': latest.lesson.title,
                'lesson_slug': latest.lesson.slug,
                'chapter_id': latest.chapter.id,
                'chapter_name': latest.chapter.name,
                'language_id': latest.language.id,
                'language_name': latest.language.name,
                'language_slug': latest.language.slug,
                'last_accessed_at': latest.last_accessed_at
            }
            
        return Response({
            'completed_slugs': completed_slugs,
            'last_accessed': last_accessed
        })

    @action(detail=False, methods=['get'], url_path='continue-learning', permission_classes=[permissions.AllowAny])
    def continue_learning(self, request):
        from .models_tutorials import UserLessonProgress, TutorialLesson, TutorialLanguage
        user = request.user
        
        target_lesson = None
        
        if user and user.is_authenticated:
            # 1. Most recently accessed incomplete lesson
            progresses = UserLessonProgress.objects.filter(user=user).order_by('-last_accessed_at')
            incomplete_progress = progresses.filter(completed=False).first()
            
            if incomplete_progress:
                target_lesson = incomplete_progress.lesson
            else:
                # 2. Most recently accessed incomplete language/course
                for p in progresses:
                    total_lessons_in_lang = TutorialLesson.objects.filter(language=p.language, status='published')
                    completed_lessons_in_lang = UserLessonProgress.objects.filter(user=user, language=p.language, completed=True)
                    
                    if completed_lessons_in_lang.count() < total_lessons_in_lang.count():
                        completed_ids = completed_lessons_in_lang.values_list('lesson_id', flat=True)
                        next_incomplete = total_lessons_in_lang.exclude(id__in=completed_ids).order_by('display_order', 'id').first()
                        if next_incomplete:
                            target_lesson = next_incomplete
                            break
                        
        # 3. Fallback to default first published lesson
        if not target_lesson:
            first_lang = TutorialLanguage.objects.filter(status='published').order_by('display_order', 'id').first()
            if first_lang:
                target_lesson = TutorialLesson.objects.filter(language=first_lang, status='published').order_by('display_order', 'id').first()

        if not target_lesson:
            return Response({'detail': 'No lessons available.', 'course_name': None}, status=status.HTTP_200_OK)

        lang = target_lesson.language
        total_lessons = TutorialLesson.objects.filter(language=lang, status='published').count()
        completed_lessons = 0
        if user and user.is_authenticated:
            completed_lessons = UserLessonProgress.objects.filter(user=user, language=lang, completed=True).count()
        progress_pct = int((completed_lessons / total_lessons) * 100) if total_lessons > 0 else 0

        last_accessed_str = "Start Learning"
        if user and user.is_authenticated:
            user_progress_record = UserLessonProgress.objects.filter(user=user, lesson=target_lesson).first()
            if user_progress_record:
                from django.utils.timezone import now
                delta = now() - user_progress_record.last_accessed_at
                if delta.days > 0:
                    last_accessed_str = f"{delta.days} days ago"
                elif delta.seconds >= 3600:
                    last_accessed_str = f"{delta.seconds // 3600} hours ago"
                elif delta.seconds >= 60:
                    last_accessed_str = f"{delta.seconds // 60} minutes ago"
                else:
                    last_accessed_str = "just now"
            else:
                last_accessed_str = "Recently"

        return Response({
            'course_name': lang.name,
            'course_slug': lang.slug,
            'chapter_name': target_lesson.chapter.name if target_lesson.chapter else '',
            'lesson_title': target_lesson.title,
            'lesson_slug': target_lesson.slug,
            'progress_percent': progress_pct,
            'completed_lessons': completed_lessons,
            'total_lessons': total_lessons,
            'last_accessed': last_accessed_str
        })


    @action(detail=False, methods=['post'], url_path='run-code', permission_classes=[permissions.AllowAny])
    def run_tutorial_code(self, request):
        code = request.data.get('code', '')
        language_slug = request.data.get('language_slug', '')
        input_data = request.data.get('input_data', '')
        
        if not code or not language_slug:
            return Response({'error': 'code and language_slug are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        from .models import Language
        try:
            lang = Language.objects.get(slug=language_slug)
        except Language.DoesNotExist:
            slug_mapping = {
                'python': 71,
                'py': 71,
                'javascript': 63,
                'js': 63,
                'cpp': 54,
                'c': 50,
                'java': 62
            }
            judge0_id = slug_mapping.get(language_slug, 71)
            class MockLang:
                def __init__(self, j_id):
                    self.judge0_id = j_id
            lang = MockLang(judge0_id)
            
        from .services import Judge0Service
        test_cases = [{
            'input_data': input_data,
            'expected_output': ''
        }]
        
        try:
            results = Judge0Service.execute_code_batch(
                source_code=code,
                test_cases=test_cases,
                language_id=lang.judge0_id,
                time_limit=2.0,
                memory_limit=256.0
            )
            if results and len(results) > 0:
                res = results[0]
                return Response({
                    'stdout': res.get('stdout', ''),
                    'status': res.get('status', 'Completed'),
                    'compile_output': res.get('compile_output', ''),
                    'stderr': res.get('stderr', ''),
                    'time': res.get('execution_time', 0.0),
                    'memory': res.get('memory_usage', 0.0)
                })
            else:
                return Response({'error': 'Execution returned empty response'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class TutorialLessonBlockViewSet(viewsets.ModelViewSet):
    queryset = TutorialLessonBlock.objects.all()
    serializer_class = TutorialLessonBlockSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]


class TutorialQuizViewSet(viewsets.ModelViewSet):
    queryset = TutorialQuiz.objects.all()
    serializer_class = TutorialQuizSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]


class TutorialQuizQuestionViewSet(viewsets.ModelViewSet):
    queryset = TutorialQuizQuestion.objects.all()
    serializer_class = TutorialQuizQuestionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]


class TutorialPracticeQuestionViewSet(viewsets.ModelViewSet):
    queryset = TutorialPracticeQuestion.objects.all()
    serializer_class = TutorialPracticeQuestionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]


class TutorialLessonResourceViewSet(viewsets.ModelViewSet):
    queryset = TutorialLessonResource.objects.all()
    serializer_class = TutorialLessonResourceSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]


class TutorialMediaViewSet(viewsets.ModelViewSet):
    queryset = TutorialMedia.objects.all()
    serializer_class = TutorialMediaSerializer
    permission_classes = [IsAdminUser]


class TutorialAdminAnalyticsView(generics.RetrieveAPIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request, *args, **kwargs):
        total_languages = TutorialLanguage.objects.count()
        total_chapters = TutorialChapter.objects.count()
        total_lessons = TutorialLesson.objects.count()
        published_lessons = TutorialLesson.objects.filter(status='published').count()
        draft_lessons = TutorialLesson.objects.filter(status='draft').count()
        
        # Most viewed lessons
        most_viewed = TutorialLessonAnalytics.objects.select_related('lesson', 'lesson__language').order_by('-views_count')[:10]
        most_viewed_data = []
        for item in most_viewed:
            most_viewed_data.append({
                'lesson_id': item.lesson.id,
                'title': item.lesson.title,
                'language': item.lesson.language.name,
                'views': item.views_count,
                'avg_reading_time': round(item.average_reading_time, 2)
            })
            
        # Top languages by views
        languages = TutorialLanguage.objects.annotate(
            total_views=models.Sum('lessons__analytics__views_count')
        ).order_by('-total_views')[:5]
        
        top_languages = []
        for lang in languages:
            top_languages.append({
                'name': lang.name,
                'views': lang.total_views or 0
            })
            
        # Average reading time across all lessons
        total_views = TutorialLessonAnalytics.objects.aggregate(models.Sum('views_count'))['views_count__sum'] or 0
        total_time = TutorialLessonAnalytics.objects.aggregate(models.Sum('total_reading_time'))['total_reading_time__sum'] or 0
        avg_time = round(total_time / total_views, 2) if total_views > 0 else 0
        
        return Response({
            'total_languages': total_languages,
            'total_chapters': total_chapters,
            'total_lessons': total_lessons,
            'published_lessons': published_lessons,
            'draft_lessons': draft_lessons,
            'avg_reading_time': avg_time,
            'most_viewed_lessons': most_viewed_data,
            'top_languages': top_languages
        })

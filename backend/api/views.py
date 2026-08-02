from rest_framework import viewsets, status, permissions, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Count, Q
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile, Topic, QuestionLevel, Question, TestCase, Language, Submission, UserProgress, Section, ContentItem
from .serializers import (
    UserSerializer, RegisterSerializer, TopicSerializer, QuestionLevelSerializer,
    QuestionListSerializer, QuestionDetailSerializer, TestCaseSerializer,
    LanguageSerializer, SubmissionSerializer, SectionSerializer, ContentItemSerializer
)
from .permissions import IsAdminUser, IsStudentUser
from .services import Judge0Service

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

class UserMeView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        # Create Topic
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        topic = serializer.save()
        
        # Automatically create standard levels (basic, easy, medium, hard) for new topic
        for lvl in ['basic', 'easy', 'medium', 'hard']:
            QuestionLevel.objects.create(topic=topic, level=lvl)
            
        return Response(TopicSerializer(topic, context=self.get_serializer_context()).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        topic = self.get_object()
        questions = topic.questions.all().order_by('order', 'created_at')
        
        user = request.user
        is_admin = False
        if user and user.is_authenticated:
            is_admin = (hasattr(user, 'profile') and user.profile.role == 'admin') or user.is_staff
            
        if not is_admin:
            questions = questions.filter(is_published=True)
            
        serializer = QuestionListSerializer(questions, many=True, context={'request': request})
        return Response(serializer.data)

class QuestionLevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = QuestionLevel.objects.all()
    serializer_class = QuestionLevelSerializer
    permission_classes = (permissions.IsAuthenticated,)

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return QuestionListSerializer
        return QuestionDetailSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'run_code', 'submit_code']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = Question.objects.all()
        # Filter by published unless Admin
        is_admin = False
        user = self.request.user
        if user and user.is_authenticated:
            is_admin = (hasattr(user, 'profile') and user.profile.role == 'admin') or user.is_staff
            
        if not is_admin:
            queryset = queryset.filter(is_published=True)

        # Filters
        topic_id = self.request.query_params.get('topic')
        level_id = self.request.query_params.get('level')
        
        if topic_id:
            queryset = queryset.filter(topic_id=topic_id)
        if level_id:
            queryset = queryset.filter(level__level=level_id)
            
        return queryset

    @action(detail=True, methods=['post'], url_path='run')
    def run_code(self, request, pk=None):
        """
        Executes student code against visible (non-hidden) test cases.
        Does not record a submission in the database.
        """
        question = self.get_object()
        code = request.data.get('code')
        language_slug = request.data.get('language_slug')

        if not code or not language_slug:
            return Response({'error': 'Code and language_slug are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            language = Language.objects.get(slug=language_slug)
        except Language.DoesNotExist:
            return Response({'error': f'Unsupported language: {language_slug}'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch visible test cases only
        test_cases = question.test_cases.filter(is_hidden=False)
        if not test_cases.exists():
            return Response({'error': 'No visible test cases available for execution'}, status=status.HTTP_400_BAD_REQUEST)

        result = Judge0Service.execute_code_batch(
            source_code=code,
            language_id=language.judge0_id,
            test_cases=test_cases,
            time_limit=question.time_limit,
            memory_limit=question.memory_limit
        )

        return Response(result)

    @action(detail=True, methods=['post'], url_path='submit')
    def submit_code(self, request, pk=None):
        """
        Executes student code against all test cases, records a submission in the DB,
        and unlocks progress if valid.
        """
        question = self.get_object()
        code = request.data.get('code')
        language_slug = request.data.get('language_slug')

        if not code or not language_slug:
            return Response({'error': 'Code and language_slug are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            language = Language.objects.get(slug=language_slug)
        except Language.DoesNotExist:
            return Response({'error': f'Unsupported language: {language_slug}'}, status=status.HTTP_400_BAD_REQUEST)

        test_cases = question.test_cases.all()
        if not test_cases.exists():
            return Response({'error': 'No test cases available for this question'}, status=status.HTTP_400_BAD_REQUEST)

        # Run compilation batch
        result = Judge0Service.execute_code_batch(
            source_code=code,
            language_id=language.judge0_id,
            test_cases=test_cases,
            time_limit=question.time_limit,
            memory_limit=question.memory_limit
        )

        # Create submission
        submission = Submission.objects.create(
            user=request.user,
            question=question,
            language=language,
            code=code,
            status=result['status'],
            error_message=result.get('error_message'),
            execution_time=result.get('max_time'),
            memory_usage=result.get('max_memory'),
            passed_test_cases=result['passed_count'],
            total_test_cases=result['total_count']
        )

        # Update progression on success
        if result['status'] == 'Accepted':
            progress, created = UserProgress.objects.get_or_create(
                user=request.user,
                question=question
            )
            if not progress.solved:
                progress.solved = True
                progress.save()

        # Format serializer payload
        serializer = SubmissionSerializer(submission)
        response_data = serializer.data
        response_data['details'] = result['test_case_details']
        
        return Response(response_data)

class TestCaseViewSet(viewsets.ModelViewSet):
    queryset = TestCase.objects.all()
    serializer_class = TestCaseSerializer
    permission_classes = (IsAdminUser,)

    def get_queryset(self):
        question_id = self.request.query_params.get('question')
        if question_id:
            return TestCase.objects.filter(question_id=question_id)
        return TestCase.objects.all()

class LanguageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer
    permission_classes = (permissions.AllowAny,)

class SubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        is_admin = (hasattr(user, 'profile') and user.profile.role == 'admin') or user.is_staff
        
        queryset = Submission.objects.all()
        
        # Students can only view their own submissions
        if not is_admin:
            queryset = queryset.filter(user=user)
            
        question_id = self.request.query_params.get('question')
        if question_id:
            queryset = queryset.filter(question_id=question_id)
            
        return queryset

class AdminStatsView(generics.RetrieveAPIView):
    permission_classes = (IsAdminUser,)

    def get(self, request, *args, **kwargs):
        total_students = Profile.objects.filter(role='student').count()
        total_submissions = Submission.objects.count()
        total_questions = Question.objects.count()
        
        # Solved questions breakdown
        accepted_submissions = Submission.objects.filter(status='Accepted').count()
        
        # Most popular topics based on submission count
        popular_topics = Topic.objects.annotate(
            sub_count=Count('questions__submissions')
        ).order_list = Topic.objects.annotate(
            sub_count=Count('questions__submissions')
        ).order_by('-sub_count')[:5]

        topics_data = [{'name': t.name, 'submissions': t.sub_count} for t in popular_topics]

        return Response({
            'total_students': total_students,
            'total_submissions': total_submissions,
            'total_questions': total_questions,
            'accepted_submissions': accepted_submissions,
            'popular_topics': topics_data
        })


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]


class ContentItemViewSet(viewsets.ModelViewSet):
    queryset = ContentItem.objects.all()
    serializer_class = ContentItemSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = ContentItem.objects.all()
        section_slug = self.request.query_params.get('section')
        if section_slug:
            queryset = queryset.filter(section__slug=section_slug)
        return queryset


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsAdminUser,)

    def partial_update(self, request, *args, **kwargs):
        user = self.get_object()
        role = request.data.get('role')
        if role in ['student', 'admin']:
            profile = user.profile
            profile.role = role
            profile.save()
        return super().partial_update(request, *args, **kwargs)

from rest_framework import viewsets, status, permissions, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Count, Q
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
import random
import requests
from django.core.mail import send_mail

from .models import Profile, EmailOTP, Topic, QuestionLevel, Question, TestCase, Language, Submission, UserProgress, Section, ContentItem
from .serializers import (
    UserSerializer, RegisterSerializer, TopicSerializer, QuestionLevelSerializer,
    QuestionListSerializer, QuestionDetailSerializer, TestCaseSerializer,
    LanguageSerializer, SubmissionSerializer, SectionSerializer, ContentItemSerializer,
    GoogleAuthSerializer, EmailOTPSendSerializer, EmailOTPVerifySerializer, ForgotPasswordVerifySerializer,
    RegisterSendOTPSerializer, RegisterVerifySerializer
)
from .permissions import IsAdminUser, IsStudentUser
from .services import Judge0Service
from django.contrib.auth.hashers import make_password, check_password

def send_otp_email(email, otp, purpose_text="Verify your sign-in"):
    subject = f"Your Verification Code: {otp}"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>CodexPetra Verification Code</title>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #f4f6fa;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                margin-top: 40px;
                border: 1px solid #e1e8ed;
            }}
            .header {{
                background-color: #0b0d19;
                padding: 30px;
                text-align: center;
                border-bottom: 2px solid #3b82f6;
            }}
            .logo {{
                font-size: 24px;
                font-weight: 800;
                color: #ffffff;
                text-decoration: none;
            }}
            .logo-x {{
                color: #3b82f6;
            }}
            .content {{
                padding: 40px;
                text-align: center;
            }}
            .title {{
                font-size: 20px;
                font-weight: 700;
                color: #0f172a;
                margin-bottom: 12px;
            }}
            .desc {{
                font-size: 14px;
                color: #64748b;
                line-height: 1.6;
                margin-bottom: 30px;
            }}
            .code-box {{
                display: inline-block;
                background-color: #f1f5f9;
                border: 2px dashed #cbd5e1;
                border-radius: 12px;
                padding: 16px 32px;
                font-size: 32px;
                font-weight: 800;
                color: #2563eb;
                letter-spacing: 6px;
                margin-bottom: 30px;
            }}
            .footer {{
                background-color: #f8fafc;
                padding: 24px;
                text-align: center;
                font-size: 12px;
                color: #94a3b8;
                border-top: 1px solid #f1f5f9;
            }}
            .alert-text {{
                color: #ef4444;
                font-size: 11px;
                margin-top: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="logo">Codex<span class="logo-x">Petra</span></span>
            </div>
            <div class="content">
                <div class="title">{purpose_text}</div>
                <p class="desc">Please use the verification code below to complete your action. This code is valid for 5 minutes and can only be used once.</p>
                <div class="code-box">{otp}</div>
                <p class="desc">If you did not request this code, please ignore this email.</p>
                <p class="alert-text">For security reasons, never share this code with anyone.</p>
            </div>
            <div class="footer">
                &copy; 2026 CodexPetra. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    """
    text_content = f"Your verification code is: {otp}. This code is valid for 5 minutes."
    send_mail(
        subject=subject,
        message=text_content,
        from_email=None,
        recipient_list=[email],
        html_message=html_content,
        fail_silently=False
    )

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Explicitly set full_name to username and email_verified to false for email signups
        profile = user.profile
        profile.full_name = user.username
        profile.login_provider = 'email'
        profile.email_verified = False
        profile.save()
        
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
        
        # 1. Lookup user by username or email
        user_obj = User.objects.filter(Q(username=username) | Q(email=username)).first()
        if user_obj and hasattr(user_obj, 'profile'):
            profile = user_obj.profile
            # Check lockout status
            if profile.locked_until and profile.locked_until > timezone.now():
                diff_sec = int((profile.locked_until - timezone.now()).total_seconds())
                minutes = (diff_sec // 60) + 1
                return Response(
                    {'error': f'Account temporarily locked due to repeated failures. Try again in {minutes} minute(s).'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # 2. Authenticate
        auth_user = None
        if user_obj:
            auth_user = authenticate(username=user_obj.username, password=password)
            
        if not auth_user:
            # Increment failure counter if user exists
            if user_obj and hasattr(user_obj, 'profile'):
                profile = user_obj.profile
                profile.login_failures += 1
                if profile.login_failures >= 5:
                    profile.locked_until = timezone.now() + timedelta(minutes=15)
                profile.save()
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
        # Authentication succeeded! Reset failures
        profile = auth_user.profile
        profile.login_failures = 0
        profile.locked_until = None
        profile.save()
        
        refresh = RefreshToken.for_user(auth_user)
        return Response({
            'user': UserSerializer(auth_user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

class GoogleLoginView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = GoogleAuthSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        id_token = serializer.validated_data['id_token']
        
        # Call Google TokenInfo endpoint
        try:
            res = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}", timeout=8)
            if res.status_code != 200:
                return Response({'error': 'Invalid Google OAuth token'}, status=status.HTTP_400_BAD_REQUEST)
            payload = res.json()
        except Exception as e:
            return Response({'error': f'Failed to contact Google: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        email = payload.get('email')
        google_id = payload.get('sub')
        name = payload.get('name', '')
        picture = payload.get('picture', '')
        email_verified = payload.get('email_verified') == 'true' or payload.get('email_verified') is True
        
        if not email:
            return Response({'error': 'Google token did not provide email address.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check if user exists by google_id or email
        user = User.objects.filter(profile__google_id=google_id).first()
        if not user:
            user = User.objects.filter(email=email).first()
            
        if user:
            # Sync / link google account properties
            profile = user.profile
            profile.google_id = google_id
            profile.profile_photo = picture
            profile.login_provider = 'google'
            if email_verified:
                profile.email_verified = True
            profile.save()
        else:
            # Create user and profile
            username_base = email.split('@')[0]
            username = username_base
            count = 1
            while User.objects.filter(username=username).exists():
                username = f"{username_base}_{count}"
                count += 1
                
            user = User.objects.create_user(
                username=username,
                email=email,
                password=User.objects.make_random_password()
            )
            profile = user.profile
            profile.full_name = name
            profile.google_id = google_id
            profile.profile_photo = picture
            profile.login_provider = 'google'
            profile.email_verified = email_verified
            profile.save()
            
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

class EmailOTPSendView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = EmailOTPSendSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        purpose = serializer.validated_data['purpose']
        
        # Exists check for forgot_password
        if purpose == 'forgot_password' and not User.objects.filter(email=email).exists():
            return Response({'message': 'If an account is associated with this email, an OTP has been sent.'})
            
        # Throttling resend limits (30 seconds)
        existing = EmailOTP.objects.filter(email=email, purpose=purpose).first()
        if existing:
            time_passed = timezone.now() - existing.created_at
            if time_passed < timedelta(seconds=30):
                seconds_left = int(30 - time_passed.total_seconds())
                return Response(
                    {'error': f'Please wait {seconds_left} second(s) before requesting another OTP.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
                
        # Generate 6-digit random code
        otp = f"{random.randint(100000, 999999)}"
        otp_hash = make_password(otp)
        expires_at = timezone.now() + timedelta(minutes=5)
        
        # Save OTP hash in DB
        EmailOTP.objects.update_or_create(
            email=email,
            purpose=purpose,
            defaults={
                'otp_hash': otp_hash,
                'expires_at': expires_at,
                'attempts': 0,
                'created_at': timezone.now()
            }
        )
        
        # Send Email
        purpose_text = "Reset your password" if purpose == 'forgot_password' else "Verify your sign-in"
        try:
            send_otp_email(email, otp, purpose_text)
        except Exception as e:
            return Response(
                {'error': f'Failed to send email. Please check your configuration. Detail: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
        return Response({'message': 'OTP sent successfully.'})

class RegisterSendOTPView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSendOTPSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        # Throttling resend limits (30 seconds)
        existing = EmailOTP.objects.filter(email=email, purpose='register').first()
        if existing:
            time_passed = timezone.now() - existing.created_at
            if time_passed < timedelta(seconds=30):
                seconds_left = int(30 - time_passed.total_seconds())
                return Response(
                    {'error': f'Please wait {seconds_left} second(s) before requesting another OTP.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

        # Generate 6-digit random code
        otp = f"{random.randint(100000, 999999)}"
        otp_hash = make_password(otp)
        expires_at = timezone.now() + timedelta(minutes=5)

        # Save OTP hash in DB
        EmailOTP.objects.update_or_create(
            email=email,
            purpose='register',
            defaults={
                'otp_hash': otp_hash,
                'expires_at': expires_at,
                'attempts': 0,
                'created_at': timezone.now()
            }
        )

        # Send Email
        try:
            send_otp_email(email, otp, "Verify your email to register")
        except Exception as e:
            return Response(
                {'error': f'Failed to send email. Please check your configuration. Detail: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({'message': 'OTP sent successfully.'})

class RegisterVerifyView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterVerifySerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        full_name = serializer.validated_data['full_name']
        password = serializer.validated_data['password']

        # Double check if user exists
        if User.objects.filter(email=email).exists():
            return Response({'error': 'An account with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_record = EmailOTP.objects.filter(email=email, purpose='register').first()
        if not otp_record:
            return Response({'error': 'No verification code requested for this email.'}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.is_expired():
            otp_record.delete()
            return Response({'error': 'Verification code has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.attempts >= 3:
            otp_record.delete()
            return Response({'error': 'Max verification attempts exceeded. Please request a new code.'}, status=status.HTTP_400_BAD_REQUEST)

        if check_password(otp, otp_record.otp_hash):
            # Success! Delete OTP record
            otp_record.delete()

            # Create User
            username_base = email.split('@')[0]
            username = username_base
            count = 1
            while User.objects.filter(username=username).exists():
                username = f"{username_base}_{count}"
                count += 1

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            profile = user.profile
            profile.full_name = full_name
            profile.login_provider = 'email'
            profile.email_verified = True
            profile.save()

            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        else:
            otp_record.attempts += 1
            otp_record.save()
            remaining = 3 - otp_record.attempts
            return Response(
                {'error': f'Invalid code. Remaining attempts: {remaining}'},
                status=status.HTTP_400_BAD_REQUEST
            )

class ForgotPasswordVerifyView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = ForgotPasswordVerifySerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        password = serializer.validated_data['password']
        
        otp_record = EmailOTP.objects.filter(email=email, purpose='forgot_password').first()
        if not otp_record:
            return Response({'error': 'No OTP requested for resetting password.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if otp_record.is_expired():
            otp_record.delete()
            return Response({'error': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if otp_record.attempts >= 3:
            otp_record.delete()
            return Response({'error': 'Max verification attempts exceeded. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if check_password(otp, otp_record.otp_hash):
            user = User.objects.filter(email=email).first()
            if not user:
                return Response({'error': 'No user found associated with this email.'}, status=status.HTTP_404_NOT_FOUND)
                
            # OTP correct! Invalidate OTP and reset password
            otp_record.delete()
            
            user.set_password(password)
            user.save()
            
            # Reset lockout stats
            profile = user.profile
            profile.login_failures = 0
            profile.locked_until = None
            profile.save()
            
            return Response({'message': 'Password has been reset successfully. You can now sign in.'})
        else:
            otp_record.attempts += 1
            otp_record.save()
            remaining = 3 - otp_record.attempts
            return Response(
                {'error': f'Invalid code. Remaining attempts: {remaining}'},
                status=status.HTTP_400_BAD_REQUEST
            )

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

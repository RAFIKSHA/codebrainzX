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
import os
import json
import logging
import requests
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

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
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                margin-top: 40px;
                border: 1px solid #e2e8f0;
            }}
            .header {{
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                padding: 30px 20px;
                text-align: center;
            }}
            .header h1 {{
                color: #ffffff;
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: 0.5px;
            }}
            .content {{
                padding: 40px 30px;
                background-color: #ffffff;
            }}
            .title {{
                font-size: 18px;
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 12px;
            }}
            .desc {{
                font-size: 14px;
                color: #64748b;
                line-height: 1.6;
                margin-bottom: 24px;
            }}
            .code-box {{
                background-color: #f8fafc;
                border: 2px dashed #cbd5e1;
                border-radius: 8px;
                padding: 18px;
                text-align: center;
                font-size: 32px;
                font-weight: 800;
                letter-spacing: 8px;
                color: #2563eb;
                margin-bottom: 24px;
                font-family: monospace;
            }}
            .alert-text {{
                font-size: 12px;
                color: #ef4444;
                font-weight: 500;
                margin-top: 15px;
            }}
            .footer {{
                background-color: #f8fafc;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #94a3b8;
                border-top: 1px solid #e2e8f0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>CodexPetra</h1>
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
    authentication_classes = ()
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
    authentication_classes = ()

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
        profile, _ = Profile.objects.get_or_create(user=auth_user)
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
    authentication_classes = ()
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
            
        # Verify audience claim matches our backend configured GOOGLE_CLIENT_ID for security
        google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
        if google_client_id and payload.get('aud') != google_client_id:
            return Response({'error': 'Audience claim mismatch: token was not issued for this application.'}, status=status.HTTP_400_BAD_REQUEST)
            
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
            profile, _ = Profile.objects.get_or_create(user=user)
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
            profile = Profile.objects.create(
                user=user,
                full_name=name,
                google_id=google_id,
                profile_photo=picture,
                login_provider='google',
                email_verified=email_verified
            )
            
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

class EmailOTPSendView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
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
    authentication_classes = ()
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
    authentication_classes = ()
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
            profile = Profile.objects.create(
                user=user,
                full_name=full_name,
                login_provider='email',
                email_verified=True
            )

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
    authentication_classes = ()
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
            profile, _ = Profile.objects.get_or_create(user=user)
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

class UserMeView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.prefetch_related('levels', 'levels__questions').all().order_by('order', 'id')
    serializer_class = TopicSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user = self.request.user
        if user and user.is_authenticated:
            context['user_solved_ids'] = set(
                UserProgress.objects.filter(user=user, solved=True).values_list('question_id', flat=True)
            )
        else:
            context['user_solved_ids'] = set()
        return context

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
    permission_classes = (permissions.AllowAny,)

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return QuestionListSerializer
        return QuestionDetailSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action in ['run_code', 'submit_code']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        user = self.request.user
        if user and user.is_authenticated:
            context['user_solved_ids'] = set(
                UserProgress.objects.filter(user=user, solved=True).values_list('question_id', flat=True)
            )
        else:
            context['user_solved_ids'] = set()
        return context

    def get_queryset(self):
        queryset = Question.objects.select_related('topic', 'level')
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
            if str(topic_id).isdigit():
                queryset = queryset.filter(topic_id=int(topic_id))
            else:
                queryset = queryset.filter(topic__slug=topic_id)
        if level_id:
            queryset = queryset.filter(level__level=level_id)

        if self.action == 'list':
            queryset = queryset.annotate(
                annotated_test_cases_count=Count('test_cases', distinct=True),
                annotated_submissions_count=Count('submissions', distinct=True)
            )
            
        return queryset

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = str(self.kwargs[lookup_url_kwarg])
        
        queryset = self.filter_queryset(self.get_queryset())
        if lookup_value.isdigit():
            obj = queryset.filter(pk=int(lookup_value)).first()
        else:
            obj = queryset.filter(slug=lookup_value).first()
            
        if not obj:
            # Fallback lookup in all questions (handles direct ID or slug access)
            if lookup_value.isdigit():
                obj = Question.objects.filter(pk=int(lookup_value)).first()
            else:
                obj = Question.objects.filter(slug=lookup_value).first()
                  
        if not obj:
            from rest_framework.exceptions import NotFound
            raise NotFound("Question not found.")
            
        self.check_object_permissions(self.request, obj)
        return obj

    def _prepare_execution_code(self, question, code, language_slug):
        """
        Wraps the student code with internal protected driver code if defined.
        If driver code or a main entry point is already present in student code, avoids duplication.
        """
        if not question.driver_code:
            return code
        try:
            driver_map = json.loads(question.driver_code) if isinstance(question.driver_code, str) else question.driver_code
            if isinstance(driver_map, dict) and language_slug in driver_map:
                driver = driver_map[language_slug].strip()
                if driver:
                    if driver in code:
                        return code
                    if language_slug == 'python' and '__main__' in code:
                        return code
                    if language_slug in ['c', 'cpp'] and 'main(' in code:
                        return code
                    if language_slug == 'java' and 'public static void main' in code:
                        return code
                    return f"{code}\n\n{driver}\n"
        except Exception as e:
            logger.warning(f"Error parsing driver_code for question {question.id}: {e}")
        return code

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

        execution_source = self._prepare_execution_code(question, code, language_slug)

        result = Judge0Service.execute_code_batch(
            source_code=execution_source,
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

        execution_source = self._prepare_execution_code(question, code, language_slug)

        # Run compilation batch
        result = Judge0Service.execute_code_batch(
            source_code=execution_source,
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
            profile, _ = Profile.objects.get_or_create(user=user)
            profile.role = role
            profile.save()
        return super().partial_update(request, *args, **kwargs)


from rest_framework import views
from django.db.models.functions import TruncDate
from django.db.models import Avg
from .models import GamificationProfile, GamificationBadge

def calculate_level_from_xp(xp):
    if xp < 100: return 1
    elif xp < 250: return 2
    elif xp < 500: return 3
    elif xp < 800: return 4
    elif xp < 1200: return 5
    elif xp < 1700: return 6
    elif xp < 2300: return 7
    elif xp < 3000: return 8
    elif xp < 4000: return 9
    elif xp < 5200: return 10
    elif xp < 6500: return 11
    elif xp < 8000: return 12
    else: return int((xp / 50) ** 0.5)

class ProfileStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Profile and Gamification
        profile, _ = Profile.objects.get_or_create(user=user)
        g_profile, _ = GamificationProfile.objects.get_or_create(
            user=user,
            defaults={'xp': 0, 'coins': 0, 'level': 1, 'daily_streak': 0, 'weekly_streak': 0}
        )
        
        # Level Sync
        level = calculate_level_from_xp(g_profile.xp)
        if level != g_profile.level:
            g_profile.level = level
            g_profile.save()

        # 2. Dynamic Rank Calculation
        total_xp = g_profile.xp
        if total_xp > 0:
            rank = GamificationProfile.objects.filter(xp__gt=total_xp).count() + 1
        else:
            rank = None

        # 3. Solved Distribution (Easy, Medium, Hard)
        easy_solved = UserProgress.objects.filter(user=user, solved=True, question__level__level__in=['basic', 'easy']).count()
        easy_total = Question.objects.filter(level__level__in=['basic', 'easy'], is_published=True).count()
        
        medium_solved = UserProgress.objects.filter(user=user, solved=True, question__level__level='medium').count()
        medium_total = Question.objects.filter(level__level='medium', is_published=True).count()
        
        hard_solved = UserProgress.objects.filter(user=user, solved=True, question__level__level='hard').count()
        hard_total = Question.objects.filter(level__level='hard', is_published=True).count()
        
        total_solved = easy_solved + medium_solved + hard_solved
        total_questions = easy_total + medium_total + hard_total

        # 4. Acceptance Rate
        total_submissions = Submission.objects.filter(user=user).count()
        accepted_submissions = Submission.objects.filter(user=user, status='Accepted').count()
        acceptance_rate = round((accepted_submissions / total_submissions) * 100, 1) if total_submissions > 0 else None

        # 5. Activity Heatmap
        activity_qs = Submission.objects.filter(
            user=user,
            created_at__gte=timezone.now() - timedelta(days=365)
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            solved=Count('id', filter=Q(status='Accepted')),
            attempted=Count('id')
        ).order_by('date')
        
        activity = []
        active_days = set()
        for act in activity_qs:
            activity.append({
                "date": act["date"].isoformat(),
                "solved": act["solved"],
                "attempted": act["attempted"]
            })
            if act["solved"] > 0 or act["attempted"] > 0:
                active_days.add(act["date"])

        # Streak Calculations
        sorted_active_days = sorted(list(active_days))
        temp_streak = 0
        longest_streak = 0
        prev_day = None
        for day in sorted_active_days:
            if prev_day is None:
                temp_streak = 1
            else:
                diff = (day - prev_day).days
                if diff == 1:
                    temp_streak += 1
                elif diff > 1:
                    longest_streak = max(longest_streak, temp_streak)
                    temp_streak = 1
            prev_day = day
        longest_streak = max(longest_streak, temp_streak)
        current_streak = temp_streak

        # 6. Skill Mastery
        topic_stats = []
        topics = Topic.objects.all().order_by('order')
        for t in topics:
            t_total = Question.objects.filter(topic=t, is_published=True).count()
            t_solved = UserProgress.objects.filter(user=user, solved=True, question__topic=t).count()
            pct = round((t_solved / t_total) * 100) if t_total > 0 else 0
            status = 'Strong' if pct >= 70 else ('Weak' if pct < 40 else 'Average')
            topic_stats.append({
                "name": t.name,
                "completed": pct,
                "solved": t_solved,
                "total": t_total,
                "level": 'Expert' if pct >= 80 else ('Advanced' if pct >= 60 else ('Intermediate' if pct >= 30 else 'Novice')),
                "strong": status == 'Strong',
                "weak": status == 'Weak'
            })

        # 7. Achievement badges
        streak_badge_30 = GamificationBadge.objects.filter(user=user, badge_name='Rookie Flame (30 Days)').first()
        if longest_streak >= 30 and not streak_badge_30:
            streak_badge_30 = GamificationBadge.objects.create(
                user=user,
                badge_name='Rookie Flame (30 Days)',
                badge_type='streak',
                icon_name='Flame'
            )
            
        streak_badge_100 = GamificationBadge.objects.filter(user=user, badge_name='Explorer Kit (100 Days)').first()
        if longest_streak >= 100 and not streak_badge_100:
            streak_badge_100 = GamificationBadge.objects.create(
                user=user,
                badge_name='Explorer Kit (100 Days)',
                badge_type='streak',
                icon_name='Award'
            )

        explorer_kit = GamificationBadge.objects.filter(user=user, badge_name='Pro Explorer Kit').first()
        if longest_streak >= 100 and total_solved >= 200 and not explorer_kit:
            explorer_kit = GamificationBadge.objects.create(
                user=user,
                badge_name='Pro Explorer Kit',
                badge_type='special',
                icon_name='Zap'
            )

        db_badges = GamificationBadge.objects.filter(user=user)
        badges_list = []
        for badge in db_badges:
            badges_list.append({
                "title": badge.badge_name,
                "icon": "⚡" if badge.icon_name == 'Zap' else ("🔥" if badge.icon_name == 'Flame' else "🏆"),
                "unlocked": True,
                "date": badge.unlocked_at.strftime('%b %d, %Y'),
                "rarity": 'Rare' if badge.badge_type == 'streak' else 'Epic',
                "desc": f"Unlocked by achieving coding tasks in the platform."
            })
            
        all_milestones = [
            {"title": "Rookie Flame (30 Days)", "icon": "🔥", "rarity": "Common", "desc": "Unlocked after achieving a 30-day streak."},
            {"title": "Explorer Kit (100 Days)", "icon": "🏆", "rarity": "Rare", "desc": "Unlocked after achieving a 100-day streak."},
            {"title": "Pro Explorer Kit", "icon": "⚡", "rarity": "Epic", "desc": "Unlocked after achieving a 100-day streak and solving 200 problems."}
        ]
        
        achievements_list = []
        for m in all_milestones:
            unlocked_badge = next((b for b in badges_list if b["title"] == m["title"]), None)
            if unlocked_badge:
                achievements_list.append(unlocked_badge)
            else:
                achievements_list.append({
                    "title": m["title"],
                    "icon": m["icon"],
                    "unlocked": False,
                    "date": "Locked",
                    "rarity": m["rarity"],
                    "desc": m["desc"]
                })

        # 8. Contest History
        from .models import CodingTestAttempt
        contest_attempts = CodingTestAttempt.objects.filter(user=user, status='completed').order_by('completed_at')
        contest_history_list = []
        contest_ratings = []
        current_rating = 1500
        
        for idx, attempt in enumerate(contest_attempts, start=1):
            score_ratio = attempt.score / attempt.max_score if attempt.max_score > 0 else 0.5
            change = int((score_ratio - 0.5) * 80)
            current_rating += change
            contest_ratings.append(current_rating)
            
            solved_qs = attempt.responses.filter(status='Accepted').count()
            total_qs = attempt.responses.count()
            
            contest_history_list.append({
                "name": attempt.test.title,
                "rank": idx * 12 + random.randint(1, 10),
                "ratingChange": f"+{change}" if change >= 0 else f"{change}",
                "rating": current_rating,
                "solved": f"{solved_qs}/{total_qs}",
                "duration": f"{round(attempt.time_spent / 60, 1)} hrs"
            })

        # 9. Bookmarks
        from .views_aptitude import AptitudeBookmark
        bookmarks_qs = AptitudeBookmark.objects.filter(user=user)
        bookmarks_list = []
        for bm in bookmarks_qs:
            bookmarks_list.append({
                "id": bm.id,
                "title": bm.question.statement[:50] + "..." if (bm.question and bm.question.statement) else "Bookmarked Question",
                "difficulty": bm.question.difficulty.capitalize() if (bm.question and hasattr(bm.question, 'difficulty') and bm.question.difficulty) else "Medium",
                "status": "Saved",
                "topic": bm.question.topic.name if (bm.question and hasattr(bm.question, 'topic') and bm.question.topic) else "Aptitude"
            })

        # 10. Profile Completion Checklist
        checklist = [
            {"label": "Photo uploaded", "valid": bool(profile.avatar_url or profile.profile_photo)},
            {"label": "Short professional bio filled", "valid": len(profile.bio) > 10},
            {"label": "Social profiles linked", "valid": bool(profile.github or profile.linkedin)},
            {"label": "Portfolio link added", "valid": bool(profile.portfolio)},
            {"label": "Relevant skills mapped", "valid": len(profile.skills.strip()) > 0},
            {"label": "Projects cataloged", "valid": len(profile.projects.strip()) > 0},
        ]
        completed = sum(1 for item in checklist if item["valid"])
        completion_pct = int((completed / len(checklist)) * 100) if checklist else 0

        # 11. AI Insights
        sorted_topics = sorted(topic_stats, key=lambda x: x["completed"])
        weakest_topic = sorted_topics[0]["name"] if sorted_topics and sorted_topics[0]["completed"] < 50 else None
        strongest_topic = sorted_topics[-1]["name"] if sorted_topics and sorted_topics[-1]["completed"] >= 70 else None

        return Response({
            "xp": total_xp,
            "rank": rank,
            "level": level,
            "daily_streak": current_streak,
            "longest_streak": longest_streak,
            "total_solved": total_solved,
            "easy_solved": easy_solved,
            "easy_total": easy_total,
            "medium_solved": medium_solved,
            "medium_total": medium_total,
            "hard_solved": hard_solved,
            "hard_total": hard_total,
            "acceptance_rate": acceptance_rate,
            "activity": activity,
            "topic_stats": topic_stats,
            "achievements": achievements_list,
            "contest_ratings": contest_ratings,
            "contest_history": contest_history_list,
            "bookmarks": bookmarks_list,
            "checklist": checklist,
            "completion_pct": completion_pct,
            "ai_insights": {
                "strongest_topic": strongest_topic,
                "weakest_topic": weakest_topic,
                "consistency_score": int(longest_streak * 3.1) if longest_streak > 0 else 0,
                "weekly_improvement": "+5%" if total_solved > 0 else "0%"
            }
        })

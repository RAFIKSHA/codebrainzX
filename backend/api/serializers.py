from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from .models import Profile, Topic, QuestionLevel, Question, TestCase, Language, Submission, UserProgress, Section, ContentItem

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)
    avatar_url = serializers.CharField(source='profile.avatar_url', required=False, allow_null=True, allow_blank=True)
    full_name = serializers.CharField(source='profile.full_name', required=False, allow_blank=True)
    google_id = serializers.CharField(source='profile.google_id', read_only=True)
    profile_photo = serializers.CharField(source='profile.profile_photo', read_only=True)
    login_provider = serializers.CharField(source='profile.login_provider', read_only=True)
    email_verified = serializers.BooleanField(source='profile.email_verified', read_only=True)
    
    bio = serializers.CharField(source='profile.bio', required=False, allow_blank=True, default='')
    country = serializers.CharField(source='profile.country', required=False, allow_blank=True, default='United States')
    github = serializers.CharField(source='profile.github', required=False, allow_null=True, allow_blank=True)
    linkedin = serializers.CharField(source='profile.linkedin', required=False, allow_null=True, allow_blank=True)
    portfolio = serializers.CharField(source='profile.portfolio', required=False, allow_null=True, allow_blank=True)
    resume_url = serializers.CharField(source='profile.resume_url', required=False, allow_null=True, allow_blank=True)
    skills = serializers.CharField(source='profile.skills', required=False, allow_blank=True, default='')
    projects = serializers.CharField(source='profile.projects', required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'avatar_url', 'full_name', 'google_id', 'profile_photo', 'login_provider', 'email_verified',
                  'bio', 'country', 'github', 'linkedin', 'portfolio', 'resume_url', 'skills', 'projects')

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        
        # Update user fields
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        
        # Update profile fields
        profile, _ = Profile.objects.get_or_create(user=instance)
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()
        
        return instance

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('role', 'avatar_url')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(required=False, default='student')

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role')

    def validate_password(self, value):
        return validate_password_strength(value)

    def create(self, validated_data):
        role = validated_data.pop('role', 'student')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        Profile.objects.create(user=user, role=role)
        return user

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = '__all__'

class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ('id', 'question', 'input_data', 'expected_output', 'is_hidden', 'weight')

class NestedTestCaseSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    class Meta:
        model = TestCase
        fields = ('id', 'input_data', 'expected_output', 'is_hidden', 'weight')

class TestCaseStudentSerializer(serializers.ModelSerializer):
    """
    Exposes test cases to students; hides output and execution limits for hidden test cases if necessary,
    or hides hidden test cases entirely. We will exclude hidden test cases from the standard payload.
    """
    class Meta:
        model = TestCase
        fields = ('id', 'input_data', 'expected_output', 'is_hidden')

class QuestionLevelSerializer(serializers.ModelSerializer):
    is_locked = serializers.SerializerMethodField()
    total_questions = serializers.SerializerMethodField()
    solved_questions = serializers.SerializerMethodField()

    class Meta:
        model = QuestionLevel
        fields = ('id', 'topic', 'level', 'is_locked', 'total_questions', 'solved_questions')

    def get_is_locked(self, obj):
        from django.conf import settings
        if getattr(settings, 'UNLOCK_ALL_SECTIONS', False):
            return False

        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return True
        
        # Admins bypass lock constraints
        if (hasattr(request.user, 'profile') and request.user.profile.role == 'admin') or request.user.is_staff:
            return False

        level_type = obj.level
        topic = obj.topic

        if level_type == 'basic':
            return False

        # Get level hierarchy
        level_order = ['basic', 'easy', 'medium', 'hard']
        try:
            prev_level_type = level_order[level_order.index(level_type) - 1]
        except (ValueError, IndexError):
            return False

        try:
            prev_level = QuestionLevel.objects.get(topic=topic, level=prev_level_type)
        except QuestionLevel.DoesNotExist:
            return False

        prev_questions = prev_level.questions.filter(is_published=True)
        if not prev_questions.exists():
            return False

        solved_count = UserProgress.objects.filter(
            user=request.user,
            question__in=prev_questions,
            solved=True
        ).count()

        # If not all questions are solved, lock the next level
        return solved_count < prev_questions.count()

    def get_total_questions(self, obj):
        return obj.questions.filter(is_published=True).count()

    def get_solved_questions(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return 0
        return UserProgress.objects.filter(
            user=request.user,
            question__in=obj.questions.filter(is_published=True),
            solved=True
        ).count()

class QuestionListSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    level_name = serializers.CharField(source='level.level', read_only=True)
    solved = serializers.SerializerMethodField()
    test_cases_count = serializers.SerializerMethodField()
    submissions_count = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = (
            'id', 'topic', 'topic_name', 'level', 'level_name', 'title', 'slug',
            'time_limit', 'memory_limit', 'is_published', 'order', 'solved', 
            'test_cases_count', 'submissions_count', 'updated_at'
        )

    def get_solved(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return UserProgress.objects.filter(user=request.user, question=obj, solved=True).exists()

    def get_test_cases_count(self, obj):
        return obj.test_cases.count()

    def get_submissions_count(self, obj):
        return obj.submissions.count()

class QuestionDetailSerializer(serializers.ModelSerializer):
    topic_slug = serializers.CharField(source='topic.slug', read_only=True)
    level_name = serializers.CharField(source='level.level', read_only=True)
    test_cases = NestedTestCaseSerializer(many=True, required=False)
    solved = serializers.SerializerMethodField()
    official_solution = serializers.CharField(required=False, allow_blank=True)
    editorial = serializers.CharField(required=False, allow_blank=True)
    hints = serializers.CharField(required=False, allow_blank=True)
    tags = serializers.CharField(required=False, allow_blank=True)
    driver_code = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Question
        fields = (
            'id', 'topic', 'topic_slug', 'level', 'level_name', 'title', 'slug',
            'statement', 'constraints', 'input_format', 'output_format', 'notes',
            'official_solution', 'editorial', 'hints', 'tags', 'companies',
            'examples', 'starter_code', 'driver_code', 'time_limit', 'memory_limit',
            'is_published', 'order', 'test_cases', 'solved', 'meta_title', 
            'meta_description', 'meta_keywords', 'updated_at'
        )
        extra_kwargs = {
            'level': {'required': False},
            'slug': {'required': False, 'allow_blank': True}
        }

    def to_internal_value(self, data):
        level_name = data.get('level_name')
        ret = super().to_internal_value(data)
        if level_name:
            ret['level_name'] = level_name
        return ret

    def get_solved(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return UserProgress.objects.filter(user=request.user, question=obj, solved=True).exists()

    def resolve_level(self, topic, level_name, instance=None):
        if not topic:
            if instance:
                topic = instance.topic
            else:
                raise serializers.ValidationError({"topic": "Topic is required to resolve question level."})
        
        if not level_name:
            if instance:
                return instance.level
            else:
                level_name = 'basic'
                
        try:
            return QuestionLevel.objects.get(topic=topic, level=level_name)
        except QuestionLevel.DoesNotExist:
            return QuestionLevel.objects.create(topic=topic, level=level_name)

    @transaction.atomic
    def create(self, validated_data):
        test_cases_data = validated_data.pop('test_cases', [])
        level_name = validated_data.pop('level_name', None)
        topic = validated_data.get('topic')
        
        validated_data['level'] = self.resolve_level(topic, level_name)
        
        question = Question.objects.create(**validated_data)
        
        for tc_data in test_cases_data:
            TestCase.objects.create(question=question, **tc_data)
            
        return question

    @transaction.atomic
    def update(self, instance, validated_data):
        test_cases_data = validated_data.pop('test_cases', None)
        level_name = validated_data.pop('level_name', None)
        topic = validated_data.get('topic', instance.topic)
        
        if level_name or 'topic' in validated_data:
            validated_data['level'] = self.resolve_level(topic, level_name, instance)
            
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if test_cases_data is not None:
            keep_tc_ids = []
            for tc_data in test_cases_data:
                tc_id = tc_data.get('id')
                if tc_id:
                    try:
                        tc = TestCase.objects.get(id=tc_id, question=instance)
                        for attr, value in tc_data.items():
                            if attr != 'id':
                                setattr(tc, attr, value)
                        tc.save()
                        keep_tc_ids.append(tc.id)
                    except TestCase.DoesNotExist:
                        tc = TestCase.objects.create(question=instance, **{k: v for k, v in tc_data.items() if k != 'id'})
                        keep_tc_ids.append(tc.id)
                else:
                    tc = TestCase.objects.create(question=instance, **tc_data)
                    keep_tc_ids.append(tc.id)
            
            instance.test_cases.exclude(id__in=keep_tc_ids).delete()
            
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        is_admin = False
        if request and request.user and request.user.is_authenticated:
            is_admin = (hasattr(request.user, 'profile') and request.user.profile.role == 'admin') or request.user.is_staff
        
        if is_admin:
            representation['test_cases'] = NestedTestCaseSerializer(instance.test_cases.all(), many=True).data
        else:
            representation['official_solution'] = ''
            representation['editorial'] = ''
            representation['test_cases'] = NestedTestCaseSerializer(instance.test_cases.filter(is_hidden=False), many=True).data
            
        return representation

class TopicSerializer(serializers.ModelSerializer):
    levels = QuestionLevelSerializer(many=True, read_only=True)
    total_questions = serializers.SerializerMethodField()
    solved_questions = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = ('id', 'name', 'slug', 'description', 'order', 'levels', 'total_questions', 'solved_questions')

    def get_total_questions(self, obj):
        return Question.objects.filter(topic=obj, is_published=True).count()

    def get_solved_questions(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return 0
        return UserProgress.objects.filter(
            user=request.user,
            question__topic=obj,
            solved=True
        ).count()

class SubmissionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    question_title = serializers.CharField(source='question.title', read_only=True)
    language_name = serializers.CharField(source='language.name', read_only=True)

    class Meta:
        model = Submission
        fields = (
            'id', 'user', 'username', 'question', 'question_title', 'language', 'language_name',
            'code', 'status', 'error_message', 'execution_time', 'memory_usage',
            'passed_test_cases', 'total_test_cases', 'created_at'
        )
        read_only_fields = ('user', 'status', 'error_message', 'execution_time', 'memory_usage', 'passed_test_cases', 'total_test_cases')


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = '__all__'


class ContentItemSerializer(serializers.ModelSerializer):
    section_name = serializers.CharField(source='section.name', read_only=True)
    section_slug = serializers.CharField(source='section.slug', read_only=True)

    class Meta:
        model = ContentItem
        fields = ('id', 'section', 'section_name', 'section_slug', 'title', 'slug', 'data', 'created_at', 'updated_at')


import re

def validate_password_strength(password):
    if len(password) < 8:
        raise serializers.ValidationError("Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", password):
        raise serializers.ValidationError("Password must contain at least one uppercase letter.")
    if not re.search(r"[a-z]", password):
        raise serializers.ValidationError("Password must contain at least one lowercase letter.")
    if not re.search(r"[0-9]", password):
        raise serializers.ValidationError("Password must contain at least one number.")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise serializers.ValidationError("Password must contain at least one special character.")
    return password

class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField(required=True)

class EmailOTPSendSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    purpose = serializers.ChoiceField(choices=['login', 'forgot_password'], default='login')

class EmailOTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(required=True, min_length=6, max_length=6)

class ForgotPasswordVerifySerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(required=True, min_length=6, max_length=6)
    password = serializers.CharField(required=True, min_length=8)

    def validate_password(self, value):
        return validate_password_strength(value)

class RegisterSendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

class RegisterVerifySerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(required=True, min_length=6, max_length=6)
    full_name = serializers.CharField(required=True, max_length=255)
    password = serializers.CharField(required=True, min_length=8)

    def validate_password(self, value):
        return validate_password_strength(value)

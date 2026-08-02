from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    AptitudeCategory, AptitudeTopic, AptitudeSubTopic, AptitudeQuestion,
    AptitudeQuestionVersion, AptitudeTest, AptitudeTestSection, AptitudeTestQuestion,
    AptitudeTestAttempt, AptitudeQuestionResponse, AptitudeBookmark,
    AptitudeReportedQuestion, GamificationProfile, GamificationBadge
)

class GamificationBadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GamificationBadge
        fields = ('id', 'badge_name', 'badge_type', 'icon_name', 'unlocked_at')

class GamificationProfileSerializer(serializers.ModelSerializer):
    badges = GamificationBadgeSerializer(many=True, read_only=True, source='user.badges')
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = GamificationProfile
        fields = ('id', 'username', 'xp', 'coins', 'level', 'daily_streak', 'weekly_streak', 'badges')

class AptitudeSubTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = AptitudeSubTopic
        fields = ('id', 'topic', 'name', 'slug', 'order')

class AptitudeTopicSerializer(serializers.ModelSerializer):
    sub_topics = AptitudeSubTopicSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = AptitudeTopic
        fields = ('id', 'category', 'category_name', 'name', 'slug', 'description', 'order', 'sub_topics')

class AptitudeCategorySerializer(serializers.ModelSerializer):
    topics = AptitudeTopicSerializer(many=True, read_only=True)
    
    class Meta:
        model = AptitudeCategory
        fields = ('id', 'name', 'slug', 'description', 'order', 'topics')

class AptitudeQuestionSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    sub_topic_name = serializers.CharField(source='sub_topic.name', read_only=True, default='')
    sub_questions = serializers.SerializerMethodField()
    
    class Meta:
        model = AptitudeQuestion
        fields = (
            'id', 'topic', 'topic_name', 'sub_topic', 'sub_topic_name', 'title', 'slug',
            'statement', 'image_url', 'difficulty', 'question_type', 'options', 'correct_answer',
            'explanation', 'shortcut_trick', 'hint', 'marks', 'negative_marks',
            'time_limit', 'company_tags', 'university_tags', 'source', 'status',
            'visibility', 'version', 'parent', 'sub_questions', 'created_at', 'updated_at'
        )

    def get_sub_questions(self, obj):
        if obj.sub_questions.exists():
            return AptitudeQuestionSerializer(obj.sub_questions.all(), many=True).data
        return []

class StudentAptitudeQuestionSerializer(serializers.ModelSerializer):
    """
    Exposes only what a student needs to see during a test (hides correct answer, explanation, shortcut_trick).
    """
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    sub_questions = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = AptitudeQuestion
        fields = (
            'id', 'topic', 'topic_name', 'title', 'slug', 'statement', 'image_url', 'difficulty',
            'question_type', 'options', 'marks', 'negative_marks', 'time_limit',
            'parent', 'sub_questions', 'is_bookmarked'
        )

    def get_sub_questions(self, obj):
        if obj.sub_questions.exists():
            return StudentAptitudeQuestionSerializer(obj.sub_questions.all(), many=True, context=self.context).data
        return []

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return AptitudeBookmark.objects.filter(user=request.user, question=obj).exists()
        return False

class StudentPracticeQuestionSerializer(serializers.ModelSerializer):
    """
    Exposes full questions including correct answer and explanation for student MCQ practice mode.
    """
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    sub_topic_name = serializers.CharField(source='sub_topic.name', read_only=True, default='')
    sub_questions = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = AptitudeQuestion
        fields = (
            'id', 'topic', 'topic_name', 'sub_topic', 'sub_topic_name', 'title', 'slug',
            'statement', 'image_url', 'difficulty', 'question_type', 'options', 'correct_answer',
            'explanation', 'shortcut_trick', 'hint', 'marks', 'negative_marks',
            'time_limit', 'company_tags', 'university_tags', 'source', 'status',
            'visibility', 'parent', 'sub_questions', 'is_bookmarked'
        )

    def get_sub_questions(self, obj):
        if obj.sub_questions.exists():
            return StudentPracticeQuestionSerializer(obj.sub_questions.all(), many=True, context=self.context).data
        return []

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return AptitudeBookmark.objects.filter(user=request.user, question=obj).exists()
        return False

class AptitudeQuestionVersionSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.username', read_only=True)

    class Meta:
        model = AptitudeQuestionVersion
        fields = ('id', 'question', 'version', 'statement', 'options', 'correct_answer', 'explanation', 'changed_by_name', 'created_at')

class AptitudeTestSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AptitudeTestSection
        fields = ('id', 'test', 'name', 'duration', 'order')

class AptitudeTestSerializer(serializers.ModelSerializer):
    sections = AptitudeTestSectionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()
    total_marks = serializers.SerializerMethodField()

    class Meta:
        model = AptitudeTest
        fields = (
            'id', 'title', 'description', 'test_type', 'overall_duration',
            'section_timer', 'pass_percentage', 'negative_marking', 'calculator_enabled',
            'company_tags', 'university_tags', 'is_published', 'sections',
            'question_count', 'total_marks', 'created_at', 'updated_at'
        )

    def get_question_count(self, obj):
        return obj.test_questions.count()

    def get_total_marks(self, obj):
        import django.db.models as django_models
        return obj.test_questions.aggregate(total=django_models.Sum('question__marks'))['total'] or 0.0

class AptitudeQuestionResponseSerializer(serializers.ModelSerializer):
    question_title = serializers.CharField(source='question.title', read_only=True)
    question_statement = serializers.CharField(source='question.statement', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    options = serializers.JSONField(source='question.options', read_only=True)

    class Meta:
        model = AptitudeQuestionResponse
        fields = (
            'id', 'attempt', 'question', 'question_title', 'question_statement', 'question_type',
            'options', 'selected_options', 'is_marked_for_review', 'is_answered',
            'is_correct', 'time_spent'
        )

class AptitudeTestAttemptSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source='test.title', read_only=True)
    test_type = serializers.CharField(source='test.test_type', read_only=True)
    overall_duration = serializers.IntegerField(source='test.overall_duration', read_only=True)
    section_timer = serializers.BooleanField(source='test.section_timer', read_only=True)
    calculator_enabled = serializers.BooleanField(source='test.calculator_enabled', read_only=True)

    class Meta:
        model = AptitudeTestAttempt
        fields = (
            'id', 'user', 'test', 'test_title', 'test_type', 'started_at', 'completed_at',
            'status', 'score', 'max_score', 'accuracy', 'rank', 'percentile',
            'attempted_questions', 'correct_questions', 'wrong_questions', 'skipped_questions',
            'time_spent', 'current_section', 'current_question_index', 'overall_duration',
            'section_timer', 'calculator_enabled'
        )

class AptitudeBookmarkSerializer(serializers.ModelSerializer):
    question_details = AptitudeQuestionSerializer(source='question', read_only=True)

    class Meta:
        model = AptitudeBookmark
        fields = ('id', 'user', 'question', 'question_details', 'created_at')

class AptitudeReportedQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AptitudeReportedQuestion
        fields = ('id', 'user', 'question', 'reason', 'description', 'created_at')

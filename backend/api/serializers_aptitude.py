from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    AptitudeTrainer, AptitudeCategory, AptitudeTopic, AptitudeSubTopic, AptitudeQuestion,
    AptitudeQuestionVersion, AptitudeTest, AptitudeTestSection, AptitudeTestQuestion,
    AptitudeTestAttempt, AptitudeQuestionResponse, AptitudeBookmark,
    AptitudeReportedQuestion, GamificationProfile, GamificationBadge
)

class AptitudeTrainerSerializer(serializers.ModelSerializer):
    question_count = serializers.SerializerMethodField()
    topic_count = serializers.SerializerMethodField()
    category_count = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = AptitudeTrainer
        fields = (
            'id', 'name', 'slug', 'specialization', 'bio', 'profile_image',
            'is_active', 'question_count', 'topic_count', 'category_count',
            'created_at', 'updated_at'
        )

    def get_profile_image(self, obj):
        img = obj.profile_image
        if not img:
            return None
        img_str = str(img).strip()
        # Handle localhost/local IP media URLs from local database seeds or test uploads
        if 'localhost:8000' in img_str or '127.0.0.1:8000' in img_str:
            idx = img_str.find('/media/')
            if idx != -1:
                media_path = img_str[idx:]
                request = self.context.get('request')
                if request:
                    uri = request.build_absolute_uri(media_path)
                    if (request.is_secure() or request.META.get('HTTP_X_FORWARDED_PROTO') == 'https') and uri.startswith('http://'):
                        uri = 'https://' + uri[7:]
                    return uri
                return f"https://codebrainzx.onrender.com{media_path}"
            return None
        # Handle relative /media/ paths
        if img_str.startswith('/media/'):
            request = self.context.get('request')
            if request:
                uri = request.build_absolute_uri(img_str)
                if (request.is_secure() or request.META.get('HTTP_X_FORWARDED_PROTO') == 'https') and uri.startswith('http://'):
                    uri = 'https://' + uri[7:]
                return uri
            return f"https://codebrainzx.onrender.com{img_str}"
        # Upgrade http to https for non-localhost remote URLs (avoid mixed content)
        if img_str.startswith('http://') and not ('localhost' in img_str or '127.0.0.1' in img_str):
            return 'https://' + img_str[7:]
        return img_str

    def get_question_count(self, obj):
        return obj.questions.filter(status='active', visibility='public').count()

    def get_topic_count(self, obj):
        return obj.questions.filter(status='active', visibility='public').values('topic').distinct().count()

    def get_category_count(self, obj):
        return obj.questions.filter(status='active', visibility='public').values('topic__category').distinct().count()



class AptitudeTrainerDetailSerializer(AptitudeTrainerSerializer):
    categories = serializers.SerializerMethodField()
    user_stats = serializers.SerializerMethodField()

    class Meta(AptitudeTrainerSerializer.Meta):
        fields = AptitudeTrainerSerializer.Meta.fields + ('categories', 'user_stats')

    def get_categories(self, obj):
        # Return categories and their topics that contain questions authored by this trainer
        qs = obj.questions.filter(status='active', visibility='public')
        topic_ids = qs.values_list('topic_id', flat=True).distinct()
        category_ids = qs.values_list('topic__category_id', flat=True).distinct()

        categories = AptitudeCategory.objects.filter(id__in=category_ids).prefetch_related('topics__sub_topics')
        result = []
        for cat in categories:
            cat_topics = []
            for top in cat.topics.filter(id__in=topic_ids):
                q_count = qs.filter(topic=top).count()
                cat_topics.append({
                    'id': top.id,
                    'name': top.name,
                    'slug': top.slug,
                    'description': top.description,
                    'question_count': q_count,
                    'sub_topics': [{'id': s.id, 'name': s.name, 'slug': s.slug} for s in top.sub_topics.all()]
                })
            result.append({
                'id': cat.id,
                'name': cat.name,
                'slug': cat.slug,
                'description': cat.description,
                'topics': cat_topics,
                'total_questions': sum(t['question_count'] for t in cat_topics)
            })
        return result

    def get_user_stats(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return {
                'questions_attempted': 0,
                'correct_answers': 0,
                'accuracy': 0.0,
                'total_questions': obj.questions.filter(status='active', visibility='public').count()
            }
        
        user = request.user
        trainer_q_ids = obj.questions.filter(status='active', visibility='public').values_list('id', flat=True)
        total_q = trainer_q_ids.count()

        responses = AptitudeQuestionResponse.objects.filter(
            attempt__user=user,
            attempt__status='completed',
            question_id__in=trainer_q_ids
        )
        attempted_count = responses.values('question').distinct().count()
        correct_count = responses.filter(is_correct=True).values('question').distinct().count()
        accuracy = (correct_count / attempted_count * 100) if attempted_count > 0 else 0.0

        return {
            'questions_attempted': attempted_count,
            'correct_answers': correct_count,
            'accuracy': round(accuracy, 1),
            'total_questions': total_q
        }


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
    trainer_name = serializers.CharField(source='trainer.name', read_only=True, default='')
    sub_questions = serializers.SerializerMethodField()
    
    class Meta:
        model = AptitudeQuestion
        fields = (
            'id', 'topic', 'topic_name', 'sub_topic', 'sub_topic_name',
            'trainer', 'trainer_name',
            'title', 'slug',
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
    trainer_name = serializers.CharField(source='trainer.name', read_only=True, default='')
    sub_questions = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = AptitudeQuestion
        fields = (
            'id', 'topic', 'topic_name', 'trainer', 'trainer_name',
            'title', 'slug', 'statement', 'image_url', 'difficulty',
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
    category_name = serializers.CharField(source='topic.category.name', read_only=True, default='')
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    sub_topic_name = serializers.CharField(source='sub_topic.name', read_only=True, default='')
    trainer_name = serializers.CharField(source='trainer.name', read_only=True, default='')
    sub_questions = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = AptitudeQuestion
        fields = (
            'id', 'topic', 'category_name', 'topic_name', 'sub_topic', 'sub_topic_name',
            'trainer', 'trainer_name',
            'title', 'slug',
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

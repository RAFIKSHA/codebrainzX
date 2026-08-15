from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    TestSeriesCategory, TestSeriesCompany, TestSeries, IndividualTest,
    IndividualTestAttempt, IndividualTestResponse, Question, AptitudeQuestion
)
from django.db.models import Sum
from .serializers import UserSerializer

class TestSeriesCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TestSeriesCategory
        fields = ['id', 'name', 'slug', 'description', 'icon', 'type', 'display_order', 'is_active', 'created_at']

class TestSeriesCompanySerializer(serializers.ModelSerializer):
    coding_series_count = serializers.IntegerField(read_only=True, default=0)
    aptitude_series_count = serializers.IntegerField(read_only=True, default=0)
    total_tests_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = TestSeriesCompany
        fields = [
            'id', 'name', 'logo_url', 'slug', 'description', 'website',
            'is_active', 'display_order', 'coding_series_count',
            'aptitude_series_count', 'total_tests_count', 'created_at'
        ]

class TestSeriesSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_slug = serializers.CharField(source='company.slug', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_type = serializers.CharField(source='category.type', read_only=True)
    tests_count = serializers.SerializerMethodField()
    questions_count = serializers.SerializerMethodField()
    total_duration_minutes = serializers.SerializerMethodField()
    attempts_count = serializers.SerializerMethodField()
    best_score = serializers.SerializerMethodField()

    class Meta:
        model = TestSeries
        fields = [
            'id', 'company', 'company_name', 'company_slug', 'category', 'category_name', 'category_type',
            'name', 'slug', 'description', 'difficulty', 'thumbnail_url',
            'validity_days', 'is_published', 'display_order', 'created_at', 'updated_at',
            'tests_count', 'questions_count', 'total_duration_minutes', 'attempts_count', 'best_score'
        ]

    def get_tests_count(self, obj):
        return obj.tests.filter(is_published=True).count()

    def get_questions_count(self, obj):
        tests = obj.tests.filter(is_published=True)
        if obj.category.type == 'coding':
            total = 0
            for t in tests:
                total += t.coding_questions.count()
            return total
        else:
            total = 0
            for t in tests:
                total += t.aptitude_questions.count()
            return total

    def get_total_duration_minutes(self, obj):
        return obj.tests.filter(is_published=True).aggregate(total=Sum('duration_minutes'))['total'] or 0

    def get_attempts_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return IndividualTestAttempt.objects.filter(
            test__series=obj,
            user=request.user
        ).count()

    def get_best_score(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        attempts = IndividualTestAttempt.objects.filter(
            test__series=obj,
            user=request.user,
            status='completed'
        )
        if not attempts.exists():
            return None
        best = 0.0
        for att in attempts:
            if att.max_score > 0:
                pct = (att.score / att.max_score) * 100
                if pct > best:
                    best = pct
        return round(best, 1)

class IndividualTestSerializer(serializers.ModelSerializer):
    attempts_count = serializers.SerializerMethodField()
    best_score = serializers.SerializerMethodField()
    attempt_status = serializers.SerializerMethodField()
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = IndividualTest
        fields = [
            'id', 'series', 'name', 'slug', 'test_number', 'description',
            'duration_minutes', 'marks', 'negative_marking', 'difficulty',
            'instructions', 'is_published', 'created_at', 'updated_at',
            'attempts_count', 'best_score', 'attempt_status', 'questions_count',
            'coding_questions', 'aptitude_questions'
        ]
        extra_kwargs = {
            'coding_questions': {'required': False},
            'aptitude_questions': {'required': False}
        }

    def get_attempts_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return IndividualTestAttempt.objects.filter(test=obj, user=request.user).count()

    def get_best_score(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        attempts = IndividualTestAttempt.objects.filter(test=obj, user=request.user, status='completed')
        if not attempts.exists():
            return None
        best = 0.0
        for att in attempts:
            if att.max_score > 0:
                pct = (att.score / att.max_score) * 100
                if pct > best:
                    best = pct
        return round(best, 1)

    def get_attempt_status(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 'not_attempted'
        attempts = IndividualTestAttempt.objects.filter(test=obj, user=request.user).order_by('-started_at')
        if not attempts.exists():
            return 'not_attempted'
        return attempts.first().status

    def get_questions_count(self, obj):
        if obj.series.category.type == 'coding':
            return obj.coding_questions.count()
        return obj.aptitude_questions.count()

class IndividualTestResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = IndividualTestResponse
        fields = [
            'id', 'attempt', 'coding_question', 'aptitude_question', 'selected_options',
            'code', 'language_slug', 'is_correct', 'is_answered', 'time_spent',
            'passed_test_cases', 'total_test_cases', 'error_message', 'status'
        ]

class IndividualTestAttemptSerializer(serializers.ModelSerializer):
    test_details = IndividualTestSerializer(source='test', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    responses = IndividualTestResponseSerializer(many=True, read_only=True)

    class Meta:
        model = IndividualTestAttempt
        fields = [
            'id', 'user', 'user_details', 'test', 'started_at', 'completed_at', 'status',
            'score', 'max_score', 'accuracy', 'time_spent', 'total_questions',
            'attempted_questions', 'correct_questions', 'wrong_questions',
            'skipped_questions', 'test_details', 'responses'
        ]

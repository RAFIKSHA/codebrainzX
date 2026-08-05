from rest_framework import serializers
from .models_tutorials import (
    TutorialLanguage, TutorialChapter, TutorialLesson, TutorialLessonBlock,
    TutorialQuiz, TutorialQuizQuestion, TutorialPracticeQuestion,
    TutorialLessonResource, TutorialMedia, TutorialLessonAnalytics
)

class TutorialLanguageSerializer(serializers.ModelSerializer):
    lessons_count = serializers.SerializerMethodField()

    class Meta:
        model = TutorialLanguage
        fields = '__all__'

    def get_lessons_count(self, obj):
        return obj.lessons.filter(status='published').count()


class TutorialChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorialChapter
        fields = '__all__'


class TutorialLessonBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorialLessonBlock
        fields = '__all__'


class TutorialQuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorialQuizQuestion
        fields = '__all__'


class TutorialQuizSerializer(serializers.ModelSerializer):
    questions = TutorialQuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = TutorialQuiz
        fields = '__all__'


class TutorialPracticeQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorialPracticeQuestion
        fields = '__all__'


class TutorialLessonResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorialLessonResource
        fields = '__all__'


class TutorialMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorialMedia
        fields = '__all__'


class TutorialLessonAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorialLessonAnalytics
        fields = '__all__'


class TutorialLessonListSerializer(serializers.ModelSerializer):
    chapter_name = serializers.CharField(source='chapter.name', read_only=True)

    class Meta:
        model = TutorialLesson
        fields = (
            'id', 'title', 'slug', 'language', 'chapter', 'chapter_name',
            'estimated_reading_time', 'display_order', 'status',
            'publish_date', 'tags', 'created_at', 'updated_at'
        )


class TutorialLessonDetailSerializer(serializers.ModelSerializer):
    blocks = TutorialLessonBlockSerializer(many=True, read_only=True)
    quizzes = TutorialQuizSerializer(many=True, read_only=True)
    practices = TutorialPracticeQuestionSerializer(many=True, read_only=True)
    resources = TutorialLessonResourceSerializer(many=True, read_only=True)
    analytics = TutorialLessonAnalyticsSerializer(read_only=True)

    class Meta:
        model = TutorialLesson
        fields = '__all__'

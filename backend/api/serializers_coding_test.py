from rest_framework import serializers
from .models import CodingTest, CodingTestQuestion, CodingTestAttempt, CodingQuestionResponse
from .serializers import QuestionListSerializer, UserSerializer

class CodingTestQuestionSerializer(serializers.ModelSerializer):
    question_details = QuestionListSerializer(source='question', read_only=True)

    class Meta:
        model = CodingTestQuestion
        fields = ('id', 'points', 'order', 'question', 'question_details')


class CodingTestSerializer(serializers.ModelSerializer):
    test_questions = CodingTestQuestionSerializer(many=True, read_only=True)
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = CodingTest
        fields = (
            'id', 'title', 'description', 'test_type', 'overall_duration',
            'section_timer', 'pass_percentage', 'calculator_enabled', 
            'is_published', 'created_at', 'updated_at', 'test_questions',
            'questions_count'
        )

    def get_questions_count(self, obj):
        return obj.test_questions.count()


class CodingQuestionResponseSerializer(serializers.ModelSerializer):
    question_title = serializers.CharField(source='question.title', read_only=True)

    class Meta:
        model = CodingQuestionResponse
        fields = ('id', 'question', 'question_title', 'code', 'language_slug', 'status', 'passed_test_cases', 'total_test_cases')


class CodingTestAttemptSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    test_title = serializers.CharField(source='test.title', read_only=True)
    responses = CodingQuestionResponseSerializer(many=True, read_only=True)
    
    class Meta:
        model = CodingTestAttempt
        fields = (
            'id', 'user', 'user_details', 'test', 'test_title', 'started_at',
            'completed_at', 'status', 'score', 'max_score', 'warnings_count',
            'time_spent', 'current_question_index', 'responses'
        )

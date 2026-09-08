from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Question, AptitudeQuestion, TestCase
)
from .models_internship import (
    InternshipProgram, ScholarshipRule, InternshipAssessment,
    InternshipApplication, InternshipAttempt, InternshipQuestionResponse
)
import json


class ScholarshipRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScholarshipRule
        fields = [
            'id', 'internship', 'title', 'min_score', 'max_score',
            'concession_percentage', 'description', 'badge_label',
            'is_active', 'order', 'created_at', 'updated_at'
        ]


class InternshipProgramListSerializer(serializers.ModelSerializer):
    applications_count = serializers.SerializerMethodField()
    scholarship_rules = ScholarshipRuleSerializer(many=True, read_only=True)
    has_assessment = serializers.SerializerMethodField()
    assessment = serializers.SerializerMethodField()

    class Meta:
        model = InternshipProgram
        fields = [
            'id', 'title', 'slug', 'badge', 'subtitle', 'description',
            'duration', 'mode', 'program_type', 'stipend_info',
            'who_can_apply', 'skills_covered', 'highlights',
            'certificate_info', 'mentorship_info', 'interview_info',
            'start_date', 'end_date', 'application_deadline',
            'is_published', 'status', 'display_order', 'applications_count',
            'scholarship_rules', 'has_assessment', 'assessment', 'created_at'
        ]

    def get_applications_count(self, obj):
        return obj.applications.count()

    def get_has_assessment(self, obj):
        return hasattr(obj, 'assessment') and obj.assessment is not None

    def get_assessment(self, obj):
        if hasattr(obj, 'assessment') and obj.assessment:
            return InternshipAssessmentSummarySerializer(obj.assessment).data
        return None


class InternshipAssessmentSummarySerializer(serializers.ModelSerializer):
    mcq_count = serializers.SerializerMethodField()
    coding_count = serializers.SerializerMethodField()
    mcq_question_ids = serializers.PrimaryKeyRelatedField(many=True, source='mcq_questions', read_only=True)
    coding_question_ids = serializers.PrimaryKeyRelatedField(many=True, source='coding_questions', read_only=True)
    mcq_questions_list = serializers.SerializerMethodField()
    coding_questions_list = serializers.SerializerMethodField()

    class Meta:
        model = InternshipAssessment
        fields = [
            'id', 'title', 'slug', 'description', 'duration_minutes',
            'total_marks', 'passing_percentage', 'instructions',
            'mcq_count', 'coding_count', 'mcq_question_ids', 'coding_question_ids',
            'mcq_questions_list', 'coding_questions_list', 'is_published'
        ]

    def get_mcq_count(self, obj):
        return obj.mcq_questions.count()

    def get_coding_count(self, obj):
        return obj.coding_questions.count()

    def get_mcq_questions_list(self, obj):
        return [{
            'id': q.id,
            'title': q.title,
            'statement': q.statement[:120] + '...' if len(q.statement) > 120 else q.statement,
            'marks': q.marks,
            'difficulty': q.difficulty,
            'topic': q.topic.name if q.topic else ''
        } for q in obj.mcq_questions.all()]

    def get_coding_questions_list(self, obj):
        return [{
            'id': q.id,
            'title': q.title,
            'slug': q.slug,
            'topic': q.topic.name if q.topic else '',
            'level': q.level.get_level_display() if q.level else '',
            'test_cases_count': q.test_cases.count()
        } for q in obj.coding_questions.all()]


class InternshipProgramDetailSerializer(serializers.ModelSerializer):
    applications_count = serializers.SerializerMethodField()
    scholarship_rules = serializers.SerializerMethodField()
    assessment = InternshipAssessmentSummarySerializer(read_only=True)

    class Meta:
        model = InternshipProgram
        fields = [
            'id', 'title', 'slug', 'badge', 'subtitle', 'description',
            'duration', 'mode', 'program_type', 'stipend_info',
            'who_can_apply', 'skills_covered', 'highlights',
            'certificate_info', 'mentorship_info', 'interview_info',
            'start_date', 'end_date', 'application_deadline',
            'is_published', 'status', 'display_order', 'applications_count',
            'scholarship_rules', 'assessment', 'created_at', 'updated_at'
        ]

    def get_applications_count(self, obj):
        return obj.applications.count()

    def get_scholarship_rules(self, obj):
        # Fetch program specific rules, or fallback to global rules
        rules = obj.scholarship_rules.filter(is_active=True)
        if not rules.exists():
            rules = ScholarshipRule.objects.filter(internship__isnull=True, is_active=True)
        return ScholarshipRuleSerializer(rules, many=True).data


# --- Candidate Application Serializers ---

class InternshipApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternshipApplication
        fields = [
            'full_name', 'email', 'phone', 'city',
            'college', 'course', 'year_of_study',
            'primary_skill', 'programming_experience', 'preferred_technology',
            'github_url', 'linkedin_url', 'portfolio_url',
            'agreement_accepted'
        ]

    def validate_agreement_accepted(self, value):
        if not value:
            raise serializers.ValidationError("You must confirm that the provided information is accurate.")
        return value


class InternshipApplicationSerializer(serializers.ModelSerializer):
    internship_title = serializers.CharField(source='internship.title', read_only=True)
    internship_slug = serializers.CharField(source='internship.slug', read_only=True)
    internship_duration = serializers.CharField(source='internship.duration', read_only=True)
    attempt_status = serializers.SerializerMethodField()
    attempt_score = serializers.SerializerMethodField()
    concession_percentage = serializers.SerializerMethodField()
    attempt_id = serializers.SerializerMethodField()

    class Meta:
        model = InternshipApplication
        fields = [
            'id', 'application_id', 'internship', 'internship_title',
            'internship_slug', 'internship_duration', 'full_name', 'email',
            'phone', 'city', 'college', 'course', 'year_of_study',
            'primary_skill', 'programming_experience', 'preferred_technology',
            'github_url', 'linkedin_url', 'portfolio_url', 'agreement_accepted',
            'status', 'interview_date', 'interview_mode', 'interview_link',
            'attempt_status', 'attempt_score', 'concession_percentage', 'attempt_id',
            'created_at', 'updated_at'
        ]

    def get_attempt_status(self, obj):
        if hasattr(obj, 'attempt'):
            return obj.attempt.status
        return 'not_started'

    def get_attempt_score(self, obj):
        if hasattr(obj, 'attempt') and obj.attempt.status == 'completed':
            return obj.attempt.score_percentage
        return None

    def get_concession_percentage(self, obj):
        if hasattr(obj, 'attempt') and obj.attempt.status == 'completed':
            return obj.attempt.concession_percentage
        return None

    def get_attempt_id(self, obj):
        if hasattr(obj, 'attempt'):
            return obj.attempt.id
        return None


# --- Assessment Engine Serializers (Scrubbed / Safe for Candidate) ---

class AssessmentMCQQuestionSerializer(serializers.ModelSerializer):
    """MCQ serializer for the live assessment - DOES NOT expose correct_answer or explanation."""
    topic_name = serializers.CharField(source='topic.name', read_only=True, default='')

    class Meta:
        model = AptitudeQuestion
        fields = [
            'id', 'title', 'statement', 'question_type',
            'options', 'marks', 'negative_marks', 'difficulty', 'topic_name'
        ]


class AssessmentTestCaseSampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ['id', 'input_data', 'expected_output']


class AssessmentCodingQuestionSerializer(serializers.ModelSerializer):
    """Coding question serializer for live assessment - Exposes sample test cases only."""
    sample_test_cases = serializers.SerializerMethodField()
    starter_code_parsed = serializers.SerializerMethodField()
    examples_parsed = serializers.SerializerMethodField()
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    level_name = serializers.CharField(source='level.get_level_display', read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 'title', 'slug', 'statement', 'constraints',
            'input_format', 'output_format', 'notes',
            'starter_code_parsed', 'examples_parsed', 'time_limit', 'memory_limit',
            'topic_name', 'level_name', 'sample_test_cases'
        ]

    def get_sample_test_cases(self, obj):
        public_tcs = obj.test_cases.filter(is_hidden=False)[:3]
        return AssessmentTestCaseSampleSerializer(public_tcs, many=True).data

    def get_starter_code_parsed(self, obj):
        try:
            if isinstance(obj.starter_code, str):
                return json.loads(obj.starter_code)
            return obj.starter_code
        except Exception:
            return {
                "python": "def solution():\n    # Write your solution here\n    pass\n",
                "javascript": "function solution() {\n    // Write your solution here\n}\n",
                "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n",
                "java": "import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n    }\n}\n"
            }

    def get_examples_parsed(self, obj):
        try:
            if isinstance(obj.examples, str):
                return json.loads(obj.examples)
            return obj.examples
        except Exception:
            return []


class InternshipQuestionResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternshipQuestionResponse
        fields = [
            'id', 'question_type', 'mcq_question', 'coding_question',
            'selected_options', 'code', 'language_slug',
            'is_answered', 'is_marked_for_review', 'is_correct',
            'score_awarded', 'passed_test_cases', 'total_test_cases',
            'test_case_results', 'execution_error', 'time_spent_seconds'
        ]


class InternshipAttemptEngineSerializer(serializers.ModelSerializer):
    application_details = serializers.SerializerMethodField()
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)
    duration_minutes = serializers.IntegerField(source='assessment.duration_minutes', read_only=True)
    mcq_questions = serializers.SerializerMethodField()
    coding_questions = serializers.SerializerMethodField()
    responses = InternshipQuestionResponseSerializer(many=True, read_only=True)

    class Meta:
        model = InternshipAttempt
        fields = [
            'id', 'status', 'started_at', 'duration_minutes', 'assessment_title',
            'application_details', 'mcq_questions', 'coding_questions',
            'responses', 'warnings_count'
        ]

    def get_application_details(self, obj):
        return {
            'application_id': obj.application.application_id,
            'full_name': obj.application.full_name,
            'email': obj.application.email,
            'internship_title': obj.application.internship.title,
            'internship_slug': obj.application.internship.slug
        }

    def get_mcq_questions(self, obj):
        return AssessmentMCQQuestionSerializer(obj.assessment.mcq_questions.all(), many=True).data

    def get_coding_questions(self, obj):
        return AssessmentCodingQuestionSerializer(obj.assessment.coding_questions.all(), many=True).data


# --- Score Card & Result Serializers ---

class InternshipAttemptResultSerializer(serializers.ModelSerializer):
    application = InternshipApplicationSerializer(read_only=True)
    concession_rule = ScholarshipRuleSerializer(read_only=True)

    class Meta:
        model = InternshipAttempt
        fields = [
            'id', 'status', 'started_at', 'completed_at',
            'score_percentage', 'total_score', 'max_score',
            'mcq_score', 'mcq_max_score', 'coding_score', 'coding_max_score',
            'total_questions', 'correct_questions', 'time_spent_seconds',
            'concession_percentage', 'concession_rule', 'is_eligible_for_concession',
            'concession_summary', 'topic_breakdown', 'application'
        ]


# --- Admin Management Serializers ---

class InternshipAdminAssessmentManageSerializer(serializers.ModelSerializer):
    mcq_questions_list = AssessmentMCQQuestionSerializer(source='mcq_questions', many=True, read_only=True)
    coding_questions_list = AssessmentCodingQuestionSerializer(source='coding_questions', many=True, read_only=True)

    class Meta:
        model = InternshipAssessment
        fields = [
            'id', 'internship', 'title', 'slug', 'description',
            'duration_minutes', 'total_marks', 'passing_percentage',
            'instructions', 'mcq_questions', 'coding_questions',
            'mcq_questions_list', 'coding_questions_list',
            'is_published', 'created_at', 'updated_at'
        ]


class InternshipAdminApplicationDetailSerializer(serializers.ModelSerializer):
    internship_title = serializers.CharField(source='internship.title', read_only=True)
    internship_slug = serializers.CharField(source='internship.slug', read_only=True)
    attempt = InternshipAttemptResultSerializer(read_only=True)
    responses = serializers.SerializerMethodField()

    class Meta:
        model = InternshipApplication
        fields = [
            'id', 'application_id', 'user', 'internship', 'internship_title',
            'internship_slug', 'full_name', 'email', 'phone', 'city',
            'college', 'course', 'year_of_study', 'primary_skill',
            'programming_experience', 'preferred_technology',
            'github_url', 'linkedin_url', 'portfolio_url', 'agreement_accepted',
            'status', 'interview_date', 'interview_mode', 'interview_link',
            'interview_feedback', 'admin_notes', 'attempt', 'responses',
            'created_at', 'updated_at'
        ]

    def get_responses(self, obj):
        if hasattr(obj, 'attempt'):
            return InternshipQuestionResponseSerializer(obj.attempt.responses.all(), many=True).data
        return []

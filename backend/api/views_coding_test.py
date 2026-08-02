from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db import transaction

from .models import CodingTest, CodingTestQuestion, CodingTestAttempt, CodingQuestionResponse, Language, Question, Submission
from .serializers_coding_test import CodingTestSerializer, CodingTestAttemptSerializer
from .services import Judge0Service

class CodingTestViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CodingTest.objects.filter(is_published=True)
    serializer_class = CodingTestSerializer
    permission_classes = (permissions.IsAuthenticated,)


class CodingTestAttemptViewSet(viewsets.ModelViewSet):
    serializer_class = CodingTestAttemptSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return CodingTestAttempt.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='start')
    def start_test(self, request):
        test_id = request.data.get('test')
        if not test_id:
            return Response({'error': 'Test ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            test = CodingTest.objects.get(id=test_id, is_published=True)
        except CodingTest.DoesNotExist:
            return Response({'error': 'Coding test not found'}, status=status.HTTP_404_NOT_FOUND)

        attempt = CodingTestAttempt.objects.filter(
            user=request.user,
            test=test,
            status='in_progress'
        ).first()

        if attempt:
            # Check if duration exceeded
            elapsed = (timezone.now() - attempt.started_at).total_seconds() / 60.0
            if elapsed > test.overall_duration:
                self._finalize_submission(attempt)
                return Response({'error': 'Previous test session expired. Submitted automatically.'}, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = self.get_serializer(attempt)
            return Response(serializer.data, status=status.HTTP_200_OK)

        with transaction.atomic():
            attempt = CodingTestAttempt.objects.create(
                user=request.user,
                test=test,
                status='in_progress',
                max_score=test.test_questions.count() * 10.0
            )
            for tq in test.test_questions.all():
                CodingQuestionResponse.objects.create(
                    attempt=attempt,
                    question=tq.question,
                    code='',
                    language_slug='',
                    status='Unsubmitted'
                )

        serializer = self.get_serializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='save-response')
    def save_response(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status != 'in_progress':
            return Response({'error': 'Test already completed'}, status=status.HTTP_400_BAD_REQUEST)

        elapsed = (timezone.now() - attempt.started_at).total_seconds() / 60.0
        if elapsed > attempt.test.overall_duration:
            self._finalize_submission(attempt)
            return Response({'error': 'Test duration exceeded. Submitted automatically.'}, status=status.HTTP_400_BAD_REQUEST)

        question_id = request.data.get('question')
        code = request.data.get('code', '')
        language_slug = request.data.get('language_slug', '')

        if not question_id:
            return Response({'error': 'Question ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            response_obj = CodingQuestionResponse.objects.get(attempt=attempt, question_id=question_id)
        except CodingQuestionResponse.DoesNotExist:
            return Response({'error': 'Question not in this test'}, status=status.HTTP_400_BAD_REQUEST)

        response_obj.code = code
        response_obj.language_slug = language_slug
        response_obj.save()

        return Response({'status': 'Response saved'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='warning')
    def record_warning(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status != 'in_progress':
            return Response({'error': 'Test already completed'}, status=status.HTTP_400_BAD_REQUEST)

        attempt.warnings_count += 1
        attempt.save()

        if attempt.warnings_count >= 3:
            self._finalize_submission(attempt)
            return Response({
                'status': 'submitted',
                'warnings_count': attempt.warnings_count,
                'message': 'Test auto-submitted due to proctoring violation warnings.'
            }, status=status.HTTP_200_OK)

        return Response({
            'status': 'warning_recorded',
            'warnings_count': attempt.warnings_count
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='submit')
    def submit_test(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status != 'in_progress':
            return Response({'error': 'Test already completed'}, status=status.HTTP_400_BAD_REQUEST)

        time_spent = int((timezone.now() - attempt.started_at).total_seconds())
        attempt.time_spent = min(time_spent, attempt.test.overall_duration * 60)

        self._finalize_submission(attempt)
        serializer = self.get_serializer(attempt)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def _finalize_submission(self, attempt):
        attempt.status = 'completed'
        attempt.completed_at = timezone.now()
        
        total_score = 0.0
        
        responses = attempt.responses.all()
        for resp in responses:
            if not resp.code or not resp.language_slug:
                resp.status = 'Skipped'
                resp.passed_test_cases = 0
                resp.total_test_cases = resp.question.test_cases.count()
                resp.save()
                continue

            try:
                language = Language.objects.get(slug=resp.language_slug)
            except Language.DoesNotExist:
                resp.status = 'Compile Error'
                resp.save()
                continue

            test_cases = resp.question.test_cases.all()
            if not test_cases.exists():
                resp.status = 'Accepted'
                resp.passed_test_cases = 0
                resp.total_test_cases = 0
                resp.save()
                continue

            result = Judge0Service.execute_code_batch(
                source_code=resp.code,
                language_id=language.judge0_id,
                test_cases=test_cases,
                time_limit=resp.question.time_limit,
                memory_limit=resp.question.memory_limit
            )

            resp.status = result['status']
            resp.passed_test_cases = result['passed_count']
            resp.total_test_cases = result['total_count']
            resp.save()

            Submission.objects.create(
                user=attempt.user,
                question=resp.question,
                language=language,
                code=resp.code,
                status=result['status'],
                error_message=result.get('error_message'),
                execution_time=result.get('max_time'),
                memory_usage=result.get('max_memory'),
                passed_test_cases=result['passed_count'],
                total_test_cases=result['total_count']
            )

            tq = CodingTestQuestion.objects.filter(test=attempt.test, question=resp.question).first()
            question_points = tq.points if tq else 10.0

            if result['total_count'] > 0:
                fraction_passed = result['passed_count'] / result['total_count']
                total_score += fraction_passed * question_points
            elif result['status'] == 'Accepted':
                total_score += question_points

        attempt.score = total_score
        attempt.save()

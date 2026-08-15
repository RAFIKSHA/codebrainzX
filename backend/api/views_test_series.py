from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db import transaction
from django.db.models import Count, Q, Avg, Sum, F, Max
from django.contrib.auth.models import User

from .models import (
    TestSeriesCategory, TestSeriesCompany, TestSeries, IndividualTest,
    IndividualTestAttempt, IndividualTestResponse, Question, AptitudeQuestion, Language, Submission
)
from .serializers_test_series import (
    TestSeriesCategorySerializer, TestSeriesCompanySerializer, TestSeriesSerializer,
    IndividualTestSerializer, IndividualTestAttemptSerializer, IndividualTestResponseSerializer
)
from .serializers import QuestionDetailSerializer
from .serializers_aptitude import StudentAptitudeQuestionSerializer
from .permissions import IsAdminUser
from .services import Judge0Service

class TestSeriesCategoryViewSet(viewsets.ModelViewSet):
    queryset = TestSeriesCategory.objects.all()
    serializer_class = TestSeriesCategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    @action(detail=False, methods=['post'], url_path='reorder', permission_classes=[IsAdminUser])
    def reorder(self, request):
        order_list = request.data.get('order', [])
        if order_list:
            for index, item_id in enumerate(order_list):
                TestSeriesCategory.objects.filter(id=item_id).update(display_order=index)
        return Response({'status': 'reordered'})

class TestSeriesCompanyViewSet(viewsets.ModelViewSet):
    serializer_class = TestSeriesCompanySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = TestSeriesCompany.objects.all()
        if self.action in ['list', 'retrieve'] and not (self.request.user and self.request.user.is_authenticated and (self.request.user.is_staff or (hasattr(self.request.user, 'profile') and self.request.user.profile.role == 'admin'))):
            qs = qs.filter(is_active=True)

        qs = qs.annotate(
            coding_series_count=Count('series', filter=Q(series__category__type='coding', series__is_published=True), distinct=True),
            aptitude_series_count=Count('series', filter=Q(series__category__type='aptitude', series__is_published=True), distinct=True),
            total_tests_count=Count('series__tests', filter=Q(series__is_published=True, series__tests__is_published=True), distinct=True)
        )
        return qs

    @action(detail=False, methods=['post'], url_path='reorder', permission_classes=[IsAdminUser])
    def reorder(self, request):
        order_list = request.data.get('order', [])
        if order_list:
            for index, item_id in enumerate(order_list):
                TestSeriesCompany.objects.filter(id=item_id).update(display_order=index)
        return Response({'status': 'reordered'})

class TestSeriesViewSet(viewsets.ModelViewSet):
    serializer_class = TestSeriesSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = TestSeries.objects.all()
        if self.action in ['list', 'retrieve'] and not (self.request.user and self.request.user.is_authenticated and (self.request.user.is_staff or (hasattr(self.request.user, 'profile') and self.request.user.profile.role == 'admin'))):
            qs = qs.filter(is_published=True)

        company_slug = self.request.query_params.get('company')
        if company_slug:
            qs = qs.filter(company__slug=company_slug)

        category_type = self.request.query_params.get('type')
        if category_type:
            qs = qs.filter(category__type=category_type)

        return qs

    @action(detail=False, methods=['post'], url_path='reorder', permission_classes=[IsAdminUser])
    def reorder(self, request):
        order_list = request.data.get('order', [])
        if order_list:
            for index, item_id in enumerate(order_list):
                TestSeries.objects.filter(id=item_id).update(display_order=index)
        return Response({'status': 'reordered'})

    @action(detail=True, methods=['post'], url_path='clone', permission_classes=[IsAdminUser])
    def clone(self, request, pk=None):
        series = self.get_object()
        with transaction.atomic():
            cloned = TestSeries.objects.create(
                company=series.company,
                category=series.category,
                name=f"{series.name} - Copy",
                description=series.description,
                difficulty=series.difficulty,
                thumbnail_url=series.thumbnail_url,
                validity_days=series.validity_days,
                is_published=False,
                display_order=series.display_order + 1
            )
            for test in series.tests.all():
                cloned_test = IndividualTest.objects.create(
                    series=cloned,
                    name=test.name,
                    test_number=test.test_number,
                    description=test.description,
                    duration_minutes=test.duration_minutes,
                    marks=test.marks,
                    negative_marking=test.negative_marking,
                    difficulty=test.difficulty,
                    instructions=test.instructions,
                    is_published=test.is_published
                )
                cloned_test.coding_questions.set(test.coding_questions.all())
                cloned_test.aptitude_questions.set(test.aptitude_questions.all())
        return Response(TestSeriesSerializer(cloned, context={'request': request}).data, status=status.HTTP_201_CREATED)

class IndividualTestViewSet(viewsets.ModelViewSet):
    serializer_class = IndividualTestSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = IndividualTest.objects.all()
        if self.action in ['list', 'retrieve'] and not (self.request.user and self.request.user.is_authenticated and (self.request.user.is_staff or (hasattr(self.request.user, 'profile') and self.request.user.profile.role == 'admin'))):
            qs = qs.filter(is_published=True)

        series_id = self.request.query_params.get('series')
        if series_id:
            qs = qs.filter(series_id=series_id)

        return qs

    @action(detail=False, methods=['post'], url_path='reorder', permission_classes=[IsAdminUser])
    def reorder(self, request):
        order_list = request.data.get('order', [])
        if order_list:
            for index, item_id in enumerate(order_list):
                IndividualTest.objects.filter(id=item_id).update(test_number=index + 1)
        return Response({'status': 'reordered'})

    @action(detail=True, methods=['post'], url_path='clone', permission_classes=[IsAdminUser])
    def clone(self, request, pk=None):
        test = self.get_object()
        max_num = test.series.tests.aggregate(max_n=Max('test_number'))['max_n'] or test.test_number
        with transaction.atomic():
            cloned = IndividualTest.objects.create(
                series=test.series,
                name=f"{test.name} - Copy",
                test_number=max_num + 1,
                description=test.description,
                duration_minutes=test.duration_minutes,
                marks=test.marks,
                negative_marking=test.negative_marking,
                difficulty=test.difficulty,
                instructions=test.instructions,
                is_published=False
            )
            cloned.coding_questions.set(test.coding_questions.all())
            cloned.aptitude_questions.set(test.aptitude_questions.all())
        return Response(IndividualTestSerializer(cloned, context={'request': request}).data, status=status.HTTP_201_CREATED)

class IndividualTestAttemptViewSet(viewsets.ModelViewSet):
    serializer_class = IndividualTestAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return IndividualTestAttempt.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='start')
    def start_test(self, request):
        test_id = request.data.get('test_id')
        if not test_id:
            return Response({"error": "test_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            test = IndividualTest.objects.get(id=test_id, is_published=True)
        except IndividualTest.DoesNotExist:
            return Response({"error": "Test not found"}, status=status.HTTP_404_NOT_FOUND)

        active = IndividualTestAttempt.objects.filter(user=request.user, test=test, status='in_progress').first()
        if active:
            # Check elapsed time
            elapsed = (timezone.now() - active.started_at).total_seconds() / 60.0
            if elapsed > test.duration_minutes:
                self._finalize_submission(active)
                return Response({"error": "Session expired. Submitted automatically."}, status=status.HTTP_400_BAD_REQUEST)
            return Response(self._get_attempt_payload(active, request))

        # Create new attempt
        with transaction.atomic():
            attempt = IndividualTestAttempt.objects.create(
                user=request.user,
                test=test,
                status='in_progress',
                max_score=float(test.marks),
                total_questions=test.coding_questions.count() if test.series.category.type == 'coding' else test.aptitude_questions.count()
            )
            # Create Responses Skeleton
            if test.series.category.type == 'coding':
                for q in test.coding_questions.all():
                    IndividualTestResponse.objects.create(
                        attempt=attempt,
                        coding_question=q,
                        code='',
                        language_slug='',
                        status='Unsubmitted'
                    )
            else:
                for q in test.aptitude_questions.all():
                    IndividualTestResponse.objects.create(
                        attempt=attempt,
                        aptitude_question=q,
                        selected_options=[],
                        is_correct=False,
                        is_answered=False,
                        time_spent=0
                    )

        return Response(self._get_attempt_payload(attempt, request), status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='save-answer')
    def save_answer(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status == 'completed':
            return Response({"error": "Test already completed"}, status=status.HTTP_400_BAD_REQUEST)

        elapsed = (timezone.now() - attempt.started_at).total_seconds() / 60.0
        if elapsed > attempt.test.duration_minutes:
            self._finalize_submission(attempt)
            return Response({"error": "Duration exceeded. Submitted automatically."}, status=status.HTTP_400_BAD_REQUEST)

        question_id = request.data.get('question_id')
        time_spent_delta = int(request.data.get('time_spent', 0))

        if attempt.test.series.category.type == 'coding':
            code = request.data.get('code', '')
            language_slug = request.data.get('language_slug', '')

            try:
                resp = IndividualTestResponse.objects.get(attempt=attempt, coding_question_id=question_id)
            except IndividualTestResponse.DoesNotExist:
                return Response({"error": "Question not in test"}, status=status.HTTP_400_BAD_REQUEST)

            resp.code = code
            resp.language_slug = language_slug
            resp.is_answered = bool(code)
            resp.time_spent += time_spent_delta
            resp.save()
        else:
            selected_options = request.data.get('selected_options', [])
            is_marked_for_review = request.data.get('is_marked_for_review', False)
            is_answered = request.data.get('is_answered', False)

            try:
                resp = IndividualTestResponse.objects.get(attempt=attempt, aptitude_question_id=question_id)
            except IndividualTestResponse.DoesNotExist:
                return Response({"error": "Question not in test"}, status=status.HTTP_400_BAD_REQUEST)

            resp.selected_options = selected_options
            resp.is_answered = is_answered
            resp.time_spent += time_spent_delta
            resp.save()

        attempt.time_spent += time_spent_delta
        attempt.save()

        return Response({"status": "Answer auto-saved"})

    @action(detail=True, methods=['post'], url_path='submit')
    def submit_test(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status == 'completed':
            return Response(IndividualTestAttemptSerializer(attempt).data)

        self._finalize_submission(attempt)
        return Response(IndividualTestAttemptSerializer(attempt).data)

    def _get_attempt_payload(self, attempt, request):
        serializer = self.get_serializer(attempt)
        test = attempt.test
        category_type = test.series.category.type

        serialized_questions = []
        context = {'request': request}
        if category_type == 'coding':
            for q in test.coding_questions.all().order_by('order', 'id'):
                serialized_questions.append(QuestionDetailSerializer(q, context=context).data)
        else:
            for q in test.aptitude_questions.all().order_by('created_at'):
                serialized_questions.append(StudentAptitudeQuestionSerializer(q, context=context).data)

        # Responses map
        responses = attempt.responses.all()
        serialized_responses = {}
        for r in responses:
            q_id = r.coding_question_id if category_type == 'coding' else r.aptitude_question_id
            serialized_responses[q_id] = {
                "selected_options": r.selected_options,
                "code": r.code,
                "language_slug": r.language_slug,
                "is_answered": r.is_answered,
                "time_spent": r.time_spent,
                "status": r.status
            }

        elapsed = (timezone.now() - attempt.started_at).total_seconds()
        total = test.duration_minutes * 60
        time_left = max(0, int(total - elapsed))

        return {
            "attempt": serializer.data,
            "questions": serialized_questions,
            "responses": serialized_responses,
            "time_left_seconds": time_left
        }

    def _finalize_submission(self, attempt):
        attempt.status = 'completed'
        attempt.completed_at = timezone.now()
        
        test = attempt.test
        category_type = test.series.category.type
        responses = attempt.responses.all()
        
        score = 0.0
        attempted = 0
        correct = 0
        wrong = 0
        skipped = 0
        
        if category_type == 'coding':
            question_points = float(test.marks) / max(1.0, float(responses.count()))
            for resp in responses:
                if not resp.code or not resp.language_slug:
                    resp.status = 'Skipped'
                    resp.passed_test_cases = 0
                    resp.total_test_cases = resp.coding_question.test_cases.count()
                    resp.save()
                    skipped += 1
                    continue
                
                attempted += 1
                try:
                    language = Language.objects.get(slug=resp.language_slug)
                except Language.DoesNotExist:
                    resp.status = 'Compile Error'
                    resp.save()
                    wrong += 1
                    continue
                
                test_cases = resp.coding_question.test_cases.all()
                if not test_cases.exists():
                    resp.status = 'Accepted'
                    resp.is_correct = True
                    resp.passed_test_cases = 0
                    resp.total_test_cases = 0
                    resp.save()
                    correct += 1
                    score += question_points
                    continue
                
                # Execute batch on Judge0
                result = Judge0Service.execute_code_batch(
                    source_code=resp.code,
                    language_id=language.judge0_id,
                    test_cases=test_cases,
                    time_limit=resp.coding_question.time_limit,
                    memory_limit=resp.coding_question.memory_limit
                )
                
                resp.status = result['status']
                resp.passed_test_cases = result['passed_count']
                resp.total_test_cases = result['total_count']
                is_correct = result['status'] == 'Accepted'
                resp.is_correct = is_correct
                resp.save()
                
                # Create history Submission entry
                Submission.objects.create(
                    user=attempt.user,
                    question=resp.coding_question,
                    language=language,
                    code=resp.code,
                    status=result['status'],
                    error_message=result.get('error_message'),
                    execution_time=result.get('max_time'),
                    memory_usage=result.get('max_memory'),
                    passed_test_cases=result['passed_count'],
                    total_test_cases=result['total_count']
                )
                
                if is_correct:
                    correct += 1
                else:
                    wrong += 1
                
                if result['total_count'] > 0:
                    fraction = result['passed_count'] / result['total_count']
                    score += fraction * question_points
                elif is_correct:
                    score += question_points
        else:
            # Aptitude MCQ scoring
            question_points = float(test.marks) / max(1.0, float(responses.count()))
            for resp in responses:
                q = resp.aptitude_question
                if not resp.selected_options:
                    skipped += 1
                    continue
                
                attempted += 1
                user_ans = [str(ans).strip().upper() for ans in resp.selected_options if str(ans).strip()]
                correct_ans = [str(ans).strip().upper() for ans in q.correct_answer if str(ans).strip()]
                
                is_correct = False
                if q.question_type == 'numerical':
                    u_val = user_ans[0] if user_ans else ""
                    c_val = correct_ans[0] if correct_ans else ""
                    try:
                        is_correct = float(u_val) == float(c_val)
                    except ValueError:
                        is_correct = u_val == c_val
                elif q.question_type == 'match_following':
                    is_correct = resp.selected_options == q.correct_answer
                else:
                    is_correct = set(user_ans) == set(correct_ans)
                
                resp.is_correct = is_correct
                resp.save()
                
                if is_correct:
                    correct += 1
                    score += question_points
                else:
                    wrong += 1
                    if test.negative_marking:
                        # deduct 0.25 fraction marks for wrong answer (or 1/4 of question value)
                        score -= 0.25 * question_points
        
        attempt.score = max(0.0, score)
        attempt.attempted_questions = attempted
        attempt.correct_questions = correct
        attempt.wrong_questions = wrong
        attempt.skipped_questions = skipped
        attempt.accuracy = (correct / attempted * 100) if attempted > 0 else 0.0
        attempt.save()

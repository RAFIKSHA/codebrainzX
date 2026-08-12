import csv
from io import StringIO
from django.db import transaction
from django.db.models import Count, Q, Avg, Sum, F
from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import (
    AptitudeTrainer, AptitudeCategory, AptitudeTopic, AptitudeSubTopic, AptitudeQuestion,
    AptitudeQuestionVersion, AptitudeTest, AptitudeTestSection, AptitudeTestQuestion,
    AptitudeTestAttempt, AptitudeQuestionResponse, AptitudeBookmark,
    AptitudeReportedQuestion, GamificationProfile, GamificationBadge
)
from .serializers_aptitude import (
    AptitudeTrainerSerializer, AptitudeTrainerDetailSerializer,
    AptitudeCategorySerializer, AptitudeTopicSerializer, AptitudeSubTopicSerializer,
    AptitudeQuestionSerializer, StudentAptitudeQuestionSerializer, StudentPracticeQuestionSerializer, AptitudeQuestionVersionSerializer,
    AptitudeTestSerializer, AptitudeTestSectionSerializer, AptitudeTestAttemptSerializer,
    AptitudeQuestionResponseSerializer, AptitudeBookmarkSerializer, GamificationProfileSerializer
)
from .permissions import IsAdminUser
from .admin_import import import_aptitude_questions_from_csv

class AptitudeDashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        user = request.user if request.user and request.user.is_authenticated else None
        
        if user:
            # 1. Get or create gamification profile
            g_profile, _ = GamificationProfile.objects.get_or_create(
                user=user,
                defaults={'xp': 0, 'coins': 0, 'level': 1, 'daily_streak': 0, 'weekly_streak': 0}
            )
            
            # 2. Performance details
            attempts = AptitudeTestAttempt.objects.filter(user=user, status='completed')
            total_attempts = attempts.count()
            avg_accuracy = attempts.aggregate(avg=Avg('accuracy'))['avg'] or 0.0
            
            # 3. Active pending attempt to "Continue Last Test"
            pending_attempt = AptitudeTestAttempt.objects.filter(user=user, status='in_progress').order_by('-started_at').first()
            pending_data = None
            if pending_attempt:
                pending_data = {
                    "attempt_id": pending_attempt.id,
                    "test_id": pending_attempt.test.id,
                    "test_title": pending_attempt.test.title,
                    "current_question_index": pending_attempt.current_question_index,
                    "started_at": pending_attempt.started_at
                }

            # 4. Strength/Weakness Analysis based on question responses
            responses = AptitudeQuestionResponse.objects.filter(attempt__user=user, attempt__status='completed')
            topic_stats = {}
            for r in responses:
                topic_id = r.question.topic_id
                topic_name = r.question.topic.name
                if topic_id not in topic_stats:
                    topic_stats[topic_id] = {"name": topic_name, "correct": 0, "total": 0}
                topic_stats[topic_id]["total"] += 1
                if r.is_correct:
                    topic_stats[topic_id]["correct"] += 1

            weak_areas = []
            strong_areas = []
            for tid, stats in topic_stats.items():
                acc = (stats["correct"] / stats["total"]) * 100 if stats["total"] > 0 else 0
                stats_entry = {"id": tid, "name": stats["name"], "accuracy": acc, "total": stats["total"]}
                if acc < 50:
                    weak_areas.append(stats_entry)
                elif acc >= 75:
                    strong_areas.append(stats_entry)

            # 5. Bookmarks count
            bookmarks_count = AptitudeBookmark.objects.filter(user=user).count()

            # 6. Wrong questions count
            wrong_count = responses.filter(is_correct=False).values('question').distinct().count()
            gamification_data = GamificationProfileSerializer(g_profile).data
        else:
            total_attempts = 0
            avg_accuracy = 0.0
            bookmarks_count = 0
            wrong_count = 0
            pending_data = None
            weak_areas = []
            strong_areas = []
            gamification_data = {"xp": 0, "coins": 0, "level": 1, "daily_streak": 0, "weekly_streak": 0, "badges": []}

        # 7. Active Trainers
        active_trainers = AptitudeTrainer.objects.filter(is_active=True)[:6]

        return Response({
            "gamification": gamification_data,
            "stats": {
                "total_attempts": total_attempts,
                "avg_accuracy": avg_accuracy,
                "bookmarks_count": bookmarks_count,
                "wrong_questions_count": wrong_count,
            },
            "pending_attempt": pending_data,
            "weak_areas": sorted(weak_areas, key=lambda x: x["accuracy"])[:5],
            "strong_areas": sorted(strong_areas, key=lambda x: x["accuracy"], reverse=True)[:5],
            "trainers": AptitudeTrainerSerializer(active_trainers, many=True).data
        })


from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.conf import settings

class AptitudeTrainerViewSet(viewsets.ModelViewSet):
    queryset = AptitudeTrainer.objects.all()
    serializer_class = AptitudeTrainerSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'profile']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = AptitudeTrainer.objects.all()
        active_only = self.request.query_params.get('active') or self.request.query_params.get('active_only')
        is_admin = self.request.user and (self.request.user.is_staff or (hasattr(self.request.user, 'profile') and self.request.user.profile.role == 'admin'))
        if active_only == 'true' or not is_admin:
            qs = qs.filter(is_active=True)
        return qs

    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        trainer = self.get_object()
        serializer = AptitudeTrainerDetailSerializer(trainer, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser], url_path='upload-image')
    def upload_image(self, request):
        file_obj = request.data.get('file') or request.data.get('image')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        path = default_storage.save(f'trainers/{file_obj.name}', file_obj)
        media_url = getattr(settings, 'MEDIA_URL', '/media/')
        url = request.build_absolute_uri(media_url + path)
        return Response({'url': url, 'name': file_obj.name})


class AptitudeCategoryViewSet(viewsets.ModelViewSet):
    queryset = AptitudeCategory.objects.prefetch_related('topics__sub_topics').all()
    serializer_class = AptitudeCategorySerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder(self, request):
        orders = request.data.get('orders', [])
        with transaction.atomic():
            for item in orders:
                AptitudeCategory.objects.filter(pk=item["id"]).update(order=item["order"])
        return Response({"status": "categories reordered"})


class AptitudeQuestionViewSet(viewsets.ModelViewSet):
    queryset = AptitudeQuestion.objects.all()
    
    def get_serializer_class(self):
        if self.request.user and (self.request.user.is_staff or (hasattr(self.request.user, 'profile') and self.request.user.profile.role == 'admin')):
            return AptitudeQuestionSerializer
        if self.request.query_params.get('practice') == 'true':
            return StudentPracticeQuestionSerializer
        return StudentAptitudeQuestionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'bookmark':
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = AptitudeQuestion.objects.filter(parent=None)
        
        # Filters
        trainer_id = self.request.query_params.get('trainer') or self.request.query_params.get('trainer_id')
        topic_id = self.request.query_params.get('topic')
        sub_topic_id = self.request.query_params.get('sub_topic')
        difficulty = self.request.query_params.get('difficulty')
        q_type = self.request.query_params.get('question_type')
        status_val = self.request.query_params.get('status', 'active')
        
        if trainer_id:
            qs = qs.filter(trainer_id=trainer_id)
        if topic_id:
            qs = qs.filter(topic_id=topic_id)
        if sub_topic_id:
            qs = qs.filter(sub_topic_id=sub_topic_id)
        if difficulty:
            qs = qs.filter(difficulty=difficulty)
        if q_type:
            qs = qs.filter(question_type=q_type)
        if status_val and self.request.user and self.request.user.is_authenticated and self.request.user.is_staff:
            qs = qs.filter(status=status_val)
        else:
            qs = qs.filter(status='active', visibility='public')
            
        return qs

    @action(detail=True, methods=['post'])
    def clone(self, request, pk=None):
        question = self.get_object()
        with transaction.atomic():
            cloned = AptitudeQuestion.objects.create(
                topic=question.topic,
                sub_topic=question.sub_topic,
                title=f"{question.title} - Clone",
                statement=question.statement,
                difficulty=question.difficulty,
                question_type=question.question_type,
                options=question.options,
                correct_answer=question.correct_answer,
                explanation=question.explanation,
                shortcut_trick=question.shortcut_trick,
                hint=question.hint,
                marks=question.marks,
                negative_marks=question.negative_marks,
                time_limit=question.time_limit,
                company_tags=question.company_tags,
                university_tags=question.university_tags,
                source=question.source,
                status=question.status,
                visibility=question.visibility,
                version=1
            )
            # Clone sub-questions if present
            for sq in question.sub_questions.all():
                AptitudeQuestion.objects.create(
                    topic=sq.topic,
                    sub_topic=sq.sub_topic,
                    title=f"{sq.title} - Clone",
                    statement=sq.statement,
                    difficulty=sq.difficulty,
                    question_type=sq.question_type,
                    options=sq.options,
                    correct_answer=sq.correct_answer,
                    explanation=sq.explanation,
                    shortcut_trick=sq.shortcut_trick,
                    hint=sq.hint,
                    marks=sq.marks,
                    negative_marks=sq.negative_marks,
                    time_limit=sq.time_limit,
                    parent=cloned
                )
        return Response(AptitudeQuestionSerializer(cloned).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        question = self.get_object()
        question.status = 'archived'
        question.save()
        return Response({"status": "Question archived successfully"})

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        question = self.get_object()
        versions = question.versions.all().order_by('-version')
        return Response(AptitudeQuestionVersionSerializer(versions, many=True).data)

    @action(detail=False, methods=['post'], url_path='import-csv')
    def import_csv(self, request):
        csv_file = request.FILES.get('file')
        if not csv_file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        
        file_data = csv_file.read()
        res = import_aptitude_questions_from_csv(file_data)
        
        if res["success"]:
            return Response(res, status=status.HTTP_201_CREATED)
        else:
            return Response(res, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='export-csv')
    def export_csv(self, request):
        questions = AptitudeQuestion.objects.filter(parent=None)
        
        f = StringIO()
        writer = csv.writer(f)
        writer.writerow([
            'Category', 'Topic', 'Sub Topic', 'Difficulty', 'Question Title', 'Statement',
            'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer',
            'Detailed Explanation', 'Shortcut Trick', 'Hint', 'Marks', 'Negative Marks',
            'Time Limit', 'Company Tags', 'University Tags', 'Question Source', 'Status', 'Visibility'
        ])
        
        for q in questions:
            options_dict = {opt["key"]: opt["text"] for opt in q.options if isinstance(opt, dict) and "key" in opt}
            opt_a = options_dict.get("A", "")
            opt_b = options_dict.get("B", "")
            opt_c = options_dict.get("C", "")
            opt_d = options_dict.get("D", "")
            
            correct_str = ",".join(q.correct_answer) if isinstance(q.correct_answer, list) else str(q.correct_answer)
            company_str = ",".join(q.company_tags) if isinstance(q.company_tags, list) else ""
            university_str = ",".join(q.university_tags) if isinstance(q.university_tags, list) else ""
            
            writer.writerow([
                q.topic.category.name,
                q.topic.name,
                q.sub_topic.name if q.sub_topic else "",
                q.difficulty,
                q.title,
                q.statement,
                opt_a, opt_b, opt_c, opt_d,
                correct_str,
                q.explanation,
                q.shortcut_trick,
                q.hint,
                q.marks,
                q.negative_marks,
                q.time_limit,
                company_str,
                university_str,
                q.source,
                q.status,
                q.visibility
            ])
            
        response = Response(f.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="aptitude_questions.csv"'
        return response

    @action(detail=True, methods=['post'])
    def bookmark(self, request, pk=None):
        question = self.get_object()
        bookmark, created = AptitudeBookmark.objects.get_or_create(user=request.user, question=question)
        if not created:
            bookmark.delete()
            return Response({"bookmarked": False, "message": "Bookmark removed"})
        return Response({"bookmarked": True, "message": "Bookmark saved"})

class AptitudeTestViewSet(viewsets.ModelViewSet):
    queryset = AptitudeTest.objects.filter(is_published=True)
    serializer_class = AptitudeTestSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = AptitudeTest.objects.all()
        if not (self.request.user and self.request.user.is_authenticated and self.request.user.is_staff):
            qs = qs.filter(is_published=True)
            
        test_type = self.request.query_params.get('test_type')
        company = self.request.query_params.get('company')
        university = self.request.query_params.get('university')
        
        if test_type:
            qs = qs.filter(test_type=test_type)
        if company:
            qs = qs.filter(company_tags__contains=company)
        if university:
            qs = qs.filter(university_tags__contains=university)
            
        return qs

class AptitudeTestAttemptViewSet(viewsets.ModelViewSet):
    queryset = AptitudeTestAttempt.objects.all()
    serializer_class = AptitudeTestAttemptSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return AptitudeTestAttempt.objects.filter(user=self.request.user)
        return AptitudeTestAttempt.objects.all()

    @action(detail=False, methods=['post'], url_path='start-practice')
    def start_practice(self, request):
        user = request.user if request.user and request.user.is_authenticated else None
        if not user:
            user, _ = User.objects.get_or_create(username='guest_student', defaults={'first_name': 'Guest', 'last_name': 'Student', 'is_active': True})
        mode = request.data.get('mode', 'topic')
        topic_id = request.data.get('topic_id')
        sub_topic_id = request.data.get('sub_topic_id')
        difficulty = request.data.get('difficulty')
        count = int(request.data.get('count', 10))
        calc_enabled = request.data.get('calculator_enabled', True)

        # 1. Fetch matching questions
        qs = AptitudeQuestion.objects.filter(parent=None, status='active', visibility='public')
        
        if mode == 'bookmarks':
            q_ids = AptitudeBookmark.objects.filter(user=user).values_list('question_id', flat=True)
            qs = qs.filter(id__in=q_ids)
        elif mode == 'wrong':
            q_ids = AptitudeQuestionResponse.objects.filter(
                attempt__user=user,
                attempt__status='completed',
                is_correct=False
            ).values_list('question_id', flat=True).distinct()
            qs = qs.filter(id__in=q_ids)
        elif mode == 'recommend':
            # AI recommends questions from weak areas (accuracy < 50%)
            responses = AptitudeQuestionResponse.objects.filter(attempt__user=user, attempt__status='completed')
            topic_stats = {}
            for r in responses:
                t_id = r.question.topic_id
                if t_id not in topic_stats:
                    topic_stats[t_id] = {"correct": 0, "total": 0}
                topic_stats[t_id]["total"] += 1
                if r.is_correct:
                    topic_stats[t_id]["correct"] += 1

            weak_topics = [tid for tid, stats in topic_stats.items() if (stats["correct"] / stats["total"] * 100) < 50.0]
            if weak_topics:
                qs = qs.filter(topic_id__in=weak_topics)
            # Exclude already solved questions
            solved_qids = responses.filter(is_correct=True).values_list('question_id', flat=True)
            qs = qs.exclude(id__in=solved_qids)
        else: # topic mode
            if topic_id:
                qs = qs.filter(topic_id=topic_id)
            if sub_topic_id:
                qs = qs.filter(sub_topic_id=sub_topic_id)
                
        if difficulty:
            qs = qs.filter(difficulty=difficulty)

        # Get questions
        matching_questions = list(qs.order_by('?')[:count])
        if not matching_questions:
            return Response({"error": "No matching questions available for this practice specification."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Create a temporary practice test
        with transaction.atomic():
            test = AptitudeTest.objects.create(
                title=f"Practice: {mode.capitalize()} Session",
                description="Custom practice session generated on the fly.",
                test_type='practice',
                overall_duration=count * 2, # Estimate 2 minutes per question
                section_timer=False,
                pass_percentage=40.0,
                negative_marking=False,
                calculator_enabled=calc_enabled,
                is_published=False # Keep it hidden from general test list
            )
            
            # Map questions
            for idx, q in enumerate(matching_questions):
                AptitudeTestQuestion.objects.create(
                    test=test,
                    question=q,
                    order=idx
                )
                
            # Create attempt
            attempt = AptitudeTestAttempt.objects.create(
                user=user,
                test=test,
                status='in_progress',
                current_question_index=0,
                max_score=sum(q.marks for q in matching_questions),
                total_questions=len(matching_questions)
            )
            
            # Create responses skeleton so they are auto-saved
            for q in matching_questions:
                AptitudeQuestionResponse.objects.create(
                    attempt=attempt,
                    question=q,
                    selected_options=[],
                    is_marked_for_review=False,
                    is_answered=False,
                    time_spent=0
                )
                
        return Response(self._get_attempt_payload(attempt, request), status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='start')
    def start_test(self, request):
        test_id = request.data.get('test_id')
        if not test_id:
            return Response({"error": "test_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            test = AptitudeTest.objects.get(id=test_id)
        except AptitudeTest.DoesNotExist:
            return Response({"error": "Test not found"}, status=status.HTTP_404_NOT_FOUND)

        user = request.user if request.user and request.user.is_authenticated else None
        if not user:
            user, _ = User.objects.get_or_create(username='guest_student', defaults={'first_name': 'Guest', 'last_name': 'Student', 'is_active': True})

        # Check for active attempt. If exists, resume it.
        active = AptitudeTestAttempt.objects.filter(user=user, test=test, status='in_progress').first()
        if active:
            return Response(self._get_attempt_payload(active, request))

        # Create new attempt
        first_section = test.sections.first()
        
        # Calculate max marks
        test_questions = test.test_questions.all()
        max_score = 0.0
        for tq in test_questions:
            max_score += tq.question.marks

        with transaction.atomic():
            attempt = AptitudeTestAttempt.objects.create(
                user=user,
                test=test,
                status='in_progress',
                current_section=first_section,
                current_question_index=0,
                max_score=max_score,
                total_questions=test_questions.count()
            )
            # Create responses skeleton so they are auto-saved
            for tq in test_questions:
                AptitudeQuestionResponse.objects.create(
                    attempt=attempt,
                    question=tq.question,
                    selected_options=[],
                    is_marked_for_review=False,
                    is_answered=False,
                    time_spent=0
                )

        return Response(self._get_attempt_payload(attempt, request), status=status.HTTP_201_CREATED)

    def _get_attempt_payload(self, attempt, request):
        serializer = AptitudeTestAttemptSerializer(attempt)
        # Fetch questions
        test_questions = AptitudeTestQuestion.objects.filter(test=attempt.test).order_by('order', 'id')
        
        # Serialize questions using student serializer
        context = {'request': request}
        serialized_questions = []
        for tq in test_questions:
            q_data = StudentAptitudeQuestionSerializer(tq.question, context=context).data
            # Bind section metadata
            q_data["section_id"] = tq.section_id if tq.section else None
            q_data["section_name"] = tq.section.name if tq.section else "Default"
            serialized_questions.append(q_data)
            
        # Fetch responses
        responses = attempt.responses.all()
        serialized_responses = {
            r.question_id: {
                "selected_options": r.selected_options,
                "is_marked_for_review": r.is_marked_for_review,
                "is_answered": r.is_answered,
                "time_spent": r.time_spent
            } for r in responses
        }
        
        # Calculate time left
        elapsed_seconds = (timezone.now() - attempt.started_at).total_seconds()
        total_seconds = attempt.test.overall_duration * 60
        time_left = max(0, int(total_seconds - elapsed_seconds))

        return {
            "attempt": serializer.data,
            "questions": serialized_questions,
            "responses": serialized_responses,
            "time_left_seconds": time_left
        }

    @action(detail=True, methods=['post'], url_path='save-answer')
    def save_answer(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status == 'completed':
            return Response({"error": "Cannot save answer for a completed test"}, status=status.HTTP_400_BAD_REQUEST)
            
        question_id = request.data.get('question_id')
        selected_options = request.data.get('selected_options', [])
        is_marked = request.data.get('is_marked_for_review', False)
        is_answered = request.data.get('is_answered', False)
        time_spent_delta = int(request.data.get('time_spent', 0))
        
        current_question_index = request.data.get('current_question_index', attempt.current_question_index)
        current_section_id = request.data.get('current_section_id')

        try:
            resp = AptitudeQuestionResponse.objects.get(attempt=attempt, question_id=question_id)
        except AptitudeQuestionResponse.DoesNotExist:
            return Response({"error": "Question not part of this test"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            resp.selected_options = selected_options
            resp.is_marked_for_review = is_marked
            resp.is_answered = is_answered
            resp.time_spent += time_spent_delta
            resp.save()

            # Update attempt progress state
            attempt.current_question_index = current_question_index
            if current_section_id:
                attempt.current_section_id = current_section_id
            attempt.time_spent += time_spent_delta
            attempt.save()

        return Response({"status": "Answer auto-saved"})

    @action(detail=True, methods=['post'], url_path='submit')
    def submit_test(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status == 'completed':
            return Response(AptitudeTestAttemptSerializer(attempt).data)

        with transaction.atomic():
            responses = attempt.responses.all()
            
            score = 0.0
            attempted = 0
            correct = 0
            wrong = 0
            skipped = 0
            
            for resp in responses:
                q = resp.question
                # Verify correctness
                is_correct = False
                
                # Format answers cleanly
                user_ans = [str(ans).strip().upper() for ans in resp.selected_options if str(ans).strip()]
                correct_ans = [str(ans).strip().upper() for ans in q.correct_answer if str(ans).strip()]
                
                # Check based on type
                if not resp.selected_options:
                    skipped += 1
                else:
                    attempted += 1
                    if q.question_type == 'numerical':
                        # Check proximity or text matches
                        u_val = user_ans[0] if user_ans else ""
                        c_val = correct_ans[0] if correct_ans else ""
                        try:
                            is_correct = float(u_val) == float(c_val)
                        except ValueError:
                            is_correct = u_val == c_val
                    elif q.question_type == 'match_following':
                        # Stores matches mapping. Standard dict comparisons.
                        is_correct = resp.selected_options == q.correct_answer
                    else:
                        # Sets comparisons
                        is_correct = set(user_ans) == set(correct_ans)
                
                resp.is_correct = is_correct
                resp.save()
                
                if not resp.selected_options:
                    pass # Skipped
                elif is_correct:
                    correct += 1
                    score += q.marks
                else:
                    wrong += 1
                    if attempt.test.negative_marking:
                        score -= q.negative_marks

            attempt.status = 'completed'
            attempt.completed_at = timezone.now()
            attempt.score = max(0.0, score)
            attempt.attempted_questions = attempted
            attempt.correct_questions = correct
            attempt.wrong_questions = wrong
            attempt.skipped_questions = skipped
            attempt.accuracy = (correct / attempted * 100) if attempted > 0 else 0.0
            
            # Rank & Percentile calculations
            other_attempts = AptitudeTestAttempt.objects.filter(test=attempt.test, status='completed')
            total_completed = other_attempts.count() + 1
            
            better_scores = other_attempts.filter(score__gt=attempt.score).count()
            attempt.rank = better_scores + 1
            
            worse_scores = other_attempts.filter(score__lt=attempt.score).count()
            attempt.percentile = (worse_scores / total_completed * 100) if total_completed > 0 else 100.0
            attempt.save()

            # --- Gamification Profile updates ---
            if attempt.user and attempt.user.username != 'guest_student':
                g_profile, _ = GamificationProfile.objects.get_or_create(user=attempt.user)
                
                # 1. Award XP: Correct question marks * 10 + 20 flat for completing a test
                xp_reward = int(attempt.score * 10) + 20
                g_profile.xp += xp_reward
                
                # 2. Award Coins: Correct answers * 5
                coin_reward = correct * 5
                g_profile.coins += coin_reward
                
                # 3. Daily streak calculations
                today = timezone.now().date()
                if g_profile.last_active_date:
                    delta = (today - g_profile.last_active_date).days
                    if delta == 1:
                        g_profile.daily_streak += 1
                        if g_profile.daily_streak % 7 == 0:
                            g_profile.weekly_streak += 1
                    elif delta > 1:
                        g_profile.daily_streak = 1
                else:
                    g_profile.daily_streak = 1
                
                g_profile.last_active_date = today
                
                # 4. Levels calculation (Every 200 XP = 1 Level)
                new_level = (g_profile.xp // 200) + 1
                g_profile.level = new_level
                g_profile.save()

                # 5. Badges unlocks
                if attempt.accuracy == 100.0 and attempt.total_questions >= 5:
                    GamificationBadge.objects.get_or_create(
                        user=attempt.user,
                        badge_name="Centurion",
                        defaults={"badge_type": "accuracy", "icon_name": "Target"}
                    )
                if attempt.time_spent < (attempt.test.overall_duration * 15) and attempt.accuracy >= 80: # Finished in 25% of time with good accuracy
                    GamificationBadge.objects.get_or_create(
                        user=attempt.user,
                        badge_name="Speedster",
                        defaults={"badge_type": "speed", "icon_name": "Zap"}
                    )
                completed_count = AptitudeTestAttempt.objects.filter(user=attempt.user, status='completed').count()
                if completed_count >= 10:
                    GamificationBadge.objects.get_or_create(
                        user=attempt.user,
                        badge_name="Aptitude Veteran",
                        defaults={"badge_type": "experience", "icon_name": "Shield"}
                    )

        return Response(AptitudeTestAttemptSerializer(attempt).data)

    @action(detail=True, methods=['get'], url_path='results')
    def results_analysis(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status != 'completed':
            return Response({"error": "Test not submitted yet"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Overall stats
        attempt_serializer = AptitudeTestAttemptSerializer(attempt)

        # 2. Section-wise Performance
        test_sections = attempt.test.sections.all()
        section_perf = []
        for sec in test_sections:
            sec_qids = AptitudeTestQuestion.objects.filter(section=sec).values_list('question_id', flat=True)
            sec_res = attempt.responses.filter(question_id__in=sec_qids)
            sec_total = sec_res.count()
            sec_correct = sec_res.filter(is_correct=True).count()
            sec_wrong = sec_res.filter(is_correct=False).exclude(selected_options=[]).count()
            sec_skipped = sec_res.filter(selected_options=[]).count()
            sec_time = sec_res.aggregate(sum_time=Sum('time_spent'))['sum_time'] or 0

            section_perf.append({
                "section_id": sec.id,
                "section_name": sec.name,
                "total": sec_total,
                "correct": sec_correct,
                "wrong": sec_wrong,
                "skipped": sec_skipped,
                "time_spent": sec_time,
                "accuracy": (sec_correct / (sec_total - sec_skipped) * 100) if (sec_total - sec_skipped) > 0 else 0.0
            })

        # 3. Topic-wise Performance
        topic_perf = {}
        difficulty_perf = {"easy": {"correct": 0, "total": 0}, "medium": {"correct": 0, "total": 0}, "hard": {"correct": 0, "total": 0}}
        
        responses = attempt.responses.all().select_related('question__topic')
        for r in responses:
            q = r.question
            topic = q.topic
            if topic.id not in topic_perf:
                topic_perf[topic.id] = {"name": topic.name, "correct": 0, "total": 0}
            topic_perf[topic.id]["total"] += 1
            if r.is_correct:
                topic_perf[topic.id]["correct"] += 1
                
            diff = q.difficulty
            if diff in difficulty_perf:
                difficulty_perf[diff]["total"] += 1
                if r.is_correct:
                    difficulty_perf[diff]["correct"] += 1

        topic_perf_list = [
            {
                "topic_id": tid,
                "topic_name": data["name"],
                "total": data["total"],
                "correct": data["correct"],
                "accuracy": (data["correct"] / data["total"] * 100) if data["total"] > 0 else 0.0
            } for tid, data in topic_perf.items()
        ]

        # 4. Strength/Weakness Categories
        weak_areas = [t["topic_name"] for t in topic_perf_list if t["accuracy"] < 50.0]
        strong_areas = [t["topic_name"] for t in topic_perf_list if t["accuracy"] >= 75.0]

        # 5. Question Review List (Student is allowed to review full answers, solutions, and explanations now)
        review_questions = []
        for r in responses:
            q = r.question
            q_data = AptitudeQuestionSerializer(q).data
            # Inject response details
            q_data["selected_options"] = r.selected_options
            q_data["is_correct"] = r.is_correct
            q_data["time_spent"] = r.time_spent
            q_data["is_marked_for_review"] = r.is_marked_for_review
            review_questions.append(q_data)

        return Response({
            "attempt": attempt_serializer.data,
            "sections_performance": section_perf,
            "topics_performance": topic_perf_list,
            "difficulty_performance": difficulty_perf,
            "weak_areas": weak_areas,
            "strong_areas": strong_areas,
            "review_questions": review_questions
        })

class AptitudeBookmarkViewSet(viewsets.ModelViewSet):
    queryset = AptitudeBookmark.objects.all()
    serializer_class = AptitudeBookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AptitudeBookmark.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class GamificationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        period = request.query_params.get('period', 'overall') # overall, weekly, monthly
        
        # To simplify: rank users by XP
        profiles = GamificationProfile.objects.all().order_by('-xp')[:20]
        rankings = []
        for idx, p in enumerate(profiles, start=1):
            rankings.append({
                "rank": idx,
                "username": p.user.username,
                "level": p.level,
                "xp": p.xp,
                "badges_count": p.user.badges.count()
            })
        return Response(rankings)

    @action(detail=False, methods=['get'], url_path='wrong-questions')
    def wrong_questions(self, request):
        user = request.user if request.user and request.user.is_authenticated else None
        if not user:
            return Response([])
        # Retrieve distinct questions that the user answered incorrectly in their attempts
        incorrect_responses = AptitudeQuestionResponse.objects.filter(
            attempt__user=user,
            attempt__status='completed',
            is_correct=False
        ).select_related('question__topic').order_by('-id')

        # De-duplicate questions in memory or via QuerySet distinct
        q_ids = set()
        questions_list = []
        for r in incorrect_responses:
            if r.question_id not in q_ids:
                q_ids.add(r.question_id)
                questions_list.append(r.question)
                
        # Limit to 30 questions
        questions_list = questions_list[:30]
        
        return Response(StudentAptitudeQuestionSerializer(questions_list, many=True, context={'request': request}).data)

    @action(detail=False, methods=['get'], url_path='ai-recommend')
    def ai_recommend(self, request):
        user = request.user if request.user and request.user.is_authenticated else None
        
        if user:
            # 1. Fetch weak areas (topics with < 50% accuracy)
            responses = AptitudeQuestionResponse.objects.filter(attempt__user=user, attempt__status='completed')
            topic_stats = {}
            for r in responses:
                topic_id = r.question.topic_id
                if topic_id not in topic_stats:
                    topic_stats[topic_id] = {"correct": 0, "total": 0}
                topic_stats[topic_id]["total"] += 1
                if r.is_correct:
                    topic_stats[topic_id]["correct"] += 1

            weak_topic_ids = []
            for tid, stats in topic_stats.items():
                acc = (stats["correct"] / stats["total"]) * 100
                if acc < 50.0:
                    weak_topic_ids.append(tid)

            # 2. Query questions under those weak topic IDs that the user hasn't solved correctly yet
            correct_qids = responses.filter(is_correct=True).values_list('question_id', flat=True)
            
            qs = AptitudeQuestion.objects.filter(parent=None, status='active', visibility='public')
            if weak_topic_ids:
                qs = qs.filter(topic_id__in=weak_topic_ids)
                
            # Exclude solved ones
            qs = qs.exclude(id__in=correct_qids).order_by('?')[:10] # Return 10 random recommended questions
            
            if not qs.exists():
                # Fallback to general unsolved active questions
                qs = AptitudeQuestion.objects.filter(parent=None, status='active', visibility='public').exclude(id__in=correct_qids).order_by('?')[:10]
        else:
            qs = AptitudeQuestion.objects.filter(parent=None, status='active', visibility='public').order_by('?')[:10]

        return Response(StudentAptitudeQuestionSerializer(qs, many=True, context={'request': request}).data)


class AptitudeTopicViewSet(viewsets.ModelViewSet):
    queryset = AptitudeTopic.objects.all()
    serializer_class = AptitudeTopicSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder(self, request):
        orders = request.data.get('orders', [])
        with transaction.atomic():
            for item in orders:
                AptitudeTopic.objects.filter(pk=item["id"]).update(order=item["order"])
        return Response({"status": "topics reordered"})


class AptitudeSubTopicViewSet(viewsets.ModelViewSet):
    queryset = AptitudeSubTopic.objects.all()
    serializer_class = AptitudeSubTopicSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder(self, request):
        orders = request.data.get('orders', [])
        with transaction.atomic():
            for item in orders:
                AptitudeSubTopic.objects.filter(pk=item["id"]).update(order=item["order"])
        return Response({"status": "subtopics reordered"})

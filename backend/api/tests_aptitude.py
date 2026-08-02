from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from api.models import (
    Profile, AptitudeCategory, AptitudeTopic, AptitudeSubTopic, AptitudeQuestion,
    AptitudeTest, AptitudeTestQuestion, AptitudeTestAttempt, AptitudeQuestionResponse,
    GamificationProfile, GamificationBadge, AptitudeBookmark
)

class AptitudeAssessmentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create users
        self.admin_user = User.objects.create_superuser(username='admin_test', password='password123', email='admin@test.com')
        Profile.objects.create(user=self.admin_user, role='admin')
        
        self.student_user = User.objects.create_user(username='student_test', password='password123', email='student@test.com')
        Profile.objects.create(user=self.student_user, role='student')
        
        # Create Aptitude Category and Topic
        self.category = AptitudeCategory.objects.create(name='Quantitative Aptitude')
        self.topic = AptitudeTopic.objects.create(category=self.category, name='Percentages', order=1)
        self.sub_topic = AptitudeSubTopic.objects.create(topic=self.topic, name='Basic percentage conversion')

        # Create Questions
        self.q1 = AptitudeQuestion.objects.create(
            topic=self.topic,
            sub_topic=self.sub_topic,
            title='20 percent of 150',
            statement='What is 20 percent of 150?',
            difficulty='easy',
            question_type='single_mcq',
            options=[
                {"key": "A", "text": "20"},
                {"key": "B", "text": "30"},
                {"key": "C", "text": "40"},
                {"key": "D", "text": "50"}
            ],
            correct_answer=["B"],
            marks=2.0,
            negative_marks=0.5,
            time_limit=60
        )

        self.q2 = AptitudeQuestion.objects.create(
            topic=self.topic,
            sub_topic=self.sub_topic,
            title='True or False question',
            statement='A percentage can be greater than 100.',
            difficulty='easy',
            question_type='true_false',
            options=[],
            correct_answer=["True"],
            marks=1.0,
            negative_marks=0.0,
            time_limit=60
        )

        # Create Mock Test
        self.test = AptitudeTest.objects.create(
            title='Placement Mock Test 1',
            description='Standard test paper.',
            test_type='mock',
            overall_duration=30,
            negative_marking=True,
            pass_percentage=50.0
        )
        AptitudeTestQuestion.objects.create(test=self.test, question=self.q1, order=1)
        AptitudeTestQuestion.objects.create(test=self.test, question=self.q2, order=2)

    def test_student_retrieves_questions_hides_answers(self):
        """
        Tests that students can list questions but are NOT exposed to correct answers or explanations.
        """
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get(f'/api/aptitude/questions/{self.q1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn('correct_answer', response.data)
        self.assertNotIn('explanation', response.data)
        self.assertNotIn('shortcut_trick', response.data)

    def test_admin_retrieves_questions_exposes_answers(self):
        """
        Tests that admins can list questions and ARE exposed to correct answers and explanations.
        """
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(f'/api/aptitude/questions/{self.q1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('correct_answer', response.data)
        self.assertIn('explanation', response.data)
        self.assertEqual(response.data['correct_answer'], ["B"])

    def test_complete_test_lifecycle_and_gamification(self):
        """
        Tests starting a test, saving responses, submitting, calculating scores, percentiles,
        and awarding XP and level ups.
        """
        self.client.force_authenticate(user=self.student_user)
        
        # 1. Start test
        start_res = self.client.post('/api/aptitude/attempts/start/', {'test_id': self.test.id})
        self.assertEqual(start_res.status_code, status.HTTP_201_CREATED)
        attempt_id = start_res.data['attempt']['id']
        
        # 2. Save correct answer for Q1
        save_res = self.client.post(f'/api/aptitude/attempts/{attempt_id}/save-answer/', {
            'question_id': self.q1.id,
            'selected_options': ["B"],
            'is_answered': True,
            'time_spent': 15,
            'current_question_index': 1
        })
        self.assertEqual(save_res.status_code, status.HTTP_200_OK)
        
        # 3. Save incorrect answer for Q2
        self.client.post(f'/api/aptitude/attempts/{attempt_id}/save-answer/', {
            'question_id': self.q2.id,
            'selected_options': ["False"],
            'is_answered': True,
            'time_spent': 10,
            'current_question_index': 1
        })

        # 4. Submit test
        submit_res = self.client.post(f'/api/aptitude/attempts/{attempt_id}/submit/')
        self.assertEqual(submit_res.status_code, status.HTTP_200_OK)
        
        # Marks check: Correct Q1 (+2.0), Incorrect Q2 with neg marking (-0.0) -> Score: 2.0
        # Wait, negative marking is enabled for test. But q2's negative_marks is 0.0. So score is 2.0.
        self.assertEqual(submit_res.data['score'], 2.0)
        self.assertEqual(submit_res.data['status'], 'completed')
        self.assertEqual(submit_res.data['correct_questions'], 1)
        self.assertEqual(submit_res.data['wrong_questions'], 1)

        # 5. Check gamification updates
        profile = GamificationProfile.objects.get(user=self.student_user)
        # XP rewards: 2.0 score * 10 = 20 XP + 20 completion XP = 40 XP
        self.assertEqual(profile.xp, 40)
        # Coins rewards: 1 correct Q * 5 = 5 coins
        self.assertEqual(profile.coins, 5)
        # Daily streak incremented to 1
        self.assertEqual(profile.daily_streak, 1)

        # 6. Retrieve detailed results diagnostics
        results_res = self.client.get(f'/api/aptitude/attempts/{attempt_id}/results/')
        self.assertEqual(results_res.status_code, status.HTTP_200_OK)
        self.assertIn('sections_performance', results_res.data)
        self.assertIn('review_questions', results_res.data)
        self.assertEqual(len(results_res.data['review_questions']), 2)

    def test_dynamic_practice_generation(self):
        """
        Tests starting a dynamic practice set on-the-fly.
        """
        self.client.force_authenticate(user=self.student_user)
        response = self.client.post('/api/aptitude/attempts/start-practice/', {
            'mode': 'topic',
            'topic_id': self.topic.id,
            'difficulty': 'easy',
            'count': 5,
            'calculator_enabled': True
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('attempt', response.data)
        self.assertIn('questions', response.data)
        # We had 2 questions in setup matching easy topic. So it should return 2 questions.
        self.assertEqual(len(response.data['questions']), 2)

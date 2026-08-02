import json
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from api.models import (
    Profile, Topic, QuestionLevel, Question, TestCase as QTestCase, CodingTest,
    CodingTestQuestion, CodingTestAttempt, CodingQuestionResponse, Language
)

class CodingTestAssessmentTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create users
        self.student = User.objects.create_user(username='student_test', password='password123', email='student@test.com')
        Profile.objects.create(user=self.student, role='student')

        # Auth setup
        self.client.force_authenticate(user=self.student)

        # Create coding test prerequisites
        self.topic = Topic.objects.create(name='Logic Operations', order=1)
        self.level = QuestionLevel.objects.create(topic=self.topic, level='easy')

        self.lang = Language.objects.create(
            name='Python',
            slug='python',
            judge0_id=71,
            extension='.py'
        )

        # Create Question
        self.question = Question.objects.create(
            topic=self.topic,
            level=self.level,
            title='Add Two Numbers',
            statement='Write a program to add two space-separated numbers.',
            starter_code=json.dumps({"python": "print(sum(map(int, input().split())))"}),
            time_limit=2.0,
            memory_limit=256.0
        )
        self.tc = QTestCase.objects.create(
            question=self.question,
            input_data='5 10',
            expected_output='15',
            is_hidden=False
        )

        # Create CodingTest
        self.coding_test = CodingTest.objects.create(
            title='TCS Coding Mock 1',
            description='Test code execution functionality',
            test_type='mock',
            overall_duration=30,
            pass_percentage=50.0,
            calculator_enabled=False,
            is_published=True
        )
        self.ctq = CodingTestQuestion.objects.create(
            test=self.coding_test,
            question=self.question,
            points=10.0,
            order=1
        )

    def test_start_test(self):
        response = self.client.post('/api/coding/attempts/start/', {'test': self.coding_test.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'in_progress')
        
        attempt_id = response.data['id']
        # Resuming test
        response_resume = self.client.post('/api/coding/attempts/start/', {'test': self.coding_test.id})
        self.assertEqual(response_resume.status_code, status.HTTP_200_OK)
        self.assertEqual(response_resume.data['id'], attempt_id)

    def test_save_response(self):
        start_res = self.client.post('/api/coding/attempts/start/', {'test': self.coding_test.id})
        attempt_id = start_res.data['id']

        save_res = self.client.post(f'/api/coding/attempts/{attempt_id}/save-response/', {
            'question': self.question.id,
            'code': 'print("hello")',
            'language_slug': 'python'
        })
        self.assertEqual(save_res.status_code, status.HTTP_200_OK)
        
        resp_obj = CodingQuestionResponse.objects.get(attempt_id=attempt_id, question=self.question)
        self.assertEqual(resp_obj.code, 'print("hello")')
        self.assertEqual(resp_obj.language_slug, 'python')

    def test_warnings_and_autosubmit(self):
        start_res = self.client.post('/api/coding/attempts/start/', {'test': self.coding_test.id})
        attempt_id = start_res.data['id']

        # Warning 1
        res = self.client.post(f'/api/coding/attempts/{attempt_id}/warning/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['warnings_count'], 1)

        # Warning 2
        res = self.client.post(f'/api/coding/attempts/{attempt_id}/warning/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['warnings_count'], 2)

        # Warning 3 -> should auto submit
        res = self.client.post(f'/api/coding/attempts/{attempt_id}/warning/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['status'], 'submitted')
        
        attempt_obj = CodingTestAttempt.objects.get(id=attempt_id)
        self.assertEqual(attempt_obj.status, 'completed')

    def test_submit_test(self):
        start_res = self.client.post('/api/coding/attempts/start/', {'test': self.coding_test.id})
        attempt_id = start_res.data['id']

        # Save correct code response
        self.client.post(f'/api/coding/attempts/{attempt_id}/save-response/', {
            'question': self.question.id,
            'code': 'import sys\nprint(sum(map(int, sys.stdin.read().split())))\n',
            'language_slug': 'python'
        })

        submit_res = self.client.post(f'/api/coding/attempts/{attempt_id}/submit/')
        self.assertEqual(submit_res.status_code, status.HTTP_200_OK)
        self.assertEqual(submit_res.data['status'], 'completed')
        self.assertEqual(submit_res.data['score'], 10.0) # Passed

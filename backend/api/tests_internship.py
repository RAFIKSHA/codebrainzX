from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from api.models import Question, AptitudeQuestion, Topic, QuestionLevel
from api.models_internship import (
    InternshipProgram, ScholarshipRule, InternshipAssessment,
    InternshipApplication, InternshipAttempt
)


class InternshipModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create scholarship rules
        self.r1 = ScholarshipRule.objects.create(
            title='Platinum',
            min_score=90.0,
            max_score=100.0,
            concession_percentage=75.0,
            is_active=True
        )
        self.r2 = ScholarshipRule.objects.create(
            title='Gold',
            min_score=80.0,
            max_score=89.9,
            concession_percentage=50.0,
            is_active=True
        )
        
        # Create program
        self.program = InternshipProgram.objects.create(
            title='Test Full Stack Internship',
            slug='test-full-stack',
            description='Test description',
            duration='8 Weeks',
            is_published=True
        )
        
        # Create assessment
        self.assessment = InternshipAssessment.objects.create(
            internship=self.program,
            title='Test Assessment',
            slug='test-assessment',
            duration_minutes=60,
            total_marks=100
        )

    def test_list_programs(self):
        response = self.client.get('/api/internships/programs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_apply_for_internship(self):
        payload = {
            'full_name': 'Dev Tester',
            'email': 'dev.tester@example.com',
            'phone': '1234567890',
            'city': 'Bangalore',
            'college': 'Test Institute',
            'course': 'Computer Science',
            'year_of_study': '3rd Year',
            'primary_skill': 'React & Python',
            'programming_experience': 'Intermediate',
            'agreement_accepted': True
        }
        response = self.client.post(f'/api/internships/programs/{self.program.slug}/apply/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('application', response.data)
        app_id = response.data['application']['application_id']
        self.assertTrue(app_id.startswith('CP-INT-2026-'))

    def test_start_assessment(self):
        app = InternshipApplication.objects.create(
            internship=self.program,
            full_name='Aarav Test',
            email='aarav.test@example.com',
            phone='9999999999',
            city='Bangalore',
            college='IIT',
            course='CSE',
            year_of_study='4th',
            primary_skill='Python',
            agreement_accepted=True
        )
        response = self.client.post('/api/internships/applications/start-assessment/', {'application_id': app.application_id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('mcq_questions', response.data)
        self.assertIn('coding_questions', response.data)

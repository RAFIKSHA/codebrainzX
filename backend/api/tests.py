from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from api.models import Profile, Topic, QuestionLevel, Question, TestCase as ModelTestCase, UserProgress

class CodeBrainzXTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create users
        self.admin_user = User.objects.create_superuser(username='admin_test', password='password123', email='admin@test.com')
        Profile.objects.create(user=self.admin_user, role='admin')
        
        self.student_user = User.objects.create_user(username='student_test', password='password123', email='student@test.com')
        Profile.objects.create(user=self.student_user, role='student')
        
        # Create a topic and levels
        self.topic = Topic.objects.create(name='Arrays Test', description='Testing arrays', order=1)
        self.basic_level = QuestionLevel.objects.create(topic=self.topic, level='basic')
        self.easy_level = QuestionLevel.objects.create(topic=self.topic, level='easy')
        
        # Create a basic question
        self.question = Question.objects.create(
            topic=self.topic,
            level=self.basic_level,
            title='Sum of Two',
            statement='Sum two numbers.',
            constraints='',
            starter_code='{}',
            time_limit=2.0,
            memory_limit=256.0,
            is_published=True,
            order=1
        )
        
        # Create testcase for basic question
        self.testcase = ModelTestCase.objects.create(
            question=self.question,
            input_data='1 2',
            expected_output='3',
            is_hidden=False
        )

    def test_jwt_login(self):
        """
        Tests that users can log in and retrieve access tokens.
        """
        response = self.client.post('/api/auth/login/', {
            'username': 'student_test',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['role'], 'student')

    def test_role_based_permissions(self):
        """
        Tests that students cannot access admin stats or test cases, but admins can.
        """
        # Student login
        response = self.client.post('/api/auth/login/', {
            'username': 'student_test',
            'password': 'password123'
        })
        access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # Attempt to access admin stats
        stats_response = self.client.get('/api/admin/stats/')
        self.assertEqual(stats_response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Attempt to access testcases CRUD
        tc_response = self.client.get('/api/testcases/')
        self.assertEqual(tc_response.status_code, status.HTTP_403_FORBIDDEN)

        # Admin login
        response_admin = self.client.post('/api/auth/login/', {
            'username': 'admin_test',
            'password': 'password123'
        })
        admin_token = response_admin.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        
        # Access admin stats
        stats_response = self.client.get('/api/admin/stats/')
        self.assertEqual(stats_response.status_code, status.HTTP_200_OK)
        
        # Access testcases CRUD
        tc_response = self.client.get('/api/testcases/')
        self.assertEqual(tc_response.status_code, status.HTTP_200_OK)

    @override_settings(UNLOCK_ALL_SECTIONS=False)
    def test_level_unlock_progression(self):
        """
        Tests that easy level is locked until the basic question is solved.
        """
        # Student login
        response = self.client.post('/api/auth/login/', {
            'username': 'student_test',
            'password': 'password123'
        })
        access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # Fetch topic levels progress
        topic_response = self.client.get(f'/api/topics/{self.topic.id}/')
        self.assertEqual(topic_response.status_code, status.HTTP_200_OK)
        
        levels = topic_response.data['levels']
        basic_lvl = next(l for l in levels if l['level'] == 'basic')
        easy_lvl = next(l for l in levels if l['level'] == 'easy')
        
        # Basic should be unlocked
        self.assertFalse(basic_lvl['is_locked'])
        # Easy should be locked since the student hasn't solved any basic questions
        self.assertTrue(easy_lvl['is_locked'])
        
        # Solve basic question
        UserProgress.objects.create(user=self.student_user, question=self.question, solved=True)
        
        # Fetch topic levels again
        topic_response_after = self.client.get(f'/api/topics/{self.topic.id}/')
        levels_after = topic_response_after.data['levels']
        easy_lvl_after = next(l for l in levels_after if l['level'] == 'easy')
        
        # Easy should now be unlocked!
        self.assertFalse(easy_lvl_after['is_locked'])

    def test_question_crud_and_nested_test_cases(self):
        """
        Tests that Admin can create and update questions with nested testcases, 
        and verifies the fields: editorial, hints, tags, companies.
        """
        # Admin login
        login_response = self.client.post('/api/auth/login/', {
            'username': 'admin_test',
            'password': 'password123'
        })
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        admin_token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')

        # 1. Create question with nested test cases
        payload = {
            'topic': self.topic.id,
            'level_name': 'easy',
            'title': 'New Question',
            'slug': 'new-question',
            'statement': 'Solve this new challenge.',
            'editorial': 'Editorial explanation here',
            'hints': '["Hint 1", "Hint 2"]',
            'tags': 'arrays,math',
            'companies': 'Google,Microsoft',
            'starter_code': '{"python": "def solve(): pass"}',
            'examples': '[]',
            'test_cases': [
                {'input_data': '4', 'expected_output': '8', 'is_hidden': False, 'weight': 1},
                {'input_data': '5', 'expected_output': '10', 'is_hidden': True, 'weight': 2}
            ]
        }
        
        response = self.client.post('/api/questions/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_q_id = response.data['id']
        
        # Verify the created fields
        question = Question.objects.get(id=new_q_id)
        self.assertEqual(question.editorial, 'Editorial explanation here')
        self.assertEqual(question.hints, '["Hint 1", "Hint 2"]')
        self.assertEqual(question.tags, 'arrays,math')
        self.assertEqual(question.companies, 'Google,Microsoft')
        self.assertEqual(question.test_cases.count(), 2)

        # 2. Update question: Edit one testcase, add another, delete one
        existing_tcs = list(question.test_cases.all())
        tc_to_keep_id = existing_tcs[0].id
        tc_to_delete_id = existing_tcs[1].id

        update_payload = {
            'topic': self.topic.id,
            'level_name': 'easy',
            'title': 'New Question - Edited',
            'slug': 'new-question',
            'statement': 'Solve this new challenge.',
            'editorial': 'Updated Editorial',
            'hints': '["Updated Hint 1"]',
            'tags': 'arrays',
            'companies': 'Google',
            'starter_code': '{"python": "def solve(): pass"}',
            'examples': '[]',
            'test_cases': [
                {'id': tc_to_keep_id, 'input_data': '4', 'expected_output': '12', 'is_hidden': False, 'weight': 1}, # Edited output
                {'input_data': '6', 'expected_output': '12', 'is_hidden': False, 'weight': 3} # Newly added
            ]
        }

        update_response = self.client.put(f'/api/questions/{new_q_id}/', update_payload, format='json')
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        # Verify database state after transaction atomic update
        question.refresh_from_db()
        self.assertEqual(question.title, 'New Question - Edited')
        self.assertEqual(question.editorial, 'Updated Editorial')
        self.assertEqual(question.hints, '["Updated Hint 1"]')
        self.assertEqual(question.tags, 'arrays')
        self.assertEqual(question.companies, 'Google')
        
        # Verify test cases updated (the old one deleted, one updated, one added)
        remaining_tc_ids = list(question.test_cases.values_list('id', flat=True))
        self.assertIn(tc_to_keep_id, remaining_tc_ids)
        self.assertNotIn(tc_to_delete_id, remaining_tc_ids)
        self.assertEqual(question.test_cases.count(), 2)

        updated_tc = question.test_cases.get(id=tc_to_keep_id)
        self.assertEqual(updated_tc.expected_output, '12')


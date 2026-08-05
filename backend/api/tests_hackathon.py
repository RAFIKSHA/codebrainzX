from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from api.models import Profile, Hackathon, Team, TeamMember, Application, Payment
from api.serializers_hackathon import TeamSerializer

class HackathonRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create users
        self.student_user = User.objects.create_user(username='student1', password='password123', email='student1@test.com')
        Profile.objects.create(user=self.student_user, role='student')
        
        self.student_user2 = User.objects.create_user(username='student2', password='password123', email='student2@test.com')
        Profile.objects.create(user=self.student_user2, role='student')

        # Create Hackathon (max 2 teams, max 3 members per team)
        self.hackathon = Hackathon.objects.create(
            title='Web 3.0 Hackathon',
            description='Innovate on blockchain',
            max_teams=2,
            max_team_members=3,
            registration_fee=0.00,
            start_date=timezone.now() + timedelta(days=5),
            end_date=timezone.now() + timedelta(days=6),
            registration_deadline=timezone.now() + timedelta(days=2),
            status='published'
        )

    def test_register_team_success(self):
        """Tests that a student can successfully register a team with valid structure."""
        self.client.force_authenticate(user=self.student_user)
        payload = {
            'hackathon': self.hackathon.id,
            'name': 'Alpha Coders',
            'college': 'Test Institute',
            'department': 'CS',
            'year': '3rd',
            'leader_name': 'Student Leader',
            'leader_email': 'leader@test.com',
            'leader_mobile': '9876543210',
            'leader_roll_number': 'CS001',
            'members': [
                {'name': 'Member One', 'email': 'member1@test.com', 'phone': '9876543211', 'college': 'Test Institute'},
                {'name': 'Member Two', 'email': 'member2@test.com', 'phone': '9876543212', 'college': 'Test Institute'}
            ]
        }
        response = self.client.post('/api/hackathon-teams/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Team.objects.count(), 1)
        self.assertEqual(TeamMember.objects.count(), 2)

    def test_register_team_exceed_size(self):
        """Tests that registering a team larger than max_team_members fails."""
        self.client.force_authenticate(user=self.student_user)
        payload = {
            'hackathon': self.hackathon.id,
            'name': 'Huge Team',
            'college': 'Test Institute',
            'department': 'CS',
            'year': '3rd',
            'leader_name': 'Student Leader',
            'leader_email': 'leader@test.com',
            'leader_mobile': '9876543210',
            'leader_roll_number': 'CS001',
            'members': [
                {'name': 'Member One', 'email': 'member1@test.com', 'phone': '9876543211', 'college': 'Test Institute'},
                {'name': 'Member Two', 'email': 'member2@test.com', 'phone': '9876543212', 'college': 'Test Institute'},
                {'name': 'Member Three', 'email': 'member3@test.com', 'phone': '9876543213', 'college': 'Test Institute'} # Total 4 including leader
            ]
        }
        response = self.client.post('/api/hackathon-teams/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('members', response.data)

    def test_register_team_duplicate_email_internal(self):
        """Tests duplicate emails within the same team payload fails validation."""
        self.client.force_authenticate(user=self.student_user)
        payload = {
            'hackathon': self.hackathon.id,
            'name': 'Duplicate Team',
            'college': 'Test Institute',
            'department': 'CS',
            'year': '3rd',
            'leader_name': 'Student Leader',
            'leader_email': 'leader@test.com',
            'leader_mobile': '9876543210',
            'leader_roll_number': 'CS001',
            'members': [
                {'name': 'Member One', 'email': 'leader@test.com', 'phone': '9876543211', 'college': 'Test Institute'} # Leader email duplicate
            ]
        }
        response = self.client.post('/api/hackathon-teams/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('members', response.data)

    def test_register_team_duplicate_across_teams(self):
        """Tests that registering an email already registered in another team fails."""
        # 1. Create first team
        team1 = Team.objects.create(
            hackathon=self.hackathon,
            name='First Team',
            college='Test Institute',
            department='CS',
            year='4th',
            leader_name='Leader One',
            leader_email='leader1@test.com',
            leader_mobile='9900990099',
            leader_roll_number='CS002'
        )
        TeamMember.objects.create(team=team1, name='M1', email='m1@test.com', phone='9900112233')

        # 2. Try to register second team with leader1's email as member
        self.client.force_authenticate(user=self.student_user2)
        payload = {
            'hackathon': self.hackathon.id,
            'name': 'Second Team',
            'college': 'Test Institute',
            'department': 'CS',
            'year': '3rd',
            'leader_name': 'Leader Two',
            'leader_email': 'leader2@test.com',
            'leader_mobile': '9876543210',
            'leader_roll_number': 'CS003',
            'members': [
                {'name': 'Duplicate Member', 'email': 'leader1@test.com', 'phone': '9876543211', 'college': 'Test Institute'}
            ]
        }
        response = self.client.post('/api/hackathon-teams/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

    def test_update_team_exclude_self(self):
        """Tests that updating a team does not throw validation errors for its own emails."""
        # Create team with leader email matching the authenticated student user
        team = Team.objects.create(
            hackathon=self.hackathon,
            name='Beta Coders',
            college='Test Institute',
            department='CS',
            year='2nd',
            leader_name='Beta Leader',
            leader_email=self.student_user.email,
            leader_mobile='9090909090',
            leader_roll_number='CS009'
        )
        m = TeamMember.objects.create(team=team, name='Beta M1', email='betam1@test.com', phone='9090909091')

        self.client.force_authenticate(user=self.student_user)
        # Update team name and keep same emails
        payload = {
            'name': 'Beta Coders Reborn',
            'leader_email': self.student_user.email,
            'leader_mobile': '9090909090',
            'members': [
                {'name': 'Beta M1', 'email': 'betam1@test.com', 'phone': '9090909091', 'college': 'Test Institute'}
            ]
        }
        response = self.client.patch(f'/api/hackathon-teams/{team.id}/', payload, format='json')
        if response.status_code != 200:
            print("UPDATE_TEAM_EXCLUDE_SELF ERROR:", response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        team.refresh_from_db()
        self.assertEqual(team.name, 'Beta Coders Reborn')

    def test_update_team_nested_members(self):
        """Tests updating team details and replacing nested members list successfully."""
        team = Team.objects.create(
            hackathon=self.hackathon,
            name='Beta Coders',
            college='Test Institute',
            department='CS',
            year='2nd',
            leader_name='Beta Leader',
            leader_email=self.student_user.email,
            leader_mobile='9090909090',
            leader_roll_number='CS009'
        )
        TeamMember.objects.create(team=team, name='Old Member', email='old@test.com', phone='9090909091')

        self.client.force_authenticate(user=self.student_user)
        payload = {
            'name': 'Beta Coders',
            'leader_email': self.student_user.email,
            'leader_mobile': '9090909090',
            'members': [
                {'name': 'New Member One', 'email': 'new1@test.com', 'phone': '9998887771', 'college': 'Test Institute'},
                {'name': 'New Member Two', 'email': 'new2@test.com', 'phone': '9998887772', 'college': 'Test Institute'}
            ]
        }
        response = self.client.patch(f'/api/hackathon-teams/{team.id}/', payload, format='json')
        if response.status_code != 200:
            print("UPDATE_TEAM_NESTED_MEMBERS ERROR:", response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(team.members.count(), 2)
        self.assertTrue(team.members.filter(email='new1@test.com').exists())
        self.assertFalse(team.members.filter(email='old@test.com').exists())

    def test_register_exceed_max_teams(self):
        """Tests that registering teams beyond the max_teams limit fails for new registrations but updates are allowed."""
        # Register Team 1
        Team.objects.create(hackathon=self.hackathon, name='T1', leader_email='t1@test.com', leader_mobile='9911991191')
        # Register Team 2 (limit reached)
        team2 = Team.objects.create(hackathon=self.hackathon, name='T2', leader_email=self.student_user.email, leader_mobile='9911991192')

        self.client.force_authenticate(user=self.student_user)
        # Try registering Team 3 (should fail)
        payload = {
            'hackathon': self.hackathon.id,
            'name': 'T3',
            'college': 'TI',
            'department': 'CS',
            'year': '1st',
            'leader_name': 'L3',
            'leader_email': 't3@test.com',
            'leader_mobile': '9911991193',
            'leader_roll_number': 'CS03'
        }
        response = self.client.post('/api/hackathon-teams/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

        # Updating Team 2 (already registered) should be allowed even if the hackathon is full
        update_payload = {
            'name': 'T2 Updated',
            'leader_email': self.student_user.email,
            'leader_mobile': '9911991192'
        }
        update_response = self.client.patch(f'/api/hackathon-teams/{team2.id}/', update_payload, format='json')
        if update_response.status_code != 200:
            print("REGISTER_EXCEED_MAX_TEAMS UPDATE ERROR:", update_response.data)
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        team2.refresh_from_db()
        self.assertEqual(team2.name, 'T2 Updated')

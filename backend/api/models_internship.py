from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.utils import timezone
import uuid
import random


class InternshipProgram(models.Model):
    STATUS_CHOICES = (
        ('open', 'Applications Open'),
        ('closing_soon', 'Closing Soon'),
        ('closed', 'Applications Closed'),
    )
    MODE_CHOICES = (
        ('online', 'Online'),
        ('hybrid', 'Hybrid'),
        ('offline', 'Offline'),
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    badge = models.CharField(max_length=100, default='CODEXPETRA INTERNSHIP 2026')
    subtitle = models.CharField(max_length=500, default='Learn → Build → Prove')
    description = models.TextField()
    duration = models.CharField(max_length=100, default='8 Weeks')
    mode = models.CharField(max_length=50, choices=MODE_CHOICES, default='online')
    program_type = models.CharField(max_length=100, default='Skill-Based Internship')
    stipend_info = models.CharField(max_length=100, default='Performance-Based')
    
    # Program specifications
    who_can_apply = models.JSONField(default=list, blank=True, help_text="List of eligible profiles: ['College students', 'Fresh graduates', ...]")
    skills_covered = models.JSONField(default=list, blank=True, help_text="List of skills/technologies: ['React', 'Python', 'System Design']")
    highlights = models.JSONField(default=list, blank=True, help_text="List of 4-6 highlight objects: [{'number': '01', 'title': '...', 'description': '...'}]")
    
    certificate_info = models.CharField(max_length=255, default='Program Completion Based')
    mentorship_info = models.CharField(max_length=255, default='Available with Senior Engineers')
    interview_info = models.CharField(max_length=255, default='Shortlisted Candidates')
    
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    application_deadline = models.DateField(null=True, blank=True)
    
    is_published = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    display_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', '-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or 'internship'
            slug = base_slug
            counter = 1
            while InternshipProgram.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.duration})"


class ScholarshipRule(models.Model):
    """
    Configurable scholarship/concession rule engine.
    Rules match assessment score percentages to determine concession tiers.
    """
    internship = models.ForeignKey(InternshipProgram, on_delete=models.CASCADE, null=True, blank=True, related_name='scholarship_rules', help_text="Null means applies globally across all programs")
    title = models.CharField(max_length=150, blank=True, default='')
    min_score = models.FloatField(help_text="Minimum score percentage (inclusive), e.g. 90.0")
    max_score = models.FloatField(help_text="Maximum score percentage (inclusive), e.g. 100.0")
    concession_percentage = models.FloatField(help_text="Concession percentage awarded, e.g. 75.0")
    description = models.CharField(max_length=255, blank=True, default='')
    badge_label = models.CharField(max_length=100, blank=True, default='Merit Scholarship')
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-min_score', 'order']

    def __str__(self):
        return f"{self.min_score:.0f}% - {self.max_score:.0f}% → {self.concession_percentage:.0f}% Concession"


class InternshipAssessment(models.Model):
    """
    Assessment linked to an internship program.
    Reuses existing Question Bank (AptitudeQuestion for MCQs and Question for Coding).
    """
    internship = models.OneToOneField(InternshipProgram, on_delete=models.CASCADE, related_name='assessment')
    title = models.CharField(max_length=255, default='CodexPetra Internship Assessment')
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True, default='Demonstrate your programming and aptitude fundamentals to qualify for internship and scholarship.')
    
    duration_minutes = models.IntegerField(default=60, help_text="Total assessment duration in minutes")
    total_marks = models.IntegerField(default=100)
    passing_percentage = models.FloatField(default=40.0)
    instructions = models.TextField(blank=True, default="""- Complete the assessment within the allotted time.
- Do not refresh or close the assessment window.
- Coding questions are evaluated against standard test cases.
- Submit only after reviewing all answers.
- Assessment performance may determine scholarship/concession eligibility.""")
    
    # References to existing question banks - NO duplication of question data
    mcq_questions = models.ManyToManyField('api.AptitudeQuestion', blank=True, related_name='internship_assessments')
    coding_questions = models.ManyToManyField('api.Question', blank=True, related_name='internship_assessments')
    
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or 'internship-assessment'
            slug = base_slug
            counter = 1
            while InternshipAssessment.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.internship.title})"


class InternshipApplication(models.Model):
    STATUS_CHOICES = (
        ('applied', 'Applied'),
        ('assessment_pending', 'Assessment Pending'),
        ('assessment_completed', 'Assessment Completed'),
        ('under_review', 'Under Review'),
        ('shortlisted', 'Shortlisted'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('selected', 'Selected'),
        ('not_selected', 'Not Selected'),
    )

    application_id = models.CharField(max_length=50, unique=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='internship_applications')
    internship = models.ForeignKey(InternshipProgram, on_delete=models.CASCADE, related_name='applications')
    
    # Personal Info
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    city = models.CharField(max_length=150)
    
    # Education
    college = models.CharField(max_length=255)
    course = models.CharField(max_length=150)
    year_of_study = models.CharField(max_length=50)
    
    # Technical Info
    primary_skill = models.CharField(max_length=150)
    programming_experience = models.CharField(max_length=100, blank=True, default='Intermediate')
    preferred_technology = models.CharField(max_length=150, blank=True, default='')
    
    # Links
    github_url = models.URLField(max_length=500, blank=True, null=True)
    linkedin_url = models.URLField(max_length=500, blank=True, null=True)
    portfolio_url = models.URLField(max_length=500, blank=True, null=True)
    
    agreement_accepted = models.BooleanField(default=True)
    
    # Recruitment Pipeline Status
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='applied')
    interview_date = models.DateTimeField(null=True, blank=True)
    interview_mode = models.CharField(max_length=50, default='Google Meet / Video Call', blank=True)
    interview_link = models.URLField(max_length=500, blank=True, null=True)
    interview_feedback = models.TextField(blank=True, default='')
    admin_notes = models.TextField(blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.application_id:
            # Generate CP-INT-2026-XXXX format
            random_digits = random.randint(1000, 9999)
            self.application_id = f"CP-INT-2026-{random_digits}"
            while InternshipApplication.objects.filter(application_id=self.application_id).exclude(pk=self.pk).exists():
                random_digits = random.randint(1000, 9999)
                self.application_id = f"CP-INT-2026-{random_digits}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.application_id} - {self.full_name} ({self.internship.title})"


class InternshipAttempt(models.Model):
    STATUS_CHOICES = (
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('evaluating', 'Evaluating'),
        ('completed', 'Completed'),
    )

    application = models.OneToOneField(InternshipApplication, on_delete=models.CASCADE, related_name='attempt')
    assessment = models.ForeignKey(InternshipAssessment, on_delete=models.CASCADE, related_name='attempts')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='internship_attempts')
    
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    
    # Score Metrics
    score_percentage = models.FloatField(default=0.0)
    total_score = models.FloatField(default=0.0)
    max_score = models.FloatField(default=100.0)
    mcq_score = models.FloatField(default=0.0)
    mcq_max_score = models.FloatField(default=40.0)
    coding_score = models.FloatField(default=0.0)
    coding_max_score = models.FloatField(default=60.0)
    
    total_questions = models.IntegerField(default=0)
    correct_questions = models.IntegerField(default=0)
    time_spent_seconds = models.IntegerField(default=0)
    warnings_count = models.IntegerField(default=0)
    
    # Concession Benefit Result
    concession_percentage = models.FloatField(default=0.0)
    concession_rule = models.ForeignKey(ScholarshipRule, on_delete=models.SET_NULL, null=True, blank=True)
    is_eligible_for_concession = models.BooleanField(default=False)
    concession_summary = models.CharField(max_length=255, blank=True, default='')
    
    # Topic-wise Breakdown Analytics
    topic_breakdown = models.JSONField(default=list, blank=True, help_text="[{'topic': 'Python Fundamentals', 'percentage': 90}, ...]")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Attempt {self.id} for {self.application.application_id} - Score: {self.score_percentage:.1f}% ({self.status})"


class InternshipQuestionResponse(models.Model):
    QUESTION_TYPES = (
        ('mcq', 'Multiple Choice Question'),
        ('coding', 'Coding Problem'),
    )

    attempt = models.ForeignKey(InternshipAttempt, on_delete=models.CASCADE, related_name='responses')
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPES, default='mcq')
    
    # Question references
    mcq_question = models.ForeignKey('api.AptitudeQuestion', on_delete=models.CASCADE, null=True, blank=True)
    coding_question = models.ForeignKey('api.Question', on_delete=models.CASCADE, null=True, blank=True)
    
    # Student Responses
    selected_options = models.JSONField(default=list, blank=True)
    code = models.TextField(blank=True, default='')
    language_slug = models.CharField(max_length=30, blank=True, default='python')
    
    # Status Flags
    is_answered = models.BooleanField(default=False)
    is_marked_for_review = models.BooleanField(default=False)
    is_correct = models.BooleanField(default=False)
    score_awarded = models.FloatField(default=0.0)
    max_score = models.FloatField(default=1.0)
    
    passed_test_cases = models.IntegerField(default=0)
    total_test_cases = models.IntegerField(default=0)
    test_case_results = models.JSONField(default=list, blank=True)
    execution_error = models.TextField(blank=True, null=True)
    
    time_spent_seconds = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        q_label = self.mcq_question.title if self.mcq_question else (self.coding_question.title if self.coding_question else 'Question')
        return f"Response for {q_label} ({self.attempt.application.application_id})"

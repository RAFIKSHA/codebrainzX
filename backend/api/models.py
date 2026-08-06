from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from .models_tutorials import (
    TutorialLanguage, TutorialChapter, TutorialLesson, TutorialLessonBlock,
    TutorialQuiz, TutorialQuizQuestion, TutorialPracticeQuestion,
    TutorialLessonResource, TutorialMedia, TutorialLessonAnalytics
)

class Profile(models.Model):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('admin', 'Admin'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    avatar_url = models.URLField(blank=True, null=True)
    
    # New production-ready auth fields
    full_name = models.CharField(max_length=255, blank=True, default='')
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    profile_photo = models.URLField(max_length=1024, blank=True, null=True)
    login_provider = models.CharField(max_length=20, default='email')  # 'email', 'google', 'otp'
    email_verified = models.BooleanField(default=False)
    login_failures = models.IntegerField(default=0)
    locked_until = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class EmailOTP(models.Model):
    PURPOSE_CHOICES = (
        ('login', 'Login/Signup'),
        ('forgot_password', 'Forgot Password'),
    )
    email = models.EmailField()
    otp_hash = models.CharField(max_length=128)
    attempts = models.IntegerField(default=0)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='login')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        verbose_name = "Email OTP"
        verbose_name_plural = "Email OTPs"

    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"OTP for {self.email} - Purpose: {self.purpose}"

class Section(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    icon = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=50, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Topic(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class QuestionLevel(models.Model):
    LEVEL_CHOICES = (
        ('basic', 'Basic'),
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    )
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='levels')
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('topic', 'level')
        ordering = ['topic', models.Case(
            models.When(level='basic', then=1),
            models.When(level='easy', then=2),
            models.When(level='medium', then=3),
            models.When(level='hard', then=4),
            default=5
        )]

    def __str__(self):
        return f"{self.topic.name} - {self.get_level_display()}"

class Question(models.Model):
    section = models.ForeignKey('Section', on_delete=models.SET_NULL, null=True, blank=True, related_name='questions')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='questions')
    level = models.ForeignKey(QuestionLevel, on_delete=models.CASCADE, related_name='questions')
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    statement = models.TextField()
    constraints = models.TextField(blank=True)
    input_format = models.TextField(blank=True, default='')
    output_format = models.TextField(blank=True, default='')
    notes = models.TextField(blank=True, default='')
    official_solution = models.TextField(blank=True, default='')
    examples = models.TextField(default='[]', help_text="JSON list of examples: [{'input': '...', 'output': '...', 'explanation': '...'}]")
    starter_code = models.TextField(help_text="JSON mapping language slugs to starter templates")
    time_limit = models.FloatField(default=2.0, help_text="In seconds")
    memory_limit = models.FloatField(default=256.0, help_text="In Megabytes")
    is_published = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    editorial = models.TextField(blank=True, default='')
    hints = models.TextField(default='[]', help_text="JSON list of hints: [{'hint': '...'}]")
    tags = models.CharField(max_length=500, blank=True, default='')
    companies = models.CharField(max_length=500, blank=True, default='')
    meta_title = models.CharField(max_length=255, blank=True, default='')
    meta_description = models.TextField(blank=True, default='')
    meta_keywords = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or 'question'
            slug = base_slug
            counter = 1
            while Question.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class TestCase(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='test_cases')
    input_data = models.TextField()
    expected_output = models.TextField()
    is_hidden = models.BooleanField(default=False)
    weight = models.IntegerField(default=1)

    def __str__(self):
        return f"TestCase for {self.question.title} (Hidden: {self.is_hidden}, Weight: {self.weight})"

class Language(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.CharField(max_length=20, unique=True, help_text="e.g. python, javascript, cpp, c, java")
    judge0_id = models.IntegerField(help_text="Judge0 Language ID")
    extension = models.CharField(max_length=10)

    def __str__(self):
        return self.name

class Submission(models.Model):
    STATUS_CHOICES = (
        ('Accepted', 'Accepted'),
        ('Wrong Answer', 'Wrong Answer'),
        ('Time Limit Exceeded', 'Time Limit Exceeded'),
        ('Memory Limit Exceeded', 'Memory Limit Exceeded'),
        ('Runtime Error', 'Runtime Error'),
        ('Compile Error', 'Compile Error'),
        ('Pending', 'Pending'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='submissions')
    language = models.ForeignKey(Language, on_delete=models.SET_NULL, null=True)
    code = models.TextField()
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='Pending')
    error_message = models.TextField(blank=True, null=True)
    execution_time = models.FloatField(blank=True, null=True, help_text="In seconds")
    memory_usage = models.FloatField(blank=True, null=True, help_text="In Kilobytes")
    passed_test_cases = models.IntegerField(default=0)
    total_test_cases = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Submission #{self.id} - {self.user.username} - {self.question.title} ({self.status})"

class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='user_progress')
    solved = models.BooleanField(default=False)
    completed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'question')

    def __str__(self):
        return f"{self.user.username} - {self.question.title} (Solved: {self.solved})"


class ContentItem(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='content_items')
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or 'item'
            slug = base_slug
            counter = 1
            while ContentItem.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.section.slug}] {self.title}"


class AptitudeCategory(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class AptitudeTopic(models.Model):
    category = models.ForeignKey(AptitudeCategory, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('category', 'name')
        ordering = ['order', 'created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category.name} - {self.name}"


class AptitudeSubTopic(models.Model):
    topic = models.ForeignKey(AptitudeTopic, on_delete=models.CASCADE, related_name='sub_topics')
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('topic', 'name')
        ordering = ['order', 'created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.topic.name} - {self.name}"


class AptitudeQuestion(models.Model):
    QUESTION_TYPES = (
        ('single_mcq', 'Single Correct MCQ'),
        ('multiple_mcq', 'Multiple Correct MCQ'),
        ('numerical', 'Numerical Answer'),
        ('true_false', 'True/False'),
        ('assertion_reason', 'Assertion & Reason'),
        ('match_following', 'Match the Following'),
        ('statement_based', 'Statement Based'),
        ('reading_comprehension', 'Reading Comprehension'),
        ('data_interpretation', 'Data Interpretation'),
        ('puzzle', 'Puzzle Based'),
        ('case_study', 'Case Study'),
    )
    DIFFICULTY_CHOICES = (
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    )
    topic = models.ForeignKey(AptitudeTopic, on_delete=models.CASCADE, related_name='questions')
    sub_topic = models.ForeignKey(AptitudeSubTopic, on_delete=models.SET_NULL, null=True, blank=True, related_name='questions')
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    statement = models.TextField()
    image_url = models.URLField(max_length=1024, blank=True, null=True)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    question_type = models.CharField(max_length=50, choices=QUESTION_TYPES, default='single_mcq')
    options = models.JSONField(default=list, blank=True, help_text="List of options. For matching: dict with {'left': [...], 'right': [...]}")
    correct_answer = models.JSONField(help_text="Correct answer mapping or array")
    explanation = models.TextField(blank=True, default='')
    shortcut_trick = models.TextField(blank=True, default='')
    hint = models.TextField(blank=True, default='')
    marks = models.FloatField(default=1.0)
    negative_marks = models.FloatField(default=0.0)
    time_limit = models.IntegerField(default=60, help_text="In seconds")
    company_tags = models.JSONField(default=list, blank=True)
    university_tags = models.JSONField(default=list, blank=True)
    source = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(max_length=20, default='active', choices=(('active', 'Active'), ('archived', 'Archived')))
    visibility = models.CharField(max_length=20, default='public', choices=(('public', 'Public'), ('private', 'Private')))
    version = models.IntegerField(default=1)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='sub_questions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or 'aptitude'
            slug = base_slug
            counter = 1
            while AptitudeQuestion.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class AptitudeQuestionVersion(models.Model):
    question = models.ForeignKey(AptitudeQuestion, on_delete=models.CASCADE, related_name='versions')
    version = models.IntegerField()
    statement = models.TextField()
    options = models.JSONField(default=list)
    correct_answer = models.JSONField()
    explanation = models.TextField(blank=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('question', 'version')


class AptitudeTest(models.Model):
    TEST_TYPES = (
        ('practice', 'Topic-wise Practice'),
        ('mock', 'Full-Length Mock Test'),
        ('company', 'Company-wise Test'),
        ('university', 'University Test'),
        ('daily_challenge', 'Daily Challenge'),
        ('weekly_challenge', 'Weekly Challenge'),
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    test_type = models.CharField(max_length=50, choices=TEST_TYPES, default='practice')
    overall_duration = models.IntegerField(default=60, help_text="Total duration in minutes")
    section_timer = models.BooleanField(default=False)
    pass_percentage = models.FloatField(default=40.0)
    negative_marking = models.BooleanField(default=False)
    calculator_enabled = models.BooleanField(default=True)
    company_tags = models.JSONField(default=list, blank=True)
    university_tags = models.JSONField(default=list, blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class AptitudeTestSection(models.Model):
    test = models.ForeignKey(AptitudeTest, on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=255)
    duration = models.IntegerField(default=20, help_text="In minutes")
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.test.title} - {self.name}"


class AptitudeTestQuestion(models.Model):
    test = models.ForeignKey(AptitudeTest, on_delete=models.CASCADE, related_name='test_questions')
    section = models.ForeignKey(AptitudeTestSection, on_delete=models.CASCADE, null=True, blank=True, related_name='section_questions')
    question = models.ForeignKey(AptitudeQuestion, on_delete=models.CASCADE)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']


class AptitudeTestAttempt(models.Model):
    STATUS_CHOICES = (
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='aptitude_attempts')
    test = models.ForeignKey(AptitudeTest, on_delete=models.CASCADE, related_name='attempts')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    score = models.FloatField(default=0.0)
    max_score = models.FloatField(default=0.0)
    accuracy = models.FloatField(default=0.0)
    rank = models.IntegerField(null=True, blank=True)
    percentile = models.FloatField(default=0.0)
    attempted_questions = models.IntegerField(default=0)
    correct_questions = models.IntegerField(default=0)
    wrong_questions = models.IntegerField(default=0)
    skipped_questions = models.IntegerField(default=0)
    time_spent = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    current_section = models.ForeignKey(AptitudeTestSection, on_delete=models.SET_NULL, null=True, blank=True)
    current_question_index = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.test.title} ({self.status})"


class AptitudeQuestionResponse(models.Model):
    attempt = models.ForeignKey(AptitudeTestAttempt, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(AptitudeQuestion, on_delete=models.CASCADE)
    selected_options = models.JSONField(default=list, blank=True)
    is_marked_for_review = models.BooleanField(default=False)
    is_answered = models.BooleanField(default=False)
    is_correct = models.BooleanField(default=False)
    time_spent = models.IntegerField(default=0)

    class Meta:
        unique_together = ('attempt', 'question')


class AptitudeBookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='aptitude_bookmarks')
    question = models.ForeignKey(AptitudeQuestion, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'question')


class AptitudeReportedQuestion(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.ForeignKey(AptitudeQuestion, on_delete=models.CASCADE)
    reason = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class GamificationProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='gamification_profile')
    xp = models.IntegerField(default=0)
    coins = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    daily_streak = models.IntegerField(default=0)
    weekly_streak = models.IntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - Lvl {self.level} ({self.xp} XP)"


class GamificationBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge_name = models.CharField(max_length=100)
    badge_type = models.CharField(max_length=50)
    icon_name = models.CharField(max_length=100, default='Award')
    unlocked_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.badge_name}"


class CodingTest(models.Model):
    TEST_TYPES = (
        ('mock', 'Full-Length Mock Test'),
        ('company', 'Company-wise Test'),
        ('practice', 'Topic-wise Practice'),
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    test_type = models.CharField(max_length=50, choices=TEST_TYPES, default='mock')
    overall_duration = models.IntegerField(default=60, help_text="Total duration in minutes")
    section_timer = models.BooleanField(default=False)
    pass_percentage = models.FloatField(default=40.0)
    calculator_enabled = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class CodingTestQuestion(models.Model):
    test = models.ForeignKey(CodingTest, on_delete=models.CASCADE, related_name='test_questions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    points = models.FloatField(default=10.0)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.test.title} - {self.question.title}"


class CodingTestAttempt(models.Model):
    STATUS_CHOICES = (
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coding_attempts')
    test = models.ForeignKey(CodingTest, on_delete=models.CASCADE, related_name='attempts')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    score = models.FloatField(default=0.0)
    max_score = models.FloatField(default=0.0)
    warnings_count = models.IntegerField(default=0)
    time_spent = models.IntegerField(default=0)
    current_question_index = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.test.title} ({self.status})"


class CodingQuestionResponse(models.Model):
    attempt = models.ForeignKey(CodingTestAttempt, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    code = models.TextField(blank=True, default='')
    language_slug = models.CharField(max_length=50, blank=True, default='')
    status = models.CharField(max_length=50, default='Unsubmitted')
    passed_test_cases = models.IntegerField(default=0)
    total_test_cases = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('attempt', 'question')

    def __str__(self):
        return f"{self.attempt.user.username} - {self.question.title} ({self.status})"


class Hackathon(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('closed', 'Closed'),
        ('completed', 'Completed'),
    )
    MODE_CHOICES = (
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('hybrid', 'Hybrid'),
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    banner_url = models.URLField(max_length=1024, blank=True, null=True)
    description = models.TextField()
    problem_statement = models.TextField(blank=True, default='')
    rules = models.TextField(blank=True, default='')
    theme = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, default='')
    difficulty = models.CharField(max_length=50, default='Medium')
    venue = models.CharField(max_length=255, blank=True, default='')
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='online')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    registration_deadline = models.DateTimeField()
    presentation_date = models.DateTimeField(null=True, blank=True)
    prize_pool = models.CharField(max_length=100)
    registration_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    max_teams = models.IntegerField(default=50)
    max_team_members = models.IntegerField(default=5)
    judging_criteria = models.TextField(blank=True, default='')
    sponsors = models.JSONField(default=list, blank=True, help_text="List of sponsor dicts: [{'name': '...', 'logo': '...'}]")
    faqs = models.JSONField(default=list, blank=True, help_text="List of FAQ dicts: [{'question': '...', 'answer': '...'}]")
    attachments = models.JSONField(default=list, blank=True, help_text="List of attachment files: [{'name': '...', 'url': '...'}]")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ProblemStatement(models.Model):
    DIFFICULTY_CHOICES = (
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    )
    hackathon = models.ForeignKey(Hackathon, on_delete=models.CASCADE, related_name='problem_statements')
    title = models.CharField(max_length=255)
    description = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    tech_stack = models.JSONField(default=list, blank=True, help_text="List of recommended tech stack tags, e.g. ['React', 'Node.js', 'Python']")
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.hackathon.title} — {self.title}"


class ProblemApplication(models.Model):
    hackathon = models.ForeignKey(Hackathon, on_delete=models.CASCADE, related_name='problem_applications')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='problem_applications')
    problem_statement = models.ForeignKey(ProblemStatement, on_delete=models.CASCADE, related_name='applications')
    selected_tech_stack = models.JSONField(default=list, blank=True, help_text="Tech stack tags the team intends to use")
    team_name = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('hackathon', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} → {self.problem_statement.title} ({self.hackathon.title})"


class Team(models.Model):
    hackathon = models.ForeignKey(Hackathon, on_delete=models.CASCADE, related_name='teams')
    name = models.CharField(max_length=255)
    college = models.CharField(max_length=255)
    department = models.CharField(max_length=255)
    year = models.CharField(max_length=10)
    leader_name = models.CharField(max_length=255)
    leader_email = models.EmailField()
    leader_mobile = models.CharField(max_length=20)
    leader_roll_number = models.CharField(max_length=50)
    github_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    resume_url = models.URLField(blank=True, null=True)
    registration_number = models.CharField(max_length=100, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.registration_number:
            import uuid
            self.registration_number = f"REG-{self.hackathon.id}-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} (Hackathon: {self.hackathon.title})"


class TeamMember(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    college = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - member of {self.team.name}"


class Application(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('waitlisted', 'Waitlisted'),
    )
    hackathon = models.ForeignKey(Hackathon, on_delete=models.CASCADE, related_name='applications')
    team = models.OneToOneField(Team, on_delete=models.CASCADE, related_name='application')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Application {self.id} - {self.team.name} - {self.status}"


class Payment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_id = models.CharField(max_length=100, unique=True)
    utr_number = models.CharField(max_length=12, unique=True, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    invoice_number = models.CharField(max_length=100, unique=True, blank=True)
    receipt_url = models.URLField(max_length=1024, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            import random
            self.invoice_number = f"INV-{random.randint(100000, 999999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Payment {self.payment_id} - Team {self.team.name} ({self.status})"


class Certificate(models.Model):
    TYPE_CHOICES = (
        ('participation', 'Participation Certificate'),
        ('winner', 'Winner Certificate'),
        ('runner_up', 'Runner-Up Certificate'),
    )
    hackathon = models.ForeignKey(Hackathon, on_delete=models.CASCADE, related_name='certificates')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='certificates', null=True, blank=True)
    recipient_name = models.CharField(max_length=255)
    recipient_email = models.EmailField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    certificate_id = models.CharField(max_length=100, unique=True, blank=True)
    file_url = models.URLField(max_length=1024, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.certificate_id:
            import uuid
            self.certificate_id = f"CERT-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.type} - {self.recipient_name}"


class EmailLog(models.Model):
    hackathon = models.ForeignKey(Hackathon, on_delete=models.CASCADE, related_name='email_logs')
    recipient_email = models.EmailField()
    subject = models.CharField(max_length=255)
    body = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='sent')

    def __str__(self):
        return f"Email to {self.recipient_email} - {self.subject}"


class HackathonNotification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hackathon_notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=50)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username} - {self.title}"


class HackathonSetting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.JSONField(default=dict)

    def __str__(self):
        return self.key

